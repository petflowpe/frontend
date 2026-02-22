import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { Notification } from '../utils/systemNotificationsData';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'actionRequired'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function mapApiToNotification(api: { id: number; type?: string; priority?: string; category?: string; title: string; message: string; read: boolean; action_required?: boolean; related_module?: string; related_id?: string; created_at?: string }): Notification {
  return {
    id: api.id,
    type: (api.type as Notification['type']) || 'system',
    priority: (api.priority as Notification['priority']) || 'medium',
    category: api.category ?? '',
    title: api.title,
    message: api.message,
    timestamp: api.created_at ?? new Date().toISOString(),
    read: api.read,
    actionRequired: api.action_required ?? false,
    relatedModule: api.related_module,
    relatedId: api.related_id,
  };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.get<{ success?: boolean; data?: unknown[] }>(API.notifications.list, { limit: '100' });
      const data = Array.isArray((res as { data?: unknown[] })?.data) ? (res as { data: unknown[] }).data : (Array.isArray(res) ? res : []);
      setNotifications((data as Parameters<typeof mapApiToNotification>[0][]).map(mapApiToNotification));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    apiClient.post(API.notifications.markRead(id)).catch(() => {});
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Todas las notificaciones marcadas como leídas');
    apiClient.post(API.notifications.markAllRead).catch(() => {});
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notificación eliminada');
    apiClient.delete(API.notifications.delete(id)).catch(() => {});
  };

  const addNotification = (notifData: Omit<Notification, 'id' | 'timestamp' | 'read' | 'actionRequired'>) => {
    const newNotif: Notification = {
      ...notifData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      actionRequired: notifData.actionRequired ?? false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    toast(newNotif.title, { description: newNotif.message });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      refresh: fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      addNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
