import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface Category {
  id: number;
  name: string;
  color?: string;
  enabled: boolean;
  description?: string;
  active?: boolean;
}

const DEFAULT_COMPANY_ID = 1;

function fromBackendFormat(row: any): Category {
  return {
    id: row.id,
    name: row.name || '',
    color: row.color || 'blue',
    enabled: row.active !== false,
    description: row.description,
    active: row.active !== false,
  };
}

export function useCategories(companyId: number = DEFAULT_COMPANY_ID) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ success?: boolean; data?: any[] }>(
        API.categories.list,
        { company_id: companyId, only_active: false }
      );
      const list = response?.data ?? [];
      setCategories(list.map(fromBackendFormat));
    } catch (e: any) {
      console.error('Error cargando categorías', e);
      toast.error(e.message || 'Error cargando categorías');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, loading, reload: loadCategories };
}
