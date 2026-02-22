import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_system?: boolean;
  permissions?: string[];
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async (queryParams?: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await apiClient.get(API.roles.list, queryParams);
      const data = (res as { data?: Role[] })?.data ?? (res as Role[]);
      setRoles(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { roles, loading, fetchRoles };
}
