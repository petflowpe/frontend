import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../utils/api/client';

const GUEST_TOKEN_KEY = 'smartpet_chat_guest_token';

export interface ChatMessageDto {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  sender_type?: string;
  timestamp?: string;
}

interface ChatConfig {
  enabled: boolean;
  agent_name: string;
  agent_role: string;
  welcome_message: string;
}

function unwrap<T>(res: { data?: T } | T): T {
  return (res as { data?: T }).data ?? (res as T);
}

export function usePublicChat(isOpen: boolean) {
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const lastIdRef = useRef(0);

  const syncMessages = useCallback((incoming: ChatMessageDto[], replace = false) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const base = replace ? [] : [...prev];
      const ids = new Set(base.map((m) => m.id));
      for (const m of incoming) {
        if (!ids.has(m.id)) {
          base.push(m);
          ids.add(m.id);
        }
      }
      const maxId = Math.max(...base.map((m) => parseInt(m.id, 10) || 0), 0);
      if (maxId > lastIdRef.current) lastIdRef.current = maxId;
      return base.sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0));
    });
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    try {
      const cfgRes = await apiClient.getPublic<{ data: ChatConfig }>('/public/chat/config');
      const cfg = unwrap(cfgRes);
      setConfig(cfg);
      if (!cfg.enabled) {
        setLoading(false);
        return;
      }

      const stored =
        typeof window !== 'undefined' ? sessionStorage.getItem(GUEST_TOKEN_KEY) : null;

      const startRes = await apiClient.postPublic<{
        data: { guest_token: string; messages: ChatMessageDto[] };
      }>('/public/chat/start', { guest_token: stored || undefined });

      const data = unwrap(startRes);
      const token = data.guest_token;
      setGuestToken(token);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(GUEST_TOKEN_KEY, token);
      }
      syncMessages(data.messages || [], true);
    } catch {
      setConfig({ enabled: false, agent_name: '', agent_role: '', welcome_message: '' });
    } finally {
      setLoading(false);
    }
  }, [syncMessages]);

  useEffect(() => {
    init();
  }, [init]);

  const poll = useCallback(async () => {
    if (!guestToken) return;
    try {
      const res = await apiClient.getPublic<{
        data: { messages: ChatMessageDto[] };
      }>(`/public/chat/${encodeURIComponent(guestToken)}/messages`, {
        after_id: String(lastIdRef.current),
      });
      const data = unwrap(res);
      syncMessages(data.messages || []);
    } catch {
      /* ignore polling errors */
    }
  }, [guestToken, syncMessages]);

  useEffect(() => {
    if (!isOpen || !guestToken) return;
    poll();
    const id = window.setInterval(poll, 5000);
    return () => window.clearInterval(id);
  }, [isOpen, guestToken, poll]);

  const sendMessage = useCallback(
    async (body: string) => {
      if (!guestToken || !body.trim()) return;
      setSending(true);
      try {
        const res = await apiClient.postPublic<{ data: { messages: ChatMessageDto[] } }>(
          `/public/chat/${encodeURIComponent(guestToken)}/messages`,
          { body: body.trim() }
        );
        const data = unwrap(res);
        syncMessages(data.messages || []);
      } finally {
        setSending(false);
      }
    },
    [guestToken, syncMessages]
  );

  return {
    config,
    messages,
    loading,
    sending,
    sendMessage,
    enabled: config?.enabled !== false,
    agentName: config?.agent_name || 'Soporte SmartPet',
    agentRole: config?.agent_role || 'Asistente en línea',
  };
}
