import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';
import type { ProductKardexRow } from '../types/product';

interface KardexApiEntry {
  id: number | string;
  movement_date: string;
  type: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  balance: number;
  balance_value: number;
  source_type?: string | null;
  source_id?: number | string | null;
  notes?: string | null;
  created_by?: string | null;
}

const OPERATION_LABELS: Record<string, string> = {
  IN: 'Entrada',
  OUT: 'Salida',
  ADJUST: 'Ajuste',
};

const SOURCE_LABELS: Record<string, string> = {
  initial: 'Stock inicial',
  adjustment: 'Ajuste manual',
  purchase: 'Compra',
  sale: 'Venta',
};

function toKardexRow(entry: KardexApiEntry): ProductKardexRow {
  const type = String(entry.type ?? '').toUpperCase();
  const qty = Number(entry.quantity) || 0;
  return {
    id: String(entry.id),
    date: entry.movement_date,
    referenceDoc: entry.source_id
      ? `${SOURCE_LABELS[entry.source_type ?? ''] ?? entry.source_type ?? 'Doc.'} #${entry.source_id}`
      : SOURCE_LABELS[entry.source_type ?? ''] ?? entry.source_type ?? '—',
    operationType: OPERATION_LABELS[type] ?? type,
    warehouse: '—',
    qtyIn: type === 'OUT' ? 0 : qty,
    qtyOut: type === 'OUT' ? qty : 0,
    unitCost: Number(entry.unit_cost) || 0,
    totalCost: Number(entry.total_cost) || 0,
    balance: Number(entry.balance) || 0,
    notes: entry.notes ?? undefined,
    responsible: entry.created_by ?? undefined,
  };
}

/**
 * Kardex real del producto (`GET /products/{id}/kardex`).
 * Devuelve los movimientos en orden descendente (lo más reciente primero).
 */
export function useProductKardex(productId?: string, companyId?: number | null, enabled = true) {
  const [rows, setRows] = useState<ProductKardexRow[]>([]);
  const [currentStock, setCurrentStock] = useState(0);
  const [currentValue, setCurrentValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !productId) {
      setRows([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {};
      if (companyId != null && companyId > 0) params.company_id = companyId;
      const res = await apiClient.get<any>(API.products.kardex(productId), params);
      const data = res?.data ?? res ?? {};
      const entries: KardexApiEntry[] = Array.isArray(data.entries) ? data.entries : [];
      setRows(entries.map(toKardexRow).reverse());
      setCurrentStock(Number(data.current_stock) || 0);
      setCurrentValue(Number(data.current_value) || 0);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'No se pudo cargar el kardex';
      setError(message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, enabled, productId]);

  useEffect(() => {
    load();
  }, [load]);

  return { rows, currentStock, currentValue, loading, error, reload: load };
}
