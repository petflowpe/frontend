import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Calendar, Clock, MapPin, User, Phone, Mail, Dog, Car, Scissors, Plus, X, Search, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { validateAppointmentConflicts, suggestNextAvailableSlot } from '../../utils/conflictValidator';
import { useClients } from '../../hooks/useClients';
import { useProducts } from '../../hooks/useProducts';
import { apiClient } from '../../utils/api/client';
import { API } from '../../utils/api/endpoints';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Vehicle {
  id: string;
  name: string;
  driver: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  size: string;
}

interface NewAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Puede ser síncrono o devolver Promise; si falla, el diálogo no se cierra */
  onSave: (appointment: any) => void | Promise<void>;
  prefilledDate?: Date;
  prefilledTime?: string;
  prefilledResourceId?: string;
  vehicles: Vehicle[];
  editingAppointment?: any; // Si está presente, estamos en modo edición
  existingAppointments?: any[]; // Para validar conflictos
}

export function NewAppointmentDialog({
  isOpen,
  onClose,
  onSave,
  prefilledDate,
  prefilledTime,
  prefilledResourceId,
  vehicles,
  editingAppointment,
  existingAppointments
}: NewAppointmentDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(prefilledResourceId || '');
  const [appointmentDate, setAppointmentDate] = useState<string>(
    prefilledDate ? format(prefilledDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [appointmentTime, setAppointmentTime] = useState<string>(
    prefilledTime || '09:00'
  );
  const [notes, setNotes] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [searchPet, setSearchPet] = useState('');
  const [petsForClient, setPetsForClient] = useState<Pet[]>([]);

  const { clients } = useClients();
  const { services: servicesFromApi } = useProducts();

  const clientsForUI: Client[] = useMemo(() => clients.map((c: any) => ({
    id: c.id,
    name: c.fullName || c.name || '',
    phone: c.phone || '',
    email: c.email || '',
    address: c.address || '',
    district: c.district || '',
  })), [clients]);

  const availableServices: Service[] = useMemo(() => servicesFromApi.map((s: any) => ({
    id: String(s.id),
    name: s.name,
    duration: (s as any).duration ?? 45,
    price: s.price ?? 0,
  })), [servicesFromApi]);

  useEffect(() => {
    if (!selectedClient?.id) {
      setPetsForClient([]);
      setSelectedPet(null);
      return;
    }
    let cancelled = false;
    apiClient.get<{ data?: any[] } | any[]>(API.clients.pets(selectedClient.id))
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = list.map((p: any) => ({
          id: String(p.id),
          name: p.name || '',
          species: p.species || 'Perro',
          breed: p.breed || '',
          size: (p.size || p.weight ? `${p.weight || ''} kg` : 'Mediano') as string,
        }));
        setPetsForClient(mapped);
        if (editingAppointment && String(selectedClient.id) === String(editingAppointment.clientId)) {
          const pet = mapped.find((p: { id: string }) => String(p.id) === String(editingAppointment.petId));
          setSelectedPet(pet || null);
        } else {
          setSelectedPet(null);
        }
      })
      .catch(() => setPetsForClient([]));
    return () => { cancelled = true; };
  }, [selectedClient?.id, editingAppointment?.clientId, editingAppointment?.petId]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setSelectedClient(null);
        setSelectedPet(null);
        setSelectedServices([]);
        setPetsForClient([]);
        setSelectedVehicle(prefilledResourceId || '');
        setAppointmentDate(prefilledDate ? format(prefilledDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
        setAppointmentTime(prefilledTime || '09:00');
        setNotes('');
        setSearchClient('');
        setSearchPet('');
      }, 200);
    }
  }, [isOpen, prefilledDate, prefilledTime, prefilledResourceId]);

  // Prefill form when opening in edit mode
  useEffect(() => {
    if (!isOpen || !editingAppointment) return;
    const apt = editingAppointment;
    const clientId = apt.clientId ?? apt.client_id;
    if (!clientId) return;
    const client = clientsForUI.find((c: Client) => String(c.id) === String(clientId));
    if (client) setSelectedClient(client);
    const dateStr = apt.date || '';
    if (dateStr) {
      if (dateStr.includes('T')) {
        const d = new Date(dateStr);
        setAppointmentDate(format(d, 'yyyy-MM-dd'));
      } else {
        setAppointmentDate(dateStr.slice(0, 10));
      }
    }
    let timeStr = (apt.time || '').trim();
    if (timeStr.includes('T')) timeStr = format(new Date(timeStr), 'HH:mm');
    else if (timeStr.length > 5) timeStr = timeStr.slice(0, 5);
    if (timeStr) setAppointmentTime(timeStr);
    if (apt.notes != null) setNotes(apt.notes);
    const vehicleId = apt.vehicle?.id ?? apt.vehicle;
    if (vehicleId) setSelectedVehicle(String(vehicleId));
    const serviceNames = (apt.serviceType || apt.services || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (serviceNames.length > 0 && availableServices.length > 0) {
      const services = availableServices.filter((s: Service) =>
        serviceNames.some((name: string) => name === s.name)
      );
      if (services.length > 0) setSelectedServices(services);
    }
  }, [isOpen, editingAppointment?.id, clientsForUI, availableServices]);

  const filteredClients = clientsForUI.filter(c =>
    c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
    (c.phone || '').includes(searchClient) ||
    c.email.toLowerCase().includes(searchClient.toLowerCase())
  );

  const filteredPets = petsForClient.filter(p =>
    p.name.toLowerCase().includes(searchPet.toLowerCase()) ||
    (p.breed || '').toLowerCase().includes(searchPet.toLowerCase())
  );

  const toggleService = (service: Service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  };

  const calculateDuration = () => {
    return selectedServices.reduce((sum, s) => sum + s.duration, 0);
  };

  const handleSave = async () => {
    // Validations
    if (!selectedClient) {
      toast.error('Selecciona un cliente');
      setStep(1);
      return;
    }
    if (!selectedPet) {
      toast.error('Selecciona una mascota');
      setStep(1);
      return;
    }
    if (selectedServices.length === 0) {
      toast.error('Selecciona al menos un servicio');
      setStep(2);
      return;
    }
    if (!selectedVehicle) {
      toast.error('Selecciona un vehículo');
      setStep(3);
      return;
    }

    // Validar conflictos de horario
    if (existingAppointments && existingAppointments.length > 0) {
      const conflictCheck = validateAppointmentConflicts(
        {
          date: appointmentDate,
          time: appointmentTime,
          duration: calculateDuration(),
          resourceId: selectedVehicle,
          appointmentId: editingAppointment?.id,
        },
        existingAppointments
      );

      if (conflictCheck.hasConflict) {
        // Sugerir próximo horario disponible
        const suggestion = suggestNextAvailableSlot(
          {
            date: appointmentDate,
            time: appointmentTime,
            duration: calculateDuration(),
            resourceId: selectedVehicle,
          },
          existingAppointments
        );

        const suggestionText = suggestion
          ? ` Horario sugerido: ${suggestion.time}`
          : '';

        toast.error(
          `⚠️ ${conflictCheck.message}${suggestionText}`,
          { duration: 5000 }
        );
        return;
      }
    }

    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    const totalDurationMin = calculateDuration();
    const totalPrice = calculateTotal();

    const appointmentData = {
      id: editingAppointment?.id || `APT-${Date.now()}`,
      clientId: String(selectedClient.id),
      clientName: selectedClient.name,
      client: selectedClient.name,
      petId: String(selectedPet.id),
      petName: selectedPet.name,
      pet: selectedPet.name,
      date: appointmentDate,
      time: appointmentTime,
      services: selectedServices.map(s => s.name).join(', '),
      serviceType: selectedServices.map(s => s.name).join(', '),
      totalPrice,
      totalDuration: totalDurationMin,
      duration: totalDurationMin,
      totalAmount: totalPrice,
      status: editingAppointment?.status || 'confirmed',
      district: selectedClient.district,
      address: selectedClient.address,
      phone: selectedClient.phone,
      email: selectedClient.email,
      vehicle: vehicle ? { id: vehicle.id } : undefined,
      groomer: vehicle?.driver || 'Sin asignar',
      notes: notes,
      createdAt: editingAppointment?.createdAt || new Date().toISOString(),
      items: selectedServices.map(s => ({
        id: s.id,
        type: 'service' as const,
        name: s.name,
        price: s.price,
        quantity: 1,
        duration: s.duration ?? 45,
      })),
    };

    // Esperar al guardado; solo cerrar si tiene éxito (el hook ya muestra éxito/error)
    try {
      const result = onSave(appointmentData);
      if (result && typeof (result as any).then === 'function') {
        await (result as Promise<void>);
      }
      onClose();
    } catch {
      // El hook ya muestra el error; no cerrar el diálogo para que el usuario pueda corregir
    }
  };

  const canGoNext = () => {
    if (step === 1) return selectedClient && selectedPet;
    if (step === 2) return selectedServices.length > 0;
    if (step === 3) return selectedVehicle && appointmentDate && appointmentTime;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            {editingAppointment ? 'Editar Cita' : 'Nueva Cita'}
          </DialogTitle>
          <DialogDescription>
            {editingAppointment
              ? (step === 1 ? 'Modifica cliente y mascota' : step === 2 ? 'Modifica los servicios' : 'Modifica fecha, hora y vehículo')
              : `Crea una nueva cita en ${step === 1 ? '3 pasos simples' : `paso ${step} de 3`}`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-muted'}`}>
              1
            </div>
            <span className="text-sm font-medium">Cliente y Mascota</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-muted">
            <div className={`h-full ${step >= 2 ? 'bg-blue-600' : 'bg-transparent'} transition-all`} />
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-muted'}`}>
              2
            </div>
            <span className="text-sm font-medium">Servicios</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-muted">
            <div className={`h-full ${step >= 3 ? 'bg-blue-600' : 'bg-transparent'} transition-all`} />
          </div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-muted'}`}>
              3
            </div>
            <span className="text-sm font-medium">Fecha y Vehículo</span>
          </div>
        </div>

        {/* Step 1: Client & Pet */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Seleccionar Cliente
              </Label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                {filteredClients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      String(selectedClient?.id) === String(client.id)
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                        : 'hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <p className="font-semibold">{client.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {client.district}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Dog className="h-5 w-5" />
                Seleccionar Mascota
              </Label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar mascota..."
                  value={searchPet}
                  onChange={(e) => setSearchPet(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
                {filteredPets.map(pet => (
                  <div
                    key={pet.id}
                    onClick={() => setSelectedPet(pet)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      String(selectedPet?.id) === String(pet.id)
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                        : 'hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <p className="font-semibold text-sm">{pet.name}</p>
                    <p className="text-xs text-muted-foreground">{pet.breed}</p>
                    <Badge variant="outline" className="text-xs mt-1">{pet.size}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Services */}
        {step === 2 && (
          <div className="space-y-4">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              Seleccionar Servicios
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {availableServices.map(service => {
                const isSelected = selectedServices.find(s => s.id === service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                        : 'hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.duration} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">S/ {service.price}</p>
                        {isSelected && (
                          <Badge className="mt-1 bg-blue-600">Seleccionado</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedServices.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">Resumen de Servicios</h4>
                <div className="space-y-1 text-sm">
                  {selectedServices.map(s => (
                    <div key={s.id} className="flex justify-between">
                      <span>{s.name}</span>
                      <span>S/ {s.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-blue-300 mt-2 pt-2 flex justify-between font-bold">
                  <span>Total: {calculateDuration()} min</span>
                  <span>S/ {calculateTotal()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Date, Time & Vehicle */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha
                </Label>
                <Input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hora
                </Label>
                <Input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Vehículo Asignado
              </Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vehículo..." />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} - {v.driver}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notas Adicionales (Opcional)</Label>
              <Textarea
                placeholder="Instrucciones especiales, preferencias del cliente, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg border">
              <h4 className="font-semibold mb-3">Resumen de la Cita</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{selectedClient?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mascota</p>
                  <p className="font-semibold">{selectedPet?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha y Hora</p>
                  <p className="font-semibold">
                    {(() => {
                      const [y, m, d] = appointmentDate.split('-').map(Number);
                      const localDate = new Date(y, m - 1, d);
                      return format(localDate, 'dd MMM yyyy', { locale: es }) + ' - ' + appointmentTime;
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duración</p>
                  <p className="font-semibold">{calculateDuration()} minutos</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Servicios</p>
                  <p className="font-semibold text-xs">{selectedServices.map(s => s.name).join(', ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Precio Total</p>
                  <p className="font-semibold text-blue-600">S/ {calculateTotal()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                onClose();
              }
            }}
          >
            {step === 1 ? 'Cancelar' : 'Anterior'}
          </Button>

          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext()}
              >
                Siguiente
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={!canGoNext()}>
                Crear Cita
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}