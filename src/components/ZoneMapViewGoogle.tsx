import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Maximize2, Minimize2, Edit, Trash2, Save, X, Circle as CircleIcon, Pentagon, Plus, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

interface Zone {
  id: string;
  name: string;
  color: string;
  districts: string[];
  coverage: string;
  demand: number;
  coordinates: {
    center: { lat: number; lng: number };
    radius?: number;
    polygon?: Array<{ lat: number; lng: number }>;
  };
}

interface Appointment {
  id: string;
  client: string;
  pet: string;
  address: string;
  district: string;
  coordinates: { lat: number; lng: number };
  status: string;
  time: string;
}

interface ZoneMapViewGoogleProps {
  zones: Zone[];
  appointments?: Appointment[];
  selectedZone?: Zone | null;
  onZoneClick?: (zone: Zone) => void;
  onZoneUpdate?: (zone: Zone) => void;
  onZoneCreate?: (zone: Omit<Zone, 'id'>) => void;
  onZoneDelete?: (zoneId: string) => void;
  editable?: boolean;
  apiKey?: string;
}

declare global {
  interface Window {
    google: any;
    initGoogleMapsZones: () => void;
  }
}

export function ZoneMapViewGoogle({ 
  zones, 
  appointments = [], 
  selectedZone,
  onZoneClick,
  onZoneUpdate,
  onZoneCreate,
  onZoneDelete,
  editable = false,
  apiKey
}: ZoneMapViewGoogleProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'none' | 'circle' | 'polygon'>('none');
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const zoneShapesRef = useRef<any[]>([]);
  const appointmentMarkersRef = useRef<any[]>([]);
  const drawingManagerRef = useRef<any>(null);

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
      setLoadError('API Key de Google Maps no configurada');
      return;
    }

    if (window.google?.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    window.initGoogleMapsZones = () => {
      setGoogleMapsLoaded(true);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMapsZones&libraries=drawing,places,geometry`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setLoadError('Error al cargar Google Maps');
    };
    
    document.head.appendChild(script);
  }, [GOOGLE_MAPS_API_KEY]);

  // Inicializar mapa
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: -12.0464, lng: -77.0428 },
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Inicializar Drawing Manager si es editable
      if (editable && window.google.maps.drawing) {
        const drawingManager = new window.google.maps.drawing.DrawingManager({
          drawingMode: null,
          drawingControl: false,
          circleOptions: {
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#3b82f6',
            clickable: false,
            editable: true,
            zIndex: 1
          },
          polygonOptions: {
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#3b82f6',
            clickable: false,
            editable: true,
            zIndex: 1
          }
        });

        drawingManager.setMap(map);
        drawingManagerRef.current = drawingManager;

        // Listeners para cuando se complete el dibujo
        window.google.maps.event.addListener(drawingManager, 'circlecomplete', (circle: any) => {
          const center = circle.getCenter();
          const radius = circle.getRadius() / 1000; // Convertir a km

          if (onZoneCreate) {
            const newZone: Omit<Zone, 'id'> = {
              name: 'Nueva Zona Circular',
              color: '#3b82f6',
              districts: [],
              coverage: 'Media',
              demand: 50,
              coordinates: {
                center: { lat: center.lat(), lng: center.lng() },
                radius: radius
              }
            };
            onZoneCreate(newZone);
          }

          circle.setMap(null);
          drawingManager.setDrawingMode(null);
          setDrawingMode('none');
          toast.success('✅ Zona circular creada');
        });

        window.google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: any) => {
          const path = polygon.getPath();
          const coordinates: Array<{ lat: number; lng: number }> = [];
          
          for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            coordinates.push({ lat: point.lat(), lng: point.lng() });
          }

          if (onZoneCreate && coordinates.length > 0) {
            const newZone: Omit<Zone, 'id'> = {
              name: 'Nueva Zona Polígono',
              color: '#3b82f6',
              districts: [],
              coverage: 'Media',
              demand: 50,
              coordinates: {
                center: coordinates[0],
                polygon: coordinates
              }
            };
            onZoneCreate(newZone);
          }

          polygon.setMap(null);
          drawingManager.setDrawingMode(null);
          setDrawingMode('none');
          toast.success('✅ Zona poligonal creada');
        });
      }

      mapInstanceRef.current = map;
    } catch (error) {
      console.error('Error inicializando mapa:', error);
      setLoadError('Error al inicializar el mapa');
    }
  }, [googleMapsLoaded, editable, onZoneCreate]);

  // Renderizar zonas
  useEffect(() => {
    if (!mapInstanceRef.current || !googleMapsLoaded) return;

    // Limpiar zonas anteriores
    zoneShapesRef.current.forEach(shape => shape.setMap(null));
    zoneShapesRef.current = [];

    zones.forEach(zone => {
      let shape: any;

      if (zone.coordinates.polygon && zone.coordinates.polygon.length > 0) {
        // Zona polígono
        const path = zone.coordinates.polygon.map(p => ({ lat: p.lat, lng: p.lng }));
        shape = new window.google.maps.Polygon({
          paths: path,
          strokeColor: zone.color,
          strokeOpacity: 0.8,
          strokeWeight: selectedZone?.id === zone.id ? 3 : 2,
          fillColor: zone.color,
          fillOpacity: selectedZone?.id === zone.id ? 0.4 : 0.2,
          map: mapInstanceRef.current
        });
      } else if (zone.coordinates.radius) {
        // Zona circular
        shape = new window.google.maps.Circle({
          center: { lat: zone.coordinates.center.lat, lng: zone.coordinates.center.lng },
          radius: zone.coordinates.radius * 1000, // km a metros
          strokeColor: zone.color,
          strokeOpacity: 0.8,
          strokeWeight: selectedZone?.id === zone.id ? 3 : 2,
          fillColor: zone.color,
          fillOpacity: selectedZone?.id === zone.id ? 0.4 : 0.2,
          map: mapInstanceRef.current
        });
      }

      if (shape) {
        // InfoWindow para la zona
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; color: ${zone.color}; font-size: 16px; font-weight: bold;">
                ${zone.name}
              </h3>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong>Cobertura:</strong> ${zone.coverage}
              </p>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong>Demanda:</strong> ${zone.demand}%
              </p>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong>Distritos:</strong> ${zone.districts.join(', ') || 'No especificados'}
              </p>
            </div>
          `
        });

        shape.addListener('click', (e: any) => {
          infoWindow.setPosition(e.latLng);
          infoWindow.open(mapInstanceRef.current);
          if (onZoneClick) {
            onZoneClick(zone);
          }
        });

        zoneShapesRef.current.push(shape);
      }
    });
  }, [zones, selectedZone, googleMapsLoaded, onZoneClick]);

  // Renderizar citas
  useEffect(() => {
    if (!mapInstanceRef.current || !googleMapsLoaded) return;

    // Limpiar markers anteriores
    appointmentMarkersRef.current.forEach(marker => marker.setMap(null));
    appointmentMarkersRef.current = [];

    const statusColors: any = {
      completed: '#10b981',
      'in-progress': '#f59e0b',
      pending: '#6b7280'
    };

    appointments.forEach(appointment => {
      const marker = new window.google.maps.Marker({
        position: { lat: appointment.coordinates.lat, lng: appointment.coordinates.lng },
        map: mapInstanceRef.current,
        title: `${appointment.client} - ${appointment.pet}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: statusColors[appointment.status] || '#6b7280',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 6
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: system-ui;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">
              ${appointment.client}
            </h4>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Mascota:</strong> ${appointment.pet}
            </p>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Dirección:</strong> ${appointment.address}
            </p>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Distrito:</strong> ${appointment.district}
            </p>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Hora:</strong> ${appointment.time}
            </p>
            <p style="margin: 4px 0; font-size: 12px;">
              <strong>Estado:</strong> 
              <span style="
                color: ${statusColors[appointment.status]};
                font-weight: 600;
              ">
                ${appointment.status === 'completed' ? 'Completada' : 
                  appointment.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
              </span>
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      appointmentMarkersRef.current.push(marker);
    });
  }, [appointments, googleMapsLoaded]);

  // Manejar modo de dibujo
  const startDrawing = useCallback((mode: 'circle' | 'polygon') => {
    if (!drawingManagerRef.current) return;
    
    setDrawingMode(mode);
    
    const drawingModeMap = {
      circle: window.google.maps.drawing.OverlayType.CIRCLE,
      polygon: window.google.maps.drawing.OverlayType.POLYGON
    };
    
    drawingManagerRef.current.setDrawingMode(drawingModeMap[mode]);
    toast.info(`✏️ Modo dibujo: ${mode === 'circle' ? 'Círculo' : 'Polígono'}`);
  }, []);

  const cancelDrawing = useCallback(() => {
    if (!drawingManagerRef.current) return;
    
    drawingManagerRef.current.setDrawingMode(null);
    setDrawingMode('none');
    toast.info('❌ Dibujo cancelado');
  }, []);

  if (loadError) {
    return (
      <Card className="relative overflow-hidden p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {loadError}. Ve a Configuración &gt; Integraciones para configurar Google Maps.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden transition-all ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {editable && drawingMode === 'none' && (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => startDrawing('circle')}
              className="shadow-lg bg-white"
            >
              <CircleIcon className="h-4 w-4 mr-2" />
              Zona Circular
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => startDrawing('polygon')}
              className="shadow-lg bg-white"
            >
              <Pentagon className="h-4 w-4 mr-2" />
              Zona Polígono
            </Button>
          </>
        )}
        
        {drawingMode !== 'none' && (
          <Button
            size="sm"
            variant="destructive"
            onClick={cancelDrawing}
            className="shadow-lg"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar Dibujo
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="shadow-lg bg-white"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      <div
        ref={mapRef}
        style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : '600px' }}
        className="w-full rounded-lg"
      />

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs">
        <div className="text-sm font-semibold mb-2">Leyenda</div>
        <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
          {zones.map(zone => (
            <div key={zone.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded flex-shrink-0"
                style={{ backgroundColor: zone.color }}
              />
              <span className="truncate">{zone.name}</span>
              <Badge variant="secondary" className="ml-auto text-xs flex-shrink-0">
                {zone.demand}%
              </Badge>
            </div>
          ))}
          
          {appointments.length > 0 && (
            <div className="border-t pt-2 mt-2">
              <div className="font-semibold mb-1">Citas</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                <span>Completada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                <span>En Progreso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500 flex-shrink-0" />
                <span>Pendiente</span>
              </div>
            </div>
          )}

          <div className="border-t pt-2 mt-2">
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Powered by Google Maps
            </p>
          </div>
        </div>
      </div>

      {!googleMapsLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando Google Maps...</p>
          </div>
        </div>
      )}
    </Card>
  );
}