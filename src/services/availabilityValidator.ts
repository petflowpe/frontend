/**
 * Servicio de Validación de Disponibilidad
 * Previene double-booking y conflictos de agenda
 */

import { Appointment } from '../hooks/useAppointments';
import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ValidationResult {
  available: boolean;
  conflicts?: Appointment[];
  message?: string;
  suggestions?: string[];
}

interface WorkingHours {
  [key: string]: {
    open: boolean;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  };
}

/**
 * Validador de disponibilidad principal
 */
export class AvailabilityValidator {
  private appointments: Appointment[];
  private workingHours: WorkingHours;
  private serviceDurations: Map<string, number>; // serviceId -> duración en minutos

  constructor(
    appointments: Appointment[],
    workingHours: WorkingHours,
    serviceDurations: Map<string, number> = new Map()
  ) {
    this.appointments = appointments;
    this.workingHours = workingHours;
    this.serviceDurations = serviceDurations;
  }

  /**
   * Validación completa de disponibilidad
   */
  async validate(
    date: string,
    startTime: string,
    vehicleId: string,
    serviceIds: string[],
    excludeAppointmentId?: string
  ): Promise<ValidationResult> {
    // 1. Validar horario de trabajo
    const workingHoursValidation = this.validateWorkingHours(date, startTime);
    if (!workingHoursValidation.available) {
      return workingHoursValidation;
    }

    // 2. Calcular duración total del servicio
    const duration = this.calculateTotalDuration(serviceIds);
    const endTime = this.calculateEndTime(startTime, duration);

    // 3. Validar conflictos con otras citas del mismo vehículo
    const conflicts = this.findConflicts(
      date,
      startTime,
      endTime,
      vehicleId,
      excludeAppointmentId
    );

    if (conflicts.length > 0) {
      return {
        available: false,
        conflicts,
        message: this.buildConflictMessage(conflicts),
        suggestions: await this.getSuggestions(date, startTime, duration, vehicleId)
      };
    }

    // 4. Validar tiempo de viaje entre citas
    const travelTimeValidation = this.validateTravelTime(
      date,
      startTime,
      vehicleId,
      excludeAppointmentId
    );
    if (!travelTimeValidation.available) {
      return travelTimeValidation;
    }

    // 5. Validar límite de citas por día
    const dailyLimitValidation = this.validateDailyLimit(date, vehicleId);
    if (!dailyLimitValidation.available) {
      return dailyLimitValidation;
    }

    // Todo OK
    return {
      available: true,
      message: 'Horario disponible'
    };
  }

  /**
   * Validar que esté dentro del horario de trabajo
   */
  private validateWorkingHours(date: string, time: string): ValidationResult {
    const dayOfWeek = format(parseISO(date), 'EEEE', { locale: es }).toLowerCase();
    const schedule = this.workingHours[dayOfWeek];

    // Día no laborable
    if (!schedule || !schedule.open) {
      return {
        available: false,
        message: 'No hay atención este día',
        suggestions: this.getWorkingDays()
      };
    }

    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(schedule.startTime);
    const endMinutes = this.timeToMinutes(schedule.endTime);

    // Antes de la apertura
    if (timeMinutes < startMinutes) {
      return {
        available: false,
        message: `Horario no disponible. Abrimos a las ${schedule.startTime}`,
        suggestions: [`Horario de atención: ${schedule.startTime} - ${schedule.endTime}`]
      };
    }

    // Después del cierre
    if (timeMinutes > endMinutes) {
      return {
        available: false,
        message: `Horario no disponible. Cerramos a las ${schedule.endTime}`,
        suggestions: [`Horario de atención: ${schedule.startTime} - ${schedule.endTime}`]
      };
    }

    // Durante el break
    if (schedule.breakStart && schedule.breakEnd) {
      const breakStartMinutes = this.timeToMinutes(schedule.breakStart);
      const breakEndMinutes = this.timeToMinutes(schedule.breakEnd);

      if (timeMinutes >= breakStartMinutes && timeMinutes < breakEndMinutes) {
        return {
          available: false,
          message: `Horario de almuerzo: ${schedule.breakStart} - ${schedule.breakEnd}`,
          suggestions: [
            `Disponible antes de ${schedule.breakStart}`,
            `Disponible después de ${schedule.breakEnd}`
          ]
        };
      }
    }

    return { available: true };
  }

