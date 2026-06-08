import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { apiClient } from '../utils/api/client';
import {
  normalizeStatusFromBackend,
  normalizeStatusToBackend,
  normalizeTimeFromBackend,
  normalizeDateFromBackend,
  getStoredCompanyId,
  inferServiceCategory,
  mapRecurrenceTypeToBackend,
} from '../utils/appointmentMappers';

/** Formatea fecha y hora de cita para mensajes (evita ISO crudo y zona horaria) */
function formatAppointmentDateTime(dateStr: string, timeStr?: string): string {
  if (!dateStr) return '';
  // Normalizar: si llega "YYYYY-..." por input raro, recortar a 4 dígitos de año
  if (/^\d{5,}-\d{2}-\d{2}/.test(dateStr)) dateStr = dateStr.slice(0, 4) + dateStr.slice(dateStr.indexOf('-'));
  let date: Date;
  if (dateStr.includes('T')) {
    date = new Date(dateStr);
  } else {
    const [yRaw, mRaw, dRaw] = dateStr.split('-');
    const y = Number((yRaw || '').slice(0, 4));
    const m = Number(mRaw);
    const d = Number(dRaw);
    date = new Date(y, m - 1, d);
  }
  const dateFormatted = Number.isNaN(date.getTime()) ? dateStr.slice(0, 10) : format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
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
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no_show';
  trackingCode?: string;
  duration: number; // minutes
  notes: string;
  totalAmount?: number;
  invoiced: boolean;
  documentNumber?: string;
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
  clientEmail?: string;
  confirmedAt?: string;
  confirmationSent?: boolean;
  recurrenceInfo?: any;
  recurrenceSeriesId?: string;
  recurrenceType?: 'daily' | 'weekly' | 'monthly';
  recurrenceOccurrences?: number;
  recurrenceDays?: string[];
  recurrenceFixedTime?: boolean;
  /** Origen de la reserva */
  bookingSource?: 'staff' | 'portal_auth' | 'public_guest';
  advanceAmount?: number;
  advancePaidAt?: string | null;
  advancePaymentMethod?: string;
  advancePaymentReference?: string;
  clientPortalBookingEnabled?: boolean;
  clientPortalApprovalStatus?: 'pending' | 'approved' | 'rejected';
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

    const vehicleRaw = backendAppointment.vehicle;
    const vehicle = vehicleRaw
      ? {
          id: String(vehicleRaw.id),
          name: vehicleRaw.name || vehicleRaw.placa || `Vehículo ${vehicleRaw.id}`,
          driver: vehicleRaw.driver_name || vehicleRaw.driver || '',
          driverName: vehicleRaw.driver_name || vehicleRaw.driver || '',
        }
      : undefined;

    return {
      id: backendAppointment.id.toString(),
      date: normalizeDateFromBackend(backendAppointment.date),
      time: normalizeTimeFromBackend(backendAppointment.time),
      clientId: backendAppointment.client_id?.toString() || '',
      clientName: backendAppointment.client?.razon_social || backendAppointment.client?.nombre_comercial || '',
      clientPhone: backendAppointment.client?.telefono || '',
      clientEmail: backendAppointment.client?.email || '',
      petId: backendAppointment.pet_id?.toString() || '',
      petName: backendAppointment.pet?.name || '',
      petBreed: backendAppointment.pet?.breed || '',
      serviceType: backendAppointment.service_name || backendAppointment.service_type || '',
      reason: backendAppointment.notes || '',
      status: normalizeStatusFromBackend(backendAppointment.status),
      duration: backendAppointment.duration || 60,
      notes: backendAppointment.notes || '',
      totalAmount: parseFloat(backendAppointment.total) || 0,
      totalPrice: parseFloat(backendAppointment.total) || 0,
      invoiced: !!(backendAppointment.boleta_id || backendAppointment.invoice_id),
      documentNumber: backendAppointment.boleta?.numero_completo
        || backendAppointment.invoice?.numero_completo
        || undefined,
      address: backendAppointment.address || '',
      district: backendAppointment.district || '',
      groomer: backendAppointment.user?.name || vehicle?.driverName || '',
      groomerId: backendAppointment.user_id || undefined,
      vehicle,
      trackingCode: backendAppointment.tracking_code || undefined,
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

  const loadAppointments = useCallback(async (filters?: {
    date?: string;
    date_from?: string;
    date_to?: string;
    month?: string;
    limit?: number;
    per_page?: number;
    status?: string;
    vehicle_id?: number | string;
    booking_source?: string;
  }) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filters?.date) params.date = filters.date;
      if (filters?.date_from) params.date_from = filters.date_from;
      if (filters?.date_to) params.date_to = filters.date_to;
      if (filters?.status) params.status = filters.status;
      if (filters?.vehicle_id) params.vehicle_id = filters.vehicle_id;
      if (filters?.booking_source) params.booking_source = filters.booking_source;
      const perPage = filters?.limit ?? filters?.per_page ?? 100;
      params.per_page = perPage;
      const scopedCompanyId = getStoredCompanyId();
      if (scopedCompanyId) params.company_id = scopedCompanyId;

      const allRows: any[] = [];
      let page = 1;
      let lastPage = 1;

      do {
        const response = await apiClient.get<{ data: any[]; meta?: any } | any[]>(
          '/appointments',
          { ...params, page }
        );
        const batch = Array.isArray(response) ? response : (response.data || []);
        allRows.push(...batch);
        const meta = Array.isArray(response) ? undefined : response.meta;
        lastPage = meta?.last_page ?? 1;
        page += 1;
      } while (page <= lastPage);

      const mappedAppointments = allRows.map(fromBackendFormat);
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
  const toBackendFormat = (appointment: Partial<Appointment> & { totalDuration?: number }): any => {
    const rawVehicleId = appointment.vehicle?.id ?? (typeof appointment.vehicle === 'object' ? undefined : appointment.vehicle);
    const vehicleIdNum = rawVehicleId != null ? parseInt(String(rawVehicleId), 10) : NaN;
    const vehicle_id = Number.isInteger(vehicleIdNum) ? vehicleIdNum : null;

    const primaryService =
      appointment.items?.find((i) => i.type === 'service') ?? appointment.items?.[0];
    const serviceName =
      primaryService?.name || appointment.serviceType || 'Servicio';
    const serviceTypeCode = primaryService?.id
      ? String(primaryService.id)
      : appointment.serviceType || serviceName;
    const serviceIdNum = primaryService?.id
      ? parseInt(String(primaryService.id), 10)
      : NaN;

    const totalPrice = appointment.totalAmount ?? appointment.totalPrice ?? 0;
    const itemsDuration = appointment.items?.reduce(
      (sum, i) => sum + (i.type === 'service' ? i.duration || 0 : 0),
      0
    );
    const duration =
      appointment.duration ??
      (appointment as { totalDuration?: number }).totalDuration ??
      (itemsDuration && itemsDuration > 0 ? itemsDuration : 60);

    const backendData: any = {
      client_id: parseInt(appointment.clientId || '0', 10),
      pet_id: parseInt(appointment.petId || '0', 10),
      service_type: serviceTypeCode,
      service_name: serviceName,
      service_category: inferServiceCategory(serviceName, appointment.serviceType),
      date: normalizeDateFromBackend(appointment.date) || appointment.date || '',
      time: normalizeTimeFromBackend(appointment.time) || appointment.time || '',
      duration,
      address: appointment.address || '',
      district: appointment.district || '',
      price: totalPrice,
      discount: 0,
      total: totalPrice,
      notes: appointment.notes || appointment.reason || '',
      vehicle_id,
      user_id: appointment.groomerId || null,
    };

    if (Number.isInteger(serviceIdNum)) {
      backendData.service_id = serviceIdNum;
    }

    if (appointment.recurring) {
      backendData.is_recurring = true;
      backendData.recurrence_type = mapRecurrenceTypeToBackend(appointment.recurrenceType);
      backendData.recurrence_occurrences = appointment.recurrenceOccurrences ?? 4;
      backendData.recurrence_series_id = appointment.recurrenceSeriesId;
      backendData.recurrence_days = appointment.recurrenceDays ?? [];
      backendData.recurrence_fixed_time = appointment.recurrenceFixedTime ?? true;
    }

    if (appointment.items && appointment.items.length > 0) {
      backendData.items = appointment.items.map((item) => {
        const itemId = parseInt(String(item.id), 10);
        return {
          item_id: Number.isInteger(itemId) ? itemId : null,
          item_type: item.type === 'service' ? 'SERVICIO' : 'PRODUCTO',
          quantity: item.quantity || 1,
          price: item.price || 0,
          duration: item.duration || null,
          name: item.name || '',
        };
      });
    }

    return backendData;
  };

  const applyBackendAppointmentToState = (backendAppointment: any, id?: string) => {
    const mapped = fromBackendFormat(backendAppointment);
    const targetId = id ?? mapped.id;
    setAppointments((prev) => {
      const exists = prev.some((a) => a.id === targetId);
      if (exists) {
        return prev.map((a) => (a.id === targetId ? mapped : a));
      }
      return [...prev, mapped];
    });
    return mapped;
  };

  const createAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'invoiced'>) => {
    try {
      const backendData = toBackendFormat(data);
      const response = await apiClient.post<{ data: any }>('/appointments', backendData);

      const backendAppointment = (response as { data?: any }).data ?? response;
      const createdList = Array.isArray(backendAppointment)
        ? backendAppointment
        : [backendAppointment];

      const mappedList = createdList.map(fromBackendFormat);
      setAppointments((prev) => [...prev, ...mappedList]);
      const newAppointment = mappedList[0];
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

  const changeAppointmentStatus = async (
    id: string,
    status: 'Pendiente' | 'Confirmada' | 'En Proceso' | 'Completada' | 'Cancelada',
    cancellationReason?: string
  ) => {
    const response = await apiClient.post<{ data: any }>(`/appointments/${id}/change-status`, {
      status,
      ...(cancellationReason ? { cancellation_reason: cancellationReason } : {}),
    });
    const backendAppointment = (response as { data?: any }).data ?? response;
    return applyBackendAppointmentToState(backendAppointment, id);
  };

  const confirmAppointment = async (id: string) => {
    const response = await apiClient.post<{ data: any }>(`/appointments/${id}/confirm`, {});
    const backendAppointment = (response as { data?: any }).data ?? response;
    return applyBackendAppointmentToState(backendAppointment, id);
  };

  const sendAppointmentReminder = async (id: string) => {
    const response = await apiClient.post<{ data: any }>(`/appointments/${id}/send-reminder`, {});
    const backendAppointment = (response as { data?: any }).data ?? response;
    return applyBackendAppointmentToState(backendAppointment, id);
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      if (updates.status && Object.keys(updates).length === 1) {
        const backendStatus = normalizeStatusToBackend(updates.status);
        if (backendStatus) {
          const mapped = await changeAppointmentStatus(
            id,
            backendStatus as 'Pendiente' | 'Confirmada' | 'En Proceso' | 'Completada' | 'Cancelada',
            updates.status === 'cancelled' ? 'Cancelada desde el sistema' : undefined
          );
          toast.success(
            updates.status === 'cancelled' ? 'Cita cancelada correctamente' : 'Cita actualizada correctamente'
          );
          return mapped;
        }
      }

      const backendData: any = {};

      if (updates.status) {
        const backendStatus = normalizeStatusToBackend(updates.status);
        if (backendStatus) backendData.status = backendStatus;
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

      const response = await apiClient.put<{ data: any }>(`/appointments/${id}`, backendData);
      const backendAppointment = (response as { data?: any }).data ?? response;
      if (backendAppointment?.id) {
        applyBackendAppointmentToState(backendAppointment, id);
      } else {
        const current = appointments.find((a) => a.id === id);
        if (current) {
          const updated = { ...current, ...updates };
          if (updates.status) {
            updated.status = normalizeStatusFromBackend(updates.status);
          }
          setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
        }
      }
      toast.success(updates.status === 'cancelled' ? 'Cita cancelada correctamente' : 'Cita actualizada correctamente');
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
    addAppointment: createAppointment,
    updateAppointment,
    changeAppointmentStatus,
    confirmAppointment,
    sendAppointmentReminder,
    deleteAppointment,
    getAppointmentsByDate,
    getUpcomingAppointments,
    refreshAppointments: loadAppointments,
  };
};