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
  /** VIN / número de chasis */
  vin?: string;
  /** Fecha de vencimiento de seguro (ISO date yyyy-mm-dd) */
  insurance?: string;
  /** Fecha de vencimiento ITV (ISO date yyyy-mm-dd) */
  itv?: string;
  lastService?: string;
  nextService?: string;
  mileage?: number;
  fuelLevel?: number;
  efficiency?: number;
  equipment?: string[];
  activo?: boolean;
  placa?: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  zona_operacion?: string;
  kilometraje?: number;
  nivel_combustible?: number;
  eficiencia?: number;
  fecha_seguro?: string;
  fecha_itv?: string;
  fecha_ultimo_mantenimiento?: string;
  fecha_proximo_mantenimiento?: string;
  equipamiento?: string[];
  ultimo_cumplimiento_inspeccion?: number;
  fecha_ultima_inspeccion?: string;
  indice_chofer?: number;
  puntos_observacion_chofer?: number;
  observaciones_inspeccion_acumuladas?: string;
  driver_name?: string;
  /** Horario de disponibilidad por día (monday..sunday: { open, start, end }) */
  horario_disponibilidad?: Record<string, { open: boolean; start: string; end: string }>;
}


function fromBackendFormat(row: any): Vehicle {
  const driverName = row.driver?.name ?? row.driver_name ?? '';
  const explicitStatus = typeof row?.status === 'string' ? row.status : '';
  const status = explicitStatus
    ? explicitStatus
    : (row.activo === false ? 'out_of_service' : 'active');

  const zonaOperacion = row.zona_operacion ?? row.zonaOperacion ?? undefined;
  const location = zonaOperacion
    ? String(zonaOperacion)
    : (row.current_latitude != null ? 'Con ubicación' : undefined);

  return {
    id: row.id,
    name: row.name || '',
    plate: row.placa ?? row.plate,
    brand: row.marca ?? row.brand,
    model: row.modelo ?? row.model,
    year: row.anio ?? row.year,
    type: row.type,
    status,
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
    vin: row.vin ?? undefined,
    location,
    insurance: row.fecha_seguro ?? row.insurance ?? undefined,
    itv: row.fecha_itv ?? row.itv ?? undefined,
    mileage: row.kilometraje ?? row.mileage ?? undefined,
    fuelLevel: row.nivel_combustible ?? row.fuelLevel ?? undefined,
    efficiency: row.eficiencia ?? row.efficiency ?? undefined,
    zona_operacion: row.zona_operacion ?? undefined,
    kilometraje: row.kilometraje ?? undefined,
    nivel_combustible: row.nivel_combustible ?? undefined,
    eficiencia: row.eficiencia ?? undefined,
    fecha_seguro: row.fecha_seguro ?? undefined,
    fecha_itv: row.fecha_itv ?? undefined,
    fecha_ultimo_mantenimiento: row.fecha_ultimo_mantenimiento,
    fecha_proximo_mantenimiento: row.fecha_proximo_mantenimiento,
    ultimo_cumplimiento_inspeccion: row.ultimo_cumplimiento_inspeccion != null ? Number(row.ultimo_cumplimiento_inspeccion) : undefined,
    fecha_ultima_inspeccion: row.fecha_ultima_inspeccion ?? undefined,
    indice_chofer: row.indice_chofer != null ? Number(row.indice_chofer) : undefined,
    puntos_observacion_chofer: row.puntos_observacion_chofer != null ? Number(row.puntos_observacion_chofer) : undefined,
    observaciones_inspeccion_acumuladas: row.observaciones_inspeccion_acumuladas ?? undefined,
    equipment: Array.isArray(row.equipamiento) ? row.equipamiento : (row.equipment || []),
    equipamiento: row.equipamiento,
    horario_disponibilidad: row.horario_disponibilidad ?? undefined,
  };
}

function toBackendFormat(v: Partial<Vehicle>): Record<string, unknown> {
  const status = (v as any)?.status;
  let activo: boolean | undefined = v.activo;
  if (activo === undefined) {
    if (status === 'out_of_service' || status === 'inactive') activo = false;
    else if (typeof status === 'string' && status.length) activo = true;
    else activo = true;
  }
  return {
    name: v.name || '',
    type: v.type || 'furgoneta_grande',
    placa: v.plate ?? v.placa ?? null,
    marca: v.brand ?? v.marca ?? null,
    modelo: v.model ?? v.modelo ?? null,
    vin: v.vin ?? null,
    zona_operacion: v.location ?? v.zona_operacion ?? null,
    anio: v.year ?? v.anio ?? null,
    kilometraje: v.mileage ?? v.kilometraje ?? null,
    nivel_combustible: v.fuelLevel ?? v.nivel_combustible ?? null,
    eficiencia: v.efficiency ?? v.eficiencia ?? null,
    driver_name: v.driver ?? v.driver_name ?? null,
    driver_id: v.driver_id ?? null,
    activo,
    status_override:
      status === 'maintenance'
        ? 'maintenance'
        : (status === 'out_of_service' || status === 'inactive' ? 'out_of_service' : 'active'),
    fecha_ultimo_mantenimiento: v.lastService ?? v.fecha_ultimo_mantenimiento ?? null,
    fecha_proximo_mantenimiento: v.nextService ?? v.fecha_proximo_mantenimiento ?? null,
    fecha_seguro: v.insurance ?? v.fecha_seguro ?? null,
    fecha_itv: v.itv ?? v.fecha_itv ?? null,
    equipamiento: v.equipment ?? v.equipamiento ?? null,
    horario_disponibilidad: v.horario_disponibilidad ?? null,
  };
}

export function useVehicles(companyId?: number | null) {
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
    if (data.vin !== undefined) payload.vin = data.vin;
    if (data.location !== undefined || data.zona_operacion !== undefined) payload.zona_operacion = data.location ?? data.zona_operacion;
    if (data.mileage !== undefined || data.kilometraje !== undefined) payload.kilometraje = data.mileage ?? data.kilometraje;
    if (data.fuelLevel !== undefined || data.nivel_combustible !== undefined) payload.nivel_combustible = data.fuelLevel ?? data.nivel_combustible;
    if (data.efficiency !== undefined || data.eficiencia !== undefined) payload.eficiencia = data.efficiency ?? data.eficiencia;
    if (data.insurance !== undefined || data.fecha_seguro !== undefined) payload.fecha_seguro = data.insurance ?? data.fecha_seguro;
    if (data.itv !== undefined || data.fecha_itv !== undefined) payload.fecha_itv = data.itv ?? data.fecha_itv;
    if (data.driver !== undefined || data.driver_name !== undefined) payload.driver_name = data.driver ?? data.driver_name;
    if (data.driver_id !== undefined) payload.driver_id = data.driver_id;
    if (data.status !== undefined) {
      const mapped =
        data.status === 'maintenance'
          ? 'maintenance'
          : (data.status === 'out_of_service' || data.status === 'inactive' ? 'out_of_service' : 'active');
      payload.status_override = mapped;
      payload.activo = mapped === 'out_of_service' ? false : true;
    }
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
