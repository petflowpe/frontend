import { type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../ui/utils';

export function NativeSelect({
  id,
  value,
  onValueChange,
  disabled,
  children,
  className,
}: {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
  /** Clases extra para el &lt;select&gt; (ej. altura mayor en formularios ERP) */
  className?: string;
}) {
  return (
    <div className="relative w-full">
      <select
        id={id}
        disabled={disabled}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          'border-input bg-input-background dark:bg-input/30 flex h-11 w-full min-w-0 appearance-none rounded-lg border px-3 py-2 pr-10 text-base shadow-xs outline-none transition-[color,box-shadow] md:text-sm',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 opacity-50" aria-hidden />
    </div>
  );
}
