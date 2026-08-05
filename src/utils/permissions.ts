/**
 * Sistema centralizado de permisos para el frontend.
 *
 * Diseñado para trabajar con la forma real del usuario que devuelve el backend:
 *   {
 *     id, name, email,
 *     role: { name: 'super_admin', display_name: 'Super Administrador' } | string | null,
 *     role_key?: string,
 *     permissions: string[]   // ej: ['*'] | ['invoices.*','reports.view'] | ['all']
 *   }
 *
 * - Soporta wildcards: '*', 'all' (acceso total), 'invoices.*' (familia), 'invoices.view'.
 * - Soporta role objeto ({name,display_name}) o string, o role_key separado.
 * - Expone:
 *     getRoleKey(user)
 *     isSuperAdmin(user)
 *     hasPermission(user, 'perm' | ['p1','p2'])
 *     canAccessModule(user, moduleId)
 *     isModuleAllowed(roleOrUser, moduleId)   // compat con firma antigua
 */

export interface CurrentUserLike {
  role?: string | { name?: string; display_name?: string } | null;
  role_key?: string | null;
  roleKey?: string | null;
  permissions?: string[];
  email?: string | null;
}

// --------- Helpers de rol y permisos ---------

export function getRoleKey(user: CurrentUserLike | null | undefined): string {
  if (!user) return '';
  if (typeof user.role_key === 'string' && user.role_key) return user.role_key;
  if (typeof user.roleKey === 'string' && user.roleKey) return user.roleKey;
  if (typeof user.role === 'string') return user.role;
  if (user.role && typeof user.role === 'object') return user.role.name ?? '';
  return '';
}

/** Roles que siempre ven todo el sistema */
const SUPER_ROLES = new Set(['super_admin', 'superadmin', 'admin']);

export function isSuperAdmin(user: CurrentUserLike | null | undefined): boolean {
  if (!user) return false;
  const role = getRoleKey(user).toLowerCase();
  if (SUPER_ROLES.has(role)) return true;
  const perms = user.permissions ?? [];
  return perms.includes('*') || perms.includes('all');
}

/** ¿Es administrador de empresa (company_admin)? */
export function isCompanyAdmin(user: CurrentUserLike | null | undefined): boolean {
  const role = getRoleKey(user).toLowerCase();
  return role === 'company_admin';
}

function matchPermission(required: string, granted: string): boolean {
  if (granted === '*' || granted === 'all') return true;
  if (granted === required) return true;
  if (granted.endsWith('.*')) {
    const prefix = granted.slice(0, -2);
    return required === prefix || required.startsWith(prefix + '.');
  }
  if (required.endsWith('.*')) {
    const prefix = required.slice(0, -2);
    return granted === prefix || granted.startsWith(prefix + '.');
  }
  return false;
}

export function hasPermission(
  user: CurrentUserLike | null | undefined,
  required: string | string[],
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const list = Array.isArray(required) ? required : [required];
  if (list.length === 0) return true;
  const granted = user.permissions ?? [];
  return list.some((req) => granted.some((g) => matchPermission(req, g)));
}

// --------- Mapa de módulos → requisitos ---------
// null => accesible para cualquier usuario autenticado.
// { roles } => se permite si el rol pertenece al listado.
// { permissions } => se permite si tiene cualquiera de esos permisos.
// roles y permissions se combinan con OR.

interface ModuleRule {
  roles?: string[];
  permissions?: string[];
}

