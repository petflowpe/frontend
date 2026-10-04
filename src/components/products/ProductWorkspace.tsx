import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Barcode as BarcodeIcon,
  CalendarDays,
  FileSpreadsheet,
  Hash,
  ImageIcon,
  Link2,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Rows3,
  Save,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import type { CatalogItem } from '../../hooks/useProductCatalog';
import { useProductKardex } from '../../hooks/useProductKardex';
import type {
  ProductCatalogSettings,
  ProductLotRow,
  ProviderOption,
  UiProduct,
} from '../../types/product';
import { formatCurrencyEs, parseDecimal, round2 } from '../../utils/numberFormat';
import { ProductImage } from '../ProductImage';
import { appConfirm } from '../ui/app-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DEFAULT_IGV_PERCENT, DEFAULT_WAREHOUSES } from './productCatalogConstants';
import { statusFromLabel, statusLabel, summarizeDiff } from './productDraftUtils';
import { ProductSupplierOffersPanel } from './ProductSupplierOffersPanel';

const PAGE_SIZE = 10;

type LucideIc = ComponentType<{ className?: string }>;

function IconField({ Icon, children }: { Icon: LucideIc; children: ReactNode }) {
  return (
    <div className="relative w-full [&_.icon-slot]:absolute [&_.icon-slot]:left-2.5 [&_.icon-slot]:top-2.5 [&_.icon-slot]:z-10 [&_input]:pl-9">
      <Icon className="icon-slot pointer-events-none h-4 w-4 text-muted-foreground" />
      {children}
    </div>
  );
}

