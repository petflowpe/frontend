import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Boxes,
  CheckCircle2,
  DollarSign,
  Edit,
  Filter,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useInventory, Product } from '../hooks/useInventory';
import { useProductCatalog } from '../hooks/useProductCatalog';
import { useSuppliers } from '../hooks/useSuppliers';
import { useLowStock } from '../hooks/useLowStock';
import {
  toInventoryPayload,
  toProviderOptions,
  toUiProducts,
} from '../mappers/productMapper';
import type { UiProduct } from '../types/product';
import { resolveStaffCompanyId } from '../utils/appointmentMappers';
import { buildProductCatalog } from '../utils/productCatalog';
import { ProductKpiRow, ProductModule } from './products/ProductModule';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export type ProductsModuleTab = 'catalog' | 'stock' | 'alerts';

interface ProductsProps {
  /** Tab inicial (p. ej. al entrar desde el antiguo menú Inventario). */
  initialTab?: ProductsModuleTab;
}

export function Products({ initialTab = 'catalog' }: ProductsProps) {
  const { user } = useAuth();
  const companyId = resolveStaffCompanyId(user);

  return <ProductsModule companyId={companyId} initialTab={initialTab} />;
}

interface ProductsModuleShellProps {
  companyId: number;
  initialTab: ProductsModuleTab;
}

