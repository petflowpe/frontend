/**
 * Cliente HTTP centralizado para comunicarse con el backend Laravel
 */

import { API_URL, API_PUBLIC_URL, getDefaultHeaders, handleApiResponse, ApiAuthError } from './config';

export class ApiClient {
  private token: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor(token?: string) {
    this.token = token || null;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  /** Callback opcional: se ejecuta cuando la API devuelve 401 (ej. cerrar sesión) */
  setOnUnauthorized(callback: (() => void) | null) {
    this.onUnauthorized = callback;
  }

  getToken(): string | null {
    return this.token || this.getTokenFromStorage();
  }

  private getTokenFromStorage(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    try {
      return await handleApiResponse<T>(response);
    } catch (err) {
      if (err instanceof ApiAuthError && this.onUnauthorized) {
        this.onUnauthorized();
      }
      throw err;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    usePublic: boolean = false
  ): Promise<T> {
    const token = this.getToken();
    const baseUrl = usePublic ? API_PUBLIC_URL : API_URL;
    const url = `${baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...getDefaultHeaders(token || undefined),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    return this.handleResponse<T>(response);
  }

  // Métodos para rutas públicas (sin /v1)
  async getPublic<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(endpoint + queryString, { method: 'GET' }, true);
  }

  async postPublic<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${API_PUBLIC_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config: RequestInit = {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(url, config);
    return this.handleResponse<T>(response);
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(endpoint + queryString, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, token?: string, isFormData = false): Promise<T> {
    const tokenToUse = token || this.getToken();
    const url = `${API_URL}${endpoint}`;

    const headers: HeadersInit = {};
    
    // Si es FormData, no agregar Content-Type (el navegador lo hace automáticamente)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }
    
    if (tokenToUse) {
      headers['Authorization'] = `Bearer ${tokenToUse}`;
    }

    const config: RequestInit = {
      method: 'POST',
      headers,
      body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
    };

    const response = await fetch(url, config);
    return handleApiResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any, isFormData = false): Promise<T> {
    const headers: HeadersInit = {};
    if (!isFormData && data) headers['Content-Type'] = 'application/json';
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const url = `${API_URL}${endpoint}`;
    const body = data ? (isFormData ? data : JSON.stringify(data)) : undefined;
    const response = await fetch(url, { method: 'PUT', headers, body });
    return handleApiResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Descargar archivo (PDF, XML, etc.) desde la API.
   * El backend devuelve un stream; se descarga en el navegador con el nombre indicado.
   */
  async downloadFile(endpoint: string, filename: string): Promise<void> {
    const token = this.getToken();
    const url = `${API_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Accept': 'application/octet-stream, application/pdf, application/xml, text/xml',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      const errText = await response.text();
      let message = `Error ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        message = errJson.message || message;
      } catch (_) {}
      throw new Error(message);
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition');
    const suggestedName = disposition?.match(/filename="?([^";]+)"?/)?.[1]?.trim() || filename;
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  }
}

// Instancia singleton
export const apiClient = new ApiClient();
