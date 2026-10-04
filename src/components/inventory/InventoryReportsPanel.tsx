import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Download, Loader2, RefreshCw, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { apiClient } from '../../utils/api/client';
import { API } from '../../utils/api/endpoints';
import { formatCurrency } from '../../utils/helpers';

interface ShrinkageKind {
  kind: 'expiry' | 'shrinkage' | 'shortage' | 'surplus';
  label: string;
  qty: number;
  value: number;
  count: number;
}

interface ShrinkageReport {
  kinds: ShrinkageKind[];
  loss_value: number;
  net_loss_value: number;
  sale_cost: number;
  loss_rate: number | null;
  by_product: {
    product_id: number;
    name: string;
    code?: string;
    expiry: number;
    shrinkage: number;
    shortage: number;
    qty: number;
    value: number;
  }[];
}

interface MarginTotals {
  revenue: number;
  cost?: number;
  supply_cost?: number;
  margin: number;
  margin_pct: number | null;
}

interface MarginReport {
  products: MarginTotals;
  services: MarginTotals;
  unlinked_revenue: number;
  rows: {
    product_id: number;
    name: string;
    code?: string;
    qty_sold: number;
    revenue: number;
    cost: number;
    margin: number;
    margin_pct: number | null;
  }[];
}

function monthStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}

function pct(value: number | null | undefined): string {
  return value == null ? '—' : `${value.toFixed(1)}%`;
}

function unwrap<T>(res: unknown): T | null {
  const raw = (res as { data?: unknown })?.data ?? res;
  return raw && typeof raw === 'object' ? (raw as T) : null;
}

