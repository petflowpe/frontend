import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export type ExpiryStatus = 'expired' | 'expiring' | 'ok' | 'none';

export interface ProductBatch {
  id: number;
  product_id: number;
  area_id: number;
  batch_number: string;
  expiry_date: string | null;
  quantity_initial: number;
  quantity_available: number;
  unit_cost: number | null;
  received_at: string | null;
  days_to_expiry: number | null;
  expiry_status: ExpiryStatus;
  area?: { id: number; name: string } | null;
  product?: { id: number; name: string; code?: string; cost_price?: number } | null;
}

export interface ExpiringMeta {
  days: number;
  expired_count: number;
  expired_value: number;
  expiring_count: number;
  expiring_value: number;
}

function normalizeBatch(raw: any): ProductBatch {
  return {
    ...raw,
    quantity_initial: Number(raw.quantity_initial) || 0,
    quantity_available: Number(raw.quantity_available) || 0,
    unit_cost: raw.unit_cost != null ? Number(raw.unit_cost) : null,
    expiry_date: raw.expiry_date ? String(raw.expiry_date).slice(0, 10) : null,
  };
}

function extractRows(res: unknown): any[] {
  if (Array.isArray(res)) return res;
  const data = (res as { data?: unknown })?.data;
  return Array.isArray(data) ? data : [];
}

export function useProductBatches(productId: string | number | null, enabled = true) {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!productId || !enabled) {
      setBatches([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get(API.products.batches(productId));
      setBatches(extractRows(res).map(normalizeBatch));
    } catch (e: any) {
      toast.error(e?.message || 'No se pudieron cargar los lotes');
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [productId, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  return { batches, loading, refresh: load };
}

export function useExpiringBatches(companyId?: number | null, days = 30) {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [meta, setMeta] = useState<ExpiringMeta | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) {
      setBatches([]);
      setMeta(null);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get(API.batches.expiring, { company_id: companyId, days });
      setBatches(extractRows(res).map(normalizeBatch));
      setMeta(((res as { meta?: ExpiringMeta })?.meta as ExpiringMeta) ?? null);
    } catch {
      setBatches([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [companyId, days]);

  useEffect(() => {
    load();
  }, [load]);

  return { batches, meta, loading, refresh: load };
}

export async function writeOffBatch(
  batchId: number,
  payload: { quantity?: number; reason: string; kind?: 'expiry' | 'shrinkage' }
): Promise<void> {
  await apiClient.post(API.batches.writeOff(batchId), payload);
}
