/**
 * EventBus - Sistema de eventos centralizado
 * Permite la comunicación desacoplada entre módulos
 */

type EventHandler = (...args: any[]) => void | Promise<void>;

class EventBus {
  private events: Map<string, EventHandler[]> = new Map();
  private debugMode: boolean = process.env.NODE_ENV === 'development';

  /**
   * Suscribirse a un evento
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(handler);
    
    if (this.debugMode) {
      console.log(`📡 EventBus: Subscribed to "${event}"`);
    }

    // Retornar función de cleanup
    return () => this.off(event, handler);
  }

  /**
   * Desuscribirse de un evento
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        
        if (this.debugMode) {
          console.log(`📡 EventBus: Unsubscribed from "${event}"`);
        }
      }
    }
  }

  /**
   * Emitir un evento
   */
  async emit(event: string, ...args: any[]): Promise<void> {
    const handlers = this.events.get(event);
    
    if (this.debugMode) {
      console.log(`📡 EventBus: Emitting "${event}"`, args);
    }

    if (handlers && handlers.length > 0) {
      // Ejecutar handlers en paralelo
      await Promise.all(
        handlers.map(handler => {
          try {
            return Promise.resolve(handler(...args));
          } catch (error) {
            console.error(`Error in event handler for "${event}":`, error);
            return Promise.resolve();
          }
        })
      );
    }
  }

  /**
   * Emitir evento de forma síncrona (sin await)
   */
  emitSync(event: string, ...args: any[]): void {
    const handlers = this.events.get(event);
    
    if (this.debugMode) {
      console.log(`📡 EventBus: Emitting sync "${event}"`, args);
    }

    if (handlers && handlers.length > 0) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in sync event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Obtener lista de eventos registrados
   */
  getEvents(): string[] {
    return Array.from(this.events.keys());
  }

  /**
   * Obtener cantidad de suscriptores por evento
   */
  getSubscriberCount(event: string): number {
    return this.events.get(event)?.length || 0;
  }

  /**
   * Limpiar todos los eventos (útil para testing)
   */
  clear(): void {
    this.events.clear();
    if (this.debugMode) {
      console.log('📡 EventBus: Cleared all events');
    }
  }
}

// Singleton instance
export const eventBus = new EventBus();

/**
 * Catálogo de eventos del sistema
 * Usar estas constantes en vez de strings mágicos
 */
export const EVENTS = {
  // ========================================
  // CITAS (Appointments)
  // ========================================
  APPOINTMENT_CREATED: 'appointment.created',
  APPOINTMENT_UPDATED: 'appointment.updated',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  APPOINTMENT_CONFIRMED: 'appointment.confirmed',
  APPOINTMENT_COMPLETED: 'appointment.completed',
  APPOINTMENT_RESCHEDULED: 'appointment.rescheduled',
  APPOINTMENT_NO_SHOW: 'appointment.no-show',

  // ========================================
  // CLIENTES (Clients)
  // ========================================
  CLIENT_CREATED: 'client.created',
  CLIENT_UPDATED: 'client.updated',
  CLIENT_CATEGORY_CHANGED: 'client.category.changed',
  
  // ========================================
  // MASCOTAS (Pets)
  // ========================================
  PET_ADDED: 'pet.added',
  PET_UPDATED: 'pet.updated',
  PET_DELETED: 'pet.deleted',
  PET_DECEASED: 'pet.deceased',

  // ========================================
  // FACTURACIÓN (Invoicing)
  // ========================================
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_CANCELLED: 'invoice.cancelled',
  
  // ========================================
  // PAGOS (Payments)
  // ========================================
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',

  // ========================================
  // INVENTARIO (Inventory)
  // ========================================
  INVENTORY_LOW: 'inventory.low',
  INVENTORY_OUT: 'inventory.out',
  INVENTORY_UPDATED: 'inventory.updated',
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',

  // ========================================
  // RUTAS (Routes)
  // ========================================
  ROUTE_OPTIMIZED: 'route.optimized',
  ROUTE_UPDATED: 'route.updated',
  ROUTE_STARTED: 'route.started',
  ROUTE_COMPLETED: 'route.completed',

  // ========================================
  // GPS TRACKING
  // ========================================
  VEHICLE_LOCATION_UPDATED: 'vehicle.location.updated',
  VEHICLE_ARRIVED: 'vehicle.arrived',
  VEHICLE_DEPARTED: 'vehicle.departed',

  // ========================================
  // NOTIFICACIONES (Notifications)
  // ========================================
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_READ: 'notification.read',

  // ========================================
  // USUARIOS (Users)
  // ========================================
  USER_ROLE_CHANGED: 'user.role.changed',
  USER_PERMISSIONS_UPDATED: 'user.permissions.updated',
  USER_LOGGED_OUT: 'user.logged.out',

  // ========================================
  // SERVICIOS (Services)
  // ========================================
  SERVICE_CREATED: 'service.created',
  SERVICE_UPDATED: 'service.updated',
  SERVICE_AVAILABILITY_CHANGED: 'service.availability.changed',

  // ========================================
  // DESCUENTOS (Discounts)
  // ========================================
  DISCOUNT_APPLIED: 'discount.applied',
  COUPON_USED: 'coupon.used',

  // ========================================
  // ANALYTICS
  // ========================================
  ANALYTICS_FILTERS_CHANGED: 'analytics.filters.changed',
  REPORT_GENERATED: 'report.generated',
} as const;

/**
 * Type helper para eventos
 */
export type SystemEvent = typeof EVENTS[keyof typeof EVENTS];

/**
 * Hook de React para usar el EventBus
 */
export const useEventBus = () => {
  return {
    on: eventBus.on.bind(eventBus),
    off: eventBus.off.bind(eventBus),
    emit: eventBus.emit.bind(eventBus),
    emitSync: eventBus.emitSync.bind(eventBus),
  };
};

export default eventBus;
