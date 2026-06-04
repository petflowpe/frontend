import { useEffect, useState } from 'react';
import { MessageSquare, Save, Plus, Trash2, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { useStaffChat, type ChatAutoReply } from '../hooks/useStaffChat';
import { ChatStaffInbox } from './chat/ChatStaffInbox';

type LocalReply = { id: string; trigger: string; response: string; isActive: boolean };

function toLocal(replies: ChatAutoReply[]): LocalReply[] {
  return (replies || []).map((r) => ({
    id: r.id,
    trigger: r.trigger,
    response: r.response,
    isActive: r.is_active !== false,
  }));
}

function toApi(replies: LocalReply[]): ChatAutoReply[] {
  return replies.map((r) => ({
    id: r.id,
    trigger: r.trigger,
    response: r.response,
    is_active: r.isActive,
  }));
}

export function ChatAutomationConfig() {
  const staffChat = useStaffChat();
  const { settings, loading, saveSettings } = staffChat;
  const [isEnabled, setIsEnabled] = useState(true);
  const [agentName, setAgentName] = useState('Soporte SmartPet');
  const [agentRole, setAgentRole] = useState('Asistente en línea');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [responses, setResponses] = useState<LocalReply[]>([]);
  const [newTrigger, setNewTrigger] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setIsEnabled(settings.enabled !== false);
    setAgentName(settings.agent_name || 'Soporte SmartPet');
    setAgentRole(settings.agent_role || 'Asistente en línea');
    setWelcomeMessage(settings.welcome_message || '');
    setResponses(toLocal(settings.auto_replies || []));
  }, [settings]);

  const handleAddResponse = () => {
    if (!newTrigger.trim() || !newResponse.trim()) {
      toast.error('Debes ingresar un disparador y una respuesta');
      return;
    }
    setResponses([
      ...responses,
      {
        id: Date.now().toString(),
        trigger: newTrigger,
        response: newResponse,
        isActive: true,
      },
    ]);
    setNewTrigger('');
    setNewResponse('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings({
        enabled: isEnabled,
        agent_name: agentName,
        agent_role: agentRole,
        welcome_message: welcomeMessage,
        auto_replies: toApi(responses),
      });
      toast.success('Configuración del chat guardada');
    } catch {
      toast.error('No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) {
    return <p className="text-slate-500 p-4">Cargando configuración del chat…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <CardTitle>Configuración del asistente virtual</CardTitle>
                </div>
                <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
              </div>
              <CardDescription>
                Respuestas automáticas y mensaje de bienvenida del widget público.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del asistente</Label>
                  <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Rol / subtítulo</Label>
                  <Input value={agentRole} onChange={(e) => setAgentRole(e.target.value)} />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-bold">Mensaje de bienvenida</Label>
                <Textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-4">
                <Label className="font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Respuestas automáticas (triggers)
                </Label>
                <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Ej: precio"
                      value={newTrigger}
                      onChange={(e) => setNewTrigger(e.target.value)}
                    />
                    <Input
                      placeholder="Respuesta..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddResponse} className="w-full bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" /> Agregar
                  </Button>
                </div>
                <div className="space-y-3">
                  {responses.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 border rounded-lg bg-white"
                    >
                      <div className="flex-1">
                        <span className="font-bold text-sm">"{item.trigger}"</span>
                        <p className="text-sm text-slate-600">{item.response}</p>
                      </div>
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() =>
                          setResponses(
                            responses.map((r) =>
                              r.id === item.id ? { ...r, isActive: !r.isActive } : r
                            )
                          )
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setResponses(responses.filter((r) => r.id !== item.id))}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" /> Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Label className="block mb-4 font-bold">Vista previa</Label>
          <div className="bg-white rounded-2xl shadow-xl border max-w-[320px] mx-auto p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{agentName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{agentName}</div>
                <div className="text-xs text-slate-500">{agentRole}</div>
              </div>
              {!isEnabled && <Badge variant="secondary">Desactivado</Badge>}
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-sm">{welcomeMessage}</div>
            {responses[0] && (
              <>
                <div className="text-right text-sm bg-blue-600 text-white p-2 rounded-lg ml-8">
                  {responses[0].trigger}
                </div>
                <div className="text-sm bg-white border p-2 rounded-lg">{responses[0].response}</div>
              </>
            )}
          </div>
        </div>
      </div>

      <ChatStaffInbox staffChat={staffChat} />
    </div>
  );
}
