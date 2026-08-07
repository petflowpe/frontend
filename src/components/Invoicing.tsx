import { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Eye, 
  DollarSign, 
  Calendar, 
  User, 
  AlertCircle, 
  X, 
  Printer, 
  Mail,
  Car,
  Store,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  BarChart3,
  MapPin,
  Trash2
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { getPendingAction, clearPendingAction } from '../utils/navigationBridge';
import { IssueDocumentDialog } from './appointments/IssueDocumentDialog';
import { Alert, AlertDescription } from './ui/alert';
import { useProducts } from '../hooks/useProducts';
import { useInvoices } from '../hooks/useInvoices';
import { useClients } from '../hooks/useClients';
import { useVehicles } from '../hooks/useVehicles';
import { ProductImage } from './ProductImage';

export function Invoicing({ currentUser }: { currentUser?: any }) {
  const { invoices, addInvoice, deleteInvoice, refreshInvoices, downloadInvoice, loading: loadingInvoices } =
    useInvoices();
  const { clients } = useClients();
  const { products: inventoryProducts, services: availableServices, loading: loadingProducts, updateProductStock } = useProducts();
  const { vehicles } = useVehicles();
  
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [invoiceCart, setInvoiceCart] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedPointOfSale, setSelectedPointOfSale] = useState('');
  const [invoiceOrigin, setInvoiceOrigin] = useState<'cita' | 'venta_directa' | 'manual'>('manual');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [formaPagoTipo, setFormaPagoTipo] = useState<'Contado' | 'Credito'>('Contado');
  const [creditDays, setCreditDays] = useState('30');
  const [issueDocOpen, setIssueDocOpen] = useState(false);
  const [issueAppointmentId, setIssueAppointmentId] = useState<string | null>(null);
  const [issueAppointmentLabel, setIssueAppointmentLabel] = useState('');

  const openIssueFromAppointment = (appointmentData: Record<string, unknown>) => {
    const id =
      appointmentData.appointmentId ??
      appointmentData.citaId ??
      appointmentData.id;
    if (!id) {
      toast.error('No se encontró el ID de la cita');
      return;
    }
    const label = [
      appointmentData.clientName ?? appointmentData.client,
      appointmentData.petName ?? appointmentData.pet,
      appointmentData.serviceName ?? appointmentData.service,
    ]
      .filter(Boolean)
      .join(' — ');
    setIssueAppointmentId(String(id));
    setIssueAppointmentLabel(label || `Cita #${id}`);
    setIssueDocOpen(true);
  };

  useEffect(() => {
    const pendingAction = getPendingAction('invoicing');
    if (pendingAction?.action === 'create_from_appointment' && pendingAction.payload) {
      openIssueFromAppointment(pendingAction.payload);
      clearPendingAction();
    }

    const onLegacyEvent = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail) openIssueFromAppointment(detail);
    };
    window.addEventListener('generate-invoice-from-appointment', onLegacyEvent);
    return () => window.removeEventListener('generate-invoice-from-appointment', onLegacyEvent);
  }, []);

  // Puntos de venta (vehículos + tiendas)
  const fixedPoints = [
    { id: 'tienda-1', type: 'tienda', name: 'Tienda Principal', code: 'TND-001', icon: Store },
    { id: 'almacen-1', type: 'almacen', name: 'Almacén Central', code: 'ALM-001', icon: Package },
  ];

  const vehiclePoints = vehicles.map(v => ({
    id: v.id,
    type: 'vehiculo',
    name: v.name,
    code: v.plate || 'SIN-PLACA',
    placa: v.plate,
    conductor: v.driverName,
    icon: Car
  }));

  const pointsOfSale = [...fixedPoints, ...vehiclePoints];

  const availableProducts = inventoryProducts.map(p => ({
    ...p,
    // Adaptador de campos para compatibilidad con el código existente de facturación
    baseUnit: (p as any).unit || 'Unidad',
    area: (p as any).location || 'Tienda Principal',
    // Asegurar que use imagePath del nuevo modelo
    imagePath: (p as any).imagePath || '' 
  }));

  // availableServices ya viene de useProducts, no necesitamos redefinirlo o mapearlo mucho, 
  // pero asegurémonos de que tenga la estructura esperada si algo falta.
  // En useProducts services ya son Product[], compatible.


  const addItemToInvoiceCart = (item: any, type: 'service' | 'product') => {
    const existingItem = invoiceCart.find((cartItem: any) => cartItem.id === item.id && cartItem.type === type);
    
    if (existingItem) {
      setInvoiceCart(invoiceCart.map((cartItem: any) => 
        cartItem.id === item.id && cartItem.type === type
          ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.price }
          : cartItem
      ));
      toast.success(`${item.name} agregado`);
    } else {
      setInvoiceCart([...invoiceCart, { 
        ...item, 
        type,
        quantity: 1, 
        total: item.price 
      }]);
      toast.success(`${item.name} agregado al carrito`);
    }
  };

  const removeItemFromCart = (itemId: number | string, type: string) => {
    setInvoiceCart(invoiceCart.filter((item: any) => !(item.id === itemId && item.type === type)));
    toast.info('Producto eliminado del carrito');
  };

  const updateCartQuantity = (itemId: number | string, type: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromCart(itemId, type);
      return;
    }
    setInvoiceCart(invoiceCart.map((item: any) => 
      item.id === itemId && item.type === type
        ? { ...item, quantity, total: quantity * item.price }
        : item
    ));
  };

  const getCartSubtotal = () => {
    return invoiceCart.reduce((sum: number, item: any) => sum + item.total, 0);
  };

  const getCartTax = (subtotal: number) => {
    return subtotal * 0.18; // 18% IGV
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    return subtotal + getCartTax(subtotal);
  };

  const handleCreateInvoice = async () => {
    if (!selectedClient) {
      toast.error('Debe seleccionar un cliente');
      return;
    }
    
    if (!selectedPointOfSale) {
      toast.error('Debe seleccionar un punto de venta');
      return;
    }

    if (invoiceCart.length === 0) {
      toast.error('Debe agregar al menos un item');
      return;
    }

    const client = clients.find(c => c.id.toString() === selectedClient);
    const pointOfSale = pointsOfSale.find(p => p.id === selectedPointOfSale);
    const pet = selectedPetId ? client?.pets.find(p => p.id.toString() === selectedPetId) : null;

    const newInvoice = {
      id: '',
      documentType: 'factura' as const,
      serie: '',
      numero: '',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cliente: {
        id: client?.id,
        nombre: client?.fullName,
        documento: client?.documentNumber,
        direccion: client?.address
      },
      mascota: pet ? {
        id: pet.id,
        nombre: pet.name,
        raza: pet.breed
      } : null,
      puntoVenta: {
        tipo: pointOfSale?.type,
        id: pointOfSale?.id,
        codigo: pointOfSale?.code,
        nombre: pointOfSale?.name,
        placa: (pointOfSale as any)?.placa || null,
        conductor: (pointOfSale as any)?.conductor || null
      },
      origen: 'venta_directa',
      citaId: null as string | null,
      items: invoiceCart.map(item => ({
        id: item.id, // IMPORTANTE: Enviar ID para control de stock en servidor
        tipo: item.type === 'service' ? 'servicio' : 'producto',
        codigo: item.code,
        descripcion: item.name,
        cantidad: item.quantity,
        precioUnitario: item.price,
        costo: item.cost || 0,
        subtotal: item.total
      })),
      subtotal: getCartSubtotal(),
      descuento: 0,
      igv: getCartTax(getCartSubtotal()),
      total: getCartTotal(),
      formaPago: formaPagoTipo === 'Credito' ? `credito_${creditDays}d` : paymentMethod,
      estado: (formaPagoTipo === 'Credito' ? 'pendiente' : 'pagada') as const,
      notas: [
        invoiceNotes,
        formaPagoTipo === 'Credito'
          ? `Forma pago: Crédito ${creditDays} días`
          : `Forma pago: Contado · ${paymentMethod}`,
      ]
        .filter(Boolean)
        .join(' · '),
    };

    // Guardar factura (El servidor validará y descontará stock automáticamente)
    try {
      const created = await addInvoice(newInvoice);
      await refreshInvoices();

      toast.success('Factura registrada', {
        description: `${created?.numeroCompleto || created?.id || 'Comprobante'} — ${newInvoice.total.toFixed(2)} S/`,
      });

      // Limpiar formulario solo si tuvo éxito
      setInvoiceCart([]);
      setSelectedClient('');
      setSelectedPetId('');
      setSelectedPointOfSale('');
      setInvoiceNotes('');
      setShowNewInvoice(false);

    } catch (error: any) {
      toast.error('Error al facturar', { description: error.message });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pagada': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'vencida': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'anulada': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pagada': return 'Pagada';
      case 'pendiente': return 'Pendiente';
      case 'vencida': return 'Vencida';
      case 'anulada': return 'Anulada';
      default: return status;
    }
  };

  const getPointOfSaleIcon = (type: string) => {
    switch (type) {
      case 'vehiculo': return Car;
      case 'tienda': return Store;
      case 'almacen': return Package;
      default: return Store;
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowInvoicePreview(true);
  };

  const handlePrintInvoice = (invoice: any) => {
    toast.info('Preparando impresión...');
    // Aquí iría la lógica de impresión
  };

  const handleDeleteInvoice = async (invoice: { id: string; documentType?: 'factura' | 'boleta' }) => {
    if (invoice.documentType === 'boleta') {
      toast.info('Gestione boletas en el módulo Facturación SUNAT');
      return;
    }
    if (window.confirm('¿Eliminar esta factura permanentemente?')) {
      await deleteInvoice(invoice.id, invoice.documentType);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.numeroCompleto ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.estado === statusFilter;
    const matchesVehicle = vehicleFilter === 'all' || invoice.puntoVenta.id === vehicleFilter;
    return matchesSearch && matchesStatus && matchesVehicle;
  });

  // Calcular analytics por vehículo
  const getVehicleAnalytics = () => {
    const analytics = pointsOfSale.map(pos => {
      const vehicleInvoices = invoices.filter(inv => inv.puntoVenta.id === pos.id);
      const totalIngresos = vehicleInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalCostos = vehicleInvoices.reduce((sum, inv) => 
        sum + inv.items.reduce((itemSum: number, item: any) => itemSum + (item.costo * item.cantidad), 0), 0
      );
      const utilidad = totalIngresos - totalCostos;
      const margen = totalIngresos > 0 ? (utilidad / totalIngresos * 100) : 0;

      return {
        puntoVenta: pos,
        facturas: vehicleInvoices.length,
        ingresos: totalIngresos,
        costos: totalCostos,
        utilidad: utilidad,
        margen: margen
      };
    });

    return analytics.sort((a, b) => b.ingresos - a.ingresos);
  };

  const selectedClientData = clients.find(c => c.id.toString() === selectedClient);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Emitir desde cita:</strong> use <em>Lista de citas</em> o <em>Cierre de caja → Facturar</em>.
          Ahí se genera boleta o factura SUNAT según el documento del cliente. Este módulo consulta comprobantes y ventas directas.
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Comprobantes emitidos
          </h1>
          <p className="text-muted-foreground text-lg">
            Consulta boletas y facturas. Para citas, emita desde Lista de citas o Cierre de caja.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => refreshInvoices()}>
            Actualizar
          </Button>
          <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                Venta directa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Venta directa (sin cita)</DialogTitle>
                <DialogDescription>
                  Factura manual para mostrador o venta sin cita. Las visitas móviles se facturan con el flujo unificado de citas.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Información Principal */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Cliente */}
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Información del Cliente
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Cliente *</Label>
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.fullName} - {client.documentNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedClientData && selectedClientData.pets.length > 0 && (
                        <div>
                          <Label>Mascota (opcional)</Label>
                          <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar mascota" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedClientData.pets.map((pet) => (
                                <SelectItem key={pet.id} value={pet.id.toString()}>
                                  {pet.name} - {pet.breed}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {selectedClientData && (
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border text-sm">
                          <p className="text-muted-foreground">📧 {selectedClientData.email}</p>
                          <p className="text-muted-foreground">📞 {selectedClientData.phone}</p>
                          <p className="text-muted-foreground">📍 {selectedClientData.address}</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Punto de Venta */}
                  <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-200 dark:border-orange-800">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-orange-600" />
                      Punto de Venta
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Seleccionar Punto de Venta *</Label>
                        <Select value={selectedPointOfSale} onValueChange={setSelectedPointOfSale}>
                          <SelectTrigger>
                            <SelectValue placeholder="¿Desde dónde factura?" />
                          </SelectTrigger>
                          <SelectContent>
                            {pointsOfSale.map((pos) => {
                              const Icon = pos.icon;
                              return (
                                <SelectItem key={pos.id} value={pos.id}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    <span>{pos.name}</span>
                                    {pos.type === 'vehiculo' && (
                                      <span className="text-xs text-muted-foreground">
                                        ({pos.placa})
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedPointOfSale && (
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          {(() => {
                            const pos = pointsOfSale.find(p => p.id === selectedPointOfSale);
                            if (!pos) return null;
                            const Icon = pos.icon;
                            return (
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-5 w-5 text-primary" />
                                  <span className="font-semibold">{pos.name}</span>
                                </div>
                                <p className="text-muted-foreground">Código: {pos.code}</p>
                                {pos.type === 'vehiculo' && (
                                  <>
                                    <p className="text-muted-foreground">Placa: {pos.placa}</p>
                                    <p className="text-muted-foreground">Conductor: {pos.conductor}</p>
                                  </>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      <div>
                        <Label>Contado / Crédito</Label>
                        <Select
                          value={formaPagoTipo}
                          onValueChange={(v) => setFormaPagoTipo(v as 'Contado' | 'Credito')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Contado">Contado</SelectItem>
                            <SelectItem value="Credito">Crédito</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formaPagoTipo === 'Credito' ? (
                        <div>
                          <Label>Días de crédito</Label>
                          <Select value={creditDays} onValueChange={setCreditDays}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7">7 días</SelectItem>
                              <SelectItem value="15">15 días</SelectItem>
                              <SelectItem value="30">30 días</SelectItem>
                              <SelectItem value="45">45 días</SelectItem>
                              <SelectItem value="60">60 días</SelectItem>
                              <SelectItem value="90">90 días</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div>
                          <Label>Medio de pago</Label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="efectivo">Efectivo</SelectItem>
                              <SelectItem value="tarjeta">Tarjeta</SelectItem>
                              <SelectItem value="transferencia">Transferencia</SelectItem>
                              <SelectItem value="yape">Yape</SelectItem>
                              <SelectItem value="plin">Plin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Productos y Servicios */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Productos Disponibles */}
                  <Card className="p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-600" />
                      Productos Disponibles
                    </h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {availableProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="mr-3 h-12 w-12 rounded-md overflow-hidden border bg-background shrink-0">
                            <ProductImage path={product.imagePath} alt={product.name} className="h-full w-full" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand} • {product.baseUnit}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs font-semibold text-green-600">{product.price.toFixed(2)} S/</p>
                              <Badge variant="outline" className="text-xs">Stock: {product.stock}</Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addItemToInvoiceCart(product, 'product')}
                            disabled={product.stock === 0}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Servicios Disponibles */}
                  <Card className="p-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <Printer className="h-5 w-5 text-blue-600" />
                      Servicios Disponibles
                    </h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {availableServices.map((service) => (
                        <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{service.name}</p>
                            <p className="text-xs text-muted-foreground">{service.category}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs font-semibold text-blue-600">{service.price.toFixed(2)} S/</p>
                              <Badge variant="outline" className="text-xs">{service.duration} min</Badge>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addItemToInvoiceCart(service, 'service')}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Carrito de Facturación */}
                {invoiceCart.length > 0 && (
                  <Card className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-2 border-cyan-200 dark:border-cyan-800">
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-cyan-600" />
                      Elementos de la Factura ({invoiceCart.length})
                    </h4>
                    <div className="space-y-3 mb-4">
                      {invoiceCart.map((item: any, index) => (
                        <div key={`${item.type}-${item.id}-${index}`} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          {item.imagePath && (
                            <div className="mr-3 h-10 w-10 rounded-md overflow-hidden border bg-background shrink-0">
                              <ProductImage path={item.imagePath} alt={item.name} className="h-full w-full" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-semibold text-sm">{item.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {item.type === 'product' ? 'Producto' : 'Servicio'}
                              </Badge>
                              {item.code && (
                                <Badge variant="secondary" className="text-xs">{item.code}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.price.toFixed(2)} S/ × {item.quantity} = {item.total.toFixed(2)} S/
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateCartQuantity(item.id, item.type, parseInt(e.target.value) || 0)}
                              className="w-16 h-8 text-sm"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItemFromCart(item.id, item.type)}
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="font-semibold">{getCartSubtotal().toFixed(2)} S/</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>IGV (18%):</span>
                        <span className="font-semibold">{getCartTax(getCartSubtotal()).toFixed(2)} S/</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className="text-primary">{getCartTotal().toFixed(2)} S/</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Notas (opcional)</Label>
                      <Textarea 
                        placeholder="Observaciones adicionales..." 
                        value={invoiceNotes}
                        onChange={(e) => setInvoiceNotes(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </Card>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 border-t pt-4">
                <Button variant="outline" onClick={() => {
                  setShowNewInvoice(false);
                  setInvoiceCart([]);
                  setSelectedClient('');
                  setSelectedPetId('');
                  setSelectedPointOfSale('');
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateInvoice} disabled={invoiceCart.length === 0 || !selectedClient || !selectedPointOfSale}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Factura
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Facturas Hoy</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {invoices.filter(inv => inv.fecha === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
            <FileText className="h-12 w-12 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">Total Facturado</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(0)} S/
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-2 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                {invoices.filter(inv => inv.estado === 'pendiente').length}
              </p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Vehículos Activos</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {pointsOfSale.filter(p => p.type === 'vehiculo').length}
              </p>
            </div>
            <Car className="h-12 w-12 text-purple-500" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices">📄 Facturas</TabsTrigger>
          <TabsTrigger value="analytics">📊 Analytics por Vehículo</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente o número de factura..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por punto de venta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los puntos</SelectItem>
                  {pointsOfSale.map(pos => (
                    <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pagada">Pagadas</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="vencida">Vencidas</SelectItem>
                  <SelectItem value="anulada">Anuladas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Invoices List */}
          <div className="space-y-4">
            {loadingInvoices && (
              <p className="text-sm text-muted-foreground text-center py-8">Cargando comprobantes…</p>
            )}
            {!loadingInvoices && filteredInvoices.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No hay comprobantes con los filtros actuales.</p>
            )}
            {filteredInvoices.map((invoice) => {
              const PosIcon = getPointOfSaleIcon(invoice.puntoVenta.tipo);
              return (
                <Card key={invoice.id} className="p-6 hover:shadow-lg transition-all duration-300 border-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
                          <h3 className="font-bold text-lg">
                            {invoice.numeroCompleto || invoice.id}
                          </h3>
                          <Badge variant={invoice.documentType === 'boleta' ? 'secondary' : 'default'}>
                            {invoice.documentType === 'boleta' ? 'Boleta' : 'Factura'}
                          </Badge>
                          <Badge className={getStatusColor(invoice.estado)}>
                            {getStatusText(invoice.estado)}
                          </Badge>
                          {invoice.estadoSunat && (
                            <Badge variant="outline" className="text-xs">
                              SUNAT: {invoice.estadoSunat}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span className="font-semibold">{invoice.cliente.nombre}</span>
                            {invoice.mascota && (
                              <span className="text-xs">• {invoice.mascota.nombre}</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{invoice.fecha} {invoice.hora}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <PosIcon className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">{invoice.puntoVenta.nombre}</span>
                          {invoice.puntoVenta.placa && (
                            <Badge variant="outline" className="text-xs">{invoice.puntoVenta.placa}</Badge>
                          )}
                          {invoice.puntoVenta.conductor && (
                            <span className="text-xs text-muted-foreground">• {invoice.puntoVenta.conductor}</span>
                          )}
                        </div>

                        <div className="text-sm">
                          <p>
                            {invoice.items.length} elementos • 
                            {invoice.items.filter((item: any) => item.tipo === 'servicio').length} servicios • 
                            {invoice.items.filter((item: any) => item.tipo === 'producto').length} productos
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-primary">{invoice.total.toFixed(2)} S/</p>
                      <p className="text-sm text-muted-foreground capitalize">{invoice.formaPago}</p>
                      <div className="flex space-x-1 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewInvoice(invoice)}
                          title="Ver factura"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadInvoice(invoice.id, 'PDF', invoice.documentType)}
                          title="Descargar PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePrintInvoice(invoice)}
                          title="Imprimir"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          title="Enviar por email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        {['admin', 'super_admin', 'superadmin', 'company_admin'].includes(currentUser?.role ?? '') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteInvoice(invoice)}
                            title="Eliminar factura"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {invoice.notas && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">📝 {invoice.notas}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {getVehicleAnalytics().map((analytics) => {
              const Icon = analytics.puntoVenta.icon;
              return (
                <Card key={analytics.puntoVenta.id} className="p-6 border-2">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{analytics.puntoVenta.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {analytics.puntoVenta.code}
                          {analytics.puntoVenta.type === 'vehiculo' && ` • ${(analytics.puntoVenta as any).placa}`}
                        </p>
                        {analytics.puntoVenta.type === 'vehiculo' && (
                          <p className="text-xs text-muted-foreground">
                            Conductor: {(analytics.puntoVenta as any).conductor}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {analytics.facturas} facturas
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Ingresos</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {analytics.ingresos.toFixed(2)} S/
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Costos</p>
                      <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                        {analytics.costos.toFixed(2)} S/
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Utilidad</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {analytics.utilidad.toFixed(2)} S/
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Margen</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {analytics.margen.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa de Factura</DialogTitle>
            <DialogDescription>
              Visualiza y descarga la factura en formato PDF
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">SmartPet</h2>
                  <p className="text-sm text-muted-foreground">Sistema de Peluquería Móvil</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold">{selectedInvoice.id}</h3>
                  <p className="text-sm text-muted-foreground">Serie: {selectedInvoice.serie}</p>
                  <Badge className={getStatusColor(selectedInvoice.estado)}>
                    {getStatusText(selectedInvoice.estado)}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Cliente */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Cliente</h4>
                  <p className="text-sm">{selectedInvoice.cliente.nombre}</p>
                  <p className="text-sm text-muted-foreground">Doc: {selectedInvoice.cliente.documento}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.cliente.direccion}</p>
                  {selectedInvoice.mascota && (
                    <p className="text-sm text-muted-foreground mt-2">
                      🐕 {selectedInvoice.mascota.nombre} ({selectedInvoice.mascota.raza})
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Punto de Venta</h4>
                  <p className="text-sm">{selectedInvoice.puntoVenta.nombre}</p>
                  <p className="text-sm text-muted-foreground">Código: {selectedInvoice.puntoVenta.codigo}</p>
                  {selectedInvoice.puntoVenta.placa && (
                    <>
                      <p className="text-sm text-muted-foreground">Placa: {selectedInvoice.puntoVenta.placa}</p>
                      <p className="text-sm text-muted-foreground">Conductor: {selectedInvoice.puntoVenta.conductor}</p>
                    </>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    📅 {selectedInvoice.fecha} {selectedInvoice.hora}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3">Detalle</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Código</th>
                      <th className="text-left py-2">Descripción</th>
                      <th className="text-center py-2">Cant.</th>
                      <th className="text-right py-2">P. Unit.</th>
                      <th className="text-right py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">
                          <Badge variant="outline" className="text-xs">{item.codigo}</Badge>
                        </td>
                        <td className="py-2">
                          {item.descripcion}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({item.tipo})
                          </span>
                        </td>
                        <td className="text-center py-2">{item.cantidad}</td>
                        <td className="text-right py-2">{item.precioUnitario.toFixed(2)} S/</td>
                        <td className="text-right py-2 font-semibold">{item.subtotal.toFixed(2)} S/</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator />

              {/* Totales */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{selectedInvoice.subtotal.toFixed(2)} S/</span>
                  </div>
                  {selectedInvoice.descuento > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Descuento:</span>
                      <span>-{selectedInvoice.descuento.toFixed(2)} S/</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>IGV (18%):</span>
                    <span>{selectedInvoice.igv.toFixed(2)} S/</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL:</span>
                    <span className="text-primary">{selectedInvoice.total.toFixed(2)} S/</span>
                  </div>
                  <div className="text-sm text-muted-foreground text-right capitalize">
                    Pago: {selectedInvoice.formaPago}
                  </div>
                </div>
              </div>

              {selectedInvoice.notas && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Notas</h4>
                    <p className="text-sm text-muted-foreground">{selectedInvoice.notas}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowInvoicePreview(false)}>
                  Cerrar
                </Button>
                <Button variant="outline" onClick={() => handlePrintInvoice(selectedInvoice)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button
                  onClick={() =>
                    downloadInvoice(
                      selectedInvoice.id,
                      'PDF',
                      selectedInvoice.documentType ?? 'factura'
                    )
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {issueAppointmentId && (
        <IssueDocumentDialog
          open={issueDocOpen}
          onOpenChange={setIssueDocOpen}
          appointmentId={issueAppointmentId}
          appointmentLabel={issueAppointmentLabel}
          onSuccess={() => {
            refreshInvoices();
            setIssueAppointmentId(null);
          }}
        />
      )}
    </div>
  );
}
