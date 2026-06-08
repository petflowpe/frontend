import { apiClient } from './client';
import { getStoredCompanyId } from '../appointmentMappers';

let cachedPortalCompanyId: number | null = null;

export interface PublicBookingService {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  service_category: 'MovilVet' | 'Peluquería';
  price: number;
  duration: number;
}

export interface PublicTimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface PublicBookingPayload {
  client: {
    tipo_documento: string;
    numero_documento: string;
    razon_social: string;
    telefono: string;
    email?: string;
    direccion: string;
    distrito: string;
    provincia?: string;
    departamento?: string;
  };
  pet: {
    name: string;
    species: 'Perro' | 'Gato' | 'Otro';
    breed?: string;
    age?: number;
    weight?: number;
  };
  appointment: {
    service_type: string;
    service_name: string;
    service_category: 'MovilVet' | 'Peluquería';
    service_id?: number;
    date: string;
    time: string;
    duration: number;
    price: number;
    payment_method?: string;
    notes?: string;
  };
}

export interface PortalSettings {
  guest_booking_enabled: boolean;
  registered_only: boolean;
  require_advance: boolean;
  advance_type: 'percent' | 'fixed';
  advance_value: number;
  payment_mode: 'simulated' | 'gateway';
  auto_confirm_on_advance: boolean;
  new_clients_require_approval: boolean;
}

export interface PortalBookingConfig {
  company_id: number;
  working_hours?: Record<string, { open: boolean; start: string; end: string }> | null;
  portal_settings: PortalSettings;
}

export interface PublicTrackingData {
  code: string;
  status: string;
  status_label: string;
  service: { name: string; price: number };
  pet: { name?: string; breed?: string; species?: string };
  schedule: { date?: string; time?: string; address?: string; district?: string };
  driver?: { name: string; vehicle?: string; phone?: string | null } | null;
}

function unwrapData<T>(res: { data?: T } & T): T {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined) {
    return res.data as T;
  }
  return res as T;
}

/** Empresa del portal público (config backend o sesión staff). */
export async function getPortalCompanyId(hint?: number | null): Promise<number> {
  if (hint != null && Number.isInteger(hint) && hint > 0) return hint;
  const stored = getStoredCompanyId();
  if (stored) return stored;
  if (cachedPortalCompanyId) return cachedPortalCompanyId;
  try {
    const res = await apiClient.getPublic<{ data?: { company_id?: number }; company_id?: number }>(
      '/public/booking/config'
    );
    const id = res?.data?.company_id ?? res?.company_id;
    if (id != null && Number.isInteger(id) && id > 0) {
      cachedPortalCompanyId = id;
      return id;
    }
  } catch {
    // fallback abajo
  }
  return 1;
}

export async function fetchPortalBookingConfig(): Promise<PortalBookingConfig> {
  const res = await apiClient.getPublic<{ data?: PortalBookingConfig }>('/public/booking/config');
  const data = unwrapData(res);
  return {
    company_id: data?.company_id ?? 1,
    working_hours: data?.working_hours ?? null,
    portal_settings: {
      guest_booking_enabled: false,
      registered_only: true,
      require_advance: true,
      advance_type: 'percent',
      advance_value: 30,
      payment_mode: 'simulated',
      auto_confirm_on_advance: true,
      new_clients_require_approval: true,
      ...(data?.portal_settings ?? {}),
    },
  };
}

export function calculatePortalAdvance(totalPrice: number, settings: PortalSettings): number {
  if (!settings.require_advance) return 0;
  const value = Number(settings.advance_value) || 0;
  if (settings.advance_type === 'fixed') {
    return Math.round(Math.min(value, totalPrice) * 100) / 100;
  }
  return Math.round(totalPrice * (value / 100) * 100) / 100;
}

export function mapPortalPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    card: 'Tarjeta',
    yape: 'Yape',
    plin: 'Plin',
    cash: 'Efectivo',
  };
  return map[method] ?? 'Tarjeta';
}

export async function payAppointmentAdvance(
  appointmentId: string | number,
  payload: { payment_method: string; reference?: string }
): Promise<any> {
  return apiClient.post(`/appointments/${appointmentId}/pay-advance`, payload);
}

export async function fetchPublicBookingServices(): Promise<PublicBookingService[]> {
  const res = await apiClient.getPublic<{ success?: boolean; data?: PublicBookingService[] }>(
    '/public/booking/services'
  );
  return unwrapData(res) ?? [];
}

export async function fetchPublicAvailability(
  date: string,
  district?: string,
  duration?: number
): Promise<{ slots: PublicTimeSlot[]; coverage_note?: string | null }> {
  const res = await apiClient.getPublic<{
    success?: boolean;
    data?: { slots: PublicTimeSlot[]; coverage_note?: string | null };
  }>('/public/booking/availability', {
    date,
    ...(district ? { district } : {}),
    ...(duration ? { duration } : {}),
  });
  const data = unwrapData(res);
  return {
    slots: data?.slots ?? [],
    coverage_note: data?.coverage_note ?? null,
  };
}

export async function submitPublicBooking(
  payload: PublicBookingPayload
): Promise<{ tracking_code: string; appointment_id: number }> {
  const res = await apiClient.postPublic<{
    success?: boolean;
    data?: { tracking_code: string; appointment_id: number };
    message?: string;
  }>('/public/booking', payload);

  const data = unwrapData(res);
  if (!data?.tracking_code) {
    throw new Error((res as { message?: string }).message || 'No se pudo crear la reserva');
  }
  return data;
}

export async function fetchPublicTracking(code: string): Promise<PublicTrackingData> {
  const normalized = encodeURIComponent(code.trim().toUpperCase());
  const res = await apiClient.getPublic<{ success?: boolean; data?: PublicTrackingData }>(
    `/public/booking/track/${normalized}`
  );
  const data = unwrapData(res);
  if (!data?.code) {
    throw new Error('Reserva no encontrada');
  }
  return data;
}

export function mapPetTypeToSpecies(petType: string): 'Perro' | 'Gato' | 'Otro' {
  if (petType === 'dog' || petType === 'Perro') return 'Perro';
  if (petType === 'cat' || petType === 'Gato') return 'Gato';
  return 'Otro';
}

export function formatDateForApi(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
