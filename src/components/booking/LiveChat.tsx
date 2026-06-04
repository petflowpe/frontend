import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, CheckCheck } from 'lucide-react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { usePublicChat } from '../../hooks/usePublicChat';

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevCountRef = useRef(0);

  const { messages, loading, sending, sendMessage, enabled, agentName, agentRole } =
    usePublicChat(isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      prevCountRef.current = messages.length;
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && messages.length > prevCountRef.current) {
      const last = messages[messages.length - 1];
      if (last?.sender === 'agent') {
        setUnreadCount((c) => c + (messages.length - prevCountRef.current));
      }
    }
    if (isOpen) prevCountRef.current = messages.length;
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;
    const text = inputValue;
    setInputValue('');
    await sendMessage(text);
  };

  if (!enabled && !loading) {
    return null;
  }

  const quickReplies = ['Ver precios', 'Horario', 'Zonas de servicio', 'Cancelar cita'];

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white"
              aria-label="Abrir chat"
            >
              <MessageCircle className="w-7 h-7" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md"
          >
            <Card className="shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="border-2 border-white">
                      <AvatarFallback className="bg-white text-blue-600">
                        {agentName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{agentName}</div>
                      <div className="text-xs opacity-90">{agentRole}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-4 bg-slate-50">
                {loading ? (
                  <p className="text-sm text-slate-500 text-center">Conectando…</p>
                ) : (
                  messages.map((message) => {
                    const isUser = message.sender === 'user';
                    const ts = message.timestamp
                      ? new Date(message.timestamp).toLocaleTimeString('es-PE', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '';
                    return (
                      <div
                        key={message.id}
                        className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%]`}>
                          <div
                            className={`rounded-2xl px-4 py-2 text-sm ${
                              isUser
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-900'
                            }`}
                          >
                            {message.text}
                          </div>
                          <div
                            className={`flex items-center gap-1 mt-1 text-xs text-slate-500 ${
                              isUser ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span>{ts}</span>
                            {isUser && <CheckCheck className="w-4 h-4 text-blue-500" />}
                            {!isUser && message.sender_type === 'system' && (
                              <span className="text-[10px]">automático</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {messages.length <= 2 && (
                <div className="px-4 py-2 bg-white border-t flex gap-2 overflow-x-auto">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => setInputValue(reply)}
                      className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-full whitespace-nowrap"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 bg-white border-t flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu mensaje..."
                  disabled={sending || loading}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputValue.trim() || sending}
                  className={`p-2 rounded-lg ${
                    inputValue.trim()
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
