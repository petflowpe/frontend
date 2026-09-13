import type { ProductCatalogSettings } from '../types/product';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_LINES,
  PRODUCT_PRESENTATIONS,
  PRODUCT_SUBCATEGORIES,
  PRODUCT_UNITS,
} from '../components/products/productCatalogConstants';

export function defaultProductCatalog(): ProductCatalogSettings {
  return {
    lines: [...PRODUCT_LINES],
    categories: [...PRODUCT_CATEGORIES],
    subcategories: [...PRODUCT_SUBCATEGORIES],
    units: [...PRODUCT_UNITS],
    presentations: [...PRODUCT_PRESENTATIONS],
  };
}

function mergeUnique(...groups: (string | undefined | null)[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  groups.flat().forEach((raw) => {
    const value = String(raw ?? '').trim();
    if (!value) return;
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(value);
  });
  return out;
}

interface BuildCatalogInput {
  /** Categorías del backend (`/categories`). */
  categories?: { name: string }[];
  /** Unidades del backend (`/units`). */
  units?: { name: string }[];
  /** Valores ya presentes en los productos cargados. */
  productLines?: (string | undefined)[];
  productCategories?: (string | undefined)[];
  productSubcategories?: (string | undefined)[];
  productUnits?: (string | undefined)[];
}

/**
 * Combina el catálogo del backend (categorías / unidades reales de la empresa)
 * con las listas por defecto y con lo que ya usan los productos existentes.
 */
export function buildProductCatalog(input: BuildCatalogInput = {}): ProductCatalogSettings {
  const base = defaultProductCatalog();
  return {
    lines: mergeUnique(base.lines, input.productLines ?? []),
    categories: mergeUnique(
      (input.categories ?? []).map((c) => c.name),
      input.productCategories ?? [],
      base.categories,
    ),
    subcategories: mergeUnique(base.subcategories, input.productSubcategories ?? []),
    units: mergeUnique(
      (input.units ?? []).map((u) => u.name),
      base.units,
      input.productUnits ?? [],
    ),
    presentations: base.presentations,
  };
}
