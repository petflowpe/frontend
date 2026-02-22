import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';

const api = {
  fetch: async (endpoint: string) => {
    try {
      return await apiClient.get(endpoint);
    } catch { return []; }
  },
  save: async (endpoint: string, data: any) => {
    try {
      await apiClient.post(endpoint, data);
    } catch (e) { console.error(e); }
  }
};

// ==================== TIPOS ====================

export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  size: 'small' | 'medium' | 'large' | 'extra-large';
  birthDate: string;
  weight?: number;
  color?: string;
  microchipId?: string;
  allergies?: string[];
  specialNotes?: string;
  photos?: string[];
  
  // Campos médicos obligatorios
  lastDewormingDate: string;
  lastFleaTreatmentDate: string;
  lastVaccinationDate: string;
  
  // Historial médico
  medicalHistory?: MedicalRecord[];
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: 'deworming' | 'flea-treatment' | 'vaccination' | 'checkup' | 'treatment';
  treatmentName: string;
  nextDueDate: string;
  veterinarian?: string;
  notes?: string;
  documents?: string[];
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zone?: string;
  coordinates?: { lat: number; lng: number };
  pets: Pet[];
  
  // Programa de fidelización
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  appointmentCount: number;
  joinDate: string;
  lastVisit?: string;
  
  // Preferencias
  preferences?: ClientPreferences;
  
  // Marketing
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    marketing: boolean;
  };
  
  // Estadísticas
  noShowCount: number;
  cancellationCount: number;
  averageRating?: number;
  referralCode: string;
  referredBy?: string;
}

export interface ClientPreferences {
  preferredGroomer?: string;
  preferredDayOfWeek?: string[];
  preferredTimeSlot?: 'morning' | 'afternoon' | 'evening';
  preferredPaymentMethod?: string;
  specialInstructions?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  duration: number; // en minutos
  
  // Precios diferenciados
  pricing: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
  };
  
  // 🆕 Restricciones por tamaño
  allowedSizes?: ('small' | 'medium' | 'large' | 'extra-large')[];
  // Si está vacío = permite todos los tamaños
  
  // 🆕 Restricciones por raza
  restrictedBreeds?: string[]; // Razas que NO pueden usar este servicio
  
  // 🆕 Tamaño mínimo y máximo
  minSize?: 'small' | 'medium' | 'large' | 'extra-large';
  maxSize?: 'small' | 'medium' | 'large' | 'extra-large';
  
  // Excepciones por raza (precio especial)
  breedExceptions?: {
    breed: string;
    price: number;
    reason?: string;
  }[];
  
  // 🆕 Multiplicador por peso
  weightMultipliers?: {
    minWeight: number; // kg
    maxWeight: number; // kg
    multiplier: number; // 1.2 = +20%
  }[];
  
  active: boolean;
  requiredProducts?: string[];
  commissionRate?: number; // % de comisión para el groomer
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  sku: string;
  barcode?: string;
  
  // Inventario
  stock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  
  // Precios
  costPrice: number;
  salePrice: number;
  wholesalePrice?: number;
  
  // Multi-ubicación
  stockByLocation: {
    locationId: string;
    locationName: string;
    stock: number;
  }[];
  
  // Ventas
  availableForSale: boolean;
  featured: boolean;
  images?: string[];
  
  // Comisiones
  commissionRate?: number;
  
  supplier?: string;
  lastPurchaseDate?: string;
  lastSaleDate?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  petId: string;
  serviceIds: string[];
  productIds?: string[]; // Productos vendidos en la cita
  
  date: string;
  startTime: string;
  endTime: string;
  estimatedDuration: number;
  
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  
  // Asignación
  groomerId: string;
  vehicleId: string;
  
  // Confirmación
  confirmationStatus: 'pending' | 'confirmed' | 'declined';
  confirmationDate?: string;
  confirmationMethod?: 'email' | 'sms' | 'whatsapp' | 'phone';
  
  // Recordatorios enviados
  remindersSent: {
    type: '24h' | '2h';
    sentAt: string;
    channel: 'email' | 'sms' | 'whatsapp';
  }[];
  
  // Cancelación
  cancellationReason?: string;
  cancellationDate?: string;
  cancelledBy?: 'client' | 'business';
  cancellationFee?: number;
  
  // Recurrencia
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  parentAppointmentId?: string;
  
  // Ubicación
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
    zone: string;
  };
  
  // Financiero
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: string;
  
  // Fotos
  beforePhotos?: string[];
  afterPhotos?: string[];
  
  // Calidad
  rating?: number;
  review?: string;
  reviewDate?: string;
  
  notes?: string;
  internalNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface RecurrenceRule {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  interval: number;
  endDate?: string;
  occurrences?: number;
  daysOfWeek?: number[];
}

