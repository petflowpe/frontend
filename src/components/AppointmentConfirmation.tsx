import { useState, useEffect, useMemo } from 'react';
import { Bell, Check, Clock, Phone, Mail, Calendar, Loader2, RefreshCw } from 'lucide-react';
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

interface Appointment {
  id: string;
  clientName: string;
  petName: string;
  service: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  confirmed: boolean;
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

export function AppointmentConfirmation() {
  const {
    appointments: rawAppointments,
    loading,
    refreshAppointments,
    confirmAppointment,
    sendAppointmentReminder,
  } = useAppointments();

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    refreshAppointments({
      date_from: today,
      date_to: in7.toLocaleDateString('en-CA'),
      per_page: 100,
    });
  }, [refreshAppointments]);

  const appointments: Appointment[] = useMemo(
    () =>
      rawAppointments
        .filter((a) => a.status !== 'cancelled')
        .map((a) => ({
          id: a.id,
          clientName: a.clientName || a.client || 'Cliente',
          petName: a.petName || a.pet || 'Mascota',
          service: a.serviceType || a.reason || 'Servicio',
          date: a.date,
          time: (a.time || '').slice(0, 5),
          phone: a.clientPhone || a.phone || '',
          email: '',
          confirmed: a.status === 'confirmed' || a.status === 'in-progress' || a.status === 'completed',
          remindersSent: {
            reminder24h: !!a.reminderSent,
            reminder2h: false,
          },
          confirmationMethod: undefined,
          confirmationDate: undefined,
        })),
    [rawAppointments]
  );

  const [policies, setPolicies] = useState<CancellationPolicy[]>([
    {
      id: 'POL-001',
      name: 'Cancelación con 24 horas',
      windowHours: 24,
      penaltyPercentage: 0,
      enabled: true
    },
    {
      id: 'POL-002',
      name: 'Cancelación 12-24 horas antes',
      windowHours: 12,
      penaltyPercentage: 30,
      enabled: true
    },
    {
      id: 'POL-003',
      name: 'Cancelación menos de 12 horas',
      windowHours: 0,
      penaltyPercentage: 50,
      enabled: true
    }
  ]);

  const [autoReminders, setAutoReminders] = useState({
    reminder24h: true,
    reminder2h: true,
    requireConfirmation: true
  });

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
    setPolicies(prev => prev.map(pol =>
      pol.id === policyId ? { ...pol, enabled: !pol.enabled } : pol
    ));
    toast.success('Política actualizada');
  };

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.confirmed).length,
    pending: appointments.filter(a => !a.confirmed).length,
    confirmationRate:
      appointments.length > 0
        ? (appointments.filter((a) => a.confirmed).length / appointments.length) * 100
        : 0,
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
          onClick={() => {
            const today = new Date().toLocaleDateString('en-CA');
            const in7 = new Date();
            in7.setDate(in7.getDate() + 7);
            refreshAppointments({
              date_from: today,
              date_to: in7.toLocaleDateString('en-CA'),
              per_page: 100,
            });
          }}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          <div className="flex justify-end gap-2 flex-wrap">
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
                    onCheckedChange={(checked) =>
                      setAutoReminders({ ...autoReminders, reminder24h: checked })
                    }
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
                    onCheckedChange={(checked) =>
                      setAutoReminders({ ...autoReminders, reminder2h: checked })
                    }
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
                    onCheckedChange={(checked) =>
                      setAutoReminders({ ...autoReminders, requireConfirmation: checked })
                    }
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
