/**
 * SERVICE VALIDATION UTILITIES
 * Validaciones y cálculos para servicios según tamaño/raza de mascotas
 */

import type { Service, Pet } from '../contexts/AppContext';

// Orden de tamaños para comparaciones
export const SIZE_ORDER = {
  'small': 1,
  'medium': 2,
  'large': 3,
  'extra-large': 4,
} as const;

export type PetSize = keyof typeof SIZE_ORDER;

/**
 * Resultado de validación de servicio
 */
export interface ServiceValidationResult {
  valid: boolean;
  reason?: string;
  recommendedService?: string;
  price?: number;
}

/**
 * Resultado de cálculo de precio
 */
export interface PriceCalculationResult {
  basePrice: number;
  adjustments: {
    type: 'size' | 'breed' | 'weight';
    description: string;
    amount: number;
  }[];
  finalPrice: number;
}

/**
 * Obtener el orden numérico de un tamaño
 */
export function getSizeOrder(size: PetSize): number {
  return SIZE_ORDER[size] || 0;
}

/**
 * Comparar tamaños
 */
export function compareSizes(size1: PetSize, size2: PetSize): number {
  return getSizeOrder(size1) - getSizeOrder(size2);
}

/**
 * Validar si un servicio es apropiado para una mascota
 */
export function validateServiceForPet(
  service: Service,
  pet: Pet
): ServiceValidationResult {
  // 1. Verificar si el servicio está activo
  if (!service.active) {
    return {
      valid: false,
      reason: 'Este servicio no está disponible actualmente',
    };
  }

  // 2. Verificar restricciones por tamaño específicas (allowedSizes)
  if (service.allowedSizes && service.allowedSizes.length > 0) {
    if (!service.allowedSizes.includes(pet.size)) {
      return {
        valid: false,
        reason: `Este servicio solo está disponible para mascotas de tamaño: ${service.allowedSizes.join(', ')}`,
      };
    }
  }

  // 3. Verificar tamaño mínimo
  if (service.minSize) {
    if (compareSizes(pet.size, service.minSize) < 0) {
      return {
        valid: false,
        reason: `Este servicio requiere mascotas de tamaño ${service.minSize} o mayor`,
      };
    }
  }

  // 4. Verificar tamaño máximo
  if (service.maxSize) {
    if (compareSizes(pet.size, service.maxSize) > 0) {
      return {
        valid: false,
        reason: `Este servicio solo está disponible para mascotas de tamaño ${service.maxSize} o menor`,
      };
    }
  }

  // 5. Verificar si tiene precio para ese tamaño
  const priceForSize = service.pricing[pet.size];
  if (!priceForSize || priceForSize === 0) {
    return {
      valid: false,
      reason: `Este servicio no está disponible para mascotas de tamaño ${pet.size}`,
    };
  }

  // 6. Verificar restricciones por raza
  if (service.restrictedBreeds && service.restrictedBreeds.length > 0) {
    if (service.restrictedBreeds.includes(pet.breed)) {
      return {
        valid: false,
        reason: `Este servicio no está disponible para la raza ${pet.breed}`,
      };
    }
  }

  // 7. Todo válido
  return {
    valid: true,
    price: priceForSize,
  };
}

/**
 * Calcular precio de servicio para una mascota específica
 */
export function calculateServicePrice(
  service: Service,
  pet: Pet
): PriceCalculationResult {
  // Precio base según tamaño
  const basePrice = service.pricing[pet.size] || 0;
  const adjustments: PriceCalculationResult['adjustments'] = [];

  let finalPrice = basePrice;

  // Ajuste por raza (precio especial)
  if (service.breedExceptions && service.breedExceptions.length > 0) {
    const breedException = service.breedExceptions.find(
      exc => exc.breed === pet.breed
    );
    
    if (breedException) {
      const difference = breedException.price - basePrice;
      adjustments.push({
        type: 'breed',
        description: breedException.reason || `Precio especial para ${pet.breed}`,
        amount: difference,
      });
      finalPrice = breedException.price;
    }
  }

  // Ajuste por peso (multiplicador)
  if (pet.weight && service.weightMultipliers && service.weightMultipliers.length > 0) {
    const weightMultiplier = service.weightMultipliers.find(
      wm => pet.weight! >= wm.minWeight && pet.weight! <= wm.maxWeight
    );
    
    if (weightMultiplier && weightMultiplier.multiplier !== 1) {
      const adjustment = finalPrice * (weightMultiplier.multiplier - 1);
      adjustments.push({
        type: 'weight',
        description: `Ajuste por peso (${pet.weight}kg)`,
        amount: adjustment,
      });
      finalPrice *= weightMultiplier.multiplier;
    }
  }

  return {
    basePrice,
    adjustments,
    finalPrice: Math.round(finalPrice * 100) / 100, // Redondear a 2 decimales
  };
}

/**
 * Filtrar servicios válidos para una mascota
 */