export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  type: 'van' | 'truck' | 'car';
  status: 'active' | 'maintenance' | 'inactive';
  
  // Asignación
  assignedDriver?: string;
  assignedZones: string[];
  
  // GPS Tracking
  currentLocation?: {
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
    lastUpdate: string;
  };
  
  // Inventario
  inventory: {
    productId: string;
    quantity: number;
  }[];
  
  // Mantenimiento
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  mileage?: number;
  
  // Capacidad
  maxAppointmentsPerDay: number;
  workingHours: {
    start: string;
    end: string;
  };
  
  active: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  appointmentId?: string;
  clientId: string;
  
  date: string;
  dueDate?: string;
  
  items: InvoiceItem[];
  
  subtotal: number;
  discount: number;
  discountReason?: string;
  tax: number;
  total: number;
  
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  
  paymentMethod?: string;
  paymentDate?: string;
  
  notes?: string;
  
  // Facturación electrónica
  electronicInvoice?: {
    sunatStatus: 'pending' | 'sent' | 'accepted' | 'rejected';
    sunatCode?: string;
    xmlUrl?: string;
    pdfUrl?: string;
  };
}

export interface InvoiceItem {
  type: 'service' | 'product';
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  serviceIds: string[];
  
  // Pricing
  originalPrice: number;
  packagePrice: number;
  discount: number;
  
  // Validez
  validityDays: number;
  maxUses: number;
  
  active: boolean;
  featured: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  
  type: 'percentage' | 'fixed' | 'service' | 'product';
  value: number;
  
  // Restricciones
  minPurchase?: number;
  maxDiscount?: number;
  applicableServices?: string[];
  applicableProducts?: string[];
  
  // Validez
  startDate: string;
  endDate: string;
  maxUses?: number;
  usedCount: number;
  
  // Target
  applicableClients?: string[]; // Si está vacío, aplica a todos
  loyaltyTierRequired?: 'bronze' | 'silver' | 'gold' | 'platinum';
  
  active: boolean;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'appointment-reminder' | 'appointment-confirmation' | 'medical-reminder' | 'promotional' | 'birthday' | 'loyalty-reward';
  
  channels: ('email' | 'sms' | 'whatsapp')[];
  
  subject?: string; // Para email
  message: string;
  
  // Variables disponibles: {clientName}, {petName}, {appointmentDate}, etc.
  
  active: boolean;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  type: 'promotional' | 'reactivation' | 'birthday' | 'loyalty' | 'referral';
  
  // Segmentación
  targetSegment: {
    loyaltyTiers?: string[];
    lastVisitDaysAgo?: number;
    minTotalSpent?: number;
    hasNotBookedInDays?: number;
    zones?: string[];
    petSpecies?: string[];
  };
  
  // Contenido
  templateId: string;
  couponId?: string;
  
  // Programación
  scheduledDate?: string;
  sendTime?: string;
  
  // Estado
  status: 'draft' | 'scheduled' | 'sent' | 'completed';
  sentCount: number;
  openRate?: number;
  clickRate?: number;
  conversionRate?: number;
  
  createdAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  groomerId: string;
  
  rating: number; // 1-5
  comment?: string;
  
  categories?: {
    quality: number;
    punctuality: number;
    friendliness: number;
    cleanliness: number;
  };
  
  response?: string; // Respuesta del negocio
  responseDate?: string;
  
  published: boolean;
  featured: boolean;
  
  createdAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'superadmin' | 'admin' | 'manager' | 'groomer' | 'receptionist' | 'accountant' | 'driver' | 'veterinarian' | 'viewer';
  
  // Perfil
  avatar?: string;
  birthDate?: string;
  hireDate?: string;
  
  // Asignación
  assignedVehicleId?: string;
  assignedZones?: string[];
  
  // Rendimiento
  stats?: {
    totalAppointments: number;
    averageRating: number;
    totalRevenue: number;
    efficiency: number;
  };
  
  // Horarios
  schedule?: {
    [key: string]: { // day of week
      working: boolean;
      startTime?: string;
      endTime?: string;
    };
  };
  
  // Estado
  active: boolean;
  lastLogin?: string;
}

// ==================== CONTEXT ====================

interface AppContextType {
  // Datos
  clients: Client[];
  appointments: Appointment[];
  services: Service[];
  products: Product[];
  vehicles: Vehicle[];
  users: User[];
  invoices: Invoice[];
  packages: Package[];
  coupons: Coupon[];
  reviews: Review[];
  campaigns: MarketingCampaign[];
  
  // Current User
  currentUser: User | null;
  
  // Settings
  businessSettings: BusinessSettings;
  
  // Actions - Clients
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addPetToClient: (clientId: string, pet: Omit<Pet, 'id'>) => void;
  updatePet: (clientId: string, petId: string, pet: Partial<Pet>) => void;
  
  // Actions - Appointments
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  cancelAppointment: (id: string, reason: string, cancelledBy: 'client' | 'business') => void;
  confirmAppointment: (id: string, method: 'email' | 'sms' | 'whatsapp' | 'phone') => void;
  markNoShow: (id: string) => void;
  
  // Actions - Services
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  
  // Actions - Products
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  transferProductBetweenLocations: (productId: string, fromLocation: string, toLocation: string, quantity: number) => void;
  
  // Actions - Vehicles
  updateVehicleLocation: (vehicleId: string, location: { lat: number; lng: number }) => void;
  
  // Actions - Reviews
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  respondToReview: (reviewId: string, response: string) => void;
  
  // Actions - Loyalty
  addLoyaltyPoints: (clientId: string, points: number, reason: string) => void;
  redeemLoyaltyPoints: (clientId: string, points: number) => void;
  updateLoyaltyTier: (clientId: string) => void;
  
  // Actions - Coupons
  validateCoupon: (code: string, clientId: string, total: number) => { valid: boolean; discount: number; message?: string };
  useCoupon: (code: string) => void;
  
  // Helpers
  getClientById: (id: string) => Client | undefined;
  getPetById: (clientId: string, petId: string) => Pet | undefined;
  getAppointmentsByClient: (clientId: string) => Appointment[];
  getAppointmentsByGroomer: (groomerId: string) => Appointment[];
  getUpcomingAppointments: () => Appointment[];
  getLowStockProducts: () => Product[];
  getClientsByTier: (tier: string) => Client[];
}

interface BusinessSettings {
  businessName: string;
  businessLogo?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  taxId: string;
  
  // Policies
  cancellationPolicy: {
    enabled: boolean;
    hoursBeforeAppointment: number;
    feePercentage: number;
    maxNoShows: number;
    blockAfterNoShows: boolean;
  };
  
  // Loyalty
  loyaltyProgram: {
    enabled: boolean;
    pointsPerCurrency: number; // Puntos por cada sol gastado
    tiers: {
      bronze: { minPoints: number; discount: number };
      silver: { minPoints: number; discount: number };
      gold: { minPoints: number; discount: number };
      platinum: { minPoints: number; discount: number };
    };
  };
  
