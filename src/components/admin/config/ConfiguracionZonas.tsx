import { useState } from 'react';
import { MapPin, Plus, Trash2, Save, Map, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toast } from 'sonner';

interface Zona {
  id: string;
  nombre: string;
  tipo: 'distrito' | 'provincia' | 'departamento' | 'personalizado';
  activa: boolean;
  tiempo_estimado_llegada: number;
  cantidad_clientes: number;
}

export default function ConfiguracionZonas() {
  const [zonas, setZonas] = useState<Zona[]>([
    { id: '1', nombre: 'Miraflores', tipo: 'distrito', activa: true, tiempo_estimado_llegada: 25, cantidad_clientes: 127 },
    { id: '2', nombre: 'San Isidro', tipo: 'distrito', activa: true, tiempo_estimado_llegada: 20, cantidad_clientes: 95 },
    { id: '3', nombre: 'Jesús María', tipo: 'distrito', activa: true, tiempo_estimado_llegada: 20, cantidad_clientes: 83 },
    { id: '4', nombre: 'Surco', tipo: 'distrito', activa: true, tiempo_estimado_llegada: 30, cantidad_clientes: 112 }
  ]);

  const [newZona, setNewZona] = useState({
    nombre: '',
    tipo: 'distrito' as const,
    tiempo_estimado: 20
  });

  const handleAddZona = () => {
    if (!newZona.nombre.trim()) {
      toast.error('Ingresa el nombre de la zona');
      return;
    }

    const zona: Zona = {
      id: Date.now().toString(),
      nombre: newZona.nombre,
      tipo: newZona.tipo,
      activa: true,
      tiempo_estimado_llegada: newZona.tiempo_estimado,
      cantidad_clientes: 0
    };

    setZonas([...zonas, zona]);
    setNewZona({ nombre: '', tipo: 'distrito', tiempo_estimado: 20 });
    toast.success(`✅ Zona "${zona.nombre}" agregada`);
  };

  const handleDeleteZona = (id: string) => {
    setZonas(zonas.filter(z => z.id !== id));
    toast.success('Zona eliminada');
  };

  const handleToggleZona = (id: string) => {
    setZonas(zonas.map(z => z.id === id ? { ...z, activa: !z.activa } : z));
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="size-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="size-4" />
            Mapa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4 mt-6">
          {/* Formulario para agregar zona */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="size-5" />
                Agregar Nueva Zona
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Nombre de la Zona</Label>
                  <Input
                    value={newZona.nombre}
                    onChange={(e) => setNewZona({ ...newZona, nombre: e.target.value })}
                    placeholder="Miraflores"
                  />
                </div>

                <div>
                  <Label>Tipo</Label>
                  <Select value={newZona.tipo} onValueChange={(value: any) => setNewZona({ ...newZona, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distrito">Distrito</SelectItem>
                      <SelectItem value="provincia">Provincia</SelectItem>
                      <SelectItem value="departamento">Departamento</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tiempo estimado (min)</Label>
                  <Input
                    type="number"
                    value={newZona.tiempo_estimado}
                    onChange={(e) => setNewZona({ ...newZona, tiempo_estimado: parseInt(e.target.value) })}
                    min={1}
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleAddZona} className="w-full">
                    <Plus className="size-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de zonas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zonas.map((zona) => (
              <Card key={zona.id} className={!zona.activa ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="size-5 text-blue-600" />
                      <div>
                        <h4>{zona.nombre}</h4>
                        <p className="text-sm text-gray-600 capitalize">{zona.tipo}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Switch
                        checked={zona.activa}
                        onCheckedChange={() => handleToggleZona(zona.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteZona(zona.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Clientes:</span>
                      <span className="ml-2">{zona.cantidad_clientes}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo:</span>
                      <span className="ml-2">~{zona.tiempo_estimado_llegada} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {zonas.length === 0 && (
            <Card className="p-8 text-center">
              <MapPin className="size-12 mx-auto mb-4 text-gray-400" />
              <h3>No hay zonas configuradas</h3>
              <p className="text-gray-600 mt-2">
                Agrega al menos una zona de cobertura
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <Card className="p-8 text-center">
            <Map className="size-12 mx-auto mb-4 text-gray-400" />
            <h3>Mapa Interactivo</h3>
            <p className="text-gray-600 mt-2">
              Próximamente: Selecciona zonas en el mapa interactivo
            </p>
            <div className="mt-6 bg-gray-100 rounded-lg p-12">
              <p className="text-gray-500">
                [Integración con Leaflet/Google Maps]
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
