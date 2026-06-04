import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface PaymentRecord {
  id: number | string;
  invoice_id?: number | null;
  appointment_id?: number | null;
  client: string;
  amount: number;
  fee: number;
  net: number;
  currency: string;
  method: string;
  gateway: string;
  status: string;
  reference?: string | null;
  external_id?: string | null;
  date?: string;
  time?: string;
  description?: string;
  invoice_number?: string;
}

export interface CreatePaymentInput {
  invoice_id?: number;
  appointment_id?: number;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  fee?: number;
}

export interface CheckoutInput {
  gateway: 'mercado_pago' | 'niubiz';
  appointment_id?: number;
  invoice_id?: number;
  amount?: number;
  description?: string;
  payer_email?: string;
}

export function usePayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ total: number; last_page: number } | null>(null);

  const fetchPayments = useCallback(async (filters?: {
    status?: string;
    gateway?: string;
    per_page?: number;
  }) => {
    setLoading(true);
    try {
      const res = await apiClient.get<
        PaymentRecord[] | { data: PaymentRecord[]; total?: number; last_page?: number }
      >(API.payments.list, {
        per_page: filters?.per_page ?? 50,
        status: filters?.status,
        gateway: filters?.gateway,
      });
      const rows = Array.isArray(res) ? res : (res.data ?? []);
      setPayments(rows);
      if (!Array.isArray(res) && res.total != null) {
        setMeta({ total: res.total, last_page: res.last_page ?? 1 });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al cargar pagos';
      toast.error(msg);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(async (input: CreatePaymentInput) => {
    const row = await apiClient.post<PaymentRecord>(API.payments.create, input);
    setPayments((prev) => [row, ...prev]);
    toast.success('Pago registrado');
    return row;
  }, []);

  const createCheckout = useCallback(async (input: CheckoutInput) => {
    const payload = await apiClient.post<{
      payment: PaymentRecord;
      checkout: { checkout_url: string };
    }>(API.payments.checkout, input);
    const checkoutUrl = payload.checkout?.checkout_url;
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      toast.success('Abriendo pasarela de pago…');
    }
    await fetchPayments();
    return payload;
  }, [fetchPayments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    loading,
    meta,
    fetchPayments,
    createPayment,
    createCheckout,
  };
}
