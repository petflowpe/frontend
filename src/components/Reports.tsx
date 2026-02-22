import { useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Users, Calendar, Download, 
  Filter, FileText, MapPin, Truck, Shield, Star, Target, 
  TrendingDown, AlertCircle, Package, Stethoscope, Syringe,
  Printer
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

import { useInvoices } from '../hooks/useInvoices';
import { useInventory } from '../hooks/useInventory';
import { useClients } from '../hooks/useClients';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { useVehicles } from '../hooks/useVehicles';
import { formatDate } from '../utils/helpers';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function Reports() {
  // 1. Hooks de Data Real
  const { invoices } = useInvoices();
  const { products } = useInventory();
  const { clients } = useClients();
  const { records } = useMedicalRecords();
  const { vehicles } = useVehicles();

  // 2. Estado de Filtros
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Primer día del mes
    end: new Date().toISOString().split('T')[0] // Hoy
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // --- LOGICA DE FILTRADO Y PROCESAMIENTO ---

  // Filtro base: Facturas en rango
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (inv.estado === 'anulada' || !inv.fecha) return false;
      return inv.fecha >= dateRange.start && inv.fecha <= dateRange.end;
    });
  }, [invoices, dateRange]);

  // Filtro base: Registros médicos en rango
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      return rec.date >= dateRange.start && rec.date <= dateRange.end;
    });
  }, [records, dateRange]);

  // Filtro base: Clientes (creados en rango - simulado por ahora usando fecha de registro si existiera, sino todos)
  // Como no tenemos fecha de creación de cliente, usaremos el total activo para KPIs generales
  
  // --- CALCULOS FINANCIEROS ---
  
  const financialMetrics = useMemo(() => {
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const invoiceCount = filteredInvoices.length;
    const averageTicket = invoiceCount > 0 ? totalRevenue / invoiceCount : 0;
    
    // Agrupar por día para gráfico de línea
    const dailyData: Record<string, number> = {};
    filteredInvoices.forEach(inv => {
      dailyData[inv.fecha] = (dailyData[inv.fecha] || 0) + inv.total;
    });
    
    const chartData = Object.entries(dailyData)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Agrupar por método de pago (si existiera en la factura, asumimos distribución simulada basada en data real si no hay campo)
    // Asumiremos que tenemos el campo 'metodoPago' en la factura o lo simulamos
    const paymentMethods = filteredInvoices.reduce((acc, inv) => {
      const method = inv.formaPago || (inv as any).metodoPago || 'Efectivo';
      acc[method] = (acc[method] || 0) + inv.total;
      return acc;
    }, {} as Record<string, number>);

    const paymentChartData = Object.entries(paymentMethods).map(([name, value]) => ({ name, value }));

    return { totalRevenue, invoiceCount, averageTicket, chartData, paymentChartData };
  }, [filteredInvoices]);

  // --- CALCULOS DE SERVICIOS Y PRODUCTOS ---

  const salesByItem = useMemo(() => {
    const itemsStats: Record<string, { count: number, revenue: number, type: string }> = {};

    filteredInvoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        if (!itemsStats[item.descripcion]) {
          itemsStats[item.descripcion] = { count: 0, revenue: 0, type: item.tipo };
        }
        itemsStats[item.descripcion].count += item.cantidad;
        itemsStats[item.descripcion].revenue += item.total;
      });
    });

    const topServices = Object.entries(itemsStats)
      .filter(([_, data]) => data.type === 'servicio')
      .map(([name, data]) => ({ name, value: data.count, revenue: data.revenue }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const topProducts = Object.entries(itemsStats)
      .filter(([_, data]) => data.type === 'producto')
      .map(([name, data]) => ({ name, value: data.count, revenue: data.revenue }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { topServices, topProducts };
  }, [filteredInvoices]);

  // --- CALCULOS MEDICOS ---

  const medicalMetrics = useMemo(() => {
    const stats = {
      vaccine: 0,
      deworming: 0,
      flea: 0,
      consultation: 0,
      surgery: 0,
      other: 0
    };

    filteredRecords.forEach(rec => {
      if (stats[rec.type as keyof typeof stats] !== undefined) {
        stats[rec.type as keyof typeof stats]++;
      } else {
        stats.other++;
      }
    });

    const chartData = Object.entries(stats).map(([name, value]) => ({ 
      name: name === 'vaccine' ? 'Vacunas' : 
            name === 'deworming' ? 'Desparasitación' : 
            name === 'flea' ? 'Antipulgas' : 
            name === 'surgery' ? 'Cirugías' :
            name === 'consultation' ? 'Consultas' : 'Otros',
      value 
    })).filter(d => d.value > 0);

    return { total: filteredRecords.length, chartData };
  }, [filteredRecords]);

  // --- EXPORTACION ---

  const handleExport = () => {
    // Generar CSV simple de facturas filtradas
    const headers = ['Fecha', 'Cliente', 'Items', 'Total', 'Estado'];
    const rows = filteredInvoices.map(inv => [
      inv.fecha,
      inv.clienteNombre,
      (inv.items || []).map(i => `${i.cantidad}x ${i.descripcion}`).join('; '),
      inv.total.toFixed(2),
      inv.estado
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_${dateRange.start}_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Reporte descargado correctamente");
  };

  const handlePrint = () => {
    window.print();
  };

  // --- HANDLERS ---
  const handlePeriodChange = (val: string) => {
    setSelectedPeriod(val);
    const end = new Date();
    let start = new Date();

    if (val === 'today') {
      // Start is today
    } else if (val === 'week') {
      start.setDate(end.getDate() - 7);
    } else if (val === 'month') {
      start.setDate(1); // Primer día del mes
    } else if (val === 'year') {
      start.setMonth(0, 1); // Primer día del año
    }

    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in print:p-0">
      
      {/* Header (No imprimir en modo impresión estricto si se desea, pero útil como título) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-primary">Reportes y Analytics</h1>
          <p className="text-muted-foreground">Análisis de rendimiento basado en datos reales</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Últimos 7 días</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-md border">
            <Input
              type="date"
              className="border-none h-8 w-32 focus-visible:ring-0"
              value={dateRange.start}
              onChange={(e) => {
                setDateRange({ ...dateRange, start: e.target.value });
                setSelectedPeriod('custom');
              }}
            />
            <span className="text-gray-400">-</span>
            <Input
              type="date"
              className="border-none h-8 w-32 focus-visible:ring-0"
              value={dateRange.end}
              onChange={(e) => {
                setDateRange({ ...dateRange, end: e.target.value });
                setSelectedPeriod('custom');
              }}
            />
          </div>

          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-green-500 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Ingresos Totales</p>
              <h3 className="text-2xl font-bold">S/ {financialMetrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              <p className="text-xs text-muted-foreground">{financialMetrics.invoiceCount} transacciones</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Ticket Promedio</p>
              <h3 className="text-2xl font-bold">S/ {financialMetrics.averageTicket.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              <p className="text-xs text-muted-foreground">Por venta</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900 rounded-full">
              <Stethoscope className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Atenciones Médicas</p>
              <h3 className="text-2xl font-bold">{medicalMetrics.total}</h3>
              <p className="text-xs text-muted-foreground">En el periodo seleccionado</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
              <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Cartera Activa</p>
              <h3 className="text-2xl font-bold">{clients.length}</h3>
              <p className="text-xs text-muted-foreground">Clientes registrados</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="financial" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="financial">Finanzas</TabsTrigger>
          <TabsTrigger value="services">Servicios y Productos</TabsTrigger>
          <TabsTrigger value="medical">Médico</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>

        {/* --- PESTAÑA FINANCIERA --- */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-2 p-6">
              <h3 className="text-lg font-bold mb-4">Evolución de Ingresos</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <AreaChart data={financialMetrics.chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => formatDate(val)} 
                      fontSize={12}
                    />
                    <YAxis fontSize={12} tickFormatter={(val) => `S/${val}`} />
                    <Tooltip 
                      formatter={(value) => [`S/ ${value}`, 'Ingresos']}
                      labelFormatter={(label) => formatDate(label as string)}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Métodos de Pago</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <PieChart>
                    <Pie
                      data={financialMetrics.paymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {financialMetrics.paymentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `S/ ${val}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {financialMetrics.paymentChartData.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{entry.name}</span>
                      </div>
                      <span className="font-medium">S/ {entry.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* --- PESTAÑA SERVICIOS --- */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Top 5 Servicios
              </h3>
              <div className="space-y-4">
                {salesByItem.topServices.length > 0 ? (
                  salesByItem.topServices.map((service, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{service.name}</span>
                        <span>{service.value} realizados</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(service.value / salesByItem.topServices[0].value) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground text-right">S/ {service.revenue.toFixed(2)} generados</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No hay datos de servicios en este periodo</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-500" />
                Top 5 Productos
              </h3>
              <div className="space-y-4">
                {salesByItem.topProducts.length > 0 ? (
                  salesByItem.topProducts.map((prod, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{prod.name}</span>
                        <span>{prod.value} vendidos</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                        <div 
                          className="bg-purple-600 h-2.5 rounded-full" 
                          style={{ width: `${(prod.value / salesByItem.topProducts[0].value) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground text-right">S/ {prod.revenue.toFixed(2)} generados</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No hay datos de productos en este periodo</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* --- PESTAÑA MEDICA --- */}
        <TabsContent value="medical" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Distribución de Tratamientos</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                  <BarChart data={medicalMetrics.chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Registro Detallado</h3>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-gray-900">
                    <tr className="border-b">
                      <th className="text-left py-2">Fecha</th>
                      <th className="text-left py-2">Mascota</th>
                      <th className="text-left py-2">Tratamiento</th>
                      <th className="text-right py-2">Veterinario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map(rec => (
                        <tr key={rec.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-2">{formatDate(rec.date)}</td>
                          <td className="py-2">{rec.petName}</td>
                          <td className="py-2">{rec.name}</td>
                          <td className="text-right py-2 truncate max-w-[150px]">{rec.veterinarianName}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted-foreground">No hay registros médicos</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* --- PESTAÑA INVENTARIO --- */}
        <TabsContent value="inventory" className="space-y-6">
          <Card className="p-6">
             <h3 className="text-lg font-bold mb-4">Estado del Inventario</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="border-b">
                     <th className="text-left py-2">Producto</th>
                     <th className="text-left py-2">Categoría</th>
                     <th className="text-right py-2">Stock Actual</th>
                     <th className="text-right py-2">Mínimo</th>
                     <th className="text-right py-2">Valor Total</th>
                     <th className="text-center py-2">Estado</th>
                   </tr>
                 </thead>
                 <tbody>
                   {products.map(product => (
                     <tr key={product.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                       <td className="py-2 font-medium">{product.name}</td>
                       <td className="py-2">{product.category}</td>
                       <td className="py-2 text-right">{product.stock}</td>
                       <td className="py-2 text-right text-muted-foreground">{product.minStock}</td>
                       <td className="py-2 text-right">S/ {(product.price * product.stock).toFixed(2)}</td>
                       <td className="py-2 text-center">
                         {product.stock <= 0 ? (
                           <Badge variant="destructive">Agotado</Badge>
                         ) : product.stock <= product.minStock ? (
                           <Badge variant="outline" className="border-orange-500 text-orange-500 bg-orange-50">Bajo Stock</Badge>
                         ) : (
                           <Badge variant="outline" className="border-green-500 text-green-500 bg-green-50">OK</Badge>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}