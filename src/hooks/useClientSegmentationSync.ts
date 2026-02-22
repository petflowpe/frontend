/**
 * Hook para sincronizar Clientes ↔ Segmentación
 * 
 * La segmentación se calcula automáticamente en el backend Laravel
 * cuando se agregan/eliminan mascotas a un cliente.
 */

import { useEffect, useState } from 'react';
import { eventBus, EVENTS } from '@/services/eventBus';
import { Client, Pet } from '@/types';
import { toast } from 'sonner';

interface CategoryInfo {
  categoria: string;
  cantidadMascotas: number;
  icon: string;
  color: string;
  descuento: number;
  beneficios: string[];
}

interface UseClientSegmentationSyncOptions {
  onCategoryChanged?: (clientId: string, oldCategory: string | null, newCategory: string) => void;
  onClientUpdated?: (clientId: string, updates: Partial<Client>) => void;
}

/**
 * Hook para sincronización automática de segmentación
 */
export const useClientSegmentationSync = (options: UseClientSegmentationSyncOptions = {}) => {
  const { onCategoryChanged, onClientUpdated } = options;

  useEffect(() => {
    // ========================================
    // EVENTO: Mascota agregada
    // ========================================
    const handlePetAdded = async (pet: Pet, clientId: string) => {
      console.log('🔄 Sync: Mascota agregada, recalculando categoría...', pet.id);

      // El backend Laravel calcula la categoría automáticamente
      // Este código es para sincronizar el estado local
      
      // Emitir evento para actualizar UI
      eventBus.emitSync(EVENTS.CLIENT_UPDATED, {
        clientId,
        reason: 'pet_added',
        petId: pet.id
      });

      toast.info('Categoría del cliente actualizada', {
        description: 'Se recalculó automáticamente según cantidad de mascotas'
      });
    };

    // ========================================
    // EVENTO: Mascota marcada como fallecida
    // ========================================
    const handlePetDeceased = async (petId: string, clientId: string) => {
      console.log('🔄 Sync: Mascota fallecida, recalculando categoría...', petId);

      // El trigger SQL actualiza automáticamente
      // Solo necesitamos refrescar en el frontend
      
      eventBus.emitSync(EVENTS.CLIENT_UPDATED, {
        clientId,
        reason: 'pet_deceased',
        petId
      });

      toast.warning('Lamentamos tu pérdida', {
        description: 'La categoría del cliente se actualizó automáticamente'
      });
    };

    // ========================================
    // EVENTO: Mascota eliminada
    // ========================================
    const handlePetDeleted = async (petId: string, clientId: string) => {
      console.log('🔄 Sync: Mascota eliminada, recalculando categoría...', petId);

      eventBus.emitSync(EVENTS.CLIENT_UPDATED, {
        clientId,
        reason: 'pet_deleted',
        petId
      });
    };

    // ========================================
    // EVENTO: Categoría cambiada (desde backend Laravel)
    // ========================================
    const handleCategoryChanged = async (data: {
      clientId: string;
      oldCategory: string | null;
      newCategory: string;
      cantidadMascotas: number;
    }) => {
      console.log('🎯 Categoría actualizada:', data);

      if (onCategoryChanged) {
        onCategoryChanged(data.clientId, data.oldCategory, data.newCategory);
      }

      // Obtener info de la categoría
      const categoryInfo = getCategoryInfo(data.newCategory);

      // Notificar al cliente si mejoró de categoría
      if (shouldNotifyCategoryUpgrade(data.oldCategory, data.newCategory)) {
        toast.success(`¡Felicitaciones! Ahora eres cliente ${categoryInfo.nombre}`, {
          description: `Descuento del ${categoryInfo.descuento}% en todos los servicios`,
          duration: 5000
        });
      }
    };

    // Suscribirse a eventos
    const unsubPetAdded = eventBus.on(EVENTS.PET_ADDED, handlePetAdded);
    const unsubPetDeceased = eventBus.on(EVENTS.PET_DECEASED, handlePetDeceased);
    const unsubPetDeleted = eventBus.on(EVENTS.PET_DELETED, handlePetDeleted);
    const unsubCategoryChanged = eventBus.on(EVENTS.CLIENT_CATEGORY_CHANGED, handleCategoryChanged);

    // Cleanup
    return () => {
      unsubPetAdded();
      unsubPetDeceased();
      unsubPetDeleted();
      unsubCategoryChanged();
    };
  }, [onCategoryChanged, onClientUpdated]);
};

