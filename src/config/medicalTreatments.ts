// Configuración de tratamientos médicos veterinarios
// Basado en estándares veterinarios internacionales

export interface TreatmentSchedule {
  ageFrom: number; // en meses
  ageTo: number; // en meses
  frequencyDays: number;
  description: string;
}

export interface TreatmentConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'vaccine' | 'deworming' | 'flea' | 'other';
  description: string;
  schedules: TreatmentSchedule[];
  defaultCost: number;
  mandatory: boolean;
}

export const MEDICAL_TREATMENTS: TreatmentConfig[] = [
  // ===== VACUNAS =====
  {
    id: 'vaccine-multiple-1',
    name: 'Vacuna Polivalente (1ra Dosis)',
    icon: '💉',
    color: 'blue',
    category: 'vaccine',
    description: 'Primera dosis de vacuna múltiple contra Parvovirus, Distemper, Hepatitis, Leptospirosis',
    schedules: [
      {
        ageFrom: 1.5, // 6 semanas
        ageTo: 2, // 8 semanas
        frequencyDays: 0, // Una sola vez
        description: 'Aplicar entre las 6-8 semanas de vida'
      }
    ],
    defaultCost: 45.00,
    mandatory: true
  },
  {
    id: 'vaccine-multiple-2',
    name: 'Vacuna Polivalente (2da Dosis)',
    icon: '💉',
    color: 'blue',
    category: 'vaccine',
    description: 'Segunda dosis de refuerzo de vacuna múltiple',
    schedules: [
      {
        ageFrom: 2.25, // 9 semanas
        ageTo: 2.75, // 11 semanas
        frequencyDays: 0,
        description: 'Aplicar 3-4 semanas después de la primera dosis'
      }
    ],
    defaultCost: 45.00,
    mandatory: true
  },
  {
    id: 'vaccine-multiple-3',
    name: 'Vacuna Polivalente (3ra Dosis)',
    icon: '💉',
    color: 'blue',
    category: 'vaccine',
    description: 'Tercera y última dosis del esquema de cachorros',
    schedules: [
      {
        ageFrom: 3, // 12 semanas
        ageTo: 3.5, // 14 semanas
        frequencyDays: 0,
        description: 'Aplicar 3-4 semanas después de la segunda dosis'
      }
    ],
    defaultCost: 45.00,
    mandatory: true
  },
  {
    id: 'vaccine-rabies',
    name: 'Vacuna Antirrábica',
    icon: '🦠',
    color: 'red',
    category: 'vaccine',
    description: 'Vacuna obligatoria contra la rabia',
    schedules: [
      {
        ageFrom: 4, // 16 semanas
        ageTo: 5, // 20 semanas
        frequencyDays: 0,
        description: 'Primera aplicación a las 16 semanas'
      },
      {
        ageFrom: 5, // >5 meses
        ageTo: 999,
        frequencyDays: 365, // Anual
        description: 'Refuerzo anual obligatorio'
      }
    ],
    defaultCost: 35.00,
    mandatory: true
  },
  {
    id: 'vaccine-multiple-annual',
    name: 'Vacuna Polivalente Anual',
    icon: '💉',
    color: 'blue',
    category: 'vaccine',
    description: 'Refuerzo anual de vacuna múltiple para adultos',
    schedules: [
      {
        ageFrom: 12, // >12 meses
        ageTo: 999,
        frequencyDays: 365, // Anual
        description: 'Refuerzo anual después del año de vida'
      }
    ],
    defaultCost: 50.00,
    mandatory: true
  },
  {
    id: 'vaccine-kennel-cough',
    name: 'Vacuna Tos de las Perreras',
    icon: '🫁',
    color: 'cyan',
    category: 'vaccine',
    description: 'Vacuna contra Bordetella (Tos de las perreras)',
    schedules: [
      {
        ageFrom: 3, // 12 semanas
        ageTo: 999,
        frequencyDays: 365, // Anual
        description: 'Recomendada para perros que socializan (guarderías, parques)'
      }
    ],
    defaultCost: 40.00,
    mandatory: false
  },
  {
    id: 'vaccine-leptospirosis',
    name: 'Vacuna Leptospirosis',
    icon: '💧',
    color: 'teal',
    category: 'vaccine',
    description: 'Vacuna contra Leptospirosis',
    schedules: [
      {
        ageFrom: 3, // 12 semanas
        ageTo: 999,
        frequencyDays: 365, // Anual
        description: 'Recomendada en zonas húmedas o con presencia de roedores'
      }
    ],
    defaultCost: 38.00,
    mandatory: false
  },

  // ===== DESPARASITACIÓN =====
  {
    id: 'deworming-puppy-biweekly',
    name: 'Desparasitación Cachorro (Quincenal)',
    icon: '🐛',
    color: 'orange',
    category: 'deworming',
    description: 'Desparasitación interna cada 15 días para cachorros',
    schedules: [
      {
        ageFrom: 0.5, // 2 semanas
        ageTo: 3, // 3 meses
        frequencyDays: 15, // Cada 15 días
        description: 'Desde las 2 semanas hasta los 3 meses de vida'
      }
    ],
    defaultCost: 12.00,
    mandatory: true
  },
  {
    id: 'deworming-puppy-monthly',
    name: 'Desparasitación Cachorro (Mensual)',
    icon: '🐛',
    color: 'orange',
    category: 'deworming',
    description: 'Desparasitación interna mensual para cachorros jóvenes',
    schedules: [
      {
        ageFrom: 3, // 3 meses
        ageTo: 6, // 6 meses
        frequencyDays: 30, // Mensual
        description: 'De 3 a 6 meses de vida'
      }
    ],
    defaultCost: 15.00,
    mandatory: true
  },
  {
    id: 'deworming-adult',
    name: 'Desparasitación Adulto (Trimestral)',
    icon: '🐛',
    color: 'orange',
    category: 'deworming',
    description: 'Desparasitación interna cada 3 meses para adultos',
    schedules: [
      {
        ageFrom: 6, // >6 meses
        ageTo: 999,
        frequencyDays: 90, // Cada 3 meses
        description: 'A partir de los 6 meses de vida'
      }
    ],
    defaultCost: 18.00,
    mandatory: true
  },

  // ===== ANTIPULGAS Y ANTIPARASITARIOS EXTERNOS =====
  {
    id: 'flea-monthly',
    name: 'Antipulgas/Garrapatas Mensual',
    icon: '🦟',
    color: 'green',
    category: 'flea',
    description: 'Tratamiento mensual contra pulgas, garrapatas y parásitos externos',
    schedules: [
      {
        ageFrom: 2, // 8 semanas
        ageTo: 999,
        frequencyDays: 30, // Mensual
        description: 'Aplicar cada 30 días durante todo el año'
      }
    ],
    defaultCost: 28.00,
    mandatory: true
  },
  {
    id: 'flea-quarterly',
    name: 'Antipulgas Trimestral (NexGard, Bravecto)',
    icon: '🦟',
    color: 'green',
    category: 'flea',
    description: 'Tratamiento de larga duración (3 meses)',
    schedules: [
      {
        ageFrom: 2, // 8 semanas
        ageTo: 999,
        frequencyDays: 90, // Cada 3 meses
        description: 'Productos de acción prolongada como Bravecto'
      }
    ],
    defaultCost: 65.00,
    mandatory: true
  },
  {
    id: 'flea-collar',
    name: 'Collar Antiparasitario (Seresto)',
    icon: '⭕',
    color: 'purple',
    category: 'flea',
    description: 'Collar de protección continua hasta 8 meses',
    schedules: [
      {
        ageFrom: 2, // 8 semanas
        ageTo: 999,
        frequencyDays: 240, // 8 meses
        description: 'Reemplazar cada 8 meses'
      }
    ],
    defaultCost: 95.00,
    mandatory: false
  }
];

