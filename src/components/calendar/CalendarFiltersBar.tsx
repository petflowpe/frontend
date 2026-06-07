import { Search, RotateCcw, Car, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

export type QuickChip = 'none' | 'today' | 'unconfirmed' | 'no_vehicle';

interface CalendarFiltersBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  filterTipoCita: string;
  onFilterTipoCitaChange: (v: string) => void;
  filterDistrict: string;
  onFilterDistrictChange: (v: string) => void;
  tipoCitaOptions: string[];
  districtOptions: string[];
  quickChip: QuickChip;
  onQuickChipChange: (v: QuickChip) => void;
  showCancelled: boolean;
  onShowCancelledChange: (v: boolean) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
  resourcesOpen: boolean;
  onToggleResources: () => void;
  selectedVehicleCount: number;
  totalVehicles: number;
}

export function CalendarFiltersBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  filterTipoCita,
  onFilterTipoCitaChange,
  filterDistrict,
  onFilterDistrictChange,
  tipoCitaOptions,
  districtOptions,
  quickChip,
  onQuickChipChange,
  showCancelled,
  onShowCancelledChange,
  activeFilterCount,
  onClearFilters,
  resourcesOpen,
  onToggleResources,
  selectedVehicleCount,
  totalVehicles,
}: CalendarFiltersBarProps) {
  const chips: { id: QuickChip; label: string }[] = [
    { id: 'today', label: 'Solo hoy' },
    { id: 'unconfirmed', label: 'Sin confirmar' },
    { id: 'no_vehicle', label: 'Sin móvil' },
  ];

  return (
    <div className="space-y-2 border rounded-lg bg-card p-3 shadow-sm">
      <div className="flex flex-col xl:flex-row gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente, mascota o código…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full xl:w-40 h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="confirmed">Confirmadas</SelectItem>
            <SelectItem value="in-progress">En proceso</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterTipoCita || 'all'} onValueChange={(v) => onFilterTipoCitaChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full xl:w-44 h-9">
            <SelectValue placeholder="Tipo de cita" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {tipoCitaOptions.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterDistrict || 'all'} onValueChange={(v) => onFilterDistrictChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full xl:w-40 h-9">
            <SelectValue placeholder="Distrito / zona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los distritos</SelectItem>
            {districtOptions.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={resourcesOpen ? 'secondary' : 'outline'}
          className="h-9 shrink-0"
          onClick={onToggleResources}
        >
          <Car className="h-4 w-4 mr-1.5" />
          Móviles ({selectedVehicleCount === 0 ? totalVehicles : selectedVehicleCount})
          {resourcesOpen ? <ChevronUp className="h-3.5 w-3.5 ml-1" /> : <ChevronDown className="h-3.5 w-3.5 ml-1" />}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <Button
            key={chip.id}
            size="sm"
            variant={quickChip === chip.id ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => onQuickChipChange(quickChip === chip.id ? 'none' : chip.id)}
          >
            {chip.label}
          </Button>
        ))}

        <Button
          size="sm"
          variant={showCancelled ? 'secondary' : 'outline'}
          className="h-7 text-xs"
          onClick={() => onShowCancelledChange(!showCancelled)}
        >
          Ver canceladas
        </Button>

        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="h-7 px-2">
            {activeFilterCount} filtro{activeFilterCount !== 1 ? 's' : ''}
          </Badge>
        )}

        <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={onClearFilters}>
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Limpiar
        </Button>
      </div>
    </div>
  );
}
