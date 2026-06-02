export type PreventiveCategory = 'vaccine' | 'deworming' | 'flea';

export type PreventiveStatus = 'applied' | 'upcoming' | 'overdue' | 'pending';

export interface PreventiveStageItem {
  id: string;
  type: PreventiveCategory;
  title: string;
  expectedDate: string | null;
  status: PreventiveStatus;
  matchedEventId?: string | number;
}

export interface PreventiveStage {
  id: string;
  ageLabel: string;
  rangeLabel?: string;
  title: string;
  items: PreventiveStageItem[];
  status: PreventiveStatus;
}

export interface PreventiveEvent {
  id: string | number;
  name: string;
  date: string;
  nextDue: string | null;
  vet: string;
  type: PreventiveCategory;
  status: PreventiveStatus;
  ageLabel?: string;
  isProtocol?: boolean;
}

export interface LifeLineMilestone {
  id: string;
  ageLabel: string;
  title: string;
  type: PreventiveCategory;
  status: PreventiveStatus;
  expectedDate: string | null;
}

const MS_DAY = 24 * 60 * 60 * 1000;

export function toDateOnly(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addWeeks(base: Date, weeks: number): string {
  return addDays(base, weeks * 7);
}

function addMonths(base: Date, months: number): string {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function resolvePreventiveStatus(
  appliedDate: string | null | undefined,
  nextDue: string | null | undefined,
  options?: { treatMissingNextAsPending?: boolean }
): PreventiveStatus {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const next = toDateOnly(nextDue);
  const applied = toDateOnly(appliedDate);

  if (next) {
    const diff = Math.ceil((next.getTime() - today.getTime()) / MS_DAY);
    if (diff < 0) return 'overdue';
    if (diff <= 30) return 'upcoming';
    if (applied) return 'applied';
    return 'upcoming';
  }

  if (applied) return 'applied';
  return options?.treatMissingNextAsPending ? 'pending' : 'upcoming';
}

function computeExpectedStatus(expectedDate: string | null): PreventiveStatus {
  if (!expectedDate) return 'pending';
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const exp = toDateOnly(expectedDate);
  if (!exp) return 'pending';
  const diff = Math.ceil((exp.getTime() - today.getTime()) / MS_DAY);
  if (diff < 0) return 'overdue';
  if (diff <= 30) return 'upcoming';
  return 'pending';
}

function matchAppliedEvent(
  expectedDate: string | null,
  type: PreventiveCategory,
  events: PreventiveEvent[]
): PreventiveEvent | null {
  if (!expectedDate) return null;
  const exp = toDateOnly(expectedDate);
  if (!exp) return null;
  const applied = events.filter((e) => e.type === type && e.status === 'applied');
  return (
    applied.find((e) => {
      const d = toDateOnly(e.date);
      if (!d) return false;
      const diffDays = Math.abs((d.getTime() - exp.getTime()) / MS_DAY);
      return diffDays <= 45; // tolerancia por reprogramaciones
    }) || null
  );
}

function aggregateStageStatus(items: PreventiveStageItem[]): PreventiveStatus {
  if (items.some((i) => i.status === 'overdue')) return 'overdue';
  if (items.some((i) => i.status === 'upcoming')) return 'upcoming';
  if (items.length && items.every((i) => i.status === 'applied')) return 'applied';
  return 'pending';
}

/**
 * Línea de vida preventiva dentro del "Historial aplicado".
 *
 * Basado en guías clínicas ampliamente usadas (AAHA / WSAVA) para:
 * - DHPP/DAPP: 6–8, 10–12, 14–16 semanas; refuerzo al año; luego cada 3 años.
 * - Rabia: 12–16 semanas; refuerzo al año; luego cada 1–3 años (ley local/vacuna).
 * - Desparasitación: 2,4,6,8 semanas; cada 2 semanas hasta 16 semanas; mensual hasta 6 meses; luego cada 3 meses.
 * - Antipulgas/garrapatas: mensual todo el año (desde ~8 semanas según producto).
 */
export function buildPreventiveLifeStages(input: {
  birthDate?: string | null;
  events: PreventiveEvent[];
}): PreventiveStage[] {
  const birth = toDateOnly(input.birthDate);
  if (!birth) return [];

  const stage = (
    id: string,
    ageLabel: string,
    title: string,
    items: Array<Omit<PreventiveStageItem, 'status'>>
  ): PreventiveStage => {
    const resolved: PreventiveStageItem[] = items.map((it) => {
      const matched = matchAppliedEvent(it.expectedDate, it.type, input.events);
      const status = matched ? 'applied' : computeExpectedStatus(it.expectedDate);
      return { ...it, status, matchedEventId: matched?.id };
    });
    return {
      id,
      ageLabel,
      title,
      items: resolved,
      status: aggregateStageStatus(resolved),
    };
  };

  const stages: PreventiveStage[] = [
    stage('s-2w', '2 sem', 'Inicio de desparasitación', [
      { id: 'dw-2w', type: 'deworming', title: 'Desparasitación (2 semanas)', expectedDate: addWeeks(birth, 2) },
    ]),
    stage('s-4w', '4 sem', 'Desparasitación', [
      { id: 'dw-4w', type: 'deworming', title: 'Desparasitación (4 semanas)', expectedDate: addWeeks(birth, 4) },
    ]),
    stage('s-6-8w', '6-8 sem', 'Primera protección (cachorro)', [
      { id: 'v-dhpp-1', type: 'vaccine', title: 'DHPP/DAPP (1ra dosis)', expectedDate: addWeeks(birth, 7) },
      { id: 'dw-6w', type: 'deworming', title: 'Desparasitación (6 semanas)', expectedDate: addWeeks(birth, 6) },
      { id: 'flea-start', type: 'flea', title: 'Iniciar antipulgas mensual', expectedDate: addWeeks(birth, 8) },
    ]),
    stage('s-8w', '8 sem', 'Desparasitación', [
      { id: 'dw-8w', type: 'deworming', title: 'Desparasitación (8 semanas)', expectedDate: addWeeks(birth, 8) },
    ]),
    stage('s-10-12w', '10-12 sem', 'Serie de vacunas', [
      { id: 'v-dhpp-2', type: 'vaccine', title: 'DHPP/DAPP (2da dosis)', expectedDate: addWeeks(birth, 11) },
      { id: 'dw-10w', type: 'deworming', title: 'Desparasitación (10 semanas)', expectedDate: addWeeks(birth, 10) },
      { id: 'flea-2', type: 'flea', title: 'Antipulgas mensual', expectedDate: addWeeks(birth, 12) },
    ]),
    stage('s-12-16w', '12-16 sem', 'Cierre del esquema cachorro', [
      { id: 'v-dhpp-3', type: 'vaccine', title: 'DHPP/DAPP (3ra dosis)', expectedDate: addWeeks(birth, 15) },
      { id: 'v-rabies-1', type: 'vaccine', title: 'Rabia (1ra dosis)', expectedDate: addWeeks(birth, 14) },
      { id: 'dw-12w', type: 'deworming', title: 'Desparasitación (12 semanas)', expectedDate: addWeeks(birth, 12) },
      { id: 'dw-14w', type: 'deworming', title: 'Desparasitación (14 semanas)', expectedDate: addWeeks(birth, 14) },
      { id: 'dw-16w', type: 'deworming', title: 'Desparasitación (16 semanas)', expectedDate: addWeeks(birth, 16) },
      { id: 'flea-3', type: 'flea', title: 'Antipulgas mensual', expectedDate: addWeeks(birth, 16) },
    ]),
    stage('s-4-6m', '4-6 мес', 'Transición a mantenimiento', [
      { id: 'dw-monthly-5m', type: 'deworming', title: 'Desparasitación mensual (hasta 6 meses)', expectedDate: addMonths(birth, 5) },
      { id: 'flea-6m', type: 'flea', title: 'Antipulgas mensual', expectedDate: addMonths(birth, 6) },
    ]),
    stage('s-12m', '1 año', 'Primer refuerzo anual', [
      { id: 'v-dhpp-1y', type: 'vaccine', title: 'Refuerzo DHPP/DAPP (1 año)', expectedDate: addMonths(birth, 12) },
      { id: 'v-rabies-1y', type: 'vaccine', title: 'Refuerzo Rabia (1 año)', expectedDate: addMonths(birth, 12) },
      { id: 'dw-1y', type: 'deworming', title: 'Desparasitación (trimestral)', expectedDate: addMonths(birth, 12) },
      { id: 'flea-1y', type: 'flea', title: 'Antipulgas mensual', expectedDate: addMonths(birth, 12) },
    ]),
    stage('s-2y', '2 años', 'Mantenimiento', [
      { id: 'dw-2y', type: 'deworming', title: 'Desparasitación (trimestral)', expectedDate: addMonths(birth, 24) },
      { id: 'flea-2y', type: 'flea', title: 'Antipulgas mensual', expectedDate: addMonths(birth, 24) },
    ]),
    stage('s-3y', '3 años', 'Refuerzo trianual (según esquema)', [
      { id: 'v-dhpp-3y', type: 'vaccine', title: 'Refuerzo DHPP/DAPP (cada 3 años)', expectedDate: addMonths(birth, 36) },
      { id: 'dw-3y', type: 'deworming', title: 'Desparasitación (trimestral)', expectedDate: addMonths(birth, 36) },
      { id: 'flea-3y', type: 'flea', title: 'Antipulgas mensual', expectedDate: addMonths(birth, 36) },
    ]),
    stage('s-7y', '7 años', 'Etapa senior (control anual)', [
      { id: 'v-dhpp-6y', type: 'vaccine', title: 'Revisar refuerzo DHPP/DAPP (3 años)', expectedDate: addMonths(birth, 72) },
      { id: 'dw-7y', type: 'deworming', title: 'Desparasitación (trimestral)', expectedDate: addMonths(birth, 84) },
      { id: 'flea-7y', type: 'flea', title: 'Antipulgas mensual', expectedDate: addMonths(birth, 84) },
    ]),
  ];

  return stages;
}

export function buildProtocolMilestones(birthDate?: string | null): LifeLineMilestone[] {
  const birth = toDateOnly(birthDate);
  const addWeeks = (weeks: number) => {
    if (!birth) return null;
    const d = new Date(birth);
    d.setDate(d.getDate() + weeks * 7);
    return d.toISOString().slice(0, 10);
  };
  const addMonths = (months: number) => {
    if (!birth) return null;
    const d = new Date(birth);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  };

  const rows: Omit<LifeLineMilestone, 'status'>[] = [
    { id: 'p1', ageLabel: '6-8 sem', title: 'Vacuna múltiple (1ra)', type: 'vaccine', expectedDate: addWeeks(7) },
    { id: 'p2', ageLabel: '9-11 sem', title: 'Vacuna múltiple (2da)', type: 'vaccine', expectedDate: addWeeks(10) },
    { id: 'p3', ageLabel: '12-14 sem', title: 'Vacuna múltiple (3ra)', type: 'vaccine', expectedDate: addWeeks(13) },
    { id: 'p4', ageLabel: '15-16 sem', title: 'Vacuna antirrábica', type: 'vaccine', expectedDate: addWeeks(15) },
    { id: 'p5', ageLabel: '2 meses', title: 'Desparasitación interna', type: 'deworming', expectedDate: addMonths(2) },
    { id: 'p6', ageLabel: '4 meses', title: 'Desparasitación refuerzo', type: 'deworming', expectedDate: addMonths(4) },
    { id: 'p7', ageLabel: '2 meses', title: 'Antipulgas / antiparasitario', type: 'flea', expectedDate: addMonths(2) },
    { id: 'p8', ageLabel: '1 año', title: 'Vacuna anual', type: 'vaccine', expectedDate: addMonths(12) },
    { id: 'p9', ageLabel: '2 años', title: 'Vacuna anual refuerzo', type: 'vaccine', expectedDate: addMonths(24) },
  ];

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return rows.map((row) => {
    const expected = toDateOnly(row.expectedDate);
    let status: PreventiveStatus = 'pending';
    if (expected) {
      const diff = Math.ceil((expected.getTime() - today.getTime()) / MS_DAY);
      if (diff < -14) status = 'overdue';
      else if (diff <= 30) status = 'upcoming';
      else status = 'pending';
    }
    return { ...row, status };
  });
}

export function matchMilestoneStatus(
  milestones: LifeLineMilestone[],
  events: PreventiveEvent[]
): LifeLineMilestone[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return milestones.map((m) => {
    const sameType = events.filter((e) => e.type === m.type && e.status === 'applied');
    const matched = sameType.find((e) => {
      const d = toDateOnly(e.date);
      const exp = toDateOnly(m.expectedDate);
      if (!d || !exp) return false;
      const diffDays = Math.abs((d.getTime() - exp.getTime()) / MS_DAY);
      return diffDays <= 45;
    });
    if (matched) return { ...m, status: 'applied' as PreventiveStatus };

    const exp = toDateOnly(m.expectedDate);
    if (!exp) return m;
    const diff = Math.ceil((exp.getTime() - today.getTime()) / MS_DAY);
    if (diff < 0) return { ...m, status: 'overdue' as PreventiveStatus };
    if (diff <= 30) return { ...m, status: 'upcoming' as PreventiveStatus };
    return m;
  });
}

export function buildPreventiveEvents(input: {
  timeline: any[];
  petData: any;
  fallback: PreventiveEvent[];
}): PreventiveEvent[] {
  const { timeline, petData, fallback } = input;
  const events: PreventiveEvent[] = [];

  timeline.forEach((event: any, idx: number) => {
    if (event.type === 'vaccine') {
      events.push({
        id: event.id || `v-${idx}`,
        name: event.title || event.event_type || 'Vacuna',
        date: event.occurred_at || '',
        nextDue: event.next_due_date || null,
        vet: event.veterinarian || 'Equipo médico',
        type: 'vaccine',
        status: resolvePreventiveStatus(event.occurred_at, event.next_due_date),
      });
      return;
    }
    if (event.type !== 'medical_record') return;
    const eventType = String(event.event_type || event.title || '').toLowerCase();
    let type: PreventiveCategory | null = null;
    if (eventType.includes('vacun')) type = 'vaccine';
    else if (eventType.includes('desparasit')) type = 'deworming';
    else if (eventType.includes('antipulgas') || eventType.includes('pulga') || eventType.includes('antiparasit')) type = 'flea';
    if (!type) return;

    events.push({
      id: event.id || `m-${idx}`,
      name: event.title || event.event_type || 'Registro preventivo',
      date: event.occurred_at || '',
      nextDue: null,
      vet: 'Equipo médico',
      type,
      status: 'applied',
    });
  });

  const pushScheduled = (
    type: PreventiveCategory,
    name: string,
    last: string | null | undefined,
    next: string | null | undefined
  ) => {
    if (!last && !next) return;
    const status = resolvePreventiveStatus(last, next, { treatMissingNextAsPending: true });
    if (status === 'applied' && events.some((e) => e.type === type && e.date === last)) return;
    events.push({
      id: `pet-${type}-${last || next}`,
      name,
      date: last || next || '',
      nextDue: next || null,
      vet: 'Programado en ficha',
      type,
      status,
    });
  };

  pushScheduled(
    'vaccine',
    'Vacunación (ficha mascota)',
    petData?.last_vaccination_date,
    petData?.next_vaccination_date
  );
  pushScheduled(
    'deworming',
    'Desparasitación (ficha mascota)',
    petData?.last_deworming_date,
    petData?.next_deworming_date
  );

  if (!events.length) return fallback;

  return events
    .filter((e) => e.date)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const STATUS_LABELS: Record<PreventiveStatus, string> = {
  applied: 'Aplicado',
  upcoming: 'Próximo',
  overdue: 'Atrasado',
  pending: 'Pendiente',
};

export const STATUS_DOT_CLASS: Record<PreventiveStatus, string> = {
  applied: 'bg-green-500 border-green-500',
  upcoming: 'bg-orange-400 border-orange-400',
  overdue: 'bg-red-500 border-red-500',
  pending: 'bg-white border-slate-400',
};

export const STATUS_BADGE_CLASS: Record<PreventiveStatus, string> = {
  applied: 'bg-green-50 text-green-700 border-green-200',
  upcoming: 'bg-orange-50 text-orange-700 border-orange-200',
  overdue: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-slate-50 text-slate-600 border-slate-200',
};
