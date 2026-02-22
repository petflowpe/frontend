import { useState } from 'react';
import {
  BarChart3,
  Target,
  Send,
  CheckCircle,
  Clock,
  Eye,
  MousePointerClick,
  TrendingUp,
  DollarSign,
  Sparkles,
  Calendar,
  Zap,
  Gift,
  Crown,
  Filter,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useApp } from '../contexts/AppContext';
import { loyaltyService } from '../services/loyaltyService';
import { AdvancedSegmentation } from './AdvancedSegmentation';

interface CampaignsDashboardProps {
  onCreateCampaign: () => void;
}

export function CampaignsDashboard({ onCreateCampaign }: CampaignsDashboardProps) {
  const { clients, businessSettings } = useApp();
  const segments = loyaltyService.segmentClients(clients);

  // Datos de ejemplo de campañas completadas
  const campaignsHistory = [
    {
      id: 1,
      name: 'Reactivación Inactivos Nov 2024',
      type: 'reactivation' as const,
      date: '2024-11-15',
      status: 'completed' as const,
      sent: 145,
      opened: 128,
      clicked: 87,
      converted: 52,
      revenue: 6240,
      cost: 72.5,
      roi: 8506,
    },
    {
      id: 2,
      name: 'Promoción Black Friday',
      type: 'promotional' as const,
      date: '2024-11-29',
      status: 'completed' as const,
      sent: 320,
      opened: 285,
      clicked: 198,
      converted: 134,
      revenue: 16080,
      cost: 160,
      roi: 9950,
    },
    {
      id: 3,
      name: 'Cumpleaños Mascotas Diciembre',
      type: 'birthday' as const,
      date: '2024-12-01',
      status: 'active' as const,
      sent: 89,
      opened: 78,
      clicked: 67,
      converted: 61,
      revenue: 5490,
      cost: 44.5,
      roi: 12233,
    },
    {
      id: 4,
      name: 'Prevención de Churn',
      type: 'loyalty' as const,
      date: '2024-11-20',
      status: 'completed' as const,
      sent: 58,
      opened: 52,
      clicked: 41,
      converted: 23,
      revenue: 2760,
      cost: 29,
      roi: 9417,
    },
    {
      id: 5,
      name: 'Upgrade a Platino',
      type: 'loyalty' as const,
      date: '2024-11-10',
      status: 'completed' as const,
      sent: 34,
      opened: 32,
      clicked: 28,
      converted: 18,
      revenue: 2880,
      cost: 17,
      roi: 16841,
    },
  ];

  // Calcular totales
  const totalCampaigns = campaignsHistory.length;
  const totalSent = campaignsHistory.reduce((sum, c) => sum + c.sent, 0);
  const totalOpened = campaignsHistory.reduce((sum, c) => sum + c.opened, 0);
  const totalConverted = campaignsHistory.reduce((sum, c) => sum + c.converted, 0);
  const totalRevenue = campaignsHistory.reduce((sum, c) => sum + c.revenue, 0);
  const totalCost = campaignsHistory.reduce((sum, c) => sum + c.cost, 0);
  const avgConversion = (totalConverted / totalSent) * 100;
  const avgRoi = ((totalRevenue - totalCost) / totalCost) * 100;

  return (
    <div className="space-y-6">
      {/* KPIs de Campañas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <Send className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-blue-100 text-blue-800">Enviadas</Badge>
          </div>
          <p className="text-3xl font-bold">{totalCampaigns}</p>
          <p className="text-sm text-muted-foreground">Campañas Enviadas</p>
          <p className="text-xs text-green-600 mt-2">+3 este mes</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
              <Target className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-green-100 text-green-800">Alcance</Badge>
          </div>
          <p className="text-3xl font-bold">{totalSent.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Clientes Alcanzados</p>
          <p className="text-xs text-green-600 mt-2">
            {((totalOpened / totalSent) * 100).toFixed(1)}% tasa de apertura
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
              <MousePointerClick className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-purple-100 text-purple-800">Conversión</Badge>
          </div>
          <p className="text-3xl font-bold">{avgConversion.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
          <p className="text-xs text-green-600 mt-2">+8.2% vs mes pasado</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-orange-100 text-orange-800">ROI</Badge>
          </div>
          <p className="text-3xl font-bold">{avgRoi.toFixed(0)}%</p>
          <p className="text-sm text-muted-foreground">Retorno de Inversión</p>
          <p className="text-xs text-green-600 mt-2">
            S/ {(totalRevenue / totalCost).toFixed(2)} por cada S/ 1
          </p>
        </Card>
      </div>

      {/* Tabs secundarios: Resultados vs Campañas Activas */}
      <Tabs defaultValue="resultados">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resultados">📊 Resultados</TabsTrigger>
          <TabsTrigger value="activas">🚀 Campañas Activas</TabsTrigger>
          <TabsTrigger value="segmentacion">🎯 Segmentación</TabsTrigger>
        </TabsList>

        {/* Sub-tab: Dashboard de Resultados */}
        <TabsContent value="resultados" className="space-y-6 mt-6">
          {/* Filtros */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las campañas</SelectItem>
                  <SelectItem value="promotional">Promocionales</SelectItem>
                  <SelectItem value="reactivation">Reactivación</SelectItem>
                  <SelectItem value="birthday">Cumpleaños</SelectItem>
                  <SelectItem value="loyalty">Fidelización</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="30">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 90 días</SelectItem>
                  <SelectItem value="365">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Historial de Campañas con Resultados */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Historial de Campañas</h2>
              <Button onClick={onCreateCampaign}>
                <Sparkles className="h-4 w-4 mr-2" />
                Nueva Campaña
              </Button>
            </div>

            <div className="space-y-4">
              {campaignsHistory.map((campaign) => {
                const openRate = ((campaign.opened / campaign.sent) * 100).toFixed(1);
                const clickRate = ((campaign.clicked / campaign.sent) * 100).toFixed(1);
                const conversionRate = ((campaign.converted / campaign.sent) * 100).toFixed(1);

                return (
                  <Card key={campaign.id} className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{campaign.name}</h3>
                          <Badge
                            variant={campaign.status === 'completed' ? 'default' : 'secondary'}
                            className={
                              campaign.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }
                          >
                            {campaign.status === 'completed' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completada
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Activa
                              </>
                            )}
                          </Badge>
                          <Badge variant="outline">
                            {campaign.type === 'promotional' && '🎉 Promocional'}
                            {campaign.type === 'reactivation' && '⚡ Reactivación'}
                            {campaign.type === 'birthday' && '🎂 Cumpleaños'}
                            {campaign.type === 'loyalty' && '👑 Fidelización'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(campaign.date).toLocaleDateString('es-PE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          S/ {campaign.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Ingresos generados</p>
                      </div>
                    </div>

                    {/* Métricas principales */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{campaign.sent}</p>
                        <p className="text-xs text-muted-foreground">Enviados</p>
                      </div>
                      <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-950/20 rounded-lg">
                        <p className="text-2xl font-bold text-cyan-600">{campaign.opened}</p>
                        <p className="text-xs text-muted-foreground">Abiertos</p>
                        <p className="text-xs text-cyan-600 font-medium">{openRate}%</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{campaign.clicked}</p>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                        <p className="text-xs text-purple-600 font-medium">{clickRate}%</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{campaign.converted}</p>
                        <p className="text-xs text-muted-foreground">Conversiones</p>
                        <p className="text-xs text-green-600 font-medium">{conversionRate}%</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                        <p className="text-2xl font-bold text-orange-600">
                          {campaign.roi.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">ROI</p>
                        <p className="text-xs text-orange-600 font-medium">
                          S/ {(campaign.revenue - campaign.cost).toFixed(0)} ganancia
                        </p>
                      </div>
                    </div>

                    {/* Barra de progreso del funnel */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Funnel de Conversión</span>
                        <span className="font-medium">
                          {campaign.sent} → {campaign.converted} ({conversionRate}%)
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all"
                          style={{ width: `${conversionRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Detalles adicionales */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Costo: S/ {campaign.cost.toFixed(2)}</span>
                        <span>•</span>
                        <span>
                          CPA: S/{' '}
                          {campaign.converted > 0
                            ? (campaign.cost / campaign.converted).toFixed(2)
                            : '0.00'}
                        </span>
                        <span>•</span>
                        <span>
                          Ticket Prom: S/{' '}
                          {campaign.converted > 0
                            ? (campaign.revenue / campaign.converted).toFixed(0)
                            : '0'}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalles
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          {/* Análisis Comparativo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Mejor Rendimiento
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Mayor ROI</p>
                  <p className="font-bold">Upgrade a Platino - 168.4%</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Mayor Conversión</p>
                  <p className="font-bold">Cumpleaños Mascotas - 68.5%</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Mayor Ingresos</p>
                  <p className="font-bold">Black Friday - S/ 16,080</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Promedios Generales
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm text-muted-foreground">Tasa de Apertura</span>
                  <span className="font-bold text-blue-600">
                    {((totalOpened / totalSent) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm text-muted-foreground">Tasa de Click</span>
                  <span className="font-bold text-purple-600">
                    {(
                      (campaignsHistory.reduce((sum, c) => sum + c.clicked, 0) / totalSent) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm text-muted-foreground">Tasa de Conversión</span>
                  <span className="font-bold text-green-600">{avgConversion.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-sm text-muted-foreground">ROI Promedio</span>
                  <span className="font-bold text-orange-600">{avgRoi.toFixed(0)}%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Sub-tab: Campañas Activas */}
        <TabsContent value="activas" className="space-y-6 mt-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Campañas Automáticas</h2>
              <Button onClick={onCreateCampaign}>
                <Sparkles className="h-4 w-4 mr-2" />
                Nueva Campaña
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: 'Reactivación de Inactivos',
                  description: 'Incentivos para clientes sin visitas en 60+ días',
                  target: segments.inactive.length,
                  status: 'active',
                  conversion: 25,
                },
                {
                  name: 'Prevención de Churn',
                  description: 'Cupones especiales para clientes en riesgo',
                  target: segments.atRisk.length,
                  status: 'active',
                  conversion: 40,
                },
                {
                  name: 'Upgrade de Tier',
                  description: 'Notificar cuando están cerca del siguiente nivel',
                  target: clients.filter((c) => {
                    const next = loyaltyService.getPointsToNextTier(
                      c.loyaltyPoints,
                      c.loyaltyTier,
                      businessSettings
                    );
                    return next && next.points <= 100;
                  }).length,
                  status: 'scheduled',
                  conversion: 60,
                },
                {
                  name: 'Cumpleaños VIP',
                  description: 'Cupones especiales para cumpleaños de mascotas',
                  target: clients.length,
                  status: 'active',
                  conversion: 85,
                },
              ].map((campaign, idx) => (
                <Card key={idx} className="p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    </div>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status === 'active' ? 'Activa' : 'Programada'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-semibold">{campaign.target} clientes</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversión</p>
                      <p className="font-semibold text-green-600">{campaign.conversion}%</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Sub-tab: Segmentación */}
        <TabsContent value="segmentacion" className="space-y-6 mt-6">
          <AdvancedSegmentation onSegmentSelected={(segment, clients) => {
            // Callback cuando se selecciona un segmento para campaña
            console.log('Segmento seleccionado:', segment, 'Clientes:', clients.length);
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}