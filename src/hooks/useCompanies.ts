import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface Company {
  id: number;
  ruc: string;
  razon_social: string;
  nombre_comercial?: string;
  direccion?: string;
  ubigeo?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  email?: string;
  telefono?: string;
  web?: string;
  modo_produccion?: boolean;
  activo?: boolean;
  branches?: { id: number; nombre: string; codigo?: string }[];
}

export type WorkingHoursDay = { open: boolean; start: string; end: string };
export type WorkingHours = Record<string, WorkingHoursDay>;

const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { open: true, start: '08:00', end: '18:00' },
  tuesday: { open: true, start: '08:00', end: '18:00' },
  wednesday: { open: true, start: '08:00', end: '18:00' },
  thursday: { open: true, start: '08:00', end: '18:00' },
  friday: { open: true, start: '08:00', end: '18:00' },
  saturday: { open: true, start: '09:00', end: '14:00' },
  sunday: { open: false, start: '00:00', end: '00:00' },
};

export function useCompanies() {
  const [list, setList] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/companies');
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setList(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar empresas');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const createCompany = async (data: Partial<Company>) => {
    const res = await apiClient.post<{ data?: Company }>(API.companies.list, data);
    const created = res?.data ?? res;
    setList((prev) => [created as Company, ...prev]);
    toast.success('Empresa creada');
    return created as Company;
  };

  const updateCompany = async (id: number, data: Partial<Company>) => {
    const res = await apiClient.put<{ data?: Company }>(API.companies.byId(id), data);
    const updated = res?.data ?? res;
    setList((prev) => prev.map((c) => (c.id === id ? (updated as Company) : c)));
    toast.success('Empresa actualizada');
    return updated as Company;
  };

  const getCompanyConfig = async (companyId: number, section: string = 'document_settings') => {
    const res = await apiClient.get<{ data?: { config?: any }; config?: any }>(
      `${API.companies.config(companyId)}/${section}`
    );
    return (res as any)?.data?.config ?? (res as any)?.config ?? (res as any)?.data ?? res ?? {};
  };

  const updateCompanyConfig = async (
    companyId: number,
    section: string,
    data: Record<string, unknown>
  ) => {
    await apiClient.put(`${API.companies.config(companyId)}/${section}`, data);
    toast.success('Configuración guardada');
  };

  const getWorkingHours = async (companyId: number): Promise<WorkingHours> => {
    try {
      const config = await getCompanyConfig(companyId, 'document_settings');
      const wh = config?.working_hours;
      if (wh && typeof wh === 'object') {
        return { ...DEFAULT_WORKING_HOURS, ...wh } as WorkingHours;
      }
    } catch (_) {}
    return { ...DEFAULT_WORKING_HOURS };
  };

  const saveWorkingHours = async (companyId: number, workingHours: WorkingHours) => {
    await updateCompanyConfig(companyId, 'document_settings', { working_hours: workingHours });
  };

  return {
    companies: list,
    loading,
    refresh: fetchList,
    createCompany,
    updateCompany,
    getCompanyConfig,
    updateCompanyConfig,
    getWorkingHours,
    saveWorkingHours,
    DEFAULT_WORKING_HOURS,
  };
}
