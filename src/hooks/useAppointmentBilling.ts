import { useState, useCallback } from 'react';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';
import { toast } from 'sonner';

export interface BillingPreview {
  appointment_id: number;
  tipo_documento: string;
  tipo_nombre: string;
  serie: string;
  total: number;
  already_issued: boolean;
  numero_existente?: string;
  client: { razon_social: string; numero_documento: string; tipo_documento: string };
  detalles: { descripcion: string; cantidad: number }[];
}

export interface IssueDocumentResult {
  tipo_documento: string;
  numero_completo: string;
  document: {
    id: number;
    numero_completo: string;
    estado_sunat?: string;
  };
}

function unwrap<T>(res: { data?: T } | T): T {
  return (res as { data?: T }).data ?? (res as T);
}

export function useAppointmentBilling() {
  const [preview, setPreview] = useState<BillingPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const loadPreview = useCallback(async (appointmentId: string | number) => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: BillingPreview }>(
        API.appointments.billingPreview(appointmentId)
      );
      const data = unwrap(res);
      setPreview(data);
      return data;
    } catch (e: any) {
      toast.error(e.message || 'No se pudo cargar vista previa');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const issueDocument = useCallback(
    async (
      appointmentId: string | number,
      options?: { sendToSunat?: boolean; tipo?: 'auto' | '01' | '03' }
    ) => {
      setIssuing(true);
      try {
        const res = await apiClient.post<{ data: IssueDocumentResult; message?: string }>(
          API.appointments.issueDocument(appointmentId),
          {
            tipo: options?.tipo ?? 'auto',
            send_to_sunat: options?.sendToSunat ?? false,
          }
        );
        const data = unwrap(res);
        toast.success((res as { message?: string }).message ?? `Comprobante ${data.numero_completo}`);
        return data;
      } catch (e: any) {
        toast.error(e.message || 'Error al emitir comprobante');
        throw e;
      } finally {
        setIssuing(false);
      }
    },
    []
  );

  return {
    preview,
    loading,
    issuing,
    loadPreview,
    issueDocument,
    clearPreview: () => setPreview(null),
  };
}
