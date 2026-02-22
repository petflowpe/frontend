import { useState } from 'react';
import { Truck, Plus, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { toast } from 'sonner';

interface Vehiculo {
  id: string;
  nombre: string;
  tipo: string;
  placa: string;
  capacidad_slots: number;
  capacidad_por_categoria: {
    oro: number;
    bronce: number;
    plata: number;
  };
  activo: boolean;
}

export default function ConfiguracionVehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([
    {
      id: '1',
      nombre: 'Furgoneta Grande #1',
      tipo: 'furgoneta_grande',
      placa: 'ABC-123',
      capacidad_slots: 10,
      capacidad_por_categoria: { oro: 2, bronce: 1.5, plata: 1 },
      activo: true
    },
    {
      id: '2',
      nombre: 'Auto Compacto #2',
      tipo: 'auto_compacto',
      placa: 'XYZ-789',
      capacidad_slots: 4,
      capacidad_por_categoria: { oro: 2, bronce: 1.5, plata: 1 },
      activo: true
    }
  ]);

  const [newVehiculo, setNewVehiculo] = useState({
    nombre: '',
    tipo: 'furgoneta_grande',
    placa: '',
    capacidad: 10
  });

  const handleAddVehiculo = () => {
    if (!newVehiculo.nombre.trim() || !newVehiculo.placa.trim()) {
      toast.error('Completa todos los campos');
      return;
    }

    const vehiculo: Vehiculo = {
      id: Date.now().toString(),
      nombre: newVehiculo.nombre,
      tipo: newVehiculo.tipo,
      placa: newVehiculo.placa,
      capacidad_slots: newVehiculo.capacidad,
      capacidad_por_categoria: { oro: 2, bronce: 1.5, plata: 1 },
      activo: true
    };

    setVehiculos([...vehiculos, vehiculo]);
    setNewVehiculo({ nombre: '', tipo: 'furgoneta_grande', placa: '', capacidad: 10 });
    toast.success(`✅ Vehículo "${vehiculo.nombre}" agregado`);
  };

  const handleDeleteVehiculo = (id: string) => {
    setVehiculos(vehiculos.filter(v => v.id !== id));
    toast.success('Vehículo eliminado');
  };

  const handleToggleVehiculo = (id: string) => {
    setVehiculos(vehiculos.map(v => v.id === id ? { ...v, activo: !v.activo } : v));
  };

  const calcularCapacidadEjemplo = (vehiculo: Vehiculo) => {
    const slotsTotal = vehiculo.capacidad_slots;
    const capacidadOro = Math.floor(slotsTotal / vehiculo.capacidad_por_categoria.oro);
    const capacidadBronce = Math.floor(slotsTotal / vehiculo.capacidad_por_categoria.bronce);
    const capacidadPlata = Math.floor(slotsTotal / vehiculo.capacidad_por_categoria.plata);

    return {
      oro: capacidadOro,
      bronce: capacidadBronce,
      plata: capacidadPlata
    };
  };

  return (
    <div className="space-y-6">
      {/* Formulario para agregar vehículo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-5" />
            Agregar Nuevo Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={newVehiculo.nombre}
                onChange={(e) => setNewVehiculo({ ...newVehiculo, nombre: e.target.value })}
                placeholder="Furgoneta 1"
              />
            </div>

            <div>
              <Label>Tipo</Label>
              <Select value={newVehiculo.tipo} onValueChange={(value) => setNewVehiculo({ ...newVehiculo, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="furgoneta_grande">Furgoneta Grande</SelectItem>
                  <SelectItem value="furgoneta_mediana">Furgoneta Mediana</SelectItem>
                  <SelectItem value="auto_compacto">Auto Compacto</SelectItem>
                  <SelectItem value="camioneta">Camioneta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Placa</Label>
              <Input
                value={newVehiculo.placa}
                onChange={(e) => setNewVehiculo({ ...newVehiculo, placa: e.target.value.toUpperCase() })}
                placeholder="ABC-123"
                maxLength={8}
              />
            </div>

            <div>
              <Label>Capacidad (slots)</Label>
              <Input
                type="number"
                value={newVehiculo.capacidad}
                onChange={(e) => setNewVehiculo({ ...newVehiculo, capacidad: parseInt(e.target.value) })}
                min={1}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddVehiculo} className="w-full">
                <Plus className="size-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de vehículos */}
      <div className="grid grid-cols-1 gap-4">
        {vehiculos.map((vehiculo) => {
          const capacidadEjemplo = calcularCapacidadEjemplo(vehiculo);

          return (
            <Card key={vehiculo.id} className={!vehiculo.activo ? 'opacity-50' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Truck className="size-6 text-blue-600" />
                    <div>
                      <h4>{vehiculo.nombre}</h4>
                      <p className="text-sm text-gray-600">
                        {vehiculo.placa} • {vehiculo.tipo.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Switch
                      checked={vehiculo.activo}
                      onCheckedChange={() => handleToggleVehiculo(vehiculo.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteVehiculo(vehiculo.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Capacidad por categoría */}
                  <div>
                    <Label className="text-sm text-gray-600">Slots por Categoría</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                        <span className="text-sm">🥇 Oro</span>
                        <span className="font-medium">{vehiculo.capacidad_por_categoria.oro} slots</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <span className="text-sm">🥉 Bronce</span>
                        <span className="font-medium">{vehiculo.capacidad_por_categoria.bronce} slots</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">🥈 Plata</span>
                        <span className="font-medium">{vehiculo.capacidad_por_categoria.plata} slot</span>
                      </div>
                    </div>
                  </div>

                  {/* Capacidad total */}
                  <div>
                    <Label className="text-sm text-gray-600">
                      Capacidad Total: {vehiculo.capacidad_slots} slots
                    </Label>
                    <div className="mt-2 space-y-2">
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm text-gray-600 mb-2">Ejemplos de ocupación:</p>
                        <ul className="text-sm space-y-1">
                          <li>• {capacidadEjemplo.oro} clientes Oro (solo)</li>
                          <li>• {capacidadEjemplo.bronce} clientes Bronce (solo)</li>
                          <li>• {capacidadEjemplo.plata} clientes Plata (solo)</li>
                          <li className="text-blue-800">
                            • 2 Oro + 4 Bronce = {(2 * vehiculo.capacidad_por_categoria.oro) + (4 * vehiculo.capacidad_por_categoria.bronce)} slots
                            {(2 * vehiculo.capacidad_por_categoria.oro) + (4 * vehiculo.capacidad_por_categoria.bronce) <= vehiculo.capacidad_slots ? ' ✓' : ' ✗'}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {vehiculos.length === 0 && (
        <Card className="p-8 text-center">
          <Truck className="size-12 mx-auto mb-4 text-gray-400" />
          <h3>No hay vehículos configurados</h3>
          <p className="text-gray-600 mt-2">
            Agrega al menos un vehículo para el servicio móvil
          </p>
        </Card>
      )}

      {/* Información */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="text-blue-800 mb-2">💡 ¿Cómo funcionan los slots?</h4>
          <p className="text-sm text-blue-700">
            Los "slots" son unidades abstractas que representan espacio/tiempo del vehículo.
            Clientes de categoría superior ocupan más slots porque suelen tener más mascotas
            y requieren más tiempo de atención. Esto ayuda a optimizar las rutas y evitar sobrecargar vehículos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
