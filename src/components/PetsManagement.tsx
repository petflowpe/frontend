import { useState, useEffect, useRef, useCallback } from 'react';

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import {
  PawPrint,
  Plus,
  Search,
  Edit,
  Trash2,
  Dog,
  Cat,
  Calendar,
  Heart,
  Users,
  List,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  X,
  FileSpreadsheet,
  FileDown,
  Mars,
  Venus,
  Gift,
  Cake,
  CalendarClock,
  FileText,
  Syringe,
  Bug,
  Loader2,
  Columns,
  Check,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  ChevronsUpDown,
} from 'lucide-react';
import { Tooltip } from './ui/tooltip';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useClients } from '../hooks/useClients';
import { usePagination } from '../hooks/usePagination';
import { apiClient } from '../utils/api/client';
import { setPendingAction } from '../utils/navigationBridge';
import { PET_DOG_BREEDS, PET_CAT_BREEDS, PET_TEMPERAMENTS, PET_BEHAVIORS } from '../config/defaults';
import { PetProfile } from './PetProfile';
import { getRoleKey, type CurrentUserLike } from '../utils/permissions';

const DEFAULT_SPECIES = ['Perro', 'Gato', 'Otro'];
const MIN_PET_PHOTOS = 0;
const MAX_PET_PHOTOS = 5;

const STORAGE_KEY_PETS_PREFS = 'pets-management-prefs';
const EXPORT_CONFIRM_THRESHOLD = 50;
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const EXPORT_COLUMN_OPTIONS: { key: string; label: string }[] = [
  { key: 'Nombre', label: 'Nombre' },
  { key: 'Especie', label: 'Especie' },
  { key: 'Raza', label: 'Raza' },
  { key: 'Sexo', label: 'Sexo' },
  { key: 'Edad', label: 'Edad' },
  { key: 'Peso_kg', label: 'Peso (kg)' },
  { key: 'Cliente', label: 'Cliente' },
  { key: 'Chip', label: 'Chip' },
  { key: 'Fecha_nacimiento', label: 'F. nacimiento' },
  { key: 'Estado', label: 'Estado' },
];

type IdentificationType = 'Microchip' | 'Placa' | 'Pasaporte' | 'Otro';
type NewOwnerMode = 'primary' | 'additional';

interface ClientRecord {
  id: number | string;
  fullName?: string;
  documentNumber?: string;
  razon_social?: string;
  numero_documento?: string;
}

interface PetPhotoRecord {
  id: number;
  url?: string;
  path?: string;
  sort_order?: number;
}

interface PetRecord {
  id: number | string;
  client_id?: number | string;
  company_id?: number | string | null;
  client?: ClientRecord | null;
  owners?: ClientRecord[];
  photos?: PetPhotoRecord[];
  name?: string;
  last_name?: string | null;
  species?: string;
  breed?: string;
  age?: number | string | null;
  weight?: number | string | null;
  size?: string | null;
  gender?: string | null;
  color?: string | null;
  microchip?: string | null;
  identification_type?: IdentificationType | string | null;
  identification_number?: string | null;
  temperament?: string[] | string | null;
  behavior?: string[] | string | null;
  birth_date?: string | null;
  sterilized?: boolean;
  sterilization_date?: string | null;
  last_vaccination_date?: string | null;
  next_vaccination_date?: string | null;
  last_deworming_date?: string | null;
  next_deworming_date?: string | null;
  insurance_company?: string | null;
  insurance_policy_number?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  allergies?: string[] | string | null;
  medications?: string[] | string | null;
  notes?: string | null;
  fallecido?: boolean;
}

interface PetFormData {
  name: string;
  lastName1: string;
  species: string;
  breed: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  age: string;
  ageYears: string;
  ageMonths: string;
  ageDays: string;
  weight: string | number;
  size: string;
  gender: string;
  color: string;
  microchip: string;
  temperament: string[];
  behavior: string[];
  birthDate: string;
  sterilized: boolean;
  sterilizationDate: string;
  lastVaccinationDate: string;
  nextVaccinationDate: string;
  lastDewormingDate: string;
  nextDewormingDate: string;
  insuranceCompany: string;
  insurancePolicyNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string[];
  medications: string[];
  ownerIds: string[];
  notes: string;
  deceased: boolean;
}

interface PetSaveOptions {
  defaultPhotoId?: number;
  defaultNewIndex?: number;
  removePhotoIds?: number[];
}

interface PetSubmitPayload extends PetFormData {
  last_name: string;
  identification_type: string | null;
  identification_number: string;
}

interface PetFormProps {
  pet: PetRecord | null;
  selectedClient: ClientRecord | null;
  clients: ClientRecord[];
  createClient: (payload: unknown) => Promise<ClientRecord>;
  onClientChange: (client: ClientRecord | null) => void;
  onSave: (data: PetSubmitPayload, photoFiles?: File[], options?: PetSaveOptions) => Promise<void> | void;
  onCancel: () => void;
  speciesList?: string[];
  breedsBySpecies?: Record<string, string[]>;
  temperaments?: string[];
  behaviors?: string[];
  minPhotos?: number;
  maxPhotos?: number;
  existingPets?: PetRecord[];
}

interface PetTimelineEvent {
  id: number | string;
  type: 'medical_record' | 'vaccine' | 'appointment';
  event_type?: string;
  title: string;
  description?: string | null;
  occurred_at?: string | null;
}

/** Formato dd/mm/yyyy para exportación */
function formatDateForExport(value: string | null | undefined): string {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const y = d.getFullYear();
    return `${day}/${m}/${y}`;
  } catch {
    return '';
  }
}

/** Días hasta el próximo cumpleaños (0 = hoy, negativo = ya pasó este año) */
function getDaysUntilBirthday(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  const next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

/** Días hasta una fecha (ej. próxima vacuna/desparasitación). null si no hay fecha o ya pasó. */
function getDaysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff < 0 ? null : diff;
}

/** Convierte fecha ISO o cualquier string de fecha al formato yyyy-MM-dd que exige <input type="date"> */
function toDateInputValue(value: string | null | undefined): string {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return '';
  }
}

function loadSavedPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PETS_PREFS);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toSortedUniqueList(items: string[]): string[] {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

function parseMultiValue(value: unknown): string[] {
  if (Array.isArray(value)) return toSortedUniqueList(value.map((v) => String(v)));
  if (typeof value === 'string') {
    return toSortedUniqueList(value.split(',').map((v) => v.trim()));
  }
  return [];
}

function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function safeInt(value: string): number {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function agePartsFromBirthDate(dateValue: string): { years: string; months: string; days: string } {
  if (!dateValue) return { years: '', months: '', days: '' };
  const birth = new Date(dateValue);
  if (Number.isNaN(birth.getTime())) return { years: '', months: '', days: '' };
  const today = new Date();
  birth.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const daysPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += daysPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return { years: '', months: '', days: '' };
  return { years: String(years), months: String(months), days: String(days) };
}

function birthDateFromAgeParts(yearsValue: string, monthsValue: string, daysValue: string): string {
  if (!yearsValue && !monthsValue && !daysValue) return '';
  const years = safeInt(yearsValue);
  const months = safeInt(monthsValue);
  const days = safeInt(daysValue);
  const today = new Date();
  const birth = new Date(today);
  birth.setHours(0, 0, 0, 0);
  birth.setFullYear(birth.getFullYear() - years);
  birth.setMonth(birth.getMonth() - months);
  birth.setDate(birth.getDate() - days);
  return formatDateInput(birth);
}

function getPetDisplayName(pet: PetRecord | null | undefined): string {
  const firstName = String(pet?.name || '').trim();
  const lastName = String(pet?.last_name || '').trim();
  return [firstName, lastName].filter(Boolean).join(' ').trim() || firstName;
}

function getOwnerIdsFromPet(petData: PetRecord | null | undefined): string[] {
  if (Array.isArray(petData?.owners) && petData.owners.length > 0) {
    return petData.owners.map((owner) => String(owner.id));
  }
  if (petData?.client_id) return [String(petData.client_id)];
  if (petData?.client?.id) return [String(petData.client.id)];
  return [];
}

function buildInitialPetFormData(pet: PetRecord | null | undefined): PetFormData {
  const initialBirthDate = toDateInputValue(pet?.birth_date) || '';
  const initialAgeParts = initialBirthDate
    ? agePartsFromBirthDate(initialBirthDate)
    : { years: String(pet?.age || ''), months: '', days: '' };

  return {
    name: pet?.name || '',
    lastName1: pet?.last_name || '',
    species: pet?.species || 'Perro',
    breed: pet?.breed || '',
    identificationType: (pet?.identification_type as IdentificationType) || (pet?.microchip ? 'Microchip' : 'Otro'),
    identificationNumber: pet?.identification_number || pet?.microchip || '',
    age: String(pet?.age || initialAgeParts.years || ''),
    ageYears: initialAgeParts.years,
    ageMonths: initialAgeParts.months,
    ageDays: initialAgeParts.days,
    weight: pet?.weight || '',
    size: pet?.size || '',
    gender: pet?.gender || 'Macho',
    color: pet?.color || '',
    microchip: pet?.microchip || pet?.identification_number || '',
    temperament: parseMultiValue(pet?.temperament),
    behavior: parseMultiValue(pet?.behavior),
    birthDate: initialBirthDate,
    sterilized: pet?.sterilized || false,
    sterilizationDate: toDateInputValue(pet?.sterilization_date) || '',
    lastVaccinationDate: toDateInputValue(pet?.last_vaccination_date) || '',
    nextVaccinationDate: toDateInputValue(pet?.next_vaccination_date) || '',
    lastDewormingDate: toDateInputValue(pet?.last_deworming_date) || '',
    nextDewormingDate: toDateInputValue(pet?.next_deworming_date) || '',
    insuranceCompany: pet?.insurance_company || '',
    insurancePolicyNumber: pet?.insurance_policy_number || '',
    emergencyContactName: pet?.emergency_contact_name || '',
    emergencyContactPhone: pet?.emergency_contact_phone || '',
    allergies: Array.isArray(pet?.allergies) ? pet.allergies : (pet?.allergies ? [pet.allergies] : []),
    medications: Array.isArray(pet?.medications) ? pet.medications : (pet?.medications ? [pet.medications] : []),
    ownerIds: getOwnerIdsFromPet(pet),
    notes: pet?.notes || '',
    deceased: pet?.fallecido || false,
  };
}

export function PetsManagement({
  onNavigate,
  currentUser,
}: {
  onNavigate?: (tab: string) => void;
  currentUser?: CurrentUserLike | null;
}) {
  const canDeletePets = getRoleKey(currentUser).toLowerCase() === 'super_admin';
  const userCompanyId = (currentUser as { companyId?: number; company_id?: number } | null | undefined)?.companyId
    ?? (currentUser as { companyId?: number; company_id?: number } | null | undefined)?.company_id
    ?? null;
  const savedPrefs = useRef(loadSavedPrefs());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(() => (savedPrefs.current?.statusFilter as string) ?? 'all');
  const [speciesFilter, setSpeciesFilter] = useState<string>(() => (savedPrefs.current?.speciesFilter as string) ?? 'all');
  const [breedFilter, setBreedFilter] = useState<string>(() => (savedPrefs.current?.breedFilter as string) ?? 'all');
  const [genderFilter, setGenderFilter] = useState<string>(() => (savedPrefs.current?.genderFilter as string) ?? 'all');
  const [birthdaySoonOnly, setBirthdaySoonOnly] = useState(() => (savedPrefs.current?.birthdaySoonOnly as boolean) ?? false);
  const [sortBy, setSortBy] = useState<string>(() => (savedPrefs.current?.sortBy as string) ?? 'name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => (savedPrefs.current?.sortOrder as 'asc' | 'desc') ?? 'asc');
  const [exportScope, setExportScope] = useState<'page' | 'all'>('page');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => (savedPrefs.current?.viewMode as 'cards' | 'table') ?? 'table');
  const [pageSize, setPageSize] = useState<number>(() => {
    const saved = Number(savedPrefs.current?.pageSize);
    return Number.isFinite(saved) && saved > 0 ? saved : 15;
  });
  const [exportColumns, setExportColumns] = useState<string[]>(() => (savedPrefs.current?.exportColumns as string[]) ?? EXPORT_COLUMN_OPTIONS.map((c) => c.key));
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [searchDebouncing, setSearchDebouncing] = useState(false);
  const [showExportAllConfirm, setShowExportAllConfirm] = useState(false);
  const [exportPendingAction, setExportPendingAction] = useState<'excel' | 'pdf' | null>(null);
  const [petToDelete, setPetToDelete] = useState<string | null>(null);
  const [showNewPet, setShowNewPet] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetRecord | null>(null);
  const [editingPet, setEditingPet] = useState<PetRecord | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const { clients, createClient } = useClients();

  const pagination = usePagination<PetRecord>(pageSize);
  const { data: pets, meta, setResult, setData, setLoading, loading, page, lastPage, total, perPage, setMeta, buildParams, goToPage, nextPage, prevPage } = pagination;

  const [showPetTimeline, setShowPetTimeline] = useState(false);
  const [timelinePet, setTimelinePet] = useState<PetRecord | null>(null);
  const [petTimeline, setPetTimeline] = useState<PetTimelineEvent[]>([]);
  const [petAudit, setPetAudit] = useState<Array<{ id: number; action: string; description?: string; created_at?: string }>>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [speciesList, setSpeciesList] = useState<string[]>([]);
  const [dogBreeds, setDogBreeds] = useState([...PET_DOG_BREEDS]);
  const [catBreeds, setCatBreeds] = useState([...PET_CAT_BREEDS]);
  const [breedsBySpecies, setBreedsBySpecies] = useState<Record<string, string[]>>({});
  const [temperaments, setTemperaments] = useState([...PET_TEMPERAMENTS]);
  const [behaviors, setBehaviors] = useState([...PET_BEHAVIORS]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const petModalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.toggle('pets-modal-open', showNewPet);
    return () => {
      document.body.classList.remove('pets-modal-open');
    };
  }, [showNewPet]);

  useEffect(() => {
    if (!showNewPet) return;
    requestAnimationFrame(() => {
      petModalScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    });
  }, [showNewPet, editingPet?.id]);

  // Cargar configuraciones desde el API
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setLoadingConfigs(true);
    try {
      const response = await apiClient.get<{
        species?: string[];
        dog_breeds?: string[];
        cat_breeds?: string[];
        breeds_by_species?: Record<string, string[]>;
        temperaments?: string[];
        behaviors?: string[];
      } | { data: Record<string, unknown> }>('/pet-configurations/all');
      const configs = response && typeof response === 'object' && 'data' in response && response.data
        ? response.data
        : (response as Record<string, unknown>);

      const species = Array.isArray(configs.species) && configs.species.length > 0 ? configs.species : DEFAULT_SPECIES;
      setSpeciesList(species);
      const dogB = Array.isArray(configs.dog_breeds) ? configs.dog_breeds : [];
      const catB = Array.isArray(configs.cat_breeds) ? configs.cat_breeds : [];
      setDogBreeds(dogB);
      setCatBreeds(catB);
      const bySpecies = (configs.breeds_by_species && typeof configs.breeds_by_species === 'object') ? configs.breeds_by_species as Record<string, string[]> : {};
      const merged: Record<string, string[]> = {};
      species.forEach((s: string) => {
        merged[s] = Array.isArray(bySpecies[s]) ? bySpecies[s] : (s === 'Perro' ? dogB : s === 'Gato' ? catB : []);
      });
      setBreedsBySpecies(merged);
      setTemperaments(Array.isArray(configs.temperaments) ? configs.temperaments : []);
      setBehaviors(Array.isArray(configs.behaviors) ? configs.behaviors : []);
    } catch (error: any) {
      console.error('Error loading configurations:', error);
      setSpeciesList(DEFAULT_SPECIES);
      toast.error('No se pudieron cargar las configuraciones, usando valores por defecto');
    } finally {
      setLoadingConfigs(false);
    }
  };

  const loadPets = useCallback(async (pageNum?: number) => {
    setSearchDebouncing(false);
    setLoading(true);
    try {
      const params: Record<string, string> = {
        ...buildParams(pageNum ?? page, searchTerm),
        per_page: String(perPage),
      };
      if (statusFilter === 'active') params.only_active = '1';
      if (statusFilter === 'deceased') params.fallecido = '1';
      if (speciesFilter && speciesFilter !== 'all') params.species = speciesFilter;
      if (breedFilter && breedFilter !== 'all') params.breed = breedFilter;
      if (genderFilter && genderFilter !== 'all') params.gender = genderFilter;
      if (birthdaySoonOnly) params.birthday_soon = '1';
      if (userCompanyId != null) params.company_id = String(userCompanyId);
      params.sort_by = sortBy;
      params.sort_order = sortOrder;

      const response = await apiClient.get<{ data: PetRecord[]; meta: Record<string, unknown> }>('/pets', params);
      const res = response as { data?: PetRecord[]; meta?: Record<string, unknown> };
      setResult({ data: res.data || [], meta: res.meta || { total: 0, per_page: perPage, current_page: 1, last_page: 1 } });
    } catch (error: any) {
      console.error('Error loading pets:', error);
      toast.error(error.message || 'Error al cargar mascotas');
      setResult({ data: [], meta: { total: 0, per_page: perPage, current_page: 1, last_page: 1 } });
    } finally {
      setLoading(false);
    }
  }, [page, perPage, searchTerm, statusFilter, speciesFilter, breedFilter, genderFilter, birthdaySoonOnly, sortBy, sortOrder, buildParams, userCompanyId]);

  const openPetTimeline = useCallback(async (pet: PetRecord) => {
    setTimelinePet(pet);
    setShowPetTimeline(true);
    setTimelineLoading(true);
    try {
      const [timelineRes, auditRes] = await Promise.all([
        apiClient.get<{ data?: { timeline?: PetTimelineEvent[] } }>(`/pets/${pet.id}/timeline`),
        apiClient.get<{ data?: Array<{ id: number; action: string; description?: string; created_at?: string }> }>(`/pets/${pet.id}/audit-history`, { per_page: '15' }),
      ]);
      const t = (timelineRes as { data?: { timeline?: PetTimelineEvent[] } })?.data?.timeline ?? [];
      const a = (auditRes as { data?: Array<{ id: number; action: string; description?: string; created_at?: string }> })?.data ?? [];
      setPetTimeline(t);
      setPetAudit(a);
    } catch (error: any) {
      setPetTimeline([]);
      setPetAudit([]);
      toast.error(error?.message || 'No se pudo cargar timeline/auditoría');
    } finally {
      setTimelineLoading(false);
    }
  }, []);

  useEffect(() => {
    setMeta((prev) => ({ ...prev, per_page: pageSize, current_page: 1 }));
  }, [pageSize, setMeta]);

  useEffect(() => {
    const timer = setTimeout(() => loadPets(), searchTerm ? 500 : 0);
    return () => clearTimeout(timer);
  }, [page, statusFilter, searchTerm, speciesFilter, breedFilter, genderFilter, birthdaySoonOnly, sortBy, sortOrder, loadPets]);

  // Persistir preferencias en localStorage
  useEffect(() => {
    const prefs = {
      statusFilter,
      speciesFilter,
      breedFilter,
      genderFilter,
      birthdaySoonOnly,
      sortBy,
      sortOrder,
      viewMode,
      pageSize,
      exportColumns,
    };
    localStorage.setItem(STORAGE_KEY_PETS_PREFS, JSON.stringify(prefs));
  }, [statusFilter, speciesFilter, breedFilter, genderFilter, birthdaySoonOnly, sortBy, sortOrder, viewMode, pageSize, exportColumns]);

  const handleExportExcelRef = useRef<() => void>(() => {});
  const handleExportPDFRef = useRef<() => void>(() => {});
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      if (e.key === 'e') {
        e.preventDefault();
        handleExportExcelRef.current();
        return;
      }
      if (e.key === 'P' && e.shiftKey) {
        e.preventDefault();
        handleExportPDFRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSavePet = async (
    petData: PetSubmitPayload,
    photoFiles?: File[],
    options?: PetSaveOptions
  ) => {
    try {
      const selectedClientId = selectedClient?.id ? Number(selectedClient.id) : null;
      const fallbackClientId = editingPet ? Number(editingPet.client_id || editingPet.client?.id || 0) : null;
      const clientId = selectedClientId || fallbackClientId;

      if (!clientId) {
        toast.error('Selecciona un cliente primero');
        return;
      }

      const backendData: Record<string, unknown> = {
        client_id: clientId,
        name: petData.name,
        last_name: petData.last_name || null,
        species: petData.species || 'Perro',
        breed: petData.breed || '',
        age: petData.age ? parseInt(petData.age) : null,
        weight: petData.weight ? parseFloat(petData.weight) : null,
        size: petData.size || null,
        gender: petData.gender || 'Macho',
        color: petData.color || '',
        microchip: petData.microchip || '',
        identification_type: petData.identification_type || null,
        identification_number: petData.identification_number || null,
        temperament: Array.isArray(petData.temperament)
          ? (petData.temperament.length > 0 ? petData.temperament.join(', ') : null)
          : (petData.temperament || null),
        behavior: Array.isArray(petData.behavior) && petData.behavior.length > 0 ? petData.behavior : null,
        birth_date: petData.birthDate || null,
        sterilized: petData.sterilized || false,
        sterilization_date: petData.sterilizationDate || null,
        last_vaccination_date: petData.lastVaccinationDate || null,
        next_vaccination_date: petData.nextVaccinationDate || null,
        last_deworming_date: petData.lastDewormingDate || null,
        next_deworming_date: petData.nextDewormingDate || null,
        insurance_company: petData.insuranceCompany || null,
        insurance_policy_number: petData.insurancePolicyNumber || null,
        emergency_contact_name: petData.emergencyContactName || null,
        emergency_contact_phone: petData.emergencyContactPhone || null,
        allergies: Array.isArray(petData.allergies) && petData.allergies.length > 0 ? petData.allergies : null,
        medications: Array.isArray(petData.medications) && petData.medications.length > 0 ? petData.medications : null,
        notes: petData.notes || '',
        fallecido: petData.deceased || false,
      };

      const ownerIds = Array.from(new Set(
        (Array.isArray(petData.ownerIds) ? petData.ownerIds : [String(clientId)])
          .map((id: string | number) => Number(id))
          .filter((id: number) => Number.isFinite(id) && id > 0)
      ));
      backendData.owner_ids = ownerIds.length > 0 ? ownerIds : [clientId];

      const hasPhotos = photoFiles && photoFiles.length >= 1;
      const hasRemovedPhotos = Array.isArray(options?.removePhotoIds) && options.removePhotoIds.length > 0;
      if (hasPhotos && photoFiles!.length < MIN_PET_PHOTOS && !editingPet) {
        toast.error(`Sube al menos ${MIN_PET_PHOTOS} fotos para la mascota`);
        return;
      }

      if (editingPet) {
        if (options?.defaultPhotoId != null) {
          backendData.default_photo_id = options.defaultPhotoId;
        }
        const putRes = await apiClient.put<PetRecord>(`/pets/${editingPet.id}`, backendData);
        const petFromPut = (putRes && typeof putRes === 'object' && 'id' in putRes) ? putRes : (putRes?.data ?? putRes);
        let updatedPet = petFromPut ? { ...editingPet, ...petFromPut } : editingPet;
        if (hasPhotos || hasRemovedPhotos) {
          try {
            const formData = new FormData();
            photoFiles?.forEach((f) => formData.append('photos[]', f));
            if (options?.defaultPhotoId != null) {
              formData.append('default_photo_id', String(options.defaultPhotoId));
            }
            if (options?.defaultNewIndex != null) {
              formData.append('default_new_index', String(options.defaultNewIndex));
            }
            if (hasRemovedPhotos) {
              options?.removePhotoIds?.forEach((id) => formData.append('remove_photo_ids[]', String(id)));
            }
            const photoRes = await apiClient.post<PetRecord>(`/pets/${editingPet.id}/photos`, formData, undefined as never, true);
            const petWithPhotos = (photoRes && typeof photoRes === 'object' && 'photos' in photoRes) ? photoRes : (photoRes?.data ?? photoRes);
            if (petWithPhotos?.photos) updatedPet = { ...updatedPet, photos: petWithPhotos.photos };
          } catch (photoErr) {
            console.error('Error subiendo fotos:', photoErr);
            toast.error('Mascota guardada pero no se pudieron subir las fotos');
          }
        }
        setData((prev) => prev.map((p) => (String(p.id) === String(editingPet.id) ? updatedPet : p)));
        toast.success('Mascota actualizada exitosamente');
      } else {
        const created = await apiClient.post<PetRecord>('/pets', backendData);
        const createdPet = created?.data ?? created;
        if (hasPhotos && createdPet?.id) {
          const formData = new FormData();
          photoFiles!.forEach((f) => formData.append('photos[]', f));
          if (options?.defaultNewIndex != null) {
            formData.append('default_new_index', String(options.defaultNewIndex));
          }
          await apiClient.post(`/pets/${createdPet.id}/photos`, formData, undefined as never, true);
        }
        toast.success('Mascota creada exitosamente');
        goToPage(1);
        loadPets(1);
      }

      setShowNewPet(false);
      setEditingPet(null);
      setSelectedClient(null);
    } catch (error: any) {
      console.error('Error saving pet:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Error al guardar mascota');
    }
  };

  const resetPetEditorState = useCallback(() => {
    setSelectedPet(null);
    setEditingPet(null);
    setSelectedClient(null);
  }, []);

  const openEditPetModal = useCallback((pet: PetRecord) => {
    setSelectedPet(pet);
    setEditingPet(pet);
    const primaryOwnerId = String(
      pet.client_id
        || pet.client?.id
        || (Array.isArray(pet.owners) && pet.owners.length > 0 ? pet.owners[0]?.id : '')
    );
    const foundClient = clients?.find((c: ClientRecord) => String(c.id) === primaryOwnerId);
    setSelectedClient(foundClient || null);
    setShowNewPet(true);
  }, [clients]);

  const handleDeletePet = (petId: string) => {
    setPetToDelete(petId);
  };

  const navigateToPetContext = useCallback((tab: 'appointments' | 'medical', pet: PetRecord) => {
    setPendingAction(tab, 'focus_pet', {
      petId: String(pet?.id || ''),
      petName: getPetDisplayName(pet),
      ownerName: pet?.client?.razon_social || (Array.isArray(pet?.owners) ? pet.owners[0]?.razon_social : '') || '',
    });
    onNavigate?.(tab);
  }, [onNavigate]);

  /** Ir a Citas y abrir directamente el paso de crear cita con esta mascota */
  const navigateToNewAppointmentWithPet = useCallback((pet: PetRecord) => {
    const clientId = pet?.client_id ?? (pet?.client as any)?.id ?? (Array.isArray(pet?.owners) ? pet.owners[0]?.id : undefined);
    setPendingAction('appointments', 'new_appointment_with_pet', {
      petId: String(pet?.id || ''),
      clientId: clientId != null ? String(clientId) : undefined,
      petName: getPetDisplayName(pet),
      ownerName: pet?.client?.razon_social || (Array.isArray(pet?.owners) ? pet.owners[0]?.razon_social : '') || '',
    });
    onNavigate?.('appointments');
  }, [onNavigate]);

  /** Ir a Clientes y abrir el formulario de la mascota (editar) */
  const navigateToClientsEditPet = useCallback((pet: PetRecord) => {
    const clientId = pet?.client_id ?? (pet?.client as any)?.id ?? (Array.isArray(pet?.owners) ? pet.owners[0]?.id : undefined);
    setPendingAction('clients', 'edit_pet', {
      petId: String(pet?.id || ''),
      clientId: clientId != null ? String(clientId) : undefined,
    });
    onNavigate?.('clients');
  }, [onNavigate]);

  const [profilePetId, setProfilePetId] = useState<number | null>(null);
  const openPetProfile = useCallback((pet: PetRecord) => {
    const id = Number(pet.id);
    if (Number.isFinite(id) && id > 0) setProfilePetId(id);
  }, []);

  const confirmDeletePet = useCallback(async () => {
    if (!petToDelete) return;
    try {
      await apiClient.delete(`/pets/${petToDelete}`);
      toast.success('Mascota eliminada');
      setPetToDelete(null);
      loadPets();
    } catch (error: any) {
      console.error('Error deleting pet:', error);
      toast.error(error?.message || 'Error al eliminar mascota');
      setPetToDelete(null);
    }
  }, [petToDelete, loadPets]);

  const getExportParams = () => {
    const params: Record<string, string> = {};
    if (statusFilter === 'active') params.only_active = '1';
    if (statusFilter === 'deceased') params.fallecido = '1';
    if (searchTerm) params.search = searchTerm;
    if (speciesFilter && speciesFilter !== 'all') params.species = speciesFilter;
    if (breedFilter && breedFilter !== 'all') params.breed = breedFilter;
    if (genderFilter && genderFilter !== 'all') params.gender = genderFilter;
    if (birthdaySoonOnly) params.birthday_soon = '1';
    params.sort_by = sortBy;
    params.sort_order = sortOrder;
    return params;
  };

  const buildExportRows = useCallback((list: PetRecord[]) => {
    const cols = exportColumns.length > 0 ? exportColumns : EXPORT_COLUMN_OPTIONS.map((c) => c.key);
    return list.map((p) => {
      const full: Record<string, string | number> = {
        Nombre: getPetDisplayName(p),
        Especie: p.species || '',
        Raza: p.breed || '',
        Sexo: p.gender || '',
        Edad: p.age != null ? p.age : '',
        Peso_kg: p.weight != null ? p.weight : '',
        Cliente: p.client?.razon_social || '',
        Chip: p.microchip || '',
        Fecha_nacimiento: formatDateForExport(p.birth_date),
        Estado: p.fallecido ? 'Fallecido' : 'Activo',
      };
      const row: Record<string, string | number> = {};
      cols.forEach((col) => {
        if (full[col] !== undefined) row[col] = full[col];
      });
      return row;
    });
  }, [exportColumns]);

  const runExportExcel = useCallback(async () => {
    setExportingExcel(true);
    try {
      let dataToExport = pets;
      if (exportScope === 'all') {
        const params: Record<string, string> = { ...getExportParams(), per_page: '5000', page: '1' };
        const res = await apiClient.get<{ data: PetRecord[] }>('/pets', params);
        dataToExport = (res as { data?: PetRecord[] })?.data ?? [];
      }
      const rows = buildExportRows(dataToExport);
      if (rows.length === 0) {
        toast.info('No hay datos para exportar');
        return;
      }
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Mascotas');
      const name = `Mascotas_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, name);
      toast.success('Excel descargado', { description: exportScope === 'all' ? `Todas (${dataToExport.length})` : name });
    } catch (e: any) {
      console.error(e);
      toast.error('Error al exportar Excel');
    } finally {
      setExportingExcel(false);
    }
  }, [pets, exportScope, getExportParams, buildExportRows]);

  const handleExportExcel = useCallback(async () => {
    if (exportingExcel || exportingPdf) return;
    if (exportScope === 'all' && total > EXPORT_CONFIRM_THRESHOLD) {
      setExportPendingAction('excel');
      setShowExportAllConfirm(true);
      return;
    }
    await runExportExcel();
  }, [exportScope, total, exportingExcel, exportingPdf, runExportExcel]);

  const runExportPDF = useCallback(async () => {
    setExportingPdf(true);
    try {
      const params: Record<string, string> = {
        ...getExportParams(),
      };
      if (exportScope === 'page') {
        params.page = String(page);
        params.per_page = String(perPage);
      }
      const qs = new URLSearchParams(params).toString();
      const dateLabel = new Date().toISOString().split('T')[0];
      const fileName = exportScope === 'all'
        ? `Mascotas_${dateLabel}.pdf`
        : `Mascotas_pagina_${page}_${dateLabel}.pdf`;
      await apiClient.downloadFile(`/pets/export/pdf${qs ? '?' + qs : ''}`, fileName);
      toast.success('PDF descargado', {
        description: exportScope === 'all'
          ? `Listado completo (${total} mascotas).`
          : `Página ${page} descargada (${pets.length} mascotas).`,
      });
    } catch (e: any) {
      toast.error(e?.message || 'Error al descargar PDF');
    } finally {
      setExportingPdf(false);
    }
  }, [exportScope, getExportParams, page, perPage, pets.length, total]);

  const handleExportPDF = useCallback(async () => {
    if (exportingExcel || exportingPdf) return;
    if (exportScope === 'all' && total > EXPORT_CONFIRM_THRESHOLD) {
      setExportPendingAction('pdf');
      setShowExportAllConfirm(true);
      return;
    }
    await runExportPDF();
  }, [exportScope, total, exportingExcel, exportingPdf, runExportPDF]);

  handleExportExcelRef.current = handleExportExcel;
  handleExportPDFRef.current = handleExportPDF;

  const onConfirmExportAll = useCallback(async () => {
    if (exportPendingAction === 'excel') await runExportExcel();
    if (exportPendingAction === 'pdf') await runExportPDF();
    setShowExportAllConfirm(false);
    setExportPendingAction(null);
  }, [exportPendingAction, runExportExcel, runExportPDF]);

  const breedsForFilter = speciesFilter && speciesFilter !== 'all' ? (breedsBySpecies[speciesFilter] || []) : [];
  const speciesOptions = speciesList.length ? speciesList : DEFAULT_SPECIES;

  if (profilePetId) {
    return <PetProfile petId={profilePetId} onClose={() => setProfilePetId(null)} />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-0 min-w-0">
      {/* 1. Encabezado de página: título y subtítulo siempre arriba (jerarquía clara) */}
      <header className="pb-4 sm:pb-5 md:pb-6 border-b border-gray-100 dark:border-gray-800/80">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 ring-1 ring-purple-200/50 dark:ring-purple-800/50">
            <PawPrint className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 pt-0.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Gestión de Mascotas
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl">
              Administra todas las mascotas registradas en el sistema
            </p>
          </div>
        </div>
      </header>

      {/* Filtros compactos */}
      <Card className="p-3 sm:p-4 mt-4 mb-4 sm:mt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, raza o cliente..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.trim()) setSearchDebouncing(true);
                }}
                className="pl-9 pr-9 h-9"
                aria-label="Buscar mascotas por nombre, raza o cliente"
              />
              {searchDebouncing && (
                <span className="absolute right-3 top-2.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando…
                </span>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                  <SlidersHorizontal className="h-4 w-4" />
                  Orden: {sortBy === 'name' ? 'Nombre' : sortBy === 'age' ? 'Edad' : sortBy === 'birth_date' ? 'F. nac.' : 'Especie'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="space-y-1">
                  {[
                    { value: 'name', label: 'Nombre' },
                    { value: 'age', label: 'Edad' },
                    { value: 'birth_date', label: 'F. nacimiento' },
                    { value: 'species', label: 'Especie' },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={sortBy === opt.value ? 'default' : 'ghost'}
                      size="sm"
                      className="w-full justify-start h-8"
                      onClick={() => setSortBy(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-8 gap-2 mt-1"
                    onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                  >
                    {sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                    {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1 shrink-0">Estado:</span>
            {[
              { value: 'all', label: 'Todas' },
              { value: 'active', label: 'Activas' },
              { value: 'deceased', label: 'Fallecidas' },
            ].map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={statusFilter === opt.value ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => setStatusFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}

            <span className="text-xs text-muted-foreground mx-1 shrink-0 hidden sm:inline">|</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={speciesFilter !== 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  {speciesFilter === 'all' ? 'Especie' : speciesFilter}
                  <ChevronsUpDown className="h-3 w-3 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar especie…" />
                  <CommandList>
                    <CommandEmpty>Sin resultados</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all-species"
                        onSelect={() => {
                          setSpeciesFilter('all');
                          setBreedFilter('all');
                        }}
                      >
                        Todas especies
                      </CommandItem>
                      {speciesOptions.map((s) => (
                        <CommandItem
                          key={s}
                          value={s}
                          onSelect={() => {
                            setSpeciesFilter(s);
                            setBreedFilter('all');
                          }}
                        >
                          {s}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant={breedFilter !== 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 px-2.5 text-xs gap-1"
                  disabled={speciesFilter === 'all'}
                >
                  {breedFilter === 'all' ? 'Raza' : breedFilter}
                  <ChevronsUpDown className="h-3 w-3 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar raza…" />
                  <CommandList>
                    <CommandEmpty>Sin resultados</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="all-breeds" onSelect={() => setBreedFilter('all')}>
                        Todas razas
                      </CommandItem>
                      {breedsForFilter.map((r) => (
                        <CommandItem key={r} value={r} onSelect={() => setBreedFilter(r)}>
                          {r}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <span className="text-xs text-muted-foreground mx-1 shrink-0 hidden sm:inline">|</span>

            <span className="text-xs text-muted-foreground mr-1 shrink-0">Sexo:</span>
            {[
              { value: 'all', label: 'Todos' },
              { value: 'Macho', label: 'Macho' },
              { value: 'Hembra', label: 'Hembra' },
            ].map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={genderFilter === opt.value ? 'default' : 'outline'}
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => setGenderFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}

            <Button
              type="button"
              variant={birthdaySoonOnly ? 'default' : 'outline'}
              size="sm"
              className="h-8 px-2.5 text-xs gap-1"
              onClick={() => setBirthdaySoonOnly((v) => !v)}
            >
              <Cake className="h-3.5 w-3.5" />
              Cumple próximos
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
            <Select value={exportScope} onValueChange={(v: 'page' | 'all') => setExportScope(v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs" aria-label="Ámbito de exportación">
                <SelectValue>
                  {exportScope === 'page' ? `Página (${pets.length})` : `Todas (${total})`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="page">Página actual ({pets.length})</SelectItem>
                <SelectItem value="all">Todas ({total})</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1" aria-label="Seleccionar columnas para exportar">
                  <Columns className="h-4 w-4" />
                  Columnas
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="start">
                <p className="font-medium text-sm mb-2">Columnas en Excel/PDF</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {EXPORT_COLUMN_OPTIONS.map((opt) => (
                    <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={exportColumns.includes(opt.key)}
                        onCheckedChange={(checked) => {
                          if (checked) setExportColumns((c) => (c.includes(opt.key) ? c : [...c, opt.key]));
                          else setExportColumns((c) => c.filter((k) => k !== opt.key));
                        }}
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={exportingExcel || exportingPdf}
              className="h-8 gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
              aria-label="Exportar a Excel"
            >
              {exportingExcel ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={exportingExcel || exportingPdf}
              className="h-8 gap-1.5 text-rose-700 border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-900/20"
              aria-label="Exportar a PDF"
            >
              {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              PDF
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={showExportAllConfirm} onOpenChange={(open) => { if (!open) { setShowExportAllConfirm(false); setExportPendingAction(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exportar todas las mascotas</AlertDialogTitle>
            <AlertDialogDescription>
              Se exportarán {total} mascotas (según los filtros actuales). ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmExportAll}>
              {exportPendingAction === 'excel' ? 'Descargar Excel' : 'Descargar PDF'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!petToDelete} onOpenChange={(open) => { if (!open) setPetToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mascota</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar esta mascota? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePet} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showPetTimeline} onOpenChange={setShowPetTimeline}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Timeline y Auditoría: {timelinePet ? getPetDisplayName(timelinePet) : ''}</DialogTitle>
            <DialogDescription>Eventos clínicos, citas y cambios auditables recientes.</DialogDescription>
          </DialogHeader>
          {timelineLoading ? (
            <div className="py-8 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Timeline clínico</h4>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {petTimeline.length === 0 && <p className="text-sm text-muted-foreground">Sin eventos registrados.</p>}
                  {petTimeline.map((event) => (
                    <div key={`${event.type}-${event.id}`} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.type} · {event.occurred_at || '-'}</p>
                      {event.description && <p className="text-sm mt-1">{event.description}</p>}
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Auditoría</h4>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {petAudit.length === 0 && <p className="text-sm text-muted-foreground">Sin auditoría reciente.</p>}
                  {petAudit.map((log) => (
                    <div key={log.id} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.created_at || '-'}</p>
                      {log.description && <p className="text-sm mt-1">{log.description}</p>}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lista de mascotas */}
      {loading ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium">Mascota</th>
                    <th className="text-left p-3 font-medium">Especie / Raza</th>
                    <th className="text-left p-3 font-medium">Sexo</th>
                    <th className="text-left p-3 font-medium">Cliente(s)</th>
                    <th className="text-left p-3 font-medium">Edad / Peso</th>
                    <th className="text-left p-3 font-medium">Cumple / Salud</th>
                    <th className="text-left p-3 font-medium">Estado</th>
                    <th className="text-right p-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.min(perPage, 8) }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b last:border-0">
                      <td className="p-3"><Skeleton className="h-10 w-44" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-36" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-20" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-48" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-28" /></td>
                      <td className="p-3"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="p-3 text-right"><Skeleton className="h-8 w-24 ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
      ) : pets.length === 0 ? (
        <Card className="p-8 text-center">
          <PawPrint className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron mascotas</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Mascota</th>
                  <th className="text-left p-3 font-medium">Especie / Raza</th>
                  <th className="text-left p-3 font-medium">Sexo</th>
                  <th className="text-left p-3 font-medium">Cliente(s)</th>
                  <th className="text-left p-3 font-medium">Edad / Peso</th>
                  <th className="text-left p-3 font-medium">Cumple / Salud</th>
                  <th className="text-left p-3 font-medium">Estado</th>
                  <th className="text-right p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pets.map((pet) => {
                  const isMale = (pet.gender || '').toLowerCase() === 'macho' || (pet.gender || '').toLowerCase() === 'male';
                  const daysBirthday = getDaysUntilBirthday(pet.birth_date);
                  const isBirthdayToday = daysBirthday === 0;
                  const isBirthdaySoon = daysBirthday != null && daysBirthday > 0 && daysBirthday <= 30;
                  const daysVacc = getDaysUntil(pet.next_vaccination_date);
                  const daysDeworm = getDaysUntil(pet.next_deworming_date);
                  const vaccSoon = daysVacc != null && daysVacc <= 30;
                  const dewormSoon = daysDeworm != null && daysDeworm <= 30;
                  return (
                    <tr key={pet.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {pet.photos?.[0]?.url ? (
                            <img src={pet.photos[0].url} alt={getPetDisplayName(pet)} className="w-10 h-10 rounded-xl object-cover" />
                          ) : (
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pet.species === 'Gato' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                              {pet.species === 'Gato' ? <Cat className="h-5 w-5" /> : <Dog className="h-5 w-5" />}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => openPetProfile(pet)}
                            className="font-medium text-left text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
                            title="Ver perfil de la mascota"
                          >
                            {getPetDisplayName(pet)}
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <span className="inline-flex items-center gap-1">
                          {pet.species === 'Gato' ? <Cat className="h-4 w-4 text-orange-500" /> : <Dog className="h-4 w-4 text-blue-500" />}
                          {pet.species} {pet.breed ? ` / ${pet.breed}` : ''}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-sm">
                          {isMale ? <Mars className="h-4 w-4 text-blue-500" /> : <Venus className="h-4 w-4 text-pink-500" />}
                          {pet.gender || '-'}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        {(() => {
                          const owners = Array.isArray(pet.owners) && pet.owners.length > 0
                            ? pet.owners
                            : (pet.client ? [pet.client] : []);
                          if (owners.length === 0) return '-';
                          return (
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[180px]">{owners[0]?.razon_social || '-'}</span>
                              {owners.length > 1 && (
                                <Badge variant="outline" className="text-xs">+{owners.length - 1}</Badge>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="p-3 text-sm">{pet.age != null ? `${pet.age} años` : '-'} {pet.weight != null ? ` / ${pet.weight} kg` : ''}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {isBirthdaySoon && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                              {isBirthdayToday ? '¡Hoy cumple!' : `Cumple ${daysBirthday}d`}
                            </Badge>
                          )}
                          {vaccSoon && (
                            <Tooltip content={`Vacuna en ${daysVacc} días`}>
                              <span className="inline-flex items-center gap-0.5 text-sky-600"><Syringe className="h-3.5 w-3.5" /></span>
                            </Tooltip>
                          )}
                          {dewormSoon && (
                            <Tooltip content={`Desparasitación en ${daysDeworm} días`}>
                              <span className="inline-flex items-center gap-0.5 text-amber-600"><Bug className="h-3.5 w-3.5" /></span>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="p-3">{pet.fallecido ? <Badge variant="destructive">Fallecido</Badge> : <Badge variant="secondary">Activo</Badge>}</td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center justify-end gap-0.5">
                          <Tooltip content="Ver perfil">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openPetProfile(pet)}>
                              <PawPrint className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          {onNavigate && (
                            <>
                              <Tooltip content="Crear cita">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigateToNewAppointmentWithPet(pet)}>
                                  <CalendarClock className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                              <Tooltip content="Historial clínico">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigateToPetContext('medical', pet)}>
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip content="Editar en Clientes">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigateToClientsEditPet(pet)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Timeline y auditoría">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openPetTimeline(pet)}>
                              <List className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          {canDeletePets && (
                            <Tooltip content="Eliminar (solo super administrador)">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                                onClick={() => handleDeletePet(pet.id.toString())}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Paginación */}
      {!loading && total > 0 && (
        <Card className="p-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
              Mostrando {pets.length} de {total} mascotas
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Registros</span>
                <Select
                  value={String(perPage)}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[92px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={prevPage} disabled={!pagination.hasPrev}>
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm px-2">
                Página {page} de {lastPage}
              </span>
              <Button variant="outline" size="sm" onClick={nextPage} disabled={!pagination.hasNext}>
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Diálogo de nueva/editar mascota */}
      <Dialog
        open={showNewPet}
        onOpenChange={(open) => {
          setShowNewPet(open);
          if (!open) resetPetEditorState();
        }}
      >
<DialogContent className="!w-[98vw] !max-w-[98vw] sm:!max-w-[1600px] max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl sm:rounded-3xl border border-border bg-background text-foreground shadow-2xl [&>button]:absolute [&>button]:right-4 [&>button]:top-4 [&>button]:z-30 [&>button]:rounded-full [&>button]:bg-muted [&>button]:p-2 [&>button]:text-muted-foreground [&>button]:transition-colors [&>button:hover]:bg-accent [&>button:hover]:text-foreground">
          <DialogHeader className="sticky top-0 z-20 shrink-0 text-left items-start border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/90">
            <div className="w-full px-6 sm:px-8 pt-6 pb-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                  <PawPrint className="h-5 w-5" />
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-foreground">
                  {editingPet ? 'Editar Mascota' : 'Nueva Mascota'}
                </DialogTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-2 mb-2 ml-[52px]">
                {editingPet ? 'Actualiza la información de la mascota' : 'Completa el formulario para registrar una nueva mascota'}
              </p>
            </div>
          </DialogHeader>

          <div ref={petModalScrollRef} className="h-full min-h-0 overflow-y-auto px-5 sm:px-8 py-6 sm:py-8 overscroll-contain bg-background [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 transition-colors">
            <PetForm
              pet={editingPet}
              selectedClient={selectedClient}
              clients={clients || []}
              createClient={createClient}
              onClientChange={setSelectedClient}
              onSave={(data, photoFiles, options) => handleSavePet(data, photoFiles, options)}
              speciesList={speciesList.length ? speciesList : DEFAULT_SPECIES}
              breedsBySpecies={breedsBySpecies}
              temperaments={temperaments}
              behaviors={behaviors}
              minPhotos={MIN_PET_PHOTOS}
              maxPhotos={MAX_PET_PHOTOS}
              existingPets={pets}
              onCancel={() => {
                setShowNewPet(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PetForm({
  pet,
  selectedClient,
  clients,
  createClient,
  onClientChange,
  onSave,
  onCancel,
  speciesList = DEFAULT_SPECIES,
  breedsBySpecies = {},
  temperaments = [],
  behaviors = [],
  minPhotos = 3,
  maxPhotos = 5,
  existingPets = [],
}: PetFormProps) {
  /** Un solo input file en document.body para evitar que el modal (Radix) bloquee el clic */
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const activePhotoIndexRef = useRef(0);
  const [formData, setFormData] = useState<PetFormData>(buildInitialPetFormData(pet));
  const [ownerSelectOpen, setOwnerSelectOpen] = useState(false);
  const [additionalOwnersOpen, setAdditionalOwnersOpen] = useState(false);
  const [additionalOwnersSearch, setAdditionalOwnersSearch] = useState('');
  const [breedSelectOpen, setBreedSelectOpen] = useState(false);
  const [showNewOwnerModal, setShowNewOwnerModal] = useState(false);
  const [showNewBreedModal, setShowNewBreedModal] = useState(false);
  const [newOwnerMode, setNewOwnerMode] = useState<'primary' | 'additional'>('primary');
  const [savingNewOwner, setSavingNewOwner] = useState(false);
  const [savingNewBreed, setSavingNewBreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newBreedName, setNewBreedName] = useState('');
  const [localBreedsBySpecies, setLocalBreedsBySpecies] = useState<Record<string, string[]>>(breedsBySpecies || {});
  const [newOwnerData, setNewOwnerData] = useState({
    firstName: '',
    lastName1: '',
    documentType: 'DNI',
    documentNumber: '',
    phone: '',
    email: '',
  });
  const newSlotsCount = Math.max(0, maxPhotos - (pet?.photos?.length || 0));
  const [photoFiles, setPhotoFiles] = useState<(File | null)[]>(() => Array.from({ length: newSlotsCount }, () => null));
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(() => Array(newSlotsCount).fill(''));
  const [defaultPhoto, setDefaultPhoto] = useState<{ kind: 'existing'; id: number } | { kind: 'new'; index: number } | null>(null);
  const [removedExistingPhotoIds, setRemovedExistingPhotoIds] = useState<number[]>([]);
  const existingPhotos = (pet?.photos || [])
    .map((photo) => ({ id: photo.id, url: photo.url || photo.path }))
    .filter((photo) => !removedExistingPhotoIds.includes(photo.id));

  useEffect(() => {
    setLocalBreedsBySpecies(breedsBySpecies || {});
  }, [breedsBySpecies]);

  useEffect(() => {
    const n = Math.max(0, maxPhotos - (pet?.photos?.length || 0));
    setPhotoFiles(Array.from({ length: n }, () => null));
    setPhotoPreviews(Array(n).fill(''));
  }, [pet?.id, pet?.photos?.length, maxPhotos]);

  useEffect(() => {
    if (pet?.photos?.length) {
      const firstId = pet.photos[0]?.id;
      setDefaultPhoto(firstId ? { kind: 'existing', id: firstId } : null);
      return;
    }
    setDefaultPhoto(null);
  }, [pet?.id, pet?.photos?.length]);

  useEffect(() => {
    setFormData(buildInitialPetFormData(pet));
  }, [pet]);

  useEffect(() => {
    setRemovedExistingPhotoIds([]);
  }, [pet?.id]);

  useEffect(() => {
    if (!selectedClient?.id) return;
    const ownerId = String(selectedClient.id);
    setFormData((prev) => ({
      ...prev,
      ownerIds: prev.ownerIds.includes(ownerId) ? prev.ownerIds : [ownerId, ...prev.ownerIds],
    }));
  }, [selectedClient?.id]);

  const sortedClients = [...(clients || [])].sort((a, b) =>
    String(a?.fullName || '').localeCompare(String(b?.fullName || ''), 'es', { sensitivity: 'base' })
  );
  const additionalOwnerCandidates = sortedClients.filter((client) => {
    if (String(client.id) === String(selectedClient?.id || '')) return false;
    const query = additionalOwnersSearch.trim().toLowerCase();
    if (!query) return true;
    const fullName = String(client.fullName || '').toLowerCase();
    const doc = String(client.documentNumber || '').toLowerCase();
    return fullName.includes(query) || doc.includes(query);
  });
  const availableBreeds = toSortedUniqueList(Array.isArray(localBreedsBySpecies[formData.species]) ? localBreedsBySpecies[formData.species] : []);
  const sortedTemperaments = toSortedUniqueList(Array.isArray(temperaments) ? temperaments.map((v: string) => String(v)) : []);
  const sortedBehaviors = toSortedUniqueList(Array.isArray(behaviors) ? behaviors.map((v: string) => String(v)) : []);

  const applyPrimaryOwner = (ownerId: string) => {
    const owner = (clients || []).find((c) => String(c.id) === ownerId);
    onClientChange(owner || null);
    setFormData((prev) => ({
      ...prev,
      ownerIds: [ownerId, ...prev.ownerIds.filter((id: string) => id !== ownerId)],
    }));
  };

  const handleAgePartsChange = (part: 'ageYears' | 'ageMonths' | 'ageDays', value: string) => {
    const maxByPart = { ageYears: 40, ageMonths: 11, ageDays: 30 };
    const parsed = parseInt(value || '0', 10) || 0;
    const bounded = Math.min(maxByPart[part], Math.max(0, parsed));
    const cleanValue = value === '' ? '' : String(bounded);
    setFormData((prev) => {
      const next = { ...prev, [part]: cleanValue };
      const computedBirthDate = birthDateFromAgeParts(next.ageYears, next.ageMonths, next.ageDays);
      return {
        ...next,
        age: next.ageYears,
        birthDate: computedBirthDate,
      };
    });
  };

  const handleBirthDateChange = (value: string) => {
    setFormData((prev) => {
      const ageParts = agePartsFromBirthDate(value);
      return {
        ...prev,
        birthDate: value,
        ageYears: ageParts.years,
        ageMonths: ageParts.months,
        ageDays: ageParts.days,
        age: ageParts.years,
      };
    });
  };

  const handleCreateOwner = async () => {
    const firstName = newOwnerData.firstName.trim();
    const lastName1 = newOwnerData.lastName1.trim();
    const documentNumber = newOwnerData.documentNumber.trim();
    if (!firstName) {
      toast.error('Ingresa el nombre del amo');
      return;
    }
    if (!documentNumber) {
      toast.error('Ingresa la identificación');
      return;
    }
    const normalizedName = `${firstName} ${lastName1}`.trim().toLowerCase();
    const dupOwner = (clients || []).find((c) => {
      const byDoc = String(c.documentNumber || '').trim() !== '' && String(c.documentNumber).trim() === documentNumber;
      const byName = String(c.fullName || '').trim().toLowerCase() === normalizedName;
      return byDoc || byName;
    });
    if (dupOwner) {
      toast.error('Ya existe un amo con datos similares');
      return;
    }
    setSavingNewOwner(true);
    try {
      const created = await createClient({
        fullName: `${firstName} ${lastName1}`.trim(),
        documentType: newOwnerData.documentType,
        documentNumber,
        email: newOwnerData.email.trim(),
        phone: newOwnerData.phone.trim(),
        address: '',
        district: '',
        notes: '',
        isActive: true,
      } as unknown as Record<string, unknown>) as ClientRecord;
      const createdId = String(created.id);
      if (newOwnerMode === 'primary') {
        applyPrimaryOwner(createdId);
      } else {
        setFormData((prev) => ({
          ...prev,
          ownerIds: prev.ownerIds.includes(createdId) ? prev.ownerIds : [...prev.ownerIds, createdId],
        }));
      }
      setNewOwnerData({
        firstName: '',
        lastName1: '',
        documentType: 'DNI',
        documentNumber: '',
        phone: '',
        email: '',
      });
      setShowNewOwnerModal(false);
      toast.success('Amo agregado');
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo guardar el amo');
    } finally {
      setSavingNewOwner(false);
    }
  };

  const handleCreateBreed = async () => {
    const name = newBreedName.trim();
    if (!name) {
      toast.error('Ingresa el nombre de la raza');
      return;
    }
    if (availableBreeds.some((item) => item.toLowerCase() === name.toLowerCase())) {
      toast.info('La raza ya existe');
      return;
    }
    const type = formData.species === 'Perro'
      ? 'dog_breed'
      : formData.species === 'Gato'
        ? 'cat_breed'
        : `breed_${formData.species}`;
    setSavingNewBreed(true);
    try {
      const nextBreeds = toSortedUniqueList([...availableBreeds, name]);
      await apiClient.post('/pet-configurations', {
        type,
        items: nextBreeds,
        company_id: null,
      });
      setLocalBreedsBySpecies((prev) => ({ ...prev, [formData.species]: nextBreeds }));
      setFormData((prev) => ({ ...prev, breed: name }));
      setShowNewBreedModal(false);
      setNewBreedName('');
      toast.success('Raza agregada');
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo guardar la raza');
    } finally {
      setSavingNewBreed(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!pet && !selectedClient) {
      toast.error('Selecciona un cliente');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('El nombre de la mascota es requerido');
      return;
    }
    const normalizedPetName = formData.name.trim().toLowerCase();
    const normalizedPetLastName = formData.lastName1.trim().toLowerCase();
    const ownerId = String(selectedClient?.id || '');
    const selectedOwnerIds = new Set(
      (formData.ownerIds.length > 0 ? formData.ownerIds : [ownerId]).map((id) => String(id))
    );
    const duplicatePet = (existingPets || []).find((item) => {
      if (pet && String(item.id) === String(pet.id)) return false;
      const itemOwnerIds = new Set<string>([
        String(item.client_id || item.client?.id || ''),
        ...((Array.isArray(item.owners) ? item.owners : []).map((o) => String(o.id))),
      ]);
      const sharesOwner = Array.from(selectedOwnerIds).some((id) => itemOwnerIds.has(id));
      return sharesOwner
        && String(item.species || '') === String(formData.species || '')
        && String(item.name || '').trim().toLowerCase() === normalizedPetName
        && String(item.last_name || '').trim().toLowerCase() === normalizedPetLastName;
    });
    if (duplicatePet) {
      toast.error('Ya existe una mascota similar para este amo');
      return;
    }
    const today = formatDateInput(new Date());
    if (formData.birthDate && formData.birthDate > today) {
      toast.error('La fecha de nacimiento no puede ser futura');
      return;
    }
    if (safeInt(formData.ageMonths) > 11) {
      toast.error('Edad (meses) debe estar entre 0 y 11');
      return;
    }
    if (safeInt(formData.ageDays) > 30) {
      toast.error('Edad (días) debe estar entre 0 y 30');
      return;
    }
    if (formData.weight !== '' && formData.weight != null) {
      const weight = Number(formData.weight);
      if (!Number.isFinite(weight) || weight < 0 || weight > 200) {
        toast.error('El peso debe estar entre 0 y 200 kg');
        return;
      }
    }
    const identificationNumber = String(formData.identificationNumber || '').trim();
    if (identificationNumber.length > 100) {
      toast.error('La identificación no puede superar 100 caracteres');
      return;
    }
    const filesWithIndex = photoFiles
      .map((file, index) => (file ? { file, index } : null))
      .filter((item): item is { file: File; index: number } => item != null);
    const filesToSend = filesWithIndex.map((item) => item.file);
    if (!pet && filesToSend.length < minPhotos) {
      toast.error(`Sube al menos ${minPhotos} fotos para la mascota`);
      return;
    }
    const defaultPhotoId = defaultPhoto?.kind === 'existing' ? defaultPhoto.id : undefined;
    const defaultNewIndex = defaultPhoto?.kind === 'new'
      ? filesWithIndex.findIndex((item) => item.index === defaultPhoto.index)
      : undefined;
    const payload = {
      ...formData,
      name: formData.name.trim(),
      last_name: formData.lastName1.trim(),
      identification_type: formData.identificationType || null,
      identification_number: identificationNumber,
      microchip: formData.identificationType === 'Microchip'
        ? identificationNumber
        : (formData.microchip || ''),
      age: formData.ageYears || formData.age,
    };
    try {
      setSubmitting(true);
      await Promise.resolve(onSave(
        payload,
        filesToSend.length > 0 ? filesToSend : undefined,
        {
          defaultPhotoId,
          defaultNewIndex: defaultNewIndex !== -1 ? defaultNewIndex : undefined,
          removePhotoIds: removedExistingPhotoIds,
        }
      ));
    } finally {
      setSubmitting(false);
    }
  };

  const applyPhotoToSlot = useCallback((file: File, index: number) => {
    setPhotoFiles((prev) => {
      const p = [...prev];
      p[index] = file;
      return p;
    });
    setPhotoPreviews((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      const p = [...prev];
      p[index] = URL.createObjectURL(file);
      return p;
    });
    setDefaultPhoto((prev) => {
      if (prev) return prev;
      if (existingPhotos.length > 0) return prev;
      return { kind: 'new', index };
    });
  }, [existingPhotos.length]);

  const handleSingleFileInputChange = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement | null;
    const files = target?.files ? Array.from(target.files) : [];
    if (files.length === 0) return;
    const startIndex = activePhotoIndexRef.current;
    const slotOrder = [
      ...Array.from({ length: photoFiles.length }, (_, i) => i).slice(startIndex),
      ...Array.from({ length: photoFiles.length }, (_, i) => i).slice(0, startIndex),
    ];
    const emptySlots = slotOrder.filter((i) => !photoFiles[i]);
    const maxToUse = Math.min(files.length, emptySlots.length);
    for (let i = 0; i < maxToUse; i += 1) {
      applyPhotoToSlot(files[i], emptySlots[i]);
    }
    if (files.length > maxToUse) {
      toast.info(`Solo se pueden agregar ${maxToUse} foto(s) más`);
    }
    if (target) target.value = '';
  }, [applyPhotoToSlot, photoFiles]);

  useEffect(() => {
    if (singleFileInputRef.current) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
    input.multiple = true;
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    input.tabIndex = -1;
    input.addEventListener('change', handleSingleFileInputChange);
    document.body.appendChild(input);
    singleFileInputRef.current = input;
    return () => {
      input.removeEventListener('change', handleSingleFileInputChange);
      document.body.removeChild(input);
      singleFileInputRef.current = null;
    };
  }, [handleSingleFileInputChange]);

  const openFilePicker = (index: number) => {
    activePhotoIndexRef.current = index;
    singleFileInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    if (photoPreviews[index]) URL.revokeObjectURL(photoPreviews[index]);
    setPhotoFiles((prev) => {
      const p = [...prev];
      p[index] = null;
      setDefaultPhoto((current) => {
        if (current?.kind === 'new' && current.index === index) {
          if (existingPhotos.length > 0) {
            return { kind: 'existing', id: existingPhotos[0].id };
          }
          const nextIndex = p.findIndex((f) => f != null);
          return nextIndex >= 0 ? { kind: 'new', index: nextIndex } : null;
        }
        return current;
      });
      return p;
    });
    setPhotoPreviews((prev) => { const p = [...prev]; p[index] = ''; return p; });
  };

  const removeExistingPhoto = (photoId: number) => {
    setRemovedExistingPhotoIds((prev) => (prev.includes(photoId) ? prev : [...prev, photoId]));
    setDefaultPhoto((current) => {
      if (current?.kind === 'existing' && current.id === photoId) {
        const nextExisting = existingPhotos.find((p) => p.id !== photoId);
        if (nextExisting) return { kind: 'existing', id: nextExisting.id };
        const nextNewIndex = photoFiles.findIndex((f) => f != null);
        return nextNewIndex >= 0 ? { kind: 'new', index: nextNewIndex } : null;
      }
      return current;
    });
  };

  const sectionClass = 'space-y-5 rounded-2xl border border-border bg-card text-card-foreground p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md';
  const sectionTitleClass = 'text-base font-semibold text-foreground flex items-center gap-2 pb-3 border-b border-border mb-1';
  const labelClass = 'text-sm font-medium text-foreground mb-1.5 block';
  const fieldClass = 'h-11 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-purple-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-purple-500 hover:border-muted-foreground/30';
  const textareaClass = 'min-h-[120px] rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-purple-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-purple-500 hover:border-muted-foreground/30 resize-y';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-bold shadow-md">1</span>
          <span>Datos básicos</span>
        </h3>
        <div className="space-y-4">
          <div>
            <Label className={`${labelClass} flex items-center gap-1.5`}>
              <span className="text-purple-600 dark:text-purple-400">*</span>
              Amo principal
            </Label>
            <div className="flex gap-2.5 mt-1.5">
              <div className="flex-1 min-w-0">
                <Popover open={ownerSelectOpen} onOpenChange={setOwnerSelectOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" role="combobox" aria-expanded={ownerSelectOpen} className={`${fieldClass} w-full justify-between px-4`}>
                      <span className="truncate text-sm">
                        {selectedClient?.id
                          ? `${selectedClient.fullName} - ${selectedClient.documentNumber}`
                          : 'Buscar y seleccionar amo'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                <PopoverContent className="w-[420px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar amo por nombre o documento..." />
                    <CommandList>
                      <CommandEmpty>
                        <div className="p-2 space-y-2">
                          <p className="text-sm text-muted-foreground">No existe este amo</p>
                          <Button type="button" size="sm" className="w-full" onClick={() => { setNewOwnerMode('primary'); setShowNewOwnerModal(true); setOwnerSelectOpen(false); }}>
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar amo
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {sortedClients.map((client) => {
                          const value = String(client.id);
                          const selected = String(selectedClient?.id || '') === value;
                          return (
                            <CommandItem
                              key={value}
                              value={`${client.fullName} ${client.documentNumber} ${value}`}
                              onSelect={() => {
                                applyPrimaryOwner(value);
                                setOwnerSelectOpen(false);
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${selected ? 'opacity-100' : 'opacity-0'}`} />
                              <span className="truncate">{client.fullName} - {client.documentNumber}</span>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 whitespace-nowrap h-11 px-4 border-border bg-background text-foreground hover:bg-muted hover:border-muted-foreground/30 transition-colors"
              onClick={() => { setNewOwnerMode('primary'); setShowNewOwnerModal(true); }}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nuevo amo
            </Button>
          </div>
          </div>
          <div>
            <Label className={labelClass}>Amos adicionales</Label>
            <div className="flex gap-2 mt-1">
              <div className="flex-1 min-w-0">
                <Popover open={additionalOwnersOpen} onOpenChange={setAdditionalOwnersOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className={`${fieldClass} w-full justify-between`}>
                      <span className="truncate text-sm">
                        {formData.ownerIds.length > 1
                          ? `${formData.ownerIds.length - 1} amo(s) adicional(es)`
                          : 'Agregar amos adicionales'}
                      </span>
                      <Users className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[360px] p-3" align="start">
                    <div className="space-y-2">
                      <Input
                        className={fieldClass}
                        placeholder="Buscar amo adicional..."
                        value={additionalOwnersSearch}
                        onChange={(e) => setAdditionalOwnersSearch(e.target.value)}
                      />
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {additionalOwnerCandidates.map((client) => {
                          const id = String(client.id);
                          const checked = formData.ownerIds.includes(id);
                          return (
                            <label key={id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(isChecked) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    ownerIds: isChecked
                                      ? [...prev.ownerIds, id]
                                      : prev.ownerIds.filter((ownerId: string) => ownerId !== id),
                                  }));
                                }}
                              />
                              <span className="text-sm truncate">{client.fullName} - {client.documentNumber}</span>
                            </label>
                          );
                        })}
                        {additionalOwnerCandidates.length === 0 && (
                          <p className="text-sm text-muted-foreground py-2">No hay resultados</p>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 whitespace-nowrap h-11 px-4 border-border bg-background text-foreground hover:bg-muted hover:border-muted-foreground/30 transition-colors"
                onClick={() => { setNewOwnerMode('additional'); setShowNewOwnerModal(true); }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Agregar amo adicional
              </Button>
            </div>
            {formData.ownerIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.ownerIds.map((ownerId: string) => {
                  const owner = clients.find((c) => String(c.id) === ownerId);
                  if (!owner) return null;
                  const isPrimary = String(selectedClient?.id || '') === ownerId;
                  return (
                    <Badge 
                      key={ownerId} 
                      variant={isPrimary ? 'default' : 'secondary'}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm ${
                        isPrimary 
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0' 
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      {owner.fullName}
                      {isPrimary && <span className="ml-1.5 opacity-90">(principal)</span>}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-3">
            <Label className={`${labelClass} flex items-center gap-1.5`}>
              <span className="text-purple-600 dark:text-purple-400">*</span>
              Nombre
            </Label>
            <Input
              className={fieldClass}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Max, Luna"
              required
            />
          </div>
          <div className="md:col-span-3">
            <Label className={labelClass}>Apellido</Label>
            <Input
              className={fieldClass}
              value={formData.lastName1}
              onChange={(e) => setFormData({ ...formData, lastName1: e.target.value })}
              placeholder="Apellido (opcional)"
            />
          </div>
          <div className="md:col-span-3">
            <Label className={`${labelClass} flex items-center gap-1.5`}>
              <span className="text-purple-600 dark:text-purple-400">*</span>
              Especie
            </Label>
            <Select
              value={formData.species}
              onValueChange={(value) => setFormData({ ...formData, species: value, breed: '' })}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Selecciona especie" />
              </SelectTrigger>
              <SelectContent>
                {speciesList.map((s: string) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Label className={labelClass}>Género</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Selecciona género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Macho">Macho</SelectItem>
                <SelectItem value="Hembra">Hembra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 min-w-0">
            <Label className={labelClass}>Raza</Label>
            <div className="mt-1 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2">
              <div className="flex-1 min-w-0">
                <Popover open={breedSelectOpen} onOpenChange={setBreedSelectOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" role="combobox" aria-expanded={breedSelectOpen} className={`${fieldClass} w-full justify-between`}>
                      <span className="truncate">{formData.breed || 'Buscar y seleccionar raza'}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[460px] max-w-[95vw] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar raza..." />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-2 space-y-2">
                            <p className="text-sm text-muted-foreground">No existe esta raza</p>
                            <Button type="button" size="sm" className="w-full" onClick={() => { setShowNewBreedModal(true); setBreedSelectOpen(false); }}>
                              <Plus className="h-4 w-4 mr-1" />
                              Agregar raza
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {availableBreeds.map((breed: string) => (
                            <CommandItem
                              key={breed}
                              value={breed}
                              onSelect={() => {
                                setFormData({ ...formData, breed });
                                setBreedSelectOpen(false);
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${formData.breed === breed ? 'opacity-100' : 'opacity-0'}`} />
                              <span className="truncate">{breed}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="whitespace-nowrap w-full sm:w-auto h-11 px-4 border-border bg-background text-foreground hover:bg-muted hover:border-muted-foreground/30 transition-colors" 
                onClick={() => setShowNewBreedModal(true)}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Agregar raza
              </Button>
            </div>
          </div>
          <div className="md:col-span-4">
            <Label className={labelClass}>Fecha de nacimiento</Label>
            <Input type="date" max={formatDateInput(new Date())} className={fieldClass} value={formData.birthDate ?? ''} onChange={(e) => handleBirthDateChange(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <Label className={labelClass}>Tipo identificación</Label>
            <Select value={formData.identificationType} onValueChange={(value) => setFormData({ ...formData, identificationType: value })}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Microchip">Microchip</SelectItem>
                <SelectItem value="Placa">Placa</SelectItem>
                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <Label className={labelClass}>Identificación</Label>
            <Input
              className={fieldClass}
              value={formData.identificationNumber}
              onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
              placeholder="Código"
            />
          </div>
          <div className="md:col-span-4">
            <Label className={labelClass}>Color</Label>
            <Input className={fieldClass} value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 lg:col-span-2">
            <Label className={labelClass}>Edad (años)</Label>
            <Input type="number" min={0} max={40} className={fieldClass} value={formData.ageYears} onChange={(e) => handleAgePartsChange('ageYears', e.target.value)} />
          </div>
          <div className="md:col-span-4 lg:col-span-2">
            <Label className={labelClass}>Edad (meses)</Label>
            <Input type="number" min={0} max={11} className={fieldClass} value={formData.ageMonths} onChange={(e) => handleAgePartsChange('ageMonths', e.target.value)} />
          </div>
          <div className="md:col-span-4 lg:col-span-2">
            <Label className={labelClass}>Edad (días)</Label>
            <Input type="number" min={0} max={30} className={fieldClass} value={formData.ageDays} onChange={(e) => handleAgePartsChange('ageDays', e.target.value)} />
          </div>
          <div className="md:col-span-4 lg:col-span-2">
            <Label className={labelClass}>Peso (kg)</Label>
            <Input type="number" min={0} max={200} step="0.1" className={fieldClass} value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} />
          </div>
          <div className="md:col-span-4 lg:col-span-2">
            <Label className={labelClass}>Tamaño</Label>
            <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value })}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Tamaño" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pequeño">Pequeño</SelectItem>
                <SelectItem value="Mediano">Mediano</SelectItem>
                <SelectItem value="Grande">Grande</SelectItem>
                <SelectItem value="Gigante">Gigante</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-bold shadow-md">2</span>
          <ImagePlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span>Fotos de la mascota</span>
          {!pet && (
            <span className="text-sm text-muted-foreground font-normal ml-auto">
              {minPhotos > 0 ? `(min. ${minPhotos}, max. ${maxPhotos})` : `(opcionales, max. ${maxPhotos})`}
            </span>
          )}
        </h3>
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 min-w-[680px]">
          {existingPhotos.map((photo: { id: number; url: string }, i: number) => {
            const isDefault = defaultPhoto?.kind === 'existing' && defaultPhoto.id === photo.id;
            return (
              <div
                key={`ex-${photo.id ?? i}`}
                className={`relative aspect-square rounded-xl border-2 overflow-hidden bg-muted transition-all duration-200 hover:shadow-lg ${
                  isDefault 
                    ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-background border-purple-500 shadow-lg shadow-purple-500/20' 
                    : 'border-border hover:border-muted-foreground/40'
                }`}
              >
                <img src={photo.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {isDefault && (
                    <span className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-md shadow-md">
                      Por defecto
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(photo.id)}
                  className="absolute top-2 right-2 rounded-full bg-red-500 text-white p-1.5 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                  title="Eliminar foto"
                  aria-label="Eliminar foto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultPhoto({ kind: 'existing', id: photo.id })}
                  className={`absolute bottom-2 right-2 text-xs px-2.5 py-1 rounded-md shadow-md transition-all duration-200 hover:scale-105 ${
                    isDefault 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                      : 'bg-card text-card-foreground border border-border hover:bg-muted'
                  }`}
                >
                  {isDefault ? '★ Por defecto' : 'Elegir por defecto'}
                </button>
              </div>
            );
          })}
          {Array.from({ length: Math.max(0, maxPhotos - existingPhotos.length) }).map((_, index) => (
            <div 
              key={index} 
              className="relative aspect-square rounded-xl border-2 border-dashed border-border overflow-hidden bg-muted/50 flex items-center justify-center min-h-[120px] hover:border-purple-500 hover:bg-muted transition-all duration-200"
            >
              {photoPreviews[index] ? (
                <>
                  <img src={photoPreviews[index]} alt={`Nueva ${index + 1}`} className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removePhoto(index)} 
                    className="absolute top-2 right-2 rounded-full bg-red-500 text-white p-1.5 hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    aria-label="Eliminar foto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultPhoto({ kind: 'new', index })}
                    className={`absolute bottom-2 right-2 text-xs px-2.5 py-1 rounded-md shadow-md transition-all duration-200 hover:scale-105 ${
                      defaultPhoto?.kind === 'new' && defaultPhoto.index === index 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                        : 'bg-card text-card-foreground border border-border hover:bg-muted'
                    }`}
                  >
                    {defaultPhoto?.kind === 'new' && defaultPhoto.index === index ? '★ Por defecto' : 'Elegir por defecto'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openFilePicker(index)}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl cursor-pointer hover:bg-muted transition-all duration-200 border-0 bg-transparent group"
                  aria-label={`Agregar foto ${index + 1}`}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-200">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors">
                    Agregar foto
                  </span>
                </button>
              )}
            </div>
          ))}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-bold shadow-md">3</span>
          <span>Carácter y comportamiento</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className={labelClass}>Temperamentos</Label>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !formData.temperament.includes(value)) {
                  setFormData({ ...formData, temperament: [...formData.temperament, value] });
                }
              }}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Agregar temperamento" />
              </SelectTrigger>
              <SelectContent>
                {sortedTemperaments.filter((temp: string) => !formData.temperament.includes(temp)).map((temp: string) => (
                  <SelectItem key={temp} value={temp}>{temp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.temperament.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.temperament.map((temp: string, idx: number) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-sm font-medium">{temp}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, temperament: formData.temperament.filter((_: string, i: number) => i !== idx) })}
                      className="ml-0.5 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 p-0.5"
                      aria-label={`Eliminar ${temp}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label className={labelClass}>Comportamientos</Label>
            <Select
              value=""
              onValueChange={(value) => {
                if (value && !formData.behavior.includes(value)) {
                  setFormData({ ...formData, behavior: [...formData.behavior, value] });
                }
              }}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="Agregar comportamiento" />
              </SelectTrigger>
              <SelectContent>
                {sortedBehaviors.filter((b: string) => !formData.behavior.includes(b)).map((beh: string) => (
                  <SelectItem key={beh} value={beh}>{beh}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.behavior.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.behavior.map((beh: string, idx: number) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-sm font-medium">{beh}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, behavior: formData.behavior.filter((_, i) => i !== idx) })}
                      className="ml-0.5 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 p-0.5"
                      aria-label={`Eliminar ${beh}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className={sectionTitleClass}>
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-bold shadow-md">4</span>
          <span>Salud, seguro y otros</span>
        </h3>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList
            className="grid w-full grid-cols-4 gap-0 rounded-none border-b border-border bg-muted p-0 [&_button[data-state=active]]:!bg-purple-50 [&_button[data-state=active]]:!text-foreground [&_button[data-state=active]]:!border-b-2 [&_button[data-state=active]]:!border-b-purple-600 [&_button[data-state=active]]:!-mb-px dark:[&_button[data-state=active]]:!bg-purple-500/25 dark:[&_button[data-state=active]]:!border-b-purple-500"
            aria-label="Sección Salud, seguro y otros"
          >
            <TabsTrigger
              value="basic"
              className="h-11 rounded-none border-b-2 border-transparent px-4 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground"
            >
              Básico
            </TabsTrigger>
            <TabsTrigger
              value="medical"
              className="h-11 rounded-none border-b-2 border-transparent px-4 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground"
            >
              Médico
            </TabsTrigger>
            <TabsTrigger
              value="insurance"
              className="h-11 rounded-none border-b-2 border-transparent px-4 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground"
            >
              Seguro
            </TabsTrigger>
            <TabsTrigger
              value="other"
              className="h-11 rounded-none border-b-2 border-transparent px-4 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-background hover:text-foreground"
            >
              Otros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-5 rounded-xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex items-center space-x-3 rounded-lg border border-border bg-background p-4 hover:border-purple-500/50 transition-colors shadow-sm">
              <Checkbox
                id="sterilized"
                checked={formData.sterilized}
                onCheckedChange={(checked) => setFormData({ ...formData, sterilized: checked === true })}
                className="border-border data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor="sterilized" className="cursor-pointer text-sm font-medium text-foreground">
                Esterilizado/Castrado
              </Label>
            </div>
            {formData.sterilized && (
              <div>
                <Label className={labelClass}>Fecha de esterilización</Label>
                <Input
                  type="date"
                  className={fieldClass}
                  value={formData.sterilizationDate ?? ''}
                  onChange={(e) => setFormData({ ...formData, sterilizationDate: e.target.value })}
                />
              </div>
            )}
            <div className="flex items-center space-x-3 rounded-lg border border-border bg-background p-4 hover:border-red-500/50 transition-colors shadow-sm">
              <Checkbox
                id="deceased"
                checked={formData.deceased}
                onCheckedChange={(checked) => setFormData({ ...formData, deceased: checked === true })}
                className="border-border data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <Label htmlFor="deceased" className="cursor-pointer text-sm font-medium text-foreground">
                Mascota fallecida
              </Label>
            </div>
          </TabsContent>

          <TabsContent value="medical" className="mt-5 rounded-xl border border-border bg-card/80 p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className={labelClass}>Última vacunación</Label>
                <Input
                  type="date"
                  className={fieldClass}
                  value={formData.lastVaccinationDate}
                  onChange={(e) => setFormData({ ...formData, lastVaccinationDate: e.target.value })}
                />
              </div>
              <div>
                <Label className={labelClass}>Próxima vacunación</Label>
                <Input
                  type="date"
                  className={fieldClass}
                  value={formData.nextVaccinationDate ?? ''}
                  onChange={(e) => setFormData({ ...formData, nextVaccinationDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className={labelClass}>Última desparasitación</Label>
                <Input
                  type="date"
                  className={fieldClass}
                  value={formData.lastDewormingDate ?? ''}
                  onChange={(e) => setFormData({ ...formData, lastDewormingDate: e.target.value })}
                />
              </div>
              <div>
                <Label className={labelClass}>Próxima desparasitación</Label>
                <Input
                  type="date"
                  className={fieldClass}
                  value={formData.nextDewormingDate ?? ''}
                  onChange={(e) => setFormData({ ...formData, nextDewormingDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className={labelClass}>Alergias (separadas por comas)</Label>
              <Input
                className={fieldClass}
                value={Array.isArray(formData.allergies) ? formData.allergies.join(', ') : formData.allergies}
                onChange={(e) => {
                  const allergiesArray = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                  setFormData({ ...formData, allergies: allergiesArray });
                }}
                placeholder="Ej: Polen, Ciertos alimentos"
              />
            </div>
            <div>
              <Label className={labelClass}>Medicamentos (separados por comas)</Label>
              <Input
                className={fieldClass}
                value={Array.isArray(formData.medications) ? formData.medications.join(', ') : formData.medications}
                onChange={(e) => {
                  const medicationsArray = e.target.value.split(',').map(m => m.trim()).filter(m => m);
                  setFormData({ ...formData, medications: medicationsArray });
                }}
                placeholder="Ej: Antiparasitario, Vitaminas"
              />
            </div>
          </TabsContent>

          <TabsContent value="insurance" className="mt-5 rounded-xl border border-border bg-card/80 p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className={labelClass}>Compañía de seguro</Label>
                <Input
                  className={fieldClass}
                  value={formData.insuranceCompany}
                  onChange={(e) => setFormData({ ...formData, insuranceCompany: e.target.value })}
                  placeholder="Nombre de la aseguradora"
                />
              </div>
              <div>
                <Label className={labelClass}>Número de póliza</Label>
                <Input
                  className={fieldClass}
                  value={formData.insurancePolicyNumber}
                  onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                  placeholder="Número de póliza"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className={labelClass}>Contacto de emergencia</Label>
                <Input
                  className={fieldClass}
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="Nombre del contacto"
                />
              </div>
              <div>
                <Label className={labelClass}>Teléfono de emergencia</Label>
                <Input
                  className={fieldClass}
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="Teléfono"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="other" className="mt-5 rounded-xl border border-border bg-card/80 p-5 sm:p-6 space-y-5 shadow-sm">
            <div>
              <Label className={labelClass}>Notas</Label>
              <Textarea
                className={textareaClass}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={5}
                placeholder="Notas adicionales sobre la mascota..."
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <Dialog open={showNewOwnerModal} onOpenChange={setShowNewOwnerModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{newOwnerMode === 'primary' ? 'Agregar amo principal' : 'Agregar amo adicional'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className={labelClass}>Nombres *</Label>
                <Input className={fieldClass} value={newOwnerData.firstName} onChange={(e) => setNewOwnerData((prev) => ({ ...prev, firstName: e.target.value }))} />
              </div>
              <div>
                <Label className={labelClass}>Apellido</Label>
                <Input className={fieldClass} value={newOwnerData.lastName1} onChange={(e) => setNewOwnerData((prev) => ({ ...prev, lastName1: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={labelClass}>Tipo identificación</Label>
                <Select value={newOwnerData.documentType} onValueChange={(value) => setNewOwnerData((prev) => ({ ...prev, documentType: value }))}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="RUC">RUC</SelectItem>
                    <SelectItem value="PAS">PAS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelClass}>Nro identificación *</Label>
                <Input className={fieldClass} value={newOwnerData.documentNumber} onChange={(e) => setNewOwnerData((prev) => ({ ...prev, documentNumber: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={labelClass}>Teléfono</Label>
                <Input className={fieldClass} value={newOwnerData.phone} onChange={(e) => setNewOwnerData((prev) => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div>
                <Label className={labelClass}>Email</Label>
                <Input className={fieldClass} value={newOwnerData.email} onChange={(e) => setNewOwnerData((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowNewOwnerModal(false)} disabled={savingNewOwner}>Cancelar</Button>
              <Button type="button" onClick={handleCreateOwner} disabled={savingNewOwner}>
                {savingNewOwner ? 'Guardando...' : 'Guardar amo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewBreedModal} onOpenChange={setShowNewBreedModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar raza</DialogTitle>
            <DialogDescription>Nueva raza para la especie {formData.species}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className={labelClass}>Nombre de raza *</Label>
              <Input className={fieldClass} value={newBreedName} onChange={(e) => setNewBreedName(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowNewBreedModal(false)} disabled={savingNewBreed}>Cancelar</Button>
              <Button type="button" onClick={handleCreateBreed} disabled={savingNewBreed}>
                {savingNewBreed ? 'Guardando...' : 'Guardar raza'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="sticky bottom-0 z-20 -mx-5 sm:-mx-8 mt-6 border-t border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/90 px-5 sm:px-8 pt-5 pb-4 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Revisa los datos antes de guardar. Los cambios se reflejarán en historial y reportes.
          </p>
          <div className="flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          size="lg" 
          className="h-11 px-6 rounded-lg border-border bg-background text-foreground hover:bg-muted font-medium" 
          onClick={onCancel} 
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          size="lg" 
          className="h-11 px-7 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={submitting}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              {pet ? 'Actualizar' : 'Crear'} Mascota
              <span className="text-lg"></span>
            </span>
          )}
        </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
