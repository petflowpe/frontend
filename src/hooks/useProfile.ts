import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface Profile {
  id: number;
  name: string;
  email: string;
  role_id?: number;
  role?: string;
  role_display?: string;
  company_id?: number;
  company?: string;
  locale?: string;
  avatar_url?: string;
  phone?: string;
  position?: string;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(API.profile.get);
      const data = (res as { data?: Profile })?.data ?? (res as Profile);
      setProfile(Array.isArray(data) ? null : (data as Profile));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar perfil');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (payload: {
    name?: string;
    email?: string;
    current_password?: string;
    password?: string;
    phone?: string;
    position?: string;
    locale?: string;
    avatar?: File;
  }) => {
    try {
      const body: Record<string, unknown> = {};
      if (payload.name != null) body.name = payload.name;
      if (payload.email != null) body.email = payload.email;
      if (payload.locale != null) body.locale = payload.locale;
      if (payload.current_password != null) body.current_password = payload.current_password;
      if (payload.password != null) body.password = payload.password;
      if (payload.phone != null) body.phone = payload.phone;
      if (payload.position != null) body.position = payload.position;

      if (payload.avatar) {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        Object.entries(body).forEach(([k, v]) => formData.append(k, String(v)));
        formData.append('avatar', payload.avatar);
        const res = await apiClient.post(API.profile.update, formData, undefined, true);
        const out = (res as { data?: Profile })?.data ?? (res as Profile);
        setProfile(out as Profile);
        toast.success('Perfil actualizado');
        return out as Profile;
      }

      const res = await apiClient.put(API.profile.update, Object.keys(body).length ? body : undefined);
      const out = (res as { data?: Profile })?.data ?? (res as Profile);
      setProfile(out as Profile);
      toast.success('Perfil actualizado');
      return out as Profile;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar perfil');
      throw e;
    }
  }, []);

  return { profile, loading, fetchProfile, updateProfile };
}
