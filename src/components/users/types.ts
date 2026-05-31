export type UserManagementView = 'list' | 'edit';

/** Sede para selects/checkboxes (API branches). */
export interface CompanyBranchOption {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials?: string;
  allBranchesAccess?: boolean | null;
  /** Ids de sedes permitidas si no tiene todas las sedes. */
  branchIds?: number[] | null;
  role: string;
  roleKey?: string;
  role_id?: number;
  status: 'active' | 'inactive' | 'suspended';
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
  /** Todas las sedes (metadata en backend). */
  allBranchesAccess: boolean;
  /** Sedes concretas cuando `allBranchesAccess` es false. */
  branchIds: number[];
  role_id: number;
  status: 'active' | 'inactive' | 'suspended';
  password: string;
  confirmPassword: string;
}
