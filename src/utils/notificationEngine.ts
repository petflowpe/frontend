// Motor de Notificaciones Automáticas
// Calcula próximas fechas de tratamientos y genera alertas

export interface MedicalNotification {
  id: string;
  petId: number;
  petName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  treatmentType: 'deworming' | 'flea' | 'vaccine';
  treatmentName: string;
  lastDate: Date;
  nextDate: Date;
  daysUntil: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  status: 'overdue' | 'due-soon' | 'upcoming' | 'completed';
  notificationSent: boolean;
  notificationDate?: Date;
  completedDate?: Date;
  notes?: string;
}

export interface Pet {
  id: number;
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  birthDate: string;
  lastDewormingDate?: string;
  lastFleaTreatmentDate?: string;
  lastVaccinationDate?: string;
}

// Configuración de periodicidades según tipo de tratamiento y edad
export function getTreatmentFrequency(
  treatmentType: 'deworming' | 'flea' | 'vaccine',
  petAgeInMonths: number
): number {
  switch (treatmentType) {
    case 'deworming':
      if (petAgeInMonths < 3) return 15; // Cada 15 días (cachorros pequeños)
      if (petAgeInMonths < 6) return 30; // Mensual (cachorros)
      return 90; // Trimestral (adultos)
    
    case 'flea':
      return 30; // Mensual para todos
    
    case 'vaccine':
      if (petAgeInMonths < 2) return 0; // Primera dosis única
      if (petAgeInMonths < 3) return 21; // Segunda dosis (3 semanas después)
      if (petAgeInMonths < 4) return 21; // Tercera dosis (3 semanas después)
      return 365; // Anual (adultos)
    
    default:
      return 90;
  }
}

// Calcular próxima fecha de tratamiento
export function calculateNextDate(
  lastDate: string | Date,
  frequencyDays: number
): Date {
  const date = typeof lastDate === 'string' ? new Date(lastDate) : lastDate;
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + frequencyDays);
  return nextDate;
}

// Calcular días hasta la próxima fecha
export function calculateDaysUntil(nextDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const next = new Date(nextDate);
  next.setHours(0, 0, 0, 0);
  const diffTime = next.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Determinar urgencia basada en días restantes
export function determineUrgency(daysUntil: number): 'critical' | 'high' | 'medium' | 'low' {
  if (daysUntil < 0) return 'critical'; // Vencido
  if (daysUntil <= 3) return 'high';    // Vence en 3 días o menos
  if (daysUntil <= 7) return 'medium';  // Vence en 7 días o menos
  return 'low';                          // Más de 7 días
}

// Determinar estado basado en días restantes
export function determineStatus(daysUntil: number): 'overdue' | 'due-soon' | 'upcoming' | 'completed' {
  if (daysUntil < 0) return 'overdue';     // Vencido
  if (daysUntil <= 7) return 'due-soon';   // Vence pronto
  return 'upcoming';                        // Próximo
}

// Calcular edad de la mascota en meses
export function calculatePetAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  const months = (today.getFullYear() - birth.getFullYear()) * 12 + 
                 (today.getMonth() - birth.getMonth());
  return months;
}

// Generar notificación para un tratamiento específico
export function generateNotification(
  pet: Pet,
  treatmentType: 'deworming' | 'flea' | 'vaccine',
  lastDate: string | undefined
): MedicalNotification | null {
  if (!lastDate) return null;

  const petAgeInMonths = calculatePetAgeInMonths(pet.birthDate);
  const frequency = getTreatmentFrequency(treatmentType, petAgeInMonths);
  
  // Si la frecuencia es 0, es una dosis única (ya aplicada)
  if (frequency === 0) return null;

  const nextDate = calculateNextDate(lastDate, frequency);
  const daysUntil = calculateDaysUntil(nextDate);
  const urgency = determineUrgency(daysUntil);
  const status = determineStatus(daysUntil);

  const treatmentNames = {
    deworming: 'Desparasitación',
    flea: 'Antipulgas',
    vaccine: 'Vacunación'
  };

  return {
    id: `${pet.id}-${treatmentType}-${nextDate.toISOString()}`,
    petId: pet.id,
    petName: pet.name,
    ownerName: pet.ownerName,
    ownerPhone: pet.ownerPhone,
    ownerEmail: pet.ownerEmail,
    treatmentType,
    treatmentName: treatmentNames[treatmentType],
    lastDate: new Date(lastDate),
    nextDate,
    daysUntil,
    urgency,
    status,
    notificationSent: false,
  };
}

// Generar todas las notificaciones para una mascota
export function generatePetNotifications(pet: Pet): MedicalNotification[] {
  const notifications: MedicalNotification[] = [];

  // Desparasitación
  const dewormingNotif = generateNotification(pet, 'deworming', pet.lastDewormingDate);
  if (dewormingNotif) notifications.push(dewormingNotif);

  // Antipulgas
  const fleaNotif = generateNotification(pet, 'flea', pet.lastFleaTreatmentDate);
  if (fleaNotif) notifications.push(fleaNotif);

  // Vacunación
  const vaccineNotif = generateNotification(pet, 'vaccine', pet.lastVaccinationDate);
  if (vaccineNotif) notifications.push(vaccineNotif);

  return notifications;
}

// Generar todas las notificaciones para múltiples mascotas
export function generateAllNotifications(pets: Pet[]): MedicalNotification[] {
  const allNotifications: MedicalNotification[] = [];
  
  pets.forEach(pet => {
    const petNotifications = generatePetNotifications(pet);
    allNotifications.push(...petNotifications);
  });

  // Ordenar por urgencia y días restantes
  return allNotifications.sort((a, b) => {
    // Primero por urgencia
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    }
    // Luego por días restantes
    return a.daysUntil - b.daysUntil;
  });
}

