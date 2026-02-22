import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface KardexEntry {
  id: number | string;
  movement_date: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  unit_cost: number;
  total_cost: number;
  balance: number;
  balance_value: number;
  source_type?: string;
  source_id?: string | number;
  notes?: string;
  created_by?: string;
}

export interface KardexResponse {
  product: { id: number; name?: string; code?: string };
  entries: KardexEntry[];
  current_stock: number;
  current_value: number;
}

export function useKardex(
  productId: string | number | null,
  options?: { company_id?: number; branch_id?: number; date_from?: string; date_to?: string }
) {
  const [data, setData] = useState<KardexResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchKardex = useCallback(async () => {
    if (!productId) {
      setData(null);
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (options?.company_id) params.company_id = options.company_id;
      if (options?.branch_id) params.branch_id = options.branch_id;
      if (options?.date_from) params.date_from = options.date_from;
      if (options?.date_to) params.date_to = options.date_to;

      const res = await apiClient.get<{ success?: boolean; data?: KardexResponse } | KardexResponse>(
        API.products.kardex(productId),
        params
      );
      const raw = (res as any)?.data ?? res;
      const parsed = Array.isArray(raw) ? null : (raw && typeof raw === 'object' && 'entries' in raw ? raw : null);
      setData(parsed as KardexResponse | null);
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar kardex');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [productId, options?.company_id, options?.branch_id, options?.date_from, options?.date_to]);

  useEffect(() => {
    fetchKardex();
  }, [fetchKardex]);

  return { data, loading, refresh: fetchKardex };
}
