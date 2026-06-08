/** Estilos y etiquetas unificadas para citas en todas las vistas del calendario */

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  'in-progress': 'En Proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
};

export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function getAppointmentBlockClasses(
  status: string,
  opts?: { recurring?: boolean; unconfirmed?: boolean; portal?: boolean }
): string {
  const base =
    status === 'pending'
      ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/35 dark:border-amber-700 dark:text-amber-100'
      : status === 'confirmed'
        ? 'bg-green-100 border-green-300 text-green-900 dark:bg-green-900/35 dark:border-green-700 dark:text-green-100'
        : status === 'in-progress'
          ? 'bg-violet-100 border-violet-300 text-violet-900 dark:bg-violet-900/35 dark:border-violet-700 dark:text-violet-100'
          : status === 'completed'
            ? 'bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-900/35 dark:border-blue-700 dark:text-blue-100'
            : status === 'cancelled'
              ? 'bg-red-50 border-red-200 text-red-700 line-through opacity-75 dark:bg-red-950/30 dark:border-red-800'
              : status === 'no_show'
                ? 'bg-slate-200 border-slate-400 text-slate-600 dark:bg-slate-800 dark:border-slate-600'
                : 'bg-gray-100 border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600';

  const extras = [
    opts?.recurring ? 'border-dashed ring-1 ring-inset ring-primary/30' : '',
    opts?.unconfirmed ? 'ring-2 ring-amber-400/60' : '',
    opts?.portal ? 'ring-1 ring-indigo-400/70 border-l-2 border-l-indigo-500' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `${base} ${extras}`.trim();
}

export function getMonthChipClasses(status: string): string {
  return getAppointmentBlockClasses(status);
}

export const LEGEND_ITEMS = [
  { status: 'pending', label: 'Pendiente', dot: 'bg-amber-400' },
  { status: 'confirmed', label: 'Confirmada', dot: 'bg-green-500' },
  { status: 'in-progress', label: 'En curso', dot: 'bg-violet-500' },
  { status: 'completed', label: 'Completada', dot: 'bg-blue-500' },
  { status: 'cancelled', label: 'Cancelada', dot: 'bg-red-400' },
] as const;

export function isUnconfirmed(apt: { status?: string; confirmed?: boolean }): boolean {
  return apt.status === 'pending' || apt.confirmed === false;
}

export function isRecurring(apt: { recurring?: boolean; series_id?: string; recurrence_id?: string }): boolean {
  return Boolean(apt.recurring || apt.series_id || apt.recurrence_id);
}

export function hasNoVehicle(apt: { vehicle?: { id?: unknown } | string | null }): boolean {
  if (!apt.vehicle) return true;
  if (typeof apt.vehicle === 'object') return apt.vehicle.id == null;
  return !String(apt.vehicle).trim();
}
