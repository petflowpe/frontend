import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Phone, MessageCircle, Car, Check, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useApp, Appointment } from '../contexts/AppContext';
import { gpsTrackingService, Coordinates } from '../services/gpsTrackingService';
import { toast } from 'sonner';

/**
 * Componente de Tracking GPS en Tiempo Real
 * Permite a los clientes ver la ubicación del groomer y ETA
 */

interface GPSTrackingProps {
  appointmentId?: string;
  trackingId?: string;
}

export function GPSTracking({ appointmentId, trackingId }: GPSTrackingProps) {
  const { appointments, vehicles, updateVehicleLocation } = useApp();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [vehicleLocation, setVehicleLocation] = useState<Coordinates | null>(null);
  const [eta, setEta] = useState<{ minutes: number; formattedTime: string } | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [isNear, setIsNear] = useState(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  // Simular actualizaciones GPS cada 30 segundos
  useEffect(() => {
    if (!appointment) return;

    const interval = setInterval(() => {
      simulateVehicleMovement();
    }, 30000);

    // Inicial
    simulateVehicleMovement();

    return () => clearInterval(interval);
  }, [appointment]);

  useEffect(() => {
    if (appointmentId) {
      const apt = appointments.find(a => a.id === appointmentId);
      setAppointment(apt || null);
    }
  }, [appointmentId, appointments]);

  const simulateVehicleMovement = async () => {
    if (!appointment || !appointment.location.coordinates) return;

    const destination = appointment.location.coordinates;
    
    // Simular ubicación del vehículo (en producción vendría del GPS real)
    const vehicle = vehicles.find(v => v.id === appointment.vehicleId);
    const currentLocation = vehicle?.currentLocation || {
      lat: -12.0464,
      lng: -77.0428,
      lastUpdate: new Date().toISOString(),
    };

    // Simular movimiento hacia el destino
    const progress = Math.min(Math.random() * 0.3 + 0.1, 1); // 10-40% de avance
    const newLocation = gpsTrackingService.simulateGPSUpdate(
      { lat: currentLocation.lat, lng: currentLocation.lng },
      destination,
      progress
    );

    setVehicleLocation(newLocation);
    updateVehicleLocation(appointment.vehicleId, newLocation);

    // Calcular distancia y ETA
    const dist = gpsTrackingService.calculateDistance(newLocation, destination);
    setDistance(dist);

    const calculatedEta = gpsTrackingService.calculateETA(newLocation, destination, 30);
    setEta(calculatedEta);

    // Verificar proximidad
    const near = gpsTrackingService.isNearDestination(newLocation, destination, 500);
    setIsNear(near);

    // Generar notificación automática según distancia
    const notificationMsg = gpsTrackingService.getNotificationMessage(dist);
    if (notificationMsg && notificationMsg !== lastNotification) {
      setLastNotification(notificationMsg);
      toast.info(notificationMsg, { duration: 5000 });
    }
  };

  const generateTrackingLink = () => {
    if (!appointment) return;
    
    const link = gpsTrackingService.generateTrackingLink(
      appointment.vehicleId,
      appointment.id,
      24
    );
    
    navigator.clipboard.writeText(link.url);
    toast.success('Link de tracking copiado al portapapeles');
  };

  const sendWhatsAppTracking = () => {
    if (!appointment || !eta) return;
    
    const message = gpsTrackingService.generateTrackingWhatsAppMessage(
      'Cliente', // En producción vendría del appointment
      'Mascota', // En producción vendría del appointment
      eta.formattedTime,
      'https://smartpet.com/track/ABC123'
    );

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!appointment) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontró la cita</p>
        </Card>
      </div>
    );
  }

  const heading = vehicleLocation && appointment.location.coordinates
    ? gpsTrackingService.calculateHeading(vehicleLocation, appointment.location.coordinates)
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Seguimiento en Tiempo Real</h1>
        <p className="text-muted-foreground">
          Cita ID: {appointment.id}
        </p>
      </div>

      {/* Mapa Placeholder */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
        <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="text-center">
            <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-bounce" />
            <p className="text-lg font-semibold">Mapa Interactivo</p>
            <p className="text-sm text-muted-foreground">
              Integración con Google Maps API
            </p>
          </div>

          {/* Indicador de vehículo */}
          {vehicleLocation && (
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <Car className="h-8 w-8 text-blue-600" style={{ transform: `rotate(${heading}deg)` }} />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Tu groomer
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Estado del Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center">
          <Navigation className="h-8 w-8 text-blue-500 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Distancia</p>
          <p className="text-2xl font-bold">
            {gpsTrackingService.formatDistance(distance)}
          </p>
        </Card>

        <Card className="p-6 text-center">
          <Clock className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">ETA</p>
          <p className="text-2xl font-bold">
            {eta ? `${eta.minutes} min` : '--'}
          </p>
          {eta && (
            <p className="text-xs text-muted-foreground mt-1">
              Llegada: {eta.formattedTime}
            </p>
          )}
        </Card>

        <Card className="p-6 text-center">
          <MapPin className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Estado</p>
          <Badge className={isNear ? 'bg-green-500' : 'bg-blue-500'}>
            {isNear ? '¡Muy Cerca!' : 'En Camino'}
          </Badge>
        </Card>
      </div>

      {/* Progreso Visual */}
      <Card className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Progreso del viaje</span>
            <span className="font-medium">
              {distance > 0 ? Math.min(((5000 - distance) / 5000) * 100, 100).toFixed(0) : 0}%
            </span>
          </div>
          <Progress
            value={distance > 0 ? Math.min(((5000 - distance) / 5000) * 100, 100) : 0}
            className="h-3"
          />
        </div>
      </Card>

      {/* Información de la Cita */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Detalles de tu Cita</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Fecha:</span>
            <span className="font-medium">{appointment.date}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Hora programada:</span>
            <span className="font-medium">{appointment.startTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Dirección:</span>
            <span className="font-medium text-right max-w-xs truncate">
              {appointment.location.address}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Estado:</span>
            <Badge className="bg-blue-500">
              {appointment.status === 'confirmed' ? 'Confirmada' : 'En Progreso'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button variant="outline" onClick={generateTrackingLink}>
          <MapPin className="h-4 w-4 mr-2" />
          Copiar Link de Tracking
        </Button>
        
        <Button variant="outline" onClick={sendWhatsAppTracking}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Compartir por WhatsApp
        </Button>
      </div>

      {/* Notificaciones Automáticas */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <Check className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-medium">Notificaciones Automáticas Activadas</p>
            <p className="text-sm text-muted-foreground mt-1">
              Te avisaremos cuando el groomer esté a:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• 2 km de distancia</li>
              <li>• 1 km de distancia</li>
              <li>• A la vuelta de la esquina (500m)</li>
              <li>• Cuando llegue a tu domicilio</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Ayuda */}
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground text-center">
          ¿Problemas con el tracking?{' '}
          <a href="#" className="text-primary hover:underline">
            Contáctanos
          </a>
        </p>
      </Card>
    </div>
  );
}
