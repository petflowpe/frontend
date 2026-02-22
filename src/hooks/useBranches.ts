import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';

export interface Branch {
  id: number;
  company_id: number;
  nombre: string;
  codigo?: string;
  direccion?: string;
  ubigeo?: string;
  activo?: boolean;
}

export function useBranches(companyId: number | null) {
  const [list, setList] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async () => {
    if (!companyId) {
      setList([]);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<any>(`/companies/${companyId}/branches`);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setList(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar sucursales');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { branches: list, loading, refresh: fetchList };
}
