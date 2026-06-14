import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export type SupplierType = 'Mercadería' | 'Servicios' | 'Honorarios' | 'Mixto';

export interface Supplier {
  id: number;
  name: string;
  business_name?: string;
  document_type?: string;
  document_number?: string;
  supplier_type?: SupplierType | string;
  email?: string;
  phone?: string;
  contact_name?: string;
  bank_name?: string;
  bank_account?: string;
  billing_email?: string;
  credit_days?: number;
  accounting_account_code?: string;
  address?: string;
  notes?: string;
  active: boolean;
  enabled?: boolean;
  contact?: string;
  bankAccount?: string;
  total_purchases?: number;
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
    supplier_type: row.supplier_type as string | undefined,
    email: row.email as string | undefined,
    phone: row.phone as string | undefined,
    contact_name: row.contact_name as string | undefined,
    bank_name: row.bank_name as string | undefined,
    bank_account: row.bank_account as string | undefined,
    bankAccount: row.bank_account as string | undefined,
    billing_email: row.billing_email as string | undefined,
    credit_days: row.credit_days != null ? Number(row.credit_days) : 0,
    accounting_account_code: row.accounting_account_code as string | undefined,
    address: row.address as string | undefined,
    notes: row.notes as string | undefined,
    active,
    enabled: active,
    contact: (row.contact_name as string) || (row.phone as string) || (row.email as string),
    total_purchases: row.total_purchases != null ? Number(row.total_purchases) : 0,
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
    supplier_type: supplier.supplier_type || undefined,
    email: supplier.email?.trim() || supplier.billing_email?.trim() || undefined,
    phone: supplier.phone?.trim() || undefined,
    contact_name: supplier.contact_name?.trim() || undefined,
    bank_name: supplier.bank_name?.trim() || undefined,
    bank_account: (supplier.bank_account || supplier.bankAccount)?.trim() || undefined,
    billing_email: supplier.billing_email?.trim() || undefined,
    credit_days: supplier.credit_days ?? 0,
    accounting_account_code: supplier.accounting_account_code || undefined,
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
      const response = await apiClient.get<{ data?: Record<string, unknown>[] }>(
        API.suppliers.list,
        { company_id: companyId, only_active: false, per_page: 500 },
      );
      const list = (response as { data?: Record<string, unknown>[] })?.data ?? response ?? [];
      const rows = Array.isArray(list) ? list : [];
      setSuppliers(rows.map((row) => fromBackendFormat(row as Record<string, unknown>)));
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
