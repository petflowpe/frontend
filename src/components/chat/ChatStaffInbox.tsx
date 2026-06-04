import { useState } from 'react';
import { Inbox, Send, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import type { useStaffChat } from '../../hooks/useStaffChat';

type StaffChatApi = Pick<
  ReturnType<typeof useStaffChat>,
  | 'conversations'
  | 'messages'
  | 'activeId'
  | 'setActiveId'
  | 'loading'
  | 'reply'
  | 'closeConversation'
>;

interface ChatStaffInboxProps {
  staffChat: StaffChatApi;
}

export function ChatStaffInbox({ staffChat }: ChatStaffInboxProps) {
  const {
    conversations,
    messages,
    activeId,
    setActiveId,
    loading,
    reply,
    closeConversation,
  } = staffChat;
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!activeId || !draft.trim()) return;
    setSending(true);
    try {
      await reply(activeId, draft);
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="w-5 h-5 text-blue-600" />
          Bandeja de chat en vivo
        </CardTitle>
        <CardDescription>Conversaciones del portal público</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && conversations.length === 0 ? (
          <p className="text-sm text-slate-500">Cargando conversaciones…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[320px]">
            <div className="border rounded-lg overflow-y-auto max-h-96">
              {conversations.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">No hay conversaciones abiertas.</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={`w-full text-left p-3 border-b hover:bg-slate-50 ${
                      activeId === c.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium text-sm">{c.visitor_name}</div>
                    {c.tracking_code && (
                      <div className="text-xs text-slate-500">Reserva: {c.tracking_code}</div>
                    )}
                    {c.unread_staff_count > 0 && (
                      <Badge className="mt-1" variant="destructive">
                        {c.unread_staff_count} nuevo(s)
                      </Badge>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="md:col-span-2 border rounded-lg flex flex-col">
              {!activeId ? (
                <p className="p-4 text-sm text-slate-500 flex-1">Selecciona una conversación.</p>
              ) : (
                <>
                  <div className="flex justify-end p-2 border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => closeConversation(activeId)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Cerrar
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`text-sm p-2 rounded-lg max-w-[85%] ${
                          m.sender_type === 'visitor'
                            ? 'bg-slate-100'
                            : 'bg-blue-600 text-white ml-auto'
                        }`}
                      >
                        {m.body}
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t flex gap-2">
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Responder al visitante…"
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button onClick={handleSend} disabled={sending || !draft.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
