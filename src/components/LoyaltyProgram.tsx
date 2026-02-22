import { useState } from 'react';
import { Award, Gift, Star, TrendingUp, Users, Zap, Crown, Sparkles, ChevronRight, Calendar, DollarSign, Percent, X, Plus } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { useApp, Client } from '../contexts/AppContext';
import { loyaltyService } from '../services/loyaltyService';
import { toast } from 'sonner';
import { CampaignsDashboard } from './CampaignsDashboard';

export function LoyaltyProgram() {
  const { clients, businessSettings, updateClient, addLoyaltyPoints, redeemLoyaltyPoints, coupons } = useApp();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  
  // Estados para diálogos
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  
  // Estados para formulario de cupón
  const [couponData, setCouponData] = useState({
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchase: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    maxUses: 0,
    loyaltyTierRequired: 'all' as 'all' | 'bronze' | 'silver' | 'gold' | 'platinum',
  });
  
  // Estados para formulario de campaña
  const [campaignData, setCampaignData] = useState({
    name: '',
    description: '',
    type: 'promotional' as 'promotional' | 'reactivation' | 'birthday' | 'loyalty',
    targetTiers: [] as string[],
    lastVisitDaysAgo: 0,
    scheduledDate: '',
    message: '',
  });

  // Estadísticas generales
  const totalClients = clients.length;
  const segments = loyaltyService.segmentClients(clients);
  
  const tierDistribution = {
    bronze: clients.filter(c => c.loyaltyTier === 'bronze').length,
    silver: clients.filter(c => c.loyaltyTier === 'silver').length,
    gold: clients.filter(c => c.loyaltyTier === 'gold').length,
    platinum: clients.filter(c => c.loyaltyTier === 'platinum').length,
  };

  // Clientes filtrados
  const filteredClients = clients
    .filter(c =>
      (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    )
    .filter(c => selectedTierFilter === 'all' || c.loyaltyTier === selectedTierFilter)
    .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints);

  const getTierBadgeColor = (tier: Client['loyaltyTier']) => {
    switch (tier) {
      case 'bronze':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'silver':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'platinum':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddPoints = (clientId: string, points: number, reason: string) => {
    addLoyaltyPoints(clientId, points, reason);
  };

  const handleRedeemPoints = (clientId: string, points: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    if (client.loyaltyPoints < points) {
      toast.error('Puntos insuficientes');
      return;
    }
    
    redeemLoyaltyPoints(clientId, points);
    toast.success(`${points} puntos canjeados`);
  };
  
  const handleCreateCoupon = () => {
    // Validación básica
    if (!couponData.code || !couponData.description || !couponData.value) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }
    
    // Aquí se crearía el cupón en el contexto
    // Por ahora solo mostramos un toast
    toast.success(`Cupón ${couponData.code} creado exitosamente`);
    setShowCouponDialog(false);
    
    // Resetear formulario
    setCouponData({
      code: '',
      description: '',
      type: 'percentage',
      value: 0,
      minPurchase: 0,
      maxDiscount: 0,
      startDate: '',
      endDate: '',
      maxUses: 0,
      loyaltyTierRequired: 'all',
    });
  };
  
  const handleCreateCampaign = () => {
    // Validación básica
    if (!campaignData.name || !campaignData.description || !campaignData.message) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }
    
    // Aquí se crearía la campaña en el contexto
    // Por ahora solo mostramos un toast
    toast.success(`Campaña "${campaignData.name}" creada exitosamente`);
    setShowCampaignDialog(false);
    
    // Resetear formulario
    setCampaignData({
      name: '',
      description: '',
      type: 'promotional',
      targetTiers: [],
      lastVisitDaysAgo: 0,
      scheduledDate: '',
      message: '',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Programa de Fidelización
          </h1>
          <p className="text-muted-foreground text-lg">
            Recompensa a tus clientes más leales
          </p>
        </div>
        <Button onClick={() => setShowCouponDialog(true)}>
          <Gift className="h-4 w-4 mr-2" />
          Crear Cupón
        </Button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-purple-100 text-purple-800">Total</Badge>
          </div>
          <p className="text-3xl font-bold">{totalClients}</p>
          <p className="text-sm text-muted-foreground">Clientes Activos</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-blue-100 text-blue-800">VIP</Badge>
          </div>
          <p className="text-3xl font-bold">{segments.vip.length}</p>
          <p className="text-sm text-muted-foreground">Clientes VIP</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-orange-100 text-orange-800">En Riesgo</Badge>
          </div>
          <p className="text-3xl font-bold">{segments.atRisk.length}</p>
          <p className="text-sm text-muted-foreground">Clientes en Riesgo</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gray-500 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <Badge className="bg-gray-100 text-gray-800">Inactivos</Badge>
          </div>
          <p className="text-3xl font-bold">{segments.inactive.length}</p>
          <p className="text-sm text-muted-foreground">Clientes Inactivos</p>
        </Card>
      </div>

      {/* Distribución de Tiers */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Distribución por Nivel</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { tier: 'bronze', label: 'Bronce', count: tierDistribution.bronze, icon: '🥉', color: 'from-orange-400 to-orange-600' },
            { tier: 'silver', label: 'Plata', count: tierDistribution.silver, icon: '🥈', color: 'from-gray-400 to-gray-600' },
            { tier: 'gold', label: 'Oro', count: tierDistribution.gold, icon: '🥇', color: 'from-yellow-400 to-yellow-600' },
            { tier: 'platinum', label: 'Platino', count: tierDistribution.platinum, icon: '💎', color: 'from-purple-400 to-purple-600' },
          ].map((t) => (
            <Card key={t.tier} className={`p-4 bg-gradient-to-br ${t.color} text-white`}>
              <div className="text-3xl mb-2">{t.icon}</div>
              <p className="text-2xl font-bold">{t.count}</p>
              <p className="text-sm opacity-90">{t.label}</p>
              <p className="text-xs opacity-75 mt-1">
                {totalClients > 0 ? ((t.count / totalClients) * 100).toFixed(1) : 0}% del total
              </p>
            </Card>
          ))}
        </div>
      </Card>

      {/* Tabs Principal */}
      <Tabs defaultValue="clientes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clientes">👥 Clientes</TabsTrigger>
          <TabsTrigger value="beneficios">🎁 Beneficios</TabsTrigger>
          <TabsTrigger value="campanas">📢 Campañas</TabsTrigger>
          <TabsTrigger value="configuracion">⚙️ Configuración</TabsTrigger>
        </TabsList>

        {/* Tab: Clientes */}
        <TabsContent value="clientes" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Input
                placeholder="Buscar cliente por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={selectedTierFilter} onValueChange={setSelectedTierFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tiers</SelectItem>
                  <SelectItem value="bronze">🥉 Bronce</SelectItem>
                  <SelectItem value="silver">🥈 Plata</SelectItem>
                  <SelectItem value="gold">🥇 Oro</SelectItem>
                  <SelectItem value="platinum">💎 Platino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lista de clientes */}
            <div className="space-y-4">
              {filteredClients.map((client) => {
                const nextTier = loyaltyService.getPointsToNextTier(
                  client.loyaltyPoints,
                  client.loyaltyTier,
                  businessSettings
                );
                const discount = loyaltyService.getTierDiscount(client.loyaltyTier, businessSettings);
                const clv = loyaltyService.calculateCustomerLifetimeValue(client);
                const atRisk = loyaltyService.isAtRiskOfChurn(client);

                return (
                  <Card
                    key={client.id}
                    className={`p-6 hover:shadow-lg transition-all cursor-pointer ${
                      atRisk ? 'border-orange-300 bg-orange-50/50 dark:bg-orange-950/10' : ''
                    }`}
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">
                            {client.firstName} {client.lastName}
                          </h3>
                          <Badge className={getTierBadgeColor(client.loyaltyTier)}>
                            {loyaltyService.getTierIcon(client.loyaltyTier)} {client.loyaltyTier.toUpperCase()}
                          </Badge>
                          {atRisk && (
                            <Badge className="bg-orange-100 text-orange-800">
                              ⚠️ En Riesgo
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Puntos</p>
                            <p className="font-semibold text-lg">{client.loyaltyPoints.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Descuento</p>
                            <p className="font-semibold text-lg text-green-600">{discount}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Gastado</p>
                            <p className="font-semibold text-lg">S/ {client.totalSpent.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">CLV</p>
                            <p className="font-semibold text-lg">S/ {clv.toFixed(0)}</p>
                          </div>
                        </div>

                        {nextTier && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">
                                Faltan {nextTier.points} puntos para {nextTier.nextTier}
                              </span>
                              <span className="font-medium">
                                {((client.loyaltyPoints / (client.loyaltyPoints + nextTier.points)) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <Progress
                              value={(client.loyaltyPoints / (client.loyaltyPoints + nextTier.points)) * 100}
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddPoints(client.id, 100, 'Puntos de prueba');
                          }}
                        >
                          <Gift className="h-4 w-4 mr-1" />
                          Dar Puntos
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                          }}
                        >
                          Ver Detalles
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredClients.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron clientes</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab: Beneficios por Tier */}
        <TabsContent value="beneficios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                tier: 'bronze',
                name: 'Bronce',
                icon: '🥉',
                color: 'from-orange-400 to-orange-600',
                minPoints: businessSettings.loyaltyProgram.tiers.bronze.minPoints,
                discount: businessSettings.loyaltyProgram.tiers.bronze.discount,
                benefits: [
                  'Acumulación de puntos en cada compra',
                  'Recordatorios de citas',
                  'Acceso a promociones',
                ],
              },
              {
                tier: 'silver',
                name: 'Plata',
                icon: '🥈',
                color: 'from-gray-400 to-gray-600',
                minPoints: businessSettings.loyaltyProgram.tiers.silver.minPoints,
                discount: businessSettings.loyaltyProgram.tiers.silver.discount,
                benefits: [
                  'Todos los beneficios de Bronce',
                  '5% de descuento permanente',
                  'Prioridad en reservas',
                  'Cupón de cumpleaños (15%)',
                ],
              },
              {
                tier: 'gold',
                name: 'Oro',
                icon: '🥇',
                color: 'from-yellow-400 to-yellow-600',
                minPoints: businessSettings.loyaltyProgram.tiers.gold.minPoints,
                discount: businessSettings.loyaltyProgram.tiers.gold.discount,
                benefits: [
                  'Todos los beneficios de Plata',
                  '10% de descuento permanente',
                  'Groomer preferido garantizado',
                  'Acceso anticipado a nuevos servicios',
                  'Cupón de cumpleaños (20%)',
                ],
              },
              {
                tier: 'platinum',
                name: 'Platino',
                icon: '💎',
                color: 'from-purple-400 to-purple-600',
                minPoints: businessSettings.loyaltyProgram.tiers.platinum.minPoints,
                discount: businessSettings.loyaltyProgram.tiers.platinum.discount,
                benefits: [
                  'Todos los beneficios de Oro',
                  '15% de descuento permanente',
                  'Servicio gratuito al año',
                  'Atención prioritaria 24/7',
                  'Invitación a eventos exclusivos',
                  'Cupón de cumpleaños (25%)',
                ],
              },
            ].map((tier) => (
              <Card key={tier.tier} className={`p-6 bg-gradient-to-br ${tier.color} text-white`}>
                <div className="text-5xl mb-4">{tier.icon}</div>
                <h2 className="text-2xl font-bold mb-2">{tier.name}</h2>
                <p className="opacity-90 mb-4">
                  Desde {tier.minPoints.toLocaleString()} puntos
                </p>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4">
                  <p className="text-3xl font-bold">{tier.discount}%</p>
                  <p className="text-sm opacity-90">Descuento Permanente</p>
                </div>

                <div className="space-y-2">
                  {tier.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Campañas de Fidelización */}
        <TabsContent value="campanas" className="space-y-6">
          <CampaignsDashboard onCreateCampaign={() => setShowCampaignDialog(true)} />
        </TabsContent>

        {/* Tab: Configuración */}
        <TabsContent value="configuracion" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Configuración del Programa</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Acumulación de Puntos</h3>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    value={businessSettings.loyaltyProgram.pointsPerCurrency}
                    className="w-32"
                    disabled
                  />
                  <span className="text-muted-foreground">
                    puntos por cada S/ 1 gastado
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Umbrales de Tier</h3>
                <div className="space-y-3">
                  {[
                    { tier: 'bronze', label: '🥉 Bronce', points: businessSettings.loyaltyProgram.tiers.bronze.minPoints },
                    { tier: 'silver', label: '🥈 Plata', points: businessSettings.loyaltyProgram.tiers.silver.minPoints },
                    { tier: 'gold', label: '🥇 Oro', points: businessSettings.loyaltyProgram.tiers.gold.minPoints },
                    { tier: 'platinum', label: '💎 Platino', points: businessSettings.loyaltyProgram.tiers.platinum.minPoints },
                  ].map((t) => (
                    <div key={t.tier} className="flex items-center gap-4">
                      <span className="w-32">{t.label}</span>
                      <Input
                        type="number"
                        value={t.points}
                        className="w-32"
                        disabled
                      />
                      <span className="text-muted-foreground">puntos mínimos</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Descuentos por Tier</h3>
                <div className="space-y-3">
                  {[
                    { tier: 'bronze', label: '🥉 Bronce', discount: businessSettings.loyaltyProgram.tiers.bronze.discount },
                    { tier: 'silver', label: '🥈 Plata', discount: businessSettings.loyaltyProgram.tiers.silver.discount },
                    { tier: 'gold', label: '🥇 Oro', discount: businessSettings.loyaltyProgram.tiers.gold.discount },
                    { tier: 'platinum', label: '💎 Platino', discount: businessSettings.loyaltyProgram.tiers.platinum.discount },
                  ].map((t) => (
                    <div key={t.tier} className="flex items-center gap-4">
                      <span className="w-32">{t.label}</span>
                      <Input
                        type="number"
                        value={t.discount}
                        className="w-32"
                        disabled
                      />
                      <span className="text-muted-foreground">% de descuento</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo: Crear Cupón */}
      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-purple-600" />
              Crear Nuevo Cupón
            </DialogTitle>
            <DialogDescription>
              Crea un cupón de descuento para tus clientes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Código del Cupón */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-code">Código del Cupón *</Label>
                <Input
                  id="coupon-code"
                  placeholder="Ej: SUMMER2024"
                  value={couponData.code}
                  onChange={(e) => setCouponData({ ...couponData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-type">Tipo de Descuento *</Label>
                <Select
                  value={couponData.type}
                  onValueChange={(value: 'percentage' | 'fixed') =>
                    setCouponData({ ...couponData, type: value })
                  }
                >
                  <SelectTrigger id="coupon-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Porcentaje
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Monto Fijo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="coupon-description">Descripción *</Label>
              <Textarea
                id="coupon-description"
                placeholder="Ej: Descuento especial de verano para todos los servicios"
                value={couponData.description}
                onChange={(e) => setCouponData({ ...couponData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Valor y Restricciones */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-value">
                  {couponData.type === 'percentage' ? 'Porcentaje (%)' : 'Monto (S/)'} *
                </Label>
                <Input
                  id="coupon-value"
                  type="number"
                  min="0"
                  max={couponData.type === 'percentage' ? 100 : undefined}
                  placeholder={couponData.type === 'percentage' ? '15' : '50'}
                  value={couponData.value || ''}
                  onChange={(e) => setCouponData({ ...couponData, value: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-min">Compra Mínima (S/)</Label>
                <Input
                  id="coupon-min"
                  type="number"
                  min="0"
                  placeholder="100"
                  value={couponData.minPurchase || ''}
                  onChange={(e) => setCouponData({ ...couponData, minPurchase: parseFloat(e.target.value) || 0 })}
                />
              </div>

              {couponData.type === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="coupon-max">Descuento Máx (S/)</Label>
                  <Input
                    id="coupon-max"
                    type="number"
                    min="0"
                    placeholder="200"
                    value={couponData.maxDiscount || ''}
                    onChange={(e) => setCouponData({ ...couponData, maxDiscount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-start">Fecha de Inicio</Label>
                <Input
                  id="coupon-start"
                  type="date"
                  value={couponData.startDate}
                  onChange={(e) => setCouponData({ ...couponData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-end">Fecha de Expiración</Label>
                <Input
                  id="coupon-end"
                  type="date"
                  value={couponData.endDate}
                  onChange={(e) => setCouponData({ ...couponData, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Usos Máximos y Tier Required */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coupon-uses">Usos Máximos</Label>
                <Input
                  id="coupon-uses"
                  type="number"
                  min="0"
                  placeholder="100"
                  value={couponData.maxUses || ''}
                  onChange={(e) => setCouponData({ ...couponData, maxUses: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">Dejar en 0 para ilimitado</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-tier">Tier Requerido (Opcional)</Label>
                <Select
                  value={couponData.loyaltyTierRequired}
                  onValueChange={(value: 'all' | 'bronze' | 'silver' | 'gold' | 'platinum') =>
                    setCouponData({ ...couponData, loyaltyTierRequired: value })
                  }
                >
                  <SelectTrigger id="coupon-tier">
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los clientes</SelectItem>
                    <SelectItem value="bronze">🥉 Bronce o superior</SelectItem>
                    <SelectItem value="silver">🥈 Plata o superior</SelectItem>
                    <SelectItem value="gold">🥇 Oro o superior</SelectItem>
                    <SelectItem value="platinum">💎 Solo Platino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vista Previa */}
            {couponData.code && couponData.value > 0 && (
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <h4 className="font-semibold mb-2">Vista Previa:</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold text-lg">{couponData.code}</p>
                    <p className="text-sm text-muted-foreground">{couponData.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      {couponData.type === 'percentage' ? `${couponData.value}% OFF` : `S/ ${couponData.value} OFF`}
                    </p>
                    {couponData.minPurchase > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Compra mín: S/ {couponData.minPurchase}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCouponDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCoupon} className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Gift className="h-4 w-4 mr-2" />
              Crear Cupón
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo: Nueva Campaña */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Crear Nueva Campaña
            </DialogTitle>
            <DialogDescription>
              Crea una campaña de marketing automática para tus clientes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nombre de la Campaña */}
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Nombre de la Campaña *</Label>
              <Input
                id="campaign-name"
                placeholder="Ej: Campaña de Reactivación Verano 2024"
                value={campaignData.name}
                onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="campaign-description">Descripción *</Label>
              <Textarea
                id="campaign-description"
                placeholder="Describe el objetivo de esta campaña..."
                value={campaignData.description}
                onChange={(e) => setCampaignData({ ...campaignData, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Tipo de Campaña */}
            <div className="space-y-2">
              <Label htmlFor="campaign-type">Tipo de Campaña *</Label>
              <Select
                value={campaignData.type}
                onValueChange={(value: 'promotional' | 'reactivation' | 'birthday' | 'loyalty') =>
                  setCampaignData({ ...campaignData, type: value })
                }
              >
                <SelectTrigger id="campaign-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Promocional
                    </div>
                  </SelectItem>
                  <SelectItem value="reactivation">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Reactivación
                    </div>
                  </SelectItem>
                  <SelectItem value="birthday">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Cumpleaños
                    </div>
                  </SelectItem>
                  <SelectItem value="loyalty">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Fidelización
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target: Tiers */}
            <div className="space-y-2">
              <Label>Clientes Target (Tiers)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'bronze', label: '🥉 Bronce' },
                  { value: 'silver', label: '🥈 Plata' },
                  { value: 'gold', label: '🥇 Oro' },
                  { value: 'platinum', label: '💎 Platino' },
                ].map((tier) => (
                  <Card
                    key={tier.value}
                    className={`p-3 cursor-pointer transition-all ${
                      campaignData.targetTiers.includes(tier.value)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                    onClick={() => {
                      const newTiers = campaignData.targetTiers.includes(tier.value)
                        ? campaignData.targetTiers.filter((t) => t !== tier.value)
                        : [...campaignData.targetTiers, tier.value];
                      setCampaignData({ ...campaignData, targetTiers: newTiers });
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{tier.label}</span>
                      {campaignData.targetTiers.includes(tier.value) && (
                        <Badge className="bg-blue-500">Seleccionado</Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selecciona uno o varios tiers. Si no seleccionas ninguno, se envía a todos.
              </p>
            </div>

            {/* Filtro por inactividad (solo para reactivación) */}
            {campaignData.type === 'reactivation' && (
              <div className="space-y-2">
                <Label htmlFor="campaign-inactive">Inactivos desde hace (días)</Label>
                <Input
                  id="campaign-inactive"
                  type="number"
                  min="0"
                  placeholder="60"
                  value={campaignData.lastVisitDaysAgo || ''}
                  onChange={(e) =>
                    setCampaignData({ ...campaignData, lastVisitDaysAgo: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Solo clientes sin visitas en los últimos X días
                </p>
              </div>
            )}

            {/* Fecha Programada */}
            <div className="space-y-2">
              <Label htmlFor="campaign-date">Fecha de Envío</Label>
              <Input
                id="campaign-date"
                type="datetime-local"
                value={campaignData.scheduledDate}
                onChange={(e) => setCampaignData({ ...campaignData, scheduledDate: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Dejar vacío para envío inmediato
              </p>
            </div>

            {/* Mensaje */}
            <div className="space-y-2">
              <Label htmlFor="campaign-message">Mensaje de la Campaña *</Label>
              <Textarea
                id="campaign-message"
                placeholder="Ej: ¡Hola {nombre}! Te extrañamos 😢 Vuelve con nosotros y obtén un 20% de descuento en tu próxima visita. ¡Tu mascota lo merece! 🐾"
                value={campaignData.message}
                onChange={(e) => setCampaignData({ ...campaignData, message: e.target.value })}
                rows={5}
              />
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>Variables disponibles:</span>
                <code>{'{nombre}'}</code>
                <code>{'{mascota}'}</code>
                <code>{'{puntos}'}</code>
                <code>{'{tier}'}</code>
              </div>
            </div>

            {/* Estimación de alcance */}
            {campaignData.name && (
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <h4 className="font-semibold mb-2">Estimación de Alcance:</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Target</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(() => {
                        let count = clients.length;
                        if (campaignData.targetTiers.length > 0) {
                          count = clients.filter((c) => campaignData.targetTiers.includes(c.loyaltyTier)).length;
                        }
                        if (campaignData.type === 'reactivation' && campaignData.lastVisitDaysAgo > 0) {
                          const cutoffDate = new Date();
                          cutoffDate.setDate(cutoffDate.getDate() - campaignData.lastVisitDaysAgo);
                          count = clients.filter((c) => {
                            const lastVisit = c.pets[0]?.appointmentHistory?.[0]?.date;
                            return lastVisit && new Date(lastVisit) < cutoffDate;
                          }).length;
                        }
                        return count;
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground">Clientes</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conversión Est.</p>
                    <p className="text-2xl font-bold text-green-600">
                      {campaignData.type === 'birthday' ? '85%' : campaignData.type === 'loyalty' ? '60%' : campaignData.type === 'promotional' ? '40%' : '25%'}
                    </p>
                    <p className="text-xs text-muted-foreground">Tasa esperada</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Costo Est.</p>
                    <p className="text-2xl font-bold text-purple-600">
                      S/ {(() => {
                        let count = clients.length;
                        if (campaignData.targetTiers.length > 0) {
                          count = clients.filter((c) => campaignData.targetTiers.includes(c.loyaltyTier)).length;
                        }
                        return (count * 0.5).toFixed(2); // S/ 0.50 por SMS
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground">WhatsApp/SMS</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCampaign} className="bg-gradient-to-r from-blue-600 to-cyan-600">
              <Sparkles className="h-4 w-4 mr-2" />
              Crear Campaña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}