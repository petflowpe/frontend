import { format, isSameDay } from 'date-fns';
import { cn } from '../ui/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Car } from 'lucide-react';
import { useState } from 'react';
import { parseAppointmentDate, formatAppointmentTimeForDisplay, getAppointmentTimeParts } from './calendarDateUtils';

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
}

export function ResourceView({ currentDate, appointments, resources, onDateClick, onAppointmentClick, onAppointmentDrop }: ResourceViewProps) {
  // Hours from 8:00 to 20:00
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  
  const [draggedAppointment, setDraggedAppointment] = useState<any>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ resourceId: string; hour: number } | null>(null);

  const dayAppointments = appointments.filter(apt => 
    isSameDay(parseAppointmentDate(apt.date), currentDate)
  );

  const handleDragStart = (e: React.DragEvent, appointment: any) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('appointmentId', appointment.id);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setDragOverSlot(null);
  };

  const handleDragOver = (e: React.DragEvent, resourceId: string, hour: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ resourceId, hour });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, resourceId: string, hour: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    if (!draggedAppointment || !onAppointmentDrop) return;

    const newDate = new Date(currentDate);
    newDate.setHours(hour);
    newDate.setMinutes(0);
    
    const newTime = `${hour.toString().padStart(2, '0')}:00`;
    
    onAppointmentDrop(draggedAppointment.id, newDate, newTime, resourceId);
    setDraggedAppointment(null);
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background overflow-hidden">
      {/* Header - Resources */}
      <div className="flex border-b">
        <div className="w-16 border-r bg-muted/30 flex-shrink-0"></div> {/* Time Column Header */}
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${resources.length}, minmax(0, 1fr))` }}>
          {resources.map((resource) => (
            <div key={resource.id} className="text-center py-3 border-r last:border-r-0 bg-muted/10">
              <div className="font-semibold flex items-center justify-center gap-2">
                <Car className="h-4 w-4 text-blue-600" />
                {resource.name}
              </div>
              {resource.driver && (
                <div className="text-xs text-muted-foreground mt-1">
                  {resource.driver}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
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

          {/* Resources Columns */}
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${resources.length}, minmax(0, 1fr))` }}>
            {resources.map(resource => (
              <div key={resource.id} className="relative border-r last:border-r-0">
                {hours.map(hour => {
                  const isDragOver = dragOverSlot?.resourceId === resource.id && dragOverSlot?.hour === hour;
                  
                  return (
                    <div 
                      key={hour} 
                      className={cn(
                        "h-20 border-b relative transition-colors",
                        isDragOver ? "bg-blue-100 dark:bg-blue-900/30 border-blue-400" : "hover:bg-muted/30"
                      )}
                      onClick={() => {
                        const clickedDate = new Date(currentDate);
                        clickedDate.setHours(hour);
                        clickedDate.setMinutes(0);
                        onDateClick(clickedDate, resource.id);
                      }}
                      onDragOver={(e) => handleDragOver(e, resource.id, hour)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, resource.id, hour)}
                    >
                      {isDragOver && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400 pointer-events-none">
                          Soltar aquí
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Appointments for this resource */}
                {dayAppointments
                  .filter(apt => {
                    // Match resource. Logic depends on how vehicle is stored in appointment.
                    // In Appointments.tsx it was apt.vehicle.id or apt.vehicle (object)
                    const aptVehicleId = apt.vehicle?.id || apt.vehicle;
                    return aptVehicleId === resource.id || aptVehicleId === `vehiculo-${resource.id}` || resource.id === `vehiculo-${aptVehicleId}`; 
                    // Trying to be robust with IDs as I saw 'vehiculo-1' vs '1' potential issues.
                  })
                  .map(apt => {
                    const [aptHour, aptMinute] = apt.time.split(':').map(Number);
                    if (aptHour < 8 || aptHour > 20) return null;

                    const startMinutes = (aptHour - 8) * 60 + aptMinute;
                    const duration = apt.totalDuration || 60;
                    const height = (duration / 60) * 80;
                    const top = (startMinutes / 60) * 80;

                    return (
                      <div
                        key={apt.id}
                        className={cn(
                          "absolute left-1 right-1 rounded border p-2 text-xs overflow-hidden cursor-pointer shadow-sm z-10",
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
                        <div className="font-bold truncate">{formatAppointmentTimeForDisplay(apt.time)} - {apt.clientName || apt.client}</div>
                        <div className="truncate text-[10px] mt-1">{apt.petName || apt.pet}{apt.district ? ` • ${apt.district}` : ''}</div>
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