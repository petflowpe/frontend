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
}

// useInvoices ahora usa el backend Laravel directamente

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'FAC-2024-00124',
    serie: 'F001',
    numero: '00124',
    fecha: '2024-12-01',
    hora: '14:30:00',
    cliente: {
      id: 2,
      nombre: 'María García',
      documento: '87654321',
      direccion: 'Av. Javier Prado 456, Lima'
    },
    mascota: {
      id: 1,
      nombre: 'Max',
      raza: 'Golden Retriever'
    },
    puntoVenta: {
      tipo: 'vehiculo',
      id: 'vehiculo-1',
      codigo: 'VEH-001',
      nombre: 'Móvil 1',
      placa: 'ABC-123',
      conductor: 'Carlos Méndez'
    },
    origen: 'cita',
    citaId: 'C-0045',
    items: [
      { tipo: 'servicio', codigo: 'BA-COR-001', descripcion: 'Baño + Corte Completo', cantidad: 1, precioUnitario: 65.00, costo: 22.00, subtotal: 65.00 },
      { tipo: 'producto', codigo: 'AC-COL-001', descripcion: 'Collar Antipulgas', cantidad: 1, precioUnitario: 25.00, costo: 15.00, subtotal: 25.00 },
    ],
    subtotal: 90.00,
    descuento: 0,
    igv: 16.20,
    total: 106.20,
    formaPago: 'tarjeta',
    estado: 'pagada',
    notas: ''
  },
  {
    id: 'FAC-2024-00125',
    serie: 'F001',
    numero: '00125',
    fecha: '2024-11-30',
    hora: '16:00:00',
    cliente: {
      id: 3,
      nombre: 'Carlos Rodríguez',
      documento: '45678912',
      direccion: 'Calle Las Flores 789, Lima'
    },
    mascota: null,
    puntoVenta: {
      tipo: 'tienda',
      id: 'tienda-1',
      codigo: 'TND-001',
      nombre: 'Tienda Principal',
      placa: null,
      conductor: null
    },
    origen: 'venta_directa',
    citaId: null,
    items: [
      { tipo: 'producto', codigo: 'AL-ROY-001', descripcion: 'Royal Canin Adult 15kg', cantidad: 2, precioUnitario: 45.99, costo: 32.00, subtotal: 91.98 },
      { tipo: 'producto', codigo: 'SU-VIT-001', descripcion: 'Vitaminas MultiVet', cantidad: 1, precioUnitario: 29.99, costo: 18.00, subtotal: 29.99 },
    ],
    subtotal: 121.97,
    descuento: 0,
    igv: 21.95,
    total: 143.92,
    formaPago: 'efectivo',
    estado: 'pagada',
    notas: 'Venta directa en tienda'
  },
  {
    id: 'FAC-2024-00126',
    serie: 'F001',
    numero: '00126',
    fecha: '2024-11-29',
    hora: '11:20:00',
    cliente: {
      id: 1,
      nombre: 'Juan Pérez',
      documento: '12345678',
      direccion: 'Av. Principal 123, Lima'
    },
    mascota: {
      id: 2,
      nombre: 'Luna',
      raza: 'Husky'
    },
    puntoVenta: {
      tipo: 'vehiculo',
      id: 'vehiculo-1',
      codigo: 'VEH-001',
      nombre: 'Móvil 1',
      placa: 'ABC-123',
      conductor: 'Carlos Méndez'
    },
    origen: 'cita',
    citaId: 'C-0042',
    items: [
      { tipo: 'servicio', codigo: 'BA-MED-001', descripcion: 'Baño Medicinal', cantidad: 1, precioUnitario: 55.00, costo: 20.00, subtotal: 55.00 },
    ],
    subtotal: 55.00,
    descuento: 0,
    igv: 9.90,
    total: 64.90,
    formaPago: 'efectivo',
    estado: 'pendiente',
    notas: 'Pendiente de pago'
  }
];

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Convertir formato backend a frontend
  const fromBackendFormat = (backendInvoice: any): Invoice => {
    return {
      id: backendInvoice.id?.toString() || backendInvoice.serie_numero || '',
      serie: backendInvoice.serie || '',
      numero: backendInvoice.numero?.toString() || '',
      fecha: backendInvoice.fecha_emision || backendInvoice.date || '',
      hora: backendInvoice.hora || '00:00:00',
      cliente: {
        id: backendInvoice.client_id || backendInvoice.client?.id || 0,
        nombre: backendInvoice.client?.razon_social || backendInvoice.client?.nombre_comercial || '',
        documento: backendInvoice.client?.numero_documento || '',
        direccion: backendInvoice.client?.direccion || '',
      },
      mascota: backendInvoice.pet_id ? {
        id: backendInvoice.pet_id || backendInvoice.pet?.id || 0,
        nombre: backendInvoice.pet?.name || '',
        raza: backendInvoice.pet?.breed || '',
      } : null,
      puntoVenta: {
        tipo: backendInvoice.branch_id ? 'tienda' : 'vehiculo',
        id: backendInvoice.branch_id?.toString() || backendInvoice.vehicle_id?.toString() || '',
        codigo: backendInvoice.branch?.codigo || backendInvoice.vehicle?.placa || '',
        nombre: backendInvoice.branch?.nombre || backendInvoice.vehicle?.name || '',
        placa: backendInvoice.vehicle?.placa || null,
        conductor: null,
      },
      origen: backendInvoice.appointment_id ? 'cita' : 'venta_directa',
      citaId: backendInvoice.appointment_id?.toString() || null,
      items: (backendInvoice.items || []).map((item: any) => ({
        tipo: item.item_type === 'SERVICIO' ? 'servicio' : 'producto',
        codigo: item.code || item.sku || '',
        descripcion: item.name || item.description || '',
        cantidad: parseFloat(item.quantity) || 0,
        precioUnitario: parseFloat(item.unit_price) || 0,
        costo: parseFloat(item.cost_price) || 0,
        subtotal: parseFloat(item.subtotal) || 0,
      })),
      subtotal: parseFloat(backendInvoice.subtotal) || 0,
      descuento: parseFloat(backendInvoice.discount) || 0,
      igv: parseFloat(backendInvoice.tax_amount) || parseFloat(backendInvoice.igv) || 0,
      total: parseFloat(backendInvoice.total) || 0,
      formaPago: backendInvoice.payment_method || 'efectivo',
      estado: backendInvoice.status === 'PAID' ? 'pagada' : 
              backendInvoice.status === 'PENDING' ? 'pendiente' :
              backendInvoice.status === 'CANCELLED' ? 'anulada' : 'pendiente',
      notas: backendInvoice.notes || '',
    };
  };

  const fetchInvoices = useCallback(async (filters?: { date?: string; clientId?: string; status?: string }) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters?.date) params.date = filters.date;
      if (filters?.clientId) params.client_id = filters.clientId;
      if (filters?.status) params.status = filters.status;

      const response = await apiClient.get<{ data: any[]; meta?: any } | any[]>('/invoices', params);
      
      const invoicesArray = Array.isArray(response) ? response : (response.data || []);
      const mappedInvoices = invoicesArray.map(fromBackendFormat);
      
      setInvoices(mappedInvoices);
    } catch (e: any) {
      console.error("Error loading invoices", e);
      toast.error(e.message || "Error cargando facturas del servidor");
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
      const newInvoice = fromBackendFormat(backendInvoice);

      if (!isInitial) {
        setInvoices(prev => [newInvoice, ...prev]);
        toast.success('Factura registrada');
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

  const deleteInvoice = async (id: string) => {
    try {
      await apiClient.delete(`/invoices/${id}`);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      toast.success('Factura eliminada correctamente');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al eliminar factura');
    }
  };

  /** Descargar factura en PDF o XML (para portal cliente o listado) */
  const downloadInvoice = async (id: string, format: 'PDF' | 'XML') => {
    try {
      const path = format === 'PDF' ? `/invoices/${id}/download-pdf` : `/invoices/${id}/download-xml`;
      const ext = format === 'PDF' ? 'pdf' : 'xml';
      await apiClient.downloadFile(path, `factura-${id}.${ext}`);
      toast.success(`Descargando ${format}...`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || `Error al descargar ${format}`);
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
