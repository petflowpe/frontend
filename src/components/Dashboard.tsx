import { Calendar, Users, DollarSign, Car, TrendingUp, Clock, Package, Shield, Bell, MapPin, Activity, Star, Zap, ChevronRight, BarChart3, PieChart } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell, Pie, BarChart, Bar } from 'recharts';
import { useAppointments } from '../hooks/useAppointments';
import { useEffect } from 'react';

export function Dashboard() {
  const { appointments: todaysAppointments, refreshAppointments, loading } = useAppointments();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    // Optimize: Fetch ONLY today's appointments from server
    refreshAppointments({ date: today });
  }, [refreshAppointments]);

  const stats = [
    {
      title: 'Citas Hoy',
      value: loading ? '...' : todaysAppointments.length.toString(),
      icon: Calendar,
      change: '+2.5%', // Mock change for now
      changeType: 'positive',
      target: 15,
      progress: Math.min((todaysAppointments.length / 15) * 100, 100)
    },
    {
      title: 'Clientes Activos',
      value: '248',
      icon: Users,
      change: '+12.3%',
      changeType: 'positive',
      target: 300,
      progress: 83
    },
    {
      title: 'Ingresos del Mes',
      value: '8.450€',
      icon: DollarSign,
      change: '+18.2%',
      changeType: 'positive',
      target: 12000,
      progress: 70
    },
    {
      title: 'Vehículos en Ruta',
      value: '3',
      icon: Car,
      change: 'Normal',
      changeType: 'neutral',
      target: 3,
      progress: 100
    }
  ];

  // Datos para gráficos del dashboard
  const revenueData = [
    { day: 'Lun', revenue: 1200, appointments: 8 },
    { day: 'Mar', revenue: 1450, appointments: 10 },
    { day: 'Mié', revenue: 980, appointments: 7 },
    { day: 'Jue', revenue: 1650, appointments: 12 },
    { day: 'Vie', revenue: 1890, appointments: 14 },
    { day: 'Sáb', revenue: 2100, appointments: 15 },
    { day: 'Dom', revenue: 1200, appointments: 8 }
  ];

  const serviceDistribution = [
    { name: 'Baño Completo', value: 35, color: '#4f46e5' },
    { name: 'Corte + Baño', value: 28, color: '#06b6d4' },
    { name: 'Solo Corte', value: 20, color: '#10b981' },
    { name: 'Tratamientos', value: 17, color: '#f59e0b' }
  ];

  const recentAppointments = todaysAppointments.slice(0, 5).map(apt => ({
    id: apt.id,
    client: apt.client || apt.clientName || 'Cliente',
    pet: `${apt.pet || apt.petName || 'Mascota'} (${apt.breed || apt.petBreed || 'Mestizo'})`,
    time: apt.time,
    service: apt.serviceType || 'Servicio General',
    status: apt.status === 'pending' ? 'Pendiente' : apt.status === 'confirmed' ? 'Confirmado' : 'En progreso',
    groomer: apt.groomer || 'Por asignar'
  }));

  // Datos de ingresos por vehículo
  const vehicleRevenueData = [
    { name: 'Móvil 1\nABC-123', ingresos: 188.50, costos: 74.00, utilidad: 114.50 },
    { name: 'Móvil 2\nXYZ-789', ingresos: 90.00, costos: 37.00, utilidad: 53.00 },
    { name: 'Móvil 3\nDEF-456', ingresos: 75.00, costos: 30.00, utilidad: 45.00 },
    { name: 'Tienda\nPrincipal', ingresos: 121.97, costos: 82.00, utilidad: 39.97 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Panel de Control SmartPet
          </h1>
          <p className="text-muted-foreground text-lg">
            Resumen de actividades del {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Reportes
          </Button>
          <Button variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            Ver Rutas
          </Button>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Stats Grid with Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 animate-slide-up card-hover" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className={`text-sm flex items-center mt-1 font-medium ${
                    stat.changeType === 'positive' ? 'text-emerald-600' : 
                    stat.changeType === 'negative' ? 'text-red-500' : 'text-muted-foreground'
                  }`}>
                    {stat.changeType === 'positive' && <TrendingUp className="h-4 w-4 mr-1" />}
                    {stat.change}
                  </p>
                </div>
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center shadow-lg ${
                  index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  index === 1 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  index === 2 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                  'bg-gradient-to-br from-orange-500 to-orange-600'
                }`}>
                  <IconComponent className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progreso</span>
                  <span>{stat.progress}%</span>
                </div>
                <Progress value={stat.progress} className="h-2" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alertas y Recordatorios */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="p-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800 dark:text-orange-200">Stock Bajo</h3>
            </div>
            <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">3</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-orange-700 dark:text-orange-300">Royal Canin Adult</span>
              <span className="font-medium text-orange-800 dark:text-orange-200">2 unidades</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-700 dark:text-orange-300">Shampoo Antipulgas</span>
              <span className="font-medium text-orange-800 dark:text-orange-200">1 unidad</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-700 dark:text-orange-300">Juguete Kong</span>
              <span className="font-medium text-orange-800 dark:text-orange-200">5 unidades</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3 border-orange-300 text-orange-700 hover:bg-orange-100">
            Ver Inventario
          </Button>
        </Card>

        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">Tratamientos Vencidos</h3>
            </div>
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">2</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-red-700 dark:text-red-300">Luna - Antipulgas</span>
              <span className="font-medium text-red-800 dark:text-red-200">5 días</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-700 dark:text-red-300">Max - Desparasitación</span>
              <span className="font-medium text-red-800 dark:text-red-200">2 días</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3 border-red-300 text-red-700 hover:bg-red-100">
            Ver Tratamientos
          </Button>
        </Card>

        <Card className="p-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Próximos Recordatorios</h3>
            </div>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">4</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-700 dark:text-blue-300">Rocky - Vacuna Anual</span>
              <span className="font-medium text-blue-800 dark:text-blue-200">15 días</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700 dark:text-blue-300">Bella - Compra Alimento</span>
              <span className="font-medium text-blue-800 dark:text-blue-200">8 días</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3 border-blue-300 text-blue-700 hover:bg-blue-100">
            Ver Todos
          </Button>
        </Card>

        <Card className="p-6 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">Estado de Flota</h3>
            </div>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">3 vehículos</Badge>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-purple-700 dark:text-purple-300">Activos</span>
              <span className="font-medium text-purple-800 dark:text-purple-200">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-700 dark:text-purple-300">En Mantenimiento</span>
              <span className="font-medium text-purple-800 dark:text-purple-200">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-700 dark:text-purple-300">Próximo Servicio</span>
              <span className="font-medium text-purple-800 dark:text-purple-200">4 días</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3 border-purple-300 text-purple-700 hover:bg-purple-100">
            Ver Flota
          </Button>
        </Card>
      </div>

      {/* Dashboard Widgets */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="appointments">Citas</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Ingresos Semanales</h3>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}€`, 'Ingresos']} />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Service Distribution */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Distribución de Servicios</h3>
                <Button variant="ghost" size="sm">
                  <PieChart className="h-4 w-4" />
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Ingresos por Vehículo */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  Ingresos por Vehículo/Punto de Venta
                </h3>
                <p className="text-sm text-muted-foreground">Comparativa de ingresos, costos y utilidad</p>
              </div>
              <Button variant="ghost" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vehicleRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" style={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} S/`, '']} />
                <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
                <Bar dataKey="costos" fill="#f97316" name="Costos" />
                <Bar dataKey="utilidad" fill="#3b82f6" name="Utilidad" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-muted-foreground">Satisfacción</p>
            </Card>
            <Card className="p-4 text-center">
              <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">92%</p>
              <p className="text-sm text-muted-foreground">Eficiencia</p>
            </Card>
            <Card className="p-4 text-center">
              <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">15min</p>
              <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
            </Card>
            <Card className="p-4 text-center">
              <MapPin className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">45km</p>
              <p className="text-sm text-muted-foreground">Distancia Diaria</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Rendimiento del Equipo</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ana Ruiz</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={95} className="w-20 h-2" />
                    <span className="text-sm font-medium">95%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Juan López</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={88} className="w-20 h-2" />
                    <span className="text-sm font-medium">88%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Carmen Silva</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={82} className="w-20 h-2" />
                    <span className="text-sm font-medium">82%</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Vehículos en Tiempo Real</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Van #001</span>
                  </div>
                  <Badge className="bg-green-600">Activo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Van #002</span>
                  </div>
                  <Badge className="bg-blue-600">En Ruta</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Van #003</span>
                  </div>
                  <Badge className="bg-orange-600">Mantenimiento</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Objetivos del Mes</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Ingresos</span>
                    <span className="text-sm">70%</span>
                  </div>
                  <Progress value={70} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">8,450€ / 12,000€</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Nuevos Clientes</span>
                    <span className="text-sm">83%</span>
                  </div>
                  <Progress value={83} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">25 / 30 clientes</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Satisfacción</span>
                    <span className="text-sm">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">4.8 / 5.0 estrellas</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Citas de Hoy</h3>
              <Button variant="outline" size="sm">Ver Todas</Button>
            </div>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.client}</p>
                      <p className="text-sm text-muted-foreground">{appointment.pet}</p>
                      <p className="text-xs text-muted-foreground">{appointment.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{appointment.time}</p>
                    <p className="text-sm text-muted-foreground">{appointment.groomer}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'En progreso' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'Confirmado' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Alertas y Recordatorios Mejorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="p-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200">Stock Bajo</h3>
                </div>
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">3</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-orange-700 dark:text-orange-300">Royal Canin Adult</span>
                  <span className="font-medium text-orange-800 dark:text-orange-200">2 unidades</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-700 dark:text-orange-300">Shampoo Antipulgas</span>
                  <span className="font-medium text-orange-800 dark:text-orange-200">1 unidad</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-700 dark:text-orange-300">Juguete Kong</span>
                  <span className="font-medium text-orange-800 dark:text-orange-200">5 unidades</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 border-orange-300 text-orange-700 hover:bg-orange-100">
                Ver Inventario
              </Button>
            </Card>

            <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-800 dark:text-red-200">Tratamientos Vencidos</h3>
                </div>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">2</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-red-700 dark:text-red-300">Luna - Antipulgas</span>
                  <span className="font-medium text-red-800 dark:text-red-200">5 días</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-700 dark:text-red-300">Max - Desparasitación</span>
                  <span className="font-medium text-red-800 dark:text-red-200">2 días</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 border-red-300 text-red-700 hover:bg-red-100">
                Ver Tratamientos
              </Button>
            </Card>

            <Card className="p-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">Próximos Recordatorios</h3>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">4</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300">Rocky - Vacuna Anual</span>
                  <span className="font-medium text-blue-800 dark:text-blue-200">15 días</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300">Bella - Compra Alimento</span>
                  <span className="font-medium text-blue-800 dark:text-blue-200">8 días</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 border-blue-300 text-blue-700 hover:bg-blue-100">
                Ver Todos
              </Button>
            </Card>

            <Card className="p-6 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">Estado de Flota</h3>
                </div>
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">3 vehículos</Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-purple-700 dark:text-purple-300">Activos</span>
                  <span className="font-medium text-purple-800 dark:text-purple-200">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-700 dark:text-purple-300">En Mantenimiento</span>
                  <span className="font-medium text-purple-800 dark:text-purple-200">1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-700 dark:text-purple-300">Próximo Servicio</span>
                  <span className="font-medium text-purple-800 dark:text-purple-200">4 días</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 border-purple-300 text-purple-700 hover:bg-purple-100">
                Ver Flota
              </Button>
            </Card>
          </div>

          {/* Acciones Rápidas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button className="h-16 flex-col">
                <Calendar className="h-6 w-6 mb-1" />
                <span className="text-sm">Nueva Cita</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Users className="h-6 w-6 mb-1" />
                <span className="text-sm">Nuevo Cliente</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <DollarSign className="h-6 w-6 mb-1" />
                <span className="text-sm">Procesar Pago</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <MapPin className="h-6 w-6 mb-1" />
                <span className="text-sm">Ver Rutas</span>
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}