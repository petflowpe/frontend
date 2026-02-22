import { useState, useEffect, useCallback } from 'react';
import {
  SegmentacionConfig,
  CONFIG_DEFAULT,
  calcularCategoria,
  cargarConfiguracion,
  guardarConfiguracion,
  validarConfiguracion,
  generarMensajeCambioCategoria
} from '../../lib/segmentacionUtils';
import { toast } from 'sonner';

interface Cliente {
  id: string;
  nombre: string;
  mascotas: number;
  mascotasActivas: number;
  categoria?: 'oro' | 'bronce' | 'plata';
  gastoMensual?: number;
}

export function useSegmentacion() {
  const [config, setConfig] = useState<SegmentacionConfig>(CONFIG_DEFAULT);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar configuración al iniciar
  useEffect(() => {
    const configuracionGuardada = cargarConfiguracion();
    setConfig(configuracionGuardada);
    setIsLoading(false);
  }, []);

  /**
   * Recalcula la categoría de un cliente basado en sus mascotas activas
   */
  const recalcularCategoriaCliente = useCallback(
    (cliente: Cliente): {
      categoriaAnterior: 'oro' | 'bronce' | 'plata';
      categoriaNueva: 'oro' | 'bronce' | 'plata';
      huboCambio: boolean;
      mensaje: { titulo: string; mensaje: string; tipo: 'upgrade' | 'downgrade' | 'sin-cambio' };
    } => {
      const categoriaAnterior = cliente.categoria || 'plata';
      const categoriaNueva = calcularCategoria(cliente.mascotasActivas, config);
      const huboCambio = categoriaAnterior !== categoriaNueva;

      const mensaje = generarMensajeCambioCategoria(categoriaAnterior, categoriaNueva, config);

      return {
        categoriaAnterior,
        categoriaNueva,
        huboCambio,
        mensaje
      };
    },
    [config]
  );

  /**
   * Actualiza la categoría de un cliente (llamar cuando se agregan/eliminan mascotas)
   */
  const actualizarCategoriaCliente = useCallback(
    (cliente: Cliente, mostrarNotificacion: boolean = true): 'oro' | 'bronce' | 'plata' => {
      const resultado = recalcularCategoriaCliente(cliente);

      if (resultado.huboCambio && mostrarNotificacion) {
        if (resultado.mensaje.tipo === 'upgrade') {
          toast.success(resultado.mensaje.titulo, {
            description: resultado.mensaje.mensaje,
            duration: 5000
          });
        } else if (resultado.mensaje.tipo === 'downgrade') {
          // No mostrar notificación en downgrade por sensibilidad (mascota fallecida)
          console.log('Categoría actualizada:', resultado.categoriaNueva);
        }
      }

      return resultado.categoriaNueva;
    },
    [recalcularCategoriaCliente]
  );

  /**
   * Recalcula categorías de múltiples clientes (útil para migraciones o cambios de config)
   */
  const recalcularTodasLasCategorias = useCallback(
    (clientes: Cliente[]): {
      clientesActualizados: Array<Cliente & { categoriaAnterior: string; categoriaNueva: string }>;
      totalCambios: number;
    } => {
      const clientesActualizados = clientes.map(cliente => {
        const resultado = recalcularCategoriaCliente(cliente);
        return {
          ...cliente,
          categoriaAnterior: resultado.categoriaAnterior,
          categoriaNueva: resultado.categoriaNueva,
          categoria: resultado.categoriaNueva
        };
      });

      const totalCambios = clientesActualizados.filter(
        c => c.categoriaAnterior !== c.categoriaNueva
      ).length;

      return {
        clientesActualizados,
        totalCambios
      };
    },
    [recalcularCategoriaCliente]
  );

  /**
   * Actualiza la configuración de segmentación
   */
  const actualizarConfiguracion = useCallback(
    (nuevaConfig: SegmentacionConfig): { exito: boolean; errores?: string[] } => {
      const validacion = validarConfiguracion(nuevaConfig);

      if (!validacion.valida) {
        toast.error('Configuración inválida', {
          description: validacion.errores.join(', ')
        });
        return { exito: false, errores: validacion.errores };
      }

      setConfig(nuevaConfig);
      guardarConfiguracion(nuevaConfig);

      toast.success('Configuración actualizada', {
        description: 'Los cambios se han aplicado correctamente'
      });

      return { exito: true };
    },
    []
  );

  /**
   * Restaura la configuración por defecto
   */
  const restaurarConfiguracionDefault = useCallback(() => {
    setConfig(CONFIG_DEFAULT);
    guardarConfiguracion(CONFIG_DEFAULT);

    toast.info('Configuración restaurada', {
      description: 'Se ha restaurado la configuración por defecto'
    });
  }, []);

  /**
   * Obtiene la distribución de clientes por categoría
   */
  const obtenerDistribucion = useCallback(
    (clientes: Cliente[]): {
      oro: { cantidad: number; porcentaje: number; ingresos: number };
      bronce: { cantidad: number; porcentaje: number; ingresos: number };
      plata: { cantidad: number; porcentaje: number; ingresos: number };
      total: number;
      totalIngresos: number;
    } => {
      const distribucion = {
        oro: { cantidad: 0, porcentaje: 0, ingresos: 0 },
        bronce: { cantidad: 0, porcentaje: 0, ingresos: 0 },
        plata: { cantidad: 0, porcentaje: 0, ingresos: 0 }
      };

      clientes.forEach(cliente => {
        const categoria = cliente.categoria || calcularCategoria(cliente.mascotasActivas, config);
        distribucion[categoria].cantidad++;
        distribucion[categoria].ingresos += cliente.gastoMensual || 0;
      });

      const total = clientes.length;
      const totalIngresos = distribucion.oro.ingresos + distribucion.bronce.ingresos + distribucion.plata.ingresos;

      if (total > 0) {
        distribucion.oro.porcentaje = Math.round((distribucion.oro.cantidad / total) * 100);
        distribucion.bronce.porcentaje = Math.round((distribucion.bronce.cantidad / total) * 100);
        distribucion.plata.porcentaje = Math.round((distribucion.plata.cantidad / total) * 100);
      }

      return {
        ...distribucion,
        total,
        totalIngresos
      };
    },
    [config]
  );

  return {
    config,
    isLoading,
    recalcularCategoriaCliente,
    actualizarCategoriaCliente,
    recalcularTodasLasCategorias,
    actualizarConfiguracion,
    restaurarConfiguracionDefault,
    obtenerDistribucion
  };
}
