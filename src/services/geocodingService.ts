/**
 * Servicio de Geocodificación usando Nominatim de OpenStreetMap
 * Convierte direcciones de texto a coordenadas GPS y viceversa
 */

export interface GeocodeResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  displayName: string;
  district?: string;
  city?: string;
  country?: string;
}

export interface ReverseGeocodeResult {
  address: string;
  district: string;
  city: string;
  country: string;
  fullAddress: string;
}

class GeocodingService {
  private baseUrl = 'https://nominatim.openstreetmap.org';
  private cache: Map<string, GeocodeResult> = new Map();
  private reverseCache: Map<string, ReverseGeocodeResult> = new Map();

  /**
   * Geocodificación: Convierte dirección de texto a coordenadas
   */
  async geocodeAddress(address: string, city: string = 'Lima, Perú'): Promise<GeocodeResult | null> {
    const cacheKey = `${address}-${city}`;
    
    // Verificar cache primero
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const fullAddress = `${address}, ${city}`;
      const url = `${this.baseUrl}/search?` + new URLSearchParams({
        q: fullAddress,
        format: 'json',
        limit: '1',
        addressdetails: '1'
      });

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SmartPet Mobile Grooming App'
        }
      });

      if (!response.ok) {
        throw new Error('Error en la geocodificación');
      }

      const data = await response.json();

      if (data.length === 0) {
        return null;
      }

      const result: GeocodeResult = {
        address: address,
        coordinates: {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        },
        displayName: data[0].display_name,
        district: data[0].address?.suburb || data[0].address?.neighbourhood,
        city: data[0].address?.city || data[0].address?.town,
        country: data[0].address?.country
      };

      // Guardar en cache
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return null;
    }
  }

  /**
   * Geocodificación inversa: Convierte coordenadas a dirección
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    const cacheKey = `${lat},${lng}`;
    
    // Verificar cache primero
    if (this.reverseCache.has(cacheKey)) {
      return this.reverseCache.get(cacheKey)!;
    }

    try {
      const url = `${this.baseUrl}/reverse?` + new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'json',
        addressdetails: '1'
      });

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SmartPet Mobile Grooming App'
        }
      });

      if (!response.ok) {
        throw new Error('Error en la geocodificación inversa');
      }

      const data = await response.json();

      if (!data.address) {
        return null;
      }

      const result: ReverseGeocodeResult = {
        address: data.address.road || data.address.pedestrian || '',
        district: data.address.suburb || data.address.neighbourhood || '',
        city: data.address.city || data.address.town || '',
        country: data.address.country || '',
        fullAddress: data.display_name
      };

      // Guardar en cache
      this.reverseCache.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      return null;
    }
  }

  /**
   * Batch geocoding: Geocodificar múltiples direcciones
   * Respeta el límite de 1 request por segundo de Nominatim
   */
  async batchGeocode(addresses: Array<{ address: string; city?: string }>): Promise<GeocodeResult[]> {
    const results: GeocodeResult[] = [];

    for (const item of addresses) {
      const result = await this.geocodeAddress(item.address, item.city || 'Lima, Perú');
      if (result) {
        results.push(result);
      }
      // Esperar 1 segundo entre requests (política de Nominatim)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * Sugerencias de direcciones mientras el usuario escribe
   */
  async getSuggestions(query: string, city: string = 'Lima, Perú'): Promise<GeocodeResult[]> {
    try {
      const fullQuery = `${query}, ${city}`;
      const url = `${this.baseUrl}/search?` + new URLSearchParams({
        q: fullQuery,
        format: 'json',
        limit: '5',
        addressdetails: '1'
      });

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SmartPet Mobile Grooming App'
        }
      });

      if (!response.ok) {
        throw new Error('Error obteniendo sugerencias');
      }

      const data = await response.json();

      return data.map((item: any) => ({
        address: item.display_name.split(',')[0],
        coordinates: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        },
        displayName: item.display_name,
        district: item.address?.suburb || item.address?.neighbourhood,
        city: item.address?.city || item.address?.town,
        country: item.address?.country
      }));
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      return [];
    }
  }

  /**
   * Validar si una dirección existe
   */
  async validateAddress(address: string, city: string = 'Lima, Perú'): Promise<boolean> {
    const result = await this.geocodeAddress(address, city);
    return result !== null;
  }

  /**
   * Limpiar cache
   */
  clearCache() {
    this.cache.clear();
    this.reverseCache.clear();
  }

  /**
   * Obtener distancia entre dos direcciones
   */
  async getDistanceBetweenAddresses(
    address1: string,
    address2: string,
    city: string = 'Lima, Perú'
  ): Promise<number | null> {
    const coord1 = await this.geocodeAddress(address1, city);
    const coord2 = await this.geocodeAddress(address2, city);

    if (!coord1 || !coord2) {
      return null;
    }

    return this.calculateDistance(
      coord1.coordinates.lat,
      coord1.coordinates.lng,
      coord2.coordinates.lat,
      coord2.coordinates.lng
    );
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
export const geocodingService = new GeocodingService();
