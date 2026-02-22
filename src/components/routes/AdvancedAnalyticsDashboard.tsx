import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Truck,
  MapPin,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap
} from 'lucide-react';

interface Client {
  id: number;
  fullName: string;
  district: string;
  zone?: string;
  assignedVehicle?: number;
  isFixedSchedule: boolean;
  appointmentFrequency: 'semanal' | 'quincenal' | 'mensual' | 'bajo_demanda';
  preferredDays: string[];
  preferredTimeSlot: 'mañana' | 'tarde' | 'noche';
  status: string;
  totalAppointments?: number;
  totalSpent?: number;
  registrationDate?: string;
}

interface Vehicle {
  id: string;
  name: string;
  assignedZones: string[];
  workDays: string[];
  startTime: string;
  endTime: string;
}

interface AdvancedAnalyticsDashboardProps {
  clients: Client[];
  vehicles: Vehicle[];
}

export function AdvancedAnalyticsDashboard({ clients, vehicles }: AdvancedAnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Calcular estadísticas avanzadas
  const analytics = useMemo(() => {
    // Validar que clients y vehicles existen y son arrays
    if (!clients || !Array.isArray(clients)) {
      return getEmptyAnalytics();
    }
    if (!vehicles || !Array.isArray(vehicles)) {
      return getEmptyAnalytics();
    }

    const fixedClients = clients.filter(c => c.isFixedSchedule && c.status === 'Activo');
    const variableClients = clients.filter(c => !c.isFixedSchedule && c.status === 'Activo');
    
    // Citas por semana
    const weeklyAppointments = fixedClients.reduce((acc, c) => {
      if (!c.preferredDays || !Array.isArray(c.preferredDays)) return acc;
      if (c.appointmentFrequency === 'semanal') return acc + c.preferredDays.length;
      if (c.appointmentFrequency === 'quincenal') return acc + (c.preferredDays.length / 2);
      if (c.appointmentFrequency === 'mensual') return acc + (c.preferredDays.length / 4);
      return acc;
    }, 0);

    // Capacidad por vehículo
    const vehicleCapacity = vehicles.map(vehicle => {
      // Validar que vehicle.id existe y extraer el número
      let vehicleId: number | undefined;
      if (vehicle.id && typeof vehicle.id === 'string' && vehicle.id.includes('-')) {
        vehicleId = parseInt(vehicle.id.split('-')[1]);
      }
      
      const vehicleClients = fixedClients.filter(
        c => vehicleId !== undefined && c.assignedVehicle === vehicleId
      );

      const hoursPerWeek = vehicle.workDays?.length ? vehicle.workDays.length * 8 : 0; // 8 horas por día
      const usedHours = vehicleClients.reduce((acc, c) => {
        const appointmentsPerWeek = c.appointmentFrequency === 'semanal' 
          ? c.preferredDays?.length || 0
          : c.appointmentFrequency === 'quincenal'
          ? (c.preferredDays?.length || 0) / 2
          : (c.preferredDays?.length || 0) / 4;
        return acc + (appointmentsPerWeek * 1.5); // 1.5h por cita
      }, 0);

      return {
        vehicle: vehicle.name || 'Sin nombre',
        totalHours: hoursPerWeek,
        usedHours: Math.round(usedHours * 10) / 10,
        availableHours: Math.round((hoursPerWeek - usedHours) * 10) / 10,
        utilizationPercent: Math.round((usedHours / hoursPerWeek) * 100),
        clientCount: vehicleClients.length
      };
    });

    // Distribución por frecuencia
    const frequencyDistribution = {
      semanal: fixedClients.filter(c => c.appointmentFrequency === 'semanal').length,
      quincenal: fixedClients.filter(c => c.appointmentFrequency === 'quincenal').length,
      mensual: fixedClients.filter(c => c.appointmentFrequency === 'mensual').length
    };

    // Distribución por horario
    const timeSlotDistribution = {
      mañana: fixedClients.filter(c => c.preferredTimeSlot === 'mañana').length,
      tarde: fixedClients.filter(c => c.preferredTimeSlot === 'tarde').length,
      noche: fixedClients.filter(c => c.preferredTimeSlot === 'noche').length
    };

    // Días más demandados
    const dayDemand: { [key: string]: number } = {
      'lunes': 0, 'martes': 0, 'miércoles': 0, 'jueves': 0, 
      'viernes': 0, 'sábado': 0, 'domingo': 0
    };
    
    fixedClients.forEach(client => {
      if (client.preferredDays && Array.isArray(client.preferredDays)) {
        client.preferredDays.forEach(day => {
          if (day && typeof day === 'string') {
            const dayLower = day.toLowerCase();
            if (dayDemand.hasOwnProperty(dayLower)) {
              dayDemand[dayLower]++;
            }
          }
        });
      }
    });

    // Ingreso recurrente estimado
    const avgTicket = 60; // Promedio por cita
    const monthlyRecurringRevenue = fixedClients.reduce((acc, c) => {
      if (!c.preferredDays || !Array.isArray(c.preferredDays)) return acc;
      const appointmentsPerMonth = c.appointmentFrequency === 'semanal' 
        ? c.preferredDays.length * 4
        : c.appointmentFrequency === 'quincenal'
        ? c.preferredDays.length * 2
        : c.preferredDays.length;
      return acc + (appointmentsPerMonth * avgTicket);
    }, 0);

    // Crecimiento
    const last30Days = clients.filter(c => {
      if (!c.registrationDate) return false;
      const regDate = new Date(c.registrationDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return regDate >= thirtyDaysAgo;
    });

    const newFixedClients = last30Days.filter(c => c.isFixedSchedule).length;

    return {
      totalFixed: fixedClients.length,
      totalVariable: variableClients.length,
      fixedPercentage: Math.round((fixedClients.length / clients.length) * 100),
      weeklyAppointments: Math.round(weeklyAppointments),
      monthlyAppointments: Math.round(weeklyAppointments * 4),
      vehicleCapacity,
      frequencyDistribution,
      timeSlotDistribution,
      dayDemand,
      monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
      annualRecurringRevenue: Math.round(monthlyRecurringRevenue * 12),
      newFixedClients,
      growthRate: last30Days.length > 0 ? Math.round((newFixedClients / last30Days.length) * 100) : 0
    };
  }, [clients, vehicles]);

  return (
    <div className="space-y-6">
      {/* Header con KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Clientes Fijos</p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{analytics.totalFixed}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {analytics.fixedPercentage}% del total
                </p>
              </div>
              <Users className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Citas Mensuales</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">{analytics.monthlyAppointments}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ~{analytics.weeklyAppointments}/semana
                </p>
              </div>
              <Calendar className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Ingreso Recurrente</p>
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  S/ {(analytics.monthlyRecurringRevenue / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  S/ {(analytics.annualRecurringRevenue / 1000).toFixed(0)}k/año
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Nuevos (30d)</p>
                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{analytics.newFixedClients}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {analytics.growthRate}% fijos
                  </p>
                </div>
              </div>
              <Target className="h-10 w-10 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="capacity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="capacity">Capacidad</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="demand">Demanda</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Capacidad de Vehículos */}
        <TabsContent value="capacity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Capacidad por Vehículo
              </CardTitle>
              <CardDescription>
                Horas comprometidas vs disponibles (semana típica)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.vehicleCapacity.map((vc, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{vc.vehicle}</span>
                      <Badge variant="outline">{vc.clientCount} clientes</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vc.usedHours}h / {vc.totalHours}h
                    </div>
                  </div>
                  <Progress value={vc.utilizationPercent} className="h-2" />
                  <div className="flex items-center justify-between text-xs">
                    <span className={
                      vc.utilizationPercent > 80 ? 'text-red-600' :
                      vc.utilizationPercent > 60 ? 'text-orange-600' :
                      'text-green-600'
                    }>
                      {vc.utilizationPercent}% utilizado
                    </span>
                    <span className="text-muted-foreground">
                      {vc.availableHours}h disponibles
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alertas de Capacidad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Alertas y Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analytics.vehicleCapacity.map((vc, index) => {
                if (vc.utilizationPercent > 80) {
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-100">
                          {vc.vehicle} cerca del límite
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {vc.utilizationPercent}% de capacidad. Considere redistribuir clientes o agregar vehículo.
                        </p>
                      </div>
                    </div>
                  );
                } else if (vc.utilizationPercent < 40) {
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {vc.vehicle} con capacidad disponible
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Solo {vc.utilizationPercent}% utilizado. Oportunidad para captar más clientes fijos.
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
              
              {analytics.vehicleCapacity.every(vc => vc.utilizationPercent >= 40 && vc.utilizationPercent <= 80) && (
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Capacidad óptima
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Todos los vehículos operan en rangos saludables (40-80%).
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribución */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Por Frecuencia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Por Frecuencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Semanal</span>
                    <Badge className="bg-green-100 text-green-800">
                      {analytics.frequencyDistribution.semanal}
                    </Badge>
                  </div>
                  <Progress 
                    value={(analytics.frequencyDistribution.semanal / analytics.totalFixed) * 100} 
                    className="h-2 bg-green-100" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quincenal</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {analytics.frequencyDistribution.quincenal}
                    </Badge>
                  </div>
                  <Progress 
                    value={(analytics.frequencyDistribution.quincenal / analytics.totalFixed) * 100} 
                    className="h-2 bg-blue-100" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mensual</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {analytics.frequencyDistribution.mensual}
                    </Badge>
                  </div>
                  <Progress 
                    value={(analytics.frequencyDistribution.mensual / analytics.totalFixed) * 100} 
                    className="h-2 bg-purple-100" 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Por Horario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Por Horario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mañana (8-12)</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {analytics.timeSlotDistribution.mañana}
                    </Badge>
                  </div>
                  <Progress 
                    value={(analytics.timeSlotDistribution.mañana / analytics.totalFixed) * 100} 
                    className="h-2 bg-yellow-100" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tarde (12-18)</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {analytics.timeSlotDistribution.tarde}
                    </Badge>
                  </div>
                  <Progress 
                    value={(analytics.timeSlotDistribution.tarde / analytics.totalFixed) * 100} 
                    className="h-2 bg-orange-100" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Noche (18-22)</span>
                    <Badge className="bg-indigo-100 text-indigo-800">
                      {analytics.timeSlotDistribution.noche}
                    </Badge>
                  </div>
                  <Progress 
                    value={(analytics.timeSlotDistribution.noche / analytics.totalFixed) * 100} 
                    className="h-2 bg-indigo-100" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demanda por Día */}
        <TabsContent value="demand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Demanda por Día de la Semana
              </CardTitle>
              <CardDescription>
                Número de clientes fijos que prefieren cada día
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.dayDemand)
                  .sort((a, b) => b[1] - a[1])
                  .map(([day, count]) => (
                    <div key={day} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{day}</span>
                        <Badge variant="outline">{count} citas</Badge>
                      </div>
                      <Progress 
                        value={(count / Math.max(...Object.values(analytics.dayDemand))) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Insights y Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Insight 1: Conversión */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Potencial de Conversión</h4>
                    <p className="text-sm text-muted-foreground">
                      Tienes {analytics.totalVariable} clientes variables. Si conviertes el 20% a fijos, 
                      generarías S/ {Math.round((analytics.totalVariable * 0.2 * 240) / 1000)}k adicionales/año.
                    </p>
                  </div>
                </div>
              </div>

              {/* Insight 2: Día óptimo */}
              {(() => {
                const [busiestDay, busiestCount] = Object.entries(analytics.dayDemand)
                  .sort((a, b) => b[1] - a[1])[0];
                const [quietestDay, quietestCount] = Object.entries(analytics.dayDemand)
                  .sort((a, b) => a[1] - b[1])[0];
                
                return (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1 capitalize">Balance de Demanda</h4>
                        <p className="text-sm text-muted-foreground">
                          <span className="capitalize">{busiestDay}</span> es el día más demandado ({busiestCount} citas). 
                          Considera promociones para <span className="capitalize">{quietestDay}</span> ({quietestCount} citas) 
                          para equilibrar la carga.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Insight 3: Ingreso predecible */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Ingreso Predecible</h4>
                    <p className="text-sm text-muted-foreground">
                      Los clientes fijos representan el {analytics.fixedPercentage}% de tu base y generan 
                      S/ {(analytics.monthlyRecurringRevenue / 1000).toFixed(1)}k mensuales predecibles. 
                      Esto es ~{Math.round((analytics.monthlyRecurringRevenue / (analytics.totalFixed || 1)))} por cliente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Insight 4: Eficiencia operativa */}
              {(() => {
                const avgUtilization = Math.round(
                  analytics.vehicleCapacity.reduce((sum, v) => sum + v.utilizationPercent, 0) / 
                  analytics.vehicleCapacity.length
                );
                
                return (
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-lg border">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Eficiencia de Flota</h4>
                        <p className="text-sm text-muted-foreground">
                          Utilización promedio: {avgUtilization}%. 
                          {avgUtilization < 50 && " Hay capacidad para 2x más clientes fijos."}
                          {avgUtilization >= 50 && avgUtilization < 70 && " Capacidad saludable con margen de crecimiento."}
                          {avgUtilization >= 70 && " Considera expandir la flota pronto."}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Función para obtener estadísticas vacías
function getEmptyAnalytics() {
  return {
    totalFixed: 0,
    totalVariable: 0,
    fixedPercentage: 0,
    weeklyAppointments: 0,
    monthlyAppointments: 0,
    vehicleCapacity: [],
    frequencyDistribution: {
      semanal: 0,
      quincenal: 0,
      mensual: 0
    },
    timeSlotDistribution: {
      mañana: 0,
      tarde: 0,
      noche: 0
    },
    dayDemand: {
      'lunes': 0, 'martes': 0, 'miércoles': 0, 'jueves': 0, 
      'viernes': 0, 'sábado': 0, 'domingo': 0
    },
    monthlyRecurringRevenue: 0,
    annualRecurringRevenue: 0,
    newFixedClients: 0,
    growthRate: 0
  };
}