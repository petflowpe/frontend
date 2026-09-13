/** Utilidades de formato numérico (locale es-PE, moneda soles). */

export function round2(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

/** Convierte texto de input (admite coma decimal) a número. */
export function parseDecimal(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value == null) return 0;
  const normalized = String(value).trim().replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumberEs(value: number, decimals = 2): string {
  return (Number(value) || 0).toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** `S/ 1.234,50` con el separador local de es-PE. */
export function formatCurrencyEs(value: number, symbol = 'S/'): string {
  return `${symbol} ${formatNumberEs(value)}`;
}
