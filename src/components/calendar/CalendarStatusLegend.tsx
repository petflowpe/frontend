import { LEGEND_ITEMS } from './calendarAppointmentStyles';

export function CalendarStatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 px-1 py-2 text-xs text-muted-foreground border-b bg-muted/20 rounded-t-lg">
      <span className="font-medium text-foreground/80">Leyenda:</span>
      {LEGEND_ITEMS.map((item) => (
        <span key={item.status} className="inline-flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
          {item.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded border border-dashed border-primary/50" />
        Recurrente
      </span>
    </div>
  );
}
