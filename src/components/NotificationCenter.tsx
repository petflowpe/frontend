import { useState } from 'react';
import { BellRing, AlertTriangle, CalendarDays, X, Eye, Wallet, Boxes, Truck, UsersRound, HeartPulse, Zap, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { Notification } from '../utils/systemNotificationsData';
import { useNotifications } from '../contexts/NotificationContext';

interface NotificationCenterProps {
  onViewAll?: () => void;
  onViewDetails?: (notification: Notification) => void;
}

export function NotificationCenter({ onViewAll, onViewDetails }: NotificationCenterProps) {
  const { notifications: ctxNotifications } = useNotifications();
  const notifications = ctxNotifications.filter(n => !n.read);
  const [isOpen, setIsOpen] = useState(false);

  const criticalCount = notifications.filter(n => n.priority === 'critical').length;
  const highCount = notifications.filter(n => n.priority === 'high').length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;
  const totalCount = notifications.length;

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'appointment':
        return <CalendarDays className="h-5 w-5 text-blue-600" />;
      case 'payment':
      case 'financial':
        return <Wallet className="h-5 w-5 text-green-600" />;
      case 'inventory':
        return <Boxes className="h-5 w-5 text-purple-600" />;
      case 'vehicle':
        return <Truck className="h-5 w-5 text-orange-600" />;
      case 'client':
      case 'staff':
        return <UsersRound className="h-5 w-5 text-cyan-600" />;
      case 'medical':
        return <HeartPulse className="h-5 w-5 text-pink-600" />;
      case 'audit':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'system':
        return <Zap className="h-5 w-5 text-gray-600" />;
      default:
        return <BellRing className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (notification: Notification) => {
    if (notification.priority === 'critical') {
      return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
    }
    if (notification.priority === 'high') {
      return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
    }
    if (notification.priority === 'medium') {
      return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
    }
    return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    return `Hace ${diffDays}d`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellRing className="h-5 w-5" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Notificaciones del Sistema</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {totalCount > 0 ? (
            <div className="flex items-center gap-2 text-sm flex-wrap">
              {criticalCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {criticalCount} críticas
                </Badge>
              )}
              {highCount > 0 && (
                <Badge className="bg-orange-500 text-white text-xs">
                  {highCount} altas
                </Badge>
              )}
              {actionRequiredCount > 0 && (
                <Badge className="bg-blue-600 text-white text-xs">
                  {actionRequiredCount} requieren acción
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin notificaciones pendientes</p>
          )}
        </div>

        {/* Lista de notificaciones */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            <>
              {notifications.slice(0, 5).map((notification, index) => (
                <div key={notification.id}>
                  <div className={`p-4 border-l-4 ${getNotificationColor(notification)} transition-colors`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.client && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <UsersRound className="h-3 w-3" />
                            {notification.client}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                          >
                            {notification.category}
                          </Badge>
                          {notification.actionRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Acción Requerida
                            </Badge>
                          )}
                        </div>
                        {/* Botón Ver Detalles para notificaciones con acción requerida */}
                        {notification.actionRequired && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3 text-xs h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('🔍 Ver Detalles clicked:', notification);
                              console.log('🔍 onViewDetails function:', onViewDetails);
                              if (onViewDetails) {
                                onViewDetails(notification);
                                // ✅ NO cerrar el popover aquí - se cierra automáticamente al navegar
                              } else {
                                console.error('❌ onViewDetails no está definido');
                              }
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Detalles
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && index < 4 && <Separator />}
                </div>
              ))}
              
              {notifications.length > 5 && (
                <div className="p-3 bg-muted/30 text-center text-sm text-muted-foreground">
                  +{notifications.length - 5} notificaciones más
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <BellRing className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No hay notificaciones pendientes
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Todas las alertas han sido revisadas
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  onViewAll?.();
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}