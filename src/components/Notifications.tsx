import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { 
  Bell, 
  Search, 
  Send, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Download,
  Filter,
  Bug,
  Shield,
  Syringe,
  PawPrint,
  User,
  Phone,
  Eye,
  X,
  Save
} from 'lucide-react';
import { 
  generateAllNotifications, 
  filterNotificationsByStatus,
  filterNotificationsByType,
  getNotificationStats,
  type MedicalNotification 
} from '../utils/notificationEngine';
import { 
  sendNotification,
  getNotificationsToSend,
  DEFAULT_CONFIG,
  type NotificationConfig,
  type SendResult
} from '../services/notificationService';
import { toast } from 'sonner';

export function Notifications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'overdue' | 'due-soon' | 'upcoming'>('all');
  const [filterType, setFilterType] = useState<'all' | 'deworming' | 'flea' | 'vaccine'>('all');
  const [selectedNotification, setSelectedNotification] = useState<MedicalNotification | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [config, setConfig] = useState<NotificationConfig>(DEFAULT_CONFIG);

  // Datos de ejemplo de mascotas (en producción vendrían del backend)
  const pets = [
    {
      id: 1,
      name: 'Max',
      ownerName: 'María González Pérez',
      ownerPhone: '+51 612 345 678',
      ownerEmail: 'maria.gonzalez@email.com',
      birthDate: '2021-03-20',
      lastDewormingDate: '2024-11-15',
      lastFleaTreatmentDate: '2024-11-20',
      lastVaccinationDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Bella',
      ownerName: 'María González Pérez',
      ownerPhone: '+51 612 345 678',
      ownerEmail: 'maria.gonzalez@email.com',
      birthDate: '2019-08-10',
      lastDewormingDate: '2024-10-20',
      lastFleaTreatmentDate: '2024-11-15',
      lastVaccinationDate: '2024-02-10'
    },
    {
      id: 3,
      name: 'Luna',
      ownerName: 'John Smith Johnson',
      ownerPhone: '+51 698 765 432',
      ownerEmail: 'john.smith@email.com',
      birthDate: '2022-01-15',
      lastDewormingDate: '2024-09-10',
      lastFleaTreatmentDate: '2024-11-10',
      lastVaccinationDate: '2024-03-15'
    }
  ];

  // Generar notificaciones
  const [allNotifications, setAllNotifications] = useState<MedicalNotification[]>([]);

  useEffect(() => {
    const notifications = generateAllNotifications(pets);
    setAllNotifications(notifications);
  }, []);

  // Filtrar notificaciones
  let filteredNotifications = allNotifications;
  
  if (filterStatus !== 'all') {
    filteredNotifications = filterNotificationsByStatus(filteredNotifications, filterStatus);
  }
  
  if (filterType !== 'all') {
    filteredNotifications = filterNotificationsByType(filteredNotifications, filterType);
  }

  if (searchTerm) {
    filteredNotifications = filteredNotifications.filter(n =>
      n.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.treatmentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Estadísticas
  const stats = getNotificationStats(allNotifications);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'overdue':
        return { label: 'Vencido', icon: AlertTriangle, color: 'text-red-600' };
      case 'due-soon':
        return { label: 'Vence Pronto', icon: Clock, color: 'text-orange-600' };
      case 'upcoming':
        return { label: 'Próximo', icon: Calendar, color: 'text-blue-600' };
      default:
        return { label: 'Completado', icon: CheckCircle2, color: 'text-green-600' };
    }
  };

  const getTreatmentIcon = (type: string) => {
    switch (type) {
      case 'vaccine': return <Syringe className="h-5 w-5" />;
      case 'deworming': return <Bug className="h-5 w-5" />;
      case 'flea': return <Shield className="h-5 w-5" />;
      default: return <PawPrint className="h-5 w-5" />;
    }
  };

  const handleSendNotification = async (notification: MedicalNotification) => {
    setSending(true);
    try {
      const results = await sendNotification(notification, config);
      const successCount = results.filter(r => r.success).length;
      
      toast.success(`✅ Notificación enviada correctamente`, {
        description: `${successCount} canal(es) de envío exitosos`
      });

      // Actualizar notificación como enviada
      setAllNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, notificationSent: true, notificationDate: new Date() } : n)
      );
    } catch (error) {
      toast.error('Error al enviar notificación');
    } finally {
      setSending(false);
      setShowSendDialog(false);
    }
  };

  const handleBulkSend = async () => {
    const toSend = getNotificationsToSend(filteredNotifications, config);
    
    if (toSend.length === 0) {
      toast.info('No hay notificaciones pendientes para enviar');
      return;
    }

    setSending(true);
    try {
      let successCount = 0;
      for (const notification of toSend) {
        const results = await sendNotification(notification, config);
        if (results.some(r => r.success)) {
          successCount++;
          setAllNotifications(prev =>
            prev.map(n => n.id === notification.id ? { ...n, notificationSent: true, notificationDate: new Date() } : n)
          );
        }
      }
      
      toast.success(`✅ Envío masivo completado`, {
        description: `${successCount} de ${toSend.length} notificaciones enviadas`
      });
    } catch (error) {
      toast.error('Error en el envío masivo');
    } finally {
      setSending(false);
    }
  };

  const handleMarkCompleted = (notification: MedicalNotification) => {
    setAllNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, status: 'completed' as const, completedDate: new Date() } : n)
    );
    toast.success('✅ Tratamiento marcado como completado');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            🔔 Centro de Notificaciones Médicas
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            {stats.total} notificaciones • {stats.overdue} vencidas • {stats.dueSoon} próximas
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showConfig} onOpenChange={setShowConfig}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>⚙️ Configuración de Notificaciones</DialogTitle>
                <DialogDescription>
                  Configure los canales de envío y preferencias del sistema de notificaciones
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Sistema de Notificaciones</Label>
                    <p className="text-sm text-muted-foreground">Activar o desactivar todas las notificaciones</p>
                  </div>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                  />
                </div>

                <Separator />

                <div>
                  <Label className="text-base mb-3 block">Canales de Envío</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">Notificaciones por correo electrónico</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.channels.email}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, channels: { ...config.channels, email: checked } })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">SMS</p>
                          <p className="text-sm text-muted-foreground">Mensajes de texto</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.channels.sms}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, channels: { ...config.channels, sms: checked } })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">WhatsApp</p>
                          <p className="text-sm text-muted-foreground">Mensajes por WhatsApp Business</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.channels.whatsapp}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, channels: { ...config.channels, whatsapp: checked } })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-muted-foreground">Notificaciones en la app móvil</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.channels.push}
                        onCheckedChange={(checked) => 
                          setConfig({ ...config, channels: { ...config.channels, push: checked } })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="days">Días de anticipación</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enviar recordatorio X días antes del vencimiento
                  </p>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    max="30"
                    value={config.daysBeforeReminder}
                    onChange={(e) => setConfig({ ...config, daysBeforeReminder: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="time">Hora de envío</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Hora preferida para enviar las notificaciones
                  </p>
                  <Input
                    id="time"
                    type="time"
                    value={config.sendTime}
                    onChange={(e) => setConfig({ ...config, sendTime: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Envío Automático</Label>
                    <p className="text-sm text-muted-foreground">Enviar notificaciones automáticamente todos los días</p>
                  </div>
                  <Switch
                    checked={config.autoSend}
                    onCheckedChange={(checked) => setConfig({ ...config, autoSend: checked })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfig(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  toast.success('✅ Configuración guardada correctamente');
                  setShowConfig(false);
                }}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button onClick={handleBulkSend} disabled={sending}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Enviando...' : 'Enviar Todas'}
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-800 dark:text-red-300 font-medium">Vencidas</p>
              <p className="text-3xl font-bold text-red-900 dark:text-red-200">{stats.overdue}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-800 dark:text-orange-300 font-medium">Próximas (7 días)</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-200">{stats.dueSoon}</p>
            </div>
            <Clock className="h-12 w-12 text-orange-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Programadas</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-200">{stats.upcoming}</p>
            </div>
            <Calendar className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-800 dark:text-purple-300 font-medium">Total</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-200">{stats.total}</p>
            </div>
            <Bell className="h-12 w-12 text-purple-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por mascota, dueño o tratamiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label>Estado</Label>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({stats.total})</SelectItem>
                <SelectItem value="overdue">Vencidos ({stats.overdue})</SelectItem>
                <SelectItem value="due-soon">Próximos ({stats.dueSoon})</SelectItem>
                <SelectItem value="upcoming">Programados ({stats.upcoming})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tipo</Label>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="vaccine">💉 Vacunas ({stats.byType.vaccine})</SelectItem>
                <SelectItem value="deworming">🐛 Desparasitación ({stats.byType.deworming})</SelectItem>
                <SelectItem value="flea">🦟 Antipulgas ({stats.byType.flea})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const statusConfig = getStatusConfig(notification.status);
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={notification.id} className="p-5 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                {/* Icon del tratamiento */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  notification.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30' :
                  notification.status === 'due-soon' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  <div className={
                    notification.status === 'overdue' ? 'text-red-600' :
                    notification.status === 'due-soon' ? 'text-orange-600' :
                    'text-blue-600'
                  }>
                    {getTreatmentIcon(notification.treatmentType)}
                  </div>
                </div>

                {/* Información */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {notification.treatmentName} - {notification.petName}
                        {notification.notificationSent && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Enviada
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <User className="h-3 w-3" />
                        {notification.ownerName}
                      </p>
                    </div>
                    <Badge className={getUrgencyColor(notification.urgency)}>
                      {notification.urgency === 'critical' && '🚨 '}
                      {notification.urgency === 'high' && '⚠️ '}
                      {notification.urgency === 'medium' && '📅 '}
                      {notification.urgency === 'low' && '📆 '}
                      {notification.urgency.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Última Aplicación</p>
                      <p className="font-medium">{notification.lastDate.toLocaleDateString('es-ES')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Próxima Aplicación</p>
                      <p className="font-medium">{notification.nextDate.toLocaleDateString('es-ES')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Estado</p>
                      <p className={`font-medium flex items-center gap-1 ${statusConfig.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {statusConfig.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Días Restantes</p>
                      <p className={`font-bold text-lg ${
                        notification.daysUntil < 0 ? 'text-red-600' :
                        notification.daysUntil <= 3 ? 'text-orange-600' :
                        'text-blue-600'
                      }`}>
                        {notification.daysUntil < 0 
                          ? `${Math.abs(notification.daysUntil)} vencido`
                          : notification.daysUntil === 0
                            ? 'HOY'
                            : notification.daysUntil}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedNotification(notification);
                        setShowSendDialog(true);
                      }}
                      disabled={notification.notificationSent || sending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedNotification(notification)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkCompleted(notification)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Completado
                    </Button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {notification.ownerPhone}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredNotifications.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No hay notificaciones</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Todas las mascotas están al día con sus tratamientos'}
            </p>
          </Card>
        )}
      </div>

      {/* Dialog de envío */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📤 Enviar Notificación</DialogTitle>
            <DialogDescription>
              Confirma el envío de la notificación por los canales habilitados
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">
                  {selectedNotification.treatmentName} - {selectedNotification.petName}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Para: {selectedNotification.ownerName}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Se enviará por:</p>
                <div className="space-y-2">
                  {config.channels.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>Email: {selectedNotification.ownerEmail}</span>
                    </div>
                  )}
                  {config.channels.sms && (
                    <div className="flex items-center gap-2 text-sm">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <span>SMS: {selectedNotification.ownerPhone}</span>
                    </div>
                  )}
                  {config.channels.whatsapp && (
                    <div className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span>WhatsApp: {selectedNotification.ownerPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => selectedNotification && handleSendNotification(selectedNotification)}
              disabled={sending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Enviando...' : 'Confirmar Envío'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
