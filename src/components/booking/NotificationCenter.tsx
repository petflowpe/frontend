import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, Calendar, Gift, Star, MessageCircle, AlertCircle, TrendingUp, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface Notification {
  id: string;
  type: 'booking' | 'promotion' | 'review' | 'message' | 'alert' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon?: any;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'booking',
      title: 'Recordatorio de Cita',
      message: 'Tu cita para Firulais es mañana a las 10:30 AM',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      icon: Calendar,
    },
    {
      id: '2',
      type: 'promotion',
      title: '🎉 Promoción Especial',
      message: '20% de descuento en tu próximo servicio. Usa código: LOVE20',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      icon: Gift,
    },
    {
      id: '3',
      type: 'review',
      title: 'Califica tu Experiencia',
      message: '¿Cómo estuvo tu servicio del 20 de Diciembre? Déjanos una reseña',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: true,
      icon: Star,
    },
    {
      id: '4',
      type: 'message',
      title: 'Nuevo Mensaje',
      message: 'María González te ha enviado un mensaje sobre tu próxima cita',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      icon: MessageCircle,
    },
    {
      id: '5',
      type: 'achievement',
      title: '🏆 Logro Desbloqueado',
      message: '¡Has completado 10 servicios! Ganaste 100 puntos extra',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      read: true,
      icon: TrendingUp,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const typeColors: Record<string, string> = {
    booking: 'bg-blue-100 text-blue-600',
    promotion: 'bg-purple-100 text-purple-600',
    review: 'bg-yellow-100 text-yellow-600',
    message: 'bg-green-100 text-green-600',
    alert: 'bg-red-100 text-red-600',
    achievement: 'bg-orange-100 text-orange-600',
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  };

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Bell className="w-6 h-6 text-slate-600" />
          
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse animation for unread */}
          {unreadCount > 0 && (
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full"
            />
          )}
        </motion.button>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Notificaciones</h2>
                    <p className="text-sm opacity-90">
                      {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                    </p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Marcar todo leído
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={clearAll}
                      className="text-xs"
                    >
                      Limpiar todo
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-xs ml-auto"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Configurar
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="flex-1 p-4">
                <AnimatePresence mode="popLayout">
                  {notifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16"
                    >
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-slate-400 font-medium">No tienes notificaciones</p>
                      <p className="text-sm text-slate-400 mt-1">¡Todo está al día! 🎉</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -50, height: 0 }}
                          transition={{ delay: index * 0.05 }}
                          layout
                        >
                          <Card
                            onClick={() => markAsRead(notification.id)}
                            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                              !notification.read ? 'border-l-4 border-blue-500 bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              {/* Icon */}
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                typeColors[notification.type]
                              }`}>
                                {notification.icon ? (
                                  <notification.icon className="w-5 h-5" />
                                ) : (
                                  <Bell className="w-5 h-5" />
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className={`font-semibold text-sm ${
                                    !notification.read ? 'text-slate-900' : 'text-slate-600'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
                                    />
                                  )}
                                </div>
                                
                                <p className="text-sm text-slate-600 mb-2">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-slate-400">
                                    {getRelativeTime(notification.timestamp)}
                                  </span>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                  >
                                    <X className="w-3 h-3 text-slate-400" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-4 border-t bg-slate-50">
                  <Button variant="ghost" className="w-full" size="sm">
                    Ver Historial Completo
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
