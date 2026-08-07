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
  payment_status?: string;
  suggested_forma_pago?: string;
  supports_credito?: boolean;
  default_credit_days?: number;
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

export interface DocumentCorrectionOptions {
  has_document: boolean;
  can_void: boolean;
  can_credit_note: boolean;
  void_window_days: number;
  days_since_emission?: number;
  within_void_window?: boolean;
  void_requires_comunicacion_baja?: boolean;
  void_is_local_only?: boolean;
  payment_status?: string;
  credit_note_series?: string;
  document?: {
    id: number;
    tipo_documento: string;
    tipo_nombre: string;
    numero_completo?: string;
    fecha_emision: string;
    estado_sunat?: string;
    total: number;
    detalles: Array<{
      codigo?: string;
      descripcion: string;
      cantidad: number;
      mto_valor_unitario: number;
      unidad?: string;
      tip_afe_igv?: string;
      porcentaje_igv?: number;
    }>;
  };
  motivos_sugeridos?: {
    total: { cod_motivo: string; des_motivo: string };
    partial: { cod_motivo: string; des_motivo: string };
  };
  message?: string;
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
      options?: {
        sendToSunat?: boolean;
        tipo?: 'auto' | '01' | '03';
        formaPagoTipo?: 'Contado' | 'Credito';
        creditDays?: number;
        formaPagoCuotas?: Array<{ moneda?: string; monto: number; fecha_pago: string }>;
      }
    ) => {
      setIssuing(true);
      try {
        const res = await apiClient.post<{ data: IssueDocumentResult; message?: string }>(
          API.appointments.issueDocument(appointmentId),
          {
            tipo: options?.tipo ?? 'auto',
            send_to_sunat: options?.sendToSunat ?? false,
            forma_pago_tipo: options?.formaPagoTipo,
            credit_days: options?.creditDays,
            forma_pago_cuotas: options?.formaPagoCuotas,
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

  const loadCorrectionOptions = useCallback(async (appointmentId: string | number) => {
    const res = await apiClient.get<{ data: DocumentCorrectionOptions }>(
      API.appointments.documentCorrectionOptions(appointmentId)
    );
    return unwrap(res);
  }, []);

  const voidDocument = useCallback(
    async (appointmentId: string | number, options?: { motivo?: string; sendToSunat?: boolean }) => {
      const res = await apiClient.post<{ data: unknown; message?: string }>(
        API.appointments.voidDocument(appointmentId),
        {
          motivo: options?.motivo,
          send_to_sunat: options?.sendToSunat,
        }
      );
      toast.success((res as { message?: string }).message ?? 'Comprobante anulado');
      return unwrap(res);
    },
    []
  );

  const issueCreditNote = useCallback(
    async (
      appointmentId: string | number,
      payload: {
        mode: 'total' | 'partial';
        cod_motivo?: string;
        des_motivo?: string;
        serie?: string;
        send_to_sunat?: boolean;
        detalles?: Array<{
          codigo?: string;
          descripcion: string;
          cantidad: number;
          mto_valor_unitario: number;
          unidad?: string;
        }>;
      }
    ) => {
      const res = await apiClient.post<{ data: unknown; message?: string }>(
        API.appointments.creditNote(appointmentId),
        payload
      );
      toast.success((res as { message?: string }).message ?? 'Nota de crédito emitida');
      return unwrap(res);
    },
    []
  );

  return {
    preview,
    loading,
    issuing,
    loadPreview,
    issueDocument,
    loadCorrectionOptions,
    voidDocument,
    issueCreditNote,
    clearPreview: () => setPreview(null),
  };
}
