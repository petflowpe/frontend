import { useState, useRef, useEffect } from 'react';
import { 
  MapPin, Navigation, Clock, Phone, Camera, CheckCircle2, 
  AlertTriangle, DollarSign, CreditCard, QrCode, 
  ChevronRight, ArrowLeft, LogOut, Stethoscope, 
  Thermometer, Activity, Syringe, Pill, ClipboardList, Scissors, FileText, X, Search, Package,
  PenTool, CalendarCheck, Calendar as CalendarIcon, Microscope, FlaskConical, TestTube, UploadCloud, FileCheck
} from 'lucide-react';
import { PetMedicalProfile } from '../veterinary/PetMedicalProfile';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useApp } from '../../contexts/AppContext';
import { apiClient } from '../../utils/api/client';
import { API } from '../../utils/api/endpoints';

// Tipos de datos para el flujo
type ServiceStep = 'route' | 'arrived' | 'work' | 'signature' | 'payment' | 'completed';
type ServiceType = 'grooming' | 'vet';
type ExamProcessingType = 'internal' | 'external';

interface ServiceItem {
  id: string;
  sku?: string; // Código de inventario
  name: string;
  price: number;
  category: 'base' | 'addon' | 'product' | 'medication' | 'exam';
  selected: boolean;
  quantity: number;
  stock?: number; // Control de inventario (null para servicios intangibles)
  
  // Campos específicos para exámenes
  isExam?: boolean;
  examConfig?: {
    processing: ExamProcessingType;
    labName?: string;
    status: 'pending' | 'completed'; // pending = muestra tomada, completed = resultado listo
    resultFile?: string; // URL o base64 del resultado
  };
}

type ClientStopData = {
  name: string;
  pet: string;
  breed: string;
  address: string;
  phone: string;
  avatar: string;
};

type DriverDayStop = {
  order: number;
  appointment_id: number;
  status?: string;
  address?: string;
  district?: string;
  service_category?: string;
  client?: { name?: string; phone?: string };
  pet?: { name?: string; breed?: string; species?: string };
};

const DEMO_CLIENT: ClientStopData = {
  name: 'María González',
  pet: 'Thor',
  breed: 'Golden Retriever',
  address: 'Av. Larco 123, Miraflores',
  phone: '999888777',
  avatar: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e27?w=150&h=150&fit=crop',
};

function mapStopToClient(stop: DriverDayStop): ClientStopData {
  const addressParts = [stop.address, stop.district].filter(Boolean);
  return {
    name: stop.client?.name || 'Cliente',
    pet: stop.pet?.name || 'Mascota',
    breed: stop.pet?.breed || stop.pet?.species || '—',
    address: addressParts.length ? addressParts.join(', ') : 'Sin dirección',
    phone: stop.client?.phone || '',
    avatar: DEMO_CLIENT.avatar,
  };
}