export const MODULE_ACCESS: Record<string, ModuleRule | null> = {
  // Principal
  dashboard: null,
  'user-settings': null,
  notifications: null,
  calendar: { permissions: ['pets.view', 'pets.create', 'pets.update', 'pets.manage', 'pets.*'] },
  appointments: { permissions: ['pets.view', 'pets.create', 'pets.update', 'pets.manage', 'pets.*'] },
  confirmation: { permissions: ['pets.view', 'pets.manage', 'pets.*'], roles: ['super_admin', 'company_admin'] },
  clients: { permissions: ['pets.view', 'pets.create', 'pets.update', 'pets.manage', 'pets.*'] },
  pets: { permissions: ['pets.view', 'pets.create', 'pets.update', 'pets.manage', 'pets.*'] },
  loyalty: { roles: ['super_admin', 'company_admin'], permissions: ['pets.view', 'pets.*'] },
  reviews: { roles: ['super_admin', 'company_admin'] },
  'vet-clinic-portal': null,

  // Operaciones
  services: null,
  products: { permissions: ['products.view', 'products.*', 'inventory.view'] },
  suppliers: null,
  inventory: { permissions: ['inventory.view', 'inventory.*', 'products.view', 'products.*'] },
  purchases: { roles: ['super_admin', 'company_admin', 'company_user'], permissions: ['purchases.view', 'purchases.*'] },
  vehicles: {
    roles: ['super_admin', 'company_admin'],
    permissions: ['vehicles.view', 'vehicles.manage', 'vehicles.*', 'vehicles.coverage.view', 'vehicles.coverage.manage'],
  },
  routes: {
    roles: ['super_admin', 'company_admin'],
    permissions: ['vehicles.view', 'vehicles.manage', 'vehicles.*'],
  },
  'operations-center': { roles: ['super_admin', 'company_admin'] },
  'zone-config': {
    roles: ['super_admin', 'company_admin'],
    permissions: ['vehicles.view', 'vehicles.manage', 'vehicles.*'],
  },
  'public-tracking': null,
  kardex: { roles: ['super_admin', 'company_admin', 'company_user'] },

  // Finanzas
  invoicing: { permissions: ['invoices.view', 'invoices.*', 'boletas.view', 'boletas.*'] },
  payments: { roles: ['super_admin', 'company_admin', 'company_user'] },
  'cash-register': { roles: ['super_admin', 'company_admin', 'company_user'] },
  accounting: { roles: ['super_admin', 'company_admin'] },
  financial: { roles: ['super_admin', 'company_admin'] },

  // Reportes
  exports: { roles: ['super_admin', 'company_admin'], permissions: ['reports.export', 'reports.*'] },
  reports: { roles: ['super_admin', 'company_admin'], permissions: ['reports.view', 'reports.*'] },
  analytics: { roles: ['super_admin', 'company_admin'], permissions: ['reports.view', 'reports.*'] },
  'analisis-geografico': { roles: ['super_admin', 'company_admin'] },
  segmentacion: { roles: ['super_admin', 'company_admin'] },
  patrones: { roles: ['super_admin', 'company_admin'] },

  // SUNAT
  'sunat-config': { roles: ['super_admin', 'company_admin'] },
  'electronic-invoicing': { permissions: ['invoices.send', 'invoices.*', 'boletas.send', 'boletas.*'] },
  'electronic-books': { roles: ['super_admin', 'company_admin'] },
  'sunat-reports': { roles: ['super_admin', 'company_admin'], permissions: ['reports.view', 'reports.*'] },

  // Administración
  staff: { roles: ['super_admin', 'company_admin'] },
  settings: { roles: ['super_admin', 'company_admin'] },
  companies: { roles: ['super_admin', 'company_admin'] },
  users: { roles: ['super_admin', 'company_admin'], permissions: ['users.view', 'users.*', 'users.roles', 'users.manage'] },
  'data-export': { roles: ['super_admin', 'company_admin'] },
  prueba: { roles: ['super_admin'] },

  // App chofer (simulador para admins; modo aislado para conductores)
  'driver-session': { roles: ['super_admin', 'company_admin', 'conductor'] },
};

export function canAccessModule(
  user: CurrentUserLike | null | undefined,
  moduleId: string,
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;

  const rule = MODULE_ACCESS[moduleId];
  if (rule == null) return true; // módulo público para usuarios autenticados

  const role = getRoleKey(user);
  if (rule.roles && rule.roles.includes(role)) return true;
  if (rule.permissions && rule.permissions.length > 0 && hasPermission(user, rule.permissions)) return true;

  return false;
}

// --------- Compat con la firma antigua ---------
// Antes: isModuleAllowed(role: string, module: string)
// Ahora también acepta un objeto usuario.
export const isModuleAllowed = (
  roleOrUser: string | CurrentUserLike | null | undefined,
  moduleId: string,
): boolean => {
  if (roleOrUser && typeof roleOrUser === 'object') {
    return canAccessModule(roleOrUser, moduleId);
  }
  const role = (roleOrUser as string) || '';
  return canAccessModule({ role }, moduleId);
};

// Tabla antigua para referencia / tests. No se usa internamente.
export const ROLE_RESTRICTIONS: Record<string, string[]> = {};