export function getValidServicesForPet(
  services: Service[],
  pet: Pet
): Service[] {
  return services.filter(service => {
    const validation = validateServiceForPet(service, pet);
    return validation.valid;
  });
}

/**
 * Obtener servicios con precios calculados
 */
export function getServicesWithPrices(
  services: Service[],
  pet: Pet
): Array<Service & { calculatedPrice: PriceCalculationResult }> {
  return services.map(service => ({
    ...service,
    calculatedPrice: calculateServicePrice(service, pet),
  }));
}

/**
 * Obtener servicios recomendados según historial
 */
export function getRecommendedServices(
  services: Service[],
  pet: Pet,
  previousServiceIds?: string[]
): Service[] {
  // Filtrar servicios válidos
  const validServices = getValidServicesForPet(services, pet);
  
  // Si no hay historial, retornar servicios más populares
  if (!previousServiceIds || previousServiceIds.length === 0) {
    return validServices.slice(0, 3);
  }
  
  // Recomendar servicios similares a los anteriores
  const previousServices = validServices.filter(s => 
    previousServiceIds.includes(s.id)
  );
  
  if (previousServices.length > 0) {
    // Buscar servicios de la misma categoría
    const categories = previousServices.map(s => s.category);
    return validServices.filter(s => 
      categories.includes(s.category) && !previousServiceIds.includes(s.id)
    ).slice(0, 3);
  }
  
  return validServices.slice(0, 3);
}

/**
 * Formatear mensaje de error para UI
 */
export function formatValidationError(
  validation: ServiceValidationResult
): string {
  if (validation.valid) return '';
  return validation.reason || 'Servicio no disponible';
}

/**
 * Formatear detalles de precio para UI
 */
export function formatPriceDetails(
  calculation: PriceCalculationResult
): string {
  if (calculation.adjustments.length === 0) {
    return `Precio: S/${calculation.finalPrice}`;
  }
  
  let details = `Precio base: S/${calculation.basePrice}\n`;
  calculation.adjustments.forEach(adj => {
    const sign = adj.amount >= 0 ? '+' : '';
    details += `${adj.description}: ${sign}S/${adj.amount}\n`;
  });
  details += `Total: S/${calculation.finalPrice}`;
  
  return details;
}

/**
 * Obtener etiqueta de tamaño en español
 */
export function getSizeLabel(size: PetSize): string {
  const labels: Record<PetSize, string> = {
    'small': 'Pequeño',
    'medium': 'Mediano',
    'large': 'Grande',
    'extra-large': 'Extra Grande',
  };
  return labels[size] || size;
}

/**
 * Obtener color para badge de tamaño
 */
export function getSizeColor(size: PetSize): string {
  const colors: Record<PetSize, string> = {
    'small': 'bg-blue-100 text-blue-800',
    'medium': 'bg-green-100 text-green-800',
    'large': 'bg-orange-100 text-orange-800',
    'extra-large': 'bg-red-100 text-red-800',
  };
  return colors[size] || 'bg-gray-100 text-gray-800';
}

/**
 * Validar servicio antes de crear cita
 */
export function validateAppointmentService(
  service: Service,
  pet: Pet,
  showToast: boolean = true
): boolean {
  const validation = validateServiceForPet(service, pet);
  
  if (!validation.valid && showToast) {
    // Aquí podrías llamar a toast.error() si está disponible
    console.error(validation.reason);
  }
  
  return validation.valid;
}

/**
 * Obtener sugerencias de servicios alternativos
 */
export function getSuggestedAlternatives(
  service: Service,
  pet: Pet,
  allServices: Service[]
): Service[] {
  // Si el servicio es válido, no hay alternativas
  const validation = validateServiceForPet(service, pet);
  if (validation.valid) return [];
  
  // Buscar servicios de la misma categoría que sí sean válidos
  return allServices.filter(s => 
    s.category === service.category &&
    s.id !== service.id &&
    validateServiceForPet(s, pet).valid
  ).slice(0, 2);
}

/**
 * Generar descripción automática de restricciones
 */
export function getServiceRestrictions(service: Service): string[] {
  const restrictions: string[] = [];
  
  if (service.allowedSizes && service.allowedSizes.length > 0) {
    const sizes = service.allowedSizes.map(s => getSizeLabel(s as PetSize)).join(', ');
    restrictions.push(`Solo para tamaños: ${sizes}`);
  }
  
  if (service.minSize) {
    restrictions.push(`Tamaño mínimo: ${getSizeLabel(service.minSize as PetSize)}`);
  }
  
  if (service.maxSize) {
    restrictions.push(`Tamaño máximo: ${getSizeLabel(service.maxSize as PetSize)}`);
  }
  
  if (service.restrictedBreeds && service.restrictedBreeds.length > 0) {
    restrictions.push(`No disponible para: ${service.restrictedBreeds.join(', ')}`);
  }
  
  return restrictions;
}