export function DriverSession() {
  const [step, setStep] = useState<ServiceStep>('route');
  const [serviceType, setServiceType] = useState<ServiceType>('grooming');
  const [assignedVehicleId, setAssignedVehicleId] = useState<number | null>(null);
  const [currentAppointmentId, setCurrentAppointmentId] = useState<number | null>(null);
  const [dayStops, setDayStops] = useState<DriverDayStop[]>([]);
  const [usingDemoStop, setUsingDemoStop] = useState(true);
  const [clientData, setClientData] = useState<ClientStopData>(DEMO_CLIENT);
  const gpsErrorShown = useRef(false);

  // Cargar día de trabajo real (fallback a demo si no hay paradas)
  useEffect(() => {
    let cancelled = false;

    const loadDriverDay = async () => {
      try {
        const payload = await apiClient.get<{
          date?: string;
          vehicle?: { id?: number; name?: string } | null;
          stops?: DriverDayStop[];
          message?: string;
        }>(API.driver.day);

        if (cancelled) return;

        const vehicleId = payload?.vehicle?.id ? Number(payload.vehicle.id) : null;
        const stops = Array.isArray(payload?.stops) ? payload.stops : [];
        setAssignedVehicleId(vehicleId);
        setDayStops(stops);

        const nextStop =
          stops.find((s) => !['Completada', 'Cancelada', 'completed', 'cancelled'].includes(String(s.status || ''))) ||
          stops[0];

        if (nextStop) {
          setClientData(mapStopToClient(nextStop));
          setCurrentAppointmentId(Number(nextStop.appointment_id) || null);
          setUsingDemoStop(false);
          const cat = String(nextStop.service_category || '').toLowerCase();
          if (cat.includes('vet') || cat.includes('medic') || cat.includes('consult')) {
            setServiceType('vet');
          } else if (cat.includes('groom') || cat.includes('baño') || cat.includes('estetic')) {
            setServiceType('grooming');
          }
        } else {
          setClientData(DEMO_CLIENT);
          setCurrentAppointmentId(null);
          setUsingDemoStop(true);
          if (payload?.message) {
            toast.info(payload.message);
          } else if (!vehicleId) {
            toast.info('Sin vehículo asignado: mostrando parada demo');
          }
        }
      } catch (e) {
        console.error('Error cargando día del chofer:', e);
        if (!cancelled) {
          setUsingDemoStop(true);
          setClientData(DEMO_CLIENT);
        }
      }
    };

    void loadDriverDay();
    return () => {
      cancelled = true;
    };
  }, []);

  // GPS → PUT /vehicles/{id} con lat/lng reales
  useEffect(() => {
    if (!assignedVehicleId) return;

    let watchId: number | undefined;
    let lastSentAt = 0;

    if (!navigator.geolocation) {
      toast.error('Tu dispositivo no soporta GPS');
      return;
    }

    toast.info('GPS activo: transmitiendo ubicación…');

    watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now();
        if (now - lastSentAt < 8000) return;
        lastSentAt = now;

        const { latitude, longitude, speed, heading } = position.coords;
        const vehicleData = {
          id: assignedVehicleId,
          location: { lat: latitude, lng: longitude },
          status: step === 'route' ? 'active' : 'stopped',
          speed,
          heading,
          lastUpdate: new Date().toISOString(),
          nextStop: clientData.address,
        };

        try {
          await apiClient.put(API.vehicles.byId(assignedVehicleId), {
            current_latitude: latitude,
            current_longitude: longitude,
          });
          localStorage.setItem('driver_update', JSON.stringify(vehicleData));
        } catch (error) {
          console.error('Error transmitiendo ubicación:', error);
        }
      },
      (error) => {
        console.error('Error GPS:', error);
        if (!gpsErrorShown.current) {
          gpsErrorShown.current = true;
          toast.error('Error de señal GPS');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      }
    );

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [assignedVehicleId, step, clientData.address]);

  const syncAppointmentStatus = async (status: string) => {
    if (!currentAppointmentId || usingDemoStop) return;
    try {
      await apiClient.post(API.appointments.changeStatus(currentAppointmentId), { status });
    } catch (e) {
      console.error('No se pudo actualizar estado de cita:', e);
    }
  };

  const advanceStep = (next: ServiceStep) => {
    setStep(next);
    if (next === 'arrived') void syncAppointmentStatus('En Proceso');
    if (next === 'completed') {
      void syncAppointmentStatus('Completada');
      const remaining = dayStops.filter(
        (s) =>
          s.appointment_id !== currentAppointmentId &&
          !['Completada', 'Cancelada', 'completed', 'cancelled'].includes(String(s.status || ''))
      );
      const nextStop = remaining[0];
      if (nextStop) {
        setTimeout(() => {
          setClientData(mapStopToClient(nextStop));
          setCurrentAppointmentId(Number(nextStop.appointment_id) || null);
          setStep('route');
          toast.success(`Siguiente parada: ${nextStop.client?.name || 'cliente'}`);
        }, 1500);
      }
    }
  };

  const [showHistory, setShowHistory] = useState(false);
  const [photoEvidence, setPhotoEvidence] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // Estado para el buscador
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Estado para configuración de exámenes
  const [selectedExamForConfig, setSelectedExamForConfig] = useState<ServiceItem | null>(null);
  const [examProcessingType, setExamProcessingType] = useState<ExamProcessingType>('internal');
  const [examLabName, setExamLabName] = useState('Laboratorio Central');
  const examFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingExamId, setUploadingExamId] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<string | null>(null);

  // Agendamiento de Refuerzo
  const { addAppointment } = useApp();
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [nextDate, setNextDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [nextTime, setNextTime] = useState("09:00");

  const handleConfirmReschedule = () => {
    try {
      addAppointment({
        clientId: 'CLI-DEMO-001', // ID Simulado o usar uno real si existe
        petId: 'PET-DEMO-001',
        serviceIds: serviceType === 'grooming' ? ['SRV-G01'] : ['SRV-V01'],
        date: nextDate,
        startTime: nextTime,
        endTime: nextTime.split(':')[0] + ':50', // +50 mins approx
        estimatedDuration: 50,
        status: 'scheduled',
        groomerId: 'USR-001',
        vehicleId: 'VEH-001',
        confirmationStatus: 'confirmed', // Ya confirmado presencialmente
        subtotal: 0, // A calcular
        total: 0,
        paymentStatus: 'pending',
        location: {
           address: clientData.address,
           zone: 'Miraflores'
        },
        notes: `Refuerzo agendado desde Driver App. Tipo: ${serviceType === 'grooming' ? 'Baño Quincenal' : 'Control Médico'}`
      });
      setIsRescheduleOpen(false);
      // toast ya se muestra en addAppointment, pero podemos mostrar uno específico
      toast.success(`Refuerzo agendado para el ${new Date(nextDate).toLocaleDateString()}`);
    } catch (error) {
      console.error(error);
      toast.error("Error al agendar cita");
    }
  };

  // Firma Digital y Consentimiento
  const [signature, setSignature] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [consentTemplateId, setConsentTemplateId] = useState('generic');

  const consentTemplates = {
    generic: "Yo, [CLIENTE], certifico mi conformidad con el servicio de estética realizado a mi mascota [MASCOTA]. He verificado que el corte y baño se han realizado según lo acordado y recibo a mi mascota en buenas condiciones.",
    vet_procedure: "Yo, [CLIENTE], autorizo los procedimientos veterinarios realizados a [MASCOTA]. Se me han explicado los tratamientos administrados y las indicaciones post-atención.",
    anesthesia: "Yo, [CLIENTE], doy mi consentimiento informado para la sedación/anestesia de [MASCOTA], comprendiendo los riesgos inherentes al procedimiento explicados por el médico veterinario.",
  };

  const getConsentText = () => {
    let text = consentTemplates[consentTemplateId as keyof typeof consentTemplates] || consentTemplates.generic;
    text = text.replace('[CLIENTE]', clientData.name).replace('[MASCOTA]', clientData.pet);
    
    // Add services summary
    const servicesList = activeServices.filter(s => s.selected).map(s => s.name).join(', ');
    if (servicesList) {
        text += `\n\nServicios/Procedimientos incluidos: ${servicesList}.`;
    }
    return text;
  };

  // Funciones de Dibujo en Canvas
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ajustar coordenadas para touch o mouse
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).nativeEvent.offsetX;
      y = (e as React.MouseEvent).nativeEvent.offsetY;
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      e.preventDefault(); // Evitar scroll al firmar
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).nativeEvent.offsetX;
      y = (e as React.MouseEvent).nativeEvent.offsetY;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignature(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setSignature(null);
    }
  };

  // Inventario Global (Simulación de Base de Datos Completa)
  const globalInventory: ServiceItem[] = [
    { id: 'ext1', sku: 'ACC-COL-01', name: 'Collar Isabelino #4', price: 45.00, category: 'product', selected: false, quantity: 1, stock: 5 },
    { id: 'ext2', sku: 'MED-ANT-02', name: 'Antibiótico Oral (Amoxi)', price: 25.00, category: 'medication', selected: false, quantity: 1, stock: 30 },
    { id: 'ext3', sku: 'ALI-PRE-01', name: 'Lata Hill\'s Prescription a/d', price: 18.00, category: 'product', selected: false, quantity: 1, stock: 10 },
    { id: 'ext4', sku: 'SRV-VET-09', name: 'Corte de Uñas (Sedación)', price: 80.00, category: 'addon', selected: false, quantity: 1, stock: 999 },
    { id: 'ext5', sku: 'ACC-COR-01', name: 'Correa Retráctil', price: 65.00, category: 'product', selected: false, quantity: 1, stock: 2 },
  ];

  // Función para agregar desde el catálogo global
  const addFromCatalog = (item: ServiceItem) => {
    // Verificar si ya existe
    const exists = activeServices.find(s => s.id === item.id);
    if (exists) {
      toast.info(`${item.name} ya está en la lista`);
      return;
    }
    
    // Agregar marcado como seleccionado
    const newItem = { ...item, selected: true };
    setActiveServices([...activeServices, newItem]);
    toast.success(`${item.name} agregado a la cuenta`);
    setIsCatalogOpen(false); // Cerrar modal opcionalmente
  };

  // Filtrado de catálogo global
  const filteredGlobalInventory = globalInventory.filter(item => 
    item.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
    item.sku?.toLowerCase().includes(globalSearch.toLowerCase())
  );
  
  // Datos de Anamnesis (Solo Vet)
  const [anamnesis, setAnamnesis] = useState({
    weight: '',
    temp: '',
    heartRate: '',
    reason: '',
    diagnosis: '',
    notes: ''
  });

  // Datos del Cliente (demo o parada real del día)
  // clientData viene de useState + loadDriverDay

  // Catálogos de Servicios (Simulados - Conectados a Módulo de Inventario)
  const groomingCatalog: ServiceItem[] = [
    { id: 'g1', sku: 'SRV-G01', name: 'Baño Premium', price: 65.00, category: 'base', selected: true, quantity: 1, stock: 999 },
    { id: 'g2', sku: 'SRV-G02', name: 'Corte de Uñas', price: 15.00, category: 'addon', selected: false, quantity: 1, stock: 999 },
    { id: 'g3', sku: 'SRV-G03', name: 'Deslanado', price: 35.00, category: 'addon', selected: false, quantity: 1, stock: 999 },
    { id: 'g5', sku: 'PRD-SH01', name: 'Shampoo Hipoalergénico', price: 10.00, category: 'product', selected: false, quantity: 1, stock: 12 },
    { id: 'g6', sku: 'SRV-G04', name: 'Nudos Extremos', price: 20.00, category: 'addon', selected: false, quantity: 1, stock: 999 },
  ];

  const vetCatalog: ServiceItem[] = [
    { id: 'v1', sku: 'SRV-V01', name: 'Consulta Domiciliaria', price: 80.00, category: 'base', selected: true, quantity: 1, stock: 999 },
    { id: 'v2', sku: 'MED-VAC-08', name: 'Vacuna Óctuple', price: 60.00, category: 'medication', selected: false, quantity: 1, stock: 3 }, // Stock Crítico
    { id: 'v3', sku: 'MED-PAR-01', name: 'Desparasitación Interna', price: 30.00, category: 'medication', selected: false, quantity: 1, stock: 15 },
    { id: 'v4', sku: 'SRV-V02', name: 'Limpieza de Oídos (Otitis)', price: 45.00, category: 'medication', selected: false, quantity: 1, stock: 8 },
    { id: 'v5', sku: 'MED-AI-05', name: 'Inyección Antiinflamatoria', price: 35.00, category: 'medication', selected: false, quantity: 1, stock: 20 },
    { id: 'v8', sku: 'MED-BRA-01', name: 'Bravecto 20-40kg', price: 180.00, category: 'product', selected: false, quantity: 1, stock: 0 }, // Agotado
  ];

  // Catálogo Específico de Exámenes
  const examCatalog: ServiceItem[] = [
    { id: 'ex1', sku: 'LAB-HEM-01', name: 'Hemograma Completo', price: 45.00, category: 'exam', selected: false, quantity: 1, stock: 50, isExam: true },
    { id: 'ex2', sku: 'LAB-BIO-01', name: 'Perfil Bioquímico (6 parám.)', price: 85.00, category: 'exam', selected: false, quantity: 1, stock: 50, isExam: true },
    { id: 'ex3', sku: 'LAB-COP-01', name: 'Coproparasitológico', price: 30.00, category: 'exam', selected: false, quantity: 1, stock: 999, isExam: true },
    { id: 'ex4', sku: 'IMG-ECO-01', name: 'Ecografía Abdominal', price: 120.00, category: 'exam', selected: false, quantity: 1, stock: 999, isExam: true },
    { id: 'ex5', sku: 'TST-PAR-01', name: 'Test Rápido Parvovirus', price: 65.00, category: 'exam', selected: false, quantity: 1, stock: 5, isExam: true },
    { id: 'ex6', sku: 'TST-DIS-01', name: 'Test Rápido Distemper', price: 65.00, category: 'exam', selected: false, quantity: 1, stock: 4, isExam: true },
    { id: 'ex7', sku: 'LAB-DER-01', name: 'Raspado de Piel (Dermatología)', price: 40.00, category: 'exam', selected: false, quantity: 1, stock: 999, isExam: true },
  ];

  const [activeServices, setActiveServices] = useState<ServiceItem[]>(groomingCatalog);

  // Estado para modal de Exámenes
  const [examModalOpen, setExamModalOpen] = useState(false);

  // Agregar examen con configuración
  const handleAddExam = () => {
    if (!selectedExamForConfig) return;

    // Verificar si ya está agregado
    const exists = activeServices.find(s => s.id === selectedExamForConfig.id);
    if (exists) {
       toast.info("Este examen ya fue agregado.");
       setExamModalOpen(false);
       return;
    }

    const newItem: ServiceItem = {
      ...selectedExamForConfig,
      selected: true,
      examConfig: {
        processing: examProcessingType,
        labName: examProcessingType === 'external' ? examLabName : undefined,
        status: examProcessingType === 'internal' ? 'completed' : 'pending'
      }
    };
    
    setActiveServices([...activeServices, newItem]);
    toast.success("Examen agregado correctamente");
    setExamModalOpen(false);
  };

  // Filtrado de productos (Excluyendo exámenes para la lista principal)
  const filteredServices = activeServices.filter(item => {
    if (item.category === 'base' || item.category === 'exam') return false; 
    const searchLower = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(searchLower) || item.sku?.toLowerCase().includes(searchLower);
  });
  
  // Filtrado de exámenes
  const filteredExams = [...examCatalog, ...activeServices.filter(s => s.category === 'exam' && !examCatalog.find(e => e.id === s.id))].filter(item => {
    // Mostrar si está en el catálogo base o si ya fue agregado a activeServices
    return true; 
  });


  const handleExamFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingExamId) {
      // Simular carga
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultUrl = reader.result as string;
        setActiveServices(prev => prev.map(s => 
          s.id === uploadingExamId && s.examConfig 
            ? { ...s, examConfig: { ...s.examConfig, resultFile: resultUrl, status: 'completed' } } 
            : s
        ));
        toast.success("Resultado adjuntado correctamente");
        setUploadingExamId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cambiar catálogo al cambiar tipo de servicio
  const toggleServiceType = (type: ServiceType) => {
    setServiceType(type);
    setActiveServices(type === 'grooming' ? groomingCatalog : vetCatalog);
    toast.info(`Modo cambiado a: ${type === 'grooming' ? 'Estética' : 'Veterinaria'}`);
  };

  const totalAmount = activeServices
    .filter(s => s.selected)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoEvidence(reader.result as string);
        toast.success('📸 Foto guardada');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleServiceItem = (id: string) => {
    setActiveServices(activeServices.map(s => 
      s.id === id ? { ...s, selected: !s.selected } : s
    ));
  };

  // --- RENDERS ---

  // 0. VISOR DE HISTORIAL CLÍNICO (Overlay)
  if (showHistory) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 animate-in slide-in-from-bottom-full duration-300 flex flex-col">
        <div className="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm shrink-0">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Historial Médico
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-slate-100"
            onClick={() => setShowHistory(false)}
          >
            <X className="w-6 h-6 text-slate-500" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <PetMedicalProfile />
        </div>
      </div>
    );
  }

  // 1. RUTA (Común para ambos)
  if (step === 'route') {
    return (
      <div className="flex flex-col h-screen bg-slate-950 text-white relative overflow-hidden">
        {/* Mapa Background */}
        <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
        
        {/* Switch de Modo para Demo */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
           {usingDemoStop ? (
             <Badge className="bg-amber-500/90 text-white border-0 shadow-lg">Demo</Badge>
           ) : (
             <Badge className="bg-emerald-600/90 text-white border-0 shadow-lg">
               {dayStops.length} parada{dayStops.length === 1 ? '' : 's'}
             </Badge>
           )}
           <Button 
            size="sm" 
            variant={serviceType === 'grooming' ? 'default' : 'secondary'}
            className={`shadow-lg border ${serviceType === 'grooming' ? 'bg-purple-600 hover:bg-purple-700 border-purple-500' : 'bg-slate-900/80 border-slate-700 text-slate-400'}`}
            onClick={() => toggleServiceType('grooming')}
          >
            <Scissors className="w-4 h-4 mr-2" />
            Grooming
          </Button>
          <Button 
            size="sm" 
            variant={serviceType === 'vet' ? 'default' : 'secondary'}
            className={`shadow-lg border ${serviceType === 'vet' ? 'bg-blue-600 hover:bg-blue-700 border-blue-500' : 'bg-slate-900/80 border-slate-700 text-slate-400'}`}
            onClick={() => toggleServiceType('vet')}
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Veterinaria
          </Button>
        </div>

        <div className="flex-1 relative z-10 flex flex-col justify-end p-4 pb-8 space-y-4">
          {/* Card Info Cliente */}
          <Card className="bg-slate-900/90 border-slate-700 text-white p-5 backdrop-blur-xl shadow-2xl rounded-2xl">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16 border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <AvatarImage src={clientData.avatar} />
                <AvatarFallback>MG</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold tracking-tight">{clientData.name}</h2>
                <div className="flex items-center text-slate-300 text-sm mt-1">
                  <MapPin className="w-4 h-4 mr-1 text-green-400" />
                  <span className="truncate max-w-[200px]">{clientData.address}</span>
                </div>
              </div>
              <Button size="icon" className="bg-green-600 hover:bg-green-500 rounded-full w-12 h-12 shadow-lg shadow-green-900/50 transition-all hover:scale-105 active:scale-95">
                <Phone className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-slate-800/50 p-3 rounded-xl flex flex-col items-center border border-slate-700/50 backdrop-blur-sm">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">ETA</span>
                <span className="font-bold text-2xl text-white">8 min</span>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl flex flex-col items-center border border-slate-700/50 backdrop-blur-sm">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Servicio</span>
                <span className="font-bold text-xl text-blue-400">
                  {serviceType === 'grooming' ? 'Baño' : 'Consulta'}
                </span>
              </div>
            </div>

            <Button 
              className={`w-full h-14 text-lg font-bold shadow-lg transition-all active:scale-[0.98] rounded-xl ${
                serviceType === 'grooming' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'
              }`} 
              onClick={() => advanceStep('arrived')}
            >
              <Navigation className="w-6 h-6 mr-2" />
              LLEGUÉ AL LUGAR
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // 2. LLEGADA / TRABAJO INICIAL
  if (step === 'arrived') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-white px-4 py-3 shadow-sm border-b sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setStep('route')} className="-ml-2">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Button>
            <div>
               <h1 className="font-bold text-lg leading-tight">
                {serviceType === 'grooming' ? 'Inspección' : 'Ficha Clínica'}
              </h1>
              <p className="text-xs text-slate-500">Paso 1 de 3</p>
            </div>
          </div>
          <Avatar className="w-10 h-10 border border-slate-200">
             <AvatarImage src={clientData.avatar} />
          </Avatar>
        </div>

        <div className="p-4 space-y-6 flex-1 overflow-y-auto pb-32">
          
          {serviceType === 'vet' ? (
            // --- VISTA VETERINARIA (ANAMNESIS) ---
            <div className="space-y-6 animate-in fade-in duration-500">
              
              {/* Card de Mascota minimalista */}
              <div className="flex items-center gap-4 px-2">
                 <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-md">
                      <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-800">{clientData.pet}</h2>
                    <Badge variant="secondary" className="font-medium bg-slate-200 text-slate-600 hover:bg-slate-300">{clientData.breed}</Badge>
                 </div>
              </div>

              {/* Botón Historial Elegante */}
              <div 
                 onClick={() => setShowHistory(true)}
                 className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer border border-slate-300 shadow-sm"
              >
                <FileText className="w-5 h-5" />
                Ver Historial Clínico Completo
              </div>

              {/* Signos Vitales */}
              <Card className="border-0 shadow-sm overflow-hidden rounded-2xl">
                <div className="bg-blue-50/80 border-b border-blue-100 p-3 flex items-center gap-2">
                   <Activity className="w-5 h-5 text-blue-600" />
                   <h3 className="font-bold text-blue-900">Signos Vitales</h3>
                </div>
                <div className="p-5 grid grid-cols-3 gap-4 bg-white">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Peso (kg)</Label>
                    <Input 
                      type="number" 
                      placeholder="0.0" 
                      className="bg-slate-50 border-slate-200 h-12 text-center text-lg font-bold focus:bg-white transition-colors"
                      value={anamnesis.weight}
                      onChange={e => setAnamnesis({...anamnesis, weight: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Temp (°C)</Label>
                    <Input 
                      type="number" 
                      placeholder="38.5" 
                      className="bg-slate-50 border-slate-200 h-12 text-center text-lg font-bold focus:bg-white transition-colors"
                      value={anamnesis.temp}
                      onChange={e => setAnamnesis({...anamnesis, temp: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Frec. Card.</Label>
                    <Input 
                      type="number" 
                      placeholder="LPM" 
                      className="bg-slate-50 border-slate-200 h-12 text-center text-lg font-bold focus:bg-white transition-colors"
                      value={anamnesis.heartRate}
                      onChange={e => setAnamnesis({...anamnesis, heartRate: e.target.value})}
                    />
                  </div>
                </div>
              </Card>

              {/* Inputs de Texto */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2 text-slate-700">
                    <ClipboardList className="w-4 h-4 text-slate-400" />
                    Motivo de Consulta <span className="text-red-500">*</span>
                  </Label>
                  <Textarea 
                    placeholder="Describe el problema principal..." 
                    className="h-24 bg-white border-slate-200 rounded-xl resize-none text-base focus:border-blue-500 transition-colors shadow-sm"
                    value={anamnesis.reason}
                    onChange={e => setAnamnesis({...anamnesis, reason: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2 text-slate-700">
                    <Stethoscope className="w-4 h-4 text-slate-400" />
                    Diagnóstico Presuntivo <span className="text-red-500">*</span>
                  </Label>
                  <Textarea 
                    placeholder="Diagnóstico inicial..." 
                    className="h-24 bg-white border-slate-200 rounded-xl resize-none text-base focus:border-blue-500 transition-colors shadow-sm"
                    value={anamnesis.diagnosis}
                    onChange={e => setAnamnesis({...anamnesis, diagnosis: e.target.value})}
                  />
                </div>
              </div>

              {/* Botón flotante siguiente paso */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                <Button 
                  className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 rounded-xl transition-transform active:scale-[0.99]" 
                  onClick={() => {
                    // Validación Estricta
                    if(!anamnesis.weight || !anamnesis.temp || !anamnesis.reason || !anamnesis.diagnosis) {
                      toast.error("Todos los campos son obligatorios para abrir la historia clínica.");
                      return;
                    }
                    setStep('work');
                  }}
                >
                  Guardar Ficha e Ir a Tratamiento
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            // --- VISTA GROOMING (ADICIONALES) ---
            <div className="space-y-5 animate-in fade-in duration-500">
              <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 shadow-sm">
                <h3 className="font-bold text-purple-900 mb-2">Servicio Base</h3>
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                  <span className="font-bold text-purple-950">Baño Premium (Golden)</span>
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1">Incluido</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 px-1">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Adicionales Detectados
                </h3>
                <div className="space-y-3">
                  {activeServices.filter(s => s.category !== 'base').map(item => (
                    <div 
                      key={item.id}
                      onClick={() => toggleServiceItem(item.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer shadow-sm ${
                        item.selected 
                          ? 'border-purple-600 bg-purple-50' 
                          : 'border-white bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          item.selected ? 'bg-purple-600 border-purple-600' : 'border-slate-300'
                        }`}>
                          {item.selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <span className={`font-semibold text-lg ${item.selected ? 'text-purple-900' : 'text-slate-600'}`}>{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">S/ {item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
                 <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-slate-500 font-medium">Total Estimado</span>
                    <span className="text-2xl font-black text-slate-900">S/ {totalAmount.toFixed(2)}</span>
                 </div>
                <Button 
                  className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200 rounded-xl" 
                  onClick={() => setStep('work')}
                >
                  Iniciar Baño
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. EN PROCESO (TRATAMIENTO O BAÑO)
  if (step === 'work') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header Animado - Ahora con botón Atrás */}
        <div className={`text-white p-6 pt-10 rounded-b-[2rem] shadow-xl relative overflow-hidden transition-colors shrink-0 ${
          serviceType === 'grooming' ? 'bg-purple-900' : 'bg-blue-900'
        }`}>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
               <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10 -ml-2 rounded-full"
                onClick={() => setStep('arrived')}
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="inline-block p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-pulse">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/80 font-medium">En Progreso</span>
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-2">
              {serviceType === 'grooming' ? 'Bañando a Thor...' : 'En Consulta...'}
            </h2>
          </div>
        </div>

        <div className="flex-1 p-4 -mt-4 space-y-4 pb-32 overflow-y-auto">
          
          {serviceType === 'vet' && (
             // VET: TABS PARA PROCEDIMIENTOS Y EXÁMENES
             <Tabs defaultValue="procedures" className="w-full mb-4">
                <TabsList className="grid w-full grid-cols-2 h-12 mb-2 bg-slate-200 p-1 rounded-xl">
                  <TabsTrigger value="procedures" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 font-bold">
                    <Syringe className="w-4 h-4 mr-2" />
                    Farmacia y Proc.
                  </TabsTrigger>
                  <TabsTrigger value="exams" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-700 font-bold">
                    <FlaskConical className="w-4 h-4 mr-2" />
                    Exámenes Lab.
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: PROCEDIMIENTOS */}
                <TabsContent value="procedures" className="mt-0">
                  <Card className="p-0 shadow-lg border-0 overflow-hidden rounded-2xl bg-white">
                    <div className="p-4 bg-slate-900 text-white">
                       <div className="flex items-center gap-2 mb-4">
                         <Syringe className="w-5 h-5 text-blue-400" />
                         <h3 className="font-bold text-lg">Procedimientos y Farmacia</h3>
                       </div>
                       <p className="text-sm text-slate-400 mb-4">Agrega lo que uses durante la consulta.</p>
                       
                       {/* Buscador Integrado */}
                       <div className="relative">
                         <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                         <Input 
                          placeholder="Buscar por nombre o SKU..." 
                          className="pl-10 h-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                       </div>
                    </div>
                    
                    <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                      {filteredServices.map(item => {
                        const isOutOfStock = (item.stock !== undefined && item.stock <= 0);
                        const isLowStock = (item.stock !== undefined && item.stock > 0 && item.stock < 5);

                        return (
                         <div 
                          key={item.id}
                          onClick={() => !isOutOfStock && toggleServiceItem(item.id)}
                          className={`flex justify-between items-center p-4 transition-colors ${
                            item.selected ? 'bg-blue-50' : 'bg-white'
                          } ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-slate-50'}`}
                        >
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg shrink-0 ${item.selected ? 'bg-blue-100' : 'bg-slate-100'}`}>
                               {item.category === 'medication' ? <Pill className={`w-5 h-5 ${item.selected ? 'text-blue-600' : 'text-slate-400'}`} /> : 
                                <Activity className={`w-5 h-5 ${item.selected ? 'text-blue-600' : 'text-slate-400'}`} />}
                             </div>
                             <div className="flex flex-col">
                               <span className={`font-medium text-base ${item.selected ? 'text-blue-900' : 'text-slate-700'}`}>
                                 {item.name}
                               </span>
                               <div className="flex items-center gap-2 text-xs">
                                 {item.sku && <span className="text-slate-400 font-mono">SKU: {item.sku}</span>}
                                 {item.stock !== undefined && item.stock < 900 && (
                                    <span className={`font-bold px-1.5 py-0.5 rounded ${
                                      isOutOfStock ? 'bg-red-100 text-red-600' : 
                                      isLowStock ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                      {isOutOfStock ? 'AGOTADO' : `Stock: ${item.stock}`}
                                    </span>
                                 )}
                               </div>
                             </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-slate-900">S/ {item.price.toFixed(2)}</span>
                            {item.selected ? (
                              <div className="flex items-center gap-1 text-blue-600 font-bold text-xs">
                                 <CheckCircle2 className="w-4 h-4" />
                                 Agregado
                              </div>
                            ) : !isOutOfStock ? (
                              <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-400">
                                 <PlusIcon className="w-5 h-5" />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )})}
                      
                      {filteredServices.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                          <p>No se encontraron productos con "{searchQuery}"</p>
                        </div>
                      )}

                      <div className="p-4 bg-slate-50 border-t border-slate-100">
                         <Dialog open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
                           <DialogTrigger asChild>
                             <Button variant="ghost" className="w-full text-blue-600 font-semibold hover:bg-blue-50 hover:text-blue-700">
                               ¿No encuentras algo? Ver catálogo completo
                             </Button>
                           </DialogTrigger>
                           <DialogContent className="max-w-md h-[80vh] flex flex-col p-0 gap-0">
                             <DialogHeader className="px-4 py-3 border-b">
                               <DialogTitle className="flex items-center gap-2">
                                 <Package className="w-5 h-5 text-blue-600" />
                                 Catálogo Global
                               </DialogTitle>
                             </DialogHeader>
                             
                             <div className="p-4 bg-slate-50 border-b">
                                <div className="relative">
                                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                  <Input 
                                    placeholder="Buscar en almacén central..." 
                                    className="pl-9 bg-white"
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                  />
                                </div>
                             </div>

                             <div className="flex-1 overflow-y-auto p-4 space-y-2">
                               {filteredGlobalInventory.map(item => (
                                 <div key={item.id} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                                   <div>
                                     <p className="font-semibold text-sm text-slate-800">{item.name}</p>
                                     <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                       <span className="font-mono bg-slate-100 px-1 rounded">{item.sku}</span>
                                       <span>Stock: {item.stock}</span>
                                     </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                     <span className="font-bold text-sm">S/ {item.price}</span>
                                     <Button size="sm" className="bg-blue-600 h-8" onClick={() => addFromCatalog(item)}>
                                       Agregar
                                     </Button>
                                   </div>
                                 </div>
                               ))}
                               {filteredGlobalInventory.length === 0 && (
                                 <div className="text-center py-8 text-slate-400">
                                   No se encontraron resultados en el inventario global.
                                 </div>
                               )}
                             </div>
                           </DialogContent>
                         </Dialog>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* TAB 2: EXÁMENES */}
                <TabsContent value="exams" className="mt-0">
                   <Card className="p-0 shadow-lg border-0 overflow-hidden rounded-2xl bg-white">
                      <div className="p-4 bg-indigo-900 text-white">
                         <div className="flex items-center gap-2 mb-4">
                           <Microscope className="w-5 h-5 text-indigo-300" />
                           <h3 className="font-bold text-lg">Exámenes Médicos</h3>
                         </div>
                         <p className="text-sm text-indigo-200 mb-4">Solicita análisis de laboratorio o imágenes.</p>
                      </div>

                      <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
                        {examCatalog.map(item => {
                           const isSelected = activeServices.some(s => s.id === item.id);
                           const addedItem = activeServices.find(s => s.id === item.id);
                           const processing = addedItem?.examConfig?.processing || 'external';
                           
                           return (
                             <div 
                               key={item.id}
                               className={`p-4 transition-colors ${isSelected ? 'bg-indigo-50' : 'bg-white hover:bg-slate-50'}`}
                             >
                               <div className="flex justify-between items-start mb-2">
                                 <div className="flex items-center gap-3">
                                   <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                     <TestTube className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                                   </div>
                                   <div>
                                     <span className={`font-medium text-base block ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                       {item.name}
                                     </span>
                                     <span className="text-xs text-slate-400 font-mono">SKU: {item.sku}</span>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                    <span className="font-bold text-slate-900 block">S/ {item.price.toFixed(2)}</span>
                                    {isSelected ? (
                                       <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                                         Agregado
                                       </Badge>
                                    ) : (
                                       <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700" onClick={() => {
                                          setSelectedExamForConfig(item);
                                          setExamModalOpen(true);
                                       }}>
                                         Solicitar
                                       </Button>
                                    )}
                                 </div>
                               </div>
                               
                               {isSelected && addedItem?.examConfig && (
                                 <div className="mt-3 pl-12 space-y-3">
                                   <div className="flex flex-wrap gap-2 text-xs items-center">
                                      <Badge variant="outline" className={`border ${processing === 'internal' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                                        {processing === 'internal' ? 'Procesamiento Interno' : 'Laboratorio Externo'}
                                      </Badge>
                                      
                                      {processing === 'external' && addedItem.examConfig.labName && (
                                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                                          Destino: {addedItem.examConfig.labName}
                                        </Badge>
                                      )}

                                      <Badge className={addedItem.examConfig.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}>
                                        {addedItem.examConfig.status === 'completed' ? 'Resultados Listos' : 'Pendiente de Resultados'}
                                      </Badge>
                                   </div>

                                   {/* Acciones de Resultado */}
                                   <div className="flex items-center gap-3">
                                     {addedItem.examConfig.resultFile ? (
                                        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg">
                                           <FileCheck className="w-4 h-4 text-green-600" />
                                           <span className="text-xs font-bold text-green-800">Resultado Adjunto</span>
                                           <Button size="sm" variant="ghost" className="h-6 px-2 text-green-700 hover:text-green-900" onClick={() => {
                                              if (addedItem.examConfig?.resultFile) {
                                                setPreviewResult(addedItem.examConfig.resultFile);
                                              }
                                           }}>
                                             Ver
                                           </Button>
                                        </div>
                                     ) : (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="h-8 border-dashed border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
                                          onClick={() => {
                                            setUploadingExamId(item.id);
                                            examFileInputRef.current?.click();
                                          }}
                                        >
                                          <UploadCloud className="w-3 h-3 mr-2" />
                                          {processing === 'internal' ? 'Cargar Resultado' : 'Adjuntar Constancia'}
                                        </Button>
                                     )}

                                     <Button 
                                       variant="ghost" 
                                       size="sm" 
                                       className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 px-2 ml-auto"
                                       onClick={() => {
                                         setActiveServices(activeServices.filter(s => s.id !== item.id));
                                         toast.info("Examen removido");
                                       }}
                                     >
                                       <X className="w-3 h-3 mr-1" /> Quitar
                                     </Button>
                                   </div>
                                 </div>
                               )}
                             </div>
                           );
                        })}
                      </div>
                   </Card>
                </TabsContent>
             </Tabs>
          )}

          {/* EVIDENCIA (Común para ambos) */}
          <Card className="p-5 shadow-lg border-0 rounded-2xl overflow-hidden">
            <h3 className="font-bold mb-4 text-center text-slate-800 flex justify-center items-center gap-2">
              <Camera className="w-5 h-5 text-slate-500" />
              {serviceType === 'grooming' ? 'Foto del Resultado' : 'Foto de Receta / Paciente'}
            </h3>
            
            <div 
              className="aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 relative overflow-hidden group transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoEvidence ? (
                <>
                  <img src={photoEvidence} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <p className="text-white font-bold flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"><Camera className="w-5 h-5" /> Retomar Foto</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Camera className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-slate-700">Toca para abrir cámara</p>
                  <p className="text-xs text-slate-400 mt-1">Evidencia obligatoria</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoCapture} />
              <input type="file" ref={examFileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleExamFileChange} />
            </div>
          </Card>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
          <Button 
            className={`w-full h-14 text-lg font-bold shadow-xl rounded-xl transition-all ${
               !photoEvidence 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : serviceType === 'grooming' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
            }`}
            disabled={!photoEvidence}
            onClick={() => setStep('signature')}
          >
            {photoEvidence ? 'Continuar a Firma' : 'Toma foto para continuar'}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* MODAL CONFIGURACIÓN EXAMEN */}
        <Dialog open={examModalOpen} onOpenChange={setExamModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Solicitud de Examen</DialogTitle>
            <DialogDescription>
              Configura el procesamiento de la muestra
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
             <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3">
               <div className="bg-indigo-200 p-2 rounded-lg text-indigo-700">
                  <TestTube className="w-5 h-5" />
               </div>
               <div>
                  <p className="font-bold text-indigo-900">{selectedExamForConfig?.name}</p>
                  <p className="text-xs text-indigo-600">S/ {selectedExamForConfig?.price.toFixed(2)}</p>
               </div>
             </div>

             <div className="space-y-2">
               <Label>Tipo de Procesamiento</Label>
               <Select 
                 value={examProcessingType} 
                 onValueChange={(v) => setExamProcessingType(v as ExamProcessingType)}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="external">Laboratorio Externo (Muestra)</SelectItem>
                   <SelectItem value="internal">Procesamiento Interno (In-House)</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             {examProcessingType === 'external' && (
               <div className="space-y-2">
                 <Label>Laboratorio de Destino</Label>
                 <Select value={examLabName} onValueChange={setExamLabName}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Lab. Patología Vet">Lab. Patología Vet (Lince)</SelectItem>
                     <SelectItem value="VetLab Perú">VetLab Perú (Surco)</SelectItem>
                     <SelectItem value="Pathovet">Pathovet (Miraflores)</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             )}
          </div>

          <DialogFooter className="flex-col gap-2">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleAddExam}>
              Confirmar Solicitud
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setExamModalOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL PREVIEW RESULTADO */}
      <Dialog open={!!previewResult} onOpenChange={(open) => !open && setPreviewResult(null)}>
         <DialogContent className="max-w-3xl h-[80vh] p-0 flex flex-col bg-slate-900 border-slate-800">
            <DialogTitle className="sr-only">Vista Previa</DialogTitle>
            <DialogDescription className="sr-only">Vista previa del resultado</DialogDescription>
            <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black/90">
               {previewResult && (
                  <img src={previewResult} className="max-w-full max-h-full object-contain" alt="Resultado" />
               )}
               <Button 
                 variant="ghost" 
                 className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 p-0 z-50"
                 onClick={() => setPreviewResult(null)}
               >
                 <X className="w-6 h-6" />
               </Button>
            </div>
         </DialogContent>
      </Dialog>
      </div>
    );
  }

  // 5. FIRMA DE CONFORMIDAD (Nuevo Paso)
  if (step === 'signature') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="bg-white px-4 py-3 shadow-sm border-b sticky top-0 z-20 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep('work')} className="-ml-2">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <h1 className="font-bold text-lg text-slate-800">Conformidad del Cliente</h1>
        </div>

        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          <Card className="p-5 border-0 shadow-sm rounded-xl bg-white space-y-4">
             <div className="space-y-2">
               <Label className="text-slate-500 font-semibold uppercase text-xs">Tipo de Consentimiento</Label>
               <Select value={consentTemplateId} onValueChange={setConsentTemplateId}>
                 <SelectTrigger>
                   <SelectValue placeholder="Seleccionar plantilla" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="generic">Conformidad Estándar (Grooming)</SelectItem>
                   <SelectItem value="vet_procedure">Procedimiento Veterinario</SelectItem>
                   <SelectItem value="anesthesia">Consentimiento Anestesia</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed italic">
                "{getConsentText()}"
             </div>
          </Card>

          <div className="space-y-3">
            <Label className="font-bold text-slate-800 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" />
              Firma Digital del Cliente
            </Label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden relative touch-none">
               <canvas 
                 ref={canvasRef}
                 width={340}
                 height={200}
                 className="w-full h-[200px] cursor-crosshair block"
                 onMouseDown={startDrawing}
                 onMouseMove={draw}
                 onMouseUp={stopDrawing}
                 onMouseLeave={stopDrawing}
                 onTouchStart={startDrawing}
                 onTouchMove={draw}
                 onTouchEnd={stopDrawing}
               />
               {!signature && !isDrawing && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-slate-300 font-medium">Firmar aquí</span>
                 </div>
               )}
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearSignature} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Borrar Firma
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
          <Button 
            className={`w-full h-14 text-lg font-bold shadow-xl rounded-xl transition-all ${
               !signature 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
            }`}
            disabled={!signature}
            onClick={() => {
              toast.success("Consentimiento firmado digitalmente");
              setStep('payment');
            }}
          >
            Confirmar y Pagar
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  // 6. PAGO (Común pero con items diferentes)
  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="p-4 border-b flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setStep('signature')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg">Resumen de Cuenta</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 bg-slate-50 border-b">
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">A Pagar</span>
              <div className="text-5xl font-black text-slate-900 mt-2">S/ {totalAmount.toFixed(2)}</div>
            </div>
            
            <div className="space-y-3 text-sm">
              {activeServices.filter(s => s.selected).map(item => (
                <div key={item.id} className="flex justify-between items-center text-slate-700">
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-slate-400 capitalize">{item.category}</span>
                  </div>
                  <span className="font-bold text-slate-900">S/ {item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-bold mb-4 text-slate-800">Método de Cobro</h3>
            <Tabs defaultValue="yape" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
                <TabsTrigger value="yape" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">QR / Yape</TabsTrigger>
                <TabsTrigger value="card" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Tarjeta</TabsTrigger>
                <TabsTrigger value="cash" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Efectivo</TabsTrigger>
              </TabsList>

              <TabsContent value="yape" className="space-y-4 text-center">
                <div className="bg-white p-6 rounded-xl shadow-sm border inline-block mb-2">
                  <QrCode className="w-40 h-40 text-slate-900" />
                </div>
                <p className="font-medium text-slate-600">Escanea para pagar</p>
                <Button className="w-full h-14 text-lg bg-purple-600 hover:bg-purple-700" onClick={() => advanceStep('completed')}>
                  Pago Confirmado
                </Button>
              </TabsContent>

              <TabsContent value="card" className="space-y-4">
                 <Card className="p-6 bg-blue-50 border-blue-100 flex flex-col items-center text-center">
                    <CreditCard className="w-12 h-12 text-blue-600 mb-2" />
                    <p className="text-blue-900 font-medium">Usa el POS Izipay/Niubiz</p>
                    <p className="text-sm text-blue-700">Monto a cobrar: S/ {totalAmount.toFixed(2)}</p>
                 </Card>
                 <Button className="w-full h-14 text-lg bg-blue-600" onClick={() => advanceStep('completed')}>
                  Pago Aprobado
                </Button>
              </TabsContent>

              <TabsContent value="cash" className="space-y-4">
                <div className="space-y-2">
                   <Label>Recibido</Label>
                   <Input type="number" className="h-12 text-lg" placeholder="0.00" />
                </div>
                <Card className="p-4 bg-green-50 border-green-100 flex justify-between">
                   <span className="text-green-900 font-bold">Vuelto:</span>
                   <span className="text-green-700 font-bold">S/ 0.00</span>
                </Card>
                <Button className="w-full h-14 text-lg bg-green-600" onClick={() => advanceStep('completed')}>
                  Efectivo Recibido
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  // 7. COMPLETADO
  if (step === 'completed') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-lg shadow-green-500/50">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">¡Servicio Finalizado!</h1>
        <p className="text-slate-400 mb-8 max-w-xs mx-auto">
          {serviceType === 'grooming' 
            ? 'La mascota ha quedado limpia y el pago registrado.'
            : 'La historia clínica ha sido actualizada y la receta enviada.'}
          <br/>
          <span className="text-xs text-green-400 mt-2 block">Consentimiento de cliente enviado por correo.</span>
        </p>

        <Card className="w-full bg-slate-800 border-slate-700 p-6 mb-6 text-left">
           <h3 className="text-sm text-slate-400 mb-4 uppercase tracking-wider">Resumen</h3>
           <div className="space-y-2">
             <div className="flex justify-between">
               <span>Cliente</span>
               <span className="font-bold">{clientData.name}</span>
             </div>
             <div className="flex justify-between">
               <span>Monto</span>
               <span className="font-bold text-green-400">S/ {totalAmount.toFixed(2)}</span>
             </div>
             <div className="flex justify-between">
               <span>Tipo</span>
               <Badge variant="outline" className="text-white border-slate-600 capitalize">{serviceType}</Badge>
             </div>
           </div>
        </Card>
        
        <div className="w-full space-y-3">
          <Button 
            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20"
            onClick={() => setIsRescheduleOpen(true)}
          >
            <CalendarCheck className="mr-2 h-5 w-5" />
            Agendar Refuerzo (15 días)
          </Button>

          <Button 
            className="w-full h-14 bg-white text-slate-900 font-bold hover:bg-slate-200 rounded-xl"
            onClick={() => {
              setStep('route');
              setAnamnesis({ weight: '', temp: '', heartRate: '', reason: '', diagnosis: '', notes: '' });
              setPhotoEvidence(null);
              setSignature(null);
              // Reset services default
              setActiveServices(serviceType === 'grooming' ? groomingCatalog : vetCatalog);
            }}
          >
            <Navigation className="mr-2 h-5 w-5" />
            Volver a Ruta
          </Button>
        </div>

        {/* MODAL DE REAGENDAMIENTO */}
        <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
          <DialogContent className="max-w-xs rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-center">Próxima Cita</DialogTitle>
              <DialogDescription className="text-center">
                Confirma la fecha para el refuerzo
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Fecha Sugerida</Label>
                 <div className="relative">
                   <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                   <Input 
                     type="date" 
                     className="pl-10"
                     value={nextDate}
                     onChange={(e) => setNextDate(e.target.value)}
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <Label>Hora Preferida</Label>
                 <Input 
                   type="time" 
                   value={nextTime}
                   onChange={(e) => setNextTime(e.target.value)}
                 />
               </div>
            </div>

            <DialogFooter className="flex-col gap-2">
              <Button className="w-full bg-blue-600" onClick={handleConfirmReschedule}>
                Confirmar Cita
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setIsRescheduleOpen(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
}

function PlusButton() {
  return (
    <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-400">
      <PlusIcon className="w-4 h-4" />
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