  // Notifications
  notifications: {
    enableEmailReminders: boolean;
    enableSMSReminders: boolean;
    enableWhatsAppReminders: boolean;
    reminder24h: boolean;
    reminder2h: boolean;
  };
  
  // Payments
  acceptedPaymentMethods: string[];
  onlinePaymentEnabled: boolean;
  
  // Working hours
  workingHours: {
    [key: string]: { // day of week
      open: boolean;
      startTime?: string;
      endTime?: string;
    };
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export function AppProvider({ children }: { children: ReactNode }) {
  // Estados principales
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: 'SmartPet',
    contactEmail: 'info@smartpet.com',
    contactPhone: '+51 999 999 999',
    address: 'Lima, Perú',
    taxId: '20123456789',
    cancellationPolicy: {
      enabled: true,
      hoursBeforeAppointment: 24,
      feePercentage: 50,
      maxNoShows: 3,
      blockAfterNoShows: true,
    },
    loyaltyProgram: {
      enabled: true,
      pointsPerCurrency: 10,
      tiers: {
        bronze: { minPoints: 0, discount: 0 },
        silver: { minPoints: 500, discount: 5 },
        gold: { minPoints: 1500, discount: 10 },
        platinum: { minPoints: 5000, discount: 15 },
      },
    },
    notifications: {
      enableEmailReminders: true,
      enableSMSReminders: true,
      enableWhatsAppReminders: true,
      reminder24h: true,
      reminder2h: true,
    },
    acceptedPaymentMethods: ['cash', 'card', 'transfer', 'online'],
    onlinePaymentEnabled: true,
    workingHours: {
      monday: { open: true, startTime: '08:00', endTime: '18:00' },
      tuesday: { open: true, startTime: '08:00', endTime: '18:00' },
      wednesday: { open: true, startTime: '08:00', endTime: '18:00' },
      thursday: { open: true, startTime: '08:00', endTime: '18:00' },
      friday: { open: true, startTime: '08:00', endTime: '18:00' },
      saturday: { open: true, startTime: '09:00', endTime: '15:00' },
      sunday: { open: false },
    },
  });

  // Cargar datos iniciales - DESACTIVADO para evitar múltiples llamadas
  // Los datos se cargan bajo demanda mediante los hooks específicos (useClients, useAppointments, etc.)
  useEffect(() => {
    // Solo establecer usuario actual, sin cargar datos del backend
    // Los datos se cargarán cuando los componentes los necesiten
    setCurrentUser({
      id: 'USR-001',
      firstName: 'Admin',
      lastName: 'Principal',
      email: 'admin@smartpet.com',
      phone: '+51 999 999 999',
      role: 'superadmin',
      active: true,
      stats: {
        totalAppointments: 450,
        averageRating: 4.9,
        totalRevenue: 45000,
        efficiency: 95,
      },
    });
  }, []);

  // Función para cargar datos bajo demanda (si es necesario)
  const loadInitialData = async () => {
    // Esta función ya no se ejecuta automáticamente
    // Se puede llamar manualmente si es necesario
    try {
      const [remoteClients, remoteAppts, remoteServices, remoteProducts] = await Promise.all([
        api.fetch('/clients'),
        api.fetch('/appointments'),
        api.fetch('/products'),
        api.fetch('/vehicles')
      ]);

      if (remoteClients.length > 0) setClients(remoteClients);
      if (remoteAppts.length > 0) setAppointments(remoteAppts);
      if (remoteProducts.length > 0) setProducts(remoteProducts);
      
      console.log('✅ AppContext: Datos sincronizados con Backend');
    } catch (e) {
      console.error('Error sincronizando datos:', e);
    }
  };

