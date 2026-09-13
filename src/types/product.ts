/**
 * Tipos de la ficha de producto estilo Grooflow, adaptados al API Laravel.
 *
 * `UiProduct` es el shape que consumen `ProductModule` / `ProductWorkspace`.
 * La conversión desde/hacia el `Product` de `useInventory` vive en
 * `src/mappers/productMapper.ts`.
 */

export type ProductStatus = 'active' | 'inactive' | 'discontinued';

/** Movimiento de inventario (Kardex) — proviene de `GET /products/{id}/kardex`. */
export interface ProductKardexRow {
  id: string;
  date: string;
  referenceDoc: string;
  operationType: string;
  warehouse: string;
  qtyIn: number;
  qtyOut: number;
  unitCost: number;
  totalCost: number;
  balance: number;
  notes?: string;
  responsible?: string;
}

/** Lote / batch asociado al producto (se persiste en `metadata`). */
export interface ProductLotRow {
  id: string;
  registeredAt: string;
  lotNumber: string;
  warehouse: string;
  expiresAt?: string;
  qtyIn: number;
  balance: number;
}

/** Entrada de auditoría de la ficha (se persiste en `metadata`). */
export interface ProductAuditRow {
  id: string;
  at: string;
  action: string;
  module: string;
  previousValue?: string;
  newValue?: string;
  responsible: string;
}

/** Campos extra de ficha (pestañas Precios, Factor de compra, Lotes, etc.). */
export interface ProductExtended {
  customCode?: string;
  presentation?: string;
  content?: string;
  saleTaxPercent?: number;
  purchaseTaxPercent?: number;
  saleTaxExempt?: boolean;
  purchaseTaxExempt?: boolean;
  /** Valor de venta sin impuestos */
  saleValueNet?: number;
  /** Valor de compra sin impuestos */
  purchaseValueNet?: number;
  maxDiscountPercent?: number;
  commissionType?: 'fixed' | 'percent';
  commissionApplyOn?: string;
  commissionAmount?: number;
  commissionPercent?: number;
  /** Gravado ICBPER (bolsas plásticas, etc.) */
  icbperGravado?: boolean;
  loyaltyPoints?: number;
  salesAvailable?: boolean;
  applicationFrequencyDays?: string;
  usePurchaseConversion?: boolean;
  purchaseConversionLabel?: string;
  purchaseConversionFactor?: number;
  purchaseConversionUnitPurchasePrice?: number;
  lots?: ProductLotRow[];
  audit?: ProductAuditRow[];
}

/** Listas editables del catálogo (líneas, categorías, unidades...). */
export interface ProductCatalogSettings {
  lines: string[];
  categories: string[];
  subcategories: string[];
  units: string[];
  presentations: string[];
}

/** Ficha de producto tal como la manipula la UI portada de Grooflow. */
export interface UiProduct {
  /** Vacío cuando es un borrador nuevo todavía no guardado. */
  id: string;
  /** Código de sistema / SKU (`products.code`). */
  code: string;
  barcode?: string;
  name: string;
  brand?: string;
  brandId?: number;
  category: string;
  categoryId?: number;
  subcategory?: string;
  line: string;
  unit: string;
  supplierId?: number;
  supplierName?: string;
  areaId?: number;
  location?: string;
  salePrice: number;
  costPrice: number;
  /** Stock disponible consolidado de todas las áreas. */
  stockAvailable: number;
  /** Stock contable (el API expone un único valor; se replica). */
  stockAccounting: number;
  minStock: number;
  maxStock?: number;
  status: ProductStatus;
  description?: string;
  imagePath?: string;
  extended: ProductExtended;
}

/** Opción de proveedor normalizada para los selects de la ficha. */
export interface ProviderOption {
  id: number;
  name: string;
  active?: boolean;
  documentNumber?: string;
  phone?: string;
  email?: string;
  creditDays?: number;
}

/** Metadata que viaja en `products.metadata` (JSON en MySQL). */
export interface ProductMetadata {
  line?: string;
  subcategory?: string;
  status?: ProductStatus;
  preferred_area_id?: number;
  extended?: ProductExtended;
}
