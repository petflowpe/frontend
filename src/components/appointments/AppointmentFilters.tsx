import { Search, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Vehicle } from '../../hooks/useVehicles';

interface AppointmentFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  vehicleFilter: string;
  onVehicleFilterChange: (value: string) => void;
  bookingSourceFilter: string;
  onBookingSourceFilterChange: (value: string) => void;
  vehicles: Vehicle[];
  onClearFilters: () => void;
}

export function AppointmentFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  vehicleFilter,
  onVehicleFilterChange,
  bookingSourceFilter,
  onBookingSourceFilterChange,
  vehicles,
  onClearFilters,
}: AppointmentFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por cliente, mascota, # cita o documento..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={dateFilter} onValueChange={onDateFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las fechas</SelectItem>
          <SelectItem value="today">Hoy</SelectItem>
          <SelectItem value="tomorrow">Mañana</SelectItem>
          <SelectItem value="week">Esta semana</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="confirmed">Confirmadas</SelectItem>
          <SelectItem value="pending">Pendientes</SelectItem>
          <SelectItem value="in-progress">En Progreso</SelectItem>
          <SelectItem value="completed">Completadas</SelectItem>
          <SelectItem value="cancelled">Canceladas</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={vehicleFilter} onValueChange={onVehicleFilterChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Todos los vehículos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los vehículos</SelectItem>
          {vehicles.map(vehicle => (
            <SelectItem key={vehicle.id} value={vehicle.id}>
              {vehicle.name} {vehicle.plate ? `(${vehicle.plate})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={bookingSourceFilter} onValueChange={onBookingSourceFilterChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Origen reserva" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los orígenes</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
          <SelectItem value="portal_auth">Portal</SelectItem>
          <SelectItem value="public_guest">Invitado</SelectItem>
        </SelectContent>
      </Select>
      
      <Button variant="outline" onClick={onClearFilters}>
        <Filter className="h-4 w-4 mr-2" />
        Limpiar
      </Button>
    </div>
  );
}
