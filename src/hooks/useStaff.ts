import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  role?: string;
  role_display?: string;
  role_id?: number;
  company_id?: number;
  active: boolean;
  last_login_at?: string;
  created_at?: string;
  position?: string;
  status?: string;
  phone?: string;
  hireDate?: string;
}

function fromBackendFormat(row: any): StaffMember {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    role: row.role,
    role_display: row.role_display,
    role_id: row.role_id,
    company_id: row.company_id,
    active: row.active !== false,
    last_login_at: row.last_login_at,
    created_at: row.created_at,
    position: row.role_display || row.role || '',
    status: row.active !== false ? 'active' : 'inactive',
  };
}

export function useStaff(companyId?: number) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { per_page: 100 };
      if (companyId != null) params.company_id = companyId;
      const response = await apiClient.get<{ success?: boolean; data?: any[] }>(
        API.users.list,
        params
      );
      const list = response?.data ?? [];
      setStaff(list.map(fromBackendFormat));
    } catch (e: any) {
      console.error('Error cargando personal', e);
      toast.error(e.message || 'Error cargando personal');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const createUser = async (data: { name: string; email: string; password: string; role_name: string }) => {
    const res = await apiClient.post<{ user?: any }>(API.authProtected.createUser, {
      ...data,
      user_type: 'user',
    });
    const user = res?.user ?? res;
    if (user) {
      setStaff((prev) => [fromBackendFormat(user), ...prev]);
      toast.success('Usuario creado');
      return fromBackendFormat(user);
    }
    toast.success('Usuario creado');
    loadStaff();
  };

  return { staff, loading, reload: loadStaff, createUser };
}
