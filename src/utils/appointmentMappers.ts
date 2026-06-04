import type { Appointment } from '../hooks/useAppointments';

export type AppointmentStatusKey =
  | 'pending'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

const STATUS_FROM_BACKEND: Record<string, AppointmentStatusKey> = {
  pendiente: 'pending',
  confirmada: 'confirmed',
  'en proceso': 'in-progress',
  completada: 'completed',
  cancelada: 'cancelled',
  pending: 'pending',
  confirmed: 'confirmed',
  'in-progress': 'in-progress',
  completed: 'completed',
  cancelled: 'cancelled',
};

const STATUS_TO_BACKEND: Record<AppointmentStatusKey, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  'in-progress': 'En Proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export function normalizeStatusFromBackend(status?: string | null): AppointmentStatusKey {
  if (!status) return 'pending';
  const key = status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  return STATUS_FROM_BACKEND[key] ?? 'pending';
}

export function normalizeStatusToBackend(status?: string | null): string | undefined {
  if (!status) return undefined;
  const fromKey = STATUS_TO_BACKEND[status as AppointmentStatusKey];
  if (fromKey) return fromKey;
  const normalized = normalizeStatusFromBackend(status);
  return STATUS_TO_BACKEND[normalized];
}

export function normalizeTimeFromBackend(time?: string | null): string {
  if (!time) return '';
  const t = String(time).trim();
  if (t.includes('T')) {
    try {
      const d = new Date(t);
      if (!Number.isNaN(d.getTime())) {
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }
    } catch {
      /* ignore */
    }
  }
  return t.length >= 5 ? t.slice(0, 5) : t;
}

export function normalizeDateFromBackend(date?: string | null): string {
  if (!date) return '';
  const d = String(date).trim();
  if (d.includes('T')) return d.slice(0, 10);
  return d.length >= 10 ? d.slice(0, 10) : d;
}

export function getStoredCompanyId(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = localStorage.getItem('smartpet_user');
    if (!raw) return 1;
    const user = JSON.parse(raw);
    const id = user?.companyId ?? user?.company_id;
    const n = parseInt(String(id), 10);
    return Number.isInteger(n) && n > 0 ? n : 1;
  } catch {
    return 1;
  }
}

export function inferServiceCategory(serviceName: string, hint?: string): 'MovilVet' | 'Peluquería' {
  const text = `${serviceName} ${hint || ''}`.toLowerCase();
  if (
    text.includes('pelu') ||
    text.includes('baño') ||
    text.includes('bano') ||
    text.includes('groom') ||
    text.includes('corte')
  ) {
    return 'Peluquería';
  }
  return 'MovilVet';
}

export function mapRecurrenceTypeToBackend(
  type?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
): 'daily' | 'weekly' | 'monthly' {
  if (type === 'daily' || type === 'monthly') return type;
  return 'weekly';
}
