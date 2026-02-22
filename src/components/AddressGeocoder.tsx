import { useState, useEffect } from 'react';
import { MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { geocodingService } from '../services/geocodingService';
import { toast } from 'sonner';

interface AddressGeocoderProps {
  address: string;
  onCoordinatesFound: (coordinates: { lat: number; lng: number }) => void;
  className?: string;
}

export function AddressGeocoder({ address, onCoordinatesFound, className = '' }: AddressGeocoderProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGeocode = async () => {
    if (!address || address.trim().length < 5) {
      setError('Dirección muy corta');
      return;
    }

    setIsGeocoding(true);
    setError(null);

    try {
      const result = await geocodingService.geocodeAddress(address, 'Lima, Perú');
      
      if (result) {
        setGeocodeResult(result.coordinates);
        onCoordinatesFound(result.coordinates);
        toast.success('📍 Coordenadas obtenidas exitosamente', {
          description: `${result.coordinates.lat.toFixed(6)}, ${result.coordinates.lng.toFixed(6)}`
        });
      } else {
        setError('No se pudo geocodificar la dirección');
        toast.error('❌ No se encontró la dirección');
      }
    } catch (err) {
      setError('Error al geocodificar');
      toast.error('❌ Error al obtener coordenadas');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Auto-geocodificar cuando cambia la dirección
  useEffect(() => {
    const timer = setTimeout(() => {
      if (address && address.trim().length > 10) {
        handleGeocode();
      }
    }, 1000); // Esperar 1 segundo después de que el usuario deje de escribir

    return () => clearTimeout(timer);
  }, [address]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGeocode}
          disabled={isGeocoding || !address}
        >
          {isGeocoding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Obteniendo coordenadas...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Geocodificar
            </>
          )}
        </Button>

        {geocodeResult && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Coordenadas obtenidas
          </Badge>
        )}

        {error && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </Badge>
        )}
      </div>

      {geocodeResult && (
        <div className="text-xs text-muted-foreground">
          📍 {geocodeResult.lat.toFixed(6)}, {geocodeResult.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
