import { useState, useEffect, useCallback } from 'react';
import {
  Car,
  MapPin,
  Clock,
  Phone,
  Navigation,
  CheckCircle2,
  Play,
  Loader2,
  PawPrint,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useRoutePlans, type RouteStopItem } from '../../hooks/useRoutePlans';
import { apiClient } from '../../utils/api/client';

function todayIso(): string {
  return new Date().toLocaleDateString('en-CA');
}

function statusLabel(status: string): string {
  return status;
}

function statusColor(status: string): string {
  switch (status) {
    case 'Completada':
      return 'bg-purple-100 text-purple-800';
    case 'En Proceso':
      return 'bg-blue-100 text-blue-800';
    case 'Confirmada':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-amber-100 text-amber-800';
  }
}

export function DriverSession() {
  const { loading, fetchDriverDay } = useRoutePlans();
  const [date, setDate] = useState(todayIso());
  const [stops, setStops] = useState<RouteStopItem[]>([]);
  const [vehicle, setVehicle] = useState<{ id: number; name: string; placa?: string } | null>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, in_progress: 0 });
  const [activeStopId, setActiveStopId] = useState<number | null>(null);
  const [driverName, setDriverName] = useState('');

  const loadDay = useCallback(async () => {
    try {
      const data = await fetchDriverDay(date);
      setStops(data.stops ?? []);
      setVehicle(data.vehicle);
      setStats(data.stats ?? { total: 0, completed: 0, pending: 0, in_progress: 0 });
      if (data.message) toast.message(data.message);
      const inProgress = data.stops?.find((s) => s.status === 'En Proceso');
      setActiveStopId(inProgress?.appointment_id ?? null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al cargar el día');
    }
  }, [date, fetchDriverDay]);

  useEffect(() => {
    loadDay();
    try {
      const raw = localStorage.getItem('smartpet_user');
      if (raw) {
        const u = JSON.parse(raw);
        setDriverName(u.name || u.email || 'Chofer');
      }
    } catch {
      /* ignore */
    }
  }, [loadDay]);

  const changeAppointmentStatus = async (appointmentId: number, status: string) => {
    await apiClient.post(`/appointments/${appointmentId}/change-status`, { status });
  };

  const handleStartVisit = async (stop: RouteStopItem) => {
    try {
      await changeAppointmentStatus(stop.appointment_id, 'En Proceso');
      setActiveStopId(stop.appointment_id);
      toast.success(`Visita iniciada: ${stop.pet?.name || stop.client?.name}`);
      loadDay();
    } catch {
      toast.error('No se pudo actualizar la cita');
    }
  };

  const handleCompleteVisit = async (stop: RouteStopItem) => {
    try {
      await changeAppointmentStatus(stop.appointment_id, 'Completada');
      setActiveStopId(null);
      toast.success('Visita completada');
      loadDay();
    } catch {
      toast.error('No se pudo completar la cita');
    }
  };

  const openMaps = (stop: RouteStopItem) => {
    const q = [stop.address, stop.district, 'Lima, Perú'].filter(Boolean).join(', ');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank');
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      /* ignore */
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('smartpet_user');
    window.location.href = window.location.pathname + '?tab=dashboard';
  };

  const nextStop = stops.find(
    (s) => s.status !== 'Completada' && s.status !== 'Cancelada' && s.appointment_id !== activeStopId
  );

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Sesión chofer</p>
            <h1 className="text-xl font-bold">{driverName}</h1>
          </div>
          <Button size="icon" variant="ghost" onClick={handleLogout} aria-label="Cerrar sesión">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {vehicle ? (
          <Card className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <div className="flex items-center gap-3">
              <Car className="h-8 w-8 opacity-90" />
              <div>
                <p className="font-bold text-lg">{vehicle.name}</p>
                <p className="text-sm text-white/80">{vehicle.placa || 'Sin placa'}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-white/70">Pend.</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.in_progress}</p>
                <p className="text-white/70">Activas</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-white/70">Listas</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <p className="font-medium">Sin vehículo asignado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Operaciones debe vincular tu usuario como conductor en un vehículo.
            </p>
          </Card>
        )}

        <div className="flex gap-2">
          <input
            type="date"
            className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Button variant="outline" size="icon" onClick={loadDay} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        {nextStop && !activeStopId && (
          <Card className="p-4 border-green-300 bg-green-50">
            <p className="text-sm font-medium text-green-800">Siguiente visita sugerida</p>
            <p className="font-bold">{nextStop.time} — {nextStop.client?.name}</p>
            <Button className="w-full mt-3" onClick={() => handleStartVisit(nextStop)}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar visita
            </Button>
          </Card>
        )}

        {stops.length === 0 && !loading ? (
          <Card className="p-8 text-center text-muted-foreground">
            No hay visitas programadas para este día.
          </Card>
        ) : (
          stops.map((stop, index) => {
            const isActive = activeStopId === stop.appointment_id;
            const isDone = stop.status === 'Completada';

            return (
              <Card
                key={stop.appointment_id}
                className={`p-4 ${isActive ? 'ring-2 ring-blue-500' : ''} ${isDone ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold">{stop.client?.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {stop.time} · {stop.duration} min
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColor(stop.status)}>{statusLabel(stop.status)}</Badge>
                </div>

                <p className="text-sm font-medium mb-2">{stop.service_name}</p>
                <p className="text-sm flex items-center gap-1 text-muted-foreground mb-1">
                  <PawPrint className="h-3.5 w-3.5" />
                  {stop.pet?.name} {stop.pet?.breed ? `· ${stop.pet.breed}` : ''}
                </p>
                <p className="text-sm flex items-start gap-1 text-muted-foreground mb-3">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  {stop.address}, {stop.district}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {stop.client?.phone && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${stop.client.phone}`}>
                        <Phone className="h-4 w-4 mr-1" />
                        Llamar
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => openMaps(stop)}>
                    <Navigation className="h-4 w-4 mr-1" />
                    Navegar
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 mt-2">
                  {!isDone && stop.status !== 'En Proceso' && (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleStartVisit(stop)}>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar visita
                    </Button>
                  )}
                  {(isActive || stop.status === 'En Proceso') && !isDone && (
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleCompleteVisit(stop)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Completar visita
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
}
