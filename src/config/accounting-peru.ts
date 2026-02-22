// Plan Contable General Empresarial (PCGE) - Perú
// Cuentas contables según normativa peruana

export const ACCOUNTING_ACCOUNTS_PERU = {
  // CLASE 1: ACTIVO DISPONIBLE Y EXIGIBLE
  '10': { code: '10', name: 'Efectivo y Equivalentes de Efectivo', type: 'Activo' },
  '101': { code: '101', name: 'Caja', type: 'Activo', parent: '10' },
  '1011': { code: '1011', name: 'Caja MN', type: 'Activo', parent: '101' },
  '104': { code: '104', name: 'Cuentas Corrientes en Instituciones Financieras', type: 'Activo', parent: '10' },
  '1041': { code: '1041', name: 'Cuentas Corrientes Operativas', type: 'Activo', parent: '104' },
  
  '12': { code: '12', name: 'Cuentas por Cobrar Comerciales - Terceros', type: 'Activo' },
  '121': { code: '121', name: 'Facturas, Boletas y Otros Comprobantes por Cobrar', type: 'Activo', parent: '12' },
  '1211': { code: '1211', name: 'No Emitidas', type: 'Activo', parent: '121' },
  '1212': { code: '1212', name: 'Emitidas en Cartera', type: 'Activo', parent: '121' },
  
  // CLASE 2: ACTIVO REALIZABLE
  '20': { code: '20', name: 'Mercaderías', type: 'Activo' },
  '201': { code: '201', name: 'Mercaderías Manufacturadas', type: 'Activo', parent: '20' },
  '2011': { code: '2011', name: 'Mercaderías Manufacturadas - Costo', type: 'Activo', parent: '201' },
  
  // CLASE 3: ACTIVO INMOVILIZADO
  '33': { code: '33', name: 'Inmuebles, Maquinaria y Equipo', type: 'Activo' },
  '334': { code: '334', name: 'Unidades de Transporte', type: 'Activo', parent: '33' },
  '3341': { code: '3341', name: 'Vehículos Motorizados', type: 'Activo', parent: '334' },
  '335': { code: '335', name: 'Muebles y Enseres', type: 'Activo', parent: '33' },
  '336': { code: '336', name: 'Equipos Diversos', type: 'Activo', parent: '33' },
  '3361': { code: '3361', name: 'Equipo para Procesamiento de Información', type: 'Activo', parent: '336' },
  
  '39': { code: '39', name: 'Depreciación, Amortización y Agotamiento Acumulados', type: 'Activo' },
  '391': { code: '391', name: 'Depreciación Acumulada', type: 'Activo', parent: '39' },
  '3913': { code: '3913', name: 'Inmuebles, Maquinaria y Equipo - Costo', type: 'Activo', parent: '391' },
  
  // CLASE 4: PASIVO
  '40': { code: '40', name: 'Tributos, Contraprestaciones y Aportes al Sistema de Pensiones', type: 'Pasivo' },
  '401': { code: '401', name: 'Gobierno Central', type: 'Pasivo', parent: '40' },
  '4011': { code: '4011', name: 'IGV', type: 'Pasivo', parent: '401' },
  '40111': { code: '40111', name: 'IGV - Cuenta Propia', type: 'Pasivo', parent: '4011' },
  '4017': { code: '4017', name: 'Impuesto a la Renta', type: 'Pasivo', parent: '401' },
  '40171': { code: '40171', name: 'Renta de Tercera Categoría', type: 'Pasivo', parent: '4017' },
  
  '41': { code: '41', name: 'Remuneraciones y Participaciones por Pagar', type: 'Pasivo' },
  '411': { code: '411', name: 'Remuneraciones por Pagar', type: 'Pasivo', parent: '41' },
  '4111': { code: '4111', name: 'Sueldos y Salarios por Pagar', type: 'Pasivo', parent: '411' },
  
  '42': { code: '42', name: 'Cuentas por Pagar Comerciales - Terceros', type: 'Pasivo' },
  '421': { code: '421', name: 'Facturas, Boletas y Otros Comprobantes por Pagar', type: 'Pasivo', parent: '42' },
  '4212': { code: '4212', name: 'Emitidas', type: 'Pasivo', parent: '421' },
  
  '46': { code: '46', name: 'Cuentas por Pagar Diversas - Terceros', type: 'Pasivo' },
  '469': { code: '469', name: 'Otras Cuentas por Pagar Diversas', type: 'Pasivo', parent: '46' },
  
  // CLASE 5: PATRIMONIO
  '50': { code: '50', name: 'Capital', type: 'Patrimonio' },
  '501': { code: '501', name: 'Capital Social', type: 'Patrimonio', parent: '50' },
  '5011': { code: '5011', name: 'Acciones', type: 'Patrimonio', parent: '501' },
  
  '59': { code: '59', name: 'Resultados Acumulados', type: 'Patrimonio' },
  '591': { code: '591', name: 'Utilidades No Distribuidas', type: 'Patrimonio', parent: '59' },
  '592': { code: '592', name: 'Pérdidas Acumuladas', type: 'Patrimonio', parent: '59' },
  
  // CLASE 6: GASTOS POR NATURALEZA
  '60': { code: '60', name: 'Compras', type: 'Gasto' },
  '601': { code: '601', name: 'Mercaderías', type: 'Gasto', parent: '60' },
  '6011': { code: '6011', name: 'Mercaderías Manufacturadas', type: 'Gasto', parent: '601' },
  
  '62': { code: '62', name: 'Gastos de Personal, Directores y Gerentes', type: 'Gasto' },
  '621': { code: '621', name: 'Remuneraciones', type: 'Gasto', parent: '62' },
  '6211': { code: '6211', name: 'Sueldos y Salarios', type: 'Gasto', parent: '621' },
  '627': { code: '627', name: 'Seguridad, Previsión Social y Otras Contribuciones', type: 'Gasto', parent: '62' },
  '6271': { code: '6271', name: 'Régimen de Prestaciones de Salud', type: 'Gasto', parent: '627' },
  
  '63': { code: '63', name: 'Gastos de Servicios Prestados por Terceros', type: 'Gasto' },
  '631': { code: '631', name: 'Transporte, Correos y Gastos de Viaje', type: 'Gasto', parent: '63' },
  '632': { code: '632', name: 'Honorarios, Comisiones y Corretajes', type: 'Gasto', parent: '63' },
  '634': { code: '634', name: 'Mantenimiento y Reparaciones', type: 'Gasto', parent: '63' },
  '636': { code: '636', name: 'Servicios Básicos', type: 'Gasto', parent: '63' },
  '6361': { code: '6361', name: 'Energía Eléctrica', type: 'Gasto', parent: '636' },
  '6363': { code: '6363', name: 'Agua', type: 'Gasto', parent: '636' },
  '6364': { code: '6364', name: 'Teléfono', type: 'Gasto', parent: '636' },
  '637': { code: '637', name: 'Publicidad, Publicaciones, Relaciones Públicas', type: 'Gasto', parent: '63' },
  '639': { code: '639', name: 'Otros Servicios Prestados por Terceros', type: 'Gasto', parent: '63' },
  
  '64': { code: '64', name: 'Gastos por Tributos', type: 'Gasto' },
  '641': { code: '641', name: 'Gobierno Central', type: 'Gasto', parent: '64' },
  '6411': { code: '6411', name: 'Impuesto General a las Ventas y Selectivo al Consumo', type: 'Gasto', parent: '641' },
  
  '65': { code: '65', name: 'Otros Gastos de Gestión', type: 'Gasto' },
  '655': { code: '655', name: 'Costo Neto de Enajenación de Activos Inmovilizados', type: 'Gasto', parent: '65' },
  '659': { code: '659', name: 'Otros Gastos de Gestión', type: 'Gasto', parent: '65' },
  
  '68': { code: '68', name: 'Valuación y Deterioro de Activos y Provisiones', type: 'Gasto' },
  '681': { code: '681', name: 'Depreciación', type: 'Gasto', parent: '68' },
  '6814': { code: '6814', name: 'Depreciación de Inmuebles, Maquinaria y Equipo - Costo', type: 'Gasto', parent: '681' },
  
  // CLASE 7: INGRESOS
  '70': { code: '70', name: 'Ventas', type: 'Ingreso' },
  '701': { code: '701', name: 'Mercaderías', type: 'Ingreso', parent: '70' },
  '7011': { code: '7011', name: 'Mercaderías Manufacturadas', type: 'Ingreso', parent: '701' },
  '704': { code: '704', name: 'Prestación de Servicios', type: 'Ingreso', parent: '70' },
  '7041': { code: '7041', name: 'Terceros', type: 'Ingreso', parent: '704' },
  
  '75': { code: '75', name: 'Otros Ingresos de Gestión', type: 'Ingreso' },
  '759': { code: '759', name: 'Otros Ingresos de Gestión', type: 'Ingreso', parent: '75' },
  
  // CLASE 9: COSTOS DE PRODUCCIÓN Y GASTOS POR FUNCIÓN
  '94': { code: '94', name: 'Gastos de Administración', type: 'Gasto Función' },
  '95': { code: '95', name: 'Gastos de Ventas', type: 'Gasto Función' },
};

