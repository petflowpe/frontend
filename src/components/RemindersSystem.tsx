import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Bell, 
  Package, 
  Shield, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Plus,
  Settings,
  Filter,
  Download
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

export function RemindersSystem() {
  const [activeFilter, setActiveFilter] = useState('all');

  // Recordatorios de productos
  const productReminders = [
    {
      id: 1,
      type: 'product',
      priority: 'high',
      title: 'Stock Bajo - Royal Canin Adult',
      description: 'Solo quedan 2 unidades en stock',
      dueDate: '2024-02-01',
      category: 'Alimento',
      relatedTo: 'Inventario',
      action: 'Reabastecer',
      daysUntil: 0
    },
    {
      id: 2,
      type: 'product',
      priority: 'medium',
      title: 'Compra Programada - Vitaminas MultiVet',
      description: 'Compra programada para cliente VIP',
      dueDate: '2024-02-05',
      category: 'Suplementos',
      relatedTo: 'Bella - Luis García',
      action: 'Comprar',
      daysUntil: 4
    }
  ];

  // Recordatorios médicos
  const medicalReminders = [
    {
      id: 3,
      type: 'medical',
      priority: 'urgent',
      title: 'Antipulgas Vencido - Luna',
      description: 'Tratamiento antipulgas vencido hace 2 días',
      dueDate: '2024-01-29',
      category: 'Antipulgas',
      relatedTo: 'Luna - Carlos Pérez',
      action: 'Aplicar Tratamiento',
      daysUntil: -2
    },
    {
      id: 4,
      type: 'medical',
      priority: 'high',
      title: 'Vacuna Anual - Rocky',
      description: 'Vacuna antirrábica anual programada',
      dueDate: '2024-02-15',
      category: 'Vacuna',
      relatedTo: 'Rocky - Ana Martín',
      action: 'Agendar Cita',
      daysUntil: 14
    },
    {
      id: 5,
      type: 'medical',
      priority: 'medium',
      title: 'Desparasitación - Max',
      description: 'Desparasitación interna trimestral',
      dueDate: '2024-02-10',
      category: 'Desparasitación',
      relatedTo: 'Max - María González',
      action: 'Programar',
      daysUntil: 9
    }
  ];

  // Recordatorios generales
  const generalReminders = [
    {
      id: 6,
      type: 'appointment',
      priority: 'medium',
      title: 'Seguimiento Post-Servicio',
      description: 'Llamar a María González para feedback',
      dueDate: '2024-02-03',
      category: 'Seguimiento',
      relatedTo: 'Max - Servicio 15/01',
      action: 'Llamar',
      daysUntil: 2
    },
    {
      id: 7,
      type: 'maintenance',
      priority: 'low',
      title: 'Mantenimiento Vehículo',
      description: 'Revisión programada Furgoneta #2',
      dueDate: '2024-02-20',
      category: 'Mantenimiento',
      relatedTo: 'Vehículo VAN-002',
      action: 'Programar',
      daysUntil: 19
    }
  ];

  const allReminders = [...productReminders, ...medicalReminders, ...generalReminders]
    .sort((a, b) => {
      // Priorizar por urgencia y luego por días restantes
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.daysUntil - b.daysUntil;
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950/30 dark:text-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Bell className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="h-5 w-5 text-blue-600" />;
      case 'medical': return <Shield className="h-5 w-5 text-green-600" />;
      case 'appointment': return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'maintenance': return <Settings className="h-5 w-5 text-gray-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getDaysText = (days: number) => {
    if (days < 0) return `Vencido hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`;
    if (days === 0) return 'Vence hoy';
    if (days === 1) return 'Vence mañana';
    return `Vence en ${days} días`;
  };

  const ReminderCard = ({ reminder }) => (
    <Card className={`p-4 border-l-4 ${getPriorityColor(reminder.priority)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            {getTypeIcon(reminder.type)}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold">{reminder.title}</h4>
              <Badge variant="outline" className="text-xs">
                {reminder.category}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">{reminder.description}</p>
            
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{reminder.relatedTo}</span>
              <span>•</span>
              <span>{formatDate(reminder.dueDate)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {getPriorityIcon(reminder.priority)}
              <span className={`text-sm font-medium ${
                reminder.daysUntil < 0 ? 'text-red-600' :
                reminder.daysUntil === 0 ? 'text-orange-600' :
                reminder.daysUntil <= 3 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {getDaysText(reminder.daysUntil)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button size="sm" variant="outline">
            {reminder.action}
          </Button>
          <Button size="sm" variant="ghost">
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  const filteredReminders = allReminders.filter(reminder => {
    if (activeFilter === 'all') return true;
    return reminder.type === activeFilter;
  });

  const stats = {
    urgent: allReminders.filter(r => r.priority === 'urgent').length,
    overdue: allReminders.filter(r => r.daysUntil < 0).length,
    today: allReminders.filter(r => r.daysUntil === 0).length,
    thisWeek: allReminders.filter(r => r.daysUntil >= 0 && r.daysUntil <= 7).length
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Centro de Recordatorios
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestiona todos los recordatorios de productos, tratamientos y tareas
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Recordatorio
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Urgentes</p>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.urgent}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Vencidos</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{stats.overdue}</p>
            </div>
            <Clock className="h-12 w-12 text-orange-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Hoy</p>
              <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{stats.today}</p>
            </div>
            <Calendar className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Esta Semana</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.thisWeek}</p>
            </div>
            <Bell className="h-12 w-12 text-blue-500" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="product">Productos</TabsTrigger>
          <TabsTrigger value="medical">Médicos</TabsTrigger>
          <TabsTrigger value="appointment">Citas</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Todos los Recordatorios ({allReminders.length})</h3>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          <div className="space-y-4">
            {allReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="product" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recordatorios de Productos ({productReminders.length})</h3>
          </div>
          
          <div className="space-y-4">
            {productReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recordatorios Médicos ({medicalReminders.length})</h3>
          </div>
          
          <div className="space-y-4">
            {medicalReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appointment" className="space-y-4">
          <div className="text-center py-8">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay recordatorios de citas</h3>
            <p className="text-muted-foreground">Los recordatorios de citas aparecerán aquí</p>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="space-y-4">
            {generalReminders.filter(r => r.type === 'maintenance').map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}