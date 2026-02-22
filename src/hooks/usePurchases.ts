import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface PurchaseOrderItem {
  product_id: number;
  product?: { id: number; name: string; code?: string };
  name?: string;
  productName?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  unitPrice?: number;
  total?: number;
}

export interface PurchaseOrder {
  id: number | string;
  company_id?: number;
  supplier_id: number;
  supplier?: string | { id: number; name: string };
  supplierData?: { id: number; name: string };
  order_date: string;
  delivery_date?: string | null;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  total: number;
  invoice_number?: string | null;
  invoice_date?: string | null;
  invoice_total?: number | null;
  kardex_registered: boolean;
  notes?: string | null;
  items: PurchaseOrderItem[];
  date?: string;
  deliveryDate?: string;
  invoice?: { number?: string; date?: string; amount?: number; tax?: number; total?: number };
}

const DEFAULT_COMPANY_ID = 1;

function fromBackendFormat(row: any): PurchaseOrder {
  const items = (row.items || []).map((it: any) => ({
    product_id: it.product_id,
    product: it.product,
    name: it.product?.name,
    quantity: parseFloat(it.quantity) || 0,
    unit_cost: parseFloat(it.unit_cost) || 0,
    total_cost: parseFloat(it.total_cost) || 0,
    unitPrice: parseFloat(it.unit_cost) || 0,
    total: parseFloat(it.total_cost) || 0,
    // Para UI que espera item.product como string (nombre)
    productName: it.product?.name || '',
  }));
  const supplierName = row.supplier?.name || '';
  return {
    id: row.id,
    company_id: row.company_id,
    supplier_id: row.supplier_id,
    supplier: supplierName as any,
    supplierData: row.supplier,
    order_date: row.order_date,
    delivery_date: row.delivery_date,
    status: row.status || 'pending',
    total: parseFloat(row.total) || 0,
    invoice_number: row.invoice_number,
    invoice_date: row.invoice_date,
    invoice_total: row.invoice_total != null ? parseFloat(row.invoice_total) : null,
    kardex_registered: !!row.kardex_registered,
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

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ success?: boolean; data?: any[] }>(
        API.purchaseOrders.list,
        { company_id: companyId, per_page: 100 }
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
    const created = res?.data ?? res;
    const order = fromBackendFormat(created);
    setPurchases((prev) => [order, ...prev]);
    toast.success('Orden de compra creada');
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
    const res = await apiClient.put<{ data?: any }>(
      API.purchaseOrders.byId(id),
      payload
    );
    const updated = res?.data ?? res;
    const order = fromBackendFormat(updated);
    setPurchases((prev) => prev.map((p) => (String(p.id) === String(id) ? order : p)));
    toast.success('Orden actualizada');
    return order;
  };

  const changeStatus = async (id: number | string, status: PurchaseOrder['status']) => {
    const res = await apiClient.patch<{ data?: any }>(
      API.purchaseOrders.status(id),
      { status }
    );
    const updated = res?.data ?? res;
    const order = fromBackendFormat(updated);
    setPurchases((prev) => prev.map((p) => (String(p.id) === String(id) ? order : p)));
    toast.success('Estado actualizado');
    return order;
  };

  const completePurchase = async (
    id: number | string,
    invoice?: { invoice_number?: string; invoice_date?: string; invoice_total?: number }
  ) => {
    const res = await apiClient.post<{ data?: any }>(
      API.purchaseOrders.complete(id),
      invoice || {}
    );
    const updated = res?.data ?? res;
    const order = fromBackendFormat(updated);
    setPurchases((prev) => prev.map((p) => (String(p.id) === String(id) ? order : p)));
    toast.success('Orden completada y stock actualizado');
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
    completePurchase,
    deletePurchase,
  };
}
