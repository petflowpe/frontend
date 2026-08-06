import { useMemo, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Download,
  Truck,
  Package,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  PackageCheck,
  CreditCard,
  Layers,
  BarChart3,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePurchases, type PurchaseOrder, type PurchaseStatus } from '../hooks/usePurchases';
import { useSuppliers } from '../hooks/useSuppliers';
import { useInventory } from '../hooks/useInventory';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogTrigger } from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import { PurchaseOrderDialog } from './purchases/PurchaseOrderDialog';
import { ReceivePurchaseDialog } from './purchases/ReceivePurchaseDialog';
import { PayPurchaseDialog } from './purchases/PayPurchaseDialog';

const STATUS_LABEL: Record<PurchaseStatus, string> = {
  pending: 'Pendiente',
  in_transit: 'En tránsito',
  partial: 'Recepción parcial',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const PAY_LABEL: Record<string, string> = {
  unpaid: 'Por pagar',
  partial: 'Pago parcial',
  paid: 'Pagado',
};

function statusBadgeClass(status: PurchaseStatus) {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200';
    case 'in_transit':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200';
    case 'partial':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
  }
}

export function Purchases() {
  const { user } = useAuth();
  const companyId = user?.companyId ?? null;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showNewPurchase, setShowNewPurchase] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<PurchaseOrder | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseOrder | null>(null);
  const [receiveTarget, setReceiveTarget] = useState<PurchaseOrder | null>(null);
  const [payTarget, setPayTarget] = useState<PurchaseOrder | null>(null);

  const { suppliers } = useSuppliers(companyId);
  const {
    purchases,
    loading,
    createPurchase,
    updatePurchase,
    changeStatus,
    receivePurchase,
    completePurchase,
    payPurchase,
    deletePurchase,
    reload,
  } = usePurchases(companyId ?? 1);
  const { products: inventoryProducts } = useInventory();

  const activeSuppliers = useMemo(
    () => suppliers.filter((s) => s.active !== false),
    [suppliers]
  );

  const lowStockProducts = useMemo(
    () =>
      inventoryProducts
        .filter((p) => p.minStock > 0 && p.stock <= p.minStock)
        .map((p) => ({
          id: Number(p.id),
          name: p.name,
          currentStock: p.stock,
          minStock: p.minStock,
          unitPrice: p.cost > 0 ? p.cost : p.price,
          supplierId: p.supplierId,
        })),
    [inventoryProducts]
  );

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const supplierName =
        typeof p.supplier === 'string' ? p.supplier : p.supplierData?.name || '';
      const hay = `${p.order_number || ''} ${p.id} ${supplierName} ${p.invoice_number || ''}`.toLowerCase();
      if (searchTerm && !hay.includes(searchTerm.toLowerCase())) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (paymentFilter !== 'all' && (p.payment_status || 'unpaid') !== paymentFilter) return false;
      if (dateFrom && p.order_date && p.order_date < dateFrom) return false;
      if (dateTo && p.order_date && p.order_date > dateTo) return false;
      return true;
    });
  }, [purchases, searchTerm, statusFilter, paymentFilter, dateFrom, dateTo]);

  const kpis = useMemo(() => {
    const open = purchases.filter((p) => !['delivered', 'cancelled'].includes(p.status));
    const unpaid = purchases.filter((p) => (p.payment_status || 'unpaid') !== 'paid');
    const invested = purchases
      .filter((p) => p.status === 'delivered' || p.status === 'partial')
      .reduce((s, p) => s + p.total, 0);
    const payable = unpaid.reduce(
      (s, p) => s + Math.max(0, (p.invoice_total ?? p.total) - (p.amount_paid || 0)),
      0
    );
    return {
      openCount: open.length,
      lowStock: lowStockProducts.length,
      invested,
      payable,
    };
  }, [purchases, lowStockProducts.length]);

  const analyticsBySupplier = useMemo(() => {
    const map = new Map<number, { name: string; total: number; orders: number }>();
    for (const p of purchases) {
      if (p.status === 'cancelled') continue;
      const name =
        typeof p.supplier === 'string' ? p.supplier : p.supplierData?.name || 'Proveedor';
      const cur = map.get(p.supplier_id) || { name, total: 0, orders: 0 };
      cur.total += p.total;
      cur.orders += 1;
      map.set(p.supplier_id, cur);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [purchases]);

  const priceComparison = useMemo(() => {
    // Comparar cost_price del catálogo agrupando productos con mismo nombre y distinto supplier
    const byName = new Map<string, Array<{ supplier: string; cost: number; stock: number }>>();
    for (const p of inventoryProducts) {
      if (!p.supplierName || !(p.cost > 0)) continue;
      const list = byName.get(p.name) || [];
      list.push({ supplier: p.supplierName, cost: p.cost, stock: p.stock });
      byName.set(p.name, list);
    }
    return [...byName.entries()]
      .filter(([, rows]) => rows.length > 1)
      .map(([product, rows]) => {
        const sorted = [...rows].sort((a, b) => a.cost - b.cost);
        const cheapest = sorted[0];
        const expensive = sorted[sorted.length - 1];
        const savings = expensive.cost - cheapest.cost;
        return {
          product,
          rows: sorted,
          savings,
          savingsPercent: expensive.cost > 0 ? Math.round((savings / expensive.cost) * 100) : 0,
        };
      })
      .slice(0, 30);
  }, [inventoryProducts]);

  const handleSavePurchase = async (purchaseData: any) => {
    const items = (purchaseData.items || [])
      .map((item: any) => ({
        product_id: Number(item.product_id || item.id),
        quantity: Number(item.quantity) || 0,
        unit_cost: Number(item.unitPrice ?? item.unit_cost) || 0,
      }))
      .filter((it: any) => it.product_id && it.quantity > 0);
    if (items.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }
    try {
      if (editingPurchase) {
        await updatePurchase(editingPurchase.id, {
          delivery_date: purchaseData.deliveryDate,
          notes: purchaseData.notes,
          items,
        });
      } else {
        await createPurchase({
          supplier_id: Number(purchaseData.supplierId),
          order_date: purchaseData.date || new Date().toISOString().split('T')[0],
          delivery_date: purchaseData.deliveryDate,
          notes: purchaseData.notes,
          items,
        });
      }
      setShowNewPurchase(false);
      setEditingPurchase(null);
    } catch {
      /* toast en hook */
    }
  };

  const exportCsv = () => {
    const rows = [
      [
        'Orden',
        'Fecha',
        'Proveedor',
        'Estado',
        'Pago',
        'Total',
        'Pagado',
        'Factura',
      ].join(','),
      ...filtered.map((p) => {
        const supplierName =
          typeof p.supplier === 'string' ? p.supplier : p.supplierData?.name || '';
        return [
          p.order_number || p.id,
          p.order_date,
          `"${supplierName.replace(/"/g, '""')}"`,
          STATUS_LABEL[p.status] || p.status,
          PAY_LABEL[p.payment_status || 'unpaid'],
          p.total,
          p.amount_paid || 0,
          p.invoice_number || '',
        ].join(',');
      }),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compras_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exportación CSV lista');
  };

  const downloadPdf = async (purchase: PurchaseOrder) => {
    try {
      const name = `OC_${purchase.order_number || purchase.id}.pdf`;
      await apiClient.downloadFile(API.purchaseOrders.downloadPdf(purchase.id), name);
      toast.success('PDF descargado');
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo generar el PDF');
    }
  };

  const StatusIcon = ({ status }: { status: PurchaseStatus }) => {
    if (status === 'delivered') return <CheckCircle2 className="h-4 w-4" />;
    if (status === 'in_transit') return <Truck className="h-4 w-4" />;
    if (status === 'partial') return <PackageCheck className="h-4 w-4" />;
    if (status === 'cancelled') return <AlertTriangle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
          <p className="text-muted-foreground">
            Órdenes, recepción a inventario/kardex y pagos a proveedores
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" onClick={() => reload()}>
            Actualizar
          </Button>
          <Dialog
            open={showNewPurchase}
            onOpenChange={(open) => {
              setShowNewPurchase(open);
              if (!open) setEditingPurchase(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva compra
              </Button>
            </DialogTrigger>
            <PurchaseOrderDialog
              purchase={editingPurchase}
              suppliers={activeSuppliers}
              catalogProducts={inventoryProducts}
              lowStockProducts={lowStockProducts}
              onSave={handleSavePurchase}
              onClose={() => {
                setShowNewPurchase(false);
                setEditingPurchase(null);
              }}
            />
          </Dialog>
        </div>
      </div>

      <Card className="p-4 border-cyan-200 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/20">
        <div className="flex gap-3 items-start">
          <Layers className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
          <p className="text-sm text-cyan-900 dark:text-cyan-100">
            Al <strong>recibir</strong> mercadería se registra entrada en kardex, actualiza stock y
            recalcula costo promedio. Los proveedores se administran en{' '}
            <strong>Directorio Proveedores</strong>.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Órdenes abiertas</p>
              <p className="text-2xl font-bold">{kpis.openCount}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-violet-500 opacity-70" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Stock bajo</p>
              <p className="text-2xl font-bold">{kpis.lowStock}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500 opacity-70" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Invertido (recibido)</p>
              <p className="text-2xl font-bold">{kpis.invested.toFixed(0)} S/</p>
            </div>
            <Package className="h-8 w-8 text-blue-500 opacity-70" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Por pagar</p>
              <p className="text-2xl font-bold">{kpis.payable.toFixed(0)} S/</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-500 opacity-70" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Órdenes</TabsTrigger>
          <TabsTrigger value="low-stock">Stock bajo</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar orden, proveedor o factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-44">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_transit">En tránsito</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo pago</SelectItem>
                <SelectItem value="unpaid">Por pagar</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-full lg:w-40"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="Desde"
            />
            <Input
              type="date"
              className="w-full lg:w-40"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="Hasta"
            />
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">Cargando órdenes...</p>
          ) : filtered.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              No hay órdenes con esos filtros
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((purchase) => {
                const supplierName =
                  typeof purchase.supplier === 'string'
                    ? purchase.supplier
                    : purchase.supplierData?.name || '—';
                const payable = Math.max(
                  0,
                  (purchase.invoice_total ?? purchase.total) - (purchase.amount_paid || 0)
                );
                return (
                  <Card key={purchase.id} className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold">
                            {purchase.order_number || `#${purchase.id}`}
                          </span>
                          <Badge className={statusBadgeClass(purchase.status)}>
                            <StatusIcon status={purchase.status} />
                            <span className="ml-1">{STATUS_LABEL[purchase.status]}</span>
                          </Badge>
                          <Badge variant="outline">
                            {PAY_LABEL[purchase.payment_status || 'unpaid']}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {supplierName} · {purchase.order_date}
                          {purchase.invoice_number ? ` · Fact. ${purchase.invoice_number}` : ''}
                        </p>
                        <p className="text-sm font-semibold">
                          {purchase.total.toFixed(2)} S/
                          {payable > 0 && purchase.status !== 'cancelled' ? (
                            <span className="text-muted-foreground font-normal">
                              {' '}
                              · saldo {payable.toFixed(2)} S/
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPurchase(purchase)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPdf(purchase)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        {purchase.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeStatus(purchase.id, 'in_transit')}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            En tránsito
                          </Button>
                        )}
                        {!['delivered', 'cancelled'].includes(purchase.status) && (
                          <Button size="sm" onClick={() => setReceiveTarget(purchase)}>
                            <PackageCheck className="h-4 w-4 mr-1" />
                            Recibir
                          </Button>
                        )}
                        {payable > 0 && purchase.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPayTarget(purchase)}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pagar
                          </Button>
                        )}
                        {purchase.status === 'pending' &&
                          !(purchase.items || []).some(
                            (i) => (i.quantity_received || 0) > 0
                          ) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => {
                                if (confirm('¿Eliminar esta orden?')) {
                                  deletePurchase(purchase.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {selectedPurchase && (
            <Card className="p-4 border-2">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">
                    {selectedPurchase.order_number || `Orden #${selectedPurchase.id}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {typeof selectedPurchase.supplier === 'string'
                      ? selectedPurchase.supplier
                      : selectedPurchase.supplierData?.name}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadPdf(selectedPurchase)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  PDF
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedPurchase(null)}>
                  Cerrar
                </Button>
              </div>
              <div className="space-y-2">
                {selectedPurchase.items.map((it, idx) => (
                  <div
                    key={it.id || idx}
                    className="flex justify-between text-sm border-b py-2 last:border-0"
                  >
                    <span>
                      {it.name || it.productName} × {it.quantity}
                      <span className="text-muted-foreground">
                        {' '}
                        (rec. {it.quantity_received || 0})
                      </span>
                    </span>
                    <span className="font-medium">{it.total_cost.toFixed(2)} S/</span>
                  </div>
                ))}
              </div>
              {selectedPurchase.notes && (
                <p className="text-sm text-muted-foreground mt-3">Notas: {selectedPurchase.notes}</p>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          {lowStockProducts.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">Sin productos en stock bajo</Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {lowStockProducts.map((p) => {
                const supplier = suppliers.find((s) => s.id === p.supplierId);
                return (
                  <Card key={p.id} className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock {p.currentStock} / mín {p.minStock}
                        {supplier ? ` · ${supplier.name}` : ''}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingPurchase(null);
                        setShowNewPurchase(true);
                      }}
                    >
                      Comprar
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
              Comparación de costos por proveedor (catálogo)
            </h3>
            {priceComparison.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Asigna el mismo producto (nombre) a distintos proveedores con costo para comparar.
              </p>
            ) : (
              <div className="space-y-4">
                {priceComparison.map((comp) => (
                  <div key={comp.product} className="border rounded-lg p-3">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{comp.product}</span>
                      <Badge variant="outline">
                        Ahorro potencial {comp.savingsPercent}% ({comp.savings.toFixed(2)} S/)
                      </Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {comp.rows.map((r, i) => (
                        <div key={i} className="text-sm p-2 rounded bg-muted/50">
                          {r.supplier}: <strong>{r.cost.toFixed(2)} S/</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-bold mb-3">Compras por proveedor</h3>
            {analyticsBySupplier.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {analyticsBySupplier.map((row) => {
                  const max = analyticsBySupplier[0]?.total || 1;
                  const pct = (row.total / max) * 100;
                  return (
                    <div key={row.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>
                          {row.name} ({row.orders} OC)
                        </span>
                        <span className="font-semibold">{row.total.toFixed(0)} S/</span>
                      </div>
                      <div className="h-2 rounded bg-muted overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!receiveTarget} onOpenChange={(o) => !o && setReceiveTarget(null)}>
        {receiveTarget && (
          <ReceivePurchaseDialog
            purchase={receiveTarget}
            onReceive={async (payload) => {
              await receivePurchase(receiveTarget.id, payload);
              setReceiveTarget(null);
            }}
            onReceiveAll={async (invoice) => {
              await completePurchase(receiveTarget.id, invoice);
              setReceiveTarget(null);
            }}
            onClose={() => setReceiveTarget(null)}
          />
        )}
      </Dialog>

      <Dialog open={!!payTarget} onOpenChange={(o) => !o && setPayTarget(null)}>
        {payTarget && (
          <PayPurchaseDialog
            purchase={payTarget}
            onPay={async (payload) => {
              await payPurchase(payTarget.id, payload);
              setPayTarget(null);
            }}
            onClose={() => setPayTarget(null)}
          />
        )}
      </Dialog>
    </div>
  );
}
