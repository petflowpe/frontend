/**
 * BOOKING ADAPTER
 * Conecta los componentes del portal de reservas con el sistema SmartPet existente
 */

import { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import type { Client, Pet, Appointment, Service } from '../contexts/AppContext';
import { 
  validateServiceForPet, 
  calculateServicePrice, 
  getValidServicesForPet,
  getServicesWithPrices 
} from '../utils/serviceValidation';
import { toast } from 'sonner';

export interface BookingData {
  service: {
    id: string;
    name: string;
    icon: string;
    duration: number;
    prices: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
    };
    description: string;
  };
  pet: {
    id?: string;
    name: string;
    breed: string;
    size: 'small' | 'medium' | 'large' | 'xlarge';
    age?: string;
    weight?: string;
    notes?: string;
  };
  dateTime: {
    date: string;
    time: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
    district: string;
    reference?: string;
  };
}

export interface PaymentData {
  method: 'card' | 'yape' | 'plin' | 'cash';
  amount: number;
  timestamp: string;
  transactionId: string;
  cardData?: {
    last4?: string;
    brand?: string;
  };
}

/**
 * Hook para integrar el portal de reservas con el sistema SmartPet
 */
export function useBookingAdapter() {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useBookingAdapter debe usarse dentro de AppProvider');
  }

  const {
    services,
    clients,
    addClient,
    addAppointment,
    addPetToClient,
    vehicles,
    addLoyaltyPoints,
    businessSettings,
  } = context;

  /**
   * Convertir servicios del sistema a formato del portal
   */
  const getServicesForPortal = () => {
    return services.filter(s => s.active).map(service => ({
      id: service.id,
      name: service.name,
      icon: getServiceIcon(service.category),
      description: service.description,
      duration: service.duration,
      prices: service.pricing,
    }));
  };

  /**
   * Crear o encontrar cliente desde datos del portal
   */
  const findOrCreateClient = async (contactData: BookingData['contact']): Promise<string> => {
    // Buscar cliente existente por email o teléfono
    const existingClient = clients.find(
      c => c.email === contactData.email || c.phone === contactData.phone
    );

    if (existingClient) {
      return existingClient.id;
    }

    // Crear nuevo cliente
    const [firstName, ...lastNameParts] = contactData.name.split(' ');
    const lastName = lastNameParts.join(' ');

    const newClientData: Omit<Client, 'id'> = {
      firstName,
      lastName,
      email: contactData.email,
      phone: contactData.phone,
      address: contactData.address,
      city: contactData.district,
      zone: contactData.district,
      pets: [],
      loyaltyPoints: 0,
      loyaltyTier: 'bronze',
      totalSpent: 0,
      appointmentCount: 0,
      joinDate: new Date().toISOString(),
      communicationPreferences: {
        email: true,
        sms: true,
        whatsapp: true,
        marketing: true,
      },
      noShowCount: 0,
      cancellationCount: 0,
      referralCode: generateReferralCode(firstName, lastName),
    };

    // Usar addClient del context
    addClient(newClientData);

    // Retornar el ID del nuevo cliente (simulado)
    return `CLI-${Date.now()}`;
  };

  /**
   * Crear o encontrar mascota desde datos del portal
   */
  const findOrCreatePet = async (
    clientId: string,
    petData: BookingData['pet']
  ): Promise<string> => {
    const client = clients.find(c => c.id === clientId);
    
    if (!client) {
      throw new Error('Cliente no encontrado');
    }

    // Si petData tiene ID, buscar mascota existente
    if (petData.id) {
      const existingPet = client.pets.find(p => p.id === petData.id);
      if (existingPet) {
        return existingPet.id;
      }
    }

    // Crear nueva mascota
    const newPetData: Omit<Pet, 'id'> = {
      name: petData.name,
      species: 'dog', // Por defecto, podría inferirse del breed
      breed: petData.breed,
      size: petData.size,
      birthDate: petData.age ? calculateBirthDate(petData.age) : new Date().toISOString(),
      weight: petData.weight ? parseFloat(petData.weight) : undefined,
      specialNotes: petData.notes,
      // Campos médicos obligatorios (valores por defecto para nuevos registros)
      lastDewormingDate: new Date().toISOString(),
      lastFleaTreatmentDate: new Date().toISOString(),
      lastVaccinationDate: new Date().toISOString(),
    };

    addPetToClient(clientId, newPetData);

    // Retornar el ID de la nueva mascota (simulado)
    return `PET-${Date.now()}`;
  };

  /**
   * Crear cita desde datos del portal
   */
  const createAppointmentFromBooking = async (
    bookingData: BookingData,
    paymentData?: PaymentData
  ): Promise<string> => {
    // 1. Crear o encontrar cliente
    const clientId = await findOrCreateClient(bookingData.contact);

    // 2. Crear o encontrar mascota
    const petId = await findOrCreatePet(clientId, bookingData.pet);

    // 3. Encontrar vehículo disponible para la zona
    const assignedVehicle = findAvailableVehicleForZone(
      bookingData.contact.district,
      bookingData.dateTime.date
    );

    if (!assignedVehicle) {
      throw new Error('No hay vehículos disponibles para esta zona');
    }

    // 4. Calcular precio
    const service = services.find(s => s.id === bookingData.service.id);
    if (!service) {
      throw new Error('Servicio no encontrado');
    }

    const price = service.pricing[bookingData.pet.size];
    const total = price;

    // 5. Crear la cita
    const appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
      clientId,
      petId,
      serviceIds: [bookingData.service.id],
      date: bookingData.dateTime.date,
      startTime: bookingData.dateTime.time,
      endTime: calculateEndTime(bookingData.dateTime.time, bookingData.service.duration),
      estimatedDuration: bookingData.service.duration,
      status: 'scheduled',
      groomerId: assignedVehicle.assignedDriver || 'TBD',
      vehicleId: assignedVehicle.id,
      confirmationStatus: 'pending',
      remindersSent: [],
      isRecurring: false,
      location: {
        address: bookingData.contact.address,
        zone: bookingData.contact.district,
        coordinates: undefined, // Se geocodificará después
      },
      subtotal: price,
      total,
      paymentStatus: paymentData ? 'partial' : 'pending',
      paymentMethod: paymentData?.method,
      notes: bookingData.contact.reference,
    };

    addAppointment(appointmentData);

    // 6. Agregar puntos de lealtad si el cliente existe
    if (businessSettings.loyaltyProgram.enabled) {
      const pointsToAdd = Math.floor(total * businessSettings.loyaltyProgram.pointsPerCurrency);
      addLoyaltyPoints(clientId, pointsToAdd, 'Reserva online');
    }

    // Retornar ID de la cita
    return `APT-${Date.now()}`;
  };

  /**
   * Obtener citas del cliente para el perfil
   */
  const getClientBookingHistory = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;

    return {
      client: {
        name: `${client.firstName} ${client.lastName}`,
        email: client.email,
        phone: client.phone,
        address: client.address,
        memberSince: client.joinDate,
        totalBookings: client.appointmentCount,
        totalSpent: client.totalSpent,
        loyaltyPoints: client.loyaltyPoints,
        tier: client.loyaltyTier,
      },
      pets: client.pets.map(pet => ({
        id: pet.id,
        name: pet.name,
        breed: pet.breed,
        age: calculateAge(pet.birthDate),
        size: pet.size,
        photo: '🐕', // Placeholder
        lastService: findLastServiceForPet(clientId, pet.id),
        nextVaccine: pet.lastVaccinationDate,
      })),
    };
  };

  /**
   * Helpers
   */
  const findAvailableVehicleForZone = (zone: string, date: string) => {
    return vehicles.find(
      v => v.active && 
      v.status === 'active' && 
      v.assignedZones.includes(zone)
    );
  };

  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = minutes + durationMinutes;
    const endHours = hours + Math.floor(endMinutes / 60);
    const finalMinutes = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  const calculateBirthDate = (age: string): string => {
    const years = parseInt(age);
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - years);
    return birthDate.toISOString();
  };

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const now = new Date();
    return now.getFullYear() - birth.getFullYear();
  };

  const findLastServiceForPet = (clientId: string, petId: string): string => {
    // Aquí buscarías en appointments
    return new Date().toISOString().split('T')[0];
  };

  const generateReferralCode = (firstName: string, lastName: string): string => {
    const code = `${firstName.slice(0, 3)}${lastName.slice(0, 3)}`.toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${code}${random}`;
  };

  const getServiceIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'Baño': '🛁',
      'Corte': '✂️',
      'Spa': '✨',
      'Medicado': '💊',
      'Dental': '🦷',
      'Uñas': '💅',
    };
    return icons[category] || '🐕';
  };

  return {
    getServicesForPortal,
    createAppointmentFromBooking,
    getClientBookingHistory,
    findOrCreateClient,
    findOrCreatePet,
  };
}