import { useState } from 'react';
import { Target, Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Slider } from '../../ui/slider';
import { toast } from 'sonner';

export default function ConfiguracionPriorizacion() {
  const [config, setConfig] = useState({
    habilitado: true,
    puntos_oro: 50,
    puntos_bronce: 30,
    puntos_plata: 10,
    puntos_por_mes: 1,
    meses_maximos: 24,
    puntos_frecuencia_alta: 10,
    puntos_frecuencia_media: 5,
    umbral_frecuencia_alta: 4,
    puntos_emergencia: 100,
    puntos_urgente: 50
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast.success('✅ Configuración de priorización guardada');
    setHasChanges(false);
  };

  // Ejemplo de cálculo
  const ejemploCliente = {
    categoria: 'Oro',
    meses_antiguedad: 12,
    citas_mes: 5,
    urgencia: 'normal'
  };

  const calcularScore = () => {
    let score = 0;
    
    // Por categoría
    if (ejemploCliente.categoria === 'Oro') score += config.puntos_oro;
    else if (ejemploCliente.categoria === 'Bronce') score += config.puntos_bronce;
    else score += config.puntos_plata;

    // Por antigüedad
    score += Math.min(ejemploCliente.meses_antiguedad, config.meses_maximos) * config.puntos_por_mes;

    // Por frecuencia
    if (ejemploCliente.citas_mes >= config.umbral_frecuencia_alta) {
      score += config.puntos_frecuencia_alta;
    } else if (ejemploCliente.citas_mes >= 2) {
      score += config.puntos_frecuencia_media;
    }

    // Por urgencia
    if (ejemploCliente.urgencia === 'emergencia') score += config.puntos_emergencia;
    else if (ejemploCliente.urgencia === 'urgente') score += config.puntos_urgente;

    return score;
  };

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
        {/* Configuración */}
        <div className="lg:col-span-2 space-y-6">
          {/* Por Categoría */}
          <Card>
            <CardHeader>
              <CardTitle>Scoring por Categoría de Cliente</CardTitle>
              <CardDescription>
                Puntos base según la categoría del cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>Activar Sistema de Priorización</Label>
                <Switch
                  checked={config.habilitado}
                  onCheckedChange={(checked) => handleChange('habilitado', checked)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>🥇 Cliente Oro</Label>
                  <span className="text-sm text-gray-600">{config.puntos_oro} puntos</span>
                </div>
                <Slider
                  value={[config.puntos_oro]}
                  onValueChange={([value]) => handleChange('puntos_oro', value)}
                  max={100}
                  step={5}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>🥉 Cliente Bronce</Label>
                  <span className="text-sm text-gray-600">{config.puntos_bronce} puntos</span>
                </div>
                <Slider
                  value={[config.puntos_bronce]}
                  onValueChange={([value]) => handleChange('puntos_bronce', value)}
                  max={100}
                  step={5}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>🥈 Cliente Plata</Label>
                  <span className="text-sm text-gray-600">{config.puntos_plata} puntos</span>
                </div>
                <Slider
                  value={[config.puntos_plata]}
                  onValueChange={([value]) => handleChange('puntos_plata', value)}
                  max={100}
                  step={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Por Antigüedad */}
          <Card>
            <CardHeader>
              <CardTitle>Scoring por Antigüedad</CardTitle>
              <CardDescription>
                Bonificación por tiempo como cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Puntos por cada mes de antigüedad</Label>
                <Input
                  type="number"
                  value={config.puntos_por_mes}
                  onChange={(e) => handleChange('puntos_por_mes', parseInt(e.target.value))}
                  min={0}
                  max={10}
                />
              </div>

              <div>
                <Label>Antigüedad máxima considerada (meses)</Label>
                <Input
                  type="number"
                  value={config.meses_maximos}
                  onChange={(e) => handleChange('meses_maximos', parseInt(e.target.value))}
                  min={1}
                  max={60}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Evita que clientes muy antiguos tengan puntuación infinita
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Por Frecuencia */}
          <Card>
            <CardHeader>
              <CardTitle>Scoring por Frecuencia</CardTitle>
              <CardDescription>
                Bonificación por cantidad de citas mensuales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Umbral frecuencia alta (citas/mes)</Label>
                  <Input
                    type="number"
                    value={config.umbral_frecuencia_alta}
                    onChange={(e) => handleChange('umbral_frecuencia_alta', parseInt(e.target.value))}
                    min={1}
                  />
                </div>

                <div>
                  <Label>Puntos por frecuencia alta</Label>
                  <Input
                    type="number"
                    value={config.puntos_frecuencia_alta}
                    onChange={(e) => handleChange('puntos_frecuencia_alta', parseInt(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <div>
                <Label>Puntos por frecuencia media (2-3 citas/mes)</Label>
                <Input
                  type="number"
                  value={config.puntos_frecuencia_media}
                  onChange={(e) => handleChange('puntos_frecuencia_media', parseInt(e.target.value))}
                  min={0}
                />
              </div>
            </CardContent>
          </Card>

          {/* Por Urgencia */}
          <Card>
            <CardHeader>
              <CardTitle>Scoring por Urgencia</CardTitle>
              <CardDescription>
                Multiplicador de prioridad según tipo de servicio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Emergencia</Label>
                  <Input
                    type="number"
                    value={config.puntos_emergencia}
                    onChange={(e) => handleChange('puntos_emergencia', parseInt(e.target.value))}
                    min={0}
                  />
                  <p className="text-xs text-gray-500 mt-1">Máxima prioridad</p>
                </div>

                <div>
                  <Label>Urgente</Label>
                  <Input
                    type="number"
                    value={config.puntos_urgente}
                    onChange={(e) => handleChange('puntos_urgente', parseInt(e.target.value))}
                    min={0}
                  />
                  <p className="text-xs text-gray-500 mt-1">Alta prioridad</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5" />
                Ejemplo de Cálculo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="mb-3">Cliente de Ejemplo:</h4>
                <ul className="text-sm space-y-2">
                  <li>• Categoría: <strong>Oro</strong></li>
                  <li>• Antigüedad: <strong>12 meses</strong></li>
                  <li>• Citas/mes: <strong>5</strong></li>
                  <li>• Urgencia: <strong>Normal</strong></li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm text-gray-600">Desglose del Score:</h4>
                
                <div className="flex items-center justify-between text-sm p-2 bg-yellow-50 rounded">
                  <span>Por categoría Oro</span>
                  <span className="font-medium">+{config.puntos_oro}</span>
                </div>

                <div className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded">
                  <span>Por antigüedad ({ejemploCliente.meses_antiguedad} meses)</span>
                  <span className="font-medium">+{ejemploCliente.meses_antiguedad * config.puntos_por_mes}</span>
                </div>

                <div className="flex items-center justify-between text-sm p-2 bg-green-50 rounded">
                  <span>Por alta frecuencia</span>
                  <span className="font-medium">+{config.puntos_frecuencia_alta}</span>
                </div>

                <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span>Por urgencia normal</span>
                  <span className="font-medium">+0</span>
                </div>

                <div className="border-t pt-2 mt-2">
                  <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-lg">
                    <span>Score Total</span>
                    <span className="text-xl">{calcularScore()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                💡 Los clientes con mayor score obtienen prioridad en la asignación de horarios
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
