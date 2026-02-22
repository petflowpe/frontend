/**
 * Error Boundary - Previene pantallazos blancos
 * Captura errores de React y muestra UI de fallback elegante
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';

// Helper para detectar modo desarrollo/producción
const isDevelopment = () => {
  try {
    return typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
  } catch {
    return false;
  }
};

const isProduction = () => {
  try {
    return typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
  } catch {
    return false;
  }
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error Boundary principal
 * Envuelve toda la aplicación o secciones críticas
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Actualizar estado para mostrar UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Registrar error
    console.error('ErrorBoundary capturó un error:', error, errorInfo);

    // Actualizar estado
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Callback personalizado (para enviar a Sentry, por ejemplo)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // En producción, enviar a servicio de monitoreo
    if (isProduction()) {
      this.reportErrorToService(error, errorInfo);
    }
  }

  reportErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Integrar con Sentry cuando esté configurado
    try {
      // Ejemplo: await Sentry.captureException(error, { extra: errorInfo });
      console.log('Error reportado al servicio de monitoreo');
    } catch (reportError) {
      console.error('Error al reportar error:', reportError);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Si se proporcionó un fallback personalizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de fallback por defecto
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
          <Card className="max-w-2xl w-full shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">¡Ups! Algo salió mal</CardTitle>
                  <CardDescription>
                    Ocurrió un error inesperado. No te preocupes, tu información está segura.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Mensaje amigable */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  ¿Qué puedes hacer?
                </h3>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Intenta recargar la página</li>
                  <li>• Regresa al inicio y vuelve a intentar</li>
                  <li>• Si el problema persiste, contacta a soporte</li>
                </ul>
              </div>

              {/* Detalles técnicos (solo en desarrollo) */}
              {isDevelopment() && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                    <Bug className="inline h-4 w-4 mr-2" />
                    Detalles técnicos (solo visible en desarrollo)
                  </summary>
                  <div className="mt-3 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto text-xs font-mono">
                    <div className="mb-3">
                      <strong className="text-red-400">Error:</strong>
                      <div className="mt-1 text-red-300">{this.state.error.toString()}</div>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong className="text-yellow-400">Stack trace:</strong>
                        <pre className="mt-1 text-yellow-200 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Contador de errores */}
              {this.state.errorCount > 1 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Nota:</strong> Este error ha ocurrido {this.state.errorCount} veces.
                  Si continúa, por favor contacta a soporte.
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={this.handleGoHome}
              >
                <Home className="h-4 w-4 mr-2" />
                Ir al inicio
              </Button>
              
              <Button
                variant="outline"
                onClick={this.handleReset}
                className="min-h-[44px] min-w-[44px]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
              
              <Button
                onClick={this.handleReload}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar página
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Boundary para secciones específicas
 * Muestra un mensaje más pequeño sin reemplazar toda la página
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SectionErrorBoundary capturó un error:', error, errorInfo);
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Error en esta sección
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                No pudimos cargar este contenido. Intenta recargar esta sección.
              </p>
              
              {isDevelopment() && this.state.error && (
                <details className="mb-3">
                  <summary className="cursor-pointer text-xs text-red-600 dark:text-red-400">
                    Ver error
                  </summary>
                  <pre className="mt-2 p-2 bg-red-900 text-red-100 rounded text-xs overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={this.handleReset}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC para envolver componentes fácilmente con ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <SectionErrorBoundary fallback={fallback}>
        <Component {...props} />
      </SectionErrorBoundary>
    );
  };
}

/**
 * Hook para disparar errores manualmente (útil para testing)
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
};

export default ErrorBoundary;