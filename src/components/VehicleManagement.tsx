import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VehicleCoverageRules } from './vehicles/VehicleCoverageRules';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Truck, 
  Settings, 
  Calendar, 
  DollarSign, 
  Fuel, 
  Wrench, 
  Plus, 
  Search, 
  Edit, 
  Edit2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  BarChart3,
  Download,
  Car,
  Shield,
  Users,
  FileText,
  TrendingUp,
  Gauge,
  Trash2,
  Cog,
  Check,
  Pencil
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/helpers';
import { CHART_OF_ACCOUNTS } from '../config/defaults';
import { useVehicles } from '../hooks/useVehicles';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

// Configuración de vehículos (persistida en BD).
// IMPORTANTE: no inyectar defaults "demo" automáticamente. Si el backend devuelve vacío,
// la UI debe mostrar vacío (para cumplir “sin datos de prueba”).

function normalizeKey(value: unknown): string {
  return String(value ?? '').trim();
}

function dedupeStrings(values: unknown[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values || []) {
    const s = normalizeKey(v);
    if (!s) continue;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

function findKeyCaseInsensitive(obj: Record<string, unknown>, key: string): string | null {
  const target = normalizeKey(key).toLowerCase();
  if (!target) return null;
  for (const k of Object.keys(obj || {})) {
    if (normalizeKey(k).toLowerCase() === target) return k;
  }
  return null;
}

function getModelsForBrand(modelsByBrand: Record<string, string[]>, brand: string): string[] {
  const b = normalizeKey(brand);
  if (!b) return [];
  if (Array.isArray(modelsByBrand?.[b])) return modelsByBrand[b];
  const match = findKeyCaseInsensitive(modelsByBrand as any, b);
  return match && Array.isArray((modelsByBrand as any)[match]) ? (modelsByBrand as any)[match] : [];
}

const INSPECTION_ATTACHMENT_MAX_BYTES = Math.floor(1.8 * 1024 * 1024);

interface InspectionAttachmentDataUrl {
  name: string;
  mime_type: string;
  size: number;
  data_url: string;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer el archivo'));
    reader.readAsDataURL(file);
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

interface FleetAlert {
  id: string;
  type: 'expired' | 'upcoming' | 'service' | 'inspection' | string;
  severity: 'critical' | 'high' | 'medium' | 'low' | string;
  vehicle_id?: number | string;
  vehicle_name?: string;
  title: string;
  description: string;
  due_date?: string;
}

interface InspectionTemplateItem {
  id?: number;
  label: string;
  required?: boolean;
}

interface InspectionTemplateCategory {
  id?: number;
  name: string;
  items: InspectionTemplateItem[];
}

interface InspectionTemplate {
  id?: number;
  name: string;
  vehicle_type?: string | null;
  categories: InspectionTemplateCategory[];
}

interface VehicleInspectionRecord {
  id: number;
  vehicle_id: number;
  vehicle?: any;
  template_id?: number;
  inspected_at: string;
  odometer?: number;
  driver_name?: string;
  supervisor_name?: string;
  compliance_percent: number;
  status: 'approved' | 'attention_required' | 'rejected';
  observations?: string;
  driver_signature?: string;
  supervisor_signature?: string;
  results: Array<{
    id?: number;
    template_item_id?: number;
    category_name: string;
    item_label: string;
    passed: boolean;
    notes?: string;
  }>;
  attachments?: Array<{ id: number; name?: string; url?: string; data_url?: string; mime_type?: string; size?: number }>;
}

export function VehicleManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewVehicle, setShowNewVehicle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // companyId 0 = no filtrar por empresa, listar todos los vehículos
const { vehicles, loading: vehiclesLoading, createVehicle, updateVehicle, deleteVehicle, reload: reloadVehicles } = useVehicles(0);
  const vehiclesForUIBase = useMemo(() => {
    return (vehicles || []).map((v: any) => ({
      ...v,
      plate: v.plate ?? v.placa,
      brand: v.brand ?? v.marca,
      model: v.model ?? v.modelo,
      year: v.year ?? v.anio,
      lastService: v.lastService ?? v.fecha_ultimo_mantenimiento,
      nextService: v.nextService ?? v.fecha_proximo_mantenimiento,
      equipment: v.equipment ?? v.equipamiento ?? [],
    }));
  }, [vehicles]);

  // Estados para configuraciones (catálogos locales)
  const [showBrandConfig, setShowBrandConfig] = useState(false);
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [showBrandModelConfig, setShowBrandModelConfig] = useState(false);
  const [showMaintenanceTypeConfig, setShowMaintenanceTypeConfig] = useState(false);
  const [showWorkshopConfig, setShowWorkshopConfig] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<Record<string, string[]>>({});
  const [maintenanceTypes, setMaintenanceTypes] = useState<string[]>([]);
  const [workshops, setWorkshops] = useState<{ id: number; name: string; ruc?: string; address?: string; phone?: string }[]>([]);
  const [loadingVehicleConfigs, setLoadingVehicleConfigs] = useState(true);

  const [showNewMaintenance, setShowNewMaintenance] = useState(false);
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [showNewService, setShowNewService] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<any>(null);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [upcomingServices, setUpcomingServices] = useState<any[]>([]);
  const [fleetAlerts, setFleetAlerts] = useState<FleetAlert[]>([]);
  const [inspectionTemplates, setInspectionTemplates] = useState<InspectionTemplate[]>([]);
  const [inspections, setInspections] = useState<VehicleInspectionRecord[]>([]);
  const [showInspectionTemplates, setShowInspectionTemplates] = useState(false);
  const [inspectionVehicle, setInspectionVehicle] = useState<any>(null);
  const [historyVehicle, setHistoryVehicle] = useState<any>(null);
  const [selectedInspection, setSelectedInspection] = useState<VehicleInspectionRecord | null>(null);

  const vehiclesForUI = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const sumByVehicle = (vehicleId: any, mode: 'month' | 'all') => {
      let sum = 0;
      for (const e of expenses || []) {
        if (String(e?.vehicleId) !== String(vehicleId)) continue;
        if (mode === 'month') {
          const d = e?.date ? new Date(e.date) : null;
          if (!d || Number.isNaN(d.getTime())) continue;
          if (d.getFullYear() !== year || d.getMonth() !== month) continue;
        }
        sum += Number(e?.amount) || 0;
      }
      return sum;
    };

    return (vehiclesForUIBase || []).map((v: any) => ({
      ...v,
      monthlyExpenses: sumByVehicle(v.id, 'month'),
      totalExpenses: sumByVehicle(v.id, 'all'),
    }));
  }, [vehiclesForUIBase, expenses]);

  const maintenanceFromBackend = useCallback((row: any) => ({
    id: row.id,
    vehicleId: row.vehicle_id ?? row.vehicleId,
    type: row.type,
    status: row.status,
    description: row.description || '',
    date: row.date,
    cost: Number(row.cost ?? 0),
    workshopRuc: row.workshop_ruc ?? row.workshopRuc ?? '',
    workshop: row.workshop_name ?? row.workshop ?? '',
    workshopAddress: row.workshop_address ?? row.workshopAddress ?? '',
    workshopPhone: row.workshop_phone ?? row.workshopPhone ?? '',
    nextDue: row.next_due ?? row.nextDue ?? '',
    accountCode: row.account_code ?? row.accountCode ?? '',
  }), []);

  const expenseFromBackend = useCallback((row: any) => ({
    id: row.id,
    vehicleId: row.vehicle_id ?? row.vehicleId,
    category: row.category,
    amount: Number(row.amount ?? 0),
    date: row.date,
    description: row.description || '',
    accountCode: row.account_code ?? row.accountCode ?? '',
  }), []);

  const serviceFromBackend = useCallback((row: any) => ({
    id: row.id,
    vehicleId: row.vehicle_id ?? row.vehicleId,
    type: row.type,
    description: row.description || '',
    dueDate: row.due_date ?? row.dueDate,
    priority: row.priority,
    estimatedCost: Number(row.estimated_cost ?? row.estimatedCost ?? 0),
    status: row.status,
  }), []);

  const inspectionFromBackend = useCallback((row: any): VehicleInspectionRecord => ({
    id: row.id,
    vehicle_id: row.vehicle_id ?? row.vehicleId,
    vehicle: row.vehicle,
    template_id: row.template_id,
    inspected_at: row.inspected_at,
    odometer: row.odometer,
    driver_name: row.driver_name,
    supervisor_name: row.supervisor_name,
    compliance_percent: Number(row.compliance_percent ?? 0),
    status: row.status,
    observations: row.observations,
    driver_signature: row.driver_signature,
    supervisor_signature: row.supervisor_signature,
    results: Array.isArray(row.results) ? row.results : [],
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
  }), []);

  const fetchMaintenances = useCallback(async () => {
    try {
      const res = await apiClient.get(API.vehicles.maintenances.list, { per_page: 500 });
      const raw = Array.isArray(res) ? res : res?.data;
      setMaintenanceHistory((Array.isArray(raw) ? raw : []).map(maintenanceFromBackend));
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo cargar el historial de mantenimiento');
      setMaintenanceHistory([]);
    }
  }, [maintenanceFromBackend]);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await apiClient.get(API.vehicles.expenses.list, { per_page: 500 });
      const raw = Array.isArray(res) ? res : res?.data;
      setExpenses((Array.isArray(raw) ? raw : []).map(expenseFromBackend));
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo cargar el historial de gastos');
      setExpenses([]);
    }
  }, [expenseFromBackend]);

  const fetchServices = useCallback(async () => {
    try {
      const res = await apiClient.get(API.vehicles.services.list, { per_page: 500, status: 'pending' });
      const raw = Array.isArray(res) ? res : res?.data;
      setUpcomingServices((Array.isArray(raw) ? raw : []).map(serviceFromBackend));
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo cargar los próximos servicios');
      setUpcomingServices([]);
    }
  }, [serviceFromBackend]);

  const fetchFleetAlerts = useCallback(async () => {
    try {
      const res = await apiClient.get(API.vehicles.alerts);
      const raw = Array.isArray(res) ? res : res?.data;
      setFleetAlerts(Array.isArray(raw) ? raw : []);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudieron cargar las alertas de flota');
      setFleetAlerts([]);
    }
  }, []);

  const fetchInspectionTemplates = useCallback(async () => {
    try {
      const res = await apiClient.get(API.vehicles.inspectionTemplates.list);
      const raw = Array.isArray(res) ? res : res?.data;
      setInspectionTemplates(Array.isArray(raw) ? raw : []);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudieron cargar las plantillas de inspección');
      setInspectionTemplates([]);
    }
  }, []);

  const fetchInspections = useCallback(async () => {
    try {
      const res = await apiClient.get(API.vehicles.inspections.list, { per_page: 200 });
      const raw = Array.isArray(res) ? res : res?.data;
      setInspections((Array.isArray(raw) ? raw : []).map(inspectionFromBackend));
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo cargar el historial de inspecciones');
      setInspections([]);
    }
  }, [inspectionFromBackend]);

  const loadVehicleConfigurations = useCallback(async () => {
    setLoadingVehicleConfigs(true);
    try {
      const res = await apiClient.get(API.vehicleConfigurations.all);
      const payload = res && typeof res === 'object' && 'data' in (res as any) ? (res as any).data : res;

      const apiBrands = Array.isArray(payload?.brands) ? payload.brands : [];
      const apiModels = payload?.models_by_brand && typeof payload.models_by_brand === 'object' ? payload.models_by_brand as Record<string, string[]> : {};
      const apiMaintenanceTypes = Array.isArray(payload?.maintenance_types) ? payload.maintenance_types : [];
      const apiWorkshops = Array.isArray(payload?.workshops) ? payload.workshops : [];

      // Si el backend devuelve vacío, respetarlo (no rellenar con datos demo).
      const nextBrands = dedupeStrings(apiBrands);

      const cleanedModelsRaw: Record<string, string[]> = {};
      for (const [rawBrand, rawModels] of Object.entries(apiModels || {})) {
        const key = normalizeKey(rawBrand);
        if (!key) continue;
        cleanedModelsRaw[key] = dedupeStrings(Array.isArray(rawModels) ? rawModels : []);
      }

      // Alinear claves de modelos con la lista de marcas (evita que el Select de "Modelo" quede vacío por mismatch de espacios/case)
      const nextModels: Record<string, string[]> = {};
      for (const brand of nextBrands) {
        const exact = cleanedModelsRaw[brand];
        if (exact) {
          nextModels[brand] = exact;
          continue;
        }
        const match = findKeyCaseInsensitive(cleanedModelsRaw as any, brand);
        nextModels[brand] = match ? cleanedModelsRaw[match] : [];
      }

      setBrands(nextBrands);
      // Si no hay marcas, igual permitir que el objeto venga vacío
      setModels(Object.keys(nextModels).length ? nextModels : cleanedModelsRaw);
      setMaintenanceTypes(dedupeStrings(apiMaintenanceTypes));
      setWorkshops(apiWorkshops);
    } catch (e: any) {
      console.error('Error cargando configuraciones de vehículos', e);
      toast.error(e?.message || 'No se pudieron cargar las configuraciones de vehículos');
      // No inyectar defaults demo en caso de error. Mantener lo que haya en estado o vaciar.
      setBrands((prev) => (Array.isArray(prev) ? prev : []));
      setModels((prev) => (prev && typeof prev === 'object' ? prev : {}));
      setMaintenanceTypes((prev) => (Array.isArray(prev) ? prev : []));
      setWorkshops((prev) => (Array.isArray(prev) ? prev : []));
    } finally {
      setLoadingVehicleConfigs(false);
    }
  }, []);

  const saveVehicleConfigurations = useCallback(async (payload: any, options?: { silent?: boolean }) => {
    // No enviar company_id desde el frontend: el backend toma el scope efectivo (EnsureUserCompanyScope)
    // o usa NULL si el usuario no tiene empresa (global).
    try {
      await apiClient.post(API.vehicleConfigurations.store, payload);
      if (!options?.silent) toast.success('Configuración guardada');
      await loadVehicleConfigurations();
    } catch (e: any) {
      const msg = e?.message || 'No se pudo guardar la configuración';
      toast.error(msg);
      // eslint-disable-next-line no-console
      console.error('[saveVehicleConfigurations] error', e, 'payload=', payload);
      throw e;
    }
  }, [loadVehicleConfigurations]);

  useEffect(() => {
    // Cargar datos persistidos al abrir el módulo
    fetchMaintenances();
    fetchExpenses();
    fetchServices();
    fetchFleetAlerts();
    fetchInspectionTemplates();
    fetchInspections();
  }, [fetchMaintenances, fetchExpenses, fetchServices, fetchFleetAlerts, fetchInspectionTemplates, fetchInspections]);

  useEffect(() => {
    loadVehicleConfigurations();
  }, [loadVehicleConfigurations]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          label: 'Activo', 
          color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 dark:border-green-700',
          icon: CheckCircle2,
          iconColor: 'text-green-600 dark:text-green-400'
        };
      case 'maintenance':
        return { 
          label: 'Mantenimiento', 
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 dark:border-orange-700',
          icon: Wrench,
          iconColor: 'text-orange-600 dark:text-orange-400'
        };
      case 'out_of_service':
        return { 
          label: 'Fuera de Servicio', 
          color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700',
          icon: AlertTriangle,
          iconColor: 'text-red-600 dark:text-red-400'
        };
      default:
        return { 
          label: 'Desconocido', 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200',
          icon: Clock,
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800';
      case 'low': return 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleExport = () => {
    // Exportar a CSV
    const headers = ['Nombre', 'Placa', 'Marca', 'Modelo', 'Año', 'Estado', 'Conductor', 'Kilometraje', 'Ubicación'];
    const rows = vehiclesForUI.map(v => [
      v.name,
      v.plate,
      v.brand,
      v.model,
      v.year,
      getStatusConfig(v.status).label,
      v.driver,
      v.mileage,
      v.location
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vehiculos_smartpet_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveVehicle = async (vehicleData: any) => {
    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, vehicleData);
        setEditingVehicle(null);
      } else {
        await createVehicle(vehicleData);
      }
      // Importante: refrescar lista para que aparezca en selects (gastos/mantenimientos/etc.)
      await reloadVehicles?.();
      await fetchFleetAlerts();
      setShowNewVehicle(false);
      if (selectedVehicle && editingVehicle && String(selectedVehicle.id) === String(editingVehicle.id)) {
        setSelectedVehicle(null);
      }
    } catch (e: any) {
      const msg = e?.message || e?.errors ? (typeof e.errors === 'object' ? Object.values(e.errors).flat().join(', ') : e.message) : 'No se pudo guardar el vehículo';
      toast.error(msg);
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    try {
      await deleteVehicle(id);
      if (selectedVehicle?.id === id) {
        setSelectedVehicle(null);
      }
    } catch (_e) {}
  };

  const handleSaveMaintenance = async (maintenanceData: any) => {
    try {
      const vehicleId = maintenanceData?.vehicleId;
      if (!vehicleId) {
        toast.error('Seleccione un vehículo');
        return;
      }

      const payload = {
        type: maintenanceData.type,
        status: maintenanceData.status,
        description: maintenanceData.description,
        date: maintenanceData.date,
        cost: maintenanceData.cost,
        workshopRuc: maintenanceData.workshopRuc,
        workshop: maintenanceData.workshop,
        workshopAddress: maintenanceData.workshopAddress,
        workshopPhone: maintenanceData.workshopPhone,
        nextDue: maintenanceData.nextDue || null,
        accountCode: maintenanceData.accountCode,
      };

      if (editingMaintenance?.id) {
        await apiClient.put(API.vehicles.maintenances.byId(editingMaintenance.id), payload);
        toast.success('Mantenimiento actualizado');
      } else {
        await apiClient.post(API.vehicles.maintenances.byVehicle(vehicleId), payload);
        toast.success('Mantenimiento registrado');
      }

      setShowNewMaintenance(false);
      setEditingMaintenance(null);
      await fetchMaintenances();
      await reloadVehicles?.();
      await fetchFleetAlerts();
    } catch (e: any) {
      const msg = e?.message || 'No se pudo guardar el mantenimiento';
      toast.error(msg);
    }
  };

  const handleDeleteMaintenance = async (id: number) => {
    try {
      await apiClient.delete(API.vehicles.maintenances.byId(id));
      toast.success('Mantenimiento eliminado');
      await fetchMaintenances();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo eliminar el mantenimiento');
    }
  };

  const handleSaveExpense = async (expenseData: any) => {
    try {
      const vehicleId = expenseData?.vehicleId;
      if (!vehicleId) {
        toast.error('Seleccione un vehículo');
        return;
      }

      const payload = {
        category: expenseData.category,
        amount: expenseData.amount,
        date: expenseData.date,
        description: expenseData.description,
        accountCode: expenseData.accountCode,
      };

      if (editingExpense?.id) {
        await apiClient.put(API.vehicles.expenses.byId(editingExpense.id), payload);
        toast.success('Gasto actualizado');
      } else {
        await apiClient.post(API.vehicles.expenses.byVehicle(vehicleId), payload);
        toast.success('Gasto registrado');
      }

      setShowNewExpense(false);
      setEditingExpense(null);
      await fetchExpenses();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo guardar el gasto');
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await apiClient.delete(API.vehicles.expenses.byId(id));
      toast.success('Gasto eliminado');
      await fetchExpenses();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo eliminar el gasto');
    }
  };

  const handleSaveService = async (serviceData: any) => {
    try {
      const vehicleId = serviceData?.vehicleId;
      if (!vehicleId) {
        toast.error('Seleccione un vehículo');
        return;
      }
      const payload = {
        type: serviceData.type,
        description: serviceData.description,
        dueDate: serviceData.dueDate,
        priority: serviceData.priority,
        estimatedCost: serviceData.estimatedCost,
      };
      await apiClient.post(API.vehicles.services.byVehicle(vehicleId), payload);
      toast.success('Servicio programado');
      setShowNewService(false);
      await fetchServices();
      await fetchFleetAlerts();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo programar el servicio');
    }
  };

  const handleCompleteService = async (id: number) => {
    try {
      await apiClient.post(API.vehicles.services.complete(id), {});
      toast.success('Servicio completado');
      await fetchServices();
      await fetchMaintenances();
      await reloadVehicles?.();
      await fetchFleetAlerts();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo completar el servicio');
    }
  };

  const handleSendServiceToMaintenance = async (id: number) => {
    try {
      await apiClient.post(API.vehicles.services.sendToMaintenance(id), {});
      toast.success('Enviado a mantenimiento');
      await fetchServices();
      await fetchMaintenances();
      await reloadVehicles?.();
      await fetchFleetAlerts();
      setActiveTab('maintenance');
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo enviar a mantenimiento');
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      await apiClient.delete(API.vehicles.services.byId(id));
      toast.success('Servicio eliminado');
      await fetchServices();
      await fetchFleetAlerts();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo eliminar el servicio');
    }
  };

  const handleSaveBrandModels = async (nextBrands: string[], nextModels: Record<string, string[]>) => {
    const cleanBrands = dedupeStrings(nextBrands);
    const alignedModels: Record<string, string[]> = {};
    for (const brand of cleanBrands) {
      alignedModels[brand] = dedupeStrings(nextModels[brand] || []);
    }
    setBrands(cleanBrands);
    setModels(alignedModels);
    await saveVehicleConfigurations({ type: 'brands', items: cleanBrands }, { silent: true });
    await saveVehicleConfigurations({ type: 'models_by_brand', models_by_brand: alignedModels }, { silent: true });
    toast.success('Marcas y modelos guardados');
  };

  const handleSaveInspectionTemplate = async (template: InspectionTemplate) => {
    await apiClient.post(API.vehicles.inspectionTemplates.store, template);
    toast.success('Plantilla guardada');
    await fetchInspectionTemplates();
  };

  const handleRestoreInspectionTemplate = async () => {
    const res = await apiClient.post(API.vehicles.inspectionTemplates.restore, {});
    const restored = (res as any)?.data ?? res;
    setInspectionTemplates(restored ? [restored] : []);
    toast.success('Plantilla restaurada');
    await fetchInspectionTemplates();
  };

  const handleSaveInspection = async (vehicleId: number | string, payload: any) => {
    await withTimeout(
      apiClient.post(API.vehicles.inspections.byVehicle(vehicleId), payload),
      15000,
      'El backend no respondió en 15 segundos. Verifique que Laravel esté activo en http://localhost:8000.'
    );
    toast.success('Inspección guardada');
    setInspectionVehicle(null);
    setActiveTab('fleet');
    await Promise.all([fetchInspections(), fetchFleetAlerts(), reloadVehicles?.()]);
  };

  const filteredVehicles = vehiclesForUI.filter(vehicle => {
    const plate = (vehicle.plate ?? vehicle.placa ?? '').toString().toLowerCase();
    const driver = (vehicle.driver ?? '').toString().toLowerCase();
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plate.includes(searchTerm.toLowerCase()) ||
                         driver.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calcular gastos por categoría
  const expensesByCategory = expenses.reduce((acc: any, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});

  const totalExpenses = Object.values(expensesByCategory).reduce((sum: any, val: any) => sum + val, 0) as number;
  const expenseCategoriesArray = Object.entries(expensesByCategory).map(([category, amount]: [string, any]) => ({
    category,
    amount,
    percentage: (amount / totalExpenses) * 100
  }));

  const criticalAlerts = fleetAlerts.filter((a) => a.severity === 'critical' || a.severity === 'high');

  const monthKeys = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('es-PE', { month: 'short', year: '2-digit' });
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: formatter.format(date),
      };
    });
  }, []);

  const monthlyCostSeries = useMemo(() => {
    return monthKeys.map((month) => {
      const maintenance = maintenanceHistory.reduce((sum, row) => {
        if (!row?.date || String(row.date).slice(0, 7) !== month.key) return sum;
        return sum + (Number(row.cost) || 0);
      }, 0);
      const fuel = expenses.reduce((sum, row) => {
        if (!row?.date || String(row.date).slice(0, 7) !== month.key) return sum;
        const category = String(row.category || '').toLowerCase();
        if (!category.includes('combustible')) return sum;
        return sum + (Number(row.amount) || 0);
      }, 0);
      return { ...month, maintenance, fuel };
    });
  }, [monthKeys, maintenanceHistory, expenses]);

  const vehicleExpenseComparison = useMemo(() => {
    return vehiclesForUI
      .map((vehicle) => {
        const vehicleExpenses = expenses.filter((row) => String(row.vehicleId) === String(vehicle.id));
        const fuel = vehicleExpenses
          .filter((row) => String(row.category || '').toLowerCase().includes('combustible'))
          .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
        const maintenance = maintenanceHistory
          .filter((row) => String(row.vehicleId) === String(vehicle.id))
          .reduce((sum, row) => sum + (Number(row.cost) || 0), 0);
        const other = vehicleExpenses
          .filter((row) => !String(row.category || '').toLowerCase().includes('combustible'))
          .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
        return {
          vehicle,
          fuel,
          maintenance,
          other,
          total: fuel + maintenance + other,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [vehiclesForUI, expenses, maintenanceHistory]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-primary">Gestión de Vehículos</h1>
          <p className="text-muted-foreground">Administra tu flota de vehículos móviles y su mantenimiento</p>
        </div>
        <div className="flex gap-2">
          {/* Configuración unificada de marcas y modelos */}
          <Button
            variant="outline"
            onClick={() => {
              if (loadingVehicleConfigs) {
                toast.info('Cargando configuraciones...');
                return;
              }
              setShowBrandModelConfig(true);
            }}
          >
            <Car className="h-4 w-4 mr-2" />
            Marcas y Modelos
          </Button>
          <Dialog open={showBrandModelConfig} onOpenChange={setShowBrandModelConfig}>
            {showBrandModelConfig && (
              <BrandModelConfigDialog
                brands={brands}
                models={models}
                onSave={handleSaveBrandModels}
                onClose={() => setShowBrandModelConfig(false)}
              />
            )}
          </Dialog>

          {/* Configuración de Tipos de Mantenimiento */}
          <Button
            variant="outline"
            onClick={() => {
              if (loadingVehicleConfigs) {
                toast.info('Cargando configuraciones...');
                return;
              }
              setShowMaintenanceTypeConfig(true);
            }}
          >
            <Cog className="h-4 w-4 mr-2" />
            Config. Tipos Mantenimiento
          </Button>
          <Dialog open={showMaintenanceTypeConfig} onOpenChange={setShowMaintenanceTypeConfig}>
            {showMaintenanceTypeConfig && (
              <MaintenanceTypeConfigDialog
                maintenanceTypes={maintenanceTypes}
                onSave={async (nextTypes: string[]) => {
                  setMaintenanceTypes(nextTypes);
                  await saveVehicleConfigurations({ type: 'maintenance_types', items: nextTypes });
                }}
                onClose={() => setShowMaintenanceTypeConfig(false)}
              />
            )}
          </Dialog>

          {/* Configuración de Talleres/Proveedores */}
          <Button
            variant="outline"
            onClick={() => {
              if (loadingVehicleConfigs) {
                toast.info('Cargando configuraciones...');
                return;
              }
              setShowWorkshopConfig(true);
            }}
          >
            <Wrench className="h-4 w-4 mr-2" />
            Config. Talleres
          </Button>
          <Dialog open={showWorkshopConfig} onOpenChange={setShowWorkshopConfig}>
            {showWorkshopConfig && (
              <WorkshopConfigDialog
                workshops={workshops}
                onSave={async (nextWorkshops: any[]) => {
                  setWorkshops(nextWorkshops);
                  await saveVehicleConfigurations({ type: 'workshops', items: nextWorkshops });
                }}
                onClose={() => setShowWorkshopConfig(false)}
              />
            )}
          </Dialog>

          {/* Botón Exportar */}
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>

          {/* Botón Nuevo Vehículo */}
          <Dialog open={showNewVehicle} onOpenChange={setShowNewVehicle}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingVehicle(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Vehículo
              </Button>
            </DialogTrigger>
            {showNewVehicle && (
              <VehicleDialog
                key={editingVehicle?.id ?? 'new'}
                vehicle={editingVehicle}
                brands={brands}
                models={models}
                onSave={handleSaveVehicle}
                onClose={() => {
                  setShowNewVehicle(false);
                  setEditingVehicle(null);
                }}
              />
            )}
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-500 dark:bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{vehiclesForUI.length}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">Total Flota</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-green-500 dark:bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{vehiclesForUI.filter(v => v.status === 'active').length}</p>
              <p className="text-sm text-green-700 dark:text-green-300">Activos</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-orange-500 dark:bg-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{vehiclesForUI.filter(v => v.status === 'maintenance').length}</p>
              <p className="text-sm text-orange-700 dark:text-orange-300">Mantenimiento</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-purple-500 dark:bg-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{vehiclesForUI.length ? Math.round(vehiclesForUI.reduce((sum, v) => sum + ((v as any).efficiency ?? 0), 0) / vehiclesForUI.length) : 0}%</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">Eficiencia Media</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-red-500 dark:bg-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-red-900 dark:text-red-100">
                {formatCurrency(
                  vehiclesForUI.reduce((sum: number, v: any) => sum + (Number(v?.monthlyExpenses) || 0), 0),
                  'PEN'
                )}
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">Gasto Mensual</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="inline-flex h-10 w-max min-w-0 items-center gap-1 rounded-full border border-cyan-400/20 bg-[#0b1020]/95 p-1 text-slate-300 shadow-[0_0_18px_-10px_rgba(34,211,238,0.65)]">
            {[
              ['dashboard', 'Dashboard'],
              ['fleet', 'Flota'],
              ['maintenance', 'Mantenimiento'],
              ['services', 'Próximos Servicios'],
              ['expenses', 'Gastos'],
              ['alerts', `Alertas (${fleetAlerts.length})`],
              ['inspections', 'Inspecciones'],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="h-8 flex-none rounded-full border-0 px-4 text-xs font-semibold text-indigo-200 transition-all data-[state=active]:bg-cyan-500/25 data-[state=active]:text-cyan-100 data-[state=active]:shadow-[0_0_14px_-5px_rgba(34,211,238,0.9)] dark:data-[state=active]:bg-cyan-500/25 dark:data-[state=active]:text-cyan-100"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* TAB: Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <FleetCostChart data={monthlyCostSeries} />
          <VehicleExpenseComparison data={vehicleExpenseComparison} />
        </TabsContent>

        {/* TAB: Flota */}
        <TabsContent value="fleet" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, matrícula o conductor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="maintenance">En Mantenimiento</SelectItem>
                <SelectItem value="out_of_service">Fuera de Servicio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicle Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle}
                onEdit={() => {
                  setEditingVehicle(vehicle);
                  setShowNewVehicle(true);
                }}
                onDelete={() => handleDeleteVehicle(vehicle.id)}
                onViewDetails={() => setSelectedVehicle(vehicle)}
                onInspect={() => setInspectionVehicle(vehicle)}
                onHistory={() => setHistoryVehicle(vehicle)}
              />
            ))}
          </div>
        </TabsContent>

        {/* TAB: Mantenimiento */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-foreground">Historial de Mantenimiento</h3>
            <Dialog open={showNewMaintenance} onOpenChange={setShowNewMaintenance}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingMaintenance(null)} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Mantenimiento
                </Button>
              </DialogTrigger>
              {showNewMaintenance && (
                <MaintenanceDialog
                  key={editingMaintenance?.id ?? 'new'}
                  maintenance={editingMaintenance}
                  vehicles={vehiclesForUI}
                  maintenanceTypes={maintenanceTypes}
                  workshops={workshops}
                  onSave={handleSaveMaintenance}
                  onClose={() => {
                    setShowNewMaintenance(false);
                    setEditingMaintenance(null);
                  }}
                />
              )}
            </Dialog>
          </div>

          <div className="space-y-3">
            {maintenanceHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <Wrench className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No hay registros de mantenimiento. Agrega uno nuevo para comenzar.</p>
              </Card>
            ) : (
              <Card className="p-0 overflow-hidden border border-border/60 bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="px-4">Vehículo</TableHead>
                      <TableHead className="px-4">Detalle</TableHead>
                      <TableHead className="px-4">Estado</TableHead>
                      <TableHead className="px-4">Taller / Fecha</TableHead>
                      <TableHead className="px-4 text-right">Costo</TableHead>
                      <TableHead className="px-4 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceHistory.map((maintenance) => {
                      const vehicle = vehiclesForUI.find(v => String(v.id) === String(maintenance.vehicleId));
                      const isCompleted = maintenance.status === 'completed';
                      const vehicleTitle = (() => {
                        const base = String(vehicle?.name || 'Vehículo').trim();
                        const idTag = vehicle?.id != null ? `#${String(vehicle.id).padStart(3, '0')}` : '';
                        const hasTag = /#\d{3,}/.test(base);
                        if (hasTag || !idTag) return base;
                        return `${base} ${idTag}`.trim();
                      })();

                      return (
                        <TableRow key={maintenance.id} className="hover:bg-muted/20">
                          <TableCell className="px-4 py-4 whitespace-normal">
                            <div className="flex items-start gap-3">
                              <div className={`mt-1 h-2.5 w-2.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-orange-500'}`} />
                              <div className="min-w-0">
                                <div className="font-semibold text-foreground truncate">{vehicleTitle}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {vehicle?.plate ? `${vehicle.plate}` : '—'}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-4 whitespace-normal">
                            <div className="min-w-0">
                              <div className="font-medium text-foreground truncate">{maintenance.type}</div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {maintenance.description || '—'}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-4">
                            <Badge className={isCompleted
                              ? 'bg-green-500 text-white border-green-600'
                              : 'bg-orange-500 text-white border-orange-600'
                            }>
                              {isCompleted ? 'Completado' : 'En Progreso'}
                            </Badge>
                          </TableCell>

                          <TableCell className="px-4 py-4 whitespace-normal">
                            <div className="text-sm text-foreground">{formatDate(maintenance.date)}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {maintenance.workshop || '—'}
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-4 text-right font-semibold text-foreground">
                            {formatCurrency(maintenance.cost, 'PEN')}
                          </TableCell>

                          <TableCell className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingMaintenance(maintenance);
                                  setShowNewMaintenance(true);
                                }}
                                aria-label="Editar mantenimiento"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteMaintenance(maintenance.id)}
                                aria-label="Eliminar mantenimiento"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* TAB: Gastos */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg">Registro de Gastos</h3>
            <Dialog open={showNewExpense} onOpenChange={setShowNewExpense}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingExpense(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Gasto
                </Button>
              </DialogTrigger>
              {showNewExpense && (
                <ExpenseDialog
                  key={editingExpense?.id ?? 'new'}
                  expense={editingExpense}
                  vehicles={vehiclesForUI}
                  onSave={handleSaveExpense}
                  onClose={() => {
                    setShowNewExpense(false);
                    setEditingExpense(null);
                  }}
                />
              )}
            </Dialog>
          </div>

          {/* Resumen por categoría */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2 p-6 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/20">
              <h4 className="font-semibold mb-4">Gastos por Categoría</h4>
              <div className="space-y-4">
                {expenseCategoriesArray.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{cat.category}</span>
                      <span className="text-sm font-semibold">{formatCurrency(cat.amount, 'PEN')} ({cat.percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={cat.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 border-primary/20">
              <h4 className="font-semibold mb-4">Total Gastos</h4>
              <p className="text-4xl font-bold text-primary mb-2">{formatCurrency(totalExpenses, 'PEN')}</p>
              <p className="text-sm text-muted-foreground">Suma de todos los gastos registrados</p>
            </Card>
          </div>

          {/* Lista de gastos */}
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Historial de Gastos</h4>
            <div className="space-y-3">
              {expenses.map((expense) => {
                const vehicle = vehiclesForUI.find(v => v.id === expense.vehicleId);
                const account = CHART_OF_ACCOUNTS.find(a => a.code === expense.accountCode);
                return (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted rounded-lg hover:shadow-md transition-shadow border-l-4 border-l-primary/40">
                    <div className="flex items-center gap-3 flex-1">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{vehicle?.name}</span>
                          <Badge variant="outline">{expense.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{formatDate(expense.date)}</span>
                          {account && (
                            <span className="font-mono bg-primary/10 px-2 py-0.5 rounded">
                              {account.code} - {account.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{formatCurrency(expense.amount, 'PEN')}</span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingExpense(expense);
                          setShowNewExpense(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* TAB: Próximos Servicios */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg">Próximos Servicios Programados</h3>
            <Dialog open={showNewService} onOpenChange={setShowNewService}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Programar Servicio
                </Button>
              </DialogTrigger>
              {showNewService && (
                <ServiceDialog
                  key="new"
                  vehicles={vehiclesForUI}
                  maintenanceTypes={maintenanceTypes}
                  onSave={handleSaveService}
                  onClose={() => setShowNewService(false)}
                />
              )}
            </Dialog>
          </div>

          <div className="space-y-4">
            {upcomingServices.length === 0 ? (
              <Card className="p-8 text-center">
                <Wrench className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No hay próximos servicios programados.</p>
              </Card>
            ) : upcomingServices.map((service) => {
              const vehicle = vehiclesForUI.find(v => v.id === service.vehicleId);
              const daysUntil = getDaysUntil(service.dueDate);
              return (
                <Card key={service.id} className={`p-4 ${getPriorityColor(service.priority)} border-2`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                        service.priority === 'high' ? 'bg-red-500 dark:bg-red-600' :
                        service.priority === 'medium' ? 'bg-yellow-500 dark:bg-yellow-600' :
                        'bg-green-500 dark:bg-green-600'
                      }`}>
                        <Wrench className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{vehicle?.name}</h4>
                          <Badge variant="outline">{service.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                        <div className="text-xs text-muted-foreground space-x-4">
                          <span>Vence: {formatDate(service.dueDate)}</span>
                          <span>Coste estimado: {formatCurrency(service.estimatedCost, 'PEN')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className={`text-sm font-bold mb-2 ${
                        daysUntil < 0 ? 'text-red-600 dark:text-red-400' :
                        daysUntil === 0 ? 'text-orange-600 dark:text-orange-400' :
                        daysUntil <= 7 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                      }`}>
                        {daysUntil < 0 ? `Vencido hace ${Math.abs(daysUntil)} días` :
                         daysUntil === 0 ? 'Vence hoy' :
                         daysUntil === 1 ? 'Vence mañana' :
                         `En ${daysUntil} días`}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendServiceToMaintenance(service.id)}
                          className="bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/50"
                        >
                          <Wrench className="h-4 w-4 mr-1" />
                          Enviar a Mantenimiento
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB: Alertas */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">Alertas y recordatorios</h3>
              <p className="text-sm text-muted-foreground">
                Vencimientos de documentos, próximos servicios y mantenimientos que requieren atención.
              </p>
            </div>
            <Badge variant={criticalAlerts.length ? 'destructive' : 'secondary'}>
              {criticalAlerts.length} críticas / altas
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ['Vencidos', fleetAlerts.filter((a) => a.type === 'expired').length, 'text-red-500'],
              ['Servicios próximos', fleetAlerts.filter((a) => a.type === 'service' || a.type === 'upcoming').length, 'text-orange-500'],
              ['Inspecciones', fleetAlerts.filter((a) => a.type === 'inspection').length, 'text-cyan-500'],
            ].map(([label, count, color]) => (
              <Card key={String(label)} className="p-4">
                <p className={`text-3xl font-bold ${color}`}>{count}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <div className="space-y-3">
              {fleetAlerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin vencimientos ni alertas pendientes.</p>
              ) : fleetAlerts.map((alert) => (
                <div key={alert.id} className="rounded-xl border p-4 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.vehicle_name || 'Flota'} · {alert.description}
                    </p>
                    {alert.due_date ? (
                      <p className="text-xs text-muted-foreground mt-1">Fecha relacionada: {formatDate(alert.due_date)}</p>
                    ) : null}
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                    {alert.severity === 'critical' ? 'Crítica' : alert.severity === 'high' ? 'Alta' : alert.severity === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* TAB: Inspecciones */}
        <TabsContent value="inspections" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">Inspecciones de unidades</h3>
              <p className="text-sm text-muted-foreground">Crea plantillas, aplica checklists y consulta el historial de revisión.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowInspectionTemplates(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Plantilla de inspección
              </Button>
              <Button onClick={() => setInspectionVehicle(vehiclesForUI[0] || null)} disabled={vehiclesForUI.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva inspección
              </Button>
            </div>
          </div>

          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Responsables</TableHead>
                  <TableHead>Cumplimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No hay inspecciones registradas.
                    </TableCell>
                  </TableRow>
                ) : inspections.map((inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell className="font-medium">{inspection.vehicle?.name || `Vehículo #${inspection.vehicle_id}`}</TableCell>
                    <TableCell>{formatDate(inspection.inspected_at)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>Chofer: {inspection.driver_name || '—'}</p>
                        <p className="text-muted-foreground">Supervisor: {inspection.supervisor_name || '—'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{inspection.compliance_percent}%</TableCell>
                    <TableCell>
                      <Badge variant={inspection.status === 'approved' ? 'secondary' : 'destructive'}>
                        {inspection.status === 'approved' ? 'Aprobada' : inspection.status === 'attention_required' ? 'Atención' : 'Rechazada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelectedInspection(inspection)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalles del vehículo */}
      {selectedVehicle && (
        <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedVehicle.name}</DialogTitle>
            </DialogHeader>
            <VehicleDetailsView vehicle={selectedVehicle} />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={showInspectionTemplates} onOpenChange={setShowInspectionTemplates}>
        {showInspectionTemplates && (
          <InspectionTemplateDialog
            templates={inspectionTemplates}
            onSave={handleSaveInspectionTemplate}
            onRestore={handleRestoreInspectionTemplate}
            onClose={() => setShowInspectionTemplates(false)}
          />
        )}
      </Dialog>

      {inspectionVehicle && (
        <InspectionApplyDialog
          vehicle={inspectionVehicle}
          vehicles={vehiclesForUI}
          templates={inspectionTemplates}
          onVehicleChange={(vehicleId: string) => {
            const next = vehiclesForUI.find((v) => String(v.id) === String(vehicleId));
            if (next) setInspectionVehicle(next);
          }}
          onSave={handleSaveInspection}
          onClose={() => setInspectionVehicle(null)}
        />
      )}

      <Dialog open={!!historyVehicle} onOpenChange={(open) => !open && setHistoryVehicle(null)}>
        {historyVehicle && (
          <InspectionHistoryDialog
            vehicle={historyVehicle}
            inspections={inspections.filter((inspection) => String(inspection.vehicle_id) === String(historyVehicle.id))}
            onView={setSelectedInspection}
            onClose={() => setHistoryVehicle(null)}
          />
        )}
      </Dialog>

      <Dialog open={!!selectedInspection} onOpenChange={(open) => !open && setSelectedInspection(null)}>
        {selectedInspection && (
          <InspectionDetailDialog
            inspection={selectedInspection}
            onClose={() => setSelectedInspection(null)}
          />
        )}
      </Dialog>
    </div>
  );
}

// Componente de tarjeta de vehículo
function VehicleCard({ vehicle, onEdit, onDelete, onViewDetails, onInspect, onHistory }: any) {
  const statusConfig = getStatusConfig(vehicle.status);
  const StatusIcon = statusConfig.icon;
  const safeDate = (value: any) => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '—';
      return formatDate(d);
    } catch {
      return '—';
    }
  };
  const safePercent = (value: any) => {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(100, Math.round(n)));
  };
  const efficiencyPct = safePercent(vehicle.efficiency);
  const fuelPct = safePercent(vehicle.fuelLevel);

  return (
    <Card className="p-6 hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 hover:border-primary/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 dark:from-primary/80 dark:to-primary/40 rounded-xl flex items-center justify-center shadow-lg">
            <Truck className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{vehicle.name}</h3>
            <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
            <p className="text-xs text-muted-foreground">Matrícula: {vehicle.plate}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <Badge className={`${statusConfig.color} border`}>
            <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.iconColor}`} />
            {statusConfig.label}
          </Badge>
          <div className="text-right text-xs">
            <p className="text-muted-foreground font-medium">
              Eficiencia: {efficiencyPct != null ? `${efficiencyPct}%` : '—'}
            </p>
            <Progress value={efficiencyPct ?? 0} className="w-16 h-2 mt-1" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">{vehicle.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="truncate">{vehicle.driver}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Gauge className="h-4 w-4 text-primary" />
            <span>{(vehicle.mileage ?? 0).toLocaleString()} km</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Fuel className="h-4 w-4 text-primary" />
            <span>Combustible: {fuelPct != null ? `${fuelPct}%` : '—'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="truncate">Próximo: {safeDate(vehicle.nextService)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span>{formatCurrency(Number(vehicle.monthlyExpenses) || 0, 'PEN')}/mes</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onViewDetails}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalles
        </Button>
        <Button variant="outline" size="sm" onClick={onInspect}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Checklist
        </Button>
        <Button variant="outline" size="sm" onClick={onHistory}>
          <FileText className="h-4 w-4 mr-2" />
          Historial
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function FleetCostChart({ data }: { data: Array<{ label: string; maintenance: number; fuel: number }> }) {
  const maxValue = Math.max(1, ...data.flatMap((row) => [row.maintenance, row.fuel]));
  const width = 720;
  const height = 240;
  const left = 54;
  const right = 24;
  const top = 24;
  const bottom = 42;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const xFor = (index: number) => left + (data.length <= 1 ? 0 : (chartWidth / (data.length - 1)) * index);
  const yFor = (value: number) => top + chartHeight - (value / maxValue) * chartHeight;
  const lineFor = (key: 'maintenance' | 'fuel') => data.map((row, index) => `${xFor(index)},${yFor(row[key])}`).join(' ');
  const current = data[data.length - 1] || { maintenance: 0, fuel: 0 };

  return (
    <Card className="p-5 bg-[#070b1d] border-slate-800/80 text-slate-100">
      <div className="mb-4">
        <h3 className="font-semibold">Costos flota vs combustible</h3>
        <p className="text-sm text-slate-400">Últimos 6 meses (S/ mensual)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge className="bg-emerald-500/15 text-emerald-200 border-emerald-500/30">
            Mant. este mes - {formatCurrency(current.maintenance, 'PEN')}
          </Badge>
          <Badge className="bg-cyan-500/15 text-cyan-200 border-cyan-500/30">
            Comb. este mes - {formatCurrency(current.fuel, 'PEN')}
          </Badge>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[680px] w-full h-72">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = top + chartHeight - chartHeight * ratio;
            return (
              <g key={ratio}>
                <line x1={left} x2={width - right} y1={y} y2={y} stroke="rgba(148,163,184,0.16)" strokeDasharray="3 4" />
                <text x={left - 12} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
                  {Math.round(maxValue * ratio)}
                </text>
              </g>
            );
          })}
          {data.map((row, index) => {
            const x = xFor(index);
            return (
              <g key={row.label}>
                <line x1={x} x2={x} y1={top} y2={top + chartHeight} stroke="rgba(148,163,184,0.10)" strokeDasharray="3 4" />
                <text x={x} y={height - 12} textAnchor="middle" className="fill-slate-400 text-[11px]">{row.label}</text>
              </g>
            );
          })}
          <polyline points={lineFor('maintenance')} fill="none" stroke="#a855f7" strokeWidth="3" />
          <polyline points={lineFor('fuel')} fill="none" stroke="#06b6d4" strokeWidth="3" />
          {data.map((row, index) => (
            <g key={`${row.label}-points`}>
              <circle cx={xFor(index)} cy={yFor(row.maintenance)} r="4" fill="#a855f7" />
              <circle cx={xFor(index)} cy={yFor(row.fuel)} r="4" fill="#06b6d4" />
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex justify-center gap-6 text-sm">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-purple-500" />Mantenimiento</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-cyan-500" />Combustible</span>
      </div>
    </Card>
  );
}

function VehicleExpenseComparison({ data }: { data: Array<{ vehicle: any; fuel: number; maintenance: number; other: number; total: number }> }) {
  const maxValue = Math.max(1, ...data.map((row) => row.total));

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold">Comparativa de gastos por vehículo</h3>
          <p className="text-sm text-muted-foreground">Combustible, mantenimiento y otros gastos acumulados.</p>
        </div>
        <Badge variant="outline">{data.length} unidades</Badge>
      </div>
      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay gastos registrados para comparar.</p>
        ) : data.map(({ vehicle, fuel, maintenance, other, total }) => {
          const fuelPct = (fuel / maxValue) * 100;
          const maintenancePct = (maintenance / maxValue) * 100;
          const otherPct = (other / maxValue) * 100;
          return (
            <div key={vehicle.id} className="rounded-xl border p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                <div>
                  <p className="font-semibold">{vehicle.name}</p>
                  <p className="text-xs text-muted-foreground">{vehicle.plate || 'Sin placa'} · {vehicle.brand} {vehicle.model}</p>
                </div>
                <p className="font-bold">{formatCurrency(total, 'PEN')}</p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted flex">
                <div className="bg-cyan-500" style={{ width: `${fuelPct}%` }} title="Combustible" />
                <div className="bg-purple-500" style={{ width: `${maintenancePct}%` }} title="Mantenimiento" />
                <div className="bg-slate-500" style={{ width: `${otherPct}%` }} title="Otros" />
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>Combustible: {formatCurrency(fuel, 'PEN')}</span>
                <span>Mantenimiento: {formatCurrency(maintenance, 'PEN')}</span>
                <span>Otros: {formatCurrency(other, 'PEN')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'active':
      return { 
        label: 'Activo', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 dark:border-green-700',
        icon: CheckCircle2,
        iconColor: 'text-green-600 dark:text-green-400'
      };
    case 'maintenance':
      return { 
        label: 'Mantenimiento', 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 dark:border-orange-700',
        icon: Wrench,
        iconColor: 'text-orange-600 dark:text-orange-400'
      };
    case 'out_of_service':
      return { 
        label: 'Fuera de Servicio', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 dark:border-red-700',
        icon: AlertTriangle,
        iconColor: 'text-red-600 dark:text-red-400'
      };
    default:
      return { 
        label: 'Desconocido', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200',
        icon: Clock,
        iconColor: 'text-gray-600 dark:text-gray-400'
      };
  }
}

// Componente de vista de detalles del vehículo
function VehicleDetailsView({ vehicle }: any) {
  const safeDate = (value: any) => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '—';
      return formatDate(d);
    } catch {
      return '—';
    }
  };
  const safeText = (value: any) => (value == null || value === '' ? '—' : String(value));

  return (
    <div className="space-y-4">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="equipment">Equipamiento</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">Marca/Modelo</span>
              <p className="font-semibold mt-1">{safeText(vehicle.brand)} {safeText(vehicle.model)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <span className="text-xs text-green-700 dark:text-green-300 font-medium">Año</span>
              <p className="font-semibold mt-1">{safeText(vehicle.year)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Matrícula</span>
              <p className="font-semibold mt-1">{safeText(vehicle.plate)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">VIN</span>
              <p className="font-semibold mt-1 text-xs">{safeText(vehicle.vin)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <span className="text-xs text-red-700 dark:text-red-300 font-medium">Kilometraje</span>
              <p className="font-semibold mt-1">{(vehicle.mileage ?? 0).toLocaleString()} km</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
              <span className="text-xs text-cyan-700 dark:text-cyan-300 font-medium">Conductor</span>
              <p className="font-semibold mt-1">{safeText(vehicle.driver)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
              <span className="text-xs text-pink-700 dark:text-pink-300 font-medium">Ubicación</span>
              <p className="font-semibold mt-1">{safeText(vehicle.location)}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">Nivel de Combustible</span>
              <p className="font-semibold mt-1">{vehicle.fuelLevel != null ? `${vehicle.fuelLevel}%` : '—'}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-3 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {(vehicle.equipment ?? []).map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">Seguro</span>
              </div>
              <p className="text-sm text-muted-foreground">Vence: {safeDate(vehicle.insurance)}</p>
            </div>
            <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium">ITV</span>
              </div>
              <p className="text-sm text-muted-foreground">Vence: {safeDate(vehicle.itv)}</p>
            </div>
            <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium">Último Servicio</span>
              </div>
              <p className="text-sm text-muted-foreground">{safeDate(vehicle.lastService)}</p>
            </div>
            <div className="p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="font-medium">Próximo Servicio</span>
              </div>
              <p className="text-sm text-muted-foreground">{safeDate(vehicle.nextService)}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const DEFAULT_HORARIO_DISPONIBILIDAD: Record<string, { open: boolean; start: string; end: string }> = {
  monday: { open: true, start: '08:00', end: '18:00' },
  tuesday: { open: true, start: '08:00', end: '18:00' },
  wednesday: { open: true, start: '08:00', end: '18:00' },
  thursday: { open: true, start: '08:00', end: '18:00' },
  friday: { open: true, start: '08:00', end: '18:00' },
  saturday: { open: true, start: '09:00', end: '14:00' },
  sunday: { open: false, start: '00:00', end: '00:00' },
};
const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves',
  friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo',
};

// Diálogo para agregar/editar vehículo
function VehicleDialog({ vehicle, brands, models, onSave, onClose }: any) {
  const VEHICLE_TYPES = [
    { value: 'furgoneta_grande', label: 'Furgoneta grande' },
    { value: 'auto_compacto', label: 'Auto compacto' },
    { value: 'camioneta', label: 'Camioneta' },
    { value: 'moto', label: 'Moto' },
  ];
  const [formData, setFormData] = useState({
    name: vehicle?.name || '',
    type: vehicle?.type || 'furgoneta_grande',
    plate: vehicle?.plate || '',
    brand: vehicle?.brand || brands[0] || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    vin: vehicle?.vin || '',
    status: vehicle?.status === 'maintenance'
      ? 'maintenance'
      : (vehicle?.status === 'out_of_service' || vehicle?.status === 'inactive' ? 'out_of_service' : 'active'),
    location: vehicle?.location || '',
    driver: vehicle?.driver || '',
    mileage: vehicle?.mileage || 0,
    lastService: vehicle?.lastService || '',
    nextService: vehicle?.nextService || '',
    fuelLevel: vehicle?.fuelLevel || 100,
    insurance: vehicle?.insurance || '',
    itv: vehicle?.itv || '',
    equipment: vehicle?.equipment || [],
    monthlyExpenses: vehicle?.monthlyExpenses || 0,
    totalExpenses: vehicle?.totalExpenses || 0,
    efficiency: vehicle?.efficiency || 100,
    horario_disponibilidad: vehicle?.horario_disponibilidad ? { ...DEFAULT_HORARIO_DISPONIBILIDAD, ...vehicle.horario_disponibilidad } : { ...DEFAULT_HORARIO_DISPONIBILIDAD },
  });

  const [newEquipment, setNewEquipment] = useState('');
  const sanitizeIsoDateInput = (value: string) => {
    if (!value) return '';
    const raw = String(value).trim();
    const parts = raw.split('-');
    const y = (parts[0] || '').replace(/\D/g, '').slice(0, 4);
    const m = (parts[1] || '').replace(/\D/g, '').slice(0, 2);
    const d = (parts[2] || '').replace(/\D/g, '').slice(0, 2);
    if (!m) return y;
    if (!d) return `${y}-${m}`;
    return `${y}-${m}-${d}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addEquipment = () => {
    if (newEquipment.trim()) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, newEquipment.trim()]
      });
      setNewEquipment('');
    }
  };

  const removeEquipment = (index: number) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter((_: any, i: number) => i !== index)
    });
  };

  const availableModels = getModelsForBrand(models || {}, formData.brand);

  // Si la marca cambia (o se normaliza) y el modelo ya no existe, resetearlo para evitar selects "rotos"
  useEffect(() => {
    if (!formData.model) return;
    if (availableModels.includes(formData.model)) return;
    setFormData((prev: any) => ({ ...prev, model: '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.brand, models]);

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}</DialogTitle>
        <DialogDescription>
          {vehicle ? 'Modifica los datos del vehículo' : 'Registra un nuevo vehículo en la flota'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Nombre del Vehículo *</Label>
              <Input
                placeholder="Ej: Furgoneta SmartPet #004"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Matrícula *</Label>
              <Input
                placeholder="Ej: SP-004-MD"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Tipo de vehículo *</Label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" disabled>
                  Seleccione tipo
                </option>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Marca *</Label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                  disabled={!Array.isArray(brands) || brands.length === 0}
                  className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>
                    Seleccione marca
                  </option>
                  {brands.map((brand: string) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Modelo *</Label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  disabled={!formData.brand || availableModels.length === 0}
                  className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>
                    {formData.brand ? (availableModels.length ? 'Seleccionar modelo' : 'Sin modelos') : 'Seleccione marca primero'}
                  </option>
                  {availableModels.map((model: string) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Año *</Label>
                <Input
                  type="number"
                  placeholder="2024"
                  value={formData.year}
                  min={1900}
                  max={new Date().getFullYear()}
                  step={1}
                  onChange={(e) => {
                    const digits = String(e.target.value || '').replace(/\D/g, '').slice(0, 4);
                    setFormData({ ...formData, year: digits ? Number(digits) : '' });
                  }}
                  required
                />
              </div>
              <div>
                <Label>Kilometraje *</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>VIN (Número de chasis)</Label>
              <Input
                placeholder="WDB9063451234567"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Zona de Operación</Label>
              <Input
                placeholder="Ej: Zona Norte Lima"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                * El conductor se asigna desde el módulo de Personal
              </p>
            </div>
            <div>
              <Label>Estado</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Activo</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="out_of_service">Inactivo</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fecha Seguro</Label>
                <Input
                  type="date"
                  value={formData.insurance}
                  onChange={(e) => setFormData({ ...formData, insurance: sanitizeIsoDateInput(e.target.value) })}
                />
              </div>
              <div>
                <Label>Fecha ITV</Label>
                <Input
                  type="date"
                  value={formData.itv}
                  onChange={(e) => setFormData({ ...formData, itv: sanitizeIsoDateInput(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Último Servicio</Label>
                <Input
                  type="date"
                  value={formData.lastService}
                  onChange={(e) => setFormData({ ...formData, lastService: sanitizeIsoDateInput(e.target.value) })}
                />
              </div>
              <div>
                <Label>Próximo Servicio</Label>
                <Input
                  type="date"
                  value={formData.nextService}
                  onChange={(e) => setFormData({ ...formData, nextService: sanitizeIsoDateInput(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Disponibilidad del vehículo
          </Label>
          <p className="text-xs text-muted-foreground">
            Plantilla de horario base. Si defines reglas de cobertura abajo, la agenda usará esas reglas con prioridad.
          </p>
          <div className="grid gap-2">
            {Object.entries(DAY_LABELS).map(([day, label]) => (
              <div key={day} className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 w-28">
                  <Switch
                    checked={formData.horario_disponibilidad?.[day]?.open ?? false}
                    onCheckedChange={(v) => setFormData({
                      ...formData,
                      horario_disponibilidad: {
                        ...formData.horario_disponibilidad,
                        [day]: { ...formData.horario_disponibilidad?.[day], open: v, start: '08:00', end: '18:00' },
                      },
                    })}
                  />
                  <span className="text-sm">{label}</span>
                </div>
                {formData.horario_disponibilidad?.[day]?.open && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={formData.horario_disponibilidad[day]?.start ?? '08:00'}
                      onChange={(e) => setFormData({
                        ...formData,
                        horario_disponibilidad: {
                          ...formData.horario_disponibilidad,
                          [day]: { ...formData.horario_disponibilidad?.[day], start: e.target.value, open: true, end: formData.horario_disponibilidad?.[day]?.end ?? '18:00' },
                        },
                      })}
                      className="w-28"
                    />
                    <span className="text-muted-foreground">a</span>
                    <Input
                      type="time"
                      value={formData.horario_disponibilidad[day]?.end ?? '18:00'}
                      onChange={(e) => setFormData({
                        ...formData,
                        horario_disponibilidad: {
                          ...formData.horario_disponibilidad,
                          [day]: { ...formData.horario_disponibilidad?.[day], end: e.target.value, open: true, start: formData.horario_disponibilidad?.[day]?.start ?? '08:00' },
                        },
                      })}
                      className="w-28"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <VehicleCoverageRules vehicleId={vehicle?.id} />

        <div className="space-y-4 pt-4 border-t">
          <Label>Equipamiento</Label>
          <div className="flex gap-2">
            <Input
              value={newEquipment}
              onChange={(e) => setNewEquipment(e.target.value)}
              placeholder="Agregar equipamiento..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
            />
            <Button type="button" onClick={addEquipment} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.equipment.map((item: string, index: number) => (
              <Badge key={index} variant="secondary" className="pl-3 pr-1">
                {item}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => removeEquipment(index)}
                >
                  ×
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {vehicle ? 'Guardar Cambios' : 'Registrar Vehículo'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

function BrandModelConfigDialog({ brands, models, onSave, onClose }: any) {
  const [localBrands, setLocalBrands] = useState<string[]>(dedupeStrings(brands || []));
  const [localModels, setLocalModels] = useState<Record<string, string[]>>({ ...(models || {}) });
  const [selectedBrand, setSelectedBrand] = useState<string>(brands?.[0] || '');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedBrand && localBrands.length) setSelectedBrand(localBrands[0]);
    if (selectedBrand && !localBrands.includes(selectedBrand)) setSelectedBrand(localBrands[0] || '');
  }, [localBrands, selectedBrand]);

  const addBrand = () => {
    const value = newBrand.trim();
    if (!value) return;
    if (localBrands.some((brand) => brand.toLowerCase() === value.toLowerCase())) {
      toast.info('La marca ya existe');
      return;
    }
    setLocalBrands((prev) => [...prev, value]);
    setLocalModels((prev) => ({ ...prev, [value]: [] }));
    setSelectedBrand(value);
    setNewBrand('');
  };

  const removeBrand = (brand: string) => {
    setLocalBrands((prev) => prev.filter((item) => item !== brand));
    setLocalModels((prev) => {
      const next = { ...prev };
      delete next[brand];
      return next;
    });
  };

  const renameBrand = (brand: string, value: string) => {
    const nextName = value.trim();
    if (!nextName || nextName === brand) return;
    setLocalBrands((prev) => prev.map((item) => (item === brand ? nextName : item)));
    setLocalModels((prev) => {
      const next = { ...prev, [nextName]: prev[brand] || [] };
      delete next[brand];
      return next;
    });
    setSelectedBrand(nextName);
  };

  const addModel = () => {
    const value = newModel.trim();
    if (!value || !selectedBrand) return;
    const list = localModels[selectedBrand] || [];
    if (list.some((model) => model.toLowerCase() === value.toLowerCase())) {
      toast.info('El modelo ya existe para esta marca');
      return;
    }
    setLocalModels((prev) => ({ ...prev, [selectedBrand]: [...list, value] }));
    setNewModel('');
  };

  const removeModel = (brand: string, index: number) => {
    setLocalModels((prev) => ({
      ...prev,
      [brand]: (prev[brand] || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localBrands, localModels);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[86vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Configurar marcas y modelos</DialogTitle>
        <DialogDescription>
          Administra la marca y los modelos asociados en una sola vista.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-5">
        <Card className="p-4">
          <Label>Nueva marca</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={newBrand}
              onChange={(e) => setNewBrand(e.target.value)}
              placeholder="Ej: Toyota"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBrand())}
            />
            <Button type="button" onClick={addBrand}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="mt-4 space-y-2 max-h-[26rem] overflow-y-auto">
            {localBrands.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay marcas configuradas.</p>
            ) : localBrands.map((brand) => (
              <div key={brand} className={`rounded-lg border p-2 ${selectedBrand === brand ? 'bg-primary/10 border-primary/30' : ''}`}>
                <button type="button" className="w-full text-left font-medium" onClick={() => setSelectedBrand(brand)}>
                  {brand}
                </button>
                <div className="mt-2 flex gap-2">
                  <Input defaultValue={brand} onBlur={(e) => renameBrand(brand, e.target.value)} className="h-8" />
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => removeBrand(brand)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Modelos de {selectedBrand || 'marca'}</h3>
              <p className="text-xs text-muted-foreground">Cada modelo queda vinculado a la marca seleccionada.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              placeholder="Ej: Hiace"
              disabled={!selectedBrand}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addModel())}
            />
            <Button type="button" onClick={addModel} disabled={!selectedBrand}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {!selectedBrand ? (
              <p className="text-sm text-muted-foreground">Seleccione o cree una marca.</p>
            ) : (localModels[selectedBrand] || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Esta marca aún no tiene modelos.</p>
            ) : (localModels[selectedBrand] || []).map((model, index) => (
              <Badge key={`${model}-${index}`} variant="secondary" className="pl-3 pr-1 py-1">
                {model}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-2"
                  onClick={() => removeModel(selectedBrand, index)}
                >
                  ×
                </Button>
              </Badge>
            ))}
          </div>
        </Card>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar marcas y modelos'}</Button>
      </div>
    </DialogContent>
  );
}

// Diálogo de configuración de marcas
function BrandConfigDialog({ brands, onSave, onClose }: any) {
  const [localBrands, setLocalBrands] = useState([...brands]);
  const [newBrand, setNewBrand] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    if (newBrand.trim() && !localBrands.includes(newBrand.trim())) {
      setLocalBrands([...localBrands, newBrand.trim()]);
      setNewBrand('');
    }
  };

  const commitPendingBrand = (): string[] => {
    const pending = newBrand.trim();
    if (!pending) return localBrands;
    if (localBrands.includes(pending)) return localBrands;
    const next = [...localBrands, pending];
    setLocalBrands(next);
    setNewBrand('');
    return next;
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(localBrands[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const updated = [...localBrands];
      updated[editingIndex] = editingValue.trim();
      setLocalBrands(updated);
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleDelete = (index: number) => {
    setLocalBrands(localBrands.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const next = commitPendingBrand();
      await onSave(next);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Configurar Marcas de Vehículos</DialogTitle>
        <DialogDescription>
          Gestiona las marcas de vehículos disponibles en el sistema
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            placeholder="Nueva marca..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
          <Button type="button" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {localBrands.map((brand, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {editingIndex === index ? (
                <>
                  <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveEdit}>
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{brand}</span>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(index)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Guardar Configuración
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// Diálogo de configuración de modelos
function ModelConfigDialog({ models, brands, onSave, onClose }: any) {
  const [localModels, setLocalModels] = useState({ ...models });
  const [selectedBrand, setSelectedBrand] = useState(brands[0] || '');
  const [newModel, setNewModel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const list = Array.isArray(brands) ? brands : [];
    if (list.length === 0) {
      if (selectedBrand) setSelectedBrand('');
      return;
    }
    if (!selectedBrand || !list.includes(selectedBrand)) {
      setSelectedBrand(list[0]);
    }
  }, [brands, selectedBrand]);

  const handleAddModel = () => {
    const pending = newModel.trim();
    if (pending && selectedBrand) {
      const brandModels = localModels[selectedBrand] || [];
      if (!brandModels.includes(pending)) {
        setLocalModels({
          ...localModels,
          [selectedBrand]: [...brandModels, pending]
        });
        setNewModel('');
      }
    }
  };

  const buildNextModelsWithPending = (): Record<string, string[]> => {
    const pending = newModel.trim();
    if (!pending || !selectedBrand) return localModels;
    const brandModels = localModels[selectedBrand] || [];
    if (brandModels.includes(pending)) return localModels;
    return {
      ...localModels,
      [selectedBrand]: [...brandModels, pending],
    };
  };

  const handleDeleteModel = (brand: string, modelIndex: number) => {
    const brandModels = localModels[brand] || [];
    setLocalModels({
      ...localModels,
      [brand]: brandModels.filter((_: any, i: number) => i !== modelIndex)
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const next = buildNextModelsWithPending();
      if (next !== localModels) {
        setLocalModels(next);
        setNewModel('');
      }
      await onSave(next);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Configurar Modelos por Marca</DialogTitle>
        <DialogDescription>
          Gestiona los modelos de vehículos para cada marca
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {(!Array.isArray(brands) || brands.length === 0) && (
          <div className="rounded-lg border p-3 text-sm text-muted-foreground">
            No hay marcas configuradas. Primero crea una marca en <b>Config. Marcas</b>.
          </div>
        )}
        <div>
          <Label>Seleccionar Marca</Label>
          {/* Select nativo (evita problemas de z-index/portal dentro de Dialog) */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            disabled={!Array.isArray(brands) || brands.length === 0}
            className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              Seleccione marca
            </option>
            {brands.map((brand: string) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Input
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            placeholder="Nuevo modelo..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddModel())}
            disabled={!selectedBrand}
          />
          <Button type="button" onClick={handleAddModel} disabled={!selectedBrand}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {brands.map((brand: string) => {
            const brandModels = localModels[brand] || [];
            if (brandModels.length === 0) return null;
            
            return (
              <div key={brand} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  {brand}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {brandModels.map((model: string, index: number) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1">
                      {model}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => handleDeleteModel(brand, index)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Guardar Configuración
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

function InspectionTemplateDialog({ templates, onSave, onRestore, onClose }: any) {
  const base = templates?.[0] || {
    name: 'Inspección vehicular - movilidad canina',
    categories: [{ name: 'Documentos', items: [{ label: 'Licencia', required: true }] }],
  };
  const [template, setTemplate] = useState<InspectionTemplate>({
    id: base.id,
    name: base.name || 'Inspección vehicular - movilidad canina',
    vehicle_type: base.vehicle_type || null,
    categories: (base.categories || []).map((category: any) => ({
      id: category.id,
      name: category.name,
      items: (category.items || []).map((item: any) => ({ id: item.id, label: item.label, required: item.required ?? true })),
    })),
  });
  const [saving, setSaving] = useState(false);

  const updateCategory = (index: number, value: string) => {
    setTemplate((prev) => ({
      ...prev,
      categories: prev.categories.map((category, i) => (i === index ? { ...category, name: value } : category)),
    }));
  };

  const addCategory = () => {
    setTemplate((prev) => ({
      ...prev,
      categories: [...prev.categories, { name: 'Nueva categoría', items: [{ label: 'Nuevo ítem', required: true }] }],
    }));
  };

  const addItem = (categoryIndex: number) => {
    setTemplate((prev) => ({
      ...prev,
      categories: prev.categories.map((category, i) => i === categoryIndex
        ? { ...category, items: [...category.items, { label: 'Nuevo ítem', required: true }] }
        : category),
    }));
  };

  const updateItem = (categoryIndex: number, itemIndex: number, value: string) => {
    setTemplate((prev) => ({
      ...prev,
      categories: prev.categories.map((category, i) => i === categoryIndex
        ? { ...category, items: category.items.map((item, j) => (j === itemIndex ? { ...item, label: value } : item)) }
        : category),
    }));
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    setTemplate((prev) => ({
      ...prev,
      categories: prev.categories.map((category, i) => i === categoryIndex
        ? { ...category, items: category.items.filter((_, j) => j !== itemIndex) }
        : category).filter((category) => category.items.length > 0),
    }));
  };

  const handleSave = async () => {
    const clean = {
      ...template,
      name: template.name.trim(),
      categories: template.categories
        .map((category) => ({
          ...category,
          name: category.name.trim(),
          items: category.items.map((item) => ({ ...item, label: item.label.trim(), required: item.required ?? true })).filter((item) => item.label),
        }))
        .filter((category) => category.name && category.items.length),
    };
    if (!clean.name || clean.categories.length === 0) {
      toast.error('La plantilla debe tener nombre y al menos una categoría con ítems');
      return;
    }
    setSaving(true);
    try {
      await onSave(clean);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Plantilla del checklist</DialogTitle>
        <DialogDescription>
          Define categorías e ítems. Cada inspección evaluará Cumple / No cumple y calculará el porcentaje.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input value={template.name} onChange={(e) => setTemplate({ ...template, name: e.target.value })} />
          <Button variant="outline" onClick={onRestore} type="button">Restaurar plantilla</Button>
          <Button onClick={addCategory} type="button"><Plus className="h-4 w-4 mr-2" />Categoría</Button>
        </div>
        <div className="space-y-4">
          {template.categories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Input value={category.name} onChange={(e) => updateCategory(categoryIndex, e.target.value)} />
                <Button variant="outline" onClick={() => addItem(categoryIndex)} type="button">
                  <Plus className="h-4 w-4 mr-2" />
                  Ítem
                </Button>
              </div>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex gap-2">
                    <Input value={item.label} onChange={(e) => updateItem(categoryIndex, itemIndex, e.target.value)} />
                    <Button variant="outline" className="text-red-600" onClick={() => removeItem(categoryIndex, itemIndex)} type="button">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar plantilla'}</Button>
      </div>
    </DialogContent>
  );
}

function SignaturePadLite({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 3;
    context.strokeStyle = '#0f172a';

    if (!value) return;
    const image = new Image();
    image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.src = value;
  }, [value]);

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const persistSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL('image/png'));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    const point = pointFromEvent(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    setDrawing(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    event.preventDefault();
    const context = event.currentTarget.getContext('2d');
    if (!context) return;
    const point = pointFromEvent(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!drawing) return;
    setDrawing(false);
    persistSignature();
  };

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={180}
      className="h-36 w-full rounded-lg border bg-white cursor-crosshair touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={stopDrawing}
      onPointerCancel={stopDrawing}
      onPointerLeave={stopDrawing}
      onPointerMove={handlePointerMove}
    />
  );
}

function InspectionApplyDialog({ vehicle, vehicles, templates, onVehicleChange, onSave, onClose }: any) {
  const template: InspectionTemplate | undefined = templates?.[0];
  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const initialResults = (template?.categories || []).flatMap((category) =>
    category.items.map((item) => ({
      template_item_id: item.id,
      category_name: category.name,
      item_label: item.label,
      passed: true,
      notes: '',
    }))
  );
  const [formData, setFormData] = useState({
    vehicleId: vehicle?.id || vehicles?.[0]?.id || '',
    inspected_at: nowLocal,
    odometer: vehicle?.mileage || vehicle?.kilometraje || '',
    driver_name: vehicle?.driver || vehicle?.driver_name || '',
    supervisor_name: '',
    observations: '',
    driver_signature: '',
    supervisor_signature: '',
    results: initialResults,
    attachments: [] as InspectionAttachmentDataUrl[],
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const compliance = formData.results.length
    ? Math.round((formData.results.filter((r) => r.passed).length / formData.results.length) * 1000) / 10
    : 0;

  const updateResult = (index: number, passed: boolean) => {
    setFormData((prev) => ({
      ...prev,
      results: prev.results.map((result, i) => (i === index ? { ...result, passed } : result)),
    }));
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      vehicleId: vehicle?.id || prev.vehicleId || vehicles?.[0]?.id || '',
      odometer: vehicle?.mileage || vehicle?.kilometraje || prev.odometer,
      driver_name: vehicle?.driver || vehicle?.driver_name || prev.driver_name,
    }));
  }, [vehicle, vehicles]);

  const grouped = formData.results.reduce((acc: Record<string, Array<any & { index: number }>>, result, index) => {
    acc[result.category_name] = acc[result.category_name] || [];
    acc[result.category_name].push({ ...result, index });
    return acc;
  }, {});

  const handleAttachmentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const invalid = selectedFiles.find((file) => {
      const allowedType = file.type.startsWith('image/') || file.type === 'application/pdf';
      return !allowedType || file.size > INSPECTION_ATTACHMENT_MAX_BYTES;
    });

    if (invalid) {
      toast.error(`"${invalid.name}" debe ser imagen/PDF y pesar máximo 1.8 MB`);
      event.target.value = '';
      return;
    }

    try {
      const attachments = await Promise.all(selectedFiles.map(async (file) => ({
        name: file.name,
        mime_type: file.type,
        size: file.size,
        data_url: await fileToDataUrl(file),
      })));
      setFormData((prev) => ({ ...prev, attachments }));
    } catch (_error) {
      toast.error('No se pudieron preparar los adjuntos');
    }
  };

  const handleSubmit = async () => {
    setSaveError('');
    if (!template) {
      toast.error('Primero configure una plantilla de inspección');
      setSaveError('Primero configure una plantilla de inspección.');
      return;
    }
    if (!formData.vehicleId) {
      toast.error('Seleccione una unidad');
      setSaveError('Seleccione una unidad.');
      return;
    }
    if (!String(formData.driver_name || '').trim()) {
      toast.error('El chofer es obligatorio');
      setSaveError('El chofer es obligatorio.');
      return;
    }
    if (!formData.driver_signature || !formData.supervisor_signature) {
      toast.error('Las firmas del chofer y supervisor son obligatorias');
      setSaveError('Las firmas del chofer y supervisor son obligatorias.');
      return;
    }
    setSaving(true);
    try {
      await onSave(formData.vehicleId, {
        ...formData,
        template_id: template.id,
        inspected_at: formData.inspected_at.replace('T', ' '),
      });
    } catch (error: any) {
      const details = error?.errors && typeof error.errors === 'object'
        ? Object.values(error.errors).flat().join(' ')
        : '';
      const message = details || error?.message || 'No se pudo guardar la inspección. Verifique que el backend esté activo y la migración ejecutada.';
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground">
      <div className="flex h-screen flex-col">
        <div className="border-b bg-gradient-to-r from-slate-950 to-slate-900 p-5 text-white">
          <div className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Truck className="h-5 w-5 text-cyan-300" />
              Nueva inspección — {vehicle?.plate || vehicle?.name}
            </h2>
            <p className="text-sm text-slate-300">
              Pantalla completa para aplicar checklist, fotos y firmas táctiles de chofer y supervisor.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Unidad</p>
              <p className="font-semibold">{vehicle?.name || 'Seleccione unidad'}</p>
              <p className="text-xs text-slate-400">{vehicle?.brand} {vehicle?.model} · {vehicle?.plate || 'Sin placa'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Estado</p>
              <p className="font-semibold">{getStatusConfig(vehicle?.status || '').label}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Odómetro</p>
              <p className="font-semibold">{formData.odometer || '—'} km</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Cumplimiento</p>
              <p className="font-semibold text-cyan-200">{compliance}%</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Unidad</Label>
            <select
              value={String(formData.vehicleId)}
              onChange={(e) => {
                setFormData({ ...formData, vehicleId: e.target.value });
                onVehicleChange(e.target.value);
              }}
              className="border-input bg-input-background text-foreground flex h-9 w-full rounded-md border px-3 py-2 text-sm"
            >
              {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.name} {v.plate ? `(${v.plate})` : ''}</option>)}
            </select>
          </div>
          <div>
            <Label>Fecha y hora</Label>
            <Input type="datetime-local" value={formData.inspected_at} onChange={(e) => setFormData({ ...formData, inspected_at: e.target.value })} />
          </div>
          <div>
            <Label>Odómetro (km)</Label>
            <Input type="number" value={formData.odometer} onChange={(e) => setFormData({ ...formData, odometer: e.target.value })} />
          </div>
          <div>
            <Label>Chofer</Label>
            <Input value={formData.driver_name} onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Supervisor / responsable</Label>
            <Input value={formData.supervisor_name} onChange={(e) => setFormData({ ...formData, supervisor_name: e.target.value })} />
          </div>
            </div>
          </Card>

        {Object.entries(grouped).map(([category, items]) => (
          <Card key={category} className="p-4 space-y-2">
            <p className="text-sm font-semibold text-primary">{category}</p>
            {items.map((item) => (
              <div key={item.index} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                <span className="text-sm font-medium">{item.item_label}</span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant={item.passed ? 'default' : 'outline'} onClick={() => updateResult(item.index, true)}>Cumple</Button>
                  <Button type="button" size="sm" variant={!item.passed ? 'destructive' : 'outline'} onClick={() => updateResult(item.index, false)}>No cumple</Button>
                </div>
              </div>
            ))}
          </Card>
        ))}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4 space-y-3">
              <div>
                <Label>Observaciones (opcional)</Label>
                <Textarea value={formData.observations} onChange={(e) => setFormData({ ...formData, observations: e.target.value })} rows={4} />
              </div>
              <div>
                <Label>Adjuntos (fotos / PDF ligeros)</Label>
                <Input type="file" multiple accept="image/*,.pdf" onChange={handleAttachmentChange} />
                <p className="mt-1 text-xs text-muted-foreground">{formData.attachments.length} archivo(s) seleccionado(s).</p>
              </div>
            </Card>
            <Card className="p-4 space-y-4">
              <div>
                <div className="flex justify-between"><Label>Firma táctil del chofer *</Label><Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, driver_signature: '' })}>Limpiar</Button></div>
                <SignaturePadLite value={formData.driver_signature} onChange={(value) => setFormData({ ...formData, driver_signature: value })} />
              </div>
              <div>
                <div className="flex justify-between"><Label>Firma táctil del supervisor *</Label><Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, supervisor_signature: '' })}>Limpiar</Button></div>
                <SignaturePadLite value={formData.supervisor_signature} onChange={(value) => setFormData({ ...formData, supervisor_signature: value })} />
              </div>
            </Card>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t bg-background p-4">
          {saveError ? (
            <div className="mr-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
              {saveError}
            </div>
          ) : null}
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Guardando...' : 'Guardar inspección'}</Button>
        </div>
      </div>
    </div>
  );
}

function InspectionHistoryDialog({ vehicle, inspections, onView, onClose }: any) {
  return (
    <DialogContent className="max-w-3xl max-h-[86vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Historial de inspecciones</DialogTitle>
        <DialogDescription>{vehicle.name} {vehicle.plate ? `(${vehicle.plate})` : ''}</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        {inspections.length === 0 ? (
          <p className="text-sm text-muted-foreground">Esta unidad aún no tiene inspecciones.</p>
        ) : inspections.map((inspection: VehicleInspectionRecord) => (
          <div key={inspection.id} className="rounded-lg border p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{formatDate(inspection.inspected_at)} · {inspection.compliance_percent}%</p>
              <p className="text-sm text-muted-foreground">Chofer: {inspection.driver_name || '—'} · Supervisor: {inspection.supervisor_name || '—'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onView(inspection)}>Ver detalle</Button>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4 border-t"><Button variant="outline" onClick={onClose}>Cerrar</Button></div>
    </DialogContent>
  );
}

function InspectionDetailDialog({ inspection, onClose }: { inspection: VehicleInspectionRecord; onClose: () => void }) {
  const groupedResults = inspection.results.reduce((acc: Record<string, typeof inspection.results>, result) => {
    acc[result.category_name] = acc[result.category_name] || [];
    acc[result.category_name].push(result);
    return acc;
  }, {});

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Detalle inspección</DialogTitle>
        <DialogDescription>
          {inspection.vehicle?.name || `Vehículo #${inspection.vehicle_id}`} · Cumplimiento {inspection.compliance_percent}%
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          ['Fecha', formatDate(inspection.inspected_at)],
          ['Placa', inspection.vehicle?.placa || inspection.vehicle?.plate || '—'],
          ['Odómetro', inspection.odometer != null ? `${inspection.odometer} km` : '—'],
          ['Chofer', inspection.driver_name || '—'],
          ['Supervisor', inspection.supervisor_name || '—'],
          ['Cumplimiento', `${inspection.compliance_percent}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
          </div>
        ))}
      </div>
      {Object.entries(groupedResults).map(([category, results]) => (
        <Card key={category} className="p-4">
          <h4 className="font-semibold mb-3">{category}</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ítem</TableHead>
                <TableHead>Respuesta</TableHead>
                <TableHead>Notas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={result.id || `${category}-${index}`}>
                  <TableCell className="font-medium">{result.item_label}</TableCell>
                  <TableCell>
                    <Badge variant={result.passed ? 'secondary' : 'destructive'}>{result.passed ? 'Cumple' : 'No cumple'}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{result.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ))}
      <div>
        <Label>Observaciones</Label>
        <div className="mt-1 rounded-lg border bg-muted/20 p-3 text-sm">{inspection.observations || '—'}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Firma chofer</Label>
          <div className="h-32 rounded-lg border bg-white p-2">
            {inspection.driver_signature ? <img src={inspection.driver_signature} alt="Firma chofer" className="h-full w-full object-contain" /> : null}
          </div>
        </div>
        <div>
          <Label>Firma supervisor</Label>
          <div className="h-32 rounded-lg border bg-white p-2">
            {inspection.supervisor_signature ? <img src={inspection.supervisor_signature} alt="Firma supervisor" className="h-full w-full object-contain" /> : null}
          </div>
        </div>
      </div>
      {inspection.attachments?.length ? (
        <div>
          <Label>Adjuntos</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {inspection.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.data_url || attachment.url}
                download={attachment.name || `inspeccion-adjunto-${attachment.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline"
              >
                {attachment.name || `Adjunto ${attachment.id}`}
              </a>
            ))}
          </div>
        </div>
      ) : null}
      <div className="flex justify-end pt-4 border-t"><Button variant="outline" onClick={onClose}>Cerrar</Button></div>
    </DialogContent>
  );
}

// Diálogo de configuración de tipos de mantenimiento
function MaintenanceTypeConfigDialog({ maintenanceTypes, onSave, onClose }: any) {
  const [localTypes, setLocalTypes] = useState([...maintenanceTypes]);
  const [newType, setNewType] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    if (newType.trim() && !localTypes.includes(newType.trim())) {
      setLocalTypes([...localTypes, newType.trim()]);
      setNewType('');
    }
  };

  const commitPendingType = (): string[] => {
    const pending = newType.trim();
    if (!pending) return localTypes;
    if (localTypes.includes(pending)) return localTypes;
    const next = [...localTypes, pending];
    setLocalTypes(next);
    setNewType('');
    return next;
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(localTypes[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const updated = [...localTypes];
      updated[editingIndex] = editingValue.trim();
      setLocalTypes(updated);
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleDelete = (index: number) => {
    setLocalTypes(localTypes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const next = commitPendingType();
      await onSave(next);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Configurar Tipos de Mantenimiento</DialogTitle>
        <DialogDescription>
          Gestiona los tipos de mantenimiento disponibles para los vehículos
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="Nuevo tipo de mantenimiento..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
          <Button type="button" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {localTypes.map((type, index) => (
            <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {editingIndex === index ? (
                <>
                  <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveEdit}>
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{type}</span>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(index)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Guardar Configuración
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// Diálogo de mantenimiento
function MaintenanceDialog({ maintenance, vehicles, maintenanceTypes, workshops, onSave, onClose }: any) {
  const expenseAccounts = CHART_OF_ACCOUNTS.filter(a => a.type === 'expense' && a.category === 'Gastos de Vehículos');
  const defaultExpenseAccountCode =
    expenseAccounts.find((a) => a.code === '63102000')?.code ||
    expenseAccounts[0]?.code ||
    '';

  const normalize = (s: string) =>
    (s || '')
      .normalize('NFD')
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const suggestAccountCodeForType = (type: string): string => {
    const t = normalize(type);
    if (!t) return defaultExpenseAccountCode;

    const exact = expenseAccounts.find(a => normalize(a.name) === t);
    if (exact) return exact.code;

    // Coincidencia parcial (p.ej. "Reparación" -> "Reparaciones", "ITV" -> "ITV y Documentación")
    const partial = expenseAccounts.find(a => {
      const an = normalize(a.name);
      return an.includes(t) || t.includes(an);
    });
    if (partial) return partial.code;

    return defaultExpenseAccountCode;
  };

  const initialType = maintenance?.type || maintenanceTypes?.[0] || 'Mantenimiento Preventivo';
  const initialAccountCode = maintenance?.accountCode || suggestAccountCodeForType(initialType);

  const [formData, setFormData] = useState({
    vehicleId: maintenance?.vehicleId || vehicles?.[0]?.id || '',
    type: initialType,
    description: maintenance?.description || '',
    date: maintenance?.date || new Date().toISOString().split('T')[0],
    cost: maintenance?.cost || 0,
    workshopRuc: maintenance?.workshopRuc || '',
    workshop: maintenance?.workshop || '',
    workshopAddress: maintenance?.workshopAddress || '',
    workshopPhone: maintenance?.workshopPhone || '',
    nextDue: maintenance?.nextDue || '',
    status: maintenance?.status || 'completed',
    accountCode: initialAccountCode
  });

  // Si el usuario cambia manualmente la cuenta, no la sobreescribimos al cambiar tipo
  const [accountTouched, setAccountTouched] = useState(Boolean(maintenance?.accountCode));

  const workshopsList: any[] = Array.isArray(workshops) ? workshops : [];
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('');
  const [workshopSelectionTouched, setWorkshopSelectionTouched] = useState(false);

  // Preseleccionar taller si el mantenimiento ya tiene RUC que coincide con configuración.
  useEffect(() => {
    if (!maintenance?.workshopRuc) return;
    const ruc = String(maintenance.workshopRuc).replace(/\D/g, '').slice(0, 11);
    const match = workshopsList.find((w: any) => String(w?.ruc || '').replace(/\D/g, '').slice(0, 11) === ruc);
    if (match) setSelectedWorkshopId(String(match.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si cambian los vehículos (p.ej. acabas de crear uno), asegurar que haya un seleccionado válido.
  useEffect(() => {
    const list = Array.isArray(vehicles) ? vehicles : [];
    if (list.length === 0) return;
    const exists = list.some((v: any) => String(v?.id) === String(formData.vehicleId));
    if (!formData.vehicleId || !exists) {
      setFormData((prev: any) => ({ ...prev, vehicleId: list[0]?.id ?? '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles]);

  // Autocompletar datos del taller al ingresar RUC
  const handleRucChange = (ruc: string) => {
    const cleanRuc = ruc.replace(/\D/g, ''); // Solo números
    const foundWorkshop = cleanRuc.length === 11
      ? workshopsList.find((w: any) => String(w?.ruc || '').replace(/\D/g, '').slice(0, 11) === cleanRuc)
      : null;

    setFormData((prev: any) => ({
      ...prev,
      workshopRuc: cleanRuc,
      workshop: foundWorkshop ? foundWorkshop.name : prev.workshop,
      workshopAddress: foundWorkshop ? (foundWorkshop.address || '') : prev.workshopAddress,
      workshopPhone: foundWorkshop ? (foundWorkshop.phone || '') : prev.workshopPhone,
    }));
    
    if (foundWorkshop) {
      if (!workshopSelectionTouched) setSelectedWorkshopId(String(foundWorkshop.id));
      toast.success('Datos del taller autocompletados');
    } else if (!workshopSelectionTouched) {
      setSelectedWorkshopId('');
    }
  };

  const handleSelectWorkshop = (value: string) => {
    setWorkshopSelectionTouched(true);
    setSelectedWorkshopId(value);
    if (!value) {
      setFormData((prev: any) => ({
        ...prev,
        workshopRuc: '',
        workshop: '',
        workshopAddress: '',
        workshopPhone: '',
      }));
      return;
    }
    const w = workshopsList.find((x: any) => String(x?.id) === String(value));
    if (!w) return;
    const cleanRuc = String(w?.ruc || '').replace(/\D/g, '').slice(0, 11);
    setFormData((prev: any) => ({
      ...prev,
      workshopRuc: cleanRuc,
      workshop: String(w?.name || ''),
      workshopAddress: String(w?.address || ''),
      workshopPhone: String(w?.phone || ''),
    }));
  };

  const handleTypeChange = (type: string) => {
    const suggested = suggestAccountCodeForType(type);
    setFormData((prev: any) => ({
      ...prev,
      type,
      accountCode: accountTouched ? prev.accountCode : suggested
    }));
  };

  const sanitizeIsoDateInput = (value: string) => {
    if (!value) return '';
    const raw = String(value).trim();
    const parts = raw.split('-');
    const y = (parts[0] || '').replace(/\D/g, '').slice(0, 4);
    const m = (parts[1] || '').replace(/\D/g, '').slice(0, 2);
    const d = (parts[2] || '').replace(/\D/g, '').slice(0, 2);
    if (!m) return y;
    if (!d) return `${y}-${m}`;
    return `${y}-${m}-${d}`;
  };

  const isValidISODate = (value: string) => {
    if (!value) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split('-').map((n) => Number(n));
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return false;
    if (y < 1900 || y > 2100) return false;
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones adicionales
    if (!isValidISODate(formData.date)) {
      toast.error('Fecha inválida. Verifica que el año tenga 4 dígitos.');
      return;
    }
    if (formData.nextDue && !isValidISODate(formData.nextDue)) {
      toast.error('Próximo mantenimiento inválido. Verifica que el año tenga 4 dígitos.');
      return;
    }
    if (formData.workshopRuc.length !== 11) {
      toast.error('El RUC debe tener 11 dígitos');
      return;
    }
    
    if (Number.isNaN(Number(formData.cost)) || Number(formData.cost) < 0) {
      toast.error('El costo no puede ser negativo');
      return;
    }

    onSave(formData);
    toast.success(maintenance ? 'Mantenimiento actualizado' : 'Mantenimiento registrado');
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{maintenance ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}</DialogTitle>
        <DialogDescription>
          {maintenance ? 'Modifica un registro de mantenimiento' : 'Registra un nuevo mantenimiento o reparación'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Vehículo */}
        <div>
          <Label>Vehículo *</Label>
          <select
            value={String(formData.vehicleId || '')}
            onChange={(e) => setFormData({ ...formData, vehicleId: Number(e.target.value) })}
            disabled={!Array.isArray(vehicles) || vehicles.length === 0}
            className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="" disabled>
              {Array.isArray(vehicles) && vehicles.length ? 'Seleccione un vehículo' : 'No hay vehículos'}
            </option>
            {(Array.isArray(vehicles) ? vehicles : []).map((vehicle: any) => (
              <option key={vehicle.id} value={String(vehicle.id)}>
                {vehicle.name} {vehicle.plate ? `(${vehicle.plate})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Mantenimiento y Estado */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Mantenimiento *</Label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="" disabled>Seleccione tipo</option>
              {(Array.isArray(maintenanceTypes) ? maintenanceTypes : []).map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Estado *</Label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="completed">Completado</option>
              <option value="in_progress">En Proceso</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <Label>Descripción *</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe el mantenimiento realizado..."
            required
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Fecha, Costo y Próximo Mantenimiento */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Fecha *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: sanitizeIsoDateInput(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label>Costo (S/) *</Label>
            <Input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label>Próximo Mantenimiento</Label>
            <Input
              type="date"
              value={formData.nextDue}
              onChange={(e) => setFormData({ ...formData, nextDue: sanitizeIsoDateInput(e.target.value) })}
              placeholder="dd/mm/aaaa"
            />
          </div>
        </div>

        {/* Taller guardado (opcional) */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Opcional: Cargar datos de taller guardado
          </p>
          <select
            value={selectedWorkshopId}
            onChange={(e) => handleSelectWorkshop(e.target.value)}
            disabled={workshopsList.length === 0}
            className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              -- Ingresar Manualmente / Nuevo --
            </option>
            {workshopsList.map((w: any) => (
              <option key={w.id} value={String(w.id)}>
                {(w?.name || 'Taller').toString()} {w?.ruc ? `(${w.ruc})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* RUC y Taller/Proveedor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>RUC Taller/Proveedor *</Label>
            <Input
              value={formData.workshopRuc}
              onChange={(e) => handleRucChange(e.target.value)}
              placeholder="20123456789"
              maxLength={11}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ingrese el RUC de 11 dígitos
            </p>
          </div>

          <div>
            <Label>Taller/Proveedor *</Label>
            <Input
              value={formData.workshop}
              onChange={(e) => setFormData({ ...formData, workshop: e.target.value })}
              placeholder="Nombre del taller o proveedor"
              required
            />
          </div>
        </div>

        {/* Dirección y Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Dirección</Label>
            <Input
              value={formData.workshopAddress}
              onChange={(e) => setFormData({ ...formData, workshopAddress: e.target.value })}
              placeholder="Dirección del taller"
            />
          </div>

          <div>
            <Label>Teléfono</Label>
            <Input
              value={formData.workshopPhone}
              onChange={(e) => setFormData({ ...formData, workshopPhone: e.target.value })}
              placeholder="+51 987 654 321"
            />
          </div>
        </div>

        {/* Cuenta Contable */}
        <div>
          <Label>Cuenta Contable *</Label>
          <select
            value={formData.accountCode}
            onChange={(e) => {
              setAccountTouched(true);
              setFormData({ ...formData, accountCode: e.target.value });
            }}
            className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="" disabled>Seleccione cuenta</option>
            {expenseAccounts.map((account) => (
              <option key={account.code} value={account.code}>
                {account.code} - {account.name}
              </option>
            ))}
          </select>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            {maintenance ? 'Guardar Cambios' : 'Registrar Mantenimiento'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Diálogo de gastos
function ExpenseDialog({ expense, vehicles, onSave, onClose }: any) {
  const expenseAccounts = CHART_OF_ACCOUNTS.filter(a => a.type === 'expense' && a.category === 'Gastos de Vehículos');
  const sanitizeIsoDateInput = (value: string) => {
    if (!value) return '';
    const raw = String(value).trim();
    const parts = raw.split('-');
    const y = (parts[0] || '').replace(/\D/g, '').slice(0, 4);
    const m = (parts[1] || '').replace(/\D/g, '').slice(0, 2);
    const d = (parts[2] || '').replace(/\D/g, '').slice(0, 2);
    if (!m) return y;
    if (!d) return `${y}-${m}`;
    return `${y}-${m}-${d}`;
  };

  const isValidISODate = (value: string) => {
    if (!value) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split('-').map((n) => Number(n));
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return false;
    if (y < 1900 || y > 2100) return false;
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d
    );
  };

  const pad3 = (n: any) => String(n ?? '').padStart(3, '0');
  const vehicleLabel = (v: any) => {
    const idTag = v?.id != null ? `#${pad3(v.id)}` : '';
    return `${v?.name || 'Vehículo'} ${idTag}`.trim();
  };

  const suggestedAccountByCategory = (category: string) => {
    const map: Record<string, string> = {
      'Combustible': '63101010',
      'Mantenimiento': '63102000',
      'Reparación': '63103000',
      'Seguro': '63104000',
      'ITV/Documentación': '63105000',
      'Equipamiento': '63106000',
      'Limpieza/Suministros': '63107000',
      'Peajes': '63108000',
      'Estacionamiento': '63109000',
      'Otros': '63199000',
    };
    const desired = map[category] || '63199000';
    return expenseAccounts.find(a => a.code === desired)?.code || expenseAccounts[0]?.code || '';
  };

  const initialAccount = expense?.accountCode || suggestedAccountByCategory(expense?.category || 'Combustible');
  const [formData, setFormData] = useState({
    vehicleId: expense?.vehicleId || vehicles[0]?.id || '',
    category: expense?.category || 'Combustible',
    amount: expense?.amount || 0,
    date: expense?.date || new Date().toISOString().split('T')[0],
    description: expense?.description || '',
    accountCode: initialAccount
  });

  const [accountTouched, setAccountTouched] = useState(Boolean(expense?.accountCode));

  // Si cambian los vehículos (p.ej. acabas de crear uno), asegurar que haya un seleccionado válido.
  useEffect(() => {
    const list = Array.isArray(vehicles) ? vehicles : [];
    if (list.length === 0) return;
    const exists = list.some((v: any) => String(v?.id) === String(formData.vehicleId));
    if (!formData.vehicleId || !exists) {
      setFormData((prev: any) => ({ ...prev, vehicleId: list[0]?.id ?? '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles]);

  const handleCategoryChange = (category: string) => {
    const suggested = suggestedAccountByCategory(category);
    setFormData((prev: any) => ({
      ...prev,
      category,
      accountCode: accountTouched ? prev.accountCode : suggested,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.error('Seleccione un vehículo');
      return;
    }
    if (!isValidISODate(formData.date)) {
      toast.error('Fecha inválida. Verifica que el año tenga 4 dígitos.');
      return;
    }
    if (Number.isNaN(Number(formData.amount)) || Number(formData.amount) < 0) {
      toast.error('El monto no puede ser negativo');
      return;
    }
    if (!formData.accountCode) {
      toast.error('Seleccione una cuenta contable');
      return;
    }
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{expense ? 'Editar Gasto' : 'Nuevo Gasto'}</DialogTitle>
        <DialogDescription>
          {expense ? 'Modifica el registro de gasto del vehículo' : 'Registra un nuevo gasto asociado al vehículo'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Vehículo *</Label>
          <select
            value={String(formData.vehicleId || '')}
            onChange={(e) => setFormData({ ...formData, vehicleId: Number(e.target.value) })}
            disabled={!Array.isArray(vehicles) || vehicles.length === 0}
            className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="" disabled>
              {Array.isArray(vehicles) && vehicles.length ? 'Seleccione un vehículo' : 'No hay vehículos'}
            </option>
            {(Array.isArray(vehicles) ? vehicles : []).map((vehicle: any) => (
              <option key={vehicle.id} value={String(vehicle.id)}>
                {vehicleLabel(vehicle)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Categoría *</Label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="Combustible">Combustible</option>
              <option value="Mantenimiento">Mantenimiento</option>
              <option value="Reparación">Reparación</option>
              <option value="Seguro">Seguro</option>
              <option value="ITV/Documentación">ITV/Documentación</option>
              <option value="Equipamiento">Equipamiento</option>
              <option value="Limpieza/Suministros">Limpieza/Suministros</option>
              <option value="Peajes">Peajes</option>
              <option value="Estacionamiento">Estacionamiento</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div>
            <Label>Monto (S/) *</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <Label>Fecha *</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: sanitizeIsoDateInput(e.target.value) })}
            required
          />
        </div>

        <div>
          <Label>Cuenta Contable *</Label>
          <select
            value={formData.accountCode}
            onChange={(e) => {
              setAccountTouched(true);
              setFormData({ ...formData, accountCode: e.target.value });
            }}
            className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="" disabled>
              Seleccione cuenta
            </option>
            {expenseAccounts.map((account) => (
              <option key={account.code} value={account.code}>
                {account.code} - {account.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Descripción</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detalles del gasto..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {expense ? 'Guardar Cambios' : 'Registrar Gasto'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Diálogo de servicios programados
function ServiceDialog({ vehicles, maintenanceTypes, onSave, onClose }: any) {
  const sanitizeIsoDateInput = (value: string) => {
    if (!value) return '';
    const raw = String(value).trim();
    const parts = raw.split('-');
    const y = (parts[0] || '').replace(/\D/g, '').slice(0, 4);
    const m = (parts[1] || '').replace(/\D/g, '').slice(0, 2);
    const d = (parts[2] || '').replace(/\D/g, '').slice(0, 2);
    if (!m) return y;
    if (!d) return `${y}-${m}`;
    return `${y}-${m}-${d}`;
  };

  const isValidISODate = (value: string) => {
    if (!value) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split('-').map((n) => Number(n));
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return false;
    if (y < 1900 || y > 2100) return false;
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d
    );
  };

  const pad3 = (n: any) => String(n ?? '').padStart(3, '0');
  const vehicleLabel = (v: any) => {
    const idTag = v?.id != null ? `#${pad3(v.id)}` : '';
    return `${v?.name || 'Vehículo'} ${idTag}`.trim();
  };

  const [formData, setFormData] = useState({
    vehicleId: vehicles[0]?.id || '',
    type: maintenanceTypes[0] || 'Mantenimiento',
    description: '',
    dueDate: '',
    priority: 'medium',
    estimatedCost: 0
  });

  // Sincronizar defaults si cambia la lista (p.ej. creas un vehículo o configuras tipos).
  useEffect(() => {
    const list = Array.isArray(vehicles) ? vehicles : [];
    if (list.length === 0) return;
    const exists = list.some((v: any) => String(v?.id) === String(formData.vehicleId));
    if (!formData.vehicleId || !exists) {
      setFormData((prev: any) => ({ ...prev, vehicleId: list[0]?.id ?? '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles]);

  useEffect(() => {
    const types = Array.isArray(maintenanceTypes) ? maintenanceTypes : [];
    if (types.length === 0) return;
    if (!formData.type || !types.includes(formData.type)) {
      setFormData((prev: any) => ({ ...prev, type: types[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maintenanceTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      toast.error('Seleccione un vehículo');
      return;
    }
    if (!isValidISODate(formData.dueDate)) {
      toast.error('Fecha programada inválida. Verifica que el año tenga 4 dígitos.');
      return;
    }
    if (Number.isNaN(Number(formData.estimatedCost)) || Number(formData.estimatedCost) < 0) {
      toast.error('El costo estimado no puede ser negativo');
      return;
    }
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Programar Servicio</DialogTitle>
        <DialogDescription>
          Programa un próximo servicio de mantenimiento para un vehículo
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Vehículo *</Label>
          <select
            value={String(formData.vehicleId || '')}
            onChange={(e) => setFormData({ ...formData, vehicleId: Number(e.target.value) })}
            disabled={!Array.isArray(vehicles) || vehicles.length === 0}
            className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="" disabled>
              {Array.isArray(vehicles) && vehicles.length ? 'Seleccione un vehículo' : 'No hay vehículos'}
            </option>
            {(Array.isArray(vehicles) ? vehicles : []).map((vehicle: any) => (
              <option key={vehicle.id} value={String(vehicle.id)}>
                {vehicleLabel(vehicle)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Servicio *</Label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              disabled={!Array.isArray(maintenanceTypes) || maintenanceTypes.length === 0}
              className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="" disabled>
                {Array.isArray(maintenanceTypes) && maintenanceTypes.length ? 'Seleccione tipo' : 'No hay tipos'}
              </option>
              {(Array.isArray(maintenanceTypes) ? maintenanceTypes : []).map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Prioridad *</Label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="border-input bg-input-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>

        <div>
          <Label>Descripción *</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe el servicio a realizar..."
            required
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Fecha Programada *</Label>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: sanitizeIsoDateInput(e.target.value) })}
              required
            />
          </div>

          <div>
            <Label>Costo Estimado (S/)</Label>
            <Input
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Programar Servicio
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

// Diálogo de configuración de talleres/proveedores
function WorkshopConfigDialog({ workshops, onSave, onClose }: any) {
  const [localWorkshops, setLocalWorkshops] = useState([...workshops]);
  const [showNewWorkshop, setShowNewWorkshop] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    ruc: '',
    address: '',
    phone: ''
  });

  const handleAdd = () => {
    setFormData({ id: 0, name: '', ruc: '', address: '', phone: '' });
    setEditingWorkshop(null);
    setShowNewWorkshop(true);
  };

  const handleEdit = (workshop: any) => {
    setFormData(workshop);
    setEditingWorkshop(workshop);
    setShowNewWorkshop(true);
  };

  const handleSaveWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRuc = String(formData.ruc || '').replace(/\D/g, '').slice(0, 11);
    const cleanName = String(formData.name || '').trim();
    const cleanAddress = String(formData.address || '').trim();
    const cleanPhone = String(formData.phone || '').trim();

    if (!validateRuc(cleanRuc)) {
      toast.error('El RUC debe tener 11 dígitos numéricos');
      return;
    }
    if (!cleanName) {
      toast.error('Ingrese el nombre del taller');
      return;
    }

    const hasDuplicateRuc = localWorkshops.some((w: any) => {
      if (editingWorkshop && String(w.id) === String(editingWorkshop.id)) return false;
      const r = String(w?.ruc || '').replace(/\D/g, '').slice(0, 11);
      return r === cleanRuc;
    });
    if (hasDuplicateRuc) {
      toast.error('Ya existe un taller con ese RUC');
      return;
    }

    const next = {
      ...formData,
      ruc: cleanRuc,
      name: cleanName,
      address: cleanAddress,
      phone: cleanPhone,
    };
    if (editingWorkshop) {
      setLocalWorkshops(localWorkshops.map((w: any) => 
        w.id === editingWorkshop.id ? next : w
      ));
    } else {
      setLocalWorkshops([...localWorkshops, { ...next, id: Date.now() }]);
    }
    setShowNewWorkshop(false);
    setFormData({ id: 0, name: '', ruc: '', address: '', phone: '' });
  };

  const handleDelete = (id: number) => {
    setLocalWorkshops(localWorkshops.filter((w: any) => w.id !== id));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(localWorkshops);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const validateRuc = (ruc: string) => {
    return /^\d{11}$/.test(ruc);
  };

  return (
    <DialogContent className="w-[min(96vw,72rem)] max-w-5xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Configurar Talleres y Proveedores</DialogTitle>
        <DialogDescription>
          Gestiona los talleres y proveedores para mantenimientos de vehículos. Estos datos se autocompletarán al ingresar el RUC.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Taller
          </Button>
        </div>

        {/* Lista de talleres */}
        <div className="border rounded-lg overflow-hidden bg-background">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-muted-foreground">RUC</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Nombre</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Dirección</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Teléfono</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {localWorkshops.length === 0 ? (
                <tr className="border-t">
                  <td className="p-6 text-center text-muted-foreground" colSpan={5}>
                    No hay talleres registrados.
                  </td>
                </tr>
              ) : (
                localWorkshops.map((workshop: any, index: number) => (
                  <tr
                    key={workshop.id}
                    className={`border-t ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                  >
                    <td className="p-3 font-mono">{workshop.ruc}</td>
                    <td className="p-3">{workshop.name}</td>
                    <td className="p-3 text-muted-foreground">{workshop.address}</td>
                    <td className="p-3">{workshop.phone}</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(workshop)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(workshop.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal para nuevo/editar taller */}
        {showNewWorkshop && (
          <div className="border rounded-lg p-6 bg-muted/20">
            <h3 className="font-semibold mb-4">
              {editingWorkshop ? 'Editar Taller' : 'Nuevo Taller'}
            </h3>
            <form onSubmit={handleSaveWorkshop} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>RUC *</Label>
                  <Input
                    value={formData.ruc}
                    onChange={(e) => setFormData({ ...formData, ruc: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                    placeholder="20123456789"
                    maxLength={11}
                    required
                  />
                  {formData.ruc && !validateRuc(formData.ruc) && (
                    <p className="text-xs text-red-600 mt-1">El RUC debe tener 11 dígitos numéricos</p>
                  )}
                </div>
                <div>
                  <Label>Nombre del Taller *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Taller ABC"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dirección</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Av. Principal 123, Lima"
                  />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+51 987 654 321"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewWorkshop(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingWorkshop ? 'Guardar Cambios' : 'Agregar Taller'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            Guardar Configuración
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
