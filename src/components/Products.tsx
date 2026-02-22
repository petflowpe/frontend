import { useState } from 'react';
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
  MapPin,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInventory, Product } from '../hooks/useInventory';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function Products() {
  const { user } = useAuth();
  const companyId = user?.companyId ?? 1;
  const { products, addProduct, updateProduct, deleteProduct, adjustStock, getInventoryMetrics, uploadProductImage } = useInventory(companyId);
  const metrics = getInventoryMetrics();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    location: '',
    imagePath: ''
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
        location: '',
        imagePath: ''
      });
    }
    setShowProductModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const path = await uploadProductImage(file);
    setIsUploading(false);
    
    if (path) {
      setFormData(prev => ({ ...prev, imagePath: path }));
    }
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.code) return;

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

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
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

      {/* KPI Cards */}
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
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
              Potencial de ingresos
            </p>
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
            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
              Capital en mercadería
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 dark:from-amber-950/30 dark:border-amber-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Alertas Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {metrics.lowStockCount}
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
            <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
              SKUs activos
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Listado General</TabsTrigger>
          <TabsTrigger value="low_stock">Stock Bajo ({metrics.lowStockCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
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
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium text-sm border-b">
                  <div className="col-span-1">Img</div>
                  <div className="col-span-3">Producto</div>
                  <div className="col-span-2">Precio</div>
                  <div className="col-span-3">Stock</div>
                  <div className="col-span-2">Ubicación</div>
                  <div className="col-span-1 text-right">Acciones</div>
                </div>
                <div className="divide-y max-h-[600px] overflow-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No se encontraron productos con estos filtros.
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const stockPercentage = Math.min((product.stock / (product.minStock * 3)) * 100, 100);
                      const isLowStock = product.stock <= product.minStock;

                      return (
                        <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors">
                          <div className="col-span-1">
                            <div className="h-10 w-10 rounded-md overflow-hidden border bg-background">
                              <ProductImage path={product.imagePath} alt={product.name} className="h-full w-full" />
                            </div>
                          </div>
                          <div className="col-span-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-base truncate">{product.name}</span>
                              <span className="text-xs text-muted-foreground truncate">SKU: {product.code}</span>
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

                          <div className="col-span-2 text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
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
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low_stock">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Productos con Stock Crítico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                  <p>¡Todo en orden! No hay productos con stock bajo.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <p className="font-bold text-lg">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.code}</p>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-right">
                           <p className="text-xs text-red-600 font-bold uppercase">Stock Actual</p>
                           <p className="text-2xl font-bold text-red-700">{product.stock}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-xs text-muted-foreground uppercase">Mínimo Req.</p>
                           <p className="text-lg font-medium">{product.minStock}</p>
                         </div>
                         <Button size="sm" onClick={() => adjustStock(product.id, 10, 'add')}>
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
            <div className="col-span-2 flex items-center gap-4 border p-4 rounded-lg bg-muted/20">
              <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-background overflow-hidden relative">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                ) : (
                  <ProductImage path={formData.imagePath} alt="Preview" className="h-full w-full" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Label>Imagen del Producto</Label>
                <div className="flex gap-2">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="text-xs"
                  />
                  {formData.imagePath && (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      onClick={() => setFormData({...formData, imagePath: ''})}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Formatos: JPG, PNG, WEBP. Máx 5MB.</p>
              </div>
            </div>

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
              <Label>Ubicación / Punto de Venta</Label>
              <Select 
                value={formData.location} 
                onValueChange={(val) => setFormData({...formData, location: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ubicación..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tienda Principal">Tienda Principal</SelectItem>
                  <SelectItem value="Almacén Central">Almacén Central</SelectItem>
                  <SelectItem value="Móvil 1">Móvil 1 (Vehículo)</SelectItem>
                  <SelectItem value="Móvil 2">Móvil 2 (Vehículo)</SelectItem>
                  <SelectItem value="Móvil 3">Móvil 3 (Vehículo)</SelectItem>
                </SelectContent>
              </Select>
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
