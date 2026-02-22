// Configuración por defecto del sistema SmartPet

export const DEFAULT_BUSINESS_CONFIG = {
  name: "SmartPet",
  slogan: "Grooming profesional a domicilio",
  address: "Lima, Perú",
  phone: "+51 981 309 187",
  email: "Luis@smartpet.com",
  website: "www.smartpet.com",
  taxId: "B12345678",
  currency: "PEN",
  timezone: "Lima/Perú",
  language: "es",
};

export const DEFAULT_WORKING_HOURS = {
  monday: { start: "08:00", end: "18:00", enabled: true },
  tuesday: { start: "08:00", end: "18:00", enabled: true },
  wednesday: { start: "08:00", end: "18:00", enabled: true },
  thursday: { start: "08:00", end: "18:00", enabled: true },
  friday: { start: "08:00", end: "18:00", enabled: true },
  saturday: { start: "09:00", end: "15:00", enabled: true },
  sunday: { start: "10:00", end: "14:00", enabled: false },
};

export const DEFAULT_SERVICES = [
  {
    id: 1,
    name: "Baño Completo",
    description:
      "Baño completo con champú premium, secado y cepillado",
    price: 35,
    duration: 60,
    category: "Baño",
    enabled: true,
  },
  {
    id: 2,
    name: "Corte de Pelo",
    description:
      "Corte profesional según la raza y preferencias",
    price: 40,
    duration: 45,
    category: "Estética",
    enabled: true,
  },
  {
    id: 3,
    name: "Baño + Corte Completo",
    description:
      "Servicio completo: baño, corte, secado y styling",
    price: 65,
    duration: 90,
    category: "Completo",
    enabled: true,
  },
  {
    id: 4,
    name: "Corte de Uñas",
    description: "Corte y limado profesional de uñas",
    price: 15,
    duration: 20,
    category: "Cuidado",
    enabled: true,
  },
  {
    id: 5,
    name: "Limpieza de Oídos",
    description: "Limpieza profunda y cuidado de los oídos",
    price: 20,
    duration: 15,
    category: "Cuidado",
    enabled: true,
  },
  {
    id: 6,
    name: "Baño Medicinal",
    description: "Baño especializado para problemas de piel",
    price: 55,
    duration: 75,
    category: "Medicinal",
    enabled: true,
  },
  {
    id: 7,
    name: "Tratamiento Antipulgas",
    description:
      "Tratamiento especializado contra pulgas y parásitos",
    price: 35,
    duration: 30,
    category: "Medicinal",
    enabled: true,
  },
];

export const DEFAULT_PAYMENT_METHODS = [
  { id: "cash", name: "Efectivo", enabled: true, fee: 0 },
  { id: "card", name: "Tarjeta", enabled: true, fee: 0.029 },
  {
    id: "transfer",
    name: "Transferencia",
    enabled: true,
    fee: 0.01,
  },
  { id: "bizum", name: "Bizum", enabled: true, fee: 0.005 },
];

export const DEFAULT_NOTIFICATION_SETTINGS = {
  email: true,
  sms: true,
  push: true,
  appointments: true,
  payments: true,
  reviews: true,
  systemAlerts: true,
  staffUpdates: false,
  marketing: false,
};

export const DEFAULT_PRICING_CONFIG = {
  taxRate: 18, // IGV Perú
  currency: "PEN",
  travelFee: 5,
  emergencyFee: 15,
  holidayMultiplier: 1.5,
  discounts: {
    newClient: 10,
    loyalClient: 15,
    multiPet: 20,
  },
  paymentTerms: 30,
};

export const DEFAULT_OPERATIONAL_CONFIG = {
  serviceRadius: 25, // km
  emergencyServices: true,
  holidayWork: false,
  autoConfirmation: true,
  reminderTime: 24, // horas antes
  maxDailyAppointments: 12,
  bufferTime: 15, // minutos entre citas
};

export const APPOINTMENT_STATUSES = {
  pending: {
    label: "Pendiente",
    color: "yellow",
    bgClass: "bg-yellow-100 text-yellow-800",
  },
  confirmed: {
    label: "Confirmada",
    color: "green",
    bgClass: "bg-green-100 text-green-800",
  },
  inProgress: {
    label: "En Progreso",
    color: "blue",
    bgClass: "bg-blue-100 text-blue-800",
  },
  completed: {
    label: "Completada",
    color: "purple",
    bgClass: "bg-purple-100 text-purple-800",
  },
  cancelled: {
    label: "Cancelada",
    color: "red",
    bgClass: "bg-red-100 text-red-800",
  },
};

