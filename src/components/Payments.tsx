import { useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, Plus, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function Payments() {
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const payments = [
    {
      id: 'PAY-2024-001',
      invoiceId: 'INV-2024-001',
      date: '2024-01-15',
      time: '14:30',
      client: 'María González',
      amount: 72.6,
      method: 'card',
      status: 'completed',
      reference: 'txn_1234567890',
      fee: 2.18,
      net: 70.42,
      gateway: 'Stripe',
      description: 'Baño completo + Corte de uñas - Max'
    },
    {
      id: 'PAY-2024-002',
      invoiceId: 'INV-2024-005',
      date: '2024-01-14',
      time: '16:45',
      client: 'Ana Torres',
      amount: 45.0,
      method: 'cash',
      status: 'completed',
      reference: 'CASH-001',
      fee: 0,
      net: 45.0,
      gateway: 'Efectivo',
      description: 'Baño completo - Toby'
    },
    {
      id: 'PAY-2024-003',
      invoiceId: 'INV-2024-002',
      date: '2024-01-13',
      time: '12:15',
      client: 'Carlos Pérez',
      amount: 66.55,
      method: 'transfer',
      status: 'pending',
      reference: 'TRF-987654321',
      fee: 1.0,
      net: 65.55,
      gateway: 'Banco Santander',
      description: 'Baño + Corte completo - Luna'
    },
    {
      id: 'PAY-2024-004',
      invoiceId: 'INV-2024-003',
      date: '2024-01-12',
      time: '10:30',
      client: 'Laura Martín',
      amount: 108.9,
      method: 'card',
      status: 'failed',
      reference: 'txn_failed_001',
      fee: 0,
      net: 0,
      gateway: 'Stripe',
      description: 'Baño medicinal + Tratamiento - Rocco'
    },
    {
      id: 'PAY-2024-005',
      invoiceId: 'INV-2024-006',
      date: '2024-01-11',
      time: '15:20',
      client: 'Pedro Sánchez',
      amount: 35.0,
      method: 'bizum',
      status: 'completed',
      reference: 'BIZ-123456',
      fee: 0.35,
      net: 34.65,
      gateway: 'Bizum',
      description: 'Corte de uñas + Limpieza - Rex'
    }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Tarjeta', icon: CreditCard, enabled: true },
    { id: 'cash', name: 'Efectivo', icon: DollarSign, enabled: true },
    { id: 'transfer', name: 'Transferencia', icon: TrendingUp, enabled: true },
    { id: 'bizum', name: 'Bizum', icon: CreditCard, enabled: true }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      case 'refunded': return 'Reembolsado';
      default: return status;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'card': return 'bg-blue-100 text-blue-800';
      case 'cash': return 'bg-green-100 text-green-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      case 'bizum': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodText = (method: string) => {
    const methodObj = paymentMethods.find(m => m.id === method);
    return methodObj?.name || method;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.net, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);
  const totalFees = payments.filter(p => p.status === 'completed').reduce((acc, p) => acc + p.fee, 0);
  const successRate = (payments.filter(p => p.status === 'completed').length / payments.length * 100);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-primary">Gestión de Pagos</h1>
          <p className="text-muted-foreground">Administra todos los pagos y métodos de cobro</p>
        </div>
        <Dialog open={showNewPayment} onOpenChange={setShowNewPayment}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
          </DialogTrigger>
          <PaymentDialog onClose={() => setShowNewPayment(false)} />
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl">{totalRevenue.toFixed(2)}€</p>
              <p className="text-sm text-muted-foreground">Ingresos Netos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl">{pendingAmount.toFixed(2)}€</p>
              <p className="text-sm text-muted-foreground">Pagos Pendientes</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl">{totalFees.toFixed(2)}€</p>
              <p className="text-sm text-muted-foreground">Comisiones</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl">{successRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="methods">Métodos de Pago</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por cliente, factura o ID de pago..."
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
              <option value="refunded">Reembolsados</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payments List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredPayments.map((payment) => (
                <Card 
                  key={payment.id} 
                  className={`p-6 cursor-pointer transition-colors ${
                    selectedPayment?.id === payment.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedPayment(payment)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {payment.status === 'completed' && <CheckCircle className="h-6 w-6 text-green-600" />}
                        {payment.status === 'pending' && <Clock className="h-6 w-6 text-yellow-600" />}
                        {payment.status === 'failed' && <XCircle className="h-6 w-6 text-red-600" />}
                        {payment.status === 'refunded' && <TrendingUp className="h-6 w-6 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{payment.id}</h3>
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusText(payment.status)}
                          </Badge>
                          <Badge className={getMethodColor(payment.method)}>
                            {getMethodText(payment.method)}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>{payment.client}</p>
                          <p>{payment.description}</p>
                          <p>Factura: {payment.invoiceId}</p>
                          <p>{payment.date} • {payment.time}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg">{payment.amount.toFixed(2)}€</p>
                      {payment.fee > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Neto: {payment.net.toFixed(2)}€
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">{payment.gateway}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Payment Details */}
            <div>
              {selectedPayment ? (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg">{selectedPayment.id}</h3>
                    <Badge className={getStatusColor(selectedPayment.status)}>
                      {getStatusText(selectedPayment.status)}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium">Cliente:</span>
                        <br />
                        <span className="text-muted-foreground">{selectedPayment.client}</span>
                      </div>
                      <div>
                        <span className="font-medium">Factura:</span>
                        <br />
                        <span className="text-muted-foreground">{selectedPayment.invoiceId}</span>
                      </div>
                      <div>
                        <span className="font-medium">Fecha y Hora:</span>
                        <br />
                        <span className="text-muted-foreground">{selectedPayment.date} • {selectedPayment.time}</span>
                      </div>
                      <div>
                        <span className="font-medium">Método:</span>
                        <br />
                        <Badge className={getMethodColor(selectedPayment.method)}>
                          {getMethodText(selectedPayment.method)}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Gateway:</span>
                        <br />
                        <span className="text-muted-foreground">{selectedPayment.gateway}</span>
                      </div>
                      <div>
                        <span className="font-medium">Referencia:</span>
                        <br />
                        <span className="text-muted-foreground font-mono text-xs">{selectedPayment.reference}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Importe:</span>
                        <span>{selectedPayment.amount.toFixed(2)}€</span>
                      </div>
                      {selectedPayment.fee > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Comisión:</span>
                          <span>-{selectedPayment.fee.toFixed(2)}€</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium text-lg">
                        <span>Neto:</span>
                        <span>{selectedPayment.net.toFixed(2)}€</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {selectedPayment.status === 'completed' && (
                        <Button variant="outline" size="sm" className="w-full">
                          Generar Recibo
                        </Button>
                      )}
                      {selectedPayment.status === 'failed' && (
                        <Button size="sm" className="w-full">
                          Reintentar Pago
                        </Button>
                      )}
                      {selectedPayment.status === 'completed' && (
                        <Button variant="outline" size="sm" className="w-full text-red-600">
                          Reembolsar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg mb-2">Selecciona un pago</h3>
                  <p className="text-muted-foreground">
                    Haz clic en un pago para ver sus detalles
                  </p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              const methodPayments = payments.filter(p => p.method === method.id && p.status === 'completed');
              const methodRevenue = methodPayments.reduce((acc, p) => acc + p.net, 0);
              const methodCount = methodPayments.length;
              
              return (
                <Card key={method.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-6 w-6 text-primary" />
                      <h3 className="font-medium">{method.name}</h3>
                    </div>
                    <Badge className={method.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {method.enabled ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl">{methodRevenue.toFixed(2)}€</p>
                      <p className="text-sm text-muted-foreground">Ingresos totales</p>
                    </div>
                    <div>
                      <p className="text-lg">{methodCount}</p>
                      <p className="text-sm text-muted-foreground">Transacciones</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    Configurar
                  </Button>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg mb-4">Ingresos por Método</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const methodRevenue = payments
                    .filter(p => p.method === method.id && p.status === 'completed')
                    .reduce((acc, p) => acc + p.net, 0);
                  const percentage = totalRevenue > 0 ? (methodRevenue / totalRevenue * 100) : 0;
                  
                  return (
                    <div key={method.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <method.icon className="h-4 w-4" />
                        <span>{method.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{methodRevenue.toFixed(2)}€</p>
                        <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg mb-4">Resumen Mensual</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Procesado:</span>
                  <span className="font-medium">{payments.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Comisiones:</span>
                  <span className="font-medium text-red-600">-{totalFees.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingresos Netos:</span>
                  <span className="font-medium text-green-600">{totalRevenue.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasa de Éxito:</span>
                  <span className="font-medium">{successRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Transacciones:</span>
                  <span className="font-medium">{payments.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentDialog({ onClose }: { onClose: () => void }) {
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState(0);

  const pendingInvoices = [
    { id: 'INV-2024-002', client: 'Carlos Pérez', amount: 66.55 },
    { id: 'INV-2024-003', client: 'Laura Martín', amount: 108.9 },
    { id: 'INV-2024-004', client: 'Miguel Rodríguez', amount: 36.3 }
  ];

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Registrar Pago</DialogTitle>
        <DialogDescription>
          Registra el pago de una factura pendiente
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invoice">Factura</Label>
          <select 
            className="w-full p-2 border rounded-md"
            value={selectedInvoice}
            onChange={(e) => {
              setSelectedInvoice(e.target.value);
              const invoice = pendingInvoices.find(inv => inv.id === e.target.value);
              if (invoice) setAmount(invoice.amount);
            }}
          >
            <option value="">Seleccionar factura</option>
            {pendingInvoices.map(invoice => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.id} - {invoice.client} ({invoice.amount}€)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="method">Método de Pago</Label>
          <select 
            className="w-full p-2 border rounded-md"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="">Seleccionar método</option>
            <option value="card">Tarjeta</option>
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="bizum">Bizum</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Importe</Label>
          <Input 
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Referencia (opcional)</Label>
          <Input id="reference" placeholder="Número de transacción, recibo, etc." />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onClose}>
            Registrar Pago
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}