import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, Clock, Repeat, Edit, Trash2, Eye, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Appointment } from '../../hooks/useAppointments';
import { apiClient } from '../../utils/api/client';
import { format, addDays, addWeeks, addMonths, startOfWeek, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecurringSeriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId?: string;
  appointments: Appointment[];
  onEditSeries?: (seriesId: string) => void;
  onDeleteSeries?: (seriesId: string) => void;
  onViewAppointments?: (seriesId: string) => void;
}

export function RecurringSeriesDialog({
  open,
  onOpenChange,
  seriesId,
  appointments,
  onEditSeries,
  onDeleteSeries,
  onViewAppointments,
}: RecurringSeriesDialogProps) {
  const [seriesAppointments, setSeriesAppointments] = useState<Appointment[]>([]);
  const [previewDates, setPreviewDates] = useState<string[]>([]);

  useEffect(() => {
    if (open && seriesId && appointments) {
      // Filtrar citas de la serie
      const series = appointments.filter(apt => 
        apt.recurring && apt.recurrenceSeriesId === seriesId
      );
      setSeriesAppointments(series.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));

      // Generar vista previa de próximas fechas
      if (series.length > 0) {
        const firstAppointment = series[0];
        const dates = generatePreviewDates(firstAppointment);
        setPreviewDates(dates);
      }
    }
  }, [open, seriesId, appointments]);

  const generatePreviewDates = (appointment: Appointment): string[] => {
    if (!appointment.recurring || !appointment.date) return [];

    const dates: string[] = [];
    const startDate = parseISO(appointment.date);
    const recurrenceType = appointment.recurrenceType || 'weekly';
    const occurrences = appointment.recurrenceOccurrences || 4;

    for (let i = 0; i < occurrences && i < 10; i++) {
      let nextDate: Date;
      
      switch (recurrenceType) {
        case 'daily':
          nextDate = addDays(startDate, i);
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

  if (!seriesId || seriesAppointments.length === 0) {
    return null;
  }

  const firstAppointment = seriesAppointments[0];
  const completedCount = seriesAppointments.filter(a => a.status === 'completed').length;
  const pendingCount = seriesAppointments.filter(a => 
    a.status === 'pending' || a.status === 'confirmed'
  ).length;
  const cancelledCount = seriesAppointments.filter(a => a.status === 'cancelled').length;

  const getRecurrenceLabel = (type?: string) => {
    switch (type) {
      case 'daily': return 'Diaria';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      default: return 'Semanal';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-purple-600" />
            Serie Recurrente de Citas
          </DialogTitle>
          <DialogDescription>
            Vista previa y gestión de la serie de citas recurrentes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la Serie */}
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-2 border-purple-200 dark:border-purple-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Cliente</p>
                <p className="font-bold text-lg">{firstAppointment.client || firstAppointment.clientName}</p>
                <p className="text-sm text-muted-foreground">{firstAppointment.pet || firstAppointment.petName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Frecuencia</p>
                <Badge className="bg-purple-600 text-white">
                  <Repeat className="h-3 w-3 mr-1" />
                  {getRecurrenceLabel(firstAppointment.recurrenceType)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {firstAppointment.time} • Duración: {firstAppointment.duration || 60} min
                </p>
              </div>
            </div>
          </Card>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completadas</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
              <p className="text-xs text-muted-foreground">Canceladas</p>
            </Card>
          </div>

          {/* Vista Previa de Fechas */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vista Previa de Próximas Citas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {previewDates.map((date, index) => {
                const existingAppointment = seriesAppointments.find(a => a.date === date);
                const isPast = new Date(date) < new Date();
                
                return (
                  <Card 
                    key={date} 
                    className={`p-3 text-center ${
                      existingAppointment 
                        ? existingAppointment.status === 'completed'
                          ? 'bg-green-50 dark:bg-green-950 border-green-200'
                          : existingAppointment.status === 'cancelled'
                          ? 'bg-red-50 dark:bg-red-950 border-red-200'
                          : 'bg-blue-50 dark:bg-blue-950 border-blue-200'
                        : isPast
                        ? 'bg-gray-100 dark:bg-gray-800 border-gray-300'
                        : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200'
                    }`}
                  >
                    <p className="text-xs font-semibold">
                      {format(parseISO(date), 'EEE', { locale: es })}
                    </p>
                    <p className="text-sm font-bold">
                      {format(parseISO(date), 'd MMM', { locale: es })}
                    </p>
                    {existingAppointment ? (
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${
                          existingAppointment.status === 'completed'
                            ? 'border-green-500 text-green-700'
                            : existingAppointment.status === 'cancelled'
                            ? 'border-red-500 text-red-700'
                            : 'border-blue-500 text-blue-700'
                        }`}
                      >
                        {existingAppointment.status === 'completed' ? '✓' : 
                         existingAppointment.status === 'cancelled' ? '✗' : '○'}
                      </Badge>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">Pendiente</p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Lista de Citas Existentes */}
          <div>
            <h3 className="font-semibold mb-3">Citas de la Serie ({seriesAppointments.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {seriesAppointments.map((appointment) => (
                <Card key={appointment.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-sm">
                          {format(parseISO(appointment.date), 'EEEE, d MMMM yyyy', { locale: es })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.time} • {appointment.address || 'Sin dirección'}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={
                        appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {appointment.status === 'completed' ? 'Completada' :
                       appointment.status === 'cancelled' ? 'Cancelada' :
                       appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cerrar
          </Button>
          {onViewAppointments && (
            <Button variant="outline" onClick={() => {
              onViewAppointments(seriesId);
              onOpenChange(false);
            }}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Todas
            </Button>
          )}
          {onEditSeries && (
            <Button onClick={() => {
              onEditSeries(seriesId);
              onOpenChange(false);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Serie
            </Button>
          )}
          {onDeleteSeries && (
            <Button 
              variant="destructive" 
              onClick={() => {
                if (confirm('¿Está seguro de eliminar toda la serie de citas recurrentes?')) {
                  onDeleteSeries(seriesId);
                  onOpenChange(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Serie
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
