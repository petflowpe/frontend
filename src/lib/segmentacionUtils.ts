// Utilidades para el sistema de segmentación automática

export interface CategoriaConfig {
  id: 'oro' | 'bronce' | 'plata';
  nombre: string;
  nombreOriginal: string;
  mascotasMin: number;
  mascotasMax?: number;
  color: string;
  descuento: number;
  icono: string;
}

export interface SegmentacionConfig {
  categorias: CategoriaConfig[];
  actualizadoEn: string;
}

// Configuración por defecto
export const CONFIG_DEFAULT: SegmentacionConfig = {
  categorias: [
    {
      id: 'oro',
      nombre: 'Oro',
      nombreOriginal: 'Oro',
      mascotasMin: 4,
      color: '#FFD700',
      descuento: 15,
      icono: '🥇'
    },
    {
      id: 'bronce',
      nombre: 'Bronce',
      nombreOriginal: 'Bronce',
      mascotasMin: 2,
      mascotasMax: 3,
      color: '#FF6B35',
      descuento: 10,
      icono: '🥉'
    },
    {
      id: 'plata',
      nombre: 'Plata',
      nombreOriginal: 'Plata',
      mascotasMin: 1,
      mascotasMax: 1,
      color: '#9E9E9E',
      descuento: 5,
      icono: '🥈'
    }
  ],
  actualizadoEn: new Date().toISOString()
};

/**
 * Calcula la categoría del cliente basado en sus mascotas activas
 */
export function calcularCategoria(
  mascotasActivas: number,
  config: SegmentacionConfig = CONFIG_DEFAULT
): 'oro' | 'bronce' | 'plata' {
  // Ordenar categorías por mascotasMin descendente
  const categoriasOrdenadas = [...config.categorias].sort(
    (a, b) => b.mascotasMin - a.mascotasMin
  );

  for (const categoria of categoriasOrdenadas) {
    if (mascotasActivas >= categoria.mascotasMin) {
      if (categoria.mascotasMax === undefined || mascotasActivas <= categoria.mascotasMax) {
        return categoria.id;
      }
      // Si no hay máximo, solo verificar mínimo
      if (categoria.mascotasMax === undefined) {
        return categoria.id;
      }
    }
  }

  // Por defecto, retorna la categoría con menos requisitos
  return 'plata';
}

/**
 * Obtiene la configuración de una categoría específica
 */
export function obtenerConfigCategoria(
  categoriaId: 'oro' | 'bronce' | 'plata',
  config: SegmentacionConfig = CONFIG_DEFAULT
): CategoriaConfig {
  return config.categorias.find(c => c.id === categoriaId) || config.categorias[2];
}

/**
 * Calcula el descuento aplicable para un cliente
 */
export function calcularDescuento(
  categoria: 'oro' | 'bronce' | 'plata',
  montoBase: number,
  config: SegmentacionConfig = CONFIG_DEFAULT
): { descuento: number; montoFinal: number; porcentaje: number } {
  const categoriaConfig = obtenerConfigCategoria(categoria, config);
  const porcentaje = categoriaConfig.descuento;
  const descuento = (montoBase * porcentaje) / 100;
  const montoFinal = montoBase - descuento;

  return { descuento, montoFinal, porcentaje };
}

/**
 * Valida la configuración de segmentación
 */
export function validarConfiguracion(config: SegmentacionConfig): {
  valida: boolean;
  errores: string[];
} {
  const errores: string[] = [];

  // Verificar que hay 3 categorías
  if (config.categorias.length !== 3) {
    errores.push('Debe haber exactamente 3 categorías');
  }

  // Verificar que no hay solapamiento de rangos
  const oro = config.categorias.find(c => c.id === 'oro');
  const bronce = config.categorias.find(c => c.id === 'bronce');
  const plata = config.categorias.find(c => c.id === 'plata');

  if (!oro || !bronce || !plata) {
    errores.push('Faltan categorías requeridas (oro, bronce, plata)');
    return { valida: false, errores };
  }

  // Verificar que Oro tiene el umbral más alto
  if (oro.mascotasMin <= (bronce.mascotasMax || 0)) {
    errores.push('El umbral de Oro debe ser mayor que el máximo de Bronce');
  }

  // Verificar que los descuentos son razonables (0-100%)
  config.categorias.forEach(cat => {
    if (cat.descuento < 0 || cat.descuento > 100) {
      errores.push(`Descuento de ${cat.nombre} debe estar entre 0% y 100%`);
    }
  });

  // Verificar que los umbrales son positivos
  config.categorias.forEach(cat => {
    if (cat.mascotasMin < 1) {
      errores.push(`${cat.nombre} debe tener al menos 1 mascota como mínimo`);
    }
  });

  return {
    valida: errores.length === 0,
    errores
  };
}

/**
 * Calcula el impacto de un cambio de configuración
 */
export interface ImpactoConfig {
  categoriaId: 'oro' | 'bronce' | 'plata';
  clientesAntes: number;
  clientesDespues: number;
  diferencia: number;
  ingresosAntes: number;
  ingresosDespues: number;
  diferenciaIngresos: number;
}

