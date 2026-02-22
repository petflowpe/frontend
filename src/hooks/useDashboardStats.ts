import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface DashboardStats {
  total_sales: number;
  appointments_count: number;
  active_clients: number;
  total_pets: number;
}

const defaultStats: DashboardStats = {
  total_sales: 0,
  appointments_count: 0,
  active_clients: 0,
  total_pets: 0,
};

/**
 * Estadísticas agregadas del dashboard desde el backend.
 * Usa GET /reports/stats con company_id (y opcional branch_id).
 */
export function useDashboardStats(companyId: number = 1, branchId: number | null = null) {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { company_id: companyId };
      if (branchId != null) params.branch_id = branchId;
      const res = await apiClient.get<{ data?: DashboardStats }>(API.reports.stats, params);
      const data = (res && typeof res === 'object' && 'data' in res ? (res as { data: DashboardStats }).data : res) ?? defaultStats;
      setStats({
        total_sales: Number(data.total_sales) ?? 0,
        appointments_count: Number(data.appointments_count) ?? 0,
        active_clients: Number(data.active_clients) ?? 0,
        total_pets: Number(data.total_pets) ?? 0,
      });
    } catch (e: any) {
      setError(e.message || 'Error al cargar estadísticas');
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  }, [companyId, branchId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
