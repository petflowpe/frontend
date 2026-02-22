import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  PawPrint, 
  Phone,
  Mail,
  Download,
  Share2,
  Printer,
  Sparkles
} from 'lucide-react';

interface BookingTicketProps {
  appointment: {
    id: string;
    serviceName: string;
    serviceCategory: string;
    petName: string;
    date: string;
    time: string;
    price: number;
    address: string;
    district: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentData?: {
    method: string;
    amount: number;
    transactionId: string;
    timestamp: string;
  };
  onClose: () => void;
}

export function BookingTicket({ appointment, user, paymentData, onClose }: BookingTicketProps) {
  const handleDownload = () => {
    // Aquí implementarías la descarga del PDF
    console.log('Descargando ticket...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Comprobante SmartPet',
        text: `Cita confirmada - ${appointment.serviceName}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-2">
          {/* Header Success */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle className="w-20 h-20 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">¡Reserva Confirmada!</h2>
            <p className="text-green-100">Tu cita ha sido agendada exitosamente</p>
          </div>

          {/* Ticket Content */}
          <div className="p-8">
            {/* ID de Reserva */}
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-1">ID de Reserva</p>
              <p className="text-2xl font-mono font-bold">{appointment.id}</p>
            </div>

            {/* Detalles del Servicio */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Servicio</p>
                  <p className="font-bold text-lg">{appointment.serviceName}</p>
                  <p className="text-sm text-muted-foreground">{appointment.serviceCategory}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">S/. {appointment.price}</p>
                </div>
              </div>

              {/* Mascota */}
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <PawPrint className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Mascota</p>
                  <p className="font-semibold">{appointment.petName}</p>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  <Calendar className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-semibold">
                      {new Date(appointment.date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  <Clock className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hora</p>
                    <p className="font-semibold">{appointment.time}</p>
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="flex items-start gap-4 p-4 border border-border rounded-lg">
                <MapPin className="w-6 h-6 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Dirección del Servicio</p>
                  <p className="font-semibold">{appointment.address}</p>
                  <p className="text-sm text-muted-foreground">{appointment.district}</p>
                </div>
              </div>

              {/* Información del Cliente */}
              <div className="border-t border-border pt-6">
                <h3 className="font-semibold mb-4">Información del Cliente</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {paymentData && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-4">Información de Pago</h3>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Método de Pago</span>
                      <span className="font-medium">{paymentData.method}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Monto Pagado</span>
                      <span className="font-medium text-green-600">S/. {paymentData.amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">ID de Transacción</span>
                      <span className="font-mono text-xs">{paymentData.transactionId}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notas importantes */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                Notas Importantes
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Asegúrate de que tu mascota esté disponible en el horario acordado</li>
                <li>• Puedes cancelar o reprogramar con hasta 24 horas de anticipación</li>
                <li>• Recibirás un recordatorio 24 horas antes de tu cita</li>
                <li>• Mantén tu teléfono disponible para la llegada del servicio</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Button variant="outline" onClick={handleDownload} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
              <Button variant="outline" onClick={handlePrint} className="w-full">
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" onClick={handleShare} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>

            <Button onClick={onClose} className="w-full" size="lg">
              Ir al Portal
            </Button>
          </div>

          {/* Footer */}
          <div className="bg-muted/30 p-4 text-center text-sm text-muted-foreground border-t">
            <p>SmartPet © 2025 • Servicio de Atención: +51 987 654 321</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
