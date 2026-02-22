/**
 * Servicio de exportación de rutas a aplicaciones de navegación
 * Genera links para Google Maps y Waze con rutas optimizadas
 */

export interface Waypoint {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  appointmentId?: string;
  client?: string;
  time?: string;
}

export interface RouteExportOptions {
  includeReturn?: boolean; // Si incluir retorno al punto de inicio
  startAddress?: string; // Dirección de inicio personalizada
  startCoordinates?: { lat: number; lng: number };
}

class RouteExportService {
  /**
   * Genera URL de Google Maps con múltiples waypoints
   */
  generateGoogleMapsUrl(waypoints: Waypoint[], options: RouteExportOptions = {}): string {
    if (waypoints.length === 0) {
      throw new Error('Se requiere al menos un waypoint');
    }

    // Punto de inicio
    const origin = options.startCoordinates 
      ? `${options.startCoordinates.lat},${options.startCoordinates.lng}`
      : `${waypoints[0].coordinates.lat},${waypoints[0].coordinates.lng}`;

    // Punto final
    let destination: string;
    if (options.includeReturn && options.startCoordinates) {
      destination = `${options.startCoordinates.lat},${options.startCoordinates.lng}`;
    } else {
      const lastWaypoint = waypoints[waypoints.length - 1];
      destination = `${lastWaypoint.coordinates.lat},${lastWaypoint.coordinates.lng}`;
    }

    // Waypoints intermedios (Google Maps soporta máximo 10 waypoints en URL)
    let waypointsParam = '';
    if (waypoints.length > 1) {
      const intermediateWaypoints = options.includeReturn 
        ? waypoints 
        : waypoints.slice(1, -1);

      if (intermediateWaypoints.length > 0) {
        const waypointsList = intermediateWaypoints
          .slice(0, 10) // Limitar a 10 waypoints
          .map(w => `${w.coordinates.lat},${w.coordinates.lng}`)
          .join('|');
        waypointsParam = `&waypoints=${waypointsList}`;
      }
    }

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointsParam}&travelmode=driving`;
  }

  /**
   * Genera URL de Waze con waypoints
   * Nota: Waze no soporta múltiples waypoints, por lo que genera URLs individuales
   */
  generateWazeUrls(waypoints: Waypoint[]): Array<{ address: string; url: string; appointmentId?: string }> {
    return waypoints.map(waypoint => ({
      address: waypoint.address,
      appointmentId: waypoint.appointmentId,
      url: `https://www.waze.com/ul?ll=${waypoint.coordinates.lat},${waypoint.coordinates.lng}&navigate=yes&zoom=17`
    }));
  }

  /**
   * Genera URL de Waze para navegación al primer waypoint
   */
  generateWazeUrlFirst(waypoints: Waypoint[]): string {
    if (waypoints.length === 0) {
      throw new Error('Se requiere al menos un waypoint');
    }

    const firstWaypoint = waypoints[0];
    return `https://www.waze.com/ul?ll=${firstWaypoint.coordinates.lat},${firstWaypoint.coordinates.lng}&navigate=yes&zoom=17`;
  }

  /**
   * Exporta la ruta como archivo GPX (compatible con GPS devices)
   */
  generateGPXFile(waypoints: Waypoint[], routeName: string = 'SmartPet Route'): string {
    const date = new Date().toISOString();
    
    let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="SmartPet" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${routeName}</name>
    <time>${date}</time>
  </metadata>
  <rte>
    <name>${routeName}</name>
`;

    waypoints.forEach((waypoint, index) => {
      gpxContent += `    <rtept lat="${waypoint.coordinates.lat}" lon="${waypoint.coordinates.lng}">
      <name>Parada ${index + 1}${waypoint.client ? ' - ' + waypoint.client : ''}</name>
      <desc>${waypoint.address}${waypoint.time ? ' - ' + waypoint.time : ''}</desc>
    </rtept>
`;
    });

    gpxContent += `  </rte>
</gpx>`;

    return gpxContent;
  }

  /**
   * Descarga el archivo GPX
   */
  downloadGPXFile(waypoints: Waypoint[], filename: string = 'smartpet-route.gpx'): void {
    const gpxContent = this.generateGPXFile(waypoints);
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Genera URL compartible para WhatsApp con todos los waypoints
   */
  generateWhatsAppMessage(waypoints: Waypoint[], routeName: string = 'Ruta del día'): string {
    let message = `📍 *${routeName}*\n\n`;
    message += `Total de paradas: ${waypoints.length}\n\n`;

    waypoints.forEach((waypoint, index) => {
      message += `*${index + 1}. ${waypoint.client || 'Cliente'}*\n`;
      if (waypoint.time) message += `⏰ ${waypoint.time}\n`;
      message += `📍 ${waypoint.address}\n`;
      message += `🗺️ https://maps.google.com/?q=${waypoint.coordinates.lat},${waypoint.coordinates.lng}\n\n`;
    });

    return encodeURIComponent(message);
  }

  /**
   * Copia la ruta al portapapeles en formato texto
   */
  async copyRouteToClipboard(waypoints: Waypoint[]): Promise<boolean> {
    let text = '📍 RUTA DE HOY\n\n';
    waypoints.forEach((waypoint, index) => {
      text += `${index + 1}. ${waypoint.client || 'Cliente'}\n`;
      if (waypoint.time) text += `   ⏰ ${waypoint.time}\n`;
      text += `   📍 ${waypoint.address}\n`;
      text += `   🗺️ ${waypoint.coordinates.lat}, ${waypoint.coordinates.lng}\n\n`;
    });

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      return false;
    }
  }

  /**
   * Genera URLs para Apple Maps
   */
  generateAppleMapsUrl(waypoints: Waypoint[], options: RouteExportOptions = {}): string {
    if (waypoints.length === 0) {
      throw new Error('Se requiere al menos un waypoint');
    }

    // Apple Maps soporta punto de inicio y destino
    const origin = options.startCoordinates 
      ? `saddr=${options.startCoordinates.lat},${options.startCoordinates.lng}`
      : `saddr=${waypoints[0].coordinates.lat},${waypoints[0].coordinates.lng}`;

    const destination = options.includeReturn && options.startCoordinates
      ? `daddr=${options.startCoordinates.lat},${options.startCoordinates.lng}`
      : `daddr=${waypoints[waypoints.length - 1].coordinates.lat},${waypoints[waypoints.length - 1].coordinates.lng}`;

    return `https://maps.apple.com/?${origin}&${destination}&dirflg=d`;
  }

  /**
   * Detecta la plataforma y genera la URL apropiada
   */
  generateNativeMapUrl(waypoints: Waypoint[], options: RouteExportOptions = {}): string {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      return this.generateAppleMapsUrl(waypoints, options);
    } else if (isAndroid) {
      return this.generateGoogleMapsUrl(waypoints, options);
    } else {
      // Desktop: usar Google Maps por defecto
      return this.generateGoogleMapsUrl(waypoints, options);
    }
  }

  /**
   * Calcula estadísticas de la ruta
   */
  calculateRouteStats(waypoints: Waypoint[]): {
    totalDistance: number;
    estimatedTime: number;
    averageSpeed: number;
  } {
    if (waypoints.length < 2) {
      return { totalDistance: 0, estimatedTime: 0, averageSpeed: 0 };
    }

    let totalDistance = 0;
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const current = waypoints[i];
      const next = waypoints[i + 1];
      totalDistance += this.calculateDistance(
        current.coordinates.lat,
        current.coordinates.lng,
        next.coordinates.lat,
        next.coordinates.lng
      );
    }

    const averageSpeed = 25; // km/h en ciudad
    const estimatedTime = (totalDistance / averageSpeed) * 60; // minutos

    return {
      totalDistance: Math.round(totalDistance * 10) / 10,
      estimatedTime: Math.round(estimatedTime),
      averageSpeed
    };
  }

  /**
   * Calcular distancia entre dos puntos (fórmula de Haversine)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Exportar instancia única del servicio
export const routeExportService = new RouteExportService();
