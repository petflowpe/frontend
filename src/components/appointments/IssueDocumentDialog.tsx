import { useEffect, useMemo, useState } from 'react';
import { FileMinus2, FileText, Loader2, Plus, Send, Trash2 } from 'lucide-react';
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
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useAppointmentBilling } from '../../hooks/useAppointmentBilling';
import { DocumentCorrectionDialog } from './DocumentCorrectionDialog';

interface IssueDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  appointmentLabel?: string;
  onSuccess?: () => void;
}

type CuotaRow = { monto: string; fecha_pago: string };

function addDaysIso(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function IssueDocumentDialog({
  open,
  onOpenChange,
  appointmentId,
  appointmentLabel,
  onSuccess,
}: IssueDocumentDialogProps) {
  const { preview, loading, issuing, loadPreview, issueDocument, clearPreview } =
    useAppointmentBilling();
  const [sendToSunat, setSendToSunat] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);

  const [formaPago, setFormaPago] = useState<'Contado' | 'Credito'>('Contado');
  const [creditDays, setCreditDays] = useState('30');
  const [advancedCuotas, setAdvancedCuotas] = useState(false);
  const [cuotas, setCuotas] = useState<CuotaRow[]>([
    { monto: '', fecha_pago: addDaysIso(new Date(), 30) },
  ]);

  useEffect(() => {
    if (open && appointmentId) {
      loadPreview(appointmentId);
      setCorrectionOpen(false);
      setSendToSunat(false);
      setAdvancedCuotas(false);
    } else {
      clearPreview();
      setCorrectionOpen(false);
    }
  }, [open, appointmentId, loadPreview, clearPreview]);

  useEffect(() => {
    if (!preview || preview.already_issued) return;
    const suggested =
      preview.suggested_forma_pago === 'Credito' || preview.suggested_forma_pago === 'credito'
        ? 'Credito'
        : 'Contado';
    // Crédito solo aplica a Factura; boleta queda Contado.
    if (preview.supports_credito === false || preview.tipo_documento === '03') {
      setFormaPago('Contado');
    } else {
      setFormaPago(suggested);
    }
    setCreditDays(String(preview.default_credit_days ?? 30));
    setCuotas([
      {
        monto: String(Number(preview.total || 0).toFixed(2)),
        fecha_pago: addDaysIso(new Date(), Number(preview.default_credit_days ?? 30)),
      },
    ]);
  }, [preview]);

  const canUseCredito = Boolean(preview?.supports_credito && preview?.tipo_documento === '01');

  const duePreview = useMemo(() => {
    if (formaPago !== 'Credito') return null;
    if (advancedCuotas && cuotas.length > 0) {
      const dates = cuotas.map((c) => c.fecha_pago).filter(Boolean).sort();
      return dates[dates.length - 1] || null;
    }
    const days = Math.max(1, parseInt(creditDays, 10) || 30);
    return addDaysIso(new Date(), days);
  }, [formaPago, advancedCuotas, cuotas, creditDays]);

  const handleIssue = async () => {
    const opts: {
      sendToSunat?: boolean;
      formaPagoTipo?: 'Contado' | 'Credito';
      creditDays?: number;
      formaPagoCuotas?: Array<{ moneda: string; monto: number; fecha_pago: string }>;
    } = {
      sendToSunat,
      formaPagoTipo: canUseCredito ? formaPago : 'Contado',
    };

    if (canUseCredito && formaPago === 'Credito') {
      if (advancedCuotas) {
        const parsed = cuotas
          .map((c) => ({
            moneda: 'PEN',
            monto: parseFloat(c.monto),
            fecha_pago: c.fecha_pago,
          }))
          .filter((c) => c.fecha_pago && c.monto > 0);
        if (parsed.length === 0) return;
        opts.formaPagoCuotas = parsed;
      } else {
        opts.creditDays = Math.max(1, Math.min(365, parseInt(creditDays, 10) || 30));
      }
    }

    await issueDocument(appointmentId, opts);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <>
      <Dialog open={open && !correctionOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Emitir comprobante
            </DialogTitle>
            <DialogDescription>
              {appointmentLabel || `Cita #${appointmentId}`} — se generará boleta o factura según el
              documento del cliente.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-8 flex justify-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Cargando…
            </div>
          ) : preview?.already_issued ? (
            <div className="py-4 text-center space-y-3">
              <Badge variant="outline" className="mb-2">
                Ya facturada
              </Badge>
              <p className="text-sm">{preview.numero_existente}</p>
              <p className="text-xs text-muted-foreground">
                Puede anular (≤7 días desde emisión) o emitir nota de crédito parcial/total. El cobro
                de la cita no se modifica.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setCorrectionOpen(true)}
              >
                <FileMinus2 className="w-4 h-4" />
                Anular / Nota de crédito
              </Button>
            </div>
          ) : preview ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                <div>
                  <span className="text-muted-foreground">Tipo</span>
                  <p className="font-semibold">{preview.tipo_nombre}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Serie</span>
                  <p className="font-semibold">{preview.serie}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Cliente</span>
                  <p className="font-medium">
                    {preview.client.razon_social} ({preview.client.numero_documento})
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cobro cita</span>
                  <p className="font-medium">{preview.payment_status || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total</span>
                  <p className="font-bold text-lg">S/ {preview.total.toFixed(2)}</p>
                </div>
              </div>

              <ul className="border rounded-lg divide-y max-h-32 overflow-y-auto">
                {preview.detalles.map((d, i) => (
                  <li key={i} className="p-2 flex justify-between gap-2">
                    <span className="truncate">{d.descripcion}</span>
                    <span className="shrink-0">x{d.cantidad}</span>
                  </li>
                ))}
              </ul>

              {canUseCredito ? (
                <div className="space-y-3 border rounded-lg p-3">
                  <div>
                    <Label>Forma de pago (Tesorería / SUNAT)</Label>
                    <Select
                      value={formaPago}
                      onValueChange={(v) => setFormaPago(v as 'Contado' | 'Credito')}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contado">Contado</SelectItem>
                        <SelectItem value="Credito">Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contado: se asume cobro inmediato en cartera. Crédito: crea CxC con vencimiento.
                    </p>
                  </div>

                  {formaPago === 'Credito' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="adv-cuotas">Cuotas avanzadas</Label>
                        <Switch
                          id="adv-cuotas"
                          checked={advancedCuotas}
                          onCheckedChange={setAdvancedCuotas}
                        />
                      </div>

                      {!advancedCuotas ? (
                        <div>
                          <Label>Días de crédito</Label>
                          <Select value={creditDays} onValueChange={setCreditDays}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">7 días</SelectItem>
                              <SelectItem value="15">15 días</SelectItem>
                              <SelectItem value="30">30 días</SelectItem>
                              <SelectItem value="45">45 días</SelectItem>
                              <SelectItem value="60">60 días</SelectItem>
                              <SelectItem value="90">90 días</SelectItem>
                            </SelectContent>
                          </Select>
                          {duePreview && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Vence: {duePreview}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Cuotas</Label>
                          {cuotas.map((c, idx) => (
                            <div key={idx} className="flex gap-2 items-end">
                              <div className="flex-1">
                                <span className="text-xs text-muted-foreground">Monto</span>
                                <Input
                                  type="number"
                                  min={0.01}
                                  step="0.01"
                                  value={c.monto}
                                  onChange={(e) => {
                                    const next = [...cuotas];
                                    next[idx] = { ...next[idx], monto: e.target.value };
                                    setCuotas(next);
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <span className="text-xs text-muted-foreground">Fecha</span>
                                <Input
                                  type="date"
                                  value={c.fecha_pago}
                                  onChange={(e) => {
                                    const next = [...cuotas];
                                    next[idx] = { ...next[idx], fecha_pago: e.target.value };
                                    setCuotas(next);
                                  }}
                                />
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                disabled={cuotas.length <= 1}
                                onClick={() => setCuotas(cuotas.filter((_, i) => i !== idx))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() =>
                              setCuotas([
                                ...cuotas,
                                {
                                  monto: '',
                                  fecha_pago: addDaysIso(new Date(), 30 * (cuotas.length + 1)),
                                },
                              ])
                            }
                          >
                            <Plus className="h-4 w-4" />
                            Agregar cuota
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Boleta: se emite al contado (crédito Contado/Credito SUNAT aplica a facturas).
                </p>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="send-sunat">Enviar a SUNAT al emitir</Label>
                <Switch id="send-sunat" checked={sendToSunat} onCheckedChange={setSendToSunat} />
              </div>
              {!sendToSunat && (
                <p className="text-xs text-muted-foreground">
                  Sin envío a SUNAT: el comprobante queda registrado localmente (ideal para pruebas en
                  beta).
                </p>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleIssue}
              disabled={loading || issuing || !preview || preview.already_issued}
            >
              {issuing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : sendToSunat ? (
                <Send className="w-4 h-4 mr-2" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              {sendToSunat ? 'Emitir y enviar SUNAT' : 'Emitir comprobante'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DocumentCorrectionDialog
        open={correctionOpen}
        onOpenChange={(v) => {
          setCorrectionOpen(v);
          if (!v) onOpenChange(false);
        }}
        appointmentId={appointmentId}
        appointmentLabel={appointmentLabel}
        onSuccess={onSuccess}
      />
    </>
  );
}
