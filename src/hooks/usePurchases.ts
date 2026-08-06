import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface PurchaseOrderItem {
  id?: number;
  product_id: number;
  product?: { id: number; name: string; code?: string; stock?: number };
  name?: string;
  productName?: string;
  quantity: number;
  quantity_received?: number;
  unit_cost: number;
  total_cost: number;
  unitPrice?: number;
  total?: number;
}

export type PurchaseStatus = 'pending' | 'in_transit' | 'partial' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface PurchaseOrder {
  id: number | string;
  company_id?: number;
  supplier_id: number;
  order_number?: string | null;
  supplier?: string | { id: number; name: string };
  supplierData?: { id: number; name: string };
  order_date: string;
  delivery_date?: string | null;
  status: PurchaseStatus;
  total: number;
  invoice_number?: string | null;
  invoice_date?: string | null;
  invoice_total?: number | null;
  kardex_registered: boolean;
  payment_status?: PaymentStatus;
  amount_paid?: number;
  paid_at?: string | null;
  notes?: string | null;
  items: PurchaseOrderItem[];
  date?: string;
  deliveryDate?: string;
  invoice?: { number?: string; date?: string; amount?: number; tax?: number; total?: number };
}

const DEFAULT_COMPANY_ID = 1;

function normalizeStatus(raw: string): PurchaseStatus {
  if (raw === 'in-transit') return 'in_transit';
  if (['pending', 'in_transit', 'partial', 'delivered', 'cancelled'].includes(raw)) {
    return raw as PurchaseStatus;
  }
  return 'pending';
}

function fromBackendFormat(row: any): PurchaseOrder {
  const items = (row.items || []).map((it: any) => ({
    id: it.id,
    product_id: it.product_id,
    product: it.product,
    name: it.product?.name,
    quantity: parseFloat(it.quantity) || 0,
    quantity_received: parseFloat(it.quantity_received ?? 0) || 0,
    unit_cost: parseFloat(it.unit_cost) || 0,
    total_cost: parseFloat(it.total_cost) || 0,
    unitPrice: parseFloat(it.unit_cost) || 0,
    total: parseFloat(it.total_cost) || 0,
    productName: it.product?.name || '',
  }));
  const supplierName = row.supplier?.name || '';
  return {
    id: row.id,
    company_id: row.company_id,
    supplier_id: row.supplier_id,
    order_number: row.order_number,
    supplier: supplierName as any,
    supplierData: row.supplier,
    order_date: row.order_date,
    delivery_date: row.delivery_date,
    status: normalizeStatus(row.status || 'pending'),
    total: parseFloat(row.total) || 0,
    invoice_number: row.invoice_number,
    invoice_date: row.invoice_date,
    invoice_total: row.invoice_total != null ? parseFloat(row.invoice_total) : null,
    kardex_registered: !!row.kardex_registered,
    payment_status: (row.payment_status || 'unpaid') as PaymentStatus,
    amount_paid: parseFloat(row.amount_paid ?? 0) || 0,
    paid_at: row.paid_at ?? null,
    notes: row.notes,
    items,
    date: row.order_date,
    deliveryDate: row.delivery_date,
    invoice: row.invoice_number
      ? {
          number: row.invoice_number,
          date: row.invoice_date,
          amount: row.invoice_total,
          tax: 0,
          total: row.invoice_total,
        }
      : undefined,
  };
}

