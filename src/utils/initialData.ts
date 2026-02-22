export const INITIAL_ZONES = [
  {
    id: 'dist-san-borja',
    name: 'San Borja',
    color: '#EF4444', // Rojo
    districts: ['San Borja'],
    coverage: 'Alta',
    demand: 90,
    coordinates: {
      center: { lat: -12.1070, lng: -77.0040 },
      radius: 0,
      polygon: [
        { lat: -12.092, lng: -77.004 }, { lat: -12.100, lng: -76.990 }, 
        { lat: -12.122, lng: -76.995 }, { lat: -12.120, lng: -77.015 }, 
        { lat: -12.100, lng: -77.018 }
      ]
    }
  },
  {
    id: 'dist-miraflores',
    name: 'Miraflores',
    color: '#F97316', // Naranja
    districts: ['Miraflores'],
    coverage: 'Premium',
    demand: 95,
    coordinates: {
      center: { lat: -12.1197, lng: -77.0297 },
      radius: 0,
      polygon: [
        { lat: -12.100, lng: -77.035 }, { lat: -12.105, lng: -77.020 },
        { lat: -12.125, lng: -77.015 }, { lat: -12.135, lng: -77.030 },
        { lat: -12.120, lng: -77.045 }
      ]
    }
  },
  {
    id: 'dist-la-molina',
    name: 'La Molina',
    color: '#84CC16', // Lima
    districts: ['La Molina'],
    coverage: 'Alta',
    demand: 85,
    coordinates: {
      center: { lat: -12.0837, lng: -76.9200 },
      radius: 0,
      polygon: [
        { lat: -12.060, lng: -76.930 }, { lat: -12.070, lng: -76.900 },
        { lat: -12.100, lng: -76.910 }, { lat: -12.095, lng: -76.950 }
      ]
    }
  },
  {
    id: 'dist-surco',
    name: 'Santiago de Surco',
    color: '#10B981', // Esmeralda
    districts: ['Santiago de Surco'],
    coverage: 'Premium',
    demand: 92,
    coordinates: {
      center: { lat: -12.1337, lng: -76.9900 },
      radius: 0,
      polygon: [
        { lat: -12.100, lng: -76.980 }, { lat: -12.120, lng: -76.960 },
        { lat: -12.160, lng: -76.990 }, { lat: -12.140, lng: -77.010 }
      ]
    }
  },
  {
    id: 'dist-san-isidro',
    name: 'San Isidro',
    color: '#06B6D4', // Cian
    districts: ['San Isidro'],
    coverage: 'Premium',
    demand: 88,
    coordinates: {
      center: { lat: -12.0970, lng: -77.0370 },
      radius: 0,
      polygon: [
        { lat: -12.085, lng: -77.045 }, { lat: -12.085, lng: -77.025 },
        { lat: -12.105, lng: -77.025 }, { lat: -12.105, lng: -77.050 }
      ]
    }
  },
  {
    id: 'dist-magdalena',
    name: 'Magdalena',
    color: '#3B82F6', // Azul
    districts: ['Magdalena del Mar'],
    coverage: 'Media',
    demand: 75,
    coordinates: {
      center: { lat: -12.0920, lng: -77.0690 },
      radius: 0,
      polygon: [
        { lat: -12.080, lng: -77.075 }, { lat: -12.085, lng: -77.060 },
        { lat: -12.100, lng: -77.065 }, { lat: -12.095, lng: -77.080 }
      ]
    }
  },
  {
    id: 'dist-barranco',
    name: 'Barranco',
    color: '#6366F1', // Indigo
    districts: ['Barranco'],
    coverage: 'Alta',
    demand: 80,
    coordinates: {
      center: { lat: -12.1480, lng: -77.0210 },
      radius: 0,
      polygon: [
        { lat: -12.135, lng: -77.025 }, { lat: -12.140, lng: -77.015 },
        { lat: -12.155, lng: -77.020 }, { lat: -12.150, lng: -77.030 }
      ]
    }
  },
  {
    id: 'dist-surquillo',
    name: 'Surquillo',
    color: '#8B5CF6', // Violeta
    districts: ['Surquillo'],
    coverage: 'Media',
    demand: 78,
    coordinates: {
      center: { lat: -12.1120, lng: -77.0120 },
      radius: 0,
      polygon: [
        { lat: -12.105, lng: -77.015 }, { lat: -12.105, lng: -77.005 },
        { lat: -12.120, lng: -77.005 }, { lat: -12.120, lng: -77.020 }
      ]
    }
  },
  {
    id: 'dist-san-miguel',
    name: 'San Miguel',
    color: '#D946EF', // Fucsia
    districts: ['San Miguel'],
    coverage: 'Media',
    demand: 72,
    coordinates: {
      center: { lat: -12.0830, lng: -77.0850 },
      radius: 0,
      polygon: [
        { lat: -12.070, lng: -77.090 }, { lat: -12.075, lng: -77.075 },
        { lat: -12.095, lng: -77.080 }, { lat: -12.090, lng: -77.100 }
      ]
    }
  },
  {
    id: 'dist-lince',
    name: 'Lince',
    color: '#F43F5E', // Rosa
    districts: ['Lince'],
    coverage: 'Alta',
    demand: 82,
    coordinates: {
      center: { lat: -12.0860, lng: -77.0350 },
      radius: 0,
      polygon: [
        { lat: -12.080, lng: -77.040 }, { lat: -12.080, lng: -77.025 },
        { lat: -12.092, lng: -77.030 }, { lat: -12.092, lng: -77.045 }
      ]
    }
  },
  {
    id: 'dist-jesus-maria',
    name: 'Jesús María',
    color: '#EAB308', // Amarillo
    districts: ['Jesús María'],
    coverage: 'Alta',
    demand: 85,
    coordinates: {
      center: { lat: -12.0790, lng: -77.0470 },
      radius: 0,
      polygon: [
        { lat: -12.070, lng: -77.055 }, { lat: -12.070, lng: -77.040 },
        { lat: -12.090, lng: -77.040 }, { lat: -12.090, lng: -77.060 }
      ]
    }
  },
  {
    id: 'dist-chorrillos',
    name: 'Chorrillos',
    color: '#64748B', // Slate
    districts: ['Chorrillos'],
    coverage: 'Media',
    demand: 70,
    coordinates: {
      center: { lat: -12.1760, lng: -77.0130 },
      radius: 0,
      polygon: [
        { lat: -12.160, lng: -77.030 }, { lat: -12.160, lng: -77.000 },
        { lat: -12.200, lng: -76.990 }, { lat: -12.220, lng: -77.040 }
      ]
    }
  }
];

