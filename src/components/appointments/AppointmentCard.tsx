import { Calendar, Clock, User, Phone, Car, FileText, CheckCircle, X, Copy, Edit, Repeat, Bell, Loader2, Eye } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tooltip } from '../ui/tooltip';
import { Appointment } from '../../hooks/useAppointments';
import { BookingSourceBadge } from './BookingSourceBadge';

interface AppointmentCardProps {
  appointment: Appointment;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onClone?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onGenerateInvoice?: (appointment: Appointment) => void;
  onConfirm?: (id: string) => void;
  onSendReminder?: (id: string) => void;
  sendingReminder?: string | null;
  onEdit?: (id: string) => void;
  onViewRecurringSeries?: (appointment: Appointment) => void;
  completingAppointment?: string | null;
  cancellingAppointment?: string | null;
  cloningAppointment?: boolean;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export function AppointmentCard({
  appointment,
  onComplete,
  onCancel,
  onClone,
  onReschedule,
  onGenerateInvoice,
  onConfirm,
  onSendReminder,
  sendingReminder,
  onEdit,
  onViewRecurringSeries,
  completingAppointment,
  cancellingAppointment,
  cloningAppointment,
  getStatusColor,
  getStatusText,
}: AppointmentCardProps) {
  return (
    <Card key={appointment.id} className="p-6 border-2 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2 flex-wrap">
              <h3 className="font-bold text-lg">{appointment.client || appointment.clientName}</h3>
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusText(appointment.status)}
              </Badge>
              {appointment.recurring && (
                <Tooltip content="Ver serie completa de citas recurrentes">
                  <Badge 
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-800"
                    onClick={() => onViewRecurringSeries?.(appointment)}
                  >
                    <Repeat className="h-3 w-3 mr-1" />
                    Recurrente
                  </Badge>
                </Tooltip>
              )}
              {appointment.invoiced && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <FileText className="h-3 w-3 mr-1" />
                  {appointment.documentNumber || 'Facturada'}
                </Badge>
              )}
              {!appointment.reminderSent && appointment.status === 'pending' && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                  <Bell className="h-3 w-3 mr-1" />
                  Recordatorio pendiente
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">{appointment.time} • {appointment.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="font-semibold">{appointment.pet || appointment.petName}</span>
                <span className="text-xs">({appointment.breed || appointment.petBreed})</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>{appointment.phone || appointment.clientPhone}</span>
              </div>
            </div>

            {/* Vehículo Asignado */}
            {appointment.vehicle ? (
              <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <Car className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {appointment.vehicle.name}
                </span>
                <Badge variant="outline" className="text-xs">{appointment.vehicle.placa}</Badge>
                <span className="text-xs text-muted-foreground">• {appointment.groomer}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Car className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Sin vehículo asignado</span>
              </div>
            )}

            {/* Items (Servicios + Productos) */}
            <div className="mb-2">
              {appointment.items && appointment.items.length > 0 ? (
                <>
                  <p className="text-sm font-semibold mb-1">
                    Items ({appointment.items.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {appointment.items.map((item: any, index: number) => (
                      <Badge 
                        key={index} 
                        variant={item.type === 'service' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {item.type === 'product' && '📦 '}
                        {item.name} - {item.price?.toFixed(2)} S/
                      </Badge>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Servicio:</span>
                  <Badge variant="outline">{appointment.serviceType || 'General'}</Badge>
                </div>
              )}
              
              {appointment.totalDuration && appointment.totalDuration > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Duración: {appointment.totalDuration} min
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{appointment.address || 'Sin dirección registrada'}</span>
            </div>

            {appointment.bookingSource === 'portal_auth' && appointment.advanceAmount != null && appointment.advanceAmount > 0 && (
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-2 p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded border border-indigo-200 dark:border-indigo-800">
                Adelanto portal: S/ {Number(appointment.advanceAmount).toFixed(2)}
                {appointment.advancePaidAt ? ' · Pagado' : ' · Pendiente de pago'}
              </p>
            )}

            {appointment.notes && (
              <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                📝 {appointment.notes}
              </p>
            )}
          </div>
        </div>
        <div className="text-right ml-4">
          <p className="text-2xl font-bold text-primary">{(appointment.totalPrice || appointment.totalAmount || 0).toFixed(2)} S/</p>
          <p className="text-sm text-muted-foreground mb-3">Cita #{appointment.id}</p>
          <div className="flex flex-col gap-2">
            {appointment.status === 'in-progress' && onComplete && (
              <Tooltip content="Marcar esta cita como completada y actualizar el inventario">
                <Button 
                  size="sm" 
                  onClick={() => onComplete(appointment.id)}
                  className="w-full"
                  disabled={completingAppointment === appointment.id}
                >
                  {completingAppointment === appointment.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Completando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completar
                    </>
                  )}
                </Button>
              </Tooltip>
            )}
            {appointment.status === 'completed' && !appointment.invoiced && onGenerateInvoice && (
              <Tooltip content="Generar factura para esta cita completada">
                <Button 
                  size="sm"
                  onClick={() => onGenerateInvoice(appointment)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Facturar
                </Button>
              </Tooltip>
            )}
            {appointment.status === 'pending' && onConfirm && (
              <Tooltip content="Confirmar esta cita pendiente">
                <Button 
                  size="sm"
                  onClick={() => onConfirm(appointment.id)}
                  className="w-full"
                >
                  Confirmar
                </Button>
              </Tooltip>
            )}
            {!appointment.reminderSent &&
              (appointment.status === 'pending' || appointment.status === 'confirmed') &&
              onSendReminder && (
              <Tooltip content="Registrar recordatorio enviado al cliente">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => onSendReminder(appointment.id)}
                  disabled={sendingReminder === appointment.id}
                >
                  {sendingReminder === appointment.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Recordatorio
                    </>
                  )}
                </Button>
              </Tooltip>
            )}
            {onEdit && (
              <Button size="sm" variant="outline" className="w-full" onClick={() => onEdit(appointment.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && onReschedule && (
              <Tooltip content="Cambiar la fecha y hora de esta cita">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onReschedule(appointment)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Reprogramar
                </Button>
              </Tooltip>
            )}
            {onClone && (
              <Tooltip content="Crear una nueva cita con los mismos datos">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onClone(appointment)}
                  disabled={cloningAppointment}
                >
                  {cloningAppointment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Clonando...
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Clonar
                    </>
                  )}
                </Button>
              </Tooltip>
            )}
            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && onCancel && (
              <Tooltip content="Cancelar esta cita">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-red-600 hover:bg-red-50"
                  onClick={() => onCancel(appointment.id)}
                  disabled={cancellingAppointment === appointment.id}
                >
                  {cancellingAppointment === appointment.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelando...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </>
                  )}
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
