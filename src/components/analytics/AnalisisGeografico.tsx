import { useState, useMemo } from 'react';
import { MapPin, Filter, X, TrendingUp, Users, DollarSign, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MapaClientesGoogle from './MapaClientesGoogle';

interface Cliente {
  id: string;
  nombre: string;
  categoria: 'oro' | 'bronce' | 'plata';
  mascotas: number;
  mascotasActivas: number;
  distrito: string;
  direccion: string;
  lat: number;
  lng: number;
  gastoMensual: number;
  ultimaCita?: string;
  telefono?: string;
  ruta?: string;
}

export default function AnalisisGeografico() {
  // Datos de ejemplo (en producción vendrían del backend Laravel)
  const clientesData: Cliente[] = [
    // MIRAFLORES - Zona alta densidad
    { id: 'C001', nombre: 'Juan Pérez', categoria: 'oro', mascotas: 5, mascotasActivas: 4, distrito: 'Miraflores', direccion: 'Av. Larco 1234', lat: -12.1195, lng: -77.0282, gastoMensual: 450, ultimaCita: '15/12/2024', ruta: 'Ruta 1' },
    { id: 'C002', nombre: 'María García', categoria: 'bronce', mascotas: 3, mascotasActivas: 3, distrito: 'Miraflores', direccion: 'Calle Schell 567', lat: -12.1215, lng: -77.0295, gastoMensual: 280, ruta: 'Ruta 1' },
    { id: 'C003', nombre: 'Carlos López', categoria: 'oro', mascotas: 6, mascotasActivas: 6, distrito: 'Miraflores', direccion: 'Av. Benavides 890', lat: -12.1180, lng: -77.0310, gastoMensual: 520, ruta: 'Ruta 1' },
    { id: 'C004', nombre: 'Ana Martínez', categoria: 'plata', mascotas: 1, mascotasActivas: 1, distrito: 'Miraflores', direccion: 'Calle Porta 234', lat: -12.1225, lng: -77.0265, gastoMensual: 180 },
    { id: 'C005', nombre: 'Luis Rodríguez', categoria: 'bronce', mascotas: 2, mascotasActivas: 2, distrito: 'Miraflores', direccion: 'Av. Pardo 456', lat: -12.1170, lng: -77.0320, gastoMensual: 250, ruta: 'Ruta 1' },
    
    // SAN ISIDRO
    { id: 'C006', nombre: 'Patricia Sánchez', categoria: 'oro', mascotas: 7, mascotasActivas: 7, distrito: 'San Isidro', direccion: 'Av. Javier Prado 890', lat: -12.0931, lng: -77.0465, gastoMensual: 580, ruta: 'Ruta 2' },
    { id: 'C007', nombre: 'Roberto Torres', categoria: 'bronce', mascotas: 3, mascotasActivas: 2, distrito: 'San Isidro', direccion: 'Calle Los Pinos 123', lat: -12.0945, lng: -77.0480, gastoMensual: 290, ruta: 'Ruta 2' },
    { id: 'C008', nombre: 'Carmen Flores', categoria: 'bronce', mascotas: 2, mascotasActivas: 2, distrito: 'San Isidro', direccion: 'Av. Conquistadores 456', lat: -12.0920, lng: -77.0455, gastoMensual: 270 },
    { id: 'C009', nombre: 'Jorge Ramírez', categoria: 'plata', mascotas: 1, mascotasActivas: 1, distrito: 'San Isidro', direccion: 'Calle Las Camelias 789', lat: -12.0955, lng: -77.0470, gastoMensual: 160 },
    { id: 'C010', nombre: 'Sofía Vargas', categoria: 'oro', mascotas: 5, mascotasActivas: 5, distrito: 'San Isidro', direccion: 'Av. República de Panamá 234', lat: -12.0915, lng: -77.0490, gastoMensual: 480, ruta: 'Ruta 2' },
    
    // JESÚS MARÍA
    { id: 'C011', nombre: 'Diego Morales', categoria: 'bronce', mascotas: 3, mascotasActivas: 3, distrito: 'Jesús María', direccion: 'Av. Brasil 1234', lat: -12.0720, lng: -77.0490, gastoMensual: 300 },
    { id: 'C012', nombre: 'Lucía Castro', categoria: 'oro', mascotas: 4, mascotasActivas: 4, distrito: 'Jesús María', direccion: 'Av. San Felipe 567', lat: -12.0735, lng: -77.0505, gastoMensual: 420, ruta: 'Ruta 3' },
    { id: 'C013', nombre: 'Miguel Herrera', categoria: 'bronce', mascotas: 2, mascotasActivas: 2, distrito: 'Jesús María', direccion: 'Calle Manco Cápac 890', lat: -12.0710, lng: -77.0475, gastoMensual: 260 },
    { id: 'C014', nombre: 'Isabel Romero', categoria: 'plata', mascotas: 1, mascotasActivas: 1, distrito: 'Jesús María', direccion: 'Av. Salaverry 345', lat: -12.0745, lng: -77.0520, gastoMensual: 170 },
    
    // SURCO
    { id: 'C015', nombre: 'Fernando Silva', categoria: 'oro', mascotas: 8, mascotasActivas: 7, distrito: 'Surco', direccion: 'Av. Primavera 2345', lat: -12.1450, lng: -76.9950, gastoMensual: 650, ruta: 'Ruta 3' },
    { id: 'C016', nombre: 'Gabriela Méndez', categoria: 'bronce', mascotas: 3, mascotasActivas: 3, distrito: 'Surco', direccion: 'Av. El Polo 678', lat: -12.1480, lng: -76.9970, gastoMensual: 285 },
    { id: 'C017', nombre: 'Raúl Paredes', categoria: 'bronce', mascotas: 2, mascotasActivas: 2, distrito: 'Surco', direccion: 'Calle Los Sauces 901', lat: -12.1420, lng: -76.9930, gastoMensual: 275, ruta: 'Ruta 3' },
    { id: 'C018', nombre: 'Valentina Cruz', categoria: 'oro', mascotas: 6, mascotasActivas: 6, distrito: 'Surco', direccion: 'Av. Santiago de Surco 1234', lat: -12.1495, lng: -76.9985, gastoMensual: 510 },
    
    // BARRANCO
    { id: 'C019', nombre: 'Andrés Gutiérrez', categoria: 'bronce', mascotas: 3, mascotasActivas: 3, distrito: 'Barranco', direccion: 'Av. Grau 456', lat: -12.1470, lng: -77.0200, gastoMensual: 295 },
    { id: 'C020', nombre: 'Carolina Núñez', categoria: 'plata', mascotas: 1, mascotasActivas: 1, distrito: 'Barranco', direccion: 'Jr. Cajamarca 789', lat: -12.1485, lng: -77.0215, gastoMensual: 165 },
    { id: 'C021', nombre: 'Esteban Reyes', categoria: 'oro', mascotas: 5, mascotasActivas: 5, distrito: 'Barranco', direccion: 'Calle Domeyer 123', lat: -12.1455, lng: -77.0185, gastoMensual: 470 },
  ];

  const [filtrosCategorias, setFiltrosCategorias] = useState({
    oro: true,
    bronce: true,
    plata: true
  });

  const [filtrosDistritos, setFiltrosDistritos] = useState<Record<string, boolean>>({
    'Miraflores': true,
    'San Isidro': true,
    'Jesús María': true,
    'Surco': true,
    'Barranco': true
  });

  const [filtrosRutas, setFiltrosRutas] = useState<Record<string, boolean>>({
    'Ruta 1': true,
    'Ruta 2': true,
    'Ruta 3': true,
    'Sin ruta': true
  });

  const [mostrarPanelFiltros, setMostrarPanelFiltros] = useState(true);

  // Datos filtrados
  const clientesFiltrados = useMemo(() => {
    return clientesData.filter(cliente => {
      const pasaCategoria = filtrosCategorias[cliente.categoria];
      const pasaDistrito = filtrosDistritos[cliente.distrito];
      const pasaRuta = filtrosRutas[cliente.ruta || 'Sin ruta'];
      
      return pasaCategoria && pasaDistrito && pasaRuta;
    });
  }, [filtrosCategorias, filtrosDistritos, filtrosRutas]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = clientesFiltrados.length;
    const oro = clientesFiltrados.filter(c => c.categoria === 'oro').length;
    const bronce = clientesFiltrados.filter(c => c.categoria === 'bronce').length;
    const plata = clientesFiltrados.filter(c => c.categoria === 'plata').length;
    const totalMascotas = clientesFiltrados.reduce((sum, c) => sum + c.mascotasActivas, 0);
    const ingresoTotal = clientesFiltrados.reduce((sum, c) => sum + c.gastoMensual, 0);

    return { total, oro, bronce, plata, totalMascotas, ingresoTotal };
  }, [clientesFiltrados]);

  // Datos para gráficas
  const datosPorCategoria = [
    { nombre: 'Oro', cantidad: stats.oro, color: '#FFD700' },
    { nombre: 'Bronce', cantidad: stats.bronce, color: '#FF6B35' },
    { nombre: 'Plata', cantidad: stats.plata, color: '#9E9E9E' }
  ];

  const datosPorDistrito = useMemo(() => {
    const distritos: Record<string, any> = {};
    
    clientesFiltrados.forEach(cliente => {
      if (!distritos[cliente.distrito]) {
        distritos[cliente.distrito] = { nombre: cliente.distrito, oro: 0, bronce: 0, plata: 0, total: 0 };
      }
      distritos[cliente.distrito][cliente.categoria]++;
      distritos[cliente.distrito].total++;
    });

    return Object.values(distritos);
  }, [clientesFiltrados]);

  const limpiarFiltros = () => {
    setFiltrosCategorias({ oro: true, bronce: true, plata: true });
    setFiltrosDistritos({
      'Miraflores': true,
      'San Isidro': true,
      'Jesús María': true,
      'Surco': true,
      'Barranco': true
    });
    setFiltrosRutas({
      'Ruta 1': true,
      'Ruta 2': true,
      'Ruta 3': true,
      'Sin ruta': true
    });
  };

  const contarPorDistrito = (distrito: string) => {
    return clientesData.filter(c => c.distrito === distrito).length;
  };

  const coloresCategorias = {
    oro: '#FFD700',
    bronce: '#FF6B35',
    plata: '#9E9E9E'
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl flex items-center gap-3">
            <MapPin className="size-8 text-blue-600" />
            Análisis Geográfico y Segmentación
          </h1>
          <p className="text-gray-600 mt-1">
            Visualiza tus clientes por ubicación, categoría y zona de cobertura
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setMostrarPanelFiltros(!mostrarPanelFiltros)}
            className="flex items-center gap-2"
          >
            <Filter className="size-4" />
            {mostrarPanelFiltros ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-2xl mt-1">{stats.total}</p>
              </div>
              <Users className="size-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-800">Oro</p>
                <p className="text-2xl mt-1 text-yellow-900">{stats.oro}</p>
                <p className="text-xs text-yellow-700">{((stats.oro / stats.total) * 100).toFixed(1)}%</p>
              </div>
              <div className="size-8 rounded-full bg-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-800">Bronce</p>
                <p className="text-2xl mt-1 text-orange-900">{stats.bronce}</p>
                <p className="text-xs text-orange-700">{((stats.bronce / stats.total) * 100).toFixed(1)}%</p>
              </div>
              <div className="size-8 rounded-full bg-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800">Plata</p>
                <p className="text-2xl mt-1 text-gray-900">{stats.plata}</p>
                <p className="text-xs text-gray-700">{((stats.plata / stats.total) * 100).toFixed(1)}%</p>
              </div>
              <div className="size-8 rounded-full bg-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Total Mascotas</p>
              <p className="text-2xl mt-1">{stats.totalMascotas}</p>
              <p className="text-xs text-gray-600">activas</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">Ingresos/mes</p>
                <p className="text-2xl mt-1 text-green-900">
                  S/ {stats.ingresoTotal.toLocaleString()}
                </p>
              </div>
              <DollarSign className="size-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Panel de filtros */}
        {mostrarPanelFiltros && (
          <Card className="w-80 flex-shrink-0 overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Filter className="size-5" />
                  Filtros
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limpiarFiltros}
                  className="text-blue-600"
                >
                  Limpiar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtro por categoría */}
              <div>
                <h3 className="text-sm uppercase tracking-wider mb-3">
                  Por Categoría
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded hover:bg-yellow-50">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-oro"
                        checked={filtrosCategorias.oro}
                        onCheckedChange={(checked) => 
                          setFiltrosCategorias(prev => ({ ...prev, oro: checked as boolean }))
                        }
                      />
                      <label htmlFor="filter-oro" className="cursor-pointer flex items-center gap-2">
                        <div className="size-3 rounded-full bg-yellow-500" />
                        <span>Oro</span>
                      </label>
                    </div>
                    <Badge variant="secondary">{stats.oro}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded hover:bg-orange-50">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-bronce"
                        checked={filtrosCategorias.bronce}
                        onCheckedChange={(checked) => 
                          setFiltrosCategorias(prev => ({ ...prev, bronce: checked as boolean }))
                        }
                      />
                      <label htmlFor="filter-bronce" className="cursor-pointer flex items-center gap-2">
                        <div className="size-3 rounded-full bg-orange-500" />
                        <span>Bronce</span>
                      </label>
                    </div>
                    <Badge variant="secondary">{stats.bronce}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-plata"
                        checked={filtrosCategorias.plata}
                        onCheckedChange={(checked) => 
                          setFiltrosCategorias(prev => ({ ...prev, plata: checked as boolean }))
                        }
                      />
                      <label htmlFor="filter-plata" className="cursor-pointer flex items-center gap-2">
                        <div className="size-3 rounded-full bg-gray-400" />
                        <span>Plata</span>
                      </label>
                    </div>
                    <Badge variant="secondary">{stats.plata}</Badge>
                  </div>
                </div>
              </div>

              {/* Filtro por distrito */}
              <div>
                <h3 className="text-sm uppercase tracking-wider mb-3">
                  Por Distrito
                </h3>
                <div className="space-y-2">
                  {Object.keys(filtrosDistritos).map(distrito => (
                    <div key={distrito} className="flex items-center justify-between p-2 rounded hover:bg-blue-50">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`filter-${distrito}`}
                          checked={filtrosDistritos[distrito]}
                          onCheckedChange={(checked) => 
                            setFiltrosDistritos(prev => ({ ...prev, [distrito]: checked as boolean }))
                          }
                        />
                        <label htmlFor={`filter-${distrito}`} className="cursor-pointer">
                          {distrito}
                        </label>
                      </div>
                      <Badge variant="secondary">{contarPorDistrito(distrito)}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtro por rutas */}
              <div>
                <h3 className="text-sm uppercase tracking-wider mb-3">
                  Por Rutas Programadas
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-ruta1"
                        checked={filtrosRutas['Ruta 1']}
                        onCheckedChange={(checked) => 
                          setFiltrosRutas(prev => ({ ...prev, 'Ruta 1': checked as boolean }))
                        }
                      />
                      <label htmlFor="filter-ruta1" className="cursor-pointer flex items-center gap-2">
                        <div className="size-3 rounded-full bg-blue-500" />
                        <span>Ruta 1</span>
                      </label>
                    </div>
                    <Badge variant="secondary">{clientesData.filter(c => c.ruta === 'Ruta 1').length}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded hover:bg-purple-50">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-ruta2"
                        checked={filtrosRutas['Ruta 2']}
                        onCheckedChange={(checked) => 
                          setFiltrosRutas(prev => ({ ...prev, 'Ruta 2': checked as boolean }))
                        }
                      />
                      <label htmlFor="filter-ruta2" className="cursor-pointer flex items-center gap-2">
                        <div className="size-3 rounded-full bg-purple-500" />
                        <span>Ruta 2</span>
                      </label>
                    </div>
                    <Badge variant="secondary">{clientesData.filter(c => c.ruta === 'Ruta 2').length}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded hover:bg-orange-50">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-ruta3"
                        checked={filtrosRutas['Ruta 3']}
                        onCheckedChange={(checked) => 
                          setFiltrosRutas(prev => ({ ...prev, 'Ruta 3': checked as boolean }))
                        }
                      />
                      <label htmlFor="filter-ruta3" className="cursor-pointer flex items-center gap-2">
                        <div className="size-3 rounded-full bg-orange-500" />
                        <span>Ruta 3</span>
                      </label>
                    </div>
                    <Badge variant="secondary">{clientesData.filter(c => c.ruta === 'Ruta 3').length}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-sinruta"
                        checked={filtrosRutas['Sin ruta']}
                        onCheckedChange={(checked) => 
                          setFiltrosRutas(prev => ({ ...prev, 'Sin ruta': checked as boolean }))
                        }
                      />
                      <label htmlFor="filter-sinruta" className="cursor-pointer">
                        Sin ruta asignada
                      </label>
                    </div>
                    <Badge variant="secondary">{clientesData.filter(c => !c.ruta).length}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Área principal */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="mapa" className="h-full flex flex-col">
            <TabsList>
              <TabsTrigger value="mapa">
                <MapPin className="size-4 mr-2" />
                Vista Mapa
              </TabsTrigger>
              <TabsTrigger value="distribucion">
                <TrendingUp className="size-4 mr-2" />
                Distribución
              </TabsTrigger>
              <TabsTrigger value="zonas">
                <Navigation className="size-4 mr-2" />
                Por Zonas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mapa" className="flex-1 mt-4">
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <MapaClientesGoogle 
                    clientes={clientesFiltrados}
                    coloresCategorias={coloresCategorias}
                    filtrosRutas={filtrosRutas}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="distribucion" className="flex-1 mt-4 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={datosPorCategoria}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ nombre, cantidad }) => `${nombre}: ${cantidad}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="cantidad"
                        >
                          {datosPorCategoria.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Clientes por Distrito</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={datosPorDistrito}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nombre" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="zonas" className="flex-1 mt-4 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {datosPorDistrito.map((distrito) => (
                  <Card key={distrito.nombre}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="size-5 text-blue-600" />
                        {distrito.nombre}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">Total Clientes</span>
                          <span className="text-xl">{distrito.total}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-3 bg-yellow-50 rounded-lg text-center">
                            <div className="size-4 rounded-full bg-yellow-500 mx-auto mb-1" />
                            <p className="text-sm text-gray-600">Oro</p>
                            <p className="text-xl">{distrito.oro}</p>
                          </div>

                          <div className="p-3 bg-orange-50 rounded-lg text-center">
                            <div className="size-4 rounded-full bg-orange-500 mx-auto mb-1" />
                            <p className="text-sm text-gray-600">Bronce</p>
                            <p className="text-xl">{distrito.bronce}</p>
                          </div>

                          <div className="p-3 bg-gray-50 rounded-lg text-center">
                            <div className="size-4 rounded-full bg-gray-400 mx-auto mb-1" />
                            <p className="text-sm text-gray-600">Plata</p>
                            <p className="text-xl">{distrito.plata}</p>
                          </div>
                        </div>

                        <ResponsiveContainer width="100%" height={150}>
                          <BarChart data={[distrito]}>
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="oro" fill="#FFD700" name="Oro" />
                            <Bar dataKey="bronce" fill="#FF6B35" name="Bronce" />
                            <Bar dataKey="plata" fill="#9E9E9E" name="Plata" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}