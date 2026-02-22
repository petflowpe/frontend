import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role_id?: number;
  role?: string;
  role_display?: string;
  company_id?: number;
  active: boolean;
  last_login_at?: string;
  created_at?: string;
  user_type?: string;
  permissions?: string[];
  company?: string;
  phone?: string;
  updated_at?: string;
}

interface UsersResponse {
  success?: boolean;
  data?: UserRecord[];
  meta?: { total: number; per_page: number; current_page: number; last_page: number };
}

export function useUsers(params?: { company_id?: number; only_active?: boolean; search?: string; per_page?: number }) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [meta, setMeta] = useState<UsersResponse['meta']>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const query: Record<string, string | number | boolean> = { per_page: params?.per_page ?? 50 };
      if (params?.company_id != null) query.company_id = params.company_id;
      if (params?.only_active) query.only_active = true;
      if (params?.search) query.search = params.search;
      const res = await apiClient.get(API.users.list, query as Record<string, string>);
      const data = (res as UsersResponse)?.data ?? [];
      const metaData = (res as UsersResponse)?.meta;
      setUsers(Array.isArray(data) ? data : []);
      setMeta(metaData ?? null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al cargar usuarios';
      toast.error(msg);
      setUsers([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [params?.company_id, params?.only_active, params?.search, params?.per_page]);

  const fetchUser = useCallback(async (id: number | string) => {
    try {
      const res = await apiClient.get(API.users.byId(id));
      return (res as { data?: UserRecord })?.data ?? (res as UserRecord);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al cargar usuario';
      toast.error(msg);
      throw e;
    }
  }, []);

  const createUser = useCallback(async (payload: {
    name: string;
    email: string;
    password: string;
    role_id: number;
    company_id?: number;
    user_type?: string;
    active?: boolean;
    permissions?: string[];
  }) => {
    try {
      const res = await apiClient.post(API.users.create, payload);
      const data = (res as { data?: UserRecord })?.data ?? (res as UserRecord);
      setUsers((prev) => [data, ...prev]);
      toast.success('Usuario creado');
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al crear usuario';
      toast.error(msg);
      throw e;
    }
  }, []);

  const updateUser = useCallback(async (id: number | string, payload: Partial<{
    name: string;
    email: string;
    password: string;
    role_id: number;
    company_id: number;
    active: boolean;
    permissions: string[];
  }>) => {
    try {
      const res = await apiClient.put(API.users.update(id), payload);
      const data = (res as { data?: UserRecord })?.data ?? (res as UserRecord);
      setUsers((prev) => prev.map((u) => (u.id === Number(id) ? data : u)));
      toast.success('Usuario actualizado');
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al actualizar';
      toast.error(msg);
      throw e;
    }
  }, []);

  const deleteUser = useCallback(async (id: number | string, soft = true) => {
    try {
      await apiClient.delete(API.users.delete(id) + (soft ? '?soft=1' : ''));
      setUsers((prev) => prev.filter((u) => u.id !== Number(id)));
      toast.success(soft ? 'Usuario desactivado' : 'Usuario eliminado');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al eliminar';
      toast.error(msg);
      throw e;
    }
  }, []);

  return { users, meta, loading, fetchUsers, fetchUser, createUser, updateUser, deleteUser };
}