export const INITIAL_VEHICLES = [
  {
    vehicleId: 'vehiculo-1',
    vehicleName: 'Móvil 1',
    code: 'VEH-001',
    placa: 'ABC-123',
    driver: 'Carlos Méndez',
    assignedZones: ['dist-san-borja', 'dist-miraflores', 'dist-san-isidro', 'dist-surquillo', 'dist-lince'],
    primaryZone: 'dist-miraflores',
    maxDistance: 30, // km máximo de desplazamiento
    workDays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    startTime: '08:00',
    endTime: '18:00'
  },
  {
    vehicleId: 'vehiculo-2',
    vehicleName: 'Móvil 2',
    code: 'VEH-002',
    placa: 'XYZ-789',
    driver: 'María López',
    assignedZones: ['dist-la-molina', 'dist-surco'],
    primaryZone: 'dist-la-molina',
    maxDistance: 25,
    workDays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    startTime: '09:00',
    endTime: '17:00'
  },
  {
    vehicleId: 'vehiculo-3',
    vehicleName: 'Móvil 3',
    code: 'VEH-003',
    placa: 'DEF-456',
    driver: 'Pedro García',
    assignedZones: ['dist-magdalena', 'dist-san-miguel', 'dist-jesus-maria'],
    primaryZone: 'dist-san-miguel',
    maxDistance: 35,
    workDays: ['Mar', 'Jue', 'Vie', 'Sáb'],
    startTime: '08:30',
    endTime: '17:30'
  },
  {
    vehicleId: 'vehiculo-4',
    vehicleName: 'Móvil 4',
    code: 'VEH-004',
    placa: 'GHI-789',
    driver: 'Juan Pérez',
    assignedZones: ['dist-barranco', 'dist-chorrillos'],
    primaryZone: 'dist-barranco',
    maxDistance: 30,
    workDays: ['Lun', 'Mie', 'Vie', 'Sab'],
    startTime: '09:00',
    endTime: '16:00'
  }
];

