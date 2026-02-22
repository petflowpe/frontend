import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface PermissionItem {
  id?: number;
  name: string;
  display_name: string;
  description?: string;
  category: string;
}

export function usePermissions() {
  const [byCategory, setByCategory] = useState<Record<string, PermissionItem[]>>({});
  const [flat, setFlat] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async (fromDb = true) => {
    setLoading(true);
    try {
      const res = await apiClient.get(
        API.permissions.list,
        { from_db: fromDb ? '1' : '0' }
      );
      const data = (res as { data?: Record<string, PermissionItem[]> })?.data ?? (res as Record<string, PermissionItem[]>);
      const flatData = (res as { flat?: Record<string, string> })?.flat ?? {};
      setByCategory(typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {});
      setFlat(typeof flatData === 'object' && flatData !== null ? flatData : {});
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar permisos');
      setByCategory({});
      setFlat({});
    } finally {
      setLoading(false);
    }
  }, []);

  return { byCategory, flat, loading, fetchPermissions };
}
