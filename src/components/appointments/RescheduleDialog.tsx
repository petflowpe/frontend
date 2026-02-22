import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import { useAppointments } from '../../hooks/useAppointments';
import { useVehicles } from '../../hooks/useVehicles';
import { useProducts } from '../../hooks/useProducts';
import { createAvailabilityValidator } from '../../services/availabilityValidator';
import { apiClient } from '../../utils/api/client';
import { Badge } from '../ui/badge';

const rescheduleSchema = z.object({
  date: z.string().min(1, "Fecha requerida"),
  time: z.string().min(1, "Hora requerida"),
  vehicleId: z.string().optional(),
  notes: z.string().optional(),
});

type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  onSuccess?: () => void;
}

export function RescheduleDialog({ open, onOpenChange, appointment, onSuccess }: RescheduleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const { appointments, updateAppointment } = useAppointments();
  const { vehicles } = useVehicles();
  const { services } = useProducts();

  const form = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      date: appointment?.date || '',
      time: appointment?.time || '',
      vehicleId: appointment?.vehicle?.id?.toString() || '',
      notes: '',
    }
  });

  const { watch, handleSubmit, formState: { errors }, reset } = form;
  const watchedDate = watch('date');
  const watchedTime = watch('time');
  const watchedVehicleId = watch('vehicleId');

  // Reset form when dialog opens
  useEffect(() => {
    if (open && appointment) {
      reset({
        date: appointment.date || '',
        time: appointment.time || '',
        vehicleId: appointment.vehicle?.id?.toString() || '',
        notes: '',
      });
      setAvailabilityError(null);
      setSuggestions([]);
    }
  }, [open, appointment, reset]);

  // Validar disponibilidad en tiempo real
  useEffect(() => {
    if (watchedDate && watchedTime && watchedVehicleId && open) {
      const validateAvailability = async () => {
        try {
          // Obtener servicios de la cita
          const serviceIds = appointment.items
            ?.filter((item: any) => item.type === 'service')
            .map((item: any) => String(item.id)) || [];
          
          const serviceDurations = new Map(services.map(s => [String(s.id), s.duration || 60]));
          
          // Filtrar citas excluyendo la actual
          const otherAppointments = appointments.filter(a => a.id !== appointment.id);
          
          const validator = createAvailabilityValidator(otherAppointments, undefined, serviceDurations);
          const validation = await validator.validate(watchedDate, watchedTime, watchedVehicleId, serviceIds);
          
          if (!validation.available) {
            setAvailabilityError(validation.message);
            setSuggestions(validation.suggestions || []);
          } else {
            setAvailabilityError(null);
            setSuggestions([]);
          }
        } catch (error) {
          // Silenciar errores de validación en tiempo real
        }
      };

      const timeoutId = setTimeout(validateAvailability, 500); // Debounce
      return () => clearTimeout(timeoutId);
    } else {
      setAvailabilityError(null);
      setSuggestions([]);
    }
  }, [watchedDate, watchedTime, watchedVehicleId, appointment, services, appointments, open]);

  const onSubmit = async (data: RescheduleFormValues) => {
    setIsSubmitting(true);
    try {
      // Validar disponibilidad final
      const serviceIds = appointment.items
        ?.filter((item: any) => item.type === 'service')
        .map((item: any) => String(item.id)) || [];
      
      const serviceDurations = new Map(services.map(s => [String(s.id), s.duration || 60]));
      const otherAppointments = appointments.filter(a => a.id !== appointment.id);
      
      const validator = createAvailabilityValidator(otherAppointments, undefined, serviceDurations);
      const validation = await validator.validate(data.date, data.time, data.vehicleId || appointment.vehicle?.id?.toString() || '', serviceIds);
      
      if (!validation.available) {
        toast.error(validation.message, {
          description: validation.suggestions?.length ? `Sugerencias: ${validation.suggestions[0]}` : undefined
        });
        setIsSubmitting(false);
        return;
      }

      // Actualizar vehículo si cambió
      const vehicle = data.vehicleId 
        ? vehicles.find(v => v.id === data.vehicleId)
        : appointment.vehicle;

      // Usar endpoint de reprogramación
      try {
        await apiClient.post(`/appointments/${appointment.id}/reschedule`, {
          date: data.date,
          time: data.time,
          vehicle_id: data.vehicleId ? parseInt(data.vehicleId) : appointment.vehicle?.id,
          notes: data.notes || '',
        });
      } catch (error: any) {
        // Fallback a updateAppointment si el endpoint no existe
        await updateAppointment(appointment.id, {
          date: data.date,
          time: data.time,
          vehicle: vehicle ? { id: vehicle.id, name: vehicle.name } : appointment.vehicle,
          notes: data.notes ? `${appointment.notes || ''}\n[Reprogramada] ${data.notes}` : appointment.notes,
        });
      }

      toast.success('Cita reprogramada exitosamente', {
        description: `Nueva fecha: ${data.date} a las ${data.time}`
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Error al reprogramar la cita', {
        description: error.message || 'No se pudo reprogramar la cita. Por favor, intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reprogramar Cita</DialogTitle>
          <DialogDescription>
            Cambia la fecha y hora de la cita. Se validará la disponibilidad automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Información actual */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-semibold">Cita Actual:</p>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{appointment.date}</span>
              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
              <span>{appointment.time}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{appointment.client || appointment.clientName}</span>
              {' - '}
              <span>{appointment.pet || appointment.petName}</span>
            </div>
          </div>

          {/* Nueva fecha */}
          <div className="space-y-2">
            <Label htmlFor="date">Nueva Fecha *</Label>
            <Input
              id="date"
              type="date"
              {...form.register('date')}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Nueva hora */}
          <div className="space-y-2">
            <Label htmlFor="time">Nueva Hora *</Label>
            <Input
              id="time"
              type="time"
              {...form.register('time')}
            />
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time.message}</p>
            )}
          </div>

          {/* Vehículo (opcional cambiar) */}
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Vehículo (opcional)</Label>
            <select
              id="vehicleId"
              {...form.register('vehicleId')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Mantener vehículo actual</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name} {vehicle.plate ? `(${vehicle.plate})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Input
              id="notes"
              placeholder="Razón del cambio de fecha/hora..."
              {...form.register('notes')}
            />
          </div>

          {/* Error de disponibilidad */}
          {availabilityError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{availabilityError}</p>
                  {suggestions.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {suggestions.slice(0, 3).map((suggestion, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground">• {suggestion}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Indicador de disponibilidad válida */}
          {watchedDate && watchedTime && !availabilityError && (
            <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Horario disponible
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !!availabilityError}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reprogramando...
                </>
              ) : (
                'Reprogramar Cita'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
