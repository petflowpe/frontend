import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';
import { fetchAllPages } from '../utils/api/fetchAllPages';
import { publicStorageUrl } from '../utils/api/config';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryId?: number;
  brand: string;
  brandId?: number;
  supplierId?: number;
  supplierName?: string;
  areaId?: number;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  location?: string;
  imagePath?: string;
  active?: boolean;
  /** Campos opcionales ya soportados por Store/UpdateProductRequest. */
  barcode?: string;
  description?: string;
  maxStock?: number;
  trackBatches?: boolean;
  /** Reservado por citas abiertas (Σ product_stocks.reserved_quantity). */
  reserved?: number;
  /** JSON libre (`products.metadata`), usado por la ficha extendida. */
  metadata?: Record<string, unknown>;
}

function extractList(response: unknown): any[] {
  if (Array.isArray(response)) return response;
  const data = (response as { data?: unknown })?.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: any[] }).data;
  }
  return [];
}

function fromBackendFormat(backendProduct: any): Product {
  const stocks = backendProduct.product_stocks ?? backendProduct.productStocks ?? [];
  const stockFromAreas = Array.isArray(stocks)
    ? stocks.reduce((sum: number, s: any) => sum + (parseFloat(s.quantity) || 0), 0)
    : 0;
  const stockQty =
    stockFromAreas ||
    backendProduct.stock?.quantity ||
    backendProduct.stock_quantity ||
    backendProduct.stock ||
    0;

  const firstArea = Array.isArray(stocks) ? stocks[0]?.area : null;
  const metadata = parseMetadata(backendProduct.metadata);
  const preferredAreaId =
    metadata?.preferred_area_id != null ? Number(metadata.preferred_area_id) : undefined;

  return {
    id: String(backendProduct.id),
    code: backendProduct.code || backendProduct.sku || '',
    name: backendProduct.name || '',
    category: backendProduct.category?.name || '',
    categoryId: backendProduct.category_id ?? backendProduct.category?.id,
    brand: backendProduct.brand_relation?.name || backendProduct.brandRelation?.name || backendProduct.brand || '',
    brandId: backendProduct.brand_id ?? backendProduct.brandRelation?.id,
    supplierId: backendProduct.supplier_id ?? backendProduct.supplierRelation?.id ?? backendProduct.supplier?.id,
    supplierName:
      backendProduct.supplier_relation?.name ||
      backendProduct.supplierRelation?.name ||
      backendProduct.supplier?.name ||
      '',
    areaId: backendProduct.area_id ?? preferredAreaId ?? firstArea?.id ?? stocks[0]?.area_id,
    price: parseFloat(backendProduct.unit_price ?? backendProduct.sale_price ?? backendProduct.price) || 0,
    cost: parseFloat(backendProduct.cost_price ?? backendProduct.cost) || 0,
    stock: typeof stockQty === 'number' ? stockQty : parseFloat(String(stockQty)) || 0,
    minStock: parseFloat(backendProduct.min_stock ?? 0) || 0,
    unit: backendProduct.unitRelation?.name || backendProduct.unit || 'NIU',
    location: firstArea?.name || backendProduct.area?.name || backendProduct.location || undefined,
    imagePath: backendProduct.images?.[0] || backendProduct.image_path || backendProduct.photo || undefined,
    active: backendProduct.active ?? true,
    barcode: backendProduct.barcode || undefined,
    description: backendProduct.description || undefined,
    maxStock: backendProduct.max_stock != null ? parseFloat(backendProduct.max_stock) || 0 : undefined,
    trackBatches: Boolean(backendProduct.track_batches),
    reserved: Array.isArray(stocks)
      ? stocks.reduce((sum: number, s: any) => sum + (parseFloat(s.reserved_quantity) || 0), 0)
      : 0,
    metadata,
  };
}

function parseMetadata(raw: unknown): Record<string, unknown> | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : undefined;
    } catch {
      return undefined;
    }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>;
  return undefined;
}

