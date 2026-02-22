import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { AddressGeocoder } from '../admin/AddressGeocoder';
import { ChevronLeft, UserPlus, AlertCircle, MapPin, Info } from 'lucide-react';

interface AuthModalStep2Props {
  regStreet: string;
  setRegStreet: (value: string) => void;
  regStreetNumber: string;
  setRegStreetNumber: (value: string) => void;
  regProvince: string;
  setRegProvince: (value: string) => void;
  regDistrict: string;
  setRegDistrict: (value: string) => void;
  regPostalCode: string;
  setRegPostalCode: (value: string) => void;
  regCoordinates: string;
  setRegCoordinates: (value: string) => void;
  regCountry: string;
  error: string;
  loading: boolean;
  onPrevious: () => void;
  onSubmit: (e: React.FormEvent) => void;
  districts: string[];
}

export function AuthModalStep2({
  regStreet,
  setRegStreet,
  regStreetNumber,
  setRegStreetNumber,
  regProvince,
  setRegProvince,
  regDistrict,
  setRegDistrict,
  regPostalCode,
  setRegPostalCode,
  regCoordinates,
  setRegCoordinates,
  regCountry,
  error,
  loading,
  onPrevious,
  onSubmit,
  districts
}: AuthModalStep2Props) {
  return (
    <motion.form
      key="register-step-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {/* Dirección */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Label className="mb-2 block">Calle *</Label>
          <Input
            type="text"
            value={regStreet}
            onChange={(e) => setRegStreet(e.target.value)}
            placeholder="Av. Larco"
            required
          />
        </div>
        <div>
          <Label className="mb-2 block">Número *</Label>
          <Input
            type="text"
            value={regStreetNumber}
            onChange={(e) => setRegStreetNumber(e.target.value)}
            placeholder="1234"
            required
          />
        </div>
      </div>

      {/* Provincia y Distrito */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">Provincia *</Label>
          <Input
            type="text"
            value={regProvince}
            onChange={(e) => setRegProvince(e.target.value)}
            required
            readOnly
            className="bg-muted"
          />
        </div>
        <div>
          <Label className="mb-2 block">Distrito *</Label>
          <select
            value={regDistrict}
            onChange={(e) => setRegDistrict(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            required
          >
            <option value="">Selecciona tu distrito</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Código Postal */}
      <div>
        <Label className="mb-2 block">Código Postal</Label>
        <Input
          type="text"
          value={regPostalCode}
          onChange={(e) => setRegPostalCode(e.target.value)}
          placeholder="15074 (opcional)"
        />
      </div>

      {/* Geocodificación Automática */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Ubicación (Detección Automática) - Opcional para Pruebas
        </h4>
        <AddressGeocoder
          direccion={`${regStreet} ${regStreetNumber}`.trim()}
          distrito={regDistrict}
          provincia={regProvince}
          onCoordinatesUpdate={(lat, lng) => {
            setRegCoordinates(`${lat},${lng}`);
          }}
          showMap={true}
        />
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p><strong>⚠️ MODO PRUEBAS HABILITADO:</strong></p>
            <p className="mt-1">Puedes crear tu cuenta sin detectar la ubicación. Sin embargo, para funcionalidades completas como asignación de rutas, se recomienda completar la geocodificación:</p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Completa tu dirección (calle, número, distrito)</li>
              <li>Presiona el botón <strong>"Autocompletar"</strong></li>
              <li>Tu ubicación se detectará automáticamente</li>
              <li>Verifica que el mapa muestre tu dirección correcta</li>
            </ol>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={loading}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>
      </div>

      {!regCoordinates && (
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
          ℹ️ Cuenta en modo pruebas - La ubicación se puede agregar después
        </p>
      )}
    </motion.form>
  );
}