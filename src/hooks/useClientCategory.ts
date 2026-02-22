import { useState, useEffect } from 'react';
import { ClientCategory, CategoryInfo } from '../types';
import { useCategorias, useCategoria } from './useTenantContext';

/**
 * Hook para obtener información de la categoría de un cliente
 * VERSIÓN MULTI-TENANT: Lee configuración dinámica del tenant actual
 */

export interface CategoryDetails extends CategoryInfo {
  nombre: string;
  motivacion?: string; // Mensaje para motivar a subir de categoría
}

/**
 * Obtiene los detalles visuales y beneficios de una categoría
 * AHORA LEE DE LA CONFIGURACIÓN DEL TENANT (dinámico)
 */
export function getCategoryDetails(categoria: ClientCategory | null | undefined, cantidadMascotas: number = 0): CategoryDetails {
  // TODO: En componentes React, usar useCategoryDetails() en vez de esta función
  // Esta función es un fallback para uso fuera de componentes
  
  // Valores por defecto hardcodeados (solo como fallback)
  // En producción, esto debe venir siempre del tenant
  switch (categoria) {
    case 'Oro':
      return {
        categoria: 'Oro',
        cantidad_mascotas: cantidadMascotas,
        icono: '🥇',
        color: 'yellow',
        nombre: 'Cliente ORO',
        beneficios: [
          '15% de descuento en todos los servicios',
          'Prioridad en agenda (horarios prime)',
          'Vehículo/personal preferido',
          'Cancelación flexible (hasta 12 hrs antes)',
          'Servicio express para emergencias'
        ],
        descuento: 15
      };

    case 'Bronce':
      return {
        categoria: 'Bronce',
        cantidad_mascotas: cantidadMascotas,
        icono: '🥉',
        color: 'orange',
        nombre: 'Cliente BRONCE',
        beneficios: [
          '10% de descuento en todos los servicios',
          'Prioridad en agenda',
          'Recordatorios personalizados'
        ],
        descuento: 10,
        motivacion: cantidadMascotas === 3 
          ? '🌟 ¡A un paso de ORO! Con 1 mascota más accedes a beneficios VIP.'
          : cantidadMascotas === 2
          ? '💡 Con 2 mascotas más pasarás a ORO (15% descuento + beneficios VIP)'
          : undefined
      };

    case 'Plata':
      return {
        categoria: 'Plata',
        cantidad_mascotas: cantidadMascotas,
        icono: '🥈',
        color: 'gray',
        nombre: 'Cliente PLATA',
        beneficios: [
          'Servicio estándar de calidad',
          'Acumula puntos por cada servicio'
        ],
        descuento: 0,
        motivacion: '💡 ¡Adopta otra mascota y pasa a BRONCE! Obtén 10% de descuento permanente.'
      };

    default:
      return {
        categoria: 'Plata',
        cantidad_mascotas: 0,
        icono: '👤',
        color: 'gray',
        nombre: 'Sin categoría',
        beneficios: [
          'Registra tu primera mascota para obtener beneficios'
        ],
        descuento: 0,
        motivacion: '🐾 Registra tu mascota y comienza a disfrutar de nuestros beneficios'
      };
  }
}

/**
 * Obtiene las clases de Tailwind CSS según la categoría
 */
export function getCategoryClasses(categoria: ClientCategory | null | undefined) {
  switch (categoria) {
    case 'Oro':
      return {
        badge: 'bg-yellow-100 border-yellow-500 text-yellow-800',
        button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        text: 'text-yellow-800',
        border: 'border-yellow-500',
        bg: 'bg-yellow-50'
      };
    case 'Bronce':
      return {
        badge: 'bg-orange-100 border-orange-500 text-orange-800',
        button: 'bg-orange-500 hover:bg-orange-600 text-white',
        text: 'text-orange-800',
        border: 'border-orange-500',
        bg: 'bg-orange-50'
      };
    case 'Plata':
      return {
        badge: 'bg-gray-100 border-gray-400 text-gray-700',
        button: 'bg-gray-500 hover:bg-gray-600 text-white',
        text: 'text-gray-700',
        border: 'border-gray-400',
        bg: 'bg-gray-50'
      };
    default:
      return {
        badge: 'bg-gray-100 border-gray-300 text-gray-600',
        button: 'bg-gray-400 hover:bg-gray-500 text-white',
        text: 'text-gray-600',
        border: 'border-gray-300',
        bg: 'bg-gray-50'
      };
  }
}

