import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface Supplier {
  id: number;
  name: string;
  business_name?: string;
  document_type?: string;
  document_number?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  active: boolean;
  enabled?: boolean;
  contact?: string;
  bankAccount?: string;
  products?: unknown[];
}

function fromBackendFormat(row: Record<string, unknown>): Supplier {
  const active = (row.active as boolean) ?? true;
  return {
    id: row.id as number,
    name: (row.name as string) || (row.razon_social as string) || '',
    business_name: row.business_name as string | undefined,
    document_type: row.document_type as string | undefined,
    document_number: row.document_number as string | undefined,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    address: row.address as string | undefined,
    notes: row.notes as string | undefined,
    active,
    enabled: active,
    contact: (row.phone as string) || (row.email as string),
    bankAccount: row.bank_account as string | undefined,
    products: row.products as unknown[] | undefined,
  };
}

function toBackendFormat(
  supplier: Partial<Supplier>,
  companyId: number,
): Record<string, unknown> {
  return {
    company_id: companyId,
    name: supplier.name?.trim() || '',
    business_name: supplier.business_name?.trim() || undefined,
    document_type: supplier.document_type || undefined,
    document_number: supplier.document_number?.replace(/\D/g, '') || undefined,
    email: supplier.email?.trim() || undefined,
    phone: supplier.phone?.trim() || undefined,
    address: supplier.address?.trim() || undefined,
    notes: supplier.notes?.trim() || undefined,
    active: supplier.active ?? true,
  };
}

export function useSuppliers(companyId?: number | null) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuppliers = useCallback(async () => {
    if (!companyId || companyId <= 0) {
      setSuppliers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get<{ success?: boolean; data?: Record<string, unknown>[] }>(
        API.suppliers.list,
        { company_id: companyId, only_active: false, per_page: 500 },
      );
      const list = response?.data ?? [];
      setSuppliers(list.map(fromBackendFormat));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error cargando proveedores';
      if (import.meta.env.DEV) console.error('Error cargando proveedores', e);
      toast.error(message);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const addSupplier = async (data: Omit<Supplier, 'id'>) => {
    if (!companyId || companyId <= 0) throw new Error('Empresa no definida');
    try {
      const res = await apiClient.post<{ data?: Record<string, unknown>; message?: string }>(
        API.suppliers.list,
        toBackendFormat(data, companyId),
      );
      const created = fromBackendFormat(res?.data ?? {});
      setSuppliers((prev) => [...prev, created]);
      toast.success(res?.message || 'Proveedor creado');
      return created;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al crear proveedor';
      toast.error(message);
      throw e;
    }
  };

  const updateSupplier = async (id: number, data: Partial<Supplier>) => {
    if (!companyId || companyId <= 0) throw new Error('Empresa no definida');
    try {
      const res = await apiClient.put<{ data?: Record<string, unknown>; message?: string }>(
        API.suppliers.byId(id),
        toBackendFormat(data, companyId),
      );
      const updated = fromBackendFormat(res?.data ?? { ...data, id });
      setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success(res?.message || 'Proveedor actualizado');
      return updated;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al actualizar proveedor';
      toast.error(message);
      throw e;
    }
  };

  const deleteSupplier = async (id: number) => {
    try {
      await apiClient.delete(API.suppliers.byId(id));
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      toast.success('Proveedor eliminado');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al eliminar proveedor';
      toast.error(message);
      throw e;
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const res = await apiClient.post<{ data?: Record<string, unknown>; message?: string }>(
        API.suppliers.toggleActive(id),
      );
      const updated = fromBackendFormat(res?.data ?? {});
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updated, active: updated.active, enabled: updated.active } : s)),
      );
      toast.success(res?.message || 'Estado actualizado');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error al cambiar estado';
      toast.error(message);
      throw e;
    }
  };

  return {
    suppliers,
    loading,
    reload: loadSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    toggleActive,
  };
}
