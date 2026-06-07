import { useState, useEffect } from 'react';
import {
  MapPin as MapIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Navigation2,
  Menu,
  X,
  Search,
  Truck,
  RefreshCw,
  Loader2,
  PawPrint,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { useAppointments } from '../../hooks/useAppointments';
import { useVehicles } from '../../hooks/useVehicles';
import { useOperationsDashboard } from '../../hooks/useOperationsDashboard';
interface OperationsCenterProps {
  currentUser?: { companyId?: number | null } | null;
}

export function OperationsCenter({ currentUser }: OperationsCenterProps = {}) {
  const scopedCompanyId = currentUser?.companyId ?? null;
  const { appointments, loading, refreshAppointments } = useAppointments();
  const { vehicles } = useVehicles(scopedCompanyId);
  const { liveUnits, alerts, stats, todayAppointments } = useOperationsDashboard(
    appointments,
    vehicles
  );

  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    refreshAppointments({ date: today, per_page: 100 });
  }, [refreshAppointments]);

  const filteredUnits = liveUnits.filter(
    (u) =>
      !search.trim() ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.driver.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUnitData = liveUnits.find((u) => u.id === selectedUnit);
  const selectedVisits = todayAppointments
    .filter((a) => String(a.vehicle?.id ?? '') === String(selectedUnit))
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const handleRefresh = () => {
    const today = new Date().toLocaleDateString('en-CA');
    refreshAppointments({ date: today, per_page: 100 });
    toast.success('Datos actualizados');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-50">
      <div className="h-16 bg-white border-b flex items-center px-6 justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Centro de Control</h1>
            <p className="text-xs text-muted-foreground">Flota y citas de hoy (datos reales)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 text-sm">
            <span>
              <strong>{stats.activeUnits}</strong> móviles activos
            </span>
            <span>
              <strong>{stats.totalVisits}</strong> visitas hoy
            </span>
            <span className="text-amber-600">
              <strong>{stats.alertCount}</strong> alertas
            </span>
            <span>
              <strong>{stats.onTimePercent}%</strong> completadas
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 p-4 overflow-auto">
          {selectedUnitData ? (
            <div className="space-y-4 max-w-3xl">
              <Card className="p-4">
                <h2 className="font-bold text-lg">{selectedUnitData.name}</h2>
                <p className="text-sm text-muted-foreground">{selectedUnitData.driver}</p>
                <div className="flex gap-2 mt-3">
                  <Badge>
                    {selectedUnitData.visitsDone}/{selectedUnitData.visitsTotal} visitas
                  </Badge>
                  <Badge variant="outline">{selectedUnitData.status}</Badge>
                </div>
                <p className="text-sm mt-2">
                  Próxima: {selectedUnitData.nextStop} · {selectedUnitData.eta}
                </p>
              </Card>

              <h3 className="font-semibold">Recorrido del día</h3>
              {selectedVisits.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">
                  Sin citas asignadas a este móvil hoy
                </Card>
              ) : (
                selectedVisits.map((apt, idx) => (
                  <Card key={apt.id} className="p-4 flex gap-3">
                    <span className="font-bold text-red-600 w-6">{idx + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium">
                        {apt.time} — {apt.clientName || apt.client}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <PawPrint className="h-3.5 w-3.5" />
                        {apt.petName || apt.pet} · {apt.serviceType}
                      </p>
                      <p className="text-sm flex items-center gap-1 mt-1">
                        <MapIcon className="h-3.5 w-3.5" />
                        {apt.address}, {apt.district}
                      </p>
                      <Badge className="mt-2" variant="outline">
                        {apt.status}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <Card className="p-8 text-center max-w-lg mx-auto mt-12">
              <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">Selecciona un móvil en el panel derecho</p>
              <p className="text-sm text-muted-foreground mt-1">
                Verás el recorrido real basado en las citas de hoy
              </p>
            </Card>
          )}
        </div>

        <div
          className={`${isSidebarOpen ? 'w-96 translate-x-0' : 'w-0 translate-x-full'} transition-all duration-300 bg-white border-l shadow-xl z-10 flex flex-col`}
        >
          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-sm uppercase tracking-wide text-slate-500">
              Panel de operaciones
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Tabs defaultValue="units" className="flex-1 flex flex-col">
            <div className="px-4 pt-2">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="units">Móviles</TabsTrigger>
                <TabsTrigger value="alerts" className="relative">
                  Alertas
                  {alerts.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar móvil o conductor..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value="units" className="m-0 p-0">
                <div className="divide-y">
                  {filteredUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedUnit === unit.id
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : ''
                      }`}
                      onClick={() => setSelectedUnit(unit.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-sm">{unit.name}</h3>
                          <p className="text-xs text-slate-500">{unit.driver}</p>
                        </div>
                        <Badge
                          className={
                            unit.status === 'serving'
                              ? 'bg-green-100 text-green-700'
                              : unit.status === 'moving'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {unit.status === 'serving'
                            ? 'En servicio'
                            : unit.status === 'moving'
                              ? 'En ruta'
                              : 'Detenido'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{unit.nextStop}</p>
                      <p className="text-xs mt-1">
                        {unit.visitsDone}/{unit.visitsTotal} visitas · ETA {unit.eta}
                      </p>
                    </div>
                  ))}
                  {filteredUnits.length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      No hay vehículos activos
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="m-0 p-4 space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Sin alertas operativas hoy
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex gap-3 p-3 rounded-lg border bg-white shadow-sm"
                    >
                      <div
                        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          alert.level === 'high'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {!isSidebarOpen && (
          <Button
            className="absolute top-4 right-4 z-10 shadow-lg"
            onClick={() => setIsSidebarOpen(true)}
            variant="secondary"
          >
            <Menu className="w-4 h-4 mr-2" /> Panel
          </Button>
        )}
      </div>
    </div>
  );
}
