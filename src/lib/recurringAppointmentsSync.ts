/**
 * Sincronización de Citas Recurrentes
 * Conecta los clientes fijos con el sistema de citas
 */

interface RecurringAppointment {
  id: string;
  clientId: number;
  clientName: string;
  frequency: string;
  days: string[];
  time: string;
  timeSlot: string;
  vehicleId: string;
  vehicleName: string;
  zone: string;
  district: string;
  coordinates: string;
  nextAppointment: Date;
  createdAt: Date;
  status: 'active' | 'paused' | 'cancelled';
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  clientId: number;
  client: string;
  clientDocument: string;
  phone: string;
  petId?: number;
  pet?: string;
  breed?: string;
  items: any[];
  totalPrice: number;
  totalDuration: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  groomer?: string;
  groomerId?: number;
  vehicle?: {
    id: string;
    name: string;
    code: string;
    placa: string;
  };
  address: string;
  district: string;
  coordinates?: string;
  notes: string;
  invoiced: boolean;
  recurring: boolean;
  recurrenceInfo?: {
    type: 'weekly' | 'biweekly' | 'monthly';
    days: string[];
    endDate?: string;
    parentId?: string;
  };
  reminderSent: boolean;
}

/**
 * Convierte citas recurrentes a formato de Appointments
 */
export function convertRecurringToAppointments(
  recurringAppointments: RecurringAppointment[],
  client: any
): Appointment[] {
  const appointments: Appointment[] = [];

  recurringAppointments.forEach(recurring => {
    const appointment: Appointment = {
      id: `APT-${recurring.id}`,
      date: recurring.nextAppointment.toISOString().split('T')[0],
      time: recurring.time,
      clientId: recurring.clientId,
      client: recurring.clientName,
      clientDocument: client.documentNumber || '',
      phone: client.phone1 || '',
      petId: client.pets?.[0]?.id,
      pet: client.pets?.[0]?.name,
      breed: client.pets?.[0]?.breed,
      items: [], // Se completará al confirmar la cita
      totalPrice: 0, // Se calculará al agregar servicios
      totalDuration: 60, // Estimado por defecto
      status: 'pending',
      vehicle: {
        id: recurring.vehicleId,
        name: recurring.vehicleName,
        code: recurring.vehicleId.toUpperCase(),
        placa: 'TBD'
      },
      address: client.street ? `${client.street} ${client.streetNumber}, ${client.district}` : client.district,
      district: recurring.district,
      coordinates: recurring.coordinates,
      notes: `🔁 Cita recurrente ${recurring.frequency} - Auto-generada`,
      invoiced: false,
      recurring: true,
      recurrenceInfo: {
        type: recurring.frequency === 'semanal' ? 'weekly' : recurring.frequency === 'quincenal' ? 'biweekly' : 'monthly',
        days: recurring.days,
        parentId: recurring.id
      },
      reminderSent: false
    };

    appointments.push(appointment);
  });

  return appointments;
}

/**
 * Genera citas para los próximos N días
 */
export function generateUpcomingAppointments(
  recurringAppointments: RecurringAppointment[],
  client: any,
  daysAhead: number = 90 // 3 meses
): Appointment[] {
  const allAppointments: Appointment[] = [];
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAhead);

  recurringAppointments.forEach(recurring => {
    const dates = generateDatesForRecurring(recurring, today, endDate);
    
    dates.forEach((date, index) => {
      const appointment: Appointment = {
        id: `APT-${recurring.id}-${index}`,
        date: date.toISOString().split('T')[0],
        time: recurring.time,
        clientId: recurring.clientId,
        client: recurring.clientName,
        clientDocument: client.documentNumber || '',
        phone: client.phone1 || '',
        petId: client.pets?.[0]?.id,
        pet: client.pets?.[0]?.name,
        breed: client.pets?.[0]?.breed,
        items: [],
        totalPrice: 0,
        totalDuration: 60,
        status: 'pending',
        vehicle: {
          id: recurring.vehicleId,
          name: recurring.vehicleName,
          code: recurring.vehicleId.toUpperCase(),
          placa: 'TBD'
        },
        address: client.street ? `${client.street} ${client.streetNumber}, ${client.district}` : client.district,
        district: recurring.district,
        coordinates: recurring.coordinates,
        notes: `🔁 Cita recurrente ${recurring.frequency} - ${index + 1} de ${dates.length}`,
        invoiced: false,
        recurring: true,
        recurrenceInfo: {
          type: recurring.frequency === 'semanal' ? 'weekly' : recurring.frequency === 'quincenal' ? 'biweekly' : 'monthly',
          days: recurring.days,
          parentId: recurring.id
        },
        reminderSent: false
      };

      allAppointments.push(appointment);
    });
  });

  return allAppointments;
}

/**
 * Genera fechas para una cita recurrente
 */
