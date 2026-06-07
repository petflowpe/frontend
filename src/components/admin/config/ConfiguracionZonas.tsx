import { useState } from 'react';
import { MapPin, Plus, Trash2, Map, List, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toast } from 'sonner';
import { useZones } from '../../../hooks/useZones';

export default function ConfiguracionZonas() {
  const { zones, loading, createZone, updateZone, deleteZone } = useZones();

  const [newZona, setNewZona] = useState({
    nombre: '',
    coverage: 'Media',
    districtsText: '',
    color: '#3b82f6',
  });

  const handleAddZona = async () => {
    if (!newZona.nombre.trim()) {
      toast.error('Ingresa el nombre de la zona');
      return;
    }

    const districts = newZona.districtsText
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    try {
      await createZone({
        name: newZona.nombre.trim(),
        coverage: newZona.coverage,
        color: newZona.color,
        districts,
        active: true,
      });
      setNewZona({ nombre: '', coverage: 'Media', districtsText: '', color: '#3b82f6' });
    } catch {
      // toast en hook
    }
  };

  const handleToggleZona = async (id: number, active: boolean) => {
    try {
      await updateZone(id, { active: !active });
    } catch {
      // toast en hook
    }
  };

  const handleDeleteZona = async (id: number) => {
    try {
      await deleteZone(id);
    } catch {
      // toast en hook
    }
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
                  <Label>Cobertura</Label>
                  <Select
                    value={newZona.coverage}
                    onValueChange={(value) => setNewZona({ ...newZona, coverage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Básica">Básica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Distritos (separados por coma)</Label>
                  <Input
                    value={newZona.districtsText}
                    onChange={(e) => setNewZona({ ...newZona, districtsText: e.target.value })}
                    placeholder="Miraflores, San Isidro, Surco"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleAddZona} className="w-full" disabled={loading}>
                    <Plus className="size-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card className="p-8 text-center">
              <Loader2 className="size-10 mx-auto mb-3 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Cargando zonas...</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {zones.map((zona) => (
                <Card key={zona.id} className={!zona.active ? 'opacity-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="size-5 text-blue-600" style={{ color: zona.color || undefined }} />
                        <div>
                          <h4>{zona.name}</h4>
                          <p className="text-sm text-muted-foreground">{zona.coverage || 'Sin cobertura'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Switch
                          checked={zona.active !== false}
                          onCheckedChange={() => handleToggleZona(zona.id, zona.active !== false)}
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

                    <div className="mt-4 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Distritos: </span>
                      {(zona.districts || []).length > 0
                        ? (zona.districts || []).join(', ')
                        : 'Sin distritos asignados'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && zones.length === 0 && (
            <Card className="p-8 text-center">
              <MapPin className="size-12 mx-auto mb-4 text-muted-foreground" />
              <h3>No hay zonas configuradas</h3>
              <p className="text-muted-foreground mt-2">
                Agrega al menos una zona de cobertura para planificar rutas y asignar clientes.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <Card className="p-8 text-center">
            <Map className="size-12 mx-auto mb-4 text-muted-foreground" />
            <h3>Mapa Interactivo</h3>
            <p className="text-muted-foreground mt-2">
              Las coordenadas de zona se pueden configurar desde el API; el mapa se integrará en una fase posterior.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
