
// Interfaces basadas en tu estructura actual
export interface ServicePricing {
  toy: { price: number; cost: number; duration: number };
  small: { price: number; cost: number; duration: number };
  medium: { price: number; cost: number; duration: number };
  large: { price: number; cost: number; duration: number };
  xlarge: { price: number; cost: number; duration: number };
}

export interface BreedException {
  breed: string;
  type: 'multiplier' | 'fixed' | 'extraTime' | 'extra';
  value: number;
  note: string;
}

export interface ServiceProduct {
  id: number;
  name: string;
  price: number; // Precio base o fallback
  pricingBySize?: boolean;
  pricing?: ServicePricing;
  breedExceptions?: BreedException[];
}

export interface PetData {
  id: string;
  name: string;
  breed: string;
  size?: 'toy' | 'small' | 'medium' | 'large' | 'xlarge';
  weight?: number; // en kg, para calcular tamaño si no está explícito
}

interface PriceCalculationResult {
  basePrice: number;
  finalPrice: number;
  duration: number;
  breakdown: string[]; // Explicación de cómo se llegó al precio
  appliedRule: string;
}

// Función auxiliar para determinar tamaño según peso si no se especifica
export const determineSizeFromWeight = (weight: number): 'toy' | 'small' | 'medium' | 'large' | 'xlarge' => {
  if (weight < 5) return 'toy';
  if (weight < 10) return 'small';
  if (weight < 25) return 'medium';
  if (weight < 45) return 'large';
  return 'xlarge';
};

/**
 * MOTOR DE PRECIOS AUTOMÁTICO
 * Cruza datos de mascota con configuración de servicio
 */
export const calculateServicePrice = (
  service: ServiceProduct, 
  pet: PetData
): PriceCalculationResult => {
  let finalPrice = service.price;
  let duration = 60; // Duración base por defecto
  const breakdown: string[] = [];
  let appliedRule = 'Precio Base';

  // 1. Determinar Tamaño
  let size = pet.size;
  if (!size && pet.weight) {
    size = determineSizeFromWeight(pet.weight);
    breakdown.push(`Tamaño calculado por peso (${pet.weight}kg): ${size.toUpperCase()}`);
  }

  // 2. Aplicar Precio por Tamaño
  if (service.pricingBySize && service.pricing && size) {
    const sizePricing = service.pricing[size];
    if (sizePricing) {
      finalPrice = sizePricing.price;
      duration = sizePricing.duration;
      appliedRule = `Tarifa Tamaño ${size.toUpperCase()}`;
      breakdown.push(`Base (${size}): S/ ${sizePricing.price.toFixed(2)}`);
    }
  } else {
    breakdown.push(`Base General: S/ ${finalPrice.toFixed(2)}`);
  }

  // 3. Verificar Excepciones de Raza
  if (service.breedExceptions && service.breedExceptions.length > 0) {
    // Búsqueda insensible a mayúsculas/minúsculas
    const exception = service.breedExceptions.find(
      e => e.breed.toLowerCase() === pet.breed.toLowerCase()
    );

    if (exception) {
      appliedRule += ` + ${exception.breed}`;
      
      switch (exception.type) {
        case 'multiplier':
          const increase = finalPrice * (exception.value - 1);
          finalPrice = finalPrice * exception.value;
          breakdown.push(`Recargo Raza (${pet.breed}): +${((exception.value - 1) * 100).toFixed(0)}% (S/ ${increase.toFixed(2)})`);
          breakdown.push(`Nota: ${exception.note}`);
          break;
          
        case 'fixed':
          finalPrice = exception.value;
          breakdown.push(`Tarifa Fija Raza (${pet.breed}): S/ ${finalPrice.toFixed(2)}`);
          breakdown.push(`Nota: ${exception.note}`);
          break;

        case 'extra':
          finalPrice += exception.value;
          breakdown.push(`Adicional Raza (${pet.breed}): + S/ ${exception.value.toFixed(2)}`);
          breakdown.push(`Nota: ${exception.note}`);
          break;
          
        case 'extraTime':
          // No afecta precio, solo tiempo (aunque podría afectar precio si cobras por hora)
          duration += exception.value;
          breakdown.push(`Tiempo Extra Raza (${pet.breed}): +${exception.value} min`);
          breakdown.push(`Nota: ${exception.note}`);
          break;
      }
    }
  }

  return {
    basePrice: service.price,
    finalPrice: Math.round(finalPrice * 100) / 100, // Redondeo a 2 decimales
    duration,
    breakdown,
    appliedRule
  };
};