function downloadCsv(filename: string, header: string[], rows: (string | number | null | undefined)[][]) {
  const escape = (v: string | number | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Reportes de mermas y margen bruto (productos y servicios) del período. */
export function InventoryReportsPanel({ companyId, areaId }: { companyId: number; areaId?: number | null }) {
  const [range, setRange] = useState({ start: monthStart(), end: new Date().toISOString().split('T')[0] });
  const [shrinkage, setShrinkage] = useState<ShrinkageReport | null>(null);
  const [margin, setMargin] = useState<MarginReport | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string | number> = {
      company_id: companyId,
      date_from: range.start,
      date_to: range.end,
    };
    try {
      const [s, m] = await Promise.all([
        apiClient.get(API.inventoryReports.shrinkage, areaId ? { ...params, area_id: areaId } : params),
        apiClient.get(API.inventoryReports.margin, params),
      ]);
      setShrinkage(unwrap<ShrinkageReport>(s));
      setMargin(unwrap<MarginReport>(m));
    } catch (e: any) {
      toast.error(e?.message || 'No se pudieron cargar los reportes');
    } finally {
      setLoading(false);
    }
  }, [companyId, areaId, range.start, range.end]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <h3 className="flex items-center gap-2 mr-auto font-medium">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Mermas y márgenes
        </h3>
        <div>
          <Label className="text-xs">Desde</Label>
          <Input type="date" className="h-8" value={range.start} onChange={(e) => setRange({ ...range, start: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">Hasta</Label>
          <Input type="date" className="h-8" value={range.end} onChange={(e) => setRange({ ...range, end: e.target.value })} />
        </div>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      <Tabs defaultValue="shrinkage">
        <TabsList>
          <TabsTrigger value="shrinkage">Mermas</TabsTrigger>
          <TabsTrigger value="margin">Margen</TabsTrigger>
        </TabsList>

        <TabsContent value="shrinkage" className="space-y-3">
          {shrinkage && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {shrinkage.kinds.map((k) => (
                  <Card key={k.kind} className="p-3">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className={`text-lg ${k.kind === 'surplus' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(k.value)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {k.qty} und. · {k.count} mov.
                    </p>
                  </Card>
                ))}
                <Card className="p-3 bg-red-50 dark:bg-red-950/20">
                  <p className="text-xs text-muted-foreground">Pérdida total</p>
                  <p className="text-lg text-red-600">{formatCurrency(shrinkage.loss_value)}</p>
                  <p className="text-xs text-muted-foreground">
                    {pct(shrinkage.loss_rate)} del costo de ventas
                  </p>
                </Card>
              </div>
              {shrinkage.by_product.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin mermas en el período.</p>
              ) : (
                <>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        downloadCsv(
                          `mermas_${range.start}_${range.end}.csv`,
                          ['Código', 'Producto', 'Vencimiento', 'Merma', 'Faltante', 'Unidades', 'Valor'],
                          shrinkage.by_product.map((r) => [r.code, r.name, r.expiry, r.shrinkage, r.shortage, r.qty, r.value])
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left font-medium">Producto</th>
                          <th className="p-2 text-right font-medium">Vencimiento</th>
                          <th className="p-2 text-right font-medium">Merma</th>
                          <th className="p-2 text-right font-medium">Faltante</th>
                          <th className="p-2 text-right font-medium">Unidades</th>
                          <th className="p-2 text-right font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shrinkage.by_product.map((r) => (
                          <tr key={r.product_id} className="border-t">
                            <td className="p-2">
                              {r.name}
                              {r.code && <span className="text-xs text-muted-foreground ml-1">({r.code})</span>}
                            </td>
                            <td className="p-2 text-right">{formatCurrency(r.expiry)}</td>
                            <td className="p-2 text-right">{formatCurrency(r.shrinkage)}</td>
                            <td className="p-2 text-right">{formatCurrency(r.shortage)}</td>
                            <td className="p-2 text-right">{r.qty}</td>
                            <td className="p-2 text-right font-medium text-red-600">{formatCurrency(r.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="margin" className="space-y-3">
          {margin && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Productos (venta neta sin IGV)</p>
                  <p className="text-lg">{formatCurrency(margin.products.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    Costo {formatCurrency(margin.products.cost ?? 0)} · Margen{' '}
                    <span className="font-medium text-green-600">{formatCurrency(margin.products.margin)}</span> (
                    {pct(margin.products.margin_pct)})
                  </p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Servicios (venta neta sin IGV)</p>
                  <p className="text-lg">{formatCurrency(margin.services.revenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    Insumos {formatCurrency(margin.services.supply_cost ?? 0)} · Margen{' '}
                    <span className="font-medium text-green-600">{formatCurrency(margin.services.margin)}</span> (
                    {pct(margin.services.margin_pct)})
                  </p>
                </Card>
              </div>
              {margin.unlinked_revenue > 0.005 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {formatCurrency(margin.unlinked_revenue)} en líneas sin producto vinculado no entran en el cálculo.
                </p>
              )}
              {margin.rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin ventas de productos en el período.</p>
              ) : (
                <>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        downloadCsv(
                          `margen_${range.start}_${range.end}.csv`,
                          ['Código', 'Producto', 'Unidades', 'Venta neta', 'Costo', 'Margen', 'Margen %'],
                          margin.rows.map((r) => [r.code, r.name, r.qty_sold, r.revenue, r.cost, r.margin, r.margin_pct])
                        )
                      }
                    >
                      <Download className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-x-auto max-h-[420px]">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="p-2 text-left font-medium">Producto</th>
                          <th className="p-2 text-right font-medium">Unidades</th>
                          <th className="p-2 text-right font-medium">Venta neta</th>
                          <th className="p-2 text-right font-medium">Costo</th>
                          <th className="p-2 text-right font-medium">Margen</th>
                          <th className="p-2 text-right font-medium">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {margin.rows.map((r) => (
                          <tr key={r.product_id} className="border-t">
                            <td className="p-2">
                              {r.name}
                              {r.code && <span className="text-xs text-muted-foreground ml-1">({r.code})</span>}
                            </td>
                            <td className="p-2 text-right">{r.qty_sold}</td>
                            <td className="p-2 text-right">{formatCurrency(r.revenue)}</td>
                            <td className="p-2 text-right">{formatCurrency(r.cost)}</td>
                            <td className={`p-2 text-right font-medium ${r.margin < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(r.margin)}
                            </td>
                            <td className="p-2 text-right">{pct(r.margin_pct)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
