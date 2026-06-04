import { useEffect } from 'react';
import { FileText, Loader2, Send } from 'lucide-react';
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
import { useAppointmentBilling } from '../../hooks/useAppointmentBilling';
import { useState } from 'react';

interface IssueDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  appointmentLabel?: string;
  onSuccess?: () => void;
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

  useEffect(() => {
    if (open && appointmentId) {
      loadPreview(appointmentId);
    } else {
      clearPreview();
    }
  }, [open, appointmentId, loadPreview, clearPreview]);

  const handleIssue = async () => {
    await issueDocument(appointmentId, { sendToSunat });
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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
          <div className="py-4 text-center">
            <Badge variant="outline" className="mb-2">
              Ya facturada
            </Badge>
            <p className="text-sm">{preview.numero_existente}</p>
          </div>
        ) : preview ? (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg">
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
  );
}
