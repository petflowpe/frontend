import { useState, useMemo, useEffect } from 'react';
import { formatDate } from '../utils/helpers';
import { MEDICAL_TREATMENTS, type TreatmentConfig } from '../config/medicalTreatments';
import { toast } from 'sonner';
import { TreatmentConfigCard } from './TreatmentConfigCard';
import { useClients } from '../hooks/useClients';
import { useMedicalRecords, type MedicalRecord, type TreatmentType } from '../hooks/useMedicalRecords';
import {
  Syringe,
  Shield,
  Bug,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Bell,
  Calendar as CalendarIcon,
  Download,
  Settings,
  Plus,
  Info,
  Stethoscope,
  Save,
  Search,
  Filter,
  Activity,
  Trash2
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from './ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Input } from './ui/input';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar } from './ui/calendar';
import { getPendingAction, clearPendingAction } from '../utils/navigationBridge';

export function MedicalCare() {
  // Hooks de datos reales
  const { clients } = useClients();
  const { records, createRecord, loading: loadingRecords, getReminders, deleteRecord } = useMedicalRecords();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPetFilter, setSelectedPetFilter] = useState('all');
  const [showNewTreatment, setShowNewTreatment] = useState(false);
  const [showTreatmentConfig, setShowTreatmentConfig] = useState(false);
  
  // Estado para nuevo registro
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newRecordData, setNewRecordData] = useState<Partial<MedicalRecord>>({
    cost: 0,
    type: 'vaccine',
    veterinarianName: ''
  });
  const [selectedPetIdForNew, setSelectedPetIdForNew] = useState('');

  useEffect(() => {
    const pending = getPendingAction('medical');
    if (!pending || pending.action !== 'focus_pet') return;
    const petId = String(pending.payload?.petId || '');
    if (petId) {
      setSelectedPetFilter(petId);
      if (pending.payload?.petName) {
        toast.info(`Mostrando historial de ${pending.payload.petName}`);
      }
    }
    clearPendingAction();
  }, []);

  // Configuración de tratamientos (Local por ahora, idealmente en DB también)
  const [treatmentConfigs, setTreatmentConfigs] = useState<TreatmentConfig[]>([...MEDICAL_TREATMENTS]);

  // --- PROCESAMIENTO DE DATOS ---

  // Obtener lista plana de todas las mascotas para los selectores
  const allPets = useMemo(() => {
    return clients.flatMap(client => 
      (client.pets || []).map(pet => ({
        id: pet.id.toString(),
        name: pet.name,
        ownerName: client.fullName,
        breed: pet.breed,
        birthDate: pet.birthDate
      }))
    );
  }, [clients]);

  // Filtrar registros médicos
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = 
        record.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPet = selectedPetFilter === 'all' || record.petId === selectedPetFilter;

      return matchesSearch && matchesPet;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, searchTerm, selectedPetFilter]);

  // Obtener recordatorios reales
  const reminders = useMemo(() => getReminders(), [records]);

  // --- HANDLERS ---

  const handleCreateRecord = async () => {
    if (!selectedPetIdForNew || !newRecordData.name || !newRecordData.veterinarianName) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    const selectedPet = allPets.find(p => p.id === selectedPetIdForNew);
    if (!selectedPet) return;

    // Calcular próxima fecha si se seleccionó un periodo
    let nextDueDate = undefined;
    if (newRecordData.nextDueDate) { // Si ya viene del input directo
       nextDueDate = newRecordData.nextDueDate;
    }

    try {
      await createRecord({
        petId: selectedPet.id,
        petName: selectedPet.name,
        ownerName: selectedPet.ownerName,
        type: newRecordData.type as TreatmentType,
        name: newRecordData.name!,
        date: selectedDate.toISOString().split('T')[0],
        nextDueDate: nextDueDate, 
        veterinarianName: newRecordData.veterinarianName!,
        notes: newRecordData.notes || '',
        cost: Number(newRecordData.cost) || 0,
        status: 'completed'
      });
      
      setShowNewTreatment(false);
      setNewRecordData({ cost: 0, type: 'vaccine', veterinarianName: '' });
      setSelectedPetIdForNew('');
      toast.success('Tratamiento registrado exitosamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar tratamiento');
    }
  };

  const handleNextDueSelect = (months: string) => {
    const date = new Date(selectedDate);
    date.setMonth(date.getMonth() + parseInt(months));
    setNewRecordData(prev => ({
      ...prev,
      nextDueDate: date.toISOString().split('T')[0]
    }));
  };

  // --- CONFIGURACION UI ---

  const treatmentTypes = {
    vaccine: { 
      label: 'Vacuna', 
      icon: Syringe, 
      color: 'blue',
      bgClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    deworming: { 
      label: 'Desparasitación', 
      icon: Shield, 
      color: 'green',
      bgClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    },
    flea: { 
      label: 'Antipulgas', 
      icon: Bug, 
      color: 'orange',
      bgClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    },
    surgery: { 
      label: 'Cirugía', 
      icon: Activity, 
      color: 'red',
      bgClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    },
    consultation: { 
      label: 'Consulta', 
      icon: Stethoscope, 
      color: 'purple',
      bgClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    },
    other: { 
      label: 'Otro', 
      icon: FileText, 
      color: 'gray',
      bgClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completado', color: 'green', icon: CheckCircle2 };
      case 'overdue':
        return { label: 'Vencido', color: 'red', icon: AlertTriangle };
      case 'upcoming':
        return { label: 'Próximo', color: 'yellow', icon: Clock };
      default:
        return { label: 'Pendiente', color: 'gray', icon: Clock };
    }
  };

  const TimelineItem = ({ item, isLast = false }: { item: MedicalRecord, isLast?: boolean }) => {
    const typeConfig = treatmentTypes[item.type] || treatmentTypes.other;
    const statusConfig = getStatusConfig(item.status);
    const StatusIcon = statusConfig.icon;
    const TypeIcon = typeConfig.icon;

    return (
      <div className="flex items-start space-x-4 animate-slide-up">
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
            item.status === 'completed' ? 'bg-green-100 dark:bg-green-900' :
            item.status === 'overdue' ? 'bg-red-100 dark:bg-red-900' :
            'bg-yellow-100 dark:bg-yellow-900'
          }`}>
            <TypeIcon className={`h-6 w-6 ${
              item.status === 'completed' ? 'text-green-600 dark:text-green-400' :
              item.status === 'overdue' ? 'text-red-600 dark:text-red-400' :
              'text-yellow-600 dark:text-yellow-400'
            }`} />
          </div>
          {!isLast && (
            <div className="w-0.5 h-full min-h-[4rem] bg-gray-200 dark:bg-gray-700 mt-2"></div>
          )}
        </div>
        
        <div className="flex-1 pb-8">
          <Card className="p-4 hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: item.status === 'overdue' ? 'red' : item.status === 'completed' ? 'green' : 'orange' }}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-lg">{item.petName}</h4>
                  <span className="text-muted-foreground text-sm">• {item.name}</span>
                  <Badge className={typeConfig.bgClass}>
                    {typeConfig.label}
                  </Badge>
                  <Badge variant="outline" className={`${
                    item.status === 'completed' ? 'border-green-200 text-green-700' :
                    item.status === 'overdue' ? 'border-red-200 text-red-700' :
                    'border-yellow-200 text-yellow-700'
                  }`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                  <p><strong>Propietario:</strong> {item.ownerName}</p>
                  <p><strong>Veterinario:</strong> {item.veterinarianName}</p>
                  <p><strong>Fecha Aplicación:</strong> {formatDate(item.date)}</p>
                  {item.nextDueDate && (
                    <p className={new Date(item.nextDueDate) < new Date() ? "text-red-600 font-bold" : ""}>
                      <strong>Próximo Vencimiento:</strong> {formatDate(item.nextDueDate)}
                    </p>
                  )}
                  {item.notes && <p className="col-span-full mt-2 italic bg-gray-50 dark:bg-gray-800 p-2 rounded">"{item.notes}"</p>}
                </div>
              </div>
              
              <div className="text-right flex flex-col items-end gap-2">
                <p className="font-semibold text-primary">{item.cost.toFixed(2)} S/</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => deleteRecord(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Historia Clínica Digital
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestión centralizada de tratamientos, vacunas y recordatorios médicos
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Reporte Médico
          </Button>
          <Button onClick={() => setShowNewTreatment(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Registro
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Vacunas Aplicadas</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {records.filter(item => item.type === 'vaccine' && item.status === 'completed').length}
              </p>
            </div>
            <Syringe className="h-10 w-10 text-blue-500 opacity-80" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Desparasitaciones</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {records.filter(item => item.type === 'deworming' && item.status === 'completed').length}
              </p>
            </div>
            <Shield className="h-10 w-10 text-green-500 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Vencidos / Urgentes</p>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                {reminders.filter(r => r.isOverdue).length}
              </p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500 opacity-80" />
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Próximos 30 días</p>
              <p className="text-3xl font-bold">
                {reminders.filter(r => !r.isOverdue).length}
              </p>
            </div>
            <CalendarIcon className="h-10 w-10 text-gray-400 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Timeline & List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Historial de Tratamientos
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar mascota o tratamiento..." 
                    className="pl-9 w-full sm:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedPetFilter} onValueChange={setSelectedPetFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las mascotas</SelectItem>
                    {allPets.map(pet => (
                      <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-0">
              {loadingRecords ? (
                <div className="text-center py-10">Cargando historiales...</div>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record, index) => (
                  <TimelineItem 
                    key={record.id} 
                    item={record} 
                    isLast={index === filteredRecords.length - 1} 
                  />
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="font-medium text-lg">No se encontraron registros</h3>
                  <p className="text-muted-foreground">Intenta cambiar los filtros o registra un nuevo tratamiento.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Reminders & Alerts */}
        <div className="space-y-6">
          <Card className="p-6 border-l-4 border-l-orange-500 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Recordatorios Activos
              </h3>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {reminders.length} pendientes
              </Badge>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {reminders.length > 0 ? (
                reminders.map((reminder) => (
                  <div key={reminder.id} className={`p-3 rounded-lg border flex flex-col gap-2 ${reminder.isOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {reminder.type === 'vaccine' && <Syringe className="h-4 w-4 text-blue-500" />}
                        {reminder.type === 'deworming' && <Shield className="h-4 w-4 text-green-500" />}
                        {reminder.type === 'flea' && <Bug className="h-4 w-4 text-orange-500" />}
                        <span className="font-semibold text-sm">{reminder.petName}</span>
                      </div>
                      <span className={`text-xs font-bold ${reminder.isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                        {reminder.isOverdue ? `${Math.abs(reminder.daysUntil)}d vencido` : `${reminder.daysUntil}d`}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{reminder.name}</p>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-gray-100 dark:border-gray-700 mt-1">
                      <span>Propietario: {reminder.ownerName}</span>
                      <span>{formatDate(reminder.nextDueDate!)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No hay recordatorios pendientes</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Nuevo Tratamiento */}
      <Dialog open={showNewTreatment} onOpenChange={setShowNewTreatment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Tratamiento</DialogTitle>
            <DialogDescription>
              Completa la información médica de la mascota
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Mascota *</label>
                <Select value={selectedPetIdForNew} onValueChange={setSelectedPetIdForNew}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} - {pet.ownerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Tipo de Tratamiento *</label>
                <Select 
                  value={newRecordData.type} 
                  onValueChange={(val) => setNewRecordData({...newRecordData, type: val as TreatmentType})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccine">Vacuna</SelectItem>
                    <SelectItem value="deworming">Desparasitación</SelectItem>
                    <SelectItem value="flea">Antipulgas</SelectItem>
                    <SelectItem value="surgery">Cirugía</SelectItem>
                    <SelectItem value="consultation">Consulta General</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre del Tratamiento *</label>
                <Input 
                  placeholder="Ej: Vacuna Quintuple" 
                  value={newRecordData.name || ''}
                  onChange={(e) => setNewRecordData({...newRecordData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Fecha de Aplicación *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? formatDate(selectedDate.toISOString()) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Veterinario Responsable *</label>
                <Input 
                  placeholder="Dr. Nombre Apellido" 
                  value={newRecordData.veterinarianName || ''}
                  onChange={(e) => setNewRecordData({...newRecordData, veterinarianName: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Costo (S/)</label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={newRecordData.cost}
                  onChange={(e) => setNewRecordData({...newRecordData, cost: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Próximo Vencimiento (Recordatorio)</label>
                <div className="flex gap-2 mb-2">
                  <Button variant="outline" size="sm" onClick={() => handleNextDueSelect('1')} type="button">1 Mes</Button>
                  <Button variant="outline" size="sm" onClick={() => handleNextDueSelect('3')} type="button">3 Meses</Button>
                  <Button variant="outline" size="sm" onClick={() => handleNextDueSelect('12')} type="button">1 Año</Button>
                </div>
                <Input 
                  type="date"
                  value={newRecordData.nextDueDate || ''}
                  onChange={(e) => setNewRecordData({...newRecordData, nextDueDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Notas / Observaciones</label>
                <Input 
                  placeholder="Reacciones, lote, peso, etc." 
                  value={newRecordData.notes || ''}
                  onChange={(e) => setNewRecordData({...newRecordData, notes: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowNewTreatment(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRecord}>
              Guardar Historia Clínica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