// Filtrar notificaciones por estado
export function filterNotificationsByStatus(
  notifications: MedicalNotification[],
  status: 'all' | 'overdue' | 'due-soon' | 'upcoming' | 'completed'
): MedicalNotification[] {
  if (status === 'all') return notifications;
  return notifications.filter(n => n.status === status);
}

// Filtrar notificaciones por tipo de tratamiento
export function filterNotificationsByType(
  notifications: MedicalNotification[],
  type: 'all' | 'deworming' | 'flea' | 'vaccine'
): MedicalNotification[] {
  if (type === 'all') return notifications;
  return notifications.filter(n => n.treatmentType === type);
}

// Filtrar notificaciones por urgencia
export function filterNotificationsByUrgency(
  notifications: MedicalNotification[],
  urgency: 'all' | 'critical' | 'high' | 'medium' | 'low'
): MedicalNotification[] {
  if (urgency === 'all') return notifications;
  return notifications.filter(n => n.urgency === urgency);
}

// Obtener estadísticas de notificaciones
export function getNotificationStats(notifications: MedicalNotification[]) {
  return {
    total: notifications.length,
    overdue: notifications.filter(n => n.status === 'overdue').length,
    dueSoon: notifications.filter(n => n.status === 'due-soon').length,
    upcoming: notifications.filter(n => n.status === 'upcoming').length,
    critical: notifications.filter(n => n.urgency === 'critical').length,
    high: notifications.filter(n => n.urgency === 'high').length,
    byType: {
      deworming: notifications.filter(n => n.treatmentType === 'deworming').length,
      flea: notifications.filter(n => n.treatmentType === 'flea').length,
      vaccine: notifications.filter(n => n.treatmentType === 'vaccine').length,
    }
  };
}

// Marcar notificación como enviada
export function markNotificationAsSent(
  notification: MedicalNotification,
  date: Date = new Date()
): MedicalNotification {
  return {
    ...notification,
    notificationSent: true,
    notificationDate: date
  };
}

// Marcar notificación como completada
export function markNotificationAsCompleted(
  notification: MedicalNotification,
  date: Date = new Date()
): MedicalNotification {
  return {
    ...notification,
    status: 'completed',
    completedDate: date
  };
}

// Generar mensaje de notificación
export function generateNotificationMessage(
  notification: MedicalNotification,
  channel: 'email' | 'sms' | 'whatsapp'
): string {
  const daysText = notification.daysUntil < 0 
    ? `VENCIDO hace ${Math.abs(notification.daysUntil)} días`
    : notification.daysUntil === 0
      ? 'VENCE HOY'
      : `vence en ${notification.daysUntil} días`;

  const urgencyEmoji = {
    critical: '🚨',
    high: '⚠️',
    medium: '📅',
    low: '📆'
  };

  if (channel === 'sms') {
    return `${urgencyEmoji[notification.urgency]} SmartPet: ${notification.treatmentName} de ${notification.petName} ${daysText}. Agende su cita: smartpet.com/citas`;
  }

  if (channel === 'whatsapp') {
    return `${urgencyEmoji[notification.urgency]} *SmartPet - Recordatorio Médico*\n\n` +
           `Hola ${notification.ownerName},\n\n` +
           `Le recordamos que el tratamiento de *${notification.treatmentName}* de ${notification.petName} ${daysText}.\n\n` +
           `📅 Última aplicación: ${notification.lastDate.toLocaleDateString('es-ES')}\n` +
           `📅 Próxima aplicación: ${notification.nextDate.toLocaleDateString('es-ES')}\n\n` +
           `¿Desea agendar una cita? Responda con *SÍ* o visite: smartpet.com/citas\n\n` +
           `_La salud de su mascota es nuestra prioridad._`;
  }

  // Email (HTML)
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 SmartPet</h1>
        <p style="color: white; margin: 10px 0 0 0;">Recordatorio Médico</p>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
        <h2 style="color: #1f2937; margin-top: 0;">Hola ${notification.ownerName},</h2>
        
        <div style="background: white; border-left: 4px solid ${
          notification.urgency === 'critical' ? '#ef4444' : 
          notification.urgency === 'high' ? '#f59e0b' : 
          '#3b82f6'
        }; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #1f2937;">
            ${urgencyEmoji[notification.urgency]} ${notification.treatmentName} - ${notification.petName}
          </h3>
          <p style="font-size: 18px; color: #4b5563; margin: 10px 0;">
            <strong>${daysText.toUpperCase()}</strong>
          </p>
          <p style="color: #6b7280; margin: 5px 0;">
            📅 Última aplicación: ${notification.lastDate.toLocaleDateString('es-ES')}
          </p>
          <p style="color: #6b7280; margin: 5px 0;">
            📅 Próxima aplicación: ${notification.nextDate.toLocaleDateString('es-ES')}
          </p>
        </div>
        
        <p style="color: #4b5563; line-height: 1.6;">
          Mantener el calendario de vacunación y tratamientos preventivos al día es esencial para la salud de ${notification.petName}.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://smartpet.com/citas" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            📅 Agendar Cita Ahora
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          La salud de su mascota es nuestra prioridad. Si tiene alguna pregunta, no dude en contactarnos.
        </p>
      </div>
      
      <div style="background: #1f2937; padding: 20px; text-align: center;">
        <p style="color: #9ca3af; margin: 0; font-size: 14px;">
          © 2024 SmartPet - Sistema de Gestión para Peluquerías Móviles
        </p>
      </div>
    </div>
  `;
}
