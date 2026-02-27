import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: 'month' | 'week' | 'day' | 'resource';
  onViewChange: (view: 'month' | 'week' | 'day' | 'resource') => void;
  showDayView?: boolean;
}

export function CalendarHeader({ currentDate, onDateChange, view, onViewChange, showDayView = true }: CalendarHeaderProps) {
  
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(newDate());
  };

  // Safe implementation of newDate() to handle timezone offsets if needed, 
  // but for now simple new Date() is fine.
  function newDate() {
    return new Date();
  }

  const formatTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy', { locale: es });
    } else if (view === 'week') {
      // Logic to show "Jan 5 - 11, 2026" could go here, 
      // but simple Month Year is often enough or "Week of..."
      return `Semana del ${format(currentDate, 'd', { locale: es })} de ${format(currentDate, 'MMMM', { locale: es })}`;
    } else {
      return format(currentDate, "EEEE d 'de' MMMM", { locale: es });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pb-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 border rounded-md bg-background p-1">
          <Button variant="ghost" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday} className="text-sm font-medium">
            Hoy
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-xl font-semibold capitalize flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          {formatTitle()}
        </h2>
      </div>

      <div className="flex items-center space-x-2">
        <Select 
          value={view} 
          onValueChange={(v) => onViewChange(v as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Vista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mes</SelectItem>
            <SelectItem value="week">Semana</SelectItem>
            {showDayView && <SelectItem value="day">Día</SelectItem>}
            <SelectItem value="resource">Agenda por Móvil</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          data-testid="btn-nueva-cita"
          onClick={() => window.dispatchEvent(new CustomEvent('open-new-appointment'))}
        >
          + Nueva Cita
        </Button>
      </div>
    </div>
  );
}
