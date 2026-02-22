import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Plus, Search, Filter, MapPin, Phone, Car, FileText, CheckCircle, User, Mail, AlertCircle, X, ChevronRight, PawPrint, Package, Shield, DollarSign, Edit, Trash2, Repeat, Bell, History, Copy, AlertTriangle, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { setPendingAction, getPendingAction, clearPendingAction } from '../utils/navigationBridge';
import { useAppointments } from '../hooks/useAppointments';
import { useClients } from '../hooks/useClients';
import { useProducts } from '../hooks/useProducts';
import { useVehicles } from '../hooks/useVehicles';
import { NewAppointmentDialog } from './appointments/NewAppointmentDialog';
import { RescheduleDialog } from './appointments/RescheduleDialog';
import { AppointmentCard } from './appointments/AppointmentCard';
import { AppointmentFilters } from './appointments/AppointmentFilters';
import { AppointmentStats } from './appointments/AppointmentStats';
import { RecurringSeriesDialog } from './appointments/RecurringSeriesDialog';
import { EditRecurringSeriesDialog } from './appointments/EditRecurringSeriesDialog';
import { Tooltip } from './ui/tooltip';
import { setupNotificationChecker } from '../services/notificationService';
import { apiClient } from '../utils/api/client';
import { getAppointmentDateOnly } from './calendar/calendarDateUtils';

// Días de la semana
const weekDays = [
  { id: 'monday', name: 'Lunes', short: 'Lun' },
  { id: 'tuesday', name: 'Martes', short: 'Mar' },
  { id: 'wednesday', name: 'Miércoles', short: 'Mié' },
  { id: 'thursday', name: 'Jueves', short: 'Jue' },
  { id: 'friday', name: 'Viernes', short: 'Vie' },
  { id: 'saturday', name: 'Sábado', short: 'Sáb' },
  { id: 'sunday', name: 'Domingo', short: 'Dom' }
];

