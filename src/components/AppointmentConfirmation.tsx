import { useState, useEffect, useMemo, useCallback } from 'react';
import { Bell, Check, Clock, Phone, Mail, Calendar, Loader2, RefreshCw, MessageSquare, Globe, CheckCircle2, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatDate } from '../utils/helpers';
import { useAppointments } from '../hooks/useAppointments';
import { useClients } from '../hooks/useClients';
import { useCompanies } from '../hooks/useCompanies';
import { getStoredCompanyId } from '../utils/appointmentMappers';
import { BookingSourceBadge } from './appointments/BookingSourceBadge';
import { isPortalBooking } from '../utils/bookingSourceHelpers';

interface Appointment {
  id: string;
  clientId?: string;
  clientName: string;
  petName: string;
  service: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  confirmed: boolean;
  status: string;
  bookingSource?: string;
  advanceAmount?: number;
  advancePaidAt?: string | null;
  trackingCode?: string;
  clientPortalBookingEnabled?: boolean;
  clientPortalApprovalStatus?: string;
  remindersSent: {
    reminder24h: boolean;
    reminder2h: boolean;
  };
  confirmationMethod?: 'sms' | 'whatsapp' | 'email' | 'phone';
  confirmationDate?: string;
}

interface CancellationPolicy {
  id: string;
  name: string;
  windowHours: number;
  penaltyPercentage: number;
  enabled: boolean;
}

const DEFAULT_POLICIES: CancellationPolicy[] = [
  { id: 'POL-001', name: 'Cancelación con 24 horas', windowHours: 24, penaltyPercentage: 0, enabled: true },
  { id: 'POL-002', name: 'Cancelación 12-24 horas antes', windowHours: 12, penaltyPercentage: 30, enabled: true },
  { id: 'POL-003', name: 'Cancelación menos de 12 horas', windowHours: 0, penaltyPercentage: 50, enabled: true },
];

