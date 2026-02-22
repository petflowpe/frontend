// Utilidades para optimización de rutas

export interface Parada {
  id: string;
  clienteId: string;
  clienteNombre: string;
  categoria: 'oro' | 'bronce' | 'plata';
  direccion: string;
  distrito: string;
  lat: number;
  lng: number;
  horarioPreferido?: string;
  esEmergencia?: boolean;
  duracionEstimada: number; // minutos
  servicios: string[];
  ingresoEstimado: number;
}

export interface Ruta {
  id: string;
  nombre: string;
  fecha: string;
  paradas: Parada[];
  vehiculoId?: string;
  conductorId?: string;
  estado: 'planificada' | 'en-curso' | 'completada' | 'cancelada';
}

export interface EstadisticasRuta {
  totalParadas: number;
  distanciaTotal: number; // km
  tiempoTotal: number; // minutos
  clientesOro: number;
  clientesBronce: number;
  clientesPlata: number;
  ingresosEstimados: number;
  eficiencia: number; // 0-100
}

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 */
export function calcularDistancia(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;
  
  return Math.round(distancia * 10) / 10; // Redondear a 1 decimal
}

function toRad(grados: number): number {
  return grados * (Math.PI / 180);
}

/**
 * Calcula el tiempo estimado entre dos puntos (distancia + tiempo de servicio)
 */
export function calcularTiempo(
  distanciaKm: number,
  velocidadPromedio: number = 25 // km/h en ciudad
): number {
  const tiempoViaje = (distanciaKm / velocidadPromedio) * 60; // minutos
  return Math.round(tiempoViaje);
}

/**
 * Calcula la prioridad de una parada
 */
export function calcularPrioridad(parada: Parada): number {
  let prioridad = 0;
  
  // Categoría (más importante)
  if (parada.categoria === 'oro') prioridad += 100;
  else if (parada.categoria === 'bronce') prioridad += 50;
  else prioridad += 25;
  
  // Emergencia
  if (parada.esEmergencia) prioridad += 200;
  
  return prioridad;
}

/**
 * Optimiza el orden de las paradas usando algoritmo greedy mejorado
 */
export function optimizarRuta(
  paradas: Parada[],
  puntoInicio?: { lat: number; lng: number }
): Parada[] {
  if (paradas.length <= 1) return paradas;

  // Punto de inicio (por defecto, centro de Lima: Jesús María)
  const inicio = puntoInicio || { lat: -12.0720, lng: -77.0490 };
  
  // 1. Separar por prioridad
  const emergencias = paradas.filter(p => p.esEmergencia);
  const oro = paradas.filter(p => !p.esEmergencia && p.categoria === 'oro');
  const bronce = paradas.filter(p => !p.esEmergencia && p.categoria === 'bronce');
  const plata = paradas.filter(p => !p.esEmergencia && p.categoria === 'plata');

  // 2. Optimizar cada grupo por proximidad
  const emerOptimizadas = optimizarPorProximidad(emergencias, inicio);
  const oroOptimizadas = optimizarPorProximidad(oro, 
    emerOptimizadas.length > 0 
      ? { lat: emerOptimizadas[emerOptimizadas.length - 1].lat, lng: emerOptimizadas[emerOptimizadas.length - 1].lng }
      : inicio
  );
  
  const bronceOptimizadas = optimizarPorProximidad(bronce,
    oroOptimizadas.length > 0
      ? { lat: oroOptimizadas[oroOptimizadas.length - 1].lat, lng: oroOptimizadas[oroOptimizadas.length - 1].lng }
      : inicio
  );
  
  const plataOptimizadas = optimizarPorProximidad(plata,
    bronceOptimizadas.length > 0
      ? { lat: bronceOptimizadas[bronceOptimizadas.length - 1].lat, lng: bronceOptimizadas[bronceOptimizadas.length - 1].lng }
      : inicio
  );

  // 3. Combinar en orden de prioridad
  return [
    ...emerOptimizadas,
    ...oroOptimizadas,
    ...bronceOptimizadas,
    ...plataOptimizadas
  ];
}

/**
 * Optimiza un grupo de paradas por proximidad (algoritmo del vecino más cercano)
 */