export function calcularImpactoConfig(
  clientes: Array<{ id: string; mascotasActivas: number; gastoMensual: number }>,
  configActual: SegmentacionConfig,
  configNueva: SegmentacionConfig
): {
  impactoPorCategoria: ImpactoConfig[];
  totalClientesAntes: number;
  totalClientesDespues: number;
  totalIngresosAntes: number;
  totalIngresosDespues: number;
} {
  // Calcular categorías con config actual
  const distribucionActual = {
    oro: { clientes: 0, ingresos: 0 },
    bronce: { clientes: 0, ingresos: 0 },
    plata: { clientes: 0, ingresos: 0 }
  };

  const distribucionNueva = {
    oro: { clientes: 0, ingresos: 0 },
    bronce: { clientes: 0, ingresos: 0 },
    plata: { clientes: 0, ingresos: 0 }
  };

  clientes.forEach(cliente => {
    const categoriaActual = calcularCategoria(cliente.mascotasActivas, configActual);
    const categoriaNueva = calcularCategoria(cliente.mascotasActivas, configNueva);

    distribucionActual[categoriaActual].clientes++;
    distribucionActual[categoriaActual].ingresos += cliente.gastoMensual;

    distribucionNueva[categoriaNueva].clientes++;
    distribucionNueva[categoriaNueva].ingresos += cliente.gastoMensual;
  });

  const impactoPorCategoria: ImpactoConfig[] = [
    {
      categoriaId: 'oro',
      clientesAntes: distribucionActual.oro.clientes,
      clientesDespues: distribucionNueva.oro.clientes,
      diferencia: distribucionNueva.oro.clientes - distribucionActual.oro.clientes,
      ingresosAntes: distribucionActual.oro.ingresos,
      ingresosDespues: distribucionNueva.oro.ingresos,
      diferenciaIngresos: distribucionNueva.oro.ingresos - distribucionActual.oro.ingresos
    },
    {
      categoriaId: 'bronce',
      clientesAntes: distribucionActual.bronce.clientes,
      clientesDespues: distribucionNueva.bronce.clientes,
      diferencia: distribucionNueva.bronce.clientes - distribucionActual.bronce.clientes,
      ingresosAntes: distribucionActual.bronce.ingresos,
      ingresosDespues: distribucionNueva.bronce.ingresos,
      diferenciaIngresos: distribucionNueva.bronce.ingresos - distribucionActual.bronce.ingresos
    },
    {
      categoriaId: 'plata',
      clientesAntes: distribucionActual.plata.clientes,
      clientesDespues: distribucionNueva.plata.clientes,
      diferencia: distribucionNueva.plata.clientes - distribucionActual.plata.clientes,
      ingresosAntes: distribucionActual.plata.ingresos,
      ingresosDespues: distribucionNueva.plata.ingresos,
      diferenciaIngresos: distribucionNueva.plata.ingresos - distribucionActual.plata.ingresos
    }
  ];

  return {
    impactoPorCategoria,
    totalClientesAntes: clientes.length,
    totalClientesDespues: clientes.length,
    totalIngresosAntes: distribucionActual.oro.ingresos + distribucionActual.bronce.ingresos + distribucionActual.plata.ingresos,
    totalIngresosDespues: distribucionNueva.oro.ingresos + distribucionNueva.bronce.ingresos + distribucionNueva.plata.ingresos
  };
}

/**
 * Genera un mensaje descriptivo del cambio de categoría
 */
export function generarMensajeCambioCategoria(
  categoriaAnterior: 'oro' | 'bronce' | 'plata',
  categoriaNueva: 'oro' | 'bronce' | 'plata',
  config: SegmentacionConfig = CONFIG_DEFAULT
): { titulo: string; mensaje: string; tipo: 'upgrade' | 'downgrade' | 'sin-cambio' } {
  if (categoriaAnterior === categoriaNueva) {
    return {
      titulo: 'Sin cambios',
      mensaje: 'Tu categoría se mantiene',
      tipo: 'sin-cambio'
    };
  }

  const configAnterior = obtenerConfigCategoria(categoriaAnterior, config);
  const configNueva = obtenerConfigCategoria(categoriaNueva, config);

  const esUpgrade = 
    (categoriaAnterior === 'plata' && categoriaNueva === 'bronce') ||
    (categoriaAnterior === 'plata' && categoriaNueva === 'oro') ||
    (categoriaAnterior === 'bronce' && categoriaNueva === 'oro');

  if (esUpgrade) {
    return {
      titulo: `¡Felicidades! Ahora eres cliente ${configNueva.nombre}`,
      mensaje: `Has alcanzado la categoría ${configNueva.icono} ${configNueva.nombre}. Ahora disfrutas de ${configNueva.descuento}% de descuento en todos nuestros servicios.`,
      tipo: 'upgrade'
    };
  }

  return {
    titulo: `Cambio de categoría`,
    mensaje: `Tu categoría ha cambiado a ${configNueva.icono} ${configNueva.nombre} (${configNueva.descuento}% descuento).`,
    tipo: 'downgrade'
  };
}

/**
 * Guarda la configuración en localStorage
 */
export function guardarConfiguracion(config: SegmentacionConfig): void {
  try {
    localStorage.setItem('smartpet_segmentacion_config', JSON.stringify(config));
  } catch (error) {
    console.error('Error guardando configuración:', error);
  }
}

/**
 * Carga la configuración desde localStorage
 */
export function cargarConfiguracion(): SegmentacionConfig {
  try {
    const stored = localStorage.getItem('smartpet_segmentacion_config');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error cargando configuración:', error);
  }
  return CONFIG_DEFAULT;
}
