/**
 * Sistema de Auto-Asignación de Clientes Fijos a Rutas
 * SmartPet - Gestión Inteligente de Rutas
 */

interface Client {
  id: number;
  fullName: string;
  district: string;
  coordinates: string;
  zone?: string;
  assignedVehicle?: number;
  isFixedSchedule: boolean;
  appointmentFrequency: 'semanal' | 'quincenal' | 'mensual' | 'bajo_demanda';
  preferredDays: string[];
  preferredTimeSlot: 'mañana' | 'tarde' | 'noche';
  preferredTime?: string;
  autoAssignRoute: boolean;
  scheduleNotes?: string;
}

interface Zone {
  id: string;
  name: string;
  districts: string[];
  coordinates: {
    center: { lat: number; lng: number };
    radius: number;
  };
}

interface Vehicle {
  id: string;
  name: string;
  code: string;
  assignedZones: string[];
  primaryZone: string;
  workDays: string[];
  startTime: string;
  endTime: string;
  maxDistance: number;
}

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

/**
 * Determina la zona del cliente basándose en su distrito y coordenadas
 */
export function determineClientZone(
  client: Pick<Client, 'district' | 'coordinates'>,
  zones: Zone[]
): Zone | null {
  // Primero intentar por distrito
  for (const zone of zones) {
    if (zone.districts.some(d => d.toLowerCase() === client.district.toLowerCase())) {
      return zone;
    }
  }

  // Si no se encuentra por distrito, intentar por proximidad de coordenadas
  if (client.coordinates) {
    const [lat, lng] = client.coordinates.split(',').map(Number);
    
    for (const zone of zones) {
      const distance = calculateDistance(
        lat,
        lng,
        zone.coordinates.center.lat,
        zone.coordinates.center.lng
      );
      
      if (distance <= zone.coordinates.radius) {
        return zone;
      }
    }
  }

  return null;
}

/**
 * Calcula la distancia entre dos puntos geográficos (en km)
 * Fórmula Haversine
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Encuentra el mejor vehículo para un cliente basándose en su zona y días preferidos
 */
export function findBestVehicleForClient(
  client: Client,
  zone: Zone,
  vehicles: Vehicle[]
): Vehicle | null {
  // Filtrar vehículos que atiendan esta zona
  const availableVehicles = vehicles.filter(v =>
    v.assignedZones.includes(zone.id)
  );

  if (availableVehicles.length === 0) {
    return null;
  }

  // Convertir días preferidos del cliente a formato del vehículo
  const dayMapping: { [key: string]: string } = {
    'lunes': 'Lun',
    'martes': 'Mar',
    'miércoles': 'Mié',
    'jueves': 'Jue',
    'viernes': 'Vie',
    'sábado': 'Sáb',
    'domingo': 'Dom'
  };

  const clientDaysShort = client.preferredDays.map(d => dayMapping[d]);

  // Buscar vehículo que tenga mejor coincidencia de días
  let bestVehicle: Vehicle | null = null;
  let maxMatches = 0;

  for (const vehicle of availableVehicles) {
    const matches = clientDaysShort.filter(d => vehicle.workDays.includes(d)).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestVehicle = vehicle;
    } else if (matches === maxMatches && vehicle.primaryZone === zone.id) {
      // Si hay empate, preferir el que tenga esta zona como primaria
      bestVehicle = vehicle;
    }
  }

  return bestVehicle;
}

/**
 * Genera las fechas de citas recurrentes para los próximos 3 meses
 */
export function generateRecurringDates(
  frequency: 'semanal' | 'quincenal' | 'mensual',
  preferredDays: string[],
  startDate: Date = new Date(),
  numberOfMonths: number = 3
): Date[] {
  const dates: Date[] = [];
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + numberOfMonths);

  const dayMapping: { [key: string]: number } = {
    'domingo': 0,
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sábado': 6
  };

  const preferredDayNumbers = preferredDays.map(d => dayMapping[d]);
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    if (preferredDayNumbers.includes(dayOfWeek)) {
      dates.push(new Date(currentDate));

      // Avanzar según la frecuencia
      if (frequency === 'semanal') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (frequency === 'quincenal') {
        currentDate.setDate(currentDate.getDate() + 14);
      } else if (frequency === 'mensual') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return dates;
}

/**
 * Convierte time slot a rango de horas
 */
function getTimeRange(timeSlot: 'mañana' | 'tarde' | 'noche'): { start: string; end: string } {
  const ranges = {
    'mañana': { start: '08:00', end: '12:00' },
    'tarde': { start: '12:00', end: '18:00' },
    'noche': { start: '18:00', end: '22:00' }
  };
  return ranges[timeSlot];
}

/**
 * FUNCIÓN PRINCIPAL: Auto-asigna un cliente fijo a rutas
 */
