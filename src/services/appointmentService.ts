import { Appointment, RecurrenceRule } from '../contexts/AppContext';

/**
 * Servicio para manejo de citas y lógica de negocio
 */

export const appointmentService = {
  /**
   * Genera citas recurrentes basado en la regla
   */
  generateRecurringAppointments: (
    baseAppointment: Appointment,
    recurrenceRule: RecurrenceRule
  ): Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>[] => {
    const appointments: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const startDate = new Date(baseAppointment.date);
    let currentDate = new Date(startDate);
    let count = 0;

    const maxOccurrences = recurrenceRule.occurrences || 52; // máximo 1 año
    const endDate = recurrenceRule.endDate ? new Date(recurrenceRule.endDate) : null;

    while (count < maxOccurrences) {
      // Calcular siguiente fecha según frecuencia
      if (recurrenceRule.frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + (7 * recurrenceRule.interval));
      } else if (recurrenceRule.frequency === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + (14 * recurrenceRule.interval));
      } else if (recurrenceRule.frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + recurrenceRule.interval);
      }

      // Verificar si excede la fecha límite
      if (endDate && currentDate > endDate) {
        break;
      }

      // Verificar día de la semana si aplica
      if (recurrenceRule.daysOfWeek && recurrenceRule.daysOfWeek.length > 0) {
        const dayOfWeek = currentDate.getDay();
        if (!recurrenceRule.daysOfWeek.includes(dayOfWeek)) {
          continue;
        }
      }

      // Crear nueva cita
      const newAppointment = {
        ...baseAppointment,
        date: currentDate.toISOString().split('T')[0],
        parentAppointmentId: baseAppointment.id,
      };

      appointments.push(newAppointment);
      count++;
    }

    return appointments;
  },

  /**
   * Verifica si hay conflicto de horarios
   */
  hasTimeConflict: (
    newAppointment: { date: string; startTime: string; endTime: string; groomerId: string },
    existingAppointments: Appointment[]
  ): boolean => {
    const newStart = new Date(`${newAppointment.date}T${newAppointment.startTime}`);
    const newEnd = new Date(`${newAppointment.date}T${newAppointment.endTime}`);

    return existingAppointments.some(apt => {
      if (apt.groomerId !== newAppointment.groomerId) return false;
      if (apt.status === 'cancelled' || apt.status === 'no-show') return false;
      if (apt.date !== newAppointment.date) return false;

      const existingStart = new Date(`${apt.date}T${apt.startTime}`);
      const existingEnd = new Date(`${apt.date}T${apt.endTime}`);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  },

  /**
   * Calcula el tiempo estimado de finalización
   */
  calculateEstimatedEndTime: (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  },

  /**
   * Verifica si una cita puede ser cancelada sin cargo
   */
  canCancelWithoutFee: (
    appointment: Appointment,
    cancellationPolicyHours: number
  ): boolean => {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilAppointment >= cancellationPolicyHours;
  },

  /**
   * Calcula el cargo por cancelación
   */
  calculateCancellationFee: (
    appointment: Appointment,
    feePercentage: number
  ): number => {
    return (appointment.total * feePercentage) / 100;
  },

  /**
   * Obtiene el color del estado de la cita
   */
  getStatusColor: (status: Appointment['status']): string => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'confirmed':
        return 'green';
      case 'in-progress':
        return 'purple';
      case 'completed':
        return 'gray';
      case 'cancelled':
        return 'red';
      case 'no-show':
        return 'orange';
      default:
        return 'gray';
    }
  },

  /**
   * Obtiene el label en español del estado
   */
  getStatusLabel: (status: Appointment['status']): string => {
    switch (status) {
      case 'scheduled':
        return 'Programada';
      case 'confirmed':
        return 'Confirmada';
      case 'in-progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'no-show':
        return 'No Asistió';
      default:
        return status;
    }
  },

  /**
   * Filtra citas por estado de confirmación pendiente
   */
  getUnconfirmedAppointments: (appointments: Appointment[]): Appointment[] => {
    return appointments.filter(
      apt =>
        apt.confirmationStatus === 'pending' &&
        apt.status !== 'cancelled' &&
        apt.status !== 'no-show'
    );
  },

  /**
   * Obtiene citas del día para un groomer
   */
  getTodayAppointmentsForGroomer: (
    appointments: Appointment[],
    groomerId: string
  ): Appointment[] => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(apt => apt.date === today && apt.groomerId === groomerId)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },

  /**
   * Calcula estadísticas de citas
   */
  calculateAppointmentStats: (appointments: Appointment[]) => {
    const total = appointments.length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const noShows = appointments.filter(a => a.status === 'no-show').length;
    const pending = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length;

    return {
      total,
      completed,
      cancelled,
      noShows,
      pending,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      noShowRate: total > 0 ? (noShows / total) * 100 : 0,
      cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
    };
  },
};
