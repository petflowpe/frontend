import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Hook y Context para manejar el tenant actual en la aplicación SaaS
 * Cada clínica (tenant) tiene su propia configuración y datos aislados
 */

export interface Tenant {
  id: string;
  nombre_negocio: string;
  slug: string;
  email_contacto: string;
  plan: 'starter' | 'professional' | 'enterprise';
  estado: 'trial' | 'active' | 'suspended' | 'cancelled';
  zona_horaria: string;
  moneda: string;
  idioma: string;
  logo_url?: string;
  color_primario: string;
  color_secundario: string;
  features: {
    segmentacion: boolean;
    zonas: boolean;
    vehiculos: boolean;
    optimizacion_rutas: boolean;
    reportes_avanzados: boolean;
    api_acceso: boolean;
    multi_sede: boolean;
  };
}

export interface ConfiguracionGlobal {
  tipo_negocio: 'veterinaria' | 'peluqueria' | 'ambos';
  tiene_servicio_movil: boolean;
  tiene_local_fisico: boolean;
  horario_operacion: Record<string, any>;
  notificaciones_email: boolean;
  notificaciones_sms: boolean;
  notificaciones_whatsapp: boolean;
  metodos_pago_aceptados: string[];
  requiere_pago_adelantado: boolean;
  permite_cancelacion: boolean;
  horas_minimas_cancelacion: number;
}

export interface ConfiguracionSegmentacion {
  habilitado: boolean;
  criterio: 'cantidad_mascotas' | 'facturacion' | 'combinado';
  modo: 'automatico' | 'manual';
  categorias: Categoria[];
}

export interface Categoria {
  id: string;
  nombre: string;
  nombre_plural: string;
  icono: string;
  color: string;
  orden: number;
  umbral_min: number;
  umbral_max: number | null;
  descuento_porcentaje: number;
  prioridad_score: number;
  beneficios: string[];
  activa: boolean;
}

interface TenantContextType {
  tenant: Tenant | null;
  configuracion: {
    global?: ConfiguracionGlobal;
    segmentacion?: ConfiguracionSegmentacion;
  };
  isLoading: boolean;
  error: Error | null;
  setTenant: (tenant: Tenant) => void;
  reloadConfig: () => Promise<void>;
  hasFeature: (feature: keyof Tenant['features']) => boolean;
  isPlanAtLeast: (plan: 'starter' | 'professional' | 'enterprise') => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenantContext debe usarse dentro de TenantProvider');
  }
  return context;
}

/**
 * Provider que envuelve la aplicación y proporciona el contexto del tenant
 */
