/**
 * Configuración de Sentry para monitoreo de errores
 * Detecta y reporta errores en producción automáticamente
 */

// Helper para acceder a variables de entorno de forma segura
const getEnv = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env as any)[key];
  }
  return undefined;
};

const isDevelopment = () => {
  const env = getEnv('NODE_ENV');
  return !env || env === 'development';
};

// Tipos para evitar errores si Sentry no está instalado
type SentryType = any;

interface SentryConfig {
  dsn?: string;
  environment?: string;
  enabled?: boolean;
  sampleRate?: number;
  tracesSampleRate?: number;
}

interface ErrorContext {
  section?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Servicio de monitoreo de errores
 */
class ErrorMonitoringService {
  private sentry: SentryType | null = null;
  private isInitialized: boolean = false;
  private config: SentryConfig;

  constructor(config: SentryConfig = {}) {
    this.config = {
      environment: getEnv('NODE_ENV') || 'development',
      enabled: !isDevelopment(),
      sampleRate: 1.0,
      tracesSampleRate: 0.1, // 10% de las transacciones
      ...config
    };
  }

  /**
   * Inicializar Sentry
   */
  async init(): Promise<void> {
    // Solo inicializar en producción o si está explícitamente habilitado
    if (!this.config.enabled) {
      console.log('🔍 Sentry: Modo desarrollo - errores solo en consola');
      return;
    }

    try {
      // Importar Sentry dinámicamente
      // npm install @sentry/react --save
      const Sentry = await import('@sentry/react');

      Sentry.init({
        dsn: this.config.dsn || getEnv('NEXT_PUBLIC_SENTRY_DSN'),
        environment: this.config.environment,
        
        // Configuración de sampling
        sampleRate: this.config.sampleRate,
        tracesSampleRate: this.config.tracesSampleRate,

        // Integrations
        integrations: [
          new Sentry.BrowserTracing({
            // Rastrear navegación
            routingInstrumentation: Sentry.reactRouterV6Instrumentation,
          }),
          new Sentry.Replay({
            // Session replay para reproducir errores
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],

        // Before send hook - filtrar datos sensibles
        beforeSend: (event, hint) => {
          return this.beforeSend(event, hint);
        },

        // Ignorar ciertos errores
        ignoreErrors: [
          // Errores del browser
          'ResizeObserver loop limit exceeded',
          'Non-Error promise rejection captured',
          // Errores de extensiones
          'chrome-extension://',
          'moz-extension://',
          // Errores de red
          'NetworkError',
          'Failed to fetch',
        ],

        // URLs a ignorar
        denyUrls: [
          // Chrome extensions
          /extensions\//i,
          /^chrome:\/\//i,
          /^chrome-extension:\/\//i,
        ],
      });

      this.sentry = Sentry;
      this.isInitialized = true;
      console.log('✅ Sentry inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar Sentry:', error);
      console.log('💡 Para habilitar Sentry, instala: npm install @sentry/react');
    }
  }

  /**
   * Filtrar datos sensibles antes de enviar a Sentry
   */
  private beforeSend(event: any, hint: any): any {
    // No enviar en desarrollo
    if (isDevelopment()) {
      console.log('🔍 Sentry (dev):', event);
      return null;
    }

    // Eliminar cookies y headers sensibles
    if (event.request) {
      delete event.request.cookies;
      
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
    }

    // Eliminar datos sensibles del contexto
    if (event.extra) {
      // Eliminar campos sensibles
      const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard'];
      
      for (const key in event.extra) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          event.extra[key] = '[REDACTED]';
        }
      }
    }

    return event;
  }

  /**
   * Capturar excepción
   */
  captureException(error: Error, context?: ErrorContext): void {
    if (!this.isInitialized) {
      console.error('Error (Sentry no inicializado):', error, context);
      return;
    }

    try {
      this.sentry?.captureException(error, {
        level: 'error',
        tags: {
          section: context?.section,
          action: context?.action,
        },
        extra: context,
        user: context?.userId ? { id: context.userId } : undefined,
      });
    } catch (e) {
      console.error('Error al enviar a Sentry:', e);
    }
  }

