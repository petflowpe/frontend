// Utilidades comunes para SmartPet

// Formateo de fechas
export const formatDate = (
  date: string | Date,
  format: "short" | "long" | "time" = "short",
): string => {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";

  try {
    switch (format) {
      case "long":
        return d.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "time":
        return d.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });
      default:
        return d.toLocaleDateString("es-ES");
    }
  } catch {
    return "—";
  }
};

// Formateo de moneda
export const formatCurrency = (
  amount: number,
  currency: string = "EUR",
): string => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Formateo de teléfonos
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("34")) {
    const number = cleaned.slice(2);
    return `+34 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  }
  return phone;
};

// Validación de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validación de teléfono español
export const isValidSpanishPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// Generación de IDs únicos
export const generateId = (prefix: string = ""): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// Calcular edad de mascota
export const calculatePetAge = (birthDate: string): string => {
  const birth = new Date(birthDate);
  const today = new Date();
  const ageInMonths =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  if (ageInMonths < 12) {
    return `${ageInMonths} ${ageInMonths === 1 ? "mes" : "meses"}`;
  }

  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;

  if (months === 0) {
    return `${years} ${years === 1 ? "año" : "años"}`;
  }

  return `${years} ${years === 1 ? "año" : "años"} y ${months} ${months === 1 ? "mes" : "meses"}`;
};

// Calcular distancia entre coordenadas (fórmula de Haversine)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
};

// Calcular tiempo estimado de servicio
export const calculateServiceDuration = (
  services: any[],
): number => {
  return services.reduce(
    (total, service) => total + (service.duration || 60),
    0,
  );
};

// Calcular precio total con descuentos e impuestos
export const calculateTotalPrice = (
  subtotal: number,
  discountPercent: number = 0,
  taxPercent: number = 21,
): {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
} => {
  const discount = subtotal * (discountPercent / 100);
  const discountedAmount = subtotal - discount;
  const tax = discountedAmount * (taxPercent / 100);
  const total = discountedAmount + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

// Detectar tipo de mascota por raza
export const getPetType = (
  breed: string,
): "dog" | "cat" | "other" => {
  const dogBreeds = [
    "golden retriever",
    "labrador",
    "pastor alemán",
    "bulldog francés",
    "poodle",
    "yorkshire terrier",
    "chihuahua",
    "beagle",
    "boxer",
    "rottweiler",
    "husky siberiano",
    "border collie",
    "cocker spaniel",
    "dálmata",
    "san bernardo",
  ];

  const catBreeds = [
    "persa",
    "siamés",
    "maine coon",
    "británico de pelo corto",
    "ragdoll",
    "bengalí",
    "abisinio",
    "scottish fold",
    "ruso azul",
    "sphynx",
  ];

  const lowerBreed = breed.toLowerCase();

  if (dogBreeds.some((dog) => lowerBreed.includes(dog)))
    return "dog";
  if (catBreeds.some((cat) => lowerBreed.includes(cat)))
    return "cat";
  return "other";
};

// Generar colores para gráficos
export const generateChartColors = (
  count: number,
): string[] => {
  const baseColors = [
    "#4f46e5",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#84cc16",
  ];

  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

// Validar rango de fechas
export const isValidDateRange = (
  startDate: string,
  endDate: string,
): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

// Calcular días laborables entre fechas
export const calculateWorkingDays = (
  startDate: string,
  endDate: string,
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;

  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // No domingo ni sábado
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

// Formatear duración en minutos a horas y minutos
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

// Generar número de factura
export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1)
    .toString()
    .padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `INV-${year}-${month}-${random}`;
};

// Calcular calificación promedio
export const calculateAverageRating = (
  ratings: number[],
): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

// Capitalizar primera letra
export const capitalize = (str: string): string => {
  return (
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  );
};

// Truncar texto
export const truncateText = (
  text: string,
  maxLength: number,
): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Detectar dispositivo móvil
export const isMobile = (): boolean => {
  return window.innerWidth < 768;
};

// Debounce para búsquedas
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Formatear código postal español
export const formatPostalCode = (code: string): string => {
  const cleaned = code.replace(/\D/g, "");
  if (cleaned.length === 5) {
    return cleaned;
  }
  return code;
};

// Validar código postal español
export const isValidSpanishPostalCode = (
  code: string,
): boolean => {
  const postalCodeRegex = /^[0-5]\d{4}$/;
  return postalCodeRegex.test(code);
};

// Convertir texto a slug
export const textToSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^\w\s-]/g, "") // Remover caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .trim();
};

// Obtener saludo según la hora
export const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
};

// Calcular días hasta una fecha
export const daysUntil = (date: string): number => {
  const target = new Date(date);
  const today = new Date();
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};