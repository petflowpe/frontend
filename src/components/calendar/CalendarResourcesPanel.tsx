import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface Resource {
  id: string;
  name: string;
  driver?: string;
}

interface CalendarResourcesPanelProps {
  resources: Resource[];
  filteredResources: Resource[];
  selectedVehicleIds: Set<string>;
  vehicleSearch: string;
  onVehicleSearchChange: (v: string) => void;
  onToggleVehicle: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export function CalendarResourcesPanel({
  resources,
  filteredResources,
  selectedVehicleIds,
  vehicleSearch,
  onVehicleSearchChange,
  onToggleVehicle,
  onSelectAll,
  onClearSelection,
}: CalendarResourcesPanelProps) {
  const allSelected = selectedVehicleIds.size === 0;

  return (
    <div className="border rounded-lg bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Filtrar por móvil</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onSelectAll}>
            Todos
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClearSelection}>
            Ninguno
          </Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar móvil o chofer…"
          value={vehicleSearch}
          onChange={(e) => onVehicleSearchChange(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {filteredResources.map((r) => {
          const checked = allSelected || selectedVehicleIds.has(r.id);
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onToggleVehicle(r.id)}
              className={cn(
                'text-left text-xs rounded-full border px-3 py-1.5 transition-colors',
                checked
                  ? 'bg-primary/15 border-primary/40 text-primary font-medium'
                  : 'bg-background hover:bg-muted/50 text-muted-foreground'
              )}
            >
              {r.name}
              {r.driver ? <span className="opacity-70"> · {r.driver}</span> : null}
            </button>
          );
        })}
        {filteredResources.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">Sin móviles</p>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">
        {allSelected
          ? `Mostrando los ${resources.length} móviles`
          : `${selectedVehicleIds.size} móvil(es) seleccionado(s)`}
      </p>
    </div>
  );
}
