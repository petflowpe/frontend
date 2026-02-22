import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';

interface AddressGeocoderProps {
  direccion: string;
  distrito?: string;
  provincia?: string;
  onCoordinatesUpdate: (lat: number, lng: number) => void;
  apiKey?: string;
  showMap?: boolean;
}

interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
  distrito?: string;
  provincia?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMapsGeocoder: () => void;
  }
}

export function AddressGeocoder({
  direccion,
  distrito = '',
  provincia = 'Lima',
  onCoordinatesUpdate,
  apiKey,
  showMap = false
}: AddressGeocoderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const GOOGLE_MAPS_API_KEY = apiKey || 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY 
      ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY 
      : '') || 
    (typeof localStorage !== 'undefined' 
      ? localStorage.getItem('google_maps_api_key') || '' 
      : '');

  // Cargar Google Maps API
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    if (window.google?.maps) {
      setGoogleLoaded(true);
      return;
    }

    window.initGoogleMapsGeocoder = () => {
      setGoogleLoaded(true);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMapsGeocoder&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [GOOGLE_MAPS_API_KEY]);

  // Inicializar Google Places Autocomplete
  useEffect(() => {
    if (!googleLoaded || !inputRef.current) return;

    try {
      // Configurar Autocomplete para Lima, Perú
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'pe' },
        fields: ['address_components', 'geometry', 'formatted_address'],
        types: ['address']
      });

      // Bias hacia Lima
      const limaCenter = new window.google.maps.LatLng(-12.0464, -77.0428);
      const circle = new window.google.maps.Circle({
        center: limaCenter,
        radius: 50000 // 50km
      });
      autocomplete.setBounds(circle.getBounds());

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          setError('No se pudo obtener las coordenadas de esta dirección');
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        // Verificar que esté en Lima (aproximadamente)
        if (lat < -13 || lat > -11 || lng < -78 || lng > -76) {
          setError('La dirección debe estar en Lima, Perú');
          return;
        }

        setCoordinates({ lat, lng });
        onCoordinatesUpdate(lat, lng);
        setSuccess(true);
        setError(null);
        
        toast.success('✅ Coordenadas detectadas automáticamente');

        // Actualizar mapa si está visible
        if (showMap && mapInstanceRef.current) {
          updateMap(lat, lng);
        }
      });

      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error('Error inicializando autocomplete:', error);
    }
  }, [googleLoaded, onCoordinatesUpdate, showMap]);

  // Inicializar mapa
  useEffect(() => {
    if (!googleLoaded || !showMap || !mapRef.current || mapInstanceRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: -12.0464, lng: -77.0428 },
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    mapInstanceRef.current = map;
  }, [googleLoaded, showMap]);

  const updateMap = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    // Centrar mapa
    mapInstanceRef.current.setCenter({ lat, lng });
    mapInstanceRef.current.setZoom(16);

    // Remover marker anterior
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Agregar nuevo marker
    const marker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      animation: window.google.maps.Animation.DROP,
      title: 'Ubicación del cliente'
    });

    markerRef.current = marker;
  };

  const geocodeAddress = async () => {
    if (!googleLoaded) {
      setError('Google Maps aún no se ha cargado');
      return;
    }

    if (!direccion) {
      setError('Ingresa una dirección válida');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const geocoder = new window.google.maps.Geocoder();
      
      // Construir dirección completa
      const fullAddress = `${direccion}, ${distrito ? distrito + ', ' : ''}${provincia}, Perú`;

      const result = await new Promise<GeocodeResult>((resolve, reject) => {
        geocoder.geocode(
          { 
            address: fullAddress,
            componentRestrictions: {
              country: 'PE'
            }
          },
          (results: any[], status: string) => {
            if (status === 'OK' && results && results.length > 0) {
              const location = results[0].geometry.location;
              const lat = location.lat();
              const lng = location.lng();

              // Verificar que esté en Lima
              if (lat < -13 || lat > -11 || lng < -78 || lng > -76) {
                reject(new Error('La dirección no está en Lima, Perú'));
                return;
              }

              // Extraer componentes de dirección
              let distrito_found = '';
              let provincia_found = '';

              results[0].address_components?.forEach((component: any) => {
                if (component.types.includes('locality')) {
                  distrito_found = component.long_name;
                }
                if (component.types.includes('administrative_area_level_2')) {
                  provincia_found = component.long_name;
                }
              });

              resolve({
                lat,
                lng,
                formatted_address: results[0].formatted_address,
                distrito: distrito_found,
                provincia: provincia_found
              });
            } else {
              reject(new Error(`No se encontró la dirección: ${status}`));
            }
          }
        );
      });

      setCoordinates({ lat: result.lat, lng: result.lng });
      onCoordinatesUpdate(result.lat, result.lng);
      setSuccess(true);
      
      toast.success(`✅ Coordenadas detectadas: ${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}`);

      // Actualizar mapa
      if (showMap && mapInstanceRef.current) {
        updateMap(result.lat, result.lng);
      }

    } catch (err: any) {
      setError(err.message || 'Error al geocodificar la dirección');
      toast.error('❌ No se pudo detectar la ubicación');
    } finally {
      setLoading(false);
    }
  };

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          API Key de Google Maps no configurada. Ve a Configuración → Integraciones.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Campo de dirección con autocomplete */}
      <div>
        <Label htmlFor="direccion-autocomplete">
          Dirección Completa *
        </Label>
        <div className="flex gap-2 mt-1">
          <div className="flex-1">
            <Input
              id="direccion-autocomplete"
              ref={inputRef}
              type="text"
              defaultValue={direccion}
              placeholder="Ej: Av. Larco 1234, Miraflores"
              className="w-full"
              disabled={!googleLoaded}
            />
          </div>
          <Button
            type="button"
            onClick={geocodeAddress}
            disabled={loading || !googleLoaded}
            variant="secondary"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Detectando...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Autocompletar
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Escribe la dirección y presiona "Autocompletar" o selecciona una sugerencia
        </p>
      </div>

      {/* Estado de geocodificación */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && coordinates && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            ✅ Coordenadas detectadas: <strong>{coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Coordenadas (solo lectura) */}
      {coordinates && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <Label className="text-xs text-gray-600">Latitud</Label>
            <Input
              type="text"
              value={coordinates.lat.toFixed(6)}
              readOnly
              className="mt-1 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Longitud</Label>
            <Input
              type="text"
              value={coordinates.lng.toFixed(6)}
              readOnly
              className="mt-1 bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      )}

      {/* Mapa de vista previa */}
      {showMap && (
        <div className="border rounded-lg overflow-hidden">
          <div
            ref={mapRef}
            style={{ height: '300px', width: '100%' }}
            className="bg-gray-100"
          />
          {!googleLoaded && (
            <div className="h-[300px] flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Cargando mapa...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ayuda */}
      {!googleLoaded && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cargando Google Maps API para autocompletado de direcciones...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