export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [configuracion, setConfiguracion] = useState<{
    global?: ConfiguracionGlobal;
    segmentacion?: ConfiguracionSegmentacion;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Cargar tenant y configuración al montar
  useEffect(() => {
    loadTenant();
  }, []);

  const loadTenant = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Obtener tenant desde:
      // 1. Subdomain (ej: smartpet-lima.app.com → slug: smartpet-lima)
      // 2. localStorage (si es admin navegando entre tenants)
      // 3. JWT token (si viene del login)
      
      const subdomain = window.location.hostname.split('.')[0];
      
      // Por ahora, hardcodeamos el tenant demo
      // En producción, esto vendría de tu API/Supabase
      const tenantData: Tenant = {
        id: '00000000-0000-0000-0000-000000000000',
        nombre_negocio: 'SmartPet Demo',
        slug: subdomain || 'demo-smartpet',
        email_contacto: 'demo@smartpet.com',
        plan: 'professional',
        estado: 'active',
        zona_horaria: 'America/Lima',
        moneda: 'PEN',
        idioma: 'es',
        color_primario: '#FF6B35',
        color_secundario: '#004E89',
        features: {
          segmentacion: true,
          zonas: true,
          vehiculos: true,
          optimizacion_rutas: true,
          reportes_avanzados: true,
          api_acceso: false,
          multi_sede: false
        }
      };

      setTenant(tenantData);
      
      // Cargar configuración
      await loadConfig(tenantData.id);
      
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConfig = async (tenantId: string) => {
    try {
      // TODO: Llamar al backend Laravel para obtener configuración
      // const { apiClient } = await import('../utils/api/client');
      // const data = await apiClient.get(`/companies/${tenantId}/config`);
      
      // Por ahora, configuración de ejemplo
      setConfiguracion({
        global: {
          tipo_negocio: 'ambos',
          tiene_servicio_movil: true,
          tiene_local_fisico: true,
          horario_operacion: {},
          notificaciones_email: true,
          notificaciones_sms: false,
          notificaciones_whatsapp: false,
          metodos_pago_aceptados: ['efectivo', 'tarjeta', 'yape', 'plin'],
          requiere_pago_adelantado: false,
          permite_cancelacion: true,
          horas_minimas_cancelacion: 24
        },
        segmentacion: {
          habilitado: true,
          criterio: 'cantidad_mascotas',
          modo: 'automatico',
          categorias: [
            {
              id: 'oro',
              nombre: 'Oro',
              nombre_plural: 'Clientes Oro',
              icono: '🥇',
              color: '#FFD700',
              orden: 1,
              umbral_min: 4,
              umbral_max: null,
              descuento_porcentaje: 15,
              prioridad_score: 50,
              beneficios: [
                '15% de descuento en todos los servicios',
                'Prioridad en agenda (horarios prime)',
                'Vehículo/personal preferido'
              ],
              activa: true
            },
            {
              id: 'bronce',
              nombre: 'Bronce',
              nombre_plural: 'Clientes Bronce',
              icono: '🥉',
              color: '#CD7F32',
              orden: 2,
              umbral_min: 2,
              umbral_max: 3,
              descuento_porcentaje: 10,
              prioridad_score: 30,
              beneficios: [
                '10% de descuento en todos los servicios',
                'Prioridad en agenda'
              ],
              activa: true
            },
            {
              id: 'plata',
              nombre: 'Plata',
              nombre_plural: 'Clientes Plata',
              icono: '🥈',
              color: '#C0C0C0',
              orden: 3,
              umbral_min: 1,
              umbral_max: 1,
              descuento_porcentaje: 0,
              prioridad_score: 10,
              beneficios: [
                'Servicio estándar de calidad'
              ],
              activa: true
            }
          ]
        }
      });
      
    } catch (err) {
      console.error('Error cargando configuración:', err);
    }
  };

  const reloadConfig = async () => {
    if (tenant) {
      await loadConfig(tenant.id);
    }
  };

  const hasFeature = (feature: keyof Tenant['features']): boolean => {
    return tenant?.features[feature] ?? false;
  };

  const isPlanAtLeast = (plan: 'starter' | 'professional' | 'enterprise'): boolean => {
    if (!tenant) return false;
    
    const planHierarchy = {
      starter: 1,
      professional: 2,
      enterprise: 3
    };
    
    return planHierarchy[tenant.plan] >= planHierarchy[plan];
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        configuracion,
        isLoading,
        error,
        setTenant,
        reloadConfig,
        hasFeature,
        isPlanAtLeast
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook para obtener categorías configuradas del tenant actual
 */
export function useCategorias(): Categoria[] {
  const { configuracion } = useTenantContext();
  return configuracion.segmentacion?.categorias ?? [];
}

/**
 * Hook para encontrar una categoría por nombre
 */
export function useCategoria(nombre: string | null | undefined): Categoria | null {
  const categorias = useCategorias();
  
  if (!nombre) return null;
  
  return categorias.find(c => c.nombre === nombre) ?? null;
}

/**
 * Hook para calcular descuento según categoría
 */
export function useDescuentoCategoria(categoria: string | null | undefined): number {
  const cat = useCategoria(categoria);
  return cat?.descuento_porcentaje ?? 0;
}

/**
 * Hook para aplicar descuento a un precio
 */
export function usePrecioConDescuento(precioBase: number, categoria: string | null | undefined): number {
  const descuento = useDescuentoCategoria(categoria);
  return precioBase * (1 - descuento / 100);
}
