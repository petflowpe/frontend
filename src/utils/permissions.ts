export const ROLE_RESTRICTIONS: Record<string, string[]> = {
  veterinario: [
    'invoicing', 'payments', 'cash-register', 'kardex', 'accounting', 
    'exports', 'reports', 'analytics', 'sunat-config', 'electronic-invoicing',
    'electronic-books', 'sunat-reports', 'purchases', 'users', 'companies', 'products', 'vehicles', 'routes', 'staff'
  ],
  staff: [
    'clients', 'medical', 'invoicing', 'payments', 'cash-register', 
    'kardex', 'accounting', 'exports', 'reports', 'analytics', 
    'sunat-config', 'electronic-invoicing', 'electronic-books', 
    'sunat-reports', 'purchases', 'users', 'companies', 'settings', 'loyalty', 'reviews', 'staff'
  ],
  conductor: [
    'clients', 'medical', 'invoicing', 'payments', 'cash-register', 
    'kardex', 'accounting', 'exports', 'reports', 'analytics', 
    'sunat-config', 'electronic-invoicing', 'electronic-books', 
    'sunat-reports', 'purchases', 'users', 'companies', 'settings', 'loyalty', 'reviews', 'staff'
  ]
};

export const isModuleAllowed = (role: string, module: string): boolean => {
  // Si el rol no tiene restricciones definidas (ej. admin), tiene acceso total
  const restrictions = ROLE_RESTRICTIONS[role];
  if (!restrictions) return true;
  
  return !restrictions.includes(module);
};
