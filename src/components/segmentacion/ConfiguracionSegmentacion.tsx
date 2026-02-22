import { useState, useMemo } from 'react';
import { Settings, Save, RotateCcw, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useSegmentacion } from './useSegmentacion';
import { SegmentacionConfig, calcularImpactoConfig, obtenerConfigCategoria } from '../../lib/segmentacionUtils';

interface ConfiguracionSegmentacionProps {
  clientes?: Array<{ id: string; nombre: string; mascotasActivas: number; gastoMensual: number }>;
}

export default function ConfiguracionSegmentacion({ clientes = [] }: ConfiguracionSegmentacionProps) {
  const { config, actualizarConfiguracion, restaurarConfiguracionDefault } = useSegmentacion();
  const [configTemporal, setConfigTemporal] = useState<SegmentacionConfig>(config);
  const [mostrarVistaPreviaImpacto, setMostrarVistaPreviaImpacto] = useState(false);

  // Calcular impacto de los cambios
  const impacto = useMemo(() => {
    if (!mostrarVistaPreviaImpacto || clientes.length === 0) return null;
    return calcularImpactoConfig(clientes, config, configTemporal);
  }, [clientes, config, configTemporal, mostrarVistaPreviaImpacto]);

  const handleActualizarCategoria = (
    categoriaId: 'oro' | 'bronce' | 'plata',
    campo: string,
    valor: any
  ) => {
    setConfigTemporal(prev => ({
      ...prev,
      categorias: prev.categorias.map(cat =>
        cat.id === categoriaId ? { ...cat, [campo]: valor } : cat
      )
    }));
  };

  const handleGuardar = () => {
    const resultado = actualizarConfiguracion(configTemporal);
    if (resultado.exito) {
      setMostrarVistaPreviaImpacto(false);
    }
  };

  const handleRestaurar = () => {
    if (confirm('¿Estás seguro de restaurar la configuración por defecto? Se perderán todos los cambios personalizados.')) {
      restaurarConfiguracionDefault();
      setConfigTemporal(config);
      setMostrarVistaPreviaImpacto(false);
    }
  };

  const handleVistaPreviaImpacto = () => {
    setMostrarVistaPreviaImpacto(true);
  };

  const categoriaOro = configTemporal.categorias.find(c => c.id === 'oro')!;
  const categoriaBronce = configTemporal.categorias.find(c => c.id === 'bronce')!;
  const categoriaPlata = configTemporal.categorias.find(c => c.id === 'plata')!;

  const hayCambios = JSON.stringify(config) !== JSON.stringify(configTemporal);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl flex items-center gap-3">
            <Settings className="size-7 text-blue-600" />
            Configuración de Segmentación
          </h2>
          <p className="text-gray-600 mt-1">
            Personaliza los umbrales, nombres y descuentos de las categorías de clientes
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRestaurar}>
            <RotateCcw className="size-4 mr-2" />
            Restaurar Default
          </Button>
          
          {hayCambios && (
            <Button onClick={handleGuardar}>
              <Save className="size-4 mr-2" />
              Guardar Cambios
            </Button>
          )}
        </div>
      </div>

      {/* Alerta de cambios pendientes */}
      {hayCambios && !mostrarVistaPreviaImpacto && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cambios sin guardar</AlertTitle>
          <AlertDescription>
            Has realizado cambios en la configuración. 
            <Button variant="link" onClick={handleVistaPreviaImpacto} className="p-0 h-auto ml-1">
              Ver impacto en clientes
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="oro">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="oro" className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-yellow-500" />
            Oro
          </TabsTrigger>
          <TabsTrigger value="bronce" className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-orange-500" />
            Bronce
          </TabsTrigger>
          <TabsTrigger value="plata" className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-gray-400" />
            Plata
          </TabsTrigger>
        </TabsList>

        {/* Tab ORO */}
        <TabsContent value="oro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🥇 Categoría Oro
                <Badge variant="secondary">{categoriaOro.nombre}</Badge>
              </CardTitle>
              <CardDescription>
                Clientes premium con mayor cantidad de mascotas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="oro-nombre">Nombre de la categoría</Label>
                  <Input
                    id="oro-nombre"
                    value={categoriaOro.nombre}
                    onChange={(e) => handleActualizarCategoria('oro', 'nombre', e.target.value)}
                    placeholder="Ej: Premium, VIP, Oro"
                  />
                  <p className="text-xs text-gray-500">
                    Nombre personalizado que verán tus clientes
                  </p>
                </div>

                {/* Icono */}
                <div className="space-y-2">
                  <Label htmlFor="oro-icono">Icono (emoji)</Label>
                  <Input
                    id="oro-icono"
                    value={categoriaOro.icono}
                    onChange={(e) => handleActualizarCategoria('oro', 'icono', e.target.value)}
                    placeholder="🥇"
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500">
                    Emoji que representa esta categoría
                  </p>
                </div>

                {/* Mascotas mínimas */}
                <div className="space-y-2">
                  <Label htmlFor="oro-min">Mascotas mínimas (activas)</Label>
                  <Input
                    id="oro-min"
                    type="number"
                    min={1}
                    value={categoriaOro.mascotasMin}
                    onChange={(e) => handleActualizarCategoria('oro', 'mascotasMin', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">
                    Cantidad mínima de mascotas activas para esta categoría
                  </p>
                </div>

                {/* Descuento */}
                <div className="space-y-2">
                  <Label htmlFor="oro-descuento">Descuento (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="oro-descuento"
                      type="number"
                      min={0}
                      max={100}
                      value={categoriaOro.descuento}
                      onChange={(e) => handleActualizarCategoria('oro', 'descuento', parseInt(e.target.value))}
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Descuento automático en todos los servicios
                  </p>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <Label htmlFor="oro-color">Color de identificación</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="oro-color"
                      type="color"
                      value={categoriaOro.color}
                      onChange={(e) => handleActualizarCategoria('oro', 'color', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={categoriaOro.color}
                      onChange={(e) => handleActualizarCategoria('oro', 'color', e.target.value)}
                      placeholder="#FFD700"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Color usado en mapas y reportes
                  </p>
                </div>
              </div>

              {/* Vista previa */}
              <div className="p-4 rounded-lg border-2" style={{ borderColor: categoriaOro.color, backgroundColor: `${categoriaOro.color}15` }}>
                <h4 className="text-sm mb-2">Vista Previa</h4>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: categoriaOro.color }}>
                    {categoriaOro.icono}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cliente {categoriaOro.nombre}</p>
                    <p className="text-xs text-gray-500">{categoriaOro.mascotasMin}+ mascotas activas • {categoriaOro.descuento}% descuento</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab BRONCE */}
        <TabsContent value="bronce" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🥉 Categoría Bronce
                <Badge variant="secondary">{categoriaBronce.nombre}</Badge>
              </CardTitle>
              <CardDescription>
                Tu base principal de clientes (65-70% del total)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bronce-nombre">Nombre de la categoría</Label>
                  <Input
                    id="bronce-nombre"
                    value={categoriaBronce.nombre}
                    onChange={(e) => handleActualizarCategoria('bronce', 'nombre', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bronce-icono">Icono (emoji)</Label>
                  <Input
                    id="bronce-icono"
                    value={categoriaBronce.icono}
                    onChange={(e) => handleActualizarCategoria('bronce', 'icono', e.target.value)}
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bronce-min">Mascotas mínimas</Label>
                  <Input
                    id="bronce-min"
                    type="number"
                    min={1}
                    value={categoriaBronce.mascotasMin}
                    onChange={(e) => handleActualizarCategoria('bronce', 'mascotasMin', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bronce-max">Mascotas máximas</Label>
                  <Input
                    id="bronce-max"
                    type="number"
                    min={1}
                    value={categoriaBronce.mascotasMax}
                    onChange={(e) => handleActualizarCategoria('bronce', 'mascotasMax', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bronce-descuento">Descuento (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="bronce-descuento"
                      type="number"
                      min={0}
                      max={100}
                      value={categoriaBronce.descuento}
                      onChange={(e) => handleActualizarCategoria('bronce', 'descuento', parseInt(e.target.value))}
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bronce-color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="bronce-color"
                      type="color"
                      value={categoriaBronce.color}
                      onChange={(e) => handleActualizarCategoria('bronce', 'color', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={categoriaBronce.color}
                      onChange={(e) => handleActualizarCategoria('bronce', 'color', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border-2" style={{ borderColor: categoriaBronce.color, backgroundColor: `${categoriaBronce.color}15` }}>
                <h4 className="text-sm mb-2">Vista Previa</h4>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: categoriaBronce.color }}>
                    {categoriaBronce.icono}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cliente {categoriaBronce.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {categoriaBronce.mascotasMin}-{categoriaBronce.mascotasMax} mascotas activas • {categoriaBronce.descuento}% descuento
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab PLATA */}
        <TabsContent value="plata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🥈 Categoría Plata
                <Badge variant="secondary">{categoriaPlata.nombre}</Badge>
              </CardTitle>
              <CardDescription>
                Clientes con una sola mascota
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="plata-nombre">Nombre de la categoría</Label>
                  <Input
                    id="plata-nombre"
                    value={categoriaPlata.nombre}
                    onChange={(e) => handleActualizarCategoria('plata', 'nombre', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plata-icono">Icono (emoji)</Label>
                  <Input
                    id="plata-icono"
                    value={categoriaPlata.icono}
                    onChange={(e) => handleActualizarCategoria('plata', 'icono', e.target.value)}
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plata-descuento">Descuento (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="plata-descuento"
                      type="number"
                      min={0}
                      max={100}
                      value={categoriaPlata.descuento}
                      onChange={(e) => handleActualizarCategoria('plata', 'descuento', parseInt(e.target.value))}
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plata-color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="plata-color"
                      type="color"
                      value={categoriaPlata.color}
                      onChange={(e) => handleActualizarCategoria('plata', 'color', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={categoriaPlata.color}
                      onChange={(e) => handleActualizarCategoria('plata', 'color', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border-2" style={{ borderColor: categoriaPlata.color, backgroundColor: `${categoriaPlata.color}15` }}>
                <h4 className="text-sm mb-2">Vista Previa</h4>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: categoriaPlata.color }}>
                    {categoriaPlata.icono}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cliente {categoriaPlata.nombre}</p>
                    <p className="text-xs text-gray-500">1 mascota activa • {categoriaPlata.descuento}% descuento</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vista previa de impacto */}
      {mostrarVistaPreviaImpacto && impacto && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-blue-600" />
              Impacto de los Cambios
            </CardTitle>
            <CardDescription>
              Estos son los cambios que se aplicarían a tus {clientes.length} clientes actuales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {impacto.impactoPorCategoria.map((cat) => {
                const config = obtenerConfigCategoria(cat.categoriaId, configTemporal);
                const tendencia = cat.diferencia > 0 ? 'up' : cat.diferencia < 0 ? 'down' : 'neutral';
                
                return (
                  <div key={cat.categoriaId} className="p-4 rounded-lg border-2" style={{ borderColor: config.color }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{config.icono}</span>
                      {tendencia === 'up' && <TrendingUp className="size-5 text-green-600" />}
                      {tendencia === 'down' && <TrendingDown className="size-5 text-red-600" />}
                      {tendencia === 'neutral' && <Minus className="size-5 text-gray-400" />}
                    </div>

                    <h4 className="text-sm text-gray-600 mb-2">{config.nombre}</h4>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Clientes:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{cat.clientesAntes}</span>
                          <span className="text-xs text-gray-400">→</span>
                          <span className="text-sm">{cat.clientesDespues}</span>
                          {cat.diferencia !== 0 && (
                            <span className={`text-xs ml-1 ${cat.diferencia > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({cat.diferencia > 0 ? '+' : ''}{cat.diferencia})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Ingresos:</span>
                        <div className="text-xs">
                          S/ {cat.ingresosAntes.toLocaleString()} → S/ {cat.ingresosDespues.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm">
                  <strong>Total Ingresos:</strong> S/ {impacto.totalIngresosAntes.toLocaleString()} → S/ {impacto.totalIngresosDespues.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Diferencia: {impacto.totalIngresosDespues - impacto.totalIngresosAntes >= 0 ? '+' : ''}
                  S/ {(impacto.totalIngresosDespues - impacto.totalIngresosAntes).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMostrarVistaPreviaImpacto(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGuardar}>
                  Aplicar Cambios
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}