import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';
import { toast } from 'sonner';

export interface CashSession {
  id: number;
  company_id: number;
  branch_id: number;
  vehicle_id?: number | null;
  user_id: number;
  opening_amount: number;
  closing_amount: number | null;
  expected_cash: number | null;
  difference: number | null;
  opened_at: string;
  closed_at: string | null;
  status: 'OPEN' | 'CLOSED';
  notes: string | null;
}

export interface CashMovement {
  id: number;
  cash_session_id: number | null;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  payment_method: string;
  movement_date: string;
  appointment_id?: number;
}

export interface PendingCashAppointment {
  id: number;
  service_name: string;
  client_name?: string | null;
  total: number;
  paid_amount?: number;
  remaining_amount?: number;
  time?: string;
  district?: string;
  vehicle_id?: number;
  status: string;
  payment_status?: string;
  invoiced?: boolean;
  boleta_id?: number | null;
  invoice_id?: number | null;
}

export interface DaySummary {
  date: string;
  sales: {
    cash: number;
    card: number;
    transfer: number;
    qr: number;
    other: number;
    total: number;
  };
  pending_collections: PendingCashAppointment[];
  pending_invoicing?: PendingCashAppointment[];
  issued_today?: PendingCashAppointment[];
  expenses_total: number;
  movements: CashMovement[];
  by_vehicle: {
    vehicle_id: number | null;
    vehicle_name: string;
    plate?: string;
    appointments: number;
    paid_total: number;
    pending_count: number;
  }[];
}

function unwrap<T>(res: { data?: T } | T): T {
  return (res as { data?: T }).data ?? (res as T);
}

export function useCashRegister(
  companyId: number,
  branchId: number,
  vehicleId?: number | ''
) {
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [daySummary, setDaySummary] = useState<DaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const vehicleParam = vehicleId === '' || vehicleId == null ? undefined : Number(vehicleId);

  const fetchActiveSession = useCallback(async () => {
    if (!companyId || !branchId) {
      setCurrentSession(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: CashSession | null }>(API.cashSessions.current, {
        company_id: companyId,
        branch_id: branchId,
        ...(vehicleParam ? { vehicle_id: vehicleParam } : {}),
      });
      setCurrentSession(unwrap(res) ?? null);
    } catch {
      setCurrentSession(null);
    } finally {
      setLoading(false);
    }
  }, [companyId, branchId, vehicleParam]);

  const fetchDaySummary = useCallback(async () => {
    if (!companyId) return;
    setSummaryLoading(true);
    try {
      const res = await apiClient.get<{ data: DaySummary }>(API.cashSessions.daySummary, {
        company_id: companyId,
        ...(vehicleParam ? { vehicle_id: vehicleParam } : {}),
        ...(currentSession?.id ? { cash_session_id: currentSession.id } : {}),
      });
      setDaySummary(unwrap(res));
    } catch {
      setDaySummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [companyId, vehicleParam, currentSession?.id]);

  const openSession = async (openingAmount: number, notes = '') => {
    const res = await apiClient.post<{ data: CashSession }>(API.cashSessions.open, {
      company_id: companyId,
      branch_id: branchId,
      vehicle_id: vehicleParam,
      opening_amount: openingAmount,
      notes,
    });
    const session = unwrap(res);
    setCurrentSession(session);
    toast.success('Caja abierta');
    await fetchDaySummary();
    return session;
  };

  const closeSession = async (closingAmount: number, expectedCash: number, notes = '') => {
    if (!currentSession) return;
    await apiClient.post(API.cashSessions.close(currentSession.id), {
      closing_amount: closingAmount,
      expected_cash: expectedCash,
      notes,
    });
    setCurrentSession(null);
    toast.success('Caja cerrada');
    await fetchDaySummary();
  };

  const addMovement = async (data: {
    type: 'INCOME' | 'EXPENSE';
    amount: number;
    description: string;
    payment_method?: string;
  }) => {
    const res = await apiClient.post<{ data: CashMovement }>('/cash-movements', {
      company_id: companyId,
      branch_id: branchId,
      vehicle_id: vehicleParam,
      cash_session_id: currentSession?.id,
      payment_method: data.payment_method ?? 'Efectivo',
      movement_date: new Date().toISOString(),
      ...data,
    });
    toast.success(data.type === 'INCOME' ? 'Ingreso registrado' : 'Gasto registrado');
    await fetchDaySummary();
    return unwrap(res);
  };

  const registerAppointmentPayment = async (
    appointmentId: number,
    paymentMethod: string,
    amount?: number
  ) => {
    await apiClient.post(API.appointments.registerPayment(appointmentId), {
      payment_method: paymentMethod,
      amount,
      cash_session_id: currentSession?.id,
    });
    toast.success('Cobro de cita registrado');
    await fetchDaySummary();
  };

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  useEffect(() => {
    if (companyId) fetchDaySummary();
  }, [fetchDaySummary, companyId]);

  return {
    currentSession,
    daySummary,
    loading,
    summaryLoading,
    openSession,
    closeSession,
    addMovement,
    registerAppointmentPayment,
    refreshSession: fetchActiveSession,
    refreshSummary: fetchDaySummary,
  };
}
