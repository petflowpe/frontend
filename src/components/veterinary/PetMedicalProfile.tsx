import { useState } from 'react';
import { 
  Activity, Calendar, FileText, Syringe, Thermometer, 
  Weight, Heart, ChevronDown, ChevronUp, Share2, 
  Printer, Download, Search, Filter, Stethoscope, Pill
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Tipos de datos para el historial
interface MedicalRecord {
  id: string;
  date: string;
  type: 'consultation' | 'vaccine' | 'emergency' | 'grooming';
  doctor: string;
  reason: string; // Motivo de consulta
  diagnosis?: string;
  treatment?: string[]; // Medicamentos/Procedimientos
  vitals?: {
    weight: number;
    temp: number;
    heartRate: number;
  };
  notes?: string;
  attachments?: string[]; // URLs de fotos
}

// Datos Simulados (Estos vendrían del backend Laravel)
const petData = {
  id: 'PET-8821',
  name: 'Thor',
  breed: 'Golden Retriever',
  age: '3 años, 2 meses',
  gender: 'Macho',
  weight: 32.5,
  owner: 'María González',
  avatar: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e27?w=400&h=400&fit=crop',
  alerts: ['Alérgico a AINES', 'Carácter nervioso'],
};

const historyData: MedicalRecord[] = [
  {
    id: 'REC-101',
    date: '2024-01-08', // Hoy (Simulado lo que acaba de hacer el chofer)
    type: 'consultation',
    doctor: 'Dr. Alejandro Vet',
    reason: 'Decaimiento y falta de apetito',
    diagnosis: 'Gastroenteritis leve por ingesta indebida.',
    treatment: ['Inyección Antiinflamatoria', 'Protector Gástrico Oral', 'Dieta blanda x 3 días'],
    vitals: { weight: 32.5, temp: 39.1, heartRate: 110 },
    notes: 'Se recomienda observación 24h. Si vomita nuevamente, acudir a clínica.',
    attachments: ['https://images.unsplash.com/photo-1584034795765-55543583c535?auto=format&fit=crop&q=80&w=200']
  },
  {
    id: 'REC-089',
    date: '2023-11-15',
    type: 'vaccine',
    doctor: 'Dra. Sofia Tech',
    reason: 'Refuerzo Anual',
    diagnosis: 'Paciente sano, apto para vacunación.',
    treatment: ['Vacuna Óctuple', 'Vacuna Antirrábica'],
    vitals: { weight: 31.8, temp: 38.2, heartRate: 98 },
  },
  {
    id: 'REC-045',
    date: '2023-06-20',
    type: 'consultation',
    doctor: 'Dr. Alejandro Vet',
    reason: 'Cojera pata trasera derecha',
    diagnosis: 'Traumatismo leve en almohadilla.',
    treatment: ['Limpieza de herida', 'Crema cicatrizante'],
    vitals: { weight: 30.5, temp: 38.5, heartRate: 102 },
  }
];

// Datos para el gráfico de peso
const weightHistory = [
  { date: 'Jun 23', weight: 30.5 },
  { date: 'Ago 23', weight: 31.2 },
  { date: 'Nov 23', weight: 31.8 },
  { date: 'Ene 24', weight: 32.5 },
];

export function PetMedicalProfile() {
  const [activeRecord, setActiveRecord] = useState<string | null>(historyData[0].id);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR - INFORMACIÓN PRINCIPAL */}
      <div className="w-full lg:w-80 bg-white border-r p-6 flex flex-col gap-6 overflow-y-auto z-10 shadow-sm">
        <div className="text-center">
          <Avatar className="w-32 h-32 mx-auto border-4 border-blue-50 shadow-xl mb-4">
            <AvatarImage src={petData.avatar} className="object-cover" />
            <AvatarFallback>TH</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-black text-slate-900">{petData.name}</h1>
          <p className="text-slate-500 font-medium">{petData.breed}</p>
          <div className="mt-2 flex justify-center gap-2">
            {petData.alerts.map(alert => (
              <Badge key={alert} variant="destructive" className="text-[10px] uppercase tracking-wide">
                {alert}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase">Edad</span>
                <span className="font-semibold text-slate-900">{petData.age}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="bg-green-50 p-2 rounded-lg">
                <Weight className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase">Peso Actual</span>
                <span className="font-semibold text-slate-900">{petData.weight} kg</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3 text-slate-600">
              <div className="bg-purple-50 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase">Estado</span>
                <span className="font-semibold text-green-600">En Tratamiento</span>
              </div>
            </div>
          </div>
        </div>

        <Card className="mt-auto bg-slate-900 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Próxima Cita</CardTitle>
            <div className="text-2xl font-bold">15 Ene</div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400 mb-4">Control post-tratamiento</p>
            <Button variant="secondary" className="w-full text-xs h-8">Reprogramar</Button>
          </CardContent>
        </Card>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header de la sección */}
        <div className="h-16 border-b bg-white px-6 flex items-center justify-between shrink-0">
          <h2 className="font-bold text-lg flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5 text-slate-400" />
            Historial Clínico Unificado
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" /> Imprimir
            </Button>
            <Button variant="default" size="sm" className="bg-blue-600">
              <Share2 className="w-4 h-4 mr-2" /> Compartir con Dueño
            </Button>
          </div>
        </div>

        {/* Contenido Scrollable */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          <Tabs defaultValue="history" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="history">Línea de Tiempo</TabsTrigger>
              <TabsTrigger value="stats">Estadísticas & Peso</TabsTrigger>
            </TabsList>

            {/* TAB HISTORIAL */}
            <TabsContent value="history" className="space-y-6">
              
              {historyData.map((record) => (
                <Card key={record.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  {/* Encabezado del Registro */}
                  <div className="bg-slate-50 p-4 border-b flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        record.type === 'consultation' ? 'bg-blue-100 text-blue-600' : 
                        record.type === 'vaccine' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {record.type === 'consultation' ? <Stethoscope className="w-6 h-6" /> :
                         record.type === 'vaccine' ? <Syringe className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {record.type === 'consultation' ? 'Consulta Médica' : 
                           record.type === 'vaccine' ? 'Vacunación' : 'Atención General'}
                        </h3>
                        <p className="text-sm text-slate-500">{record.date} • Atendido por {record.doctor}</p>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="px-3 py-1 border-slate-300 text-slate-600">
                      ID: {record.id}
                    </Badge>
                  </div>

                  {/* Detalles del Registro */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Columna Izquierda: Anamnesis */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Motivo de Consulta</h4>
                        <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          "{record.reason}"
                        </p>
                      </div>
                      
                      {record.diagnosis && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Diagnóstico</h4>
                          <p className="font-semibold text-slate-900">{record.diagnosis}</p>
                        </div>
                      )}

                      {record.vitals && (
                         <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="bg-blue-50/50 p-2 rounded border border-blue-100 text-center">
                              <Weight className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                              <span className="block text-xs text-slate-500">Peso</span>
                              <span className="font-bold text-slate-700">{record.vitals.weight}kg</span>
                            </div>
                            <div className="bg-red-50/50 p-2 rounded border border-red-100 text-center">
                              <Thermometer className="w-4 h-4 mx-auto text-red-400 mb-1" />
                              <span className="block text-xs text-slate-500">Temp</span>
                              <span className="font-bold text-slate-700">{record.vitals.temp}°C</span>
                            </div>
                            <div className="bg-pink-50/50 p-2 rounded border border-pink-100 text-center">
                              <Heart className="w-4 h-4 mx-auto text-pink-400 mb-1" />
                              <span className="block text-xs text-slate-500">Pulso</span>
                              <span className="font-bold text-slate-700">{record.vitals.heartRate}</span>
                            </div>
                         </div>
                      )}
                    </div>

                    {/* Columna Derecha: Tratamiento y Notas */}
                    <div className="space-y-6">
                      {record.treatment && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tratamiento & Farmacia</h4>
                          <ul className="space-y-2">
                            {record.treatment.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Pill className="w-4 h-4 text-blue-500" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {record.notes && (
                        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                          <h4 className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1 flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Observaciones
                          </h4>
                          <p className="text-sm text-yellow-900 italic">{record.notes}</p>
                        </div>
                      )}

                      {record.attachments && (
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evidencia</h4>
                          <div className="flex gap-2">
                            {record.attachments.map((img, idx) => (
                              <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border cursor-pointer">
                                <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* TAB ESTADÍSTICAS */}
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Evolución de Peso</CardTitle>
                  <CardDescription>Control histórico de los últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                    <LineChart data={weightHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#2563eb" 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}