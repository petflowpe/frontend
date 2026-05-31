/** Primer segmento del permiso → etiqueta legible (es), para “Módulos con acceso”. */
const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  alerts: 'Alertas',
  analytics: 'Analítica',
  finance: 'Finanzas',
  treasury: 'Tesorería',
  transactions: 'Transacciones',
  cash_flow: 'Flujo de Caja',
  income_statement: 'Estado de Resultados',
  fees: 'Honorarios',
  accounts_payable: 'Cuentas por Pagar',
  petty_cash: 'Caja Chica',
  purchases: 'Compras',
  requirements: 'Requerimientos',
  suppliers: 'Proveedores',
  accounting: 'Contabilidad',
  reports: 'Reportes',
  audit: 'Auditoría',
  users: 'Usuarios',
  settings: 'Configuración',
  configuration: 'Configuración',
};

function segmentLabel(segment: string): string {
  const k = segment.toLowerCase();
  if (MODULE_LABELS[k]) return MODULE_LABELS[k];
  return segment.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Lista única de módulos legibles a partir de permisos del rol (slug o granular). */
export function permissionsToDisplayList(permissions: string[] | undefined): string {
  if (!permissions?.length) return '';
  const labels = new Set<string>();
  for (const p of permissions) {
    const segment = p.split(/[.:]/)[0]?.trim();
    if (segment) labels.add(segmentLabel(segment));
  }
  return Array.from(labels)
    .sort((a, b) => a.localeCompare(b, 'es'))
    .join(', ');
}
