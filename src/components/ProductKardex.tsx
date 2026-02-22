import { useState, useMemo } from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Download,
  Filter,
  Search,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  BarChart3,
  Layers,
  ShoppingCart,
  Users,
  Shield,
  Truck,
  RefreshCw,
  Eye,
  Loader2
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { useInventory, Product as InventoryProduct } from '../hooks/useInventory';
import { useKardex, KardexEntry as ApiKardexEntry } from '../hooks/useKardex';

interface KardexEntry {
  id: string;
  date: string;
  time: string;
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  unitCost: number;
  totalCost: number;
  balance: number;
  balanceValue: number;
  reference: string;
  module: 'compra' | 'venta' | 'servicio' | 'ajuste' | 'inicial' | 'devolucion';
  details: string;
  user: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitCost: number;
  salePrice: number;
  stockValue: number;
}

function mapApiEntryToUi(e: ApiKardexEntry): KardexEntry {
  const d = e.movement_date ? new Date(e.movement_date) : new Date();
  const typeMap = { IN: 'entrada' as const, OUT: 'salida' as const, ADJUST: 'ajuste' as const };
  const type = typeMap[e.type] || 'ajuste';
  const moduleMap: Record<string, KardexEntry['module']> = {
    PURCHASE: 'compra', SALE: 'venta', ADJUST: 'ajuste', ADJUSTMENT: 'ajuste',
    INITIAL: 'inicial', SERVICE: 'servicio', RETURN: 'devolucion',
  };
  const module = (e.source_type && moduleMap[e.source_type.toUpperCase()]) || 'ajuste';
  return {
    id: String(e.id),
    date: d.toISOString().split('T')[0],
    time: d.toTimeString().slice(0, 5),
    type,
    quantity: Number(e.quantity),
    unitCost: Number(e.unit_cost),
    totalCost: Number(e.total_cost),
    balance: Number(e.balance),
    balanceValue: Number(e.balance_value),
    reference: e.source_id ? String(e.source_id) : (e.source_type || '-'),
    module,
    details: e.notes || '-',
    user: e.created_by || 'Sistema',
  };
}

