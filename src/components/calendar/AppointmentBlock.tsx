import { Repeat, AlertCircle, Globe } from 'lucide-react';
import { cn } from '../ui/utils';
import {
  getAppointmentBlockClasses,
  isRecurring,
  isUnconfirmed,
} from './calendarAppointmentStyles';
import { formatAppointmentTimeForDisplay } from './calendarDateUtils';
import { isPortalBooking } from '../../utils/bookingSourceHelpers';

interface AppointmentBlockProps {
  appointment: any;
  compact?: boolean;
  showDistrict?: boolean;
  showVehicle?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export function AppointmentBlock({
  appointment,
  compact = false,
  showDistrict = true,
  showVehicle = false,
  className,
  style,
  onClick,
  draggable,
  onDragStart,
  onDragEnd,
}: AppointmentBlockProps) {
  const recurring = isRecurring(appointment);
  const unconfirmed = isUnconfirmed(appointment);
  const noVehicle = !appointment.vehicle?.id && !appointment.groomer;
  const portal = isPortalBooking(appointment.bookingSource);

  return (
    <div
      className={cn(
        'rounded border overflow-hidden cursor-pointer shadow-sm z-10 transition-shadow hover:shadow-md',
        compact ? 'p-0.5 text-[10px]' : 'p-1.5 text-xs',
        getAppointmentBlockClasses(appointment.status, { recurring, unconfirmed }),
        className
      )}
      style={style}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-start gap-0.5">
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate flex items-center gap-1">
            {!compact && (
              <span className="opacity-80 shrink-0">{formatAppointmentTimeForDisplay(appointment.time)}</span>
            )}
            <span className="truncate">{appointment.clientName || appointment.client}</span>
          </div>
          {!compact && (
            <>
              <div className="truncate opacity-90">
                🐾 {appointment.petName || appointment.pet || '—'}
                {showDistrict && appointment.district ? ` · ${appointment.district}` : ''}
              </div>
              {showVehicle && (appointment.groomer || appointment.vehicle?.name) && (
                <div className="truncate text-[10px] opacity-75">
                  🚗 {appointment.groomer || appointment.vehicle?.name}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex flex-col gap-0.5 shrink-0">
          {portal && <Globe className="h-3 w-3 text-indigo-600" title="Reserva portal" />}
          {recurring && <Repeat className="h-3 w-3 opacity-70" />}
          {(unconfirmed || noVehicle) && <AlertCircle className="h-3 w-3 text-amber-600" />}
        </div>
      </div>
    </div>
  );
}
