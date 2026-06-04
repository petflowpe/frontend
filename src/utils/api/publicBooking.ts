import { apiClient } from './client';

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