export function Appointments() {
  const { products, services, loading: loadingProducts, updateProductStock } = useProducts();
  const { vehicles, loading: loadingVehicles } = useVehicles();
  const { appointments, loading: loadingAppointments, refreshAppointments: fetchAppointments, createAppointment, updateAppointment } = useAppointments();
  const { clients, loading: loadingClients } = useClients();
  
  // Alias para mantener compatibilidad con código existente
  const servicesDatabase = services;
  const productsDatabase = products;
  const vehiclesDatabase = vehicles; // Ahora usamos los vehículos de la BD

  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClientCreated, setNewClientCreated] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('week');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [groomerFilter, setGroomerFilter] = useState('all');
  const [petFilter, setPetFilter] = useState('all');
  const [activeMainTab, setActiveMainTab] = useState('appointments');

  // Estados para historial y clonación
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryClient, setSelectedHistoryClient] = useState<any>(null);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [appointmentToClone, setAppointmentToClone] = useState<any>(null);
  
  // Estados para reprogramación
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState<any>(null);
  
  // Estados para series recurrentes
  const [showRecurringSeriesDialog, setShowRecurringSeriesDialog] = useState(false);
  const [showEditRecurringSeriesDialog, setShowEditRecurringSeriesDialog] = useState(false);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | undefined>();
  
  // Estados de loading para acciones
  const [completingAppointment, setCompletingAppointment] = useState<string | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<string | null>(null);
  const [cloningAppointment, setCloningAppointment] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    const pending = getPendingAction('appointments');
    if (!pending || pending.action !== 'focus_pet') return;
    const petId = String(pending.payload?.petId || '');
    if (petId) {
      setPetFilter(petId);
      if (pending.payload?.petName) {
        toast.info(`Filtrando citas de ${pending.payload.petName}`);
      }
    }
    clearPendingAction();
  }, []);

  // Configurar verificador de notificaciones automáticas
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      const cleanup = setupNotificationChecker(
        appointments,
        {
          reminderHours: 24,
          confirmationEnabled: true,
          autoConfirm: false, // Cambiar a true para auto-confirmar
        },
        60 // Verificar cada hora
      );

      return cleanup;
    }
  }, [appointments]);

  const handleGenerateInvoice = async (appointment: any) => {
    const invoiceData = {
      origen: 'cita',
      citaId: appointment.id,
      clientId: appointment.clientId,
      client: {
        id: appointment.clientId,
        name: appointment.client,
        document: appointment.clientDocument,
        phone: appointment.phone,
        address: appointment.address
      },
      pet: {
        id: appointment.petId,
        name: appointment.pet,
        breed: appointment.breed
      },
      vehicle: appointment.vehicle,
      items: appointment.items,
      groomer: {
        id: appointment.groomerId,
        name: appointment.groomer
      },
      totalPrice: appointment.totalPrice,
      notes: appointment.notes
    };

    window.dispatchEvent(new CustomEvent('generate-invoice-from-appointment', {
      detail: invoiceData
    }));

    // Actualizamos en servidor
    await updateAppointment(appointment.id, { invoiced: true });
    
    // Guardar acción pendiente para cuando cargue el módulo de facturación
    setPendingAction('invoicing', 'create_from_appointment', invoiceData);

    toast.success('✅ Redirigiendo a Facturación...', {
      description: `Cita ${appointment.id} lista para facturar`
    });

    setTimeout(() => {
      // Usar evento para cambiar tab (App.tsx lo escucha)
      const event = new CustomEvent('navigate-to-invoicing');
      window.dispatchEvent(event);
    }, 500);
  };

  const handleCloneAppointment = (appointment: any) => {
    setAppointmentToClone(appointment);
    setShowCloneDialog(true);
  };

  const executeClone = async () => {
    if (!appointmentToClone) return;

    setCloningAppointment(true);
    try {
      // Remove props that will be auto-generated or reset
      const { id, createdAt, ...rest } = appointmentToClone;

      const clonedAppointment = {
        ...rest,
        status: 'pending',
        invoiced: false,
        reminderSent: false
      };

      // Usar createAppointment del hook que persiste al servidor
      await createAppointment(clonedAppointment);
      
      setShowCloneDialog(false);
      setAppointmentToClone(null);
      
      toast.success('Cita clonada exitosamente', {
        description: 'Se ha creado una nueva cita con los mismos datos'
      });
    } catch (error) {
      toast.error('Error al clonar la cita', {
        description: 'No se pudo crear la copia de la cita. Por favor, intenta nuevamente.'
      });
    } finally {
      setCloningAppointment(false);
    }
  };

  const handleReschedule = (appointment: any) => {
    setAppointmentToReschedule(appointment);
    setShowRescheduleDialog(true);
  };

  const handleViewRecurringSeries = (appointment: any) => {
    const seriesId = appointment.recurrenceSeriesId || appointment.recurrenceInfo?.parentId || appointment.id;
    setSelectedSeriesId(seriesId);
    setShowRecurringSeriesDialog(true);
  };

  const handleEditRecurringSeries = (seriesId: string) => {
    setSelectedSeriesId(seriesId);
    setShowEditRecurringSeriesDialog(true);
  };

  const handleDeleteRecurringSeries = async (seriesId: string) => {
    try {
      // Cancelar todas las citas de la serie que no estén completadas
      const seriesAppointments = (appointments || []).filter(apt => 
        apt.recurring && 
        (apt.recurrenceSeriesId === seriesId || apt.recurrenceInfo?.parentId === seriesId) &&
        apt.status !== 'completed'
      );

      await Promise.all(
        seriesAppointments.map(apt => updateAppointment(apt.id, { status: 'cancelled' }))
      );

      toast.success('Serie eliminada', {
        description: `Se cancelaron ${seriesAppointments.length} citas de la serie`
      });

      fetchAppointments();
    } catch (error: any) {
      toast.error('Error al eliminar la serie', {
        description: error.message || 'No se pudo eliminar la serie. Por favor, intenta nuevamente.'
      });
    }
  };

  const handleViewSeriesAppointments = (seriesId: string) => {
    // Filtrar citas de la serie y actualizar filtros
    const seriesAppointments = (appointments || []).filter(apt => 
      apt.recurring && 
      (apt.recurrenceSeriesId === seriesId || apt.recurrenceInfo?.parentId === seriesId)
    );
    
    toast.info(`Serie con ${seriesAppointments.length} citas`, {
      description: 'Usa los filtros para ver todas las citas de esta serie'
    });
  };

  const handleMarkAsCompleted = async (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    setCompletingAppointment(appointmentId);
    try {
      // 1. Actualizar estado en servidor
      await updateAppointment(appointmentId, { status: 'completed' });
      
      // 2. Descontar stock de productos
      if (appointment.items && appointment.items.length > 0) {
        let stockUpdated = false;
        for (const item of appointment.items) {
          if (item.type === 'product') {
            // Asumimos cantidad 1 por item en la lista
            await updateProductStock(item.id, 1);
            stockUpdated = true;
          }
        }
        if (stockUpdated) {
          toast.success('Stock de inventario actualizado');
        }
      }

      toast.success('Cita completada correctamente', {
        description: `La cita de ${appointment.pet || appointment.petName} ha sido marcada como completada`
      });
    } catch (error) {
      toast.error('Error al completar la cita', {
        description: 'No se pudo actualizar el estado de la cita. Por favor, intenta nuevamente.'
      });
    } finally {
      setCompletingAppointment(null);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setCancellingAppointment(appointmentId);
    try {
      // Usar endpoint de cambio de estado
      try {
        await apiClient.post(`/appointments/${appointmentId}/change-status`, {
          status: 'Cancelada',
          cancellation_reason: 'Cancelada por el usuario'
        });
      } catch (error) {
        // Fallback a updateAppointment
        await updateAppointment(appointmentId, { status: 'cancelled' });
      }
      toast.success('Cita cancelada', {
        description: 'La cita ha sido cancelada correctamente'
      });
      fetchAppointments();
    } catch (error) {
      toast.error('Error al cancelar la cita', {
        description: 'No se pudo cancelar la cita. Por favor, intenta nuevamente.'
      });
    } finally {
      setCancellingAppointment(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'in-progress': return 'En Progreso';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  const filteredAppointments = (appointments || []).filter(appointment => {
    const term = searchTerm.toLowerCase();
    const client = (appointment.client || appointment.clientName || '').toLowerCase();
    const pet = (appointment.pet || appointment.petName || '').toLowerCase();
    const id = (appointment.id || '').toLowerCase();
    const doc = (appointment.clientDocument || '').toLowerCase();

    const matchesSearch = client.includes(term) ||
                         pet.includes(term) ||
                         id.includes(term) ||
                         doc.includes(term);
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    // Filtro por vehículo
    const matchesVehicle = vehicleFilter === 'all' || 
      appointment.vehicle?.id === vehicleFilter || 
      appointment.vehicle?.id?.toString() === vehicleFilter;
    
    // Filtro por groomer
    const matchesGroomer = groomerFilter === 'all' || 
      appointment.groomerId?.toString() === groomerFilter ||
      appointment.groomer?.toLowerCase().includes(groomerFilter.toLowerCase());

    const aptPetId = String(appointment.petId || appointment.pet?.id || '');
    const matchesPet = petFilter === 'all' || aptPetId === petFilter;
    
    let matchesDate = true;
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toLocaleDateString('en-CA');
    const aptDate = getAppointmentDateOnly(appointment.date);

    if (dateFilter === 'today') {
      matchesDate = aptDate === today;
    } else if (dateFilter === 'tomorrow') {
      matchesDate = aptDate === tomorrow;
    } else if (dateFilter === 'week') {
      matchesDate = true;
    }
    
    return matchesSearch && matchesStatus && matchesDate && matchesVehicle && matchesGroomer && matchesPet;
  });

  // Calcular estadísticas (normalizar date por si viene en ISO)
  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayAppointments = (appointments || []).filter(apt => getAppointmentDateOnly(apt.date) === todayStr);
  const completedToday = todayAppointments.filter(apt => apt.status === 'completed').length;
  const inProgressToday = todayAppointments.filter(apt => apt.status === 'in-progress').length;
  const pendingToday = todayAppointments.filter(apt => apt.status === 'pending' || apt.status === 'confirmed').length;
  const recurringCount = (appointments || []).filter(apt => apt.recurring).length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📅 Gestión Avanzada de Citas
          </h1>
          <p className="text-muted-foreground text-lg">
            Sistema completo con búsqueda inteligente, recurrencias y recordatorios automáticos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4 mr-2" />
            Historial
          </Button>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => setShowNewAppointment(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Cita
          </Button>

          <NewAppointmentDialog 
            open={showNewAppointment} 
            onOpenChange={setShowNewAppointment} 
            onSuccess={() => fetchAppointments()}
          />
          
          <RescheduleDialog
            open={showRescheduleDialog}
            onOpenChange={(open) => {
              setShowRescheduleDialog(open);
              if (!open) setAppointmentToReschedule(null);
            }}
            appointment={appointmentToReschedule}
            onSuccess={() => {
              fetchAppointments();
              setShowRescheduleDialog(false);
              setAppointmentToReschedule(null);
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <AppointmentStats appointments={appointments || []} />

      {/* Filters */}
      <AppointmentFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        vehicleFilter={vehicleFilter}
        onVehicleFilterChange={setVehicleFilter}
        vehicles={vehiclesDatabase}
        onClearFilters={() => {
          setStatusFilter('all');
          setDateFilter('today');
          setVehicleFilter('all');
          setGroomerFilter('all');
          setPetFilter('all');
          setSearchTerm('');
        }}
      />

      {petFilter !== 'all' && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
          <span>Filtro activo por mascota desde Gestión de Mascotas</span>
          <Button variant="ghost" size="sm" onClick={() => setPetFilter('all')}>Quitar filtro</Button>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onComplete={handleMarkAsCompleted}
            onCancel={handleCancelAppointment}
            onClone={handleCloneAppointment}
            onReschedule={handleReschedule}
            onGenerateInvoice={handleGenerateInvoice}
            onViewRecurringSeries={handleViewRecurringSeries}
            onConfirm={async (id) => {
              try {
                await updateAppointment(id, { status: 'confirmed' });
                toast.success('Cita confirmada', {
                  description: 'La cita ha sido confirmada correctamente'
                });
              } catch (error) {
                toast.error('Error al confirmar la cita', {
                  description: 'No se pudo confirmar la cita. Por favor, intenta nuevamente.'
                });
              }
            }}
            completingAppointment={completingAppointment}
            cancellingAppointment={cancellingAppointment}
            cloningAppointment={cloningAppointment}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
        ))}
        {loadingAppointments && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 border-2 animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {!loadingAppointments && filteredAppointments.length === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg mb-2">No se encontraron citas</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Programa tu primera cita para comenzar'
            }
          </p>
        </Card>
      )}

      {/* Dialog: Clonar Cita */}
      <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clonar Cita</DialogTitle>
            <DialogDescription>
              ¿Desea crear una copia exacta de esta cita?
            </DialogDescription>
          </DialogHeader>
          {appointmentToClone && (
            <div className="space-y-4">
              <Card className="p-4 bg-muted/50">
                <p className="font-semibold">{appointmentToClone.client} - {appointmentToClone.pet}</p>
                <p className="text-sm text-muted-foreground">{appointmentToClone.date} • {appointmentToClone.time}</p>
                <p className="text-sm text-muted-foreground">Total: S/ {appointmentToClone.totalPrice.toFixed(2)}</p>
              </Card>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCloneDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={executeClone}>
                  <Copy className="h-4 w-4 mr-2" />
                  Clonar Cita
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
