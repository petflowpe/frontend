import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';

export interface DailySummary {
  id: number | string;
  fecha_resumen: string;
  fecha_generacion?: string;
  identificador?: string;
  estado_sunat?: string;
  estado_proceso?: string;
  total_boletas?: number;
  total_importe?: number;
}

export function useDailySummaries(companyId = 1, branchId = 1) {
  const [list, setList] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/daily-summaries', { company_id: companyId, branch_id: branchId });
      const raw = Array.isArray(res) ? res : (res?.data ?? []);
      const items = Array.isArray(raw) ? raw : (raw?.data ?? []);
      setList(Array.isArray(items) ? items : []);
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar resúmenes diarios');
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
      await apiClient.post(`/daily-summaries/${id}/send-sunat`, {});
      toast.success('Enviado a SUNAT');
      fetchList();
    } catch (e: any) {
      toast.error(e.message || 'Error al enviar a SUNAT');
    }
  };

  const downloadXml = async (id: string | number) => {
    try {
      await apiClient.downloadFile(`/daily-summaries/${id}/download-xml`, `resumen-${id}.xml`);
      toast.success('Descargando XML...');
    } catch (e: any) {
      toast.error(e.message || 'Error al descargar XML');
    }
  };

  const downloadPdf = async (id: string | number) => {
    try {
      await apiClient.downloadFile(`/daily-summaries/${id}/download-pdf`, `resumen-${id}.pdf`);
      toast.success('Descargando PDF...');
    } catch (e: any) {
      toast.error(e.message || 'Error al descargar PDF');
    }
  };

  return { list, loading, refresh: fetchList, sendToSunat, downloadXml, downloadPdf };
}
