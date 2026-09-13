export const PRODUCT_LINES = ['FARMACIA', 'PET SHOP', 'CLINICA', 'GROOMING', 'SERVICIOS'] as const;

export const PRODUCT_CATEGORIES = [
  'Medicamentos',
  'Antiparasitarios',
  'Restrictivos',
  'Alimentos',
  'Accesorios',
  'Higiene',
  'Insumos Clinicos',
  'Servicios',
] as const;

export const PRODUCT_SUBCATEGORIES = [
  'Tabletas',
  'Comprimidos',
  'Gotas',
  'Inyectables',
  'Alimento seco',
  'Arena sanitaria',
  'Juguetes',
  'Otros',
] as const;

/** Unidades SUNAT usadas por el backend (`products.unit`, máx. 10 caracteres). */
export const PRODUCT_UNITS = ['NIU', 'UND', 'ZZ', 'ML', 'LTR', 'KGM', 'BX', 'BG', 'GLL'] as const;

export const PRODUCT_PRESENTATIONS = [
  'Botella',
  'Blister',
  'Caja',
  'Sachet',
  'Ampolla',
  'Frasco',
  'Bolsa',
  'Tarro',
  'Tubo',
  'Otros',
] as const;

/** Almacén por defecto cuando la empresa no tiene áreas configuradas. */
export const DEFAULT_WAREHOUSES = ['Principal'] as const;

export const DEFAULT_PRODUCT_LINE = 'PET SHOP';

/** IGV por defecto (Perú). */
export const DEFAULT_IGV_PERCENT = 18;
