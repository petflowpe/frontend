/**
 * Hook para sincronizar Inventario ↔ Servicios
 * 
 * INCONSISTENCIA #2: Cuando se completa un servicio que usa productos,
 * el inventario NO se descuenta automáticamente
 * 
 * SOLUCIÓN: Actualización automática de stock al completar servicio
 */

import { useEffect } from 'react';
import { eventBus, EVENTS } from '@/services/eventBus';
import { Appointment, Product, Service } from '@/types';
import { toast } from 'sonner';

interface KardexMovement {
  productId: string;
  type: 'entrada' | 'salida';
  quantity: number;
  reason: string;
  referenceType: 'servicio' | 'compra' | 'ajuste' | 'transferencia';
  referenceId: string;
  date: string;
}

interface UseInventoryServiceSyncOptions {
  products: Product[];
  services: Service[];
  onStockUpdate?: (productId: string, newStock: number) => void;
  onKardexMovement?: (movement: KardexMovement) => void;
  onLowStockAlert?: (product: Product) => void;
}

/**
 * Hook para sincronizar inventario con servicios completados
 */
export const useInventoryServiceSync = (options: UseInventoryServiceSyncOptions) => {
  const { products, services, onStockUpdate, onKardexMovement, onLowStockAlert } = options;

  useEffect(() => {
    // ========================================
    // EVENTO: Servicio completado
    // ========================================
    const handleAppointmentCompleted = async (appointment: Appointment) => {
      console.log('🔄 Sync: Servicio completado, actualizando inventario...', appointment.id);

      // Obtener todos los productos requeridos por los servicios
      const requiredProducts = getRequiredProducts(appointment.serviceIds, services);

      if (requiredProducts.length === 0) {
        console.log('ℹ️  No hay productos requeridos para este servicio');
        return;
      }

      // Descontar cada producto
      for (const { productId, quantity } of requiredProducts) {
        const product = products.find(p => p.id === productId);

        if (!product) {
          console.warn(`⚠️  Producto ${productId} no encontrado`);
          continue;
        }

        // Calcular nuevo stock
        const newStock = product.stock - quantity;

        // Actualizar stock
        if (onStockUpdate) {
          onStockUpdate(productId, newStock);
        }

        // Registrar movimiento en kardex
        const movement: KardexMovement = {
          productId,
          type: 'salida',
          quantity,
          reason: `Servicio completado - Cita ${appointment.id}`,
          referenceType: 'servicio',
          referenceId: appointment.id,
          date: new Date().toISOString()
        };

        if (onKardexMovement) {
          onKardexMovement(movement);
        }

        // Emitir evento de actualización de inventario
        eventBus.emitSync(EVENTS.INVENTORY_UPDATED, {
          productId,
          oldStock: product.stock,
          newStock,
          change: -quantity,
          reason: 'service_completed'
        });

        // Verificar stock bajo
        if (newStock <= product.reorderPoint) {
          console.warn(`⚠️  Stock bajo: ${product.name} (${newStock} unidades)`);
          
          if (onLowStockAlert) {
            onLowStockAlert({ ...product, stock: newStock });
          }

          eventBus.emitSync(EVENTS.INVENTORY_LOW, {
            productId,
            productName: product.name,
            currentStock: newStock,
            reorderPoint: product.reorderPoint,
            minStock: product.minStock
          });

          toast.warning(`Stock bajo: ${product.name}`, {
            description: `Solo quedan ${newStock} unidades. Punto de reorden: ${product.reorderPoint}`
          });
        }

        // Stock agotado
        if (newStock <= 0) {
          eventBus.emitSync(EVENTS.INVENTORY_OUT, {
            productId,
            productName: product.name
          });

          toast.error(`¡Stock agotado: ${product.name}!`, {
            description: 'No se podrán realizar más servicios que requieran este producto'
          });
        }
      }

      toast.success('Inventario actualizado automáticamente', {
        description: `${requiredProducts.length} producto(s) descontados`
      });
    };

    // Suscribirse al evento
    const unsubscribe = eventBus.on(EVENTS.APPOINTMENT_COMPLETED, handleAppointmentCompleted);

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [products, services, onStockUpdate, onKardexMovement, onLowStockAlert]);
};

/**
 * Helper para obtener productos requeridos por servicios
 */
const getRequiredProducts = (
  serviceIds: string[],
  services: Service[]
): Array<{ productId: string; quantity: number }> => {
  const productMap = new Map<string, number>();

  serviceIds.forEach(serviceId => {
    const service = services.find(s => s.id === serviceId);
    
    if (service?.requiredProducts) {
      service.requiredProducts.forEach(productId => {
        const currentQty = productMap.get(productId) || 0;
        productMap.set(productId, currentQty + 1); // Cantidad por defecto: 1
      });
    }
  });

  return Array.from(productMap.entries()).map(([productId, quantity]) => ({
    productId,
    quantity
  }));
};

/**
 * Validar si hay stock suficiente antes de agendar servicio
 */
export const validateServiceStock = (
  serviceIds: string[],
  services: Service[],
  products: Product[]
): { valid: boolean; missingProducts: Array<{ productId: string; productName: string; required: number; available: number }> } => {
  const requiredProducts = getRequiredProducts(serviceIds, services);
  const missingProducts: Array<{ productId: string; productName: string; required: number; available: number }> = [];

  requiredProducts.forEach(({ productId, quantity }) => {
    const product = products.find(p => p.id === productId);

    if (!product || product.stock < quantity) {
      missingProducts.push({
        productId,
        productName: product?.name || 'Producto desconocido',
        required: quantity,
        available: product?.stock || 0
      });
    }
  });

  return {
    valid: missingProducts.length === 0,
    missingProducts
  };
};

/**
 * Calcular próxima fecha disponible si no hay stock
 */
export const getNextAvailableDate = async (
  serviceId: string,
  products: Product[]
): Promise<string | null> => {
  // TODO: Implementar lógica para calcular próxima fecha
  // basado en historial de compras y consumo promedio
  
  // Por ahora retornar null (no disponible)
  return null;
};

export default useInventoryServiceSync;
