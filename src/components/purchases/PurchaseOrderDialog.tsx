import { useMemo, useState } from 'react';
import { Plus, Save, X, AlertTriangle, ShoppingCart, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { paymentLabel } from '../suppliers/supplierUtils';
import type { Supplier } from '../../hooks/useSuppliers';
import type { Product } from '../../hooks/useInventory';

export type CartLine = {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit_cost?: number;
};

type Props = {
  purchase?: any;
  suppliers: Supplier[];
  catalogProducts: Product[];
  lowStockProducts: Array<{
    id: number;
    name: string;
    currentStock: number;
    minStock: number;
    unitPrice: number;
    supplierId?: number;
  }>;
  onSave: (data: any) => void;
  onClose: () => void;
};

export function PurchaseOrderDialog({
  purchase,
  suppliers,
  catalogProducts,
  lowStockProducts,
  onSave,
  onClose,
}: Props) {
  const [supplierId, setSupplierId] = useState<string>(
    purchase?.supplier_id ? String(purchase.supplier_id) : ''
  );
  const [deliveryDate, setDeliveryDate] = useState(
    purchase?.delivery_date || purchase?.deliveryDate || ''
  );
  const [notes, setNotes] = useState(purchase?.notes || '');
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>(() =>
    (purchase?.items || []).map((it: any) => ({
      id: it.product_id,
      product_id: it.product_id,
      name: it.name || it.productName || it.product?.name || 'Producto',
      quantity: it.quantity || 1,
      unitPrice: it.unitPrice ?? it.unit_cost ?? 0,
      total: (it.quantity || 1) * (it.unitPrice ?? it.unit_cost ?? 0),
    }))
  );

  const selectedSupplier = suppliers.find((s) => String(s.id) === supplierId);

  const productsForSupplier = useMemo(() => {
    const sid = Number(supplierId) || 0;
    let list = catalogProducts.filter((p) => p.active !== false);
    if (sid) {
      const ofSupplier = list.filter((p) => p.supplierId === sid);
      // Preferir productos del proveedor; si no hay, mostrar catálogo completo
      if (ofSupplier.length > 0) list = ofSupplier;
    }
    const q = productSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.code || '').toLowerCase().includes(q)
      );
    }
    return list.slice(0, 80);
  }, [catalogProducts, supplierId, productSearch]);

  const lowStockForSupplier = useMemo(() => {
    const sid = Number(supplierId) || 0;
    if (!sid) return lowStockProducts.slice(0, 20);
    return lowStockProducts.filter((p) => !p.supplierId || p.supplierId === sid).slice(0, 20);
  }, [lowStockProducts, supplierId]);

  const addProduct = (p: { id: number; name: string; unitPrice: number; quantity?: number }) => {
    const qty = p.quantity && p.quantity > 0 ? p.quantity : 1;
    setCart((prev) => {
      const existing = prev.find((c) => c.product_id === p.id);
      if (existing) {
        return prev.map((c) =>
          c.product_id === p.id
            ? {
                ...c,
                quantity: c.quantity + qty,
                total: (c.quantity + qty) * c.unitPrice,
              }
            : c
        );
      }
      return [
        ...prev,
        {
          id: p.id,
          product_id: p.id,
          name: p.name,
          quantity: qty,
          unitPrice: p.unitPrice,
          total: qty * p.unitPrice,
        },
      ];
    });
  };

  const updateQty = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.product_id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.product_id === productId
          ? { ...c, quantity, total: quantity * c.unitPrice }
          : c
      )
    );
  };

  const updateCost = (productId: number, unitPrice: number) => {
    setCart((prev) =>
      prev.map((c) =>
        c.product_id === productId
          ? { ...c, unitPrice, total: c.quantity * unitPrice }
          : c
      )
    );
  };

  const cartTotal = cart.reduce((s, c) => s + c.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || cart.length === 0) return;
    onSave({
      supplierId: Number(supplierId),
      deliveryDate,
      notes,
      date: new Date().toISOString().split('T')[0],
      items: cart.map((c) => ({
        product_id: c.product_id,
        id: c.product_id,
        name: c.name,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        unit_cost: c.unitPrice,
        total: c.total,
      })),
    });
  };

  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{purchase ? 'Editar orden de compra' : 'Nueva orden de compra'}</DialogTitle>
        <DialogDescription>
          Selecciona proveedor y productos del catálogo. Al recibir se actualizará stock y kardex.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label>Proveedor *</Label>
              <Select value={supplierId} onValueChange={setSupplierId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSupplier && (
                <div className="mt-2 p-3 bg-muted rounded-lg text-sm space-y-1">
                  <p>
                    <span className="font-semibold">Contacto:</span>{' '}
                    {selectedSupplier.contact_name || '—'}
                  </p>
                  <p>
                    <span className="font-semibold">Tel:</span> {selectedSupplier.phone || '—'}
                  </p>
                  <p>
                    <span className="font-semibold">Pago:</span>{' '}
                    {paymentLabel(selectedSupplier.credit_days).label}
                  </p>
                </div>
              )}
            </div>
            <div>
              <Label>Fecha de entrega</Label>
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instrucciones al proveedor..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Stock bajo (sugeridos)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
              {lowStockForSupplier.length === 0 ? (
                <p className="text-xs text-muted-foreground p-2">Sin alertas de stock bajo</p>
              ) : (
                lowStockForSupplier.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Stock {p.currentStock} / mín {p.minStock} · {p.unitPrice.toFixed(2)} S/
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        addProduct({
                          id: p.id,
                          name: p.name,
                          unitPrice: p.unitPrice,
                          quantity: Math.max(1, p.minStock - p.currentStock),
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos del catálogo..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              disabled={!supplierId}
            />
          </div>
          {!supplierId ? (
            <p className="text-sm text-muted-foreground">Elige un proveedor para listar productos</p>
          ) : (
            <div className="max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1">
              {productsForSupplier.map((p) => {
                const pid = Number(p.id);
                return (
                <button
                  key={p.id}
                  type="button"
                  className="text-left text-sm p-2 rounded hover:bg-muted flex justify-between gap-2"
                  onClick={() =>
                    addProduct({
                      id: pid,
                      name: p.name,
                      unitPrice: p.cost > 0 ? p.cost : p.price,
                    })
                  }
                >
                  <span className="truncate">{p.name}</span>
                  <span className="text-muted-foreground shrink-0">
                    {(p.cost > 0 ? p.cost : p.price).toFixed(2)} · stk {p.stock}
                  </span>
                </button>
              );})}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t pt-3 space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Ítems ({cart.length})
            </h4>
            {cart.map((item) => (
              <div
                key={item.product_id}
                className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-muted/40"
              >
                <span className="flex-1 text-sm font-medium min-w-[120px]">{item.name}</span>
                <Input
                  type="number"
                  min={0.001}
                  step="any"
                  className="w-20 h-8"
                  value={item.quantity}
                  onChange={(e) => updateQty(item.product_id, parseFloat(e.target.value) || 0)}
                />
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className="w-24 h-8"
                  value={item.unitPrice}
                  onChange={(e) => updateCost(item.product_id, parseFloat(e.target.value) || 0)}
                  title="Costo unitario"
                />
                <span className="text-sm font-semibold w-20 text-right">
                  {item.total.toFixed(2)}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-600"
                  onClick={() => updateQty(item.product_id, 0)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 font-bold text-lg">
              <span>Total</span>
              <span className="text-emerald-700 dark:text-emerald-300">
                {cartTotal.toFixed(2)} S/
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!supplierId || cart.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            {purchase ? 'Actualizar' : 'Crear orden'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