// Cuentas contables predefinidas para operaciones comunes
export const DEFAULT_ACCOUNTING_MAPPINGS = {
  // Ingresos
  services: '7041', // Prestación de Servicios - Terceros
  productSales: '7011', // Mercaderías Manufacturadas
  otherIncome: '759', // Otros Ingresos de Gestión
  
  // Gastos
  salaries: '6211', // Sueldos y Salarios
  socialBenefits: '6271', // Régimen de Prestaciones de Salud
  maintenance: '634', // Mantenimiento y Reparaciones
  fuel: '639', // Otros Servicios
  electricity: '6361', // Energía Eléctrica
  water: '6363', // Agua
  phone: '6364', // Teléfono
  advertising: '637', // Publicidad
  
  // Activos
  cash: '1011', // Caja MN
  bank: '1041', // Cuentas Corrientes Operativas
  accountsReceivable: '1212', // Facturas Emitidas en Cartera
  inventory: '2011', // Mercaderías Manufacturadas
  vehicles: '3341', // Vehículos Motorizados
  equipment: '3361', // Equipo para Procesamiento de Información
  
  // Pasivos
  igv: '40111', // IGV - Cuenta Propia
  incomeTax: '40171', // Renta de Tercera Categoría
  salariesPayable: '4111', // Sueldos y Salarios por Pagar
  accountsPayable: '4212', // Facturas Emitidas
};

