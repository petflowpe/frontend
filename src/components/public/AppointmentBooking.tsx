import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  CreditCard,
  Dog,
  Cat,
  Calendar as CalendarIcon,
  Repeat,
  Mail,
  FileText,
  Download,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface AppointmentBookingProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export function AppointmentBooking({ isOpen, onClose, currentUser }: AppointmentBookingProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [appointmentData, setAppointmentData] = useState({
    petName: '',
    petType: '',
    petBreed: '',
    petAge: '',
    petWeight: '',
    observations: '',
    recurring: 'none', // none, weekly, biweekly, monthly
    paymentMethod: ''
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const services = [
    {
      id: 'grooming-basic',
      category: 'Grooming Móvil',
      name: 'Baño Básico',
      price: 50,
      duration: 60,
      description: 'Baño, secado y corte de uñas'
    },
    {
      id: 'grooming-complete',
      category: 'Grooming Móvil',
      name: 'Grooming Completo',
      price: 90,
      duration: 90,
      description: 'Baño, corte, secado, limpieza dental'
    },
    {
      id: 'vet-consultation',
      category: 'Veterinaria Móvil',
      name: 'Consulta Veterinaria',
      price: 80,
      duration: 45,
      description: 'Revisión general y diagnóstico'
    },
    {
      id: 'vet-vaccination',
      category: 'Veterinaria Móvil',
      name: 'Vacunación',
      price: 60,
      duration: 30,
      description: 'Vacunas preventivas y certificado'
    },
    {
      id: 'vet-deworming',
      category: 'Veterinaria Móvil',
      name: 'Desparasitación',
      price: 40,
      duration: 30,
      description: 'Tratamiento antiparasitario completo'
    }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Generar calendario del mes actual
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date: Date | null) => {
    if (!date) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      toast.error('No puedes seleccionar una fecha pasada');
      return;
    }
    
    setSelectedDate(date);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    const today = new Date();
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    
    if (prevMonth < new Date(today.getFullYear(), today.getMonth(), 1)) {
      toast.error('No puedes seleccionar meses anteriores');
      return;
    }
    
    setCurrentMonth(prevMonth);
  };

  const handleSubmit = () => {
    // Validar datos
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!appointmentData.petName || !appointmentData.petType) {
      toast.error('Por favor completa la información de tu mascota');
      return;
    }

    if (!appointmentData.paymentMethod) {
      toast.error('Por favor selecciona un método de pago');
      return;
    }

    // Generar número de orden
    const orderNum = 'ORD-' + Date.now();
    setOrderNumber(orderNum);

    // Simular envío de email
    setTimeout(() => {
      toast.success('¡Cita agendada exitosamente!', {
        description: 'Recibirás un email de confirmación'
      });
      setShowConfirmation(true);
    }, 1000);
  };

  const downloadICS = () => {
    const service = services.find(s => s.id === selectedService);
    if (!service || !selectedDate || !selectedTime) return;

    // Crear archivo ICS para agregar a calendario
    const event = {
      title: `${service.name} - ${appointmentData.petName}`,
      start: new Date(selectedDate.setHours(parseInt(selectedTime.split(':')[0]), parseInt(selectedTime.split(':')[1]))),
      duration: service.duration,
      description: service.description,
      location: 'Servicio a domicilio'
    };

    toast.success('Descargando evento de calendario...');
    // En producción, aquí generarías el archivo ICS real
  };

  const resetForm = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime('');
    setSelectedService('');
    setAppointmentData({
      petName: '',
      petType: '',
      petBreed: '',
      petAge: '',
      petWeight: '',
      observations: '',
      recurring: 'none',
      paymentMethod: ''
    });
    setShowConfirmation(false);
    onClose();
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <Dialog open={isOpen} onOpenChange={resetForm}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!showConfirmation ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Agendar Cita</DialogTitle>
              <div className="flex items-center gap-2 mt-4">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      s <= step ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>Servicio</span>
                <span>Fecha y Hora</span>
                <span>Mascota</span>
                <span>Pago</span>
              </div>
            </DialogHeader>

            <AnimatePresence mode="wait">
              {/* STEP 1: Selección de Servicio */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-bold text-lg mb-4">Selecciona un Servicio</h3>
                  
                  <div className="grid gap-3">
                    {services.map((service) => (
                      <Card
                        key={service.id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedService === service.id
                            ? 'border-2 border-blue-600 bg-blue-50'
                            : 'border border-slate-200'
                        }`}
                        onClick={() => setSelectedService(service.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge className="mb-2 bg-blue-100 text-blue-700 border-blue-200">
                              {service.category}
                            </Badge>
                            <h4 className="font-bold mb-1">{service.name}</h4>
                            <p className="text-sm text-slate-600 mb-2">{service.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-slate-600">
                                <Clock className="w-4 h-4" />
                                {service.duration} min
                              </span>
                              <span className="font-bold text-blue-600">
                                S/ {service.price}
                              </span>
                            </div>
                          </div>
                          {selectedService === service.id && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedService}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* STEP 2: Selección de Fecha y Hora */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="font-bold text-lg">Selecciona Fecha y Hora</h3>

                  {/* Calendario */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold">
                        {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNextMonth}>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {dayNames.map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {days.map((date, index) => {
                        if (!date) {
                          return <div key={index} />;
                        }

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isPast = date < today;
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        const isToday = date.toDateString() === today.toDateString();

                        return (
                          <button
                            key={index}
                            onClick={() => handleDateSelect(date)}
                            disabled={isPast}
                            className={`
                              aspect-square rounded-lg text-sm font-medium transition-all
                              ${isPast ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-blue-100'}
                              ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                              ${isToday && !isSelected ? 'border-2 border-blue-600' : ''}
                            `}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Horarios */}
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h4 className="font-bold mb-3">Horarios Disponibles</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                            className={selectedTime === time ? 'bg-blue-600 hover:bg-blue-700' : ''}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Cita Recurrente */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Repeat className="w-4 h-4" />
                      ¿Deseas repetir esta cita?
                    </Label>
                    <Select
                      value={appointmentData.recurring}
                      onValueChange={(value) =>
                        setAppointmentData({ ...appointmentData, recurring: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No repetir</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="biweekly">Quincenal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Atrás
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!selectedDate || !selectedTime}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      Continuar
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Información de Mascota */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="font-bold text-lg mb-4">Información de tu Mascota</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="petName">Nombre de la Mascota *</Label>
                      <Input
                        id="petName"
                        placeholder="Ej: Max"
                        value={appointmentData.petName}
                        onChange={(e) =>
                          setAppointmentData({ ...appointmentData, petName: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="petType">Tipo de Mascota *</Label>
                      <Select
                        value={appointmentData.petType}
                        onValueChange={(value) =>
                          setAppointmentData({ ...appointmentData, petType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">🐕 Perro</SelectItem>
                          <SelectItem value="cat">🐈 Gato</SelectItem>
                          <SelectItem value="other">🐾 Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="petBreed">Raza</Label>
                      <Input
                        id="petBreed"
                        placeholder="Ej: Golden Retriever"
                        value={appointmentData.petBreed}
                        onChange={(e) =>
                          setAppointmentData({ ...appointmentData, petBreed: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="petAge">Edad (años)</Label>
                      <Input
                        id="petAge"
                        type="number"
                        placeholder="Ej: 3"
                        value={appointmentData.petAge}
                        onChange={(e) =>
                          setAppointmentData({ ...appointmentData, petAge: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="petWeight">Peso (kg)</Label>
                      <Input
                        id="petWeight"
                        type="number"
                        placeholder="Ej: 15"
                        value={appointmentData.petWeight}
                        onChange={(e) =>
                          setAppointmentData({ ...appointmentData, petWeight: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observations">Observaciones Especiales</Label>
                    <Textarea
                      id="observations"
                      placeholder="Alergias, comportamiento, preferencias, etc."
                      rows={3}
                      value={appointmentData.observations}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, observations: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Atrás
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      disabled={!appointmentData.petName || !appointmentData.petType}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      Continuar
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Pago y Confirmación */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="font-bold text-lg">Resumen y Pago</h3>

                  {/* Resumen */}
                  <Card className="p-4 bg-slate-50 border-slate-200">
                    <h4 className="font-bold mb-3">Resumen de tu Cita</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Servicio:</span>
                        <span className="font-medium">
                          {services.find((s) => s.id === selectedService)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Fecha:</span>
                        <span className="font-medium">
                          {selectedDate?.toLocaleDateString('es-PE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Hora:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Mascota:</span>
                        <span className="font-medium">
                          {appointmentData.petName} ({appointmentData.petType})
                        </span>
                      </div>
                      {appointmentData.recurring !== 'none' && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Recurrencia:</span>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            {appointmentData.recurring === 'weekly' && 'Semanal'}
                            {appointmentData.recurring === 'biweekly' && 'Quincenal'}
                            {appointmentData.recurring === 'monthly' && 'Mensual'}
                          </Badge>
                        </div>
                      )}
                      <div className="border-t border-slate-300 pt-2 mt-2 flex justify-between">
                        <span className="font-bold">Total:</span>
                        <span className="text-xl font-bold text-blue-600">
                          S/ {services.find((s) => s.id === selectedService)?.price}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Método de Pago */}
                  <div>
                    <Label className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4" />
                      Método de Pago *
                    </Label>
                    <div className="grid gap-2">
                      {[
                        { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: '💳' },
                        { id: 'cash', name: 'Efectivo (al recibir el servicio)', icon: '💵' },
                        { id: 'transfer', name: 'Transferencia Bancaria', icon: '🏦' }
                      ].map((method) => (
                        <Card
                          key={method.id}
                          className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                            appointmentData.paymentMethod === method.id
                              ? 'border-2 border-blue-600 bg-blue-50'
                              : 'border border-slate-200'
                          }`}
                          onClick={() =>
                            setAppointmentData({ ...appointmentData, paymentMethod: method.id })
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{method.icon}</span>
                              <span className="font-medium">{method.name}</span>
                            </div>
                            {appointmentData.paymentMethod === method.id && (
                              <Check className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Atrás
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!appointmentData.paymentMethod}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirmar Cita
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          // Confirmación Final
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            <h3 className="text-2xl font-bold mb-2">¡Cita Confirmada!</h3>
            <p className="text-slate-600 mb-6">
              Tu cita ha sido agendada exitosamente
            </p>

            <Card className="p-6 bg-blue-50 border-blue-200 mb-6">
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-bold">Orden de Servicio: {orderNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">
                    Confirmación enviada a: {currentUser?.email}
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                onClick={downloadICS}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Agregar a mi Calendario
              </Button>
              <Button
                onClick={resetForm}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                Cerrar
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