export function AppointmentConfirmation() {
  const {
    appointments: rawAppointments,
    loading,
    refreshAppointments,
    confirmAppointment,
    sendAppointmentReminder,
  } = useAppointments();
  const { updateClient } = useClients();
  const { getCompanyConfig, updateCompanyConfig } = useCompanies();
  const companyId = getStoredCompanyId();

  const loadAppointmentsRange = useCallback(() => {
    const today = new Date().toLocaleDateString('en-CA');
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    return refreshAppointments({
      date_from: today,
      date_to: in7.toLocaleDateString('en-CA'),
      limit: 100,
    });
  }, [refreshAppointments]);

  useEffect(() => {
    loadAppointmentsRange();
  }, [loadAppointmentsRange]);

  const appointments: Appointment[] = useMemo(
    () =>
      rawAppointments
        .filter((a) => a.status !== 'cancelled')
        .map((a) => ({
          id: a.id,
          clientId: a.clientId,
          clientName: a.clientName || a.client || 'Cliente',
          petName: a.petName || a.pet || 'Mascota',
          service: a.serviceType || a.reason || 'Servicio',
          date: a.date,
          time: (a.time || '').slice(0, 5),
          phone: a.clientPhone || a.phone || '',
          email: a.clientEmail || '',
          status: a.status,
          bookingSource: a.bookingSource,
          advanceAmount: a.advanceAmount,
          advancePaidAt: a.advancePaidAt,
          trackingCode: a.trackingCode,
          clientPortalBookingEnabled: a.clientPortalBookingEnabled,
          clientPortalApprovalStatus: a.clientPortalApprovalStatus,
          confirmed: a.status === 'confirmed' || a.status === 'in-progress' || a.status === 'completed',
          remindersSent: {
            reminder24h: !!a.reminderSent,
            reminder2h: false,
          },
          confirmationMethod: a.confirmationSent ? 'whatsapp' : undefined,
          confirmationDate: a.confirmedAt,
        })),
    [rawAppointments]
  );

  const portalInbox = useMemo(
    () =>
      appointments.filter(
        (a) => isPortalBooking(a.bookingSource) && a.status === 'pending'
      ),
    [appointments]
  );

  const needsClientApproval = (appointment: Appointment) =>
    appointment.clientPortalApprovalStatus === 'pending' ||
    appointment.clientPortalApprovalStatus === 'rejected' ||
    appointment.clientPortalBookingEnabled === false;

  const [policies, setPolicies] = useState<CancellationPolicy[]>(DEFAULT_POLICIES);
  const [autoReminders, setAutoReminders] = useState({
    reminder24h: true,
    reminder2h: true,
    requireConfirmation: true,
  });
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    (async () => {
      setConfigLoading(true);
      try {
        const config = await getCompanyConfig(companyId, 'document_settings');
        if (cancelled) return;
        if (Array.isArray(config?.cancellation_policies) && config.cancellation_policies.length > 0) {
          setPolicies(config.cancellation_policies as CancellationPolicy[]);
        }
        if (config?.appointment_reminders && typeof config.appointment_reminders === 'object') {
          setAutoReminders((prev) => ({ ...prev, ...config.appointment_reminders }));
        }
      } catch {
        /* defaults */
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [companyId, getCompanyConfig]);

  const persistConfirmationConfig = async (
    nextPolicies: CancellationPolicy[],
    nextReminders: typeof autoReminders
  ) => {
    if (!companyId) {
      toast.error('No hay empresa asociada para guardar la configuración');
      return;
    }
    try {
      await updateCompanyConfig(companyId, 'document_settings', {
        cancellation_policies: nextPolicies,
        appointment_reminders: nextReminders,
      });
    } catch {
      toast.error('No se pudo guardar la configuración');
    }
  };

  const handleConfirm = async (
    appointmentId: string,
    _method: 'sms' | 'whatsapp' | 'email' | 'phone'
  ) => {
    try {
      await confirmAppointment(appointmentId);
      toast.success('Cita confirmada en el sistema');
    } catch {
      toast.error('No se pudo confirmar la cita');
    }
  };

  const handleApprovePortalClient = async (appointment: Appointment) => {
    if (!appointment.clientId) {
      toast.error('No se encontró el cliente asociado a la cita');
      return;
    }
    try {
      await updateClient(appointment.clientId, {
        portalBookingEnabled: true,
        portalApprovalStatus: 'approved',
      });
      toast.success(`Cliente ${appointment.clientName} aprobado para el portal`);
    } catch {
      toast.error('No se pudo aprobar el cliente para el portal');
    }
  };

  const handleSendReminder = async (appointmentId: string) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;
    try {
      await sendAppointmentReminder(appointmentId);
      toast.success(`Recordatorio registrado para ${appointment.clientName}`);
    } catch {
      toast.error('No se pudo enviar el recordatorio');
    }
  };

  const handleTogglePolicy = (policyId: string) => {
    const next = policies.map((pol) =>
      pol.id === policyId ? { ...pol, enabled: !pol.enabled } : pol
    );
    setPolicies(next);
    void persistConfirmationConfig(next, autoReminders);
  };

  const handleAutoReminderChange = (patch: Partial<typeof autoReminders>) => {
    const next = { ...autoReminders, ...patch };
    setAutoReminders(next);
    void persistConfirmationConfig(policies, next);
  };

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.confirmed).length,
    pending: appointments.filter(a => !a.confirmed).length,
    portalPending: portalInbox.length,
    confirmationRate:
      appointments.length > 0
        ? (appointments.filter((a) => a.confirmed).length / appointments.length) * 100
        : 0,
  };

  const renderAppointmentActions = (appointment: Appointment) => {
    const reminder24h = !!appointment.remindersSent?.reminder24h;
    return (
      <div className="flex justify-end gap-2 flex-wrap">
        {isPortalBooking(appointment.bookingSource) && needsClientApproval(appointment) && appointment.clientId && (
          <Button
            size="sm"
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handleApprovePortalClient(appointment)}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Aprobar cliente
          </Button>
        )}
        {!appointment.confirmed && (
          <>
            <Button size="sm" onClick={() => handleConfirm(appointment.id, 'whatsapp')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleConfirm(appointment.id, 'phone')}>
              <Phone className="w-4 h-4 mr-2" />
              Llamada
            </Button>
          </>
        )}
        {!reminder24h && (
          <Button size="sm" variant="outline" onClick={() => handleSendReminder(appointment.id)}>
            <Bell className="w-4 h-4 mr-2" />
            Recordatorio 24h
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Confirmación de Citas
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Citas reales próximos 7 días — confirmar y enviar recordatorios
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadAppointmentsRange()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualizar
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total de Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {stats.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.confirmed}
              </p>
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.pending}
              </p>
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Portal pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.portalPending}
              </p>
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Tasa de Confirmación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.confirmationRate.toFixed(0)}%
            </p>
            <Progress value={stats.confirmationRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Citas Próximas</TabsTrigger>
          <TabsTrigger value="portal">
            Reservas portal
            {stats.portalPending > 0 && (
              <Badge className="ml-2 bg-indigo-600 text-white">{stats.portalPending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="policies">Políticas de Cancelación</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="px-4">Cita</TableHead>
                    <TableHead className="px-4">Cliente</TableHead>
                    <TableHead className="px-4">Mascota</TableHead>
                    <TableHead className="px-4">Servicio</TableHead>
                    <TableHead className="px-4">Fecha</TableHead>
                    <TableHead className="px-4">Hora</TableHead>
                    <TableHead className="px-4">Teléfono</TableHead>
                    <TableHead className="px-4">Email</TableHead>
                    <TableHead className="px-4">Origen</TableHead>
                    <TableHead className="px-4">Estado</TableHead>
                    <TableHead className="px-4">Confirmación</TableHead>
                    <TableHead className="px-4">Recordatorios</TableHead>
                    <TableHead className="px-4 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => {
                    const reminder24h = !!appointment.remindersSent?.reminder24h;
                    const reminder2h = !!appointment.remindersSent?.reminder2h;
                    const confirmationInfo = appointment.confirmed
                      ? `Vía ${appointment.confirmationMethod || '—'} · ${appointment.confirmationDate ? formatDate(appointment.confirmationDate) : '—'}`
                      : '—';

                    return (
                      <TableRow key={appointment.id} className="hover:bg-muted/20">
                        <TableCell className="px-4 py-4 font-mono text-xs">
                          {appointment.id}
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-normal">
                          <div className="font-medium text-foreground">{appointment.clientName}</div>
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-normal">
                          <div className="font-medium text-foreground">{appointment.petName}</div>
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-normal">
                          <div className="text-foreground">{appointment.service}</div>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {formatDate(appointment.date)}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {appointment.time}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className="inline-flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{appointment.phone}</span>
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">{appointment.email}</span>
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <BookingSourceBadge source={appointment.bookingSource} />
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {appointment.confirmed ? (
                            <Badge className="bg-green-500">
                              <Check className="w-3 h-3 mr-1" />
                              Confirmada
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-normal">
                          <span className={appointment.confirmed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                            {confirmationInfo}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4 whitespace-normal">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={reminder24h ? 'default' : 'outline'}>
                              {reminder24h ? <Check className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                              24h
                            </Badge>
                            <Badge variant={reminder2h ? 'default' : 'outline'}>
                              {reminder2h ? <Check className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                              2h
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {renderAppointmentActions(appointment)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal" className="space-y-4">
          <Card className="p-4 border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20">
            <p className="text-sm text-indigo-900 dark:text-indigo-200">
              Inbox de reservas hechas desde el portal web. Incluye citas pendientes de validación por el staff.
            </p>
          </Card>
          <Card className="p-0 overflow-hidden">
            <CardContent className="p-0">
              {portalInbox.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Globe className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  No hay reservas portal pendientes en los próximos 7 días
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="px-4">Código</TableHead>
                      <TableHead className="px-4">Cliente</TableHead>
                      <TableHead className="px-4">Mascota</TableHead>
                      <TableHead className="px-4">Servicio</TableHead>
                      <TableHead className="px-4">Fecha</TableHead>
                      <TableHead className="px-4">Hora</TableHead>
                      <TableHead className="px-4">Adelanto</TableHead>
                      <TableHead className="px-4">Cliente portal</TableHead>
                      <TableHead className="px-4 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portalInbox.map((appointment) => (
                      <TableRow key={appointment.id} className="hover:bg-muted/20">
                        <TableCell className="px-4 py-4 font-mono text-xs">
                          {appointment.trackingCode || appointment.id}
                        </TableCell>
                        <TableCell className="px-4 py-4">{appointment.clientName}</TableCell>
                        <TableCell className="px-4 py-4">{appointment.petName}</TableCell>
                        <TableCell className="px-4 py-4">{appointment.service}</TableCell>
                        <TableCell className="px-4 py-4">{formatDate(appointment.date)}</TableCell>
                        <TableCell className="px-4 py-4">{appointment.time}</TableCell>
                        <TableCell className="px-4 py-4">
                          {appointment.advanceAmount != null && appointment.advanceAmount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-sm">
                              <DollarSign className="h-3.5 w-3.5" />
                              S/ {Number(appointment.advanceAmount).toFixed(2)}
                              <Badge variant="outline" className="ml-1 text-xs">
                                {appointment.advancePaidAt ? 'Pagado' : 'Pendiente'}
                              </Badge>
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {needsClientApproval(appointment) ? (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300">
                              Requiere aprobación
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300">
                              Aprobado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          {renderAppointmentActions(appointment)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Cancelación</CardTitle>
              <p className="text-sm text-slate-500">
                Configura las penalizaciones por cancelación según el tiempo de anticipación
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.map(policy => (
                  <div
                    key={policy.id}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {policy.name}
                        </p>
                        <Badge variant={policy.enabled ? 'default' : 'secondary'}>
                          {policy.enabled ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Penalización: {policy.penaltyPercentage}% del costo del servicio
                      </p>
                    </div>
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={() => handleTogglePolicy(policy.id)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ejemplo de Aplicación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  Para un servicio de S/ 80.00:
                </p>
                <ul className="space-y-2 list-disc list-inside text-slate-700 dark:text-slate-300">
                  <li>Cancelación con más de 24 horas: Sin penalización (S/ 0.00)</li>
                  <li>Cancelación entre 12-24 horas: 30% de penalización (S/ 24.00)</li>
                  <li>Cancelación con menos de 12 horas: 50% de penalización (S/ 40.00)</li>
                  <li>No-show (no se presenta): 100% de cargo (S/ 80.00)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Recordatorios</CardTitle>
              <p className="text-sm text-slate-500">
                Activa o desactiva los recordatorios automáticos
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminder-24h">Recordatorio 24 horas antes</Label>
                    <p className="text-sm text-slate-500">
                      Enviar recordatorio automático un día antes de la cita
                    </p>
                  </div>
                  <Switch
                    id="reminder-24h"
                    checked={autoReminders.reminder24h}
                    disabled={configLoading}
                    onCheckedChange={(checked) => handleAutoReminderChange({ reminder24h: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminder-2h">Recordatorio 2 horas antes</Label>
                    <p className="text-sm text-slate-500">
                      Enviar recordatorio automático 2 horas antes de la cita
                    </p>
                  </div>
                  <Switch
                    id="reminder-2h"
                    checked={autoReminders.reminder2h}
                    disabled={configLoading}
                    onCheckedChange={(checked) => handleAutoReminderChange({ reminder2h: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-confirmation">Requerir confirmación</Label>
                    <p className="text-sm text-slate-500">
                      Solicitar que el cliente confirme su asistencia
                    </p>
                  </div>
                  <Switch
                    id="require-confirmation"
                    checked={autoReminders.requireConfirmation}
                    disabled={configLoading}
                    onCheckedChange={(checked) => handleAutoReminderChange({ requireConfirmation: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Mensajes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Recordatorio 24 horas</Label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                    <p className="text-slate-700 dark:text-slate-300">
                      Hola {'{cliente}'}, te recordamos que mañana tienes una cita para {'{mascota}'} a las {'{hora}'}. ¿Confirmas tu asistencia? Responde SÍ para confirmar.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Recordatorio 2 horas</Label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                    <p className="text-slate-700 dark:text-slate-300">
                      ¡Hola {'{cliente}'}! Tu cita para {'{mascota}'} es en 2 horas ({'{hora}'}). Nuestro groomer está en camino. ¡Te esperamos!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
