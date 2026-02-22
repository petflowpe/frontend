import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';

export interface CreditNoteItem {
  codigo: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  mto_valor_unitario: number;
  mto_igv?: number;
  mto_total?: number;
}

export interface CreditNote {
  id: number | string;
  serie: string;
  numero?: string;
  numero_completo?: string;
  fecha_emision: string;
  tipo_doc_afectado: string;
  num_doc_afectado: string;
  cod_motivo: string;
  des_motivo: string;
  client?: { razon_social: string; numero_documento: string };
  total?: number;
  mto_imp_venta?: number;
  estado_sunat?: string;
  detalles?: CreditNoteItem[];
}

export function useCreditNotes(companyId = 1, branchId = 1) {
  const [list, setList] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/credit-notes', { company_id: companyId, branch_id: branchId });
      const items = Array.isArray(res) ? res : (res?.data ?? []);
      setList(Array.isArray(items) ? items : []);
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar notas de crédito');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, branchId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const sendToSunat = async (id: string | number) => {
    try {
      await apiClient.post(`/credit-notes/${id}/send-sunat`, {});
      toast.success('Enviado a SUNAT');
      fetchList();
    } catch (e: any) {
      toast.error(e.message || 'Error al enviar a SUNAT');
    }
  };

  const downloadXml = async (id: string | number) => {
    try {
      await apiClient.downloadFile(`/credit-notes/${id}/download-xml`, `nota-credito-${id}.xml`);
      toast.success('Descargando XML...');
    } catch (e: any) {
      toast.error(e.message || 'Error al descargar XML');
    }
  };

  const downloadPdf = async (id: string | number) => {
    try {
      await apiClient.downloadFile(`/credit-notes/${id}/download-pdf`, `nota-credito-${id}.pdf`);
      toast.success('Descargando PDF...');
    } catch (e: any) {
      toast.error(e.message || 'Error al descargar PDF');
    }
  };

  return { list, loading, refresh: fetchList, sendToSunat, downloadXml, downloadPdf };
}
