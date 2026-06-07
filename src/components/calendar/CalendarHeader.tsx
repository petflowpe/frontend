import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, CheckCircle2, Plus } from 'lucide-react';
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
      return `Sem. ${format(currentDate, 'd MMM', { locale: es })}`;
    }
    return format(currentDate, "d MMM", { locale: es });
  };

  const dateInputValue = format(currentDate, 'yyyy-MM-dd');

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        <div className="flex items-center border rounded-md bg-background p-0.5 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevious} aria-label="Anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday} className="h-8 text-xs font-medium px-2">
            Hoy
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext} aria-label="Siguiente">
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
          className="w-[132px] h-8 text-xs shrink-0"
          aria-label="Ir a fecha"
        />

        <h2 className="text-sm sm:text-base font-semibold capitalize flex items-center gap-1.5 truncate">
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          {formatTitle()}
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
        {onNavigate && (
          <>
            <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={() => onNavigate('routes')}>
              <MapPin className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Planificador</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={() => onNavigate('confirmation')}>
              <CheckCircle2 className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden md:inline">Confirmaciones</span>
            </Button>
          </>
        )}

        <Select value={view} onValueChange={(v) => onViewChange(v as typeof view)}>
          <SelectTrigger className="w-[148px] h-8 text-xs">
            <SelectValue placeholder="Vista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="resource">Agenda por Móvil</SelectItem>
            <SelectItem value="day">Día</SelectItem>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mes</SelectItem>
          </SelectContent>
        </Select>

        <Button
          data-testid="btn-nueva-cita"
          size="sm"
          className="h-8 text-xs"
          onClick={() => window.dispatchEvent(new CustomEvent('open-new-appointment'))}
        >
          <Plus className="h-3.5 w-3.5 sm:mr-1" />
          <span className="hidden sm:inline">Nueva Cita</span>
        </Button>
      </div>
    </div>
  );
}
