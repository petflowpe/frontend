import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../utils/api/client';
import { getStoredCompanyId } from '../utils/appointmentMappers';

export interface GrowthOverview {
  loyalty_by_level: { level: string; count: number; points: number }[];
  clients_at_risk: number;
  total_active_clients: number;
  reviews_count: number;
  reviews_avg_rating: number;
  appointments_last_30_days: number;
  revenue_completed_last_30_days: number;
}

export interface AppointmentTrendPoint {
  date: string;
  appointments: number;
  revenue: number;
}

export interface GeographicClient {
  id: string;
  nombre: string;
  categoria: 'oro' | 'bronce' | 'plata';
  mascotas: number;
  mascotasActivas: number;
  distrito: string;
  direccion: string;
  gastoMensual: number;
  ultimaCita?: string;
  telefono?: string;
  citas: number;
}

export function useGrowthAnalytics() {
  const [overview, setOverview] = useState<GrowthOverview | null>(null);
  const [trends, setTrends] = useState<AppointmentTrendPoint[]>([]);
  const [geoClients, setGeoClients] = useState<GeographicClient[]>([]);
  const [segmentClients, setSegmentClients] = useState<any[]>([]);
  const [segmentDistribution, setSegmentDistribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const params = { company_id: getStoredCompanyId() };

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, tr, geo, seg] = await Promise.all([
        apiClient.get<{ data: GrowthOverview }>('/reports/growth/overview', params),
        apiClient.get<{ data: AppointmentTrendPoint[] }>('/reports/growth/appointment-trends', {
          ...params,
          days: 60,
        }),
        apiClient.get<{ data: { clients: GeographicClient[] } }>('/reports/growth/geographic', params),
        apiClient.get<{ data: { clients: any[]; distribution: any } }>(
          '/reports/growth/segmentation',
          params
        ),
      ]);
      setOverview((ov as { data?: GrowthOverview }).data ?? (ov as GrowthOverview));
      setTrends((tr as { data?: AppointmentTrendPoint[] }).data ?? []);
      const geoData = (geo as { data?: { clients: GeographicClient[] } }).data;
      setGeoClients(geoData?.clients ?? []);
      const segData = (seg as { data?: { clients: any[]; distribution: any } }).data;
      setSegmentClients(segData?.clients ?? []);
      setSegmentDistribution(segData?.distribution ?? null);
    } catch {
      setOverview(null);
      setTrends([]);
      setGeoClients([]);
      setSegmentClients([]);
      setSegmentDistribution(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    overview,
    trends,
    geoClients,
    segmentClients,
    segmentDistribution,
    loading,
    refresh,
  };
}
