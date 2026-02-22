import { useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Target, Award, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardEjecutivo() {
  const [periodo, setPeriodo] = useState('mes');

  // Datos de ejemplo
  const stats = {
    total_clientes: 537,
    clientes_nuevos_mes: 45,
    ingreso_mensual: 89450,
    citas_mes: 342,
    tasa_ocupacion: 78,
    satisfaccion: 4.6
  };

  const distribucionCategorias = [
    { nombre: 'Oro', cantidad: 89, porcentaje: 16.6, color: '#FFD700', ingresos: 42580 },
    { nombre: 'Bronce', cantidad: 348, porcentaje: 64.8, color: '#CD7F32', ingresos: 38920 },
    { nombre: 'Plata', cantidad: 100, porcentaje: 18.6, color: '#C0C0C0', ingresos: 7950 }
  ];

  const ingresosPorCategoria = [
    { categoria: 'Oro', ingresos: 42580, citas: 156, promedio: 273 },
    { categoria: 'Bronce', ingresos: 38920, citas: 168, promedio: 232 },
    { categoria: 'Plata', ingresos: 7950, citas: 18, promedio: 442 }
  ];

  const tendenciaMensual = [
    { mes: 'Ene', oro: 35, bronce: 250, plata: 85 },
    { mes: 'Feb', oro: 42, bronce: 268, plata: 92 },
    { mes: 'Mar', oro: 51, bronce: 285, plata: 95 },
    { mes: 'Abr', oro: 63, bronce: 312, plata: 98 },
    { mes: 'May', oro: 75, bronce: 335, plata: 100 },
    { mes: 'Jun', oro: 89, bronce: 348, plata: 100 }
  ];

  const rentabilidadZona = [
    { zona: 'Miraflores', clientes: 127, ingresos: 28450, avg: 224 },
    { zona: 'San Isidro', clientes: 95, ingresos: 22380, avg: 236 },
    { zona: 'Jesús María', clientes: 83, ingresos: 18920, avg: 228 },
    { zona: 'Surco', clientes: 112, ingresos: 19700, avg: 176 }
  ];

  const COLORS = {
    oro: '#FFD700',
    bronce: '#CD7F32',
    plata: '#C0C0C0'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3">
            <BarChart3 className="size-8" />
            Dashboard Ejecutivo
          </h1>
          <p className="text-gray-600 mt-2">
            Métricas clave de tu negocio y segmentación de clientes
          </p>
        </div>

        <Select value={periodo} onValueChange={setPeriodo}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hoy">Hoy</SelectItem>
            <SelectItem value="semana">Esta Semana</SelectItem>
            <SelectItem value="mes">Este Mes</SelectItem>
            <SelectItem value="trimestre">Trimestre</SelectItem>
            <SelectItem value="anio">Año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-3xl mt-1">{stats.total_clientes}</p>
                <p className="text-sm text-green-600 mt-1">
                  +{stats.clientes_nuevos_mes} este mes
                </p>
              </div>
              <Users className="size-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Mes</p>
                <p className="text-3xl mt-1">
                  S/ {stats.ingreso_mensual.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  +12% vs mes anterior
                </p>
              </div>
              <DollarSign className="size-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Citas Este Mes</p>
                <p className="text-3xl mt-1">{stats.citas_mes}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Ocupación: {stats.tasa_ocupacion}%
                </p>
              </div>
              <Calendar className="size-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfacción</p>
                <p className="text-3xl mt-1">{stats.satisfaccion} ⭐</p>
                <p className="text-sm text-green-600 mt-1">
                  Excelente
                </p>
              </div>
              <Award className="size-12 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con análisis detallados */}
      <Tabs defaultValue="segmentacion">
        <TabsList>
          <TabsTrigger value="segmentacion">Segmentación</TabsTrigger>
          <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          <TabsTrigger value="zonas">Zonas</TabsTrigger>
          <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
        </TabsList>

        {/* Tab: Segmentación */}
        <TabsContent value="segmentacion" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de categorías */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Clientes</CardTitle>
                <CardDescription>Por categoría de segmentación</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distribucionCategorias}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nombre, porcentaje }) => `${nombre}: ${porcentaje}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {distribucionCategorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {distribucionCategorias.map((cat) => (
                    <div key={cat.nombre} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: cat.color + '20' }}>
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span>{cat.nombre}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{cat.cantidad}</span>
                        <span className="text-sm text-gray-600 ml-2">({cat.porcentaje}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Análisis de valor */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Rentabilidad</CardTitle>
                <CardDescription>Ingresos por categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ingresosPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="ingresos" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-3">
                  {ingresosPorCategoria.map((cat) => (
                    <div key={cat.categoria} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span>{cat.categoria}</span>
                        <span className="text-green-600">S/ {cat.ingresos.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{cat.citas} citas</span>
                        <span>Promedio: S/ {cat.promedio}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insight clave */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <TrendingUp className="size-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-blue-900">🎯 Insight Clave</h4>
                  <p className="text-blue-800 mt-2">
                    Los <strong>clientes Bronce representan el 65% de tu base</strong> y generan el <strong>44% de tus ingresos totales</strong>.
                    Esta es tu categoría más valiosa. Estrategia recomendada: Programa de retención y upsell a Oro.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                      79% de participación en ingresos
                    </span>
                    <span className="px-3 py-1 bg-white border border-blue-300 text-blue-800 rounded-lg text-sm">
                      Ver estrategias →
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Ingresos */}
        <TabsContent value="ingresos" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Categoría (Último Semestre)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={ingresosPorCategoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#3b82f6" name="Ingresos (S/)" />
                  <Bar dataKey="citas" fill="#10b981" name="Cantidad de Citas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-600">Ticket Promedio</p>
                <p className="text-3xl mt-2">S/ 262</p>
                <p className="text-sm text-green-600 mt-1">+8% vs mes anterior</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-600">Cliente Más Valioso</p>
                <p className="text-3xl mt-2 text-yellow-600">Oro</p>
                <p className="text-sm text-gray-600 mt-1">S/ 273/cita promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-600">ROI Segmentación</p>
                <p className="text-3xl mt-2 text-green-600">+32%</p>
                <p className="text-sm text-gray-600 mt-1">vs clientes sin categoría</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Zonas */}
        <TabsContent value="zonas" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Rentabilidad por Zona</CardTitle>
              <CardDescription>Comparación de zonas geográficas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={rentabilidadZona} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="zona" type="category" />
                  <Tooltip />
                  <Bar dataKey="ingresos" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {rentabilidadZona.map((zona) => (
                  <div key={zona.zona} className="p-4 bg-gray-50 rounded-lg">
                    <h4>{zona.zona}</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Clientes:</span>
                        <span>{zona.clientes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ingresos:</span>
                        <span className="text-green-600">S/ {zona.ingresos.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Promedio/cliente:</span>
                        <span>S/ {zona.avg}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Tendencias */}
        <TabsContent value="tendencias" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolución de Categorías (6 meses)</CardTitle>
              <CardDescription>Crecimiento de cada categoría en el tiempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={tendenciaMensual}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="oro" stroke={COLORS.oro} strokeWidth={2} name="Oro" />
                  <Line type="monotone" dataKey="bronce" stroke={COLORS.bronce} strokeWidth={2} name="Bronce" />
                  <Line type="monotone" dataKey="plata" stroke={COLORS.plata} strokeWidth={2} name="Plata" />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-3 rounded-full bg-yellow-500" />
                      <span>Clientes Oro</span>
                    </div>
                    <p className="text-2xl">+155%</p>
                    <p className="text-sm text-gray-600">Crecimiento 6 meses</p>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-3 rounded-full bg-orange-700" />
                      <span>Clientes Bronce</span>
                    </div>
                    <p className="text-2xl">+39%</p>
                    <p className="text-sm text-gray-600">Crecimiento 6 meses</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-3 rounded-full bg-gray-400" />
                      <span>Clientes Plata</span>
                    </div>
                    <p className="text-2xl">+18%</p>
                    <p className="text-sm text-gray-600">Crecimiento 6 meses</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Predicción */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Target className="size-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-purple-900">📈 Proyección Próximo Mes</h4>
                  <p className="text-purple-800 mt-2">
                    Basado en la tendencia actual, se estima:
                  </p>
                  <ul className="mt-3 space-y-2 text-purple-800">
                    <li>• <strong>+8 clientes Oro</strong> (total proyectado: 97)</li>
                    <li>• <strong>+12 clientes Bronce</strong> (total proyectado: 360)</li>
                    <li>• <strong>Ingresos estimados: S/ 95,200</strong> (+6.4%)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alertas y Recomendaciones */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="size-5 text-amber-600" />
            Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-green-800">✅ Fortaleza:</h4>
            <p className="text-sm text-green-700 mt-1">
              Tu categoría Bronce está muy bien balanceada (65% base, 44% ingresos). Mantén el foco en retención.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="text-amber-800">⚠️ Oportunidad:</h4>
            <p className="text-sm text-amber-700 mt-1">
              Tienes 100 clientes Plata (18.6%). Con campaña de adopción/segunda mascota, podrías convertir 30-40 a Bronce (+S/ 8,000/mes estimado).
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-blue-800">💡 Estrategia:</h4>
            <p className="text-sm text-blue-700 mt-1">
              Zona Miraflores genera más ingresos pero San Isidro tiene mejor promedio/cliente. Considera expandir marketing en San Isidro.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