function optimizarPorProximidad(
  paradas: Parada[],
  puntoActual: { lat: number; lng: number }
): Parada[] {
  if (paradas.length <= 1) return paradas;

  const optimizadas: Parada[] = [];
  const pendientes = [...paradas];
  let actual = puntoActual;

  while (pendientes.length > 0) {
    // Encontrar la parada más cercana
    let indiceMasCercana = 0;
    let distanciaMinima = calcularDistancia(
      actual.lat,
      actual.lng,
      pendientes[0].lat,
      pendientes[0].lng
    );

    for (let i = 1; i < pendientes.length; i++) {
      const distancia = calcularDistancia(
        actual.lat,
        actual.lng,
        pendientes[i].lat,
        pendientes[i].lng
      );
      
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        indiceMasCercana = i;
      }
    }

    // Agregar la más cercana a optimizadas
    const paradaMasCercana = pendientes.splice(indiceMasCercana, 1)[0];
    optimizadas.push(paradaMasCercana);
    actual = { lat: paradaMasCercana.lat, lng: paradaMasCercana.lng };
  }

  return optimizadas;
}

/**
 * Calcula estadísticas completas de una ruta
 */
export function calcularEstadisticasRuta(
  ruta: Ruta,
  puntoInicio?: { lat: number; lng: number }
): EstadisticasRuta {
  const inicio = puntoInicio || { lat: -12.0720, lng: -77.0490 };
  
  let distanciaTotal = 0;
  let tiempoTotal = 0;
  let actual = inicio;

  // Calcular distancia y tiempo entre paradas
  ruta.paradas.forEach((parada, index) => {
    const distancia = calcularDistancia(actual.lat, actual.lng, parada.lat, parada.lng);
    const tiempoViaje = calcularTiempo(distancia);
    
    distanciaTotal += distancia;
    tiempoTotal += tiempoViaje + parada.duracionEstimada;
    
    actual = { lat: parada.lat, lng: parada.lng };
  });

  // Contar por categoría
  const clientesOro = ruta.paradas.filter(p => p.categoria === 'oro').length;
  const clientesBronce = ruta.paradas.filter(p => p.categoria === 'bronce').length;
  const clientesPlata = ruta.paradas.filter(p => p.categoria === 'plata').length;

  // Calcular ingresos
  const ingresosEstimados = ruta.paradas.reduce((sum, p) => sum + p.ingresoEstimado, 0);

  // Calcular eficiencia (basado en ingresos/hora)
  const horasTotales = tiempoTotal / 60;
  const ingresosPorHora = horasTotales > 0 ? ingresosEstimados / horasTotales : 0;
  const eficiencia = Math.min(100, (ingresosPorHora / 300) * 100); // 300 soles/hora = 100%

  return {
    totalParadas: ruta.paradas.length,
    distanciaTotal: Math.round(distanciaTotal * 10) / 10,
    tiempoTotal: Math.round(tiempoTotal),
    clientesOro,
    clientesBronce,
    clientesPlata,
    ingresosEstimados: Math.round(ingresosEstimados),
    eficiencia: Math.round(eficiencia)
  };
}

/**
 * Compara dos rutas y retorna las mejoras
 */
export function compararRutas(
  rutaOriginal: Parada[],
  rutaOptimizada: Parada[],
  puntoInicio?: { lat: number; lng: number }
): {
  distanciaOriginal: number;
  distanciaOptimizada: number;
  distanciaAhorrada: number;
  porcentajeAhorro: number;
  tiempoOriginal: number;
  tiempoOptimizado: number;
  tiempoAhorrado: number;
} {
  const inicio = puntoInicio || { lat: -12.0720, lng: -77.0490 };

  // Calcular para ruta original
  let distanciaOriginal = 0;
  let tiempoOriginal = 0;
  let actual = inicio;

  rutaOriginal.forEach(parada => {
    const distancia = calcularDistancia(actual.lat, actual.lng, parada.lat, parada.lng);
    distanciaOriginal += distancia;
    tiempoOriginal += calcularTiempo(distancia) + parada.duracionEstimada;
    actual = { lat: parada.lat, lng: parada.lng };
  });

  // Calcular para ruta optimizada
  let distanciaOptimizada = 0;
  let tiempoOptimizado = 0;
  actual = inicio;

  rutaOptimizada.forEach(parada => {
    const distancia = calcularDistancia(actual.lat, actual.lng, parada.lat, parada.lng);
    distanciaOptimizada += distancia;
    tiempoOptimizado += calcularTiempo(distancia) + parada.duracionEstimada;
    actual = { lat: parada.lat, lng: parada.lng };
  });

  return {
    distanciaOriginal: Math.round(distanciaOriginal * 10) / 10,
    distanciaOptimizada: Math.round(distanciaOptimizada * 10) / 10,
    distanciaAhorrada: Math.round((distanciaOriginal - distanciaOptimizada) * 10) / 10,
    porcentajeAhorro: Math.round(((distanciaOriginal - distanciaOptimizada) / distanciaOriginal) * 100),
    tiempoOriginal: Math.round(tiempoOriginal),
    tiempoOptimizado: Math.round(tiempoOptimizado),
    tiempoAhorrado: Math.round(tiempoOriginal - tiempoOptimizado)
  };
}