export const INITIAL_CLIENTS = [
  {
    id: 1,
    fullName: 'María González Pérez',
    district: 'Miraflores',
    zone: 'Miraflores',
    assignedVehicle: 1,
    coordinates: '-12.1191,-77.0281',
    isFixedSchedule: true,
    appointmentFrequency: 'semanal',
    preferredDays: ['lunes', 'miércoles'],
    preferredTimeSlot: 'tarde',
    preferredTime: '14:00',
    status: 'Activo',
    scheduleNotes: 'Prefiere peluquera María'
  },
  {
    id: 2,
    fullName: 'Carlos López Torres',
    district: 'San Isidro',
    zone: 'San Isidro',
    assignedVehicle: 1,
    coordinates: '-12.0931,-77.0465',
    isFixedSchedule: true,
    appointmentFrequency: 'quincenal',
    preferredDays: ['martes', 'jueves'],
    preferredTimeSlot: 'mañana',
    preferredTime: '10:00',
    status: 'Activo',
    scheduleNotes: 'Cliente VIP'
  },
  {
    id: 3,
    fullName: 'Ana Martínez Silva',
    district: 'San Miguel',
    zone: 'San Miguel',
    assignedVehicle: 3,
    coordinates: '-12.0830,-77.0850',
    isFixedSchedule: true,
    appointmentFrequency: 'semanal',
    preferredDays: ['viernes'],
    preferredTimeSlot: 'tarde',
    preferredTime: '15:30',
    status: 'Activo',
    scheduleNotes: ''
  },
  {
    id: 4,
    fullName: 'Roberto Sánchez Díaz',
    district: 'Chorrillos',
    zone: 'Chorrillos',
    assignedVehicle: 4,
    coordinates: '-12.1760,-77.0130',
    isFixedSchedule: true,
    appointmentFrequency: 'mensual',
    preferredDays: ['sábado'],
    preferredTimeSlot: 'mañana',
    preferredTime: '09:00',
    status: 'Activo',
    scheduleNotes: 'Prefiere sábados temprano'
  },
  {
    id: 5,
    fullName: 'Patricia Ramírez Flores',
    district: 'Barranco',
    zone: 'Barranco',
    assignedVehicle: 4,
    coordinates: '-12.1497,-77.0197',
    isFixedSchedule: true,
    appointmentFrequency: 'semanal',
    preferredDays: ['lunes', 'jueves'],
    preferredTimeSlot: 'tarde',
    preferredTime: '16:00',
    status: 'Activo',
    scheduleNotes: 'Tiene 3 golden retrievers'
  }
];

