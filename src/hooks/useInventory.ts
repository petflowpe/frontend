import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryId?: number;
  brand: string;
  brandId?: number;
  areaId?: number;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  location?: string;
  imagePath?: string;
  active?: boolean;
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

  return {
    id: String(backendProduct.id),
    code: backendProduct.code || backendProduct.sku || '',
    name: backendProduct.name || '',
    category: backendProduct.category?.name || '',
    categoryId: backendProduct.category_id ?? backendProduct.category?.id,
    brand: backendProduct.brand_relation?.name || backendProduct.brandRelation?.name || backendProduct.brand || '',
    brandId: backendProduct.brand_id ?? backendProduct.brandRelation?.id,
    areaId: backendProduct.area_id ?? firstArea?.id ?? stocks[0]?.area_id,
    price: parseFloat(backendProduct.unit_price ?? backendProduct.sale_price ?? backendProduct.price) || 0,
    cost: parseFloat(backendProduct.cost_price ?? backendProduct.cost) || 0,
    stock: typeof stockQty === 'number' ? stockQty : parseFloat(String(stockQty)) || 0,
    minStock: parseFloat(backendProduct.min_stock ?? 0) || 0,
    unit: backendProduct.unitRelation?.name || backendProduct.unit || 'NIU',
    location: firstArea?.name || backendProduct.area?.name || backendProduct.location || undefined,
    imagePath: backendProduct.images?.[0] || backendProduct.image_path || backendProduct.photo || undefined,
    active: backendProduct.active ?? true,
  };
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
      const params: Record<string, string | number> = {
        per_page: 500,
      };
      if (companyId != null && companyId > 0) params.company_id = companyId;

      const response = await apiClient.get(API.products.list, params);
      const list = extractList(response);
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

  const adjustStock = async (id: string, quantity: number, type: 'add' | 'subtract', areaId?: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const resolvedAreaId = areaId ?? product.areaId ?? defaultAreaId ?? 1;
    const newStock = type === 'add' ? product.stock + quantity : product.stock - quantity;
    if (newStock < 0) {
      toast.error('No hay suficiente stock para realizar esta operación');
      return;
    }
    try {
      await apiClient.post(API.products.adjustStock(id), {
        area_id: resolvedAreaId,
        quantity,
        type: type === 'add' ? 'IN' : 'OUT',
        notes: type === 'add' ? 'Ajuste positivo' : 'Salida / ajuste',
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

  const uploadProductImage = async (_file: File): Promise<string | null> => {
    toast.message('Subida de imágenes pendiente de endpoint en el backend');
    return null;
  };

  const getSignedUrl = async (_path: string): Promise<string | null> => null;

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    getInventoryMetrics,
    fetchLowStock,
    uploadProductImage,
    getSignedUrl,
    refreshInventory: loadProducts,
  };
};
