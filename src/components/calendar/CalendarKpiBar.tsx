import { CalendarDays, Clock, AlertTriangle, Car, DollarSign } from 'lucide-react';
import { cn } from '../ui/utils';
import { isUnconfirmed, hasNoVehicle } from './calendarAppointmentStyles';

interface CalendarKpiBarProps {
  appointments: any[];
  rangeLabel: string;
}

export function CalendarKpiBar({ appointments, rangeLabel }: CalendarKpiBarProps) {
  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const inProgress = appointments.filter((a) => a.status === 'in-progress').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const unconfirmed = appointments.filter((a) => isUnconfirmed(a)).length;
  const noVehicle = appointments.filter((a) => hasNoVehicle(a)).length;
  const revenue = appointments.reduce((sum, a) => sum + (Number(a.totalPrice) || 0), 0);

  const items = [
    { icon: CalendarDays, label: 'Total', value: total, color: 'text-blue-600' },
    { icon: Clock, label: 'Pendientes', value: pending, color: 'text-amber-600' },
    { icon: Clock, label: 'Confirmadas', value: confirmed, color: 'text-green-600' },
    { icon: Clock, label: 'En curso', value: inProgress, color: 'text-violet-600' },
    { icon: Clock, label: 'Completadas', value: completed, color: 'text-blue-600' },
    { icon: AlertTriangle, label: 'Sin confirmar', value: unconfirmed, color: unconfirmed > 0 ? 'text-amber-700' : 'text-muted-foreground' },
    { icon: Car, label: 'Sin móvil', value: noVehicle, color: noVehicle > 0 ? 'text-red-600' : 'text-muted-foreground' },
    { icon: DollarSign, label: 'Estimado', value: `S/ ${revenue.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`, color: 'text-emerald-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 py-2">
      <div className="col-span-2 sm:col-span-4 lg:col-span-8 text-xs text-muted-foreground font-medium">
        Resumen — {rangeLabel}
      </div>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm"
        >
          <item.icon className={cn('h-4 w-4 shrink-0', item.color)} />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground truncate">{item.label}</p>
            <p className={cn('text-sm font-bold truncate', item.color)}>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
