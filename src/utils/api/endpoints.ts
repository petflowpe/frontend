/**
 * Rutas centralizadas de la API Laravel.
 * Todas las rutas protegidas están bajo el prefijo /v1 (añadido por el cliente).
 */

export const API = {
  // Públicas (sin token)
  auth: {
    login: '/auth/login',
    initialize: '/auth/initialize',
  },
  setup: {
    migrate: '/setup/migrate',
    seed: '/setup/seed',
    status: '/setup/status',
  },
  system: {
    info: '/system/info',
  },

  // Core (multimoneda, módulos, i18n)
  core: {
    currencies: '/core/currencies',
    modules: '/core/modules',
  },

  // Protegidas (con token, prefijo /v1)
  authProtected: {
    logout: '/auth/logout',
    me: '/auth/me',
    createUser: '/auth/create-user',
  },
  users: {
    list: '/users',
    byId: (id: string | number) => `/users/${id}`,
    create: '/users',
    update: (id: string | number) => `/users/${id}`,
    delete: (id: string | number) => `/users/${id}`,
  },
  profile: {
    get: '/profile',
    update: '/profile',
  },
  settings: {
    get: '/settings',
    update: '/settings',
  },
  roles: {
    list: '/roles',
    byId: (id: string | number) => `/roles/${id}`,
    create: '/roles',
    update: (id: string | number) => `/roles/${id}`,
    toggle: (id: string | number) => `/roles/${id}/toggle`,
    delete: (id: string | number) => `/roles/${id}`,
  },
  permissions: { list: '/permissions' },
  search: '/search',
  auditLogs: { list: '/audit-logs' },
  accountingEntries: {
    list: '/accounting-entries',
    byId: (id: string | number) => `/accounting-entries/${id}`,
    create: '/accounting-entries',
  },
  zones: {
    list: '/zones',
    byId: (id: string | number) => `/zones/${id}`,
  },
  routePlans: {
    list: '/route-plans',
    byId: (id: string | number) => `/route-plans/${id}`,
    create: '/route-plans',
    update: (id: string | number) => `/route-plans/${id}`,
    delete: (id: string | number) => `/route-plans/${id}`,
  },
  setupProtected: {
    complete: '/setup/complete',
    configureSunat: '/setup/configure-sunat',
  },
  ubigeos: {
    regiones: '/ubigeos/regiones',
    provincias: '/ubigeos/provincias',
    distritos: '/ubigeos/distritos',
    search: '/ubigeos/search',
    byId: (id: string | number) => `/ubigeos/${id}`,
  },
  companies: {
    list: '/companies',
    byId: (id: string | number) => `/companies/${id}`,
    activate: (id: string | number) => `/companies/${id}/activate`,
    toggleProduction: (id: string | number) => `/companies/${id}/toggle-production`,
    branches: (id: string | number) => `/companies/${id}/branches`,
    clients: (id: string | number) => `/companies/${id}/clients`,
    products: (id: string | number) => `/companies/${id}/products`,
    vehicles: (id: string | number) => `/companies/${id}/vehicles`,
    config: (id: string | number) => `/companies/${id}/config`,
    configSection: (id: string | number, section: string) => `/companies/${id}/config/${section}`,
    greCredentials: (id: string | number) => `/companies/${id}/gre-credentials`,
  },
  branches: {
    list: '/branches',
    byId: (id: string | number) => `/branches/${id}`,
    activate: (id: string | number) => `/branches/${id}/activate`,
    correlatives: (id: string | number) => `/branches/${id}/correlatives`,
  },
  clients: {
    list: '/clients',
    byId: (id: string | number) => `/clients/${id}`,
    activate: (id: string | number) => `/clients/${id}/activate`,
    searchByDocument: '/clients/search-by-document',
    pets: (clientId: string | number) => `/clients/${clientId}/pets`,
    appointments: (clientId: string | number) => `/clients/${clientId}/appointments`,
  },
  products: {
    list: '/products',
    byId: (id: string | number) => `/products/${id}`,
    activate: (id: string | number) => `/products/${id}/activate`,
    lowStock: '/products/low-stock',
    adjustStock: (id: string | number) => `/products/${id}/adjust-stock`,
    kardex: (id: string | number) => `/products/${id}/kardex`,
  },
  categories: { list: '/categories', byId: (id: string | number) => `/categories/${id}` },
  units: { list: '/units', byId: (id: string | number) => `/units/${id}` },
  areas: { list: '/areas', byId: (id: string | number) => `/areas/${id}` },
  brands: { list: '/brands', byId: (id: string | number) => `/brands/${id}` },
  suppliers: { list: '/suppliers', byId: (id: string | number) => `/suppliers/${id}` },
  purchaseOrders: {
    list: '/purchase-orders',
    byId: (id: string | number) => `/purchase-orders/${id}`,
    status: (id: string | number) => `/purchase-orders/${id}/status`,
    complete: (id: string | number) => `/purchase-orders/${id}/complete`,
  },
  cashSessions: {
    list: '/cash-sessions',
    open: '/cash-sessions/open',
    close: (id: string | number) => `/cash-sessions/${id}/close`,
  },
  payments: { list: '/payments', create: '/payments' },
  reports: {
    sales: '/reports/sales',
    stats: '/reports/stats',
    products: '/reports/products',
    clients: '/reports/clients',
  },
  cashMovements: { list: '/cash-movements', byId: (id: string | number) => `/cash-movements/${id}` },
  invoices: {
    list: '/invoices',
    byId: (id: string | number) => `/invoices/${id}`,
    sendSunat: (id: string | number) => `/invoices/${id}/send-sunat`,
    downloadXml: (id: string | number) => `/invoices/${id}/download-xml`,
    downloadPdf: (id: string | number) => `/invoices/${id}/download-pdf`,
  },
  boletas: {
    list: '/boletas',
    byId: (id: string | number) => `/boletas/${id}`,
    sendSunat: (id: string | number) => `/boletas/${id}/send-sunat`,
  },
  dailySummaries: { list: '/daily-summaries', byId: (id: string | number) => `/daily-summaries/${id}` },
  creditNotes: { list: '/credit-notes', byId: (id: string | number) => `/credit-notes/${id}` },
  debitNotes: { list: '/debit-notes', byId: (id: string | number) => `/debit-notes/${id}` },
  retentions: { list: '/retentions', byId: (id: string | number) => `/retentions/${id}` },
  voidedDocuments: { list: '/voided-documents', byId: (id: string | number) => `/voided-documents/${id}` },
  dispatchGuides: { list: '/dispatch-guides', byId: (id: string | number) => `/dispatch-guides/${id}` },
  pets: {
    list: '/pets',
    byId: (id: string | number) => `/pets/${id}`,
  },
  petConfigurations: {
    list: '/pet-configurations',
    all: '/pet-configurations/all',
  },
  appointments: {
    list: '/appointments',
    byId: (id: string | number) => `/appointments/${id}`,
    reschedule: (id: string | number) => `/appointments/${id}/reschedule`,
    changeStatus: (id: string | number) => `/appointments/${id}/change-status`,
    sendReminder: (id: string | number) => `/appointments/${id}/send-reminder`,
    confirm: (id: string | number) => `/appointments/${id}/confirm`,
  },
  vehicles: {
    list: '/vehicles',
    byId: (id: string | number) => `/vehicles/${id}`,
    maintenances: {
      list: '/vehicle-maintenances',
      byId: (id: string | number) => `/vehicle-maintenances/${id}`,
      byVehicle: (vehicleId: string | number) => `/vehicles/${vehicleId}/maintenances`,
    },
    expenses: {
      list: '/vehicle-expenses',
      byId: (id: string | number) => `/vehicle-expenses/${id}`,
      byVehicle: (vehicleId: string | number) => `/vehicles/${vehicleId}/expenses`,
    },
    services: {
      list: '/vehicle-services',
      byId: (id: string | number) => `/vehicle-services/${id}`,
      byVehicle: (vehicleId: string | number) => `/vehicles/${vehicleId}/services`,
      sendToMaintenance: (id: string | number) => `/vehicle-services/${id}/send-to-maintenance`,
      complete: (id: string | number) => `/vehicle-services/${id}/complete`,
    },
    alerts: '/vehicle-alerts',
    inspectionTemplates: {
      list: '/vehicle-inspection-templates',
      store: '/vehicle-inspection-templates',
      restore: '/vehicle-inspection-templates/restore',
    },
    inspections: {
      list: '/vehicle-inspections',
      byId: (id: string | number) => `/vehicle-inspections/${id}`,
      byVehicle: (vehicleId: string | number) => `/vehicles/${vehicleId}/inspections`,
    },
  },
  vehicleConfigurations: {
    all: '/vehicle-configurations/all',
    store: '/vehicle-configurations',
  },
  medicalRecords: {
    list: '/medical-records',
    byId: (id: string | number) => `/medical-records/${id}`,
    byPet: (petId: string | number) => `/pets/${petId}/medical-records`,
    byClient: (clientId: string | number) => `/clients/${clientId}/medical-records`,
  },
  notifications: {
    list: '/notifications',
    markAllRead: '/notifications/mark-all-read',
    markRead: (id: string | number) => `/notifications/${id}/read`,
    delete: (id: string | number) => `/notifications/${id}`,
  },
} as const;
