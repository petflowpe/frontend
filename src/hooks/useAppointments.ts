import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { apiClient } from '../utils/api/client';

/** Formatea fecha y hora de cita para mensajes (evita ISO crudo y zona horaria) */
function formatAppointmentDateTime(dateStr: string, timeStr?: string): string {
  if (!dateStr) return '';
  let date: Date;
  if (dateStr.includes('T')) {
    date = new Date(dateStr);
  } else {
    const [y, m, d] = dateStr.split('-').map(Number);
    date = new Date(y, m - 1, d);
  }
  const dateFormatted = format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  let timeFormatted = (timeStr || '').trim();
  if (timeFormatted.includes('T')) {
    const t = new Date(timeFormatted);
    timeFormatted = format(t, 'HH:mm');
  } else if (timeFormatted.length > 5) {
    timeFormatted = timeFormatted.slice(0, 5);
  }
  return timeFormatted ? `${dateFormatted} a las ${timeFormatted}` : dateFormatted;
}

export interface Appointment {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  clientId: string;
  client?: string; // Legacy field for name
  clientName?: string; // Snapshot
  clientDocument?: string; // Legacy
  phone?: string; // Legacy
  clientPhone?: string; // Snapshot
  petId: string;
  pet?: string; // Legacy field for name
  petName?: string; // Snapshot
  breed?: string; // Legacy
  petBreed?: string; // Snapshot
  serviceType: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  duration: number; // minutes
  notes: string;
  totalAmount?: number;
  invoiced: boolean;
  recurring?: boolean;
  createdAt: string;
  // Extra properties for compatibility
  items?: any[];
  totalPrice?: number;
  groomer?: string;
  groomerId?: number;
  vehicle?: any;
  address?: string;
  district?: string;
  reminderSent?: boolean;
  recurrenceInfo?: any;
  recurrenceSeriesId?: string;
  recurrenceType?: 'daily' | 'weekly' | 'monthly';
  recurrenceOccurrences?: number;
  recurrenceDays?: string[];
  recurrenceFixedTime?: boolean;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Convertir formato backend a frontend
  const fromBackendFormat = (backendAppointment: any): Appointment => {
    // Mapear items si existen en el backend
    let items: any[] = [];
    if (backendAppointment.items && Array.isArray(backendAppointment.items)) {
      items = backendAppointment.items.map((item: any) => ({
        id: item.item_id || item.id,
        type: item.item_type === 'SERVICIO' ? 'service' : 'product',
        name: item.name || item.item_name || '',
        price: parseFloat(item.price) || 0,
        duration: item.duration || null,
        quantity: item.quantity || 1,
      }));
    } else if (backendAppointment.service_type) {
      // Fallback: crear item desde service_type si no hay items
      items = [{
        id: backendAppointment.service_id || 'default',
        type: 'service',
        name: backendAppointment.service_name || backendAppointment.service_type,
        price: parseFloat(backendAppointment.price) || 0,
        duration: backendAppointment.duration || 60,
      }];
    }

    return {
      id: backendAppointment.id.toString(),
      date: backendAppointment.date,
      time: backendAppointment.time,
      clientId: backendAppointment.client_id?.toString() || '',
      clientName: backendAppointment.client?.razon_social || backendAppointment.client?.nombre_comercial || '',
      clientPhone: backendAppointment.client?.telefono || '',
      petId: backendAppointment.pet_id?.toString() || '',
      petName: backendAppointment.pet?.name || '',
      petBreed: backendAppointment.pet?.breed || '',
      serviceType: backendAppointment.service_type || '',
      reason: backendAppointment.notes || '',
      status: backendAppointment.status?.toLowerCase() || 'pending',
      duration: backendAppointment.duration || 60,
      notes: backendAppointment.notes || '',
      totalAmount: parseFloat(backendAppointment.total) || 0,
      totalPrice: parseFloat(backendAppointment.total) || 0,
      invoiced: backendAppointment.payment_status === 'Pagado',
      address: backendAppointment.address || '',
      district: backendAppointment.district || '',
      groomer: backendAppointment.user?.name || '',
      groomerId: backendAppointment.user_id || undefined,
      vehicle: backendAppointment.vehicle || undefined,
      items: items.length > 0 ? items : undefined,
      recurring: backendAppointment.is_recurring || false,
      recurrenceSeriesId: backendAppointment.recurrence_series_id,
      recurrenceType: backendAppointment.recurrence_type,
      recurrenceOccurrences: backendAppointment.recurrence_occurrences,
      recurrenceDays: backendAppointment.recurrence_days || [],
      recurrenceFixedTime: backendAppointment.recurrence_fixed_time ?? true,
      reminderSent: backendAppointment.reminder_sent || false,
      createdAt: backendAppointment.created_at || new Date().toISOString(),
    };
  };

