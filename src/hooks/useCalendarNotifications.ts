import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook que escucha eventos del calendario y muestra notificaciones
 */
export function useCalendarNotifications() {
  useEffect(() => {
    // Evento: Cita creada
    const handleAppointmentCreated = (event: CustomEvent) => {
      const { appointment } = event.detail;
      
      toast.success('📅 Nueva cita creada', {
        description: `${appointment.clientName || appointment.client} - ${appointment.petName || appointment.pet}`,
        duration: 4000,
      });

      // Agregar a notificaciones del sistema si existe el dispatch
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('add-system-notification', {
          detail: {
            type: 'appointment',
            priority: 'medium',
            category: 'Nueva Cita',
            title: 'Cita Creada',
            message: `Nueva cita para ${appointment.clientName || appointment.client} - ${appointment.petName || appointment.pet} el ${appointment.date} a las ${appointment.time}`,
            timestamp: new Date().toISOString(),
            read: false,
            actionRequired: false,
            client: appointment.clientName || appointment.client,
            relatedModule: 'appointments',
            relatedId: appointment.id,
          }
        }));
      }
    };

    // Evento: Cita movida/reprogramada
    const handleAppointmentMoved = (event: CustomEvent) => {
      const { appointmentId, newDate, newTime, message } = event.detail;
      
      toast.info('🔄 Cita reprogramada', {
        description: message,
        duration: 4000,
      });

      window.dispatchEvent(new CustomEvent('add-system-notification', {
        detail: {
          type: 'appointment',
          priority: 'medium',
          category: 'Reprogramación',
          title: 'Cita Reprogramada',
          message: message,
          timestamp: new Date().toISOString(),
          read: false,
          actionRequired: false,
          relatedModule: 'appointments',
          relatedId: appointmentId,
        }
      }));
    };

    // Evento: Cita cancelada
    const handleAppointmentCancelled = (event: CustomEvent) => {
      const { appointmentId, message } = event.detail;
      
      toast.warning('❌ Cita cancelada', {
        description: message,
        duration: 4000,
      });

      window.dispatchEvent(new CustomEvent('add-system-notification', {
        detail: {
          type: 'appointment',
          priority: 'high',
          category: 'Cancelación',
          title: 'Cita Cancelada',
          message: message,
          timestamp: new Date().toISOString(),
          read: false,
          actionRequired: true,
          relatedModule: 'appointments',
          relatedId: appointmentId,
        }
      }));
    };

    // Evento: Conflicto de horario
    const handleScheduleConflict = (event: CustomEvent) => {
      const { message, conflicts } = event.detail;
      
      toast.error('⚠️ Conflicto de horario', {
        description: message,
        duration: 5000,
      });

      window.dispatchEvent(new CustomEvent('add-system-notification', {
        detail: {
          type: 'appointment',
          priority: 'critical',
          category: 'Conflicto',
          title: 'Conflicto de Horario Detectado',
          message: message,
          timestamp: new Date().toISOString(),
          read: false,
          actionRequired: true,
          relatedModule: 'appointments',
          data: { conflicts },
        }
      }));
    };

    // Registrar listeners
    window.addEventListener('appointment-created', handleAppointmentCreated as EventListener);
    window.addEventListener('appointment-moved', handleAppointmentMoved as EventListener);
    window.addEventListener('appointment-cancelled', handleAppointmentCancelled as EventListener);
    window.addEventListener('schedule-conflict', handleScheduleConflict as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('appointment-created', handleAppointmentCreated as EventListener);
      window.removeEventListener('appointment-moved', handleAppointmentMoved as EventListener);
      window.removeEventListener('appointment-cancelled', handleAppointmentCancelled as EventListener);
      window.removeEventListener('schedule-conflict', handleScheduleConflict as EventListener);
    };
  }, []);
}
