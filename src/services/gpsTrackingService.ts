/**
 * Servicio para GPS y tracking en tiempo real
 * Integración con Google Maps API y geolocalización
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteInfo {
  distance: number; // en metros
  duration: number; // en segundos
  polyline: string;
}

export interface TrackingLink {
  id: string;
  vehicleId: string;
  appointmentId: string;
  expiresAt: string;
  url: string;
}

export const gpsTrackingService = {
  /**
   * Calcula la distancia entre dos puntos (fórmula de Haversine)
   */
  calculateDistance: (point1: Coordinates, point2: Coordinates): number => {
    const R = 6371000; // Radio de la Tierra en metros
    const lat1 = (point1.lat * Math.PI) / 180;
    const lat2 = (point2.lat * Math.PI) / 180;
    const deltaLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const deltaLng = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  },

  /**
   * Formatea la distancia para mostrar al usuario
   */
  formatDistance: (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  },

  /**
   * Calcula el ETA (tiempo estimado de llegada)
   */
  calculateETA: (
    currentLocation: Coordinates,
    destination: Coordinates,
    currentSpeed?: number // en km/h
  ): { minutes: number; formattedTime: string } => {
    const distance = gpsTrackingService.calculateDistance(currentLocation, destination);
    const speed = currentSpeed || 30; // Velocidad promedio en ciudad: 30 km/h
    const hours = distance / 1000 / speed;
    const minutes = Math.round(hours * 60);

    const now = new Date();
    const eta = new Date(now.getTime() + minutes * 60000);
    const formattedTime = eta.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return { minutes, formattedTime };
  },

  /**
   * Genera un link de tracking único para el cliente
   */
  generateTrackingLink: (
    vehicleId: string,
    appointmentId: string,
    expirationHours: number = 24
  ): TrackingLink => {
    const id = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();
    const baseUrl = 'https://smartpet.com/track'; // En producción
    
    return {
      id,
      vehicleId,
      appointmentId,
      expiresAt,
      url: `${baseUrl}/${id}`,
    };
  },

  /**
   * Verifica si el vehículo está cerca del destino
   */
  isNearDestination: (
    currentLocation: Coordinates,
    destination: Coordinates,
    thresholdMeters: number = 500
  ): boolean => {
    const distance = gpsTrackingService.calculateDistance(currentLocation, destination);
    return distance <= thresholdMeters;
  },

  /**
   * Determina el mensaje de notificación según la distancia
   */
  getNotificationMessage: (distanceMeters: number): string | null => {
    if (distanceMeters <= 100) {
      return '🎉 Tu groomer ha llegado';
    } else if (distanceMeters <= 500) {
      return '🚗 Tu groomer está a la vuelta de la esquina';
    } else if (distanceMeters <= 1000) {
      return '📍 Tu groomer está a menos de 1 km';
    } else if (distanceMeters <= 2000) {
      return '🚙 Tu groomer está a 2 km de distancia';
    }
    return null;
  },

  /**
   * Optimiza la ruta para múltiples destinos (TSP simplificado)
   */
  optimizeRoute: (
    startLocation: Coordinates,
    destinations: { id: string; location: Coordinates; priority?: number }[]
  ): string[] => {
    // Implementación simplificada del algoritmo del vecino más cercano
    const visited: string[] = [];
    let currentLocation = startLocation;
    const remaining = [...destinations];

    while (remaining.length > 0) {
      // Encontrar el destino más cercano
      let nearest = remaining[0];
      let shortestDistance = gpsTrackingService.calculateDistance(
        currentLocation,
        nearest.location
      );

      for (const dest of remaining) {
        const distance = gpsTrackingService.calculateDistance(currentLocation, dest.location);
        
        // Considerar prioridad (citas con prioridad alta van primero)
        const adjustedDistance = distance / (dest.priority || 1);
        
        if (adjustedDistance < shortestDistance) {
          nearest = dest;
          shortestDistance = adjustedDistance;
        }
      }

      visited.push(nearest.id);
      currentLocation = nearest.location;
      const index = remaining.indexOf(nearest);
      remaining.splice(index, 1);
    }

    return visited;
  },

  /**
   * Calcula el tiempo total de ruta
   */
  calculateTotalRouteTime: (
    startLocation: Coordinates,
    destinations: Coordinates[],
    appointmentDurations: number[] // en minutos
  ): number => {
    let totalTime = 0;
    let currentLocation = startLocation;

    destinations.forEach((dest, index) => {
      const distance = gpsTrackingService.calculateDistance(currentLocation, dest);
      const travelTime = (distance / 1000 / 30) * 60; // Asumiendo 30 km/h
      totalTime += travelTime + (appointmentDurations[index] || 0);
      currentLocation = dest;
    });

    return Math.round(totalTime);
  },

  /**
   * Verifica si un vehículo está dentro de una zona
   */
  isInZone: (
    vehicleLocation: Coordinates,
    zoneCenter: Coordinates,
    zoneRadiusKm: number
  ): boolean => {
    const distance = gpsTrackingService.calculateDistance(vehicleLocation, zoneCenter);
    return distance <= zoneRadiusKm * 1000;
  },

  /**
   * Geocoding: Convierte dirección a coordenadas (simulado)
   * En producción usaría Google Maps Geocoding API
   */
  geocodeAddress: async (address: string): Promise<Coordinates | null> => {
    // Simulación - En producción:
    // const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`);
    // const data = await response.json();
    // return { lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng };
    
    // Coordenadas de ejemplo para Lima, Perú
    const limaDistricts: { [key: string]: Coordinates } = {
      'miraflores': { lat: -12.1205, lng: -77.0282 },
      'san isidro': { lat: -12.0931, lng: -77.0465 },
      'surco': { lat: -12.1532, lng: -77.0003 },
      'la molina': { lat: -12.0771, lng: -76.9421 },
      'san borja': { lat: -12.0942, lng: -76.9977 },
      'magdalena': { lat: -12.0892, lng: -77.0737 },
      'pueblo libre': { lat: -12.0766, lng: -77.0632 },
      'jesús maría': { lat: -12.0759, lng: -77.0438 },
      'lince': { lat: -12.0831, lng: -77.0327 },
      'barranco': { lat: -12.1468, lng: -77.0206 },
    };

    const normalizedAddress = address.toLowerCase();
    for (const [district, coords] of Object.entries(limaDistricts)) {
      if (normalizedAddress.includes(district)) {
        return coords;
      }
    }

    // Default: centro de Lima
    return { lat: -12.0464, lng: -77.0428 };
  },

  /**
   * Reverse Geocoding: Convierte coordenadas a dirección (simulado)
   */
  reverseGeocode: async (coords: Coordinates): Promise<string> => {
    // En producción usaría Google Maps Reverse Geocoding API
    return `Cerca de ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
  },

  /**
   * Genera mensaje de WhatsApp con link de tracking
   */
  generateTrackingWhatsAppMessage: (
    clientName: string,
    petName: string,
    eta: string,
    trackingUrl: string
  ): string => {
    return `¡Hola ${clientName}! 👋\n\nTu groomer está en camino para atender a ${petName} 🐾\n\n🕐 Llegada estimada: ${eta}\n\n📍 Sigue en tiempo real: ${trackingUrl}\n\n¡Te esperamos! 🚗✨`;
  },

  /**
   * Genera mensaje de proximidad
   */
  generateProximityMessage: (
    clientName: string,
    minutesAway: number
  ): string => {
    if (minutesAway <= 5) {
      return `¡${clientName}, tu groomer llegará en ${minutesAway} minutos! 🚗`;
    } else if (minutesAway <= 10) {
      return `${clientName}, tu groomer está a ${minutesAway} minutos ⏰`;
    }
    return `${clientName}, tu groomer llegará aproximadamente a las ${minutesAway} minutos`;
  },

  /**
   * Mock: Simula actualización de ubicación GPS
   */
  simulateGPSUpdate: (
    currentLocation: Coordinates,
    destination: Coordinates,
    progress: number // 0 a 1
  ): Coordinates => {
    return {
      lat: currentLocation.lat + (destination.lat - currentLocation.lat) * progress,
      lng: currentLocation.lng + (destination.lng - currentLocation.lng) * progress,
    };
  },

  /**
   * Calcula el heading (dirección) entre dos puntos
   */
  calculateHeading: (from: Coordinates, to: Coordinates): number => {
    const lat1 = (from.lat * Math.PI) / 180;
    const lat2 = (to.lat * Math.PI) / 180;
    const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;

    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    const heading = Math.atan2(y, x);

    return ((heading * 180) / Math.PI + 360) % 360;
  },

  /**
   * Obtiene el icono de dirección según el heading
   */
  getDirectionIcon: (heading: number): string => {
    if (heading >= 337.5 || heading < 22.5) return '⬆️'; // Norte
    if (heading >= 22.5 && heading < 67.5) return '↗️'; // Noreste
    if (heading >= 67.5 && heading < 112.5) return '➡️'; // Este
    if (heading >= 112.5 && heading < 157.5) return '↘️'; // Sureste
    if (heading >= 157.5 && heading < 202.5) return '⬇️'; // Sur
    if (heading >= 202.5 && heading < 247.5) return '↙️'; // Suroeste
    if (heading >= 247.5 && heading < 292.5) return '⬅️'; // Oeste
    return '↖️'; // Noroeste
  },
};
