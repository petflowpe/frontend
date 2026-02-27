import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface Vehicle {
  id: number | string;
  name: string;
  plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  type?: string;
  status: 'active' | 'inactive' | string;
  driver?: string;
  driver_id?: number;
  location?: string;
  lastService?: string;
  nextService?: string;
  mileage?: number;
  fuelLevel?: number;
  equipment?: string[];
  activo?: boolean;
  placa?: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  fecha_ultimo_mantenimiento?: string;
  fecha_proximo_mantenimiento?: string;
  equipamiento?: string[];
  driver_name?: string;
  /** Horario de disponibilidad por día (monday..sunday: { open, start, end }) */
  horario_disponibilidad?: Record<string, { open: boolean; start: string; end: string }>;
}

const DEFAULT_COMPANY_ID = 1;

function fromBackendFormat(row: any): Vehicle {
  const driverName = row.driver?.name ?? row.driver_name ?? '';
  return {
    id: row.id,
    name: row.name || '',
    plate: row.placa ?? row.plate,
    brand: row.marca ?? row.brand,
    model: row.modelo ?? row.model,
    year: row.anio ?? row.year,
    type: row.type,
    status: row.activo === false ? 'inactive' : (row.status || 'active'),
    activo: row.activo ?? true,
    driver: driverName,
    driver_id: row.driver_id,
    driver_name: driverName,
    placa: row.placa,
    marca: row.marca,
    modelo: row.modelo,
    anio: row.anio,
    lastService: row.fecha_ultimo_mantenimiento,
    nextService: row.fecha_proximo_mantenimiento,
    fecha_ultimo_mantenimiento: row.fecha_ultimo_mantenimiento,
    fecha_proximo_mantenimiento: row.fecha_proximo_mantenimiento,
    equipment: Array.isArray(row.equipamiento) ? row.equipamiento : (row.equipment || []),
    equipamiento: row.equipamiento,
    location: row.current_latitude != null ? 'Con ubicación' : undefined,
    horario_disponibilidad: row.horario_disponibilidad ?? undefined,
  };
}

function toBackendFormat(v: Partial<Vehicle>): Record<string, unknown> {
  return {
    company_id: DEFAULT_COMPANY_ID,
    name: v.name || '',
    type: v.type || 'furgoneta_grande',
    placa: v.plate ?? v.placa ?? null,
    marca: v.brand ?? v.marca ?? null,
    modelo: v.model ?? v.modelo ?? null,
    anio: v.year ?? v.anio ?? null,
    driver_name: v.driver ?? v.driver_name ?? null,
    driver_id: v.driver_id ?? null,
    activo: v.activo ?? v.status !== 'inactive',
    fecha_ultimo_mantenimiento: v.lastService ?? v.fecha_ultimo_mantenimiento ?? null,
    fecha_proximo_mantenimiento: v.nextService ?? v.fecha_proximo_mantenimiento ?? null,
    equipamiento: v.equipment ?? v.equipamiento ?? null,
    horario_disponibilidad: v.horario_disponibilidad ?? null,
  };
}

export function useVehicles(companyId: number = DEFAULT_COMPANY_ID) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        per_page: 100,
        only_active: 0 as unknown as string,
      };
      // Incluir company_id solo si se quiere filtrar; si no se envía, el backend devuelve todos
      if (companyId != null && companyId > 0) params.company_id = companyId;

      const response = await apiClient.get<{ success?: boolean; data?: any[] } | any[]>(
        API.vehicles.list,
        params
      );
      // Aceptar: array directo, o { data: array } (por si handleApiResponse no desenvuelve)
      const raw = Array.isArray(response) ? response : response?.data;
      const list = Array.isArray(raw) ? raw : [];
      setVehicles(list.map(fromBackendFormat));
    } catch (e: any) {
      console.error('Error cargando vehículos', e);
      const isNetworkError = e?.name === 'TypeError' && e?.message === 'Failed to fetch';
      const msg = isNetworkError
        ? 'No se pudo conectar al servidor. ¿Está el backend en ejecución? (http://localhost:8000)'
        : (e?.message || 'Error cargando vehículos');
      toast.error(msg);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const createVehicle = async (data: Partial<Vehicle>) => {
    const payload = toBackendFormat(data);
    const res = await apiClient.post<{ data?: any }>(API.vehicles.list, payload);
    const created = res?.data ?? res;
    const vehicle = fromBackendFormat(created);
    setVehicles((prev) => [vehicle, ...prev]);
    toast.success('Vehículo creado');
    return vehicle;
  };

  const updateVehicle = async (id: number | string, data: Partial<Vehicle>) => {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.type !== undefined) payload.type = data.type;
    if (data.plate !== undefined || data.placa !== undefined) payload.placa = data.plate ?? data.placa;
    if (data.brand !== undefined || data.marca !== undefined) payload.marca = data.brand ?? data.marca;
    if (data.model !== undefined || data.modelo !== undefined) payload.modelo = data.model ?? data.modelo;
    if (data.year !== undefined || data.anio !== undefined) payload.anio = data.year ?? data.anio;
    if (data.driver !== undefined || data.driver_name !== undefined) payload.driver_name = data.driver ?? data.driver_name;
    if (data.driver_id !== undefined) payload.driver_id = data.driver_id;
    if (data.status !== undefined) payload.activo = data.status !== 'inactive';
    if (data.activo !== undefined) payload.activo = data.activo;
    if (data.lastService !== undefined) payload.fecha_ultimo_mantenimiento = data.lastService;
    if (data.nextService !== undefined) payload.fecha_proximo_mantenimiento = data.nextService;
    if (data.equipment !== undefined) payload.equipamiento = data.equipment;
    if (data.horario_disponibilidad !== undefined) payload.horario_disponibilidad = data.horario_disponibilidad;
    const res = await apiClient.put<{ data?: any }>(API.vehicles.byId(id), payload);
    const updated = res?.data ?? res;
    const vehicle = fromBackendFormat(updated);
    setVehicles((prev) => prev.map((v) => (String(v.id) === String(id) ? vehicle : v)));
    toast.success('Vehículo actualizado');
    return vehicle;
  };

  const deleteVehicle = async (id: number | string) => {
    await apiClient.delete(API.vehicles.byId(id));
    setVehicles((prev) => prev.filter((v) => String(v.id) !== String(id)));
    toast.success('Vehículo eliminado');
  };

  return {
    vehicles,
    loading,
    reload: loadVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
  };
}