function toBackendFormat(
  product: Partial<Product>,
  companyId: number,
  defaultAreaId?: number
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    company_id: companyId,
    name: product.name || '',
    item_type: 'PRODUCTO',
    unit_price: product.price ?? 0,
    cost_price: product.cost ?? 0,
    min_stock: product.minStock ?? 0,
    unit: product.unit || 'NIU',
    active: product.active ?? true,
  };

  if (product.code) payload.code = product.code;
  if (product.categoryId) payload.category_id = product.categoryId;
  if (product.brandId) payload.brand_id = product.brandId;
  if (product.supplierId) payload.supplier_id = product.supplierId;
  if (product.barcode) payload.barcode = product.barcode;
  if (product.description) payload.description = product.description;
  if (product.maxStock != null) payload.max_stock = product.maxStock;
  if (product.trackBatches != null) payload.track_batches = product.trackBatches;
  if (product.metadata) payload.metadata = product.metadata;

  const areaId = product.areaId ?? defaultAreaId;
  if (areaId) payload.area_id = areaId;

  if (product.stock != null && product.stock > 0) {
    payload.stock = product.stock;
  }

  return payload;
}

export const useInventory = (companyId?: number | null, defaultAreaId?: number) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        item_type: 'PRODUCTO',
      };
      if (companyId != null && companyId > 0) params.company_id = companyId;

      const list = await fetchAllPages(API.products.list, params);
      setProducts(list.map(fromBackendFormat));
    } catch (e: any) {
      console.error('Error cargando inventario', e);
      toast.error(e.message || 'Error cargando inventario del servidor');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!companyId || companyId <= 0) {
      toast.error('Empresa no definida');
      throw new Error('company_id required');
    }
    try {
      const payload = toBackendFormat(product, companyId, defaultAreaId);
      const res = await apiClient.post<{ data?: any }>(API.products.list, payload);
      const created = (res as any)?.data ?? res;
      const newProduct = fromBackendFormat(created);
      setProducts(prev => [...prev, newProduct]);
      toast.success('Producto agregado correctamente');
      return newProduct;
    } catch (e: any) {
      toast.error(e.message || 'Error al agregar producto');
      throw e;
    }
  };

  const updateProduct = async (id: string, changes: Partial<Product>) => {
    try {
      const payload: Record<string, unknown> = {};
      if (changes.name != null) payload.name = changes.name;
      if (changes.code != null) payload.code = changes.code;
      if (changes.price != null) payload.unit_price = changes.price;
      if (changes.cost != null) payload.cost_price = changes.cost;
      if (changes.unit != null) payload.unit = changes.unit;
      if (changes.minStock != null) payload.min_stock = changes.minStock;
      if (changes.categoryId != null) payload.category_id = changes.categoryId;
      if (changes.brandId != null) payload.brand_id = changes.brandId;
      if (changes.active != null) payload.active = changes.active;
      // Se usa `in` para poder limpiar valores (enviar null explícitamente).
      if ('supplierId' in changes) payload.supplier_id = changes.supplierId ?? null;
      if ('barcode' in changes) payload.barcode = changes.barcode || null;
      if ('description' in changes) payload.description = changes.description || null;
      if ('maxStock' in changes) payload.max_stock = changes.maxStock ?? null;
      if (changes.trackBatches != null) payload.track_batches = changes.trackBatches;
      if ('metadata' in changes) payload.metadata = changes.metadata ?? null;
      if ('areaId' in changes) {
        payload.area_id = changes.areaId ?? null;
        // También refuerza metadata por si el backend fusiona preferencia de almacén
        const meta = {
          ...((payload.metadata as Record<string, unknown>) || changes.metadata || {}),
          preferred_area_id: changes.areaId ?? undefined,
        };
        if (changes.areaId == null) delete meta.preferred_area_id;
        payload.metadata = meta;
      }

      await apiClient.put(API.products.byId(id), payload);
      await loadProducts();
      toast.success('Producto actualizado');
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar producto');
      throw e;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await apiClient.delete(API.products.byId(id));
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Producto desactivado');
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar producto');
      throw e;
    }
  };

  const adjustStock = async (
    id: string,
    quantity: number,
    type: 'add' | 'subtract' | 'set',
    areaId?: number,
    notes?: string
  ) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const resolvedAreaId = areaId ?? product.areaId ?? defaultAreaId ?? 1;
    const newStock =
      type === 'add'
        ? product.stock + quantity
        : type === 'subtract'
          ? product.stock - quantity
          : quantity;
    if (newStock < 0) {
      toast.error('No hay suficiente stock para realizar esta operación');
      return;
    }
    const backendType = type === 'add' ? 'IN' : type === 'subtract' ? 'OUT' : 'ADJUST';
    const defaultNotes =
      type === 'add' ? 'Ajuste positivo' : type === 'subtract' ? 'Salida / ajuste' : 'Inventario físico';
    try {
      await apiClient.post(API.products.adjustStock(id), {
        area_id: resolvedAreaId,
        quantity,
        type: backendType,
        notes: notes || defaultNotes,
      });
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, stock: newStock } : p))
      );
      toast.success('Stock actualizado');
    } catch (e: any) {
      toast.error(e.message || 'Error al ajustar stock');
      throw e;
    }
  };

  /**
   * Activa / desactiva un producto sin quitarlo del listado local.
   * `DELETE /products/{id}` en este backend equivale a `active = false`.
   */
  const setProductActive = async (id: string, active: boolean) => {
    try {
      if (active) {
        await apiClient.post(API.products.activate(id));
      } else {
        await apiClient.delete(API.products.byId(id));
      }
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, active } : p)));
      return true;
    } catch (e: any) {
      toast.error(e.message || 'Error al cambiar el estado del producto');
      return false;
    }
  };

  const getInventoryMetrics = () => {
    const activeProducts = products.filter(p => p.active !== false);
    const totalValue = activeProducts.reduce((sum, p) => sum + p.price * p.stock, 0);
    const totalCost = activeProducts.reduce((sum, p) => sum + p.cost * p.stock, 0);
    const lowStockCount = activeProducts.filter(p => p.minStock > 0 && p.stock <= p.minStock).length;
    return { totalValue, totalCost, lowStockCount, totalItems: activeProducts.length };
  };

  const fetchLowStock = async (): Promise<Product[]> => {
    if (companyId == null || companyId <= 0) return [];
    try {
      const res = await apiClient.get(API.products.lowStock, { company_id: companyId });
      return extractList(res).map(fromBackendFormat);
    } catch (e: any) {
      console.warn('Error cargando productos con stock bajo', e);
      return [];
    }
  };

  const uploadProductImage = async (productId: string | number, file: File): Promise<string | null> => {
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await apiClient.post<{
        data?: { path?: string; url?: string; product?: any };
      }>(API.products.uploadImage(productId), form, undefined, true);
      const path = (res as any)?.data?.path ?? (res as any)?.path ?? null;
      const productPayload = (res as any)?.data?.product;
      if (productPayload) {
        const updated = fromBackendFormat(productPayload);
        setProducts((prev) => prev.map((p) => (String(p.id) === String(productId) ? updated : p)));
      } else if (path) {
        setProducts((prev) =>
          prev.map((p) => (String(p.id) === String(productId) ? { ...p, imagePath: path } : p))
        );
      }
      toast.success('Imagen actualizada');
      return path;
    } catch (e: any) {
      toast.error(e.message || 'Error al subir imagen');
      return null;
    }
  };

  const deleteProductImage = async (productId: string | number): Promise<void> => {
    try {
      await apiClient.delete(API.products.deleteImage(productId));
      setProducts((prev) =>
        prev.map((p) => (String(p.id) === String(productId) ? { ...p, imagePath: undefined } : p))
      );
      toast.success('Imagen eliminada');
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar imagen');
      throw e;
    }
  };

  const getSignedUrl = async (path: string): Promise<string | null> => {
    return publicStorageUrl(path);
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    setProductActive,
    adjustStock,
    getInventoryMetrics,
    fetchLowStock,
    uploadProductImage,
    deleteProductImage,
    getSignedUrl,
    refreshInventory: loadProducts,
  };
};
