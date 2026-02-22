import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Phone, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';

interface Cliente {
  id: string;
  nombre: string;
  categoria: 'oro' | 'bronce' | 'plata';
  mascotas: number;
  mascotasActivas: number;
  distrito: string;
  direccion: string;
  lat: number;
  lng: number;
  gastoMensual: number;
  ultimaCita?: string;
  telefono?: string;
  ruta?: string;
}

interface MapaClientesGoogleProps {
  clientes: Cliente[];
  coloresCategorias: {
    oro: string;
    bronce: string;
    plata: string;
  };
  filtrosRutas: Record<string, boolean>;
  apiKey?: string;
}

// Declarar tipos de Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export default function MapaClientesGoogle({ 
  clientes, 
  coloresCategorias, 
  filtrosRutas,
  apiKey 
}: MapaClientesGoogleProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);
  const routeLinesRef = useRef<any[]>([]);
  const markerClusterer = useRef<any>(null);

  // API Key por defecto (se debe reemplazar con la del usuario)
  const GOOGLE_MAPS_API_KEY = apiKey || 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY 
      ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY 
      : '') || 
    (typeof localStorage !== 'undefined' 
      ? localStorage.getItem('google_maps_api_key') || '' 
      : '');
  
  // Cargar Google Maps API
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setLoadError('API Key de Google Maps no configurada. Ve a Configuración > Integraciones.');
      return;
    }

    if (window.google?.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    // Callback global para cuando cargue Google Maps
    window.initGoogleMaps = () => {
      setGoogleMapsLoaded(true);
    };

    // Cargar script de Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMaps&libraries=places,geometry,visualization`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setLoadError('Error al cargar Google Maps. Verifica tu API Key y conexión a internet.');
    };
    
    document.head.appendChild(script);

    return () => {
      // No removemos el script para evitar problemas con hot reload
    };
  }, [GOOGLE_MAPS_API_KEY]);

  // Cargar MarkerClusterer
  useEffect(() => {
    if (!googleMapsLoaded) return;

    const loadMarkerClusterer = async () => {
      try {
        // Importar MarkerClusterer desde CDN
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
        script.async = true;
        document.head.appendChild(script);
      } catch (error) {
        console.warn('No se pudo cargar MarkerClusterer:', error);
      }
    };

    loadMarkerClusterer();
  }, [googleMapsLoaded]);

  // Inicializar mapa
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || map) return;

    try {
      // Centro de Lima, Perú
      const initialMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: -12.1, lng: -77.03 },
        zoom: 12,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
        },
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(initialMap);
    } catch (error) {
      console.error('Error inicializando mapa:', error);
      setLoadError('Error al inicializar el mapa. Recarga la página.');
    }
  }, [googleMapsLoaded, mapRef]);

  // Actualizar markers cuando cambian los clientes
  useEffect(() => {
    if (!map || !googleMapsLoaded) return;

    // Limpiar markers anteriores
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Limpiar líneas de rutas anteriores
    routeLinesRef.current.forEach(line => line.setMap(null));
    routeLinesRef.current = [];

    // Limpiar clusterer anterior
    if (markerClusterer.current) {
      markerClusterer.current.clearMarkers();
    }

    const bounds = new window.google.maps.LatLngBounds();

    // Crear markers para cada cliente
    clientes.forEach(cliente => {
      const color = coloresCategorias[cliente.categoria];
      
      // Crear marker con icono personalizado
      const marker = new window.google.maps.Marker({
        position: { lat: cliente.lat, lng: cliente.lng },
        map: map,
        title: cliente.nombre,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
          scale: 10
        },
        animation: window.google.maps.Animation.DROP
      });

      // Crear InfoWindow con información detallada
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: system-ui; max-width: 300px;">
            <div style="
              background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
              color: white;
              padding: 12px;
              margin: -12px -12px 12px -12px;
              border-radius: 8px 8px 0 0;
            ">
              <h3 style="margin: 0; font-size: 16px; font-weight: bold;">
                ${cliente.nombre}
              </h3>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">
                ${cliente.categoria.toUpperCase()} • ${cliente.distrito}
              </p>
            </div>
            
            <div style="padding: 8px 0;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 18px;">🐾</span>
                <div>
                  <p style="margin: 0; font-size: 12px; color: #666;">Mascotas</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 600;">
                    ${cliente.mascotasActivas} activas ${cliente.mascotas > cliente.mascotasActivas ? `(${cliente.mascotas - cliente.mascotasActivas} fallecida)` : ''}
                  </p>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 18px;">📍</span>
                <div>
                  <p style="margin: 0; font-size: 12px; color: #666;">Dirección</p>
                  <p style="margin: 0; font-size: 13px;">${cliente.direccion}</p>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 18px;">💰</span>
                <div>
                  <p style="margin: 0; font-size: 12px; color: #666;">Gasto mensual</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #10b981;">
                    S/ ${cliente.gastoMensual}
                  </p>
                </div>
              </div>

              ${cliente.ultimaCita ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;">📅</span>
                  <div>
                    <p style="margin: 0; font-size: 12px; color: #666;">Última cita</p>
                    <p style="margin: 0; font-size: 13px;">${cliente.ultimaCita}</p>
                  </div>
                </div>
              ` : ''}

              ${cliente.ruta ? `
                <div style="
                  margin-top: 12px;
                  padding: 8px;
                  background-color: ${cliente.ruta === 'Ruta 1' ? '#dbeafe' : cliente.ruta === 'Ruta 2' ? '#f3e8ff' : '#fed7aa'};
                  border-radius: 6px;
                  text-align: center;
                ">
                  <p style="margin: 0; font-size: 12px; color: #666;">Asignado a</p>
                  <p style="margin: 0; font-size: 14px; font-weight: 600;">
                    ${cliente.ruta}
                  </p>
                </div>
              ` : ''}

              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=${cliente.lat},${cliente.lng}" 
                  target="_blank"
                  style="
                    display: inline-block;
                    width: 100%;
                    padding: 8px;
                    background-color: #3b82f6;
                    color: white;
                    text-align: center;
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                  "
                >
                  🗺️ Cómo llegar
                </a>
              </div>
            </div>
          </div>
        `
      });

      // Click en marker
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
      bounds.extend({ lat: cliente.lat, lng: cliente.lng });
    });

    // Dibujar rutas con Google Polylines
    const rutasData = {
      'Ruta 1': {
        color: '#3b82f6',
        clientes: clientes.filter(c => c.ruta === 'Ruta 1')
      },
      'Ruta 2': {
        color: '#a855f7',
        clientes: clientes.filter(c => c.ruta === 'Ruta 2')
      },
      'Ruta 3': {
        color: '#f97316',
        clientes: clientes.filter(c => c.ruta === 'Ruta 3')
      }
    };

    Object.entries(rutasData).forEach(([nombreRuta, { color, clientes: clientesRuta }]) => {
      if (filtrosRutas[nombreRuta] && clientesRuta.length > 1) {
        const path = clientesRuta.map(c => ({ lat: c.lat, lng: c.lng }));
        
        const polyline = new window.google.maps.Polyline({
          path: path,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: map
        });

        routeLinesRef.current.push(polyline);
      }
    });

    // Ajustar vista si hay clientes
    if (clientes.length > 0) {
      map.fitBounds(bounds);
      
      // Si solo hay un cliente, hacer zoom apropiado
      if (clientes.length === 1) {
        map.setZoom(15);
      }
    }

    // Intentar aplicar clustering si está disponible
    if (window.markerClusterer && clientes.length > 10) {
      try {
        markerClusterer.current = new window.markerClusterer.MarkerClusterer({
          map,
          markers: markersRef.current
        });
      } catch (error) {
        console.warn('MarkerClusterer no disponible:', error);
      }
    }

  }, [clientes, map, googleMapsLoaded, coloresCategorias, filtrosRutas]);

  // Mostrar error si la API Key no está configurada
  if (loadError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-50 rounded-lg" style={{ minHeight: '500px' }}>
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <p>{loadError}</p>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Para configurar Google Maps:</p>
              <ol className="text-sm list-decimal list-inside space-y-1">
                <li>Obtén una API Key de Google Cloud Platform</li>
                <li>Habilita "Maps JavaScript API"</li>
                <li>Configúrala en Settings &gt; Integraciones</li>
              </ol>
              <Button 
                size="sm" 
                className="w-full mt-2"
                onClick={() => window.open('/docs/GOOGLE_MAPS_SETUP.md', '_blank')}
              >
                📖 Ver Guía Completa
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: '500px' }} />
      
      {/* Leyenda */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 z-10 max-w-xs">
        <h4 className="text-sm mb-3 font-semibold">Leyenda</h4>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-full" style={{ backgroundColor: coloresCategorias.oro }} />
            <span className="text-sm">Clientes Oro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-full" style={{ backgroundColor: coloresCategorias.bronce }} />
            <span className="text-sm">Clientes Bronce</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-full" style={{ backgroundColor: coloresCategorias.plata }} />
            <span className="text-sm">Clientes Plata</span>
          </div>
        </div>

        <div className="border-t pt-3 space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-gray-600">Rutas</h4>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-blue-500" />
            <span className="text-sm">Ruta 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-purple-500" />
            <span className="text-sm">Ruta 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-orange-500" />
            <span className="text-sm">Ruta 3</span>
          </div>
        </div>

        <div className="border-t pt-3 mt-3">
          <p className="text-xs text-gray-600">
            Total: {clientes.length} clientes visualizados
          </p>
        </div>

        <div className="border-t pt-3 mt-3">
          <p className="text-xs text-blue-600 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Powered by Google Maps
          </p>
        </div>
      </div>

      {/* Indicador de carga */}
      {!googleMapsLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando Google Maps...</p>
            <p className="text-sm text-gray-500 mt-2">Esto puede tardar unos segundos</p>
          </div>
        </div>
      )}
    </div>
  );
}