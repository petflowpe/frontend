import { useCallback, useState } from 'react';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface RouteStopItem {
  order: number;
  appointment_id: number;
  client_id: number;
  time: string;
  duration: number;
  status: string;
  service_name: string;
  service_category?: string;
  address?: string;
  district?: string;
  tracking_code?: string;
  client?: { id: number; name?: string; phone?: string };
  pet?: { id: number; name?: string; species?: string; breed?: string };
}

export interface DailyScheduleData {
  date: string;
  vehicle: {
    id: number;
    name: string;
    placa?: string;
    driver_name?: string;
  } | null;
  stops: RouteStopItem[];
  route_plan?: { id: number; status: string; name: string } | null;
  stats: {
    total: number;
    completed: number;
    pending: number;
    in_progress: number;
  };
  message?: string;
}

function unwrap<T>(res: { data?: T } & T): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data?: T }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export function useRoutePlans() {
  const [loading, setLoading] = useState(false);

  const fetchDailySchedule = useCallback(
    async (vehicleId: number, date: string): Promise<DailyScheduleData> => {
      setLoading(true);
      try {
        const res = await apiClient.get<{ data?: DailyScheduleData }>(
          API.routePlans.dailySchedule,
          { vehicle_id: vehicleId, date }
        );
        return unwrap(res);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchDriverDay = useCallback(async (date?: string): Promise<DailyScheduleData> => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ data?: DailyScheduleData }>(
        API.driver.day,
        date ? { date } : undefined
      );
      return unwrap(res);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRouteFromAppointments = useCallback(
    async (params: {
      vehicleId: number;
      date: string;
      appointmentIds: number[];
      status?: string;
      name?: string;
    }) => {
      setLoading(true);
      try {
        const res = await apiClient.post<{ data?: unknown }>(
          API.routePlans.fromAppointments,
          {
            vehicle_id: params.vehicleId,
            date: params.date,
            appointment_ids: params.appointmentIds,
            status: params.status,
            name: params.name,
          }
        );
        return unwrap(res);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateRouteStatus = useCallback(async (routeId: number, status: string) => {
    const res = await apiClient.put<{ data?: unknown }>(API.routePlans.update(routeId), { status });
    return unwrap(res);
  }, []);

  return {
    loading,
    fetchDailySchedule,
    fetchDriverDay,
    saveRouteFromAppointments,
    updateRouteStatus,
  };
}
