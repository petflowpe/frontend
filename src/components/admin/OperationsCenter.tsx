import { useEffect, useMemo, useState } from 'react';
import {
  MapPin as MapIcon,
  Menu,
  X,
  Truck,
  Zap,
  Navigation2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../context/AuthContext';
import { useVehicles } from '../../hooks/useVehicles';
import { apiClient } from '../../utils/api/client';
import { API } from '../../utils/api/endpoints';

type LiveUnit = {
  id: string;
  name: string;
  driver: string;
  status: string;
  statusLabel: string;
  nextStop: string;
  hasCoords: boolean;
};

type VehicleAlert = {
  id: string;
  type?: string;
  severity?: string;
  vehicle_id?: number | string;
  vehicle_name?: string;
  title: string;
  description?: string;
  due_date?: string;
};

function statusLabelOf(status: string): string {
  switch (status) {
    case 'ready':
      return 'Lista';
    case 'maintenance':
      return 'Mantenimiento';
    case 'stopped':
      return 'Fuera de servicio';
    default:
      return status;
  }
}

function severityClass(severity?: string): string {
  if (severity === 'critical') return 'border-red-300 bg-red-50 text-red-800';
  if (severity === 'high') return 'border-amber-300 bg-amber-50 text-amber-900';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

export function OperationsCenter() {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const { vehicles, loading } = useVehicles(companyId);
  const [activeTab, setActiveTab] = useState('units');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [alerts, setAlerts] = useState<VehicleAlert[]>([]);
  const [nextStopByVehicle, setNextStopByVehicle] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const loadAlerts = async () => {
      try {
        const data = await apiClient.get<VehicleAlert[] | { items?: VehicleAlert[] }>(API.vehicles.alerts);
        const list = Array.isArray(data) ? data : Array.isArray((data as any)?.items) ? (data as any).items : [];
        if (!cancelled) setAlerts(list);
      } catch (e) {
        console.error('Error cargando alertas de flota:', e);
        if (!cancelled) setAlerts([]);
      }
    };

    void loadAlerts();
    const t = setInterval(loadAlerts, 60000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [companyId]);

  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().slice(0, 10);

    const loadSchedules = async () => {
      const entries: Record<string, string> = {};
      const activeVehicles = (vehicles || []).slice(0, 12);

      await Promise.all(
        activeVehicles.map(async (v) => {
          try {
            const payload = await apiClient.get<{
              stops?: Array<{
                status?: string;
                address?: string;
                district?: string;
                client?: { name?: string };
              }>;
            }>(API.routePlans.dailySchedule, {
              date: today,
              vehicle_id: v.id,
            });
            const stops = Array.isArray(payload?.stops) ? payload.stops : [];
            const next =
              stops.find((s) => !['Completada', 'Cancelada'].includes(String(s.status || ''))) || stops[0];
            if (next) {
              const label = [next.client?.name, next.address || next.district].filter(Boolean).join(' · ');
              entries[String(v.id)] = label || 'Ruta del día';
            }
          } catch {
            // sin plan diario: se mantiene zona/ubicación del vehículo
          }
        })
      );

      if (!cancelled) setNextStopByVehicle(entries);
    };

    if ((vehicles || []).length > 0) void loadSchedules();
    return () => {
      cancelled = true;
    };
  }, [vehicles]);

  const liveUnits: LiveUnit[] = useMemo(
    () =>
      (vehicles || []).map((v) => {
        const rawStatus = String(v.status || '');
        let status = 'stopped';
        if (rawStatus === 'maintenance') status = 'maintenance';
        else if (rawStatus === 'active' || v.activo !== false) status = 'ready';

        return {
          id: String(v.id),
          name: v.name || `Unidad ${v.id}`,
          driver: v.driver_name || v.driver || 'Sin conductor',
          status,
          statusLabel: statusLabelOf(status),
          nextStop:
            nextStopByVehicle[String(v.id)] ||
            v.location ||
            v.zona_operacion ||
            'Sin destino asignado',
          hasCoords: Boolean(v.location && String(v.location).includes('ubicación')),
        };
      }),
    [vehicles, nextStopByVehicle]
  );

  useEffect(() => {
    if (!selectedUnit && liveUnits[0]) setSelectedUnit(liveUnits[0].id);
  }, [liveUnits, selectedUnit]);

  const activeCount = liveUnits.filter((u) => u.status === 'ready').length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high');

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-50 dark:bg-slate-950">
      <div className="z-20 flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm dark:bg-slate-900 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <MapIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-lg font-bold leading-none">
              Centro de Control
              <Badge variant="outline" className="border-amber-500/50 text-amber-700">
                BETA
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Flota de tu empresa · GPS desde App Chofer · Alertas de documentos
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold leading-none">{activeCount}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Activas</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Navigation2 className="h-5 w-5" />
            </div>
          </div>
          <div className="h-10 w-px self-center bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold leading-none text-amber-600">{alerts.length}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alertas</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="h-10 w-px self-center bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold leading-none">{liveUnits.length}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen((v) => !v)}>
          {isSidebarOpen ? <X className="mr-2 h-4 w-4" /> : <Menu className="mr-2 h-4 w-4" />}
          Panel
        </Button>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative z-0 flex-1">
          <div className="relative h-full w-full overflow-hidden bg-slate-200">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#bae6fd,transparent_45%),radial-gradient(circle_at_70%_60%,#c7d2fe,transparent_40%)]" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <Card className="max-w-md bg-white/95 p-4 text-center shadow">
                <Zap className="mx-auto mb-2 h-6 w-6 text-cyan-600" />
                <p className="font-semibold">Mapa operativo</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {loading
                    ? 'Cargando unidades desde API…'
                    : `${liveUnits.length} vehículo(s) · ${criticalAlerts.length} alerta(s) prioritarias`}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  El mapa en vivo con pins GPS reales se habilitará cuando haya más telemetría en flota.
                </p>
              </Card>
            </div>
            {liveUnits.slice(0, 8).map((unit, idx) => (
              <button
                key={unit.id}
                type="button"
                className={`absolute h-3.5 w-3.5 rounded-full border-2 border-white shadow ${
                  selectedUnit === unit.id ? 'bg-cyan-600' : 'bg-slate-700'
                }`}
                style={{
                  left: `${18 + (idx % 4) * 18}%`,
                  top: `${28 + Math.floor(idx / 4) * 28}%`,
                }}
                onClick={() => setSelectedUnit(unit.id)}
                title={unit.name}
              />
            ))}
          </div>
        </div>

        <div
          className={`${
            isSidebarOpen ? 'w-full translate-x-0 sm:w-96' : 'w-0 translate-x-full'
          } z-10 flex flex-col border-l bg-white shadow-xl transition-all duration-300 dark:bg-slate-900`}
        >
          <div className="flex items-center justify-between border-b bg-slate-50 p-4 dark:bg-slate-950">
            <h2 className="font-semibold">Panel operativo</h2>
            <Button size="icon" variant="ghost" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col p-3">
            <TabsList className="mb-3 grid grid-cols-3">
              <TabsTrigger value="units">Unidades</TabsTrigger>
              <TabsTrigger value="alerts">Alertas</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>
            <TabsContent value="units" className="min-h-0 flex-1">
              <ScrollArea className="h-full pr-2">
                {liveUnits.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">
                    {loading ? 'Cargando flota…' : 'No hay vehículos registrados para esta empresa.'}
                  </p>
                ) : (
                  liveUnits.map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => setSelectedUnit(unit.id)}
                      className={`mb-2 w-full rounded-lg border p-3 text-left transition ${
                        selectedUnit === unit.id
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
                          : 'hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium">{unit.name}</span>
                        </div>
                        <Badge variant="secondary">{unit.statusLabel}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{unit.driver}</p>
                      <p className="text-xs text-muted-foreground">{unit.nextStop}</p>
                    </button>
                  ))
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="alerts" className="min-h-0 flex-1">
              <ScrollArea className="h-full pr-2">
                {alerts.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    Sin alertas de flota. Se revisan seguro, ITV, mantenimiento e inspecciones.
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`mb-2 rounded-lg border p-3 text-sm ${severityClass(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{alert.title}</p>
                        <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
                          {alert.severity || 'info'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs opacity-90">{alert.vehicle_name || 'Vehículo'}</p>
                      {alert.description ? (
                        <p className="mt-1 text-xs opacity-80">{alert.description}</p>
                      ) : null}
                    </div>
                  ))
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="chat" className="flex-1">
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Chat operativo pendiente. Usa Notificaciones o App Chofer mientras tanto.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
