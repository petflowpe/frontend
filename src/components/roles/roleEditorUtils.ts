import type { Role } from '../../hooks/useRoles';

export const CATEGORY_LABELS: Record<string, string> = {
  system: 'Sistema',
  companies: 'Empresas',
  users: 'Usuarios',
  invoices: 'Facturas',
  boletas: 'Boletas',
  credit_notes: 'Notas de crédito',
  debit_notes: 'Notas de débito',
  dispatch_guides: 'Guías de remisión',
  daily_summaries: 'Resúmenes diarios',
  voided_documents: 'Comunicaciones de baja',
  reports: 'Reportes',
  config: 'Configuración',
  pets: 'Mascotas',
  medical_records: 'Historial médico',
  general: 'General',
};

export interface EditorState {
  id?: number;
  name: string;
  display_name: string;
  description: string;
  active: boolean;
  permissions: Set<string>;
  is_system: boolean;
  protected: boolean;
}

export function emptyEditor(): EditorState {
  return {
    name: '',
    display_name: '',
    description: '',
    active: true,
    permissions: new Set<string>(),
    is_system: false,
    protected: false,
  };
}

export function toEditor(role: Role): EditorState {
  return {
    id: role.id,
    name: role.name,
    display_name: role.display_name,
    description: role.description ?? '',
    active: role.active ?? true,
    permissions: new Set(role.permissions ?? []),
    is_system: !!role.is_system,
    protected: !!role.protected,
  };
}

export function serializeEditorState(e: EditorState): string {
  return JSON.stringify({
    id: e.id ?? null,
    name: e.name,
    display_name: e.display_name,
    description: e.description,
    active: e.active,
    permissions: Array.from(e.permissions).sort(),
  });
}
