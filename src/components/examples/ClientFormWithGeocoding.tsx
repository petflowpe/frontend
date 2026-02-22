import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddressGeocoder } from '../admin/AddressGeocoder';
import { toast } from 'sonner';
import { Save, User } from 'lucide-react';

interface ClientFormData {
  nombre: string;
  telefono: string;
  email: string;
  calle: string;
  numero: string;
  distrito: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
  latitud: number | null;
  longitud: number | null;
  numeroMascotas: number;
}

export function ClientFormWithGeocoding() {
  const [formData, setFormData] = useState<ClientFormData>({
    nombre: '',
    telefono: '',
    email: '',
    calle: '',
    numero: '',
    distrito: '',
    provincia: 'Lima',
    codigoPostal: '',
    pais: 'Perú',
    latitud: null,
    longitud: null,
    numeroMascotas: 1
  });

  const handleCoordinatesUpdate = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitud: lat,
      longitud: lng
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.latitud || !formData.longitud) {
      toast.error('❌ Debes detectar las coordenadas antes de guardar');
      return;
    }

    console.log('Datos del cliente:', formData);
    
    toast.success('✅ Cliente guardado exitosamente', {
      description: `Ubicación: ${formData.latitud.toFixed(6)}, ${formData.longitud.toFixed(6)}`
    });
  };

  const handleInputChange = (field: keyof ClientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const direccionCompleta = `${formData.calle} ${formData.numero}`.trim();

  const distritosLima = [
    'Miraflores', 'San Isidro', 'Surco', 'La Molina', 'San Borja',
    'Barranco', 'Jesús María', 'Lince', 'Magdalena', 'San Miguel',
    'Pueblo Libre', 'Breña', 'La Victoria', 'Cercado de Lima'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Registro de Cliente - SmartPet
          </CardTitle>
          <CardDescription>
            Completa los datos del cliente. Las coordenadas se detectarán automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    placeholder="987654321"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="cliente@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="mascotas">Número de Mascotas *</Label>
                  <Input
                    id="mascotas"
                    type="number"
                    min="1"
                    value={formData.numeroMascotas}
                    onChange={(e) => handleInputChange('numeroMascotas', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                Dirección
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="calle">Calle *</Label>
                  <Input
                    id="calle"
                    type="text"
                    value={formData.calle}
                    onChange={(e) => handleInputChange('calle', e.target.value)}
                    placeholder="Av. Larco"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="numero">Número *</Label>
                  <Input
                    id="numero"
                    type="text"
                    value={formData.numero}
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    placeholder="1234"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="distrito">Distrito *</Label>
                  <Select
                    value={formData.distrito}
                    onValueChange={(value) => handleInputChange('distrito', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu distrito" />
                    </SelectTrigger>
                    <SelectContent>
                      {distritosLima.map(distrito => (
                        <SelectItem key={distrito} value={distrito}>
                          {distrito}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="provincia">Provincia *</Label>
                  <Input
                    id="provincia"
                    type="text"
                    value={formData.provincia}
                    onChange={(e) => handleInputChange('provincia', e.target.value)}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label htmlFor="codigo-postal">Código Postal</Label>
                  <Input
                    id="codigo-postal"
                    type="text"
                    value={formData.codigoPostal}
                    onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                    placeholder="15074"
                  />
                </div>

                <div>
                  <Label htmlFor="pais">País</Label>
                  <Input
                    id="pais"
                    type="text"
                    value={formData.pais}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Geocodificación Automática */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">
                Coordenadas (Detección Automática)
              </h3>

              <AddressGeocoder
                direccion={direccionCompleta}
                distrito={formData.distrito}
                provincia={formData.provincia}
                onCoordinatesUpdate={handleCoordinatesUpdate}
                showMap={true}
              />

              {formData.latitud && formData.longitud && (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✅ Cliente ubicado en el mapa. Listo para guardar.
                  </p>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={!formData.latitud || !formData.longitud}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Cliente
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (confirm('¿Cancelar el registro?')) {
                    window.history.back();
                  }
                }}
              >
                Cancelar
              </Button>
            </div>

            {!formData.latitud && (
              <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                ⚠️ Debes detectar las coordenadas antes de guardar
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Preview de datos */}
      {formData.latitud && formData.longitud && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Vista Previa de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
