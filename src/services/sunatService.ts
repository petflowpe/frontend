import { apiClient } from '../utils/api/client';

export interface CompanyConfig {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccionFiscal: string;
  distrito: string;
  provincia: string;
  departamento: string;
  ubigeo: string;
  oseProvider: 'sunat' | 'nubefact' | 'facturador' | 'otro';
  series: {
    factura: string;
    boleta: string;
    notaCredito: string;
    notaDebito: string;
    guiaRemision: string;
  };
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

  /** Usar empresa y sucursal desde la BD (selector en Facturación SUNAT) */
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

  // Configurar empresa (legacy / desde Config SUNAT)
  setCompanyConfig(config: CompanyConfig) {
    localStorage.setItem('sunat_company_config', JSON.stringify(config));
  }

  // Obtener configuración (síncrono para UI; puede venir de BD vía fetchCompanyConfig)
  getCompanyConfig(): CompanyConfig | null {
    const stored = localStorage.getItem('sunat_company_config');
    return stored ? JSON.parse(stored) : null;
  }

  /** Cargar configuración SUNAT desde la API (GET /companies/{id}/config) y guardarla localmente */
  async fetchCompanyConfig(companyId: number): Promise<CompanyConfig | null> {
    try {
      const res = await apiClient.get<{ data?: any }>(`/companies/${companyId}/config`);
      const raw = (res as any)?.data ?? res;
      if (!raw) return null;
      const companyInfo = raw.company_info ?? raw;
      const invoiceSettings = raw.invoice_settings ?? raw.document_settings ?? {};
      const series = invoiceSettings.series ?? invoiceSettings.serie ?? {};
      const config: CompanyConfig = {
        ruc: companyInfo.ruc ?? '',
        razonSocial: companyInfo.razon_social ?? companyInfo.razonSocial ?? '',
        nombreComercial: companyInfo.nombre_comercial ?? companyInfo.nombreComercial ?? '',
        direccionFiscal: companyInfo.direccion_fiscal ?? companyInfo.direccion ?? companyInfo.direccionFiscal ?? '',
        distrito: companyInfo.distrito ?? '',
        provincia: companyInfo.provincia ?? '',
        departamento: companyInfo.departamento ?? '',
        ubigeo: companyInfo.ubigeo ?? '',
        oseProvider: (companyInfo.ose_provider ?? invoiceSettings.ose_provider ?? 'otro') as CompanyConfig['oseProvider'],
        series: {
          factura: series.factura ?? series.factura_serie ?? 'F001',
          boleta: series.boleta ?? series.boleta_serie ?? 'B001',
          notaCredito: series.nota_credito ?? series.notaCredito ?? 'FC01',
          notaDebito: series.nota_debito ?? series.notaDebito ?? 'FD01',
          guiaRemision: series.guia_remision ?? series.guiaRemision ?? 'T001',
        },
      };
      this.setCompanyConfig(config);
      return config;
    } catch (e) {
      console.warn('fetchCompanyConfig:', e);
      return null;
    }
  }

  // Crear comprobante en el backend
  async createInvoice(invoice: any, tipo: '01' | '03'): Promise<any> {
    const endpoint = tipo === '01' ? '/invoices' : '/boletas';
    try {
      const response = await apiClient.post<{ data: any }>(endpoint, {
        company_id: this.companyId,
        branch_id: this.branchId,
        ...invoice
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error creating ${tipo === '01' ? 'invoice' : 'boleta'}:`, error);
      throw error;
    }
  }

  // Enviar a SUNAT
  async sendToSunat(id: number | string, tipo: '01' | '03'): Promise<SunatResponse> {
    const endpoint = tipo === '01' ? `/invoices/${id}/send-sunat` : `/boletas/${id}/send-sunat`;
    try {
      const response = await apiClient.post<any>(endpoint, {});
      return {
        success: response.success,
        mensajeRespuesta: response.message,
        data: response.data,
        error: response.success ? undefined : response.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error al enviar a SUNAT'
      };
    }
  }

  // Obtener registros desde el backend (Laravel devuelve paginado: { data: [...], current_page, total })
  async getInvoiceRecords(tipo: '01' | '03'): Promise<any[]> {
    const endpoint = tipo === '01' ? '/invoices' : '/boletas';
    try {
      const response = await apiClient.get<any>(endpoint, {
        company_id: this.companyId,
        branch_id: this.branchId
      });
      return Array.isArray(response) ? response : (response?.data ?? []);
    } catch (error) {
      console.error(`Error fetching ${tipo === '01' ? 'invoices' : 'boletas'}:`, error);
      return [];
    }
  }

  // Obtener todos los comprobantes (facturas + boletas)
  async getAllRecords(): Promise<any[]> {
    try {
      const [invoices, boletas] = await Promise.all([
        this.getInvoiceRecords('01'),
        this.getInvoiceRecords('03')
      ]);
      return [...invoices, ...boletas].sort((a, b) => 
        new Date(b.created_at || b.fecha_emision).getTime() - 
        new Date(a.created_at || a.fecha_emision).getTime()
      );
    } catch (error) {
      console.error('Error fetching all records:', error);
      return [];
    }
  }

  // Obtener siguiente número (el backend ya lo maneja)
  getNextNumber(serie: string, tipo: string): string {
    return '00000000';
  }
}

export const sunatService = new SunatService();