  /**
   * Capturar mensaje
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    if (!this.isInitialized) {
      console.log(`${level.toUpperCase()}: ${message}`, context);
      return;
    }

    try {
      this.sentry?.captureMessage(message, {
        level,
        tags: {
          section: context?.section,
          action: context?.action,
        },
        extra: context,
      });
    } catch (e) {
      console.error('Error al enviar mensaje a Sentry:', e);
    }
  }

  /**
   * Configurar usuario actual
   */
  setUser(user: { id: string; email?: string; name?: string } | null): void {
    if (!this.isInitialized) return;

    try {
      if (user) {
        this.sentry?.setUser({
          id: user.id,
          email: user.email,
          username: user.name,
        });
      } else {
        this.sentry?.setUser(null);
      }
    } catch (e) {
      console.error('Error al configurar usuario en Sentry:', e);
    }
  }

  /**
   * Agregar breadcrumb (rastro de eventos)
   */
  addBreadcrumb(message: string, category: string, data?: any): void {
    if (!this.isInitialized) return;

    try {
      this.sentry?.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
        timestamp: Date.now() / 1000,
      });
    } catch (e) {
      console.error('Error al agregar breadcrumb:', e);
    }
  }

  /**
   * Crear span de performance
   */
  startTransaction(name: string, operation: string): any {
    if (!this.isInitialized) return null;

    try {
      return this.sentry?.startTransaction({
        name,
        op: operation,
      });
    } catch (e) {
      console.error('Error al iniciar transacción:', e);
      return null;
    }
  }

  /**
   * Capturar error de fetch/API
   */
  captureAPIError(
    endpoint: string,
    method: string,
    statusCode: number,
    error: any
  ): void {
    this.captureException(
      new Error(`API Error: ${method} ${endpoint} - ${statusCode}`),
      {
        section: 'api',
        action: 'fetch',
        endpoint,
        method,
        statusCode,
        errorDetails: error,
      }
    );
  }

  /**
   * Reportar error de React
   */
  captureReactError(error: Error, errorInfo: any): void {
    this.captureException(error, {
      section: 'react',
      action: 'render',
      componentStack: errorInfo?.componentStack,
    });
  }
}

// Singleton instance
export const errorMonitoring = new ErrorMonitoringService();

/**
 * Inicializar Sentry (llamar al inicio de la app)
 */
export const initErrorMonitoring = async (config?: SentryConfig): Promise<void> => {
  await errorMonitoring.init();
};

/**
 * Hook de React para reportar errores fácilmente
 */
export const useErrorMonitoring = () => {
  return {
    captureException: (error: Error, context?: ErrorContext) => {
      errorMonitoring.captureException(error, context);
    },
    captureMessage: (message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext) => {
      errorMonitoring.captureMessage(message, level, context);
    },
    addBreadcrumb: (message: string, category: string, data?: any) => {
      errorMonitoring.addBreadcrumb(message, category, data);
    },
  };
};

/**
 * Wrapper para funciones async que captura errores automáticamente
 */
export const withErrorMonitoring = (
  fn: (...args: any[]) => Promise<any>,
  context?: ErrorContext
) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorMonitoring.captureException(error as Error, context);
      throw error;
    }
  };
};

/**
 * Helper para medir performance de operaciones
 */
export const measurePerformance = async (
  name: string,
  operation: () => Promise<any>
): Promise<any> => {
  const transaction = errorMonitoring.startTransaction(name, 'custom');
  
  try {
    const result = await operation();
    transaction?.finish();
    return result;
  } catch (error) {
    transaction?.finish();
    errorMonitoring.captureException(error as Error, {
      section: 'performance',
      operation: name,
    });
    throw error;
  }
};

/**
 * Configuración por defecto para SmartPet
 */
export const initSmartPetErrorMonitoring = async (): Promise<void> => {
  await initErrorMonitoring({
    dsn: getEnv('NEXT_PUBLIC_SENTRY_DSN'),
    environment: getEnv('NODE_ENV'),
    enabled: !isDevelopment(),
    sampleRate: 1.0,
    tracesSampleRate: 0.1,
  });

  console.log(`
  ╔═══════════════════════════════════════╗
  ║   🔍 Error Monitoring Initialized     ║
  ║                                       ║
  ║   Environment: ${getEnv('NODE_ENV')?.padEnd(24) || 'unknown'.padEnd(24)}║
  ║   Sentry: ${!isDevelopment() ? 'Enabled ✅'.padEnd(28) : 'Disabled (dev) 🟡'.padEnd(28)}║
  ╚═══════════════════════════════════════╝
  `);
};

export default errorMonitoring;