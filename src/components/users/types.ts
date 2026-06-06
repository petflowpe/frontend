export type UserManagementView = 'list' | 'edit';

/** Sede para selects/checkboxes (API branches). */
export interface CompanyBranchOption {
  id: number;
  nombre: string;
  activo: boolean;
}

/** Tipos de documento de identidad admitidos por el sistema. */
export type DocumentType = 'DNI' | 'CE' | 'RUC' | 'PASS';

export const DOCUMENT_TYPES: { value: DocumentType; label: string; help?: string }[] = [
  { value: 'DNI', label: 'DNI', help: 'Documento Nacional de Identidad' },
  { value: 'CE', label: 'CE', help: 'Carnet de Extranjería' },
  { value: 'RUC', label: 'RUC', help: 'Registro Único de Contribuyentes' },
  { value: 'PASS', label: 'Pasaporte' },
];

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials?: string;
  /** Tipo de documento del usuario (DNI, CE, RUC, Pasaporte). */
  documentType?: DocumentType | null;
  /** Número del documento. Permite iniciar sesión con (documento + contraseña). */
  documentNumber?: string | null;
  allBranchesAccess?: boolean | null;
  /** Ids de sedes permitidas si no tiene todas las sedes. */
  branchIds?: number[] | null;
  role: string;
  roleKey?: string;
  role_id?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  customPermissions?: string[];
}

export interface UserFormState {
  name: string;
  email: string;
  phone: string;
  initials: string;
  /** Tipo de documento (DNI, CE, RUC, PASS). */
  documentType: DocumentType | '';
  /** Número de documento (sin símbolos). */
  documentNumber: string;
  /** Todas las sedes (metadata en backend). */
  allBranchesAccess: boolean;
  /** Sedes concretas cuando `allBranchesAccess` es false. */
  branchIds: number[];
  role_id: number;
  status: 'active' | 'inactive';
  password: string;
  confirmPassword: string;
}
