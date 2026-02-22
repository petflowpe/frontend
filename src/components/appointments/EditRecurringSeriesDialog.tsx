import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Calendar, Clock, Repeat, Loader2, AlertCircle } from 'lucide-react';
import { useAppointments } from '../../hooks/useAppointments';
import { apiClient } from '../../utils/api/client';
import { format, addWeeks, addMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const editSeriesSchema = z.object({
  recurrenceType: z.enum(['daily', 'weekly', 'monthly']),
  recurrenceOccurrences: z.number().min(1).max(52),
  recurrenceDays: z.array(z.string()).optional(),
  recurrenceFixedTime: z.boolean(),
  time: z.string().min(1, "Hora requerida"),
  notes: z.string().optional(),
});

type EditSeriesFormValues = z.infer<typeof editSeriesSchema>;

interface EditRecurringSeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string;
  appointments: any[];
  onSuccess?: () => void;
}

export function EditRecurringSeriesDialog({
  open,
  onOpenChange,
  seriesId,
  appointments,
  onSuccess,
}: EditRecurringSeriesDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateAppointment } = useAppointments();

  const seriesAppointments = (appointments || []).filter(apt => 
    apt.recurring && apt.recurrenceSeriesId === seriesId
  );

  const firstAppointment = seriesAppointments[0];

  const form = useForm<EditSeriesFormValues>({
    resolver: zodResolver(editSeriesSchema),
    defaultValues: {
      recurrenceType: firstAppointment?.recurrenceType || 'weekly',
      recurrenceOccurrences: firstAppointment?.recurrenceOccurrences || 4,
      recurrenceDays: firstAppointment?.recurrenceDays || [],
      recurrenceFixedTime: firstAppointment?.recurrenceFixedTime !== false,
      time: firstAppointment?.time || '',
      notes: firstAppointment?.notes || '',
    }
  });

  const { watch, handleSubmit, formState: { errors }, reset } = form;
  const watchedType = watch('recurrenceType');
  const watchedOccurrences = watch('recurrenceOccurrences');
  const watchedTime = watch('time');

  useEffect(() => {
    if (open && firstAppointment) {
      reset({
        recurrenceType: firstAppointment.recurrenceType || 'weekly',
        recurrenceOccurrences: firstAppointment.recurrenceOccurrences || 4,
        recurrenceDays: firstAppointment.recurrenceDays || [],
        recurrenceFixedTime: firstAppointment.recurrenceFixedTime !== false,
        time: firstAppointment.time || '',
        notes: firstAppointment.notes || '',
      });
    }
  }, [open, firstAppointment, reset]);

  const onSubmit = async (data: EditSeriesFormValues) => {
    setIsSubmitting(true);
    try {
      // Actualizar todas las citas de la serie
      const updatePromises = seriesAppointments
        .filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled')
        .map(appointment => 
          updateAppointment(appointment.id, {
            recurrenceType: data.recurrenceType,
            recurrenceOccurrences: data.recurrenceOccurrences,
            recurrenceDays: data.recurrenceDays,
            recurrenceFixedTime: data.recurrenceFixedTime,
            time: data.recurrenceFixedTime ? data.time : appointment.time,
            notes: data.notes,
          })
        );

      await Promise.all(updatePromises);

      toast.success('Serie actualizada exitosamente', {
        description: `Se actualizaron ${updatePromises.length} citas de la serie`
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Error al actualizar la serie', {
        description: error.message || 'No se pudo actualizar la serie. Por favor, intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generar vista previa de fechas
  const generatePreview = () => {
    if (!firstAppointment || !watchedType || !watchedOccurrences) return [];

    const dates: string[] = [];
    const startDate = parseISO(firstAppointment.date);

    for (let i = 0; i < Math.min(watchedOccurrences, 10); i++) {
      let nextDate: Date;
      
      switch (watchedType) {
        case 'daily':
          nextDate = new Date(startDate);
          nextDate.setDate(nextDate.getDate() + i);
          break;
        case 'weekly':
          nextDate = addWeeks(startDate, i);
          break;
        case 'monthly':
          nextDate = addMonths(startDate, i);
          break;
        default:
          nextDate = addWeeks(startDate, i);
      }

      dates.push(format(nextDate, 'yyyy-MM-dd'));
    }

    return dates;
  };

  const previewDates = generatePreview();

  if (!firstAppointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Serie Recurrente</DialogTitle>
          <DialogDescription>
            Modifica la configuración de la serie de citas recurrentes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Información Actual */}
          <Card className="p-4 bg-muted/50">
            <p className="text-sm font-semibold mb-2">Serie Actual:</p>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Cliente:</span> {firstAppointment.client || firstAppointment.clientName}</p>
              <p><span className="font-medium">Mascota:</span> {firstAppointment.pet || firstAppointment.petName}</p>
              <p><span className="font-medium">Total de citas:</span> {seriesAppointments.length}</p>
            </div>
          </Card>

          {/* Frecuencia */}
          <div className="space-y-2">
            <Label htmlFor="recurrenceType">Frecuencia *</Label>
            <Select
              value={watchedType}
              onValueChange={(value) => form.setValue('recurrenceType', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diaria</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
            {errors.recurrenceType && (
              <p className="text-sm text-destructive">{errors.recurrenceType.message}</p>
            )}
          </div>

          {/* Número de ocurrencias */}
          <div className="space-y-2">
            <Label htmlFor="recurrenceOccurrences">Número de Citas *</Label>
            <Input
              id="recurrenceOccurrences"
              type="number"
              min={1}
              max={52}
              {...form.register('recurrenceOccurrences', { valueAsNumber: true })}
            />
            {errors.recurrenceOccurrences && (
              <p className="text-sm text-destructive">{errors.recurrenceOccurrences.message}</p>
            )}
          </div>

          {/* Hora fija */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurrenceFixedTime"
              checked={watch('recurrenceFixedTime')}
              onCheckedChange={(checked) => form.setValue('recurrenceFixedTime', !!checked)}
            />
            <Label htmlFor="recurrenceFixedTime" className="cursor-pointer">
              Usar la misma hora para todas las citas
            </Label>
          </div>

          {watch('recurrenceFixedTime') && (
            <div className="space-y-2">
              <Label htmlFor="time">Hora *</Label>
              <Input
                id="time"
                type="time"
                {...form.register('time')}
              />
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>
          )}

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Input
              id="notes"
              placeholder="Notas para todas las citas de la serie..."
              {...form.register('notes')}
            />
          </div>

          {/* Vista Previa */}
          {previewDates.length > 0 && (
            <div>
              <Label className="mb-2 block">Vista Previa de Fechas:</Label>
              <div className="grid grid-cols-3 gap-2">
                {previewDates.map((date, index) => (
                  <Card key={date} className="p-2 text-center">
                    <p className="text-xs font-semibold">
                      {format(parseISO(date), 'EEE', { locale: es })}
                    </p>
                    <p className="text-sm font-bold">
                      {format(parseISO(date), 'd MMM', { locale: es })}
                    </p>
                    {watchedTime && (
                      <p className="text-xs text-muted-foreground">{watchedTime}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Advertencia */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Nota importante
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Solo se actualizarán las citas pendientes o confirmadas. Las citas completadas o canceladas no se modificarán.
                </p>
              </div>
            </div>
          </div>

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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Repeat className="mr-2 h-4 w-4" />
                  Actualizar Serie
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
