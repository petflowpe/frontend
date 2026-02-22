/**
 * Página 404 - Recurso no encontrado
 */

import { Button } from '../components/ui/button';
import { FileQuestion, Home } from 'lucide-react';

interface NotFoundProps {
  onGoHome?: () => void;
}

export function NotFound({ onGoHome }: NotFoundProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="text-center max-w-md">
        <div className="inline-flex rounded-full bg-slate-200 dark:bg-slate-800 p-4 mb-6">
          <FileQuestion className="h-16 w-16 text-slate-500 dark:text-slate-400" aria-hidden />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Página no encontrada</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          El enlace que seguiste no existe o fue movido.
        </p>
        <Button
          onClick={onGoHome ?? (() => (window.location.href = '/'))}
          className="min-h-[44px] min-w-[44px]"
        >
          <Home className="h-4 w-4 mr-2" />
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