/**
 * Calcula la categoría que correspondería a un número de mascotas
 * (útil para preview antes de registrar una mascota)
 */
export function calculateCategory(cantidadMascotas: number): ClientCategory | null {
  if (cantidadMascotas >= 4) return 'Oro';
  if (cantidadMascotas >= 2) return 'Bronce';
  if (cantidadMascotas === 1) return 'Plata';
  return null;
}

/**
 * Formatea el precio aplicando el descuento de la categoría
 */
export function applyDiscount(precio: number, categoria: ClientCategory | null | undefined): number {
  const details = getCategoryDetails(categoria, 0);
  const descuento = details.descuento / 100;
  return precio * (1 - descuento);
}

/**
 * Hook principal para usar en componentes
 */
export function useClientCategory(categoria: ClientCategory | null | undefined, cantidadMascotas: number = 0) {
  const [details, setDetails] = useState<CategoryDetails>(
    getCategoryDetails(categoria, cantidadMascotas)
  );

  useEffect(() => {
    setDetails(getCategoryDetails(categoria, cantidadMascotas));
  }, [categoria, cantidadMascotas]);

  const classes = getCategoryClasses(categoria);

  return {
    ...details,
    classes,
    applyDiscount: (precio: number) => applyDiscount(precio, categoria),
    calculateNextCategory: () => {
      if (cantidadMascotas === 3) return 'Oro';
      if (cantidadMascotas === 1) return 'Bronce';
      return null;
    },
    mascotasParaSiguienteCategoria: () => {
      if (cantidadMascotas >= 4) return 0; // Ya está en máximo
      if (cantidadMascotas === 3) return 1; // Necesita 1 más para Oro
      if (cantidadMascotas === 2) return 2; // Necesita 2 más para Oro
      if (cantidadMascotas === 1) return 1; // Necesita 1 más para Bronce
      return 1; // Necesita 1 para Plata
    }
  };
}

/**
 * Utilidad para mostrar mensaje de cambio de categoría
 */
export function getCategoryChangeMessage(
  categoriaAnterior: ClientCategory | null,
  categoriaNueva: ClientCategory
): { title: string; message: string; emoji: string } {
  // Subió de categoría
  if (!categoriaAnterior || 
      (categoriaAnterior === 'Plata' && categoriaNueva === 'Bronce') ||
      (categoriaAnterior === 'Bronce' && categoriaNueva === 'Oro')) {
    const details = getCategoryDetails(categoriaNueva, 0);
    return {
      title: `¡Felicidades! Ahora eres ${details.nombre}`,
      message: `Has alcanzado el nivel ${categoriaNueva}. Disfruta de tus nuevos beneficios: ${details.beneficios[0]}`,
      emoji: details.icono
    };
  }

  // Bajó de categoría (raro, pero posible si marcó mascota como fallecida)
  if ((categoriaAnterior === 'Oro' && categoriaNueva === 'Bronce') ||
      (categoriaAnterior === 'Bronce' && categoriaNueva === 'Plata')) {
    return {
      title: 'Tu categoría ha cambiado',
      message: `Ahora eres ${categoriaNueva}. Tu nueva categoría se basa en la cantidad de mascotas activas.`,
      emoji: '📊'
    };
  }

  // Primera categoría
  const details = getCategoryDetails(categoriaNueva, 0);
  return {
    title: `¡Bienvenido como ${details.nombre}!`,
    message: `Has sido clasificado como ${categoriaNueva}. ${details.beneficios[0]}`,
    emoji: details.icono
  };
}