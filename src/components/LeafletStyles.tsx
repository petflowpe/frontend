import { useEffect } from 'react';

export function LeafletStyles() {
  useEffect(() => {
    // Verificar si el link ya existe
    if (document.querySelector('link[href*="leaflet"]')) {
      return;
    }

    // Crear link tag para Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    return () => {
      // Limpiar al desmontar (opcional)
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  return null;
}
