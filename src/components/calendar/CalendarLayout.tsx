import { useState, useEffect } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { ResourceView } from './ResourceView';
import { NewAppointmentDialog } from './NewAppointmentDialog';
import { AppointmentDetailsDialog } from './AppointmentDetailsDialog';
import { useAppointments } from '../../hooks/useAppointments';
import { useCalendarNotifications } from '../../hooks/useCalendarNotifications';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Hardcoded for now, mimicking Appointments.tsx
const resources = [
  { id: 'vehiculo-1', name: 'Móvil 1', driver: 'Carlos Méndez' },
  { id: 'vehiculo-2', name: 'Móvil 2', driver: 'María López' },
  { id: 'vehiculo-3', name: 'Móvil 3', driver: 'Pedro García' }
];

export function CalendarLayout() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'resource'>('month');
  const { appointments, loading, addAppointment, updateAppointment, deleteAppointment } = useAppointments();
  
  // Hook para notificaciones del calendario
  useCalendarNotifications();
  
  // State for selected appointment to show details
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  
  // State for new appointment dialog
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | undefined>();
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>();
  const [prefilledResourceId, setPrefilledResourceId] = useState<string | undefined>();
  
  // State for editing appointment
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  // Listen for global event to open new appointment dialog
  useEffect(() => {
    const handleOpenNewAppointment = () => {
      setIsNewAppointmentOpen(true);
    };
    
    window.addEventListener('open-new-appointment', handleOpenNewAppointment);
    return () => window.removeEventListener('open-new-appointment', handleOpenNewAppointment);
  }, []);

  const handleDateClick = (date: Date, resourceId?: string) => {
    // Open the new appointment dialog with prefilled date/time
    setPrefilledDate(date);
    setPrefilledTime(format(date, 'HH:mm'));
    setPrefilledResourceId(resourceId);
    setEditingAppointment(null); // Ensure we're not in edit mode
    setIsNewAppointmentOpen(true);
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
  };

  const handleSaveNewAppointment = (appointment: any): Promise<void> => {
    if (editingAppointment) {
      return updateAppointment(appointment.id, appointment) as Promise<void>;
    }
    return addAppointment(appointment);
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    const dateStr = appointment.date || '';
    const dateObj = dateStr.includes('T')
      ? new Date(dateStr)
      : (() => {
          const [y, m, d] = dateStr.split('-').map(Number);
          return isNaN(y) ? undefined : new Date(y, m - 1, d);
        })();
    setPrefilledDate(dateObj || new Date());
    let timeStr = (appointment.time || '09:00').trim();
    if (timeStr.includes('T')) timeStr = format(new Date(timeStr), 'HH:mm');
    else if (timeStr.length > 5) timeStr = timeStr.slice(0, 5);
    setPrefilledTime(timeStr);
    const vehicleId = appointment.vehicle?.id ?? appointment.vehicle;
    setPrefilledResourceId(vehicleId ? String(vehicleId) : undefined);
    setSelectedAppointment(null);
    setIsNewAppointmentOpen(true);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    await updateAppointment(appointmentId, { status: 'cancelled' });
    window.dispatchEvent(new CustomEvent('appointment-cancelled', {
      detail: { appointmentId, message: 'Cita cancelada correctamente' }
    }));
  };

  const handleRescheduleAppointment = (appointment: any) => {
    handleEditAppointment(appointment);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    await deleteAppointment(appointmentId);
  };

  const handleAppointmentDrop = (appointmentId: string, newDate: Date, newTime?: string, newResourceId?: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    const updates: any = {
      date: format(newDate, 'yyyy-MM-dd'),
    };

    if (newTime) {
      updates.time = newTime;
    }

    if (newResourceId) {
      updates.vehicle = newResourceId;
      const vehicle = resources.find(v => v.id === newResourceId);
      if (vehicle) {
        updates.groomer = vehicle.driver;
      }
    }

    updateAppointment(appointmentId, updates);
    toast.success('✅ Cita actualizada exitosamente');
    
    // Send notification
    window.dispatchEvent(new CustomEvent('appointment-moved', {
      detail: {
        appointmentId,
        newDate: updates.date,
        newTime: updates.time,
        message: `Cita movida a ${format(newDate, 'dd/MM/yyyy')} a las ${newTime || appointment.time}`
      }
    }));
  };

  const handleCloseNewAppointmentDialog = () => {
    setIsNewAppointmentOpen(false);
    setEditingAppointment(null);
    setPrefilledDate(undefined);
    setPrefilledTime(undefined);
    setPrefilledResourceId(undefined);
  };

  return (
    <div className="flex flex-col h-screen p-6 space-y-4">
      <CalendarHeader 
        currentDate={currentDate} 
        onDateChange={setCurrentDate}
        view={view}
        onViewChange={setView}
      />

      <div className="flex-1 min-h-0"> 
        {/* min-h-0 is crucial for nested flex scrolling */}
        {view === 'month' && (
          <MonthView 
            currentDate={currentDate} 
            appointments={appointments}
            onDateClick={handleDateClick}
            onAppointmentClick={handleAppointmentClick}
          />
        )}
        {view === 'week' && (
          <WeekView 
            currentDate={currentDate} 
            appointments={appointments}
            onDateClick={handleDateClick}
            onAppointmentClick={handleAppointmentClick}
            onAppointmentDrop={handleAppointmentDrop}
          />
        )}
        {view === 'resource' && (
          <ResourceView 
            currentDate={currentDate} 
            appointments={appointments}
            resources={resources}
            onDateClick={handleDateClick}
            onAppointmentClick={handleAppointmentClick}
            onAppointmentDrop={handleAppointmentDrop}
          />
        )}
        {view === 'day' && (
           // Reuse WeekView for now but showing only 1 day is a simple tweak, 
           // or separate DayView. For now fallback to WeekView centered on day?
           // Let's just use ResourceView for "Day" view or standard day view. 
           // Usually Day View is like Week View but 1 column.
           // I'll reuse WeekView logic but passed as a single day? 
           // Or just put a placeholder.
           <div className="flex items-center justify-center h-full border rounded-lg bg-muted/10">
             <div className="text-center">
               <p className="text-muted-foreground">Vista diaria estándar (Usar 'Semana' o 'Móvil' por ahora)</p>
             </div>
           </div>
        )}
      </div>

      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onEdit={handleEditAppointment}
        onCancel={handleCancelAppointment}
        onReschedule={handleRescheduleAppointment}
        onDelete={handleDeleteAppointment}
      />

      {/* New Appointment Dialog */}
      <NewAppointmentDialog
        isOpen={isNewAppointmentOpen}
        onClose={handleCloseNewAppointmentDialog}
        prefilledDate={prefilledDate}
        prefilledTime={prefilledTime}
        prefilledResourceId={prefilledResourceId}
        editingAppointment={editingAppointment}
        existingAppointments={appointments}
        onSave={handleSaveNewAppointment}
        vehicles={resources}
      />
    </div>
  );
}