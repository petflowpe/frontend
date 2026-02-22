import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api/client';
import { toast } from 'sonner';

export interface CashSession {
  id: number;
  company_id: number;
  branch_id: number;
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
}

export const useCashRegister = (companyId: number = 1, branchId: number = 1) => {
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [loading, setLoading] = useState(true);

  const CASH_FETCH_TIMEOUT_MS = 15_000;

  const fetchActiveSession = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Promise.race([
        apiClient.get<{ data: { data: CashSession[] } }>('/cash-sessions', {
          company_id: companyId,
          branch_id: branchId,
          status: 'OPEN',
          per_page: 1
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), CASH_FETCH_TIMEOUT_MS)
        ),
      ]);

      const sessions = response.data?.data || [];
      if (sessions.length > 0) {
        setCurrentSession(sessions[0]);
      } else {
        setCurrentSession(null);
      }
    } catch (e: any) {
      setCurrentSession(null);
      if (e?.message !== 'timeout') {
        console.error("Error fetching cash session", e);
      }
    } finally {
      setLoading(false);
    }
  }, [companyId, branchId]);

  const openSession = async (openingAmount: number, notes: string = '') => {
    try {
      const response = await apiClient.post<{ data: CashSession }>('/cash-sessions/open', {
        company_id: companyId,
        branch_id: branchId,
        opening_amount: openingAmount,
        notes: notes
      });

      const newSession = response.data;
      setCurrentSession(newSession);
      toast.success('Caja abierta correctamente');
      return newSession;
    } catch (e: any) {
      toast.error(e.message || 'Error al abrir caja');
      throw e;
    }
  };

  const closeSession = async (closingAmount: number, expectedCash: number, notes: string = '') => {
    if (!currentSession) return;

    try {
      const response = await apiClient.post<{ data: CashSession }>(`/cash-sessions/${currentSession.id}/close`, {
        closing_amount: closingAmount,
        expected_cash: expectedCash,
        notes: notes
      });

      setCurrentSession(null);
      toast.success('Caja cerrada correctamente');
      return response.data;
    } catch (e: any) {
      toast.error(e.message || 'Error al cerrar caja');
      throw e;
    }
  };

  const addMovement = async (data: { type: 'INCOME' | 'EXPENSE', amount: number, description: string }) => {
    try {
      const response = await apiClient.post<{ data: CashMovement }>('/cash-movements', {
        company_id: companyId,
        branch_id: branchId,
        cash_session_id: currentSession?.id,
        ...data,
        movement_date: new Date().toISOString()
      });

      toast.success(data.type === 'INCOME' ? 'Ingreso registrado' : 'Gasto registrado');
      
      // Actualizar sesión si es necesario (ej: disparar recarga de movimientos)
      return response.data;
    } catch (e: any) {
      toast.error(e.message || 'Error al registrar movimiento');
      throw e;
    }
  };

  const getMovements = async () => {
     if (!currentSession) return [];
     try {
       const response = await apiClient.get<{ data: { data: CashMovement[] } }>('/cash-movements', {
         cash_session_id: currentSession.id
       });
       return response.data?.data || [];
     } catch (e) {
       console.error(e);
       return [];
     }
  };

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  return {
    currentSession,
    loading,
    openSession,
    closeSession,
    addMovement,
    getMovements,
    refreshSession: fetchActiveSession
  };
};
