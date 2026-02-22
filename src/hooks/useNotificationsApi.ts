import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface NotificationItem {
  id: number;
  company_id?: number;
  user_id?: number;
  type: string;
  priority?: string;
  category?: string;
  title: string;
  message: string;
  read: boolean;
  action_required?: boolean;
  related_module?: string;
  related_id?: string;
  data?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export function useNotificationsApi(params?: { unread_only?: boolean; type?: string; limit?: number }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const query: Record<string, string | number> = { limit: params?.limit ?? 100 };
      if (params?.unread_only) query.unread_only = '1';
      if (params?.type) query.type = params.type;
      const res = await apiClient.get<{ success?: boolean; data?: NotificationItem[] }>(API.notifications.list, query as Record<string, string>);
      const data = (res as { data?: NotificationItem[] })?.data ?? (res as NotificationItem[]);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar notificaciones');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [params?.unread_only, params?.type, params?.limit]);

  const markAsRead = useCallback(async (id: number | string) => {
    try {
      await apiClient.post(API.notifications.markRead(id));
      setNotifications((prev) => prev.map((n) => (n.id === Number(id) ? { ...n, read: true } : n)));
    } catch (e: any) {
      toast.error(e.message || 'Error al marcar');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.post(API.notifications.markAllRead);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('Todas marcadas como leídas');
    } catch (e: any) {
      toast.error(e.message || 'Error al marcar todas');
    }
  }, []);

  const removeNotification = useCallback(async (id: number | string) => {
    try {
      await apiClient.delete(API.notifications.delete(id));
      setNotifications((prev) => prev.filter((n) => n.id !== Number(id)));
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar');
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
}