function paginateSlice<T>(arr: T[], page: number) {
  return arr.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

function safeDate(value: string, pattern = 'dd-MM-yyyy HH:mm') {
  try {
    return format(parseISO(value), pattern, { locale: es });
  } catch {
    return value;
  }
}

function formatCreationSummary(p: UiProduct): string {
  const ex = p.extended;
  return [
    `Nombre: ${p.name}`,
    `SKU: ${p.code || '(autogenerado)'}`,
    `Marca: ${p.brand || '-'}`,
    `Proveedor: ${p.supplierName || '-'}`,
    `Línea: ${p.line}`,
    `Categoría: ${p.category || '-'}`,
    `Subcategoría: ${p.subcategory || '—'}`,
    `UM: ${p.unit}`,
    `Stock mín / máx: ${p.minStock} / ${p.maxStock ?? '—'}`,
    `Disponible ventas: ${ex.salesAvailable ? 'SI' : 'NO'}`,
    `Estado: ${statusLabel(p.status)}`,
    `Valor venta neto: ${formatCurrencyEs(ex.saleValueNet ?? 0)}`,
    `Precio compra total: ${formatCurrencyEs(p.costPrice)}`,
  ].join('\n');
}

/** Patrón decorativo estable para la vista previa de etiqueta. */
function barcodeStripes(code: string): number[] {
  if (!code) return [];
  const stripes: number[] = [];
  for (let i = 0; i < code.length; i++) {
    const c = code.charCodeAt(i);
    stripes.push(1 + (c % 3), 1 + ((c >> 2) % 3));
  }
  return stripes;
}

export interface ProductWorkspaceProps {
  open: boolean;
  draft: UiProduct;
  patchDraft: (fn: (p: UiProduct) => UiProduct) => void;
  baseline: UiProduct;
  providers: ProviderOption[];
  categories: CatalogItem[];
  brands: CatalogItem[];
  areas: CatalogItem[];
  catalog: ProductCatalogSettings;
  companyId?: number | null;
  currentUserName: string;
  isNew: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (product: UiProduct) => Promise<boolean> | boolean;
  onAdjustStock?: (
    productId: string,
    quantity: number,
    type: 'add' | 'subtract' | 'set',
    areaId?: number,
  ) => Promise<void>;
  onUploadImage?: (productId: string, file: File) => Promise<string | null>;
  onDeleteImage?: (productId: string) => Promise<void>;
}

export function ProductWorkspace(props: ProductWorkspaceProps) {
  const {
    open,
    draft,
    patchDraft,
    baseline,
    providers,
    categories,
    brands,
    areas,
    catalog,
    companyId,
    currentUserName,
    isNew,
    saving = false,
    onClose,
    onSave,
    onAdjustStock,
    onUploadImage,
    onDeleteImage,
  } = props;

  const ex = draft.extended;
  const [tab, setTab] = useState('editar');
  const [aPage, setAPage] = useState(1);
  const [lPage, setLPage] = useState(1);
  const [kPage, setKPage] = useState(1);
  const [lotOpen, setLotOpen] = useState(false);
  const [lotForm, setLotForm] = useState<ProductLotRow>({
    id: '',
    registeredAt: new Date().toISOString(),
    lotNumber: '',
    warehouse: 'Principal',
    expiresAt: '',
    qtyIn: 0,
    balance: 0,
  });

  const [calcCostNet, setCalcCostNet] = useState('0');
  const [calcTaxVenta, setCalcTaxVenta] = useState(String(DEFAULT_IGV_PERCENT));
  const [calcMargenPct, setCalcMargenPct] = useState('60');

  const [stockQty, setStockQty] = useState('1');
  const [stockAreaId, setStockAreaId] = useState<string>(
    draft.areaId ? String(draft.areaId) : areas[0]?.id ? String(areas[0].id) : '',
  );
  const [stockBusy, setStockBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);

  const warehouses = useMemo(
    () => (areas.length > 0 ? areas.map((a) => a.name) : [...DEFAULT_WAREHOUSES]),
    [areas],
  );

  const kardex = useProductKardex(draft.id || undefined, companyId, !isNew && tab === 'kardex');

  useEffect(() => {
    setAPage(1);
    setLPage(1);
    setKPage(1);
    setCalcCostNet(String(draft.extended.purchaseValueNet ?? 0));
    setCalcTaxVenta(String(draft.extended.saleTaxPercent ?? DEFAULT_IGV_PERCENT));
    setStockAreaId(draft.areaId ? String(draft.areaId) : areas[0]?.id ? String(areas[0].id) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.id]);

  /* --------------------------- precios derivados -------------------------- */

  const saleTaxAmt = useMemo(() => {
    if (ex.saleTaxExempt) return 0;
    return round2(Number(ex.saleValueNet ?? 0) * (Number(ex.saleTaxPercent ?? 0) / 100));
  }, [ex.saleTaxExempt, ex.saleValueNet, ex.saleTaxPercent]);

  const publicSale = useMemo(
    () => round2(Number(ex.saleValueNet ?? 0) + saleTaxAmt),
    [ex.saleValueNet, saleTaxAmt],
  );

  const purchaseTaxAmt = useMemo(() => {
    if (ex.purchaseTaxExempt) return 0;
    return round2(Number(ex.purchaseValueNet ?? 0) * (Number(ex.purchaseTaxPercent ?? 0) / 100));
  }, [ex.purchaseTaxExempt, ex.purchaseValueNet, ex.purchaseTaxPercent]);

  const purchaseTotal = useMemo(
    () => round2(Number(ex.purchaseValueNet ?? 0) + purchaseTaxAmt),
    [ex.purchaseValueNet, purchaseTaxAmt],
  );

  const grossMargin = useMemo(
    () => round2(Number(ex.saleValueNet ?? 0) - Number(ex.purchaseValueNet ?? 0)),
    [ex.saleValueNet, ex.purchaseValueNet],
  );

  const utilityPct = useMemo(() => {
    const pNet = Number(ex.purchaseValueNet ?? 0);
    return pNet > 0 ? round2((grossMargin / pNet) * 100) : 0;
  }, [grossMargin, ex.purchaseValueNet]);

  const calcSuggested = useMemo(() => {
    const cNet = parseDecimal(calcCostNet);
    const mp = parseDecimal(calcMargenPct);
    const tax = parseDecimal(calcTaxVenta);
    const saleNet = round2(cNet * (1 + mp / 100));
    const taxAmt = round2(saleNet * (tax / 100));
    return { saleNet, taxAmt, publicP: round2(saleNet + taxAmt) };
  }, [calcCostNet, calcMargenPct, calcTaxVenta]);

  const applyCalculatorToPrices = useCallback(() => {
    patchDraft((p) => ({
      ...p,
      salePrice: calcSuggested.publicP,
      extended: {
        ...p.extended,
        saleValueNet: calcSuggested.saleNet,
        saleTaxPercent: parseDecimal(calcTaxVenta) || DEFAULT_IGV_PERCENT,
      },
    }));
    toast.success('Valores aplicados a la pestaña Precios');
  }, [calcSuggested, calcTaxVenta, patchDraft]);

  /* ------------------------------- guardado ------------------------------ */

  const handleSave = async () => {
    const name = draft.name.trim();
    if (!name) {
      toast.error('Completa el nombre del producto');
      setTab('editar');
      return;
    }
    if (!draft.line?.trim()) {
      toast.error('La línea es obligatoria');
      setTab('editar');
      return;
    }
    if (!draft.categoryId) {
      toast.error('Selecciona una categoría del catálogo de la empresa');
      setTab('editar');
      return;
    }

    const nextEx = { ...draft.extended };
    const net = Number(nextEx.saleValueNet ?? 0);
    const sTax = nextEx.saleTaxExempt ? 0 : round2(net * (Number(nextEx.saleTaxPercent ?? 0) / 100));
    const pNet = Number(nextEx.purchaseValueNet ?? 0);
    const pTax = nextEx.purchaseTaxExempt
      ? 0
      : round2(pNet * (Number(nextEx.purchaseTaxPercent ?? 0) / 100));
    nextEx.saleValueNet = round2(net);
    nextEx.purchaseValueNet = round2(pNet);

    let next: UiProduct = {
      ...draft,
      name,
      salePrice: round2(net + sTax),
      costPrice: round2(pNet + pTax),
      extended: nextEx,
    };

    const audit = [...(next.extended.audit ?? [])];
    const stamp = new Date().toISOString();
    if (isNew) {
      audit.unshift({
        id: `aud-${Date.now()}`,
        at: stamp,
        action: 'Creación',
        module: 'Productos',
        newValue: formatCreationSummary(next),
        responsible: currentUserName,
      });
    } else {
      const diffLine = summarizeDiff(baseline, next);
      if (diffLine) {
        audit.unshift({
          id: `aud-${Date.now()}`,
          at: stamp,
          action: 'Edición',
          module: 'Productos',
          newValue: diffLine,
          responsible: currentUserName,
        });
      }
    }
    next = { ...next, extended: { ...next.extended, audit: audit.slice(0, 200) } };

    await onSave(next);
  };

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(baseline),
    [draft, baseline],
  );

  const requestClose = useCallback(async () => {
    if (isDirty) {
      const ok = await appConfirm('Hay cambios sin guardar. ¿Salir sin guardar?');
      if (!ok) return;
    }
    onClose();
  }, [isDirty, onClose]);

  /* --------------------------------- stock -------------------------------- */

  const runStockAdjust = async (type: 'add' | 'subtract' | 'set') => {
    if (!onAdjustStock || !draft.id) return;
    const qty = parseDecimal(stockQty);
    if (!Number.isFinite(qty) || qty < 0) {
      toast.error('Ingresa una cantidad válida');
      return;
    }
    if (type !== 'set' && qty <= 0) {
      toast.error('La cantidad debe ser mayor que cero');
      return;
    }
    setStockBusy(true);
    try {
      await onAdjustStock(draft.id, qty, type, stockAreaId ? Number(stockAreaId) : undefined);
    } finally {
      setStockBusy(false);
    }
  };

  /* -------------------------------- galería ------------------------------- */

  const handleImageFile = async (file?: File | null) => {
    if (!file || !onUploadImage || !draft.id) return;
    setImageBusy(true);
    try {
      const path = await onUploadImage(draft.id, file);
      if (path) patchDraft((p) => ({ ...p, imagePath: path }));
    } finally {
      setImageBusy(false);
    }
  };

  const handleImageRemove = async () => {
    if (!onDeleteImage || !draft.id || !draft.imagePath) return;
    if (!(await appConfirm('¿Quitar la imagen del producto?'))) return;
    setImageBusy(true);
    try {
      await onDeleteImage(draft.id);
      patchDraft((p) => ({ ...p, imagePath: undefined }));
    } finally {
      setImageBusy(false);
    }
  };

  /* ------------------------------- exportar ------------------------------- */

  const exportKardexXlsx = useCallback(() => {
    const header = ['Fecha', 'Documento', 'Tipo', 'Entrada', 'Salida', 'Costo unit.', 'Total', 'Saldo', 'Notas'];
    const body = kardex.rows.map((r) => [
      r.date,
      r.referenceDoc,
      r.operationType,
      r.qtyIn,
      r.qtyOut,
      r.unitCost,
      r.totalCost,
      r.balance,
      r.notes ?? '',
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([header, ...body]), 'Kardex');
    XLSX.writeFile(wb, `kardex-${draft.code || draft.id}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Kardex exportado');
  }, [draft.code, draft.id, kardex.rows]);

  const auditRows = ex.audit ?? [];
  const lotRows = ex.lots ?? [];
  const aTotal = Math.max(1, Math.ceil(auditRows.length / PAGE_SIZE));
  const lTotal = Math.max(1, Math.ceil(lotRows.length / PAGE_SIZE));
  const kTotal = Math.max(1, Math.ceil(kardex.rows.length / PAGE_SIZE));
  const stripes = useMemo(() => barcodeStripes(String(draft.barcode ?? '').trim()), [draft.barcode]);

  if (!open) return null;

  const saveButton = (extraClass = '') => (
    <Button
      type="button"
      className={`bg-emerald-600 text-white hover:bg-emerald-500 ${extraClass}`}
      disabled={saving}
      onClick={() => void handleSave()}
      data-testid="product-save"
    >
      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Guardar cambios
    </Button>
  );

  return (
    <div className="flex min-h-[70vh] flex-col" data-testid="product-workspace">
      <header className="sticky top-0 z-30 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-1 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => void requestClose()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Regresar al listado
          </Button>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
            <ProductImage path={draft.imagePath} alt={draft.name || 'Producto'} className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs uppercase tracking-wider text-muted-foreground">
              {isNew ? 'Nuevo producto' : `Producto · ${draft.code || 'sin SKU'}`}
            </div>
            <div className="truncate text-lg font-semibold text-foreground">
              {draft.name.trim() || 'Nuevo producto'}
            </div>
          </div>
          {isDirty && (
            <Badge className="border border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300">
              Cambios sin guardar
            </Badge>
          )}
        </div>
        {saveButton()}
      </header>

      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col py-3">
        <TabsList className="mb-3 h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto border border-border bg-muted p-2">
          {[
            ['editar', 'Editar'],
            ['precios', 'Precios'],
            ['proveedor', 'Proveedor'],
            ['stock', 'Stock'],
            ['barcode', 'Código de barras'],
            ['factor', 'Factor de compra'],
            ['kardex', 'Kardex'],
            ['calc', 'Calculadora de precio'],
            ['audit', 'Auditoría'],
            ['gallery', 'Galería'],
            ['lotes', 'Lotes'],
          ].map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="shrink-0 text-[11px] sm:text-xs">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-h-0 flex-1">
          {/* ------------------------------ Editar ----------------------------- */}
          <TabsContent value="editar" className="mt-0 space-y-4">
            <Card className="border-border bg-card">
              <CardContent className="space-y-4 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>
                      Nombre del producto <span className="text-red-500">*</span>
                    </Label>
                    <IconField Icon={Package}>
                      <Input
                        data-testid="product-name-input"
                        value={draft.name}
                        onChange={(e) => patchDraft((p) => ({ ...p, name: e.target.value }))}
                      />
                    </IconField>
                  </div>
                  <div className="space-y-2">
                    <Label>Marca</Label>
                    <Select
                      value={draft.brandId ? String(draft.brandId) : 'none'}
                      onValueChange={(value) => {
                        const brand = brands.find((b) => String(b.id) === value);
                        patchDraft((p) => ({
                          ...p,
                          brandId: value === 'none' ? undefined : brand?.id,
                          brand: value === 'none' ? '' : brand?.name ?? '',
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin marca</SelectItem>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Código de sistema (SKU)</Label>
                    <IconField Icon={Rows3}>
                      <Input
                        value={draft.code}
                        placeholder={isNew ? 'Autogenerado si se deja vacío' : 'SKU del producto'}
                        onChange={(e) => patchDraft((p) => ({ ...p, code: e.target.value }))}
                      />
                    </IconField>
                    <p className="text-[11px] text-muted-foreground">
                      Único por empresa. Si lo dejas vacío al crear, el sistema lo genera.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Código personalizado</Label>
                    <IconField Icon={Hash}>
                      <Input
                        value={ex.customCode ?? ''}
                        onChange={(e) =>
                          patchDraft((p) => ({
                            ...p,
                            extended: { ...p.extended, customCode: e.target.value },
                          }))
                        }
                      />
                    </IconField>
                  </div>
                  <div className="space-y-2">
                    <Label>Código de barras</Label>
                    <IconField Icon={Tag}>
                      <Input
                        value={draft.barcode ?? ''}
                        onChange={(e) => patchDraft((p) => ({ ...p, barcode: e.target.value }))}
                      />
                    </IconField>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Presentación</Label>
                    <Select
                      value={ex.presentation ?? 'Botella'}
                      onValueChange={(v) =>
                        patchDraft((p) => ({ ...p, extended: { ...p.extended, presentation: v } }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {catalog.presentations.map((pr) => (
                          <SelectItem key={pr} value={pr}>
                            {pr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Contenido</Label>
                    <Input
                      value={ex.content ?? ''}
                      onChange={(e) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: { ...p.extended, content: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidad de medida</Label>
                    <Select value={draft.unit} onValueChange={(v) => patchDraft((p) => ({ ...p, unit: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {catalog.units.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Proveedor</Label>
                    <Select
                      value={draft.supplierId ? String(draft.supplierId) : 'none'}
                      onValueChange={(value) => {
                        const provider = providers.find((x) => String(x.id) === value);
                        patchDraft((p) => ({
                          ...p,
                          supplierId: value === 'none' ? undefined : provider?.id,
                          supplierName: value === 'none' ? '' : provider?.name ?? '',
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin proveedor</SelectItem>
                        {providers.map((pr) => (
                          <SelectItem key={pr.id} value={String(pr.id)}>
                            {pr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>
                      Línea <span className="text-red-500">*</span>
                    </Label>
                    <Select value={draft.line} onValueChange={(v) => patchDraft((p) => ({ ...p, line: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {catalog.lines.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Categoría <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={draft.categoryId ? String(draft.categoryId) : 'none'}
                      onValueChange={(value) => {
                        const category = categories.find((c) => String(c.id) === value);
                        patchDraft((p) => ({
                          ...p,
                          categoryId: value === 'none' ? undefined : category?.id,
                          category: value === 'none' ? '' : category?.name ?? '',
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Seleccione</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subcategoría</Label>
                    <Select
                      value={draft.subcategory?.trim() ? draft.subcategory : 'none'}
                      onValueChange={(v) =>
                        patchDraft((p) => ({ ...p, subcategory: v === 'none' ? '' : v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Seleccione</SelectItem>
                        {catalog.subcategories.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input
                    value={draft.description ?? ''}
                    placeholder="Notas visibles en catálogo y documentos"
                    onChange={(e) => patchDraft((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <Separator />

                <div className="grid gap-3 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Stock actual</Label>
                    <IconField Icon={Rows3}>
                      <Input readOnly disabled className="opacity-70" value={String(draft.stockAvailable)} />
                    </IconField>
                    <p className="text-[11px] text-muted-foreground">Se ajusta en la pestaña Stock.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Stock mínimo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.minStock}
                      onChange={(e) =>
                        patchDraft((p) => ({ ...p, minStock: Math.max(0, parseDecimal(e.target.value)) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock máximo</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.maxStock ?? ''}
                      onChange={(e) =>
                        patchDraft((p) => ({
                          ...p,
                          maxStock: e.target.value === '' ? undefined : Math.max(0, parseDecimal(e.target.value)),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lotes y vencimientos</Label>
                    <label className="flex h-9 items-center gap-2 text-sm">
                      <Checkbox
                        checked={!!draft.trackBatches}
                        onCheckedChange={(c) => patchDraft((p) => ({ ...p, trackBatches: c === true }))}
                      />
                      Controlar lotes (FEFO)
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      Las salidas consumen primero el lote que vence antes.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Área / almacén</Label>
                    <Select
                      value={draft.areaId ? String(draft.areaId) : 'none'}
                      onValueChange={(value) => {
                        const area = areas.find((a) => String(a.id) === value);
                        patchDraft((p) => ({
                          ...p,
                          areaId: value === 'none' ? undefined : area?.id,
                          location: value === 'none' ? '' : area?.name ?? '',
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Seleccione</SelectItem>
                        {areas.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      Almacén preferido para ajustes de stock (se guarda con el producto).
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Disponible ventas</Label>
                    <Select
                      value={(ex.salesAvailable ?? true) ? 'yes' : 'no'}
                      onValueChange={(v) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: { ...p.extended, salesAvailable: v === 'yes' },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">SI</SelectItem>
                        <SelectItem value="no">NO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Frecuencia (días)</Label>
                    <IconField Icon={CalendarDays}>
                      <Input
                        value={ex.applicationFrequencyDays ?? ''}
                        onChange={(e) =>
                          patchDraft((p) => ({
                            ...p,
                            extended: { ...p.extended, applicationFrequencyDays: e.target.value },
                          }))
                        }
                      />
                    </IconField>
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={statusLabel(draft.status)}
                      onValueChange={(v) => patchDraft((p) => ({ ...p, status: statusFromLabel(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVO">ACTIVO</SelectItem>
                        <SelectItem value="INACTIVO">INACTIVO</SelectItem>
                        <SelectItem value="DESCONTINUADO">DESCONTINUADO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ICBPER</Label>
                    <Select
                      value={ex.icbperGravado ? 'yes' : 'no'}
                      onValueChange={(v) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: { ...p.extended, icbperGravado: v === 'yes' },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">SI</SelectItem>
                        <SelectItem value="no">NO</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">Grava bolsas plásticas y similares.</p>
                  </div>
                </div>

                <div className="space-y-2 md:max-w-xs">
                  <Label>Puntos de fidelidad</Label>
                  <IconField Icon={Star}>
                    <Input
                      type="number"
                      min={0}
                      value={ex.loyaltyPoints ?? 0}
                      onChange={(e) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: {
                            ...p.extended,
                            loyaltyPoints: Math.max(0, parseDecimal(e.target.value)),
                          },
                        }))
                      }
                    />
                  </IconField>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------------------ Precios ---------------------------- */}
          <TabsContent value="precios" className="mt-0 space-y-4">
            <Card className="border-border bg-card">
              <CardContent className="space-y-4 p-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-foreground">Ventas</div>
                    <Label>Valor venta (sin impuestos)</Label>
                    <Input
                      value={String(ex.saleValueNet ?? 0)}
                      onChange={(e) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: { ...p.extended, saleValueNet: parseDecimal(e.target.value) },
                        }))
                      }
                    />
                    <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
                      <div className="space-y-2">
                        <Label>IGV ventas (%)</Label>
                        <Input
                          value={String(ex.saleTaxPercent ?? DEFAULT_IGV_PERCENT)}
                          onChange={(e) =>
                            patchDraft((p) => ({
                              ...p,
                              extended: { ...p.extended, saleTaxPercent: parseDecimal(e.target.value) },
                            }))
                          }
                        />
                      </div>
                      <label className="flex items-center gap-2 pb-2 text-xs text-muted-foreground">
                        <Checkbox
                          checked={!!ex.saleTaxExempt}
                          onCheckedChange={(c) =>
                            patchDraft((p) => ({
                              ...p,
                              extended: { ...p.extended, saleTaxExempt: c === true },
                            }))
                          }
                        />
                        ¿Exonerado?
                      </label>
                    </div>
                    <Label>Impuesto ventas (monto)</Label>
                    <Input readOnly disabled value={String(saleTaxAmt)} className="opacity-70" />
                    <Label>Precio público (incl. imp.)</Label>
                    <Input
                      readOnly
                      disabled
                      value={String(publicSale)}
                      className="border-cyan-500/30 font-semibold opacity-90"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-foreground">Compra</div>
                    <Label>Valor compra (sin impuestos)</Label>
                    <Input
                      value={String(ex.purchaseValueNet ?? 0)}
                      onChange={(e) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: { ...p.extended, purchaseValueNet: parseDecimal(e.target.value) },
                        }))
                      }
                    />
                    <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
                      <div className="space-y-2">
                        <Label>IGV compra (%)</Label>
                        <Input
                          value={String(ex.purchaseTaxPercent ?? DEFAULT_IGV_PERCENT)}
                          onChange={(e) =>
                            patchDraft((p) => ({
                              ...p,
                              extended: {
                                ...p.extended,
                                purchaseTaxPercent: parseDecimal(e.target.value),
                              },
                            }))
                          }
                        />
                      </div>
                      <label className="flex items-center gap-2 pb-2 text-xs text-muted-foreground">
                        <Checkbox
                          checked={!!ex.purchaseTaxExempt}
                          onCheckedChange={(c) =>
                            patchDraft((p) => ({
                              ...p,
                              extended: { ...p.extended, purchaseTaxExempt: c === true },
                            }))
                          }
                        />
                        ¿Exonerado?
                      </label>
                    </div>
                    <Label>Monto impuesto compra</Label>
                    <Input readOnly disabled className="opacity-70" value={String(purchaseTaxAmt)} />
                    <Label>Precio compra total</Label>
                    <Input readOnly disabled className="opacity-70" value={String(purchaseTotal)} />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Descuento máximo (%)</Label>
                    <Input
                      value={String(ex.maxDiscountPercent ?? 0)}
                      onChange={(e) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: { ...p.extended, maxDiscountPercent: parseDecimal(e.target.value) },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Margen bruto</Label>
                    <Input readOnly disabled value={formatCurrencyEs(grossMargin)} className="opacity-70" />
                    <p className="text-[11px] text-muted-foreground">
                      Valor venta neto − valor compra neto.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Utilidad % (s/costo)</Label>
                    <Input readOnly disabled className="opacity-70" value={String(utilityPct)} />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <Label>Comisión vendedor</Label>
                    <Select
                      value={ex.commissionType === 'percent' ? 'percent' : 'fixed'}
                      onValueChange={(v) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: {
                            ...p.extended,
                            commissionType: v === 'percent' ? 'percent' : 'fixed',
                          },
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Monto fijo</SelectItem>
                        <SelectItem value="percent">Porcentaje</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="lg:col-span-2">
                    <Label>Aplicar % sobre</Label>
                    <Select
                      value={ex.commissionApplyOn || 'valor_venta'}
                      onValueChange={(v) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: { ...p.extended, commissionApplyOn: v },
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="valor_venta">Valor venta</SelectItem>
                        <SelectItem value="subtotal">Subtotal sin IGV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Comisión (S/)</Label>
                    <Input
                      className="mt-2"
                      value={String(ex.commissionAmount ?? 0)}
                      onChange={(e) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: { ...p.extended, commissionAmount: parseDecimal(e.target.value) },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Comisión (%)</Label>
                    <Input
                      className="mt-2"
                      value={String(ex.commissionPercent ?? 0)}
                      onChange={(e) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: { ...p.extended, commissionPercent: parseDecimal(e.target.value) },
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between gap-3">
              <Button type="button" variant="outline" onClick={() => void requestClose()}>
                Cancelar
              </Button>
              {saveButton()}
            </div>
          </TabsContent>

          {/* ----------------------------- Proveedor --------------------------- */}
          <TabsContent value="proveedor" className="mt-0 space-y-4">
            <ProductSupplierPanelSlot
              draft={draft}
              providers={providers}
              purchaseTotal={purchaseTotal}
              patchDraft={patchDraft}
            />
          </TabsContent>

          {/* ------------------------------- Stock ----------------------------- */}
          <TabsContent value="stock" className="mt-0 space-y-4">
            {isNew ? (
              <Card className="border-dashed border-border">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Guarda el producto primero. El stock inicial se toma del valor indicado al crear.
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="border border-dashed border-border bg-muted/40">
                  <CardContent className="grid gap-2 p-4 text-sm md:grid-cols-3">
                    {[
                      ['Stock disponible', draft.stockAvailable],
                      ['Stock mínimo', draft.minStock],
                      ['Stock máximo', draft.maxStock ?? '—'],
                    ].map(([label, value]) => (
                      <div key={String(label)} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="rounded-full bg-foreground/10 px-2 py-0.5 font-medium">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="border-border bg-card">
                  <CardContent className="space-y-4 p-4">
                    <p className="text-sm text-muted-foreground">
                      Cada ajuste queda registrado en el kardex (IN / OUT / ADJUST) del backend.
                    </p>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Área / almacén</Label>
                        <Select value={stockAreaId} onValueChange={setStockAreaId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                          <SelectContent>
                            {areas.map((a) => (
                              <SelectItem key={a.id} value={String(a.id)}>
                                {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min={0}
                          value={stockQty}
                          onChange={(e) => setStockQty(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap items-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={stockBusy || !onAdjustStock}
                          onClick={() => void runStockAdjust('add')}
                        >
                          <ArrowUp className="mr-2 h-4 w-4 text-emerald-600" />
                          Entrada
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={stockBusy || !onAdjustStock}
                          onClick={() => void runStockAdjust('subtract')}
                        >
                          <ArrowDown className="mr-2 h-4 w-4 text-red-600" />
                          Salida
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={stockBusy || !onAdjustStock}
                          onClick={() => void runStockAdjust('set')}
                        >
                          Fijar inventario
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* --------------------------- Código de barras ---------------------- */}
          <TabsContent value="barcode" className="mt-0 space-y-4">
            <Card className="border-border bg-card">
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-[220px] flex-1 space-y-2">
                    <Label>Código de barras</Label>
                    <IconField Icon={BarcodeIcon}>
                      <Input
                        value={draft.barcode ?? ''}
                        onChange={(e) => patchDraft((p) => ({ ...p, barcode: e.target.value }))}
                      />
                    </IconField>
                  </div>
                </div>
                <div className="mx-auto w-full max-w-sm rounded-lg border border-border bg-white p-4 text-center text-slate-800">
                  <div className="text-sm font-semibold">{draft.name || 'Producto'}</div>
                  <div className="text-xs text-slate-500">
                    {draft.brand || '—'} · {draft.unit}
                  </div>
                  <div className="my-3 flex h-16 items-end justify-center gap-[2px]">
                    {stripes.length === 0 ? (
                      <span className="text-xs text-slate-400">Ingresa un código para ver la etiqueta</span>
                    ) : (
                      stripes.map((w, i) => (
                        <span
                          key={`stripe-${i}`}
                          className="inline-block h-full bg-slate-900"
                          style={{ width: `${w}px`, opacity: i % 2 === 0 ? 1 : 0.15 }}
                        />
                      ))
                    )}
                  </div>
                  <div className="font-mono text-sm tracking-[0.2em]">{draft.barcode || '—'}</div>
                  <div className="mt-1 text-sm font-bold">{formatCurrencyEs(draft.salePrice)}</div>
                </div>
                <div className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-900 dark:text-cyan-100">
                  <ImageIcon className="mr-1 inline h-3.5 w-3.5" />
                  Vista previa de etiqueta. La generación de imágenes CODE128 / QR escaneables
                  requiere las librerías <code>jsbarcode</code> y <code>qrcode</code>, que no están
                  instaladas en este proyecto.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------------- Factor de compra ----------------------- */}
          <TabsContent value="factor" className="mt-0 space-y-4">
            <Card className="border-border bg-card">
              <CardContent className="space-y-4 p-4">
                <div className="rounded-lg border border-sky-500/35 bg-sky-500/10 px-3 py-2 text-xs text-sky-900 dark:text-sky-100">
                  Para compras en formato distinto al de venta (ej. caja → unidades).
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={!!ex.usePurchaseConversion}
                    onCheckedChange={(c) =>
                      patchDraft((p) => ({
                        ...p,
                        extended: { ...p.extended, usePurchaseConversion: c === true },
                      }))
                    }
                  />
                  Usar factor de conversión para este producto.
                </label>
                <div className="grid gap-3 md:max-w-lg">
                  <div className="space-y-2">
                    <Label>Nombre en compra</Label>
                    <IconField Icon={Link2}>
                      <Input
                        disabled={!ex.usePurchaseConversion}
                        value={ex.purchaseConversionLabel ?? ''}
                        onChange={(e) =>
                          patchDraft((p) => ({
                            ...p,
                            extended: { ...p.extended, purchaseConversionLabel: e.target.value },
                          }))
                        }
                      />
                    </IconField>
                  </div>
                  <div className="space-y-2">
                    <Label>Factor de compra</Label>
                    <Input
                      disabled={!ex.usePurchaseConversion}
                      type="number"
                      value={ex.purchaseConversionFactor ?? ''}
                      onChange={(e) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: {
                            ...p.extended,
                            purchaseConversionFactor:
                              e.target.value === '' ? undefined : parseDecimal(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio compra ref.</Label>
                    <Input
                      disabled={!ex.usePurchaseConversion}
                      type="number"
                      value={String(ex.purchaseConversionUnitPurchasePrice ?? 0)}
                      onChange={(e) =>
                        patchDraft((p) => ({
                          ...p,
                          extended: {
                            ...p.extended,
                            purchaseConversionUnitPurchasePrice: parseDecimal(e.target.value),
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between gap-3">
              <Button type="button" variant="outline" onClick={() => void requestClose()}>
                Cancelar
              </Button>
              {saveButton()}
            </div>
          </TabsContent>

          {/* ------------------------------ Kardex ----------------------------- */}
          <TabsContent value="kardex" className="mt-0 space-y-4">
            {isNew ? (
              <Card className="border-dashed border-border">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  El kardex aparece cuando el producto existe y tiene movimientos.
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">
                      Saldo según kardex: <strong>{kardex.currentStock}</strong> · Valorizado{' '}
                      <strong>{formatCurrencyEs(kardex.currentValue)}</strong>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => void kardex.reload()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualizar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={kardex.rows.length === 0}
                        onClick={exportKardexXlsx}
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Exportar
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="p-2">Fecha</th>
                          <th className="p-2">Documento</th>
                          <th className="p-2">Tipo</th>
                          <th className="p-2 text-right">Ent.</th>
                          <th className="p-2 text-right">Sal.</th>
                          <th className="p-2 text-right">Costo unit.</th>
                          <th className="p-2 text-right">Saldo</th>
                          <th className="p-2">Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kardex.loading ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-muted-foreground">
                              Cargando movimientos…
                            </td>
                          </tr>
                        ) : kardex.error ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-red-600">
                              {kardex.error}
                            </td>
                          </tr>
                        ) : kardex.rows.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-muted-foreground">
                              Sin movimientos.
                            </td>
                          </tr>
                        ) : (
                          paginateSlice(kardex.rows, kPage).map((row) => (
                            <tr key={row.id} className="border-t border-border/60">
                              <td className="p-2">{safeDate(row.date)}</td>
                              <td className="p-2">{row.referenceDoc}</td>
                              <td className="p-2">{row.operationType}</td>
                              <td className="p-2 text-right">{row.qtyIn || '—'}</td>
                              <td className="p-2 text-right">{row.qtyOut || '—'}</td>
                              <td className="p-2 text-right">{formatCurrencyEs(row.unitCost)}</td>
                              <td className="p-2 text-right font-medium">{row.balance}</td>
                              <td className="p-2 text-muted-foreground">{row.notes ?? '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      Pág. {kPage}/{kTotal} · Total {kardex.rows.length}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" disabled={kPage <= 1} onClick={() => setKPage(1)}>
                        Primera
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={kPage <= 1}
                        onClick={() => setKPage((x) => Math.max(1, x - 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={kPage >= kTotal}
                        onClick={() => setKPage((x) => Math.min(kTotal, x + 1))}
                      >
                        Siguiente
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={kPage >= kTotal}
                        onClick={() => setKPage(kTotal)}
                      >
                        Última
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* --------------------------- Calculadora --------------------------- */}
          <TabsContent value="calc" className="mt-0 space-y-4">
            <Card className="border-border bg-card">
              <CardContent className="space-y-4 p-4">
                <p className="text-sm text-muted-foreground">
                  Calcula valor neto + IGV desde costo neto y utilidad % sobre costo.
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Costo neto</Label>
                    <Input value={calcCostNet} onChange={(e) => setCalcCostNet(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>IGV venta %</Label>
                    <Input value={calcTaxVenta} onChange={(e) => setCalcTaxVenta(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Utilidad % s/costo</Label>
                    <Input value={calcMargenPct} onChange={(e) => setCalcMargenPct(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Venta neto</div>
                    <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
                      {formatCurrencyEs(calcSuggested.saleNet)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">IGV</div>
                    <div className="text-lg font-semibold text-cyan-700 dark:text-cyan-200">
                      {formatCurrencyEs(calcSuggested.taxAmt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Público</div>
                    <div className="text-lg font-semibold text-foreground">
                      {formatCurrencyEs(calcSuggested.publicP)}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  className="bg-emerald-600 text-white hover:bg-emerald-500"
                  onClick={applyCalculatorToPrices}
                >
                  Aplicar a Precios
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ----------------------------- Auditoría --------------------------- */}
          <TabsContent value="audit" className="mt-0 space-y-4">
            <Card className="border-border bg-card">
              <CardContent className="space-y-3 p-4">
                <p className="text-xs text-muted-foreground">
                  Historial de cambios de la ficha (se guarda junto al producto).
                </p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="p-2">Fecha</th>
                        <th className="p-2">Acción</th>
                        <th className="p-2">Módulo</th>
                        <th className="p-2 min-w-[240px]">Detalle</th>
                        <th className="p-2">Resp.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            Sin auditoría.
                          </td>
                        </tr>
                      ) : (
                        paginateSlice(auditRows, aPage).map((row) => (
                          <tr key={row.id} className="border-t border-border/60 align-top">
                            <td className="p-2">{safeDate(row.at)}</td>
                            <td className="p-2">{row.action}</td>
                            <td className="p-2 text-muted-foreground">{row.module}</td>
                            <td className="whitespace-pre-wrap p-2 text-foreground">
                              {row.newValue ?? '—'}
                            </td>
                            <td className="p-2">{row.responsible}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Pág. {aPage}/{aTotal} · Total {auditRows.length}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" disabled={aPage <= 1} onClick={() => setAPage(1)}>
                      Primera
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={aPage <= 1}
                      onClick={() => setAPage((x) => Math.max(1, x - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={aPage >= aTotal}
                      onClick={() => setAPage((x) => Math.min(aTotal, x + 1))}
                    >
                      Siguiente
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={aPage >= aTotal}
                      onClick={() => setAPage(aTotal)}
                    >
                      Última
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------------------ Galería ---------------------------- */}
          <TabsContent value="gallery" className="mt-0 space-y-4">
            <Card className="border-border bg-card">
              <CardContent className="space-y-4 p-4">
                {isNew ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Guarda el producto primero para poder subir su imagen.
                  </p>
                ) : (
                  <>
                    <Label>Imagen del producto</Label>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="h-40 w-40 shrink-0 overflow-hidden rounded-lg border bg-muted">
                        <ProductImage
                          path={draft.imagePath}
                          alt={draft.name || 'Producto'}
                          className="h-full w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="cursor-pointer"
                          disabled={imageBusy || !onUploadImage}
                          onChange={(e) => void handleImageFile(e.target.files?.[0])}
                        />
                        {draft.imagePath && onDeleteImage && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={imageBusy}
                            onClick={() => void handleImageRemove()}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Quitar imagen
                          </Button>
                        )}
                        <p className="max-w-sm text-[11px] text-muted-foreground">
                          El API almacena una imagen principal por producto; la galería múltiple de
                          Grooflow no está soportada por el backend.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------------------- Lotes ----------------------------- */}
          <TabsContent value="lotes" className="mt-0 space-y-4">
            <Card className="border border-dashed border-border bg-muted/40">
              <CardContent className="grid gap-2 p-4 text-sm md:grid-cols-2">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Disponible</span>
                  <span className="rounded-full bg-foreground/10 px-2">{draft.stockAvailable}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Lotes registrados</span>
                  <span className="rounded-full bg-foreground/10 px-2">{lotRows.length}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="space-y-3 p-4">
                <Button
                  type="button"
                  className="bg-emerald-600 text-white hover:bg-emerald-500"
                  onClick={() => {
                    setLotForm({
                      id: '',
                      registeredAt: new Date().toISOString(),
                      lotNumber: '',
                      warehouse: warehouses[0] ?? 'Principal',
                      expiresAt: '',
                      qtyIn: 0,
                      balance: 0,
                    });
                    setLotOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar lote
                </Button>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="p-2">Fecha</th>
                        <th className="p-2"># Lote</th>
                        <th className="p-2">Almacén</th>
                        <th className="p-2">Vcto.</th>
                        <th className="p-2 text-right">Ent.</th>
                        <th className="p-2 text-right">Saldo</th>
                        <th className="p-2">Opc.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lotRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            Sin lotes.
                          </td>
                        </tr>
                      ) : (
                        paginateSlice(lotRows, lPage).map((row) => (
                          <tr key={row.id} className="border-t border-border/60">
                            <td className="p-2">{safeDate(row.registeredAt, 'dd-MM-yyyy')}</td>
                            <td className="p-2">{row.lotNumber}</td>
                            <td className="p-2">{row.warehouse}</td>
                            <td className="p-2 text-muted-foreground">{row.expiresAt || '—'}</td>
                            <td className="p-2 text-right">{row.qtyIn}</td>
                            <td className="p-2 text-right">{row.balance}</td>
                            <td className="p-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                                onClick={() =>
                                  patchDraft((p) => ({
                                    ...p,
                                    extended: {
                                      ...p.extended,
                                      lots: (p.extended.lots ?? []).filter((x) => x.id !== row.id),
                                    },
                                  }))
                                }
                              >
                                Quitar
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-[11px] text-sky-900 dark:text-sky-100">
                  Los lotes son informativos: se guardan en la metadata del producto y no generan
                  movimientos de stock por sí solos.
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Pág. {lPage}/{lTotal} · Total {lotRows.length}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" disabled={lPage <= 1} onClick={() => setLPage(1)}>
                      Primera
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={lPage <= 1}
                      onClick={() => setLPage((x) => Math.max(1, x - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={lPage >= lTotal}
                      onClick={() => setLPage((x) => Math.min(lTotal, x + 1))}
                    >
                      Siguiente
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={lPage >= lTotal}
                      onClick={() => setLPage(lTotal)}
                    >
                      Última
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>

        <div className="sticky bottom-0 z-30 mt-4 border-t border-border bg-card/95 px-1 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <Button type="button" variant="outline" onClick={() => void requestClose()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Regresar al listado
            </Button>
            {saveButton()}
          </div>
        </div>
      </Tabs>

      <Dialog open={lotOpen} onOpenChange={setLotOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar lote</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-2">
              <Label># Lote</Label>
              <Input
                value={lotForm.lotNumber}
                onChange={(e) => setLotForm((f) => ({ ...f, lotNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Almacén</Label>
              <Select
                value={lotForm.warehouse}
                onValueChange={(v) => setLotForm((f) => ({ ...f, warehouse: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Vencimiento</Label>
              <Input
                type="date"
                value={lotForm.expiresAt ?? ''}
                onChange={(e) => setLotForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Cantidad entrada</Label>
              <Input
                type="number"
                min={0}
                value={lotForm.qtyIn}
                onChange={(e) =>
                  setLotForm((f) => ({ ...f, qtyIn: Math.max(0, parseDecimal(e.target.value)) }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setLotOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => {
                if (!lotForm.lotNumber.trim()) {
                  toast.error('Ingresa el número de lote');
                  return;
                }
                const qty = Number(lotForm.qtyIn) || 0;
                const row: ProductLotRow = {
                  ...lotForm,
                  id: `lot-${Date.now()}`,
                  registeredAt: new Date().toISOString(),
                  qtyIn: qty,
                  balance: qty,
                };
                patchDraft((p) => ({
                  ...p,
                  extended: { ...p.extended, lots: [row, ...(p.extended.lots ?? [])] },
                }));
                toast.success('Lote agregado — pulsa Guardar para persistir');
                setLotOpen(false);
              }}
            >
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Aísla el panel de proveedor para mantener legible el árbol de pestañas. */
function ProductSupplierPanelSlot({
  draft,
  providers,
  purchaseTotal,
  patchDraft,
}: {
  draft: UiProduct;
  providers: ProviderOption[];
  purchaseTotal: number;
  patchDraft: (fn: (p: UiProduct) => UiProduct) => void;
}) {
  return (
    <ProductSupplierOffersPanel
      productName={draft.name}
      providers={providers}
      canEdit
      supplierId={draft.supplierId}
      costPrice={purchaseTotal}
      onSupplierChange={(supplierId, supplierName) =>
        patchDraft((p) => ({ ...p, supplierId, supplierName }))
      }
      onCostPriceChange={(value) =>
        patchDraft((p) => {
          const exempt = p.extended.purchaseTaxExempt ?? false;
          const tax = Number(p.extended.purchaseTaxPercent ?? DEFAULT_IGV_PERCENT);
          const net = exempt ? round2(value) : round2(value / (1 + tax / 100));
          return { ...p, costPrice: round2(value), extended: { ...p.extended, purchaseValueNet: net } };
        })
      }
    />
  );
}
