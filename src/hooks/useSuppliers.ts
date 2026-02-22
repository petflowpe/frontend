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
  enabled?: boolean; // alias para UI
  contact?: string;
  bankAccount?: string;
  products?: any[];
}

const DEFAULT_COMPANY_ID = 1;

function fromBackendFormat(row: any): Supplier {
  return {
    id: row.id,
    name: row.name || row.razon_social || '',
    business_name: row.business_name,
    document_type: row.document_type,
    document_number: row.document_number,
    email: row.email,
    phone: row.phone,
    address: row.address,
    notes: row.notes,
    active: row.active ?? true,
    enabled: row.active ?? true,
    contact: row.phone || row.email,
    bankAccount: row.bank_account,
    products: row.products,
  };
}

export function useSuppliers(companyId: number = DEFAULT_COMPANY_ID) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ success?: boolean; data?: any[] }>(
        API.suppliers.list,
        { company_id: companyId, only_active: false, per_page: 200 }
      );
      const list = response?.data ?? [];
      setSuppliers(list.map(fromBackendFormat));
    } catch (e: any) {
      console.error('Error cargando proveedores', e);
      toast.error(e.message || 'Error cargando proveedores');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  return {
    suppliers,
    loading,
    reload: loadSuppliers,
  };
}
