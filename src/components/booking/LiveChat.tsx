import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Paperclip, Smile, Phone, Video, MoreVertical, Check, CheckCheck, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image';
}

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! 👋 Soy María, tu asistente de SmartPet. ¿En qué puedo ayudarte hoy?',
      sender: 'agent',
      timestamp: new Date(Date.now() - 60000),
      status: 'read',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agentInfo = {
    name: 'María González',
    role: 'Asistente de Soporte',
    avatar: null,
    status: 'online',
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simular respuesta del agente
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        '¡Por supuesto! Déjame verificar eso para ti. 😊',
        'Entiendo. Te puedo ayudar con eso.',
        '¡Excelente pregunta! Te explico...',
        'Déjame revisar la información y te respondo enseguida.',
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'agent',
        timestamp: new Date(),
        status: 'read',
      };

      setMessages(prev => [...prev, response]);
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, 1500);

    // Actualizar estado del mensaje a "delivered" y "read"
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 500);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
      ));
    }, 1000);
  };

  const quickReplies = [
    'Cancelar cita',
    'Cambiar horario',
    'Ver precios',
    'Zonas de servicio',
  ];

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
            >
              <MessageCircle className="w-7 h-7" />
              
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
                >
                  {unreadCount}
                </motion.div>
              )}

              {/* Pulse animation */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-blue-600 rounded-full"
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md"
          >
            <Card className="shadow-2xl overflow-hidden">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="border-2 border-white">
                        <AvatarImage src={agentInfo.avatar} />
                        <AvatarFallback className="bg-white text-blue-600">
                          {agentInfo.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                      />
                    </div>
                    
                    <div>
                      <div className="font-semibold">{agentInfo.name}</div>
                      <div className="text-xs opacity-90 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        En línea • Responde en ~2 min
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Video className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4 text-xs opacity-90">
                  <div>⚡ Respuesta rápida</div>
                  <div>🔒 Conversación segura</div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 bg-slate-50">
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        {message.sender === 'agent' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                {agentInfo.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-slate-500">{agentInfo.name}</span>
                          </div>
                        )}
                        
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`rounded-2xl px-4 py-2 ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-900'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </motion.div>

                        <div className={`flex items-center gap-1 mt-1 text-xs text-slate-500 ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>{message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                          {message.sender === 'user' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              {message.status === 'read' ? (
                                <CheckCheck className="w-4 h-4 text-blue-500" />
                              ) : message.status === 'delivered' ? (
                                <CheckCheck className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 mb-4"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                          {agentInfo.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-2 bg-white border-t flex gap-2 overflow-x-auto"
                >
                  {quickReplies.map((reply, index) => (
                    <motion.button
                      key={reply}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setInputValue(reply)}
                      className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                      {reply}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5 text-slate-500" />
                  </motion.button>

                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1"
                  />

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Smile className="w-5 h-5 text-slate-500" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={sendMessage}
                    disabled={!inputValue.trim()}
                    className={`p-2 rounded-lg transition-colors ${
                      inputValue.trim()
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
