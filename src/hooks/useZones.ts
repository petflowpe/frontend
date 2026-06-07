import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface Zone {
  id: number;
  name: string;
  color?: string;
  districts?: string[];
  coverage?: string;
  demand?: number;
  coordinates?: {
    center?: { lat: number; lng: number };
    radius?: number;
  };
  active?: boolean;
}

export type ZonePayload = {
  name: string;
  color?: string;
  districts?: string[];
  coverage?: string;
  demand?: number;
  coordinates?: Zone['coordinates'];
  active?: boolean;
};

function unwrapList(res: unknown): Zone[] {
  if (Array.isArray(res)) return res as Zone[];
  if (res && typeof res === 'object' && 'data' in res) {
    const data = (res as { data?: unknown }).data;
    return Array.isArray(data) ? (data as Zone[]) : [];
  }
  return [];
}

function unwrapOne<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export function useZones(onlyActive = false) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  const loadZones = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (onlyActive) params.only_active = 1;
      const res = await apiClient.get(API.zones.list, params);
      setZones(unwrapList(res));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error cargando zonas';
      toast.error(msg);
      setZones([]);
    } finally {
      setLoading(false);
    }
  }, [onlyActive]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const createZone = async (payload: ZonePayload) => {
    const res = await apiClient.post(API.zones.list, payload);
    const created = unwrapOne<Zone>(res);
    setZones((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    toast.success('Zona creada');
    return created;
  };

  const updateZone = async (id: number, payload: Partial<ZonePayload>) => {
    const res = await apiClient.put(API.zones.byId(id), payload);
    const updated = unwrapOne<Zone>(res);
    setZones((prev) => prev.map((z) => (z.id === id ? updated : z)));
    toast.success('Zona actualizada');
    return updated;
  };

  const deleteZone = async (id: number) => {
    await apiClient.delete(API.zones.byId(id));
    setZones((prev) => prev.filter((z) => z.id !== id));
    toast.success('Zona eliminada');
  };

  return {
    zones,
    loading,
    reload: loadZones,
    createZone,
    updateZone,
    deleteZone,
  };
}
