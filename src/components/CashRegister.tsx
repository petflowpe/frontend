import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileText,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Wallet,
  Banknote,
  QrCode,
  Activity,
  Minus,
  ArrowRight,
  Lock,
  RefreshCw
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Separator } from './ui/separator';
import { useInvoices } from '../hooks/useInvoices';
import { useCashRegister } from '../hooks/useCashRegister';

// Interfaces
interface CashSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  status: 'open' | 'closed';
  startingCash: number;
  expectedCash: number;
  actualCash: number;
  difference: number;
  notes: string;
  sales: {
    cash: number;
    card: number;
    transfer: number;
    qr: number; // Yape/Plin
  };
  expenses: Expense[];
}

interface Expense {
  id: string;
  concept: string;
  amount: number;
  type: string;
  timestamp: string;
}

export function CashRegister() {
  const { invoices, loading: loadingInvoices } = useInvoices();
  const {
    currentSession,
    loading: loadingSession,
    openSession,
    closeSession,
    addMovement,
    getMovements
  } = useCashRegister();

  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);

  const [movements, setMovements] = useState<any[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const [startingCashInput, setStartingCashInput] = useState('200');
  const [cashCountInput, setCashCountInput] = useState('');
  const [expenseForm, setExpenseForm] = useState({ concept: '', amount: '', type: 'EXPENSE' });

  // Cargar movimientos cuando hay sesión
  useEffect(() => {
    if (currentSession) {
      setLoadingMovements(true);
      getMovements().then(data => {
        setMovements(data);
        setLoadingMovements(false);
      });
    } else {
      setMovements([]);
    }
  }, [currentSession, getMovements]);

  // Calcular totales del sistema basados en facturas de HOY
  const getSystemTotals = () => {
    // Usamos fecha local para evitar problemas de zona horaria simples
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    const todaysInvoices = invoices.filter(inv => inv.fecha === today && inv.estado === 'pagada');

    const totals = {
      cash: 0,
      card: 0,
      transfer: 0,
      qr: 0,
      total: 0
    };

    todaysInvoices.forEach(inv => {
      totals.total += inv.total;
      const method = inv.formaPago?.toLowerCase() || 'efectivo';

      if (method === 'efectivo') totals.cash += inv.total;
      else if (method === 'tarjeta') totals.card += inv.total;
      else if (method === 'transferencia') totals.transfer += inv.total;
      else if (['yape', 'plin', 'qr'].includes(method)) totals.qr += inv.total;
    });

    return totals;
  };

  const systemTotals = getSystemTotals();

  // Guardar sesión en local storage cuando cambia
  useEffect(() => {
    if (currentSession) {
      localStorage.setItem('smartpet_cash_session', JSON.stringify(currentSession));
    } else {
      localStorage.removeItem('smartpet_cash_session');
    }
  }, [currentSession]);

  const handleOpenSession = async () => {
    const startAmount = parseFloat(startingCashInput);
    if (isNaN(startAmount)) {
      toast.error('Monto inicial inválido');
      return;
    }

    try {
      await openSession(startAmount);
      setShowOpenDialog(false);
    } catch (e) {
      // Error manejado en el hook
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
      const newMovement = await addMovement({
        type: 'EXPENSE',
        amount: amount,
        description: expenseForm.concept
      });

      setMovements(prev => [newMovement, ...prev]);
      setExpenseForm({ concept: '', amount: '', type: 'EXPENSE' });
      setShowExpenseDialog(false);
    } catch (e) {
      // Error manejado en el hook
    }
  };

  const handleCloseSession = async () => {
    if (!currentSession) return;
    const actualCash = parseFloat(cashCountInput);

    if (isNaN(actualCash)) {
      toast.error('Por favor ingresa el monto contado');
      return;
    }

    // Calcular esperado: (Inicio + Ventas Efectivo) - Gastos Efectivo
    const totalExpenses = (movements || []).reduce((sum, e) => sum + (e.type === 'EXPENSE' ? parseFloat(e.amount) : 0), 0);
    const expectedCashInDrawer = (currentSession.opening_amount || 0) + systemTotals.cash - totalExpenses;

    const difference = actualCash - expectedCashInDrawer;

    try {
      await closeSession(actualCash, expectedCashInDrawer);
      setShowCloseDialog(false);
      setCashCountInput('');

      toast.success('Caja cerrada exitosamente', {
        description: difference === 0 ? 'Cuadre perfecto' : `Diferencia: S/ ${difference.toFixed(2)}`
      });
    } catch (e) {
      // Error manejado
    }
  };

  // Cálculos para UI
  const currentExpensesTotal = (movements || []).reduce((sum, e) => sum + (e.type === 'EXPENSE' ? parseFloat(e.amount) : 0), 0);
  const cashInDrawer = (currentSession?.opening_amount || 0) + systemTotals.cash - currentExpensesTotal;

  if (loadingInvoices || loadingSession) return <div className="p-10 flex justify-center text-muted-foreground">Cargando sistema de caja...</div>;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            💰 Control de Caja
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            {currentSession
              ? `Sesión Activa - Iniciada: ${new Date(currentSession.openedAt).toLocaleTimeString()}`
              : 'Caja Cerrada - Inicie sesión para operar'}
          </p>
        </div>
        <div className="flex gap-2">
          {!currentSession ? (
            <Button onClick={() => setShowOpenDialog(true)} size="lg" className="bg-green-600 hover:bg-green-700">
              <Banknote className="mr-2 h-5 w-5" /> Abrir Caja
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowExpenseDialog(true)}>
                <Minus className="mr-2 h-4 w-4" /> Registrar Gasto
              </Button>
              <Button variant="destructive" onClick={() => setShowCloseDialog(true)}>
                <CheckCircle className="mr-2 h-4 w-4" /> Cerrar Caja
              </Button>
            </>
          )}
        </div>
      </div>

      {currentSession ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta Principal: Dinero en Caja (Teórico) */}
          <Card className="p-6 md:col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Efectivo en Caja (Teórico)</h3>
                <p className="text-sm text-green-600 dark:text-green-400">Calculado según movimientos del sistema</p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-4xl font-bold text-green-900 dark:text-green-100 mb-6">
              S/ {cashInDrawer.toFixed(2)}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/60 dark:bg-black/20 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Saldo Inicial</p>
                <p className="font-semibold text-lg">+ {(currentSession.opening_amount || 0).toFixed(2)}</p>
              </div>
              <div className="bg-white/60 dark:bg-black/20 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Ventas Efectivo (Hoy)</p>
                <p className="font-semibold text-lg text-blue-600">+ {systemTotals.cash.toFixed(2)}</p>
              </div>
              <div className="bg-white/60 dark:bg-black/20 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground">Gastos / Salidas</p>
                <p className="font-semibold text-lg text-red-600">- {currentExpensesTotal.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          {/* Resumen de Ventas del Día (Todos los medios) */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Ventas del Día
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-green-500" />
                  <span>Efectivo</span>
                </div>
                <span className="font-bold">S/ {systemTotals.cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-purple-500" />
                  <span>Tarjeta</span>
                </div>
                <span className="font-bold">S/ {systemTotals.card.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-pink-500" />
                  <span>Yape/Plin</span>
                </div>
                <span className="font-bold">S/ {systemTotals.qr.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-orange-500" />
                  <span>Transferencia</span>
                </div>
                <span className="font-bold">S/ {systemTotals.transfer.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-lg">Total Ventas</span>
                <span className="font-bold text-lg text-blue-600">S/ {systemTotals.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Caja Cerrada</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Para comenzar a operar y registrar movimientos, debes realizar la apertura de caja indicando el monto inicial.
          </p>
          <Button size="lg" onClick={() => setShowOpenDialog(true)}>
            Iniciar Turno de Caja
          </Button>
        </Card>
      )}

      {/* Lista de Gastos */}
      {currentSession && (
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Gastos y Salidas de Efectivo
          </h3>
          {loadingMovements ? (
            <div className="text-center py-8">Cargando movimientos...</div>
          ) : (movements || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay movimientos registrados en esta sesión
            </div>
          ) : (
            <div className="space-y-2">
              {(movements || []).map(exp => (
                <div key={exp.id} className="flex justify-between items-center p-3 border rounded-lg bg-card transition-colors hover:bg-muted/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{exp.description}</p>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {exp.payment_method}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(exp.movement_date || exp.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className={
                    exp.type === 'EXPENSE'
                      ? "text-red-600 bg-red-50 dark:bg-red-950/30"
                      : "text-green-600 bg-green-50 dark:bg-green-950/30"
                  }>
                    {exp.type === 'EXPENSE' ? '-' : '+'} S/ {parseFloat(exp.amount).toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Dialogs */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apertura de Caja</DialogTitle>
            <DialogDescription>Ingresa el monto de efectivo inicial en caja</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Monto Inicial (S/)</Label>
            <Input
              type="number"
              value={startingCashInput}
              onChange={(e) => setStartingCashInput(e.target.value)}
              className="text-2xl font-bold text-center mt-2"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleOpenSession}>Confirmar Apertura</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Gasto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Concepto</Label>
              <Input
                value={expenseForm.concept}
                onChange={(e) => setExpenseForm({ ...expenseForm, concept: e.target.value })}
                placeholder="Ej. Compra de útiles de limpieza"
              />
            </div>
            <div>
              <Label>Monto (S/)</Label>
              <Input
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddExpense}>Guardar Gasto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cierre de Caja</DialogTitle>
            <DialogDescription>
              El sistema ha calculado los totales esperados. Ingresa lo que has contado físicamente.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Saldo Inicial:</span>
                <span>S/ {(currentSession?.opening_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>+ Ventas Efectivo:</span>
                <span>S/ {systemTotals.cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>- Gastos:</span>
                <span>S/ {currentExpensesTotal.toFixed(2)}</span>
              </div>
              <Separator className="bg-slate-300 dark:bg-slate-600" />
              <div className="flex justify-between font-bold text-lg">
                <span>Esperado en Caja:</span>
                <span>S/ {cashInDrawer.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <Label className="text-base">Dinero Contado Realmente (S/)</Label>
              <Input
                type="number"
                value={cashCountInput}
                onChange={(e) => setCashCountInput(e.target.value)}
                className="text-3xl font-bold text-center h-16 mt-2"
                placeholder="0.00"
                autoFocus
              />
              {cashCountInput && !isNaN(parseFloat(cashCountInput)) && (
                <div className={`text-center mt-2 font-medium ${parseFloat(cashCountInput) - cashInDrawer === 0 ? 'text-green-600' :
                    parseFloat(cashCountInput) - cashInDrawer > 0 ? 'text-blue-600' : 'text-red-600'
                  }`}>
                  {parseFloat(cashCountInput) - cashInDrawer === 0
                    ? '✨ Cuadre Perfecto'
                    : `Diferencia: ${(parseFloat(cashCountInput) - cashInDrawer).toFixed(2)}`}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>Cancelar</Button>
            <Button onClick={handleCloseSession} className="bg-red-600 hover:bg-red-700">Confirmar Cierre</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}