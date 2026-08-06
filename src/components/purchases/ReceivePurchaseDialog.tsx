import { useEffect, useMemo, useState } from 'react';
import { PackageCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { PurchaseOrder } from '../../hooks/usePurchases';

type Props = {
  purchase: PurchaseOrder;
  onReceive: (payload: {
    items: { item_id?: number; product_id?: number; quantity: number }[];
    invoice_number?: string;
    invoice_date?: string;
    invoice_total?: number;
  }) => Promise<void>;
  onReceiveAll: (invoice: {
    invoice_number?: string;
    invoice_date?: string;
    invoice_total?: number;
  }) => Promise<void>;
  onClose: () => void;
};

export function ReceivePurchaseDialog({ purchase, onReceive, onReceiveAll, onClose }: Props) {
  const [invoiceNumber, setInvoiceNumber] = useState(purchase.invoice_number || '');
  const [invoiceDate, setInvoiceDate] = useState(
    purchase.invoice_date || new Date().toISOString().split('T')[0]
  );
  const [invoiceTotal, setInvoiceTotal] = useState(
    String(purchase.invoice_total ?? purchase.total ?? '')
  );
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const init: Record<string, string> = {};
    for (const it of purchase.items) {
      const key = String(it.id ?? it.product_id);
      const pending = Math.max(0, it.quantity - (it.quantity_received || 0));
      init[key] = pending > 0 ? String(pending) : '0';
    }
    setQtys(init);
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

  const submitPartial = async () => {
    const items = lines
      .map(({ it, key, pending }) => {
        const q = Math.min(pending, parseFloat(qtys[key] || '0') || 0);
        return {
          item_id: it.id,
          product_id: it.product_id,
          quantity: q,
        };
      })
      .filter((r) => r.quantity > 0);

    if (items.length === 0) return;
    setBusy(true);
    try {
      await onReceive({
        items,
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
      });
      onClose();
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
          {purchase.order_number || `Orden #${purchase.id}`} — ingresa al stock y kardex
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 mt-2">
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
          <Label>Total factura (S/)</Label>
          <Input
            type="number"
            step="0.01"
            value={invoiceTotal}
            onChange={(e) => setInvoiceTotal(e.target.value)}
          />
        </div>

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