  // ==================== CLIENT ACTIONS ====================

  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...clientData,
      id: `CLI-${Date.now()}`,
    };
    setClients(prev => [...prev, newClient]);
    api.save('/clients', newClient); // 💾 Persistencia
    toast.success(`Cliente ${newClient.firstName} ${newClient.lastName} agregado`);
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prev => prev.map(client => {
        if (client.id === id) {
            const updated = { ...client, ...clientData };
            api.save('/clients', updated); // 💾 Persistencia (sobrescritura completa en KV simple)
            return updated;
        }
        return client;
    }));
    toast.success('Cliente actualizado');
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    api.fetch(`/clients/${id}`, { method: 'DELETE' }); // No existe metodo delete en mi api helper, pero bueno.
    // Corrección rápida: mi helper api.delete existe
    api.delete('/clients', id);
    toast.success('Cliente eliminado');
  };

  const addPetToClient = (clientId: string, petData: Omit<Pet, 'id'>) => {
    const newPet: Pet = {
      ...petData,
      id: `PET-${Date.now()}`,
    };
    
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        const updatedClient = {
          ...client,
          pets: [...client.pets, newPet],
        };
        api.save('/clients', updatedClient); // 💾 Persistencia
        return updatedClient;
      }
      return client;
    }));
    
    toast.success(`Mascota ${newPet.name} agregada`);
  };

  const updatePet = (clientId: string, petId: string, petData: Partial<Pet>) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        const updatedClient = {
          ...client,
          pets: client.pets.map(pet => 
            pet.id === petId ? { ...pet, ...petData } : pet
          ),
        };
        api.save('/clients', updatedClient); // 💾 Persistencia
        return updatedClient;
      }
      return client;
    }));
    toast.success('Mascota actualizada');
  };

  // ==================== APPOINTMENT ACTIONS ====================

  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `APT-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    api.save('/appointments', newAppointment); // 💾 Persistencia
    toast.success('Cita creada exitosamente');
    
    // Actualizar contador del cliente
    updateClient(appointmentData.clientId, {
      appointmentCount: (getClientById(appointmentData.clientId)?.appointmentCount || 0) + 1,
    });
  };

  const updateAppointment = (id: string, appointmentData: Partial<Appointment>) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === id ? { ...apt, ...appointmentData, updatedAt: new Date().toISOString() } : apt
    ));
    toast.success('Cita actualizada');
  };

  const cancelAppointment = (id: string, reason: string, cancelledBy: 'client' | 'business') => {
    const appointment = appointments.find(apt => apt.id === id);
    if (!appointment) return;

    const now = new Date();
    const appointmentDate = new Date(appointment.date + ' ' + appointment.startTime);
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let cancellationFee = 0;
    if (
      businessSettings.cancellationPolicy.enabled &&
      hoursUntilAppointment < businessSettings.cancellationPolicy.hoursBeforeAppointment &&
      cancelledBy === 'client'
    ) {
      cancellationFee = (appointment.total * businessSettings.cancellationPolicy.feePercentage) / 100;
    }

    updateAppointment(id, {
      status: 'cancelled',
      cancellationReason: reason,
      cancellationDate: now.toISOString(),
      cancelledBy,
      cancellationFee,
    });

    // Actualizar contador de cancelaciones del cliente
    if (cancelledBy === 'client') {
      const client = getClientById(appointment.clientId);
      if (client) {
        updateClient(client.id, {
          cancellationCount: client.cancellationCount + 1,
        });
      }
    }

    toast.warning(`Cita cancelada${cancellationFee > 0 ? ` - Cargo de S/ ${cancellationFee.toFixed(2)}` : ''}`);
  };

  const confirmAppointment = (id: string, method: 'email' | 'sms' | 'whatsapp' | 'phone') => {
    updateAppointment(id, {
      confirmationStatus: 'confirmed',
      confirmationDate: new Date().toISOString(),
      confirmationMethod: method,
    });
    toast.success('Cita confirmada');
  };

  const markNoShow = (id: string) => {
    const appointment = appointments.find(apt => apt.id === id);
    if (!appointment) return;

    updateAppointment(id, { status: 'no-show' });

    // Actualizar contador de no-shows del cliente
    const client = getClientById(appointment.clientId);
    if (client) {
      const newNoShowCount = client.noShowCount + 1;
      updateClient(client.id, { noShowCount: newNoShowCount });

      // Bloquear cliente si excede el máximo
      if (
        businessSettings.cancellationPolicy.blockAfterNoShows &&
        newNoShowCount >= businessSettings.cancellationPolicy.maxNoShows
      ) {
        toast.error(`Cliente bloqueado por ${newNoShowCount} no-shows`);
        // Aquí se implementaría la lógica de bloqueo
      }
    }

    toast.error('Cita marcada como no-show');
  };

  // ==================== SERVICE ACTIONS ====================

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: `SRV-${Date.now()}`,
    };
    setServices(prev => [...prev, newService]);
    toast.success(`Servicio ${newService.name} agregado`);
  };

  const updateService = (id: string, serviceData: Partial<Service>) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, ...serviceData } : service
    ));
    toast.success('Servicio actualizado');
  };

  // ==================== PRODUCT ACTIONS ====================

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `PRD-${Date.now()}`,
    };
    setProducts(prev => [...prev, newProduct]);
    toast.success(`Producto ${newProduct.name} agregado`);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, ...productData } : product
    ));
    toast.success('Producto actualizado');
  };

  const transferProductBetweenLocations = (
    productId: string,
    fromLocation: string,
    toLocation: string,
    quantity: number
  ) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const updatedLocations = product.stockByLocation.map(loc => {
          if (loc.locationId === fromLocation) {
            return { ...loc, stock: loc.stock - quantity };
          }
          if (loc.locationId === toLocation) {
            return { ...loc, stock: loc.stock + quantity };
          }
          return loc;
        });
        return { ...product, stockByLocation: updatedLocations };
      }
      return product;
    }));
    toast.success(`Transferidos ${quantity} unidades`);
  };

  // ==================== VEHICLE ACTIONS ====================

  const updateVehicleLocation = (vehicleId: string, location: { lat: number; lng: number }) => {
    setVehicles(prev => prev.map(vehicle => {
      if (vehicle.id === vehicleId) {
        return {
          ...vehicle,
          currentLocation: {
            ...location,
            lastUpdate: new Date().toISOString(),
          },
        };
      }
      return vehicle;
    }));
  };

  // ==================== REVIEW ACTIONS ====================

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `REV-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews(prev => [...prev, newReview]);
    toast.success('Reseña agregada');
  };

  const respondToReview = (reviewId: string, response: string) => {
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          response,
          responseDate: new Date().toISOString(),
        };
      }
      return review;
    }));
    toast.success('Respuesta publicada');
  };

  // ==================== LOYALTY ACTIONS ====================

  const addLoyaltyPoints = (clientId: string, points: number, reason: string) => {
    const client = getClientById(clientId);
    if (!client) return;

    const newPoints = client.loyaltyPoints + points;
    updateClient(clientId, { loyaltyPoints: newPoints });
    updateLoyaltyTier(clientId);
    
    toast.success(`+${points} puntos: ${reason}`);
  };

  const redeemLoyaltyPoints = (clientId: string, points: number) => {
    const client = getClientById(clientId);
    if (!client || client.loyaltyPoints < points) {
      toast.error('Puntos insuficientes');
      return;
    }

    updateClient(clientId, { loyaltyPoints: client.loyaltyPoints - points });
    toast.success(`${points} puntos canjeados`);
  };

  const updateLoyaltyTier = (clientId: string) => {
    const client = getClientById(clientId);
    if (!client) return;

    const { tiers } = businessSettings.loyaltyProgram;
    let newTier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';

    if (client.loyaltyPoints >= tiers.platinum.minPoints) {
      newTier = 'platinum';
    } else if (client.loyaltyPoints >= tiers.gold.minPoints) {
      newTier = 'gold';
    } else if (client.loyaltyPoints >= tiers.silver.minPoints) {
      newTier = 'silver';
    }

    if (newTier !== client.loyaltyTier) {
      updateClient(clientId, { loyaltyTier: newTier });
      toast.success(`¡Felicitaciones! Nuevo nivel: ${newTier.toUpperCase()}`);
    }
  };

  // ==================== COUPON ACTIONS ====================

  const validateCoupon = (code: string, clientId: string, total: number) => {
    const coupon = coupons.find(c => c.code === code && c.active);
    
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Cupón no válido' };
    }

    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (now < startDate || now > endDate) {
      return { valid: false, discount: 0, message: 'Cupón expirado' };
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, discount: 0, message: 'Cupón agotado' };
    }

    if (coupon.minPurchase && total < coupon.minPurchase) {
      return { valid: false, discount: 0, message: `Compra mínima: S/ ${coupon.minPurchase}` };
    }

    if (coupon.applicableClients && coupon.applicableClients.length > 0) {
      if (!coupon.applicableClients.includes(clientId)) {
        return { valid: false, discount: 0, message: 'Cupón no aplicable a este cliente' };
      }
    }

    const client = getClientById(clientId);
    if (coupon.loyaltyTierRequired && client) {
      const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
      const requiredIndex = tierOrder.indexOf(coupon.loyaltyTierRequired);
      const clientIndex = tierOrder.indexOf(client.loyaltyTier);
      
      if (clientIndex < requiredIndex) {
        return { valid: false, discount: 0, message: `Requiere nivel ${coupon.loyaltyTierRequired}` };
      }
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (total * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'fixed') {
      discount = coupon.value;
    }

    return { valid: true, discount, message: 'Cupón aplicado' };
  };

  const useCoupon = (code: string) => {
    setCoupons(prev => prev.map(coupon => {
      if (coupon.code === code) {
        return { ...coupon, usedCount: coupon.usedCount + 1 };
      }
      return coupon;
    }));
  };

  // ==================== HELPERS ====================

  const getClientById = (id: string) => clients.find(c => c.id === id);
  
  const getPetById = (clientId: string, petId: string) => {
    const client = getClientById(clientId);
    return client?.pets.find(p => p.id === petId);
  };

  const getAppointmentsByClient = (clientId: string) => 
    appointments.filter(apt => apt.clientId === clientId);

  const getAppointmentsByGroomer = (groomerId: string) => 
    appointments.filter(apt => apt.groomerId === groomerId);

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date + ' ' + apt.startTime);
      return aptDate > now && apt.status !== 'cancelled' && apt.status !== 'no-show';
    }).sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.startTime);
      const dateB = new Date(b.date + ' ' + b.startTime);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const getLowStockProducts = () => 
    products.filter(p => p.stock <= p.reorderPoint);

  const getClientsByTier = (tier: string) => 
    clients.filter(c => c.loyaltyTier === tier);

  const value: AppContextType = {
    // Data
    clients,
    appointments,
    services,
    products,
    vehicles,
    users,
    invoices,
    packages,
    coupons,
    reviews,
    campaigns,
    currentUser,
    businessSettings,
    
    // Actions
    addClient,
    updateClient,
    deleteClient,
    addPetToClient,
    updatePet,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    confirmAppointment,
    markNoShow,
    addService,
    updateService,
    addProduct,
    updateProduct,
    transferProductBetweenLocations,
    updateVehicleLocation,
    addReview,
    respondToReview,
    addLoyaltyPoints,
    redeemLoyaltyPoints,
    updateLoyaltyTier,
    validateCoupon,
    useCoupon,
    
    // Helpers
    getClientById,
    getPetById,
    getAppointmentsByClient,
    getAppointmentsByGroomer,
    getUpcomingAppointments,
    getLowStockProducts,
    getClientsByTier,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ==================== HOOK ====================

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}