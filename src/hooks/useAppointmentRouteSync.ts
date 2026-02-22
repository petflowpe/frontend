/**
 * Hook para sincronizar Citas ↔ Rutas
 * 
 * INCONSISTENCIA #1: Cuando se crea/modifica/cancela una cita,
 * las rutas NO se actualizan automáticamente
 * 
 * SOLUCIÓN: Event-driven sync entre módulos
 */

import { useEffect } from 'react';
import { eventBus, EVENTS } from '@/services/eventBus';
import { Appointment } from '@/types';

interface UseAppointmentRouteSyncOptions {
  onRouteNeedsUpdate?: (date: string, vehicleId: string) => void;
  onAppointmentAddedToRoute?: (appointmentId: string) => void;
  onAppointmentRemovedFromRoute?: (appointmentId: string) => void;
}

/**
 * Hook para sincronizar automáticamente citas con rutas
 */
export const useAppointmentRouteSync = (options: UseAppointmentRouteSyncOptions = {}) => {
  const {
    onRouteNeedsUpdate,
    onAppointmentAddedToRoute,
    onAppointmentRemovedFromRoute
  } = options;

  useEffect(() => {
    // ========================================
    // EVENTO: Cita creada
    // ========================================
    const handleAppointmentCreated = (appointment: Appointment) => {
      console.log('🔄 Sync: Nueva cita creada, actualizando ruta...', appointment.id);
      
      // Notificar que la ruta necesita re-optimización
      if (onRouteNeedsUpdate) {
        onRouteNeedsUpdate(appointment.date, appointment.vehicleId);
      }
      
      // Disparar evento de actualización de ruta
      eventBus.emitSync(EVENTS.ROUTE_UPDATED, {
        date: appointment.date,
        vehicleId: appointment.vehicleId,
        reason: 'appointment_created',
        appointmentId: appointment.id
      });
    };

    // ========================================
    // EVENTO: Cita actualizada
    // ========================================
    const handleAppointmentUpdated = (
      appointmentId: string,
      oldData: Partial<Appointment>,
      newData: Partial<Appointment>
    ) => {
      console.log('🔄 Sync: Cita actualizada, verificando cambios en ruta...', appointmentId);
      
      // Verificar si cambió la fecha, hora o vehículo
      const dateChanged = oldData.date !== newData.date;
      const timeChanged = oldData.startTime !== newData.startTime;
      const vehicleChanged = oldData.vehicleId !== newData.vehicleId;
      
      if (dateChanged || timeChanged || vehicleChanged) {
        // Si cambió de vehículo, actualizar ambas rutas
        if (vehicleChanged && oldData.vehicleId) {
          onRouteNeedsUpdate?.(oldData.date!, oldData.vehicleId);
        }
        
        // Actualizar ruta nueva
        if (newData.date && newData.vehicleId) {
          onRouteNeedsUpdate?.(newData.date, newData.vehicleId);
        }
        
        eventBus.emitSync(EVENTS.ROUTE_UPDATED, {
          date: newData.date,
          vehicleId: newData.vehicleId,
          reason: 'appointment_updated',
          appointmentId
        });
      }
    };

    // ========================================
    // EVENTO: Cita cancelada
    // ========================================
    const handleAppointmentCancelled = (appointment: Appointment) => {
      console.log('🔄 Sync: Cita cancelada, removiendo de ruta...', appointment.id);
      
      // Remover de la ruta
      if (onAppointmentRemovedFromRoute) {
        onAppointmentRemovedFromRoute(appointment.id);
      }
      
      // Re-optimizar ruta del día
      if (onRouteNeedsUpdate) {
        onRouteNeedsUpdate(appointment.date, appointment.vehicleId);
      }
      
      eventBus.emitSync(EVENTS.ROUTE_UPDATED, {
        date: appointment.date,
        vehicleId: appointment.vehicleId,
        reason: 'appointment_cancelled',
        appointmentId: appointment.id
      });
    };

    // ========================================
    // EVENTO: Cita reprogramada
    // ========================================
    const handleAppointmentRescheduled = (
      appointmentId: string,
      oldDate: string,
      newDate: string,
      vehicleId: string
    ) => {
      console.log('🔄 Sync: Cita reprogramada, actualizando rutas...', appointmentId);
      
      // Actualizar ruta del día anterior
      onRouteNeedsUpdate?.(oldDate, vehicleId);
      
      // Actualizar ruta del día nuevo
      onRouteNeedsUpdate?.(newDate, vehicleId);
      
      eventBus.emitSync(EVENTS.ROUTE_UPDATED, {
        date: newDate,
        vehicleId,
        reason: 'appointment_rescheduled',
        appointmentId
      });
    };

    // Suscribirse a eventos
    const unsubCreated = eventBus.on(EVENTS.APPOINTMENT_CREATED, handleAppointmentCreated);
    const unsubUpdated = eventBus.on(EVENTS.APPOINTMENT_UPDATED, handleAppointmentUpdated);
    const unsubCancelled = eventBus.on(EVENTS.APPOINTMENT_CANCELLED, handleAppointmentCancelled);
    const unsubRescheduled = eventBus.on(EVENTS.APPOINTMENT_RESCHEDULED, handleAppointmentRescheduled);

    // Cleanup
    return () => {
      unsubCreated();
      unsubUpdated();
      unsubCancelled();
      unsubRescheduled();
    };
  }, [onRouteNeedsUpdate, onAppointmentAddedToRoute, onAppointmentRemovedFromRoute]);
};

/**
 * Helper para validar disponibilidad antes de crear cita
 */
export const validateAppointmentAvailability = async (
  date: string,
  startTime: string,
  vehicleId: string,
  existingAppointments: Appointment[]
): Promise<{ available: boolean; conflictingAppointment?: Appointment; message?: string }> => {
  // Buscar citas del mismo vehículo en la misma fecha
  const vehicleAppointments = existingAppointments.filter(
    apt => apt.vehicleId === vehicleId && apt.date === date && apt.status !== 'cancelled'
  );

  // Verificar solapamiento de horarios
  for (const apt of vehicleAppointments) {
    const aptStart = parseTime(apt.startTime);
    const aptEnd = parseTime(apt.endTime);
    const newStart = parseTime(startTime);

    // Verificar si hay conflicto
    if (newStart >= aptStart && newStart < aptEnd) {
      return {
        available: false,
        conflictingAppointment: apt,
        message: `Ya existe una cita de ${apt.startTime} a ${apt.endTime}`
      };
    }
  }

  return { available: true };
};

/**
 * Helper para parsear tiempo
 */
const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export default useAppointmentRouteSync;
