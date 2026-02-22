export interface Notification {
  id: number;
  type: 'appointment' | 'payment' | 'system' | 'inventory' | 'vehicle' | 'client' | 'staff' | 'medical' | 'financial' | 'audit';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  client?: string;
  relatedModule?: string;
  relatedId?: string;
  data?: any;
}

export const initialNotifications: Notification[] = [
  // CITAS
  {
    id: 1,
    type: 'appointment',
    priority: 'high',
    category: 'Confirmación',
    title: 'Cita Confirmada',
    message: 'María González confirmó su cita para mañana 09:00 - Golden Retriever',
    timestamp: new Date().toISOString(),
    read: false,
    actionRequired: false,
    client: 'María González',
    relatedModule: 'appointments',
    relatedId: 'APP-2024-001'
  },
  {
    id: 2,
    type: 'appointment',
    priority: 'critical',
    category: 'Recordatorio',
    title: '⏰ Cita en 1 hora',
    message: 'Próxima cita: Carlos Pérez - 10:00 AM - Baño + Corte - Vehículo 1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    actionRequired: true,
    client: 'Carlos Pérez',
    relatedModule: 'appointments',
    relatedId: 'APP-2024-002'
  },
  {
    id: 3,
    type: 'appointment',
    priority: 'medium',
    category: 'Cancelación',
    title: 'Cita Cancelada',
    message: 'Luis Martínez canceló su cita del 15/12 a las 14:00. Motivo: Viaje inesperado',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    actionRequired: true,
    client: 'Luis Martínez',
    relatedModule: 'appointments',
    relatedId: 'APP-2024-003',
    data: { cancelReason: 'Viaje', canRebook: true }
  },

  // PAGOS
  {
    id: 4,
    type: 'payment',
    priority: 'high',
    category: 'Pago Recibido',
    title: '💰 Pago Confirmado',
    message: 'Pago de S/ 175.50 procesado exitosamente - Factura #FAC-2024-00123',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    actionRequired: false,
    client: 'María González',
    relatedModule: 'payments',
    relatedId: 'PAY-2024-001'
  },
  {
    id: 5,
    type: 'payment',
    priority: 'critical',
    category: 'Pago Fallido',
    title: '❌ Error en Pago',
    message: 'Falló el pago de S/ 220.00 con tarjeta **** 4532. Fondos insuficientes.',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    read: false,
    actionRequired: true,
    client: 'Ana Torres',
    relatedModule: 'payments',
    relatedId: 'PAY-2024-002',
    data: { errorCode: 'insufficient_funds', retryable: true }
  },
  {
    id: 6,
    type: 'financial',
    priority: 'high',
    category: 'Factura Vencida',
    title: '⚠️ Cuenta por Cobrar Vencida',
    message: 'Factura #FAC-2024-00098 con 15 días de vencimiento - S/ 420.00',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: false,
    actionRequired: true,
    client: 'Roberto Silva',
    relatedModule: 'invoicing',
    relatedId: 'INV-2024-098'
  },

  // INVENTARIO
  {
    id: 7,
    type: 'inventory',
    priority: 'critical',
    category: 'Stock Crítico',
    title: '🚨 Stock Bajo - URGENTE',
    message: 'Shampoo Medicinal: Solo 2 unidades. Mínimo: 10 unidades.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    actionRequired: true,
    relatedModule: 'products',
    relatedId: 'PROD-SH001',
    data: { currentStock: 2, minStock: 10, suggested: 'Ordenar 20 unidades' }
  },
  {
    id: 8,
    type: 'inventory',
    priority: 'high',
    category: 'Stock Bajo',
    title: '⚠️ Productos por Agotarse',
    message: '3 productos bajo mínimo: Collar Antipulgas (5), Cepillo Premium (3), Tijeras Prof. (2)',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    actionRequired: true,
    relatedModule: 'products',
    relatedId: 'multiple'
  },

  // VEHÍCULOS
  {
    id: 9,
    type: 'vehicle',
    priority: 'critical',
    category: 'Mantenimiento',
    title: '🚗 Mantenimiento Vencido',
    message: 'Vehículo "Groomer Pro Max" ABC-123: Revisión técnica vencida hace 5 días',
    timestamp: new Date(Date.now() - 432000000).toISOString(),
    read: false,
    actionRequired: true,
    relatedModule: 'vehicles',
    relatedId: 'VEH-001',
    data: { daysOverdue: 5, type: 'Revisión Técnica', cost: 150 }
  },
  {
    id: 10,
    type: 'vehicle',
    priority: 'medium',
    category: 'Kilometraje',
    title: 'Próximo Mantenimiento',
    message: 'Vehículo XYZ-789 alcanzó 48,500 km. Mantenimiento preventivo en 1,500 km',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    read: true,
    actionRequired: false,
    relatedModule: 'vehicles',
    relatedId: 'VEH-002'
  },

  // CLIENTES
  {
    id: 11,
    type: 'client',
    priority: 'low',
    category: 'Cumpleaños',
    title: '🎂 Cumpleaños de Mascota',
    message: 'Max (Golden Retriever) cumple 4 años mañana. Enviar promoción especial.',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    read: true,
    actionRequired: false,
    client: 'María González',
    relatedModule: 'clients',
    relatedId: 'PET-001'
  },
  {
    id: 12,
    type: 'client',
    priority: 'medium',
    category: 'Inactividad',
    title: '😴 Cliente Inactivo',
    message: 'Pedro Ramírez sin citas hace 90 días. Última cita: 15/09/2024',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    read: false,
    actionRequired: true,
    client: 'Pedro Ramírez',
    relatedModule: 'clients',
    relatedId: 'CLI-089',
    data: { lastAppointment: '2024-09-15', totalSpent: 850, suggestedAction: 'Enviar promoción' }
  },
  {
    id: 13,
    type: 'client',
    priority: 'low',
    category: 'Reseña',
    title: '⭐ Nueva Reseña 5 Estrellas',
    message: 'Laura Sánchez dejó una reseña: "Excelente servicio, mi perro quedó hermoso!"',
    timestamp: new Date(Date.now() - 54000000).toISOString(),
    read: true,
    actionRequired: false,
    client: 'Laura Sánchez',
    relatedModule: 'clients',
    relatedId: 'REV-045'
  },

  // PERSONAL
  {
    id: 14,
    type: 'staff',
    priority: 'high',
    category: 'Ausencia',
    title: '🏥 Empleado Reportó Ausencia',
    message: 'Ana Ruiz no asistirá mañana (gripe). 6 citas afectadas. Reasignar urgente.',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    read: false,
    actionRequired: true,
    relatedModule: 'staff',
    relatedId: 'EMP-003',
    data: { affectedAppointments: 6, needsReplacement: true }
  },
  {
    id: 15,
    type: 'staff',
    priority: 'low',
    category: 'Rendimiento',
    title: '🏆 Empleado del Mes',
    message: 'Juan López alcanzó 95% de satisfacción con 78 servicios. ¡Felicítalo!',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    actionRequired: false,
    relatedModule: 'staff',
    relatedId: 'EMP-001'
  },

  // MÉDICO
  {
    id: 16,
    type: 'medical',
    priority: 'high',
    category: 'Vacuna Próxima',
    title: '💉 Vacuna Próxima a Vencer',
    message: 'Luna (Gato Persa) necesita refuerzo de rabia en 5 días. Notificar cliente.',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    read: false,
    actionRequired: true,
    client: 'Carmen Díaz',
    relatedModule: 'medical',
    relatedId: 'VAC-234',
    data: { petName: 'Luna', vaccineType: 'Rabia', dueDate: '2024-12-08' }
  },
  {
    id: 17,
    type: 'medical',
    priority: 'medium',
    category: 'Desparasitación',
    title: 'Recordatorio Desparasitación',
    message: '15 mascotas requieren desparasitación este mes',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    actionRequired: false,
    relatedModule: 'medical',
    relatedId: 'multiple'
  },

  // SISTEMA Y AUDITORÍA
  {
    id: 18,
    type: 'audit',
    priority: 'high',
    category: 'Datos Duplicados',
    title: '🔍 Clientes Duplicados Detectados',
    message: 'Se encontraron 3 posibles clientes duplicados. Revisar y fusionar.',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    read: false,
    actionRequired: true,
    relatedModule: 'clients',
    data: { duplicates: 3, type: 'email y teléfono' }
  },
  {
    id: 19,
    type: 'audit',
    priority: 'medium',
    category: 'Emails Inválidos',
    title: '📧 Emails con Errores',
    message: '8 clientes tienen emails con formato inválido o dominios inexistentes',
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    read: false,
    actionRequired: true,
    relatedModule: 'clients',
    data: { invalidEmails: 8 }
  },
  {
    id: 20,
    type: 'system',
    priority: 'low',
    category: 'Backup',
    title: '✅ Backup Exitoso',
    message: 'Respaldo automático completado: 2.3 GB - Base de datos + archivos',
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    read: true,
    actionRequired: false,
    relatedModule: 'settings'
  },
  {
    id: 21,
    type: 'financial',
    priority: 'critical',
    category: 'Expansión',
    title: '🚀 Oportunidad de Expansión',
    message: 'Ocupación proyectada 94%. Sistema recomienda adquirir 3er vehículo. ROI: 30.8%',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    actionRequired: true,
    relatedModule: 'accounting',
    data: { projectedROI: 30.8, breakEven: 6 }
  }
];
