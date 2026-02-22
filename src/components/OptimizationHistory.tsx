import { useState } from 'react';
import { History, TrendingUp, Download, Calendar, DollarSign, Fuel, Leaf, Clock, Car, BarChart3, ChevronDown } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { optimizationHistoryService, type OptimizationRecord, type MonthlyStats } from '../services/optimizationHistoryService';
import { toast } from 'sonner';

export function OptimizationHistory() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  const recentOptimizations = optimizationHistoryService.getRecentOptimizations(10);
  const monthlyStats = optimizationHistoryService.getMonthlyStats(selectedYear, selectedMonth);
  const yearlyStats = optimizationHistoryService.getYearlyStats(selectedYear);

  const handleDownloadCSV = () => {
    optimizationHistoryService.downloadCSV(`optimizaciones-${selectedYear}-${selectedMonth}.csv`);
    toast.success('📥 Historial exportado exitosamente');
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-blue-600" />
            Historial de Optimizaciones
          </h2>
          <p className="text-muted-foreground mt-1">
            Análisis de mejoras y ahorros mensuales
          </p>
        </div>
        <Button onClick={handleDownloadCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Vista Mensual</TabsTrigger>
          <TabsTrigger value="yearly">Vista Anual</TabsTrigger>
          <TabsTrigger value="recent">Recientes</TabsTrigger>
        </TabsList>

        {/* Vista Mensual */}
        <TabsContent value="monthly" className="space-y-4">
          {/* Selección de periodo */}
          <div className="flex gap-3">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear, currentYear - 1, currentYear - 2].map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((month, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estadísticas Mensuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <Badge variant="outline">{monthlyStats.totalOptimizations}</Badge>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {monthlyStats.totalDistanceSaved} km
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Distancia ahorrada
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  S/ {monthlyStats.totalCostSaved.toFixed(2)}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {monthlyStats.totalFuelSaved}L
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Combustible ahorrado
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <Badge variant="outline">{Math.floor(monthlyStats.totalTimeSaved / 60)}h</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {monthlyStats.totalTimeSaved} min
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Tiempo ahorrado
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
              <div className="flex items-center justify-between mb-2">
                <Leaf className="h-5 w-5 text-emerald-600" />
                <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
                  {monthlyStats.averageEfficiency}%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {monthlyStats.totalCO2Saved} kg
              </div>
              <div className="text-sm text-emerald-700 dark:text-emerald-300">
                CO₂ reducido
              </div>
            </Card>
          </div>

          {/* Mejor optimización del mes */}
          {monthlyStats.bestOptimization && (
            <Card className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    🏆 Mejor Optimización del Mes
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Vehículo</div>
                      <div className="font-medium">{monthlyStats.bestOptimization.vehicleName}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Eficiencia</div>
                      <div className="font-medium text-green-600">{monthlyStats.bestOptimization.efficiency}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Ahorro</div>
                      <div className="font-medium">{monthlyStats.bestOptimization.distanceSaved.toFixed(1)} km</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Fecha</div>
                      <div className="font-medium">
                        {new Date(monthlyStats.bestOptimization.date).toLocaleDateString('es-PE')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Vista Anual */}
        <TabsContent value="yearly" className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear, currentYear - 1, currentYear - 2].map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resumen Anual */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Resumen Anual {selectedYear}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Optimizaciones</div>
                <div className="text-2xl font-bold">{yearlyStats.totalOptimizations}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Distancia (km)</div>
                <div className="text-2xl font-bold text-blue-600">{yearlyStats.totalDistanceSaved}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Combustible (L)</div>
                <div className="text-2xl font-bold text-green-600">{yearlyStats.totalFuelSaved}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ahorro (S/)</div>
                <div className="text-2xl font-bold text-emerald-600">{yearlyStats.totalCostSaved.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tiempo (h)</div>
                <div className="text-2xl font-bold text-purple-600">{Math.floor(yearlyStats.totalTimeSaved / 60)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">CO₂ (kg)</div>
                <div className="text-2xl font-bold text-amber-600">{yearlyStats.totalCO2Saved}</div>
              </div>
            </div>
          </Card>

          {/* Desglose Mensual */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Desglose por Mes</h3>
            <div className="space-y-2">
              {yearlyStats.monthlyBreakdown.map((monthData, index) => (
                monthData.totalOptimizations > 0 && (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <div className="w-24 font-medium">{monthNames[index]}</div>
                    <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Optimizaciones: </span>
                        <span className="font-medium">{monthData.totalOptimizations}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Distancia: </span>
                        <span className="font-medium text-blue-600">{monthData.totalDistanceSaved} km</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ahorro: </span>
                        <span className="font-medium text-green-600">S/ {monthData.totalCostSaved.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Eficiencia: </span>
                        <span className="font-medium text-purple-600">{monthData.averageEfficiency}%</span>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Vista Recientes */}
        <TabsContent value="recent" className="space-y-3">
          {recentOptimizations.length === 0 ? (
            <Card className="p-8 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No hay optimizaciones registradas aún
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Las optimizaciones se guardarán automáticamente cuando uses el optimizador de rutas
              </p>
            </Card>
          ) : (
            recentOptimizations.map((record) => (
              <Card key={record.id} className="p-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Car className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{record.vehicleName}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('es-PE', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Eficiencia</div>
                      <Badge variant={record.efficiency > 20 ? 'default' : 'secondary'}>
                        {record.efficiency}%
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Ahorro</div>
                      <div className="font-medium text-green-600">
                        S/ {record.costSaved.toFixed(2)}
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        expandedRecord === record.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {expandedRecord === record.id && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground mb-1">Citas</div>
                      <div className="font-medium">{record.appointmentsCount}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Distancia Original</div>
                      <div className="font-medium">{record.originalDistance} km</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Distancia Optimizada</div>
                      <div className="font-medium text-green-600">{record.optimizedDistance} km</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Distancia Ahorrada</div>
                      <div className="font-medium text-blue-600">{record.distanceSaved.toFixed(1)} km</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Tiempo Ahorrado</div>
                      <div className="font-medium">{record.timeSaved} min</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Combustible</div>
                      <div className="font-medium">{record.fuelSaved.toFixed(1)}L</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">CO₂ Reducido</div>
                      <div className="font-medium text-emerald-600">{record.co2Saved.toFixed(1)} kg</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1">Ahorro Total</div>
                      <div className="font-medium text-green-600">S/ {record.costSaved.toFixed(2)}</div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
