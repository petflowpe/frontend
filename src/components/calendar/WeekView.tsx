import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addMinutes, setHours, setMinutes, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../ui/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useState } from 'react';
import { parseAppointmentDate, getAppointmentTimeParts } from './calendarDateUtils';

interface WeekViewProps {
  currentDate: Date;
  appointments: any[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (appointment: any) => void;
  onAppointmentDrop?: (appointmentId: string, newDate: Date, newTime?: string) => void;
  firstHour?: number;
  lastHour?: number;
}

export function WeekView({
  currentDate,
  appointments,
  onDateClick,
  onAppointmentClick,
  onAppointmentDrop,
  firstHour = 8,
  lastHour = 20,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: weekEnd
  });

  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => i + firstHour);
  const slotHeight = 80;

  const [draggedAppointment, setDraggedAppointment] = useState<any>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ day: Date; hour: number } | null>(null);

  const handleDragStart = (e: React.DragEvent, appointment: any) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('appointmentId', appointment.id);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ day, hour });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    if (!draggedAppointment || !onAppointmentDrop) return;

    const newDate = new Date(day);
    newDate.setHours(hour);
    newDate.setMinutes(0);
    
    const newTime = `${hour.toString().padStart(2, '0')}:00`;
    
    onAppointmentDrop(draggedAppointment.id, newDate, newTime);
    setDraggedAppointment(null);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background overflow-hidden">
      {/* Header */}
      <div className="flex border-b">
        <div className="w-16 border-r bg-muted/30 flex-shrink-0"></div> {/* Time Column Header */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day) => (
            <div key={day.toString()} className={cn(
              "text-center py-2 border-r last:border-r-0",
              isToday(day) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
            )}>
              <div className="text-xs text-muted-foreground uppercase">{format(day, 'EEE', { locale: es })}</div>
              <div className={cn(
                "text-lg font-semibold inline-flex items-center justify-center w-8 h-8 rounded-full mt-1",
                isToday(day) ? "bg-blue-600 text-white" : ""
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Grid */}
      <ScrollArea className="flex-1 h-[600px]">
        <div className="flex">
          {/* Time Labels */}
          <div className="w-16 flex-shrink-0 border-r bg-muted/10">
            {hours.map(hour => (
              <div key={hour} className="h-20 text-xs text-muted-foreground text-right pr-2 pt-2 border-b">
                {`${hour}:00`}
              </div>
            ))}
          </div>

          {/* Days Columns */}
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map(day => (
              <div key={day.toString()} className="relative border-r last:border-r-0">
                {hours.map(hour => {
                  const isDragOver = dragOverSlot?.day.getTime() === day.getTime() && dragOverSlot?.hour === hour;
                  
                  return (
                    <div 
                      key={hour} 
                      className={cn(
                        "h-20 border-b relative transition-colors",
                        isDragOver ? "bg-blue-100 dark:bg-blue-900/30 border-blue-400" : "hover:bg-muted/30"
                      )}
                      onClick={() => {
                        const clickedDate = new Date(day);
                        clickedDate.setHours(hour);
                        clickedDate.setMinutes(0);
                        onDateClick(clickedDate);
                      }}
                      onDragOver={(e) => handleDragOver(e, day, hour)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day, hour)}
                    >
                      {isDragOver && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400 pointer-events-none">
                          Soltar aquí
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Render Appointments Absolute Positioned */}
                {appointments
                  .filter(apt => isSameDay(parseAppointmentDate(apt.date), day))
                  .map(apt => {
                    const { hour: aptHour, minute: aptMinute } = getAppointmentTimeParts(apt.time);
                    if (aptHour < firstHour || aptHour > lastHour) return null;

                    const startMinutes = (aptHour - firstHour) * 60 + aptMinute;
                    const duration = apt.duration || apt.totalDuration || 60;
                    const height = (duration / 60) * slotHeight;
                    const top = (startMinutes / 60) * slotHeight;

                    return (
                      <div
                        key={apt.id}
                        className={cn(
                          "absolute left-1 right-1 rounded border p-1 text-xs overflow-hidden cursor-pointer shadow-sm z-10",
                          apt.status === 'confirmed' ? "bg-green-100 border-green-300 text-green-900" :
                          apt.status === 'completed' ? "bg-blue-100 border-blue-300 text-blue-900" :
                          "bg-gray-100 border-gray-300 text-gray-900"
                        )}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(apt);
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, apt)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="font-semibold truncate">{apt.clientName || apt.client}</div>
                        <div className="truncate text-[10px] opacity-80">{apt.petName || apt.pet}</div>
                      </div>
                    );
                  })
                }
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}