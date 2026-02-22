import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface AuditLogItem {
  id: number;
  user_id?: number;
  action: string;
  model_type?: string;
  model_id?: number;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip?: string;
  user_agent?: string;
  description?: string;
  created_at?: string;
  user?: { id: number; name: string; email: string };
}

interface AuditLogsResponse {
  success?: boolean;
  data?: AuditLogItem[];
  meta?: { total: number; per_page: number; current_page: number; last_page: number };
}

export function useAuditLogs(params?: { user_id?: number; model_type?: string; action?: string; from?: string; to?: string; per_page?: number }) {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [meta, setMeta] = useState<AuditLogsResponse['meta']>(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const query: Record<string, string | number> = { per_page: params?.per_page ?? 50 };
      if (params?.user_id != null) query.user_id = params.user_id;
      if (params?.model_type) query.model_type = params.model_type;
      if (params?.action) query.action = params.action;
      if (params?.from) query.from = params.from;
      if (params?.to) query.to = params.to;
      const res = await apiClient.get<AuditLogsResponse>(API.auditLogs.list, query as Record<string, string>);
      const data = (res as AuditLogsResponse)?.data ?? [];
      const metaData = (res as AuditLogsResponse)?.meta;
      setLogs(Array.isArray(data) ? data : []);
      setMeta(metaData ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar auditoría');
      setLogs([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [params?.user_id, params?.model_type, params?.action, params?.from, params?.to, params?.per_page]);

  return { logs, meta, loading, fetchLogs };
}
