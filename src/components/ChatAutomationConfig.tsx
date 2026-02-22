import { useState } from 'react';
import { MessageSquare, Save, Plus, Trash2, Zap, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

export function ChatAutomationConfig() {
  const [isEnabled, setIsEnabled] = useState(true);
  
  const [welcomeMessage, setWelcomeMessage] = useState(
    "¡Hola! 👋 Soy María, tu asistente de SmartPet. ¿En qué puedo ayudarte hoy?"
  );

  const [responses, setResponses] = useState([
    {
      id: '1',
      trigger: 'Cambiar horario',
      response: '¡Por supuesto! Déjame verificar eso para ti. 😊 Por favor indícame la nueva fecha que prefieres.',
      isActive: true
    },
    {
      id: '2',
      trigger: 'Precios',
      response: 'Nuestros precios varían según el tamaño de tu mascota y el servicio. ¿Podrías indicarme qué servicio te interesa?',
      isActive: true
    },
    {
      id: '3',
      trigger: 'Emergencia',
      response: 'Entiendo que es una emergencia. 🚨 He notificado al veterinario de guardia. Por favor llama al +51 999 888 777 para atención inmediata.',
      isActive: true
    }
  ]);

  const [newTrigger, setNewTrigger] = useState('');
  const [newResponse, setNewResponse] = useState('');

  const handleAddResponse = () => {
    if (!newTrigger.trim() || !newResponse.trim()) {
      toast.error("Debes ingresar un disparador y una respuesta");
      return;
    }

    setResponses([
      ...responses,
      {
        id: Date.now().toString(),
        trigger: newTrigger,
        response: newResponse,
        isActive: true
      }
    ]);
    setNewTrigger('');
    setNewResponse('');
    toast.success("Respuesta automática agregada");
  };

  const handleDeleteResponse = (id: string) => {
    setResponses(responses.filter(r => r.id !== id));
    toast.success("Respuesta eliminada");
  };

  const handleToggleResponse = (id: string) => {
    setResponses(responses.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const handleSave = () => {
    toast.success("Configuración del chat guardada correctamente");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Configuración */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <CardTitle>Configuración del Asistente Virtual</CardTitle>
              </div>
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>
            <CardDescription>
              Configura cómo responde "María", tu asistente virtual, a los clientes en el portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-3">
              <Label className="font-bold">Mensaje de Bienvenida</Label>
              <div className="flex gap-4">
                <Textarea 
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <p className="text-xs text-slate-500">
                Este mensaje se envía automáticamente cuando el cliente abre el chat.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Respuestas Automáticas (Triggers)
                </Label>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Si el cliente dice algo como...</Label>
                    <Input 
                      placeholder="Ej: Cambiar horario" 
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">María responde...</Label>
                    <Input 
                      placeholder="Ej: Claro, déjame ayudarte..." 
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleAddResponse} className="w-full bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" /> Agregar Respuesta
                </Button>
              </div>

              <div className="space-y-3">
                {responses.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors bg-white">
                    <div className="mt-1">
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">"{item.trigger}"</span>
                        {!item.isActive && <Badge variant="secondary" className="text-xs">Desactivado</Badge>}
                      </div>
                      <p className="text-sm text-slate-600">{item.response}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={item.isActive} 
                        onCheckedChange={() => handleToggleResponse(item.id)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteResponse(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" /> Guardar Cambios
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Columna Derecha: Preview */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <Label className="block mb-4 font-bold text-slate-700">Vista Previa del Cliente</Label>
          
          {/* Mockup del Chat (Estilo iOS/Widget) */}
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 max-w-[320px] mx-auto h-[600px] flex flex-col relative">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 pb-6 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <div className="relative">
                     <Avatar className="h-10 w-10 border-2 border-white">
                       <AvatarImage src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop" />
                       <AvatarFallback>MG</AvatarFallback>
                     </Avatar>
                     <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-600"></div>
                   </div>
                   <div>
                     <h3 className="font-bold text-sm">María González</h3>
                     <p className="text-xs opacity-90 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                       En línea
                     </p>
                   </div>
                </div>
                <div className="flex gap-2">
                   {/* Iconos simulados */}
                   <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                     <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </div>
                </div>
              </div>
              <div className="flex gap-2 text-[10px] font-medium opacity-90">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-300" /> Respuesta rápida</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3">🔒</span> Conversación segura</span>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4">
               {/* Mensaje Bienvenida */}
               <div className="flex gap-2 max-w-[85%]">
                 <Avatar className="w-6 h-6 mt-1">
                   <AvatarImage src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop" />
                   <AvatarFallback>MG</AvatarFallback>
                 </Avatar>
                 <div className="space-y-1">
                   <span className="text-[10px] text-slate-400 ml-1">María González</span>
                   <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-800 border border-slate-100">
                     {welcomeMessage}
                   </div>
                   <span className="text-[10px] text-slate-400 ml-1">11:57</span>
                 </div>
               </div>

               {/* Ejemplo de interacción */}
               <div className="flex flex-col items-end space-y-1">
                 <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-sm">
                   {responses[0]?.trigger || "Cambiar horario"}
                 </div>
                 <span className="text-[10px] text-slate-400 mr-1 flex items-center gap-1">
                   11:58 
                   <span className="text-blue-400">✓✓</span>
                 </span>
               </div>

               <div className="flex gap-2 max-w-[85%]">
                 <Avatar className="w-6 h-6 mt-1">
                    <AvatarImage src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop" />
                    <AvatarFallback>MG</AvatarFallback>
                 </Avatar>
                 <div className="space-y-1">
                   <span className="text-[10px] text-slate-400 ml-1">María González</span>
                   <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-800 border border-slate-100">
                     {responses[0]?.response || "Claro, ¿qué horario prefieres?"}
                   </div>
                   <span className="text-[10px] text-slate-400 ml-1">11:58</span>
                 </div>
               </div>
            </div>

            {/* Footer Input */}
            <div className="p-3 bg-white border-t">
              <div className="relative">
                <Input placeholder="Escribe tu mensaje..." className="pl-4 pr-10 rounded-full bg-slate-100 border-none h-10 text-sm" disabled />
                <Button size="icon" className="absolute right-1 top-1 h-8 w-8 rounded-full bg-slate-300" variant="ghost">
                   <Zap className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
