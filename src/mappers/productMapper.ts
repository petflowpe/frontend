import type { Product } from '../hooks/useInventory';
import type { Supplier } from '../hooks/useSuppliers';
import type {
  ProductExtended,
  ProductMetadata,
  ProductStatus,
  ProviderOption,
  UiProduct,
} from '../types/product';
import { round2 } from '../utils/numberFormat';
import { DEFAULT_IGV_PERCENT, DEFAULT_PRODUCT_LINE } from '../components/products/productCatalogConstants';

/* ------------------------------------------------------------------ *
 * Product (useInventory / API Laravel)  ->  UiProduct (ficha Grooflow)
 * ------------------------------------------------------------------ */

function resolveStatus(active: boolean | undefined, metaStatus?: ProductStatus): ProductStatus {
  if (active === false) return metaStatus === 'discontinued' ? 'discontinued' : 'inactive';
  return 'active';
}

/**
 * Rellena `extended` con valores derivados de precio/costo cuando la metadata
 * todavía no existe (productos creados con el formulario antiguo).
 */
export function normalizeExtended(
  extended: ProductExtended | undefined,
  salePrice: number,
  costPrice: number,
): ProductExtended {
  const ex = { ...(extended ?? {}) };
  const saleTax = ex.saleTaxPercent ?? DEFAULT_IGV_PERCENT;
  const purchaseTax = ex.purchaseTaxPercent ?? DEFAULT_IGV_PERCENT;
  const saleExempt = ex.saleTaxExempt ?? false;
  const purchaseExempt = ex.purchaseTaxExempt ?? false;

  let saleValueNet = ex.saleValueNet;
  if (saleValueNet == null || Number.isNaN(saleValueNet)) {
    saleValueNet = saleExempt ? round2(salePrice) : round2(salePrice / (1 + saleTax / 100));
  }

  let purchaseValueNet = ex.purchaseValueNet;
  if (purchaseValueNet == null || Number.isNaN(purchaseValueNet)) {
    purchaseValueNet =
      costPrice > 0
        ? purchaseExempt
          ? round2(costPrice)
          : round2(costPrice / (1 + purchaseTax / 100))
        : 0;
  }

  return {
    ...ex,
    saleTaxPercent: saleTax,
    purchaseTaxPercent: purchaseTax,
    saleTaxExempt: saleExempt,
    purchaseTaxExempt: purchaseExempt,
    saleValueNet,
    purchaseValueNet,
    salesAvailable: ex.salesAvailable ?? true,
    maxDiscountPercent: ex.maxDiscountPercent ?? 0,
    commissionType: ex.commissionType ?? 'fixed',
    commissionApplyOn: ex.commissionApplyOn ?? 'valor_venta',
    commissionAmount: ex.commissionAmount ?? 0,
    commissionPercent: ex.commissionPercent ?? 0,
    icbperGravado: ex.icbperGravado ?? false,
    loyaltyPoints: ex.loyaltyPoints ?? 0,
    presentation: ex.presentation ?? 'Botella',
    usePurchaseConversion: ex.usePurchaseConversion ?? false,
    lots: ex.lots ?? [],
    audit: ex.audit ?? [],
  };
}

/** Convierte un producto del API al shape que consume la ficha. */
export function toUiProduct(product: Product, suppliers: Supplier[] = []): UiProduct {
  const meta = (product.metadata ?? {}) as ProductMetadata;
  const supplier = suppliers.find((s) => s.id === product.supplierId);
  const salePrice = Number(product.price) || 0;
  const costPrice = Number(product.cost) || 0;

  return {
    id: String(product.id),
    code: product.code ?? '',
    barcode: product.barcode ?? '',
    name: product.name ?? '',
    brand: product.brand ?? '',
    brandId: product.brandId,
    category: product.category ?? '',
    categoryId: product.categoryId,
    subcategory: meta.subcategory ?? '',
    line: meta.line || DEFAULT_PRODUCT_LINE,
    unit: product.unit || 'NIU',
    supplierId: product.supplierId,
    supplierName: supplier?.name || product.supplierName || '',
    areaId: product.areaId ?? meta.preferred_area_id,
    location: product.location ?? '',
    salePrice,
    costPrice,
    stockAvailable: Number(product.stock) || 0,
    stockAccounting: Number(product.stock) || 0,
    minStock: Number(product.minStock) || 0,
    maxStock: product.maxStock,
    status: resolveStatus(product.active, meta.status),
    description: product.description ?? '',
    imagePath: product.imagePath,
    extended: normalizeExtended(meta.extended, salePrice, costPrice),
  };
}

export function toUiProducts(products: Product[], suppliers: Supplier[] = []): UiProduct[] {
  return products.map((p) => toUiProduct(p, suppliers));
}

/* ------------------------------------------------------------------ *
 * UiProduct  ->  Partial<Product> (payload de useInventory)
 * ------------------------------------------------------------------ */

export function buildProductMetadata(ui: UiProduct): Record<string, unknown> {
  const metadata: ProductMetadata = {
    line: ui.line || undefined,
    subcategory: ui.subcategory?.trim() || undefined,
    status: ui.status,
    preferred_area_id: ui.areaId,
    extended: ui.extended,
  };
  return metadata as unknown as Record<string, unknown>;
}

interface ToPayloadOptions {
  /** Incluir `stock` (solo tiene efecto al crear; el update usa ajustes). */
  includeStock?: boolean;
}

/** Convierte la ficha editada al `Partial<Product>` que espera `useInventory`. */
export function toInventoryPayload(ui: UiProduct, options: ToPayloadOptions = {}): Partial<Product> {
  const payload: Partial<Product> = {
    name: ui.name.trim(),
    code: ui.code?.trim() || undefined,
    barcode: ui.barcode?.trim() || '',
    description: ui.description?.trim() || '',
    category: ui.category,
    categoryId: ui.categoryId,
    brand: ui.brand ?? '',
    brandId: ui.brandId,
    supplierId: ui.supplierId,
    supplierName: ui.supplierName,
    areaId: ui.areaId,
    location: ui.location,
    price: round2(ui.salePrice),
    cost: round2(ui.costPrice),
    minStock: ui.minStock,
    maxStock: ui.maxStock,
    unit: ui.unit || 'NIU',
    active: ui.status === 'active',
    metadata: buildProductMetadata(ui),
  };

  if (options.includeStock) {
    payload.stock = ui.stockAvailable;
  }

  return payload;
}

/* ------------------------------------------------------------------ *
 * Proveedores
 * ------------------------------------------------------------------ */

export function toProviderOptions(suppliers: Supplier[]): ProviderOption[] {
  return suppliers
    .map((s) => ({
      id: s.id,
      name: s.name,
      active: s.active,
      documentNumber: s.document_number,
      phone: s.phone,
      email: s.email,
      creditDays: s.credit_days,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}
