import { useState, useEffect } from 'react';
import { Bell, Check, X, Clock, MessageSquare, Phone, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

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
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'APT-001',
      clientName: 'María García',
      petName: 'Max',
      service: 'Baño y Corte',
      date: '2024-12-20',
      time: '10:00',
      phone: '+51 987654321',
      email: 'maria@email.com',
      confirmed: false,
      remindersSent: {
        reminder24h: false,
        reminder2h: false
      }
    },
    {
      id: 'APT-002',
      clientName: 'Juan Pérez',
      petName: 'Luna',
      service: 'Corte de Pelo',
      date: '2024-12-20',
      time: '14:00',
      phone: '+51 912345678',
      email: 'juan@email.com',
      confirmed: true,
      confirmationMethod: 'whatsapp',
      confirmationDate: '2024-12-19T10:30:00',
      remindersSent: {
        reminder24h: true,
        reminder2h: false
      }
    },
    {
      id: 'APT-003',
      clientName: 'Sandra López',
      petName: 'Rocky',
      service: 'Baño Medicado',
      date: '2024-12-21',
      time: '09:00',
      phone: '+51 998877665',
      email: 'sandra@email.com',
      confirmed: false,
      remindersSent: {
        reminder24h: false,
        reminder2h: false
      }
    }
  ]);

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

  // Simular envío automático de recordatorios
  useEffect(() => {
    const interval = setInterval(() => {
      setAppointments(prev => prev.map(apt => {
        const aptDate = new Date(`${apt.date}T${apt.time}`);
        const now = new Date();
        const hoursUntil = (aptDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        const updated = { ...apt };

        // Recordatorio 24 horas antes
        if (hoursUntil <= 24 && hoursUntil > 23 && !apt.remindersSent.reminder24h && autoReminders.reminder24h) {
          updated.remindersSent.reminder24h = true;
          // En producción, aquí se enviaría el recordatorio real
        }

        // Recordatorio 2 horas antes
        if (hoursUntil <= 2 && hoursUntil > 1 && !apt.remindersSent.reminder2h && autoReminders.reminder2h) {
          updated.remindersSent.reminder2h = true;
          // En producción, aquí se enviaría el recordatorio real
        }

        return updated;
      }));
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [autoReminders]);

  const handleConfirm = (appointmentId: string, method: 'sms' | 'whatsapp' | 'email' | 'phone') => {
    setAppointments(prev => prev.map(apt =>
      apt.id === appointmentId
        ? {
            ...apt,
            confirmed: true,
            confirmationMethod: method,
            confirmationDate: new Date().toISOString()
          }
        : apt
    ));
    toast.success('Cita confirmada exitosamente');
  };

  const handleSendReminder = (appointmentId: string, type: '24h' | '2h') => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    // En producción, aquí se enviaría el recordatorio por WhatsApp/SMS/Email
    toast.success(`Recordatorio enviado a ${appointment.clientName}`);

    setAppointments(prev => prev.map(apt =>
      apt.id === appointmentId
        ? {
            ...apt,
            remindersSent: {
              ...apt.remindersSent,
              [type === '24h' ? 'reminder24h' : 'reminder2h']: true
            }
          }
        : apt
    ));
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
    confirmationRate: (appointments.filter(a => a.confirmed).length / appointments.length) * 100
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Confirmación de Citas
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestiona confirmaciones y recordatorios automáticos
          </p>
        </div>
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
          {appointments.map(appointment => (
            <Card key={appointment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {appointment.clientName} - {appointment.petName}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {appointment.service}
                        </p>
                      </div>
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
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(appointment.date).toLocaleDateString('es-PE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {appointment.time}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="w-4 h-4" />
                        {appointment.phone}
                      </span>
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Mail className="w-4 h-4" />
                        {appointment.email}
                      </span>
                    </div>

                    {appointment.confirmed && appointment.confirmationDate && (
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4" />
                        <span>
                          Confirmada vía {appointment.confirmationMethod} el{' '}
                          {new Date(appointment.confirmationDate).toLocaleDateString('es-PE')}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Badge variant={appointment.remindersSent.reminder24h ? 'default' : 'outline'}>
                        {appointment.remindersSent.reminder24h ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        Recordatorio 24h
                      </Badge>
                      <Badge variant={appointment.remindersSent.reminder2h ? 'default' : 'outline'}>
                        {appointment.remindersSent.reminder2h ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        Recordatorio 2h
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {!appointment.confirmed && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleConfirm(appointment.id, 'whatsapp')}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Confirmar por WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirm(appointment.id, 'phone')}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Confirmar por Llamada
                        </Button>
                      </>
                    )}
                    {!appointment.remindersSent.reminder24h && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendReminder(appointment.id, '24h')}
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Enviar Recordatorio 24h
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
