/**
 * Servicio de Notificaciones Automáticas
 * Gestiona recordatorios y confirmaciones de citas
 */

import { Appointment } from '../hooks/useAppointments';
import { apiClient } from '../utils/api/client';
import { toast } from 'sonner';
import { format, addHours, isBefore, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationConfig {
  reminderHours: number; // Horas antes de la cita para enviar recordatorio
  confirmationEnabled: boolean;
  autoConfirm: boolean;
}

const DEFAULT_CONFIG: NotificationConfig = {
  reminderHours: 24,
  confirmationEnabled: true,
  autoConfirm: false,
};

/**
 * Verifica y envía recordatorios para citas pendientes
 */
export async function checkAndSendReminders(
  appointments: Appointment[],
  config: NotificationConfig = DEFAULT_CONFIG
): Promise<{ sent: number; errors: number }> {
  const now = new Date();
  const reminderTime = addHours(now, config.reminderHours);
  
  const appointmentsToRemind = appointments.filter(apt => {
    if (apt.status !== 'pending' && apt.status !== 'confirmed') return false;
    if (apt.reminderSent) return false;
    
    const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
    const hoursUntilAppointment = differenceInHours(appointmentDateTime, now);
    
    // Enviar recordatorio si está dentro del rango de horas configurado
    return hoursUntilAppointment > 0 && hoursUntilAppointment <= config.reminderHours;
  });

  let sent = 0;
  let errors = 0;

  for (const appointment of appointmentsToRemind) {
    try {
      await sendReminder(appointment);
      sent++;
    } catch (error) {
      console.error(`Error enviando recordatorio para cita ${appointment.id}:`, error);
      errors++;
    }
  }

  return { sent, errors };
}

/**
 * Envía un recordatorio para una cita específica
 */
async function sendReminder(appointment: Appointment): Promise<void> {
  try {
    // Marcar como enviado en el backend
    await apiClient.post(`/appointments/${appointment.id}/send-reminder`);

    // Aquí podrías integrar con servicios de notificación:
    // - Email (SendGrid, Mailgun, etc.)
    // - SMS (Twilio, etc.)
    // - Push notifications
    // - WhatsApp Business API
    
    console.log(`Recordatorio enviado para cita ${appointment.id}`);
  } catch (error: any) {
    throw new Error(`Error al enviar recordatorio: ${error.message}`);
  }
}

/**
 * Envía confirmación automática para citas próximas
 */
export async function sendConfirmation(
  appointment: Appointment
): Promise<boolean> {
  try {
    await apiClient.post(`/appointments/${appointment.id}/confirm`);

    // Enviar notificación al cliente
    // Aquí podrías integrar con servicios de notificación
    
    return true;
  } catch (error: any) {
    console.error(`Error confirmando cita ${appointment.id}:`, error);
    return false;
  }
}

/**
 * Verifica citas que necesitan confirmación automática
 */
export async function checkAndAutoConfirm(
  appointments: Appointment[],
  autoConfirmHours: number = 48
): Promise<{ confirmed: number; errors: number }> {
  const now = new Date();
  
  const appointmentsToConfirm = appointments.filter(apt => {
    if (apt.status !== 'pending') return false;
    
    const appointmentDateTime = new Date(`${apt.date}T${apt.time}`);
    const hoursUntilAppointment = differenceInHours(appointmentDateTime, now);
    
    return hoursUntilAppointment > 0 && hoursUntilAppointment <= autoConfirmHours;
  });

  let confirmed = 0;
  let errors = 0;

  for (const appointment of appointmentsToConfirm) {
    try {
      const success = await sendConfirmation(appointment);
      if (success) confirmed++;
      else errors++;
    } catch (error) {
      console.error(`Error auto-confirmando cita ${appointment.id}:`, error);
      errors++;
    }
  }

  return { confirmed, errors };
}

/**
 * Formatea mensaje de recordatorio
 */
export function formatReminderMessage(appointment: Appointment): string {
  const date = format(new Date(`${appointment.date}T${appointment.time}`), 'EEEE, d MMMM yyyy "a las" HH:mm', { locale: es });
  
  return `Recordatorio: Tienes una cita programada el ${date} para ${appointment.pet || appointment.petName}. 
Dirección: ${appointment.address || 'A confirmar'}`;
}

/**
 * Formatea mensaje de confirmación
 */
export function formatConfirmationMessage(appointment: Appointment): string {
  const date = format(new Date(`${appointment.date}T${appointment.time}`), 'EEEE, d MMMM yyyy "a las" HH:mm', { locale: es });
  
  return `Tu cita ha sido confirmada para el ${date} para ${appointment.pet || appointment.petName}. 
Te esperamos en: ${appointment.address || 'A confirmar'}`;
}

/**
 * Hook para ejecutar verificaciones periódicas de notificaciones
 */
export function setupNotificationChecker(
  appointments: Appointment[],
  config: NotificationConfig = DEFAULT_CONFIG,
  intervalMinutes: number = 60
): () => void {
  const checkNotifications = async () => {
    try {
      // Verificar recordatorios
      const reminderResult = await checkAndSendReminders(appointments, config);
      if (reminderResult.sent > 0) {
        console.log(`✅ ${reminderResult.sent} recordatorios enviados`);
      }

      // Auto-confirmar si está habilitado
      if (config.autoConfirm) {
        const confirmResult = await checkAndAutoConfirm(appointments);
        if (confirmResult.confirmed > 0) {
          console.log(`✅ ${confirmResult.confirmed} citas auto-confirmadas`);
        }
      }
    } catch (error) {
      console.error('Error en verificación de notificaciones:', error);
    }
  };

  // Ejecutar inmediatamente
  checkNotifications();

  // Configurar intervalo
  const intervalId = setInterval(checkNotifications, intervalMinutes * 60 * 1000);

  // Retornar función de limpieza
  return () => clearInterval(intervalId);
}
