import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { Calendar, Clock, Plus, Search, Trash2, AlertCircle, ChevronRight, User, PawPrint, Car, ShoppingBag, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useClients } from '../../hooks/useClients';
import { useProducts } from '../../hooks/useProducts';
import { useVehicles } from '../../hooks/useVehicles';
import { useAvailableVehiclesForAppointment } from '../../hooks/useVehicleCoverage';
import { useAppointments } from '../../hooks/useAppointments';
import { createAvailabilityValidator } from '../../services/availabilityValidator';
import { NewClientDialog } from './NewClientDialog';
import { Badge } from '../ui/badge';

// Schema Definition
const appointmentSchema = z.object({
  // Step 1: Client & Pet
  client: z.object({
    id: z.string(),
    fullName: z.string(),
    documentNumber: z.string(),
    phone1: z.string().optional(),
    address: z.string().optional(),
    district: z.string().optional(),
  }, { required_error: "Cliente requerido" }),
  
  pet: z.object({
    id: z.string(),
    name: z.string(),
    breed: z.string(),
    size: z.string().optional(),
  }, { required_error: "Mascota requerida" }).nullable().optional(),
  
  vehicle: z.object({
    id: z.string(),
    name: z.string().optional(),
    driver: z.string().optional(),
    driverName: z.string().optional(),
  }, { required_error: "Vehículo requerido" }).nullable().optional(),

  // Step 2: Items
  items: z.array(z.object({
    id: z.union([z.string(), z.number()]),
    type: z.enum(['service', 'product']),
    name: z.string(),
    price: z.number(),
    duration: z.number().optional(),
    cost: z.number().optional(),
    priceNote: z.string().optional(),
  })).min(1, "Agregue al menos un servicio o producto"),

  // Step 3: Scheduling
  date: z.string().min(1, "Fecha requerida"),
  time: z.string().min(1, "Hora requerida"),
  notes: z.string().optional(),
  
  // Recurrence
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(['weekly', 'biweekly', 'monthly']).default('weekly'),
  recurrenceDays: z.array(z.string()).default([]),
  recurrenceEndDate: z.string().optional(),
  recurrenceOccurrences: z.number().default(4),
  recurrenceFixedTime: z.boolean().default(true),

  // Reminders
  reminderEnabled: z.boolean().default(true),
  reminderHours: z.number().default(24),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onNewClientRequest?: () => void;
  newClient?: any; // Cliente recién creado para auto-seleccionar
  /** Al abrir desde Mascotas (botón Cita), pre-selecciona mascota y salta al paso de crear cita (3) */
  initialPetForNewAppointment?: { petId?: string; clientId?: string; petName?: string; ownerName?: string } | null;
  /** Al abrir desde Clientes, pre-selecciona el cliente en paso 1 */
  initialClientForNewAppointment?: { clientId?: string; clientDocument?: string; clientName?: string } | null;
}

export function NewAppointmentDialog({ open, onOpenChange, onSuccess, onNewClientRequest, newClient, initialPetForNewAppointment, initialClientForNewAppointment }: NewAppointmentDialogProps) {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [availabilitySuggestions, setAvailabilitySuggestions] = useState<string[]>([]);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  
  const { clients, refreshClients, loading: loadingClients, loadClientPets } = useClients();
  const { products, services } = useProducts();
  const { vehicles } = useVehicles();
  const { appointments, createAppointment } = useAppointments();

  // Cargar clientes cuando se abre el diálogo
  useEffect(() => {
    if (open && (!clients || clients.length === 0)) {
      refreshClients();
    }
  }, [open, clients, refreshClients]);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      items: [],
      isRecurring: false,
      recurrenceType: 'weekly',
      recurrenceDays: [],
      recurrenceOccurrences: 4,
      recurrenceFixedTime: true,
      reminderEnabled: true,
      reminderHours: 24,
    }
  });

  const { watch, setValue, getValues, handleSubmit, formState: { errors } } = form;
  const watchedClient = watch('client');
  const watchedPet = watch('pet');
  const watchedItems = watch('items');
  const watchedIsRecurring = watch('isRecurring');
  const watchedRecurrenceDays = watch('recurrenceDays');
  const watchedDate = watch('date');
  const watchedTime = watch('time');
  const watchedVehicle = watch('vehicle');

  // Reset logic
  useEffect(() => {
    if (open) {
      setStep(1);
      form.reset({
        client: undefined as any,
        pet: undefined as any,
        vehicle: undefined as any,
        items: [],
        date: '',
        time: '',
        notes: '',
        isRecurring: false,
        recurrenceType: 'weekly',
        recurrenceDays: [],
        recurrenceOccurrences: 4,
        recurrenceFixedTime: true,
        reminderEnabled: true,
        reminderHours: 24,
      });
      setAvailabilityError(null);
      setAvailabilitySuggestions([]);
    }
  }, [open, form]);

  // Abrir directamente en paso 3 (crear cita) con mascota pre-seleccionada (desde módulo Mascotas)
  useEffect(() => {
    if (!open || !initialPetForNewAppointment?.petId || !initialPetForNewAppointment?.clientId || !clients?.length || !loadClientPets) return;
    const clientId = String(initialPetForNewAppointment.clientId);
    const petId = String(initialPetForNewAppointment.petId);
    const client = clients.find((c: any) => String(c.id) === clientId);
    if (!client) return;
    (async () => {
      let clientPets = client.pets || [];
      if (clientPets.length === 0) clientPets = await loadClientPets(clientId);
      const pet = clientPets.find((p: any) => String(p.id) === petId);
      if (!pet) return;
      setValue('client', {
        id: client.id,
        fullName: client.fullName,
        documentNumber: client.documentNumber,
        phone1: client.phone1,
        address: client.address,
        district: client.district,
      });
      setValue('pet', { id: pet.id, name: pet.name, breed: pet.breed || '', size: pet.size });
      setStep(3);
    })();
  }, [open, initialPetForNewAppointment?.petId, initialPetForNewAppointment?.clientId, clients, loadClientPets, setValue]);

  useEffect(() => {
    if (!open || !initialClientForNewAppointment || !clients?.length) return;
    const clientId = String(initialClientForNewAppointment.clientId || '');
    const clientDoc = String(initialClientForNewAppointment.clientDocument || '');
    const client = clients.find((c: any) =>
      (clientId && String(c.id) === clientId) ||
      (clientDoc && String(c.documentNumber || '') === clientDoc)
    );
    if (!client) return;

    (async () => {
      setValue('client', {
        id: client.id,
        fullName: client.fullName,
        documentNumber: client.documentNumber,
        phone1: client.phone1,
        address: client.address,
        district: client.district,
      });

      let clientPets = client.pets || [];
      if (clientPets.length === 0 && loadClientPets) {
        clientPets = await loadClientPets(String(client.id));
      }

      if (clientPets.length > 0) {
        setValue('pet', {
          id: clientPets[0].id,
          name: clientPets[0].name,
          breed: clientPets[0].breed || '',
          size: clientPets[0].size,
        });
      }
      setStep(1);
    })();
  }, [open, initialClientForNewAppointment?.clientId, initialClientForNewAppointment?.clientDocument, clients, setValue, loadClientPets]);

  const { filteredVehicles, loadingCoverage, hasCoverageFilter } = useAvailableVehiclesForAppointment(
    watchedClient?.district,
    watchedDate,
    watchedTime,
    vehicles || []
  );

  // Limpiar vehículo si ya no cubre distrito/fecha/hora
  useEffect(() => {
    if (!watchedVehicle?.id || !hasCoverageFilter) return;
    const stillValid = filteredVehicles.some((v) => String(v.id) === String(watchedVehicle.id));
    if (!stillValid) {
      setValue('vehicle', undefined as any);
      toast.message('El vehículo seleccionado no cubre este distrito u horario. Elige otro.');
    }
  }, [filteredVehicles, hasCoverageFilter, watchedVehicle?.id, setValue]);

  // Validación de disponibilidad en tiempo real (solo en paso 3)
  useEffect(() => {
    if (step === 3 && watchedDate && watchedTime && watchedVehicle?.id && !watchedIsRecurring && open) {
      const validateAvailability = async () => {
        try {
          const serviceIds = watchedItems
            .filter((i: any) => i.type === 'service')
            .map((i: any) => String(i.id));
          
          if (serviceIds.length === 0) {
            setAvailabilityError(null);
            setAvailabilitySuggestions([]);
            return;
          }

          const serviceDurations = new Map(services.map(s => [String(s.id), s.duration || 60]));
          const validator = createAvailabilityValidator(appointments, undefined, serviceDurations);
          const validation = await validator.validate(watchedDate, watchedTime, watchedVehicle.id, serviceIds);
          
          if (!validation.available) {
            setAvailabilityError(validation.message || 'Horario no disponible');
            setAvailabilitySuggestions(validation.suggestions || []);
          } else {
            setAvailabilityError(null);
            setAvailabilitySuggestions([]);
          }
        } catch (error) {
          // Silenciar errores de validación en tiempo real
        }
      };

      const timeoutId = setTimeout(validateAvailability, 500); // Debounce
      return () => clearTimeout(timeoutId);
    } else {
      setAvailabilityError(null);
      setAvailabilitySuggestions([]);
    }
  }, [step, watchedDate, watchedTime, watchedVehicle, watchedItems, watchedIsRecurring, appointments, services, open]);

  // Client Search
  const filteredClients = (clients || []).filter(c => 
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.documentNumber?.includes(searchTerm)
  );

  const handleSelectClient = async (client: any) => {
    setValue('client', {
      id: client.id,
      fullName: client.fullName,
      documentNumber: client.documentNumber,
      phone1: client.phone1,
      address: client.address,
      district: client.district
    });
    setClientSearchOpen(false);
    
    // Cargar mascotas del cliente si no están cargadas
    let clientPets = client.pets || [];
    if (clientPets.length === 0 && loadClientPets) {
      clientPets = await loadClientPets(client.id);
    }
    
    // Auto-select first pet if available
    if (clientPets && clientPets.length > 0) {
      handleSelectPet(clientPets[0]);
    } else {
      setValue('pet', undefined as any);
    }

    // Auto-select vehicle if assigned (se validará cobertura al elegir fecha/hora)
    if (client.assignedVehicle) {
      const vehicle = vehicles.find(v => v.id === `vehiculo-${client.assignedVehicle}` || v.id === client.assignedVehicle);
      if (vehicle) {
        setValue('vehicle', {
          id: vehicle.id,
          name: vehicle.name,
          driver: vehicle.driver,
          driverName: vehicle.driver_name || vehicle.driver
        });
      }
    }
  };

  const handleSelectPet = (pet: any) => {
    setValue('pet', {
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      size: pet.size
    });
  };

  // Item Logic
  const calculateServicePrice = (service: any, petSize: string, petBreed: string) => {
    if (!service.pricing || !service.pricing[petSize]) {
      return { price: 0, duration: 0, cost: 0, note: 'Tamaño no configurado' };
    }

    let finalPrice = service.pricing[petSize].price;
    let finalDuration = service.pricing[petSize].duration;
    let finalCost = service.pricing[petSize].cost;
    let note = '';

    if (petBreed && service.breedExceptions?.length > 0) {
      const exception = service.breedExceptions.find((e: any) => 
        petBreed.toLowerCase().includes(e.breed.toLowerCase())
      );

      if (exception) {
        if (exception.type === 'multiplier') {
          finalPrice = Math.round(finalPrice * exception.value);
          note = `+${((exception.value - 1) * 100).toFixed(0)}% (${exception.note})`;
        } else if (exception.type === 'fixed') {
          finalPrice = exception.value;
          note = `Precio fijo (${exception.note})`;
        } else if (exception.type === 'extraTime') {
          finalDuration += exception.value;
          note = `+${exception.value} min (${exception.note})`;
        }
      }
    }
    return { price: finalPrice, duration: finalDuration, cost: finalCost, note };
  };

  const handleAddItem = (item: any, type: 'service' | 'product') => {
    const currentItems = getValues('items');
    
    if (currentItems.find(i => i.id === item.id && i.type === type)) {
      toast.error('Ya está agregado');
      return;
    }

    let newItem: any = {
      id: item.id,
      type,
      name: item.name,
      price: item.price || 0,
      duration: item.duration || 0,
    };

    if (type === 'service' && item.pricingBySize && watchedPet) {
      const calculated = calculateServicePrice(item, watchedPet.size || 'medium', watchedPet.breed);
      newItem.price = calculated.price;
      newItem.duration = calculated.duration;
      newItem.cost = calculated.cost;
      newItem.priceNote = calculated.note;
    }

    setValue('items', [...currentItems, newItem]);
    toast.success(`${type === 'service' ? 'Servicio' : 'Producto'} agregado`);
  };

  const handleRemoveItem = (index: number) => {
    const currentItems = getValues('items');
    setValue('items', currentItems.filter((_, i) => i !== index));
  };

  // Validation logic for creating appointment
  const onSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Availability Check
      if (!data.isRecurring) {
        const serviceIds = data.items.filter(i => i.type === 'service').map(i => String(i.id));
        const serviceDurations = new Map(services.map(s => [String(s.id), s.duration || 60]));
        
        const validator = createAvailabilityValidator(appointments, undefined, serviceDurations);
        const validation = await validator.validate(data.date, data.time, data.vehicle.id, serviceIds);
        
        if (!validation.available) {
          toast.error(validation.message, {
             description: validation.suggestions?.length ? `Sugerencias: ${validation.suggestions[0]}` : undefined
          });
          setIsSubmitting(false);
          return;
        }
      }

      const primaryService = data.items.find((i) => i.type === 'service') ?? data.items[0];
      const totalDuration = data.items
        .filter((i) => i.type === 'service')
        .reduce((sum, i) => sum + (i.duration || 0), 0);

      // 2. Prepare Data
      const baseAppointment = {
        date: data.date,
        time: data.time,
        clientId: data.client.id,
        client: data.client.fullName,
        clientDocument: data.client.documentNumber,
        phone: data.client.phone1,
        petId: data.pet.id,
        pet: data.pet.name,
        breed: data.pet.breed,
        items: data.items,
        serviceType: primaryService?.name || 'Servicio',
        totalPrice: data.items.reduce((sum, i) => sum + i.price, 0),
        totalDuration,
        duration: totalDuration || 60,
        status: 'pending' as const,
        groomer: data.vehicle.driverName || data.vehicle.driver || 'No asignado',
        vehicle: data.vehicle,
        address: data.client.address,
        district: data.client.district,
        notes: data.notes,
        invoiced: false,
        recurring: data.isRecurring,
        reminderSent: false,
      };

      // Agregar datos de recurrencia si es necesario
      if (data.isRecurring) {
        baseAppointment.recurring = true;
        baseAppointment.recurrenceType = data.recurrenceType;
        baseAppointment.recurrenceOccurrences = data.recurrenceOccurrences;
        baseAppointment.recurrenceDays = data.recurrenceDays;
        baseAppointment.recurrenceFixedTime = data.recurrenceFixedTime;
        baseAppointment.recurrenceSeriesId = `series-${Date.now()}`;
      }

      await createAppointment(baseAppointment);

      toast.success("Cita creada exitosamente", {
        description: data.isRecurring 
          ? "Serie de citas creada correctamente"
          : `Cita agendada para ${data.date} a las ${data.time}`
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();

    } catch (e: any) {
      toast.error("Error al crear la cita", {
        description: e.message || "No se pudo crear la cita. Verifica que todos los campos estén completos y que el vehículo esté disponible."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step Navigation
  const nextStep = async () => {
    let isValid = false;
    
    if (step === 1) {
      // Validar solo cliente en el paso 1, pet y vehicle se validan manualmente
      isValid = await form.trigger(['client']);
      if (isValid && !watchedPet) {
        toast.error('Por favor seleccione una mascota');
        isValid = false;
      }
    } else if (step === 2) {
      isValid = await form.trigger(['items']);
    } else if (step === 3) {
      isValid = await form.trigger(['date', 'time']);
      if (isValid && !watchedVehicle) {
        toast.error('Por favor seleccione un vehículo con cobertura para este distrito y horario');
        isValid = false;
      }
      if (isValid && hasCoverageFilter && filteredVehicles.length === 0) {
        toast.error('No hay vehículos disponibles para este distrito, fecha y hora');
        isValid = false;
      }
    }
    
    if (isValid) setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <DialogHeader className="bg-white dark:bg-gray-800 border-b p-6">
          <DialogTitle>Nueva Cita - Paso {step} de 4</DialogTitle>
          <DialogDescription>Complete los datos requeridos</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <Card className="p-6">
                <Label>Buscar Cliente (DNI o Nombre)</Label>
                <div className="relative mt-2">
                  <div className="flex gap-2">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Ingrese DNI o nombre..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setClientSearchOpen(true);
                      }}
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setShowNewClientDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Nuevo
                    </Button>
                  </div>
                  {clientSearchOpen && searchTerm.length > 2 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                      {loadingClients ? (
                        <div className="p-3 text-gray-500 text-center">
                          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                          Cargando clientes...
                        </div>
                      ) : filteredClients.length > 0 ? (
                        filteredClients.map(client => (
                          <div 
                            key={client.id}
                            className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                            onClick={() => handleSelectClient(client)}
                          >
                            <p className="font-bold">{client.fullName}</p>
                            <p className="text-sm text-gray-500">{client.documentNumber} - {client.phone1}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500">
                          {clients && clients.length === 0 
                            ? "No hay clientes registrados. Haz clic en 'Nuevo' para crear uno."
                            : "No se encontraron clientes con ese criterio de búsqueda."}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {watchedClient && (
                   <div className="mt-4 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold text-blue-900">{watchedClient.fullName}</p>
                        <p className="text-sm text-blue-700">{watchedClient.documentNumber}</p>
                        <p className="text-xs text-blue-600">{watchedClient.address}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setValue('client', null as any)}>
                        Cambiar
                      </Button>
                   </div>
                )}
                {errors.client && <p className="text-red-500 text-sm mt-1">{errors.client.message}</p>}
              </Card>

              {watchedClient && (
                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-6">
                     <Label>Mascota</Label>
                     <Select 
                       onValueChange={(val) => {
                         const pet = clients.find(c => c.id === watchedClient.id)?.pets?.find((p: any) => p.id === val);
                         if(pet) handleSelectPet(pet);
                       }}
                       value={watchedPet?.id || ''}
                     >
                       <SelectTrigger>
                         <SelectValue placeholder="Seleccione mascota" />
                       </SelectTrigger>
                       <SelectContent>
                         {clients.find(c => c.id === watchedClient.id)?.pets?.map((pet: any) => (
                           <SelectItem key={pet.id} value={pet.id}>{pet.name} ({pet.breed})</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     {errors.pet && <p className="text-red-500 text-sm mt-1">{errors.pet.message}</p>}
                     {!watchedPet && <p className="text-red-500 text-sm mt-1">Mascota requerida</p>}
                  </Card>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
             <div className="space-y-6">
               <div className="flex gap-4 h-[400px]">
                 <div className="w-1/2 border rounded-lg p-4 flex flex-col">
                   <Input 
                      placeholder="Buscar servicios o productos..." 
                      className="mb-4"
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                   />
                   <Tabs defaultValue="services" className="flex-1">
                     <TabsList className="w-full">
                       <TabsTrigger value="services" className="flex-1">Servicios</TabsTrigger>
                       <TabsTrigger value="products" className="flex-1">Productos</TabsTrigger>
                     </TabsList>
                     <TabsContent value="services" className="h-[300px] overflow-y-auto">
                        {services
                          .filter(s => s.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
                          .map(service => (
                          <div key={service.id} className="flex justify-between items-center p-2 border-b hover:bg-gray-50">
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-xs text-gray-500">Base: {service.price} S/</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleAddItem(service, 'service')}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                     </TabsContent>
                     <TabsContent value="products" className="h-[300px] overflow-y-auto">
                        {products
                          .filter(p => p.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
                          .map(product => (
                          <div key={product.id} className="flex justify-between items-center p-2 border-b hover:bg-gray-50">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleAddItem(product, 'product')}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                     </TabsContent>
                   </Tabs>
                 </div>
                 
                 <div className="w-1/2 border rounded-lg p-4 bg-gray-50">
                   <h3 className="font-bold mb-4">Items Seleccionados</h3>
                   {watchedItems.length === 0 && <p className="text-gray-500 text-center mt-10">Ningún item seleccionado</p>}
                   <div className="space-y-2 max-h-[300px] overflow-y-auto">
                     {watchedItems.map((item, idx) => (
                       <div key={idx} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                         <div>
                           <p className="font-medium">{item.name}</p>
                           <p className="text-sm text-gray-600">
                             {item.price} S/ {item.priceNote && <span className="text-xs text-blue-600">({item.priceNote})</span>}
                           </p>
                         </div>
                         <Button size="icon" variant="ghost" className="text-red-500 h-8 w-8" onClick={() => handleRemoveItem(idx)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     ))}
                   </div>
                   <div className="mt-4 pt-4 border-t flex justify-between font-bold text-lg">
                     <span>Total Estimado:</span>
                     <span>{watchedItems.reduce((sum, i) => sum + i.price, 0).toFixed(2)} S/</span>
                   </div>
                   {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items.message}</p>}
                 </div>
               </div>
             </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-4">Fecha y Hora</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Fecha</Label>
                    <Input type="date" {...form.register('date')} min={new Date().toISOString().split('T')[0]} />
                    {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
                  </div>
                  <div>
                    <Label>Hora</Label>
                    <Input type="time" {...form.register('time')} />
                    {errors.time && <p className="text-red-500 text-sm">{errors.time.message}</p>}
                  </div>

                  <div>
                    <Label>Vehículo (cobertura por distrito)</Label>
                    {watchedClient?.district && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Distrito: {watchedClient.district}
                        {loadingCoverage && ' · actualizando disponibles...'}
                      </p>
                    )}
                    <Select
                      onValueChange={(val) => {
                        const list = hasCoverageFilter ? filteredVehicles : vehicles;
                        const v = list.find((veh) => String(veh.id) === val);
                        if (v) {
                          setValue('vehicle', {
                            id: v.id,
                            name: v.name,
                            driver: v.driver,
                            driverName: (v as any).driver_name || v.driver,
                          });
                        }
                      }}
                      value={watch('vehicle')?.id ? String(watch('vehicle')?.id) : ''}
                      disabled={!watchedDate || !watchedTime || loadingCoverage}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !watchedDate || !watchedTime
                            ? 'Indica fecha y hora primero'
                            : loadingCoverage
                              ? 'Cargando vehículos...'
                              : 'Seleccione vehículo'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {(hasCoverageFilter ? filteredVehicles : vehicles).map((v) => (
                          <SelectItem key={String(v.id)} value={String(v.id)}>
                            {v.name} ({(v as any).driver_name || v.driver || 'Sin conductor'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasCoverageFilter && filteredVehicles.length === 0 && watchedDate && watchedTime && !loadingCoverage && (
                      <p className="text-amber-600 text-sm mt-1">
                        Ningún vehículo cubre {watchedClient?.district || 'este distrito'} en ese horario.
                      </p>
                    )}
                    {!watch('vehicle') && watchedDate && watchedTime && (
                      <p className="text-red-500 text-sm mt-1">Vehículo requerido</p>
                    )}
                  </div>
                  
                  {/* Indicador de disponibilidad en tiempo real */}
                  {watchedDate && watchedTime && watchedVehicle?.id && !watchedIsRecurring && (
                    <div className="space-y-2">
                      {availabilityError ? (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-destructive">{availabilityError}</p>
                              {availabilitySuggestions.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                  {availabilitySuggestions.slice(0, 2).map((suggestion, idx) => (
                                    <li key={idx} className="text-xs text-muted-foreground">• {suggestion}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : watchedItems.length > 0 && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Horario disponible
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <Label>Notas</Label>
                    <Textarea {...form.register('notes')} placeholder="Instrucciones especiales..." />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="recurring" 
                    checked={watchedIsRecurring}
                    onCheckedChange={(c) => setValue('isRecurring', !!c)}
                  />
                  <Label htmlFor="recurring" className="font-bold">Cita Recurrente</Label>
                </div>
                
                {watchedIsRecurring && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <Label>Frecuencia</Label>
                      <Select 
                        value={watch('recurrenceType')} 
                        onValueChange={(v: any) => setValue('recurrenceType', v)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="biweekly">Quincenal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                       <Label className="mb-2 block">Días</Label>
                       <div className="flex gap-2">
                         {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => {
                           const dayCode = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][i];
                           const isSelected = watchedRecurrenceDays.includes(dayCode);
                           return (
                             <div 
                               key={d}
                               onClick={() => {
                                 const newDays = isSelected 
                                   ? watchedRecurrenceDays.filter(day => day !== dayCode)
                                   : [...watchedRecurrenceDays, dayCode];
                                 setValue('recurrenceDays', newDays);
                               }}
                               className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                             >
                               {d}
                             </div>
                           );
                         })}
                       </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {step === 4 && (
             <div className="flex flex-col items-center justify-center space-y-6 text-center">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                 <CheckCircle2 className="h-8 w-8 text-green-600" />
               </div>
               <h2 className="text-2xl font-bold">Todo Listo</h2>
               <p className="text-gray-500 max-w-md">
                 Revise los detalles antes de confirmar. Se enviará una notificación automática al cliente si está habilitado.
               </p>
               
               <Card className="w-full max-w-md p-6 text-left space-y-3 bg-gray-50">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cliente:</span>
                    <span className="font-bold">{watchedClient?.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mascota:</span>
                    <span className="font-bold">{watchedPet?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha:</span>
                    <span className="font-bold">{watch('date')} {watch('time')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-blue-600">{watchedItems.reduce((s, i) => s + i.price, 0)} S/</span>
                  </div>
               </Card>
             </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 border-t p-6 flex justify-between">
          {step > 1 ? (
             <Button variant="outline" onClick={prevStep}>
               <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
             </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
             <Button onClick={nextStep}>
               Siguiente <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
          ) : (
             <Button 
               onClick={handleSubmit(onSubmit)} 
               className="bg-green-600 hover:bg-green-700 text-white"
               disabled={isSubmitting}
             >
               {isSubmitting ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Creando cita...
                 </>
               ) : (
                 <>
                   <CheckCircle2 className="mr-2 h-4 w-4" />
                   Confirmar Cita
                 </>
               )}
             </Button>
          )}
        </div>
      </DialogContent>

      {/* Diálogo para crear nuevo cliente */}
      <NewClientDialog
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        onClientCreated={async (client) => {
          // Refrescar lista de clientes
          await refreshClients();
          
          // Auto-seleccionar el cliente recién creado
          handleSelectClient({
            id: client.id,
            fullName: client.fullName,
            documentNumber: client.documentNumber,
            phone1: client.phone1,
            address: client.address,
            district: client.district
          });
          
          // Cerrar diálogo de nuevo cliente
          setShowNewClientDialog(false);
          
          toast.success('Cliente creado y seleccionado', {
            description: `Ahora puedes continuar con la cita para ${client.fullName}`
          });
        }}
      />
    </Dialog>
  );
}
