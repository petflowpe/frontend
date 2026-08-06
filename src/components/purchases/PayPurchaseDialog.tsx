import { useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { PurchaseOrder } from '../../hooks/usePurchases';

type Props = {
  purchase: PurchaseOrder;
  onPay: (payload: {
    amount: number;
    payment_method?: string;
    post_to_cash?: boolean;
  }) => Promise<void>;
  onClose: () => void;
};

export function PayPurchaseDialog({ purchase, onPay, onClose }: Props) {
  const total = purchase.invoice_total ?? purchase.total;
  const paid = purchase.amount_paid ?? 0;
  const remaining = Math.max(0, total - paid);

  const [amount, setAmount] = useState(String(remaining || ''));
  const [method, setMethod] = useState('cash');
  const [postToCash, setPostToCash] = useState(true);
  const [busy, setBusy] = useState(false);

  const label = useMemo(
    () => purchase.order_number || `Orden #${purchase.id}`,
    [purchase]
  );

  const submit = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    setBusy(true);
    try {
      await onPay({
        amount: value,
        payment_method: method,
        post_to_cash: postToCash,
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          Pagar proveedor
        </DialogTitle>
        <DialogDescription>
          {label} · Saldo pendiente {remaining.toFixed(2)} S/
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 mt-2">
        <div className="text-sm space-y-1 p-3 rounded-lg bg-muted">
          <p>Total: {total.toFixed(2)} S/</p>
          <p>Pagado: {paid.toFixed(2)} S/</p>
          <p className="font-semibold">Pendiente: {remaining.toFixed(2)} S/</p>
        </div>

        <div>
          <Label>Monto a pagar</Label>
          <Input
            type="number"
            min={0.01}
            max={remaining}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <Label>Método</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="transfer">Transferencia</SelectItem>
              <SelectItem value="yape">Yape</SelectItem>
              <SelectItem value="plin">Plin</SelectItem>
              <SelectItem value="card">Tarjeta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={postToCash} onCheckedChange={(v) => setPostToCash(!!v)} />
          Registrar egreso en caja abierta
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={busy || remaining <= 0}>
            Registrar pago
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
