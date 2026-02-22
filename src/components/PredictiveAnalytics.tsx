import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, AlertTriangle, DollarSign, Package, Users, Target, Brain, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MLPredictionService } from '../services/mlPredictionService';
import { useClients } from '../hooks/useClients';
import { useInventory } from '../hooks/useInventory';

export function PredictiveAnalytics() {
  const [demandForecast, setDemandForecast] = useState<any[]>([]);
  const [churnPredictions, setChurnPredictions] = useState<any[]>([]);
  const [priceRecommendations, setPriceRecommendations] = useState<any[]>([]);
  const [inventoryPredictions, setInventoryPredictions] = useState<any[]>([]);

  const { clients } = useClients();
  const { inventory } = useInventory();

  const clientsForChurn = useMemo(() => clients.map((c) => ({
    id: c.id,
    name: c.fullName || c.email || c.id,
    lastVisit: c.lastVisit || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    totalVisits: (c as { totalVisits?: number }).totalVisits ?? 5,
    averageSpend: (c as { averageSpend?: number }).averageSpend ?? 60,
    recentSpend: (c as { recentSpend?: number }).recentSpend ?? 50,
    recentCancellations: (c as { recentCancellations?: number }).recentCancellations ?? 0,
  })), [clients]);

  const productsForInventory = useMemo(() => products.map((p) => ({
    id: p.id,
    name: p.name ?? 'Producto',
    stock: p.stock ?? 0,
    monthlyUsage: 30,
    reorderPoint: p.minStock ?? 10,
  })), [products]);

  useEffect(() => {
    const historicalData = Array.from({ length: 60 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (60 - i));
      return { date: date.toISOString().split('T')[0], appointments: Math.floor(Math.random() * 10) + 5, revenue: Math.floor(Math.random() * 1000) + 500 };
    });
    setDemandForecast(MLPredictionService.predictDemand(historicalData, 14));
  }, []);

  useEffect(() => {
    if (clientsForChurn.length > 0) setChurnPredictions(MLPredictionService.detectChurnRisk(clientsForChurn));
    else setChurnPredictions([]);
  }, [clientsForChurn]);

  useEffect(() => {
    const services = [
      { id: '1', name: 'Baño y Corte', price: 80, monthlyBookings: 95, monthlyCapacity: 100 },
      { id: '2', name: 'Baño Medicado', price: 65, monthlyBookings: 45, monthlyCapacity: 100 },
      { id: '3', name: 'Corte de Pelo', price: 50, monthlyBookings: 75, monthlyCapacity: 100 },
    ];
    setPriceRecommendations(MLPredictionService.recommendPriceOptimization(services));
  }, []);

  useEffect(() => {
    if (productsForInventory.length > 0) setInventoryPredictions(MLPredictionService.predictInventoryNeeds(productsForInventory, 30));
    else setInventoryPredictions([]);
  }, [productsForInventory]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'medium': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            Analytics Predictivo con IA
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Predicciones inteligentes para optimizar tu negocio
          </p>
        </div>
        <Button onClick={loadPredictions}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Actualizar Predicciones
        </Button>
      </div>

      <Tabs defaultValue="demand" className="space-y-4">
        <TabsList>
          <TabsTrigger value="demand">
            <Calendar className="w-4 h-4 mr-2" />
            Predicción de Demanda
          </TabsTrigger>
          <TabsTrigger value="churn">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Detección de Churn
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Optimización de Precios
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="w-4 h-4 mr-2" />
            Predicción de Stock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Citas Predichas (7 días)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {demandForecast.slice(0, 7).reduce((acc, d) => acc + d.predictedAppointments, 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Día Pico Esperado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {demandForecast.length > 0 
                    ? demandForecast.reduce((max, d) => 
                        d.predictedAppointments > max.predictedAppointments ? d : max
                      , demandForecast[0])?.dayOfWeek 
                    : '-'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Confianza Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {demandForecast.length > 0
                    ? (demandForecast.reduce((acc, d) => acc + d.confidence, 0) / demandForecast.length).toFixed(0)
                    : 0}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pronóstico de Demanda - Próximos 14 Días</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={demandForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predictedAppointments" 
                    stroke="#3b82f6" 
                    name="Citas Predichas"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalle por Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demandForecast.slice(0, 7).map((forecast, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(forecast.date).toLocaleDateString('es-PE', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      <p className="text-sm text-slate-500">
                        Confianza: {forecast.confidence}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {forecast.predictedAppointments}
                      </p>
                      <p className="text-xs text-slate-500">citas esperadas</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="churn" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Clientes en Alto Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {churnPredictions.filter(c => c.riskLevel === 'high').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Riesgo Medio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {churnPredictions.filter(c => c.riskLevel === 'medium').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Bajo Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {churnPredictions.filter(c => c.riskLevel === 'low').length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Clientes en Riesgo de Abandono</CardTitle>
              <p className="text-sm text-slate-500">
                Predicciones basadas en ML de clientes que podrían abandonar
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnPredictions.map((prediction) => (
                  <Card key={prediction.clientId} className="border-l-4" style={{
                    borderLeftColor: prediction.riskLevel === 'high' ? '#dc2626' : 
                                    prediction.riskLevel === 'medium' ? '#ea580c' : '#16a34a'
                  }}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900 dark:text-white">
                                {prediction.clientName}
                              </p>
                              <Badge className={getRiskColor(prediction.riskLevel)}>
                                Riesgo {prediction.riskLevel === 'high' ? 'Alto' : 
                                        prediction.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500">
                              Última visita: {new Date(prediction.lastVisit).toLocaleDateString('es-PE')} 
                              ({prediction.daysSinceLastVisit} días atrás)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                              {prediction.churnProbability}%
                            </p>
                            <p className="text-xs text-slate-500">probabilidad</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Visitas Totales</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {prediction.totalVisits}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Gasto Promedio</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              S/ {prediction.averageSpend.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Días sin Visita</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {prediction.daysSinceLastVisit}
                            </p>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                            <Target className="w-4 h-4 inline mr-1" />
                            Recomendaciones de Retención:
                          </p>
                          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                            {prediction.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>• {rec}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="default">
                            <Users className="w-4 h-4 mr-2" />
                            Contactar Cliente
                          </Button>
                          <Button size="sm" variant="outline">
                            Enviar Oferta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones de Precios Dinámicos</CardTitle>
              <p className="text-sm text-slate-500">
                Optimización basada en demanda, capacidad y tendencias del mercado
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priceRecommendations.map((rec) => (
                  <Card key={rec.serviceId}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {rec.serviceName}
                            </p>
                            <p className="text-sm text-slate-500">{rec.reason}</p>
                          </div>
                          <Badge variant={rec.priceChange > 0 ? 'default' : 'secondary'}>
                            {rec.priceChange > 0 ? '+' : ''}{rec.priceChange}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-slate-500">Precio Actual</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                              S/ {rec.currentPrice.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Precio Recomendado</p>
                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              S/ {rec.recommendedPrice.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500">Diferencia</p>
                            <p className={`text-xl font-bold ${rec.priceChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                              S/ {Math.abs(rec.recommendedPrice - rec.currentPrice).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <TrendingUp className="w-4 h-4 inline mr-1" />
                            <strong>Impacto esperado:</strong> {rec.expectedImpact}
                          </p>
                        </div>

                        <Button size="sm">
                          Aplicar Cambio de Precio
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predicción de Necesidades de Inventario</CardTitle>
              <p className="text-sm text-slate-500">
                Pronóstico de stock para los próximos 30 días
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryPredictions.map((pred) => (
                  <Card key={pred.productId} className="border-l-4" style={{
                    borderLeftColor: pred.riskLevel === 'high' ? '#dc2626' : 
                                    pred.riskLevel === 'medium' ? '#ea580c' : '#16a34a'
                  }}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-slate-900 dark:text-white">
                                {pred.productName}
                              </p>
                              <Badge className={getRiskColor(pred.riskLevel)}>
                                Riesgo {pred.riskLevel === 'high' ? 'Alto' : 
                                        pred.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500">
                              Stock actual: {pred.currentStock} unidades
                            </p>
                          </div>
                          {pred.recommendedOrder > 0 && (
                            <div className="text-right">
                              <p className="text-sm text-slate-500">Ordenar</p>
                              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {pred.recommendedOrder}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Uso Diario</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {pred.dailyUsage}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Uso Predicho (30d)</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {pred.predictedUsage}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Días hasta Agotarse</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {pred.daysUntilStockout.toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Riesgo de Agotamiento</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {pred.stockoutRisk}%
                            </p>
                          </div>
                        </div>

                        <Progress 
                          value={Math.min(100, (pred.currentStock / pred.predictedUsage) * 100)} 
                          className="h-2"
                        />

                        {pred.recommendedOrder > 0 && (
                          <Button size="sm" variant="default">
                            <Package className="w-4 h-4 mr-2" />
                            Crear Orden de Compra ({pred.recommendedOrder} unidades)
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
