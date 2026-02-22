import { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Users, DollarSign, Car, TrendingUp, Clock, Package, 
  Shield, Bell, MapPin, Activity, Star, Zap, ChevronRight, 
  BarChart3, PieChart, AlertTriangle, CheckCircle2, Plus, 
  Eye, ArrowUpRight, TrendingDown, Stethoscope, Syringe
} from 'lucide-react';
import { Sparkles, HeartPulse } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart as RechartsPieChart, Cell, Pie, BarChart, Bar, LineChart, Line 
} from 'recharts';
import { toast } from 'sonner';
import { useInventory } from '../hooks/useInventory';
import { useInvoices } from '../hooks/useInvoices';
import { useClients } from '../hooks/useClients';
import { useAppointments } from '../hooks/useAppointments';
import { useVehicles } from '../hooks/useVehicles';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { checkApiHealth } from '../utils/api/health';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

// Custom Tooltip para gráficos más elegante
const CustomTooltip = ({ active, payload, label, prefix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-mono font-medium">
              {prefix}{entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { products } = useInventory();
  const { invoices } = useInvoices();
  const { clients } = useClients();
  const { appointments } = useAppointments();
  const { vehicles } = useVehicles();
  const { records, getReminders } = useMedicalRecords();
  const { stats: serverStats, loading: statsLoading, error: statsError } = useDashboardStats(1, null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  useEffect(() => {
    checkApiHealth().then(setApiConnected);
  }, []);

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- CÁLCULOS DE MÉTRICAS (KPIs) ---
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const todayDate = new Date().toISOString().split('T')[0];

  const monthlyRevenue = useMemo(() => {
    return invoices
      .filter(inv => {
        if (!inv.fecha) return false;
        const [year, month] = inv.fecha.split('-').map(Number);
        return (month - 1) === currentMonth && year === currentYear && inv.estado !== 'anulada';
      })
      .reduce((sum, inv) => sum + inv.total, 0);
  }, [invoices, currentMonth, currentYear]);

  const todaysAppointments = useMemo(() => {
    return appointments.filter(apt => apt.date === todayDate);
  }, [appointments, todayDate]);

  const activeClientsCount = clients.filter(c => c.isActive).length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'busy' || v.status === 'active').length;

  // --- DATOS PARA GRÁFICOS ---
  const revenueData = useMemo(() => {
    const data = [];
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      
      const dailyRevenue = invoices
        .filter(inv => inv.fecha === dateStr && inv.estado !== 'anulada')
        .reduce((sum, inv) => sum + inv.total, 0);
        
      data.push({
        day: dayName,
        revenue: dailyRevenue,
        target: 1500
      });
    }
    return data;
  }, [invoices]);

  const serviceDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    const total = appointments.length;
    if (total === 0) return [];

    appointments.forEach(apt => {
      const service = apt.serviceType || 'Otros';
      distribution[service] = (distribution[service] || 0) + 1;
    });

    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];
    
    return Object.entries(distribution)
      .map(([name, count], index) => ({
        name,
        value: count, // Usar cuenta absoluta para el gráfico
        percent: Math.round((count / total) * 100),
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [appointments]);

  // --- LISTAS Y PROCESAMIENTO ---
  const vehiclesStatus = useMemo(() => {
    return vehicles.map(v => {
      const vehicleInvoices = invoices.filter(inv => inv.puntoVenta?.id === v.id);
      const ingresos = vehicleInvoices.reduce((sum, inv) => sum + inv.total, 0);
      
      let statusColor = 'bg-gray-100 text-gray-800 border-gray-200';
      let statusText = 'Inactivo';

      if (v.status === 'active') { statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'; statusText = 'Disponible'; }
      if (v.status === 'busy') { statusColor = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'; statusText = 'En Ruta'; }
      if (v.status === 'maintenance') { statusColor = 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'; statusText = 'Mantenimiento'; }

      return {
        ...v,
        displayName: `${v.name}`,
        displayStatus: statusText,
        statusClasses: statusColor,
        ingresos
      };
    });
  }, [vehicles, invoices]);

  const lowStockProducts = useMemo(() => {
    return products
      .filter(p => p.stock <= p.minStock)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 3)
      .map(p => ({
        name: p.name,
        stock: p.stock,
        min: p.minStock,
        urgency: p.stock === 0 ? 'critical' : 'high'
      }));
  }, [products]);

  const medicalReminders = useMemo(() => getReminders(), [records, getReminders]);
  
  const remindersStats = useMemo(() => {
     return {
       overdue: medicalReminders.filter(r => r.isOverdue).length,
       total: medicalReminders.length
     };
  }, [medicalReminders]);

  const handleQuickAction = (action: string) => {
    if (onNavigate) onNavigate(action);
    else toast.info(`Navegando a ${action}`);
  };

  const stats = [
    {
      title: 'Citas Hoy',
      value: (!statsLoading && !statsError ? serverStats.appointments_count : todaysAppointments.length).toString(),
      icon: Calendar,
      trend: statsError ? 'Datos locales' : 'Servidor',
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      borderColor: 'border-blue-100 dark:border-blue-800',
      action: 'appointments'
    },
    {
      title: 'Clientes Activos',
      value: (!statsLoading && !statsError ? serverStats.active_clients : activeClientsCount).toString(),
      icon: Users,
      trend: statsError ? 'Datos locales' : 'Servidor',
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/10',
      borderColor: 'border-emerald-100 dark:border-emerald-800',
      action: 'clients'
    },
    {
      title: 'Ingresos Mes',
      value: `S/ ${(!statsLoading && !statsError && serverStats.total_sales > 0 ? serverStats.total_sales : monthlyRevenue).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      trend: 'Facturación',
      color: 'from-violet-500 to-purple-600',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-50 dark:bg-violet-900/10',
      borderColor: 'border-violet-100 dark:border-violet-800',
      action: 'accounting'
    },
    {
      title: 'Flota Activa',
      value: `${activeVehiclesCount}/${vehicles.length}`,
      icon: Car,
      trend: 'Unidades en ruta',
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/10',
      borderColor: 'border-amber-100 dark:border-amber-800',
      action: 'vehicles'
    }
  ];

  return (
    <div className="px-3 py-4 sm:p-6 space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in pb-24 sm:pb-20 bg-background min-h-screen max-w-[1600px] mx-auto">
      
      {/* Header Premium - Hero Section (coherente con tema light y dark) */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 shadow-xl sm:shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-400/20 dark:bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-400/20 dark:bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-slate-200 text-xs font-medium border border-indigo-200/60 dark:border-slate-700">
                <Sparkles className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                <span>Panel de Control v2.1</span>
              </div>
              {apiConnected === true && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-300/50 dark:border-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  <span>Conectado al servidor</span>
                </div>
              )}
              {apiConnected === false && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-300/50 dark:border-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                  <span>Sin conexión al backend</span>
                </div>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-1 sm:mb-2 break-words">
              Hola, Equipo <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 dark:from-indigo-300 dark:via-cyan-300 dark:to-cyan-400">SmartPet</span> 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-2 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base font-medium">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500 dark:text-slate-400 shrink-0" />
              <span className="hidden sm:inline">{currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="sm:hidden">{currentTime.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-slate-500 mx-1 sm:mx-2" />
              {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            <Button 
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 min-h-[44px] h-11 sm:h-12 px-4 sm:px-6 rounded-xl font-semibold transition-all active:scale-[0.98] sm:hover:scale-105 text-sm sm:text-base touch-manipulation"
              onClick={() => handleQuickAction('reports')}
            >
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2 text-indigo-600 dark:text-slate-300 shrink-0" />
              <span className="hidden sm:inline">Ver Reportes</span>
              <span className="sm:hidden">Reportes</span>
            </Button>
            <Button 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20 min-h-[44px] h-11 sm:h-12 px-4 sm:px-8 rounded-xl font-bold transition-all active:scale-[0.98] sm:hover:scale-105 hover:shadow-indigo-500/50 text-sm sm:text-base touch-manipulation"
              onClick={() => handleQuickAction('appointments')}
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2 shrink-0" />
              <span className="hidden sm:inline">Nueva Cita</span>
              <span className="sm:hidden">Nueva Cita</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards Modernas - 2x2 en móvil, 4 cols en desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              onClick={() => handleQuickAction(stat.action)}
              className="group cursor-pointer transform active:scale-[0.98] sm:hover:-translate-y-1 transition-all duration-300 touch-manipulation"
            >
              <Card className="h-full border-0 shadow-md sm:shadow-lg sm:hover:shadow-2xl transition-all duration-300 bg-white dark:bg-slate-900 overflow-hidden relative rounded-xl sm:rounded-2xl ring-1 ring-gray-100 dark:ring-slate-700/50 min-h-[100px] sm:min-h-0">
                <div className={`absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full -mr-4 sm:-mr-6 -mt-4 sm:-mt-6 transition-all group-hover:scale-110`} />
                <div className="p-3 sm:p-4 md:p-6 relative z-10">
                  <div className="flex justify-between items-start mb-2 sm:mb-4 md:mb-6">
                    <div className={`p-2 sm:p-2.5 md:p-3.5 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                    </div>
                    <Badge variant="outline" className={`${stat.textColor} ${stat.borderColor} ${stat.bgColor} border font-semibold px-1.5 sm:px-2 md:px-3 py-0.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs md:text-sm hidden sm:inline-flex`}>
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter text-gray-900 dark:text-white mb-0.5 sm:mb-2 truncate sm:truncate-none">
                      {stat.value}
                    </h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wide">{stat.title}</p>
                  </div>
                </div>
                <div className={`h-1 sm:h-1.5 w-full bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-0 rounded-b-xl sm:rounded-b-2xl`} />
              </Card>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        
        {/* Columna Principal (Gráficos) */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6 md:space-y-8 min-w-0">
          
          {/* Gráfico de Ingresos */}
          <Card className="p-3 sm:p-4 md:p-6 border-0 shadow-lg sm:shadow-xl bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl ring-1 ring-gray-100 dark:ring-slate-700/50 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-base sm:text-xl">Rendimiento Financiero</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:ml-14">Ingresos vs Meta (Últimos 7 días)</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleQuickAction('reports')} className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium text-xs sm:text-sm">
                <span className="hidden sm:inline">Ver detalle</span>
                <span className="sm:hidden">Detalle</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Button>
            </div>
            <div className="h-[200px] sm:h-[260px] md:h-[280px] lg:h-[300px] w-full -mx-2 sm:mx-0">
              <ResponsiveContainer width="100%" height="100%" minHeight={180}>
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `S/ ${value}`}
                  />
                  <Tooltip content={<CustomTooltip prefix="S/ " />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    name="Ingresos"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#e5e7eb" 
                    strokeWidth={2}
                    strokeDasharray="4 4" 
                    dot={false}
                    name="Meta Diaria"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Gestión Operativa (Tabs) - scroll horizontal en móvil */}
          <Tabs defaultValue="appointments" className="w-full min-w-0">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 sm:mb-6 gap-3">
               <h3 className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-white shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  Gestión Operativa
                </h3>
              <TabsList className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm w-full sm:w-auto overflow-x-auto flex flex-nowrap justify-start sm:justify-center">
                <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none font-medium px-3 sm:px-4 py-2 whitespace-nowrap shrink-0 min-h-[40px] touch-manipulation">Agenda</TabsTrigger>
                <TabsTrigger value="fleet" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none font-medium px-3 sm:px-4 py-2 whitespace-nowrap shrink-0 min-h-[40px] touch-manipulation">Flota</TabsTrigger>
                <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none font-medium px-3 sm:px-4 py-2 whitespace-nowrap shrink-0 min-h-[40px] touch-manipulation">Servicios</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="appointments" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              {todaysAppointments.length > 0 ? (
                <div className="grid gap-3 sm:gap-4">
                  {todaysAppointments.map((apt) => (
                    <div 
                      key={apt.id} 
                      className="group flex items-center justify-between gap-3 p-3 sm:p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-sm hover:shadow-md active:scale-[0.99] transition-all cursor-pointer border-l-4 border-l-blue-500 min-h-[72px] touch-manipulation"
                      onClick={() => handleQuickAction('appointments')}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className="flex flex-col items-center justify-center h-11 w-14 sm:h-12 sm:w-16 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 font-bold text-xs sm:text-sm shrink-0">
                          {apt.time}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{apt.clientName}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                            {apt.petName} ({apt.petBreed})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs max-w-[80px] sm:max-w-none truncate">
                          {apt.serviceType}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed px-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Sin citas para hoy</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">La agenda está libre por el momento.</p>
                  <Button variant="outline" size="sm" className="min-h-[40px] touch-manipulation" onClick={() => handleQuickAction('appointments')}>
                    Programar Cita
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="fleet" className="mt-3 sm:mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {vehiclesStatus.map(v => (
                  <div key={v.id} className="p-3 sm:p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-sm flex flex-col justify-between hover:border-blue-300 active:scale-[0.99] transition-colors cursor-pointer touch-manipulation min-h-[100px]">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          {v.type === 'Moto' ? <Zap className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <Car className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{v.displayName}</h4>
                          <p className="text-xs text-muted-foreground">{v.plate}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`border ${v.statusClasses}`}>
                        {v.displayStatus}
                      </Badge>
                    </div>
                    <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Conductor</span>
                        <span className="font-medium truncate max-w-[120px]">{v.driverName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Caja chica</span>
                        <span className="font-bold text-emerald-600">S/ {v.ingresos.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="services" className="mt-3 sm:mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-xl border shadow-sm">
                <div className="h-[200px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <RechartsPieChart>
                      <Pie
                        data={serviceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        stroke="none"
                      >
                        {serviceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-2xl font-bold">{appointments.length}</span>
                     <span className="text-xs text-muted-foreground">Total Citas</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium mb-2">Servicios Top</h4>
                  {serviceDistribution.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }} />
                        <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 transition-colors">
                          {service.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">{service.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

        </div>

        {/* Columna Derecha (Alertas y Notificaciones) - orden correcto en móvil */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          
          {/* Card: Stock Crítico */}
          <Card className="border-0 shadow-lg sm:shadow-xl bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl ring-1 ring-gray-100 dark:ring-slate-700/50 overflow-hidden">
            <div className="p-4 sm:p-6">
              <h3 className="font-bold flex items-center gap-3 mb-6 text-lg">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${lowStockProducts.length > 0 ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/30' : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30'}`}>
                   <Package className="h-4 w-4 text-white" />
                </div>
                Inventario
              </h3>
              
              {lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {lowStockProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-500/20 group hover:border-orange-200 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                           <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                        </div>
                        <span className="text-sm font-semibold truncate text-gray-700 dark:text-gray-200">{p.name}</span>
                      </div>
                      <Badge variant="destructive" className="ml-2 whitespace-nowrap shadow-sm">
                        {p.stock} unid
                      </Badge>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 text-xs mt-2 font-medium" onClick={() => handleQuickAction('products')}>
                    Gestionar Inventario
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Todo en orden</p>
                  <p className="text-xs text-muted-foreground">Stock saludable</p>
                </div>
              )}
            </div>
          </Card>

          {/* Card: Salud y Tratamientos */}
          <Card className="border-0 shadow-lg sm:shadow-xl bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl ring-1 ring-gray-100 dark:ring-slate-700/50 overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-3 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <HeartPulse className="h-4 w-4 text-white" />
                  </div>
                  Salud
                </h3>
                <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-100 font-bold">
                  {remindersStats.total}
                </Badge>
              </div>

              <div className="space-y-3">
                {medicalReminders
                  .slice(0, 4)
                  .map((reminder, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => handleQuickAction('medical-notifications')}>
                      <div className={`mt-0.5 p-1.5 rounded-lg shadow-sm ${reminder.isOverdue ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                        {reminder.type === 'vaccine' ? <Syringe className="h-3.5 w-3.5" /> : <Stethoscope className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 transition-colors">{reminder.petName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{reminder.name}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${reminder.isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                        {reminder.isOverdue ? `${Math.abs(reminder.daysUntil)}d` : `${reminder.daysUntil}d`}
                      </span>
                    </div>
                  ))}
                  
                  {medicalReminders.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground py-4">No hay recordatorios urgentes</p>
                  )}
              </div>
              
              <Button variant="outline" className="w-full mt-4 text-xs" onClick={() => handleQuickAction('medical-notifications')}>
                Ver centro de notificaciones
              </Button>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}