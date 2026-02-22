import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';

export interface DispatchGuide {
  id: number | string;
  serie: string;
  numero?: string;
  numero_completo?: string;
  fecha_emision: string;
  cod_traslado?: string;
  mod_traslado?: string;
  destinatario?: { razon_social: string; numero_documento: string };
  estado_sunat?: string;
}

export function useDispatchGuides(companyId = 1, branchId = 1) {
  const [list, setList] = useState<DispatchGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferReasons, setTransferReasons] = useState<{ code: string; name: string }[]>([]);
  const [transportModes, setTransportModes] = useState<{ code: string; name: string }[]>([]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/dispatch-guides', { company_id: companyId, branch_id: branchId });
      const raw = Array.isArray(res) ? res : (res?.data ?? []);
      const items = Array.isArray(raw) ? raw : (raw?.data ?? []);
      setList(Array.isArray(items) ? items : []);
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar guías de remisión');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, branchId]);

  const fetchCatalogs = useCallback(async () => {
    try {
      const [reasons, modes] = await Promise.all([
        apiClient.get<any>('/dispatch-guides/catalogs/transfer-reasons'),
        apiClient.get<any>('/dispatch-guides/catalogs/transport-modes'),
      ]);
      setTransferReasons(Array.isArray(reasons) ? reasons : (reasons?.data ?? []));
      setTransportModes(Array.isArray(modes) ? modes : (modes?.data ?? []));
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchList();
    fetchCatalogs();
  }, [fetchList, fetchCatalogs]);

  const sendToSunat = async (id: string | number) => {
    try {
      await apiClient.post(`/dispatch-guides/${id}/send-sunat`, {});
      toast.success('Enviado a SUNAT');
      fetchList();
    } catch (e: any) {
      toast.error(e.message || 'Error al enviar a SUNAT');
    }
  };

  const downloadXml = async (id: string | number) => {
    try {
      await apiClient.downloadFile(`/dispatch-guides/${id}/download-xml`, `guia-remision-${id}.xml`);
      toast.success('Descargando XML...');
    } catch (e: any) {
      toast.error(e.message || 'Error al descargar XML');
    }
  };

  const downloadPdf = async (id: string | number) => {
    try {
      await apiClient.downloadFile(`/dispatch-guides/${id}/download-pdf`, `guia-remision-${id}.pdf`);
      toast.success('Descargando PDF...');
    } catch (e: any) {
      toast.error(e.message || 'Error al descargar PDF');
    }
  };

  return { list, loading, refresh: fetchList, sendToSunat, downloadXml, downloadPdf, transferReasons, transportModes };
}
