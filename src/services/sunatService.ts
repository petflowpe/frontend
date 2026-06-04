import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface CompanyConfig {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccionFiscal: string;
  distrito: string;
  provincia: string;
  departamento: string;
  ubigeo: string;
  telefono?: string;
  email?: string;
  usuarioSol?: string;
  claveSol?: string;
  certificadoPassword?: string;
  regimenTributario?: 'RG' | 'RER' | 'MYPE' | 'RUS';
  oseProvider: 'sunat' | 'nubefact' | 'facturador' | 'otro';
  oseConfig?: {
    url?: string;
    usuario?: string;
    password?: string;
    token?: string;
  };
  series: {
    factura: string;
    boleta: string;
    notaCredito: string;
    notaDebito: string;
    guiaRemision: string;
  };
  enviarSunatAutomatico?: boolean;
  generarXmlAutomatico?: boolean;
  generarPdfAutomatico?: boolean;
}

export interface ElectronicInvoice {
  tipoComprobante: '01' | '03' | '07' | '08' | '09';
  serie: string;
  numero?: string;
  fechaEmision: string;
  moneda: 'PEN' | 'USD';
  cliente: {
    tipoDocumento: '1' | '6';
    numeroDocumento: string;
    razonSocial: string;
    direccion?: string;
    email?: string;
  };
  items: Array<{
    codigo: string;
    descripcion: string;
    unidadMedida: string;
    cantidad: number;
    valorUnitario: number;
    precioUnitario: number;
    tipoIGV: '10' | '20';
    igv: number;
    totalItem: number;
  }>;
  totalOperacionesGravadas: number;
  totalIGV: number;
  totalVenta: number;
  formaPago?: 'CONTADO' | 'CREDITO';
}

export interface SunatResponse {
  success: boolean;
  codigoRespuesta?: string;
  mensajeRespuesta?: string;
  xml?: string;
  cdr?: string;
  hash?: string;
  numeroDocumento?: string;
  error?: string;
  data?: any;
}

class SunatService {
  private companyId: number = 1;
  private branchId: number = 1;

  setCompanyBranch(companyId: number, branchId: number) {
    this.companyId = companyId;
    this.branchId = branchId;
  }

  getCompanyId(): number {
    return this.companyId;
  }

  getBranchId(): number {
    return this.branchId;
  }

  /** Carga configuración desde API y la guarda en localStorage para módulos legacy */
  async fetchCompanyConfig(companyId: number): Promise<CompanyConfig | null> {
    try {
      const res = await apiClient.get<{ data: any }>(API.companies.sunatConfig(companyId));
      const raw = (res as { data?: any }).data ?? res;
      const c = raw.company ?? {};
      const inv = raw.invoice_settings ?? {};
      const series = inv.series ?? {};
      const config: CompanyConfig = {
        ruc: c.ruc ?? '',
        razonSocial: c.razon_social ?? '',
        nombreComercial: c.nombre_comercial ?? '',
        direccionFiscal: c.direccion ?? '',
        distrito: c.distrito ?? '',
        provincia: c.provincia ?? '',
        departamento: c.departamento ?? '',
        ubigeo: c.ubigeo ?? '',
        telefono: c.telefono,
        email: c.email,
        usuarioSol: c.usuario_sol,
        regimenTributario: inv.regimen_tributario ?? 'RG',
        oseProvider: (inv.ose_provider ?? 'sunat') as CompanyConfig['oseProvider'],
        oseConfig: inv.ose_config,
        series: {
          factura: series.factura ?? 'F001',
          boleta: series.boleta ?? 'B001',
          notaCredito: series.nota_credito ?? 'FC01',
          notaDebito: series.nota_debito ?? 'FD01',
          guiaRemision: series.guia_remision ?? 'T001',
        },
        enviarSunatAutomatico: !!raw.document_settings?.enviar_sunat_automatico,
      };
      localStorage.setItem('sunat_company_config', JSON.stringify(config));
      localStorage.setItem('sunat_company_id', String(companyId));
      return config;
    } catch (e) {
      console.warn('fetchCompanyConfig:', e);
      return null;
    }
  }

  getCompanyConfig(): CompanyConfig | null {
    const stored = localStorage.getItem('sunat_company_config');
    return stored ? JSON.parse(stored) : null;
  }

  setCompanyConfig(config: CompanyConfig) {
    localStorage.setItem('sunat_company_config', JSON.stringify(config));
  }

  async createInvoice(invoice: any, tipo: '01' | '03'): Promise<any> {
    const endpoint = tipo === '01' ? '/invoices' : '/boletas';
    const response = await apiClient.post<{ data: any }>(endpoint, {
      company_id: this.companyId,
      branch_id: this.branchId,
      ...invoice,
    });
    return (response as { data?: any }).data ?? response;
  }

  async sendToSunat(id: number | string, tipo: '01' | '03'): Promise<SunatResponse> {
    const endpoint = tipo === '01' ? `/invoices/${id}/send-sunat` : `/boletas/${id}/send-sunat`;
    try {
      const response = await apiClient.post<any>(endpoint, {});
      return {
        success: response.success,
        mensajeRespuesta: response.message,
        data: response.data,
        error: response.success ? undefined : response.message,
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Error al enviar a SUNAT' };
    }
  }

  async getInvoiceRecords(tipo: '01' | '03'): Promise<any[]> {
    const endpoint = tipo === '01' ? '/invoices' : '/boletas';
    try {
      const response = await apiClient.get<any>(endpoint, {
        company_id: this.companyId,
        branch_id: this.branchId,
      });
      return Array.isArray(response) ? response : (response?.data ?? []);
    } catch {
      return [];
    }
  }

  async getAllRecords(): Promise<any[]> {
    const [invoices, boletas] = await Promise.all([
      this.getInvoiceRecords('01'),
      this.getInvoiceRecords('03'),
    ]);
    return [...invoices, ...boletas].sort(
      (a, b) =>
        new Date(b.created_at || b.fecha_emision).getTime() -
        new Date(a.created_at || a.fecha_emision).getTime()
    );
  }

  getNextNumber(): string {
    return '00000000';
  }
}

export const sunatService = new SunatService();
