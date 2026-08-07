import { useEffect, useMemo, useState } from 'react';
import { DollarSign, Receipt, CreditCard, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { PayPurchaseDialog } from './purchases/PayPurchaseDialog';
import type { PurchaseOrder } from '../hooks/usePurchases';

type ReceivableRow = {
  id: number;
  numero_completo: string;
  fecha_emision: string | null;
  fecha_vencimiento: string | null;
  forma_pago_tipo: string;
  estado_sunat?: string | null;
  client: { id: number; name: string; document?: string | null };
  total: number;
  paid: number;
  balance: number;
  status: 'open' | 'partial' | 'paid';
  overdue: boolean;
};

type PayableRow = {
  id: number;
  company_id: number;
  purchase_order_id: number;
  supplier_id: number;
  status: 'open' | 'partial' | 'closed' | string;
  original_amount: number;
  paid_amount: number;
  balance: number;
  due_date?: string | null;
  supplier?: { id: number; name: string };
  purchase_order?: { id: number; order_number?: string; status?: string };
  metadata?: any;
};

function statusBadge(status: string, overdue?: boolean) {
  if (status === 'paid' || status === 'closed') return { label: 'Pagado', cls: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' };
  if (overdue) return { label: 'Vencido', cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' };
  if (status === 'partial') return { label: 'Parcial', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' };
  return { label: 'Pendiente', cls: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' };
}

export function Treasury() {
  const { user } = useAuth();
  const companyId = user?.companyId ?? null;

  const [activeTab, setActiveTab] = useState<'receivables' | 'payables'>('receivables');
  const [loading, setLoading] = useState(false);
  const [receivables, setReceivables] = useState<ReceivableRow[]>([]);
  const [payables, setPayables] = useState<PayableRow[]>([]);
  const [search, setSearch] = useState('');

  // Cobro (crear payment) sobre factura
  const [collectOpen, setCollectOpen] = useState(false);
  const [collectTarget, setCollectTarget] = useState<ReceivableRow | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<'cash' | 'card' | 'transfer' | 'yape' | 'plin' | 'other'>('cash');
  const [collectReference, setCollectReference] = useState('');

  // Pago a proveedor (OC)
  const [payOpen, setPayOpen] = useState(false);
  const [payPurchase, setPayPurchase] = useState<PurchaseOrder | null>(null);

  const loadReceivables = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await apiClient.get<{ data?: ReceivableRow[] } | ReceivableRow[]>(
        API.treasury.receivables,
        { company_id: companyId, per_page: 200 }
      );
      const rows = Array.isArray(res) ? res : (res as any)?.data;
      setReceivables(Array.isArray(rows) ? rows : []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'No se pudieron cargar las cuentas por cobrar');
      setReceivables([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPayables = async () => {
    if (!companyId) return;
    try {
      const res = await apiClient.get<{ data?: any[] }>(API.purchaseOrders.payables, { company_id: companyId });
      setPayables((res as any)?.data ?? []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'No se pudieron cargar las cuentas por pagar');
      setPayables([]);
    }
  };

  const reloadAll = async () => {
    await Promise.all([loadReceivables(), loadPayables()]);
  };

  useEffect(() => {
    reloadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const filteredReceivables = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return receivables;
    return receivables.filter((r) => {
      const hay = `${r.numero_completo} ${r.client?.name ?? ''} ${r.client?.document ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [receivables, search]);

  const filteredPayables = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payables;
    return payables.filter((p) => {
      const supplier = p.supplier?.name ?? '';
      const order = p.purchase_order?.order_number ?? p.metadata?.order_number ?? '';
      const hay = `${supplier} ${order} ${p.purchase_order_id}`.toLowerCase();
      return hay.includes(q);
    });
  }, [payables, search]);

  const kpis = useMemo(() => {
    const cxc = receivables.reduce((s, r) => s + (Number(r.balance) || 0), 0);
    const cxcOverdue = receivables.filter((r) => r.overdue).reduce((s, r) => s + (Number(r.balance) || 0), 0);
    const cxp = payables.reduce((s, p) => s + (Number(p.balance) || 0), 0);
    const cxpOverdue = payables
      .filter((p) => p.status !== 'closed' && p.due_date && new Date(p.due_date) < new Date())
      .reduce((s, p) => s + (Number(p.balance) || 0), 0);
    return { cxc, cxcOverdue, cxp, cxpOverdue };
  }, [receivables, payables]);

  const openCollect = (row: ReceivableRow) => {
    setCollectTarget(row);
    setCollectAmount(Math.max(0, Number(row.balance) || 0));
    setCollectMethod('cash');
    setCollectReference('');
    setCollectOpen(true);
  };

  const submitCollect = async () => {
    if (!collectTarget) return;
    const amount = Number(collectAmount);
    if (!amount || amount <= 0) {
      toast.error('Monto inválido');
      return;
    }
    try {
      await apiClient.post(API.payments.create, {
        invoice_id: collectTarget.id,
        amount,
        method: collectMethod,
        reference: collectReference || null,
      });
      toast.success('Cobro registrado');
      setCollectOpen(false);
      setCollectTarget(null);
      await loadReceivables();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'No se pudo registrar el cobro');
    }
  };

  const openPaySupplier = async (purchaseOrderId: number) => {
    try {
      const order = await apiClient.get<{ data?: any }>(API.purchaseOrders.byId(purchaseOrderId));
      const row = (order as any)?.data ?? order;
      setPayPurchase(row as PurchaseOrder);
      setPayOpen(true);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'No se pudo cargar la orden de compra');
    }
  };

  const submitPaySupplier = async (payload: { amount: number; payment_method?: string; post_to_cash?: boolean }) => {
    if (!payPurchase) return;
    await apiClient.post(API.purchaseOrders.pay(payPurchase.id), payload);
    toast.success('Pago registrado · CxP actualizada');
    setPayOpen(false);
    setPayPurchase(null);
    await loadPayables();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl text-primary">Tesorería</h1>
          <p className="text-muted-foreground">
            Cuentas por cobrar y por pagar, con registro de cobros/pagos y vencimientos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={reloadAll} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">CxC (Saldo)</p>
              <p className="text-xl font-semibold">{formatCurrency(kpis.cxc, 'PEN')}</p>
            </div>
            <Receipt className="h-5 w-5 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">CxC Vencido</p>
              <p className="text-xl font-semibold">{formatCurrency(kpis.cxcOverdue, 'PEN')}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">CxP (Saldo)</p>
              <p className="text-xl font-semibold">{formatCurrency(kpis.cxp, 'PEN')}</p>
            </div>
            <DollarSign className="h-5 w-5 text-emerald-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">CxP Vencido</p>
              <p className="text-xl font-semibold">{formatCurrency(kpis.cxpOverdue, 'PEN')}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por número, cliente o proveedor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xl"
        />
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList>
          <TabsTrigger value="receivables" className="gap-2">
            <Receipt className="h-4 w-4" />
            Cuentas por cobrar
          </TabsTrigger>
          <TabsTrigger value="payables" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Cuentas por pagar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receivables" className="mt-4">
          <Card className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Factura</th>
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-left p-2">Emisión</th>
                    <th className="text-left p-2">Vence</th>
                    <th className="text-left p-2">Forma</th>
                    <th className="text-right p-2">Total</th>
                    <th className="text-right p-2">Pagado</th>
                    <th className="text-right p-2">Saldo</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-right p-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceivables.map((r) => {
                    const badge = statusBadge(r.status, r.overdue);
                    return (
                      <tr key={r.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 font-medium">{r.numero_completo}</td>
                        <td className="p-2">{r.client?.name || '—'}</td>
                        <td className="p-2">{r.fecha_emision || '—'}</td>
                        <td className="p-2">{r.fecha_vencimiento || '—'}</td>
                        <td className="p-2">{r.forma_pago_tipo}</td>
                        <td className="p-2 text-right">{formatCurrency(r.total || 0, 'PEN')}</td>
                        <td className="p-2 text-right">{formatCurrency(r.paid || 0, 'PEN')}</td>
                        <td className="p-2 text-right font-semibold">{formatCurrency(r.balance || 0, 'PEN')}</td>
                        <td className="p-2">
                          <Badge className={badge.cls}>{badge.label}</Badge>
                        </td>
                        <td className="p-2 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={!(Number(r.balance) > 0)}
                            onClick={() => openCollect(r)}
                          >
                            <CreditCard className="h-4 w-4" />
                            Cobrar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredReceivables.length === 0 && (
                <div className="py-10 text-center text-muted-foreground">Sin registros</div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payables" className="mt-4">
          <Card className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Proveedor</th>
                    <th className="text-left p-2">OC</th>
                    <th className="text-left p-2">Vence</th>
                    <th className="text-right p-2">Original</th>
                    <th className="text-right p-2">Pagado</th>
                    <th className="text-right p-2">Saldo</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-right p-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayables.map((p) => {
                    const overdue = p.status !== 'closed' && p.due_date ? new Date(p.due_date) < new Date() : false;
                    const badge = statusBadge(p.status, overdue);
                    return (
                      <tr key={p.id} className="border-b hover:bg-muted/30">
                        <td className="p-2">{p.supplier?.name || '—'}</td>
                        <td className="p-2">{p.purchase_order?.order_number || p.metadata?.order_number || `#${p.purchase_order_id}`}</td>
                        <td className="p-2">{p.due_date || '—'}</td>
                        <td className="p-2 text-right">{formatCurrency(Number(p.original_amount) || 0, 'PEN')}</td>
                        <td className="p-2 text-right">{formatCurrency(Number(p.paid_amount) || 0, 'PEN')}</td>
                        <td className="p-2 text-right font-semibold">{formatCurrency(Number(p.balance) || 0, 'PEN')}</td>
                        <td className="p-2">
                          <Badge className={badge.cls}>{badge.label}</Badge>
                        </td>
                        <td className="p-2 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={!(Number(p.balance) > 0)}
                            onClick={() => openPaySupplier(p.purchase_order_id)}
                          >
                            <CreditCard className="h-4 w-4" />
                            Pagar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredPayables.length === 0 && (
                <div className="py-10 text-center text-muted-foreground">Sin registros</div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={collectOpen} onOpenChange={setCollectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar cobro</DialogTitle>
            <DialogDescription>
              {collectTarget ? `${collectTarget.numero_completo} — ${collectTarget.client?.name}` : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Monto</Label>
              <Input
                type="number"
                value={collectAmount}
                min={0}
                step={0.01}
                onChange={(e) => setCollectAmount(Number(e.target.value))}
              />
              {collectTarget && (
                <p className="text-xs text-muted-foreground mt-1">
                  Saldo: {formatCurrency(Number(collectTarget.balance) || 0, 'PEN')}
                </p>
              )}
            </div>

            <div>
              <Label>Método</Label>
              <Select value={collectMethod} onValueChange={(v: any) => setCollectMethod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="yape">Yape</SelectItem>
                  <SelectItem value="plin">Plin</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Referencia (opcional)</Label>
              <Input value={collectReference} onChange={(e) => setCollectReference(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setCollectOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitCollect}>
              Registrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        {payPurchase && (
          <PayPurchaseDialog
            purchase={payPurchase}
            onPay={submitPaySupplier}
            onClose={() => {
              setPayOpen(false);
              setPayPurchase(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

