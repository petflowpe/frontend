import { useState } from 'react';
import { Users, Plus, Trash2, GripVertical, Save, RefreshCw, Sparkles, Copy, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { useTenantContext, Categoria } from '../../../hooks/useTenantContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';

export default function ConfiguracionSegmentacion() {
  const { tenant, configuracion, reloadConfig } = useTenantContext();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [config, setConfig] = useState({
    habilitado: configuracion.segmentacion?.habilitado ?? true,
    criterio: configuracion.segmentacion?.criterio || 'cantidad_mascotas',
    modo: configuracion.segmentacion?.modo || 'automatico',
    categorias: configuracion.segmentacion?.categorias || []
  });

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleCategoriaChange = (index: number, field: keyof Categoria, value: any) => {
    const newCategorias = [...config.categorias];
    newCategorias[index] = { ...newCategorias[index], [field]: value };
    handleChange('categorias', newCategorias);
  };

  const handleAddCategoria = () => {
    const newCategoria: Categoria = {
      id: `categoria-${Date.now()}`,
      nombre: 'Nueva Categoría',
      nombre_plural: 'Clientes Nueva Categoría',
      icono: '⭐',
      color: '#999999',
      orden: config.categorias.length + 1,
      umbral_min: 1,
      umbral_max: null,
      descuento_porcentaje: 0,
      prioridad_score: 10,
      beneficios: ['Servicio estándar'],
      activa: true
    };
    handleChange('categorias', [...config.categorias, newCategoria]);
  };

  const handleDeleteCategoria = (index: number) => {
    if (config.categorias.length <= 1) {
      toast.error('Debe haber al menos 1 categoría');
      return;
    }
    const newCategorias = config.categorias.filter((_, i) => i !== index);
    handleChange('categorias', newCategorias);
  };

  const handleDuplicateCategoria = (index: number) => {
    const original = config.categorias[index];
    const duplicate: Categoria = {
      ...original,
      id: `categoria-${Date.now()}`,
      nombre: `${original.nombre} (Copia)`,
      orden: config.categorias.length + 1
    };
    handleChange('categorias', [...config.categorias, duplicate]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validar que los umbrales no se solapen
      const sorted = [...config.categorias].sort((a, b) => a.umbral_min - b.umbral_min);
      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];
        if (current.umbral_max && current.umbral_max >= next.umbral_min) {
          toast.error(`❌ Los umbrales de "${current.nombre}" y "${next.nombre}" se solapan`);
          setIsSaving(false);
          return;
        }
      }

      // TODO: Guardar en backend Laravel
      // await apiClient.post('/configuracion-segmentacion', config)
      //   .update({ ...config })
      //   .eq('tenant_id', tenant.id)
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('✅ Configuración de segmentación guardada');
      setHasChanges(false);
      await reloadConfig();
    } catch (error) {
      toast.error('❌ Error al guardar');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const aplicarPlantilla = (tipo: 'simple' | 'estandar' | 'avanzada') => {
    const plantillas = {
      simple: [
        {
          id: 'vip',
          nombre: 'VIP',
          nombre_plural: 'Clientes VIP',
          icono: '⭐',
          color: '#FFD700',
          orden: 1,
          umbral_min: 2,
          umbral_max: null,
          descuento_porcentaje: 10,
          prioridad_score: 50,
          beneficios: ['10% descuento', 'Prioridad en agenda'],
          activa: true
        },
        {
          id: 'normal',
          nombre: 'Normal',
          nombre_plural: 'Clientes Normales',
          icono: '👤',
          color: '#888888',
          orden: 2,
          umbral_min: 1,
          umbral_max: 1,
          descuento_porcentaje: 0,
          prioridad_score: 10,
          beneficios: ['Servicio estándar'],
          activa: true
        }
      ],
      estandar: [
        {
          id: 'oro',
          nombre: 'Oro',
          nombre_plural: 'Clientes Oro',
          icono: '🥇',
          color: '#FFD700',
          orden: 1,
          umbral_min: 4,
          umbral_max: null,
          descuento_porcentaje: 15,
          prioridad_score: 50,
          beneficios: ['15% descuento', 'Prioridad alta', 'Cancelación flexible'],
          activa: true
        },
        {
          id: 'bronce',
          nombre: 'Bronce',
          nombre_plural: 'Clientes Bronce',
          icono: '🥉',
          color: '#CD7F32',
          orden: 2,
          umbral_min: 2,
          umbral_max: 3,
          descuento_porcentaje: 10,
          prioridad_score: 30,
          beneficios: ['10% descuento', 'Recordatorios personalizados'],
          activa: true
        },
        {
          id: 'plata',
          nombre: 'Plata',
          nombre_plural: 'Clientes Plata',
          icono: '🥈',
          color: '#C0C0C0',
          orden: 3,
          umbral_min: 1,
          umbral_max: 1,
          descuento_porcentaje: 0,
          prioridad_score: 10,
          beneficios: ['Servicio estándar'],
          activa: true
        }
      ],
      avanzada: [
        {
          id: 'diamante',
          nombre: 'Diamante',
          nombre_plural: 'Clientes Diamante',
          icono: '💎',
          color: '#B9F2FF',
          orden: 1,
          umbral_min: 10,
          umbral_max: null,
          descuento_porcentaje: 25,
          prioridad_score: 100,
          beneficios: ['25% descuento VIP', 'Servicio 24/7', 'Veterinario personal'],
          activa: true
        },
        {
          id: 'oro',
          nombre: 'Oro',
          nombre_plural: 'Clientes Oro',
          icono: '🥇',
          color: '#FFD700',
          orden: 2,
          umbral_min: 5,
          umbral_max: 9,
          descuento_porcentaje: 15,
          prioridad_score: 60,
          beneficios: ['15% descuento', 'Prioridad alta'],
          activa: true
        },
        {
          id: 'plata',
          nombre: 'Plata',
          nombre_plural: 'Clientes Plata',
          icono: '🥈',
          color: '#C0C0C0',
          orden: 3,
          umbral_min: 2,
          umbral_max: 4,
          descuento_porcentaje: 5,
          prioridad_score: 30,
          beneficios: ['5% descuento'],
          activa: true
        },
        {
          id: 'basico',
          nombre: 'Básico',
          nombre_plural: 'Clientes Básicos',
          icono: '👤',
          color: '#888888',
          orden: 4,
          umbral_min: 1,
          umbral_max: 1,
          descuento_porcentaje: 0,
          prioridad_score: 10,
          beneficios: ['Servicio estándar'],
          activa: true
        }
      ]
    };

    handleChange('categorias', plantillas[tipo] as Categoria[]);
    toast.success(`✅ Plantilla "${tipo}" aplicada`);
  };

  const iconosDisponibles = ['🥇', '🥈', '🥉', '💎', '⭐', '👑', '🏆', '🎖️', '🌟', '✨', '💫', '⚡', '🔥', '👤', '👥'];

  return (
    <div className="space-y-6">
      {/* Barra de acciones */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800">
            <RefreshCw className="size-5" />
            <span>Tienes cambios sin guardar</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setHasChanges(false)}>
              Descartar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? (
                <>
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuración general */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label htmlFor="habilitado" className="cursor-pointer">
                    Activar Segmentación
                  </Label>
                  <p className="text-sm text-gray-500">
                    Categorizar clientes automáticamente
                  </p>
                </div>
                <Switch
                  id="habilitado"
                  checked={config.habilitado}
                  onCheckedChange={(checked) => handleChange('habilitado', checked)}
                />
              </div>

              <div>
                <Label>Criterio de Segmentación</Label>
                <Select value={config.criterio} onValueChange={(value) => handleChange('criterio', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cantidad_mascotas">Cantidad de Mascotas</SelectItem>
                    <SelectItem value="facturacion">Facturación Mensual</SelectItem>
                    <SelectItem value="combinado">Combinado (Mascotas + Facturación)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Modo de Asignación</Label>
                <Select value={config.modo} onValueChange={(value) => handleChange('modo', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="automatico">Automático (recomendado)</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                {config.modo === 'automatico' && (
                  <p className="text-sm text-gray-500 mt-1">
                    ✅ La categoría se actualiza automáticamente al agregar/quitar mascotas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plantillas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5" />
                Plantillas Predefinidas
              </CardTitle>
              <CardDescription>
                Empieza rápido con configuraciones listas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => aplicarPlantilla('simple')}
              >
                <div className="flex items-center gap-2">
                  <span>⭐👤</span>
                  <div className="text-left">
                    <div>Simple (2 categorías)</div>
                    <div className="text-xs text-gray-500">VIP / Normal</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => aplicarPlantilla('estandar')}
              >
                <div className="flex items-center gap-2">
                  <span>🥇🥉🥈</span>
                  <div className="text-left">
                    <div>Estándar (3 categorías)</div>
                    <div className="text-xs text-gray-500">Oro / Bronce / Plata</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => aplicarPlantilla('avanzada')}
              >
                <div className="flex items-center gap-2">
                  <span>💎🥇🥈👤</span>
                  <div className="text-left">
                    <div>Avanzada (4 categorías)</div>
                    <div className="text-xs text-gray-500">Diamante / Oro / Plata / Básico</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Botón de vista previa */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Eye className="size-4 mr-2" />
                Vista Previa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Vista Previa de Categorías</DialogTitle>
                <DialogDescription>
                  Así se verán las categorías para tus clientes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {config.categorias.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-lg border-2"
                    style={{ borderColor: cat.color, backgroundColor: cat.color + '10' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{cat.icono}</span>
                      <div>
                        <h4 style={{ color: cat.color }}>{cat.nombre}</h4>
                        <p className="text-sm text-gray-600">
                          {cat.umbral_min}
                          {cat.umbral_max ? `-${cat.umbral_max}` : '+'} mascotas
                          {cat.descuento_porcentaje > 0 && ` • ${cat.descuento_porcentaje}% descuento`}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {cat.beneficios.map((ben, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-green-600">✓</span>
                          <span>{ben}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categorías */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3>Categorías ({config.categorias.length})</h3>
              <p className="text-sm text-gray-600">
                Personaliza cada categoría según tu modelo de negocio
              </p>
            </div>
            <Button onClick={handleAddCategoria} size="sm">
              <Plus className="size-4 mr-2" />
              Agregar Categoría
            </Button>
          </div>

          {config.categorias.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="size-12 mx-auto mb-4 text-gray-400" />
              <h3>No hay categorías configuradas</h3>
              <p className="text-gray-600 mt-2">
                Agrega al menos una categoría o usa una plantilla predefinida
              </p>
              <Button onClick={handleAddCategoria} className="mt-4">
                <Plus className="size-4 mr-2" />
                Crear Primera Categoría
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {config.categorias.map((categoria, index) => (
                <Card key={categoria.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="size-5 text-gray-400 cursor-move" />
                        <div>
                          <CardTitle className="text-lg">
                            {categoria.icono} {categoria.nombre}
                          </CardTitle>
                          <CardDescription>
                            Orden {categoria.orden}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateCategoria(index)}
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategoria(index)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre de la Categoría</Label>
                        <Input
                          value={categoria.nombre}
                          onChange={(e) => handleCategoriaChange(index, 'nombre', e.target.value)}
                          placeholder="Oro"
                        />
                      </div>

                      <div>
                        <Label>Nombre Plural</Label>
                        <Input
                          value={categoria.nombre_plural}
                          onChange={(e) => handleCategoriaChange(index, 'nombre_plural', e.target.value)}
                          placeholder="Clientes Oro"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Icono</Label>
                        <Select
                          value={categoria.icono}
                          onValueChange={(value) => handleCategoriaChange(index, 'icono', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconosDisponibles.map((icono) => (
                              <SelectItem key={icono} value={icono}>
                                <span className="text-xl">{icono}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Color</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={categoria.color}
                            onChange={(e) => handleCategoriaChange(index, 'color', e.target.value)}
                            className="size-10 rounded border cursor-pointer"
                          />
                          <Input
                            value={categoria.color}
                            onChange={(e) => handleCategoriaChange(index, 'color', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Orden</Label>
                        <Input
                          type="number"
                          value={categoria.orden}
                          onChange={(e) => handleCategoriaChange(index, 'orden', parseInt(e.target.value))}
                          min={1}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Umbral Mínimo (mascotas)</Label>
                        <Input
                          type="number"
                          value={categoria.umbral_min}
                          onChange={(e) => handleCategoriaChange(index, 'umbral_min', parseInt(e.target.value))}
                          min={1}
                        />
                      </div>

                      <div>
                        <Label>Umbral Máximo</Label>
                        <Input
                          type="number"
                          value={categoria.umbral_max || ''}
                          onChange={(e) => handleCategoriaChange(index, 'umbral_max', e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="∞ (sin límite)"
                        />
                      </div>

                      <div>
                        <Label>Descuento (%)</Label>
                        <Input
                          type="number"
                          value={categoria.descuento_porcentaje}
                          onChange={(e) => handleCategoriaChange(index, 'descuento_porcentaje', parseInt(e.target.value))}
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Beneficios (uno por línea)</Label>
                      <Textarea
                        value={categoria.beneficios.join('\n')}
                        onChange={(e) => handleCategoriaChange(index, 'beneficios', e.target.value.split('\n').filter(b => b.trim()))}
                        rows={4}
                        placeholder="15% de descuento&#10;Prioridad en agenda&#10;Cancelación flexible"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <Label>Categoría Activa</Label>
                      <Switch
                        checked={categoria.activa}
                        onCheckedChange={(checked) => handleCategoriaChange(index, 'activa', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="lg"
          >
            {isSaving ? (
              <>
                <RefreshCw className="size-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Guardar Categorías
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
