/**
 * Hooks de Sincronización Consolidados
 * 
 * Este archivo contiene todos los hooks de sincronización restantes
 * para resolver las inconsistencias #5-#15
 */

import { useEffect } from 'react';
import { eventBus, EVENTS } from '@/services/eventBus';
import { toast } from 'sonner';

// ========================================
// #5: Portal Cliente ↔ Sistema Admin
// ========================================
export const usePortalAdminSync = () => {
  useEffect(() => {
    // Escuchar reservas desde el portal
    const handlePortalBooking = (booking: any) => {
      console.log('🔄 Sync: Nueva reserva desde portal', booking.id);
      
      // Notificar al admin
      toast.info('Nueva reserva desde el portal', {
        description: `Cliente: ${booking.clientName}`,
        action: {
          label: 'Ver',
          onClick: () => {
            // Navegar a la cita
            window.dispatchEvent(new CustomEvent('navigate-to-appointment', { 
              detail: { appointmentId: booking.id } 
            }));
          }
        }
      });
    };

    const unsub = eventBus.on('portal.booking.created', handlePortalBooking);
    return () => unsub();
  }, []);
};

// ========================================
// #6: Notificaciones ↔ Confirmaciones
// ========================================
export const useNotificationConfirmationSync = () => {
  useEffect(() => {
    const handleAppointmentConfirmed = (appointmentId: string) => {
      console.log('🔄 Sync: Marcando notificaciones como leídas...', appointmentId);
      
      // Marcar notificaciones relacionadas como leídas
      eventBus.emitSync('notifications.mark-read', {
        appointmentId,
        type: 'appointment_reminder'
      });
    };

    const unsub = eventBus.on(EVENTS.APPOINTMENT_CONFIRMED, handleAppointmentConfirmed);
    return () => unsub();
  }, []);
};

// ========================================
// #7: GPS Tracking ↔ Rutas
// ========================================
export const useGPSRouteSync = () => {
  useEffect(() => {
    const handleLocationUpdate = (data: { vehicleId: string; lat: number; lng: number }) => {
      console.log('🔄 Sync: Ubicación actualizada, verificando progreso de ruta...', data.vehicleId);
      
      // Actualizar progreso de ruta
      eventBus.emitSync('route.progress.updated', {
        vehicleId: data.vehicleId,
        location: { lat: data.lat, lng: data.lng }
      });
      
      // Verificar proximidad a próxima parada
      // checkProximityToNextStop(data);
    };

    const unsub = eventBus.on(EVENTS.VEHICLE_LOCATION_UPDATED, handleLocationUpdate);
    return () => unsub();
  }, []);
};

// ========================================
// #8: Usuarios ↔ Permisos
// ========================================
export const useUserPermissionsSync = () => {
  useEffect(() => {
    const handleRoleChanged = (data: { userId: string; newRole: string }) => {
      console.log('🔄 Sync: Rol cambiado, invalidando sesión...', data.userId);
      
      // Invalidar sesión para forzar re-login
      toast.warning('Tu rol ha cambiado', {
        description: 'Por favor, vuelve a iniciar sesión para aplicar los cambios',
        duration: 10000
      });
      
      // Emitir evento para cerrar sesión
      setTimeout(() => {
        eventBus.emitSync(EVENTS.USER_LOGGED_OUT, { userId: data.userId });
      }, 5000);
    };

    const unsub = eventBus.on(EVENTS.USER_ROLE_CHANGED, handleRoleChanged);
    return () => unsub();
  }, []);
};