function ProductsModule({ companyId, initialTab }: ProductsModuleShellProps) {
  const { user } = useAuth();
  const currentUserName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.email || 'Sistema';

  const { categories, brands, areas, units, loading: catalogLoading } = useProductCatalog(companyId);
  const { suppliers, loading: suppliersLoading } = useSuppliers(companyId);
  const defaultAreaId = areas[0]?.id;
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    setProductActive,
    adjustStock,
    getInventoryMetrics,
    refreshInventory,
    uploadProductImage,
    deleteProductImage,
  } = useInventory(companyId, defaultAreaId);
  const {
    lowStockProducts: apiLowStock,
    loading: loadingLowStockApi,
    refresh: refreshLowStockApi,
  } = useLowStock(companyId);

  const metrics = getInventoryMetrics();

  const [activeModuleTab, setActiveModuleTab] = useState<ProductsModuleTab>(initialTab);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');

  useEffect(() => {
    setActiveModuleTab(initialTab);
  }, [initialTab]);

  /* ------------------------- adaptación al shape UI ------------------------ */

  const uiProducts = useMemo(() => toUiProducts(products, suppliers), [products, suppliers]);
  const providers = useMemo(() => toProviderOptions(suppliers), [suppliers]);

  const catalog = useMemo(
    () =>
      buildProductCatalog({
        categories,
        units,
        productLines: uiProducts.map((p) => p.line),
        productCategories: uiProducts.map((p) => p.category),
        productSubcategories: uiProducts.map((p) => p.subcategory),
        productUnits: uiProducts.map((p) => p.unit),
      }),
    [categories, units, uiProducts],
  );

  /* ------------------------------- acciones ------------------------------- */

  const handleCreate = async (draft: UiProduct): Promise<boolean> => {
    setSaving(true);
    try {
      const payload = toInventoryPayload(draft, { includeStock: true });
      await addProduct(payload as Omit<Product, 'id'>);
      await Promise.all([refreshInventory(), refreshLowStockApi()]);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (draft: UiProduct): Promise<boolean> => {
    setSaving(true);
    try {
      await updateProduct(draft.id, toInventoryPayload(draft));
      await refreshLowStockApi();
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string): Promise<boolean> => {
    try {
      await deleteProduct(productId);
      await refreshLowStockApi();
      return true;
    } catch {
      return false;
    }
  };

  const handleSetActive = async (productIds: string[], active: boolean): Promise<boolean> => {
    const results = await Promise.all(productIds.map((id) => setProductActive(id, active)));
    await refreshInventory();
    return results.every(Boolean);
  };

  const handleAdjustStock = async (
    productId: string,
    quantity: number,
    type: 'add' | 'subtract' | 'set',
    areaId?: number,
  ) => {
    await adjustStock(productId, quantity, type, areaId);
    await refreshLowStockApi();
  };

  const handleRefreshAll = async () => {
    await Promise.all([refreshInventory(), refreshLowStockApi()]);
  };

  /* --------------------- filtros de las pestañas legacy ------------------- */

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) || (p.code ?? '').toLowerCase().includes(term);
    const matchesCategory =
      categoryFilter === 'all' || p.category === categoryFilter || String(p.categoryId) === categoryFilter;
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
            id: full?.id ?? String(row.id),
            name: full?.name ?? row.name,
            code: full?.code ?? row.code,
            stock: full?.stock ?? row.stock,
            minStock: full?.minStock ?? row.minStock,
            unit: full?.unit ?? row.unit,
          };
        })
      : localLowStock;

  const alertCount = Math.max(metrics.lowStockCount, alertProducts.length);

  const categoryOptions =
    categories.length > 0
      ? categories
      : Array.from(new Set(products.map((p) => p.category).filter(Boolean))).map((name, i) => ({
          id: i,
          name: name as string,
        }));

  const filtersBar = (
    <div className="flex flex-col gap-4 md:flex-row">
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
            <Filter className="mr-2 h-4 w-4" />
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
    <div className="animate-fade-in space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent">
            Productos e inventario
          </h1>
          <p className="text-muted-foreground">
            Catálogo, ficha completa, stock y alertas en un solo módulo
            {(loading || catalogLoading || suppliersLoading) && ' · sincronizando...'}
          </p>
        </div>
        <Button variant="outline" onClick={() => void handleRefreshAll()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <ProductKpiRow
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        items={[
          {
            kind: 'income',
            label: 'Valor venta total',
            value: `S/ ${metrics.totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
          },
          {
            kind: 'projection',
            label: 'Costo inversión',
            value: `S/ ${metrics.totalCost.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
            icon: BarChart3,
          },
          {
            kind: 'warning',
            label: 'Alertas de stock',
            value: String(alertCount),
            icon: AlertTriangle,
            onClick: () => setActiveModuleTab('alerts'),
          },
          {
            kind: 'neutral',
            label: 'Total items',
            value: String(metrics.totalItems),
            icon: Package,
          },
        ]}
      />

      <Tabs
        value={activeModuleTab}
        onValueChange={(v) => setActiveModuleTab(v as ProductsModuleTab)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 md:inline-grid md:w-auto">
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
            Alertas ({alertCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-6">
          <ProductModule
            products={uiProducts}
            providers={providers}
            categories={categories}
            brands={brands}
            areas={areas}
            catalog={catalog}
            companyId={companyId}
            currentUserName={currentUserName}
            isLoading={loading}
            saving={saving}
            showKpis={false}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onSetActive={handleSetActive}
            onAdjustStock={handleAdjustStock}
            onUploadImage={uploadProductImage}
            onDeleteImage={deleteProductImage}
            onRefresh={() => void handleRefreshAll()}
          />
        </TabsContent>

        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <p className="mb-3 text-sm text-muted-foreground">
                Ajustes rápidos de existencias. Cada ±1 se registra en kardex (IN/OUT).
              </p>
              {filtersBar}
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 p-4 text-sm font-medium">
                  <div className="col-span-4">Producto</div>
                  <div className="col-span-2">Ubicación</div>
                  <div className="col-span-3">Stock</div>
                  <div className="col-span-3 text-right">Ajustes</div>
                </div>
                <div className="max-h-[600px] divide-y overflow-auto">
                  {filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No se encontraron productos con estos filtros.
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const stockPercentage = Math.min(
                        (product.stock / (product.minStock * 3 || 1)) * 100,
                        100,
                      );
                      const isLowStock = product.minStock > 0 && product.stock <= product.minStock;
                      return (
                        <div
                          key={product.id}
                          className="grid grid-cols-12 items-center gap-4 p-4 transition-colors hover:bg-muted/30"
                        >
                          <div className="col-span-4">
                            <div className="truncate font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">SKU: {product.code}</div>
                          </div>
                          <div className="col-span-2 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{product.location || '—'}</span>
                          </div>
                          <div className="col-span-3 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className={isLowStock ? 'font-bold text-red-600' : ''}>
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
                              onClick={() => void handleAdjustStock(product.id, 1, 'subtract')}
                            >
                              <ArrowDown className="h-4 w-4 text-red-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void handleAdjustStock(product.id, 1, 'add')}
                            >
                              <ArrowUp className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Abrir ficha en el catálogo"
                              onClick={() => setActiveModuleTab('catalog')}
                            >
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
              <CardTitle className="flex items-center gap-2 text-red-600">
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
                  <CheckCircle2 className="mb-2 h-12 w-12 text-green-500" />
                  <p>Todo en orden. No hay productos con stock bajo.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:bg-red-900/20"
                    >
                      <div>
                        <p className="text-lg font-bold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {product.code}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs font-bold uppercase text-red-600">Stock actual</p>
                          <p className="text-2xl font-bold text-red-700">{product.stock}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs uppercase text-muted-foreground">Mínimo</p>
                          <p className="text-lg font-medium">{product.minStock}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => void handleAdjustStock(String(product.id), 10, 'add')}
                        >
                          <Plus className="mr-2 h-4 w-4" />
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
    </div>
  );
}
