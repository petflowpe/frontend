import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string | null;
  is_system?: boolean;
  active?: boolean;
  permissions?: string[];
  users_count?: number;
  protected?: boolean;
}

export interface RolePayload {
  name?: string;
  display_name: string;
  description?: string | null;
  active?: boolean;
  permissions?: string[];
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const extractRole = (res: unknown): Role | null => {
    const envelope = res as { data?: Role };
    return (envelope?.data ?? (res as Role)) ?? null;
  };

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

  const createRole = useCallback(async (payload: RolePayload): Promise<Role | null> => {
    try {
      const res = await apiClient.post(API.roles.create, payload);
      const created = extractRole(res);
      if (created) {
        setRoles(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Rol creado correctamente');
      }
      return created;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al crear rol');
      return null;
    }
  }, []);

  const updateRole = useCallback(async (id: number, payload: Partial<RolePayload>): Promise<Role | null> => {
    try {
      const res = await apiClient.put(API.roles.update(id), payload);
      const updated = extractRole(res);
      if (updated) {
        setRoles(prev => prev.map(r => (r.id === id ? updated : r)));
        toast.success('Rol actualizado correctamente');
      }
      return updated;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar rol');
      return null;
    }
  }, []);

  const toggleRole = useCallback(async (id: number): Promise<Role | null> => {
    try {
      const res = await apiClient.patch(API.roles.toggle(id));
      const updated = extractRole(res);
      if (updated) {
        setRoles(prev => prev.map(r => (r.id === id ? updated : r)));
        toast.success(updated.active ? 'Rol activado' : 'Rol desactivado');
      }
      return updated;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cambiar estado del rol');
      return null;
    }
  }, []);

  const deleteRole = useCallback(async (id: number): Promise<boolean> => {
    try {
      await apiClient.delete(API.roles.delete(id));
      setRoles(prev => prev.filter(r => r.id !== id));
      toast.success('Rol eliminado correctamente');
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar rol');
      return false;
    }
  }, []);

  return { roles, loading, fetchRoles, createRole, updateRole, toggleRole, deleteRole };
}