// ========================================
// #9: Reportes ↔ Datos Reales
// ========================================
export const useReportsDataSync = () => {
  useEffect(() => {
    // Escuchar cambios que afecten reportes
    const handleDataChange = () => {
      console.log('🔄 Sync: Datos actualizados, invalidando cache de reportes...');
      
      // Invalidar cache de reportes
      eventBus.emitSync('reports.cache.invalidate', {
        timestamp: new Date().toISOString()
      });
    };

    const events = [
      EVENTS.APPOINTMENT_CREATED,
      EVENTS.APPOINTMENT_COMPLETED,
      EVENTS.INVOICE_PAID,
      EVENTS.PAYMENT_COMPLETED
    ];

    const unsubscribers = events.map(event => 
      eventBus.on(event, handleDataChange)
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);
};

// ========================================
// #10: Calendario ↔ Horarios de Trabajo
// ========================================
export const validateWorkingHours = (
  date: string,
  time: string,
  workingHours: any
): { valid: boolean; message?: string } => {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const schedule = workingHours[dayOfWeek];

  if (!schedule || !schedule.open) {
    return {
      valid: false,
      message: 'No trabajamos este día'
    };
  }

  const appointmentMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(schedule.startTime);
  const endMinutes = timeToMinutes(schedule.endTime);

  if (appointmentMinutes < startMinutes || appointmentMinutes > endMinutes) {
    return {
      valid: false,
      message: `Horario disponible: ${schedule.startTime} - ${schedule.endTime}`
    };
  }

  return { valid: true };
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// ========================================
// #11: Productos ↔ Servicios (Validación)
// ========================================
export const validateServiceProducts = (
  serviceIds: string[],
  services: any[],
  products: any[]
): { valid: boolean; missingProducts: any[] } => {
  const missingProducts: any[] = [];

  serviceIds.forEach(serviceId => {
    const service = services.find(s => s.id === serviceId);
    
    if (service?.requiredProducts) {
      service.requiredProducts.forEach((productId: string) => {
        const product = products.find(p => p.id === productId);
        
        if (!product || product.stock < 1) {
          missingProducts.push({
            serviceId,
            serviceName: service.name,
            productId,
            productName: product?.name || 'Desconocido',
            stock: product?.stock || 0
          });
        }
      });
    }
  });

  return {
    valid: missingProducts.length === 0,
    missingProducts
  };
};

// ========================================
// #12: Mascotas ↔ Restricciones de Servicio
// ========================================
export const validatePetServiceRestrictions = (
  pet: any,
  service: any
): { valid: boolean; reason?: string } => {
  // Validar tamaño
  if (service.allowedSizes && !service.allowedSizes.includes(pet.size)) {
    return {
      valid: false,
      reason: `Este servicio solo está disponible para mascotas: ${service.allowedSizes.join(', ')}`
    };
  }

  // Validar raza restringida
  if (service.restrictedBreeds?.includes(pet.breed)) {
    return {
      valid: false,
      reason: `Este servicio no está disponible para la raza ${pet.breed}`
    };
  }

  // Validar peso
  if (pet.weight && service.weightMultipliers) {
    const applicable = service.weightMultipliers.find((wm: any) =>
      pet.weight >= wm.minWeight && pet.weight <= wm.maxWeight
    );

    if (!applicable) {
      return {
        valid: false,
        reason: `Este servicio no está disponible para mascotas de ${pet.weight}kg`
      };
    }
  }

  return { valid: true };
};

// ========================================
// #13: Zonas ↔ Clientes (Catálogo)
// ========================================
export const ZONES = [
  { id: 'ZONA-MF', name: 'Miraflores', districts: ['Miraflores'], color: '#FF6B6B' },
  { id: 'ZONA-SI', name: 'San Isidro', districts: ['San Isidro'], color: '#4ECDC4' },
  { id: 'ZONA-SUR', name: 'Surco', districts: ['Surco', 'La Molina'], color: '#45B7D1' },
  { id: 'ZONA-SB', name: 'San Borja', districts: ['San Borja'], color: '#96CEB4' },
  { id: 'ZONA-JM', name: 'Jesús María', districts: ['Jesús María', 'Lince'], color: '#FFEAA7' },
  { id: 'ZONA-BC', name: 'Barranco/Chorrillos', districts: ['Barranco', 'Chorrillos'], color: '#DFE6E9' },
] as const;

export const getZoneByDistrict = (district: string) => {
  return ZONES.find(zone => 
    zone.districts.some(d => 
      d.toLowerCase() === district.toLowerCase()
    )
  );
};

// ========================================
// #14: Descuentos ↔ Facturación
// ========================================
export const calculateDiscountedTotal = (
  subtotal: number,
  clientCategory: string
): {
  subtotal: number;
  discount: number;
  discountPercentage: number;
  tax: number;
  total: number;
} => {
  const discountPercentages: Record<string, number> = {
    'Oro': 15,
    'Bronce': 10,
    'Plata': 0
  };

  const discountPercentage = discountPercentages[clientCategory] || 0;
  const discount = (subtotal * discountPercentage) / 100;
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * 0.18; // IGV 18%
  const total = afterDiscount + tax;

  return {
    subtotal,
    discount,
    discountPercentage,
    tax,
    total
  };
};

// ========================================
// #15: Analytics ↔ Filtros Globales
// ========================================
export const useAnalyticsFiltersSync = (
  onFiltersChange?: (filters: any) => void
) => {
  useEffect(() => {
    const handleFiltersChange = (filters: any) => {
      console.log('🔄 Sync: Filtros de analytics actualizados', filters);
      
      if (onFiltersChange) {
        onFiltersChange(filters);
      }

      // Emitir evento para que todos los gráficos se actualicen
      eventBus.emitSync(EVENTS.ANALYTICS_FILTERS_CHANGED, filters);
    };

    const unsub = eventBus.on('analytics.filters.updated', handleFiltersChange);
    return () => unsub();
  }, [onFiltersChange]);
};

// ========================================
// Hook maestro que activa todas las sincronizaciones
// ========================================
export const useAllSyncHooks = () => {
  usePortalAdminSync();
  useNotificationConfirmationSync();
  useGPSRouteSync();
  useUserPermissionsSync();
  useReportsDataSync();
  
  console.log('✅ Todas las sincronizaciones activadas');
};

export default useAllSyncHooks;
