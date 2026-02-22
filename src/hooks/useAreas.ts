import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface Area {
  id: number;
  name: string;
  enabled: boolean;
  active?: boolean;
}

const DEFAULT_COMPANY_ID = 1;

function fromBackendFormat(row: any): Area {
  return {
    id: row.id,
    name: row.name || '',
    enabled: row.active !== false,
    active: row.active !== false,
  };
}

export function useAreas(companyId: number = DEFAULT_COMPANY_ID) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAreas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ success?: boolean; data?: any[] }>(
        API.areas.list,
        { company_id: companyId, only_active: false }
      );
      const list = response?.data ?? [];
      setAreas(list.map(fromBackendFormat));
    } catch (e: any) {
      console.error('Error cargando áreas', e);
      toast.error(e.message || 'Error cargando áreas');
      setAreas([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  return { areas, loading, reload: loadAreas };
}
