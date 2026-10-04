import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';
import { resolveStaffCompanyId } from '../utils/appointmentMappers';
import { useAuth } from '../context/AuthContext';

export interface ServicePricingSize {
  price: number;
  cost: number;
  duration: number;
}

export interface CatalogService {
  id: number;
  code: string;
  name: string;
  description?: string;
  category?: string;
  area?: string;
  active: boolean;
  pricingBySize: boolean;
  pricing: Record<string, ServicePricingSize>;
  breedExceptions?: unknown[];
  requiredProducts: Array<{ product_id: number; quantity: number }>;
  price: number;
  cost: number;
  duration: number;
}

function fromBackend(row: any): CatalogService {
  const pricing = (row.pricing && typeof row.pricing === 'object' ? row.pricing : {}) as Record<
    string,
    ServicePricingSize
  >;
  const medium = pricing.medium || Object.values(pricing)[0] || { price: 0, cost: 0, duration: 45 };

  return {
    id: Number(row.id),
    code: row.code || '',
    name: row.name || '',
    description: row.description || '',
    category: row.category || '',
    area: row.area || '',
    active: row.active !== false,
    pricingBySize: row.pricing_by_size !== false && row.pricingBySize !== false,
    pricing,
    breedExceptions: row.breed_exceptions ?? row.breedExceptions ?? [],
    requiredProducts: Array.isArray(row.required_products)
      ? row.required_products
      : Array.isArray(row.requiredProducts)
        ? row.requiredProducts
        : [],
    price: Number(medium.price) || 0,
    cost: Number(medium.cost) || 0,
    duration: Number(medium.duration) || 45,
  };
}

export interface ServiceInput {
  name: string;
  description?: string;
  code?: string;
  category?: string;
  area?: string;
  active?: boolean;
  pricingBySize?: boolean;
  pricing?: Record<string, ServicePricingSize>;
  breedExceptions?: unknown[];
  requiredProducts?: Array<{ product_id: number; quantity: number }>;
}

function toBackend(data: ServiceInput, companyId: number) {
  return {
    company_id: companyId,
    name: data.name,
    code: data.code || undefined,
    description: data.description || null,
    category: data.category || null,
    area: data.area || null,
    active: data.active !== false,
    pricing_by_size: data.pricingBySize !== false,
    pricing: data.pricing || {},
    breed_exceptions: data.breedExceptions || [],
    required_products: data.requiredProducts || [],
  };
}

export function useServices() {
  const { user } = useAuth();
  const companyId = resolveStaffCompanyId(user);
  const [services, setServices] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!companyId || companyId <= 0) {
      setServices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<any[] | { data?: any[] }>(API.services.list, {
        company_id: companyId,
        only_active: false,
      });
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setServices(list.map(fromBackend));
    } catch (e: any) {
      console.error('Error cargando servicios', e);
      toast.error(e?.message || 'Error cargando servicios');
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const createService = async (data: ServiceInput) => {
    if (!companyId || companyId <= 0) throw new Error('company_id es requerido');
    const res = await apiClient.post<any>(API.services.list, toBackend(data, companyId));
    const saved = fromBackend(res?.data ?? res);
    setServices((prev) => [...prev, saved]);
    toast.success('Servicio creado');
    return saved;
  };

  const updateService = async (id: number, data: ServiceInput) => {
    if (!companyId || companyId <= 0) throw new Error('company_id es requerido');
    const res = await apiClient.put<any>(API.services.byId(id), toBackend(data, companyId));
    const saved = fromBackend(res?.data ?? res);
    setServices((prev) => prev.map((s) => (s.id === id ? saved : s)));
    toast.success('Servicio actualizado');
    return saved;
  };

  const deleteService = async (id: number) => {
    await apiClient.delete(API.services.byId(id));
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, active: false } : s)));
    toast.success('Servicio desactivado');
  };

  return {
    companyId,
    services,
    loading,
    reload,
    createService,
    updateService,
    deleteService,
  };
}
