import { LEGEND_ITEMS } from './calendarAppointmentStyles';

export function CalendarStatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 px-2 py-1 text-[10px] text-muted-foreground border-b bg-muted/15">
      <span className="font-medium text-foreground/70">Leyenda</span>
      {LEGEND_ITEMS.map((item) => (
        <span key={item.status} className="inline-flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full ${item.dot}`} />
          {item.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <span className="h-2 w-2 rounded border border-dashed border-primary/50" />
        Recurrente
      </span>
    </div>
  );
}
