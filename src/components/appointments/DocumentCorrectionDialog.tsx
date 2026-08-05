import { useEffect, useMemo, useState } from 'react';
import { Ban, FileMinus2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DocumentCorrectionOptions,
  useAppointmentBilling,
} from '../../hooks/useAppointmentBilling';
import { toast } from 'sonner';

interface DocumentCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string | number;
  appointmentLabel?: string;
  onSuccess?: () => void;
}

export function DocumentCorrectionDialog({
  open,
  onOpenChange,
  appointmentId,
  appointmentLabel,
  onSuccess,
}: DocumentCorrectionDialogProps) {
  const { loadCorrectionOptions, voidDocument, issueCreditNote } = useAppointmentBilling();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [opts, setOpts] = useState<DocumentCorrectionOptions | null>(null);
  const [tab, setTab] = useState<'void' | 'credit'>('credit');

  const [motivo, setMotivo] = useState('Anulación de comprobante');
  const [sendSunatVoid, setSendSunatVoid] = useState(false);

  const [ncMode, setNcMode] = useState<'total' | 'partial'>('total');
  const [ncMotivo, setNcMotivo] = useState('');
  const [sendSunatNc, setSendSunatNc] = useState(false);
  const [partialQty, setPartialQty] = useState('1');
  const [partialValor, setPartialValor] = useState('');
  const [partialDesc, setPartialDesc] = useState('');

  useEffect(() => {
    if (!open || !appointmentId) return;
    setLoading(true);
    loadCorrectionOptions(appointmentId)
      .then((data) => {
        setOpts(data);
        setTab(data.can_void ? 'void' : 'credit');
        setSendSunatVoid(Boolean(data.void_requires_comunicacion_baja));
        const sug = data.motivos_sugeridos?.total;
        if (sug) setNcMotivo(sug.des_motivo);
        const first = data.document?.detalles?.[0];
        if (first) {
          setPartialDesc(first.descripcion);
          setPartialValor(String(first.mto_valor_unitario ?? ''));
          setPartialQty(String(first.cantidad ?? 1));
        }
      })
      .catch((e: any) => toast.error(e.message || 'No se pudieron cargar opciones'))
      .finally(() => setLoading(false));
  }, [open, appointmentId, loadCorrectionOptions]);

  const doc = opts?.document;
  const remainingWindowLabel = useMemo(() => {
    if (!opts?.has_document || opts.days_since_emission == null) return null;
    const left = Math.max(0, (opts.void_window_days ?? 7) - opts.days_since_emission);
    return opts.within_void_window
      ? `${left} día(s) restantes para anulación total`
      : 'Fuera de ventana de anulación (use NC)';
  }, [opts]);

  const handleVoid = async () => {
    if (!opts?.can_void) return;
    setSubmitting(true);
    try {
      await voidDocument(appointmentId, {
        motivo,
        sendToSunat: sendSunatVoid,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || 'No se pudo anular');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreditNote = async () => {
    if (!opts?.can_credit_note) return;
    setSubmitting(true);
    try {
      const sug =
        ncMode === 'partial'
          ? opts.motivos_sugeridos?.partial
          : opts.motivos_sugeridos?.total;
      const payload: Parameters<typeof issueCreditNote>[1] = {
        mode: ncMode,
        cod_motivo: sug?.cod_motivo,
        des_motivo: ncMotivo || sug?.des_motivo,
        serie: opts.credit_note_series,
        send_to_sunat: sendSunatNc,
      };
      if (ncMode === 'partial') {
        const qty = parseFloat(partialQty);
        const valor = parseFloat(partialValor);
        if (!partialDesc.trim() || !(qty > 0) || !(valor > 0)) {
          toast.error('Complete descripción, cantidad y valor unitario para NC parcial');
          setSubmitting(false);
          return;
        }
        payload.detalles = [
          {
            codigo: 'NC-PARCIAL',
            descripcion: partialDesc.trim(),
            cantidad: qty,
            mto_valor_unitario: valor,
            unidad: 'NIU',
          },
        ];
      }
      await issueCreditNote(appointmentId, payload);
      onOpenChange(false);
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || 'No se pudo emitir NC');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileMinus2 className="w-5 h-5" />
            Anular / Nota de crédito
          </DialogTitle>
          <DialogDescription>
            {appointmentLabel || `Cita #${appointmentId}`}. La anulación y la NC{' '}
            <strong>no modifican el cobro</strong> de la cita.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 flex justify-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Cargando…
          </div>
        ) : !opts?.has_document ? (
          <p className="text-sm text-muted-foreground py-4">
            {opts?.message || 'Esta cita no tiene comprobante emitido.'}
          </p>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border text-sm space-y-1">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline">{doc?.tipo_nombre}</Badge>
                <span className="font-semibold">{doc?.numero_completo}</span>
                {doc?.estado_sunat && (
                  <Badge variant="secondary">{doc.estado_sunat}</Badge>
                )}
              </div>
              <p>
                Emisión: {doc?.fecha_emision} · Total S/{' '}
                {Number(doc?.total ?? 0).toFixed(2)}
              </p>
              <p className="text-muted-foreground">{remainingWindowLabel}</p>
              <p className="text-xs text-muted-foreground">
                Estado de cobro (sin cambios): {opts.payment_status || '—'}
              </p>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as 'void' | 'credit')}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="void" disabled={!opts.can_void}>
                  Anular (≤7d)
                </TabsTrigger>
                <TabsTrigger value="credit" disabled={!opts.can_credit_note}>
                  Nota de crédito
                </TabsTrigger>
              </TabsList>

              <TabsContent value="void" className="space-y-3 mt-3">
                {!opts.can_void ? (
                  <p className="text-sm text-amber-700">
                    Pasaron más de 7 días desde la emisión. Debe usar nota de crédito.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">
                      {opts.void_requires_comunicacion_baja
                        ? 'Comprobante ACEPTADO en SUNAT: se generará Comunicación de Baja (RA).'
                        : 'Comprobante no aceptado en SUNAT: anulación local (sin RA obligatoria).'}
                    </p>
                    <div>
                      <Label>Motivo</Label>
                      <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="send-void-sunat">Enviar baja a SUNAT</Label>
                      <Switch
                        id="send-void-sunat"
                        checked={sendSunatVoid}
                        onCheckedChange={setSendSunatVoid}
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="credit" className="space-y-3 mt-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={ncMode === 'total' ? 'default' : 'outline'}
                    onClick={() => {
                      setNcMode('total');
                      setNcMotivo(opts.motivos_sugeridos?.total.des_motivo || '');
                    }}
                  >
                    Total
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={ncMode === 'partial' ? 'default' : 'outline'}
                    onClick={() => {
                      setNcMode('partial');
                      setNcMotivo(opts.motivos_sugeridos?.partial.des_motivo || '');
                    }}
                  >
                    Parcial
                  </Button>
                </div>
                <div>
                  <Label>Motivo NC</Label>
                  <Input value={ncMotivo} onChange={(e) => setNcMotivo(e.target.value)} />
                </div>
                {ncMode === 'partial' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label>Descripción</Label>
                      <Input value={partialDesc} onChange={(e) => setPartialDesc(e.target.value)} />
                    </div>
                    <div>
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={partialQty}
                        onChange={(e) => setPartialQty(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Valor unit. (sin IGV)</Label>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={partialValor}
                        onChange={(e) => setPartialValor(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                {ncMode === 'total' && (
                  <ul className="text-xs border rounded-md divide-y max-h-28 overflow-y-auto">
                    {(doc?.detalles || []).map((d, i) => (
                      <li key={i} className="p-2 flex justify-between gap-2">
                        <span className="truncate">{d.descripcion}</span>
                        <span>
                          x{d.cantidad} · {Number(d.mto_valor_unitario).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between">
                  <Label htmlFor="send-nc-sunat">Enviar NC a SUNAT</Label>
                  <Switch
                    id="send-nc-sunat"
                    checked={sendSunatNc}
                    onCheckedChange={setSendSunatNc}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cerrar
          </Button>
          {opts?.has_document && tab === 'void' && opts.can_void && (
            <Button variant="destructive" onClick={handleVoid} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
              Anular comprobante
            </Button>
          )}
          {opts?.has_document && tab === 'credit' && opts.can_credit_note && (
            <Button onClick={handleCreditNote} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileMinus2 className="w-4 h-4 mr-2" />}
              Emitir NC {ncMode === 'partial' ? 'parcial' : 'total'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
