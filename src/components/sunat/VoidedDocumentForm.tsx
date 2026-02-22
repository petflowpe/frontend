import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { apiClient } from '../../utils/api/client';

interface DocForVoiding {
  id: number | string;
  tipo_documento: string;
  serie: string;
  correlativo: string;
  numero_completo?: string;
  monto?: number;
  tipo_nombre?: string;
}

interface PreferredVoidDoc {
  tipo_documento: string;
  serie: string;
  correlativo: string;
  fecha_referencia?: string;
}

export function VoidedDocumentForm({ open, onOpenChange, onSuccess, companyId = 1, branchId = 1, preferredVoidDoc = null }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess?: () => void; companyId?: number; branchId?: number; preferredVoidDoc?: PreferredVoidDoc | null }) {
  const [fechaReferencia, setFechaReferencia] = useState(new Date().toISOString().split('T')[0]);
  const [motivoBaja, setMotivoBaja] = useState('');
  const [docs, setDocs] = useState<DocForVoiding[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadDocuments = async (fechaOverride?: string) => {
    const fecha = fechaOverride ?? fechaReferencia;
    setLoadingDocs(true);
    try {
      const res = await apiClient.get<any>('/voided-documents/available-documents', {
        company_id: companyId,
        branch_id: branchId,
        fecha_referencia: fecha,
      });
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setDocs(data);
      const next = new Set<string>();
      if (preferredVoidDoc && data.length > 0) {
        const pad = (s: string) => String(s).padStart(8, '0');
        const keyPref = `${preferredVoidDoc.tipo_documento}-${preferredVoidDoc.serie}-${preferredVoidDoc.correlativo}`;
        for (const d of data) {
          const k = `${d.tipo_documento}-${d.serie}-${d.correlativo}`;
          if (k === keyPref || k === `${preferredVoidDoc.tipo_documento}-${preferredVoidDoc.serie}-${pad(preferredVoidDoc.correlativo)}`) {
            next.add(k);
            break;
          }
        }
      }
      setSelected(next);
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar documentos');
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (open && preferredVoidDoc) {
      const fecha = preferredVoidDoc.fecha_referencia || new Date().toISOString().split('T')[0];
      setFechaReferencia(fecha);
      loadDocuments(fecha);
    }
  }, [open, preferredVoidDoc?.tipo_documento, preferredVoidDoc?.serie, preferredVoidDoc?.correlativo]);

  const toggleDoc = (doc: DocForVoiding) => {
    const key = `${doc.tipo_documento}-${doc.serie}-${doc.correlativo}`;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const submit = async () => {
    if (selected.size === 0) {
      toast.error('Seleccione al menos un documento');
      return;
    }
    if (!motivoBaja.trim()) {
      toast.error('Indique el motivo de baja');
      return;
    }
    setSubmitting(true);
    try {
      const detalles = docs
        .filter(d => selected.has(`${d.tipo_documento}-${d.serie}-${d.correlativo}`))
        .map(d => ({
          tipo_documento: d.tipo_documento,
          serie: d.serie,
          correlativo: d.correlativo,
          motivo_especifico: motivoBaja.slice(0, 250),
        }));
      await apiClient.post('/voided-documents', {
        company_id: companyId,
        branch_id: branchId,
        fecha_referencia: fechaReferencia,
        motivo_baja: motivoBaja,
        detalles,
      });
      toast.success('Comunicación de baja creada');
      onOpenChange(false);
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || 'Error al crear comunicación de baja');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Comunicación de Baja</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha de referencia</Label>
              <Input
                type="date"
                value={fechaReferencia}
                onChange={e => setFechaReferencia(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={loadDocuments} disabled={loadingDocs}>
                {loadingDocs ? 'Cargando...' : 'Cargar documentos'}
              </Button>
            </div>
          </div>
          <div>
            <Label>Motivo de baja (general)</Label>
            <Textarea
              value={motivoBaja}
              onChange={e => setMotivoBaja(e.target.value)}
              placeholder="Ej: Error en datos del cliente"
              rows={2}
            />
          </div>
          {docs.length > 0 && (
            <div className="border rounded-md overflow-auto max-h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map(doc => {
                    const key = `${doc.tipo_documento}-${doc.serie}-${doc.correlativo}`;
                    return (
                      <TableRow key={key}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(key)}
                            onCheckedChange={() => toggleDoc(doc)}
                          />
                        </TableCell>
                        <TableCell>{doc.tipo_nombre ?? doc.tipo_documento}</TableCell>
                        <TableCell>{doc.numero_completo ?? `${doc.serie}-${doc.correlativo}`}</TableCell>
                        <TableCell>{doc.monto != null ? `S/ ${Number(doc.monto).toFixed(2)}` : '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={submitting || selected.size === 0}>
            {submitting ? 'Guardando...' : 'Crear comunicación de baja'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
