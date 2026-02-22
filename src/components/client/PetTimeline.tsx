import { 
  Syringe, 
  Calendar, 
  HeartPulse, 
  Baby, 
  Stethoscope, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Pet, Appointment } from '../../types';

interface PetTimelineProps {
  pet: Pet;
  appointments: Appointment[];
}

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description?: string;
  type: 'birth' | 'vaccine' | 'appointment' | 'medical' | 'other';
  status?: 'completed' | 'upcoming' | 'missed';
  icon: any;
  color: string;
}

export function PetTimeline({ pet, appointments }: PetTimelineProps) {
  // Construir eventos de la línea de tiempo
  const events: TimelineEvent[] = [];

  // 1. Nacimiento (Estimado)
  const birthYear = new Date().getFullYear() - pet.age;
  events.push({
    id: 'birth',
    date: new Date(`${birthYear}-01-01`), // Aproximado
    title: 'Nacimiento',
    description: `¡Bienvenido al mundo ${pet.name}!`,
    type: 'birth',
    status: 'completed',
    icon: Baby,
    color: 'bg-blue-100 text-blue-600 border-blue-200'
  });

  // 2. Vacunas (Historial)
  pet.vaccines.forEach((v) => {
    // Vacuna aplicada
    if (v.date) {
      events.push({
        id: `vac-${v.id}`,
        date: new Date(v.date),
        title: `Vacuna: ${v.name}`,
        description: `Veterinario: ${v.veterinarian || 'No especificado'}`,
        type: 'vaccine',
        status: 'completed',
        icon: Syringe,
        color: 'bg-green-100 text-green-600 border-green-200'
      });
    }
    // Próxima dosis
    if (v.nextDueDate) {
      events.push({
        id: `vac-next-${v.id}`,
        date: new Date(v.nextDueDate),
        title: `Próxima Vacuna: ${v.name}`,
        description: 'Recordatorio automático',
        type: 'vaccine',
        status: 'upcoming',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-600 border-yellow-200'
      });
    }
  });

  // 3. Citas Médicas
  appointments
    .filter(apt => apt.petId === pet.id)
    .forEach(apt => {
      const isPast = new Date(apt.date) < new Date();
      const isCompleted = apt.status === 'Completada' || (isPast && apt.status === 'Confirmada'); // Asumir completada si pasó fecha y estaba confirmada
      
      events.push({
        id: `apt-${apt.id}`,
        date: new Date(`${apt.date}T${apt.time}`),
        title: apt.serviceName,
        description: `${apt.serviceCategory} - ${apt.veterinarian || 'SmartPet'}`,
        type: 'appointment',
        status: isCompleted ? 'completed' : 'upcoming',
        icon: Stethoscope,
        color: isCompleted 
          ? 'bg-purple-100 text-purple-600 border-purple-200' 
          : 'bg-orange-100 text-orange-600 border-orange-200'
      });
    });

  // Ordenar por fecha descendente (más reciente primero)
  const sortedEvents = events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-red-500" />
          Línea de Vida
        </h3>
        <Badge variant="outline" className="text-muted-foreground">
          {events.length} eventos registrados
        </Badge>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
        {sortedEvents.map((event, index) => {
          const Icon = event.icon;
          const isUpcoming = event.status === 'upcoming';
          
          return (
            <div key={event.id} className="relative group">
              {/* Punto de la línea de tiempo */}
              <div className={`
                absolute -left-[31px] w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center z-10
                transition-all duration-300 group-hover:scale-110
                ${isUpcoming ? 'border-yellow-400' : 'border-slate-300'}
              `}>
                <div className={`w-2 h-2 rounded-full ${isUpcoming ? 'bg-yellow-400 animate-pulse' : 'bg-slate-300'}`} />
              </div>

              {/* Tarjeta del Evento */}
              <div className="flex flex-col sm:flex-row gap-4">
                 {/* Fecha */}
                 <div className="sm:w-24 pt-1 flex-shrink-0">
                    <p className="font-bold text-slate-700">
                      {event.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs text-slate-400">
                      {event.date.getFullYear()}
                    </p>
                    {isUpcoming && (
                      <Badge variant="secondary" className="mt-1 text-[10px] px-1 py-0 h-5">
                        Pendiente
                      </Badge>
                    )}
                 </div>

                 {/* Contenido */}
                 <Card className="flex-1 transition-all hover:shadow-md border-slate-200">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${event.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">{event.title}</h4>
                        <p className="text-sm text-slate-500 mb-2">{event.description}</p>
                        
                        {/* Detalles extra según tipo */}
                        {event.type === 'vaccine' && event.status === 'completed' && (
                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Inmunización registrada
                          </div>
                        )}
                      </div>
                    </CardContent>
                 </Card>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