/**
 * Sugiere la mejor ruta para agregar una nueva parada
 */
export function sugerirMejorRuta(
  nuevaParada: Parada,
  rutasDisponibles: Ruta[],
  puntoInicio?: { lat: number; lng: number }
): { rutaId: string; razon: string; impacto: number } | null {
  if (rutasDisponibles.length === 0) return null;

  let mejorRuta: { rutaId: string; razon: string; impacto: number } | null = null;
  let menorImpacto = Infinity;

  rutasDisponibles.forEach(ruta => {
    // Calcular impacto en distancia
    const statsActuales = calcularEstadisticasRuta(ruta, puntoInicio);
    const rutaConNuevaParada = {
      ...ruta,
      paradas: [...ruta.paradas, nuevaParada]
    };
    const statsNuevas = calcularEstadisticasRuta(rutaConNuevaParada, puntoInicio);
    
    const impactoDistancia = statsNuevas.distanciaTotal - statsActuales.distanciaTotal;

    // Preferir rutas con clientes de la misma categoría
    const clientesMismaCategoria = ruta.paradas.filter(p => p.categoria === nuevaParada.categoria).length;
    const bonusCategoria = clientesMismaCategoria * -0.5; // Reduce el impacto

    // Preferir rutas en el mismo distrito
    const clientesMismoDistrito = ruta.paradas.filter(p => p.distrito === nuevaParada.distrito).length;
    const bonusDistrito = clientesMismoDistrito * -1; // Reduce más el impacto

    const impactoTotal = impactoDistancia + bonusCategoria + bonusDistrito;

    if (impactoTotal < menorImpacto) {
      menorImpacto = impactoTotal;
      
      let razon = `Menor impacto en distancia (+${impactoDistancia.toFixed(1)} km)`;
      if (clientesMismoDistrito > 0) {
        razon = `Mismo distrito (${nuevaParada.distrito})`;
      } else if (clientesMismaCategoria > 0) {
        razon = `Misma categoría (${nuevaParada.categoria})`;
      }

      mejorRuta = {
        rutaId: ruta.id,
        razon,
        impacto: impactoDistancia
      };
    }
  });

  return mejorRuta;
}

/**
 * Valida si una ruta necesita optimización
 */
export function necesitaOptimizacion(
  ruta: Ruta,
  puntoInicio?: { lat: number; lng: number }
): { necesita: boolean; ahorroPotencial: number; razon: string } {
  if (ruta.paradas.length <= 2) {
    return { necesita: false, ahorroPotencial: 0, razon: 'Muy pocas paradas para optimizar' };
  }

  const rutaOptimizada = optimizarRuta(ruta.paradas, puntoInicio);
  const comparacion = compararRutas(ruta.paradas, rutaOptimizada, puntoInicio);

  if (comparacion.distanciaAhorrada > 2) { // Más de 2 km de ahorro
    return {
      necesita: true,
      ahorroPotencial: comparacion.distanciaAhorrada,
      razon: `Puedes ahorrar ${comparacion.distanciaAhorrada} km (${comparacion.tiempoAhorrado} min)`
    };
  }

  // Verificar si los clientes Oro están primero
  const primeraOro = ruta.paradas.findIndex(p => p.categoria === 'oro');
  const ultimaNoOro = ruta.paradas.findIndex(p => p.categoria !== 'oro');
  
  if (primeraOro > 0 && ultimaNoOro >= 0 && ultimaNoOro < primeraOro) {
    return {
      necesita: true,
      ahorroPotencial: 0,
      razon: 'Los clientes Oro no están priorizados al inicio'
    };
  }

  return { necesita: false, ahorroPotencial: 0, razon: 'Ruta ya está optimizada' };
}

/**
 * Agrupa paradas por distrito
 */
export function agruparPorDistrito(paradas: Parada[]): Record<string, Parada[]> {
  return paradas.reduce((grupos, parada) => {
    if (!grupos[parada.distrito]) {
      grupos[parada.distrito] = [];
    }
    grupos[parada.distrito].push(parada);
    return grupos;
  }, {} as Record<string, Parada[]>);
}

/**
 * Calcula el costo estimado de combustible
 */
export function calcularCostoCombustible(
  distanciaKm: number,
  consumoPorKm: number = 0.4, // litros por km
  precioCombustible: number = 6 // soles por litro
): number {
  return Math.round(distanciaKm * consumoPorKm * precioCombustible * 100) / 100;
}
