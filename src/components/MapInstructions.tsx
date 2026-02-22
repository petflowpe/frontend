import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Map, Navigation, Zap, CheckCircle2, Circle, Pentagon, MapPin, Clock } from 'lucide-react';

export function MapInstructions() {
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Map className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
              Sistema GPS de Rutas Inteligentes
            </h2>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Optimización automática y validación geográfica en tiempo real
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Visualización */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500 rounded">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                A) Visualización de Zonas
              </h3>
            </div>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300 ml-10">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Mapa interactivo con todas las zonas de cobertura en colores</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Haz clic en cualquier zona para ver estadísticas y detalles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Citas mostradas en tiempo real con código de colores por estado</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Modo pantalla completa para mejor visualización</span>
              </li>
            </ul>
          </div>

          {/* Creación Visual */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500 rounded">
                <Pentagon className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                B) Creación Visual de Zonas
              </h3>
            </div>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300 ml-10">
              <li className="flex items-start gap-2">
                <Circle className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                <span><strong>Zona Circular:</strong> Click para centro, arrastra para radio</span>
              </li>
              <li className="flex items-start gap-2">
                <Pentagon className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                <span><strong>Zona Polígono:</strong> Clicks para puntos, doble-click para finalizar</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                <span>Asigna automáticamente distritos según coordenadas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                <span>Edita y personaliza cada zona después de crearla</span>
              </li>
            </ul>
          </div>

          {/* Optimización */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 rounded">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                C) Optimización GPS
              </h3>
            </div>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300 ml-10">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <span>Calcula ruta óptima entre todas las citas del día</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <span>Distancia y tiempo real con fórmula de Haversine</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <span>Algoritmos: Vecino Más Cercano + 2-opt</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <span>Reordena automáticamente según eficiencia</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <span>Muestra ahorro: km, minutos, litros de combustible</span>
              </li>
            </ul>
          </div>

          {/* Validación */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-500 rounded">
                <Navigation className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                D) Validación Automática
              </h3>
            </div>
            <ul className="text-sm space-y-2 text-gray-700 dark:text-gray-300 ml-10">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Verifica si dirección está en zona del vehículo</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Alertas si la dirección está fuera de cobertura</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Sugiere vehículos alternativos disponibles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Calcula distancia al centro de la zona</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <span>Integrable en módulo de Citas al crear nueva cita</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Ventajas */}
        <div className="pt-4 border-t-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Ventajas del Sistema GPS:
            </h3>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <Badge variant="outline" className="py-2 px-3 justify-center text-xs">
              ✅ 100% Gratuito - OpenStreetMap
            </Badge>
            <Badge variant="outline" className="py-2 px-3 justify-center text-xs">
              🚀 Sin API Keys necesarias
            </Badge>
            <Badge variant="outline" className="py-2 px-3 justify-center text-xs">
              🗺️ Cobertura completa de Perú
            </Badge>
            <Badge variant="outline" className="py-2 px-3 justify-center text-xs">
              ⚡ Optimización en tiempo real
            </Badge>
            <Badge variant="outline" className="py-2 px-3 justify-center text-xs">
              🎯 Precisión GPS alta
            </Badge>
            <Badge variant="outline" className="py-2 px-3 justify-center text-xs">
              💰 Ahorro de combustible y tiempo
            </Badge>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700">
          <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🔄 Para usar el sistema:
          </div>
          <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
            <li>Visualiza todas las zonas en el mapa interactivo</li>
            <li>Crea nuevas zonas dibujando directamente en el mapa</li>
            <li>Selecciona una ruta existente para optimizarla con GPS</li>
            <li>El validador geográfico se activará automáticamente al crear citas</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}
