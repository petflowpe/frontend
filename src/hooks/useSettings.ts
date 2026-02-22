import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email?: boolean;
    push?: boolean;
    invoices?: boolean;
    appointments?: boolean;
  };
  dashboard?: { default_view?: string; refresh_interval?: number };
  privacy?: { show_phone?: boolean; show_email?: boolean };
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API.settings.get);
      const data = (res as { data?: UserSettings })?.data ?? (res as UserSettings);
      setSettings(Array.isArray(data) ? null : (data as UserSettings));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar configuración');
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (payload: Partial<UserSettings>) => {
    try {
      const res = await apiClient.put(API.settings.update, payload);
      const data = (res as { data?: UserSettings })?.data ?? (res as UserSettings);
      setSettings(data as UserSettings);
      toast.success('Configuración guardada');
      return data as UserSettings;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
      throw e;
    }
  }, []);

  return { settings, loading, fetchSettings, updateSettings };
}
