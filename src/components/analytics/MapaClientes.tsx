import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Phone, DollarSign, Calendar } from 'lucide-react';

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

interface MapaClientesProps {
  clientes: Cliente[];
  coloresCategorias: {
    oro: string;
    bronce: string;
    plata: string;
  };
  filtrosRutas: Record<string, boolean>;
}

export default function MapaClientes({ clientes, coloresCategorias, filtrosRutas }: MapaClientesProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [L, setL] = useState<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLinesRef = useRef<any[]>([]);

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    const loadLeaflet = async () => {
      // Cargar CSS de Leaflet
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Cargar JS de Leaflet
      const leaflet = await import('leaflet');
      setL(leaflet.default);
    };

    loadLeaflet();
  }, []);

  // Inicializar mapa
  useEffect(() => {
    if (!L || !mapRef.current || map) return;

    // Centro de Lima
    const initialMap = L.map(mapRef.current).setView([-12.1, -77.03], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(initialMap);

    setMap(initialMap);

    return () => {
      if (initialMap) {
        initialMap.remove();
      }
    };
  }, [L, mapRef]);

  // Actualizar markers cuando cambian los clientes filtrados
  useEffect(() => {
    if (!map || !L) return;

    // Limpiar markers anteriores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Limpiar líneas de rutas anteriores
    routeLinesRef.current.forEach(line => line.remove());
    routeLinesRef.current = [];

    // Crear markers para cada cliente
    clientes.forEach(cliente => {
      const color = coloresCategorias[cliente.categoria];
      
      // Crear icono personalizado
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative;">
            <div style="
              width: 24px;
              height: 24px;
              background-color: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
              transition: transform 0.2s;
            "></div>
            ${cliente.categoria === 'oro' ? `
              <div style="
                position: absolute;
                top: -8px;
                right: -8px;
                width: 16px;
                height: 16px;
                background-color: #FFD700;
                border: 2px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              ">⭐</div>
            ` : ''}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });

      // Crear marker
      const marker = L.marker([cliente.lat, cliente.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 250px; font-family: system-ui;">
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
            </div>
          </div>
        `, {
          maxWidth: 300,
          className: 'custom-popup'
        });

      markersRef.current.push(marker);
    });

    // Dibujar rutas si están activas
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
        const coordinates = clientesRuta.map(c => [c.lat, c.lng]);
        
        const polyline = L.polyline(coordinates, {
          color: color,
          weight: 3,
          opacity: 0.7,
          dashArray: '10, 10',
          lineJoin: 'round'
        }).addTo(map);

        routeLinesRef.current.push(polyline);
      }
    });

    // Ajustar vista al contenido
    if (clientes.length > 0) {
      const bounds = L.latLngBounds(clientes.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [clientes, map, L, coloresCategorias, filtrosRutas]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: '500px' }} />
      
      {/* Leyenda */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="text-sm mb-3">Leyenda</h4>
        
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
            <div className="w-8 h-1 bg-blue-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #3b82f6 0px, #3b82f6 10px, transparent 10px, transparent 20px)' }} />
            <span className="text-sm">Ruta 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-purple-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #a855f7 0px, #a855f7 10px, transparent 10px, transparent 20px)' }} />
            <span className="text-sm">Ruta 2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-orange-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f97316 0px, #f97316 10px, transparent 10px, transparent 20px)' }} />
            <span className="text-sm">Ruta 3</span>
          </div>
        </div>

        <div className="border-t pt-3 mt-3">
          <p className="text-xs text-gray-600">
            Total: {clientes.length} clientes visualizados
          </p>
        </div>
      </div>

      {/* Indicador de carga */}
      {!L && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
}
