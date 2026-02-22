import { useState, useMemo } from 'react';
import { Users, TrendingUp, DollarSign, PieChart as PieChartIcon, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useSegmentacion } from './useSegmentacion';
import ConfiguracionSegmentacion from './ConfiguracionSegmentacion';

interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  mascotas: number;
  mascotasActivas: number;
  categoria?: 'oro' | 'bronce' | 'plata';
  gastoMensual?: number;
  ultimaCita?: string;
}

interface SegmentacionAutomaticaProps {
  clientes?: Cliente[];
  onConfiguracionClick?: () => void;
}

export default function SegmentacionAutomatica({ clientes = [], onConfiguracionClick }: SegmentacionAutomaticaProps) {
  const { config, obtenerDistribucion } = useSegmentacion();
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);

  // Calcular distribución
  const distribucion = useMemo(() => {
    return obtenerDistribucion(clientes);
  }, [clientes, obtenerDistribucion]);

  // Datos para gráfica de pie
  const dataPieChart = useMemo(() => [
    {
      nombre: config.categorias.find(c => c.id === 'oro')?.nombre || 'Oro',
      cantidad: distribucion.oro.cantidad,
      porcentaje: distribucion.oro.porcentaje,
      color: config.categorias.find(c => c.id === 'oro')?.color || '#FFD700',
      ingresos: distribucion.oro.ingresos
    },
    {
      nombre: config.categorias.find(c => c.id === 'bronce')?.nombre || 'Bronce',
      cantidad: distribucion.bronce.cantidad,
      porcentaje: distribucion.bronce.porcentaje,
      color: config.categorias.find(c => c.id === 'bronce')?.color || '#FF6B35',
      ingresos: distribucion.bronce.ingresos
    },
    {
      nombre: config.categorias.find(c => c.id === 'plata')?.nombre || 'Plata',
      cantidad: distribucion.plata.cantidad,
      porcentaje: distribucion.plata.porcentaje,
      color: config.categorias.find(c => c.id === 'plata')?.color || '#9E9E9E',
      ingresos: distribucion.plata.ingresos
    }
  ], [config, distribucion]);

  // Datos para gráfica de barras
  const dataBarChart = useMemo(() => [
    {
      categoria: config.categorias.find(c => c.id === 'oro')?.nombre || 'Oro',
      clientes: distribucion.oro.cantidad,
      ingresos: distribucion.oro.ingresos,
      color: config.categorias.find(c => c.id === 'oro')?.color || '#FFD700'
    },
    {
      categoria: config.categorias.find(c => c.id === 'bronce')?.nombre || 'Bronce',
      clientes: distribucion.bronce.cantidad,
      ingresos: distribucion.bronce.ingresos,
      color: config.categorias.find(c => c.id === 'bronce')?.color || '#FF6B35'
    },
    {
      categoria: config.categorias.find(c => c.id === 'plata')?.nombre || 'Plata',
      clientes: distribucion.plata.cantidad,
      ingresos: distribucion.plata.ingresos,
      color: config.categorias.find(c => c.id === 'plata')?.color || '#9E9E9E'
    }
  ], [config, distribucion]);

  if (mostrarConfiguracion) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => setMostrarConfiguracion(false)}
          className="mb-4"
        >
          ← Volver a Vista de Segmentación
        </Button>
        <ConfiguracionSegmentacion clientes={clientes} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl flex items-center gap-3">
            <Users className="size-7 text-purple-600" />
            Segmentación Automática de Clientes
          </h2>
          <p className="text-gray-600 mt-1">
            Categorización automática basada en mascotas activas
          </p>
        </div>

        <Button onClick={() => setMostrarConfiguracion(true)}>
          <SettingsIcon className="size-4 mr-2" />
          Configurar Segmentación
        </Button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-3xl mt-1">{distribucion.total}</p>
              </div>
              <Users className="size-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800">
                  {config.categorias.find(c => c.id === 'oro')?.icono} {config.categorias.find(c => c.id === 'oro')?.nombre}
                </p>
                <p className="text-3xl mt-1 text-yellow-900">{distribucion.oro.cantidad}</p>
                <p className="text-xs text-yellow-700 mt-1">{distribucion.oro.porcentaje}% del total</p>
              </div>
              <div className="size-12 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xl">
                {config.categorias.find(c => c.id === 'oro')?.icono}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <p className="text-xs text-yellow-700">
                {config.categorias.find(c => c.id === 'oro')?.mascotasMin}+ mascotas • {config.categorias.find(c => c.id === 'oro')?.descuento}% descuento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-800">
                  {config.categorias.find(c => c.id === 'bronce')?.icono} {config.categorias.find(c => c.id === 'bronce')?.nombre}
                </p>
                <p className="text-3xl mt-1 text-orange-900">{distribucion.bronce.cantidad}</p>
                <p className="text-xs text-orange-700 mt-1">{distribucion.bronce.porcentaje}% del total</p>
              </div>
              <div className="size-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl">
                {config.categorias.find(c => c.id === 'bronce')?.icono}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-orange-200">
              <p className="text-xs text-orange-700">
                {config.categorias.find(c => c.id === 'bronce')?.mascotasMin}-{config.categorias.find(c => c.id === 'bronce')?.mascotasMax} mascotas • {config.categorias.find(c => c.id === 'bronce')?.descuento}% descuento
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800">
                  {config.categorias.find(c => c.id === 'plata')?.icono} {config.categorias.find(c => c.id === 'plata')?.nombre}
                </p>
                <p className="text-3xl mt-1 text-gray-900">{distribucion.plata.cantidad}</p>
                <p className="text-xs text-gray-700 mt-1">{distribucion.plata.porcentaje}% del total</p>
              </div>
              <div className="size-12 rounded-full bg-gray-400 flex items-center justify-center text-white text-xl">
                {config.categorias.find(c => c.id === 'plata')?.icono}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-700">
                1 mascota • {config.categorias.find(c => c.id === 'plata')?.descuento}% descuento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Barras de progreso */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Distribución Actual</CardTitle>
            <CardDescription>Porcentaje de clientes por categoría</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm flex items-center gap-2">
                  {config.categorias.find(c => c.id === 'oro')?.icono} {config.categorias.find(c => c.id === 'oro')?.nombre}
                </span>
                <span className="text-sm">{distribucion.oro.porcentaje}%</span>
              </div>
              <Progress 
                value={distribucion.oro.porcentaje} 
                className="h-3"
                style={{ 
                  backgroundColor: '#FFF9C4',
                  ['--progress-background' as any]: config.categorias.find(c => c.id === 'oro')?.color
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {distribucion.oro.cantidad} clientes • S/ {distribucion.oro.ingresos.toLocaleString()}/mes
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm flex items-center gap-2">
                  {config.categorias.find(c => c.id === 'bronce')?.icono} {config.categorias.find(c => c.id === 'bronce')?.nombre}
                </span>
                <span className="text-sm">{distribucion.bronce.porcentaje}%</span>
              </div>
              <Progress 
                value={distribucion.bronce.porcentaje} 
                className="h-3"
                style={{ 
                  backgroundColor: '#FFE0B2',
                  ['--progress-background' as any]: config.categorias.find(c => c.id === 'bronce')?.color
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {distribucion.bronce.cantidad} clientes • S/ {distribucion.bronce.ingresos.toLocaleString()}/mes
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm flex items-center gap-2">
                  {config.categorias.find(c => c.id === 'plata')?.icono} {config.categorias.find(c => c.id === 'plata')?.nombre}
                </span>
                <span className="text-sm">{distribucion.plata.porcentaje}%</span>
              </div>
              <Progress 
                value={distribucion.plata.porcentaje} 
                className="h-3"
                style={{ 
                  backgroundColor: '#F5F5F5',
                  ['--progress-background' as any]: config.categorias.find(c => c.id === 'plata')?.color
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                {distribucion.plata.cantidad} clientes • S/ {distribucion.plata.ingresos.toLocaleString()}/mes
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Ingresos/mes</span>
                <span className="text-xl">S/ {distribucion.totalIngresos.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfica de Pie */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visualización de Segmentación</CardTitle>
            <CardDescription>Distribución gráfica de clientes e ingresos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dataPieChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombre, cantidad, porcentaje }) => `${nombre}: ${cantidad} (${porcentaje}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {dataPieChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: string, props: any) => {
                    return [
                      `${value} clientes (S/ ${props.payload.ingresos.toLocaleString()})`,
                      props.payload.nombre
                    ];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica de ingresos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="size-5 text-green-600" />
            Análisis de Ingresos por Categoría
          </CardTitle>
          <CardDescription>
            Comparativa de clientes vs ingresos mensuales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataBarChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="clientes" fill="#8884d8" name="Clientes">
                {dataBarChart.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Bar yAxisId="right" dataKey="ingresos" fill="#82ca9d" name="Ingresos (S/)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-blue-500 flex items-center justify-center">
                <TrendingUp className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-800">Categoría Principal</p>
                <p className="text-xl text-blue-900">
                  {distribucion.bronce.porcentaje > distribucion.oro.porcentaje && distribucion.bronce.porcentaje > distribucion.plata.porcentaje
                    ? config.categorias.find(c => c.id === 'bronce')?.nombre
                    : distribucion.oro.porcentaje > distribucion.plata.porcentaje
                    ? config.categorias.find(c => c.id === 'oro')?.nombre
                    : config.categorias.find(c => c.id === 'plata')?.nombre}
                </p>
                <p className="text-xs text-blue-700">
                  {Math.max(distribucion.oro.porcentaje, distribucion.bronce.porcentaje, distribucion.plata.porcentaje)}% de tus clientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-green-500 flex items-center justify-center">
                <DollarSign className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-800">Mayor Ingreso</p>
                <p className="text-xl text-green-900">
                  {distribucion.bronce.ingresos > distribucion.oro.ingresos && distribucion.bronce.ingresos > distribucion.plata.ingresos
                    ? config.categorias.find(c => c.id === 'bronce')?.nombre
                    : distribucion.oro.ingresos > distribucion.plata.ingresos
                    ? config.categorias.find(c => c.id === 'oro')?.nombre
                    : config.categorias.find(c => c.id === 'plata')?.nombre}
                </p>
                <p className="text-xs text-green-700">
                  S/ {Math.max(distribucion.oro.ingresos, distribucion.bronce.ingresos, distribucion.plata.ingresos).toLocaleString()}/mes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-purple-500 flex items-center justify-center">
                <Users className="size-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-800">Promedio por Cliente</p>
                <p className="text-xl text-purple-900">
                  S/ {distribucion.total > 0 ? Math.round(distribucion.totalIngresos / distribucion.total) : 0}
                </p>
                <p className="text-xs text-purple-700">
                  gasto mensual promedio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
