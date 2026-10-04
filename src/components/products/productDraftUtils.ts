import type { UiProduct } from '../../types/product';
import { normalizeExtended } from '../../mappers/productMapper';
import { round2 } from '../../utils/numberFormat';
import { DEFAULT_IGV_PERCENT, DEFAULT_PRODUCT_LINE } from './productCatalogConstants';

export { round2 };

export function cloneProduct(source: UiProduct): UiProduct {
  return {
    ...source,
    extended: {
      ...source.extended,
      lots: source.extended.lots?.map((r) => ({ ...r })) ?? [],
      audit: source.extended.audit?.map((r) => ({ ...r })) ?? [],
    },
  };
}

interface DraftDefaults {
  categoryId?: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
  supplierId?: number;
  supplierName?: string;
  areaId?: number;
  location?: string;
  line?: string;
  unit?: string;
}

export function createDraftProduct(defaults: DraftDefaults = {}): UiProduct {
  return {
    id: '',
    code: '',
    barcode: '',
    name: '',
    brand: defaults.brandName ?? '',
    brandId: defaults.brandId,
    category: defaults.categoryName ?? '',
    categoryId: defaults.categoryId,
    subcategory: '',
    line: defaults.line ?? DEFAULT_PRODUCT_LINE,
    unit: defaults.unit ?? 'NIU',
    supplierId: defaults.supplierId,
    supplierName: defaults.supplierName ?? '',
    areaId: defaults.areaId,
    location: defaults.location ?? '',
    salePrice: 0,
    costPrice: 0,
    stockAvailable: 0,
    stockAccounting: 0,
    minStock: 5,
    maxStock: undefined,
    trackBatches: false,
    status: 'active',
    description: '',
    imagePath: undefined,
    extended: {
      salesAvailable: true,
      saleTaxPercent: DEFAULT_IGV_PERCENT,
      purchaseTaxPercent: DEFAULT_IGV_PERCENT,
      saleTaxExempt: false,
      purchaseTaxExempt: false,
      saleValueNet: 0,
      purchaseValueNet: 0,
      maxDiscountPercent: 0,
      commissionType: 'fixed',
      commissionAmount: 0,
      commissionPercent: 0,
      commissionApplyOn: 'valor_venta',
      icbperGravado: false,
      loyaltyPoints: 0,
      presentation: 'Botella',
      usePurchaseConversion: false,
      lots: [],
      audit: [],
    },
  };
}

/** Rellena `extended` y precios inferidos desde `salePrice` / `costPrice` si faltan. */
export function normalizeProductForWorkspace(product: UiProduct): UiProduct {
  const clone = cloneProduct(product);
  clone.extended = normalizeExtended(clone.extended, clone.salePrice, clone.costPrice);
  return clone;
}

export function statusLabel(status: UiProduct['status']): string {
  if (status === 'active') return 'ACTIVO';
  if (status === 'inactive') return 'INACTIVO';
  return 'DESCONTINUADO';
}

export function statusFromLabel(label: string): UiProduct['status'] {
  if (label === 'INACTIVO') return 'inactive';
  if (label === 'DESCONTINUADO') return 'discontinued';
  return 'active';
}

/** Resumen legible de los cambios para la pestaña Auditoría. */
export function summarizeDiff(prev: UiProduct, next: UiProduct): string {
  const parts: string[] = [];
  const pick = (label: string, a: unknown, b: unknown) => {
    if (a !== b) parts.push(`${label}: ${b ?? '-'}`);
  };
  pick('Nombre', prev.name, next.name);
  pick('Marca', prev.brand ?? '', next.brand ?? '');
  pick('SKU', prev.code ?? '', next.code ?? '');
  pick('Código barras', prev.barcode ?? '', next.barcode ?? '');
  pick('Precio público', prev.salePrice, next.salePrice);
  pick('Precio compra', prev.costPrice, next.costPrice);
  pick('Stock mínimo', prev.minStock, next.minStock);
  pick('Stock máximo', prev.maxStock ?? '', next.maxStock ?? '');
  pick('Control de lotes', prev.trackBatches ? 'Sí' : 'No', next.trackBatches ? 'Sí' : 'No');
  pick('Línea', prev.line, next.line);
  pick('Categoría', prev.category, next.category);
  pick('Proveedor', prev.supplierName ?? '', next.supplierName ?? '');
  pick('Estado', statusLabel(prev.status), statusLabel(next.status));
  if (
    prev.extended?.saleValueNet !== next.extended?.saleValueNet ||
    prev.extended?.purchaseValueNet !== next.extended?.purchaseValueNet
  ) {
    parts.push(
      `Precios neto venta/neto compra: ${next.extended?.saleValueNet ?? 0} / ${next.extended?.purchaseValueNet ?? 0}`,
    );
  }
  return parts.slice(0, 16).join('\n');
}