export function autoAssignClientToRoutes(
  client: Client,
  zones: Zone[],
  vehicles: Vehicle[]
): {
  success: boolean;
  message: string;
  data?: {
    assignedZone: Zone;
    assignedVehicle: Vehicle;
    generatedAppointments: RecurringAppointment[];
  };
} {
  // Validar que el cliente sea apto para auto-asignación
  if (!client.isFixedSchedule) {
    return {
      success: false,
      message: 'El cliente no está marcado como horario fijo'
    };
  }

  if (!client.autoAssignRoute) {
    return {
      success: false,
      message: 'El cliente no tiene activada la auto-asignación'
    };
  }

  if (client.appointmentFrequency === 'bajo_demanda') {
    return {
      success: false,
      message: 'El cliente está en modo "bajo demanda", no se puede auto-asignar'
    };
  }

  if (client.preferredDays.length === 0) {
    return {
      success: false,
      message: 'El cliente no tiene días preferidos seleccionados'
    };
  }

  // 1. Determinar zona del cliente
  const zone = determineClientZone(client, zones);
  if (!zone) {
    return {
      success: false,
      message: `No se pudo determinar la zona para el distrito: ${client.district}`
    };
  }

  // 2. Encontrar el mejor vehículo
  const vehicle = findBestVehicleForClient(client, zone, vehicles);
  if (!vehicle) {
    return {
      success: false,
      message: `No hay vehículos disponibles para la zona: ${zone.name}`
    };
  }

  // 3. Generar fechas de citas recurrentes
  const dates = generateRecurringDates(
    client.appointmentFrequency,
    client.preferredDays
  );

  // 4. Crear objetos de citas recurrentes
  const timeRange = getTimeRange(client.preferredTimeSlot);
  const appointments: RecurringAppointment[] = dates.map((date, index) => ({
    id: `REC-${client.id}-${Date.now()}-${index}`,
    clientId: client.id,
    clientName: client.fullName,
    frequency: client.appointmentFrequency,
    days: client.preferredDays,
    time: client.preferredTime || timeRange.start,
    timeSlot: client.preferredTimeSlot,
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    zone: zone.name,
    district: client.district,
    coordinates: client.coordinates,
    nextAppointment: date,
    createdAt: new Date(),
    status: 'active'
  }));

  return {
    success: true,
    message: `Cliente asignado exitosamente a ${vehicle.name} en ${zone.name}`,
    data: {
      assignedZone: zone,
      assignedVehicle: vehicle,
      generatedAppointments: appointments
    }
  };
}

/**
 * Obtiene el resumen de clientes fijos por vehículo
 */
export function getFixedClientsSummary(
  clients: Client[],
  zones: Zone[],
  vehicles: Vehicle[]
): {
  vehicleId: string;
  vehicleName: string;
  fixedClientsCount: number;
  weeklyHoursCommitted: number;
  clientsByDay: {
    [day: string]: {
      clientId: number;
      clientName: string;
      time: string;
      district: string;
    }[];
  };
}[] {
  const summary = vehicles.map(vehicle => {
    const vehicleClients = clients.filter(
      c => c.isFixedSchedule && c.assignedVehicle === parseInt(vehicle.id.split('-')[1])
    );

    const clientsByDay: any = {
      'lunes': [],
      'martes': [],
      'miércoles': [],
      'jueves': [],
      'viernes': [],
      'sábado': [],
      'domingo': []
    };

    let totalHours = 0;

    vehicleClients.forEach(client => {
      client.preferredDays.forEach(day => {
        clientsByDay[day].push({
          clientId: client.id,
          clientName: client.fullName,
          time: client.preferredTime || '08:00',
          district: client.district
        });
      });

      // Estimar horas (promedio 1.5h por cita)
      const appointmentsPerWeek = client.appointmentFrequency === 'semanal' 
        ? client.preferredDays.length 
        : client.appointmentFrequency === 'quincenal'
        ? client.preferredDays.length / 2
        : client.preferredDays.length / 4;
      
      totalHours += appointmentsPerWeek * 1.5;
    });

    return {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      fixedClientsCount: vehicleClients.length,
      weeklyHoursCommitted: Math.round(totalHours * 10) / 10,
      clientsByDay
    };
  });

  return summary;
}

/**
 * Valida si un cliente puede ser convertido en cliente fijo
 */
export function validateFixedClientConversion(client: Client): {
  canConvert: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validaciones críticas
  if (!client.district) {
    errors.push('El cliente debe tener un distrito asignado');
  }

  if (!client.coordinates) {
    errors.push('El cliente debe tener coordenadas geográficas');
  }

  if (client.preferredDays.length === 0) {
    errors.push('Debe seleccionar al menos un día preferido');
  }

  if (client.appointmentFrequency === 'bajo_demanda') {
    errors.push('Debe seleccionar una frecuencia (semanal, quincenal o mensual)');
  }

  // Validaciones de advertencia
  if (!client.preferredTime) {
    warnings.push('No se ha especificado una hora preferida específica');
  }

  if (!client.zone) {
    warnings.push('El cliente no tiene zona asignada, se asignará automáticamente');
  }

  if (!client.assignedVehicle) {
    warnings.push('El cliente no tiene vehículo asignado, se asignará automáticamente');
  }

  if (!client.scheduleNotes) {
    warnings.push('No hay notas de programación para el cliente');
  }

  return {
    canConvert: errors.length === 0,
    errors,
    warnings
  };
}
