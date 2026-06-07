import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Car,
  Clock,
  ChevronUp,
  ChevronDown,
  Save,
  Play,
  RefreshCw,
  PawPrint,
  Phone,
  Loader2,
  Navigation,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { useVehicles } from '../hooks/useVehicles';
import { useRoutePlans, type RouteStopItem } from '../hooks/useRoutePlans';
import ConfiguracionZonas from './admin/config/ConfiguracionZonas';

interface RoutesProps {
  onNavigate?: (tab: string) => void;
  currentUser?: { companyId?: number | null } | null;
}

function todayIso(): string {
  return new Date().toLocaleDateString('en-CA');
}

function statusBadge(status: string) {
  switch (status) {
    case 'Completada':
      return 'bg-purple-100 text-purple-800';
    case 'Confirmada':
      return 'bg-green-100 text-green-800';
    case 'En Proceso':
      return 'bg-blue-100 text-blue-800';
    case 'Cancelada':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

export function Routes({ onNavigate, currentUser }: RoutesProps) {
  const scopedCompanyId = currentUser?.companyId ?? null;
  const { vehicles, loading: loadingVehicles } = useVehicles(scopedCompanyId);
  const { loading, fetchDailySchedule, saveRouteFromAppointments, updateRouteStatus } = useRoutePlans();

  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [vehicleId, setVehicleId] = useState<string>('');
  const [stops, setStops] = useState<RouteStopItem[]>([]);
  const [routePlanId, setRoutePlanId] = useState<number | null>(null);
  const [routeStatus, setRouteStatus] = useState<string>('planned');
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, in_progress: 0 });

  const activeVehicles = vehicles.filter((v) => v.activo !== false && v.status !== 'inactive');

  const loadSchedule = useCallback(async () => {
    if (!vehicleId) return;
    try {
      const data = await fetchDailySchedule(parseInt(vehicleId, 10), selectedDate);
      setStops(data.stops ?? []);
      setStats(data.stats ?? { total: 0, completed: 0, pending: 0, in_progress: 0 });
      setRoutePlanId(data.route_plan?.id ?? null);
      setRouteStatus(data.route_plan?.status ?? 'planned');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al cargar citas del día';
      toast.error(msg);
    }
  }, [vehicleId, selectedDate, fetchDailySchedule]);

  useEffect(() => {
    if (vehicleId) loadSchedule();
  }, [vehicleId, selectedDate, loadSchedule]);

  useEffect(() => {
    if (!vehicleId && activeVehicles.length > 0) {
      setVehicleId(String(activeVehicles[0].id));
    }
  }, [activeVehicles, vehicleId]);

  const moveStop = (index: number, direction: -1 | 1) => {
    const next = [...stops];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setStops(next.map((s, i) => ({ ...s, order: i })));
  };

  const handleSaveRoute = async () => {
    if (!vehicleId || stops.length === 0) {
      toast.error('Selecciona vehículo y asegúrate de tener citas en el día');
      return;
    }
    try {
      await saveRouteFromAppointments({
        vehicleId: parseInt(vehicleId, 10),
        date: selectedDate,
        appointmentIds: stops.map((s) => s.appointment_id),
        status: routeStatus,
      });
      toast.success('Ruta guardada', { description: `${stops.length} paradas en orden` });
      loadSchedule();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar la ruta');
    }
  };

  const handleStartRoute = async () => {
    if (!routePlanId) {
      await handleSaveRoute();
      return;
    }
    try {
      await updateRouteStatus(routePlanId, 'in_progress');
      setRouteStatus('in_progress');
      toast.success('Ruta iniciada', { description: 'El chofer puede ver el día en su app' });
    } catch {
      toast.error('No se pudo iniciar la ruta');
    }
  };

  const openMaps = (stop: RouteStopItem) => {
    const q = [stop.address, stop.district, 'Lima, Perú'].filter(Boolean).join(', ');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank');
  };

  const selectedVehicle = activeVehicles.find((v) => String(v.id) === vehicleId);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Planificador de rutas
          </h1>
          <p className="text-muted-foreground">
            Ordena las visitas del día por vehículo según las citas reales del sistema
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => onNavigate?.('appointments')}>
            Ver citas
          </Button>
          <Button variant="outline" onClick={() => onNavigate?.('driver-session')}>
            Vista chofer
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Fecha</label>
            <input
              type="date"
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Vehículo</label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar móvil..." />
              </SelectTrigger>
              <SelectContent>
                {activeVehicles.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    {v.name} {v.placa ? `(${v.placa})` : ''}
                    {v.driver_name || v.driver ? ` — ${v.driver_name || v.driver}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full" variant="outline" onClick={loadSchedule} disabled={loading || !vehicleId}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Actualizar
            </Button>
          </div>
        </div>
      </Card>

      {selectedVehicle && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Visitas</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
            <p className="text-xs text-muted-foreground">En proceso</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSaveRoute} disabled={loading || stops.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          Guardar orden
        </Button>
        <Button
          variant="default"
          className="bg-green-600 hover:bg-green-700"
          onClick={handleStartRoute}
          disabled={loading || stops.length === 0}
        >
          <Play className="h-4 w-4 mr-2" />
          Iniciar ruta del día
        </Button>
        {routePlanId && (
          <Badge variant="outline" className="self-center">
            Plan #{routePlanId} · {routeStatus}
          </Badge>
        )}
      </div>

      {loadingVehicles ? (
        <Card className="p-8 text-center text-muted-foreground">Cargando vehículos...</Card>
      ) : stops.length === 0 ? (
        <Card className="p-8 text-center">
          <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Sin citas para este vehículo en la fecha seleccionada</p>
          <p className="text-sm text-muted-foreground mt-1">
            Crea citas en el módulo Citas asignando un vehículo con cobertura en el distrito.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => onNavigate?.('appointments')}>
            Ir a Citas
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {stops.map((stop, index) => (
            <Card key={stop.appointment_id} className="p-4 border-l-4 border-l-red-500">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex items-center gap-2 md:flex-col md:min-w-[48px]">
                  <span className="text-lg font-bold text-red-600 w-8 text-center">{index + 1}</span>
                  <div className="flex md:flex-col gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveStop(index, -1)} disabled={index === 0}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => moveStop(index, 1)}
                      disabled={index === stops.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{stop.client?.name || 'Cliente'}</h3>
                    <Badge className={statusBadge(stop.status)}>{stop.status}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {stop.time} · {stop.duration} min
                    </span>
                  </div>
                  <p className="text-sm font-medium text-primary">{stop.service_name}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <PawPrint className="h-3.5 w-3.5" />
                      {stop.pet?.name} {stop.pet?.breed ? `(${stop.pet.breed})` : ''}
                    </span>
                    {stop.client?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {stop.client.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {stop.address}, {stop.district}
                    </span>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => openMaps(stop)}>
                  <Navigation className="h-4 w-4 mr-1" />
                  Maps
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