export const INITIAL_ROUTES = [
  {
    id: 'R-2024-001',
    name: 'Ruta Miraflores',
    driver: 'Carlos Méndez',
    vehicle: 'Móvil 1',
    vehicleId: 'vehiculo-1',
    plate: 'ABC-123',
    date: '2024-11-30',
    status: 'active',
    startTime: '08:00',
    endTime: '16:00',
    totalDistance: 12.5,
    estimatedFuel: 5.2,
    actualFuel: 4.8,
    revenue: 380,
    efficiency: 97,
    optimized: false,
    zoneId: 'dist-miraflores',
    zone: 'Miraflores',
    appointments: [
      {
        id: 'A-001',
        time: '09:00',
        clientId: 5,
        client: 'Juan Pérez',
        pet: 'Rocky (Golden Retriever)',
        address: 'Av. Benavides 1234, Miraflores',
        district: 'Miraflores',
        service: 'Baño + Corte Completo',
        duration: 60,
        price: 65,
        status: 'completed',
        coordinates: { lat: -12.1197, lng: -77.0297 }
      },
      {
        id: 'A-002',
        time: '10:30',
        clientId: 2,
        client: 'María González',
        pet: 'Max (Labrador)',
        address: 'Calle Los Conquistadores 890, San Isidro',
        district: 'San Isidro',
        service: 'Baño Completo',
        duration: 45,
        price: 45,
        status: 'in-progress',
        coordinates: { lat: -12.0897, lng: -77.0365 }
      },
      {
        id: 'A-003',
        time: '12:00',
        clientId: 3,
        client: 'Carlos Rodríguez',
        pet: 'Bella (Poodle)',
        address: 'Av. Primavera 567, Surco',
        district: 'Santiago de Surco',
        service: 'Baño Medicinal',
        duration: 75,
        price: 55,
        status: 'pending',
        coordinates: { lat: -12.1297, lng: -76.9897 }
      }
    ]
  },
  {
    id: 'R-2024-002',
    name: 'Ruta La Molina',
    driver: 'María López',
    vehicle: 'Móvil 2',
    vehicleId: 'vehiculo-2',
    plate: 'XYZ-789',
    date: '2024-11-30',
    status: 'planned',
    startTime: '09:00',
    endTime: '15:00',
    totalDistance: 18.7,
    estimatedFuel: 8.4,
    actualFuel: 0,
    revenue: 245,
    efficiency: 88,
    optimized: false,
    zoneId: 'dist-la-molina',
    zone: 'La Molina',
    appointments: [
      {
        id: 'A-005',
        time: '09:30',
        clientId: 4,
        client: 'Ana Torres',
        pet: 'Bobby (Beagle)',
        address: 'Av. La Molina 2345, La Molina',
        district: 'La Molina',
        service: 'Baño Completo',
        duration: 45,
        price: 45,
        status: 'pending',
        coordinates: { lat: -12.0837, lng: -76.9200 }
      },
      {
        id: 'A-006',
        time: '11:00',
        clientId: 5,
        client: 'Pedro Sánchez',
        pet: 'Coco (Chihuahua)',
        address: 'Jr. Los Fresnos 456, La Molina',
        district: 'La Molina',
        service: 'Corte Profesional',
        duration: 60,
        price: 55,
        status: 'pending',
        coordinates: { lat: -12.0737, lng: -76.9300 }
      }
    ]
  },
  {
    id: 'R-2024-003',
    name: 'Ruta Chorrillos',
    driver: 'Juan Pérez',
    vehicle: 'Móvil 4',
    vehicleId: 'vehiculo-4',
    plate: 'GHI-789',
    date: '2024-11-30',
    status: 'completed',
    startTime: '08:30',
    endTime: '14:30',
    totalDistance: 22.1,
    estimatedFuel: 11.2,
    actualFuel: 10.1,
    revenue: 310,
    efficiency: 95,
    optimized: true,
    zoneId: 'dist-chorrillos',
    zone: 'Chorrillos',
    appointments: [
      {
        id: 'A-008',
        time: '09:00',
        clientId: 7,
        client: 'Rosa Jiménez',
        pet: 'Simba (Maine Coon)',
        address: 'Av. El Sol 1234, Chorrillos',
        district: 'Chorrillos',
        service: 'Baño Especial Gatos',
        duration: 40,
        price: 50,
        status: 'completed',
        coordinates: { lat: -12.1760, lng: -77.0130 }
      },
      {
        id: 'A-009',
        time: '10:30',
        clientId: 8,
        client: 'Fernando López',
        pet: 'Thor (Rottweiler)',
        address: 'Jr. Los Cedros 567, Chorrillos',
        district: 'Chorrillos',
        service: 'Paquete VIP',
        duration: 90,
        price: 120,
        status: 'completed',
        coordinates: { lat: -12.1860, lng: -77.0230 }
      }
    ]
  }
];