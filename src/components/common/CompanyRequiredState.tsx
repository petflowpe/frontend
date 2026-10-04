import { Building2 } from 'lucide-react';

interface CompanyRequiredStateProps {
  title?: string;
  className?: string;
}

/**
 * Bloqueo explícito cuando el usuario staff no tiene empresa asociada.
 * Evita operar accidentalmente sobre company_id = 1.
 */
export function CompanyRequiredState({
  title = 'Empresa requerida',
  className = 'p-6',
}: CompanyRequiredStateProps) {
  return (
    <div className={className}>
      <div className="mx-auto flex max-w-lg flex-col items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
        <div className="flex items-center gap-2 font-medium">
          <Building2 className="h-5 w-5 shrink-0" />
          {title}
        </div>
        <p className="text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/90">
          No hay empresa asociada a su usuario. Asigne una empresa en Usuarios / Empresas
          o inicie sesión con un usuario de empresa. No se usa una empresa por defecto
          para evitar mezclar datos entre tenants.
        </p>
      </div>
    </div>
  );
}
