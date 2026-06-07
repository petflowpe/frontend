import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: 'month' | 'week' | 'day' | 'resource';
  onViewChange: (view: 'month' | 'week' | 'day' | 'resource') => void;
  showDayView?: boolean;
  onNavigate?: (tab: string) => void;
}

export function CalendarHeader({
  currentDate,
  onDateChange,
  view,
  onViewChange,
  showDayView = true,
  onNavigate,
}: CalendarHeaderProps) {
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => onDateChange(new Date());

  const formatTitle = () => {
    if (view === 'month') return format(currentDate, 'MMMM yyyy', { locale: es });
    if (view === 'week') {
      return `Semana del ${format(currentDate, 'd', { locale: es })} de ${format(currentDate, 'MMMM', { locale: es })}`;
    }
    return format(currentDate, "EEEE d 'de' MMMM", { locale: es });
  };

  const dateInputValue = format(currentDate, 'yyyy-MM-dd');

  return (
    <div className="flex flex-col gap-3 pb-2">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 border rounded-md bg-background p-1">
            <Button variant="ghost" size="icon" onClick={handlePrevious} aria-label="Anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday} className="text-sm font-medium">
              Hoy
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} aria-label="Siguiente">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Input
            type="date"
            value={dateInputValue}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m, d] = e.target.value.split('-').map(Number);
              onDateChange(new Date(y, m - 1, d));
            }}
            className="w-[150px] h-9"
            aria-label="Ir a fecha"
          />

          <h2 className="text-lg sm:text-xl font-semibold capitalize flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground shrink-0" />
            {formatTitle()}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {onNavigate && (
            <>
              <Button variant="outline" size="sm" onClick={() => onNavigate('routes')}>
                <MapPin className="h-4 w-4 mr-1" />
                Planificador
              </Button>
              <Button variant="outline" size="sm" onClick={() => onNavigate('confirmation')}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Confirmaciones
              </Button>
            </>
          )}

          <Select value={view} onValueChange={(v) => onViewChange(v as typeof view)}>
            <SelectTrigger className="w-[170px] h-9">
              <SelectValue placeholder="Vista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="resource">Agenda por Móvil</SelectItem>
              <SelectItem value="day">Día</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mes</SelectItem>
            </SelectContent>
          </Select>

          <Button data-testid="btn-nueva-cita" onClick={() => window.dispatchEvent(new CustomEvent('open-new-appointment'))}>
            + Nueva Cita
          </Button>
        </div>
      </div>
    </div>
  );
}
