import { useState } from 'react';
import { Navigation, Zap, Clock, MapPin, TrendingUp, ArrowRight, RefreshCw, ExternalLink, Share2, Download, Copy } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { routeExportService } from '../services/routeExportService';
import { optimizationHistoryService } from '../services/optimizationHistoryService';

interface Appointment {
  id: string;
  time: string;
  client: string;
  pet: string;
  address: string;
  district: string;
  coordinates: { lat: number; lng: number };
  duration: number;
  status: string;
}

interface OptimizationResult {
  originalDistance: number;
  optimizedDistance: number;
  timeSaved: number;
  fuelSaved: number;
  efficiency: number;
  reorderedAppointments: Appointment[];
}

interface RouteOptimizerProps {
  appointments: Appointment[];
  onOptimize: (reorderedAppointments: Appointment[]) => void;
  vehicleId?: string;
  vehicleName?: string;
}

export function RouteOptimizer({ appointments, onOptimize, vehicleId = 'vehiculo-1', vehicleName = 'Móvil 1' }: RouteOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Calcular distancia entre dos puntos (fórmula de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calcular distancia total de una ruta
  const calculateTotalDistance = (route: Appointment[]): number => {
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const current = route[i];
      const next = route[i + 1];
      total += calculateDistance(
        current.coordinates.lat,
        current.coordinates.lng,
        next.coordinates.lat,
        next.coordinates.lng
      );
    }
    return total;
  };

  // Algoritmo del vecino más cercano (Nearest Neighbor)
  const nearestNeighborOptimization = (appointments: Appointment[]): Appointment[] => {
    if (appointments.length <= 1) return appointments;

    const unvisited = [...appointments];
    const route: Appointment[] = [];

    // Comenzar con la primera cita (ya programada)
    let current = unvisited.shift()!;
    route.push(current);

    // Encontrar siempre el vecino más cercano
    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      unvisited.forEach((appointment, index) => {
        const distance = calculateDistance(
          current.coordinates.lat,
          current.coordinates.lng,
          appointment.coordinates.lat,
          appointment.coordinates.lng
        );

        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = index;
        }
      });

      current = unvisited.splice(nearestIndex, 1)[0];
      route.push(current);
    }

    return route;
  };

  // Algoritmo 2-opt para mejorar la ruta
  const twoOptOptimization = (route: Appointment[]): Appointment[] => {
    if (route.length <= 3) return route;

    let improved = true;
    let optimizedRoute = [...route];

    while (improved) {
      improved = false;
      const currentDistance = calculateTotalDistance(optimizedRoute);

      for (let i = 1; i < optimizedRoute.length - 2; i++) {
        for (let j = i + 1; j < optimizedRoute.length - 1; j++) {
          const newRoute = [...optimizedRoute];
          
          // Invertir el segmento entre i y j
          const segment = newRoute.slice(i, j + 1).reverse();
          newRoute.splice(i, j - i + 1, ...segment);

          const newDistance = calculateTotalDistance(newRoute);

          if (newDistance < currentDistance) {
            optimizedRoute = newRoute;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }

    return optimizedRoute;
  };

  // Optimizar considerando ventanas de tiempo
  const optimizeWithTimeWindows = (appointments: Appointment[]): Appointment[] => {
    // Agrupar por rangos de tiempo (mañana, tarde)
    const morning = appointments.filter(apt => {
      const hour = parseInt(apt.time.split(':')[0]);
      return hour < 12;
    });

    const afternoon = appointments.filter(apt => {
      const hour = parseInt(apt.time.split(':')[0]);
      return hour >= 12;
    });

    // Optimizar cada grupo por separado
    const optimizedMorning = morning.length > 0 ? twoOptOptimization(nearestNeighborOptimization(morning)) : [];
    const optimizedAfternoon = afternoon.length > 0 ? twoOptOptimization(nearestNeighborOptimization(afternoon)) : [];

    return [...optimizedMorning, ...optimizedAfternoon];
  };

  const runOptimization = async () => {
    setIsOptimizing(true);

    // Simular proceso de optimización
    await new Promise(resolve => setTimeout(resolve, 1500));

    const originalDistance = calculateTotalDistance(appointments);
    
    // Aplicar algoritmo de optimización
    const optimized = optimizeWithTimeWindows(appointments);
    const optimizedDistance = calculateTotalDistance(optimized);

    const distanceSaved = originalDistance - optimizedDistance;
    const timeSaved = (distanceSaved / 30) * 60; // Asumiendo 30 km/h promedio
    const fuelSaved = distanceSaved * 0.08; // 0.08 litros por km
    const efficiency = ((distanceSaved / originalDistance) * 100);

    const optimizationResult: OptimizationResult = {
      originalDistance: Math.round(originalDistance * 10) / 10,
      optimizedDistance: Math.round(optimizedDistance * 10) / 10,
      timeSaved: Math.round(timeSaved),
      fuelSaved: Math.round(fuelSaved * 10) / 10,
      efficiency: Math.round(efficiency * 10) / 10,
      reorderedAppointments: optimized
    };

    setResult(optimizationResult);
    setIsOptimizing(false);

    if (efficiency > 5) {
      toast.success(`🎯 Optimización completada: ${efficiency}% más eficiente`, {
        description: `Ahorro: ${distanceSaved.toFixed(1)} km, ${timeSaved} min, ${fuelSaved.toFixed(1)}L`
      });
    } else {
      toast.info('✅ La ruta actual ya está bastante optimizada');
    }
  };

  const applyOptimization = () => {
    if (result) {
      // Reasignar horarios basados en el orden optimizado
      const reorderedWithTimes = result.reorderedAppointments.map((apt, index) => {
        const baseHour = 9; // Empezar a las 9:00 AM
        const minutesPerAppointment = 60; // 60 minutos por cita + traslado
        const totalMinutes = baseHour * 60 + index * minutesPerAppointment;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return {
          ...apt,
          time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
        };
      });

      // Guardar en historial
      optimizationHistoryService.saveOptimization({
        vehicleId,
        vehicleName,
        appointmentsCount: result.reorderedAppointments.length,
        originalDistance: result.originalDistance,
        optimizedDistance: result.optimizedDistance,
        distanceSaved: result.originalDistance - result.optimizedDistance,
        timeSaved: result.timeSaved,
        fuelSaved: result.fuelSaved,
        efficiency: result.efficiency
      });

      onOptimize(reorderedWithTimes);
      toast.success('✅ Ruta optimizada aplicada y guardada en historial');
      setResult(null);
    }
  };

  // Exportar a Google Maps
  const handleExportGoogleMaps = () => {
    if (!result) return;

    const waypoints = result.reorderedAppointments.map(apt => ({
      address: apt.address,
      coordinates: apt.coordinates,
      appointmentId: apt.id,
      client: apt.client,
      time: apt.time
    }));

    const url = routeExportService.generateGoogleMapsUrl(waypoints);
    window.open(url, '_blank');
    toast.success('🗺️ Abriendo Google Maps...');
  };

  // Exportar a Waze (primer waypoint)
  const handleExportWaze = () => {
    if (!result) return;

    const waypoints = result.reorderedAppointments.map(apt => ({
      address: apt.address,
      coordinates: apt.coordinates,
      appointmentId: apt.id,
      client: apt.client,
      time: apt.time
    }));

    const url = routeExportService.generateWazeUrlFirst(waypoints);
    window.open(url, '_blank');
    toast.success('🚗 Abriendo Waze...');
  };

  // Copiar ruta al portapapeles
  const handleCopyRoute = async () => {
    if (!result) return;

    const waypoints = result.reorderedAppointments.map(apt => ({
      address: apt.address,
      coordinates: apt.coordinates,
      appointmentId: apt.id,
      client: apt.client,
      time: apt.time
    }));

    const success = await routeExportService.copyRouteToClipboard(waypoints);
    if (success) {
      toast.success('📋 Ruta copiada al portapapeles');
    } else {
      toast.error('❌ Error al copiar al portapapeles');
    }
  };

  // Descargar GPX
  const handleDownloadGPX = () => {
    if (!result) return;

    const waypoints = result.reorderedAppointments.map(apt => ({
      address: apt.address,
      coordinates: apt.coordinates,
      appointmentId: apt.id,
      client: apt.client,
      time: apt.time
    }));

    const date = new Date().toISOString().split('T')[0];
    routeExportService.downloadGPXFile(waypoints, `smartpet-ruta-${date}.gpx`);
    toast.success('📥 Archivo GPX descargado');
  };

  // Compartir por WhatsApp
  const handleShareWhatsApp = () => {
    if (!result) return;

    const waypoints = result.reorderedAppointments.map(apt => ({
      address: apt.address,
      coordinates: apt.coordinates,
      appointmentId: apt.id,
      client: apt.client,
      time: apt.time
    }));

    const message = routeExportService.generateWhatsAppMessage(waypoints, `Ruta ${vehicleName}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
    toast.success('💬 Compartiendo por WhatsApp...');
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Optimización GPS de Rutas
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Algoritmo inteligente que calcula la ruta más eficiente
            </p>
          </div>
          <Button
            onClick={runOptimization}
            disabled={isOptimizing || appointments.length < 2}
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Optimizando...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Optimizar Ruta
              </>
            )}
          </Button>
        </div>

        {appointments.length < 2 && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            ⚠️ Se necesitan al menos 2 citas para optimizar la ruta
          </div>
        )}

        {isOptimizing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Progress value={33} className="flex-1" />
              <span className="text-sm text-muted-foreground">Analizando...</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Calculando distancias y aplicando algoritmo del vecino más cercano + 2-opt
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-red-50 dark:bg-red-950">
                <div className="text-xs text-muted-foreground mb-1">Distancia Original</div>
                <div className="text-2xl font-bold text-red-600">{result.originalDistance} km</div>
              </Card>
              <Card className="p-4 bg-green-50 dark:bg-green-950">
                <div className="text-xs text-muted-foreground mb-1">Distancia Optimizada</div>
                <div className="text-2xl font-bold text-green-600">{result.optimizedDistance} km</div>
              </Card>
              <Card className="p-4 bg-blue-50 dark:bg-blue-950">
                <div className="text-xs text-muted-foreground mb-1">Tiempo Ahorrado</div>
                <div className="text-2xl font-bold text-blue-600">{result.timeSaved} min</div>
              </Card>
              <Card className="p-4 bg-purple-50 dark:bg-purple-950">
                <div className="text-xs text-muted-foreground mb-1">Combustible Ahorrado</div>
                <div className="text-2xl font-bold text-purple-600">{result.fuelSaved}L</div>
              </Card>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div>
                  <div className="font-semibold text-green-900 dark:text-green-100">
                    Mejora del {result.efficiency}%
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Ruta optimizada lista para aplicar
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowExportOptions(!showExportOptions)} variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={applyOptimization}>
                  Aplicar Optimización
                </Button>
              </div>
            </div>

            {/* Opciones de exportación */}
            {showExportOptions && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <div className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Exportar Ruta Optimizada
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Button onClick={handleExportGoogleMaps} variant="outline" size="sm" className="justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Google Maps
                  </Button>
                  <Button onClick={handleExportWaze} variant="outline" size="sm" className="justify-start">
                    <Navigation className="h-4 w-4 mr-2" />
                    Waze
                  </Button>
                  <Button onClick={handleCopyRoute} variant="outline" size="sm" className="justify-start">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button onClick={handleDownloadGPX} variant="outline" size="sm" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar GPX
                  </Button>
                  <Button onClick={handleShareWhatsApp} variant="outline" size="sm" className="justify-start">
                    <Share2 className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </Card>
            )}

            <div className="space-y-2">
              <div className="text-sm font-semibold">Nuevo orden de citas:</div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.reorderedAppointments.map((apt, index) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-3 p-3 bg-muted rounded-md"
                  >
                    <Badge variant="outline" className="shrink-0">#{index + 1}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{apt.client} - {apt.pet}</div>
                      <div className="text-sm text-muted-foreground truncate">{apt.address}</div>
                    </div>
                    {index < result.reorderedAppointments.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}