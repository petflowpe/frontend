import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { CalendarDays, Plus } from 'lucide-react';
import { parseAppointmentDate, formatAppointmentTimeForDisplay } from './calendarDateUtils';

interface MonthViewProps {
  currentDate: Date;
  appointments: any[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (appointment: any) => void;
}

export function MonthView({ currentDate, appointments = [], onDateClick, onAppointmentClick }: MonthViewProps) {
  // Defensive checks
  if (!currentDate) return null;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      {/* Header Days */}
      <div className="grid grid-cols-7 border-b bg-muted/40 text-center py-2 text-sm font-medium text-muted-foreground">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 grid-rows-5 flex-1 min-h-[600px]">
        {calendarDays.map((day) => {
          // Filter appointments for this day
          const dayAppointments = (appointments || []).filter(apt => 
            isSameDay(parseAppointmentDate(apt.date), day)
          );

          return (
            <div
              key={day.toString()}
              onClick={() => onDateClick(day)}
              className={cn(
                "min-h-[100px] border-b border-r p-2 transition-colors hover:bg-muted/20 cursor-pointer relative",
                !isSameMonth(day, monthStart) && "bg-muted/10 text-muted-foreground",
                isToday(day) && "bg-blue-50/50 dark:bg-blue-900/10"
              )}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                  isToday(day) ? "bg-blue-600 text-white" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </span>
                {dayAppointments.length > 0 && (
                  <span className="text-xs font-bold text-muted-foreground">
                    {dayAppointments.length}
                  </span>
                )}
              </div>
              
              <div className="mt-1 space-y-1">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <div 
                    key={apt.id} 
                    className={cn(
                      "text-[10px] truncate px-1 py-0.5 rounded border",
                      apt.status === 'confirmed' ? "bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300" :
                      apt.status === 'completed' ? "bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300" :
                      "bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick(apt);
                    }}
                  >
                    {formatAppointmentTimeForDisplay(apt.time)} {(apt.clientName || apt.client || 'Cita')?.split(' ')[0]}
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