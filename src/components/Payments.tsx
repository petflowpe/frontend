import { useMemo, useState } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  Plug,
  Wallet,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from './ui/dialog';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { usePayments, type PaymentRecord } from '../hooks/usePayments';
import { useInvoices } from '../hooks/useInvoices';
import { PaymentGatewaySettings } from './payments/PaymentGatewaySettings';
import { usePaymentGateways } from '../hooks/usePaymentGateways';
import { toast } from 'sonner';

const METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  yape: 'Yape',
  plin: 'Plin',
  other: 'Otro',
};

const GATEWAY_LABELS: Record<string, string> = {
  manual: 'Manual',
  mercado_pago: 'Mercado Pago',
  niubiz: 'Niubiz',
};

function statusBadge(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'refunded':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function statusText(status: string) {
  const map: Record<string, string> = {
    completed: 'Completado',
    pending: 'Pendiente',
    failed: 'Fallido',
    refunded: 'Reembolsado',
  };
  return map[status] ?? status;
}

export function Payments() {
  const { payments, loading, fetchPayments, createPayment, createCheckout } = usePayments();
  const { config: gateways } = usePaymentGateways();
  const { invoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [showNewPayment, setShowNewPayment] = useState(false);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        p.client.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        (p.invoice_number ?? '').toLowerCase().includes(q) ||
        (p.reference ?? '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesGateway = gatewayFilter === 'all' || p.gateway === gatewayFilter;
      return matchesSearch && matchesStatus && matchesGateway;
    });
  }, [payments, searchTerm, statusFilter, gatewayFilter]);

  const completed = payments.filter((p) => p.status === 'completed');
  const totalRevenue = completed.reduce((acc, p) => acc + p.net, 0);
  const pendingAmount = payments
    .filter((p) => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount, 0);
  const totalFees = completed.reduce((acc, p) => acc + p.fee, 0);
  const successRate =
    payments.length > 0 ? (completed.length / payments.length) * 100 : 0;

  const pendingInvoices = useMemo(
    () =>
      invoices.filter(
        (inv) => inv.estado === 'pendiente' || inv.estado === 'vencida'
      ),
    [invoices]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl text-primary">Gestión de Pagos</h1>
          <p className="text-muted-foreground">
            Cobros registrados, Mercado Pago y Niubiz
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchPayments()}>
            Actualizar
          </Button>
          <Dialog open={showNewPayment} onOpenChange={setShowNewPayment}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Registrar pago
              </Button>
            </DialogTrigger>
            <PaymentDialog
              pendingInvoices={pendingInvoices}
              onClose={() => setShowNewPayment(false)}
              onSubmit={async (data) => {
                await createPayment(data);
                setShowNewPayment(false);
              }}
              onCheckout={createCheckout}
              gateways={gateways}
            />
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl">S/ {totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Ingresos netos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl">S/ {pendingAmount.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl">S/ {totalFees.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Comisiones</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl">{successRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Tasa de éxito</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="gateways">
            <Plug className="w-4 h-4 mr-1 inline" />
            Pasarelas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar cliente, referencia o ID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completados</option>
              <option value="pending">Pendientes</option>
              <option value="failed">Fallidos</option>
            </select>
            <select
              className="px-3 py-2 border rounded-md bg-background"
              value={gatewayFilter}
              onChange={(e) => {
                const g = e.target.value;
                setGatewayFilter(g);
                void fetchPayments(g === 'all' ? {} : { gateway: g });
              }}
            >
              <option value="all">Todas las pasarelas</option>
              <option value="manual">Manual</option>
              <option value="mercado_pago">Mercado Pago</option>
              <option value="niubiz">Niubiz</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Cargando pagos…
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                {filteredPayments.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    No hay pagos registrados. Configure una pasarela o registre un cobro manual.
                  </Card>
                ) : (
                  filteredPayments.map((payment) => (
                    <Card
                      key={payment.id}
                      className={`p-5 cursor-pointer transition-colors ${
                        selectedPayment?.id === payment.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <div className="flex justify-between gap-4">
                        <div className="flex gap-3">
                          {payment.status === 'completed' && (
                            <CheckCircle className="h-6 w-6 text-green-600 shrink-0" />
                          )}
                          {payment.status === 'pending' && (
                            <Clock className="h-6 w-6 text-yellow-600 shrink-0" />
                          )}
                          {payment.status === 'failed' && (
                            <XCircle className="h-6 w-6 text-red-600 shrink-0" />
                          )}
                          <div>
                            <div className="flex flex-wrap gap-2 mb-1">
                              <span className="font-medium">#{payment.id}</span>
                              <Badge className={statusBadge(payment.status)}>
                                {statusText(payment.status)}
                              </Badge>
                              <Badge variant="outline">
                                {GATEWAY_LABELS[payment.gateway] ?? payment.gateway}
                              </Badge>
                              {payment.status === 'completed' && (
                                <Badge
                                  variant="outline"
                                  className={
                                    payment.in_cash_register
                                      ? 'border-green-300 text-green-800 bg-green-50'
                                      : 'border-amber-300 text-amber-800 bg-amber-50'
                                  }
                                >
                                  <Wallet className="w-3 h-3 mr-1 inline" />
                                  {payment.in_cash_register ? 'En caja' : 'Sin caja'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{payment.client}</p>
                            <p className="text-xs text-muted-foreground">
                              {payment.date} {payment.time}
                              {payment.invoice_number ? ` · ${payment.invoice_number}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-semibold">S/ {payment.amount.toFixed(2)}</p>
                          {payment.fee > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Neto S/ {payment.net.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              <div>
                {selectedPayment ? (
                  <Card className="p-6 space-y-3 text-sm sticky top-4">
                    <h3 className="font-semibold text-lg">Detalle #{selectedPayment.id}</h3>
                    <Row label="Cliente" value={selectedPayment.client} />
                    <Row label="Estado" value={statusText(selectedPayment.status)} />
                    <Row
                      label="Pasarela"
                      value={GATEWAY_LABELS[selectedPayment.gateway] ?? selectedPayment.gateway}
                    />
                    <Row
                      label="Método"
                      value={METHOD_LABELS[selectedPayment.method] ?? selectedPayment.method}
                    />
                    <Row label="Referencia" value={selectedPayment.reference ?? '—'} />
                    <Row label="Monto" value={`S/ ${selectedPayment.amount.toFixed(2)}`} />
                    <Row
                      label="Caja"
                      value={
                        selectedPayment.in_cash_register
                          ? `En caja${selectedPayment.cash_session_id ? ` (#${selectedPayment.cash_session_id})` : ''}`
                          : selectedPayment.status === 'completed'
                            ? 'Sin caja abierta al cobrar'
                            : '—'
                      }
                    />
                    {selectedPayment.status === 'pending' &&
                      (selectedPayment.gateway === 'mercado_pago' ||
                        selectedPayment.gateway === 'niubiz') && (
                        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                          Esperando confirmación de la pasarela.
                        </p>
                      )}
                  </Card>
                ) : (
                  <Card className="p-6 text-center text-muted-foreground text-sm">
                    Seleccione un pago para ver el detalle
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="gateways" className="mt-4">
          <PaymentGatewaySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}</span>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function PaymentDialog({
  pendingInvoices,
  onClose,
  onSubmit,
  onCheckout,
  gateways,
}: {
  pendingInvoices: { id: string; cliente: { nombre: string }; total: number }[];
  onClose: () => void;
  onSubmit: (data: {
    invoice_id: number;
    amount: number;
    method: string;
    reference?: string;
  }) => Promise<void>;
  onCheckout: (input: {
    gateway: 'mercado_pago' | 'niubiz';
    invoice_id?: number;
    amount?: number;
  }) => Promise<unknown>;
  gateways: {
    mercado_pago: { enabled: boolean };
    niubiz: { enabled: boolean };
  };
}) {
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [amount, setAmount] = useState(0);
  const [reference, setReference] = useState('');
  const [saving, setSaving] = useState(false);

  const invoiceNumId = selectedInvoice ? parseInt(selectedInvoice, 10) : null;

  const handleManual = async () => {
    if (!invoiceNumId || amount <= 0) {
      toast.error('Seleccione factura e importe');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        invoice_id: invoiceNumId,
        amount,
        method: paymentMethod,
        reference: reference || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleGateway = async (gateway: 'mercado_pago' | 'niubiz') => {
    if (!invoiceNumId) {
      toast.error('Seleccione una factura');
      return;
    }
    setSaving(true);
    try {
      await onCheckout({ gateway, invoice_id: invoiceNumId, amount: amount || undefined });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Registrar pago</DialogTitle>
        <DialogDescription>Cobro manual o enlace de pasarela (Mercado Pago / Niubiz)</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label>Factura pendiente</Label>
          <select
            className="w-full p-2 border rounded-md bg-background mt-1"
            value={selectedInvoice}
            onChange={(e) => {
              setSelectedInvoice(e.target.value);
              const inv = pendingInvoices.find((i) => String(i.id) === e.target.value);
              if (inv) setAmount(inv.total);
            }}
          >
            <option value="">Seleccionar…</option>
            {pendingInvoices.map((inv) => (
              <option key={inv.id} value={String(inv.id)}>
                {inv.cliente?.nombre ?? inv.id} — S/ {inv.total.toFixed(2)}
              </option>
            ))}
          </select>
          {pendingInvoices.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">No hay facturas pendientes en el sistema.</p>
          )}
        </div>

        <div>
          <Label>Importe (S/)</Label>
          <Input
            type="number"
            step="0.01"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        <div>
          <Label>Método (cobro manual)</Label>
          <select
            className="w-full p-2 border rounded-md bg-background mt-1"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="yape">Yape</option>
            <option value="plin">Plin</option>
          </select>
        </div>

        <div>
          <Label>Referencia (opcional)</Label>
          <Input value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleManual} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Registrar cobro manual
          </Button>
          {gateways.mercado_pago.enabled && (
            <Button variant="outline" onClick={() => handleGateway('mercado_pago')} disabled={saving}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Cobrar con Mercado Pago
            </Button>
          )}
          {gateways.niubiz.enabled && (
            <Button variant="outline" onClick={() => handleGateway('niubiz')} disabled={saving}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Cobrar con Niubiz
            </Button>
          )}
        </div>

        <Button variant="ghost" className="w-full" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </DialogContent>
  );
}
