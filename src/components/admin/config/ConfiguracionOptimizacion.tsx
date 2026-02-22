import { useState } from 'react';
import { Route, Save, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { toast } from 'sonner';

export default function ConfiguracionOptimizacion() {
  const [config, setConfig] = useState({
    habilitado: true,
    algoritmo: 'tsp',
    tiempo_max_ruta: 120,
    distancia_max_ruta: 50,
    paradas_max_ruta: 8,
    tiempo_buffer: 15,
    permitir_reorganizacion: true,
    notificar_cambios: true,
    priorizar_misma_zona: true
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success('✅ Configuración de optimización guardada');
    setHasChanges(false);
  };

  const algoritmos = [
    {
      id: 'greedy',
      nombre: 'Greedy (Codicioso)',
      descripcion: 'Más rápido, menos óptimo',
      velocidad: '⚡⚡⚡',
      optimizacion: '⭐⭐',
      recomendado: 'Pocas citas (<10)'
    },
    {
      id: 'tsp',
      nombre: 'TSP (Problema del Viajante)',
      descripcion: 'Óptimo, velocidad media',
      velocidad: '⚡⚡',
      optimizacion: '⭐⭐⭐⭐',
      recomendado: 'Uso general (10-30 citas)'
    },
    {
      id: 'genetic',
      nombre: 'Genetic (Algoritmo Genético)',
      descripcion: 'Muy óptimo, más lento',
      velocidad: '⚡',
      optimizacion: '⭐⭐⭐⭐⭐',
      recomendado: 'Muchas citas (30+)'
    }
  ];

  const algoritmoSeleccionado = algoritmos.find(a => a.id === config.algoritmo);

  return (
    <div className="space-y-6">
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-amber-800">Tienes cambios sin guardar</span>
          <Button size="sm" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            <Save className="size-4 mr-2" />
            Guardar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuración principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="size-5" />
                Optimización de Rutas
              </CardTitle>
              <CardDescription>
                Configura cómo se optimizan las rutas de servicio móvil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>Activar Optimizador</Label>
                  <p className="text-sm text-gray-500">
                    Organiza las citas para minimizar tiempo y distancia
                  </p>
                </div>
                <Switch
                  checked={config.habilitado}
                  onCheckedChange={(checked) => handleChange('habilitado', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Algoritmo */}
          <Card>
            <CardHeader>
              <CardTitle>Algoritmo de Optimización</CardTitle>
              <CardDescription>
                Selecciona el método de cálculo de rutas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {algoritmos.map((alg) => (
                  <div
                    key={alg.id}
                    onClick={() => handleChange('algoritmo', alg.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      config.algoritmo === alg.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4>{alg.nombre}</h4>
                      {config.algoritmo === alg.id && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Seleccionado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alg.descripcion}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Velocidad:</span> {alg.velocidad}
                      </div>
                      <div>
                        <span className="text-gray-500">Optimización:</span> {alg.optimizacion}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 {alg.recomendado}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Restricciones */}
          <Card>
            <CardHeader>
              <CardTitle>Restricciones de Ruta</CardTitle>
              <CardDescription>
                Límites operativos para cada ruta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tiempo máximo por ruta (minutos)</Label>
                <Input
                  type="number"
                  value={config.tiempo_max_ruta}
                  onChange={(e) => handleChange('tiempo_max_ruta', parseInt(e.target.value))}
                  min={30}
                  max={480}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Actualmente: {Math.floor(config.tiempo_max_ruta / 60)}h {config.tiempo_max_ruta % 60}min
                </p>
              </div>

              <div>
                <Label>Distancia máxima por ruta (km)</Label>
                <Input
                  type="number"
                  value={config.distancia_max_ruta}
                  onChange={(e) => handleChange('distancia_max_ruta', parseInt(e.target.value))}
                  min={5}
                  max={200}
                />
              </div>

              <div>
                <Label>Paradas máximas por ruta</Label>
                <Input
                  type="number"
                  value={config.paradas_max_ruta}
                  onChange={(e) => handleChange('paradas_max_ruta', parseInt(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>

              <div>
                <Label>Tiempo de buffer entre citas (minutos)</Label>
                <Input
                  type="number"
                  value={config.tiempo_buffer}
                  onChange={(e) => handleChange('tiempo_buffer', parseInt(e.target.value))}
                  min={0}
                  max={60}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tiempo extra entre citas para imprevistos
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Opciones Avanzadas */}
          <Card>
            <CardHeader>
              <CardTitle>Opciones Avanzadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>Permitir reorganización automática</Label>
                  <p className="text-sm text-gray-500">
                    Si un cliente cancela, reorganizar el resto
                  </p>
                </div>
                <Switch
                  checked={config.permitir_reorganizacion}
                  onCheckedChange={(checked) => handleChange('permitir_reorganizacion', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>Notificar cambios de horario</Label>
                  <p className="text-sm text-gray-500">
                    Avisar al cliente si cambia su hora estimada
                  </p>
                </div>
                <Switch
                  checked={config.notificar_cambios}
                  onCheckedChange={(checked) => handleChange('notificar_cambios', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>Priorizar rutas de misma zona</Label>
                  <p className="text-sm text-gray-500">
                    Agrupar citas cercanas geográficamente
                  </p>
                </div>
                <Switch
                  checked={config.priorizar_misma_zona}
                  onCheckedChange={(checked) => handleChange('priorizar_misma_zona', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info del algoritmo seleccionado */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-5" />
                {algoritmoSeleccionado?.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="mb-2">Características:</h4>
                <ul className="text-sm space-y-2">
                  <li>• {algoritmoSeleccionado?.descripcion}</li>
                  <li>• Velocidad: {algoritmoSeleccionado?.velocidad}</li>
                  <li>• Optimización: {algoritmoSeleccionado?.optimizacion}</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-blue-800 mb-2">Configuración Actual:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Hasta {config.paradas_max_ruta} paradas</li>
                  <li>• Máximo {config.tiempo_max_ruta} min por ruta</li>
                  <li>• Distancia ≤ {config.distancia_max_ruta} km</li>
                  <li>• Buffer de {config.tiempo_buffer} min/cita</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                ✓ Optimización activada<br />
                ✓ Ahorro estimado: 20-40% en tiempo
              </div>

              <Button className="w-full" variant="outline">
                Ver Simulación
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
