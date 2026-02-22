// Tipos de documento
export type DocumentType = 'DNI' | 'CE' | 'Pasaporte' | 'RUC';

// Categoría de cliente (basada en cantidad de mascotas)
export type ClientCategory = 'Oro' | 'Bronce' | 'Plata';

// Usuario/Cliente
export interface User {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  profilePhoto?: string;
  password: string;
  role?: string;
  categoria?: ClientCategory; // Se calcula automáticamente
  cantidad_mascotas?: number; // Se actualiza automáticamente
  companyId?: number; // Empresa asignada (backend)
  branchId?: number; // Sucursal asignada (backend)
  createdAt: string;
  updatedAt?: string;
}

// Mascota
export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: 'Perro' | 'Gato' | 'Otro';
  breed: string;
  age: number;
  weight: number;
  gender: 'Macho' | 'Hembra';
  color: string;
  microchip?: string;
  vaccines: VaccineRecord[];
  medicalHistory: MedicalRecord[];
  allergies: string[];
  medications: string[];
  photo?: string;
  // ✨ NUEVO CAMPO para excluir mascotas fallecidas del conteo
  fallecido?: boolean;
  createdAt: string;
}

// Registro de vacuna
export interface VaccineRecord {
  id: string;
  name: string;
  date: string;
  nextDueDate?: string;
  veterinarian: string;
  lot?: string;
}

// Historial médico
export interface MedicalRecord {
  id: string;
  date: string;
  type: 'Consulta' | 'Vacunación' | 'Cirugía' | 'Emergencia' | 'Chequeo' | 'Laboratorio';
  description: string;
  veterinarian: string;
  diagnosis?: string;
  treatment?: string;
  attachments?: string[];
}

// Tipos de servicio
export type ServiceType = 
  | 'movilvet-vacunacion'
  | 'movilvet-consulta'
  | 'movilvet-laboratorio'
  | 'movilvet-chequeo'
  | 'movilvet-desparasitacion'
  | 'movilvet-geriatrico'
  | 'peluqueria-bano-basico'
  | 'peluqueria-corte-raza'
  | 'peluqueria-spa-completo'
  | 'peluqueria-deslanado';

// Cita/Reserva
export interface Appointment {
  id: string;
  userId: string;
  petId: string;
  petName: string;
  serviceType: ServiceType;
  serviceName: string;
  serviceCategory: 'MovilVet' | 'Peluquería';
  date: string;
  time: string;
  duration: number; // minutos
  price: number;
  status: 'Pendiente' | 'Confirmada' | 'En Proceso' | 'Completada' | 'Cancelada';
  address: string;
  district: string;
  notes?: string;
  paymentStatus: 'Pendiente' | 'Pagado' | 'Reembolsado';
  paymentMethod?: 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin';
  veterinarian?: string;
  // ✨ NUEVO CAMPO para referencia a categoría del cliente
  clientCategory?: ClientCategory;
  createdAt: string;
  updatedAt: string;
}

// Ticket/Comprobante
export interface Ticket {
  id: string;
  appointmentId: string;
  userId: string;
  ticketNumber: string;
  date: string;
  items: TicketItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: 'Emitido' | 'Anulado';
}

export interface TicketItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Plan de suscripción/membresía
export interface Membership {
  id: string;
  userId: string;
  plan: 'Bronce' | 'Plata' | 'Oro';
  startDate: string;
  endDate: string;
  status: 'Activa' | 'Vencida' | 'Cancelada';
  benefits: string[];
  discount: number; // porcentaje
}

// Notificación
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// ✨ NUEVO: Información de categoría de cliente
export interface CategoryInfo {
  categoria: ClientCategory;
  cantidad_mascotas: number;
  icono: string;
  color: string;
  beneficios: string[];
  descuento: number;
}

// ✨ NUEVO: Estadísticas de segmentación
export interface SegmentationStats {
  total_clientes: number;
  oro: {
    cantidad: number;
    porcentaje: number;
    ingreso_estimado: number;
  };
  bronce: {
    cantidad: number;
    porcentaje: number;
    ingreso_estimado: number;
  };
  plata: {
    cantidad: number;
    porcentaje: number;
    ingreso_estimado: number;
  };
}
