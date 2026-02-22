import { AlertCircle, CheckCircle2, MapPin, Navigation } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Zone {
  id: string;
  name: string;
  color: string;
  coordinates: {
    center: { lat: number; lng: number };
    radius?: number;
    polygon?: Array<{ lat: number; lng: number }>;
  };
}

interface Vehicle {
  vehicleId: string;
  vehicleName: string;
  assignedZones: string[];
  primaryZone: string;
}

interface ValidationResult {
  isValid: boolean;
  zone?: Zone;
  suggestedVehicles?: Vehicle[];
  distance?: number;
  message: string;
}

interface GeoValidatorProps {
  address: string;
  coordinates: { lat: number; lng: number };
  zones: Zone[];
  vehicles: Vehicle[];
  selectedVehicleId?: string;
}

export function GeoValidator({ address, coordinates, zones, vehicles, selectedVehicleId }: GeoValidatorProps) {
  // Calcular distancia entre dos puntos (fórmula de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Verificar si un punto está dentro de un círculo
  const isPointInCircle = (point: { lat: number; lng: number }, center: { lat: number; lng: number }, radiusKm: number): boolean => {
    const distance = calculateDistance(point.lat, point.lng, center.lat, center.lng);
    return distance <= radiusKm;
  };

  // Verificar si un punto está dentro de un polígono (algoritmo ray casting)
  const isPointInPolygon = (point: { lat: number; lng: number }, polygon: Array<{ lat: number; lng: number }>): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;

      const intersect = ((yi > point.lng) !== (yj > point.lng))
        && (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Encontrar la zona donde está ubicada la dirección
  const findZoneForAddress = (): Zone | undefined => {
    for (const zone of zones) {
      if (zone.coordinates.polygon) {
        if (isPointInPolygon(coordinates, zone.coordinates.polygon)) {
          return zone;
        }
      } else if (zone.coordinates.radius) {
        if (isPointInCircle(coordinates, zone.coordinates.center, zone.coordinates.radius)) {
          return zone;
        }
      }
    }
    return undefined;
  };

  // Validar si el vehículo seleccionado puede atender la zona
  const validateVehicleForZone = (): ValidationResult => {
    const zone = findZoneForAddress();

    if (!zone) {
      // Dirección fuera de todas las zonas de cobertura
      return {
        isValid: false,
        message: '⚠️ Esta dirección está fuera de todas las zonas de cobertura',
        suggestedVehicles: []
      };
    }

    if (!selectedVehicleId) {
      // No hay vehículo seleccionado, sugerir vehículos disponibles
      const availableVehicles = vehicles.filter(v => v.assignedZones.includes(zone.id));
      
      return {
        isValid: true,
        zone,
        suggestedVehicles: availableVehicles,
        message: availableVehicles.length > 0
          ? `✅ Dirección en ${zone.name}. ${availableVehicles.length} vehículo(s) disponible(s)`
          : `⚠️ Dirección en ${zone.name}, pero no hay vehículos asignados a esta zona`
      };
    }

    // Verificar si el vehículo seleccionado puede atender esta zona
    const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId);
    
    if (!selectedVehicle) {
      return {
        isValid: false,
        zone,
        message: '⚠️ Vehículo no encontrado'
      };
    }

    const canServe = selectedVehicle.assignedZones.includes(zone.id);
    const distance = calculateDistance(
      coordinates.lat,
      coordinates.lng,
      zone.coordinates.center.lat,
      zone.coordinates.center.lng
    );

    if (canServe) {
      return {
        isValid: true,
        zone,
        distance: Math.round(distance * 10) / 10,
        message: `✅ ${selectedVehicle.vehicleName} puede atender esta dirección en ${zone.name}`
      };
    } else {
      // Sugerir vehículos alternativos
      const availableVehicles = vehicles.filter(v => v.assignedZones.includes(zone.id));
      
      return {
        isValid: false,
        zone,
        suggestedVehicles: availableVehicles,
        distance: Math.round(distance * 10) / 10,
        message: `⚠️ ${selectedVehicle.vehicleName} NO puede atender ${zone.name}`
      };
    }
  };

  const validation = validateVehicleForZone();

  return (
    <Card className={`p-4 ${validation.isValid ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          {validation.isValid ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-600" />
          )}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className={`font-medium ${validation.isValid ? 'text-green-900 dark:text-green-100' : 'text-amber-900 dark:text-amber-100'}`}>
              {validation.message}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 inline mr-1" />
              {address}
            </div>
          </div>

          {validation.zone && (
            <div className="flex items-center gap-2">
              <Badge style={{ backgroundColor: validation.zone.color, color: 'white' }}>
                {validation.zone.name}
              </Badge>
              {validation.distance && (
                <span className="text-xs text-muted-foreground">
                  ~{validation.distance} km del centro
                </span>
              )}
            </div>
          )}

          {validation.suggestedVehicles && validation.suggestedVehicles.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">
                <Navigation className="h-4 w-4 inline mr-1" />
                Vehículos disponibles para esta zona:
              </div>
              <div className="flex flex-wrap gap-2">
                {validation.suggestedVehicles.map(vehicle => (
                  <Badge key={vehicle.vehicleId} variant="outline">
                    {vehicle.vehicleName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {!validation.isValid && validation.suggestedVehicles?.length === 0 && (
            <div className="text-sm text-amber-700 dark:text-amber-300">
              💡 Considera expandir la cobertura o asignar un vehículo a esta zona
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