export const CUSTOMER_TYPES = {
  new: { label: "Nuevo", color: "blue" },
  regular: { label: "Regular", color: "green" },
  vip: { label: "VIP", color: "purple" },
  inactive: { label: "Inactivo", color: "gray" },
};

export const EMPLOYEE_POSITIONS = [
  "Groomer Senior",
  "Groomer",
  "Groomer Junior",
  "Recepcionista",
  "Gerente",
  "Asistente",
];

export const EMPLOYEE_POSITION_OPTIONS = [
  "Gerente",
  "Atención al Público",
  "Groomers",
  "Chofer",
];

export const EMPLOYEE_STATUS_OPTIONS = [
  { id: "active", label: "Activo" },
  { id: "inactive", label: "Inactivo" },
  { id: "vacation", label: "Vacaciones" },
  { id: "sick", label: "Baja Médica" },
];

export const DOCUMENT_TYPES = [
  { id: "dni", label: "DNI" },
  { id: "ce", label: "CE" },
  { id: "pass", label: "PASS" },
];

export const GENDER_OPTIONS = [
  { id: "male", label: "Masculino" },
  { id: "female", label: "Femenino" },
];

export const WORKDAY_TYPES = [
  { id: "full", label: "Completa" },
  { id: "partial", label: "Parcial" },
];

export const COST_CENTER_OPTIONS = [
  "Operaciones",
  "Administración",
  "Ventas",
  "Logística",
];

export const MAINTENANCE_TYPES = [
  "Mantenimiento Preventivo",
  "Reparación",
  "ITV",
  "Revisión",
  "Cambio de Aceite",
  "Neumáticos",
  "Frenos",
  "Otro"
];

// Plan de Cuentas Contable
export const CHART_OF_ACCOUNTS = [
  // Ingresos (70000 - 79999)
  { code: "70101000", name: "Venta de Servicios - Grooming", type: "income", category: "Ingresos Operacionales" },
  { code: "70102000", name: "Venta de Productos", type: "income", category: "Ingresos Operacionales" },
  { code: "70103000", name: "Servicios Médicos", type: "income", category: "Ingresos Operacionales" },
  { code: "75101000", name: "Otros Ingresos", type: "income", category: "Otros Ingresos" },
  
  // Gastos de Vehículos (63000 - 63999)
  { code: "63101010", name: "Gasolina", type: "expense", category: "Gastos de Vehículos" },
  { code: "63101020", name: "Diesel", type: "expense", category: "Gastos de Vehículos" },
  { code: "63102000", name: "Mantenimiento Preventivo", type: "expense", category: "Gastos de Vehículos" },
  { code: "63103000", name: "Reparaciones", type: "expense", category: "Gastos de Vehículos" },
  { code: "63104000", name: "Seguros de Vehículos", type: "expense", category: "Gastos de Vehículos" },
  { code: "63105000", name: "ITV y Documentación", type: "expense", category: "Gastos de Vehículos" },
  { code: "63106000", name: "Equipamiento de Vehículos", type: "expense", category: "Gastos de Vehículos" },
  { code: "63107000", name: "Limpieza y Suministros", type: "expense", category: "Gastos de Vehículos" },
  { code: "63108000", name: "Peajes", type: "expense", category: "Gastos de Vehículos" },
  { code: "63109000", name: "Estacionamiento", type: "expense", category: "Gastos de Vehículos" },
  { code: "63199000", name: "Otros Gastos de Vehículos", type: "expense", category: "Gastos de Vehículos" },
  
  // Gastos de Personal (62000 - 62999)
  { code: "62101000", name: "Sueldos y Salarios", type: "expense", category: "Gastos de Personal" },
  { code: "62102000", name: "Gratificaciones", type: "expense", category: "Gastos de Personal" },
  { code: "62103000", name: "Vacaciones", type: "expense", category: "Gastos de Personal" },
  { code: "62104000", name: "CTS", type: "expense", category: "Gastos de Personal" },
  { code: "62105000", name: "EsSalud", type: "expense", category: "Gastos de Personal" },
  { code: "62106000", name: "Capacitación", type: "expense", category: "Gastos de Personal" },
  
  // Gastos Administrativos (63900 - 63999)
  { code: "63901000", name: "Alquiler de Oficina", type: "expense", category: "Gastos Administrativos" },
  { code: "63902000", name: "Servicios Públicos", type: "expense", category: "Gastos Administrativos" },
  { code: "63903000", name: "Telecomunicaciones", type: "expense", category: "Gastos Administrativos" },
  { code: "63904000", name: "Material de Oficina", type: "expense", category: "Gastos Administrativos" },
  { code: "63905000", name: "Software y Licencias", type: "expense", category: "Gastos Administrativos" },
  
  // Costo de Ventas (69000 - 69999)
  { code: "69101000", name: "Costo de Productos Vendidos", type: "cost", category: "Costo de Ventas" },
  { code: "69102000", name: "Costo de Servicios", type: "cost", category: "Costo de Ventas" },
  { code: "69103000", name: "Costo de Suministros", type: "cost", category: "Costo de Ventas" }
];

