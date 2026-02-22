/**
 * HOOK PERSONALIZADO PARA VALIDACIÓN DE SERVICIOS
 * Facilita el uso de las validaciones en componentes React
 */

import { useMemo } from 'react';
import type { Service, Pet } from '../contexts/AppContext';
import {
  validateServiceForPet,
  calculateServicePrice,
  getValidServicesForPet,
  getServicesWithPrices,
  getSizeLabel,
  validateWeightForSize,
  getServiceRestrictions,
  getServiceRecommendations,
  type ValidationResult,
} from '../utils/serviceValidation';

export interface UseServiceValidationProps {
  services: Service[];
  pet?: Pet;
}

export interface ValidatedService extends Service {
  calculatedPrice: number;
  isValid: boolean;
  validationMessage?: string;
  warnings?: string[];
  restrictions?: string[];
}

export function useServiceValidation({ services, pet }: UseServiceValidationProps) {
  /**
   * Validar un servicio específico
   */
  const validateService = (service: Service): ValidationResult => {
    if (!pet) {
      return {
        valid: false,
        message: 'Debe seleccionar una mascota primero',
      };
    }
    return validateServiceForPet(service, pet);
  };

  /**
   * Calcular precio de un servicio
   */
  const getPrice = (service: Service): number => {
    if (!pet) return service.basePrice;
    return calculateServicePrice(service, pet);
  };

  /**
   * Servicios válidos (memoizado)
   */
  const validServices = useMemo(() => {
    if (!pet) return [];
    return getValidServicesForPet(services, pet);
  }, [services, pet]);

  /**
   * Servicios con precios calculados (memoizado)
   */
  const servicesWithPrices = useMemo(() => {
    if (!pet) {
      return services.map(service => ({
        ...service,
        calculatedPrice: service.basePrice,
        isValid: false,
        validationMessage: 'Seleccione una mascota',
      }));
    }

    return services.map(service => {
      const validation = validateServiceForPet(service, pet);
      return {
        ...service,
        calculatedPrice: validation.calculatedPrice || 0,
        isValid: validation.valid,
        validationMessage: validation.message,
        warnings: validation.warnings,
        restrictions: validation.restrictions,
      };
    });
  }, [services, pet]);

  /**
   * Solo servicios válidos con precios
   */
  const validServicesWithPrices = useMemo(() => {
    return servicesWithPrices.filter(s => s.isValid);
  }, [servicesWithPrices]);

  /**
   * Servicios inválidos (para mostrar por qué no están disponibles)
   */
  const invalidServices = useMemo(() => {
    return servicesWithPrices.filter(s => !s.isValid);
  }, [servicesWithPrices]);

  /**
   * Recomendaciones de servicios
   */
  const recommendations = useMemo(() => {
    if (!pet) return [];
    return getServiceRecommendations(services, pet, { maxRecommendations: 3 });
  }, [services, pet]);

  /**
   * Verificar si el peso es adecuado para el tamaño
   */
  const weightValidation = useMemo(() => {
    if (!pet?.weight || !pet?.size) return null;
    return validateWeightForSize(pet.weight, pet.size);
  }, [pet]);

  /**
   * Agrupar servicios por categoría
   */
  const servicesByCategory = useMemo(() => {
    const grouped = new Map<string, ValidatedService[]>();
    
    validServicesWithPrices.forEach(service => {
      const category = service.category || 'Sin categoría';
      const existing = grouped.get(category) || [];
      grouped.set(category, [...existing, service]);
    });
    
    return grouped;
  }, [validServicesWithPrices]);

  /**
   * Estadísticas de precios
   */
  const priceStats = useMemo(() => {
    if (validServicesWithPrices.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }

    const prices = validServicesWithPrices.map(s => s.calculatedPrice);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    };
  }, [validServicesWithPrices]);

  /**
   * Obtener restricciones de un servicio
   */
  const getRestrictions = (service: Service): string[] => {
    return getServiceRestrictions(service);
  };

  /**
   * Información del tamaño de la mascota
   */
  const sizeInfo = useMemo(() => {
    if (!pet) return null;
    
    return {
      size: pet.size,
      label: getSizeLabel(pet.size),
      weight: pet.weight,
      weightValidation,
    };
  }, [pet, weightValidation]);

  return {
    // Validación
    validateService,
    getPrice,
    getRestrictions,
    
    // Listas de servicios
    validServices,
    servicesWithPrices,
    validServicesWithPrices,
    invalidServices,
    recommendations,
    servicesByCategory,
    
    // Información
    sizeInfo,
    priceStats,
    weightValidation,
    
    // Contadores
    totalServices: services.length,
    validCount: validServices.length,
    invalidCount: services.length - validServices.length,
  };
}
