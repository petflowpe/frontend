export type BookingSource = 'staff' | 'portal_auth' | 'public_guest';

export function normalizeBookingSource(value?: string | null): BookingSource {
  if (value === 'portal_auth' || value === 'public_guest') return value;
  return 'staff';
}

export function getBookingSourceLabel(source?: string | null): string {
  switch (normalizeBookingSource(source)) {
    case 'portal_auth':
      return 'Portal';
    case 'public_guest':
      return 'Invitado';
    default:
      return 'Staff';
  }
}

export function getBookingSourceBadgeClass(source?: string | null): string {
  switch (normalizeBookingSource(source)) {
    case 'portal_auth':
      return 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700';
    case 'public_guest':
      return 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950/50 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200 border-slate-300 dark:border-slate-700';
  }
}

export function isPortalBooking(source?: string | null): boolean {
  return normalizeBookingSource(source) === 'portal_auth';
}

export function matchesBookingSourceFilter(
  appointmentSource: string | undefined | null,
  filter: string
): boolean {
  if (!filter || filter === 'all') return true;
  return normalizeBookingSource(appointmentSource) === filter;
}