export function usePurchases(companyId: number = DEFAULT_COMPANY_ID) {
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPurchases = useCallback(async (filters?: Record<string, string | number | undefined>) => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ success?: boolean; data?: any[] }>(
        API.purchaseOrders.list,
        { company_id: companyId, per_page: 100, ...filters }
      );
      const list = response?.data ?? [];
      setPurchases(list.map(fromBackendFormat));
    } catch (e: any) {
      console.error('Error cargando órdenes de compra', e);
      toast.error(e.message || 'Error cargando órdenes de compra');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const upsertLocal = (order: PurchaseOrder) => {
    setPurchases((prev) => {
      const idx = prev.findIndex((p) => String(p.id) === String(order.id));
      if (idx === -1) return [order, ...prev];
      const next = [...prev];
      next[idx] = order;
      return next;
    });
  };

  const createPurchase = async (data: {
    supplier_id: number;
    order_date: string;
    delivery_date?: string;
    notes?: string;
    items: { product_id: number; quantity: number; unit_cost: number }[];
  }) => {
    const payload = {
      company_id: companyId,
      supplier_id: data.supplier_id,
      order_date: data.order_date,
      delivery_date: data.delivery_date || null,
      notes: data.notes || null,
      items: data.items.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        unit_cost: it.unit_cost,
      })),
    };
    const res = await apiClient.post<{ data?: any }>(API.purchaseOrders.list, payload);
    const order = fromBackendFormat(res?.data ?? res);
    setPurchases((prev) => [order, ...prev]);
    toast.success(`Orden ${order.order_number || order.id} creada`);
    return order;
  };

  const updatePurchase = async (
    id: number | string,
    data: {
      delivery_date?: string;
      notes?: string;
      items: { product_id: number; quantity: number; unit_cost: number }[];
    }
  ) => {
    const payload = {
      delivery_date: data.delivery_date || null,
      notes: data.notes || null,
      items: data.items.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
        unit_cost: it.unit_cost,
      })),
    };
    const res = await apiClient.put<{ data?: any }>(API.purchaseOrders.byId(id), payload);
    const order = fromBackendFormat(res?.data ?? res);
    upsertLocal(order);
    toast.success('Orden actualizada');
    return order;
  };

  const changeStatus = async (id: number | string, status: PurchaseStatus) => {
    const res = await apiClient.patch<{ data?: any }>(API.purchaseOrders.status(id), { status });
    const order = fromBackendFormat(res?.data ?? res);
    upsertLocal(order);
    toast.success('Estado actualizado');
    return order;
  };

  const receivePurchase = async (
    id: number | string,
    payload: {
      items: { item_id?: number; product_id?: number; quantity: number }[];
      invoice_number?: string;
      invoice_date?: string;
      invoice_total?: number;
    }
  ) => {
    const res = await apiClient.post<{ data?: any }>(API.purchaseOrders.receive(id), payload);
    const order = fromBackendFormat(res?.data ?? res);
    upsertLocal(order);
    toast.success('Recepción registrada · stock actualizado');
    return order;
  };

  const completePurchase = async (
    id: number | string,
    invoice?: { invoice_number?: string; invoice_date?: string; invoice_total?: number }
  ) => {
    const res = await apiClient.post<{ data?: any }>(API.purchaseOrders.complete(id), invoice || {});
    const order = fromBackendFormat(res?.data ?? res);
    upsertLocal(order);
    toast.success('Orden completada y stock actualizado');
    return order;
  };

  const payPurchase = async (
    id: number | string,
    payload: {
      amount: number;
      payment_method?: string;
      post_to_cash?: boolean;
      cash_session_id?: number;
    }
  ) => {
    const res = await apiClient.post<{ data?: any }>(API.purchaseOrders.pay(id), payload);
    const order = fromBackendFormat(res?.data ?? res);
    upsertLocal(order);
    toast.success('Pago registrado');
    return order;
  };

  const deletePurchase = async (id: number | string) => {
    await apiClient.delete(API.purchaseOrders.byId(id));
    setPurchases((prev) => prev.filter((p) => String(p.id) !== String(id)));
    toast.success('Orden eliminada');
  };

  return {
    purchases,
    loading,
    reload: loadPurchases,
    createPurchase,
    updatePurchase,
    changeStatus,
    receivePurchase,
    completePurchase,
    payPurchase,
    deletePurchase,
  };
}
