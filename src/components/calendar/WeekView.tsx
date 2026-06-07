import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../ui/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useState } from 'react';
import {
  parseAppointmentDate,
  getAppointmentTimeParts,
  getHourSlotHeight,
  snapTimeToInterval,
  filterWeekdays,
} from './calendarDateUtils';
import { AppointmentBlock } from './AppointmentBlock';

interface WeekViewProps {
  currentDate: Date;
  appointments: any[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (appointment: any) => void;
  onAppointmentDrop?: (appointmentId: string, newDate: Date, newTime?: string) => void;
  firstHour?: number;
  lastHour?: number;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  intervalMinutes?: number;
  showWeekends?: boolean;
}

export function WeekView({
  currentDate,
  appointments,
  onDateClick,
  onAppointmentClick,
  onAppointmentDrop,
  firstHour = 8,
  lastHour = 20,
  weekStartsOn = 1,
  intervalMinutes = 15,
  showWeekends = true,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn });
  const allWeekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekDays = filterWeekdays(allWeekDays, showWeekends);
  const colCount = weekDays.length;

  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => i + firstHour);
  const slotHeight = getHourSlotHeight(intervalMinutes);
  const slotsPerHour = 60 / intervalMinutes;

  const [draggedAppointment, setDraggedAppointment] = useState<any>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ day: Date; hour: number; minute: number } | null>(null);

  const handleDrop = (e: React.DragEvent, day: Date, hour: number, minute: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    if (!draggedAppointment || !onAppointmentDrop) return;
    const newDate = new Date(day);
    newDate.setHours(hour, minute, 0, 0);
    const newTime = snapTimeToInterval(hour, minute, intervalMinutes);
    onAppointmentDrop(draggedAppointment.id, newDate, newTime);
    setDraggedAppointment(null);
  };

  return (
    <div className="flex flex-col h-full border rounded-b-lg bg-background overflow-hidden">
      <div className="flex border-b">
        <div className="w-14 border-r bg-muted/30 flex-shrink-0" />
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
          {weekDays.map((day) => (
            <div
              key={day.toString()}
              className={cn(
                'text-center py-2 border-r last:border-r-0',
                isToday(day) && 'bg-blue-50/50 dark:bg-blue-900/10'
              )}
            >
              <div className="text-xs text-muted-foreground uppercase">{format(day, 'EEE', { locale: es })}</div>
              <div
                className={cn(
                  'text-lg font-semibold inline-flex items-center justify-center w-8 h-8 rounded-full mt-1',
                  isToday(day) && 'bg-blue-600 text-white'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-[400px] max-h-[calc(100vh-22rem)]">
        <div className="flex">
          <div className="w-14 flex-shrink-0 border-r bg-muted/10">
            {hours.map((hour) => (
              <div key={hour} className="text-xs text-muted-foreground text-right pr-1 pt-1 border-b" style={{ height: slotHeight }}>
                {`${hour}:00`}
              </div>
            ))}
          </div>

          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
            {weekDays.map((day) => (
              <div key={day.toString()} className="relative border-r last:border-r-0">
                {hours.map((hour) =>
                  Array.from({ length: slotsPerHour }, (_, si) => {
                    const minute = si * intervalMinutes;
                    const isDragOver =
                      dragOverSlot?.day.getTime() === day.getTime() &&
                      dragOverSlot?.hour === hour &&
                      dragOverSlot?.minute === minute;
                    const subH = slotHeight / slotsPerHour;
                    return (
                      <div
                        key={`${hour}-${minute}`}
                        className={cn(
                          'border-b relative transition-colors',
                          isDragOver ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-muted/20'
                        )}
                        style={{ height: subH }}
                        onClick={() => {
                          const clickedDate = new Date(day);
                          clickedDate.setHours(hour, minute, 0, 0);
                          onDateClick(clickedDate);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverSlot({ day, hour, minute });
                        }}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={(e) => handleDrop(e, day, hour, minute)}
                      />
                    );
                  })
                )}

                {appointments
                  .filter((apt) => isSameDay(parseAppointmentDate(apt.date), day))
                  .map((apt) => {
                    const { hour: aptHour, minute: aptMinute } = getAppointmentTimeParts(apt.time);
                    if (aptHour < firstHour || aptHour > lastHour) return null;
                    const startMinutes = (aptHour - firstHour) * 60 + aptMinute;
                    const duration = apt.duration || apt.totalDuration || 60;
                    const height = (duration / 60) * slotHeight;
                    const top = (startMinutes / 60) * slotHeight;

                    return (
                      <AppointmentBlock
                        key={apt.id}
                        appointment={apt}
                        showDistrict
                        showVehicle
                        style={{ top: `${top}px`, height: `${Math.max(height, 24)}px`, position: 'absolute', left: 2, right: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(apt);
                        }}
                        draggable
                        onDragStart={(e) => {
                          setDraggedAppointment(apt);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragEnd={() => {
                          setDraggedAppointment(null);
                          setDragOverSlot(null);
                        }}
                      />
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
