import { useState, useEffect, useMemo } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { WeekViewWithResources } from './WeekViewWithResources';
import { ResourceView } from './ResourceView';
import { NewAppointmentDialog } from './NewAppointmentDialog';
import { AppointmentDetailsDialog } from './AppointmentDetailsDialog';
import { useAppointments } from '../../hooks/useAppointments';
import { useCalendarNotifications } from '../../hooks/useCalendarNotifications';
import { useVehicles } from '../../hooks/useVehicles';
import { useCalendarConfig } from '../../hooks/useCalendarConfig';
import { format } from 'date-fns';
import { getCalendarFetchRange } from './calendarDateUtils';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Car, RotateCcw, Search } from 'lucide-react';
import { cn } from '../ui/utils';
import { getStoredCompanyId } from '../../utils/appointmentMappers';

interface CalendarLayoutProps {
  currentUser?: { companyId?: number } | null;
}

export function CalendarLayout({ currentUser }: CalendarLayoutProps) {
  const companyId = currentUser?.companyId ?? getStoredCompanyId() ?? undefined;
  const { vehicles, loading: vehiclesLoading } = useVehicles(companyId);
  const { config: calendarConfig } = useCalendarConfig(companyId);

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const defaultView = calendarConfig.default_view_current_day ? 'day' : 'month';
  const [view, setView] = useState<'month' | 'week' | 'day' | 'resource'>(defaultView);

  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(new Set());
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [filterTipoCita, setFilterTipoCita] = useState<string>('');

  const {
    appointments,
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    changeAppointmentStatus,
    refreshAppointments,
  } = useAppointments();
  useCalendarNotifications();

  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | undefined>();
  const [prefilledTime, setPrefilledTime] = useState<string | undefined>();
  const [prefilledResourceId, setPrefilledResourceId] = useState<string | undefined>();
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  const resourceList = useMemo(() => {
    return vehicles.map(v => ({
      id: String(v.id),
      name: v.name || `Móvil ${v.id}`,
      driver: v.driver_name || v.driver || '',
    }));
  }, [vehicles]);

  const filteredBySearch = useMemo(() => {
    if (!vehicleSearch.trim()) return resourceList;
    const q = vehicleSearch.trim().toLowerCase();
    return resourceList.filter(r => r.name.toLowerCase().includes(q) || (r.driver && r.driver.toLowerCase().includes(q)));
  }, [resourceList, vehicleSearch]);

  const selectedResources = useMemo(() => {
    if (selectedVehicleIds.size === 0) return resourceList;
    return resourceList.filter(r => selectedVehicleIds.has(r.id));
  }, [resourceList, selectedVehicleIds]);

  const toggleVehicle = (id: string) => {
    setSelectedVehicleIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedVehicleIds(new Set());
    setVehicleSearch('');
    setFilterTipoCita('');
  };

  const weekStartsOn = (calendarConfig.first_day_of_week ?? 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6;

  useEffect(() => {
    const { date_from, date_to } = getCalendarFetchRange(currentDate, view, weekStartsOn);
    refreshAppointments({ date_from, date_to, limit: 200 });
  }, [currentDate, view, weekStartsOn, refreshAppointments]);

  const filteredAppointments = useMemo(() => {
    let list = appointments.filter(
      (apt) => apt.status !== 'cancelled' && apt.status !== 'no_show'
    );

    if (selectedVehicleIds.size > 0) {
      list = list.filter((apt) => {
        const vid = apt.vehicle?.id != null ? String(apt.vehicle.id) : '';
        return vid && selectedVehicleIds.has(vid);
      });
    }

    if (!filterTipoCita) return list;
    return list.filter((apt: any) => {
      const tipo = apt.service_type || apt.service_category || apt.serviceType || '';
      return String(tipo).toLowerCase() === filterTipoCita.toLowerCase();
    });
  }, [appointments, filterTipoCita, selectedVehicleIds]);

  const tipoCitaOptions = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((apt: any) => {
      const t = apt.service_type || apt.service_category || apt.serviceType;
      if (t) set.add(String(t));
    });
    return Array.from(set).sort();
  }, [appointments]);

  useEffect(() => {
    const handleOpenNewAppointment = () => setIsNewAppointmentOpen(true);
    window.addEventListener('open-new-appointment', handleOpenNewAppointment);
    return () => window.removeEventListener('open-new-appointment', handleOpenNewAppointment);
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
    window.dispatchEvent(
      new CustomEvent('appointment-created', { detail: { appointment: created } })
    );
  };

  const handleEditAppointment = (appointment: any) => {
    setEditingAppointment(appointment);
    const dateStr = appointment.date || '';
    const dateObj = dateStr.includes('T') ? new Date(dateStr) : (() => {
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
      new CustomEvent('appointment-cancelled', {
        detail: { appointmentId, message: 'Cita cancelada correctamente' },
      })
    );
  };

  const handleRescheduleAppointment = (appointment: any) => handleEditAppointment(appointment);

  const handleDeleteAppointment = async (appointmentId: string) => await deleteAppointment(appointmentId);

  const handleAppointmentDrop = (appointmentId: string, newDate: Date, newTime?: string, newResourceId?: string) => {
    const appointment = appointments.find((a: any) => a.id === appointmentId);
    if (!appointment) return;
    const updates: any = { date: format(newDate, 'yyyy-MM-dd') };
    if (newTime) updates.time = newTime;
    if (newResourceId) {
      updates.vehicle = newResourceId;
      const vehicle = resourceList.find(v => v.id === newResourceId);
      if (vehicle) updates.groomer = vehicle.driver;
    }
    updateAppointment(appointmentId, updates);
    toast.success('✅ Cita actualizada exitosamente');
    window.dispatchEvent(new CustomEvent('appointment-moved', {
      detail: { appointmentId, newDate: updates.date, newTime: updates.time, message: `Cita movida a ${format(newDate, 'dd/MM/yyyy')} a las ${newTime || appointment.time}` }
    }));
  };

  const handleCloseNewAppointmentDialog = () => {
    setIsNewAppointmentOpen(false);
    setEditingAppointment(null);
    setPrefilledDate(undefined);
    setPrefilledTime(undefined);
    setPrefilledResourceId(undefined);
  };

  const calendarConfigForViews = {
    firstHour: calendarConfig.day_view_first_hour ?? 8,
    lastHour: calendarConfig.day_view_last_hour ?? 18,
    firstHourWeek: calendarConfig.first_hour ?? 8,
    lastHourWeek: calendarConfig.last_hour ?? 20,
    weekStartsOn,
  };

  return (
    <div className="flex h-screen p-4 gap-4 overflow-hidden">
      {/* Sidebar filtros */}
      <aside className="w-64 flex-shrink-0 border rounded-lg bg-background p-3 flex flex-col overflow-hidden">
        <Button variant="outline" size="sm" className="mb-3" onClick={clearFilters}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Reiniciar filtros
        </Button>
        <div className="flex items-center gap-2 mb-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Móviles</span>
          <span className="text-xs bg-muted rounded-full px-2 py-0.5">
            {selectedVehicleIds.size === 0 ? resourceList.length : selectedVehicleIds.size}
          </span>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filtrar"
            value={vehicleSearch}
            onChange={e => setVehicleSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredBySearch.map(r => (
            <label key={r.id} className={cn("flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-muted/50 text-sm", selectedVehicleIds.has(r.id) && "bg-muted")}>
              <input
                type="checkbox"
                checked={selectedVehicleIds.size === 0 || selectedVehicleIds.has(r.id)}
                onChange={() => toggleVehicle(r.id)}
                className="rounded border-input"
              />
              <span className="truncate">{r.name}</span>
            </label>
          ))}
          {filteredBySearch.length === 0 && <p className="text-xs text-muted-foreground py-2">Sin resultados</p>}
        </div>
        <div className="border-t pt-3 mt-2">
          <Label className="text-xs text-muted-foreground block mb-1">Tipo de cita</Label>
          <select
            value={filterTipoCita}
            onChange={e => setFilterTipoCita(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          >
            <option value="">Todos</option>
            {tipoCitaOptions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          view={view}
          onViewChange={setView}
          showDayView={calendarConfig.show_day_view_option}
        />

        <div className="flex-1 min-h-0 mt-2 relative">
          {loading && (
            <div className="absolute top-2 right-2 z-20 text-xs bg-background/90 border rounded px-2 py-1 text-muted-foreground shadow-sm">
              Cargando citas…
            </div>
          )}
          {view === 'month' && (
            <MonthView
              currentDate={currentDate}
              appointments={filteredAppointments}
              onDateClick={handleDateClick}
              onAppointmentClick={handleAppointmentClick}
            />
          )}
          {view === 'week' && (
            selectedResources.length > 0 ? (
              <WeekViewWithResources
                currentDate={currentDate}
                appointments={filteredAppointments}
                resources={selectedResources}
                onDateClick={handleDateClick}
                onAppointmentClick={handleAppointmentClick}
                onAppointmentDrop={handleAppointmentDrop}
                firstHour={calendarConfigForViews.firstHourWeek}
                lastHour={calendarConfigForViews.lastHourWeek}
                weekStartsOn={calendarConfigForViews.weekStartsOn}
              />
            ) : (
              <WeekView
                currentDate={currentDate}
                appointments={filteredAppointments}
                onDateClick={handleDateClick}
                onAppointmentClick={handleAppointmentClick}
                onAppointmentDrop={handleAppointmentDrop}
                firstHour={calendarConfigForViews.firstHourWeek}
                lastHour={calendarConfigForViews.lastHourWeek}
              />
            )
          )}
          {(view === 'resource' || view === 'day') && (
            selectedResources.length > 0 ? (
              <ResourceView
                currentDate={currentDate}
                appointments={filteredAppointments}
                resources={selectedResources}
                onDateClick={handleDateClick}
                onAppointmentClick={handleAppointmentClick}
                onAppointmentDrop={handleAppointmentDrop}
                firstHour={calendarConfigForViews.firstHour}
                lastHour={calendarConfigForViews.lastHour}
              />
            ) : (
              <div className="flex items-center justify-center h-full border rounded-lg bg-muted/10">
                <p className="text-muted-foreground text-center px-4">
                  Selecciona al menos un móvil en el panel izquierdo para ver la vista por día o por recurso.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onEdit={handleEditAppointment}
        onCancel={handleCancelAppointment}
        onReschedule={handleRescheduleAppointment}
        onDelete={handleDeleteAppointment}
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
        vehicles={selectedResources.length > 0 ? selectedResources : resourceList}
      />
    </div>
  );
}
