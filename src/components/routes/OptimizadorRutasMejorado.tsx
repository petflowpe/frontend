import { useState, useMemo } from 'react';
import { Zap, TrendingDown, Clock, Navigation, DollarSign, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Separator } from '../ui/separator';
import {
  Parada,
  Ruta,
  optimizarRuta,
  compararRutas,
  calcularEstadisticasRuta,
  necesitaOptimizacion,
  calcularCostoCombustible
} from '../../lib/rutasOptimizacion';

interface OptimizadorRutasMejoradoProps {
  ruta: Ruta;
  onAplicarOptimizacion?: (paradasOptimizadas: Parada[]) => void;
}

export default function OptimizadorRutasMejorado({ ruta, onAplicarOptimizacion }: OptimizadorRutasMejoradoProps) {
  const [mostrarComparacion, setMostrarComparacion] = useState(false);

  // Verificar si necesita optimización
  const analisis = useMemo(() => {
    const result = necesitaOptimizacion(ruta);
    console.log('🔍 Análisis de optimización:', result);
    return result;
  }, [ruta]);

  // Calcular estadísticas de la ruta actual
  const statsActuales = useMemo(() => {
    return calcularEstadisticasRuta(ruta);
  }, [ruta]);

  // Generar ruta optimizada
  const paradasOptimizadas = useMemo(() => {
    return optimizarRuta(ruta.paradas);
  }, [ruta.paradas]);

  // Calcular estadísticas de la ruta optimizada
  const statsOptimizadas = useMemo(() => {
    const rutaOptimizada = { ...ruta, paradas: paradasOptimizadas };
    return calcularEstadisticasRuta(rutaOptimizada);
  }, [ruta, paradasOptimizadas]);

  // Comparar ambas rutas
  const comparacion = useMemo(() => {
    return compararRutas(ruta.paradas, paradasOptimizadas);
  }, [ruta.paradas, paradasOptimizadas]);

  // Calcular costos
  const costoActual = calcularCostoCombustible(statsActuales.distanciaTotal);
  const costoOptimizado = calcularCostoCombustible(statsOptimizadas.distanciaTotal);
  const ahorroSoles = costoActual - costoOptimizado;

  const handleOptimizar = () => {
    if (onAplicarOptimizacion) {
      onAplicarOptimizacion(paradasOptimizadas);
    }
  };

  // Colores por categoría
  const getCategoriaColor = (categoria: 'oro' | 'bronce' | 'plata') => {
    switch (categoria) {
      case 'oro': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'bronce': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'plata': return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoriaIcono = (categoria: 'oro' | 'bronce' | 'plata') => {
    switch (categoria) {
      case 'oro': return '🥇';
      case 'bronce': return '🥉';
      case 'plata': return '🥈';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerta de optimización */}
      {analisis.necesita ? (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">⚠️ Esta ruta puede optimizarse</AlertTitle>
          <AlertDescription className="text-yellow-800">
            {analisis.razon}
            <Button
              size="sm"
              onClick={() => {
                console.log('🔘 Click en Ver detalles');
                setMostrarComparacion(true);
              }}
              className="ml-4 bg-yellow-600 hover:bg-yellow-700"
            >
              Ver detalles
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">✅ Ruta Optimizada</AlertTitle>
          <AlertDescription className="text-green-800">
            Esta ruta ya está optimizada siguiendo las mejores prácticas de eficiencia.
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas actuales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="size-5 text-blue-600" />
            Estadísticas de la Ruta
          </CardTitle>
          <CardDescription>
            Análisis completo del recorrido planificado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="size-4 text-blue-600" />
                <span className="text-xs text-blue-800">Total Paradas</span>
              </div>
              <p className="text-2xl">{statsActuales.totalParadas}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="size-4 text-purple-600" />
                <span className="text-xs text-purple-800">Distancia</span>
              </div>
              <p className="text-2xl">{statsActuales.distanciaTotal} km</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="size-4 text-orange-600" />
                <span className="text-xs text-orange-800">Tiempo Total</span>
              </div>
              <p className="text-2xl">{Math.floor(statsActuales.tiempoTotal / 60)}h {statsActuales.tiempoTotal % 60}m</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="size-4 text-green-600" />
                <span className="text-xs text-green-800">Ingresos Est.</span>
              </div>
              <p className="text-2xl">S/ {statsActuales.ingresosEstimados}</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Distribución por categoría */}
          <div>
            <h4 className="text-sm mb-3">Distribución de Clientes</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-3 rounded-lg border ${getCategoriaColor('oro')}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg">{getCategoriaIcono('oro')}</span>
                  <span className="text-2xl">{statsActuales.clientesOro}</span>
                </div>
                <p className="text-xs mt-1">Oro (Prioridad)</p>
              </div>

              <div className={`p-3 rounded-lg border ${getCategoriaColor('bronce')}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg">{getCategoriaIcono('bronce')}</span>
                  <span className="text-2xl">{statsActuales.clientesBronce}</span>
                </div>
                <p className="text-xs mt-1">Bronce</p>
              </div>

              <div className={`p-3 rounded-lg border ${getCategoriaColor('plata')}`}>
                <div className="flex items-center justify-between">
                  <span className="text-lg">{getCategoriaIcono('plata')}</span>
                  <span className="text-2xl">{statsActuales.clientesPlata}</span>
                </div>
                <p className="text-xs mt-1">Plata</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Eficiencia */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Eficiencia de la Ruta</p>
              <p className="text-xs text-gray-500">Basado en ingresos/hora</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-3xl">{statsActuales.eficiencia}%</div>
              <Badge variant={statsActuales.eficiencia >= 80 ? 'default' : 'secondary'}>
                {statsActuales.eficiencia >= 80 ? 'Excelente' : 'Buena'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparación de optimización */}
      {mostrarComparacion && (
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-green-600" />
              Beneficios de la Optimización
            </CardTitle>
            <CardDescription>
              Comparación entre ruta actual vs ruta optimizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="size-4 text-green-600" />
                  <span className="text-xs text-green-800">Ahorro en Distancia</span>
                </div>
                <p className="text-3xl text-green-900 mb-1">{comparacion.distanciaAhorrada} km</p>
                <p className="text-xs text-green-700">
                  {comparacion.distanciaOriginal} km → {comparacion.distanciaOptimizada} km
                </p>
                <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                  -{comparacion.porcentajeAhorro}%
                </Badge>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="size-4 text-blue-600" />
                  <span className="text-xs text-blue-800">Ahorro en Tiempo</span>
                </div>
                <p className="text-3xl text-blue-900 mb-1">{comparacion.tiempoAhorrado} min</p>
                <p className="text-xs text-blue-700">
                  {Math.floor(comparacion.tiempoOriginal / 60)}h {comparacion.tiempoOriginal % 60}m → {Math.floor(comparacion.tiempoOptimizado / 60)}h {comparacion.tiempoOptimizado % 60}m
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="size-4 text-yellow-600" />
                  <span className="text-xs text-yellow-800">Ahorro Combustible</span>
                </div>
                <p className="text-3xl text-yellow-900 mb-1">S/ {ahorroSoles.toFixed(2)}</p>
                <p className="text-xs text-yellow-700">
                  S/ {costoActual.toFixed(2)} → S/ {costoOptimizado.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Comparación de orden */}
            <div className="space-y-4">
              <h4 className="text-sm">Orden de Paradas</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Orden actual */}
                <div>
                  <h5 className="text-xs text-gray-600 mb-2 flex items-center gap-2">
                    <Badge variant="secondary">Actual</Badge>
                    Sin optimizar
                  </h5>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {ruta.paradas.map((parada, index) => (
                      <div key={parada.id} className="p-3 bg-gray-50 rounded border text-sm">
                        <div className="flex items-start gap-2">
                          <span className="size-6 rounded-full bg-gray-300 flex items-center justify-center text-xs flex-shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="truncate">{parada.clienteNombre}</p>
                              <Badge className={getCategoriaColor(parada.categoria)} variant="outline">
                                {getCategoriaIcono(parada.categoria)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 truncate">{parada.direccion}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Orden optimizado */}
                <div>
                  <h5 className="text-xs text-gray-600 mb-2 flex items-center gap-2">
                    <Badge className="bg-green-600">Optimizado</Badge>
                    Prioridad + Proximidad
                  </h5>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {paradasOptimizadas.map((parada, index) => (
                      <div key={parada.id} className="p-3 bg-green-50 rounded border border-green-200 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="size-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs flex-shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="truncate">{parada.clienteNombre}</p>
                              <Badge className={getCategoriaColor(parada.categoria)} variant="outline">
                                {getCategoriaIcono(parada.categoria)}
                              </Badge>
                              {parada.categoria === 'oro' && (
                                <Badge className="bg-yellow-500 text-white text-xs">
                                  ⭐ PRIORITARIO
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 truncate">{parada.direccion}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div>
                <p className="text-sm">
                  <strong>Beneficio Total:</strong> Ahorras {comparacion.distanciaAhorrada} km y {comparacion.tiempoAhorrado} minutos
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Los clientes Oro se atenderán primero, optimizando la satisfacción
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMostrarComparacion(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleOptimizar} className="bg-green-600 hover:bg-green-700">
                  <Zap className="size-4 mr-2" />
                  Aplicar Optimización
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón de optimización rápida */}
      {!mostrarComparacion && (
        <Button 
          onClick={() => setMostrarComparacion(true)}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <Zap className="size-5 mr-2" />
          {analisis.necesita ? 'Optimizar Ruta Ahora' : 'Ver Análisis de Optimización'}
          {comparacion.distanciaAhorrada > 0 && (
            <Badge className="ml-2 bg-white text-green-700">
              Ahorra {comparacion.distanciaAhorrada} km
            </Badge>
          )}
        </Button>
      )}
    </div>
  );
}