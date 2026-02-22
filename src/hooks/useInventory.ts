import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  location?: string;
  imagePath?: string;
}

function fromBackendFormat(backendProduct: any): Product {
  const stockQty =
    backendProduct.stock?.quantity ??
    backendProduct.stock_quantity ??
    backendProduct.stock ??
    0;
  return {
    id: backendProduct.id.toString(),
    code: backendProduct.code || backendProduct.sku || '',
    name: backendProduct.name || '',
    category: backendProduct.category?.name || backendProduct.category_id?.toString() || '',
    brand: backendProduct.brand?.name || (backendProduct.brand_id && '') || '',
    price: parseFloat(backendProduct.sale_price ?? backendProduct.price) || 0,
    cost: parseFloat(backendProduct.cost_price ?? backendProduct.cost) || 0,
    stock: typeof stockQty === 'number' ? stockQty : parseInt(String(stockQty), 10) || 0,
    minStock: backendProduct.min_stock ?? 0,
    unit: backendProduct.unit || 'NIU',
    location: backendProduct.area?.name || backendProduct.location || undefined,
    imagePath: backendProduct.image_path || backendProduct.photo || undefined,
  };
}

function toBackendFormat(product: Partial<Product>): Record<string, unknown> {
  return {
    name: product.name || '',
    code: product.code || '',
    item_type: 'PRODUCTO',
    sale_price: product.price ?? 0,
    cost_price: product.cost ?? 0,
    active: true,
    description: '',
    unit: product.unit || 'NIU',
  };
}

export const useInventory = (companyId?: number | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        only_active: false,
        per_page: 500,
      };
      if (companyId != null && companyId > 0) params.company_id = companyId;

      const response = await apiClient.get<{ data?: any[] } | any[]>(API.products.list, params);
      const list = Array.isArray(response) ? response : (response?.data ?? []);
      const mapped = list.map(fromBackendFormat);
      setProducts(mapped);
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
    try {
      const payload = toBackendFormat(product);
      const res = await apiClient.post<{ data?: any }>(API.products.list, payload);
      const created = res?.data ?? res;
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
      if (changes.price != null) payload.sale_price = changes.price;
      if (changes.cost != null) payload.cost_price = changes.cost;
      if (changes.unit != null) payload.unit = changes.unit;
      await apiClient.put(API.products.byId(id), payload);
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, ...changes } : p))
      );
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
      toast.success('Producto eliminado del inventario');
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar producto');
      throw e;
    }
  };

  const adjustStock = async (id: string, quantity: number, type: 'add' | 'subtract') => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const newStock = type === 'add' ? product.stock + quantity : product.stock - quantity;
    if (newStock < 0) {
      toast.error('No hay suficiente stock para realizar esta operación');
      return;
    }
    try {
      await apiClient.post(API.products.adjustStock(id), {
        area_id: 1,
        quantity,
        type: type === 'add' ? 'IN' : 'OUT',
        notes: type === 'add' ? 'Ajuste positivo' : 'Venta / Ajuste',
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
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const totalCost = products.reduce((sum, p) => sum + p.cost * p.stock, 0);
    const lowStockCount = products.filter(p => p.minStock > 0 && p.stock <= p.minStock).length;
    return { totalValue, totalCost, lowStockCount, totalItems: products.length };
  };

  const fetchLowStock = async (): Promise<Product[]> => {
    if (companyId == null || companyId <= 0) return [];
    try {
      const res = await apiClient.get<{ data?: any[] } | any[]>(API.products.lowStock, { company_id: companyId });
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      return list.map(fromBackendFormat);
    } catch (e: any) {
      console.warn('Error cargando productos con stock bajo', e);
      return [];
    }
  };

  const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'product');
      const response = await apiClient.post<{ data?: { path?: string; url?: string } }>(
        '/upload',
        formData,
        undefined,
        true
      );
      const data = response?.data ?? response;
      return (data && (data.path || data.url)) || null;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error al subir la imagen');
      return null;
    }
  };

  const getSignedUrl = async (path: string): Promise<string | null> => {
    try {
      const response = await apiClient.post<{ data?: { url?: string } }>('/upload/signed-url', {
        path,
      });
      const data = response?.data ?? response;
      return (data && data.url) || null;
    } catch {
      return null;
    }
  };

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