  /**
   * Helper para obtener vehicleId de una cita
   */
  private getVehicleId(apt: Appointment): string | undefined {
    return apt.vehicle?.id || (apt as any).vehicleId;
  }

  /**
   * Helper para obtener endTime de una cita (calculado si no existe)
   */
  private getAppointmentEndTime(apt: Appointment): string {
    if ((apt as any).endTime) return (apt as any).endTime;
    return this.calculateEndTime(apt.time, apt.duration || 60);
  }

  /**
   * Buscar conflictos de horario
   */
  private findConflicts(
    date: string,
    startTime: string,
    endTime: string,
    vehicleId: string,
    excludeAppointmentId?: string
  ): Appointment[] {
    const conflicts: Appointment[] = [];

    // Filtrar citas del mismo vehículo y fecha
    const vehicleAppointments = this.appointments.filter(
      apt =>
        this.getVehicleId(apt) === vehicleId &&
        apt.date === date &&
        apt.status !== 'cancelled' &&
        apt.id !== excludeAppointmentId
    );

    const newStart = this.timeToMinutes(startTime);
    const newEnd = this.timeToMinutes(endTime);

    // Verificar solapamiento
    for (const apt of vehicleAppointments) {
      const aptStart = this.timeToMinutes(apt.time);
      const aptEndTimeStr = this.getAppointmentEndTime(apt);
      const aptEnd = this.timeToMinutes(aptEndTimeStr);

      // Hay solapamiento si:
      // 1. La nueva cita empieza durante una cita existente
      // 2. La nueva cita termina durante una cita existente
      // 3. La nueva cita envuelve completamente una cita existente
      const overlaps =
        (newStart >= aptStart && newStart < aptEnd) ||
        (newEnd > aptStart && newEnd <= aptEnd) ||
        (newStart <= aptStart && newEnd >= aptEnd);

      if (overlaps) {
        conflicts.push(apt);
      }
    }

    return conflicts;
  }

  /**
   * Validar tiempo de viaje entre citas
   */
  private validateTravelTime(
    date: string,
    startTime: string,
    vehicleId: string,
    excludeAppointmentId?: string
  ): ValidationResult {
    const TRAVEL_TIME_MINUTES = 30; // Tiempo mínimo entre citas (viaje)

    // Buscar cita inmediatamente anterior
    const previousAppointment = this.findPreviousAppointment(
      date,
      startTime,
      vehicleId,
      excludeAppointmentId
    );

    if (previousAppointment) {
      const prevEndTime = this.getAppointmentEndTime(previousAppointment);
      const prevEndMinutes = this.timeToMinutes(prevEndTime);
      const newStartMinutes = this.timeToMinutes(startTime);
      const gap = newStartMinutes - prevEndMinutes;

      if (gap < TRAVEL_TIME_MINUTES) {
        return {
          available: false,
          message: `Se requieren al menos ${TRAVEL_TIME_MINUTES} minutos entre citas para el viaje`,
          suggestions: [
            `Intenta después de ${this.addMinutesToTime(prevEndTime, TRAVEL_TIME_MINUTES)}`
          ]
        };
      }
    }

    return { available: true };
  }

  /**
   * Validar límite diario de citas por vehículo
   */
  private validateDailyLimit(date: string, vehicleId: string): ValidationResult {
    const MAX_APPOINTMENTS_PER_DAY = 12;

    const dailyAppointments = this.appointments.filter(
      apt =>
        this.getVehicleId(apt) === vehicleId &&
        apt.date === date &&
        apt.status !== 'cancelled'
    );

    if (dailyAppointments.length >= MAX_APPOINTMENTS_PER_DAY) {
      return {
        available: false,
        message: `Este vehículo ya tiene el máximo de citas para este día (${MAX_APPOINTMENTS_PER_DAY})`,
        suggestions: ['Intenta con otro vehículo', 'Intenta otro día']
      };
    }

    return { available: true };
  }

  /**
   * Calcular duración total de los servicios
   */
  private calculateTotalDuration(serviceIds: string[]): number {
    let totalMinutes = 0;

    for (const serviceId of serviceIds) {
      const duration = this.serviceDurations.get(serviceId) || 60; // Default 60 min
      totalMinutes += duration;
    }

    return totalMinutes;
  }

