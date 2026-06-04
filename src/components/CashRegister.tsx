import { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  CheckCircle,
  CreditCard,
  Wallet,
  Banknote,
  QrCode,
  Activity,
  Minus,
  ArrowRight,
  Lock,
  Truck,
  Receipt,
  FileText,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCashRegister } from '../hooks/useCashRegister';
import { useCompanies } from '../hooks/useCompanies';
import { useVehicles } from '../hooks/useVehicles';
import { getStoredCompanyId } from '../utils/appointmentMappers';
import { CorrelativesPanel } from './cash/CorrelativesPanel';
import { IssueDocumentDialog } from './appointments/IssueDocumentDialog';
import { useAuth } from '../context/AuthContext';
import type { PendingCashAppointment } from '../hooks/useCashRegister';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Yape', 'Plin', 'Transferencia'] as const;

export function CashRegister() {
  const { user } = useAuth();
  const companyId = user?.companyId ?? getStoredCompanyId();
  const { companies, loading: loadingCompanies } = useCompanies();
  const company = companies.find((c) => c.id === companyId);
  const [branches, setBranches] = useState<{ id: number; nombre: string }[]>(
    company?.branches ?? []
  );
  const [branchId, setBranchId] = useState<number>(
    (user as { branchId?: number })?.branchId ?? 0
  );
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');

  const { vehicles } = useVehicles(companyId);
  const vehicleId = vehicleFilter === 'all' ? '' : parseInt(vehicleFilter, 10);

  const {
    currentSession,
    daySummary,
    loading,
    summaryLoading,
    openSession,
    closeSession,
    addMovement,
    registerAppointmentPayment,
    refreshSummary,
  } = useCashRegister(companyId, branchId, vehicleId);

  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [payDialogId, setPayDialogId] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState<string>('Efectivo');
  const [issueDocOpen, setIssueDocOpen] = useState(false);
  const [appointmentToInvoice, setAppointmentToInvoice] = useState<PendingCashAppointment | null>(null);

  const [startingCashInput, setStartingCashInput] = useState('200');
  const [cashCountInput, setCashCountInput] = useState('');
  const [expenseForm, setExpenseForm] = useState({ concept: '', amount: '' });

  useEffect(() => {
    setBranches(company?.branches ?? []);
  }, [company?.branches]);

  useEffect(() => {
    if (!companyId || branches.length > 0) return;
    apiClient
      .get<{ data?: { id: number; nombre: string }[] }>(API.companies.branches(companyId))
      .then((res) => {
        const list = (res as { data?: { id: number; nombre: string }[] }).data ?? res;
        if (Array.isArray(list)) setBranches(list);
      })
      .catch(() => {});
  }, [companyId, branches.length]);

  useEffect(() => {
    if (branchId) return;
    const uBranch = (user as { branchId?: number })?.branchId;
    if (uBranch) setBranchId(uBranch);
    else if (branches.length > 0) setBranchId(branches[0].id);
  }, [branchId, user, branches]);

  const sales = daySummary?.sales ?? {
    cash: 0,
    card: 0,
    transfer: 0,
    qr: 0,
    total: 0,
  };

  const movements = daySummary?.movements ?? [];
  const pending = daySummary?.pending_collections ?? [];
  const pendingInvoicing = useMemo(() => {
    const fromApi = daySummary?.pending_invoicing ?? [];
    if (fromApi.length > 0) return fromApi;
    return pending.filter((a) => a.status === 'Completada' && !a.invoiced);
  }, [daySummary?.pending_invoicing, pending]);
  const expensesTotal = daySummary?.expenses_total ?? 0;
  const cashInDrawer =
    (currentSession?.opening_amount ?? 0) + sales.cash - expensesTotal;

  const handleOpenSession = async () => {
    const startAmount = parseFloat(startingCashInput);
    if (!branchId) {
      toast.error('Seleccione una sucursal');
      return;
    }
    if (isNaN(startAmount)) {
      toast.error('Monto inicial inválido');
      return;
    }
    try {
      await openSession(startAmount);
      setShowOpenDialog(false);
    } catch {
      /* toast en hook */
    }
  };

  const handleAddExpense = async () => {
    if (!currentSession) return;
    const amount = parseFloat(expenseForm.amount);
    if (!expenseForm.concept || isNaN(amount)) {
      toast.error('Datos de gasto inválidos');
      return;
    }
    try {
      await addMovement({ type: 'EXPENSE', amount, description: expenseForm.concept });
      setExpenseForm({ concept: '', amount: '' });
      setShowExpenseDialog(false);
    } catch {
      /* handled */
    }
  };

  const openInvoiceDialog = (apt: PendingCashAppointment) => {
    setAppointmentToInvoice(apt);
    setIssueDocOpen(true);
  };

  const handleCollect = async () => {
    if (!payDialogId) return;
    try {
      const apt = pending.find((p) => p.id === payDialogId);
      await registerAppointmentPayment(payDialogId, payMethod, apt?.total);
      setPayDialogId(null);
    } catch {
      /* handled */
    }
  };

  const handleCloseSession = async () => {
    if (!currentSession) return;
    const actualCash = parseFloat(cashCountInput);
    if (isNaN(actualCash)) {
      toast.error('Ingrese el monto contado');
      return;
    }
    try {
      await closeSession(actualCash, cashInDrawer);
      setShowCloseDialog(false);
      setCashCountInput('');
    } catch {
      /* handled */
    }
  };

  const vehicleLabel = useMemo(() => {
    const map = new Map(vehicles.map((v) => [v.id, v.name || v.plate || `Móvil ${v.id}`]));
    return (id?: number) => (id ? map.get(id) ?? `Móvil ${id}` : '—');
  }, [vehicles]);

  if (loadingCompanies || (loading && !currentSession && !daySummary)) {
    return <div className="p-10 text-center text-muted-foreground">Cargando caja…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2">
            <Calculator className="w-8 h-8" />
            Cierre de caja — visitas móviles
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentSession
              ? `Sesión abierta desde ${new Date(currentSession.opened_at).toLocaleTimeString('es-PE')}`
              : 'Abra caja para registrar cobros del día'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {branches.length > 1 && (
            <Select value={String(branchId)} onValueChange={(v) => setBranchId(parseInt(v, 10))}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sucursal" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Móvil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los móviles</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={String(v.id)}>
                  {v.name || v.plate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!currentSession ? (
            <Button onClick={() => setShowOpenDialog(true)} className="bg-green-600">
              <Banknote className="mr-2 h-4 w-4" /> Abrir caja
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowExpenseDialog(true)}>
                <Minus className="mr-2 h-4 w-4" /> Gasto
              </Button>
              <Button variant="destructive" onClick={() => setShowCloseDialog(true)}>
                <CheckCircle className="mr-2 h-4 w-4" /> Cerrar caja
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="caja">
        <TabsList>
          <TabsTrigger value="caja">Caja del día</TabsTrigger>
          <TabsTrigger value="cobros">
            Cobros pendientes
            {(pending.length > 0 || pendingInvoicing.length > 0) && (
              <Badge className="ml-2" variant="destructive">
                {pending.length + pendingInvoicing.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="correlativos">Correlativos</TabsTrigger>
        </TabsList>

        <TabsContent value="caja" className="space-y-6 mt-4">
          {currentSession ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 md:col-span-2 bg-green-50 border-green-200">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-green-800">Efectivo teórico en caja</h3>
                    <p className="text-sm text-green-600">Cobros en efectivo + apertura − gastos</p>
                  </div>
                  <Wallet className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-4xl font-bold text-green-900 mb-4">
                  S/ {cashInDrawer.toFixed(2)}
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-white/70 p-2 rounded">
                    Apertura: S/ {(currentSession.opening_amount || 0).toFixed(2)}
                  </div>
                  <div className="bg-white/70 p-2 rounded text-blue-700">
                    + Efectivo citas: S/ {sales.cash.toFixed(2)}
                  </div>
                  <div className="bg-white/70 p-2 rounded text-red-700">
                    − Gastos: S/ {expensesTotal.toFixed(2)}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Cobros del día (citas)
                </h3>
                {summaryLoading ? (
                  <p className="text-sm text-slate-500">Actualizando…</p>
                ) : (
                  <div className="space-y-3 text-sm">
                    <Row icon={<Banknote className="w-4 h-4 text-green-600" />} label="Efectivo" value={sales.cash} />
                    <Row icon={<CreditCard className="w-4 h-4 text-purple-600" />} label="Tarjeta" value={sales.card} />
                    <Row icon={<QrCode className="w-4 h-4 text-pink-600" />} label="Yape/Plin" value={sales.qr} />
                    <Row icon={<ArrowRight className="w-4 h-4 text-orange-600" />} label="Transferencia" value={sales.transfer} />
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total cobrado</span>
                      <span className="text-blue-600">S/ {sales.total.toFixed(2)}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => refreshSummary()}>
                      Actualizar resumen
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Caja cerrada</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Abra la caja para vincular cobros de visitas móviles y gastos del turno.
              </p>
              <Button onClick={() => setShowOpenDialog(true)}>Iniciar turno</Button>
            </Card>
          )}

          {daySummary?.by_vehicle && daySummary.by_vehicle.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5" /> Resumen por móvil
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {daySummary.by_vehicle.map((v) => (
                  <div key={String(v.vehicle_id)} className="border rounded-lg p-3 text-sm">
                    <div className="font-medium">{v.vehicle_name}</div>
                    <div className="text-slate-500">{v.appointments} citas</div>
                    <div>Cobrado: S/ {v.paid_total.toFixed(2)}</div>
                    {v.pending_count > 0 && (
                      <Badge variant="outline" className="mt-1">
                        {v.pending_count} por cobrar
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cobros" className="mt-4 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Citas por cobrar (hoy)
            </h3>
            {!currentSession && (
              <p className="text-amber-700 text-sm mb-4 bg-amber-50 p-3 rounded">
                Recomendado: abra caja antes de registrar cobros para cuadrar el turno.
              </p>
            )}
            {pending.length === 0 ? (
              <p className="text-slate-500">No hay citas pendientes de cobro para hoy.</p>
            ) : (
              <div className="space-y-2">
                {pending.map((apt) => (
                  <PendingAppointmentRow
                    key={apt.id}
                    apt={apt}
                    vehicleLabel={vehicleLabel(apt.vehicle_id)}
                    onCollect={() => setPayDialogId(apt.id)}
                    onInvoice={() => openInvoiceDialog(apt)}
                    showCollect
                  />
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Emitir comprobante (boleta / factura)
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Citas completadas sin comprobante electrónico. Se genera boleta o factura según el documento del cliente.
            </p>
            {pendingInvoicing.length === 0 ? (
              <p className="text-slate-500">No hay citas pendientes de facturación para hoy.</p>
            ) : (
              <div className="space-y-2">
                {pendingInvoicing.map((apt) => (
                  <PendingAppointmentRow
                    key={`inv-${apt.id}`}
                    apt={apt}
                    vehicleLabel={vehicleLabel(apt.vehicle_id)}
                    onInvoice={() => openInvoiceDialog(apt)}
                    showCollect={apt.payment_status !== 'Pagado'}
                    onCollect={
                      apt.payment_status !== 'Pagado' ? () => setPayDialogId(apt.id) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="correlativos" className="mt-4">
          {branchId ? (
            <CorrelativesPanel branchId={branchId} />
          ) : (
            <p className="text-slate-500">Seleccione una sucursal con correlativos configurados.</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apertura de caja</DialogTitle>
            <DialogDescription>Monto inicial en efectivo del turno</DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            value={startingCashInput}
            onChange={(e) => setStartingCashInput(e.target.value)}
            className="text-2xl text-center"
          />
          <DialogFooter>
            <Button onClick={handleOpenSession}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar gasto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Concepto"
              value={expenseForm.concept}
              onChange={(e) => setExpenseForm({ ...expenseForm, concept: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Monto S/"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddExpense}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={payDialogId !== null} onOpenChange={() => setPayDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar cobro</DialogTitle>
          </DialogHeader>
          <Label>Método de pago</Label>
          <Select value={payMethod} onValueChange={setPayMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={handleCollect}>Confirmar cobro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {appointmentToInvoice && (
        <IssueDocumentDialog
          open={issueDocOpen}
          onOpenChange={setIssueDocOpen}
          appointmentId={String(appointmentToInvoice.id)}
          appointmentLabel={[
            appointmentToInvoice.client_name,
            appointmentToInvoice.service_name || `Cita #${appointmentToInvoice.id}`,
          ]
            .filter(Boolean)
            .join(' — ')}
          onSuccess={() => {
            refreshSummary();
            setAppointmentToInvoice(null);
          }}
        />
      )}

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cierre de caja</DialogTitle>
            <DialogDescription>Esperado: S/ {cashInDrawer.toFixed(2)}</DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            value={cashCountInput}
            onChange={(e) => setCashCountInput(e.target.value)}
            className="text-2xl text-center"
            placeholder="Monto contado"
          />
          <DialogFooter>
            <Button variant="destructive" onClick={handleCloseSession}>
              Cerrar turno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PendingAppointmentRow({
  apt,
  vehicleLabel,
  onCollect,
  onInvoice,
  showCollect = true,
}: {
  apt: PendingCashAppointment;
  vehicleLabel: string;
  onCollect?: () => void;
  onInvoice: () => void;
  showCollect?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-2 p-3 border rounded-lg">
      <div>
        <p className="font-medium">{apt.service_name || `Cita #${apt.id}`}</p>
        {apt.client_name && (
          <p className="text-sm text-slate-600">{apt.client_name}</p>
        )}
        <p className="text-xs text-slate-500">
          {apt.time} · {apt.district} · {vehicleLabel}
          {apt.payment_status === 'Pagado' && (
            <Badge variant="outline" className="ml-2 text-green-700 border-green-300">
              Cobrado
            </Badge>
          )}
          {apt.invoiced && (
            <Badge variant="outline" className="ml-2">
              Facturado
            </Badge>
          )}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <span className="font-bold">S/ {apt.total.toFixed(2)}</span>
        {showCollect && onCollect && (
          <Button size="sm" onClick={onCollect}>
            Cobrar
          </Button>
        )}
        {!apt.invoiced && apt.status === 'Completada' && (
          <Button size="sm" variant="outline" onClick={onInvoice}>
            <FileText className="w-4 h-4 mr-1" />
            Facturar
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="font-semibold">S/ {value.toFixed(2)}</span>
    </div>
  );
}
