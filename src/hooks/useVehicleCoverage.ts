import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface CoverageZone {
  id: number;
  name: string;
  color?: string;
  districts?: string[];
  active?: boolean;
}

export interface VehicleCoverageRule {
  id: number;
  vehicle_id: number;
  zone_id: number;
  districts: string[];
  days: string[];
  start_time: string;
  end_time: string;
  priority: number;
  max_daily_appointments?: number | null;
  active: boolean;
  notes?: string | null;
  zone?: CoverageZone;
}

export const COVERAGE_DAY_LABELS: Record<string, string> = {
  monday: 'Lun',
  tuesday: 'Mar',
  wednesday: 'Mié',
  thursday: 'Jue',
  friday: 'Vie',
  saturday: 'Sáb',
  sunday: 'Dom',
};

export const COVERAGE_DAYS = Object.keys(COVERAGE_DAY_LABELS);

export type CoverageRulePayload = {
  zone_id: number;
  districts: string[];
  days: string[];
  start_time: string;
  end_time: string;
  priority?: number;
  max_daily_appointments?: number | null;
  active?: boolean;
  notes?: string | null;
};

export interface AvailableVehicle {
  id: number | string;
  name: string;
  placa?: string;
  type?: string;
}

function normalizeTime(value: string): string {
  return String(value || '').slice(0, 5);
}

export async function fetchAvailableVehicles(
  district: string,
  date: string,
  time: string,
  companyId?: number
): Promise<AvailableVehicle[]> {
  if (!district?.trim() || !date || !time) {
    return [];
  }

  const params: Record<string, string | number> = {
    district: district.trim(),
    date,
    time: normalizeTime(time),
  };
  if (companyId != null && companyId > 0) {
    params.company_id = companyId;
  }

  const response = await apiClient.get<{ success?: boolean; data?: AvailableVehicle[] }>(
    API.vehicles.coverageRules.availableVehicles,
    params
  );
  const list = Array.isArray(response) ? response : (response?.data ?? []);
  return Array.isArray(list) ? list : [];
}

export function useAvailableVehiclesForAppointment<T extends { id: number | string }>(
  district: string | undefined,
  date: string | undefined,
  time: string | undefined,
  allVehicles: T[],
  companyId?: number
) {
  const [availableIds, setAvailableIds] = useState<Set<string> | null>(null);
  const [loadingCoverage, setLoadingCoverage] = useState(false);

  useEffect(() => {
    if (!district?.trim() || !date || !time) {
      setAvailableIds(null);
      setLoadingCoverage(false);
      return;
    }

    let cancelled = false;
    setLoadingCoverage(true);

    fetchAvailableVehicles(district, date, time, companyId)
      .then((list) => {
        if (cancelled) return;
        setAvailableIds(new Set(list.map((v) => String(v.id))));
      })
      .catch(() => {
        if (!cancelled) setAvailableIds(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingCoverage(false);
      });

    return () => {
      cancelled = true;
    };
  }, [district, date, time, companyId]);

  const filteredVehicles = useMemo(() => {
    if (!availableIds) return allVehicles;
    if (availableIds.size === 0) return [];
    return allVehicles.filter((v) => availableIds.has(String(v.id)));
  }, [allVehicles, availableIds]);

  return {
    filteredVehicles,
    loadingCoverage,
    hasCoverageFilter: availableIds !== null,
    coverageCount: availableIds?.size ?? null,
  };
}

export function useVehicleCoverage(vehicleId?: number | string | null) {
  const [rules, setRules] = useState<VehicleCoverageRule[]>([]);
  const [zones, setZones] = useState<CoverageZone[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);

  const loadZones = useCallback(async () => {
    setLoadingZones(true);
    try {
      const response = await apiClient.get<{ success?: boolean; data?: CoverageZone[] }>(
        API.zones.list,
        { only_active: 1 }
      );
      const list = Array.isArray(response) ? response : (response?.data ?? []);
      setZones(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast.error(e?.message || 'Error cargando zonas');
      setZones([]);
    } finally {
      setLoadingZones(false);
    }
  }, []);

  const loadRules = useCallback(async () => {
    if (!vehicleId) {
      setRules([]);
      return;
    }
    setLoadingRules(true);
    try {
      const response = await apiClient.get<{ success?: boolean; data?: VehicleCoverageRule[] }>(
        API.vehicles.coverageRules.byVehicle(vehicleId)
      );
      const list = Array.isArray(response) ? response : (response?.data ?? []);
      setRules(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast.error(e?.message || 'Error cargando reglas de cobertura');
      setRules([]);
    } finally {
      setLoadingRules(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const createRule = useCallback(async (payload: CoverageRulePayload) => {
    if (!vehicleId) throw new Error('Guarda el vehículo antes de agregar reglas.');
    const body = {
      ...payload,
      start_time: normalizeTime(payload.start_time),
      end_time: normalizeTime(payload.end_time),
    };
    await apiClient.post(API.vehicles.coverageRules.byVehicle(vehicleId), body);
    await loadRules();
  }, [vehicleId, loadRules]);

  const updateRule = useCallback(async (ruleId: number, payload: Partial<CoverageRulePayload>) => {
    const body = { ...payload };
    if (body.start_time) body.start_time = normalizeTime(body.start_time);
    if (body.end_time) body.end_time = normalizeTime(body.end_time);
    await apiClient.put(API.vehicles.coverageRules.byId(ruleId), body);
    await loadRules();
  }, [loadRules]);

  const deleteRule = useCallback(async (ruleId: number) => {
    await apiClient.delete(API.vehicles.coverageRules.byId(ruleId));
    await loadRules();
  }, [loadRules]);

  return {
    rules,
    zones,
    loadingRules,
    loadingZones,
    loadRules,
    createRule,
    updateRule,
    deleteRule,
  };
}
