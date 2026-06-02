import { useEffect, useMemo, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { NewMedicalAttentionDialog } from './pets/NewMedicalAttentionDialog';
import { PreventiveHealthDialog } from './pets/PreventiveHealthDialog';
import { PreventiveHealthSection } from './pets/PreventiveHealthSection';
import {
  buildPreventiveEvents,
  type PreventiveCategory,
  type PreventiveEvent,
} from './pets/preventiveHealthUtils';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Edit, 
  ShoppingCart,
  Shield,
  Bug,
  Syringe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Package,
  Bell,
  FileText,
  Star,
  Activity,
  ArrowLeft,
  History,
  TrendingUp,
  Download,
  DollarSign,
  Leaf,
  Stethoscope,
  Printer,
  Thermometer,
  Pill,
  Image as ImageIcon,
  StickyNote,
  User
} from 'lucide-react';
import { formatDate, calculatePetAge } from '../utils/helpers';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { apiClient } from '../utils/api/client';
import { setPendingAction } from '../utils/navigationBridge';

interface PetProfileProps {
  petId: number | string;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
  initialTab?: string;
  openNewAttention?: boolean;
}

export function PetProfile({ petId, onClose, onNavigate, initialTab, openNewAttention }: PetProfileProps) {
  const [activeTab, setActiveTab] = useState(initialTab || 'medical');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [medicalSubTab, setMedicalSubTab] = useState('timeline');
  const [activityLevel, setActivityLevel] = useState<'Bajo' | 'Moderado' | 'Alto'>('Moderado');
  const [selectedNutritionProductId, setSelectedNutritionProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [petData, setPetData] = useState<any>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [showAttentionDialog, setShowAttentionDialog] = useState(!!openNewAttention);
  const [preventiveDialog, setPreventiveDialog] = useState<PreventiveCategory | null>(null);

  const reloadPetData = async () => {
    const [petResponse, timelineResponse] = await Promise.all([
      apiClient.get<any>(`/pets/${petId}`),
      apiClient.get<any>(`/pets/${petId}/timeline`),
    ]);
    const p = petResponse?.data || petResponse;
    const timeline = timelineResponse?.data?.timeline || [];
    setPetData(p);
    setTimelineData(Array.isArray(timeline) ? timeline : []);
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        await reloadPetData();
      } catch (e: any) {
        if (mounted) toast.error(e?.message || 'No se pudo cargar el perfil de mascota');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [petId]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (openNewAttention) {
      setActiveTab('medical');
      setMedicalSubTab('timeline');
      setShowAttentionDialog(true);
    }
  }, [openNewAttention]);

  const pet = useMemo(() => {
    const owner = petData?.client || petData?.owners?.[0] || {};
    const photoPath = petData?.photo || petData?.photos?.[0]?.url || petData?.photos?.[0]?.path;
    const photo = photoPath
      ? (String(photoPath).startsWith('http') ? photoPath : `${import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://127.0.0.1:8000'}/storage/${String(photoPath).replace(/^\/+/, '')}`)
      : 'https://via.placeholder.com/150/e2e8f0/64748b?text=PET';
    return {
      id: petData?.id ?? petId,
      clientId: petData?.client_id || owner?.id || petData?.owners?.[0]?.id,
      companyId: petData?.company_id || owner?.company_id,
      rawWeight: petData?.weight,
      name: petData?.name || 'Mascota',
      lastName: petData?.last_name || '',
      species: petData?.species || '—',
      breed: petData?.breed || '—',
      birthDate: petData?.birth_date || '',
      weight: petData?.weight ? `${petData.weight} kg` : '—',
      color: petData?.color || '—',
      gender: petData?.gender || '—',
      microchip: petData?.microchip || '—',
      photo,
      notes: petData?.notes || 'Sin notas registradas.',
      owner: {
        name: owner?.razon_social || 'Sin tutor',
        phone: owner?.telefono || owner?.telefono1 || '—',
        email: owner?.email || '—',
        address: [owner?.direccion, owner?.distrito].filter(Boolean).join(' - ') || '—',
        district: owner?.distrito || '—',
        documentNumber: owner?.numero_documento || '—',
        registrationDate: owner?.fecha_registro || owner?.created_at || null,
      },
      petsCount: (petData?.client?.pets_count ?? petData?.owners?.[0]?.pets_count ?? null),
    };
  }, [petData, petId]);

  // Historial Clínico Unificado (fallback mock)
  const clinicalHistoryFallback = [
    {
      id: 'REC-101',
      type: 'consultation',
      title: 'Consulta Médica',
      date: '2024-01-08',
      doctor: 'Dr. Alejandro Vet',
      reason: 'Decaimiento y falta de apetito',
      diagnosis: 'Gastroenteritis leve por ingesta indebida',
      vitals: {
        weight: '32.5kg',
        temp: '39.1°C',
        pulse: '110'
      },
      treatment: [
        'Inyección Antiinflamatoria',
        'Protector Gástrico Oral',
        'Dieta blanda x 3 días'
      ],
      observations: 'Se recomienda observación 24h. Si vomita nuevamente, acudir a clínica.',
      evidence: ['https://images.unsplash.com/photo-1576201836163-4975841e058e?w=100&h=100&fit=crop'],
      status: 'completed'
    },
    {
      id: 'REC-089',
      type: 'vaccine',
      title: 'Vacunación',
      date: '2023-11-15',
      doctor: 'Dra. Sofia Tech',
      reason: 'Vacunación anual programada',
      diagnosis: 'Paciente sano, apto para vacunación',
      vitals: {
        weight: '32.0kg',
        temp: '38.5°C',
        pulse: '98'
      },
      treatment: [
        'Vacuna Quintuple (DHPPL)',
        'Vacuna Rabia'
      ],
      observations: 'No bañar por 3 días. Puede presentar fiebre leve.',
      evidence: [],
      status: 'completed'
    }
  ];

  const preventiveHistoryFallback: PreventiveEvent[] = [
    {
      id: 1,
      name: 'Vacuna Quintuple (1ra Dosis)',
      date: '2020-05-15',
      status: 'applied',
      type: 'vaccine',
      nextDue: '2020-06-15',
      vet: 'Dr. Alejandro Vet',
    },
    {
      id: 2,
      name: 'Vacuna Quintuple (2da Dosis)',
      date: '2020-06-15',
      status: 'applied',
      type: 'vaccine',
      nextDue: '2020-07-15',
      vet: 'Dr. Alejandro Vet',
    },
    {
      id: 3,
      name: 'Vacuna Quintuple (3ra Dosis)',
      date: '2020-07-15',
      status: 'applied',
      type: 'vaccine',
      nextDue: '2021-07-15',
      vet: 'Dr. Alejandro Vet',
    },
    {
      id: 4,
      name: 'Vacuna Rabia',
      date: '2020-08-15',
      status: 'applied',
      type: 'vaccine',
      nextDue: '2021-08-15',
      vet: 'Dr. Alejandro Vet',
    },
    {
      id: 5,
      name: 'Vacuna Quintuple (Anual)',
      date: '2023-11-15',
      status: 'applied',
      type: 'vaccine',
      nextDue: '2024-11-15',
      vet: 'Dra. Sofia Tech',
    },
    {
      id: 6,
      name: 'Desparasitación Interna',
      date: '2024-01-10',
      status: 'applied',
      type: 'deworming',
      nextDue: '2024-04-10',
      vet: 'Dra. Sofia Tech',
    },
    {
      id: 7,
      name: 'Vacuna Quintuple (Anual)',
      date: '2024-11-15',
      status: 'upcoming',
      type: 'vaccine',
      nextDue: null,
      vet: 'Pendiente',
    },
  ];

  // Productos recomendados/utilizados
  const productHistory = [
    {
      id: 1,
      name: 'Royal Canin Adult Large Breed',
      category: 'Alimento',
      lastPurchase: '2024-01-10',
      nextPurchase: '2024-02-10',
      quantity: '15kg',
      price: 62.99,
      status: 'due'
    },
    {
      id: 2,
      name: 'Shampoo Hidratante',
      category: 'Cuidado',
      lastPurchase: '2024-01-05',
      nextPurchase: '2024-04-05',
      quantity: '500ml',
      price: 18.50,
      status: 'ok'
    },
    {
      id: 3,
      name: 'Vitaminas MultiVet',
      category: 'Suplementos',
      lastPurchase: '2023-12-15',
      nextPurchase: '2024-03-15',
      quantity: '100 tabs',
      price: 29.99,
      status: 'upcoming'
    }
  ];

  const parseKgFromQuantity = (value: string): number => {
    const normalized = String(value || '').toLowerCase().replace(',', '.');
    const parsed = parseFloat(normalized);
    if (Number.isNaN(parsed) || parsed <= 0) return 0;
    if (normalized.includes('kg')) return parsed;
    if (normalized.includes('g')) return parsed / 1000;
    return parsed;
  };

  // Historial de servicios
  const serviceHistory = [
    {
      id: 1,
      service: 'Baño Completo + Corte',
      date: '2024-01-15',
      groomer: 'Ana Ruiz',
      cost: 65.00,
      notes: 'Excelente comportamiento',
      efficiency: 95,
      timeSaved: 10,
      fuelSaved: 1.2
    },
    {
      id: 2,
      service: 'Baño Express',
      date: '2023-12-20',
      groomer: 'Juan López',
      cost: 35.00,
      notes: 'Necesita corte de uñas próxima vez',
      efficiency: 88,
      timeSaved: 5,
      fuelSaved: 0.8
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'due': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'upcoming': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccine': return <Syringe className="h-4 w-4 text-blue-500" />;
      case 'deworming': return <Shield className="h-4 w-4 text-green-500" />;
      case 'flea': return <Bug className="h-4 w-4 text-orange-500" />;
      case 'consultation': return <Stethoscope className="h-4 w-4 text-purple-500" />;
      default: return <Heart className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completado</Badge>;
      case 'due':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Vencido</Badge>;
      case 'upcoming':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Próximo</Badge>;
      case 'ok':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Al día</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  // Handlers para botones
  const clinicalHistory = useMemo(() => {
    const records = timelineData.filter((e: any) => e.type === 'medical_record' || e.type === 'appointment');
    if (!records.length) return [];
    return records.map((event: any) => {
      const vitals = event.vital_signs || {};
      const treatmentLines = event.treatment
        ? String(event.treatment).split('\n').filter(Boolean)
        : [];
      return {
        id: `EV-${event.id}`,
        type: event.type === 'vaccine' ? 'vaccine' : 'consultation',
        title: event.title || event.event_type || 'Atención',
        date: event.occurred_at || new Date().toISOString().slice(0, 10),
        doctor: 'Equipo móvil',
        reason: event.description?.split('\n\n')[0]?.replace(/^Motivo:\s*/i, '') || event.title || 'Consulta',
        diagnosis: event.diagnosis || event.description || '—',
        vitals: {
          weight: event.weight != null ? `${event.weight} kg` : (pet.weight !== '—' ? pet.weight : '—'),
          temp: event.temperature != null ? `${event.temperature} °C` : '—',
          pulse: vitals.pulse || '—',
        },
        treatment: treatmentLines.length ? treatmentLines : ['Sin tratamiento registrado'],
        observations: event.notes || event.description || 'Sin observaciones',
        evidence: event.attachments || [],
        status: 'completed',
      };
    });
  }, [timelineData, pet.weight]);

  const preventiveEvents = useMemo(
    () =>
      buildPreventiveEvents({
        timeline: timelineData,
        petData,
        fallback: preventiveHistoryFallback,
      }),
    [timelineData, petData]
  );

  const activeNutritionProduct = useMemo(() => {
    if (!productHistory.length) return null;
    if (selectedNutritionProductId) {
      return productHistory.find((p) => p.id === selectedNutritionProductId) || productHistory[0];
    }
    return productHistory[0];
  }, [productHistory, selectedNutritionProductId]);

  const nutritionEstimate = useMemo(() => {
    const weightValue = Number(String(pet.weight || '').replace(',', '.').replace(/[^\d.]/g, '')) || 0;
    const ageYears = pet.birthDate ? Math.max(0, (Date.now() - new Date(pet.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;
    const breedNormalized = String(pet.breed || '').toLowerCase();
    const quantityKg = activeNutritionProduct ? parseKgFromQuantity(activeNutritionProduct.quantity) : 0;

    const breedFactor =
      breedNormalized.includes('golden') ? 1.2 :
      breedNormalized.includes('labrador') ? 1.18 :
      breedNormalized.includes('pastor') ? 1.16 :
      breedNormalized.includes('bulldog') ? 1.08 : 1.1;

    const ageFactor = ageYears < 1 ? 1.25 : ageYears > 8 ? 0.9 : 1.05;
    const activityFactor = activityLevel === 'Bajo' ? 0.95 : activityLevel === 'Alto' ? 1.2 : 1.1;
    const baseFactor = 10; // conversión aproximada a gramos/día

    const gramsPerDay = Math.round(weightValue * baseFactor * breedFactor * ageFactor * activityFactor);
    const purchaseDays = gramsPerDay > 0 && quantityKg > 0
      ? Math.max(1, Math.round((quantityKg * 1000) / gramsPerDay))
      : 0;

    const lastPurchaseDate = activeNutritionProduct?.lastPurchase ? new Date(activeNutritionProduct.lastPurchase) : null;
    const estimatedNextPurchase = (lastPurchaseDate && purchaseDays > 0)
      ? new Date(lastPurchaseDate.getTime() + purchaseDays * 24 * 60 * 60 * 1000)
      : null;
    const daysRemaining = estimatedNextPurchase
      ? Math.ceil((estimatedNextPurchase.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : null;

    return {
      weightValue,
      ageLabel: ageYears > 0 ? `${Math.floor(ageYears)} año${Math.floor(ageYears) === 1 ? '' : 's'}` : 'N/D',
      breedFactor,
      ageFactor,
      activityFactor,
      gramsPerDay,
      purchaseDays,
      estimatedNextPurchase,
      daysRemaining,
    };
  }, [pet.weight, pet.birthDate, pet.breed, activeNutritionProduct, activityLevel]);

  useEffect(() => {
    if (!activeNutritionProduct || nutritionEstimate.daysRemaining === null) return;
    if (nutritionEstimate.daysRemaining < 0 || nutritionEstimate.daysRemaining > 5) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `nutrition-notified-${pet.id}-${activeNutritionProduct.id}-${todayKey}`;
    if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) return;

    const message = `${pet.name}: reposición de ${activeNutritionProduct.name} en ${nutritionEstimate.daysRemaining} día(s).`;
    toast.warning(message);

    if (typeof window !== 'undefined' && 'Notification' in window) {
      const notify = () => new Notification('Recordatorio de Nutrición', { body: message });
      if (Notification.permission === 'granted') notify();
      else if (Notification.permission === 'default') Notification.requestPermission().then((p) => {
        if (p === 'granted') notify();
      });
    }

    if (typeof window !== 'undefined') localStorage.setItem(storageKey, '1');
  }, [nutritionEstimate.daysRemaining, activeNutritionProduct, pet.id, pet.name]);

  const openModule = (tab: string, action: string) => {
    setPendingAction(tab, action, {
      petId: String(pet.id),
      petName: `${pet.name} ${pet.lastName || ''}`.trim(),
      clientName: pet.owner.name,
      clientDocument: pet.owner.documentNumber,
    });
    onNavigate?.(tab);
  };

  const handleNewPurchase = () => {
    openModule('products', 'new_purchase_for_pet');
    toast.success('Abriendo Productos con mascota preseleccionada');
  };

  const handleNewAppointment = () => {
    openModule('appointments', 'new_appointment_with_pet');
    toast.success('Abriendo Citas con tutor/mascota preseleccionados');
  };

  const handleNewTreatment = () => {
    if (!pet.clientId) {
      toast.error('No se encontró el tutor asociado a esta mascota');
      return;
    }
    setShowAttentionDialog(true);
  };

  const handleDownloadHistory = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando perfil de mascota...</div>;
  }

  return (
    <div className="bg-background min-h-screen p-6 animate-fade-in">
      {/* Header de Navegación */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onClose} className="hover:bg-muted">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Perfil de Mascota
          </h1>
          <p className="text-muted-foreground">Gestión integral del paciente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar / Info Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-purple-500 opacity-10" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
                <img 
                  src={pet.photo} 
                  alt={pet.name}
                  className="w-full h-full rounded-full object-cover border-4 border-background"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150/e2e8f0/64748b?text=PET';
                  }}
                />
              </div>
              <h2 className="text-2xl font-bold">{pet.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-sm">
                  {pet.species}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {pet.breed}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">{calculatePetAge(pet.birthDate)}</p>
            
              {/* General Info Blocks (Moved from Tab) */}
              <div className="w-full mt-6 space-y-3 text-left">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground ml-1">Notas</span>
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-900 dark:text-yellow-100 shadow-sm">
                    {pet.notes}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-sm text-green-800 dark:text-green-200">Salud General</span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 leading-snug">
                      Mascota saludable, peso ideal.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-sm text-blue-800 dark:text-blue-200">Cliente Oro</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-snug">
                      Asiste regularmente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-6 text-left">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Peso</p>
                  <p className="font-semibold">{pet.weight}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Sexo</p>
                  <p className="font-semibold">{pet.gender}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Color</p>
                  <p className="font-semibold">{pet.color}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Microchip</p>
                  <p className="font-mono text-xs font-semibold truncate" title={pet.microchip}>{pet.microchip}</p>
                </div>
              </div>

              <div className="w-full mt-6 space-y-2">
                <Button className="w-full" onClick={handleNewAppointment}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Nueva Cita
                </Button>
                <Button variant="outline" className="w-full" onClick={handleNewPurchase}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Nueva Compra
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-[#0f172a] border border-slate-800 text-slate-200 overflow-hidden shadow-xl relative">
            {/* Glow Effect Left */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] z-10"></div>

            <div className="p-6 pl-8 relative z-0">
               <div className="flex justify-between items-start">
                  {/* Left Column: Avatar & Info */}
                  <div className="flex gap-5">
                     {/* Avatar */}
                     <div className="shrink-0">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                           <User className="h-8 w-8" />
                        </div>
                     </div>

                     <div className="space-y-5">
                        {/* Header Info */}
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <h2 className="text-xl font-bold text-white tracking-tight uppercase">{pet.owner.name}</h2>
                              <Badge variant="outline" className="border-slate-600 text-slate-400 h-5 text-[10px] px-2 font-normal rounded-md">Normal</Badge>
                              <Badge className="bg-green-900/30 text-green-400 border border-green-900/50 h-5 text-[10px] px-2 font-normal rounded-md">Activo</Badge>
                           </div>
                           <p className="text-xs text-slate-500 font-medium">Registro cliente: {pet.owner.registrationDate ? formatDate(pet.owner.registrationDate) : '—'}</p>
                        </div>

                        {/* Data Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                           <div className="flex items-center gap-2 text-slate-400">
                              <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                              <span className="font-medium">DNI: {pet.owner.documentNumber}</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-400">
                              <Phone className="h-4 w-4 text-green-500 shrink-0" />
                              <span className="font-medium">{pet.owner.phone}</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-400">
                              <Mail className="h-4 w-4 text-purple-500 shrink-0" />
                              <span className="uppercase font-medium">{pet.owner.email}</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-400">
                              <Bug className="h-4 w-4 text-pink-500 shrink-0" />
                              <span className="font-medium">{pet.petsCount ?? 1} mascota(s)</span>
                           </div>
                           <div className="flex items-center gap-2 text-slate-400 col-span-1 md:col-span-2">
                              <MapPin className="h-4 w-4 text-red-500 shrink-0" />
                              <span className="font-medium">{pet.owner.district}</span>
                           </div>
                        </div>

                        {/* Pets Row */}
                        <div className="flex items-center gap-3 pt-1">
                           <Button 
                              variant="outline" 
                              className="bg-transparent border-pink-600 text-pink-500 hover:bg-pink-600/10 hover:text-pink-400 h-8 text-xs font-bold uppercase tracking-wide px-4 rounded-md transition-colors"
                           >
                              <Heart className="h-3.5 w-3.5 mr-2 fill-current" />
                              {pet.name}
                           </Button>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
              <TabsTrigger value="medical">Clínica</TabsTrigger>
              <TabsTrigger value="grooming">Baños</TabsTrigger>
              <TabsTrigger value="products">Nutrición</TabsTrigger>
            </TabsList>

            <TabsContent value="medical" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Historial Clínico Unificado
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadHistory}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button size="sm" onClick={handleNewTreatment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Atención
                  </Button>
                </div>
              </div>

              {/* Tabs Internos de Clínica */}
              <div className="w-full">
                <div className="flex rounded-lg bg-slate-900 p-1 mb-6 w-full md:w-fit overflow-x-auto">
                  <button
                    onClick={() => setMedicalSubTab('timeline')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                      medicalSubTab === 'timeline'
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Historia Médica
                  </button>
                  <button
                    onClick={() => setMedicalSubTab('vaccines')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                      medicalSubTab === 'vaccines'
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Salud Preventiva
                  </button>
                  <button
                    onClick={() => setMedicalSubTab('stats')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                      medicalSubTab === 'stats'
                        ? 'bg-slate-700 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Estadísticas
                  </button>
                </div>

                {medicalSubTab === 'timeline' && (
                  <div className="space-y-8">
                    {clinicalHistory.length === 0 && (
                      <Card className="p-8 text-center border-dashed">
                        <Stethoscope className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground text-sm mb-4">Sin atenciones clínicas registradas.</p>
                        <Button size="sm" onClick={handleNewTreatment}>
                          <Plus className="h-4 w-4 mr-2" />
                          Registrar primera atención
                        </Button>
                      </Card>
                    )}
                    {clinicalHistory.map((record) => (
                      <div key={record.id} className="relative pl-8 before:absolute before:left-3 before:top-8 before:bottom-[-32px] before:w-[2px] before:bg-slate-200 last:before:hidden">
                        {/* Timeline Icon */}
                        <div className="absolute left-0 top-0 h-8 w-8 rounded-full bg-white border-2 border-primary flex items-center justify-center z-10 shadow-sm">
                          {getTypeIcon(record.type)}
                        </div>

                        <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200">
                          {/* Header de Tarjeta */}
                          <div className="p-4 bg-white border-b flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-blue-50 text-blue-600`}>
                                {getTypeIcon(record.type)}
                              </div>
                              <div>
                                <h4 className="font-bold text-lg text-slate-900">{record.title}</h4>
                                <p className="text-sm text-slate-500">
                                  {formatDate(record.date)} • Atendido por <span className="font-medium text-slate-700">{record.doctor}</span>
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-slate-500 bg-slate-50">
                              ID: {record.id}
                            </Badge>
                          </div>

                          {/* Cuerpo de Tarjeta (Estilo Oscuro) */}
                          <div className="p-6 bg-[#1e1b4b] text-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {/* Columna Izquierda */}
                              <div className="space-y-6">
                                <div>
                                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 block">
                                    Motivo de Consulta
                                  </label>
                                  <div className="bg-white text-slate-900 p-3 rounded-md font-medium shadow-sm">
                                    {record.reason}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 block">
                                    Diagnóstico
                                  </label>
                                  <p className="text-indigo-200 text-lg leading-relaxed font-light">
                                    {record.diagnosis}
                                  </p>
                                </div>

                                {/* Signos Vitales */}
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="bg-white/10 rounded-lg p-3 text-center border border-white/10">
                                    <div className="flex justify-center mb-1"><Activity className="h-4 w-4 text-indigo-300" /></div>
                                    <div className="text-xs text-indigo-300 mb-1">Peso</div>
                                    <div className="font-bold text-lg">{record.vitals.weight}</div>
                                  </div>
                                  <div className="bg-white/10 rounded-lg p-3 text-center border border-white/10">
                                    <div className="flex justify-center mb-1"><Thermometer className="h-4 w-4 text-red-300" /></div>
                                    <div className="text-xs text-red-300 mb-1">Temp</div>
                                    <div className="font-bold text-lg">{record.vitals.temp}</div>
                                  </div>
                                  <div className="bg-white/10 rounded-lg p-3 text-center border border-white/10">
                                    <div className="flex justify-center mb-1"><Heart className="h-4 w-4 text-pink-300" /></div>
                                    <div className="text-xs text-pink-300 mb-1">Pulso</div>
                                    <div className="font-bold text-lg">{record.vitals.pulse}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Columna Derecha */}
                              <div className="space-y-6">
                                <div>
                                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 block">
                                    Tratamiento & Farmacia
                                  </label>
                                  <ul className="space-y-2">
                                    {record.treatment.map((item, idx) => (
                                      <li key={idx} className="flex items-center gap-3 text-indigo-100">
                                        <Pill className="h-4 w-4 text-indigo-400 shrink-0" />
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 block flex items-center gap-2">
                                    <StickyNote className="h-3 w-3" /> Observaciones
                                  </label>
                                  <div className="bg-yellow-50 text-yellow-900 p-4 rounded-md text-sm border-l-4 border-yellow-400 italic">
                                    "{record.observations}"
                                  </div>
                                </div>

                                {record.evidence.length > 0 && (
                                  <div>
                                    <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 block">
                                      Evidencia
                                    </label>
                                    <div className="flex gap-2">
                                      {record.evidence.map((img, idx) => (
                                        <div key={idx} className="h-16 w-16 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden cursor-pointer hover:ring-2 ring-indigo-500 transition-all">
                                          <img src={img} alt="Evidencia" className="h-full w-full object-cover" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}

                {medicalSubTab === 'vaccines' && (
                  <PreventiveHealthSection
                    petName={pet.name}
                    birthDate={pet.birthDate}
                    events={preventiveEvents}
                    onRegister={(category) => setPreventiveDialog(category)}
                  />
                )}

                {medicalSubTab === 'stats' && (
                  <Card className="p-8 text-center bg-muted/30 border-dashed">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Gráficos de Evolución</h3>
                    <p className="text-muted-foreground">
                      Visualiza el historial de peso, temperatura y frecuencia cardíaca.
                    </p>
                    <Button className="mt-4" variant="outline">
                      Generar Gráfico
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">

              <Card className="p-5 bg-[#0b122f] border border-slate-800 text-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Bell className="h-5 w-5 text-cyan-400" />
                      Cálculo Automático de Consumo
                    </h3>
                    <p className="text-xs text-slate-400">Basado en peso, edad, raza, producto y nivel de actividad</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400">Parámetros de cálculo</p>
                    <div className="rounded-md bg-slate-900/70 border border-slate-800 p-3 text-sm flex justify-between">
                      <span className="text-slate-300">Peso actual</span>
                      <span className="font-semibold">{pet.weight}</span>
                    </div>
                    <div className="rounded-md bg-slate-900/70 border border-slate-800 p-3 text-sm flex justify-between">
                      <span className="text-slate-300">Edad</span>
                      <span className="font-semibold">{nutritionEstimate.ageLabel}</span>
                    </div>
                    <div className="rounded-md bg-slate-900/70 border border-slate-800 p-3 text-sm flex justify-between">
                      <span className="text-slate-300">Raza</span>
                      <span className="font-semibold">{pet.breed}</span>
                    </div>
                    <div className="rounded-md bg-slate-900/70 border border-slate-800 p-3 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Nivel de actividad</span>
                        <Badge className="bg-green-900/40 text-green-300 border border-green-700">{activityLevel}</Badge>
                      </div>
                      <div className="flex gap-2">
                        {(['Bajo', 'Moderado', 'Alto'] as const).map((level) => (
                          <Button
                            key={level}
                            type="button"
                            variant={activityLevel === level ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActivityLevel(level)}
                            className="h-7 text-xs"
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-md bg-slate-900/70 border border-slate-800 p-3 text-sm space-y-2">
                      <span className="text-slate-300 block">Producto base</span>
                      <Select
                        value={String(selectedNutritionProductId || activeNutritionProduct?.id || '')}
                        onValueChange={(v) => setSelectedNutritionProductId(parseInt(v))}
                      >
                        <SelectTrigger className="bg-slate-950 border-slate-700">
                          <SelectValue placeholder="Selecciona producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {productHistory.map((product) => (
                            <SelectItem key={product.id} value={String(product.id)}>
                              {product.name} ({product.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-400">Fórmula aplicada</p>
                    <div className="rounded-md bg-cyan-950/40 border border-cyan-800 p-3 text-sm space-y-1">
                      <p className="text-cyan-300 font-mono">Consumo = (Peso x 10 x Factor Raza x Factor Edad) x Actividad</p>
                      <p className="text-slate-300 font-mono">
                        ({nutritionEstimate.weightValue.toFixed(1)} x 10 x {nutritionEstimate.breedFactor.toFixed(2)} x {nutritionEstimate.ageFactor.toFixed(2)}) x {nutritionEstimate.activityFactor.toFixed(2)}
                      </p>
                      <p className="font-bold text-white">≈ {nutritionEstimate.gramsPerDay} gr/día</p>
                    </div>
                    <div className="rounded-md bg-emerald-950/30 border border-emerald-800 p-3 text-sm">
                      <p className="font-semibold text-emerald-300">Próxima compra estimada</p>
                      <p className="text-slate-200 mt-1">
                        {nutritionEstimate.estimatedNextPurchase
                          ? `${formatDate(nutritionEstimate.estimatedNextPurchase.toISOString().slice(0, 10))} (cada ${nutritionEstimate.purchaseDays} días)`
                          : 'Sin datos suficientes para estimar'}
                      </p>
                      {nutritionEstimate.daysRemaining !== null && (
                        <p className={`mt-1 text-xs ${nutritionEstimate.daysRemaining <= 5 ? 'text-amber-300' : 'text-slate-300'}`}>
                          {nutritionEstimate.daysRemaining <= 5
                            ? `⚠ Compra próxima en ${nutritionEstimate.daysRemaining} día(s). Se activó notificación.`
                            : `Faltan ${nutritionEstimate.daysRemaining} día(s) para reposición.`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Productos Recurrentes de Nutrición</h3>
                <Button size="sm" onClick={handleNewPurchase}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Comprar
                </Button>
              </div>

              <div className="space-y-4">
                {productHistory.map((product) => (
                  <Card key={product.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-muted rounded-full">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{product.name}</h4>
                            {getStatusBadge(product.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {product.category} • {product.quantity}
                          </p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Última: {formatDate(product.lastPurchase)}</span>
                            <span>Siguiente: {formatDate(product.nextPurchase)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{product.price.toFixed(2)} S/</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={handleNewPurchase}>
                          Repetir
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="grooming" className="space-y-6">
              {/* Estilo inspirado en OptimizationHistory del App de Chofer */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Historial de Baños y Peluquería
                  </h3>
                  <p className="text-sm text-muted-foreground">Registro completo de servicios de estética</p>
                </div>
                <Button variant="outline" onClick={handleDownloadHistory}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Reporte
                </Button>
              </div>

              {/* Filtros de Año */}
              <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg">
                <span className="text-sm font-medium ml-2">Filtrar por año:</span>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-32 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tarjetas de Métricas (Estilo Driver App) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Total Servicios</div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">12</div>
                  <TrendingUp className="h-4 w-4 text-blue-500 absolute top-4 right-4" />
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">Inversión Total</div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">S/ 850</div>
                  <DollarSign className="h-4 w-4 text-green-500 absolute top-4 right-4" />
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">Eficiencia Prom.</div>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">98%</div>
                  <Activity className="h-4 w-4 text-purple-500 absolute top-4 right-4" />
                </Card>
                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">CO₂ Reducido</div>
                  <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">12 kg</div>
                  <Leaf className="h-4 w-4 text-emerald-500 absolute top-4 right-4" />
                </Card>
              </div>

              {/* Lista de Servicios Estilo Historial */}
              <div className="space-y-4">
                {serviceHistory.map((service) => (
                  <Card key={service.id} className="p-4 group hover:shadow-lg transition-all border-l-4 border-l-primary">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{service.service}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(service.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {service.groomer}
                            </span>
                          </div>
                          <p className="text-sm mt-2 italic text-muted-foreground">"{service.notes}"</p>
                          
                          {/* Tags de métricas */}
                          <div className="flex gap-2 mt-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Ahorro: {service.timeSaved} min
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Combustible: -{service.fuelSaved}L
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{service.cost.toFixed(2)} S/</p>
                        <div className="flex items-center justify-end mt-1 text-amber-500">
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                          <Star className="h-3 w-3 fill-current" />
                        </div>
                        <Button variant="ghost" size="sm" className="mt-2 text-muted-foreground hover:text-primary">
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <NewMedicalAttentionDialog
        open={showAttentionDialog}
        onOpenChange={setShowAttentionDialog}
        petId={pet.id}
        clientId={pet.clientId}
        companyId={pet.companyId}
        petName={`${pet.name} ${pet.lastName || ''}`.trim()}
        defaultWeight={pet.rawWeight}
        onSaved={() => {
          reloadPetData().catch(() => {});
          setMedicalSubTab('timeline');
        }}
      />

      {preventiveDialog && (
        <PreventiveHealthDialog
          open={!!preventiveDialog}
          onOpenChange={(open) => !open && setPreventiveDialog(null)}
          category={preventiveDialog}
          petId={pet.id}
          clientId={pet.clientId}
          companyId={pet.companyId}
          petName={`${pet.name} ${pet.lastName || ''}`.trim()}
          onSaved={() => {
            reloadPetData().catch(() => {});
            setMedicalSubTab('vaccines');
          }}
        />
      )}
    </div>
  );
}