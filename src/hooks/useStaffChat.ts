import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../utils/api/client';
import { getStoredCompanyId } from '../utils/appointmentMappers';

export interface ChatAutoReply {
  id: string;
  trigger: string;
  response: string;
  is_active: boolean;
}

export interface ChatSettings {
  enabled: boolean;
  agent_name: string;
  agent_role: string;
  welcome_message: string;
  auto_replies: ChatAutoReply[];
}

export interface ChatConversationSummary {
  id: number;
  visitor_name: string;
  visitor_email?: string;
  tracking_code?: string;
  status: string;
  unread_staff_count: number;
  last_message_at?: string;
}

export interface StaffChatMessage {
  id: number;
  sender_type: string;
  body: string;
  created_at?: string;
}

function unwrap<T>(res: { data?: T } | T): T {
  return (res as { data?: T }).data ?? (res as T);
}

const companyParams = () => ({ company_id: getStoredCompanyId() });

export function useStaffChat() {
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<StaffChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    const res = await apiClient.get<{ data: ChatSettings }>('/chat/settings', companyParams());
    setSettings(unwrap(res));
  }, []);

  const saveSettings = useCallback(async (payload: Partial<ChatSettings>) => {
    const res = await apiClient.put<{ data: ChatSettings }>('/chat/settings', {
      ...companyParams(),
      ...payload,
    });
    const saved = unwrap(res);
    setSettings(saved);
    return saved;
  }, []);

  const loadConversations = useCallback(async () => {
    const res = await apiClient.get<{ data: ChatConversationSummary[] }>(
      '/chat/conversations',
      { ...companyParams(), status: 'open' }
    );
    setConversations(unwrap(res));
  }, []);

  const loadConversation = useCallback(async (id: number) => {
    const res = await apiClient.get<{
      data: { messages: StaffChatMessage[] };
    }>(`/chat/conversations/${id}`, companyParams());
    const data = unwrap(res);
    setMessages(data.messages || []);
    await apiClient.patch(`/chat/conversations/${id}/read`, companyParams());
    await loadConversations();
  }, [loadConversations]);

  const reply = useCallback(
    async (id: number, body: string) => {
      await apiClient.post(`/chat/conversations/${id}/messages`, {
        ...companyParams(),
        body,
      });
      await loadConversation(id);
    },
    [loadConversation]
  );

  const closeConversation = useCallback(
    async (id: number) => {
      await apiClient.patch(`/chat/conversations/${id}/close`, companyParams());
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
      await loadConversations();
    },
    [activeId, loadConversations]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadSettings(), loadConversations()]);
    } finally {
      setLoading(false);
    }
  }, [loadSettings, loadConversations]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (activeId) loadConversation(activeId);
  }, [activeId, loadConversation]);

  return {
    settings,
    conversations,
    messages,
    activeId,
    setActiveId,
    loading,
    saveSettings,
    reply,
    closeConversation,
    refresh,
  };
}
