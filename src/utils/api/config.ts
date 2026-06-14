/**
 * Configuración centralizada de la API
 * Reemplaza Supabase con el backend Laravel
 */

function normalizeApiBaseUrl(raw: string | undefined): string {
  const fallback = import.meta.env.PROD
    ? 'https://srv1197160.hstgr.cloud/api'
    : 'http://127.0.0.1:8000/api';
  const value = (raw || fallback).trim();
  if (!value) return fallback;
  // Si no tiene protocolo, el navegador lo trata como ruta relativa (p. ej. en Vercel)
  if (!/^https?:\/\//i.test(value)) {
    return `https://${value.replace(/^\/+/, '')}${value.includes('/api') ? '' : '/api'}`;
  }
  return value;
}

// URL base del backend Laravel (debe ser URL completa: https://dominio.com/api)
export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

// Versión de la API (solo para rutas protegidas)
export const API_VERSION = 'v1';

// URL para rutas públicas (sin /v1)
export const API_PUBLIC_URL = API_BASE_URL;

// URL para rutas protegidas (con /v1)
export const API_URL = `${API_BASE_URL}/${API_VERSION}`;

// Headers por defecto
export const getDefaultHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Función helper para hacer requests
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> => {
  const url = `${API_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getDefaultHeaders(token),
      ...options.headers,
    },
  };

  return fetch(url, config);
};

/** Error con detalles de validación (422) */
export class ApiValidationError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

/** Error de autenticación (401) */
export class ApiAuthError extends Error {
  constructor(message: string = 'Sesión expirada o no autorizado', public status: number = 401) {
    super(message);
    this.name = 'ApiAuthError';
  }
}

// Función helper para manejar respuestas
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Error desconocido' }));
    const message = errorBody.message || `Error ${response.status}: ${response.statusText}`;

    if (response.status === 401) {
      throw new ApiAuthError(message, 401);
    }
    if (response.status === 422 && errorBody.errors) {
      throw new ApiValidationError(message, 422, errorBody.errors);
    }

    const err = new Error(message) as Error & { status?: number; errors?: Record<string, string[]> };
    err.status = response.status;
    err.errors = errorBody.errors;
    throw err;
  }

  const data = await response.json();

  // Laravel devuelve { success: true, data: ..., meta?: ... } (paginado) o { success, data }
  if (data && typeof data === 'object' && 'success' in data) {
    // Respuestas paginadas: devolver { data, meta } para que el frontend tenga ambos
    if (data.meta !== undefined && data.data !== undefined) {
      return { data: data.data, meta: data.meta } as T;
    }
    return (data.data !== undefined ? data.data : data) as T;
  }

  return data as T;
};

/** Extrae eventos de GET /pets/{id}/timeline (handleApiResponse ya desenvuelve `data`). */
export function extractPetTimeline(response: unknown): unknown[] {
  if (!response || typeof response !== 'object') return [];
  const payload = response as Record<string, unknown>;
  if (Array.isArray(payload.timeline)) return payload.timeline;
  const nested = payload.data;
  if (nested && typeof nested === 'object') {
    const timeline = (nested as Record<string, unknown>).timeline;
    if (Array.isArray(timeline)) return timeline;
  }
  return [];
}