  /**
   * Calcular hora de finalización
   */
  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Buscar cita anterior
   */
  private findPreviousAppointment(
    date: string,
    startTime: string,
    vehicleId: string,
    excludeAppointmentId?: string
  ): Appointment | null {
    const startMinutes = this.timeToMinutes(startTime);

    const previousAppointments = this.appointments
      .filter(
        apt =>
          this.getVehicleId(apt) === vehicleId &&
          apt.date === date &&
          apt.status !== 'cancelled' &&
          apt.id !== excludeAppointmentId &&
          this.timeToMinutes(this.getAppointmentEndTime(apt)) <= startMinutes
      )
      .sort(
        (a, b) => this.timeToMinutes(this.getAppointmentEndTime(b)) - this.timeToMinutes(this.getAppointmentEndTime(a))
      );

    return previousAppointments[0] || null;
  }

  /**
   * Obtener sugerencias de horarios disponibles
   */
  private async getSuggestions(
    date: string,
    preferredTime: string,
    duration: number,
    vehicleId: string
  ): Promise<string[]> {
    const suggestions: string[] = [];
    const dayOfWeek = format(parseISO(date), 'EEEE', { locale: es }).toLowerCase();
    const schedule = this.workingHours[dayOfWeek];

    if (!schedule || !schedule.open) {
      return [];
    }

    const startMinutes = this.timeToMinutes(schedule.startTime);
    const endMinutes = this.timeToMinutes(schedule.endTime);
    const SLOT_INCREMENT = 30; // Buscar en bloques de 30 minutos

    // Buscar primeros 3 horarios disponibles
    for (
      let time = startMinutes;
      time <= endMinutes - duration && suggestions.length < 3;
      time += SLOT_INCREMENT
    ) {
      const timeString = this.minutesToTime(time);
      const endTimeString = this.calculateEndTime(timeString, duration);

      const conflicts = this.findConflicts(date, timeString, endTimeString, vehicleId);

      if (conflicts.length === 0) {
        suggestions.push(`${timeString} - ${endTimeString}`);
      }
    }

    return suggestions;
  }

  /**
   * Construir mensaje de conflicto
   */
  private buildConflictMessage(conflicts: Appointment[]): string {
    if (conflicts.length === 1) {
      const conflict = conflicts[0];
      const endTime = this.getAppointmentEndTime(conflict);
      return `Ya existe una cita de ${conflict.time} a ${endTime} con ${conflict.clientName || conflict.client}`;
    }

    return `Hay ${conflicts.length} citas que se solapan en este horario`;
  }

  /**
   * Obtener días laborables
   */
  private getWorkingDays(): string[] {
    const days: string[] = [];

    for (const [day, schedule] of Object.entries(this.workingHours)) {
      if (schedule.open) {
        days.push(`${day}: ${schedule.startTime} - ${schedule.endTime}`);
      }
    }

    return days;
  }

  /**
   * Convertir tiempo a minutos
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convertir minutos a tiempo
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Sumar minutos a un tiempo
   */
  private addMinutesToTime(time: string, minutesToAdd: number): string {
    const totalMinutes = this.timeToMinutes(time) + minutesToAdd;
    return this.minutesToTime(totalMinutes);
  }
}

/**
 * Helper para crear instancia del validador fácilmente
 */
export const createAvailabilityValidator = (
  appointments: Appointment[],
  workingHours?: WorkingHours,
  serviceDurations?: Map<string, number>
): AvailabilityValidator => {
  // Horario por defecto
  const defaultWorkingHours: WorkingHours = {
    lunes: { open: true, startTime: '08:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    martes: { open: true, startTime: '08:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    miércoles: { open: true, startTime: '08:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    jueves: { open: true, startTime: '08:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    viernes: { open: true, startTime: '08:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
    sábado: { open: true, startTime: '08:00', endTime: '14:00' },
    domingo: { open: false, startTime: '00:00', endTime: '00:00' }
  };

  return new AvailabilityValidator(
    appointments,
    workingHours || defaultWorkingHours,
    serviceDurations
  );
};

export default AvailabilityValidator;