// Tipos de comprobantes SUNAT
export const VOUCHER_TYPES_SUNAT = [
  { code: '01', name: 'Factura' },
  { code: '02', name: 'Recibo por Honorarios' },
  { code: '03', name: 'Boleta de Venta' },
  { code: '04', name: 'Liquidación de Compra' },
  { code: '07', name: 'Nota de Crédito' },
  { code: '08', name: 'Nota de Débito' },
  { code: '09', name: 'Guía de Remisión Remitente' },
  { code: '12', name: 'Ticket de Máquina Registradora' },
  { code: '13', name: 'Documento emitido por bancos' },
  { code: '14', name: 'Recibo por servicios públicos' },
  { code: '00', name: 'Otros' },
];

// Tasas de IGV en Perú
export const IGV_RATES_PERU = [
  { id: '18', label: '18% (Vigente)', value: 18, active: true },
  { id: '0', label: '0% (Exonerado)', value: 0, active: true },
];

// Tipos de régimen tributario en Perú
export const TAX_REGIMES_PERU = [
  { id: 'RG', name: 'Régimen General' },
  { id: 'RER', name: 'Régimen Especial de Renta' },
  { id: 'MYPE', name: 'Régimen MYPE Tributario' },
  { id: 'RUS', name: 'Régimen Único Simplificado' },
];