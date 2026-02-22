import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

/** Formato de una línea del asiento (backend) */
export interface AccountingEntryLineBackend {
  id?: number;
  account_code: string;
  account_name?: string | null;
  debit: number;
  credit: number;
}

/** Formato de asiento devuelto por el backend */
export interface AccountingEntryBackend {
  id: number;
  company_id?: number;
  number: string | null;
  date: string;
  time: string | null;
  type: string | null;
  origin: string | null;
  reference_id: number | null;
  reference_type: string | null;
  description: string | null;
  total_debit: number;
  total_credit: number;
  created_by?: number | null;
  lines?: AccountingEntryLineBackend[];
}

/** Formato usado por Accounting.tsx (UI) */
export interface AccountingEntryDisplay {
  id: string | number;
  fecha: string;
  hora: string;
  tipo: string;
  origen: string;
  referenciaId: string;
  descripcion: string;
  puntoVenta: { tipo: string; nombre: string; placa: string | null };
  cuentas: { cuenta: string; debe: number; haber: number }[];
  totales: { debe: number; haber: number };
}

function mapBackendToDisplay(entry: AccountingEntryBackend): AccountingEntryDisplay {
  const dateStr = typeof entry.date === 'string' ? entry.date : (entry.date as any)?.date ?? '';
  const timeStr = entry.time ?? '00:00:00';
  const lines = entry.lines ?? [];
  const cuentas = lines.map((l) => ({
    cuenta: l.account_name ? `${l.account_code} - ${l.account_name}` : l.account_code,
    debe: Number(l.debit) || 0,
    haber: Number(l.credit) || 0,
  }));
  return {
    id: entry.number ?? entry.id,
    fecha: dateStr,
    hora: timeStr,
    tipo: entry.type ?? 'manual',
    origen: entry.origin ?? 'Sistema',
    referenciaId: entry.reference_id?.toString() ?? entry.reference_type ?? '-',
    descripcion: entry.description ?? '',
    puntoVenta: { tipo: 'tienda', nombre: 'Sistema', placa: null },
    cuentas,
    totales: { debe: Number(entry.total_debit) || 0, haber: Number(entry.total_credit) || 0 },
  };
}

interface AccountingEntriesResponse {
  success?: boolean;
  data?: AccountingEntryBackend[];
  meta?: { total: number; per_page: number; current_page: number; last_page: number };
}

export interface UseAccountingEntriesParams {
  company_id?: number;
  from?: string;
  to?: string;
  type?: string;
  per_page?: number;
  autoFetch?: boolean;
}

export function useAccountingEntries(params?: UseAccountingEntriesParams) {
  const [entries, setEntries] = useState<AccountingEntryDisplay[]>([]);
  const [meta, setMeta] = useState<AccountingEntriesResponse['meta']>(null);
  const [loading, setLoading] = useState(true);
  const autoFetch = params?.autoFetch !== false;

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const query: Record<string, string | number> = {
        per_page: params?.per_page ?? 50,
      };
      if (params?.company_id != null) query.company_id = params.company_id;
      if (params?.from) query.from = params.from;
      if (params?.to) query.to = params.to;
      if (params?.type) query.type = params.type;

      const res = await apiClient.get<AccountingEntriesResponse>(API.accountingEntries.list, query as Record<string, string>);
      const data = (res as AccountingEntriesResponse)?.data ?? [];
      const raw = Array.isArray(data) ? data : [];
      setEntries(raw.map(mapBackendToDisplay));
      setMeta((res as AccountingEntriesResponse)?.meta ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar asientos contables');
      setEntries([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [params?.company_id, params?.from, params?.to, params?.type, params?.per_page]);

  useEffect(() => {
    if (autoFetch) fetchEntries();
  }, [autoFetch, fetchEntries]);

  return { entries, meta, loading, fetchEntries };
}
