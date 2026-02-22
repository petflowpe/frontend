import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { usePurchases } from '../hooks/usePurchases';
import { useSuppliers } from '../hooks/useSuppliers';
import { useInventory } from '../hooks/useInventory';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Truck, 
  Package, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Edit2,
  Trash2,
  TrendingUp,
  Users,
  Settings,
  X,
  Save,
  Building2,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Upload,
  CreditCard,
  BarChart3,
  TrendingDown,
  Package2,
  Receipt,
  Layers
} from 'lucide-react';

// Servicio de integración con Kardex
const KardexService = {
  // Registra una entrada de producto en el kardex cuando se recibe una compra
  registerPurchaseEntry: (purchase: any) => {
    const entries = purchase.items.map((item: any) => ({
      id: `KDX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: purchase.deliveryDate,
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      type: 'entrada' as const,
      quantity: item.quantity,
      unitCost: item.unitPrice,
      totalCost: item.total,
      reference: purchase.invoice?.number || purchase.id,
      module: 'compra' as const,
      details: `Compra de ${item.product} - Proveedor: ${purchase.supplier}`,
      user: 'Sistema',
      supplierId: purchase.supplierId,
      supplierName: purchase.supplier
    }));

    // Aquí se guardarían en el estado global o backend
    console.log('📦 Registrando entradas en Kardex:', entries);
    
    // Mostrar notificación
    toast.success(`✅ ${purchase.items.length} productos registrados en Kardex`, {
      description: `Orden ${purchase.id} procesada correctamente`
    });

    return entries;
  },

  // Actualiza el stock de productos
  updateProductStock: (items: any[], operation: 'add' | 'subtract') => {
    items.forEach(item => {
      console.log(`📊 ${operation === 'add' ? 'Incrementando' : 'Decrementando'} stock de ${item.product}: ${item.quantity} unidades`);
      // Aquí se actualizaría el stock en la base de datos
    });
  }
};

export function Purchases() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewPurchase, setShowNewPurchase] = useState(false);
  const [showSupplierConfig, setShowSupplierConfig] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showProductsDialog, setShowProductsDialog] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  const { suppliers, loading: suppliersLoading, reload: reloadSuppliers } = useSuppliers(1);
  const {
    purchases,
    loading: purchasesLoading,
    createPurchase,
    updatePurchase,
    changeStatus,
    completePurchase,
    deletePurchase,
    reload: reloadPurchases,
  } = usePurchases(1);
  const { products: inventoryProducts } = useInventory();

  const suppliersForUI = useMemo(() => suppliers.map(s => ({
    ...s,
    contact: s.phone || s.email,
    enabled: s.active,
    products: [],
  })), [suppliers]);

  const lowStockProductsForUI = useMemo(() => {
    return inventoryProducts
      .filter(p => p.minStock > 0 && p.stock <= p.minStock)
      .map(p => ({
        id: p.id,
        name: p.name,
        currentStock: p.stock,
        minStock: p.minStock,
        unitPrice: p.cost || p.price,
        supplierId: 1,
      }));
  }, [inventoryProducts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-300 dark:border-green-700';
      case 'in-transit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-300 dark:border-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 border-red-300 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregado';
      case 'in-transit': return 'En Tránsito';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle2;
      case 'in-transit': return Truck;
      case 'pending': return Clock;
      case 'cancelled': return AlertTriangle;
      default: return Package;
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cartItems.find((item: any) => item.name === product.name);
    if (existingItem) {
      setCartItems(cartItems.map((item: any) => 
        item.name === product.name 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setCartItems([...cartItems, { 
        ...product, 
        quantity: 1, 
        total: product.unitPrice 
      }]);
    }
  };

  const removeFromCart = (productName: string) => {
    setCartItems(cartItems.filter((item: any) => item.name !== productName));
  };

  const updateCartQuantity = (productName: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productName);
      return;
    }
    setCartItems(cartItems.map((item: any) => 
      item.name === productName 
        ? { ...item, quantity, total: quantity * item.unitPrice }
        : item
    ));
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum: number, item: any) => sum + item.total, 0);
  };

  const handleSavePurchase = async (purchaseData: any) => {
    const items = (purchaseData.items || []).map((item: any) => ({
      product_id: Number(item.product_id || item.id),
      quantity: Number(item.quantity) || 0,
      unit_cost: Number(item.unitPrice ?? item.unit_cost) || 0,
    })).filter((it: any) => it.product_id && it.quantity > 0);
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }
    try {
      if (editingPurchase) {
        await updatePurchase(editingPurchase.id, {
          delivery_date: purchaseData.deliveryDate || purchaseData.delivery_date,
          notes: purchaseData.notes,
          items,
        });
        setEditingPurchase(null);
      } else {
        await createPurchase({
          supplier_id: Number(purchaseData.supplierId),
          order_date: purchaseData.date || new Date().toISOString().split('T')[0],
          delivery_date: purchaseData.deliveryDate || purchaseData.delivery_date,
          notes: purchaseData.notes,
          items,
        });
      }
      setShowNewPurchase(false);
      setCartItems([]);
    } catch (_e) {
      // toast ya lo muestra el hook
    }
  };

  const handleDeletePurchase = async (id: string) => {
    try {
      await deletePurchase(id);
      if (selectedPurchase && String(selectedPurchase.id) === String(id)) {
        setSelectedPurchase(null);
      }
    } catch (_e) {}
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (newStatus === 'delivered') {
      const purchase = purchases.find(p => String(p.id) === String(id));
      if (purchase && !purchase.kardex_registered) {
        setInvoiceData({ purchaseId: id, purchase });
        setShowInvoiceDialog(true);
        return;
      }
    }
    try {
      await changeStatus(id, newStatus as any);
      const updated = purchases.find(p => String(p.id) === String(id));
      if (selectedPurchase && updated && String(selectedPurchase.id) === String(id)) {
        setSelectedPurchase({ ...updated, status: newStatus });
      }
    } catch (_e) {}
  };

  const handleSaveInvoice = async (invoice: any) => {
    const purchaseId = invoiceData?.purchaseId;
    if (!purchaseId) {
      setShowInvoiceDialog(false);
      setInvoiceData(null);
      return;
    }
    try {
      await completePurchase(purchaseId, {
        invoice_number: invoice?.number,
        invoice_date: invoice?.date,
        invoice_total: invoice?.total != null ? Number(invoice.total) : undefined,
      });
      const updated = purchases.find(p => String(p.id) === String(purchaseId));
      if (selectedPurchase && String(selectedPurchase.id) === String(purchaseId) && updated) {
        setSelectedPurchase({ ...updated, status: 'delivered', invoice, kardexRegistered: true });
      }
      reloadPurchases();
    } catch (_e) {}
    setShowInvoiceDialog(false);
    setInvoiceData(null);
  };

  const filteredPurchases = purchases.filter(purchase => {
    const supplierName = typeof purchase.supplier === 'string' ? purchase.supplier : (purchase.supplier as any)?.name || '';
    const matchesSearch = supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(purchase.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeSuppliers = suppliersForUI.filter(s => s.enabled);
  const totalInvested = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalWithInvoices = purchases.filter(p => p.invoice).reduce((sum, p) => sum + (p.invoice?.total || 0), 0);
  const avgOrderValue = purchases.length > 0 ? totalInvested / purchases.length : 0;
  const pendingOrders = purchases.filter(p => p.status === 'pending').length;
  const deliveredOrders = purchases.filter(p => p.status === 'delivered').length;

  // Comparación de precios entre proveedores
  const getProductComparison = () => {
    const productMap = new Map();
    
    suppliersForUI.forEach(supplier => {
      supplier.products.forEach((product: any) => {
        if (!productMap.has(product.name)) {
          productMap.set(product.name, []);
        }
        productMap.get(product.name).push({
          supplier: supplier.name,
          supplierId: supplier.id,
          price: product.price,
          stock: product.stock,
          enabled: supplier.enabled
        });
      });
    });

    const comparison = [];
    for (const [productName, suppliers] of productMap.entries()) {
      if (suppliersForUI.length > 1) {
        const sortedSuppliers = [...suppliersForUI].sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
        const cheapest = sortedSuppliers[0];
        const mostExpensive = sortedSuppliers[sortedSuppliers.length - 1];
        const savings = mostExpensive.price - cheapest.price;
        const savingsPercent = (savings / mostExpensive.price * 100).toFixed(1);
        
        comparison.push({
          product: productName,
          suppliers: sortedSuppliers,
          cheapest,
          mostExpensive,
          savings,
          savingsPercent
        });
      }
    }
    
    return comparison;
  };

  const PurchaseCard = ({ purchase }: { purchase: any }) => {
    const StatusIcon = getStatusIcon(purchase.status);
    
    return (
      <Card className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 border-l-4 ${
        selectedPurchase?.id === purchase.id ? 'border-l-primary ring-2 ring-primary/20 shadow-xl' : 'border-l-blue-200 dark:border-l-blue-800'
      }`} onClick={() => setSelectedPurchase(purchase)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-bold text-lg">{purchase.id}</h3>
              <Badge className={`${getStatusColor(purchase.status)} border`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {getStatusText(purchase.status)}
              </Badge>
              {purchase.invoice && (
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 border border-purple-300">
                  <Receipt className="h-3 w-3 mr-1" />
                  Facturado
                </Badge>
              )}
              {purchase.kardexRegistered && (
                <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200 border border-cyan-300">
                  <Layers className="h-3 w-3 mr-1" />
                  En Kardex
                </Badge>
              )}
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-purple-500" />
                <span>{purchase.supplier}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Pedido: {purchase.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-green-500" />
                <span>Entrega: {purchase.deliveryDate}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{purchase.total.toFixed(2)} S/</p>
              <p className="text-xs text-green-600 dark:text-green-400">{purchase.items.length} productos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground flex-1">
            {purchase.notes && (
              <p className="max-w-md truncate">{purchase.notes}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPurchase(purchase);
              }}
              className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {purchase.status === 'pending' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPurchase(purchase);
                    setCartItems([...purchase.items]);
                    setShowNewPurchase(true);
                  }}
                  className="bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/30"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePurchase(purchase.id);
                  }}
                  className="text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gestión de Compras
          </h1>
          <p className="text-muted-foreground text-lg">
            Administra pedidos a proveedores y abastecimiento de inventario
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>

          {/* Configuración de Proveedores */}
          <Dialog open={showSupplierConfig} onOpenChange={setShowSupplierConfig}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Config. Proveedores
              </Button>
            </DialogTrigger>
            <SupplierConfigDialog
              suppliers={suppliers}
              onSave={setSuppliers}
              onClose={() => setShowSupplierConfig(false)}
            />
          </Dialog>

          <Dialog open={showNewPurchase} onOpenChange={(open) => {
            setShowNewPurchase(open);
            if (!open) {
              setEditingPurchase(null);
              setCartItems([]);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Compra
              </Button>
            </DialogTrigger>
            <PurchaseDialog
              purchase={editingPurchase}
              suppliers={activeSuppliers}
              lowStockProducts={lowStockProductsForUI}
              cartItems={cartItems}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              onUpdateQuantity={updateCartQuantity}
              onSave={handleSavePurchase}
              onClose={() => {
                setShowNewPurchase(false);
                setEditingPurchase(null);
                setCartItems([]);
              }}
            />
          </Dialog>
        </div>
      </div>

      {/* Alert de integración Kardex */}
      <Card className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-2 border-cyan-200 dark:border-cyan-800">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-cyan-900 dark:text-cyan-100">Integración con Kardex</h4>
            <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">
              Al marcar una orden como <strong>"Entregado"</strong> y registrar la factura, los productos se agregan automáticamente al inventario y se registran en el Kardex con trazabilidad completa.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Total Compras</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{purchases.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">Invertido</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {totalInvested.toFixed(0)} S/
              </p>
            </div>
            <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Promedio/Orden</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {avgOrderValue.toFixed(0)} S/
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">Pendientes</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{pendingOrders}</p>
            </div>
            <div className="h-12 w-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/50 dark:to-cyan-900/50 border-2 border-cyan-200 dark:border-cyan-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">En Kardex</p>
              <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">
                {purchases.filter(p => p.kardexRegistered).length}
              </p>
            </div>
            <div className="h-12 w-12 bg-cyan-500 rounded-xl flex items-center justify-center">
              <Layers className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="orders">Órdenes</TabsTrigger>
          <TabsTrigger value="low-stock">Stock Bajo</TabsTrigger>
          <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por proveedor o número de orden..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="in-transit">En Tránsito</SelectItem>
                  <SelectItem value="delivered">Entregados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Purchase Orders List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {purchasesLoading ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Cargando órdenes de compra...</p>
                </Card>
              ) : (
              <>
              {filteredPurchases.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} />
              ))}
              
              {filteredPurchases.length === 0 && (
                <Card className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg mb-2">No se encontraron órdenes</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Crea tu primera orden de compra'
                    }
                  </p>
                </Card>
              )}
              </>
              )}
            </div>

            {/* Purchase Details */}
            <div>
              {selectedPurchase ? (
                <Card className="p-6 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-850 dark:to-blue-950/20 shadow-xl border-2 border-blue-100 dark:border-blue-900">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{selectedPurchase.id}</h3>
                    <Badge className={`${getStatusColor(selectedPurchase.status)} border`}>
                      {getStatusText(selectedPurchase.status)}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                        <span className="text-muted-foreground">Proveedor:</span>
                        <p className="font-semibold text-purple-900 dark:text-purple-200">{selectedPurchase.supplier}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="text-muted-foreground">Fecha Pedido:</span>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">{selectedPurchase.date}</p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="text-muted-foreground">Fecha Entrega:</span>
                        <p className="font-semibold text-green-900 dark:text-green-200">{selectedPurchase.deliveryDate}</p>
                      </div>
                      {selectedPurchase.invoice && (
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Receipt className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold text-purple-900 dark:text-purple-200">Factura: {selectedPurchase.invoice.number}</span>
                          </div>
                          <div className="text-xs space-y-1">
                            <p>Fecha: {selectedPurchase.invoice.date}</p>
                            <p>Subtotal: {(selectedPurchase.invoice.amount ?? selectedPurchase.invoice.total ?? 0).toFixed(2)} S/</p>
                            <p>IGV (18%): {(selectedPurchase.invoice.tax ?? 0).toFixed(2)} S/</p>
                            <p className="font-bold text-purple-900 dark:text-purple-200">Total: {(selectedPurchase.invoice.total ?? 0).toFixed(2)} S/</p>
                          </div>
                        </div>
                      )}
                      {selectedPurchase.kardexRegistered && (
                        <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-lg border-2 border-cyan-300 dark:border-cyan-700">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-cyan-600" />
                            <span className="font-semibold text-cyan-900 dark:text-cyan-200">Registrado en Kardex</span>
                          </div>
                          <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-1">
                            Los productos ya están en el inventario
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Productos</h4>
                      <div className="space-y-2">
                        {selectedPurchase.items.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950/30 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{(item as any).productName || (item as any).name || (typeof (item as any).product === 'string' ? (item as any).product : (item as any).product?.name) || 'Producto'}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} × {((item as any).unitPrice ?? (item as any).unit_cost ?? 0).toFixed(2)} S/
                              </p>
                            </div>
                            <span className="text-sm font-bold text-primary">{((item as any).total ?? (item as any).total_cost ?? 0).toFixed(2)} S/</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-300 dark:border-green-700">
                        <span className="font-bold text-lg">Total:</span>
                        <span className="font-bold text-2xl text-green-700 dark:text-green-300">
                          {selectedPurchase.total.toFixed(2)} S/
                        </span>
                      </div>
                    </div>

                    {selectedPurchase.notes && (
                      <div className="border-t pt-4">
                        <span className="text-muted-foreground text-sm font-semibold">Notas:</span>
                        <p className="text-sm mt-1 p-3 bg-muted/50 rounded">{selectedPurchase.notes}</p>
                      </div>
                    )}

                    {selectedPurchase.status === 'pending' && (
                      <div className="space-y-2">
                        <Label>Cambiar Estado</Label>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateStatus(selectedPurchase.id, 'in-transit')}
                            className="flex-1"
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            En Tránsito
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateStatus(selectedPurchase.id, 'delivered')}
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Entregar
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedPurchase.status === 'in-transit' && (
                      <Button 
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedPurchase.id, 'delivered')}
                        className="w-full"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Marcar como Entregado
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="p-8 text-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
                  <div className="h-20 w-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Selecciona una orden</h3>
                  <p className="text-muted-foreground">
                    Haz clic en una orden para ver los detalles
                  </p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Resto de las tabs siguen igual... por brevedad no las repito todas */}
        <TabsContent value="low-stock" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200">Productos con Stock Bajo</h3>
              <Badge variant="destructive" className="text-sm px-3 py-1">{lowStockProductsForUI.length} productos</Badge>
            </div>
            
            <div className="space-y-4">
              {lowStockProductsForUI.map((product, index) => {
                const supplier = suppliersForUI.find(s => s.id === product.supplierId);
                return (
                  <div key={index} className="flex items-center justify-between p-4 border-2 border-orange-300 dark:border-orange-700 rounded-xl bg-white dark:bg-gray-900 hover:shadow-lg transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-orange-500 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock actual: <span className="text-red-600 font-semibold">{product.currentStock}</span> • Mínimo: {product.minStock}
                        </p>
                        <p className="text-sm text-primary font-semibold">{product.unitPrice.toFixed(2)} S/ • {supplier?.name}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => addToCart(product)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                      <Button size="sm" onClick={() => {
                        addToCart({ ...product, quantity: product.minStock - product.currentStock });
                        setShowNewPurchase(true);
                      }}>
                        Comprar Ahora
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliersForUI.map((supplier) => (
              <Card key={supplier.id} className={`p-6 transition-all ${
                supplier.enabled 
                  ? 'bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20 border-2 border-blue-200 dark:border-blue-800' 
                  : 'bg-gray-100 dark:bg-gray-800 opacity-60'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      supplier.enabled ? 'bg-blue-500' : 'bg-gray-400'
                    }`}>
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold">{supplier.name}</h3>
                      <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                    </div>
                  </div>
                  <Badge className={supplier.enabled 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border border-green-300 dark:border-green-700' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }>
                    {supplier.enabled ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{supplier.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{supplier.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{supplier.bankAccount}</span>
                  </div>
                </div>
                {supplier.enabled && (
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setShowProductsDialog(true);
                      }}
                    >
                      <Package2 className="h-4 w-4 mr-1" />
                      Productos
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setCartItems([]);
                        setEditingPurchase(null);
                        setShowNewPurchase(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Nueva Orden
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-2 border-cyan-200 dark:border-cyan-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
              Comparación de Precios entre Proveedores
            </h3>
            
            <div className="space-y-4">
              {getProductComparison().map((comp, index) => (
                <div key={index} className="p-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-cyan-900 dark:text-cyan-200">{comp.product}</h4>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                      Ahorro: {comp.savingsPercent}% • {comp.savings.toFixed(2)} S/
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {comp.suppliers.map((sup: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg border-2 ${
                          sup.supplierId === comp.cheapest.supplierId
                            ? 'bg-green-50 dark:bg-green-950/30 border-green-500 dark:border-green-700'
                            : sup.supplierId === comp.mostExpensive.supplierId
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-500 dark:border-red-700'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                        } ${!sup.enabled && 'opacity-50'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">{sup.supplier}</span>
                          {sup.supplierId === comp.cheapest.supplierId && (
                            <Badge className="bg-green-600 text-white text-xs">Mejor</Badge>
                          )}
                          {sup.supplierId === comp.mostExpensive.supplierId && (
                            <Badge className="bg-red-600 text-white text-xs">Más caro</Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Precio:</span>
                            <span className="font-bold text-primary">{sup.price.toFixed(2)} S/</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Stock:</span>
                            <span>{sup.stock} und</span>
                          </div>
                          {!sup.enabled && (
                            <p className="text-xs text-red-600 font-semibold">Proveedor inactivo</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {getProductComparison().length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay productos duplicados para comparar</p>
                  <p className="text-sm">Los productos deben estar en al menos 2 proveedores</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Gastos por Proveedor
              </h3>
              <div className="space-y-3">
                {suppliersForUI.filter(s => s.enabled).map((supplier) => {
                  const supplierTotal = purchases
                    .filter(p => p.supplierId === supplier.id)
                    .reduce((sum, p) => sum + p.total, 0);
                  const percentage = totalInvested > 0 ? (supplierTotal / totalInvested * 100) : 0;
                  const orderCount = purchases.filter(p => p.supplierId === supplier.id).length;
                  
                  return (
                    <div key={supplier.id} className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{supplier.name}</span>
                        <span className="text-xs text-muted-foreground">{orderCount} órdenes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold w-24 text-right">{supplierTotal.toFixed(0)} S/</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800">
              <h3 className="text-lg font-bold mb-4">Indicadores Clave</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Tasa de entrega:
                  </span>
                  <span className="font-bold text-green-600">
                    {purchases.length > 0 ? ((deliveredOrders / purchases.length) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    Órdenes pendientes:
                  </span>
                  <span className="font-bold text-orange-600">{pendingOrders}</span>
                </div>
                <div className="flex justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    Promedio por orden:
                  </span>
                  <span className="font-bold text-blue-600">{avgOrderValue.toFixed(2)} S/</span>
                </div>
                <div className="flex justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
                  <span className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-purple-600" />
                    Total facturado:
                  </span>
                  <span className="font-bold text-purple-600">{totalWithInvoices.toFixed(2)} S/</span>
                </div>
                <div className="flex justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
                  <span className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-cyan-600" />
                    En Kardex:
                  </span>
                  <span className="font-bold text-cyan-600">
                    {purchases.filter(p => p.kardexRegistered).length} / {deliveredOrders}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                    Proveedores activos:
                  </span>
                  <span className="font-bold text-indigo-600">{activeSuppliers.length} / {suppliersForUI.length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 border-2 border-orange-200 dark:border-orange-800 col-span-full">
              <h3 className="text-lg font-bold mb-4">Distribución de Estados</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <span className="text-3xl font-bold text-yellow-600">{pendingOrders}</span>
                  </div>
                  <p className="text-sm font-semibold">Pendientes</p>
                  <p className="text-xs text-muted-foreground">
                    {purchases.length > 0 ? ((pendingOrders / purchases.length) * 100).toFixed(0) : 0}% del total
                  </p>
                </div>
                
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="h-8 w-8 text-blue-600" />
                    <span className="text-3xl font-bold text-blue-600">
                      {purchases.filter(p => p.status === 'in-transit').length}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">En Tránsito</p>
                  <p className="text-xs text-muted-foreground">
                    {purchases.length > 0 ? ((purchases.filter(p => p.status === 'in-transit').length / purchases.length) * 100).toFixed(0) : 0}% del total
                  </p>
                </div>
                
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-green-300 dark:border-green-700">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <span className="text-3xl font-bold text-green-600">{deliveredOrders}</span>
                  </div>
                  <p className="text-sm font-semibold">Entregados</p>
                  <p className="text-xs text-muted-foreground">
                    {purchases.length > 0 ? ((deliveredOrders / purchases.length) * 100).toFixed(0) : 0}% del total
                  </p>
                </div>
                
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-red-300 dark:border-red-700">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <span className="text-3xl font-bold text-red-600">
                      {purchases.filter(p => p.status === 'cancelled').length}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">Cancelados</p>
                  <p className="text-xs text-muted-foreground">
                    {purchases.length > 0 ? ((purchases.filter(p => p.status === 'cancelled').length / purchases.length) * 100).toFixed(0) : 0}% del total
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invoice Dialog */}
      {showInvoiceDialog && invoiceData && (
        <InvoiceDialog
          purchase={invoiceData.purchase}
          onSave={handleSaveInvoice}
          onClose={() => {
            setShowInvoiceDialog(false);
            setInvoiceData(null);
          }}
        />
      )}

      {/* Products Dialog */}
      {showProductsDialog && selectedSupplier && (
        <ProductsDialog
          supplier={selectedSupplier}
          suppliers={suppliersForUI}
          onSave={() => reloadSuppliers()}
          onClose={() => {
            setShowProductsDialog(false);
            setSelectedSupplier(null);
          }}
        />
      )}
    </div>
  );
}

// Diálogo de Factura
function InvoiceDialog({ purchase, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    amount: purchase.total,
    tax: purchase.total * 0.18,
    total: purchase.total * 1.18
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Factura y Recibir Productos</DialogTitle>
          <DialogDescription>
            Ingresa los datos de la factura para la orden {purchase.id}. Los productos se agregarán automáticamente al inventario.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Número de Factura *</Label>
            <Input
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              placeholder="Ej: F001-0001234"
              required
            />
          </div>
          
          <div>
            <Label>Fecha de Factura *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">{formData.amount.toFixed(2)} S/</span>
            </div>
            <div className="flex justify-between">
              <span>IGV (18%):</span>
              <span className="font-semibold">{formData.tax.toFixed(2)} S/</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-primary">{formData.total.toFixed(2)} S/</span>
            </div>
          </div>

          <Card className="p-3 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800">
            <div className="flex items-start gap-2">
              <Layers className="h-5 w-5 text-cyan-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-cyan-900 dark:text-cyan-100">Integración con Kardex</p>
                <p className="text-cyan-700 dark:text-cyan-300 text-xs mt-1">
                  Al registrar la factura, los {purchase.items.length} productos se agregarán automáticamente al inventario con entrada en el Kardex.
                </p>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Registrar y Recibir Productos
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Diálogo de Productos del Proveedor
function ProductsDialog({ supplier, suppliers, onSave, onClose }: any) {
  const [products, setProducts] = useState(supplier.products || []);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [importData, setImportData] = useState('');

  const handleSaveProduct = (product: any) => {
    if (editingProduct) {
      setProducts(products.map((p: any) => p.id === editingProduct.id ? { ...product, id: editingProduct.id } : p));
    } else {
      setProducts([...products, { ...product, id: Date.now() }]);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p: any) => p.id !== id));
  };

  const handleImport = () => {
    try {
      const lines = importData.trim().split('\n');
      const imported = lines.map((line, index) => {
        const [name, price, stock] = line.split(',').map(s => s.trim());
        return {
          id: Date.now() + index,
          name,
          price: parseFloat(price) || 0,
          stock: parseInt(stock) || 0
        };
      });
      setProducts([...products, ...imported]);
      setImportData('');
      toast.success(`${imported.length} productos importados correctamente`);
    } catch (error) {
      toast.error('Error al importar. Formato: Nombre,Precio,Stock (uno por línea)');
    }
  };

  const handleSaveAll = () => {
    onSave();
    toast.success('Productos guardados correctamente');
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Productos de {supplier.name}</DialogTitle>
          <DialogDescription>Gestiona el catálogo de productos del proveedor</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Lista de Productos</TabsTrigger>
            <TabsTrigger value="import">Importar Masivo</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <Button onClick={() => { setEditingProduct(null); setShowForm(!showForm); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>

            {showForm && (
              <ProductForm
                product={editingProduct}
                onSave={handleSaveProduct}
                onCancel={() => { setShowForm(false); setEditingProduct(null); }}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map((product: any) => (
                <div key={product.id} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold">{product.name}</h4>
                      <div className="text-sm space-y-1 mt-2">
                        <p className="text-primary font-semibold">{product.price.toFixed(2)} S/</p>
                        <p className="text-muted-foreground">Stock: {product.stock} und</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingProduct(product); setShowForm(true); }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div>
              <Label>Importar Productos (CSV)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Formato: Nombre,Precio,Stock (uno por línea)
              </p>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Royal Canin Adult 15kg,45.99,150&#10;Hill's Science Diet 10kg,52.99,80&#10;Vitaminas MultiVet,29.99,200"
                rows={10}
              />
            </div>
            <Button onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Importar Productos
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSaveAll}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Todos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Formulario de Producto
function ProductForm({ product, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    stock: product?.stock || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border-2 border-green-200 dark:border-green-800 space-y-3">
      <h4 className="font-bold">{product ? 'Editar Producto' : 'Nuevo Producto'}</h4>
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Nombre *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Precio (S/) *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
        <div>
          <Label>Stock *</Label>
          <Input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm">
          <Save className="h-4 w-4 mr-2" />
          {product ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}

// Diálogo de Nueva Compra
function PurchaseDialog({ purchase, suppliers, lowStockProducts, cartItems, onAddToCart, onRemoveFromCart, onUpdateQuantity, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    supplierId: purchase?.supplierId || '',
    supplier: purchase?.supplier || '',
    deliveryDate: purchase?.deliveryDate || '',
    notes: purchase?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error('Agrega al menos un producto al carrito');
      return;
    }

    const supplier = suppliers.find((s: any) => s.id === Number(formData.supplierId));
    const total = cartItems.reduce((sum: number, item: any) => sum + item.total, 0);
    
    onSave({
      ...formData,
      supplier: supplier?.name || formData.supplier,
      items: cartItems,
      total
    });
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum: number, item: any) => sum + item.total, 0);
  };

  const selectedSupplier = suppliers.find((s: any) => s.id === Number(formData.supplierId));

  return (
    <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{purchase ? 'Editar Orden de Compra' : 'Crear Orden de Compra'}</DialogTitle>
        <DialogDescription>
          Selecciona proveedor y productos para crear una nueva orden de compra
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label>Proveedor *</Label>
              <Select 
                value={formData.supplierId.toString()} 
                onValueChange={(value) => setFormData({ ...formData, supplierId: Number(value) })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSupplier && (
                <div className="mt-2 p-3 bg-muted rounded-lg text-sm space-y-1">
                  <p><span className="font-semibold">Contacto:</span> {selectedSupplier.contact}</p>
                  <p><span className="font-semibold">Cuenta:</span> {selectedSupplier.bankAccount}</p>
                </div>
              )}
            </div>
            <div>
              <Label>Fecha de Entrega *</Label>
              <Input 
                type="date" 
                value={formData.deliveryDate}
                onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea 
                placeholder="Instrucciones especiales..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Productos de Stock Bajo
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lowStockProducts.map((product: any, index: number) => {
                const supplier = suppliers.find((s: any) => s.id === product.supplierId);
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Stock: <span className="text-red-600 font-semibold">{product.currentStock}</span> / Mín: {product.minStock}
                      </p>
                      <p className="text-xs text-primary font-semibold">{product.unitPrice.toFixed(2)} S/ • {supplier?.name}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onAddToCart(product)}
                      className="ml-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Carrito de Compras */}
        {cartItems.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrito de Compras ({cartItems.length} productos)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cartItems.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.unitPrice.toFixed(2)} S/ c/u</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.name, parseInt(e.target.value) || 0)}
                      className="w-16 h-8 text-sm"
                    />
                    <span className="text-sm font-bold w-20 text-right text-primary">{item.total.toFixed(2)} S/</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveFromCart(item.name)}
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-2xl text-green-700 dark:text-green-300">{getCartTotal().toFixed(2)} S/</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={cartItems.length === 0 || !formData.supplierId || !formData.deliveryDate}>
            <Save className="h-4 w-4 mr-2" />
            {purchase ? 'Actualizar Orden' : 'Crear Orden'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Diálogo de Configuración de Proveedores
function SupplierConfigDialog({ suppliers, onSave, onClose }: any) {
  const [localSuppliers, setLocalSuppliers] = useState([...suppliers]);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSaveSupplier = (supplierData: any) => {
    if (editingSupplier) {
      setLocalSuppliers(localSuppliers.map(s => s.id === editingSupplier.id ? { ...supplierData, id: editingSupplier.id, products: editingSupplier.products } : s));
      setEditingSupplier(null);
    } else {
      setLocalSuppliers([...localSuppliers, { ...supplierData, id: Date.now(), enabled: true, products: [] }]);
    }
    setShowForm(false);
    toast.success('Proveedor guardado correctamente');
  };

  const handleToggleEnabled = (id: number) => {
    setLocalSuppliers(localSuppliers.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleDelete = (id: number) => {
    setLocalSuppliers(localSuppliers.filter(s => s.id !== id));
    toast.success('Proveedor eliminado');
  };

  const handleSave = () => {
    onSave(localSuppliers);
    toast.success('Configuración guardada correctamente');
    onClose();
  };

  return (
    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Configurar Proveedores</DialogTitle>
        <DialogDescription>Gestiona los proveedores del sistema</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <Button onClick={() => { setEditingSupplier(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proveedor
        </Button>

        {showForm && (
          <SupplierForm
            supplier={editingSupplier}
            onSave={handleSaveSupplier}
            onCancel={() => { setShowForm(false); setEditingSupplier(null); }}
          />
        )}

        <div className="space-y-3">
          {localSuppliers.map((supplier) => (
            <div key={supplier.id} className={`p-4 rounded-lg border-2 transition-all ${
              supplier.enabled 
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800' 
                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    supplier.enabled ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold">{supplier.name}</h4>
                      <Badge className={supplier.enabled 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }>
                        {supplier.enabled ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-1 col-span-2">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{supplier.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{supplier.taxId}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3 text-green-600" />
                        <span className="font-semibold">{supplier.bankAccount}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setEditingSupplier(supplier); setShowForm(true); }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleEnabled(supplier.id)}
                    className={supplier.enabled ? 'text-orange-600' : 'text-green-600'}
                  >
                    {supplier.enabled ? 'Deshabilitar' : 'Habilitar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(supplier.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// Formulario de Proveedor
function SupplierForm({ supplier, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contact: supplier?.contact || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    taxId: supplier?.taxId || '',
    bankAccount: supplier?.bankAccount || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800 space-y-4">
      <h4 className="font-bold">{supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h4>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Contacto *</Label>
          <Input
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Teléfono *</Label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>RUC/Tax ID *</Label>
          <Input
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Cuenta Bancaria *</Label>
          <Input
            value={formData.bankAccount}
            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
            placeholder="Ej: BCP - 194-2345678-0-12"
            required
          />
        </div>
        <div className="col-span-2">
          <Label>Dirección *</Label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {supplier ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
