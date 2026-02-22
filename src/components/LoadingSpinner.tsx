import { Heart, LogOut } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  isLogout?: boolean;
}

export function LoadingSpinner({ message, isLogout = false }: LoadingSpinnerProps = {}) {
  const displayMessage = message || (isLogout ? 'Cerrando sesión...' : 'Cargando tu centro de control...');
  const Icon = isLogout ? LogOut : Heart;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <div className="text-center space-y-4">
        {/* Logo animado */}
        <div className="relative">
          <div className={`w-16 h-16 bg-gradient-to-br ${isLogout ? 'from-red-500 to-orange-600' : 'from-blue-500 to-purple-600'} rounded-full flex items-center justify-center shadow-xl animate-pulse`}>
            <Icon className={`h-8 w-8 text-white ${isLogout ? 'animate-pulse' : ''}`} />
          </div>
          <div className={`absolute inset-0 w-16 h-16 border-4 ${isLogout ? 'border-red-200 dark:border-red-800' : 'border-blue-200 dark:border-blue-800'} rounded-full animate-spin border-t-transparent`}></div>
        </div>
        
        {/* Texto */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SmartPet
          </h2>
          <p className="text-muted-foreground text-sm animate-pulse">
            {displayMessage}
          </p>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div className={`w-full h-full bg-gradient-to-r ${isLogout ? 'from-red-500 to-orange-600' : 'from-blue-500 to-purple-600'} rounded-full animate-pulse`}></div>
        </div>
      </div>
    </div>
  );
}