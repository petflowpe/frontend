import { useEffect, useMemo, useRef, useState } from 'react';
import { PackageCheck, Paperclip, ScanBarcode } from 'lucide-react';
import { Button } from '../ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import type { PurchaseOrder } from '../../hooks/usePurchases';

type AreaOpt = { id: number; name: string };

type Props = {
  purchase: PurchaseOrder;
  areas?: AreaOpt[];
  onReceive: (payload: {
    items: { item_id?: number; product_id?: number; quantity: number; area_id?: number }[];
    area_id?: number;
    invoice_number?: string;
    invoice_date?: string;
    invoice_total?: number;
  }) => Promise<void>;
  onReceiveAll: (invoice: {
    invoice_number?: string;
    invoice_date?: string;
    invoice_total?: number;
    area_id?: number;
  }) => Promise<void>;
  onUploadAttachment?: (file: File) => Promise<void>;
  onLookupBarcode?: (code: string) => Promise<{ id: number; name?: string; code?: string } | null | undefined>;
  onClose: () => void;
};

export function ReceivePurchaseDialog({
  purchase,
  areas = [],
  onReceive,
  onReceiveAll,
  onUploadAttachment,
  onLookupBarcode,
  onClose,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [invoiceNumber, setInvoiceNumber] = useState(purchase.invoice_number || '');
  const [invoiceDate, setInvoiceDate] = useState(
    purchase.invoice_date || new Date().toISOString().split('T')[0]
  );
  const [invoiceTotal, setInvoiceTotal] = useState(
    String(purchase.invoice_total ?? purchase.total ?? '')
  );
  const [areaId, setAreaId] = useState(
    purchase.default_area_id ? String(purchase.default_area_id) : ''
  );
  const [barcode, setBarcode] = useState('');
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [attachmentName, setAttachmentName] = useState(purchase.invoice_attachment_name || '');

  useEffect(() => {
    const init: Record<string, string> = {};
    for (const it of purchase.items) {
      const key = String(it.id ?? it.product_id);
      const pending = Math.max(0, it.quantity - (it.quantity_received || 0));
      init[key] = pending > 0 ? String(pending) : '0';
    }
    setQtys(init);
    setAttachmentName(purchase.invoice_attachment_name || '');
    if (purchase.default_area_id) setAreaId(String(purchase.default_area_id));
  }, [purchase]);

  const lines = useMemo(
    () =>
      purchase.items.map((it) => {
        const key = String(it.id ?? it.product_id);
        const pending = Math.max(0, it.quantity - (it.quantity_received || 0));
        return { it, key, pending };
      }),
    [purchase.items]
  );

  const areaNum = areaId ? Number(areaId) : undefined;

  const submitPartial = async () => {
    const items = lines
      .map(({ it, key, pending }) => {
        const q = Math.min(pending, parseFloat(qtys[key] || '0') || 0);
        return {
          item_id: it.id,
          product_id: it.product_id,
          quantity: q,
          area_id: areaNum,
        };
      })
      .filter((r) => r.quantity > 0);

    if (items.length === 0) return;
    setBusy(true);
    try {
      await onReceive({
        items,
        area_id: areaNum,
        invoice_number: invoiceNumber || undefined,
        invoice_date: invoiceDate || undefined,
        invoice_total: invoiceTotal ? parseFloat(invoiceTotal) : undefined,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const submitAll = async () => {
    setBusy(true);
    try {
      await onReceiveAll({
        invoice_number: invoiceNumber || undefined,
        invoice_date: invoiceDate || undefined,
        invoice_total: invoiceTotal ? parseFloat(invoiceTotal) : undefined,
        area_id: areaNum,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const handleFile = async (file?: File | null) => {
    if (!file || !onUploadAttachment) return;
    setBusy(true);
    try {
      await onUploadAttachment(file);
      setAttachmentName(file.name);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleScan = async () => {
    if (!onLookupBarcode || !barcode.trim()) return;
    setBusy(true);
    try {
      const product = await onLookupBarcode(barcode.trim());
      if (!product) {
        toast.error('Código no encontrado');
        return;
      }
      const line = lines.find((l) => l.it.product_id === product.id || l.it.product?.id === product.id);
      if (!line) {
        toast.error(`"${product.name || product.code}" no está en esta OC`);
        return;
      }
      if (line.pending <= 0) {
        toast.message('Ese ítem ya está completamente recibido');
        return;
      }
      const current = parseFloat(qtys[line.key] || '0') || 0;
      const next = Math.min(line.pending, current + 1);
      setQtys((prev) => ({ ...prev, [line.key]: String(next) }));
      toast.success(`+1 ${product.name || product.code}`);
      setBarcode('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-cyan-600" />
          Recibir mercadería
        </DialogTitle>
        <DialogDescription>
          {purchase.order_number || `Orden #${purchase.id}`} — stock, kardex y almacén
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 mt-2">
        {areas.length > 0 && (
          <div>
            <Label>Área / almacén destino</Label>
            <Select value={areaId} onValueChange={setAreaId}>
              <SelectTrigger>
                <SelectValue placeholder="Área por defecto" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Nº factura proveedor</Label>
            <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          </div>
          <div>
            <Label>Fecha factura</Label>
            <Input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Total factura (S/) — con IGV si aplica</Label>
          <Input
            type="number"
            step="0.01"
            value={invoiceTotal}
            onChange={(e) => setInvoiceTotal(e.target.value)}
          />
          {(purchase.subtotal != null || purchase.igv_amount != null) && (
            <p className="text-xs text-muted-foreground mt-1">
              OC: subt. {(purchase.subtotal ?? 0).toFixed(2)} + IGV{' '}
              {(purchase.igv_amount ?? 0).toFixed(2)} = {(purchase.total ?? 0).toFixed(2)}
            </p>
          )}
        </div>

        {onLookupBarcode && (
          <div className="space-y-2">
            <Label>Escanear código / SKU</Label>
            <div className="flex gap-2">
              <Input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleScan();
                  }
                }}
                placeholder="Leer código y Enter"
              />
              <Button type="button" variant="outline" onClick={handleScan} disabled={busy}>
                <ScanBarcode className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {onUploadAttachment && (
          <div className="space-y-2">
            <Label>Adjunto factura (PDF/imagen)</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 mr-1" />
                {attachmentName ? 'Reemplazar archivo' : 'Subir factura'}
              </Button>
              {attachmentName && (
                <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                  {attachmentName}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2 border rounded-lg p-3">
          <p className="text-sm font-semibold">Cantidades a recibir</p>
          {lines.map(({ it, key, pending }) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{it.name || it.productName}</p>
                <p className="text-xs text-muted-foreground">
                  Pedido {it.quantity} · Recibido {it.quantity_received || 0} · Pendiente {pending}
                </p>
              </div>
              <Input
                type="number"
                min={0}
                max={pending}
                step="any"
                className="w-24 h-8"
                disabled={pending <= 0}
                value={qtys[key] ?? '0'}
                onChange={(e) => setQtys((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="button" variant="secondary" onClick={submitPartial} disabled={busy}>
            Recibir seleccionado
          </Button>
          <Button type="button" onClick={submitAll} disabled={busy}>
            Recibir todo pendiente
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
