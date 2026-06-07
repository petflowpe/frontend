import { format, isSameDay } from 'date-fns';
import { cn } from '../ui/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Car } from 'lucide-react';
import { useState } from 'react';
import {
  parseAppointmentDate,
  getAppointmentTimeParts,
  getHourSlotHeight,
  snapTimeToInterval,
} from './calendarDateUtils';
import { AppointmentBlock } from './AppointmentBlock';

interface Resource {
  id: string;
  name: string;
  driver?: string;
}

interface ResourceViewProps {
  currentDate: Date;
  appointments: any[];
  resources: Resource[];
  onDateClick: (date: Date, resourceId?: string) => void;
  onAppointmentClick: (appointment: any) => void;
  onAppointmentDrop?: (appointmentId: string, newDate: Date, newTime?: string, newResourceId?: string) => void;
  firstHour?: number;
  lastHour?: number;
  intervalMinutes?: number;
}

export function ResourceView({
  currentDate,
  appointments,
  resources,
  onDateClick,
  onAppointmentClick,
  onAppointmentDrop,
  firstHour = 8,
  lastHour = 20,
  intervalMinutes = 15,
}: ResourceViewProps) {
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => i + firstHour);
  const slotHeight = getHourSlotHeight(intervalMinutes);
  const slotsPerHour = 60 / intervalMinutes;

  const [draggedAppointment, setDraggedAppointment] = useState<any>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ resourceId: string; hour: number; minute: number } | null>(null);

  const dayAppointments = appointments.filter((apt) => isSameDay(parseAppointmentDate(apt.date), currentDate));

  const matchResource = (apt: any, resourceId: string) => {
    const aptVehicleId = apt.vehicle?.id ?? apt.vehicle;
    const sid = String(resourceId);
    return sid === String(aptVehicleId) || sid === `vehiculo-${aptVehicleId}` || `vehiculo-${sid}` === String(aptVehicleId);
  };

  const handleDrop = (e: React.DragEvent, resourceId: string, hour: number, minute: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    if (!draggedAppointment || !onAppointmentDrop) return;
    const newDate = new Date(currentDate);
    newDate.setHours(hour, minute, 0, 0);
    const newTime = snapTimeToInterval(hour, minute, intervalMinutes);
    onAppointmentDrop(draggedAppointment.id, newDate, newTime, resourceId);
    setDraggedAppointment(null);
  };

  return (
    <div className="flex flex-col h-full border rounded-b-lg bg-background overflow-hidden">
      <div className="flex border-b px-2 py-2 bg-muted/20 text-sm font-medium">
        <Car className="h-4 w-4 mr-2 text-blue-600" />
        {format(currentDate, "EEEE d 'de' MMMM yyyy")}
      </div>
      <div className="flex border-b overflow-x-auto">
        <div className="w-14 border-r bg-muted/30 flex-shrink-0" />
        <div className="flex-1 grid min-w-max" style={{ gridTemplateColumns: `repeat(${resources.length}, minmax(140px, 1fr))` }}>
          {resources.map((resource) => (
            <div key={resource.id} className="text-center py-2 border-r last:border-r-0 bg-muted/10 px-1">
              <div className="font-semibold text-sm truncate">{resource.name}</div>
              {resource.driver && <div className="text-xs text-muted-foreground truncate">{resource.driver}</div>}
            </div>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-[400px] max-h-[calc(100vh-22rem)]">
        <div className="flex min-w-max">
          <div className="w-14 flex-shrink-0 border-r bg-muted/10">
            {hours.map((hour) => (
              <div key={hour} className="text-xs text-muted-foreground text-right pr-1 pt-1 border-b" style={{ height: slotHeight }}>
                {`${hour}:00`}
              </div>
            ))}
          </div>

          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${resources.length}, minmax(140px, 1fr))` }}>
            {resources.map((resource) => (
              <div key={resource.id} className="relative border-r last:border-r-0">
                {hours.map((hour) =>
                  Array.from({ length: slotsPerHour }, (_, si) => {
                    const minute = si * intervalMinutes;
                    const subH = slotHeight / slotsPerHour;
                    const isDragOver =
                      dragOverSlot?.resourceId === resource.id &&
                      dragOverSlot?.hour === hour &&
                      dragOverSlot?.minute === minute;
                    return (
                      <div
                        key={`${hour}-${minute}`}
                        className={cn(
                          'border-b relative transition-colors',
                          isDragOver ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-muted/20'
                        )}
                        style={{ height: subH }}
                        onClick={() => {
                          const clickedDate = new Date(currentDate);
                          clickedDate.setHours(hour, minute, 0, 0);
                          onDateClick(clickedDate, resource.id);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverSlot({ resourceId: resource.id, hour, minute });
                        }}
                        onDragLeave={() => setDragOverSlot(null)}
                        onDrop={(e) => handleDrop(e, resource.id, hour, minute)}
                      />
                    );
                  })
                )}

                {dayAppointments
                  .filter((apt) => matchResource(apt, resource.id))
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
                        style={{
                          position: 'absolute',
                          top: `${top}px`,
                          height: `${Math.max(height, 28)}px`,
                          left: 2,
                          right: 2,
                        }}
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
