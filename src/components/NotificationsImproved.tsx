import { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNotificationsApi } from '../hooks/useNotificationsApi';
import { 
  Bell, 
  Check, 
  X, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  Info, 
  Settings, 
  Filter,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Truck,
  Users,
  Shield,
  TrendingUp,
  FileText,
  Star,
  Activity,
  Zap,
  AlertCircle,
  CheckCheck,
  Trash2,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from './ui/dialog';

import { Notification } from '../utils/systemNotificationsData';

interface NotificationsImprovedProps {
  onNavigate?: (tab: string) => void;
}

function mapApiToNotification(api: { id: number; type: string; priority?: string; category?: string; title: string; message: string; read: boolean; action_required?: boolean; related_module?: string; related_id?: string; created_at?: string }): Notification {
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

export function NotificationsImproved({ onNavigate }: NotificationsImprovedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showRead, setShowRead] = useState(true);
  const [useApi, setUseApi] = useState(false);

  const api = useNotificationsApi();
  const ctx = useNotifications();

  useEffect(() => {
    api.fetchNotifications();
  }, []);

  useEffect(() => {
    setUseApi(api.notifications.length > 0);
  }, [api.notifications.length]);

  const notifications = useApi
    ? api.notifications.map(mapApiToNotification)
    : ctx.notifications;
  const markAsRead = useApi
    ? (id: number) => api.markAsRead(id)
    : ctx.markAsRead;
  const markAllAsRead = useApi
    ? () => api.markAllAsRead()
    : ctx.markAllAsRead;
  const deleteNotification = useApi
    ? (id: number) => api.removeNotification(id)
    : ctx.deleteNotification;
  const unreadCount = useApi ? api.unreadCount : ctx.unreadCount;

  const [notificationSettings, setNotificationSettings] = useState({
    channels: {
      email: true,
      sms: true,
      push: true,
      whatsapp: false
    },
    types: {
      appointments: true,
      payments: true,
      inventory: true,
      vehicles: true,
      clients: true,
      staff: true,
      medical: true,
      financial: true,
      audit: true,
      system: true
    },
    priorities: {
      critical: true,
      high: true,
      medium: true,
      low: false
    },
    schedule: {
      enabled: false,
      startTime: '08:00',
      endTime: '20:00',
      weekendsEnabled: false
    }
  });

  const [openSettings, setOpenSettings] = useState(false);

  // Funciones de utilidad
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return Calendar;
      case 'payment': return DollarSign;
      case 'financial': return TrendingUp;
      case 'inventory': return Package;
      case 'vehicle': return Truck;
      case 'client': return Users;
      case 'staff': return Users;
      case 'medical': return Shield;
      case 'audit': return AlertCircle;
      case 'system': return Activity;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Filtros
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = 
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notif.client && notif.client.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || notif.type === filterType;
    const matchesPriority = filterPriority === 'all' || notif.priority === filterPriority;
    const matchesRead = showRead || !notif.read;

    return matchesSearch && matchesType && matchesPriority && matchesRead;
  });

  const handleAction = (notif: Notification) => {
    if (notif.relatedModule && onNavigate) {
      // Mapeo específico para casos donde relatedModule no coincide exactamente con el tab
      let targetTab = notif.relatedModule;
      
      // Correcciones de mapeo si son necesarias
      if (notif.relatedModule === 'inventory') targetTab = 'kardex';
      
      toast.info(`Navegando a ${targetTab}...`);
      onNavigate(targetTab);
    } else {
      toast.info(`Detalles: ${notif.title}`, {
        description: 'No se puede navegar al módulo relacionado'
      });
    }
  };

  const handleSaveSettings = () => {
    // Aquí se guardaría en backend/localStorage
    toast.success('Preferencias de notificación actualizadas');
    setOpenSettings(false);
  };

  // Contadores
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.read).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            🔔 Centro de Notificaciones
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            {unreadCount} sin leer • {actionRequiredCount} requieren acción • {criticalCount} críticas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar Todas Leídas
          </Button>

          <Dialog open={openSettings} onOpenChange={setOpenSettings}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Preferencias de Notificación</DialogTitle>
                <DialogDescription>
                  Personaliza cómo y cuándo recibes notificaciones del sistema.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="channels" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="channels">Canales</TabsTrigger>
                  <TabsTrigger value="types">Tipos</TabsTrigger>
                  <TabsTrigger value="schedule">Horario</TabsTrigger>
                </TabsList>
                
                <TabsContent value="channels" className="space-y-4 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Correo Electrónico</Label>
                        <p className="text-sm text-muted-foreground">Recibir resumen diario y alertas críticas</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.channels.email}
                        onCheckedChange={(c) => setNotificationSettings(prev => ({
                          ...prev, channels: { ...prev.channels, email: c }
                        }))}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones Push</Label>
                        <p className="text-sm text-muted-foreground">Alertas en tiempo real en el navegador</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.channels.push}
                        onCheckedChange={(c) => setNotificationSettings(prev => ({
                          ...prev, channels: { ...prev.channels, push: c }
                        }))}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS</Label>
                        <p className="text-sm text-muted-foreground">Solo para alertas críticas y emergencias</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.channels.sms}
                        onCheckedChange={(c) => setNotificationSettings(prev => ({
                          ...prev, channels: { ...prev.channels, sms: c }
                        }))}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="types" className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(notificationSettings.types).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between border p-3 rounded-lg">
                        <Label className="capitalize">{key}</Label>
                        <Switch 
                          checked={value}
                          onCheckedChange={(c) => setNotificationSettings(prev => ({
                            ...prev, types: { ...prev.types, [key]: c }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Modo No Molestar</Label>
                        <p className="text-sm text-muted-foreground">Silenciar notificaciones fuera de horario laboral</p>
                      </div>
                      <Switch 
                        checked={notificationSettings.schedule.enabled}
                        onCheckedChange={(c) => setNotificationSettings(prev => ({
                          ...prev, schedule: { ...prev.schedule, enabled: c }
                        }))}
                      />
                    </div>
                    
                    {notificationSettings.schedule.enabled && (
                      <div className="grid grid-cols-2 gap-4 pt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <Label>Hora Inicio</Label>
                          <Input 
                            type="time" 
                            value={notificationSettings.schedule.startTime}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev, schedule: { ...prev.schedule, startTime: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Hora Fin</Label>
                          <Input 
                            type="time" 
                            value={notificationSettings.schedule.endTime}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev, schedule: { ...prev.schedule, endTime: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenSettings(false)}>Cancelar</Button>
                <Button onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Preferencias
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alertas críticas */}
      {criticalCount > 0 && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950/30">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 dark:text-red-300">
            {criticalCount} Notificación{criticalCount > 1 ? 'es' : ''} Crítica{criticalCount > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription className="text-red-700 dark:text-red-400">
            Requieren atención inmediata. Revisa y actúa lo antes posible.
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Label>Buscar</Label>
            <Input
              placeholder="Buscar notificaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="appointment">Citas</SelectItem>
                <SelectItem value="payment">Pagos</SelectItem>
                <SelectItem value="financial">Financiero</SelectItem>
                <SelectItem value="inventory">Inventario</SelectItem>
                <SelectItem value="vehicle">Vehículos</SelectItem>
                <SelectItem value="client">Clientes</SelectItem>
                <SelectItem value="staff">Personal</SelectItem>
                <SelectItem value="medical">Médico</SelectItem>
                <SelectItem value="audit">Auditoría</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Prioridad</Label>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">🔴 Crítica</SelectItem>
                <SelectItem value="high">🟠 Alta</SelectItem>
                <SelectItem value="medium">🟡 Media</SelectItem>
                <SelectItem value="low">🔵 Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-read"
                checked={showRead}
                onCheckedChange={setShowRead}
              />
              <Label htmlFor="show-read">Mostrar leídas</Label>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de notificaciones */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-semibold">No hay notificaciones</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Estás al día con todas tus notificaciones'}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notif) => {
            const Icon = getTypeIcon(notif.type);
            return (
              <Card
                key={notif.id}
                className={`p-4 transition-all hover:shadow-md ${
                  !notif.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Indicador de prioridad */}
                  <div className={`w-1 h-full ${getPriorityColor(notif.priority)} rounded-full`} />

                  {/* Icono */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notif.read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    <Icon className={`h-5 w-5 ${notif.read ? 'text-gray-600' : 'text-blue-600'}`} />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-semibold ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </h4>
                        <Badge variant={getPriorityBadge(notif.priority)} className="text-xs">
                          {notif.priority.toUpperCase()}
                        </Badge>
                        {notif.actionRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Acción Requerida
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notif.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notif.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(notif.timestamp).toLocaleString('es-ES')}
                      </span>
                      {notif.client && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {notif.client}
                        </span>
                      )}
                      {notif.relatedModule && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {notif.relatedModule}
                        </span>
                      )}
                    </div>

                    {/* Botones de acción */}
                    {notif.actionRequired && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAction(notif)}
                        >
                          Ver Detalles
                        </Button>
                        {notif.data?.retryable && (
                          <Button size="sm" variant="outline">
                            Reintentar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
