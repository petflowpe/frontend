import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../ui/utils';
import { ScrollArea } from '../ui/scroll-area';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { parseAppointmentDate, getAppointmentTimeParts, getHourSlotHeight, snapTimeToInterval, filterWeekdays } from './calendarDateUtils';
import { AppointmentBlock } from './AppointmentBlock';

interface Resource {
  id: string;
  name: string;
  driver?: string;
}

interface WeekViewWithResourcesProps {
  currentDate: Date;
  appointments: any[];
  resources: Resource[];
  onDateClick: (date: Date, resourceId?: string) => void;
  onAppointmentClick: (appointment: any) => void;
  onAppointmentDrop?: (appointmentId: string, newDate: Date, newTime?: string, newResourceId?: string) => void;
  firstHour?: number;
  lastHour?: number;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  intervalMinutes?: number;
  showWeekends?: boolean;
}

export function WeekViewWithResources({
  currentDate,
  appointments,
  resources,
  onDateClick,
  onAppointmentClick,
  onAppointmentDrop,
  firstHour = 8,
  lastHour = 20,
  weekStartsOn = 1,
}: WeekViewWithResourcesProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => i + firstHour);

  const [draggedAppointment, setDraggedAppointment] = useState<any>(null);
  const [dragOver, setDragOver] = useState<{ day: Date; hour: number; resourceId: string } | null>(null);

  const handleDragStart = (e: React.DragEvent, appointment: any) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('appointmentId', appointment.id);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, day: Date, hour: number, resourceId: string) => {
    e.preventDefault();
    setDragOver(null);
    if (!draggedAppointment || !onAppointmentDrop) return;
    const newDate = new Date(day);
    newDate.setHours(hour);
    newDate.setMinutes(0);
    const newTime = snapTimeToInterval(hour, 0, intervalMinutes);
    onAppointmentDrop(draggedAppointment.id, newDate, newTime, resourceId);
    setDraggedAppointment(null);
  };

  const totalCols = weekDays.length * resources.length;
  const weekNum = getWeek(weekStart, { weekStartsOn, firstWeekContainsDate: 4 });

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background overflow-hidden">
      {/* Encabezado en 3 filas: semana+días | recursos por día | todo el día + notas */}
      <div className="border-b bg-muted/20">
        <div
          className="grid min-w-0"
          style={{
            gridTemplateColumns: `64px repeat(${totalCols}, minmax(0, 1fr))`,
            gridTemplateRows: 'auto auto auto',
          }}
        >
          {/* Fila 1: W9 + 7 celdas de día (cada una ocupa resources.length columnas) */}
          <div className="border-r bg-muted/30 flex items-center justify-center py-2 text-sm font-medium text-muted-foreground" style={{ gridRow: 1, gridColumn: 1 }}>
            W{weekNum}
          </div>
          {weekDays.map((day, dayIndex) => (
            <div
              key={day.getTime()}
              className={cn(
                'border-r py-2 text-center text-sm',
                isToday(day) ? 'font-bold text-foreground bg-blue-50/50 dark:bg-blue-900/10' : 'text-muted-foreground'
              )}
              style={{ gridRow: 1, gridColumn: `${2 + dayIndex * resources.length} / span ${resources.length}` }}
            >
              {format(day, "EEE d.M.", { locale: es })}
            </div>
          ))}

          {/* Fila 2: celda vacía (debajo de W9) + una celda por recurso por día, con 2 líneas */}
          <div className="border-r border-t bg-muted/30" style={{ gridRow: 2, gridColumn: 1 }} />
          {weekDays.map((day, dayIndex) =>
            resources.map((resource, resIndex) => (
              <div
                key={`${day.getTime()}-${resource.id}`}
                className={cn(
                  'border-r border-t py-1.5 px-1 text-center text-xs',
                  isToday(day) && 'bg-blue-50/30 dark:bg-blue-900/10'
                )}
                style={{ gridRow: 2, gridColumn: 2 + dayIndex * resources.length + resIndex }}
              >
                <div className="font-medium leading-tight truncate" title={resource.driver || resource.name}>
                  {resource.driver || resource.name}
                </div>
                {resource.driver && resource.name && (
                  <div className="text-muted-foreground leading-tight truncate" title={resource.name}>
                    {resource.name}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Fila 3: "todo el dia" + Agregar nota de día por cada día */}
          <div className="border-r border-t bg-muted/30 flex items-center justify-center gap-0.5 py-2 text-xs text-muted-foreground" style={{ gridRow: 3, gridColumn: 1 }}>
            todo el día
            <ChevronDown className="h-3 w-3" />
          </div>
          {weekDays.map((day, dayIndex) => (
            <div
              key={`allday-${day.getTime()}`}
              className={cn(
                'border-r border-t flex items-center justify-center py-2 text-xs text-muted-foreground/80 hover:bg-muted/30 cursor-pointer',
                isToday(day) && 'bg-blue-50/30 dark:bg-blue-900/10'
              )}
              style={{ gridRow: 3, gridColumn: `${2 + dayIndex * resources.length} / span ${resources.length}` }}
            >
              Agregar nota de día
            </div>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-[400px] max-h-[calc(100vh-22rem)]">
        <div className="flex">
          <div className="w-16 flex-shrink-0 border-r bg-muted/10">
            {hours.map(hour => (
              <div key={hour} className="text-xs text-muted-foreground text-right pr-2 pt-2 border-b" style={{ height: slotHeight }}>
                {`${hour}:00`}
              </div>
            ))}
          </div>
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}>
            {weekDays.map(day =>
              resources.map(resource => (
                <div key={`${day.getTime()}-${resource.id}`} className="relative border-r last:border-r-0">
                  {hours.map(hour => {
                    const isDragOverHere =
                      dragOver?.day.getTime() === day.getTime() &&
                      dragOver?.hour === hour &&
                      dragOver?.resourceId === resource.id;
                    return (
                      <div
                        key={hour}
                        className={cn(
                          'border-b relative transition-colors',
                          isDragOverHere ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400' : 'hover:bg-muted/30'
                        )}
                        style={{ height: slotHeight }}
                        onClick={() => {
                          const d = new Date(day);
                          d.setHours(hour);
                          d.setMinutes(0);
                          onDateClick(d, resource.id);
                        }}
                        onDragOver={e => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          setDragOver({ day, hour, resourceId: resource.id });
                        }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={e => handleDrop(e, day, hour, resource.id)}
                      >
                        {isDragOverHere && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-600 pointer-events-none">
                            Soltar aquí
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {appointments
                    .filter(apt => {
                      if (!isSameDay(parseAppointmentDate(apt.date), day)) return false;
                      const aptVehicleId = apt.vehicle?.id ?? apt.vehicle;
                      const sid = String(resource.id);
                      return sid === String(aptVehicleId) || sid === `vehiculo-${aptVehicleId}` || `vehiculo-${sid}` === String(aptVehicleId);
                    })
                    .map(apt => {
                      const { hour: aptHour, minute: aptMinute } = getAppointmentTimeParts(apt.time);
                      if (aptHour < firstHour || aptHour > lastHour) return null;
                      const startMinutes = (aptHour - firstHour) * 60 + aptMinute;
                      const duration = apt.totalDuration || apt.duration || 60;
                      const height = (duration / 60) * slotHeight;
                      const top = (startMinutes / 60) * slotHeight;
                      return (
                        <AppointmentBlock
                          key={apt.id}
                          appointment={apt}
                          compact
                          style={{ position: 'absolute', top: `${top}px`, height: `${Math.max(height, 22)}px`, left: 2, right: 2 }}
                          onClick={e => { e.stopPropagation(); onAppointmentClick(apt); }}
                          draggable
                          onDragStart={e => handleDragStart(e, apt)}
                          onDragEnd={handleDragEnd}
                        />
                      );
                    })}
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
