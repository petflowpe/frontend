import { useCallback, useEffect, useState } from 'react';
import { Building2, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { apiClient } from '../../utils/api/client';
import { API } from '../../utils/api/endpoints';
import { ApiValidationError } from '../../utils/api/config';

export interface BranchApiRow {
  id: number;
  company_id: number;
  codigo: string;
  nombre: string;
  activo?: boolean;
}

interface EditableRow {
  id?: number;
  codigo?: string;
  nombre: string;
  activo: boolean;
  clientKey: string;
}

function nextCodigos(existing: Iterable<string>, count: number): string[] {
  const used = new Set(existing);
  const out: string[] = [];
  let n = 1;
  while (out.length < count) {
    const c = String(n).padStart(3, '0').slice(0, 10);
    if (!used.has(c)) {
      used.add(c);
      out.push(c);
    }
    n++;
  }
  return out;
}

const CREATE_DEFAULTS = {
  direccion: '-',
  ubigeo: '000000',
  distrito: '-',
  provincia: '-',
  departamento: '-',
} as const;

function formatSaveError(e: unknown): string {
  if (e instanceof ApiValidationError && e.errors) {
    const msgs = Object.values(e.errors).flat();
    if (msgs.length) return msgs.join(' ');
  }
  return e instanceof Error ? e.message : 'Error al guardar sedes';
}

export interface BranchesConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number | null | undefined;
}

export function BranchesConfigModal({ open, onOpenChange, companyId }: BranchesConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<EditableRow[]>([]);

  const loadBranches = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await apiClient.get<BranchApiRow[] | { data: BranchApiRow[] }>(API.branches.list, {
        company_id: String(companyId),
      });
      const list = Array.isArray(res) ? res : ((res as { data: BranchApiRow[] }).data ?? []);
      setRows(
        list.map((b) => ({
          id: b.id,
          codigo: b.codigo,
          nombre: b.nombre ?? '',
          activo: b.activo !== false,
          clientKey: `b-${b.id}`,
        })),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudieron cargar las sedes');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!open || !companyId) return;
    loadBranches();
  }, [open, companyId, loadBranches]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        nombre: '',
        activo: true,
        clientKey: `new-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`}`,
      },
    ]);
  };

  const updateRow = (key: string, patch: Partial<EditableRow>) => {
    setRows((prev) => prev.map((r) => (r.clientKey === key ? { ...r, ...patch } : r)));
  };

  const hasRowsToSave = rows.some((r) => r.id || String(r.nombre).trim());

  const handleSave = async () => {
    if (!companyId) {
      toast.error('No hay empresa asociada a la sesión.');
      return;
    }

    const emptyNames = rows.filter((r) => !String(r.nombre).trim() && r.id);
    if (emptyNames.length) {
      toast.error('Cada sede debe tener un nombre.');
      return;
    }
    if (!hasRowsToSave) {
      toast.error('Añada al menos una sede antes de guardar.');
      return;
    }

    const toCreate = rows.filter((r) => !r.id && String(r.nombre).trim());
    const toUpdate = rows.filter((r) => r.id);

    setSaving(true);
    try {
      const cid = Number(companyId);
      const codigosUsados = new Set(rows.filter((r) => r.codigo).map((r) => r.codigo as string));
      const nuevosCodigos = nextCodigos(codigosUsados, toCreate.length);

      for (let i = 0; i < toCreate.length; i++) {
        const r = toCreate[i];
        await apiClient.post(API.branches.list, {
          company_id: cid,
          codigo: nuevosCodigos[i],
          nombre: String(r.nombre).trim(),
          ...CREATE_DEFAULTS,
          activo: Boolean(r.activo),
        });
      }

      for (const r of toUpdate) {
        await apiClient.put(API.branches.byId(r.id!), {
          nombre: String(r.nombre).trim(),
          activo: Boolean(r.activo),
        });
      }

      toast.success('Sedes guardadas correctamente');
      await loadBranches();
      onOpenChange(false);
    } catch (e) {
      toast.error(formatSaveError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = (v: boolean) => {
    if (!v && !saving) {
      setRows([]);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] max-w-[min(560px,96vw)] flex-col gap-0 overflow-hidden border-border/80 bg-card p-0 text-foreground shadow-2xl sm:rounded-2xl">
        <div className="border-border/60 shrink-0 border-b px-6 pb-4 pt-6 pr-14">
          <div className="flex gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
              <Building2 className="size-6" aria-hidden />
            </div>
            <div className="min-w-0 space-y-2">
              <DialogTitle className="text-left text-xl font-bold tracking-tight text-foreground">
                Configuración de sedes
              </DialogTitle>
              <DialogDescription className="text-left text-sm leading-relaxed text-violet-300/80 dark:text-violet-200/70">
                Las sedes <strong className="font-semibold text-foreground/90">no se eliminan</strong>: puede deshabilitarlas
                para que no aparezcan en nuevas asignaciones. Los datos históricos y usuarios ya asignados conservan el
                nombre. Puede añadir sedes nuevas o renombrar las existentes.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <Label className="text-sm font-medium text-foreground">Lista de sedes</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full border-white/40 bg-transparent text-foreground hover:bg-white/10"
              onClick={addRow}
              disabled={loading || !companyId}
            >
              <Plus className="mr-1.5 size-4" />
              Añadir sede
            </Button>
          </div>

          {loading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">Cargando sedes…</p>
          ) : !companyId ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Su usuario no tiene empresa asociada; no puede gestionar sedes.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {rows.map((row) => (
                <li
                  key={row.clientKey}
                  className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/15 px-3 py-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <Input
                    className="h-11 flex-1 rounded-xl border-border/60 bg-background/80 text-foreground"
                    value={row.nombre}
                    onChange={(e) => updateRow(row.clientKey, { nombre: e.target.value })}
                    placeholder="Ej. Sede Norte"
                    aria-label="Nombre de sede"
                    disabled={saving}
                  />
                  <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={
                        row.activo
                          ? 'text-sm text-violet-300/90 dark:text-violet-200/75'
                          : 'text-sm text-muted-foreground'
                      }
                    >
                      {row.activo ? 'Habilitada' : 'Deshabilitada'}
                    </span>
                    <Switch
                      checked={row.activo}
                      onCheckedChange={(v) => updateRow(row.clientKey, { activo: v })}
                      disabled={saving}
                      className="h-6 w-11 data-[state=checked]:border-cyan-400/50 data-[state=checked]:bg-cyan-500 [&_[data-slot=switch-thumb]]:size-5 [&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-5"
                    />
                  </div>
                </li>
              ))}
              {rows.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">No hay sedes. Pulse «Añadir sede».</p>
              ) : null}
            </ul>
          )}
        </div>

        <div className="border-border/60 shrink-0 border-t bg-background/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-border bg-transparent"
              onClick={() => handleClose(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-cyan-500 font-semibold text-slate-950 hover:bg-cyan-400 dark:text-slate-950"
              onClick={handleSave}
              disabled={saving || loading || !companyId || !hasRowsToSave}
            >
              <Save className="mr-2 size-4" />
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
