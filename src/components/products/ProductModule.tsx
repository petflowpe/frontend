import { useCallback, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import {
  AlertTriangle,
  Archive,
  Download,
  Edit2,
  Eye,
  FileClock,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import type { CatalogItem } from '../../hooks/useProductCatalog';
import type { ProductCatalogSettings, ProviderOption, UiProduct } from '../../types/product';
import { formatCurrencyEs } from '../../utils/numberFormat';
import { ProductImage } from '../ProductImage';
import { appConfirm } from '../ui/app-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { TableSkeletonRows } from '../ui/table-skeleton';
import { cloneProduct, createDraftProduct, normalizeProductForWorkspace, statusLabel } from './productDraftUtils';
import { ProductWorkspace } from './ProductWorkspace';

const PAGE_SIZE = 10;

export interface ProductModuleProps {
  products: UiProduct[];
  providers: ProviderOption[];
  categories: CatalogItem[];
  brands: CatalogItem[];
  areas: CatalogItem[];
  catalog: ProductCatalogSettings;
  companyId?: number | null;
  currentUserName: string;
  isLoading?: boolean;
  saving?: boolean;
  /** El host puede renderizar su propia fila de KPIs. */
  showKpis?: boolean;
  /** Crea el producto; devuelve `true` si se guardó. */
  onCreate: (product: UiProduct) => Promise<boolean>;
  /** Actualiza el producto; devuelve `true` si se guardó. */
  onUpdate: (product: UiProduct) => Promise<boolean>;
  onDelete: (productId: string) => Promise<boolean>;
  onSetActive: (productIds: string[], active: boolean) => Promise<boolean>;
  onAdjustStock?: (
    productId: string,
    quantity: number,
    type: 'add' | 'subtract' | 'set',
    areaId?: number,
  ) => Promise<void>;
  onUploadImage?: (productId: string, file: File) => Promise<string | null>;
  onDeleteImage?: (productId: string) => Promise<void>;
  onRefresh?: () => void;
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function stockBadge(product: UiProduct) {
  if (product.stockAvailable <= 0) {
    return <Badge className="border border-red-500/30 bg-red-500/20 text-red-700 dark:text-red-300">Sin stock</Badge>;
  }
  if (product.minStock > 0 && product.stockAvailable <= product.minStock) {
    return <Badge className="border border-amber-500/30 bg-amber-500/20 text-amber-700 dark:text-amber-300">Bajo</Badge>;
  }
  return (
    <Badge className="border border-emerald-500/30 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
      OK
    </Badge>
  );
}

function statusDot(status: UiProduct['status']) {
  if (status === 'active') {
    return (
      <span
        title="Activo"
        className="inline-flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
      />
    );
  }
  if (status === 'inactive') {
    return <span title="Inactivo" className="inline-flex h-3 w-3 rounded-full bg-slate-400" />;
  }
  return (
    <span
      title="Descontinuado"
      className="inline-flex h-3 w-3 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.6)]"
    />
  );
}

export const PRODUCT_KPI_STYLES = {
  projection:
    'bg-gradient-to-br from-cyan-50 to-sky-50 border-cyan-100 dark:from-cyan-950/40 dark:to-sky-950/30 dark:border-cyan-900 text-cyan-900 dark:text-cyan-100',
  warning:
    'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100 dark:from-amber-950/40 dark:to-orange-950/30 dark:border-amber-900 text-amber-900 dark:text-amber-100',
  expense:
    'bg-gradient-to-br from-rose-50 to-red-50 border-rose-100 dark:from-rose-950/40 dark:to-red-950/30 dark:border-rose-900 text-rose-900 dark:text-rose-100',
  income:
    'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-900 text-emerald-900 dark:text-emerald-100',
  neutral:
    'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 dark:from-violet-950/40 dark:to-purple-950/30 dark:border-violet-900 text-violet-900 dark:text-violet-100',
} as const;

export type ProductKpiKind = keyof typeof PRODUCT_KPI_STYLES;

export interface ProductKpiItem {
  kind: ProductKpiKind;
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
}

/** Tarjetas KPI con el look de Grooflow, reutilizables por el módulo host. */
export function ProductKpiRow({ items, className }: { items: ProductKpiItem[]; className?: string }) {
  return (
    <div className={className ?? 'grid gap-3 sm:grid-cols-2 xl:grid-cols-4'}>
      {items.map((item) => (
        <div
          key={item.label}
          role={item.onClick ? 'button' : undefined}
          tabIndex={item.onClick ? 0 : undefined}
          onClick={item.onClick}
          onKeyDown={(e) => {
            if (!item.onClick) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              item.onClick();
            }
          }}
          className={`relative overflow-hidden rounded-2xl border p-4 ${
            PRODUCT_KPI_STYLES[item.kind]
          } ${item.onClick ? 'cursor-pointer transition-transform hover:-translate-y-0.5' : ''}`}
        >
          <div className="text-xs uppercase tracking-[0.18em] opacity-70">{item.label}</div>
          <div className="mt-2 flex items-center gap-2 text-2xl font-bold">
            <item.icon className="h-5 w-5 opacity-80" />
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductModule({
  products,
  providers,
  categories,
  brands,
  areas,
  catalog,
  companyId,
  currentUserName,
  isLoading = false,
  saving = false,
  showKpis = true,
  onCreate,
  onUpdate,
  onDelete,
  onSetActive,
  onAdjustStock,
  onUploadImage,
  onDeleteImage,
  onRefresh,
}: ProductModuleProps) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [lineFilter, setLineFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [workspace, setWorkspace] = useState<{
    draft: UiProduct;
    baseline: UiProduct;
    isNew: boolean;
  } | null>(null);

  const filteredProducts = useMemo(() => {
    const needle = normalizeText(searchTerm);
    return products.filter((product) => {
      if (providerFilter === 'none' && product.supplierId) return false;
      if (providerFilter !== 'all' && providerFilter !== 'none' && String(product.supplierId) !== providerFilter)
        return false;
      if (lineFilter !== 'all' && product.line !== lineFilter) return false;
      if (categoryFilter !== 'all' && product.category !== categoryFilter) return false;
      if (stockFilter === 'low' && !(product.minStock > 0 && product.stockAvailable <= product.minStock))
        return false;
      if (stockFilter === 'out' && product.stockAvailable > 0) return false;
      if (stockFilter === 'active' && product.status !== 'active') return false;
      if (stockFilter === 'inactive' && product.status === 'active') return false;
      if (!needle) return true;
      return [
        product.code,
        product.barcode,
        product.name,
        product.brand,
        product.supplierName,
        product.line,
        product.category,
        product.subcategory,
      ]
        .filter(Boolean)
        .some((value) => normalizeText(String(value)).includes(needle));
    });
  }, [categoryFilter, lineFilter, products, providerFilter, searchTerm, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const selectedOnPage =
    pagedProducts.length > 0 && pagedProducts.every((product) => selectedIds.has(product.id));

  const lowStockCount = products.filter(
    (product) => product.minStock > 0 && product.stockAvailable <= product.minStock,
  ).length;
  const outOfStockCount = products.filter((product) => product.stockAvailable <= 0).length;
  const inventoryValue = products.reduce(
    (sum, product) => sum + (product.costPrice || product.salePrice) * product.stockAvailable,
    0,
  );

  const openWorkspaceProduct = useCallback((product: UiProduct) => {
    const normalized = normalizeProductForWorkspace(product);
    setWorkspace({ draft: normalized, baseline: cloneProduct(normalized), isNew: false });
  }, []);

  const openCreateWorkspace = useCallback(() => {
    const draft = normalizeProductForWorkspace(
      createDraftProduct({
        categoryId: categories[0]?.id,
        categoryName: categories[0]?.name,
        areaId: areas[0]?.id,
        location: areas[0]?.name,
        unit: catalog.units[0],
      }),
    );
    setWorkspace({ draft, baseline: cloneProduct(draft), isNew: true });
  }, [areas, catalog.units, categories]);

  const patchDraft = useCallback((fn: (p: UiProduct) => UiProduct) => {
    setWorkspace((w) => (w ? { ...w, draft: fn(cloneProduct(w.draft)) } : w));
  }, []);

  const commitWorkspace = useCallback(
    async (saved: UiProduct) => {
      const isNew = workspace?.isNew ?? false;
      const duplicated =
        saved.code.trim() &&
        products.some((p) => p.code.trim().toLowerCase() === saved.code.trim().toLowerCase() && p.id !== saved.id);
      if (isNew && duplicated) {
        toast.error('El código de sistema (SKU) ya existe');
        return false;
      }
      const ok = isNew ? await onCreate(saved) : await onUpdate(saved);
      if (ok) setWorkspace(null);
      return ok;
    },
    [onCreate, onUpdate, products, workspace?.isNew],
  );

  const handleDeleteProduct = async (product: UiProduct) => {
    if (!(await appConfirm(`¿Eliminar "${product.name}" del catálogo?`))) return;
    const ok = await onDelete(product.id);
    if (!ok) return;
    setWorkspace((w) => (w?.draft.id === product.id ? null : w));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(product.id);
      return next;
    });
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.size === 0) {
      toast.info('Selecciona al menos un producto');
      return;
    }
    const count = selectedIds.size;
    if (!(await appConfirm(`¿Desactivar ${count} producto(s) seleccionado(s)?`))) return;
    const ok = await onSetActive(Array.from(selectedIds), false);
    if (!ok) return;
    setSelectedIds(new Set());
  };

  const handleExportXlsx = () => {
    const header = [
      'Cod. de sistema',
      'Cod. de barras',
      'Nombre',
      'Marca',
      'Proveedor',
      'Linea',
      'Categoria',
      'Subcategoria',
      'Unidad',
      'Precio de venta',
      'Costo',
      'Stock disponible',
      'Stock minimo',
      'Estado',
    ];
    const rows = filteredProducts.map((product) => [
      product.code,
      product.barcode ?? '',
      product.name,
      product.brand ?? '',
      product.supplierName ?? '',
      product.line,
      product.category,
      product.subcategory ?? '',
      product.unit,
      product.salePrice,
      product.costPrice,
      product.stockAvailable,
      product.minStock,
      statusLabel(product.status),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([header, ...rows]), 'Productos');
    XLSX.writeFile(wb, `productos-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Catálogo exportado');
  };

  const handleAudit = () => {
    const inactive = products.filter((p) => p.status !== 'active').length;
    toast.info('Resumen de catálogo', {
      description: `${products.length} productos · ${lowStockCount} stock bajo · ${outOfStockCount} sin stock · ${inactive} inactivos. Abre una ficha y ve a la pestaña Auditoría para el historial por producto.`,
    });
  };

  const toggleSelected = (productId: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const togglePageSelected = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      pagedProducts.forEach((product) => {
        if (checked) next.add(product.id);
        else next.delete(product.id);
      });
      return next;
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setProviderFilter('all');
    setLineFilter('all');
    setCategoryFilter('all');
    setStockFilter('all');
    setPage(1);
  };

  const hasFilters =
    !!searchTerm ||
    providerFilter !== 'all' ||
    lineFilter !== 'all' ||
    categoryFilter !== 'all' ||
    stockFilter !== 'all';

  if (workspace) {
    return (
      <ProductWorkspace
        open
        draft={workspace.draft}
        patchDraft={patchDraft}
        baseline={workspace.baseline}
        providers={providers}
        categories={categories}
        brands={brands}
        areas={areas}
        catalog={catalog}
        companyId={companyId}
        currentUserName={currentUserName}
        isNew={workspace.isNew}
        saving={saving}
        onClose={() => setWorkspace(null)}
        onSave={commitWorkspace}
        onAdjustStock={onAdjustStock}
        onUploadImage={onUploadImage}
        onDeleteImage={onDeleteImage}
      />
    );
  }

  return (
    <div className="space-y-5" data-testid="products-module">
      {showKpis && (
        <ProductKpiRow
          items={[
            { kind: 'projection', label: 'Productos', value: String(products.length), icon: Package },
            { kind: 'warning', label: 'Stock bajo', value: String(lowStockCount), icon: AlertTriangle },
            { kind: 'expense', label: 'Sin stock', value: String(outOfStockCount), icon: Archive },
            {
              kind: 'income',
              label: 'Valor inventario',
              value: formatCurrencyEs(inventoryValue),
              icon: Package,
            },
          ]}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Package className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                Catálogo de productos
              </h2>
              <p className="text-xs text-muted-foreground">
                Pulsa una fila para abrir la ficha completa (precios, proveedor, stock y kardex).
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setCatalogOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Catálogo
              </Button>
              {onRefresh && (
                <Button variant="outline" onClick={onRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
              )}
              <Button variant="outline" onClick={handleExportXlsx}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button variant="outline" onClick={() => void handleBulkDeactivate()}>
                <Archive className="mr-2 h-4 w-4" />
                Desactivar
              </Button>
              <Button
                className="bg-emerald-600 text-white hover:bg-emerald-500"
                onClick={openCreateWorkspace}
                data-testid="products-add"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear nuevo producto
              </Button>
            </div>
          </div>

          <div className="grid gap-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={providerFilter}
              onValueChange={(value) => {
                setProviderFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Proveedor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Proveedor...</SelectItem>
                <SelectItem value="none">Sin proveedor</SelectItem>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={String(provider.id)}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={lineFilter}
              onValueChange={(value) => {
                setLineFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Linea..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Linea...</SelectItem>
                {catalog.lines.map((line) => (
                  <SelectItem key={line} value={line}>
                    {line}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(value) => {
                setCategoryFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Categorias..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Categorias...</SelectItem>
                {catalog.categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={stockFilter}
              onValueChange={(value) => {
                setStockFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Stock..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Stock...</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="low">Stock bajo</SelectItem>
                <SelectItem value="out">Sin stock</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-orange-500 text-white hover:bg-orange-400" onClick={handleAudit}>
              <FileClock className="mr-2 h-4 w-4" />
              Auditoria
            </Button>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedOnPage}
                    onCheckedChange={(checked) => togglePageSelected(checked === true)}
                  />
                </TableHead>
                <TableHead>Cod. de sistema</TableHead>
                <TableHead>Cod. de barras</TableHead>
                <TableHead className="min-w-[260px]">Nombre</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Linea</TableHead>
                <TableHead className="text-right">Precio de venta</TableHead>
                <TableHead className="text-center">Stock Contable</TableHead>
                <TableHead className="text-center">Stock Disponible</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Opciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeletonRows columnsCount={11} rowsCount={5} hasCheckbox />
              ) : pagedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center text-muted-foreground">
                    No se encontraron productos con los filtros actuales.
                  </TableCell>
                </TableRow>
              ) : (
                pagedProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => openWorkspaceProduct(product)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openWorkspaceProduct(product);
                      }
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(product.id)}
                        onCheckedChange={(checked) => toggleSelected(product.id, checked === true)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.code || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{product.barcode || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <ProductImage
                            path={product.imagePath}
                            alt={product.name}
                            className="h-full w-full"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground">{product.name}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                            <span>{product.category || 'Sin categoría'}</span>
                            {product.subcategory && <span>/ {product.subcategory}</span>}
                            {stockBadge(product)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.brand || '-'}</TableCell>
                    <TableCell>{product.supplierName || 'Sin proveedor'}</TableCell>
                    <TableCell>{product.line}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrencyEs(product.salePrice)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="border border-cyan-300/50 bg-cyan-50 text-cyan-900 dark:border-cyan-500/25 dark:bg-cyan-500/15 dark:text-cyan-200">
                        {product.stockAccounting}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="border border-emerald-500/25 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200">
                        {product.stockAvailable}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{statusDot(product.status)}</TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Abrir ficha"
                          aria-label="Abrir ficha"
                          className="text-cyan-700 hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-500/10"
                          onClick={() => openWorkspaceProduct(product)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar producto"
                          aria-label="Editar producto"
                          className="text-amber-600 hover:bg-amber-500/10 dark:text-amber-300"
                          onClick={() => openWorkspaceProduct(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar"
                          aria-label="Eliminar"
                          className="text-red-600 hover:bg-red-500/10 dark:text-red-300"
                          onClick={() => void handleDeleteProduct(product)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Página {safePage} de {totalPages} · Registros{' '}
            {filteredProducts.length === 0
              ? '0'
              : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filteredProducts.length)}`}{' '}
            de {filteredProducts.length}
            {selectedIds.size > 0 ? ` · ${selectedIds.size} seleccionado(s)` : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={safePage === 1} onClick={() => setPage(1)}>
              Primera
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Siguiente
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === totalPages}
              onClick={() => setPage(totalPages)}
            >
              Ultima
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Catálogo de productos</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Categorías, marcas, unidades y áreas se administran en el backend (MySQL) desde
            Configuración. Las líneas, subcategorías y presentaciones son listas fijas del frontend y
            se guardan en la metadata de cada producto.
          </p>
          {(
            [
              ['Líneas', catalog.lines],
              ['Categorías', catalog.categories],
              ['Subcategorías', catalog.subcategories],
              ['Unidades', catalog.units],
              ['Presentaciones', catalog.presentations],
            ] as const
          ).map(([label, items]) => (
            <div key={label} className="space-y-1">
              <Label>{label}</Label>
              <Input readOnly disabled className="opacity-80" value={items.join(', ')} />
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCatalogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
