import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  DollarSign,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  BarChart3,
  Boxes,
  RefreshCw,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory, Product } from '../hooks/useInventory';
import { useProductCatalog } from '../hooks/useProductCatalog';
import { useSuppliers } from '../hooks/useSuppliers';
import { useLowStock } from '../hooks/useLowStock';
import { ProductImage } from './ProductImage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export type ProductsModuleTab = 'catalog' | 'stock' | 'alerts';

interface ProductsProps {
  /** Tab inicial (p. ej. al entrar desde el antiguo menú Inventario). */
  initialTab?: ProductsModuleTab;
}

export function Products({ initialTab = 'catalog' }: ProductsProps) {
  const { user } = useAuth();
  const companyId = user?.companyId;
  if (!companyId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          No hay empresa asociada a su usuario. Contacte al administrador.
        </p>
      </div>
    );
  }
  const { categories, brands, areas, loading: catalogLoading } = useProductCatalog(companyId);
  const { suppliers, loading: suppliersLoading } = useSuppliers(companyId);
  const defaultAreaId = areas[0]?.id;
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    getInventoryMetrics,
    refreshInventory,
  } = useInventory(companyId, defaultAreaId);
  const { lowStockProducts: apiLowStock, loading: loadingLowStockApi, refresh: refreshLowStockApi } =
    useLowStock(companyId);
  const metrics = getInventoryMetrics();

  const [activeModuleTab, setActiveModuleTab] = useState<ProductsModuleTab>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    setActiveModuleTab(initialTab);
  }, [initialTab]);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    category: '',
    categoryId: undefined,
    brand: '',
    brandId: undefined,
    supplierId: undefined,
    supplierName: '',
    areaId: undefined,
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    unit: 'NIU',
    location: '',
    imagePath: '',
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        code: '',
        category: '',
        categoryId: categories[0]?.id,
        brand: '',
        brandId: brands[0]?.id,
        supplierId: suppliers[0]?.id,
        supplierName: suppliers[0]?.name || '',
        areaId: areas[0]?.id,
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 5,
        unit: 'NIU',
        location: areas[0]?.name || '',
        imagePath: '',
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name) return;

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await addProduct(formData as Omit<Product, 'id'>);
      }
      setShowProductModal(false);
      await refreshLowStockApi();
    } catch {
      // toast en hook
    }
  };

  const handleAdjustStock = async (id: number, quantity: number, type: 'add' | 'subtract') => {
    await adjustStock(id, quantity, type);
    await refreshLowStockApi();
  };

  const handleRefreshAll = async () => {
    await Promise.all([refreshInventory(), refreshLowStockApi()]);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' ||
      p.category === categoryFilter ||
      String(p.categoryId) === categoryFilter;
    const matchesSupplier =
      supplierFilter === 'all' ||
      String(p.supplierId) === supplierFilter ||
      (supplierFilter === 'none' && !p.supplierId);
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const localLowStock = products.filter((p) => p.minStock > 0 && p.stock <= p.minStock);
  const alertProducts =
    apiLowStock.length > 0
      ? apiLowStock.map((row) => {
          const full = products.find((p) => String(p.id) === String(row.id));
          return {
            id: full?.id ?? Number(row.id),
            name: full?.name ?? row.name,
            code: full?.code ?? row.code,
            stock: full?.stock ?? row.stock,
            minStock: full?.minStock ?? row.minStock,
            unit: full?.unit ?? row.unit,
          };
        })
      : localLowStock;

  const categoryOptions =
    categories.length > 0
      ? categories
      : Array.from(new Set(products.map((p) => p.category).filter(Boolean))).map((name, i) => ({
          id: i,
          name: name as string,
        }));

  const filtersBar = (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o código SKU..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="w-full md:w-[200px]">
        <Select value={supplierFilter} onValueChange={setSupplierFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Proveedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proveedores</SelectItem>
            <SelectItem value="none">Sin proveedor</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-[200px]">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categoryOptions.map((c) => (
              <SelectItem key={String(c.id)} value={c.name}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Productos e inventario
          </h1>
          <p className="text-muted-foreground">
            Catálogo, stock y alertas en un solo módulo
            {(loading || catalogLoading || suppliersLoading) && ' · sincronizando...'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshAll}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 dark:from-emerald-950/30 dark:border-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Valor Venta Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              S/ {metrics.totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Potencial de ingresos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950/30 dark:border-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Costo Inversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              S/ {metrics.totalCost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Capital en mercadería</p>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 dark:from-amber-950/30 dark:border-amber-900 cursor-pointer"
          onClick={() => setActiveModuleTab('alerts')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Alertas Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {Math.max(metrics.lowStockCount, alertProducts.length)}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
              Items por debajo del mínimo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 dark:from-purple-950/30 dark:border-purple-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-400 flex items-center gap-2">
              <Package className="w-4 h-4" /> Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {metrics.totalItems}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">SKUs activos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeModuleTab}
        onValueChange={(v) => setActiveModuleTab(v as ProductsModuleTab)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid">
          <TabsTrigger value="catalog" className="gap-2">
            <Boxes className="h-4 w-4" />
            Catálogo
          </TabsTrigger>
          <TabsTrigger value="stock" className="gap-2">
            <Package className="h-4 w-4" />
            Stock y ajustes
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas ({Math.max(metrics.lowStockCount, alertProducts.length)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-6">
          <Card>
            <CardHeader>
              <p className="text-sm text-muted-foreground mb-3">
                Ficha comercial: precios, proveedor y datos del SKU. Use la pestaña Stock para
                movimientos.
              </p>
              {filtersBar}
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm border-b">
                  <div className="col-span-1">Img</div>
                  <div className="col-span-4">Producto</div>
                  <div className="col-span-2">Precio</div>
                  <div className="col-span-2">Costo</div>
                  <div className="col-span-2">Proveedor</div>
                  <div className="col-span-1 text-right">Acciones</div>
                </div>
                <div className="divide-y max-h-[600px] overflow-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No se encontraron productos con estos filtros.
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors"
                      >
                        <div className="col-span-1">
                          <div className="h-10 w-10 rounded-md overflow-hidden border bg-background">
                            <ProductImage
                              path={product.imagePath}
                              alt={product.name}
                              className="h-full w-full"
                            />
                          </div>
                        </div>
                        <div className="col-span-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-base truncate">{product.name}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              SKU: {product.code}
                            </span>
                            <Badge variant="secondary" className="w-fit mt-1 text-[10px] h-5">
                              {product.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="col-span-2 font-bold">S/ {product.price.toFixed(2)}</div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          S/ {product.cost.toFixed(2)}
                        </div>
                        <div className="col-span-2 text-sm text-muted-foreground">
                          {product.supplierName || 'Sin proveedor'}
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenModal(product)}>
                                <Edit className="mr-2 h-4 w-4" /> Editar ficha
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setActiveModuleTab('stock')}>
                                <Package className="mr-2 h-4 w-4" /> Ir a stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => {
                                  if (confirm('¿Eliminar producto?')) deleteProduct(product.id);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <p className="text-sm text-muted-foreground mb-3">
                Ajustes rápidos de existencias. Cada ±1 se registra en kardex (IN/OUT).
              </p>
              {filtersBar}
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm border-b">
                  <div className="col-span-4">Producto</div>
                  <div className="col-span-2">Ubicación</div>
                  <div className="col-span-3">Stock</div>
                  <div className="col-span-3 text-right">Ajustes</div>
                </div>
                <div className="divide-y max-h-[600px] overflow-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No se encontraron productos con estos filtros.
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const stockPercentage = Math.min(
                        (product.stock / (product.minStock * 3 || 1)) * 100,
                        100
                      );
                      const isLowStock = product.minStock > 0 && product.stock <= product.minStock;
                      return (
                        <div
                          key={product.id}
                          className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors"
                        >
                          <div className="col-span-4">
                            <div className="font-medium truncate">{product.name}</div>
                            <div className="text-xs text-muted-foreground">SKU: {product.code}</div>
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{product.location || '—'}</span>
                          </div>
                          <div className="col-span-3 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className={isLowStock ? 'text-red-600 font-bold' : ''}>
                                {product.stock} {product.unit}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Min: {product.minStock}
                              </span>
                            </div>
                            <Progress
                              value={stockPercentage}
                              className={`h-2 ${isLowStock ? 'bg-red-100' : ''}`}
                              indicatorClassName={isLowStock ? 'bg-red-500' : 'bg-emerald-500'}
                            />
                          </div>
                          <div className="col-span-3 flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjustStock(product.id, 1, 'subtract')}
                            >
                              <ArrowDown className="h-4 w-4 text-red-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdjustStock(product.id, 1, 'add')}
                            >
                              <ArrowUp className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleOpenModal(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Productos con stock crítico
                {loadingLowStockApi && (
                  <span className="text-xs font-normal text-muted-foreground">cargando…</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alertProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                  <p>Todo en orden. No hay productos con stock bajo.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg gap-4 flex-wrap"
                    >
                      <div>
                        <p className="font-bold text-lg">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.code}</p>
                      </div>
                      <div className="flex items-center gap-6 flex-wrap">
                        <div className="text-right">
                          <p className="text-xs text-red-600 font-bold uppercase">Stock actual</p>
                          <p className="text-2xl font-bold text-red-700">{product.stock}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase">Mínimo</p>
                          <p className="text-lg font-medium">{product.minStock}</p>
                        </div>
                        <Button size="sm" onClick={() => handleAdjustStock(product.id, 10, 'add')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Reponer (+10)
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            <DialogDescription>
              Complete la información del producto para el catálogo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Nombre del Producto *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Royal Canin Adultos"
              />
            </div>

            <div className="space-y-2">
              <Label>Código SKU *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ej. AL-ROY-001"
              />
            </div>

            <div className="space-y-2">
              <Label>Marca</Label>
              <Select
                value={formData.brandId ? String(formData.brandId) : ''}
                onValueChange={(val) => {
                  const brand = brands.find((b) => String(b.id) === val);
                  setFormData({ ...formData, brandId: brand?.id, brand: brand?.name || '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar marca..." />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={formData.categoryId ? String(formData.categoryId) : ''}
                onValueChange={(val) => {
                  const cat = categories.find((c) => String(c.id) === val);
                  setFormData({ ...formData, categoryId: cat?.id, category: cat?.name || '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Select
                value={formData.supplierId ? String(formData.supplierId) : 'none'}
                onValueChange={(val) => {
                  if (val === 'none') {
                    setFormData({ ...formData, supplierId: undefined, supplierName: '' });
                    return;
                  }
                  const supplier = suppliers.find((s) => String(s.id) === val);
                  setFormData({
                    ...formData,
                    supplierId: supplier?.id,
                    supplierName: supplier?.name || '',
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin proveedor</SelectItem>
                  {suppliers
                    .filter((s) => s.active)
                    .map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unidad Base</Label>
              <Input
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Ej. Bolsa 15kg"
              />
            </div>

            <div className="space-y-2">
              <Label>Precio Venta (S/) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Costo Adquisición (S/)</Label>
              <Input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock Actual</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock Mínimo (Alerta)</Label>
              <Input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Área / Ubicación de stock</Label>
              <Select
                value={formData.areaId ? String(formData.areaId) : ''}
                onValueChange={(val) => {
                  const area = areas.find((a) => String(a.id) === val);
                  setFormData({ ...formData, areaId: area?.id, location: area?.name || '' });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área..." />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct} className="bg-emerald-600 hover:bg-emerald-700">
              {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
