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
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Building2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useInventory, Product } from '../hooks/useInventory';
import { useLowStock } from '../hooks/useLowStock';
import { useCompanies } from '../hooks/useCompanies';
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
  DialogTrigger 
} from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Progress } from './ui/progress';

export function Inventory() {
  const { companies, loading: loadingCompanies } = useCompanies();
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    if (companies.length > 0 && companyId === null) setCompanyId(companies[0].id);
  }, [companies, companyId]);

  const { products, loading, addProduct, updateProduct, deleteProduct, adjustStock, getInventoryMetrics, refreshInventory } = useInventory(companyId);
  const { lowStockProducts, loading: loadingLowStock, refresh: refreshLowStock } = useLowStock(companyId);
  const metrics = getInventoryMetrics();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    code: '',
    category: '',
    brand: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 5,
    unit: 'Unidad',
    location: ''
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
        brand: '',
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 5,
        unit: 'Unidad',
        location: ''
      });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price || !formData.code) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData as Omit<Product, 'id'>);
    }
    setShowProductModal(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            📦 Gestión de Inventario
          </h1>
          <p className="text-muted-foreground">
            Controla stock, precios y catálogo de productos
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filtro por empresa */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1 min-w-[200px]">
            <Label className="flex items-center gap-1"><Building2 className="w-4 h-4" /> Empresa</Label>
            <Select
              value={companyId?.toString() ?? ''}
              onValueChange={(v) => setCompanyId(v ? parseInt(v, 10) : null)}
              disabled={loadingCompanies || companies.length === 0}
            >
              <SelectTrigger><SelectValue placeholder={companies.length === 0 ? 'No hay empresas' : 'Seleccione empresa'} /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.razon_social} {c.ruc ? `(${c.ruc})` : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={() => { refreshInventory(); refreshLowStock(); }} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </Card>

      {/* Productos con stock bajo */}
      {companyId != null && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              Productos con stock bajo
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Productos que están en o por debajo del mínimo configurado (desde API)
            </p>
          </CardHeader>
          <CardContent>
            {loadingLowStock ? (
              <div className="flex items-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Cargando...
              </div>
            ) : lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No hay productos con stock bajo.</p>
            ) : (
              <div className="rounded-md border bg-white overflow-hidden">
                <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 font-medium text-sm border-b">
                  <div className="col-span-4">Producto</div>
                  <div className="col-span-2 text-center">Stock</div>
                  <div className="col-span-2 text-center">Mínimo</div>
                  <div className="col-span-2 text-right">Precio</div>
                  <div className="col-span-2 text-right">Acciones</div>
                </div>
                {lowStockProducts.map((p) => {
                  const fullProduct = products.find((x) => x.id === p.id);
                  return (
                    <div key={p.id} className="grid grid-cols-12 gap-2 p-3 items-center border-b last:border-b-0 hover:bg-muted/30">
                      <div className="col-span-4">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground block">SKU: {p.code}</span>
                      </div>
                      <div className="col-span-2 text-center font-semibold text-amber-700">{p.stock}</div>
                      <div className="col-span-2 text-center">{p.minStock}</div>
                      <div className="col-span-2 text-right">S/ {p.price.toFixed(2)}</div>
                      <div className="col-span-2 text-right flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => { adjustStock(p.id, 1, 'add'); setTimeout(() => refreshLowStock(), 800); }}>+1</Button>
                        {fullProduct && (
                          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(fullProduct)}>Editar</Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Valor del Inventario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              S/ {metrics.totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              Costo Total: S/ {metrics.totalCost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Alertas de Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {metrics.lowStockCount}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Productos con stock bajo mínimo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Package className="w-4 h-4" /> Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {metrics.totalItems}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              SKUs registrados activamente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Tabla */}
      <Card>
        <CardHeader>
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Cargando productos...
            </div>
          )}
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm border-b">
              <div className="col-span-4">Producto</div>
              <div className="col-span-2">Precio</div>
              <div className="col-span-3">Stock</div>
              <div className="col-span-2">Ubicación</div>
              <div className="col-span-1 text-right">Acciones</div>
            </div>
            <div className="divide-y">
              {!loading && filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {companyId == null ? 'Seleccione una empresa.' : 'No se encontraron productos con estos filtros.'}
                </div>
              ) : !loading ? (
                filteredProducts.map((product) => {
                  const stockPercentage = Math.min((product.stock / (product.minStock * 3)) * 100, 100);
                  const isLowStock = product.stock <= product.minStock;

                  return (
                    <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors">
                      <div className="col-span-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-base">{product.name}</span>
                          <span className="text-xs text-muted-foreground">SKU: {product.code} • {product.brand}</span>
                          <Badge variant="secondary" className="w-fit mt-1 text-[10px] h-5">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="font-bold">S/ {product.price.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">Costo: S/ {product.cost.toFixed(2)}</div>
                      </div>

                      <div className="col-span-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={`${isLowStock ? 'text-red-600 font-bold' : ''}`}>
                            {product.stock} {product.unit}s
                          </span>
                          <span className="text-xs text-muted-foreground">Min: {product.minStock}</span>
                        </div>
                        <Progress value={stockPercentage} className={`h-2 ${isLowStock ? 'bg-red-100' : ''}`} indicatorClassName={isLowStock ? 'bg-red-500' : 'bg-emerald-500'} />
                      </div>

                      <div className="col-span-2 text-sm text-muted-foreground">
                        {product.location || 'Sin asignar'}
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
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => adjustStock(product.id, 1, 'add')}>
                              <ArrowUp className="mr-2 h-4 w-4 text-green-600" /> Agregar Stock (+1)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => adjustStock(product.id, 1, 'subtract')}>
                              <ArrowDown className="mr-2 h-4 w-4 text-red-600" /> Reducir Stock (-1)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => {
                                if(confirm('¿Eliminar producto?')) deleteProduct(product.id)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Crear/Editar */}
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
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Royal Canin Adultos"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Código SKU *</Label>
              <Input 
                value={formData.code} 
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="Ej. AL-ROY-001"
              />
            </div>

            <div className="space-y-2">
              <Label>Marca</Label>
              <Input 
                value={formData.brand} 
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="Ej. Royal Canin"
              />
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData({...formData, category: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alimento">Alimento</SelectItem>
                  <SelectItem value="Accesorios">Accesorios</SelectItem>
                  <SelectItem value="Cuidado">Cuidado</SelectItem>
                  <SelectItem value="Farmacia">Farmacia</SelectItem>
                  <SelectItem value="Juguetes">Juguetes</SelectItem>
                  <SelectItem value="Suplementos">Suplementos</SelectItem>
                  <SelectItem value="Ropa">Ropa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Unidad Base</Label>
              <Input 
                value={formData.unit} 
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                placeholder="Ej. Bolsa 15kg"
              />
            </div>

            <div className="space-y-2">
              <Label>Precio Venta (S/) *</Label>
              <Input 
                type="number"
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label>Costo Adquisición (S/)</Label>
              <Input 
                type="number"
                value={formData.cost} 
                onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock Actual</Label>
              <Input 
                type="number"
                value={formData.stock} 
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label>Stock Mínimo (Alerta)</Label>
              <Input 
                type="number"
                value={formData.minStock} 
                onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Ubicación en Almacén</Label>
              <Input 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Ej. Pasillo 3, Estante B"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductModal(false)}>Cancelar</Button>
            <Button onClick={handleSaveProduct} className="bg-emerald-600 hover:bg-emerald-700">
              {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
