import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface CalendarConfig {
  show_weekends: boolean;
  interval_minutes: 5 | 10 | 15 | 30 | 60;
  first_day_of_week: number;
  first_hour: number;
  last_hour: number;
  show_day_view_option: boolean;
  day_view_first_hour: number;
  day_view_last_hour: number;
  default_view_current_day: boolean;
  allow_booking_outside_hours: boolean;
  worked_hours_per_day: number;
  daily_plan_enabled: boolean;
  internal_reservations_enabled: boolean;
  client_labels_enabled: boolean;
  create_task_unpaid_invoices: boolean;
  show_schedules_shift_types: boolean;
  change_colors_by_status_reason: boolean;
  show_only_national_holidays: boolean;
  warn_if_no_visit_reason: boolean;
}

const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  show_weekends: true,
  interval_minutes: 15,
  first_day_of_week: 1,
  first_hour: 8,
  last_hour: 20,
  show_day_view_option: true,
  day_view_first_hour: 8,
  day_view_last_hour: 18,
  default_view_current_day: true,
  allow_booking_outside_hours: false,
  worked_hours_per_day: 8,
  daily_plan_enabled: false,
  internal_reservations_enabled: false,
  client_labels_enabled: true,
  create_task_unpaid_invoices: false,
  show_schedules_shift_types: false,
  change_colors_by_status_reason: false,
  show_only_national_holidays: false,
  warn_if_no_visit_reason: false,
};

export function useCalendarConfig(companyId: number | string | null | undefined) {
  const [config, setConfig] = useState<CalendarConfig>(DEFAULT_CALENDAR_CONFIG);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    if (companyId == null) {
      setConfig(DEFAULT_CALENDAR_CONFIG);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<{ data?: { config?: CalendarConfig; section?: string } }>(
        API.companies.configSection(companyId, 'calendar_settings')
      );
      const raw = res as { data?: { config?: CalendarConfig } };
      const data = raw?.data?.config ?? (res as { config?: CalendarConfig })?.config ?? (res as CalendarConfig);
      const merged = { ...DEFAULT_CALENDAR_CONFIG, ...(typeof data === 'object' && data && !Array.isArray(data) ? data : {}) };
      setConfig(merged as CalendarConfig);
    } catch {
      setConfig(DEFAULT_CALENDAR_CONFIG);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = useCallback(async (payload: Partial<CalendarConfig>) => {
    if (companyId == null) {
      toast.error('No hay empresa seleccionada');
      throw new Error('companyId required');
    }
    try {
      const res = await apiClient.put<{ data?: { config?: CalendarConfig } }>(
        API.companies.configSection(companyId, 'calendar_settings'),
        payload
      );
      const raw = res as { data?: { config?: CalendarConfig } };
      const data = raw?.data?.config ?? (res as { config?: CalendarConfig })?.config;
      const merged = { ...DEFAULT_CALENDAR_CONFIG, ...config, ...(typeof data === 'object' && data && !Array.isArray(data) ? data : payload) };
      setConfig(merged as CalendarConfig);
      toast.success('Configuración de calendario guardada');
      return merged as CalendarConfig;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
      throw e;
    }
  }, [companyId, config]);

  return { config, loading, fetchConfig, updateConfig, defaultConfig: DEFAULT_CALENDAR_CONFIG };
}
