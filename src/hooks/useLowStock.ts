import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface LowStockProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  price: number;
  cost: number;
}

function fromBackend(backendProduct: any): LowStockProduct {
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
    stock: typeof stockQty === 'number' ? stockQty : parseInt(String(stockQty), 10) || 0,
    minStock: backendProduct.min_stock ?? 0,
    unit: backendProduct.unit || 'NIU',
    price: parseFloat(backendProduct.sale_price ?? backendProduct.price) || 0,
    cost: parseFloat(backendProduct.cost_price ?? backendProduct.cost) || 0,
  };
}

export function useLowStock(companyId: number | null) {
  const [list, setList] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLowStock = useCallback(async () => {
    if (companyId == null || companyId <= 0) {
      setList([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<{ data?: any[] } | any[]>(API.products.lowStock, {
        company_id: companyId,
      });
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setList(data.map(fromBackend));
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar productos con stock bajo');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  return { lowStockProducts: list, loading, refresh: fetchLowStock };
}