  const loadAppointments = useCallback(async (filters?: { date?: string, month?: string, limit?: number, status?: string }) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters?.date) params.date = filters.date;
      if (filters?.status) params.status = filters.status;
      if (filters?.limit) params.per_page = filters.limit;

      const response = await apiClient.get<{ data: any[]; meta?: any } | any[]>('/appointments', params);
      
      const appointmentsArray = Array.isArray(response) ? response : (response.data || []);
      const mappedAppointments = appointmentsArray.map(fromBackendFormat);
      
      setAppointments(mappedAppointments);
    } catch (e: any) {
      toast.error("Error al cargar citas", {
        description: e.message || "No se pudieron cargar las citas del servidor. Por favor, intenta nuevamente."
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar citas al montar (p. ej. al abrir el calendario)
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Convertir formato frontend a backend
  const toBackendFormat = (appointment: Partial<Appointment>): any => {
    const rawVehicleId = appointment.vehicle?.id ?? (typeof appointment.vehicle === 'object' ? undefined : appointment.vehicle);
    const vehicleIdNum = rawVehicleId != null ? parseInt(String(rawVehicleId), 10) : NaN;
    const vehicle_id = Number.isInteger(vehicleIdNum) ? vehicleIdNum : null;

    const backendData: any = {
      client_id: parseInt(appointment.clientId || '0', 10),
      pet_id: parseInt(appointment.petId || '0', 10),
      company_id: 1,
      service_type: appointment.serviceType || '',
      service_name: appointment.serviceType || '',
      service_category: appointment.serviceType?.toLowerCase().includes('movilvet') ? 'MovilVet' : 'Peluquería',
      date: appointment.date || '',
      time: appointment.time || '',
      duration: appointment.duration ?? 60,
      address: appointment.address || '',
      district: appointment.district || '',
      price: appointment.totalAmount ?? appointment.totalPrice ?? 0,
      discount: 0,
      total: appointment.totalAmount ?? appointment.totalPrice ?? 0,
      notes: appointment.notes || appointment.reason || '',
      vehicle_id,
      user_id: appointment.groomerId || null,
    };

    // Agregar items si existen (servicios y productos)
    if (appointment.items && appointment.items.length > 0) {
      backendData.items = appointment.items.map(item => ({
        item_id: typeof item.id === 'number' ? item.id : parseInt(item.id.toString()),
        item_type: item.type === 'service' ? 'SERVICIO' : 'PRODUCTO',
        quantity: item.quantity || 1,
        price: item.price || 0,
        duration: item.duration || null,
        name: item.name || '',
      }));
    }

    return backendData;
  };

  const createAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'invoiced'>) => {
    try {
      const backendData = toBackendFormat(data);
      const response = await apiClient.post<{ data: any }>('/appointments', backendData);
      
      const backendAppointment = response.data || response;
      const newAppointment = fromBackendFormat(backendAppointment);

      setAppointments(prev => [...prev, newAppointment]);
      const friendlyDateTime = formatAppointmentDateTime(newAppointment.date, newAppointment.time);
      toast.success('Cita agendada correctamente', {
        description: friendlyDateTime ? `El ${friendlyDateTime}` : 'Tu cita fue registrada correctamente.'
      });
      return newAppointment;
    } catch (e: any) {
      toast.error('Error al crear la cita', {
        description: e.message || 'No se pudo guardar la cita. Verifica que todos los campos estén completos y que el vehículo esté disponible.'
      });
      throw e;
    }
  };

  /** Normaliza hora a HH:mm (backend espera date_format:H:i) */
  const normalizeTimeForBackend = (timeStr: string | undefined): string | undefined => {
    if (!timeStr || typeof timeStr !== 'string') return undefined;
    const t = timeStr.trim();
    if (t.includes('T')) {
      try {
        return format(new Date(t), 'HH:mm');
      } catch {
        return undefined;
      }
    }
    return t.length >= 5 ? t.slice(0, 5) : t;
  };

  /** Normaliza fecha a YYYY-MM-DD */
  const normalizeDateForBackend = (dateStr: string | undefined): string | undefined => {
    if (!dateStr || typeof dateStr !== 'string') return undefined;
    const d = dateStr.trim();
    if (d.includes('T')) {
      try {
        return format(new Date(d), 'yyyy-MM-dd');
      } catch {
        return undefined;
      }
    }
    return d.length >= 10 ? d.slice(0, 10) : d;
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const backendData: any = {};

      // Mapear campos del frontend al backend (formatos que acepta el backend)
      const statusMap: Record<string, string> = {
        'pending': 'Pendiente',
        'pendiente': 'Pendiente',
        'confirmed': 'Confirmada',
        'confirmada': 'Confirmada',
        'completed': 'Completada',
        'completada': 'Completada',
        'cancelled': 'Cancelada',
        'cancelada': 'Cancelada',
        'no_show': 'Cancelada',
        'in-progress': 'En Proceso',
        'en proceso': 'En Proceso',
      };
      if (updates.status) {
        backendData.status = statusMap[String(updates.status).toLowerCase()] || updates.status;
      }
      const normDate = normalizeDateForBackend(updates.date);
      if (normDate) backendData.date = normDate;
      const normTime = normalizeTimeForBackend(updates.time);
      if (normTime) backendData.time = normTime;
      if (updates.duration != null) backendData.duration = updates.duration;
      if (updates.notes !== undefined) backendData.notes = updates.notes;
      if (updates.totalAmount !== undefined) {
        backendData.price = updates.totalAmount;
        backendData.total = updates.totalAmount;
      }
      const rawVehicleId = updates.vehicle?.id ?? (typeof updates.vehicle === 'object' ? undefined : updates.vehicle);
      const vehicleIdNum = rawVehicleId != null ? parseInt(String(rawVehicleId), 10) : NaN;
      if (Number.isInteger(vehicleIdNum)) backendData.vehicle_id = vehicleIdNum;
      if (updates.groomerId) backendData.user_id = updates.groomerId;

      await apiClient.put(`/appointments/${id}`, backendData);

      // Actualizar estado local
      const current = appointments.find(a => a.id === id);
      if (current) {
        const updated = { ...current, ...updates };
        setAppointments(prev => prev.map(a => a.id === id ? updated : a));
        toast.success(updates.status === 'cancelled' ? 'Cita cancelada correctamente' : 'Cita actualizada correctamente');
      }
    } catch (e: any) {
      const description =
        e.errors && typeof e.errors === 'object'
          ? Object.values(e.errors)
              .flat()
              .filter(Boolean)
              .join(' ')
          : e.message || 'No se pudo actualizar la cita. Por favor, intenta nuevamente.';
      toast.error('Error al actualizar la cita', { description });
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await apiClient.delete(`/appointments/${id}`);
      setAppointments(prev => prev.filter(a => a.id !== id));
      toast.success('Cita eliminada correctamente');
    } catch (e: any) {
      toast.error('Error al eliminar la cita', {
        description: e.message || 'No se pudo eliminar la cita. Por favor, intenta nuevamente.'
      });
    }
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(a => a.date === date);
  };

  const getUpcomingAppointments = (limit = 5) => {
    const today = new Date().toISOString().split('T')[0];
    return appointments
      .filter(a => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed')
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      })
      .slice(0, limit);
  };

  return {
    appointments,
    loading,
    createAppointment,
    addAppointment: createAppointment, // Alias para compatibilidad
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getUpcomingAppointments,
    refreshAppointments: loadAppointments
  };
};