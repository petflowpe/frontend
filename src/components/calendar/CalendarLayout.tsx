import { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { WeekViewWithResources } from './WeekViewWithResources';
import { ResourceView } from './ResourceView';
import { NewAppointmentDialog } from './NewAppointmentDialog';
import { AppointmentDetailsDialog } from './AppointmentDetailsDialog';
import { CalendarFiltersBar, type QuickChip } from './CalendarFiltersBar';
import { CalendarKpiBar } from './CalendarKpiBar';
import { CalendarStatusLegend } from './CalendarStatusLegend';
import { useAppointments } from '../../hooks/useAppointments';
import { useCalendarNotifications } from '../../hooks/useCalendarNotifications';
import { useVehicles } from '../../hooks/useVehicles';
import { useCalendarConfig } from '../../hooks/useCalendarConfig';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCalendarFetchRange, parseAppointmentDate, getAppointmentDateOnly, snapTimeToInterval } from './calendarDateUtils';
import { loadCalendarFilters, saveCalendarFilters } from './calendarFilterStorage';
import { isUnconfirmed, hasNoVehicle } from './calendarAppointmentStyles';
import { toast } from 'sonner';
import { goToCashCollect } from '../../utils/navigationBridge';
import { IssueDocumentDialog } from '../appointments/IssueDocumentDialog';
import { getStoredCompanyId } from '../../utils/appointmentMappers';
import { matchesBookingSourceFilter } from '../../utils/bookingSourceHelpers';

interface CalendarLayoutProps {
  currentUser?: { companyId?: number } | null;
  onNavigate?: (tab: string) => void;
}

