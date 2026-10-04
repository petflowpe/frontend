import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { apiClient } from '../../utils/api/client';
import { API } from '../../utils/api/endpoints';
import { fromBackendFormat, type PurchaseOrder, type PurchasePayment } from '../../hooks/usePurchases';

type Props = {
  purchase: PurchaseOrder;
  onPay: (payload: {
    amount: number;
    payment_method?: string;
    post_to_cash?: boolean;
    reference?: string;
  }) => Promise<void>;
  onClose: () => void;
};

const METHOD_LABEL: Record<string, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  yape: 'Yape',
  plin: 'Plin',
  card: 'Tarjeta',
  other: 'Otro',
};

export function PayPurchaseDialog({ purchase, onPay, onClose }: Props) {
  const [order, setOrder] = useState<PurchaseOrder>(purchase);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiClient.get<any>(API.purchaseOrders.byId(purchase.id));
        if (active) setOrder(fromBackendFormat(res?.data ?? res));
      } catch {
        /* se usa la versión del listado */
      } finally {
        if (active) setLoadingHistory(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [purchase.id]);

  const total = order.invoice_total ?? order.total;
  const paid = order.amount_paid ?? 0;
  const remaining = Math.max(0, Math.round((total - paid) * 100) / 100);
  const payments: PurchasePayment[] = order.payments ?? [];

  const [amount, setAmount] = useState(String(remaining || ''));
  const [method, setMethod] = useState('cash');
  const [postToCash, setPostToCash] = useState(true);
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAmount(String(remaining || ''));
  }, [remaining]);

  const label = useMemo(() => order.order_number || `Orden #${order.id}`, [order]);
  const isCash = method === 'cash';

  const submit = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }
    if (value > remaining + 0.01) {
      toast.error(`El monto excede el saldo pendiente (S/ ${remaining.toFixed(2)})`);
      return;
    }
    setBusy(true);
    try {
      await onPay({
        amount: value,
        payment_method: method,
        post_to_cash: isCash && postToCash,
        reference: reference.trim() || undefined,
      });
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo registrar el pago');
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
              {Object.entries(METHOD_LABEL).map(([value, text]) => (
                <SelectItem key={value} value={value}>
                  {text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Referencia (opcional)</Label>
          <Input
            placeholder="N° operación, voucher…"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>

        {isCash ? (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={postToCash} onCheckedChange={(v) => setPostToCash(!!v)} />
            Registrar egreso en caja abierta
          </label>
        ) : (
          <p className="text-xs text-muted-foreground">
            Los pagos que no son en efectivo no afectan el arqueo de caja.
          </p>
        )}

        <div className="border-t pt-3">
          <p className="text-sm font-medium mb-2">Pagos registrados</p>
          {loadingHistory ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : payments.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin pagos previos</p>
          ) : (
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {payments.map((p) => (
                <div key={p.id} className="flex justify-between text-xs">
                  <span>
                    {new Date(p.paid_at).toLocaleDateString()} · {METHOD_LABEL[p.payment_method] ?? p.payment_method}
                    {p.reference ? ` · ${p.reference}` : ''}
                    {p.user?.name ? ` · ${p.user.name}` : ''}
                    {p.cash_movement_id ? ' · caja' : ''}
                  </span>
                  <span className="font-medium">{Number(p.amount).toFixed(2)} S/</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={busy || remaining <= 0}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar pago
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
