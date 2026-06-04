import { apiClient } from '../utils/api/client';
import { getStoredCompanyId } from '../utils/appointmentMappers';

export type ExportDataset =
  | 'clients'
  | 'appointments'
  | 'invoices'
  | 'products'
  | 'services'
  | 'pets'
  | 'staff'
  | 'vehicles'
  | 'routes';

export interface ExportParams {
  date_from?: string;
  date_to?: string;
  company_id?: number;
}

function baseParams(params?: ExportParams): Record<string, string | number> {
  const companyId = params?.company_id ?? getStoredCompanyId();
  const out: Record<string, string | number> = {};
  if (companyId) out.company_id = companyId;
  if (params?.date_from) out.date_from = params.date_from;
  if (params?.date_to) out.date_to = params.date_to;
  return out;
}

export async function fetchExportDataset(
  dataset: ExportDataset,
  params?: ExportParams
): Promise<Record<string, unknown>[]> {
  const rows = await apiClient.get<Record<string, unknown>[]>(
    `/reports/export/dataset/${dataset}`,
    baseParams(params)
  );
  return Array.isArray(rows) ? rows : [];
}

export async function fetchExportReport(
  reportId: string,
  params?: ExportParams
): Promise<Record<string, unknown>[]> {
  const rows = await apiClient.get<Record<string, unknown>[]>(
    `/reports/export/report/${reportId}`,
    baseParams(params)
  );
  return Array.isArray(rows) ? rows : [];
}

export function defaultDateRange(): { date_from: string; date_to: string } {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1);
  return {
    date_from: start.toISOString().split('T')[0],
    date_to: end.toISOString().split('T')[0],
  };
}

/** Reportes con datos reales en backend (otros devuelven lista vacía). */
export const REPORTS_WITH_API: Set<string> = new Set([
  'appointments-full',
  'appointments-pending',
  'appointments-cancelled',
  'routes-daily',
  'clients-master',
  'clients-active',
  'clients-inactive',
  'pets-master',
  'financial-invoices',
  'financial-cash-flow',
  'financial-expenses',
  'financial-pending-payments',
  'inventory-stock',
  'inventory-low-stock',
  'staff-roster',
  'audit-duplicates-clients',
]);