export function ProductKardex() {
  const { products: inventoryProducts, loading: loadingProducts, refreshInventory } = useInventory();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  });

  const { data: kardexData, loading: loadingKardex, refresh: refreshKardex } = useKardex(
    selectedProduct?.id ?? null,
    { date_from: dateRange.start, date_to: dateRange.end }
  );

  const kardexEntriesUi = useMemo(() => {
    if (!kardexData?.entries) return [];
    return kardexData.entries.map(mapApiEntryToUi);
  }, [kardexData]);

  const products: Product[] = useMemo(() => inventoryProducts.map((p: InventoryProduct) => ({
    id: p.id,
    name: p.name,
    sku: p.code,
    category: p.category || '',
    currentStock: p.stock,
    minStock: p.minStock ?? 0,
    maxStock: Math.max(p.stock * 2, (p.minStock ?? 0) * 3, 1),
    unitCost: p.cost,
    salePrice: p.price,
    stockValue: p.cost * p.stock,
  })), [inventoryProducts]);

  const kardexEntries: Record<string, KardexEntry[]> = useMemo(() => {
    if (!selectedProduct || !kardexEntriesUi.length) return {};
    return { [selectedProduct.id]: kardexEntriesUi };
  }, [selectedProduct?.id, kardexEntriesUi]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [products, searchTerm]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entrada': return <ArrowDownCircle className="h-4 w-4 text-green-600" />;
      case 'salida': return <ArrowUpCircle className="h-4 w-4 text-red-600" />;
      case 'ajuste': return <RefreshCw className="h-4 w-4 text-orange-600" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'compra': return <ShoppingCart className="h-4 w-4" />;
      case 'venta': return <Users className="h-4 w-4" />;
      case 'servicio': return <Shield className="h-4 w-4" />;
      case 'inicial': return <Layers className="h-4 w-4" />;
      case 'devolucion': return <RefreshCw className="h-4 w-4" />;
      case 'ajuste': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getModuleName = (module: string) => {
    switch (module) {
      case 'compra': return 'Compra';
      case 'venta': return 'Venta';
      case 'servicio': return 'Servicio';
      case 'inicial': return 'Inicial';
      case 'devolucion': return 'Devolución';
      case 'ajuste': return 'Ajuste';
      default: return module;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'entrada': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'salida': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ajuste': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return '';
    }
  };

  const getStockStatus = (product: Product) => {
    const percentage = (product.currentStock / product.maxStock) * 100;
    if (product.currentStock <= product.minStock) {
      return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900' };
    } else if (percentage <= 30) {
      return { status: 'low', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900' };
    } else if (percentage >= 90) {
      return { status: 'high', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900' };
    }
    return { status: 'normal', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900' };
  };

  const handleExportKardex = (product: Product) => {
    toast.success(`Exportando Kardex de ${product.name}...`);
    // Aquí iría la lógica para exportar a Excel/PDF
  };

  const calculateMovementStats = (entries: KardexEntry[]) => {
    const stats = {
      totalEntradas: 0,
      totalSalidas: 0,
      totalAjustes: 0,
      valorEntradas: 0,
      valorSalidas: 0,
      movimientos: entries.length
    };

    entries.forEach(entry => {
      if (entry.type === 'entrada') {
        stats.totalEntradas += entry.quantity;
        stats.valorEntradas += entry.totalCost;
      } else if (entry.type === 'salida') {
        stats.totalSalidas += entry.quantity;
        stats.valorSalidas += entry.totalCost;
      } else {
        stats.totalAjustes += Math.abs(entry.quantity);
      }
    });

    return stats;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Layers className="h-6 w-6 text-white" />
            </div>
            Kardex de Productos
          </h1>
          <p className="text-muted-foreground mt-1">
            Control completo de movimientos de inventario
          </p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
          <Download className="mr-2 h-4 w-4" />
          Exportar Todo
        </Button>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Productos</p>
              <p className="text-2xl mt-1">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total Stock</p>
              <p className="text-2xl mt-1">{formatCurrency(products.reduce((sum, p) => sum + p.stockValue, 0))}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Stock Crítico</p>
              <p className="text-2xl mt-1 text-red-600">
                {products.filter(p => p.currentStock <= p.minStock).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Movimientos Hoy</p>
              <p className="text-2xl mt-1">24</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Buscar producto por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de movimiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="salida">Salidas</SelectItem>
              <SelectItem value="ajuste">Ajustes</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="compra">Compras</SelectItem>
              <SelectItem value="venta">Ventas</SelectItem>
              <SelectItem value="servicio">Servicios</SelectItem>
              <SelectItem value="ajuste">Ajustes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de Productos con Kardex */}
      {loadingProducts && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        {!loadingProducts && filteredProducts.map(product => {
          const stockStatus = getStockStatus(product);
          const entries = kardexEntries[product.id] || [];
          const stats = calculateMovementStats(entries);
          const stockPercentage = (product.currentStock / product.maxStock) * 100;

          return (
            <Card key={product.id} className="p-5">
              {/* Header del Producto */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <Package className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3>{product.name}</h3>
                      <Badge variant="outline">{product.sku}</Badge>
                      <Badge className={stockStatus.bgColor + ' ' + stockStatus.color}>
                        Stock: {product.currentStock}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.category} • Costo: {formatCurrency(product.unitCost)} • 
                      Precio: {formatCurrency(product.salePrice)} • 
                      Valor en stock: {formatCurrency(product.stockValue)}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-md">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Mín: {product.minStock}</span>
                          <span>Máx: {product.maxStock}</span>
                        </div>
                        <Progress value={stockPercentage} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowDetails(true);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Kardex
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExportKardex(product)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Alertas de Stock */}
              {product.currentStock <= product.minStock && (
                <Alert className="mb-4 bg-red-50 dark:bg-red-950/20 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <strong>Stock Crítico:</strong> El inventario está por debajo del mínimo. Se requiere reposición urgente.
                  </AlertDescription>
                </Alert>
              )}

              {/* Resumen de Movimientos */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                <Card className="p-3 bg-muted/50">
                  <p className="text-xs text-muted-foreground">Movimientos</p>
                  <p className="text-lg mt-1">{stats.movimientos}</p>
                </Card>
                <Card className="p-3 bg-green-50 dark:bg-green-950/20">
                  <p className="text-xs text-muted-foreground">Entradas</p>
                  <p className="text-lg mt-1 text-green-600">+{stats.totalEntradas}</p>
                </Card>
                <Card className="p-3 bg-red-50 dark:bg-red-950/20">
                  <p className="text-xs text-muted-foreground">Salidas</p>
                  <p className="text-lg mt-1 text-red-600">-{stats.totalSalidas}</p>
                </Card>
                <Card className="p-3 bg-orange-50 dark:bg-orange-950/20">
                  <p className="text-xs text-muted-foreground">Ajustes</p>
                  <p className="text-lg mt-1 text-orange-600">{stats.totalAjustes}</p>
                </Card>
                <Card className="p-3 bg-blue-50 dark:bg-blue-950/20">
                  <p className="text-xs text-muted-foreground">Margen Prom.</p>
                  <p className="text-lg mt-1 text-blue-600">
                    {((product.salePrice - product.unitCost) / product.salePrice * 100).toFixed(1)}%
                  </p>
                </Card>
              </div>

              {/* Últimos Movimientos (solo al abrir Ver Kardex se cargan desde API) */}
              <div>
                <h4 className="text-sm font-medium mb-3">Últimos Movimientos</h4>
                <div className="space-y-2">
                  {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">Clic en &quot;Ver Kardex&quot; para cargar movimientos desde el servidor.</p>
                  ) : entries.slice(0, 3).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(entry.type)}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeBadge(entry.type)}>
                              {entry.type.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getModuleIcon(entry.module)}
                              {getModuleName(entry.module)}
                            </Badge>
                          </div>
                          <p className="text-sm mt-1">{entry.details}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(entry.date)} {entry.time} • {entry.user} • Ref: {entry.reference}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${entry.type === 'entrada' ? 'text-green-600' : entry.type === 'salida' ? 'text-red-600' : 'text-orange-600'}`}>
                          {entry.type === 'entrada' ? '+' : entry.type === 'salida' ? '-' : ''}{entry.quantity} und.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Saldo: {entry.balance}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {!loadingProducts && filteredProducts.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          No hay productos. Agregue productos desde <strong>Inventario</strong> o <strong>Productos</strong>.
        </Card>
      )}

      {/* Dialog: Detalle Completo del Kardex */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Kardex Completo - {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6">
              {loadingKardex && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {/* Información del Producto */}
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">SKU</p>
                    <p className="font-medium">{selectedProduct.sku}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Categoría</p>
                    <p className="font-medium">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Stock Actual</p>
                    <p className="font-medium">{kardexData?.current_stock ?? selectedProduct.currentStock} unidades</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor en Stock</p>
                    <p className="font-medium text-green-600">{formatCurrency(kardexData?.current_value ?? selectedProduct.stockValue)}</p>
                  </div>
                </div>
              </Card>

              {/* Filtros de Fecha */}
              <div className="flex gap-3">
                <div>
                  <Label>Desde</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Hasta</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={() => refreshKardex()} disabled={loadingKardex}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loadingKardex ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                </div>
                <div className="flex items-end ml-auto">
                  <Button onClick={() => handleExportKardex(selectedProduct)}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>

              {/* Tabla de Kardex */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left text-sm font-medium">Fecha/Hora</th>
                      <th className="p-3 text-left text-sm font-medium">Tipo</th>
                      <th className="p-3 text-left text-sm font-medium">Módulo</th>
                      <th className="p-3 text-right text-sm font-medium">Entrada</th>
                      <th className="p-3 text-right text-sm font-medium">Salida</th>
                      <th className="p-3 text-right text-sm font-medium">Saldo</th>
                      <th className="p-3 text-right text-sm font-medium">Costo Unit.</th>
                      <th className="p-3 text-right text-sm font-medium">Valor Saldo</th>
                      <th className="p-3 text-left text-sm font-medium">Referencia</th>
                      <th className="p-3 text-left text-sm font-medium">Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(kardexEntries[selectedProduct.id] ?? []).map((entry, idx) => (
                      <tr key={entry.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                        <td className="p-3 text-sm">
                          <div>
                            <p>{formatDate(entry.date)}</p>
                            <p className="text-xs text-muted-foreground">{entry.time}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getTypeBadge(entry.type)}>
                            {entry.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            {getModuleIcon(entry.module)}
                            {getModuleName(entry.module)}
                          </Badge>
                        </td>
                        <td className="p-3 text-right text-sm">
                          {entry.type === 'entrada' && (
                            <span className="text-green-600 font-medium">+{entry.quantity}</span>
                          )}
                        </td>
                        <td className="p-3 text-right text-sm">
                          {entry.type === 'salida' && (
                            <span className="text-red-600 font-medium">-{entry.quantity}</span>
                          )}
                          {entry.type === 'ajuste' && (
                            <span className="text-orange-600 font-medium">{entry.quantity}</span>
                          )}
                        </td>
                        <td className="p-3 text-right text-sm font-medium">{entry.balance}</td>
                        <td className="p-3 text-right text-sm">{formatCurrency(entry.unitCost)}</td>
                        <td className="p-3 text-right text-sm font-medium">{formatCurrency(entry.balanceValue)}</td>
                        <td className="p-3 text-sm">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{entry.reference}</code>
                        </td>
                        <td className="p-3 text-sm">
                          <div>
                            <p>{entry.details}</p>
                            <p className="text-xs text-muted-foreground">Por: {entry.user}</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resumen Final */}
              <Card className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <h4 className="mb-3">Resumen del Período</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-purple-100">Total Entradas</p>
                    <p className="text-xl mt-1">
                      {(kardexEntries[selectedProduct.id] || [])
                        .filter(e => e.type === 'entrada')
                        .reduce((sum, e) => sum + e.quantity, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-100">Total Salidas</p>
                    <p className="text-xl mt-1">
                      {(kardexEntries[selectedProduct.id] || [])
                        .filter(e => e.type === 'salida')
                        .reduce((sum, e) => sum + e.quantity, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-100">Valor Total Movido</p>
                    <p className="text-xl mt-1">
                      {formatCurrency(
                        (kardexEntries[selectedProduct.id] || [])
                          .reduce((sum, e) => sum + Math.abs(e.totalCost), 0)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-100">Saldo Actual</p>
                    <p className="text-xl mt-1">{kardexData?.current_stock ?? selectedProduct.currentStock} unidades</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
