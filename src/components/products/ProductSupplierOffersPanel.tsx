import { useMemo, useState } from 'react';
import { Building2, Mail, Phone, Search, Star, X } from 'lucide-react';

import type { ProviderOption } from '../../types/product';
import { formatCurrencyEs, parseDecimal } from '../../utils/numberFormat';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface Props {
  productName: string;
  providers: ProviderOption[];
  canEdit: boolean;
  /** Proveedor preferido actual del producto. */
  supplierId?: number;
  /** Precio de compra total (incl. impuestos) de la ficha. */
  costPrice: number;
  onSupplierChange: (supplierId: number | undefined, supplierName: string) => void;
  onCostPriceChange: (value: number) => void;
}

/**
 * Versión simplificada del panel de ofertas proveedor–producto de Grooflow.
 *
 * Grooflow guarda un catálogo de ofertas (multi-proveedor, historial de precios
 * y aprobaciones) en su almacén KV. El API Laravel de ClonSmarpet sólo modela
 * `products.supplier_id`, por lo que aquí se edita el proveedor preferido y el
 * precio de compra de referencia; el historial de precios por proveedor vive en
 * el módulo de Compras (órdenes de compra).
 */
export function ProductSupplierOffersPanel({
  productName,
  providers,
  canEdit,
  supplierId,
  costPrice,
  onSupplierChange,
  onCostPriceChange,
}: Props) {
  const [search, setSearch] = useState('');

  const purchaseProviders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return providers
      .filter((p) => p.active !== false)
      .filter((p) => (needle ? p.name.toLowerCase().includes(needle) : true));
  }, [providers, search]);

  const current = providers.find((p) => p.id === supplierId);

  return (
    <div className="space-y-4">
      <Card className="border-border bg-card">
        <CardContent className="space-y-4 p-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Proveedor y precio de compra</h3>
            <p className="text-xs text-muted-foreground">
              El producto <strong>{productName || 'sin nombre'}</strong> es único. Aquí se define el
              proveedor preferido y el costo de referencia; el historial de precios se genera desde
              las órdenes de compra.
            </p>
          </div>

          {current ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <div>
                  <div className="font-medium text-foreground">{current.name}</div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    {current.documentNumber && <span>RUC {current.documentNumber}</span>}
                    {current.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {current.phone}
                      </span>
                    )}
                    {current.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {current.email}
                      </span>
                    )}
                    {current.creditDays ? <span>Crédito {current.creditDays} d</span> : null}
                  </div>
                </div>
              </div>
              {canEdit && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-rose-600"
                  onClick={() => onSupplierChange(undefined, '')}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Quitar
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
              Sin proveedor asignado. Selecciona uno de la lista.
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Precio de compra total (incl. imp.)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                disabled={!canEdit}
                value={String(costPrice)}
                onChange={(e) => onCostPriceChange(parseDecimal(e.target.value))}
              />
              <p className="text-[11px] text-muted-foreground">
                Equivale a {formatCurrencyEs(costPrice)}. Se recalcula desde la pestaña Precios.
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Buscar proveedor</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Nombre del proveedor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-medium">Proveedores disponibles</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Proveedor</th>
                  <th className="px-3 py-2">Documento</th>
                  <th className="px-3 py-2">Contacto</th>
                  <th className="px-3 py-2">Crédito</th>
                  <th className="w-[140px] px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {purchaseProviders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      No hay proveedores activos que coincidan.
                    </td>
                  </tr>
                ) : (
                  purchaseProviders.map((provider) => {
                    const isPreferred = provider.id === supplierId;
                    return (
                      <tr key={provider.id} className="border-t border-border/60 hover:bg-muted/20">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5 font-medium">
                            {isPreferred ? (
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            ) : (
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            {provider.name}
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                          {provider.documentNumber || '—'}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {provider.phone || provider.email || '—'}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {provider.creditDays ? `${provider.creditDays} d` : '—'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {isPreferred ? (
                            <Badge variant="secondary">Preferido</Badge>
                          ) : canEdit ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => onSupplierChange(provider.id, provider.name)}
                            >
                              <Star className="mr-1 h-3.5 w-3.5" />
                              Marcar
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Las ofertas multi‑proveedor con historial y aprobación de precios se gestionan en el
            módulo Compras.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
