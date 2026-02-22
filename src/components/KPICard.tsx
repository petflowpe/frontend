import { LucideIcon } from 'lucide-react';
import { Card } from './ui/card';
import { cn } from './ui/utils';

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: string;
  iconColor?: string;
  onClick?: () => void;
  loading?: boolean;
}

export function KPICard({
  icon: Icon,
  label,
  value,
  change,
  gradient = 'from-blue-500 to-purple-600',
  iconColor = 'text-white',
  onClick,
  loading = false
}: KPICardProps) {
  return (
    <Card 
      className={cn(
        "p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl",
        onClick && "cursor-pointer hover:scale-105"
      )}
      onClick={onClick}
    >
      {/* Background gradient subtle */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-2xl`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
          
          {change && (
            <div className={cn(
              "px-2 py-1 rounded-lg text-xs font-semibold",
              change.isPositive 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {change.isPositive ? '↑' : '↓'} {change.value}
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
          {loading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-foreground">{value}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
