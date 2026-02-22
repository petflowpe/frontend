import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, DollarSign, Check, ChevronRight, Star, Search, Filter, X, Info } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { useApp, Service, User as AppUser } from '../contexts/AppContext';
import { appointmentService } from '../services/appointmentService';

/**
 * Portal de Reservas Online - Cliente puede agendar 24/7
 */

interface TimeSlot {
  time: string;
  available: boolean;
  groomerId?: string;
}

export function OnlineBooking() {
  const { services, users, appointments, businessSettings, addAppointment } = useApp();
  
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedGroomer, setSelectedGroomer] = useState<AppUser | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [petSize, setPetSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  
  // Información del cliente (en producción vendría de auth)
  const [clientInfo, setClientInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zone: 'miraflores',
    petName: '',
    petBreed: '',
  });

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const groomers = users.filter(u => u.role === 'groomer' && u.active);
  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))];

  // Filtrar servicios
  const filteredServices = services
    .filter(s => s.active)
    .filter(s => selectedCategory === 'all' || s.category === selectedCategory)
    .filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Generar slots de tiempo disponibles
  useEffect(() => {
    if (selectedDate && selectedGroomer) {
      generateTimeSlots();
    }
  }, [selectedDate, selectedGroomer]);

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const workingHours = businessSettings.workingHours[dayOfWeek];

    if (!workingHours?.open || !selectedGroomer) {
      setAvailableSlots([]);
      return;
    }

    const [startHour] = workingHours.startTime!.split(':').map(Number);
    const [endHour] = workingHours.endTime!.split(':').map(Number);

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = appointmentService.calculateEstimatedEndTime(time, selectedService?.duration || 60);
        
        const hasConflict = appointmentService.hasTimeConflict(
          {
            date: selectedDate,
            startTime: time,
            endTime,
            groomerId: selectedGroomer.id,
          },
          appointments
        );

        slots.push({
          time,
          available: !hasConflict,
          groomerId: selectedGroomer.id,
        });
      }
    }

    setAvailableSlots(slots);
  };

  const calculatePrice = () => {
    if (!selectedService) return 0;
    
    let price = selectedService.pricing[petSize];
    
    // Verificar excepciones por raza
    if (clientInfo.petBreed && selectedService.breedExceptions) {
      const exception = selectedService.breedExceptions.find(
        e => e.breed.toLowerCase() === clientInfo.petBreed.toLowerCase()
      );
      if (exception) {
        price = exception.price;
      }
    }
    
    return price;
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleGroomerSelect = (groomer: AppUser) => {
    setSelectedGroomer(groomer);
    setStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleBooking = () => {
    if (!selectedService || !selectedGroomer || !selectedDate || !selectedTime) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!clientInfo.firstName || !clientInfo.email || !clientInfo.phone || !clientInfo.petName) {
      toast.error('Por favor completa tu información');
      return;
    }

    const price = calculatePrice();
    const endTime = appointmentService.calculateEstimatedEndTime(
      selectedTime,
      selectedService.duration
    );

    // Crear cita (simplificado - en producción se crearía el cliente primero)
    const newAppointment = {
      clientId: 'CLI-ONLINE-' + Date.now(), // Temporal
      petId: 'PET-ONLINE-' + Date.now(), // Temporal
      serviceIds: [selectedService.id],
      date: selectedDate,
      startTime: selectedTime,
      endTime,
      estimatedDuration: selectedService.duration,
      status: 'scheduled' as const,
      confirmationStatus: 'pending' as const,
      groomerId: selectedGroomer.id,
      vehicleId: 'VEH-001', // Se asignaría automáticamente
      location: {
        address: clientInfo.address,
        zone: clientInfo.zone,
      },
      isRecurring: false,
      remindersSent: [],
      subtotal: price,
      total: price,
      paymentStatus: 'pending' as const,
    };

    addAppointment(newAppointment);
    
    toast.success('¡Reserva confirmada! Te enviaremos un correo de confirmación', {
      duration: 5000,
    });
    
    // Mostrar resumen
    setStep(5);
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedGroomer(null);
    setSelectedDate('');
    setSelectedTime('');
    setClientInfo({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zone: 'miraflores',
      petName: '',
      petBreed: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Reserva tu Cita Online
          </h1>
          <p className="text-muted-foreground text-lg">
            Agenda 24/7 con tu groomer favorito
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { num: 1, label: 'Servicio' },
              { num: 2, label: 'Groomer' },
              { num: 3, label: 'Fecha y Hora' },
              { num: 4, label: 'Tus Datos' },
              { num: 5, label: 'Confirmación' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.num
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {step > s.num ? <Check className="h-6 w-6" /> : s.num}
                  </div>
                  <span className="text-xs mt-2 text-center">{s.label}</span>
                </div>
                {idx < 4 && (
                  <ChevronRight
                    className={`h-6 w-6 mx-2 ${
                      step > s.num ? 'text-blue-500' : 'text-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Seleccionar Servicio */}
        {step === 1 && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Selecciona un Servicio</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar servicios..."
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Categorías */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </Badge>
                ))}
              </div>

              {/* Lista de servicios */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-500"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{service.name}</h3>
                      <Badge variant="secondary">{service.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration} min</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Desde</p>
                        <p className="font-bold text-lg text-blue-600">
                          S/ {service.pricing.small.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No se encontraron servicios</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Step 2: Seleccionar Groomer */}
        {step === 2 && selectedService && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Selecciona tu Groomer</h2>
                  <p className="text-sm text-muted-foreground">
                    Servicio: {selectedService.name}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Cambiar Servicio
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groomers.map((groomer) => (
                  <Card
                    key={groomer.id}
                    className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-500"
                    onClick={() => handleGroomerSelect(groomer)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mb-4">
                        {groomer.firstName[0]}{groomer.lastName[0]}
                      </div>
                      <h3 className="font-bold text-lg mb-1">
                        {groomer.firstName} {groomer.lastName}
                      </h3>
                      {groomer.stats && (
                        <div className="space-y-2 w-full mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Rating:</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="font-medium">{groomer.stats.averageRating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Citas:</span>
                            <span className="font-medium">{groomer.stats.totalAppointments}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Eficiencia:</span>
                            <span className="font-medium">{groomer.stats.efficiency}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {groomers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No hay groomers disponibles en este momento
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Step 3: Seleccionar Fecha y Hora */}
        {step === 3 && selectedGroomer && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Fecha y Hora</h2>
                  <p className="text-sm text-muted-foreground">
                    Con {selectedGroomer.firstName} {selectedGroomer.lastName}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setStep(2)}>
                  Cambiar Groomer
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Selector de fecha */}
                <div>
                  <Label>Selecciona una Fecha</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-2"
                  />
                </div>

                {/* Horarios disponibles */}
                {selectedDate && (
                  <div>
                    <Label>Horarios Disponibles</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2 max-h-96 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={slot.available ? 'outline' : 'ghost'}
                          disabled={!slot.available}
                          onClick={() => slot.available && handleTimeSelect(slot.time)}
                          className={`${
                            slot.available
                              ? 'hover:bg-blue-500 hover:text-white'
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                    {availableSlots.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Selecciona una fecha para ver horarios disponibles
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Información del Cliente */}
        {step === 4 && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Tus Datos</h2>
                <Button variant="outline" onClick={() => setStep(3)}>
                  Cambiar Horario
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Datos del cliente */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Información Personal</h3>
                  
                  <div>
                    <Label>Nombre *</Label>
                    <Input
                      value={clientInfo.firstName}
                      onChange={(e) => setClientInfo({ ...clientInfo, firstName: e.target.value })}
                      placeholder="Tu nombre"
                    />
                  </div>
                  
                  <div>
                    <Label>Apellido *</Label>
                    <Input
                      value={clientInfo.lastName}
                      onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                      placeholder="Tu apellido"
                    />
                  </div>
                  
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label>Teléfono *</Label>
                    <Input
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      placeholder="+51 999 999 999"
                    />
                  </div>
                </div>

                {/* Datos de la mascota */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Información de tu Mascota</h3>
                  
                  <div>
                    <Label>Nombre de la Mascota *</Label>
                    <Input
                      value={clientInfo.petName}
                      onChange={(e) => setClientInfo({ ...clientInfo, petName: e.target.value })}
                      placeholder="Nombre de tu mascota"
                    />
                  </div>
                  
                  <div>
                    <Label>Raza</Label>
                    <Input
                      value={clientInfo.petBreed}
                      onChange={(e) => setClientInfo({ ...clientInfo, petBreed: e.target.value })}
                      placeholder="Ej: Golden Retriever"
                    />
                  </div>
                  
                  <div>
                    <Label>Tamaño *</Label>
                    <Select value={petSize} onValueChange={(v: any) => setPetSize(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Pequeño (hasta 10 kg)</SelectItem>
                        <SelectItem value="medium">Mediano (10-25 kg)</SelectItem>
                        <SelectItem value="large">Grande (25-40 kg)</SelectItem>
                        <SelectItem value="extra-large">Extra Grande (+40 kg)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Dirección *</Label>
                    <Input
                      value={clientInfo.address}
                      onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                      placeholder="Tu dirección completa"
                    />
                  </div>

                  <div>
                    <Label>Distrito *</Label>
                    <Select value={clientInfo.zone} onValueChange={(v) => setClientInfo({ ...clientInfo, zone: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="miraflores">Miraflores</SelectItem>
                        <SelectItem value="san-isidro">San Isidro</SelectItem>
                        <SelectItem value="surco">Surco</SelectItem>
                        <SelectItem value="la-molina">La Molina</SelectItem>
                        <SelectItem value="san-borja">San Borja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Resumen del precio */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    S/ {calculatePrice().toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * El pago se realizará al finalizar el servicio
                </p>
              </div>

              <Button className="w-full mt-6" size="lg" onClick={handleBooking}>
                Confirmar Reserva
              </Button>
            </Card>
          </div>
        )}

        {/* Step 5: Confirmación */}
        {step === 5 && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-bold mb-2">¡Reserva Confirmada!</h2>
              <p className="text-muted-foreground mb-8">
                Hemos enviado un correo de confirmación a {clientInfo.email}
              </p>

              <div className="bg-muted p-6 rounded-lg text-left space-y-3 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className="font-semibold">{selectedService?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Groomer:</span>
                  <span className="font-semibold">
                    {selectedGroomer?.firstName} {selectedGroomer?.lastName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span className="font-semibold">{selectedDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hora:</span>
                  <span className="font-semibold">{selectedTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mascota:</span>
                  <span className="font-semibold">{clientInfo.petName}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    S/ {calculatePrice().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-8">
                <p className="text-sm">
                  📱 Recibirás recordatorios por SMS/WhatsApp 24 horas y 2 horas antes de tu cita
                </p>
                <p className="text-sm mt-2">
                  📍 Podrás rastrear a tu groomer en tiempo real el día de la cita
                </p>
              </div>

              <Button onClick={resetBooking} variant="outline" className="mr-4">
                Agendar Otra Cita
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Ir al Inicio
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
