import { useState, useEffect } from 'react';
import { 
  MapPin as MapIcon, 
  BellRing, 
  MessageSquare, 
  Navigation2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  UsersRound, 
  Menu,
  X,
  Search,
  BatteryCharging,
  Signal,
  Maximize2,
  Truck,
  Zap,
  Route
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';

// MOCK DATA FOR PROTOTYPE
const MOCK_UNITS = [
  { id: 'u1', name: 'Móvil 1 (Norte)', driver: 'Carlos Ruiz', status: 'moving', lat: -12.0464, lng: -77.0428, battery: 85, signal: 4, nextStop: 'Calle Los Pinos 123', eta: '10 min' },
  { id: 'u2', name: 'Móvil 2 (Centro)', driver: 'Ana Díaz', status: 'serving', lat: -12.0964, lng: -77.0228, battery: 60, signal: 3, nextStop: 'Finalizando servicio', eta: '0 min' },
  { id: 'u3', name: 'Móvil 3 (Sur)', driver: 'Pedro S.', status: 'stopped', lat: -12.1264, lng: -77.0128, battery: 90, signal: 5, nextStop: 'Av. Arequipa 4500', eta: '25 min' },
];

const MOCK_ALERTS = [
  { id: 'a1', type: 'delay', level: 'high', message: 'Móvil 3 tiene un retraso de 15 min', time: 'Hace 2 min' },
  { id: 'a2', type: 'inventory', level: 'medium', message: 'Móvil 1 bajo en vacunas antirrábicas', time: 'Hace 45 min' },
  { id: 'a3', type: 'traffic', level: 'low', message: 'Tráfico pesado en ruta de Móvil 2', time: 'Hace 1 hora' },
];

const MOCK_MESSAGES = [
  { id: 'm1', sender: 'Carlos Ruiz', text: 'Ya llegué al domicilio del cliente.', time: '10:30', isMe: false },
  { id: 'm2', sender: 'Operaciones', text: 'Entendido. Recuerda validar la firma.', time: '10:31', isMe: true },
  { id: 'm3', sender: 'Carlos Ruiz', text: 'Listo, firma cargada.', time: '10:45', isMe: false },
];

export function OperationsCenter() {
  const [activeTab, setActiveTab] = useState('units');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- LIVE DATA INTEGRATION ---
  const [liveUnits, setLiveUnits] = useState(MOCK_UNITS);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUpdate = localStorage.getItem('driver_update');
      if (storedUpdate) {
        try {
          const newData = JSON.parse(storedUpdate);
          
          setLiveUnits(currentUnits => {
            const exists = currentUnits.find(u => u.id === newData.id);
            if (exists) {
              return currentUnits.map(u => u.id === newData.id ? { ...u, ...newData } : u);
            } else {
              // Si es una unidad nueva (la demo), la agregamos
              return [newData, ...currentUnits];
            }
          });

          // Notificación visual si cambia el estado
          if (newData.status === 'serving' && !localStorage.getItem('alerted_arrival')) {
             toast.info(`📍 ${newData.name} ha llegado al destino`);
             localStorage.setItem('alerted_arrival', 'true');
          }
        } catch (e) {
          console.error("Error parsing driver update", e);
        }
      }
    };

    // Escuchar eventos de otras pestañas
    window.addEventListener('storage', handleStorageChange);
    
    // Polling para simular "Socket" (lectura constante)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  // -----------------------------

  // Mock Map Implementation (Placeholder for Google Maps)
  const renderMap = () => (
    <div className="w-full h-full bg-slate-100 relative rounded-lg overflow-hidden group">
      {/* Background Map Image Placeholder */}
      <div 
        className="absolute inset-0 opacity-50 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-12.0464,-77.0428&zoom=12&size=800x600&maptype=roadmap&key=YOUR_API_KEY_HERE')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
        style={{ backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/1024px-Google_Maps_Logo_2020.svg.png')`, backgroundRepeat: 'no-repeat', backgroundSize: '100px', backgroundPosition: 'center' }} 
      />
      
      {/* Interactive Unit Markers (Live + Mock) */}
      {liveUnits.map(unit => (
        <div 
          key={unit.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${selectedUnit === unit.id ? 'z-50 scale-125' : 'z-10 hover:scale-110'}`}
          style={{ 
            // Conversión simple de lat/lng a % para el mapa estático de fondo (Aprox para Lima)
            // Centro: -12.08, -77.04.  Rango aprox 0.15 grados
            top: `${((unit.lat - (-12.04)) * -1000) + 20}%`, // Ajuste manual muy 'ojo de buen cubero' para la demo visual
            left: `${((unit.lng - (-77.08)) * 1000) - 10}%`
          }}
          onClick={() => setSelectedUnit(unit.id)}
        >
          <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 border-white ${
            unit.status === 'moving' ? 'bg-blue-500' : 
            unit.status === 'serving' ? 'bg-green-500' : 'bg-amber-500'
          }`}>
            <Navigation2 className={`w-5 h-5 text-white ${unit.status === 'moving' ? 'animate-pulse' : ''}`} style={{ transform: `rotate(${unit.status === 'moving' ? 45 : 0}deg)` }} />
            
            {selectedUnit === unit.id && (
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-xl border w-48 text-left z-50 animate-in fade-in slide-in-from-bottom-2">
                <div className="font-bold text-sm">{unit.name}</div>
                <div className="text-xs text-muted-foreground">{unit.driver}</div>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <Badge variant="outline" className={
                    unit.status === 'moving' ? 'bg-blue-50 text-blue-700' : 
                    unit.status === 'serving' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }>
                    {unit.status === 'moving' ? 'En ruta' : unit.status === 'serving' ? 'Atendiendo' : 'Detenido'}
                  </Badge>
                  <span className="text-slate-500">{unit.eta}</span>
                </div>
              </div>
            )}
          </div>
          {/* Pulse Effect */}
          {unit.status === 'moving' && (
            <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-ping"></div>
          )}
        </div>
      ))}
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-2 rounded-lg text-xs font-mono shadow-sm">
        Simulación de Mapa en Vivo • {liveUnits.length} Unidades Conectadas
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-50">
      {/* Top Bar Stats */}
      <div className="h-16 bg-white border-b flex items-center px-6 justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Centro de Control</h1>
            <p className="text-xs text-muted-foreground">Monitoreo de flota en tiempo real</p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold leading-none">3</div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Unidades Activas</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Navigation2 className="w-5 h-5" />
            </div>
          </div>
          <div className="w-px bg-slate-200 h-10 self-center"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold leading-none text-amber-600">2</div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Alertas</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="w-px bg-slate-200 h-10 self-center"></div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold leading-none">98%</div>
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Puntualidad</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* MAP AREA */}
        <div className="flex-1 relative z-0">
          {renderMap()}
          
          {/* Floating Action Button for Sidebar Mobile */}
          {!isSidebarOpen && (
            <Button 
              className="absolute top-4 right-4 z-10 shadow-lg"
              onClick={() => setIsSidebarOpen(true)}
              variant="secondary"
            >
              <Menu className="w-4 h-4 mr-2" /> Panel
            </Button>
          )}
        </div>

        {/* RIGHT SIDEBAR (Control Panel) */}
        <div className={`${isSidebarOpen ? 'w-96 translate-x-0' : 'w-0 translate-x-full'} transition-all duration-300 bg-white border-l shadow-xl z-10 flex flex-col`}>
          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <h2 className="font-bold text-sm uppercase tracking-wide text-slate-500">Panel de Operaciones</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Tabs defaultValue="units" className="flex-1 flex flex-col">
            <div className="px-4 pt-2">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="units">Unidades</TabsTrigger>
                <TabsTrigger value="alerts" className="relative">
                  Alertas
                  {MOCK_ALERTS.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar unidad o conductor..." className="pl-8" />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <TabsContent value="units" className="m-0 p-0">
                <div className="divide-y">
                  {liveUnits.map(unit => (
                    <div 
                      key={unit.id} 
                      className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedUnit === unit.id ? 'bg-blue-50 hover:bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      onClick={() => setSelectedUnit(unit.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                             <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${unit.driver}`} />
                             <AvatarFallback>{unit.driver.substring(0,2)}</AvatarFallback>
                           </Avatar>
                           <div>
                             <h3 className="font-bold text-sm text-slate-900">{unit.name}</h3>
                             <p className="text-xs text-slate-500">{unit.driver}</p>
                           </div>
                        </div>
                        <Badge className={`${
                          unit.status === 'moving' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 
                          unit.status === 'serving' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                        } border-0 shadow-none`}>
                          {unit.status === 'moving' ? 'En Ruta' : unit.status === 'serving' ? 'En Servicio' : 'Detenido'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600 bg-white p-2 rounded border">
                        <div className="flex items-center gap-1">
                          <Navigation2 className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[100px]">{unit.nextStop}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>ETA: {unit.eta}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BatteryCharging className="w-3 h-3 text-slate-400" />
                          <span>{unit.battery}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Signal className="w-3 h-3 text-slate-400" />
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(bar => (
                              <div key={bar} className={`w-0.5 h-2 rounded-full ${bar <= unit.signal ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="m-0 p-4 space-y-3">
                {MOCK_ALERTS.map(alert => (
                  <div key={alert.id} className="flex gap-3 p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      alert.level === 'high' ? 'bg-red-100 text-red-600' : 
                      alert.level === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{alert.type === 'delay' ? 'Retraso Detectado' : alert.type === 'inventory' ? 'Inventario Bajo' : 'Alerta de Tráfico'}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="chat" className="m-0 flex flex-col h-full">
                <div className="p-4 space-y-4">
                  {MOCK_MESSAGES.map(msg => (
                    <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.isMe ? 'text-blue-100' : 'text-slate-400'}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </ScrollArea>

            {/* Bottom Actions for Chat */}
            {activeTab === 'chat' && (
              <div className="p-3 bg-white border-t mt-auto">
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); toast.success('Mensaje enviado'); }}>
                  <Input placeholder="Escribe un mensaje..." className="flex-1" />
                  <Button type="submit" size="icon">
                    <Navigation2 className="w-4 h-4 transform rotate-90" />
                  </Button>
                </form>
              </div>
            )}
            
            {/* Quick Actions Footer */}
            {activeTab !== 'chat' && (
              <div className="p-4 bg-slate-50 border-t grid grid-cols-2 gap-3">
                 <Button variant="outline" className="w-full text-xs">
                   <UsersRound className="w-3 h-3 mr-2" />
                   Contactar Todos
                 </Button>
                 <Button className="w-full text-xs bg-slate-900">
                   <AlertTriangle className="w-3 h-3 mr-2" />
                   Emergencia
                 </Button>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}