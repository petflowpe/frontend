import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MapPin, Navigation, Maximize2, Minimize2, Edit, Trash2, Save, X, Circle as CircleIcon, Pentagon, Plus } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { LeafletStyles } from './LeafletStyles';

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

interface Vehicle {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  status: 'active' | 'inactive' | 'stopped';
  driver: string;
}

interface ZoneMapViewProps {
  zones: Zone[];
  appointments?: Appointment[];
  vehicles?: Vehicle[]; // 🆕 Support for realtime vehicles
  selectedZone?: Zone | null;
  onZoneClick?: (zone: Zone) => void;
  onZoneUpdate?: (zone: Zone) => void;
  onZoneCreate?: (zone: Omit<Zone, 'id'>) => void;
  onZoneDelete?: (zoneId: string) => void;
  editable?: boolean;
}

// Limitar datos para prevenir problemas de memoria
const MAX_ZONES = 20;
const MAX_APPOINTMENTS = 50;
const MAX_VEHICLES = 20;

export function ZoneMapView({ 
  zones, 
  appointments = [], 
  vehicles = [],
  selectedZone,
  onZoneClick,
  onZoneUpdate,
  onZoneCreate,
  onZoneDelete,
  editable = false
}: ZoneMapViewProps) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'none' | 'circle' | 'polygon'>('none');
  const [drawingData, setDrawingData] = useState<any>(null);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const updateTimeoutRef = useRef<any>(null);
  
  // Limitar datos para performance
  const limitedZones = useMemo(() => zones.slice(0, MAX_ZONES), [zones]);
  const limitedAppointments = useMemo(() => appointments.slice(0, MAX_APPOINTMENTS), [appointments]);
  
  // Cargar Leaflet dinámicamente
  useEffect(() => {
    let mounted = true;
    
    const loadLeaflet = async () => {
      try {
        const L = await import('leaflet');
        
        if (!mounted) return;
        
        // Fix para iconos de Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        
        setLeaflet(L);
      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };
    
    loadLeaflet();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstanceRef.current) return;

    let map: any = null;

    try {
      // Centro de Lima, Perú
      map = leaflet.map(mapRef.current, {
        preferCanvas: true,
        maxZoom: 18,
        minZoom: 10,
        zoomControl: true,
        attributionControl: false,
      }).setView([-12.0464, -77.0428], 12);

      // Agregar capa de tiles con configuración optimizada
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        keepBuffer: 2,
        updateWhenIdle: true,
        updateWhenZooming: false,
      }).addTo(map);

      // Crear layer group para mejor gestión
      const layerGroup = leaflet.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      mapInstanceRef.current = map;
      setIsMapReady(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsMapReady(false);
    }

    return () => {
      // Limpiar timeout si existe
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Cleanup completo del mapa
      if (layerGroupRef.current) {
        try {
          layerGroupRef.current.clearLayers();
          layerGroupRef.current = null;
        } catch (e) {
          console.error('Error clearing layer group:', e);
        }
      }

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.eachLayer((layer: any) => {
            try {
              mapInstanceRef.current.removeLayer(layer);
            } catch (e) {
              // Ignorar errores de capas ya removidas
            }
          });
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
      
      setIsMapReady(false);
    };
  }, [leaflet]);

  // Renderizar zonas y citas con debouncing
  useEffect(() => {
    if (!isMapReady || !leaflet || !layerGroupRef.current) return;

    // Cancelar actualización anterior si existe
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce para evitar múltiples actualizaciones
    updateTimeoutRef.current = setTimeout(() => {
      const layerGroup = layerGroupRef.current;
      
      try {
        // Limpiar layers anteriores
        layerGroup.clearLayers();

        // Dibujar zonas (limitadas)
        limitedZones.forEach(zone => {
          try {
            let layer: any;

            if (zone.coordinates.polygon && zone.coordinates.polygon.length > 0) {
              // Zona tipo polígono
              const coords = zone.coordinates.polygon.map((p: any) => [p.lat, p.lng]);
              layer = leaflet.polygon(coords, {
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: selectedZone?.id === zone.id ? 0.4 : 0.2,
                weight: selectedZone?.id === zone.id ? 3 : 2,
              });
            } else if (zone.coordinates.radius) {
              // Zona tipo círculo
              layer = leaflet.circle(
                [zone.coordinates.center.lat, zone.coordinates.center.lng],
                {
                  radius: zone.coordinates.radius * 1000,
                  color: zone.color,
                  fillColor: zone.color,
                  fillOpacity: selectedZone?.id === zone.id ? 0.4 : 0.2,
                  weight: selectedZone?.id === zone.id ? 3 : 2,
                }
              );
            }

            if (layer) {
              // Tooltip simple (sin HTML complejo)
              layer.bindTooltip(zone.name, { sticky: true });

              // Click handler
              layer.on('click', () => {
                if (onZoneClick) {
                  onZoneClick(zone);
                }
              });

              layerGroup.addLayer(layer);
            }
          } catch (error) {
            console.error('Error rendering zone:', error);
          }
        });

        // Dibujar marcadores de citas (limitadas)
        limitedAppointments.forEach(appointment => {
          try {
            const statusColors: any = {
              completed: '#10b981',
              'in-progress': '#f59e0b',
              pending: '#6b7280'
            };

            const marker = leaflet.circleMarker(
              [appointment.coordinates.lat, appointment.coordinates.lng],
              {
                radius: 6,
                fillColor: statusColors[appointment.status] || '#6b7280',
                color: '#fff',
                weight: 2,
                fillOpacity: 0.8,
              }
            );

            // Popup simple
            marker.bindPopup(`<b>${appointment.client}</b><br/>${appointment.pet}`);

            layerGroup.addLayer(marker);
          } catch (error) {
            console.error('Error rendering appointment:', error);
          }
        });

        // 🚐 DIBUJAR VEHÍCULOS (Realtime)
        vehicles.slice(0, MAX_VEHICLES).forEach(vehicle => {
          try {
             // Crear icono personalizado (usando un divIcon simple por ahora)
             // Idealmente sería un SVG de camión
             const truckIcon = leaflet.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid white;">
                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
                       </div>
                       <div style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); background: white; padding: 2px 4px; border-radius: 4px; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                         ${vehicle.name}
                       </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
             });

             const marker = leaflet.marker(
               [vehicle.location.lat, vehicle.location.lng],
               { icon: truckIcon }
             );
             
             marker.bindPopup(`<b>${vehicle.name}</b><br/>Conductor: ${vehicle.driver}<br/>Estado: ${vehicle.status}`);
             layerGroup.addLayer(marker);
          } catch (error) {
            console.error('Error rendering vehicle:', error);
          }
        });

      } catch (error) {
        console.error('Error updating map layers:', error);
      }
    }, 100); // 100ms debounce

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [isMapReady, leaflet, limitedZones, limitedAppointments, vehicles, selectedZone, onZoneClick]);

  // Modo dibujo (simplificado)
  const startDrawing = useCallback((mode: 'circle' | 'polygon') => {
    if (!leaflet || !mapInstanceRef.current) return;
    
    setDrawingMode(mode);
    toast.info(`✏️ Modo dibujo: ${mode === 'circle' ? 'Círculo' : 'Polígono'}`);
  }, [leaflet]);

  const cancelDrawing = useCallback(() => {
    setDrawingMode('none');
    setDrawingData(null);
    toast.info('❌ Dibujo cancelado');
  }, []);

  const saveDrawing = useCallback(() => {
    if (!drawingData || !onZoneCreate) return;

    const newZone: Omit<Zone, 'id'> = {
      name: 'Nueva Zona',
      color: '#3b82f6',
      districts: [],
      coverage: 'Media',
      demand: 50,
      coordinates: drawingData.type === 'circle'
        ? {
            center: drawingData.center,
            radius: drawingData.radius
          }
        : {
            center: drawingData.polygon[0],
            polygon: drawingData.polygon
          }
    };

    onZoneCreate(newZone);
    setDrawingData(null);
    toast.success('✅ Zona creada exitosamente');
  }, [drawingData, onZoneCreate]);

  // Mostrar mensaje si hay demasiados datos
  const showLimitWarning = zones.length > MAX_ZONES || appointments.length > MAX_APPOINTMENTS;

  return (
    <Card className={`relative overflow-hidden transition-all ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <LeafletStyles />
      
      {showLimitWarning && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] max-w-md">
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800 shadow-lg">
            ⚠️ Mostrando {MAX_ZONES} de {zones.length} zonas y {MAX_APPOINTMENTS} de {appointments.length} citas para mejor rendimiento
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        {editable && drawingMode === 'none' && !drawingData && (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => startDrawing('circle')}
              className="shadow-lg"
            >
              <CircleIcon className="h-4 w-4 mr-2" />
              Zona Circular
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => startDrawing('polygon')}
              className="shadow-lg"
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

        {drawingData && (
          <Button
            size="sm"
            onClick={saveDrawing}
            className="shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Zona
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="shadow-lg"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      <div
        ref={mapRef}
        style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : '600px' }}
        className="w-full rounded-lg"
      />

      {/* Leyenda simplificada */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs">
        <div className="text-sm font-semibold mb-2">Leyenda</div>
        <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
          {limitedZones.map(zone => (
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
          
          {limitedAppointments.length > 0 && (
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
        </div>
      </div>
    </Card>
  );
}