/**
 * Hook para escuchar cambios en tiempo real del backend Laravel
 * (usando polling o WebSockets cuando esté implementado)
 */
export const useClientCategoryRealtime = (clientId: string) => {
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implementar polling o WebSockets con backend Laravel
    /*
    // Opción 1: Polling
    const interval = setInterval(async () => {
      const { apiClient } = await import('../utils/api/client');
      const client = await apiClient.get(`/clients/${clientId}`);
      setCategory(client.category);
    }, 5000);
    
    // Opción 2: WebSockets (Laravel Echo)
    const subscription = echo
      .channel(`client-${clientId}`)
      .listen('ClientCategoryChanged', (payload) => {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${clientId}`
      }, (payload) => {
        setCategory(payload.new.categoria);
        
        // Emitir evento local
        eventBus.emitSync(EVENTS.CLIENT_CATEGORY_CHANGED, {
          clientId,
          oldCategory: payload.old.categoria,
          newCategory: payload.new.categoria,
          cantidadMascotas: payload.new.cantidad_mascotas
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
    */

    setLoading(false);
  }, [clientId]);

  return { category, loading };
};

/**
 * Obtener información detallada de una categoría
 */
export const getCategoryInfo = (categoria: string): CategoryInfo => {
  const categories: Record<string, CategoryInfo> = {
    'Oro': {
      categoria: 'Oro',
      cantidadMascotas: 4,
      icon: '🥇',
      color: '#FFD700',
      descuento: 15,
      beneficios: [
        '15% de descuento en todos los servicios',
        'Prioridad en agenda (horarios prime)',
        'Vehículo/personal preferido',
        'Cancelación flexible (hasta 12 hrs antes)',
        'Servicio express para emergencias'
      ]
    },
    'Bronce': {
      categoria: 'Bronce',
      cantidadMascotas: 2,
      icon: '🥉',
      color: '#CD7F32',
      descuento: 10,
      beneficios: [
        '10% de descuento en servicios',
        'Prioridad en agenda',
        'Recordatorios personalizados'
      ]
    },
    'Plata': {
      categoria: 'Plata',
      cantidadMascotas: 1,
      icon: '🥈',
      color: '#C0C0C0',
      descuento: 0,
      beneficios: [
        'Servicio estándar de calidad',
        'Acumula puntos por cada servicio'
      ]
    }
  };

  return categories[categoria] || {
    categoria: 'Sin categoría',
    cantidadMascotas: 0,
    icon: '👤',
    color: '#999999',
    descuento: 0,
    beneficios: ['Registra tu primera mascota para obtener beneficios']
  };
};

/**
 * Calcular categoría basado en cantidad de mascotas activas
 */
export const calculateCategory = (activePetsCount: number): string | null => {
  if (activePetsCount >= 4) return 'Oro';
  if (activePetsCount >= 2) return 'Bronce';
  if (activePetsCount === 1) return 'Plata';
  return null;
};

/**
 * Determinar si se debe notificar upgrade de categoría
 */
const shouldNotifyCategoryUpgrade = (
  oldCategory: string | null,
  newCategory: string
): boolean => {
  const hierarchy: Record<string, number> = {
    'Plata': 1,
    'Bronce': 2,
    'Oro': 3
  };

  const oldLevel = oldCategory ? hierarchy[oldCategory] : 0;
  const newLevel = hierarchy[newCategory] || 0;

  return newLevel > oldLevel;
};

/**
 * Obtener estadísticas de segmentación
 */
export const getSegmentationStats = (clients: Client[]): {
  total: number;
  oro: number;
  bronce: number;
  plata: number;
  sinCategoria: number;
  porcentajes: {
    oro: number;
    bronce: number;
    plata: number;
    sinCategoria: number;
  };
} => {
  const total = clients.length;
  const oro = clients.filter(c => c.loyaltyTier === 'gold').length; // TODO: usar campo 'categoria'
  const bronce = clients.filter(c => c.loyaltyTier === 'silver').length;
  const plata = clients.filter(c => c.loyaltyTier === 'bronze').length;
  const sinCategoria = total - oro - bronce - plata;

  return {
    total,
    oro,
    bronce,
    plata,
    sinCategoria,
    porcentajes: {
      oro: total > 0 ? (oro / total) * 100 : 0,
      bronce: total > 0 ? (bronce / total) * 100 : 0,
      plata: total > 0 ? (plata / total) * 100 : 0,
      sinCategoria: total > 0 ? (sinCategoria / total) * 100 : 0
    }
  };
};

export default useClientSegmentationSync;