// Función para calcular el próximo tratamiento basado en edad y último tratamiento
export function calculateNextTreatment(
  treatmentId: string,
  lastTreatmentDate: Date,
  petBirthDate: Date
): Date | null {
  const treatment = MEDICAL_TREATMENTS.find(t => t.id === treatmentId);
  if (!treatment) return null;

  const petAgeInMonths = (new Date().getTime() - petBirthDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000);

  // Encontrar el schedule apropiado para la edad actual
  const applicableSchedule = treatment.schedules.find(
    s => petAgeInMonths >= s.ageFrom && petAgeInMonths < s.ageTo
  );

  if (!applicableSchedule || applicableSchedule.frequencyDays === 0) return null;

  const nextDate = new Date(lastTreatmentDate);
  nextDate.setDate(nextDate.getDate() + applicableSchedule.frequencyDays);

  return nextDate;
}

// Función para obtener el schedule recomendado para una edad específica
export function getRecommendedSchedule(
  treatmentId: string,
  petAgeInMonths: number
): TreatmentSchedule | null {
  const treatment = MEDICAL_TREATMENTS.find(t => t.id === treatmentId);
  if (!treatment) return null;

  return treatment.schedules.find(
    s => petAgeInMonths >= s.ageFrom && petAgeInMonths < s.ageTo
  ) || null;
}

// Función para obtener todos los tratamientos recomendados para una edad
export function getRecommendedTreatmentsForAge(petAgeInMonths: number) {
  return MEDICAL_TREATMENTS.filter(treatment => {
    const hasApplicableSchedule = treatment.schedules.some(
      s => petAgeInMonths >= s.ageFrom && petAgeInMonths < s.ageTo
    );
    return hasApplicableSchedule;
  });
}
