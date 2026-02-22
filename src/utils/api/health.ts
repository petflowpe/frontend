import { API_BASE_URL } from './config';

export interface SystemInfo {
  app_name?: string;
  env?: string;
  version?: string;
}

let cached: { ok: boolean; at: number } = { ok: false, at: 0 };
const CACHE_MS = 30_000;

/**
 * Comprueba si el backend está disponible (ruta pública GET /system/info).
 */
export async function checkApiHealth(): Promise<boolean> {
  const now = Date.now();
  if (cached.at && now - cached.at < CACHE_MS) return cached.ok;
  try {
    const res = await fetch(`${API_BASE_URL}/system/info`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    cached = { ok: res.ok, at: now };
    return res.ok;
  } catch {
    cached = { ok: false, at: now };
    return false;
  }
}

/**
 * Obtiene información del sistema desde el backend (si está disponible).
 */
export async function getSystemInfo(): Promise<SystemInfo | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/system/info`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data as SystemInfo;
  } catch {
    return null;
  }
}
