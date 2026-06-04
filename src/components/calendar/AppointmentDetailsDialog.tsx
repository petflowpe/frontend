import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Calendar, Clock, User, Dog, MapPin, Phone, DollarSign, Car, FileText, Edit, XCircle, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../ui/utils';

function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return 'No especificada';
  try {
    let date: Date;
    if (dateStr.includes('T')) {
      date = new Date(dateStr);
    } else {
      // Esperamos YYYY-MM-DD. Si viene parcial/invalid, evitamos RangeError.
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      const [y, m, d] = dateStr.split('-').map(Number);
      date = new Date(y, m - 1, d);
    }
    if (Number.isNaN(date.getTime())) return dateStr;
    return format(date, "dd 'de' MMMM, yyyy", { locale: es });
  } catch {
    return dateStr;
  }
}

function formatTimeForDisplay(timeStr: string): string {
  if (!timeStr) return 'No especificada';
  const t = (timeStr || '').trim();
  if (t.includes('T')) {
    return format(new Date(t), 'HH:mm');
  }
  return t.length > 5 ? t.slice(0, 5) : t;
}

interface AppointmentDetailsDialogProps {
  appointment: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (appointment: any) => void;
  onCancel?: (appointmentId: string) => void;
  onReschedule?: (appointment: any) => void;
  onDelete?: (appointmentId: string) => void;
}

export function AppointmentDetailsDialog({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onCancel,
  onReschedule,
  onDelete,
}: AppointmentDetailsDialogProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      case 'in-progress': return 'En Progreso';
      default: return status;
    }
  };

  const handleQuickCancel = () => setShowCancelConfirm(true);

  const handleConfirmCancel = async () => {
    if (!onCancel) return;
    setIsCancelling(true);
    try {
      const result = onCancel(appointment.id);
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        await (result as Promise<unknown>);
      }
      setShowCancelConfirm(false);
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cancelar la cita');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleEdit = () => {
    onEdit?.(appointment);
    onClose();
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      const result = onDelete(appointment.id);
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        await (result as Promise<unknown>);
      }
      setShowDeleteConfirm(false);
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar la cita');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = appointment.status !== 'completed' && appointment.status !== 'cancelled';
  const canCancel = appointment.status !== 'completed' && appointment.status !== 'cancelled';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between flex-wrap gap-2">
            <span className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Detalles de la Cita
              </span>
              {appointment.trackingCode && (
                <span className="text-xs font-mono text-muted-foreground font-normal">
                  {appointment.trackingCode}
                </span>
              )}
            </span>
            <Badge className={cn('text-xs', getStatusColor(appointment.status))}>
              {getStatusLabel(appointment.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg border">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <User className="h-4 w-4" />
                  <span>Cliente</span>
                </div>
                <p className="font-semibold text-lg">{appointment.clientName || appointment.client}</p>
                {appointment.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {appointment.phone}
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Dog className="h-4 w-4" />
                  <span>Mascota</span>
                </div>
                <p className="font-semibold text-lg">{appointment.petName || appointment.pet}</p>
                {appointment.breed && (
                  <p className="text-sm text-muted-foreground">{appointment.breed}</p>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <Calendar className="h-4 w-4" />
                <span>Fecha</span>
              </div>
              <p className="font-semibold">{formatDateForDisplay(appointment.date)}</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <Clock className="h-4 w-4" />
                <span>Hora</span>
              </div>
              <p className="font-semibold">{formatTimeForDisplay(appointment.time)}</p>
              {appointment.totalDuration && (
                <p className="text-sm text-muted-foreground mt-1">
                  Duración: {appointment.totalDuration} min
                </p>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
              <FileText className="h-4 w-4" />
              <span>Servicios</span>
            </div>
            <p className="font-semibold">{appointment.serviceType || appointment.services || 'No especificados'}</p>
            {appointment.totalPrice && (
              <div className="flex items-center gap-2 mt-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-600">S/ {appointment.totalPrice}</span>
              </div>
            )}
          </div>

          {/* Location & Vehicle */}
          <div className="grid grid-cols-2 gap-4">
            {appointment.district && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>Ubicación</span>
                </div>
                <p className="font-semibold">{appointment.district}</p>
                {appointment.address && (
                  <p className="text-sm text-muted-foreground mt-1">{appointment.address}</p>
                )}
              </div>
            )}
            {appointment.groomer && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Car className="h-4 w-4" />
                  <span>Asignado a</span>
                </div>
                <p className="font-semibold">{appointment.groomer}</p>
                {appointment.vehicle && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {typeof appointment.vehicle === 'string' ? appointment.vehicle : appointment.vehicle.name || 'Vehículo'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm mb-2">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">Notas</span>
              </div>
              <p className="text-sm">{appointment.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              {canEdit && onEdit && (
                <Button onClick={handleEdit} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {canCancel && onCancel && (
                <Button onClick={handleQuickCancel} variant="outline" className="gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <XCircle className="h-4 w-4" />
                  Cancelar Cita
                </Button>
              )}
              {onDelete && (
                <Button onClick={handleDeleteClick} variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1" title="Eliminar cita">
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Confirmación: Cancelar cita */}
      <AlertDialog open={showCancelConfirm} onOpenChange={(open) => !isCancelling && setShowCancelConfirm(open)}>
        <AlertDialogContent className="relative z-[100] sm:max-w-md">
          <button
            type="button"
            onClick={() => !isCancelling && setShowCancelConfirm(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta cita?</AlertDialogTitle>
            <AlertDialogDescription>
              La cita quedará con estado &quot;Cancelada&quot;. El cliente y la mascota no se eliminan. Puedes volver a agendar cuando lo necesites.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row flex-nowrap gap-2 justify-end">
            <AlertDialogCancel disabled={isCancelling} className="shrink-0">
              Cancelar
            </AlertDialogCancel>
            <Button
              type="button"
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isCancelling ? 'Cancelando…' : 'Sí, cancelar cita'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmación: Eliminar cita */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={(open) => !isDeleting && setShowDeleteConfirm(open)}>
        <AlertDialogContent className="relative z-[100] sm:max-w-md">
          <button
            type="button"
            onClick={() => !isDeleting && setShowDeleteConfirm(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta cita permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cita se borrará del sistema. Usa &quot;Cancelar cita&quot; si solo quieres anularla sin borrarla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-2 sm:justify-end">
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <Button onClick={handleConfirmDelete} disabled={isDeleting} variant="destructive">
              {isDeleting ? 'Eliminando…' : 'Sí, eliminar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