function generateDatesForRecurring(
  recurring: RecurringAppointment,
  startDate: Date,
  endDate: Date
): Date[] {
  const dates: Date[] = [];
  
  const dayMapping: { [key: string]: number } = {
    'domingo': 0,
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sábado': 6
  };

  const preferredDayNumbers = recurring.days.map(d => dayMapping[d.toLowerCase()]);
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    if (preferredDayNumbers.includes(dayOfWeek)) {
      dates.push(new Date(currentDate));

      // Avanzar según la frecuencia
      if (recurring.frequency === 'semanal') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (recurring.frequency === 'quincenal') {
        currentDate.setDate(currentDate.getDate() + 14);
      } else if (recurring.frequency === 'mensual') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return dates;
}

/**
 * Obtiene el resumen de citas recurrentes de un cliente
 */
export function getClientRecurringSummary(client: any): {
  hasRecurring: boolean;
  frequency?: string;
  nextAppointment?: Date;
  totalUpcoming: number;
  days?: string[];
} {
  if (!client.isFixedSchedule || !client.recurringAppointments?.length) {
    return {
      hasRecurring: false,
      totalUpcoming: 0
    };
  }

  const upcomingAppointments = generateUpcomingAppointments(
    client.recurringAppointments,
    client,
    90
  );

  const sortedAppointments = upcomingAppointments
    .map(apt => new Date(apt.date))
    .sort((a, b) => a.getTime() - b.getTime());

  return {
    hasRecurring: true,
    frequency: client.appointmentFrequency,
    nextAppointment: sortedAppointments[0],
    totalUpcoming: upcomingAppointments.length,
    days: client.preferredDays
  };
}

/**
 * Valida si una cita recurrente se solapa con otra
 */
export function checkAppointmentConflict(
  newAppointment: Appointment,
  existingAppointments: Appointment[]
): {
  hasConflict: boolean;
  conflictingAppointment?: Appointment;
} {
  const newDate = new Date(`${newAppointment.date} ${newAppointment.time}`);
  const newEndTime = new Date(newDate.getTime() + newAppointment.totalDuration * 60000);

  for (const existing of existingAppointments) {
    // Solo verificar citas del mismo vehículo
    if (existing.vehicle?.id !== newAppointment.vehicle?.id) {
      continue;
    }

    const existingDate = new Date(`${existing.date} ${existing.time}`);
    const existingEndTime = new Date(existingDate.getTime() + existing.totalDuration * 60000);

    // Verificar solapamiento
    if (
      (newDate >= existingDate && newDate < existingEndTime) ||
      (newEndTime > existingDate && newEndTime <= existingEndTime) ||
      (newDate <= existingDate && newEndTime >= existingEndTime)
    ) {
      return {
        hasConflict: true,
        conflictingAppointment: existing
      };
    }
  }

  return {
    hasConflict: false
  };
}

/**
 * Actualiza todas las citas recurrentes futuras
 */
export function updateRecurringAppointments(
  parentId: string,
  updates: Partial<Appointment>,
  appointments: Appointment[]
): Appointment[] {
  const today = new Date();
  
  return appointments.map(apt => {
    // Solo actualizar citas futuras de esta serie
    if (
      apt.recurring && 
      apt.recurrenceInfo?.parentId === parentId &&
      new Date(apt.date) >= today
    ) {
      return { ...apt, ...updates };
    }
    return apt;
  });
}

/**
 * Cancela todas las citas recurrentes futuras
 */
export function cancelRecurringAppointments(
  parentId: string,
  appointments: Appointment[]
): Appointment[] {
  const today = new Date();
  
  return appointments.map(apt => {
    if (
      apt.recurring && 
      apt.recurrenceInfo?.parentId === parentId &&
      new Date(apt.date) >= today &&
      apt.status === 'pending'
    ) {
      return { ...apt, status: 'cancelled' as const };
    }
    return apt;
  });
}

/**
 * Obtiene estadísticas de citas recurrentes
 */
export function getRecurringStats(appointments: Appointment[]): {
  total: number;
  weekly: number;
  biweekly: number;
  monthly: number;
  active: number;
  upcoming: number;
} {
  const recurringAppts = appointments.filter(apt => apt.recurring);
  const today = new Date();

  return {
    total: recurringAppts.length,
    weekly: recurringAppts.filter(apt => apt.recurrenceInfo?.type === 'weekly').length,
    biweekly: recurringAppts.filter(apt => apt.recurrenceInfo?.type === 'biweekly').length,
    monthly: recurringAppts.filter(apt => apt.recurrenceInfo?.type === 'monthly').length,
    active: recurringAppts.filter(apt => apt.status !== 'cancelled').length,
    upcoming: recurringAppts.filter(apt => new Date(apt.date) >= today && apt.status === 'pending').length
  };
}
