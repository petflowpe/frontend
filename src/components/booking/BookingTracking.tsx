import { useState, useEffect, useCallback } from 'react';
import { MapPin, Clock, Phone, Navigation, CheckCircle, Star, ShieldCheck, MessageCircle, Share2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { fetchPublicTracking, type PublicTrackingData } from '../../utils/api/publicBooking';

interface BookingTrackingProps {
  bookingCode?: string;
}

function statusStepIndex(status: string): number {
  switch (status) {
    case 'preparing': return 1;
    case 'on-the-way': return 2;
    case 'arrived': return 3;
    case 'in-service': return 4;
    case 'completed': return 5;
    default: return 0;
  }
}

export function BookingTracking({ bookingCode: initialCode }: BookingTrackingProps) {
  const [codeInput, setCodeInput] = useState(
    () => initialCode || new URLSearchParams(window.location.search).get('code') || ''
  );
  const [trackingData, setTrackingData] = useState<PublicTrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadTracking = useCallback(async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Ingresa tu código de seguimiento (ej. SPT-ABC123)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await fetchPublicTracking(trimmed);
      setTrackingData(data);
      if (data.status === 'completed') {
        setShowConfetti(true);
      }
    } catch {
      setTrackingData(null);
      setError('No encontramos una reserva con ese código.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCode || codeInput) {
      loadTracking(initialCode || codeInput);
    }
  }, [initialCode]);

  useEffect(() => {
    if (!trackingData?.code) return;
    const interval = setInterval(() => loadTracking(trackingData.code), 45000);
    return () => clearInterval(interval);
  }, [trackingData?.code, loadTracking]);

  useEffect(() => {
    if (trackingData?.status === 'completed') {
      toast.success('¡Servicio finalizado! 🐶✨');
    }
  }, [trackingData?.status]);

  if (!trackingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-2">Seguimiento de tu cita</h1>
        <p className="text-slate-600 mb-6 text-center max-w-md">
          Ingresa el código que recibiste al reservar (formato SPT-XXXXXX)
        </p>
        <div className="flex w-full max-w-md gap-2">
          <Input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="SPT-ABC123"
            className="font-mono"
          />
          <Button onClick={() => loadTracking(codeInput)} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
        {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}
      </div>
    );
  }

  const demoStep = statusStepIndex(trackingData.status);
  const driver = trackingData.driver;

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'on-the-way': return { 
        gradient: 'from-blue-600 to-indigo-600', 
        bg: 'bg-blue-500',
        text: 'En Camino', 
        sub: 'Tu groomer está cerca', 
        icon: Navigation 
      };
      case 'arrived': return { 
        gradient: 'from-emerald-500 to-teal-600', 
        bg: 'bg-emerald-500',
        text: '¡Ha Llegado!', 
        sub: 'Estacionado en tu dirección', 
        icon: MapPin 
      };
      case 'in-service': return { 
        gradient: 'from-purple-600 to-pink-600', 
        bg: 'bg-purple-500',
        text: 'En Servicio', 
        sub: 'Cuidando a tu mascota', 
        icon: Clock 
      };
      case 'completed': return { 
        gradient: 'from-slate-800 to-black', 
        bg: 'bg-slate-800',
        text: 'Finalizado', 
        sub: '¡Quedó hermoso!', 
        icon: CheckCircle 
      };
      default: return { 
        gradient: 'from-gray-500 to-slate-600', 
        bg: 'bg-slate-500',
        text: 'Preparando', 
        sub: 'Procesando tu cita', 
        icon: Clock 
      };
    }
  };

  const currentStatus = getStatusInfo(trackingData.status);
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden flex flex-col">
      
      {/* --- CONFETTI (Solo al final) --- */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex justify-center overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="animate-fall" style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`,
              top: '-20px'
            }}>
              <div className="w-4 h-4 rounded-sm transform rotate-45" style={{
                backgroundColor: ['#FFD700', '#FF69B4', '#00BFFF', '#32CD32'][Math.floor(Math.random() * 4)]
              }}/>
            </div>
          ))}
        </div>
      )}

      {/* --- MAPA AREA (Ocupa 50% de la pantalla en móvil) --- */}
      <div className="relative flex-1 min-h-[45vh] bg-slate-200 w-full overflow-hidden">
        {/* Mapa Estilizado */}
        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-77.03, -12.11,14,0/800x800?access_token=pk.mock')] bg-cover bg-center" 
             style={{ backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=-12.11,-77.03&zoom=15&size=800x800&scale=2&style=feature:all|element:all|saturation:-100&key=Mock')` }}>
           <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply" />
        </div>

        {/* Header Flotante */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start bg-gradient-to-b from-black/40 to-transparent pt-8 pb-12">
           <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-bold text-slate-800">EN VIVO</span>
           </div>
           <Button size="icon" variant="secondary" className="rounded-full shadow-lg bg-white/90 backdrop-blur-md h-10 w-10">
             <Share2 className="w-5 h-5 text-slate-700" />
           </Button>
        </div>

        {/* Ruta Animada SVG */}
        {(trackingData.status === 'on-the-way' || trackingData.status === 'arrived') && (
          <div className="absolute inset-0 z-10 pointer-events-none">
             <svg className="w-full h-full" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))' }}>
              <path d="M 100 100 Q 200 300 180 400" stroke="#4f46e5" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 100 100 Q 200 300 180 400" stroke="white" strokeWidth="2" fill="none" strokeDasharray="8,8" className="animate-pulse" />
              
              {/* Vehículo 3D Simulado */}
              <g className="animate-move-along-path" style={{ offsetPath: 'path("M 100 100 Q 200 300 180 400")', offsetDistance: trackingData.status === 'arrived' ? '100%' : '60%' }}>
                 <circle cx="0" cy="0" r="24" fill="white" className="shadow-2xl" />
                 <circle cx="0" cy="0" r="20" fill="#4f46e5" />
                 <Navigation className="w-6 h-6 text-white absolute -translate-x-3 -translate-y-3" x="-12" y="-12" />
              </g>
            </svg>
          </div>
        )}

        {/* Marcador Destino (Casa) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20 ml-10 z-10">
           <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xl mb-2 whitespace-nowrap transform -translate-x-1/2">
             Casa de {trackingData.pet?.name || 'tu mascota'} 🐶
             <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
           </div>
           <div className="w-4 h-4 bg-slate-900 rounded-full border-4 border-white shadow-xl mx-auto ring-4 ring-black/10"></div>
        </div>
      </div>

      {/* --- PANEL DE INFORMACIÓN (Bottom Sheet) --- */}
      <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] -mt-6 relative z-30 flex flex-col pb-8">
        
        {/* Pull Indicator */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Status Hero */}
        <div className="px-6 py-4">
          <div className={`rounded-2xl p-6 text-white shadow-lg bg-gradient-to-r ${currentStatus.gradient} relative overflow-hidden`}>
             <div className="relative z-10 flex justify-between items-center">
               <div>
                 <p className="text-white/80 text-xs font-bold tracking-wider uppercase mb-1">Estado Actual</p>
                 <h1 className="text-2xl font-bold flex items-center gap-2">
                   {currentStatus.text}
                 </h1>
                 <p className="text-sm text-white/90 mt-1">{currentStatus.sub}</p>
               </div>
               <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                 <StatusIcon className="w-8 h-8 text-white" />
               </div>
             </div>
             
             {/* Decorative Circles */}
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
             <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-black/10 rounded-full blur-xl" />
          </div>
        </div>

        {driver && (
          <>
            <div className="px-6 grid grid-cols-[1fr_auto] gap-4 items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-2 ring-slate-100">
                    <AvatarFallback>{driver.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-green-500 fill-green-100" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{driver.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{driver.vehicle || 'Vehículo asignado'}</span>
                  </div>
                </div>
              </div>
            </div>

            {driver.phone && (
              <div className="px-6 grid grid-cols-2 gap-3 mb-6">
                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
                  asChild
                >
                  <a href={`tel:${driver.phone}`}>
                    <Phone className="w-4 h-4 mr-2" /> Llamar
                  </a>
                </Button>
                <Button variant="outline" className="w-full border-slate-200 text-slate-700">
                  <MessageCircle className="w-4 h-4 mr-2" /> Chat
                </Button>
              </div>
            )}
          </>
        )}

        {!driver && (
          <p className="px-6 text-sm text-slate-500 mb-4">
            Estado: <strong>{trackingData.status_label}</strong>. El equipo asignará el vehículo antes de la visita.
          </p>
        )}

        <Separator className="mb-6 opacity-50" />

        {/* Timeline Details (Collapsible usually, open for now) */}
        <div className="px-6">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-900">Detalles del Servicio</h3>
             <Badge variant="secondary" className="font-mono text-xs">{trackingData.code}</Badge>
           </div>
           
           <Card className="bg-slate-50 border-none shadow-inner p-4 mb-4">
              <div className="flex justify-between items-start">
                 <div>
                   <p className="font-bold text-slate-800 text-lg">{trackingData.service.name}</p>
                   <p className="text-sm text-slate-500 mt-1">Mascota: {trackingData.pet.name}</p>
                 </div>
                 <span className="font-bold text-indigo-600 text-lg">S/ {trackingData.service.price}</span>
              </div>
              {trackingData.schedule.date && (
                <p className="text-xs text-slate-500 mt-2">
                  {trackingData.schedule.date} • {trackingData.schedule.time} — {trackingData.schedule.district}
                </p>
              )}
           </Card>

           {/* Stepper Vertical Minimalista */}
           <div className="space-y-6 pl-2">
              {[
                { title: 'Solicitud Recibida', time: '09:00 AM', active: true },
                { title: 'Groomer en Camino', time: '09:15 AM', active: demoStep >= 2 },
                { title: 'Llegada al Domicilio', time: '09:30 AM', active: demoStep >= 3 },
                { title: 'Servicio en Curso', time: '...', active: demoStep >= 4 },
                { title: 'Finalizado', time: '...', active: demoStep >= 5 },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 relative group">
                   {/* Line Connector */}
                   {i !== 4 && (
                     <div className={`absolute left-[7px] top-4 bottom-[-24px] w-[2px] ${step.active ? 'bg-indigo-100' : 'bg-slate-100'}`} />
                   )}
                   
                   <div className={`relative z-10 w-4 h-4 rounded-full border-2 ${
                     step.active 
                       ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.2)]' 
                       : 'bg-white border-slate-300'
                   }`} />
                   
                   <div className={`${step.active ? 'opacity-100' : 'opacity-40'} -mt-1.5`}>
                     <p className="text-sm font-bold text-slate-900">{step.title}</p>
                     <p className="text-xs text-slate-500 font-medium">{step.time}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
