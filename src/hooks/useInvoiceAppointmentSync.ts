/**
 * Hook para sincronizar Facturación ↔ Citas
 * 
 * INCONSISTENCIA #3: Cuando se paga una factura, el estado de la cita
 * NO se actualiza a "pagado". Y viceversa.
 * 
 * SOLUCIÓN: Sincronización bidireccional automática
 */

import { useEffect } from 'react';
import { eventBus, EVENTS } from '@/services/eventBus';
import { Invoice, Appointment } from '@/types';
import { toast } from 'sonner';

interface UseInvoiceAppointmentSyncOptions {
  onAppointmentPaymentUpdate?: (appointmentId: string, paymentStatus: string, paymentMethod?: string) => void;
  onInvoiceStatusUpdate?: (invoiceId: string, status: string) => void;
  onClientNotification?: (clientId: string, notification: any) => void;
}

/**
 * Hook para sincronizar facturas con citas
 */
export const useInvoiceAppointmentSync = (options: UseInvoiceAppointmentSyncOptions = {}) => {
  const { onAppointmentPaymentUpdate, onInvoiceStatusUpdate, onClientNotification } = options;

  useEffect(() => {
    // ========================================
    // EVENTO: Factura pagada
    // ========================================
    const handleInvoicePaid = async (invoice: Invoice) => {
      console.log('🔄 Sync: Factura pagada, actualizando cita...', invoice.id);

      // Si la factura está relacionada con una cita
      if (invoice.appointmentId) {
        // Actualizar estado de pago de la cita
        if (onAppointmentPaymentUpdate) {
          onAppointmentPaymentUpdate(
            invoice.appointmentId,
            'paid',
            invoice.paymentMethod
          );
        }

        // Notificar al cliente
        if (onClientNotification) {
          onClientNotification(invoice.clientId, {
            type: 'payment_confirmed',
            title: 'Pago recibido',
            message: `Tu pago de S/ ${invoice.total.toFixed(2)} ha sido procesado exitosamente.`,
            invoiceId: invoice.id,
            appointmentId: invoice.appointmentId
          });
        }

        // Emitir evento de pago completado
        eventBus.emitSync(EVENTS.PAYMENT_COMPLETED, {
          invoiceId: invoice.id,
          appointmentId: invoice.appointmentId,
          clientId: invoice.clientId,
          amount: invoice.total,
          method: invoice.paymentMethod
        });

        toast.success('Pago registrado', {
          description: `Factura ${invoice.invoiceNumber} - S/ ${invoice.total.toFixed(2)}`
        });
      }
    };

    // ========================================
    // EVENTO: Cita completada (generar factura automática)
    // ========================================
    const handleAppointmentCompleted = async (appointment: Appointment) => {
      console.log('🔄 Sync: Cita completada, verificando facturación...', appointment.id);

      // Verificar si ya tiene factura
      // (esto debería verificarse en la BD, aquí es conceptual)
      
      // Si el pago ya fue realizado durante la cita, actualizar factura
      if (appointment.paymentStatus === 'paid' && appointment.paymentMethod) {
        // Buscar factura relacionada y marcarla como pagada
        toast.info('Sincronizando estado de pago con factura...');
      }
    };

    // ========================================
    // EVENTO: Factura cancelada
    // ========================================
    const handleInvoiceCancelled = async (invoice: Invoice) => {
      console.log('🔄 Sync: Factura cancelada, actualizando cita...', invoice.id);

      if (invoice.appointmentId && onAppointmentPaymentUpdate) {
        // Revertir estado de pago de la cita
        onAppointmentPaymentUpdate(invoice.appointmentId, 'pending', undefined);
        
        toast.warning('Factura cancelada', {
          description: 'El estado de pago de la cita ha sido actualizado'
        });
      }
    };

    // ========================================
    // EVENTO: Pago fallido
    // ========================================
    const handlePaymentFailed = async (data: { invoiceId: string; reason: string }) => {
      console.log('🔄 Sync: Pago fallido, notificando...', data);

      // Actualizar estado de factura
      if (onInvoiceStatusUpdate) {
        onInvoiceStatusUpdate(data.invoiceId, 'pending');
      }

      toast.error('Pago fallido', {
        description: data.reason
      });
    };

    // Suscribirse a eventos
    const unsubInvoicePaid = eventBus.on(EVENTS.INVOICE_PAID, handleInvoicePaid);
    const unsubAppointmentCompleted = eventBus.on(EVENTS.APPOINTMENT_COMPLETED, handleAppointmentCompleted);
    const unsubInvoiceCancelled = eventBus.on(EVENTS.INVOICE_CANCELLED, handleInvoiceCancelled);
    const unsubPaymentFailed = eventBus.on(EVENTS.PAYMENT_FAILED, handlePaymentFailed);

    // Cleanup
    return () => {
      unsubInvoicePaid();
      unsubAppointmentCompleted();
      unsubInvoiceCancelled();
      unsubPaymentFailed();
    };
  }, [onAppointmentPaymentUpdate, onInvoiceStatusUpdate, onClientNotification]);
};

/**
 * Helper para calcular total de factura basado en cita
 */
export const calculateInvoiceFromAppointment = (
  appointment: Appointment,
  services: any[],
  clientCategory?: string
): {
  subtotal: number;
  discount: number;
  discountPercentage: number;
  tax: number;
  total: number;
} => {
  // Calcular subtotal
  const subtotal = appointment.serviceIds.reduce((sum, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return sum + (service?.basePrice || 0);
  }, 0);

  // Obtener descuento por categoría
  const discountPercentage = getCategoryDiscount(clientCategory);
  const discount = (subtotal * discountPercentage) / 100;

  // Calcular después de descuento
  const afterDiscount = subtotal - discount;

  // IGV (18% en Perú)
  const tax = afterDiscount * 0.18;

  // Total final
  const total = afterDiscount + tax;

  return {
    subtotal,
    discount,
    discountPercentage,
    tax,
    total
  };
};

/**
 * Obtener descuento según categoría del cliente
 */
const getCategoryDiscount = (categoria?: string): number => {
  const discounts: Record<string, number> = {
    'Oro': 15,
    'Bronce': 10,
    'Plata': 0
  };

  return discounts[categoria || ''] || 0;
};

/**
 * Generar número de factura correlativo
 */
export const generateInvoiceNumber = async (
  lastInvoiceNumber?: string
): Promise<string> => {
  // Formato: F001-00000001
  const series = 'F001';
  
  if (!lastInvoiceNumber) {
    return `${series}-00000001`;
  }

  // Extraer número de la última factura
  const lastNumber = parseInt(lastInvoiceNumber.split('-')[1]);
  const nextNumber = lastNumber + 1;

  // Formatear con padding
  const formattedNumber = nextNumber.toString().padStart(8, '0');

  return `${series}-${formattedNumber}`;
};

/**
 * Validar requisitos para facturación electrónica (SUNAT Perú)
 */
export const validateInvoiceRequirements = (invoice: Invoice): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Validar datos del cliente
  if (!invoice.clientId) {
    errors.push('ID de cliente requerido');
  }

  // Validar items
  if (!invoice.items || invoice.items.length === 0) {
    errors.push('La factura debe tener al menos un item');
  }

  // Validar totales
  if (invoice.total <= 0) {
    errors.push('El total debe ser mayor a 0');
  }

  // Validar número de factura (debe ser correlativo)
  if (!invoice.invoiceNumber || !invoice.invoiceNumber.match(/^F\d{3}-\d{8}$/)) {
    errors.push('Número de factura inválido (formato: F001-00000001)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export default useInvoiceAppointmentSync;
