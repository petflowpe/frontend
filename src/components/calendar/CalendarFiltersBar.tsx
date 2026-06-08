import { Search, RotateCcw, Car, ChevronDown } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarResourcesPanel } from './CalendarResourcesPanel';

export type QuickChip = 'none' | 'today' | 'unconfirmed' | 'no_vehicle';

interface Resource {
  id: string;
  name: string;
  driver?: string;
}

interface CalendarFiltersBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
  filterTipoCita: string;
  onFilterTipoCitaChange: (v: string) => void;
  filterDistrict: string;
  onFilterDistrictChange: (v: string) => void;
  bookingSourceFilter: string;
  onBookingSourceFilterChange: (v: string) => void;
  tipoCitaOptions: string[];
  districtOptions: string[];
  quickChip: QuickChip;
  onQuickChipChange: (v: QuickChip) => void;
  showCancelled: boolean;
  onShowCancelledChange: (v: boolean) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
  selectedVehicleCount: number;
  totalVehicles: number;
  resources: Resource[];
  filteredResources: Resource[];
  selectedVehicleIds: Set<string>;
  vehicleSearch: string;
  onVehicleSearchChange: (v: string) => void;
  onToggleVehicle: (id: string) => void;
  onSelectAllVehicles: () => void;
  onClearVehicleSelection: () => void;
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
  bookingSourceFilter,
  onBookingSourceFilterChange,
  tipoCitaOptions,
  districtOptions,
  quickChip,
  onQuickChipChange,
  showCancelled,
  onShowCancelledChange,
  activeFilterCount,
  onClearFilters,
  selectedVehicleCount,
  totalVehicles,
  resources,
  filteredResources,
  selectedVehicleIds,
  vehicleSearch,
  onVehicleSearchChange,
  onToggleVehicle,
  onSelectAllVehicles,
  onClearVehicleSelection,
}: CalendarFiltersBarProps) {
  const chips: { id: QuickChip; label: string }[] = [
    { id: 'today', label: 'Solo hoy' },
    { id: 'unconfirmed', label: 'Sin confirmar' },
    { id: 'no_vehicle', label: 'Sin móvil' },
  ];

  const vehicleLabel =
    selectedVehicleCount === 0 ? `Móviles (${totalVehicles})` : `Móviles (${selectedVehicleCount})`;

  return (
    <div className="border rounded-lg bg-card px-2 py-1.5 shadow-sm space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
        <div className="relative flex-1 min-w-[140px] basis-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente, mascota o código…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[130px] h-8 text-xs shrink-0">
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
          <SelectTrigger className="w-[130px] h-8 text-xs shrink-0">
            <SelectValue placeholder="Tipo" />
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
          <SelectTrigger className="w-[130px] h-8 text-xs shrink-0">
            <SelectValue placeholder="Distrito" />
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

        <Select value={bookingSourceFilter} onValueChange={onBookingSourceFilterChange}>
          <SelectTrigger className="w-[120px] h-8 text-xs shrink-0">
            <SelectValue placeholder="Origen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="portal_auth">Portal</SelectItem>
            <SelectItem value="public_guest">Invitado</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={selectedVehicleCount > 0 ? 'secondary' : 'outline'}
              className="h-8 text-xs shrink-0 px-2.5"
            >
              <Car className="h-3.5 w-3.5 mr-1" />
              {vehicleLabel}
              <ChevronDown className="h-3 w-3 ml-0.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end" sideOffset={6}>
            <CalendarResourcesPanel
              resources={resources}
              filteredResources={filteredResources}
              selectedVehicleIds={selectedVehicleIds}
              vehicleSearch={vehicleSearch}
              onVehicleSearchChange={onVehicleSearchChange}
              onToggleVehicle={onToggleVehicle}
              onSelectAll={onSelectAllVehicles}
              onClearSelection={onClearVehicleSelection}
              compact
            />
          </PopoverContent>
        </Popover>

        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="h-8 px-2 text-xs shrink-0">
            {activeFilterCount}
          </Badge>
        )}

        <Button size="sm" variant="ghost" className="h-8 text-xs shrink-0 px-2" onClick={onClearFilters}>
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Limpiar
        </Button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
        {chips.map((chip) => (
          <Button
            key={chip.id}
            size="sm"
            variant={quickChip === chip.id ? 'default' : 'outline'}
            className="h-7 text-xs shrink-0 px-2.5"
            onClick={() => onQuickChipChange(quickChip === chip.id ? 'none' : chip.id)}
          >
            {chip.label}
          </Button>
        ))}

        <Button
          size="sm"
          variant={showCancelled ? 'secondary' : 'outline'}
          className="h-7 text-xs shrink-0 px-2.5"
          onClick={() => onShowCancelledChange(!showCancelled)}
        >
          Ver canceladas
        </Button>
      </div>
    </div>
  );
}
