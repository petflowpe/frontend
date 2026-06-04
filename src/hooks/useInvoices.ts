import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';

export interface InvoiceItem {
  tipo: 'producto' | 'servicio';
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  costo: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  serie: string;
  numero: string;
  fecha: string;
  hora: string;
  cliente: {
    id: number | string;
    nombre: string;
    documento: string;
    direccion: string;
  };
  mascota: {
    id: number | string;
    nombre: string;
    raza: string;
  } | null;
  puntoVenta: {
    tipo: string;
    id: string;
    codigo: string;
    nombre: string;
    placa?: string | null;
    conductor?: string | null;
  };
  origen: string;
  citaId: string | null;
  items: InvoiceItem[];
  subtotal: number;
  descuento: number;
  igv: number;
  total: number;
  formaPago: string;
  estado: 'pagada' | 'pendiente' | 'vencida' | 'anulada';
  notas: string;
  documentType: 'factura' | 'boleta';
  numeroCompleto?: string;
  estadoSunat?: string;
}

function mapDocumentStatus(status: string | undefined): Invoice['estado'] {
  if (status === 'PAID' || status === 'pagada') return 'pagada';
  if (status === 'PENDING' || status === 'pendiente') return 'pendiente';
  if (status === 'CANCELLED' || status === 'anulada') return 'anulada';
  return 'pendiente';
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const mapItems = (items: any[]) =>
    (items || []).map((item: any) => ({
      tipo: (item.item_type === 'SERVICIO' ? 'servicio' : 'producto') as 'servicio' | 'producto',
      codigo: item.code || item.sku || '',
      descripcion: item.name || item.description || '',
      cantidad: parseFloat(item.quantity) || 0,
      precioUnitario: parseFloat(item.unit_price) || 0,
      costo: parseFloat(item.cost_price) || 0,
      subtotal: parseFloat(item.subtotal) || 0,
    }));

  const fromBackendFormat = (row: any, documentType: 'factura' | 'boleta'): Invoice => {
    const total =
      parseFloat(row.mto_imp_venta) ||
      parseFloat(row.total) ||
      0;

    return {
      id: row.id?.toString() || '',
      documentType,
      numeroCompleto: row.numero_completo || `${row.serie || ''}-${row.numero || ''}`,
      serie: row.serie || '',
      numero: row.numero?.toString() || '',
      fecha: row.fecha_emision || row.date || '',
      hora: row.hora || '00:00:00',
      cliente: {
        id: row.client_id || row.client?.id || 0,
        nombre: row.client?.razon_social || row.client?.nombre_comercial || '',
        documento: row.client?.numero_documento || '',
        direccion: row.client?.direccion || '',
      },
      mascota: row.pet_id
        ? {
            id: row.pet_id || row.pet?.id || 0,
            nombre: row.pet?.name || '',
            raza: row.pet?.breed || '',
          }
        : null,
      puntoVenta: {
        tipo: row.branch_id ? 'tienda' : 'vehiculo',
        id: row.branch_id?.toString() || row.vehicle_id?.toString() || '',
        codigo: row.branch?.codigo || row.vehicle?.placa || '',
        nombre: row.branch?.nombre || row.vehicle?.name || '',
        placa: row.vehicle?.placa || null,
        conductor: null,
      },
      origen: row.appointment_id ? 'cita' : 'venta_directa',
      citaId: row.appointment_id?.toString() || null,
      items: mapItems(row.items),
      subtotal: parseFloat(row.sub_total) || parseFloat(row.subtotal) || 0,
      descuento: parseFloat(row.discount) || 0,
      igv: parseFloat(row.mto_igv) || parseFloat(row.tax_amount) || 0,
      total,
      formaPago: row.payment_method || 'efectivo',
      estado: mapDocumentStatus(row.status),
      estadoSunat: row.estado_sunat,
      notas: row.notes || '',
    };
  };

  const fetchInvoices = useCallback(async (filters?: { date?: string; clientId?: string; status?: string }) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { per_page: 200 };
      if (filters?.date) params.date = filters.date;
      if (filters?.clientId) params.client_id = filters.clientId;
      if (filters?.status) params.status = filters.status;

      const [invRes, bolRes] = await Promise.all([
        apiClient.get<{ data: any[] } | any[]>('/invoices', params).catch(() => []),
        apiClient.get<{ data: any[] } | any[]>('/boletas', params).catch(() => []),
      ]);

      const invRows = Array.isArray(invRes) ? invRes : (invRes as { data?: any[] }).data || [];
      const bolRows = Array.isArray(bolRes) ? bolRes : (bolRes as { data?: any[] }).data || [];

      const merged = [
        ...invRows.map((r) => fromBackendFormat(r, 'factura')),
        ...bolRows.map((r) => fromBackendFormat(r, 'boleta')),
      ].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

      setInvoices(merged);
    } catch (e: unknown) {
      console.error('Error loading documents', e);
      toast.error(e instanceof Error ? e.message : 'Error cargando comprobantes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Convertir formato frontend a backend
  const toBackendFormat = (invoice: Invoice): any => {
    return {
      client_id: parseInt(invoice.cliente.id.toString()),
      pet_id: invoice.mascota ? parseInt(invoice.mascota.id.toString()) : null,
      branch_id: invoice.puntoVenta.tipo === 'tienda' ? parseInt(invoice.puntoVenta.id) : null,
      vehicle_id: invoice.puntoVenta.tipo === 'vehiculo' ? parseInt(invoice.puntoVenta.id) : null,
      appointment_id: invoice.citaId ? parseInt(invoice.citaId) : null,
      items: invoice.items.map(item => ({
        item_type: item.tipo === 'servicio' ? 'SERVICIO' : 'PRODUCTO',
        code: item.codigo,
        name: item.descripcion,
        quantity: item.cantidad,
        unit_price: item.precioUnitario,
        cost_price: item.costo,
        subtotal: item.subtotal,
      })),
      subtotal: invoice.subtotal,
      discount: invoice.descuento,
      tax_amount: invoice.igv,
      total: invoice.total,
      payment_method: invoice.formaPago,
      notes: invoice.notas,
    };
  };

  const createInvoice = async (invoice: Invoice, isInitial = false) => {
    try {
      const backendData = toBackendFormat(invoice);
      const response = await apiClient.post<{ data: any }>('/invoices', backendData);
      
      const backendInvoice = response.data || response;
      const newInvoice = fromBackendFormat(backendInvoice, 'factura');

      if (!isInitial) {
        setInvoices(prev => [newInvoice, ...prev]);
      }
      return newInvoice;
    } catch (e: any) {
      console.error(e);
      if (!isInitial) toast.error(e.message || 'Error al guardar factura');
      throw e;
    }
  };

  const addInvoice = (invoice: Invoice) => {
    return createInvoice(invoice);
  };

  const updateInvoiceStatus = async (id: string, status: Invoice['estado']) => {
    try {
      const statusMap: Record<string, string> = {
        'pagada': 'PAID',
        'pendiente': 'PENDING',
        'vencida': 'OVERDUE',
        'anulada': 'CANCELLED',
      };

      await apiClient.put(`/invoices/${id}`, {
        status: statusMap[status] || 'PENDING',
      });

      // Actualizar estado local
      const current = invoices.find(inv => inv.id === id);
      if (current) {
        const updated = { ...current, estado: status };
        setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
        toast.success('Estado de factura actualizado');
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al actualizar factura');
    }
  };

  const deleteInvoice = async (id: string, documentType: Invoice['documentType'] = 'factura') => {
    if (documentType === 'boleta') {
      toast.error('Elimine la boleta desde Facturación SUNAT');
      return;
    }
    try {
      await apiClient.delete(`/invoices/${id}`);
      setInvoices((prev) => prev.filter((inv) => inv.id !== id || inv.documentType !== 'factura'));
      toast.success('Factura eliminada correctamente');
    } catch (e: unknown) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Error al eliminar factura');
    }
  };

  const downloadInvoice = async (
    id: string,
    format: 'PDF' | 'XML',
    documentType: Invoice['documentType'] = 'factura'
  ) => {
    try {
      const base = documentType === 'boleta' ? '/boletas' : '/invoices';
      const path =
        format === 'PDF' ? `${base}/${id}/download-pdf` : `${base}/${id}/download-xml`;
      const ext = format === 'PDF' ? 'pdf' : 'xml';
      await apiClient.downloadFile(path, `${documentType}-${id}.${ext}`);
      toast.success(`Descargando ${format}...`);
    } catch (e: unknown) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : `Error al descargar ${format}`);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    loading,
    addInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    refreshInvoices: fetchInvoices,
    downloadInvoice,
  };
};
