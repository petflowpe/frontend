import { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Clock, Car, Plus, Route as RouteIcon, Zap, Users, DollarSign, Fuel, AlertTriangle, CheckCircle2, Filter, Download, Settings as SettingsIcon, BarChart3, Compass, Target, TrendingUp, Map, Edit, Trash2, AlertCircle, Circle, X, MessageCircle, Activity } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ZoneMapView } from './ZoneMapView';
import { RouteOptimizer } from './RouteOptimizer';
import { GeoValidator } from './GeoValidator';
import { MapInstructions } from './MapInstructions';
import { OptimizationHistory } from './OptimizationHistory';
import OptimizadorRutasMejorado from './routes/OptimizadorRutasMejorado';
import { FixedClientsView } from './routes/FixedClientsView';
import { AdvancedAnalyticsDashboard } from './routes/AdvancedAnalyticsDashboard';
import type { Parada, Ruta } from '../lib/rutasOptimizacion';
import { apiClient } from '../utils/api/client';

function unwrapApiList(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

const api = {
  fetch: async (endpoint: string) => {
    try {
      const data = await apiClient.get<any>(endpoint);
      return unwrapApiList(data);
    } catch (e) {
      console.error(`Error fetching ${endpoint}`, e);
      return null;
    }
  },
  save: async (endpoint: string, data: any) => {
    try {
      if (endpoint === '/routes' || endpoint === '/vehicle-configs') {
        console.info(`[Routes] Persistencia via ${endpoint} omitida (usar Planes de ruta / Flota)`);
        return null;
      }
      return await apiClient.post(endpoint, data);
    } catch (e) {
      console.error(`Error saving to ${endpoint}`, e);
      return null;
    }
  },
  delete: async (endpoint: string, id: string) => {
    try {
      return await apiClient.delete(`${endpoint}/${id}`);
    } catch (e) {
      console.error(`Error deleting from ${endpoint}`, e);
      return null;
    }
  },
  // Alias: algunos flujos llaman api.get (antes faltaba y rompía silenciosamente)
  get: async (endpoint: string) => {
    return api.fetch(endpoint);
  },
};

export function Routes({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [showNewRoute, setShowNewRoute] = useState(false);
  const [showZoneConfig, setShowZoneConfig] = useState(false);
  const [showVehicleZones, setShowVehicleZones] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  
  // Estados para edición
  const [editingZone, setEditingZone] = useState<any>(null);
  const [editingVehicleZone, setEditingVehicleZone] = useState<any>(null);
  const [showAddZone, setShowAddZone] = useState(false);
  
  // Estados para formulario de nueva ruta
  const [newRouteForm, setNewRouteForm] = useState({
    name: '',
    vehicleId: '',
    zoneId: '',
    date: '',
    startTime: '08:00',
    endTime: '16:00',
    autoOptimize: true
  });
  
  // 📡 REALTIME VEHICLES STATE
  const [liveVehicles, setLiveVehicles] = useState<any[]>([]);

  // Configuración de Distritos (Zonas Individuales)
  const [zones, setZones] = useState([
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
  ]);

  // Configuración de Vehículos con zonas asignadas
  const [vehicleZoneConfig, setVehicleZoneConfig] = useState([
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
  ]);

  // 🆕 Clientes Fijos de Ejemplo
  const [fixedClients] = useState([
    {
      id: 1,
      fullName: 'María González Pérez',
      district: 'Miraflores',
      zone: 'Miraflores',
      assignedVehicle: 1,
      coordinates: '-12.1191,-77.0281',
      isFixedSchedule: true,
      appointmentFrequency: 'semanal' as const,
      preferredDays: ['lunes', 'miércoles'],
      preferredTimeSlot: 'tarde' as const,
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
      appointmentFrequency: 'quincenal' as const,
      preferredDays: ['martes', 'jueves'],
      preferredTimeSlot: 'mañana' as const,
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
      appointmentFrequency: 'semanal' as const,
      preferredDays: ['viernes'],
      preferredTimeSlot: 'tarde' as const,
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
      appointmentFrequency: 'mensual' as const,
      preferredDays: ['sábado'],
      preferredTimeSlot: 'mañana' as const,
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
      appointmentFrequency: 'semanal' as const,
      preferredDays: ['lunes', 'jueves'],
      preferredTimeSlot: 'tarde' as const,
      preferredTime: '16:00',
      status: 'Activo',
      scheduleNotes: 'Tiene 3 golden retrievers'
    }
  ]);

  const [routes, setRoutes] = useState([
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
  ]);

  // 📡 REALTIME SUBSCRIPTION
  useEffect(() => {
    // 1. Carga inicial de vehículos
    const loadVehicles = async () => {
      try {
        const vehicles = await api.fetch('/vehicles');
        setLiveVehicles(vehicles);
      } catch (e) {
        console.error('Error loading vehicles:', e);
      }
    };
    loadVehicles();

    // 2. Polling de flota (mismo listado; GPS llega vía PUT del App Chofer)
    const pollInterval = setInterval(async () => {
      try {
        const vehicles = await api.fetch('/vehicles');
        if (Array.isArray(vehicles) && vehicles.length > 0) {
          setLiveVehicles(vehicles);
        }
      } catch (e) {
        console.error('Error polling vehicle positions:', e);
      }
    }, 15000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // 🔄 DATABASE SYNCHRONIZATION
  useEffect(() => {
    const syncData = async () => {
      // 1. ZONES
      try {
        const remoteZones = await api.fetch('/zones');
        if (Array.isArray(remoteZones) && remoteZones.length > 0) {
          const normalized = remoteZones.map((z: any) => {
            const coords = (z && typeof z === 'object' ? (z.coordinates ?? z.coords ?? null) : null);
            const safeCoords = coords && typeof coords === 'object'
              ? coords
              : { center: null, radius: 0, polygon: null };
            return {
              ...z,
              districts: Array.isArray(z?.districts) ? z.districts : [],
              coordinates: safeCoords,
            };
          });
          setZones(normalized);
        } else if (remoteZones && Array.isArray(remoteZones) && remoteZones.length === 0) {
          // No sembrar demos automáticamente: evita contaminar zonas reales de la empresa.
          console.info('[Routes] Sin zonas remotas; se mantienen las de sesión (no seed).');
        }
      } catch (e) { console.error('Sync error zones', e); }

      // 2) VEHICLE CONFIGS + ROUTES
      // Este módulo usa endpoints legacy (/vehicle-configs, /routes) que no existen en el backend actual.
      // Mantenerlos deshabilitados evita 404 + reintentos + crashes de UI.
    };

    syncData();
  }, []); // Run once on mount

  const optimizationSuggestions = [
    {
      routeId: 'R-2024-002',
      route: 'Ruta Lima Norte',
      suggestion: 'Reordenar paradas según densidad de tráfico',
      timeSaved: '18 min',
      fuelSaved: '2.1L',
      moneySaved: '8.50 S/',
      distanceReduced: 4.2,
      priority: 'high'
    },
    {
      routeId: 'R-2024-001',
      route: 'Ruta Lima Moderna',
      suggestion: 'Optimizar horario para evitar hora punta',
      timeSaved: '12 min',
      fuelSaved: '1.5L',
      moneySaved: '6.20 S/',
      distanceReduced: 2.8,
      priority: 'medium'
    }
  ];

  const routeMetrics = {
    totalRoutes: routes.length,
    activeRoutes: routes.filter(r => r.status === 'active').length,
    completedToday: routes.filter(r => r.status === 'completed').length,
    totalDistance: routes.reduce((sum, r) => sum + r.totalDistance, 0),
    totalRevenue: routes.reduce((sum, r) => sum + r.revenue, 0),
    averageEfficiency: Math.round(routes.reduce((sum, r) => sum + r.efficiency, 0) / routes.length),
    fuelSaved: 15.2,
    costReduction: 18.5,
    totalAppointments: routes.reduce((sum, r) => sum + r.appointments.length, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'planned': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'En Curso';
      case 'planned': return 'Planificada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getZoneColor = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone?.color || '#6b7280';
  };

  const handleOptimizeRoute = (routeId: string) => {
    toast.success('✅ Ruta optimizada correctamente', {
      description: 'Se ha calculado la ruta más eficiente'
    });
    setShowOptimizeDialog(false);
  };

  // Convertir ruta al formato del optimizador
  const convertirRutaParaOptimizador = (route: any): Ruta => {
    const paradas: Parada[] = route.appointments.map((apt: any, index: number) => ({
      id: apt.id,
      clienteId: apt.clientId?.toString() || `client-${index}`,
      clienteNombre: apt.client,
      categoria: (apt.clientId === 1 || apt.clientId === 4) ? 'oro' : 
                 (apt.clientId === 2 || apt.clientId === 3) ? 'bronce' : 'plata',
      direccion: apt.address,
      distrito: apt.district,
      lat: apt.coordinates?.lat || -12.0897,
      lng: apt.coordinates?.lng || -77.0365,
      horarioPreferido: apt.time,
      esEmergencia: false,
      duracionEstimada: apt.duration || 60,
      servicios: [apt.service],
      ingresoEstimado: apt.price || 0
    }));

    return {
      id: route.id,
      nombre: route.name,
      fecha: route.date,
      paradas: paradas,
      vehiculoId: route.vehicleId,
      conductorId: route.driver,
      estado: route.status === 'active' ? 'en-curso' : 
             route.status === 'planned' ? 'planificada' : 
             route.status === 'completed' ? 'completada' : 'cancelada'
    };
  };

  const RouteCard = ({ route }: { route: any }) => (
    <Card className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
      selectedRoute?.id === route.id ? 'ring-2 ring-primary shadow-lg border-primary' : ''
    }`} onClick={() => setSelectedRoute(route)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-bold text-lg">{route.name}</h3>
            <Badge className={getStatusColor(route.status)}>
              {getStatusText(route.status)}
            </Badge>
            {route.optimized && (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                <Zap className="h-3 w-3 mr-1" />
                Optimizada
              </Badge>
            )}
          </div>
          
          {/* Zona asignada */}
          <div className="flex items-center gap-2 mb-3 p-2 rounded-lg border" style={{ 
            backgroundColor: `${getZoneColor(route.zoneId)}15`,
            borderColor: getZoneColor(route.zoneId)
          }}>
            <Circle className="h-3 w-3" style={{ fill: getZoneColor(route.zoneId), color: getZoneColor(route.zoneId) }} />
            <span className="text-sm font-semibold" style={{ color: getZoneColor(route.zoneId) }}>
              {route.zone}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{route.driver}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Car className="h-4 w-4" />
              <span>{route.vehicle} ({route.plate})</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{route.startTime} - {route.endTime}</span>
            </div>
            <div className="flex items-center space-x-1">
              <RouteIcon className="h-4 w-4" />
              <span>{route.totalDistance.toFixed(1)} km</span>
            </div>
          </div>
        </div>
        <div className="text-right ml-4">
          <p className="text-2xl font-bold text-primary">{route.revenue} S/</p>
          <p className="text-sm text-muted-foreground">{route.appointments.length} citas</p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-muted-foreground mr-2">Eficiencia:</span>
            <Progress value={route.efficiency} className="w-16 h-2" />
            <span className="text-xs ml-2 font-semibold">{route.efficiency}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Fuel className="h-4 w-4 text-orange-500" />
            <span>{route.estimatedFuel.toFixed(1)}L</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="h-4 w-4 text-green-500" />
            <span>{route.appointments.filter((a: any) => a.status === 'completed').length}/{route.appointments.length}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          {route.status === 'planned' && (
            <Button size="sm" variant="outline" onClick={() => {
              toast.success('🚀 Ruta iniciada', {
                description: `${route.vehicle} ha comenzado la ruta`
              });
            }}>
              <Navigation className="h-4 w-4 mr-1" />
              Iniciar Ruta
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => {
            toast.info('🗺️ Abriendo mapa', {
              description: 'Visualizando ubicación en el mapa'
            });
          }}>
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🗺️ Gestión Inteligente de Rutas
          </h1>
          <p className="text-muted-foreground text-lg">
            Optimización automática por zonas con límites geográficos
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="default" className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => {
            if (onNavigate) onNavigate('driver-session');
            else toast.error('Navegación no disponible');
          }}>
            <Car className="h-4 w-4 mr-2" />
            App Chofer (Simulador)
          </Button>
          <Button variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200" onClick={() => {
            if (onNavigate) onNavigate('operations-center');
            else toast.error('Navegación no disponible');
          }}>
            <Activity className="h-4 w-4 mr-2" />
            Centro Control
          </Button>
          <Button variant="outline" onClick={() => {
            if (onNavigate) onNavigate('public-tracking');
            toast.success('📍 Abriendo GPS Tracking público', {
              description: 'Página de seguimiento en vivo para clientes'
            });
          }}>
            <Navigation className="h-4 w-4 mr-2" />
            GPS Tracking Público
          </Button>
          
          <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => {
            const message = encodeURIComponent("¡Hola! 🐾 Tu groomer de SmartPet está en camino. Sigue su ubicación en tiempo real aquí: https://smartpet-demo.vercel.app/track/SPT-88291");
            window.open(`https://wa.me/?text=${message}`, '_blank');
            toast.success('📱 Abriendo WhatsApp', {
              description: 'Listo para enviar al cliente'
            });
          }}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Enviar Demo WhatsApp
          </Button>
          <Button variant="outline" onClick={() => setShowVehicleZones(true)}>
            <Car className="h-4 w-4 mr-2" />
            Configurar Vehículos
          </Button>
          <Button variant="outline" onClick={() => setShowZoneConfig(true)}>
            <Map className="h-4 w-4 mr-2" />
            Gestionar Zonas
          </Button>
          <Button variant="outline" onClick={() => {
            toast.success('📊 Exportando datos', {
              description: 'Descargando informe de rutas en Excel'
            });
          }}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Optimizar Rutas
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>🚀 Optimización Inteligente de Rutas</DialogTitle>
                <DialogDescription>
                  Análisis automático basado en tráfico, distancia y zonas asignadas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {optimizationSuggestions.map((suggestion, index) => (
                  <Card key={index} className="p-4 border-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold">{suggestion.route}</h4>
                          <Badge variant={suggestion.priority === 'high' ? 'default' : 'secondary'}>
                            {suggestion.priority === 'high' ? 'Alta Prioridad' : 'Media Prioridad'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{suggestion.suggestion}</p>
                        <div className="grid grid-cols-4 gap-3 text-sm">
                          <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-200 dark:border-green-800">
                            <p className="text-xs text-muted-foreground">Tiempo</p>
                            <p className="font-bold text-green-600">{suggestion.timeSaved}</p>
                          </div>
                          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-muted-foreground">Combustible</p>
                            <p className="font-bold text-blue-600">{suggestion.fuelSaved}</p>
                          </div>
                          <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-200 dark:border-purple-800">
                            <p className="text-xs text-muted-foreground">Ahorro</p>
                            <p className="font-bold text-purple-600">{suggestion.moneySaved}</p>
                          </div>
                          <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-200 dark:border-orange-800">
                            <p className="text-xs text-muted-foreground">Distancia</p>
                            <p className="font-bold text-orange-600">-{suggestion.distanceReduced}km</p>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleOptimizeRoute(suggestion.routeId)} className="ml-4">
                        Aplicar
                      </Button>
                    </div>
                  </Card>
                ))}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowOptimizeDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    toast.success('✅ Todas las optimizaciones aplicadas');
                    setShowOptimizeDialog(false);
                  }}>
                    Aplicar Todas
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showNewRoute} onOpenChange={setShowNewRoute}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Ruta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Ruta</DialogTitle>
                <DialogDescription>
                  Las citas se asignarán automáticamente según la zona del vehículo
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <Label>Nombre de la Ruta</Label>
                    <Input 
                      placeholder="Ej: Ruta Miraflores" 
                      value={newRouteForm.name}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Vehículo *</Label>
                    <Select value={newRouteForm.vehicleId} onValueChange={(value) => setNewRouteForm({ ...newRouteForm, vehicleId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar vehículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleZoneConfig.map((vc) => (
                          <SelectItem key={vc.vehicleId} value={vc.vehicleId}>
                            {vc.vehicleName} - {vc.placa} ({vc.driver})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Las zonas disponibles se mostrarán según el vehículo
                    </p>
                  </div>
                  <div>
                    <Label>Zona de Cobertura *</Label>
                    <Select value={newRouteForm.zoneId} onValueChange={(value) => setNewRouteForm({ ...newRouteForm, zoneId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Zona asignada al vehículo" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone.id} value={zone.id}>
                            <div className="flex items-center gap-2">
                              <Circle className="h-3 w-3" style={{ fill: zone.color, color: zone.color }} />
                              {zone.name} - {zone.districts.length} distritos
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Fecha *</Label>
                    <Input 
                      type="date" 
                      value={newRouteForm.date}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Hora de Inicio</Label>
                    <Input 
                      type="time" 
                      value={newRouteForm.startTime}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Hora de Fin</Label>
                    <Input 
                      type="time" 
                      value={newRouteForm.endTime}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, endTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Optimizar automáticamente</Label>
                    <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                      <input 
                        type="checkbox" 
                        id="auto-optimize" 
                        checked={newRouteForm.autoOptimize}
                        onChange={(e) => setNewRouteForm({ ...newRouteForm, autoOptimize: e.target.checked })}
                        className="rounded" 
                      />
                      <label htmlFor="auto-optimize" className="text-sm">
                        Ordenar citas por eficiencia
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => {
                  setShowNewRoute(false);
                  setNewRouteForm({
                    name: '',
                    vehicleId: '',
                    zoneId: '',
                    date: '',
                    startTime: '08:00',
                    endTime: '16:00',
                    autoOptimize: true
                  });
                }}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  if (!newRouteForm.vehicleId || !newRouteForm.date) {
                    toast.error('⚠️ Campos requeridos', {
                      description: 'Por favor complete Vehículo y Fecha'
                    });
                    return;
                  }
                  const selectedVehicle = vehicleZoneConfig.find(v => v.vehicleId === newRouteForm.vehicleId);
                  const selectedZone = zones.find(z => z.id === newRouteForm.zoneId);
                  
                  // Crear nueva ruta
                  const newRoute = {
                    id: `R-2024-${String(routes.length + 1).padStart(3, '0')}`,
                    name: newRouteForm.name || `Ruta ${selectedZone?.name || 'Nueva'}`,
                    driver: selectedVehicle?.driver || 'Sin conductor',
                    vehicle: selectedVehicle?.vehicleName || 'Sin vehículo',
                    vehicleId: newRouteForm.vehicleId,
                    plate: selectedVehicle?.placa || '',
                    date: newRouteForm.date,
                    status: 'planned',
                    startTime: newRouteForm.startTime,
                    endTime: newRouteForm.endTime,
                    totalDistance: 0,
                    estimatedFuel: 0,
                    actualFuel: 0,
                    revenue: 0,
                    efficiency: 0,
                    optimized: newRouteForm.autoOptimize,
                    zoneId: newRouteForm.zoneId || selectedVehicle?.primaryZone || '',
                    zone: selectedZone?.name || 'Sin zona',
                    appointments: []
                  };
                  
                  // Agregar la nueva ruta al estado
                  setRoutes([...routes, newRoute]);
                  api.save('/routes', newRoute); // 💾 Save to Database
                  
                  toast.success('✅ Ruta creada exitosamente', {
                    description: `${newRoute.name} para ${selectedVehicle?.vehicleName} en ${selectedZone?.name || 'zona asignada'}`
                  });
                  
                  setShowNewRoute(false);
                  setNewRouteForm({
                    name: '',
                    vehicleId: '',
                    zoneId: '',
                    date: '',
                    startTime: '08:00',
                    endTime: '16:00',
                    autoOptimize: true
                  });
                }}>
                  Crear Ruta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Rutas Activas</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{routeMetrics.activeRoutes}</p>
            </div>
            <RouteIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">Completadas</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{routeMetrics.completedToday}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Ingresos</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{routeMetrics.totalRevenue} S/</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">Distancia</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{routeMetrics.totalDistance.toFixed(0)}km</p>
            </div>
            <Navigation className="h-8 w-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-2 border-cyan-200 dark:border-cyan-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">Eficiencia</p>
              <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{routeMetrics.averageEfficiency}%</p>
            </div>
            <Target className="h-8 w-8 text-cyan-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-2 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Ahorro</p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{routeMetrics.fuelSaved}L</p>
            </div>
            <Fuel className="h-8 w-8 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-2 border-pink-200 dark:border-pink-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-pink-600 dark:text-pink-400">Citas</p>
              <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">{routeMetrics.totalAppointments}</p>
            </div>
            <Clock className="h-8 w-8 text-pink-500" />
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="today">📍 Hoy</TabsTrigger>
          <TabsTrigger value="fixed-clients">🔁 Clientes Fijos</TabsTrigger>
          <TabsTrigger value="planned">📅 Planificadas</TabsTrigger>
          <TabsTrigger value="map">🗺️ Mapa GPS</TabsTrigger>
          <TabsTrigger value="zones">⚙️ Zonas</TabsTrigger>
          <TabsTrigger value="history">📊 Historial</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {/* 🆕 Banner informativo */}
          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
            <Zap className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">⚡ Optimización de Rutas Habilitada</AlertTitle>
            <AlertDescription className="text-blue-800">
              Selecciona cualquier ruta para ver el <strong>Optimizador Inteligente</strong> con priorización por categoría (Oro → Bronce → Plata) y algoritmo TSP. Scroll down después de seleccionar una ruta.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Rutas del Día</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    toast.info('🔍 Filtros', {
                      description: 'Abriendo opciones de filtrado'
                    });
                  }}>
                    <Filter className="h-4 w-4 mr-1" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    toast.info('👁️ Vista', {
                      description: 'Cambiando modo de visualización'
                    });
                  }}>
                    <SettingsIcon className="h-4 w-4 mr-1" />
                    Vista
                  </Button>
                </div>
              </div>
              {routes.filter(r => r.status === 'active' || r.status === 'planned').map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>

            {/* Route Details */}
            <div>
              {selectedRoute ? (
                <Card className="p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{selectedRoute.name}</h3>
                    <Badge className={getStatusColor(selectedRoute.status)}>
                      {getStatusText(selectedRoute.status)}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Conductor:</span>
                        <p className="font-medium">{selectedRoute.driver}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vehículo:</span>
                        <p className="font-medium">{selectedRoute.vehicle}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Horario:</span>
                        <p className="font-medium">{selectedRoute.startTime} - {selectedRoute.endTime}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Distancia:</span>
                        <p className="font-medium">{selectedRoute.totalDistance.toFixed(1)} km</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Citas Programadas ({selectedRoute.appointments.length})
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedRoute.appointments.map((appointment: any) => (
                          <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{appointment.time}</span>
                                <span className={`text-xs ${getAppointmentStatusColor(appointment.status)}`}>
                                  {appointment.status === 'completed' && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                                  {appointment.status === 'in-progress' && <Clock className="h-3 w-3 inline mr-1" />}
                                  {appointment.status === 'pending' && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                                  {appointment.status === 'completed' ? 'Completada' : 
                                   appointment.status === 'in-progress' ? 'En Curso' : 'Pendiente'}
                                </span>
                              </div>
                              <p className="text-sm font-medium">{appointment.client}</p>
                              <p className="text-xs text-muted-foreground">{appointment.pet}</p>
                              <p className="text-xs text-muted-foreground">{appointment.district}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">{appointment.price} S/</p>
                              <p className="text-xs text-muted-foreground">{appointment.duration}min</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Progreso de la ruta:</span>
                        <span className="text-sm font-medium">
                          {selectedRoute.appointments.filter((a: any) => a.status === 'completed').length} / {selectedRoute.appointments.length}
                        </span>
                      </div>
                      <Progress 
                        value={(selectedRoute.appointments.filter((a: any) => a.status === 'completed').length / selectedRoute.appointments.length) * 100} 
                        className="h-2" 
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button size="sm" className="w-full" onClick={() => {
                        toast.info('🗺️ Abriendo mapa', {
                          description: `Mostrando ubicación de ${selectedRoute.name}`
                        });
                      }}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Ver en Mapa
                      </Button>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => {
                        toast.success('🧭 Navegación iniciada', {
                          description: 'Abriendo Google Maps'
                        });
                      }}>
                        <Navigation className="h-4 w-4 mr-2" />
                        Iniciar Navegación
                      </Button>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => {
                        toast.success('📄 Exportando ruta', {
                          description: 'Descargando PDF de la ruta'
                        });
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Ruta
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <RouteIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg mb-2">Selecciona una ruta</h3>
                  <p className="text-muted-foreground">
                    Haz clic en una ruta para ver los detalles
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* 🆕 OPTIMIZADOR DE RUTAS MEJORADO CON PRIORIZACIÓN */}
          {selectedRoute && (
            <div className="mt-6">
              <OptimizadorRutasMejorado 
                ruta={convertirRutaParaOptimizador(selectedRoute)}
                onAplicarOptimizacion={(paradasOptimizadas) => {
                  // Actualizar la ruta con el nuevo orden
                  const rutaActualizada = {
                    ...selectedRoute,
                    appointments: paradasOptimizadas.map((parada, index) => {
                      const aptOriginal = selectedRoute.appointments.find((a: any) => a.id === parada.id);
                      return {
                        ...aptOriginal,
                        time: index === 0 ? selectedRoute.startTime : undefined
                      };
                    }),
                    optimized: true
                  };
                  
                  setRoutes(routes.map(r => r.id === selectedRoute.id ? rutaActualizada : r));
                  setSelectedRoute(rutaActualizada);
                  
                  toast.success('✅ Ruta optimizada', {
                    description: 'Se ha aplicado el orden optimizado con priorización por categoría'
                  });
                }}
              />
            </div>
          )}
        </TabsContent>

        {/* 🆕 TAB: CLIENTES FIJOS */}
        <TabsContent value="fixed-clients" className="space-y-6">
          <FixedClientsView 
            clients={fixedClients} 
            vehicles={vehicleZoneConfig}
          />
        </TabsContent>

        <TabsContent value="planned" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rutas Planificadas</h3>
            {routes.filter(r => r.status === 'planned').map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <div className="space-y-6">
            {/* Instrucciones del sistema GPS */}
            <MapInstructions />

            {/* Mapa interactivo con todas las zonas */}
            <ZoneMapView
              zones={zones}
              appointments={routes
                .filter(r => r.status === 'active')
                .flatMap(r => r.appointments)}
              vehicles={liveVehicles} // 📡 Realtime Vehicles
              selectedZone={null}
              editable={true}
              onZoneCreate={(newZone) => {
                const zoneWithId = {
                  ...newZone,
                  id: `zona-${zones.length + 1}`
                };
                setZones([...zones, zoneWithId]);
                api.save('/zones', zoneWithId); // 💾 Save to Database
                toast.success('✅ Nueva zona creada', {
                  description: `${zoneWithId.name} agregada al sistema`
                });
              }}
            />

            {/* Optimizador de Rutas */}
            {selectedRoute && selectedRoute.appointments.length > 0 && (
              <RouteOptimizer
                appointments={selectedRoute.appointments}
                onOptimize={(reorderedAppointments) => {
                  const updatedRoute = { ...selectedRoute, appointments: reorderedAppointments, optimized: true };
                  const updatedRoutes = routes.map(r =>
                    r.id === selectedRoute.id
                      ? updatedRoute
                      : r
                  );
                  setRoutes(updatedRoutes);
                  api.save('/routes', updatedRoute); // 💾 Save to Database
                  setSelectedRoute({ ...selectedRoute, appointments: reorderedAppointments });
                }}
              />
            )}

            {/* Selector de ruta para optimizar */}
            {!selectedRoute && routes.length > 0 && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Optimizar Ruta Específica</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecciona una ruta para ver el optimizador GPS y reordenar las citas automáticamente
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {routes.map(route => (
                      <Button
                        key={route.id}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start gap-2"
                        onClick={() => setSelectedRoute(route)}
                      >
                        <div className="font-semibold">{route.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {route.appointments.length} citas • {route.totalDistance} km
                        </div>
                        <Badge variant={route.optimized ? 'default' : 'secondary'}>
                          {route.optimized ? 'Optimizada' : 'Sin optimizar'}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Validador Geográfico - Ejemplo */}
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">🎯 Validación Geográfica Automática</h3>
                  <p className="text-sm text-muted-foreground">
                    El sistema valida automáticamente si las direcciones están dentro de las zonas de cobertura al crear citas
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="text-sm font-medium">Ejemplo de validaciones:</div>
                  
                  <GeoValidator
                    address="Av. Benavides 1234, Miraflores"
                    coordinates={{ lat: -12.1197, lng: -77.0297 }}
                    zones={zones}
                    vehicles={vehicleZoneConfig}
                    selectedVehicleId="vehiculo-1"
                  />
                  
                  <GeoValidator
                    address="Av. La Molina 2345, La Molina (Vehículo 1 no cubre)"
                    coordinates={{ lat: -12.0837, lng: -76.9200 }}
                    zones={zones}
                    vehicles={vehicleZoneConfig}
                    selectedVehicleId="vehiculo-1"
                  />
                  
                  <GeoValidator
                    address="Av. Los Héroes 890, Comas (Fuera de zona)"
                    coordinates={{ lat: -11.9435, lng: -77.0409 }}
                    zones={zones}
                    vehicles={vehicleZoneConfig}
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    💡 Funcionalidades implementadas:
                  </div>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li>Detección automática de zona por coordenadas</li>
                    <li>Validación de cobertura del vehículo</li>
                    <li>Sugerencia de vehículos alternativos</li>
                    <li>Cálculo de distancia al centro de zona</li>
                    <li>Alertas si la dirección está fuera de cobertura</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zones" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {zones.map((zone) => (
              <Card key={zone.id} className="p-6 border-2" style={{ borderColor: zone.color }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${zone.color}20` }}>
                      <Circle className="h-6 w-6" style={{ fill: zone.color, color: zone.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{zone.name}</h3>
                      <p className="text-sm text-muted-foreground">{zone.districts.length} distritos</p>
                    </div>
                  </div>
                  <Badge variant="outline" style={{ borderColor: zone.color, color: zone.color }}>
                    {zone.coverage}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Demanda:</span>
                      <span className="text-sm font-bold" style={{ color: zone.color }}>{zone.demand}%</span>
                    </div>
                    <Progress value={zone.demand} className="h-2" />
                  </div>

                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-semibold mb-2">Distritos cubiertos:</p>
                    <div className="flex flex-wrap gap-1">
                      {zone.districts.map((district, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {district}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-muted/30 rounded">
                      <p className="text-xs text-muted-foreground">Tipo de Zona</p>
                      <p className="font-semibold">
                        {Array.isArray(zone?.coordinates?.polygon) && zone.coordinates.polygon.length > 0
                          ? 'Polígono (Distrital)'
                          : (typeof zone?.coordinates?.radius === 'number' ? `Radio ${zone.coordinates.radius} km` : 'Sin coordenadas')}
                      </p>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <p className="text-xs text-muted-foreground">Vehículos</p>
                      <p className="font-semibold">
                        {vehicleZoneConfig.filter(v => v.assignedZones.includes(zone.id)).length}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                      setEditingZone(zone);
                    }}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                      setSelectedRoute(routes.find(r => r.zoneId === zone.id) || null);
                      setActiveTab('map');
                      toast.success('🗺️ Mapa activado', {
                        description: `Visualizando zona ${zone.name}`
                      });
                    }}>
                      <MapPin className="h-4 w-4 mr-1" />
                      Ver Mapa
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <OptimizationHistory />
          
          <Separator className="my-8" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Historial de Rutas Completadas</h3>
            {routes.filter(r => r.status === 'completed').map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* 🆕 DASHBOARD ANALÍTICO AVANZADO */}
          <AdvancedAnalyticsDashboard 
            clients={fixedClients}
            vehicles={vehicleZoneConfig}
          />
          
          {/* Analytics Antiguos (mantener como referencia) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Rendimiento por Zona (Rutas Tradicionales)
              </h3>
              <div className="space-y-4">
                {zones.map((zone) => {
                  const zoneRoutes = routes.filter(r => r.zoneId === zone.id);
                  const totalRevenue = zoneRoutes.reduce((sum, r) => sum + r.revenue, 0);
                  const avgEfficiency = zoneRoutes.length > 0 
                    ? zoneRoutes.reduce((sum, r) => sum + r.efficiency, 0) / zoneRoutes.length 
                    : 0;

                  return (
                    <div key={zone.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Circle className="h-3 w-3" style={{ fill: zone.color, color: zone.color }} />
                          <span className="font-semibold">{zone.name}</span>
                        </div>
                        <span className="font-bold text-primary">{totalRevenue} S/</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Rutas</p>
                          <p className="font-semibold">{zoneRoutes.length}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Eficiencia</p>
                          <p className="font-semibold">{avgEfficiency.toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Demanda</p>
                          <p className="font-semibold">{zone.demand}%</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Optimización Acumulada
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Tiempo Ahorrado</p>
                  <p className="text-3xl font-bold text-green-600">2.5 horas</p>
                  <p className="text-xs text-muted-foreground">Esta semana</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Combustible Ahorrado</p>
                  <p className="text-3xl font-bold text-blue-600">15.2 L</p>
                  <p className="text-xs text-muted-foreground">Esta semana</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Reducción de Costos</p>
                  <p className="text-3xl font-bold text-purple-600">18.5%</p>
                  <p className="text-xs text-muted-foreground">vs. mes anterior</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Configuración de Zonas */}
      <Dialog open={showZoneConfig} onOpenChange={setShowZoneConfig}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🗺️ Gestión de Zonas y Distritos</DialogTitle>
            <DialogDescription>
              Configure las zonas de cobertura y límites geográficos para cada área de servicio
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {zones.map((zone) => (
              <Card key={zone.id} className="p-4 border-2" style={{ borderColor: zone.color }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded flex items-center justify-center" style={{ backgroundColor: `${zone.color}20` }}>
                      <Circle className="h-5 w-5" style={{ fill: zone.color, color: zone.color }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{zone.name}</h4>
                      <p className="text-sm text-muted-foreground">{zone.districts.length} distritos • Radio: {zone.coordinates.radius}km</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {zone.districts.slice(0, 3).map((district, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {district}
                          </Badge>
                        ))}
                        {zone.districts.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{zone.districts.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingZone(zone);
                      toast.info('✏️ Modo edición', {
                        description: `Editando zona: ${zone.name}`
                      });
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      if (confirm(`¿Está seguro que desea eliminar la zona "${zone.name}"?`)) {
                        setZones(zones.filter(z => z.id !== zone.id));
                        api.delete('/zones', zone.id); // 🗑️ Delete from Database
                        toast.success('✅ Zona eliminada', {
                          description: `La zona ${zone.name} ha sido eliminada`
                        });
                      }
                    }}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            <Button className="w-full" onClick={() => {
              const newZone = {
                id: `zona-${zones.length + 1}`,
                name: `Nueva Zona ${zones.length + 1}`,
                color: '#6366f1',
                districts: [],
                coverage: 'Básica',
                demand: 0,
                coordinates: {
                  center: { lat: -12.0464, lng: -77.0428 },
                  radius: 5
                }
              };
              setZones([...zones, newZone]);
              api.save('/zones', newZone); // 💾 Save to Database
              toast.success('✅ Zona creada', {
                description: 'Nueva zona agregada correctamente. Puede editarla ahora.'
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Nueva Zona
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Zona */}
      <Dialog open={!!editingZone} onOpenChange={(open) => !open && setEditingZone(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>✏️ Editar Zona</DialogTitle>
            <DialogDescription>
              Modifique el nombre, color, distritos y configuración de la zona
            </DialogDescription>
          </DialogHeader>
          {editingZone && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre de la Zona</Label>
                  <Input
                    value={editingZone.name}
                    onChange={(e) => setEditingZone({
                      ...editingZone,
                      name: e.target.value
                    })}
                    placeholder="Ej: Lima Centro"
                  />
                </div>
                <div>
                  <Label>Color Identificador</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={editingZone.color}
                      onChange={(e) => setEditingZone({
                        ...editingZone,
                        color: e.target.value
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={editingZone.color}
                      onChange={(e) => setEditingZone({
                        ...editingZone,
                        color: e.target.value
                      })}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Distritos Incluidos</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Escriba el nombre del distrito y presione Enter para agregarlo
                </p>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Nombre del distrito"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        const district = input.value.trim();
                        if (district && !editingZone.districts.includes(district)) {
                          setEditingZone({
                            ...editingZone,
                            districts: [...editingZone.districts, district]
                          });
                          input.value = '';
                          toast.success('✅ Distrito agregado', {
                            description: `${district} ha sido agregado a la zona`
                          });
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      const district = input.value.trim();
                      if (district && !editingZone.districts.includes(district)) {
                        setEditingZone({
                          ...editingZone,
                          districts: [...editingZone.districts, district]
                        });
                        input.value = '';
                        toast.success('✅ Distrito agregado', {
                          description: `${district} ha sido agregado a la zona`
                        });
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px] bg-muted/30">
                  {editingZone.districts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay distritos agregados</p>
                  ) : (
                    editingZone.districts.map((district, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-2 py-1 cursor-pointer hover:bg-destructive hover:text-white transition-colors"
                        onClick={() => {
                          setEditingZone({
                            ...editingZone,
                            districts: editingZone.districts.filter((_, i) => i !== index)
                          });
                          toast.info('ℹ️ Distrito removido', {
                            description: `${district} ha sido removido`
                          });
                        }}
                      >
                        {district}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Radio de Cobertura (km)</Label>
                  {editingZone.coordinates.polygon ? (
                    <div className="p-2 bg-muted rounded text-sm text-muted-foreground mt-1">
                      Zona definida por polígono (distrital)
                    </div>
                  ) : (
                    <Input
                      type="number"
                      value={editingZone.coordinates.radius}
                      onChange={(e) => setEditingZone({
                        ...editingZone,
                        coordinates: {
                          ...editingZone.coordinates,
                          radius: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  )}
                </div>
                <div>
                  <Label>Tipo de Cobertura</Label>
                  <Select
                    value={editingZone.coverage}
                    onValueChange={(value) => setEditingZone({
                      ...editingZone,
                      coverage: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Básica">Básica</SelectItem>
                      <SelectItem value="Extendida">Extendida</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setEditingZone(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (!editingZone.name.trim()) {
                      toast.error('⚠️ Error', {
                        description: 'El nombre de la zona es requerido'
                      });
                      return;
                    }
                    setZones(zones.map(z => 
                      z.id === editingZone.id ? editingZone : z
                    ));
                    api.save('/zones', editingZone); // 💾 Save to Database
                    toast.success('✅ Zona actualizada', {
                      description: `${editingZone.name} ha sido actualizada correctamente`
                    });
                    setEditingZone(null);
                  }}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Configuración de Vehículos y Zonas */}
      <Dialog open={showVehicleZones} onOpenChange={setShowVehicleZones}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🚐 Configuración de Vehículos y Zonas Asignadas</DialogTitle>
            <DialogDescription>
              Asigne zonas de cobertura a cada vehículo para optimizar rutas automáticamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {vehicleZoneConfig.map((vc) => (
              <Card key={vc.vehicleId} className="p-6 border-2">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Car className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{vc.vehicleName}</h3>
                      <p className="text-sm text-muted-foreground">{vc.code} • {vc.placa}</p>
                      <p className="text-sm text-muted-foreground">Conductor: {vc.driver}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingVehicleZone(vc);
                    toast.info('✏️ Modo edición', {
                      description: `Editando configuración de ${vc.vehicleName}`
                    });
                  }}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Zonas Asignadas</h4>
                    <div className="space-y-2">
                      {vc.assignedZones.map((zoneId) => {
                        const zone = zones.find(z => z.id === zoneId);
                        if (!zone) return null;
                        const isPrimary = zoneId === vc.primaryZone;
                        return (
                          <div key={zoneId} className="flex items-center justify-between p-3 border rounded-lg" style={{
                            backgroundColor: `${zone.color}10`,
                            borderColor: isPrimary ? zone.color : undefined,
                            borderWidth: isPrimary ? 2 : 1
                          }}>
                            <div className="flex items-center gap-2">
                              <Circle className="h-3 w-3" style={{ fill: zone.color, color: zone.color }} />
                              <span className="font-medium">{zone.name}</span>
                              {isPrimary && (
                                <Badge className="text-xs">Principal</Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{zone.districts.length} distritos</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3">Configuración</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Distancia Máxima</p>
                          <p className="font-bold">{vc.maxDistance} km</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Horario</p>
                          <p className="font-bold">{vc.startTime} - {vc.endTime}</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Días Laborables</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {vc.workDays.map((day) => (
                              <Badge key={day} variant="secondary" className="text-xs">
                                {day}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Configuración de Vehículo */}
      <Dialog open={!!editingVehicleZone} onOpenChange={(open) => !open && setEditingVehicleZone(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>✏️ Editar Configuración de Vehículo</DialogTitle>
            <DialogDescription>
              Modifique las zonas asignadas y configuración del vehículo {editingVehicleZone?.vehicleName}
            </DialogDescription>
          </DialogHeader>
          {editingVehicleZone && (
            <div className="space-y-6 mt-4">
              <div>
                <Label>Zonas Asignadas</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {zones.map((zone) => {
                    const isAssigned = editingVehicleZone.assignedZones.includes(zone.id);
                    const isPrimary = zone.id === editingVehicleZone.primaryZone;
                    return (
                      <div
                        key={zone.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          isAssigned 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={isPrimary ? { borderColor: zone.color } : undefined}
                        onClick={() => {
                          const newAssignedZones = isAssigned
                            ? editingVehicleZone.assignedZones.filter(id => id !== zone.id)
                            : [...editingVehicleZone.assignedZones, zone.id];
                          
                          setEditingVehicleZone({
                            ...editingVehicleZone,
                            assignedZones: newAssignedZones,
                            primaryZone: newAssignedZones.includes(editingVehicleZone.primaryZone) 
                              ? editingVehicleZone.primaryZone 
                              : newAssignedZones[0] || ''
                          });
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            readOnly
                            className="rounded"
                          />
                          <Circle className="h-3 w-3" style={{ fill: zone.color, color: zone.color }} />
                          <span className="text-sm font-medium">{zone.name}</span>
                        </div>
                        {isPrimary && (
                          <Badge className="text-xs mt-1">Principal</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Distancia Máxima (km)</Label>
                  <Input
                    type="number"
                    value={editingVehicleZone.maxDistance}
                    onChange={(e) => setEditingVehicleZone({
                      ...editingVehicleZone,
                      maxDistance: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label>Zona Principal</Label>
                  <Select
                    value={editingVehicleZone.primaryZone}
                    onValueChange={(value) => setEditingVehicleZone({
                      ...editingVehicleZone,
                      primaryZone: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {editingVehicleZone.assignedZones.map(zoneId => {
                        const zone = zones.find(z => z.id === zoneId);
                        return zone ? (
                          <SelectItem key={zone.id} value={zone.id}>
                            {zone.name}
                          </SelectItem>
                        ) : null;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hora Inicio</Label>
                  <Input
                    type="time"
                    value={editingVehicleZone.startTime}
                    onChange={(e) => setEditingVehicleZone({
                      ...editingVehicleZone,
                      startTime: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>Hora Fin</Label>
                  <Input
                    type="time"
                    value={editingVehicleZone.endTime}
                    onChange={(e) => setEditingVehicleZone({
                      ...editingVehicleZone,
                      endTime: e.target.value
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Días Laborables</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => {
                    const isSelected = editingVehicleZone.workDays.includes(day);
                    return (
                      <div
                        key={day}
                        className={`p-2 border-2 rounded text-center cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary text-white' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          const newWorkDays = isSelected
                            ? editingVehicleZone.workDays.filter(d => d !== day)
                            : [...editingVehicleZone.workDays, day];
                          setEditingVehicleZone({
                            ...editingVehicleZone,
                            workDays: newWorkDays
                          });
                        }}
                      >
                        <span className="text-sm font-medium">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setEditingVehicleZone(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setVehicleZoneConfig(vehicleZoneConfig.map(vc => 
                      vc.vehicleId === editingVehicleZone.vehicleId 
                        ? editingVehicleZone 
                        : vc
                    ));
                    api.save('/vehicle-configs', editingVehicleZone); // 💾 Save to Database
                    toast.success('✅ Configuración actualizada', {
                      description: `Vehículo ${editingVehicleZone.vehicleName} actualizado correctamente`
                    });
                    setEditingVehicleZone(null);
                  }}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}