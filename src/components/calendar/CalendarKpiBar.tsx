import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../ui/utils';
import { isUnconfirmed, hasNoVehicle } from './calendarAppointmentStyles';
import { Button } from '../ui/button';

interface CalendarKpiBarProps {
  appointments: any[];
  rangeLabel: string;
}

export function CalendarKpiBar({ appointments, rangeLabel }: CalendarKpiBarProps) {
  const [expanded, setExpanded] = useState(false);

  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === 'pending').length;
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const inProgress = appointments.filter((a) => a.status === 'in-progress').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const unconfirmed = appointments.filter((a) => isUnconfirmed(a)).length;
  const noVehicle = appointments.filter((a) => hasNoVehicle(a)).length;
  const revenue = appointments.reduce((sum, a) => sum + (Number(a.totalPrice) || 0), 0);

  const revenueLabel = `S/ ${revenue.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;

  const items = [
    { label: 'Total', value: total, color: 'text-blue-600' },
    { label: 'Pendientes', value: pending, color: 'text-amber-600' },
    { label: 'Confirmadas', value: confirmed, color: 'text-green-600' },
    { label: 'En curso', value: inProgress, color: 'text-violet-600' },
    { label: 'Completadas', value: completed, color: 'text-blue-600' },
    { label: 'Sin confirmar', value: unconfirmed, color: unconfirmed > 0 ? 'text-amber-700' : 'text-muted-foreground' },
    { label: 'Sin móvil', value: noVehicle, color: noVehicle > 0 ? 'text-red-600' : 'text-muted-foreground' },
    { label: 'Estimado', value: revenueLabel, color: 'text-emerald-600' },
  ];

  return (
    <div className="border rounded-md bg-muted/20 px-2 py-1">
      <div className="flex items-center gap-2 min-h-7">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-1.5 text-xs font-medium shrink-0"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5 mr-1" /> : <ChevronDown className="h-3.5 w-3.5 mr-1" />}
          Resumen
        </Button>

        <span className="text-xs text-muted-foreground capitalize truncate hidden sm:inline">{rangeLabel}</span>

        {!expanded && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs ml-auto">
            <span>
              <strong className="text-blue-600">{total}</strong> citas
            </span>
            <span>
              <strong className="text-amber-600">{pending}</strong> pend.
            </span>
            {unconfirmed > 0 && (
              <span>
                <strong className="text-amber-700">{unconfirmed}</strong> sin confirmar
              </span>
            )}
            {noVehicle > 0 && (
              <span>
                <strong className="text-red-600">{noVehicle}</strong> sin móvil
              </span>
            )}
            <span>
              <strong className="text-emerald-600">{revenueLabel}</strong>
            </span>
          </div>
        )}
      </div>

      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 pt-1.5 pb-0.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 rounded border bg-card px-2 py-1">
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground truncate">{item.label}</p>
                <p className={cn('text-xs font-bold truncate', item.color)}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