export function CalendarLayout({ currentUser, onNavigate }: CalendarLayoutProps) {
  const companyId = currentUser?.companyId ?? getStoredCompanyId() ?? undefined;
  const { vehicles } = useVehicles(companyId);
  const { config: calendarConfig } = useCalendarConfig(companyId);

  const stored = useMemo(() => loadCalendarFilters(), []);

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const defaultView = calendarConfig.default_view_current_day ? 'resource' : 'month';
  const [view, setView] = useState<'month' | 'week' | 'day' | 'resource'>(defaultView);

  const [searchQuery, setSearchQuery] = useState(stored.searchQuery ?? '');
  const [statusFilter, setStatusFilter] = useState(stored.statusFilter ?? 'all');
  const [filterTipoCita, setFilterTipoCita] = useState(stored.filterTipoCita ?? '');
  const [filterDistrict, setFilterDistrict] = useState(stored.filterDistrict ?? '');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(
    () => new Set(stored.selectedVehicleIds ?? [])
  );
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showCancelled, setShowCancelled] = useState(stored.showCancelled ?? false);
  const [bookingSourceFilter, setBookingSourceFilter] = useState(stored.bookingSourceFilter ?? 'all');
  const [quickChip, setQuickChip] = useState<QuickChip>('none');

  const {
    appointments,
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    changeAppointmentStatus,
    confirmAppointment,
    sendAppointmentReminder,
    refreshAppointments,
  } = useAppointments();
  useCalendarNotifications();

  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [issueDocOpen, setIssueDocOpen] = useState(false);
  const [invoiceAppointmentId, setInvoiceAppointmentId] = useState<string | null>(null);
  const [prefilledDate, setPrefilledDate] = useState<Date | undefined>();
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>();
  const [prefilledResourceId, setPrefilledResourceId] = useState<string | undefined>();
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  const resourceList = useMemo(
    () =>
      vehicles.map((v) => ({
        id: String(v.id),
        name: v.name || `Móvil ${v.id}`,
        driver: v.driver_name || v.driver || '',
      })),
    [vehicles]
  );

  const filteredBySearch = useMemo(() => {
    if (!vehicleSearch.trim()) return resourceList;
    const q = vehicleSearch.trim().toLowerCase();
    return resourceList.filter(
      (r) => r.name.toLowerCase().includes(q) || (r.driver && r.driver.toLowerCase().includes(q))
    );
  }, [resourceList, vehicleSearch]);

  const selectedResources = useMemo(() => {
    if (selectedVehicleIds.size === 0) return resourceList;
    return resourceList.filter((r) => selectedVehicleIds.has(r.id));
  }, [resourceList, selectedVehicleIds]);

  const weekStartsOn = (calendarConfig.first_day_of_week ?? 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const intervalMinutes = calendarConfig.interval_minutes ?? 15;

  useEffect(() => {
    const { date_from, date_to } = getCalendarFetchRange(currentDate, view, weekStartsOn);
    refreshAppointments({ date_from, date_to, limit: 500 });
  }, [currentDate, view, weekStartsOn, refreshAppointments]);

  useEffect(() => {
    saveCalendarFilters({
      searchQuery,
      statusFilter,
      filterTipoCita,
      filterDistrict,
      selectedVehicleIds: Array.from(selectedVehicleIds),
      showCancelled,
      bookingSourceFilter,
    });
  }, [searchQuery, statusFilter, filterTipoCita, filterDistrict, selectedVehicleIds, showCancelled, bookingSourceFilter]);

  const tipoCitaOptions = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((apt: any) => {
      const t = apt.service_type || apt.service_category || apt.serviceType;
      if (t) set.add(String(t));
    });
    return Array.from(set).sort();
  }, [appointments]);

  const districtOptions = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((apt: any) => {
      if (apt.district) set.add(String(apt.district));
    });
    return Array.from(set).sort();
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    let list = [...appointments];

    if (!showCancelled) {
      list = list.filter((apt) => apt.status !== 'cancelled' && apt.status !== 'no_show');
    } else if (statusFilter !== 'cancelled') {
      /* keep all when showing cancelled via toggle */
    }

    if (statusFilter !== 'all') {
      list = list.filter((apt) => apt.status === statusFilter);
    }

    if (selectedVehicleIds.size > 0) {
      list = list.filter((apt) => {
        const vid = apt.vehicle?.id != null ? String(apt.vehicle.id) : '';
        return vid && selectedVehicleIds.has(vid);
      });
    }

    if (filterTipoCita) {
      list = list.filter((apt: any) => {
        const tipo = apt.service_type || apt.service_category || apt.serviceType || '';
        return String(tipo).toLowerCase() === filterTipoCita.toLowerCase();
      });
    }

    if (filterDistrict) {
      list = list.filter((apt: any) => String(apt.district || '').toLowerCase() === filterDistrict.toLowerCase());
    }

    if (bookingSourceFilter !== 'all') {
      list = list.filter((apt: any) => matchesBookingSourceFilter(apt.bookingSource, bookingSourceFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((apt: any) => {
        const fields = [
          apt.clientName,
          apt.client,
          apt.petName,
          apt.pet,
          apt.trackingCode,
          apt.tracking_code,
          apt.phone,
        ]
          .filter(Boolean)
          .map((s) => String(s).toLowerCase());
        return fields.some((f) => f.includes(q));
      });
    }

    if (quickChip === 'today') {
      const today = format(new Date(), 'yyyy-MM-dd');
      list = list.filter((apt) => getAppointmentDateOnly(apt.date) === today);
    } else if (quickChip === 'unconfirmed') {
      list = list.filter((apt) => isUnconfirmed(apt));
    } else if (quickChip === 'no_vehicle') {
      list = list.filter((apt) => hasNoVehicle(apt));
    }

    return list;
  }, [
    appointments,
    statusFilter,
    filterTipoCita,
    filterDistrict,
    selectedVehicleIds,
    searchQuery,
    showCancelled,
    quickChip,
    bookingSourceFilter,
  ]);

  const rangeLabel = useMemo(() => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale: es });
    if (view === 'week') return `Semana del ${format(currentDate, 'd MMM', { locale: es })}`;
    return format(currentDate, "EEEE d MMM", { locale: es });
  }, [currentDate, view]);

  const kpiAppointments = useMemo(() => {
    const { date_from, date_to } = getCalendarFetchRange(currentDate, view, weekStartsOn);
    return filteredAppointments.filter((apt) => {
      const d = getAppointmentDateOnly(apt.date);
      return d >= date_from && d <= date_to;
    });
  }, [filteredAppointments, currentDate, view, weekStartsOn]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (searchQuery.trim()) n++;
    if (statusFilter !== 'all') n++;
    if (filterTipoCita) n++;
    if (filterDistrict) n++;
    if (selectedVehicleIds.size > 0) n++;
    if (showCancelled) n++;
    if (quickChip !== 'none') n++;
    if (bookingSourceFilter !== 'all') n++;
    return n;
  }, [searchQuery, statusFilter, filterTipoCita, filterDistrict, selectedVehicleIds, showCancelled, quickChip, bookingSourceFilter]);

  const toggleVehicle = (id: string) => {
    setSelectedVehicleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setFilterTipoCita('');
    setFilterDistrict('');
    setSelectedVehicleIds(new Set());
    setVehicleSearch('');
    setShowCancelled(false);
    setQuickChip('none');
    setBookingSourceFilter('all');
  };

  useEffect(() => {
    const handleOpenNewAppointment = () => setIsNewAppointmentOpen(true);
    window.addEventListener('open-new-appointment', handleOpenNewAppointment);
    return () => window.removeEventListener('open-new-appointment', handleOpenNewAppointment);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsNewAppointmentOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setCurrentDate(new Date());
      } else if (e.key === 'd' || e.key === 'D') setView('day');
      else if (e.key === 'w' || e.key === 'W') setView('week');
      else if (e.key === 'm' || e.key === 'M') setView('month');
      else if (e.key === 'r' || e.key === 'R') setView('resource');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleDateClick = (date: Date, resourceId?: string) => {
    setPrefilledDate(date);
    setPrefilledTime(format(date, 'HH:mm'));
    setPrefilledResourceId(resourceId);
    setEditingAppointment(null);
    setIsNewAppointmentOpen(true);
  };

  const handleAppointmentClick = (appointment: any) => setSelectedAppointment(appointment);

  const handleSaveNewAppointment = async (appointment: any): Promise<void> => {
    if (editingAppointment) {
      await updateAppointment(appointment.id, appointment);
      return;
    }
    const created = await createAppointment(appointment);
    window.dispatchEvent(new CustomEvent('appointment-created', { detail: { appointment: created } }));
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    const dateStr = appointment.date || '';
    const dateObj = dateStr.includes('T')
      ? new Date(dateStr)
      : (() => {
          const [y, m, d] = dateStr.split('-').map(Number);
          return isNaN(y) ? undefined : new Date(y, m - 1, d);
        })();
    setPrefilledDate(dateObj || new Date());
    let timeStr = (appointment.time || '09:00').trim();
    if (timeStr.includes('T')) timeStr = format(new Date(timeStr), 'HH:mm');
    else if (timeStr.length > 5) timeStr = timeStr.slice(0, 5);
    setPrefilledTime(timeStr);
    const vehicleId = appointment.vehicle?.id ?? appointment.vehicle;
    setPrefilledResourceId(vehicleId ? String(vehicleId) : undefined);
    setSelectedAppointment(null);
    setIsNewAppointmentOpen(true);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    await changeAppointmentStatus(appointmentId, 'Cancelada', 'Cancelada desde agenda');
    window.dispatchEvent(
      new CustomEvent('appointment-cancelled', { detail: { appointmentId, message: 'Cita cancelada correctamente' } })
    );
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    await confirmAppointment(appointmentId);
    toast.success('Cita confirmada');
    setSelectedAppointment(null);
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    await changeAppointmentStatus(appointmentId, 'Completada', 'Completada desde agenda');
    toast.success('Cita marcada como completada', {
      action: {
        label: 'Cobrar en Caja',
        onClick: () => goToCashCollect(appointmentId, true),
      },
    });
    setSelectedAppointment(null);
  };

  const handleGenerateInvoiceFromCalendar = (appointment: any) => {
    setSelectedAppointment(null);
    setInvoiceAppointmentId(String(appointment.id));
    setIssueDocOpen(true);
  };

  const handleSendReminder = async (appointmentId: string) => {
    await sendAppointmentReminder(appointmentId);
    toast.success('Recordatorio enviado');
  };

  const handleRescheduleAppointment = (appointment: any) => handleEditAppointment(appointment);
  const handleDeleteAppointment = async (appointmentId: string) => await deleteAppointment(appointmentId);

  const handleAppointmentDrop = (
    appointmentId: string,
    newDate: Date,
    newTime?: string,
    newResourceId?: string
  ) => {
    const appointment = appointments.find((a: any) => a.id === appointmentId);
    if (!appointment) return;
    const snapped =
      newTime ||
      snapTimeToInterval(newDate.getHours(), newDate.getMinutes(), intervalMinutes);
    const updates: any = { date: format(newDate, 'yyyy-MM-dd'), time: snapped };
    if (newResourceId) {
      updates.vehicle = newResourceId;
      const vehicle = resourceList.find((v) => v.id === newResourceId);
      if (vehicle) updates.groomer = vehicle.driver;
    }
    updateAppointment(appointmentId, updates);
    toast.success('Cita actualizada');
    window.dispatchEvent(
      new CustomEvent('appointment-moved', {
        detail: {
          appointmentId,
          newDate: updates.date,
          newTime: updates.time,
          message: `Cita movida a ${format(newDate, 'dd/MM/yyyy')} a las ${updates.time}`,
        },
      })
    );
  };

  const handleCloseNewAppointmentDialog = () => {
    setIsNewAppointmentOpen(false);
    setEditingAppointment(null);
    setPrefilledDate(undefined);
    setPrefilledTime(undefined);
    setPrefilledResourceId(undefined);
  };

  const viewProps = {
    firstHour: calendarConfig.day_view_first_hour ?? 8,
    lastHour: calendarConfig.day_view_last_hour ?? 18,
    firstHourWeek: calendarConfig.first_hour ?? 8,
    lastHourWeek: calendarConfig.last_hour ?? 20,
    weekStartsOn,
    intervalMinutes,
    showWeekends: calendarConfig.show_weekends ?? true,
  };

  const dayResources = selectedResources.length > 0 ? selectedResources : resourceList;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-2 sm:p-3 gap-1.5 overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        view={view}
        onViewChange={setView}
        showDayView={calendarConfig.show_day_view_option}
        onNavigate={onNavigate}
      />

      <CalendarFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        filterTipoCita={filterTipoCita}
        onFilterTipoCitaChange={setFilterTipoCita}
        filterDistrict={filterDistrict}
        onFilterDistrictChange={setFilterDistrict}
        bookingSourceFilter={bookingSourceFilter}
        onBookingSourceFilterChange={setBookingSourceFilter}
        tipoCitaOptions={tipoCitaOptions}
        districtOptions={districtOptions}
        quickChip={quickChip}
        onQuickChipChange={setQuickChip}
        showCancelled={showCancelled}
        onShowCancelledChange={setShowCancelled}
        activeFilterCount={activeFilterCount}
        onClearFilters={clearFilters}
        selectedVehicleCount={selectedVehicleIds.size}
        totalVehicles={resourceList.length}
        resources={resourceList}
        filteredResources={filteredBySearch}
        selectedVehicleIds={selectedVehicleIds}
        vehicleSearch={vehicleSearch}
        onVehicleSearchChange={setVehicleSearch}
        onToggleVehicle={toggleVehicle}
        onSelectAllVehicles={() => setSelectedVehicleIds(new Set())}
        onClearVehicleSelection={() => setSelectedVehicleIds(new Set(resourceList.map((r) => r.id)))}
      />

      <CalendarKpiBar appointments={kpiAppointments} rangeLabel={rangeLabel} />

      <div className="flex-1 min-h-0 flex flex-col relative border rounded-lg overflow-hidden bg-card">
        <CalendarStatusLegend />
        {loading && (
          <div className="absolute top-8 right-2 z-20 text-xs bg-background/90 border rounded px-2 py-1 text-muted-foreground shadow-sm">
            Cargando citas…
          </div>
        )}

        <div className="flex-1 min-h-0">
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              appointments={filteredAppointments}
              onDateClick={handleDateClick}
              onAppointmentClick={handleAppointmentClick}
              weekStartsOn={viewProps.weekStartsOn}
            />
          )}
          {view === 'week' &&
            (dayResources.length > 0 && selectedVehicleIds.size > 0 ? (
              <WeekViewWithResources
                currentDate={currentDate}
                appointments={filteredAppointments}
                resources={dayResources}
                onDateClick={handleDateClick}
                onAppointmentClick={handleAppointmentClick}
                onAppointmentDrop={handleAppointmentDrop}
                {...viewProps}
              />
            ) : (
              <WeekView
                currentDate={currentDate}
                appointments={filteredAppointments}
                onDateClick={handleDateClick}
                onAppointmentClick={handleAppointmentClick}
                onAppointmentDrop={handleAppointmentDrop}
                {...viewProps}
              />
            ))}
          {(view === 'resource' || view === 'day') && dayResources.length > 0 && (
            <ResourceView
              currentDate={currentDate}
              appointments={filteredAppointments}
              resources={dayResources}
              onDateClick={handleDateClick}
              onAppointmentClick={handleAppointmentClick}
              onAppointmentDrop={handleAppointmentDrop}
              firstHour={viewProps.firstHour}
              lastHour={viewProps.lastHour}
              intervalMinutes={viewProps.intervalMinutes}
            />
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center hidden lg:block leading-none">
        Atajos: N nueva cita · T hoy · R agenda móvil · D/W/M vistas
      </p>

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onEdit={handleEditAppointment}
        onCancel={handleCancelAppointment}
        onReschedule={handleRescheduleAppointment}
        onDelete={handleDeleteAppointment}
        onConfirm={handleConfirmAppointment}
        onComplete={handleCompleteAppointment}
        onSendReminder={handleSendReminder}
        onNavigate={onNavigate}
        onGenerateInvoice={handleGenerateInvoiceFromCalendar}
      />

      <NewAppointmentDialog
        isOpen={isNewAppointmentOpen}
        onClose={handleCloseNewAppointmentDialog}
        prefilledDate={prefilledDate}
        prefilledTime={prefilledTime}
        prefilledResourceId={prefilledResourceId}
        editingAppointment={editingAppointment}
        existingAppointments={appointments}
        onSave={handleSaveNewAppointment}
        vehicles={dayResources}
      />

      {invoiceAppointmentId && (
        <IssueDocumentDialog
          open={issueDocOpen}
          onOpenChange={(open) => {
            setIssueDocOpen(open);
            if (!open) setInvoiceAppointmentId(null);
          }}
          appointmentId={invoiceAppointmentId}
        />
      )}
    </div>
  );
}