export const PET_BREEDS = [
  // Perros
  "Golden Retriever",
  "Labrador",
  "Pastor Alemán",
  "Bulldog Francés",
  "Poodle",
  "Yorkshire Terrier",
  "Chihuahua",
  "Beagle",
  "Boxer",
  "Rottweiler",
  "Husky Siberiano",
  "Border Collie",
  "Cocker Spaniel",
  "Dálmata",
  "San Bernardo",

  // Gatos
  "Persa",
  "Siamés",
  "Maine Coon",
  "Británico de Pelo Corto",
  "Ragdoll",
  "Bengalí",
  "Abisinio",
  "Scottish Fold",
  "Ruso Azul",
  "Sphynx",

  // Otros
  "Mestizo",
  "Otro",
];

export const PET_DOG_BREEDS = [
  "Golden Retriever",
  "Labrador",
  "Pastor Alemán",
  "Bulldog Francés",
  "Poodle",
  "Yorkshire Terrier",
  "Chihuahua",
  "Beagle",
  "Boxer",
  "Rottweiler",
  "Husky Siberiano",
  "Border Collie",
  "Cocker Spaniel",
  "Dálmata",
  "San Bernardo",
  "Schnauzer",
  "Shih Tzu",
  "Pug",
  "Dachshund",
  "Mastín",
  "Doberman",
  "Mestizo",
  "Otro"
];

export const PET_CAT_BREEDS = [
  "Persa",
  "Siamés",
  "Maine Coon",
  "Británico de Pelo Corto",
  "Ragdoll",
  "Bengalí",
  "Abisinio",
  "Scottish Fold",
  "Ruso Azul",
  "Sphynx",
  "Angora",
  "Burmés",
  "Mestizo",
  "Otro"
];

export const PET_TEMPERAMENTS = [
  "Agresivo",
  "Desconfiado",
  "Nervioso",
  "Tranquilo",
  "Dócil",
  "Juguetón",
  "Protector"
];

export const PET_BEHAVIORS = [
  "Amigable",
  "Mordedor",
  "Inquieto",
  "Sociable",
  "Tímido",
  "Dominante",
  "Obediente"
];

export const SERVICE_CATEGORIES = [
  "Baño",
  "Estética",
  "Completo",
  "Cuidado",
  "Medicinal",
  "Especial",
];

export const VEHICLE_TYPES = [
  "Furgoneta Pequeña",
  "Furgoneta Mediana",
  "Furgoneta Grande",
  "Camión Equipado",
  "Otro",
];

