import { useCallback, useState } from 'react';
import { apiClient } from '../utils/api/client';
import { API_URL } from '../utils/api/config';
import { API } from '../utils/api/endpoints';
import type { CompanyConfig } from '../services/sunatService';

export interface SunatConfigPayload {
  company: Partial<{
    ruc: string;
    razon_social: string;
    nombre_comercial: string;
    direccion: string;
    ubigeo: string;
    distrito: string;
    provincia: string;
    departamento: string;
    telefono: string;
    email: string;
    usuario_sol: string;
    clave_sol: string;
    certificado_password: string;
    endpoint_beta: string;
    endpoint_produccion: string;
  }>;
  invoice_settings: {
    series: CompanyConfig['series'];
    ose_provider: CompanyConfig['oseProvider'];
    ose_config?: CompanyConfig['oseConfig'];
    regimen_tributario?: string;
    envio_automatico?: boolean;
  };
  document_settings?: {
    enviar_sunat_automatico?: boolean;
    generar_xml_automatico?: boolean;
    generar_pdf_automatico?: boolean;
  };
}

export interface SunatConfigState {
  config: CompanyConfig;
  modoProduccion: boolean;
  hasCertificate: boolean;
  hasClaveSol: boolean;
  usuarioSol: string;
  endpoints: { beta: string; produccion: string };
}

function mapFromApi(data: any): SunatConfigState {
  const c = data.company ?? {};
  const inv = data.invoice_settings ?? {};
  const series = inv.series ?? {};

  return {
    modoProduccion: !!c.modo_produccion,
    hasCertificate: !!c.has_certificate,
    hasClaveSol: !!c.has_clave_sol,
    usuarioSol: c.usuario_sol ?? '',
    endpoints: {
      beta: c.endpoint_beta ?? '',
      produccion: c.endpoint_produccion ?? '',
    },
    config: {
      ruc: c.ruc ?? '',
      razonSocial: c.razon_social ?? '',
      nombreComercial: c.nombre_comercial ?? '',
      direccionFiscal: c.direccion ?? '',
      distrito: c.distrito ?? '',
      provincia: c.provincia ?? '',
      departamento: c.departamento ?? '',
      ubigeo: c.ubigeo ?? '',
      telefono: c.telefono ?? '',
      email: c.email ?? '',
      usuarioSol: c.usuario_sol ?? '',
      claveSol: '',
      certificadoPassword: '',
      regimenTributario: inv.regimen_tributario ?? 'RG',
      oseProvider: (inv.ose_provider ?? 'sunat') as CompanyConfig['oseProvider'],
      oseConfig: inv.ose_config ?? {},
      series: {
        factura: series.factura ?? 'F001',
        boleta: series.boleta ?? 'B001',
        notaCredito: series.nota_credito ?? 'FC01',
        notaDebito: series.nota_debito ?? 'FD01',
        guiaRemision: series.guia_remision ?? 'T001',
      },
      enviarSunatAutomatico: !!data.document_settings?.enviar_sunat_automatico,
      generarXmlAutomatico: data.document_settings?.generar_xml_automatico !== false,
      generarPdfAutomatico: data.document_settings?.generar_pdf_automatico !== false,
    },
  };
}

function mapToPayload(state: SunatConfigState): SunatConfigPayload {
  const { config } = state;
  return {
    company: {
      ruc: config.ruc,
      razon_social: config.razonSocial,
      nombre_comercial: config.nombreComercial,
      direccion: config.direccionFiscal,
      ubigeo: config.ubigeo,
      distrito: config.distrito,
      provincia: config.provincia,
      departamento: config.departamento,
      telefono: config.telefono,
      email: config.email,
      usuario_sol: config.usuarioSol,
      ...(config.claveSol ? { clave_sol: config.claveSol } : {}),
      ...(config.certificadoPassword ? { certificado_password: config.certificadoPassword } : {}),
      endpoint_beta: state.endpoints.beta || undefined,
      endpoint_produccion: state.endpoints.produccion || undefined,
    },
    invoice_settings: {
      series: {
        factura: config.series.factura,
        boleta: config.series.boleta,
        nota_credito: config.series.notaCredito,
        nota_debito: config.series.notaDebito,
        guia_remision: config.series.guiaRemision,
      },
      ose_provider: config.oseProvider,
      ose_config: config.oseConfig,
      regimen_tributario: config.regimenTributario,
      envio_automatico: config.enviarSunatAutomatico,
    },
    document_settings: {
      enviar_sunat_automatico: config.enviarSunatAutomatico,
      generar_xml_automatico: config.generarXmlAutomatico,
      generar_pdf_automatico: config.generarPdfAutomatico,
    },
  };
}

export function useSunatConfig(companyId: number | '') {
  const [state, setState] = useState<SunatConfigState | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: any }>(API.companies.sunatConfig(companyId));
      const data = (res as { data?: any }).data ?? res;
      setState(mapFromApi(data));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const save = useCallback(async () => {
    if (!companyId || !state) return;
    setSaving(true);
    try {
      const res = await apiClient.put<{ data: any }>(
        API.companies.sunatConfig(companyId),
        mapToPayload(state)
      );
      const data = (res as { data?: any }).data ?? res;
      setState(mapFromApi(data));
    } finally {
      setSaving(false);
    }
  }, [companyId, state]);

  const setEnvironment = useCallback(
    async (modoProduccion: boolean) => {
      if (!companyId) return;
      await apiClient.post(API.companies.sunatEnvironment(companyId), { modo_produccion: modoProduccion });
      setState((prev) => (prev ? { ...prev, modoProduccion } : prev));
    },
    [companyId]
  );

  const uploadCertificate = useCallback(
    async (file: File, password?: string) => {
      if (!companyId) return;
      const form = new FormData();
      form.append('certificate_file', file);
      if (password) form.append('certificate_password', password);
      const token = apiClient.getToken();
      const url = `${API_URL}${API.companies.sunatCertificate(companyId)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' },
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al subir certificado');
      }
      setState((prev) => (prev ? { ...prev, hasCertificate: true } : prev));
    },
    [companyId]
  );

  return {
    state,
    setState,
    loading,
    saving,
    load,
    save,
    setEnvironment,
    uploadCertificate,
  };
}
