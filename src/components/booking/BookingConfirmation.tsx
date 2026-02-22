import { Check, Calendar, MapPin, Clock, Share2, Download, Star, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface BookingConfirmationProps {
  bookingData: any;
  onGoHome: () => void;
}

export function BookingConfirmation({ bookingData, onGoHome }: BookingConfirmationProps) {
  const confirmationCode = 'SPT' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
            
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ¡Reserva Confirmada!
            </h1>
            <p className="text-lg text-slate-600 mb-4">
              Tu cita ha sido agendada exitosamente
            </p>
            
            <Badge className="text-lg px-4 py-2 bg-green-100 text-green-800 hover:bg-green-200">
              Código: {confirmationCode}
            </Badge>
          </div>

          {/* Confirmation Card */}
          <Card className="p-8 mb-6 border-2 border-green-200 bg-white shadow-xl">
            <div className="space-y-6">
              {/* Service Info */}
              <div className="flex items-start gap-4 pb-6 border-b">
                <div className="text-5xl">{bookingData.service?.icon}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{bookingData.service?.name}</h2>
                  <p className="text-slate-600">{bookingData.pet?.name}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    S/{bookingData.service?.prices[bookingData.pet?.size]}
                  </div>
                  <div className="text-sm text-slate-500">Total</div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-lg">
                    {new Date(bookingData.dateTime?.date).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-slate-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {bookingData.dateTime?.time} • {bookingData.service?.duration} minutos
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">{bookingData.contact?.address}</div>
                  <div className="text-sm text-slate-600">
                    {bookingData.contact?.district}
                  </div>
                  {bookingData.contact?.reference && (
                    <div className="text-sm text-slate-500 mt-1">
                      Ref: {bookingData.contact?.reference}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm font-semibold text-slate-700 mb-2">Información de Contacto</div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div>{bookingData.contact?.name}</div>
                  <div>📧 {bookingData.contact?.email}</div>
                  <div>📱 {bookingData.contact?.phone}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">📬</span>
              ¿Qué Sigue Ahora?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Confirmación Enviada</div>
                  <div className="text-slate-600">
                    Recibirás un email y WhatsApp con todos los detalles
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Recordatorio 24h Antes</div>
                  <div className="text-slate-600">
                    Te recordaremos tu cita por WhatsApp y email
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Groomer en Camino</div>
                  <div className="text-slate-600">
                    Te avisamos cuando estemos llegando a tu casa
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Servicio Completado</div>
                  <div className="text-slate-600">
                    Pago en efectivo al finalizar. ¡Tu mascota quedará hermosa!
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Button size="lg" variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Descargar Confirmación
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
            
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={onGoHome}
            >
              Volver al Inicio
            </Button>
          </div>

          {/* Customer Service */}
          <Card className="mt-6 p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-yellow-700 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <div className="font-semibold mb-1">¿Necesitas Ayuda?</div>
                <div>
                  Contáctanos por WhatsApp al <span className="font-semibold">+51 987 654 321</span> o 
                  email <span className="font-semibold">hola@smartpet.pe</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Add to Calendar */}
          <div className="mt-6 text-center">
            <Button variant="link" className="text-blue-600">
              <Calendar className="w-4 h-4 mr-2" />
              Agregar a mi Calendario
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
