import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { cn } from '../ui/utils';
import { parseAppointmentDate, formatAppointmentTimeForDisplay } from './calendarDateUtils';
import { getMonthChipClasses, isRecurring, isUnconfirmed } from './calendarAppointmentStyles';

interface MonthViewProps {
  currentDate: Date;
  appointments: any[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (appointment: any) => void;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function MonthView({
  currentDate,
  appointments = [],
  onDateClick,
  onAppointmentClick,
  weekStartsOn = 1,
}: MonthViewProps) {
  if (!currentDate) return null;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn });
  const endDate = endOfWeek(monthEnd, { weekStartsOn });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays =
    weekStartsOn === 1
      ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="flex flex-col h-full border rounded-b-lg overflow-hidden bg-background">
      <div className="grid grid-cols-7 border-b bg-muted/40 text-center py-2 text-sm font-medium text-muted-foreground">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 min-h-[480px] auto-rows-fr">
        {calendarDays.map((day) => {
          const dayAppointments = (appointments || []).filter((apt) =>
            isSameDay(parseAppointmentDate(apt.date), day)
          );
          const completed = dayAppointments.filter((a) => a.status === 'completed').length;
          const unconfirmed = dayAppointments.filter((a) => isUnconfirmed(a)).length;

          return (
            <div
              key={day.toString()}
              onClick={() => onDateClick(day)}
              className={cn(
                'min-h-[88px] border-b border-r p-1.5 transition-colors hover:bg-muted/20 cursor-pointer relative',
                !isSameMonth(day, monthStart) && 'bg-muted/10 text-muted-foreground',
                isToday(day) && 'bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-inset ring-blue-200/50'
              )}
            >
              <div className="flex justify-between items-start gap-1">
                <span
                  className={cn(
                    'text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full shrink-0',
                    isToday(day) ? 'bg-blue-600 text-white' : 'text-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {dayAppointments.length > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-muted-foreground">{dayAppointments.length}</span>
                    {completed > 0 && (
                      <p className="text-[9px] text-blue-600">{completed}/{dayAppointments.length}</p>
                    )}
                    {unconfirmed > 0 && (
                      <p className="text-[9px] text-amber-600">{unconfirmed} ⚠</p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-1 space-y-0.5">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={cn(
                      'text-[10px] truncate px-1 py-0.5 rounded border',
                      getMonthChipClasses(apt.status),
                      isRecurring(apt) && 'border-dashed'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                  >
                    {formatAppointmentTimeForDisplay(apt.time)}{' '}
                    {(apt.clientName || apt.client || 'Cita')?.split(' ')[0]}
                    {isRecurring(apt) ? ' 🔁' : ''}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-[10px] text-muted-foreground text-center">
                    + {dayAppointments.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
