import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  MapPin, 
  TrendingUp, 
  Navigation, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  Clock,
  BarChart3,
  Map as MapIcon,
  Lightbulb,
  Truck,
  TrendingDown,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';

// Tipos
interface Cliente {
  id: string;
  nombre: string;
  categoria: 'oro' | 'bronce' | 'plata';
  distrito: string;
  coordenadas: { lat: number; lng: number };
  movilAsignado: string;
  frecuenciaMensual: number;
  ingresoPromedio: number;
  ultimasVisitas: string[];
}

interface SubZona {
  id: string;
  nombre: string;
  distrito: string;
  clientes: string[];
  coordenadas: { lat: number; lng: number };
  concentracion: number;
  categoria: 'alta' | 'media' | 'baja';
  movilSugerido: string;
  ingresoPotencial: number;
}

interface PatronMovil {
  movilId: string;
  movilNombre: string;
  clientesTotales: number;
  subZonasDetectadas: SubZona[];
  eficienciaActual: number;
  kmPromedioRecorrido: number;
  ingresoPorHora: number;
  distribucionCategorias: {
    oro: number;
    bronce: number;
    plata: number;
  };
  recomendaciones: string[];
}

export default function AnalisisPatrones() {
  const [periodoAnalisis, setPeriodoAnalisis] = useState<'mes' | 'trimestre' | 'semestre'>('trimestre');
  const [vistaSeleccionada, setVistaSeleccionada] = useState<'general' | 'movil' | 'subzonas' | 'prediccion'>('general');
  const [movilSeleccionado, setMovilSeleccionado] = useState<string | null>(null);

  // Datos de ejemplo
  const clientesData: Cliente[] = [
    { id: 'C001', nombre: 'Juan Pérez', categoria: 'oro', distrito: 'Miraflores', coordenadas: { lat: -12.1197, lng: -77.0297 }, movilAsignado: 'Móvil 1', frecuenciaMensual: 4, ingresoPromedio: 250, ultimasVisitas: ['2024-12-20', '2024-12-15', '2024-12-10'] },
    { id: 'C002', nombre: 'Ana García', categoria: 'oro', distrito: 'Miraflores', coordenadas: { lat: -12.1210, lng: -77.0310 }, movilAsignado: 'Móvil 1', frecuenciaMensual: 5, ingresoPromedio: 280, ultimasVisitas: ['2024-12-22', '2024-12-18', '2024-12-12'] },
    { id: 'C003', nombre: 'Carlos López', categoria: 'bronce', distrito: 'Miraflores', coordenadas: { lat: -12.1220, lng: -77.0320 }, movilAsignado: 'Móvil 1', frecuenciaMensual: 3, ingresoPromedio: 180, ultimasVisitas: ['2024-12-21', '2024-12-14', '2024-12-07'] },
    { id: 'C004', nombre: 'María Sánchez', categoria: 'bronce', distrito: 'San Isidro', coordenadas: { lat: -12.0897, lng: -77.0365 }, movilAsignado: 'Móvil 1', frecuenciaMensual: 3, ingresoPromedio: 190, ultimasVisitas: ['2024-12-23', '2024-12-16', '2024-12-09'] },
    { id: 'C005', nombre: 'Pedro Torres', categoria: 'bronce', distrito: 'San Isidro', coordenadas: { lat: -12.0910, lng: -77.0380 }, movilAsignado: 'Móvil 1', frecuenciaMensual: 2, ingresoPromedio: 170, ultimasVisitas: ['2024-12-19', '2024-12-12'] },
    { id: 'C006', nombre: 'Laura Martínez', categoria: 'plata', distrito: 'Miraflores', coordenadas: { lat: -12.1100, lng: -77.0400 }, movilAsignado: 'Móvil 2', frecuenciaMensual: 2, ingresoPromedio: 120, ultimasVisitas: ['2024-12-20', '2024-12-10'] },
    { id: 'C007', nombre: 'Diego Fernández', categoria: 'bronce', distrito: 'Miraflores', coordenadas: { lat: -12.1150, lng: -77.0350 }, movilAsignado: 'Móvil 2', frecuenciaMensual: 3, ingresoPromedio: 185, ultimasVisitas: ['2024-12-22', '2024-12-15', '2024-12-08'] },
    { id: 'C008', nombre: 'Sofía Ramírez', categoria: 'bronce', distrito: 'San Isidro', coordenadas: { lat: -12.0950, lng: -77.0420 }, movilAsignado: 'Móvil 2', frecuenciaMensual: 3, ingresoPromedio: 175, ultimasVisitas: ['2024-12-21', '2024-12-14', '2024-12-07'] },
    { id: 'C009', nombre: 'Roberto Díaz', categoria: 'oro', distrito: 'Surco', coordenadas: { lat: -12.1297, lng: -76.9897 }, movilAsignado: 'Móvil 3', frecuenciaMensual: 4, ingresoPromedio: 260, ultimasVisitas: ['2024-12-23', '2024-12-17', '2024-12-11'] },
    { id: 'C010', nombre: 'Carmen Vega', categoria: 'bronce', distrito: 'Surco', coordenadas: { lat: -12.1310, lng: -76.9910 }, movilAsignado: 'Móvil 3', frecuenciaMensual: 3, ingresoPromedio: 180, ultimasVisitas: ['2024-12-22', '2024-12-15', '2024-12-08'] },
    { id: 'C011', nombre: 'Fernando Castro', categoria: 'bronce', distrito: 'Surco', coordenadas: { lat: -12.1320, lng: -76.9920 }, movilAsignado: 'Móvil 3', frecuenciaMensual: 2, ingresoPromedio: 165, ultimasVisitas: ['2024-12-20', '2024-12-13'] },
    { id: 'C012', nombre: 'Patricia Rojas', categoria: 'plata', distrito: 'Surco', coordenadas: { lat: -12.1330, lng: -76.9930 }, movilAsignado: 'Móvil 3', frecuenciaMensual: 2, ingresoPromedio: 130, ultimasVisitas: ['2024-12-19', '2024-12-12'] },
    { id: 'C013', nombre: 'Luis Morales', categoria: 'oro', distrito: 'Barranco', coordenadas: { lat: -12.1497, lng: -77.0197 }, movilAsignado: 'Móvil 1', frecuenciaMensual: 4, ingresoPromedio: 270, ultimasVisitas: ['2024-12-24', '2024-12-18', '2024-12-12'] },
  ];

  // Algoritmo de detección de sub-zonas
  const detectarSubZonas = useMemo(() => {
    const subZonasPorMovil: { [key: string]: SubZona[] } = {};
    const clientesPorMovil = clientesData.reduce((acc, cliente) => {
      if (!acc[cliente.movilAsignado]) acc[cliente.movilAsignado] = [];
      acc[cliente.movilAsignado].push(cliente);
      return acc;
    }, {} as { [key: string]: Cliente[] });

    Object.entries(clientesPorMovil).forEach(([movil, clientes]) => {
      const clusters: SubZona[] = [];
      const porDistrito = clientes.reduce((acc, cliente) => {
        if (!acc[cliente.distrito]) acc[cliente.distrito] = [];
        acc[cliente.distrito].push(cliente);
        return acc;
      }, {} as { [key: string]: Cliente[] });

      Object.entries(porDistrito).forEach(([distrito, clientesDistrito]) => {
        if (clientesDistrito.length >= 2) {
          const latPromedio = clientesDistrito.reduce((sum, c) => sum + c.coordenadas.lat, 0) / clientesDistrito.length;
          const lngPromedio = clientesDistrito.reduce((sum, c) => sum + c.coordenadas.lng, 0) / clientesDistrito.length;
          const ingresoPotencial = clientesDistrito.reduce((sum, c) => sum + c.ingresoPromedio * c.frecuenciaMensual, 0);
          const concentracion = (clientesDistrito.length / clientes.length) * 100;
          
          clusters.push({
            id: `${movil}-${distrito}`,
            nombre: `${distrito} - ${movil}`,
            distrito,
            clientes: clientesDistrito.map(c => c.id),
            coordenadas: { lat: latPromedio, lng: lngPromedio },
            concentracion,
            categoria: concentracion > 50 ? 'alta' : concentracion > 30 ? 'media' : 'baja',
            movilSugerido: movil,
            ingresoPotencial
          });
        }
      });
      subZonasPorMovil[movil] = clusters;
    });
    return subZonasPorMovil;
  }, []);

  // Calcular patrones por móvil
  const patronesPorMovil = useMemo((): PatronMovil[] => {
    const moviles = ['Móvil 1', 'Móvil 2', 'Móvil 3'];
    return moviles.map(movil => {
      const clientesMovil = clientesData.filter(c => c.movilAsignado === movil);
      const distribucionCategorias = {
        oro: clientesMovil.filter(c => c.categoria === 'oro').length,
        bronce: clientesMovil.filter(c => c.categoria === 'bronce').length,
        plata: clientesMovil.filter(c => c.categoria === 'plata').length
      };
      const ingresoTotal = clientesMovil.reduce((sum, c) => sum + c.ingresoPromedio * c.frecuenciaMensual, 0);
      const horasEstimadas = clientesMovil.reduce((sum, c) => sum + c.frecuenciaMensual * 1.5, 0);
      const ingresoPorHora = horasEstimadas > 0 ? ingresoTotal / horasEstimadas : 0;
      const subZonas = detectarSubZonas[movil] || [];
      const concentracionTotal = subZonas.reduce((sum, sz) => sum + sz.concentracion, 0);
      const eficienciaActual = subZonas.length > 0 ? Math.min(concentracionTotal, 100) : 50;

      const recomendaciones: string[] = [];
      if (eficienciaActual < 70) recomendaciones.push('⚠️ Baja concentración geográfica - Considerar reasignación de clientes');
      if (distribucionCategorias.oro === 0) recomendaciones.push('📊 Sin clientes Oro - Oportunidad de crecimiento premium');
      const porcentajeBronce = (distribucionCategorias.bronce / clientesMovil.length) * 100;
      if (porcentajeBronce < 60) recomendaciones.push(`💡 Solo ${porcentajeBronce.toFixed(0)}% clientes Bronce - Objetivo: 65-70%`);
      if (subZonas.some(sz => sz.categoria === 'baja')) recomendaciones.push('🎯 Detectadas sub-zonas de baja densidad - Revisar asignaciones');
      if (clientesMovil.length < 4) recomendaciones.push('👥 Pocos clientes asignados - Balancear carga entre móviles');

      return {
        movilId: movil,
        movilNombre: movil,
        clientesTotales: clientesMovil.length,
        subZonasDetectadas: subZonas,
        eficienciaActual,
        kmPromedioRecorrido: 25 + Math.random() * 15,
        ingresoPorHora,
        distribucionCategorias,
        recomendaciones
      };
    });
  }, [detectarSubZonas]);

  // Recomendaciones globales
  const recomendacionesGlobales = useMemo(() => {
    const recomendaciones: { tipo: 'critica' | 'importante' | 'sugerencia'; mensaje: string; accion: string }[] = [];
    const clientesPorMovil = patronesPorMovil.map(p => p.clientesTotales);
    const maxClientes = Math.max(...clientesPorMovil);
    const minClientes = Math.min(...clientesPorMovil);
    
    if (maxClientes - minClientes > 5) {
      recomendaciones.push({
        tipo: 'critica',
        mensaje: `Desbalance de carga: ${patronesPorMovil.find(p => p.clientesTotales === maxClientes)?.movilNombre} tiene ${maxClientes} clientes vs ${patronesPorMovil.find(p => p.clientesTotales === minClientes)?.movilNombre} con ${minClientes}`,
        accion: 'Reasignar 2-3 clientes para equilibrar'
      });
    }

    const clienteMalAsignado = clientesData.find(c => c.id === 'C013');
    if (clienteMalAsignado) {
      recomendaciones.push({
        tipo: 'importante',
        mensaje: `Cliente Oro "${clienteMalAsignado.nombre}" en Barranco asignado a Móvil 1 (Miraflores/San Isidro)`,
        accion: 'Sugerir reasignación a móvil más cercano'
      });
    }

    const movilesBajaEficiencia = patronesPorMovil.filter(p => p.eficienciaActual < 70);
    if (movilesBajaEficiencia.length > 0) {
      recomendaciones.push({
        tipo: 'importante',
        mensaje: `${movilesBajaEficiencia.length} móvil(es) con baja concentración geográfica`,
        accion: 'Revisar definición de sub-zonas basadas en datos'
      });
    }

    const totalBronce = patronesPorMovil.reduce((sum, p) => sum + p.distribucionCategorias.bronce, 0);
    const totalClientes = patronesPorMovil.reduce((sum, p) => sum + p.clientesTotales, 0);
    const porcentajeBronce = (totalBronce / totalClientes) * 100;
    
    if (porcentajeBronce < 65) {
      recomendaciones.push({
        tipo: 'sugerencia',
        mensaje: `Solo ${porcentajeBronce.toFixed(1)}% de clientes Bronce (objetivo: 65-70%)`,
        accion: 'Estrategia de captación de clientes con 2-3 mascotas'
      });
    } else if (porcentajeBronce >= 65 && porcentajeBronce <= 70) {
      recomendaciones.push({
        tipo: 'sugerencia',
        mensaje: `¡Excelente! ${porcentajeBronce.toFixed(1)}% de clientes Bronce generando 79% ingresos`,
        accion: 'Mantener estrategia de retención'
      });
    }
    return recomendaciones;
  }, [patronesPorMovil]);

  // Cálculos predictivos para vehículos
  const prediccionVehiculos = useMemo(() => {
    const movilesActivos = 3;
    const totalClientes = clientesData.length;
    const clientesPorMovil = totalClientes / movilesActivos;
    
    // Clientes frecuentes (3+ visitas/mes)
    const clientesFrecuentes = clientesData.filter(c => c.frecuenciaMensual >= 3).length;
    const porcentajeFrecuentes = (clientesFrecuentes / totalClientes) * 100;
    
    // Proyección de crecimiento (asumiendo 15% trimestral)
    const tasaCrecimientoTrimestral = 0.15;
    const clientesProyectados3Meses = Math.round(totalClientes * (1 + tasaCrecimientoTrimestral));
    const clientesProyectados6Meses = Math.round(totalClientes * (1 + tasaCrecimientoTrimestral * 2));
    const clientesProyectados12Meses = Math.round(totalClientes * (1 + tasaCrecimientoTrimestral * 4));
    
    // Capacidad óptima por móvil (basado en eficiencia)
    const capacidadOptimaPorMovil = 6; // 6 clientes por móvil para mantener 70%+ eficiencia
    const capacidadActual = movilesActivos * capacidadOptimaPorMovil;
    const utilizacionActual = (totalClientes / capacidadActual) * 100;
    
    // Calcular cuándo agregar vehículos
    const necesitaNuevoMovil3M = clientesProyectados3Meses > capacidadActual;
    const necesitaNuevoMovil6M = clientesProyectados6Meses > capacidadActual;
    const necesitaNuevoMovil12M = clientesProyectados12Meses > capacidadOptimaPorMovil * movilesActivos;
    
    // Ingresos
    const ingresoMensualActual = clientesData.reduce((sum, c) => sum + (c.ingresoPromedio * c.frecuenciaMensual), 0);
    const ingresoPromedioPorCliente = ingresoMensualActual / totalClientes;
    const ingresoMensualProyectado12M = clientesProyectados12Meses * ingresoPromedioPorCliente;
    const ingresoAdicional12M = ingresoMensualProyectado12M - ingresoMensualActual;
    
    // ROI de nuevo vehículo
    const costoNuevoVehiculo = 25000; // Inversión inicial
    const costosOperacionalesMensuales = 2500; // Combustible, mantenimiento, seguro
    const ingresoPotencialNuevoMovil = capacidadOptimaPorMovil * ingresoPromedioPorCliente;
    const utilidadMensualNuevoMovil = ingresoPotencialNuevoMovil - costosOperacionalesMensuales;
    const mesesParaROI = costoNuevoVehiculo / utilidadMensualNuevoMovil;
    const ROIAnualPorcentaje = ((utilidadMensualNuevoMovil * 12) / costoNuevoVehiculo) * 100;
    
    return {
      movilesActivos,
      totalClientes,
      clientesPorMovil,
      clientesFrecuentes,
      porcentajeFrecuentes,
      clientesProyectados3Meses,
      clientesProyectados6Meses,
      clientesProyectados12Meses,
      capacidadOptimaPorMovil,
      capacidadActual,
      utilizacionActual,
      necesitaNuevoMovil3M,
      necesitaNuevoMovil6M,
      necesitaNuevoMovil12M,
      ingresoMensualActual,
      ingresoPromedioPorCliente,
      ingresoMensualProyectado12M,
      ingresoAdicional12M,
      costoNuevoVehiculo,
      costosOperacionalesMensuales,
      ingresoPotencialNuevoMovil,
      utilidadMensualNuevoMovil,
      mesesParaROI,
      ROIAnualPorcentaje
    };
  }, [clientesData]);

  const getColorSubZona = (categoria: 'alta' | 'media' | 'baja') => {
    switch (categoria) {
      case 'alta': return '#22c55e';
      case 'media': return '#f59e0b';
      case 'baja': return '#ef4444';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">📊 Análisis de Patrones de Servicio</h1>
        <p className="text-gray-600">
          Identificación automática de sub-zonas naturales y recomendaciones de optimización
        </p>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button variant={periodoAnalisis === 'mes' ? 'default' : 'outline'} size="sm" onClick={() => setPeriodoAnalisis('mes')}>
            <Calendar className="size-4 mr-2" />
            Último Mes
          </Button>
          <Button variant={periodoAnalisis === 'trimestre' ? 'default' : 'outline'} size="sm" onClick={() => setPeriodoAnalisis('trimestre')}>
            <Calendar className="size-4 mr-2" />
            Trimestre
          </Button>
          <Button variant={periodoAnalisis === 'semestre' ? 'default' : 'outline'} size="sm" onClick={() => setPeriodoAnalisis('semestre')}>
            <Calendar className="size-4 mr-2" />
            Semestre
          </Button>
        </div>
        <Badge variant="outline" className="ml-auto">
          <Clock className="size-3 mr-1" />
          Actualizado: {new Date().toLocaleDateString('es-ES')}
        </Badge>
      </div>

      {/* Alertas y Recomendaciones Globales */}
      <div className="space-y-3">
        {recomendacionesGlobales.map((rec, idx) => (
          <Alert 
            key={idx} 
            className={
              rec.tipo === 'critica' ? 'border-red-500 bg-red-50' :
              rec.tipo === 'importante' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }
          >
            {rec.tipo === 'critica' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
             rec.tipo === 'importante' ? <Lightbulb className="h-4 w-4 text-yellow-600" /> :
             <CheckCircle className="h-4 w-4 text-blue-600" />}
            <AlertTitle className={
              rec.tipo === 'critica' ? 'text-red-900' :
              rec.tipo === 'importante' ? 'text-yellow-900' :
              'text-blue-900'
            }>
              {rec.mensaje}
            </AlertTitle>
            <AlertDescription className={
              rec.tipo === 'critica' ? 'text-red-800' :
              rec.tipo === 'importante' ? 'text-yellow-800' :
              'text-blue-800'
            }>
              <strong>Acción sugerida:</strong> {rec.accion}
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Tabs principales */}
      <Tabs value={vistaSeleccionada} onValueChange={(v) => setVistaSeleccionada(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <BarChart3 className="size-4 mr-2" />
            Vista General
          </TabsTrigger>
          <TabsTrigger value="movil">
            <Navigation className="size-4 mr-2" />
            Por Móvil
          </TabsTrigger>
          <TabsTrigger value="subzonas">
            <MapIcon className="size-4 mr-2" />
            Sub-Zonas Detectadas
          </TabsTrigger>
          <TabsTrigger value="prediccion">
            <Truck className="size-4 mr-2" />
            Predicción de Vehículos
          </TabsTrigger>
        </TabsList>

        {/* VISTA GENERAL */}
        <TabsContent value="general" className="space-y-6">
          {/* KPIs Globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Total Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl">{clientesData.length}</div>
                <p className="text-xs text-gray-600 mt-1">Activos en {periodoAnalisis}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Sub-Zonas Naturales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl">
                  {Object.values(detectarSubZonas).reduce((sum, zonas) => sum + zonas.length, 0)}
                </div>
                <p className="text-xs text-gray-600 mt-1">Detectadas automáticamente</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Eficiencia Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl">
                  {(patronesPorMovil.reduce((sum, p) => sum + p.eficienciaActual, 0) / patronesPorMovil.length).toFixed(0)}%
                </div>
                <p className="text-xs text-gray-600 mt-1">Concentración geográfica</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Ingreso/Hora Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl">
                  S/ {(patronesPorMovil.reduce((sum, p) => sum + p.ingresoPorHora, 0) / patronesPorMovil.length).toFixed(0)}
                </div>
                <p className="text-xs text-gray-600 mt-1">Por móvil activo</p>
              </CardContent>
            </Card>
          </div>

          {/* Distribución de Categorías Global */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5 text-blue-600" />
                Distribución Global por Categorías
              </CardTitle>
              <CardDescription>
                Análisis de segmentación actual vs objetivo estratégico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {(['oro', 'bronce', 'plata'] as const).map(cat => {
                  const total = patronesPorMovil.reduce((sum, p) => sum + p.distribucionCategorias[cat], 0);
                  const porcentaje = (total / clientesData.length) * 100;
                  const objetivo = cat === 'bronce' ? 67.5 : cat === 'oro' ? 15 : 17.5;
                  const diferencia = porcentaje - objetivo;

                  return (
                    <div key={cat} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">
                          {cat === 'oro' ? '🥇' : cat === 'bronce' ? '🥉' : '🥈'}
                        </span>
                        <Badge variant={Math.abs(diferencia) < 5 ? 'default' : 'secondary'}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-3xl mb-1">{total}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {porcentaje.toFixed(1)}% del total
                      </div>
                      <Separator className="my-2" />
                      <div className="text-xs">
                        <span className="text-gray-600">Objetivo: {objetivo}%</span>
                        <span className={`ml-2 ${diferencia > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {diferencia > 0 ? '+' : ''}{diferencia.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Insight Bronce */}
              <Alert className="mt-4 border-orange-500 bg-orange-50">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-900">
                  Insights Categoría Bronce (2-3 mascotas)
                </AlertTitle>
                <AlertDescription className="text-orange-800">
                  {(() => {
                    const bronce = patronesPorMovil.reduce((sum, p) => sum + p.distribucionCategorias.bronce, 0);
                    const porcentajeBronce = (bronce / clientesData.length) * 100;
                    
                    if (porcentajeBronce >= 65 && porcentajeBronce <= 70) {
                      return `✅ ¡Excelente! Tienes ${bronce} clientes Bronce (${porcentajeBronce.toFixed(1)}%) - Dentro del objetivo 65-70% que genera el 79% de tus ingresos.`;
                    } else if (porcentajeBronce < 65) {
                      return `⚠️ Tienes ${bronce} clientes Bronce (${porcentajeBronce.toFixed(1)}%). Objetivo: 65-70%. Oportunidad de captación de familias con 2-3 mascotas.`;
                    } else {
                      return `📊 Tienes ${bronce} clientes Bronce (${porcentajeBronce.toFixed(1)}%). Ligeramente sobre objetivo pero generando alto ingreso.`;
                    }
                  })()}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Distribución de Clientes por Móvil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5 text-blue-600" />
                Distribución de Clientes por Móvil y Distrito
              </CardTitle>
              <CardDescription>
                Vista detallada de concentración geográfica actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patronesPorMovil.map(patron => {
                  const clientesMovil = clientesData.filter(c => c.movilAsignado === patron.movilNombre);
                  const distritos = [...new Set(clientesMovil.map(c => c.distrito))];
                  
                  return (
                    <div key={patron.movilId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Navigation className={`size-5 ${
                            patron.movilId === 'Móvil 1' ? 'text-blue-500' :
                            patron.movilId === 'Móvil 2' ? 'text-green-500' :
                            'text-yellow-500'
                          }`} />
                          <h3 className="font-medium">{patron.movilNombre}</h3>
                          <Badge variant="outline">{clientesMovil.length} clientes</Badge>
                        </div>
                        <Badge variant={patron.eficienciaActual >= 70 ? 'default' : 'secondary'}>
                          {patron.eficienciaActual.toFixed(0)}% eficiencia
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {distritos.map(distrito => {
                          const clientesDistrito = clientesMovil.filter(c => c.distrito === distrito);
                          const concentracion = (clientesDistrito.length / clientesMovil.length) * 100;
                          
                          return (
                            <div 
                              key={distrito} 
                              className="p-3 border rounded bg-gray-50"
                              style={{
                                borderLeftWidth: '3px',
                                borderLeftColor: concentracion > 50 ? '#22c55e' : concentracion > 30 ? '#f59e0b' : '#ef4444'
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{distrito}</span>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{
                                    backgroundColor: concentracion > 50 ? '#22c55e20' : concentracion > 30 ? '#f59e0b20' : '#ef444420'
                                  }}
                                >
                                  {concentracion.toFixed(0)}%
                                </Badge>
                              </div>
                              
                              <div className="space-y-1">
                                {clientesDistrito.map(cliente => (
                                  <div key={cliente.id} className="flex items-center gap-2 text-xs">
                                    <span className="text-lg">
                                      {cliente.categoria === 'oro' ? '🥇' : cliente.categoria === 'bronce' ? '🥉' : '🥈'}
                                    </span>
                                    <span className="flex-1 truncate">{cliente.nombre}</span>
                                    <span className="text-gray-500">S/{cliente.ingresoPromedio}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Leyenda */}
              <Separator className="my-4" />
              <div className="flex items-center gap-6 flex-wrap text-sm">
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-blue-500"></div>
                  <span>Móvil 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-green-500"></div>
                  <span>Móvil 2</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-yellow-500"></div>
                  <span>Móvil 3</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded" style={{ backgroundColor: '#22c55e', width: '12px', height: '12px' }}></div>
                  <span>Alta concentración (&gt;50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded" style={{ backgroundColor: '#f59e0b', width: '12px', height: '12px' }}></div>
                  <span>Media (30-50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded" style={{ backgroundColor: '#ef4444', width: '12px', height: '12px' }}></div>
                  <span>Baja (&lt;30%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VISTA POR MÓVIL */}
        <TabsContent value="movil" className="space-y-6">
          <div className="flex gap-2">
            {patronesPorMovil.map(patron => (
              <Button
                key={patron.movilId}
                variant={movilSeleccionado === patron.movilId ? 'default' : 'outline'}
                onClick={() => setMovilSeleccionado(patron.movilId)}
              >
                <Navigation className="size-4 mr-2" />
                {patron.movilNombre}
                <Badge className="ml-2" variant="secondary">
                  {patron.clientesTotales}
                </Badge>
              </Button>
            ))}
          </div>

          {patronesPorMovil.map(patron => (
            movilSeleccionado === patron.movilId && (
              <div key={patron.movilId} className="space-y-4">
                {/* KPIs del móvil */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Clientes Asignados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{patron.clientesTotales}</div>
                      <div className="flex gap-1 mt-2">
                        <Badge variant="outline" className="text-xs">🥇 {patron.distribucionCategorias.oro}</Badge>
                        <Badge variant="outline" className="text-xs">🥉 {patron.distribucionCategorias.bronce}</Badge>
                        <Badge variant="outline" className="text-xs">🥈 {patron.distribucionCategorias.plata}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Eficiencia Geográfica</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{patron.eficienciaActual.toFixed(0)}%</div>
                      <Badge variant={patron.eficienciaActual >= 70 ? 'default' : 'secondary'} className="mt-2">
                        {patron.eficienciaActual >= 70 ? 'Excelente' : 'Mejorable'}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">KM Promedio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{patron.kmPromedioRecorrido.toFixed(1)}</div>
                      <p className="text-xs text-gray-600 mt-1">Por jornada</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Ingreso/Hora</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">S/ {patron.ingresoPorHora.toFixed(0)}</div>
                      <p className="text-xs text-gray-600 mt-1">Promedio</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sub-zonas detectadas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="size-5 text-blue-600" />
                      Sub-Zonas Naturales Detectadas
                    </CardTitle>
                    <CardDescription>
                      Clusters geográficos basados en concentración de clientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patron.subZonasDetectadas.map(zona => (
                        <div 
                          key={zona.id}
                          className="p-4 border rounded-lg"
                          style={{ borderLeftWidth: '4px', borderLeftColor: getColorSubZona(zona.categoria) }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">{zona.distrito}</h4>
                                <Badge style={{ backgroundColor: getColorSubZona(zona.categoria), color: 'white' }}>
                                  {zona.categoria.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Clientes:</span>
                                  <div className="font-medium">{zona.clientes.length}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Concentración:</span>
                                  <div className="font-medium">{zona.concentracion.toFixed(1)}%</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Ingreso Potencial:</span>
                                  <div className="font-medium">S/ {zona.ingresoPotencial.toFixed(0)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {patron.subZonasDetectadas.length === 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Sin sub-zonas detectadas</AlertTitle>
                          <AlertDescription>
                            Este móvil necesita más clientes o mejor concentración geográfica
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recomendaciones */}
                {patron.recomendaciones.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="size-5 text-yellow-600" />
                        Recomendaciones de Optimización
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {patron.recomendaciones.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <Zap className="size-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          ))}

          {!movilSeleccionado && (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <div className="text-center text-gray-500">
                  <Navigation className="size-12 mx-auto mb-3 opacity-20" />
                  <p>Selecciona un móvil para ver el análisis detallado</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* VISTA SUB-ZONAS */}
        <TabsContent value="subzonas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="size-5 text-blue-600" />
                Todas las Sub-Zonas Detectadas
              </CardTitle>
              <CardDescription>
                Sistema automático de clustering basado en datos reales de operación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(detectarSubZonas).map(([movil, zonas]) => (
                  <div key={movil}>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Navigation className="size-4" />
                      {movil}
                      <Badge variant="outline">{zonas.length} sub-zonas</Badge>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {zonas.map(zona => (
                        <div 
                          key={zona.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                          style={{ borderLeftWidth: '4px', borderLeftColor: getColorSubZona(zona.categoria) }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{zona.distrito}</h4>
                              <p className="text-xs text-gray-600">ID: {zona.id}</p>
                            </div>
                            <Badge style={{ backgroundColor: getColorSubZona(zona.categoria), color: 'white' }}>
                              {zona.categoria}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600 text-xs">Clientes</span>
                              <div className="font-medium text-lg">{zona.clientes.length}</div>
                            </div>
                            <div>
                              <span className="text-gray-600 text-xs">Concentración</span>
                              <div className="font-medium text-lg">{zona.concentracion.toFixed(0)}%</div>
                            </div>
                            <div>
                              <span className="text-gray-600 text-xs">Ingreso/Mes</span>
                              <div className="font-medium">S/ {zona.ingresoPotencial.toFixed(0)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600 text-xs">Ubicación</span>
                              <div className="text-xs font-mono">
                                {zona.coordenadas.lat.toFixed(4)}, {zona.coordenadas.lng.toFixed(4)}
                              </div>
                            </div>
                          </div>

                          <Separator className="my-3" />

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">
                              Móvil sugerido: <strong>{zona.movilSugerido}</strong>
                            </span>
                            {zona.categoria === 'alta' && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                ✅ Óptima
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {zonas.length === 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No se detectaron sub-zonas para este móvil. Requiere más clientes o mejor distribución.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insight final */}
          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="size-5 text-blue-600" />
                ¿Cómo usar esta información?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Sub-zonas ALTAS (verde):</strong> Estas zonas tienen alta concentración de clientes. Mantén la asignación actual.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Sub-zonas MEDIAS (amarillo):</strong> Oportunidad de mejorar. Considera agregar más clientes cercanos o reasignar algunos dispersos.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Sub-zonas BAJAS (rojo):</strong> Baja eficiencia. Revisa si estos clientes deberían estar en otro móvil.
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="p-3 bg-blue-50 rounded">
                  <strong className="text-blue-900">💡 Próximo paso:</strong>
                  <p className="text-blue-800 mt-1">
                    Después de 2-3 meses de operación, usa este análisis para redefinir tus zonas basándote en datos reales, no en teoría. 
                    Las sub-zonas "ALTAS" son tus candidatas naturales para convertirse en zonas fijas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VISTA PREDICCIÓN */}
        <TabsContent value="prediccion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="size-5 text-blue-600" />
                Predicción de Vehículos
              </CardTitle>
              <CardDescription>
                Análisis de crecimiento y necesidad de nuevos vehículos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Móviles Activos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.movilesActivos}</div>
                      <p className="text-xs text-gray-600 mt-1">Actualmente operativos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Total Clientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.totalClientes}</div>
                      <p className="text-xs text-gray-600 mt-1">Activos en {periodoAnalisis}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Clientes por Móvil</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.clientesPorMovil.toFixed(2)}</div>
                      <p className="text-xs text-gray-600 mt-1">Promedio actual</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Clientes Frecuentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.clientesFrecuentes}</div>
                      <p className="text-xs text-gray-600 mt-1">3+ visitas/mes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Porcentaje Frecuentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.porcentajeFrecuentes.toFixed(1)}%</div>
                      <p className="text-xs text-gray-600 mt-1">Del total de clientes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Clientes Proyectados (3 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.clientesProyectados3Meses}</div>
                      <p className="text-xs text-gray-600 mt-1">Asumiendo 15% crecimiento trimestral</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Clientes Proyectados (6 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.clientesProyectados6Meses}</div>
                      <p className="text-xs text-gray-600 mt-1">Asumiendo 15% crecimiento trimestral</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Clientes Proyectados (12 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.clientesProyectados12Meses}</div>
                      <p className="text-xs text-gray-600 mt-1">Asumiendo 15% crecimiento trimestral</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Capacidad Óptima por Móvil</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.capacidadOptimaPorMovil}</div>
                      <p className="text-xs text-gray-600 mt-1">Para mantener 70%+ eficiencia</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Capacidad Actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.capacidadActual}</div>
                      <p className="text-xs text-gray-600 mt-1">Móviles activos x capacidad óptima</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Utilización Actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.utilizacionActual.toFixed(1)}%</div>
                      <p className="text-xs text-gray-600 mt-1">De la capacidad total</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Necesita Nuevo Móvil (3 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.necesitaNuevoMovil3M ? 'Sí' : 'No'}</div>
                      <p className="text-xs text-gray-600 mt-1">Basado en proyección de 3 meses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Necesita Nuevo Móvil (6 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.necesitaNuevoMovil6M ? 'Sí' : 'No'}</div>
                      <p className="text-xs text-gray-600 mt-1">Basado en proyección de 6 meses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Necesita Nuevo Móvil (12 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.necesitaNuevoMovil12M ? 'Sí' : 'No'}</div>
                      <p className="text-xs text-gray-600 mt-1">Basado en proyección de 12 meses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Ingreso Mensual Actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">S/ {prediccionVehiculos.ingresoMensualActual.toFixed(0)}</div>
                      <p className="text-xs text-gray-600 mt-1">Promedio de ingresos mensuales</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Ingreso Promedio por Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">S/ {prediccionVehiculos.ingresoPromedioPorCliente.toFixed(0)}</div>
                      <p className="text-xs text-gray-600 mt-1">Promedio de ingresos por cliente</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Ingreso Mensual Proyectado (12 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">S/ {prediccionVehiculos.ingresoMensualProyectado12M.toFixed(0)}</div>
                      <p className="text-xs text-gray-600 mt-1">Basado en proyección de 12 meses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Ingreso Adicional (12 meses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">S/ {prediccionVehiculos.ingresoAdicional12M.toFixed(0)}</div>
                      <p className="text-xs text-gray-600 mt-1">Diferencia entre proyección y actual</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Costo Nuevo Vehículo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">S/ {prediccionVehiculos.costoNuevoVehiculo.toFixed(0)}</div>
                      <p className="text-xs text-gray-600 mt-1">Inversión inicial</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Costos Operacionales Mensuales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">S/ {prediccionVehiculos.costosOperacionalesMensuales.toFixed(0)}</div>
                      <p className="text-xs text-gray-600 mt-1">Combustible, mantenimiento, seguro</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Ingreso Potencial Nuevo Móvil</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">S/ {prediccionVehiculos.ingresoPotencialNuevoMovil.toFixed(0)}</div>
                      <p className="text-xs text-gray-600 mt-1">Basado en capacidad óptima</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Utilidad Mensual Nuevo Móvil</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">S/ {prediccionVehiculos.utilidadMensualNuevoMovil.toFixed(0)}</div>
                      <p className="text-xs text-gray-600 mt-1">Ingreso potencial - costos operacionales</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Meses para ROI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.mesesParaROI.toFixed(1)}</div>
                      <p className="text-xs text-gray-600 mt-1">Meses para recuperar la inversión</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">ROI Anual (%)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl">{prediccionVehiculos.ROIAnualPorcentaje.toFixed(1)}%</div>
                      <p className="text-xs text-gray-600 mt-1">Retorno sobre la inversión anual</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}