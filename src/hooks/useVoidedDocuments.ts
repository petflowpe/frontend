import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';

export interface VoidedDocument {
  id: number | string;
  identificador?: string;
  fecha_emision: string;
  fecha_referencia?: string;
  motivo_baja?: string;
  estado_sunat?: string;
  detalles?: Array<{ tipo_documento: string; serie: string; correlativo: string; motivo_especifico: string }>;
}

export function useVoidedDocuments(companyId = 1, branchId = 1) {
  const [list, setList] = useState<VoidedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableDocuments, setAvailableDocuments] = useState<any[]>([]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/voided-documents', { company_id: companyId, branch_id: branchId });
      const raw = Array.isArray(res) ? res : (res?.data ?? []);
      const items = Array.isArray(raw) ? raw : (raw?.data ?? []);
      setList(Array.isArray(items) ? items : []);
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar comunicaciones de baja');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, branchId]);

  const fetchAvailableDocuments = useCallback(async (fechaReferencia: string) => {
    try {
      const res = await apiClient.get<any>('/voided-documents/available-documents', {
        company_id: companyId,
        branch_id: branchId,
        fecha_referencia: fechaReferencia,
      });
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setAvailableDocuments(data);
      return data;
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar documentos disponibles');
      return [];
    }
  }, [companyId, branchId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const sendToSunat = async (id: string | number) => {
    try {
      await apiClient.post(`/voided-documents/${id}/send-sunat`, {});
      toast.success('Enviado a SUNAT');
      fetchList();
    } catch (e: any) {
      toast.error(e.message || 'Error al enviar a SUNAT');
    }
  };

  const downloadXml = async (id: string | number) => {
    try {
      await apiClient.downloadFile(`/voided-documents/${id}/download-xml`, `comunicacion-baja-${id}.xml`);
      toast.success('Descargando XML...');
    } catch (e: any) {
      toast.error(e.message || 'Error al descargar XML');
    }
  };

  return { list, loading, refresh: fetchList, sendToSunat, downloadXml, availableDocuments, fetchAvailableDocuments };
}