export const DASHBOARD_METRICS = {
  refreshInterval: 30000, // 30 segundos
  chartColors: {
    primary: "#4f46e5",
    secondary: "#06b6d4",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
};

export const UI_SETTINGS = {
  animations: true,
  darkMode: "auto", // 'light', 'dark', 'auto'
  language: "es",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  currency: "EUR",
};

export const BACKUP_SETTINGS = {
  autoBackup: true,
  backupInterval: 24, // horas
  retentionDays: 30,
  includeFiles: true,
};

export const SECURITY_SETTINGS = {
  sessionTimeout: 60, // minutos
  passwordPolicy: true,
  twoFactorAuth: false,
  loginNotifications: true,
  maxLoginAttempts: 5,
  lockoutDuration: 15, // minutos
};

// Datos geográficos de Perú
export const PERU_DEPARTMENTS = [
  "Lima",
  "Arequipa",
  "Cusco",
  "La Libertad",
  "Piura",
  "Lambayeque",
  "Junín",
  "Puno",
  "Ica",
  "Ancash",
  "Cajamarca",
  "Huánuco",
  "Loreto",
  "Ucayali",
  "San Martín",
  "Ayacucho",
  "Tacna",
  "Moquegua",
  "Pasco",
  "Tumbes",
  "Apurímac",
  "Huancavelica",
  "Amazonas",
  "Madre de Dios"
];

export const PERU_DISTRICTS_LIMA = [
  "Miraflores",
  "San Isidro",
  "San Borja",
  "Surco",
  "La Molina",
  "Barranco",
  "San Miguel",
  "Jesús María",
  "Lince",
  "Magdalena",
  "Pueblo Libre",
  "Cercado de Lima",
  "Breña",
  "La Victoria",
  "San Luis",
  "Ate",
  "Santa Anita",
  "El Agustino",
  "Chorrillos",
  "Villa El Salvador",
  "Villa María del Triunfo",
  "San Juan de Miraflores",
  "Los Olivos",
  "Independencia",
  "San Martín de Porres",
  "Comas",
  "Carabayllo",
  "Puente Piedra",
  "Ancón",
  "Santa Rosa",
  "Callao",
  "Bellavista",
  "La Perla",
  "La Punta",
  "Carmen de la Legua",
  "Ventanilla"
];

export const PERU_PROVINCES_LIMA = [
  "Lima",
  "Barranca",
  "Cajatambo",
  "Canta",
  "Cañete",
  "Huaral",
  "Huarochirí",
  "Huaura",
  "Oyón",
  "Yauyos"
];

export const PERU_POSTAL_CODES = [
  { code: "15001", district: "Cercado de Lima" },
  { code: "15046", district: "Miraflores" },
  { code: "15073", district: "San Isidro" },
  { code: "15021", district: "San Borja" },
  { code: "15023", district: "Surco" },
  { code: "15024", district: "La Molina" },
  { code: "15063", district: "Barranco" },
  { code: "15086", district: "San Miguel" },
  { code: "15072", district: "Jesús María" },
  { code: "15046", district: "Lince" },
  { code: "15076", district: "Magdalena" },
  { code: "15084", district: "Pueblo Libre" },
  { code: "15082", district: "Breña" },
  { code: "15003", district: "La Victoria" },
  { code: "15057", district: "San Luis" },
  { code: "15012", district: "Ate" },
  { code: "15008", district: "Santa Anita" },
  { code: "15007", district: "El Agustino" },
  { code: "15067", district: "Chorrillos" },
  { code: "15842", district: "Villa El Salvador" },
  { code: "15801", district: "Villa María del Triunfo" },
  { code: "15801", district: "San Juan de Miraflores" },
  { code: "15304", district: "Los Olivos" },
  { code: "15332", district: "Independencia" },
  { code: "15101", district: "San Martín de Porres" },
  { code: "15324", district: "Comas" },
  { code: "15121", district: "Carabayllo" },
  { code: "15118", district: "Puente Piedra" },
  { code: "15125", district: "Ancón" },
  { code: "15138", district: "Santa Rosa" },
  { code: "07001", district: "Callao" },
  { code: "07011", district: "Bellavista" },
  { code: "07016", district: "La Perla" },
  { code: "07021", district: "La Punta" },
  { code: "07006", district: "Carmen de la Legua" },
  { code: "07056", district: "Ventanilla" }
];

// Bancos del Perú
export const PERU_BANKS = [
  "BCP - Banco de Crédito del Perú",
  "BBVA",
  "Scotiabank",
  "Interbank",
  "Banco de la Nación",
  "BanBif",
  "Banco Pichincha",
  "Banco Falabella",
  "Banco Ripley",
  "Mibanco",
  "Banco GNB",
  "Banco Citibank",
  "Banco Santander",
  "Banco Azteca",
  "ICBC Peru Bank",
  "Alfin Banco",
  "Banco Comercio",
  "Caja Arequipa",
  "Caja Cusco",
  "Caja Huancayo",
  "Caja Piura",
  "Caja Sullana",
  "Caja Trujillo"
];