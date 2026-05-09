/**
 * Parsea la fecha de una cita como fecha local (evita desfase por UTC).
 * Acepta "yyyy-MM-dd" o ISO (ej. "2026-02-02T05:00:00.000Z").
 */
export function parseAppointmentDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);
  if (dateStr.includes('T')) {
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  // Aceptar "YYYY-MM-DD" y tolerar año con más dígitos (recortar a 4)
  const [yRaw, mRaw, dRaw] = dateStr.split('-');
  const y = Number((yRaw || '').slice(0, 4));
  const m = Number(mRaw);
  const d = Number(dRaw);
  if (isNaN(y)) return new Date(NaN);
  return new Date(y, (m || 1) - 1, d || 1);
}

/**
 * Formatea la hora de una cita para mostrar (siempre "HH:mm").
 * Acepta "09:00", "09:00:00" o ISO "2026-02-01T14:00:00.000Z".
 */
export function formatAppointmentTimeForDisplay(timeStr: string): string {
  if (!timeStr || typeof timeStr !== 'string') return '--:--';
  const t = timeStr.trim();
  if (t.includes('T')) {
    const d = new Date(t);
    const h = d.getHours();
    const m = d.getMinutes();
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
  const part = t.slice(0, 5);
  return part.length >= 5 ? part : '--:--';
}

/**
 * Devuelve la fecha de la cita en formato YYYY-MM-DD para comparar con filtros.
 * Acepta "yyyy-MM-dd" o ISO.
 */
export function getAppointmentDateOnly(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const base = dateStr.includes('T') ? dateStr.slice(0, 10) : dateStr.slice(0, 10);
  // Si vino con año > 4 dígitos: "YYYYY-.." → "YYYY-.."
  const m = base.match(/^(\d{4})\d+-\d{2}-\d{2}$/);
  return m ? `${m[1]}-${base.slice(base.indexOf('-') + 1)}` : base;
}

/**
 * Devuelve hora y minuto de la cita para posicionar en vistas por hora.
 * Acepta "09:00", "09:00:00" o ISO.
 */
export function getAppointmentTimeParts(timeStr: string): { hour: number; minute: number } {
  if (!timeStr || typeof timeStr !== 'string') return { hour: 9, minute: 0 };
  const t = timeStr.trim();
  if (t.includes('T')) {
    const d = new Date(t);
    return { hour: d.getHours(), minute: d.getMinutes() };
  }
  const [h, m] = t.split(':').map(Number);
  return { hour: isNaN(h) ? 9 : h, minute: isNaN(m) ? 0 : m };
}
