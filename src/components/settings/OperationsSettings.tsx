import { useCallback, useEffect, useState } from 'react';
import {
  PawPrint,
  Dog,
  Settings,
  Tag,
  Users,
  CalendarClock,
  Briefcase,
  ClipboardList,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogTrigger } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { apiClient } from '../../utils/api/client';
import { usePetConfigurations } from '../../hooks/usePetConfigurations';
import { ConfigDialog, BreedConfigDialog } from './petConfigDialogs';
import {
  DEFAULT_APPOINTMENT_TAGS,
  DEFAULT_CLIENT_TAGS,
  DEFAULT_PET_TAGS,
  DEFAULT_SERVICE_TAGS,
  DEFAULT_STAFF_TAGS,
  PET_BEHAVIORS,
  PET_TEMPERAMENTS,
} from '../../config/defaults';

const DEFAULT_SPECIES = ['Perro', 'Gato', 'Otro'];

interface DuplicateSummary {
  owners: number;
  pets: number;
  species: number;
  breeds: number;
}

interface OperationsSettingsProps {
  companyId?: number | null;
}

export function OperationsSettings({ companyId }: OperationsSettingsProps) {
  const {
    loading,
    speciesList,
    breedsBySpecies,
    temperaments,
    behaviors,
    clientTags,
    petTags,
    appointmentTags,
    serviceTags,
    staffTags,
    setSpeciesList,
    setBreedsBySpecies,
    setDogBreeds,
    setCatBreeds,
    setTemperaments,
    setBehaviors,
    setClientTags,
    setPetTags,
    setAppointmentTags,
    setServiceTags,
    setStaffTags,
    loadConfigurations,
    saveConfigurations,
  } = usePetConfigurations(companyId);

  const [showSpeciesConfig, setShowSpeciesConfig] = useState(false);
  const [showBreedConfig, setShowBreedConfig] = useState(false);
  const [showTemperamentConfig, setShowTemperamentConfig] = useState(false);
  const [showBehaviorConfig, setShowBehaviorConfig] = useState(false);
  const [showClientTagsConfig, setShowClientTagsConfig] = useState(false);
  const [showPetTagsConfig, setShowPetTagsConfig] = useState(false);
  const [showAppointmentTagsConfig, setShowAppointmentTagsConfig] = useState(false);
  const [showServiceTagsConfig, setShowServiceTagsConfig] = useState(false);
  const [showStaffTagsConfig, setShowStaffTagsConfig] = useState(false);
  const [remindersCount, setRemindersCount] = useState(0);
  const [duplicateSummary, setDuplicateSummary] = useState<DuplicateSummary | null>(null);

  const loadRemindersAndDuplicates = useCallback(async () => {
    try {
      const [remindersRes, duplicatesRes] = await Promise.all([
        apiClient.get<{ data?: unknown[]; summary?: { total?: number } }>('/pets/reminders', { days: '30' }),
        apiClient.get<{ summary?: DuplicateSummary }>('/pets/duplicates'),
      ]);
      const remindersPayload = remindersRes as { data?: unknown[]; summary?: { total?: number } };
      const duplicatesPayload = duplicatesRes as { summary?: DuplicateSummary };
      const nextReminderCount = Number(remindersPayload?.summary?.total ?? remindersPayload?.data?.length ?? 0);
      const nextDuplicateSummary = duplicatesPayload?.summary ?? null;
      setRemindersCount(nextReminderCount);
      setDuplicateSummary(nextDuplicateSummary);
      return { reminders: nextReminderCount, duplicates: nextDuplicateSummary };
    } catch {
      setRemindersCount(0);
      setDuplicateSummary(null);
      return { reminders: 0, duplicates: null };
    }
  }, []);

  useEffect(() => {
    loadRemindersAndDuplicates();
  }, [loadRemindersAndDuplicates]);

  const handleAuditDuplicates = async () => {
    const result = await loadRemindersAndDuplicates();
    if (!result?.duplicates) {
      toast.info('No se detectaron duplicados');
      return;
    }
    toast.info(
      `Duplicados: tutores ${result.duplicates.owners}, mascotas ${result.duplicates.pets}, especies ${result.duplicates.species}, razas ${result.duplicates.breeds}`,
    );
  };

  const actionButtonClass =
    'h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm touch-manipulation min-w-[44px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50';

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Cargando configuración operativa...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <PawPrint className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Catálogo de mascotas</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Especies, razas, carácter y comportamiento usados en fichas de mascotas y formularios.
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Dialog open={showSpeciesConfig} onOpenChange={setShowSpeciesConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={actionButtonClass}>
                <PawPrint className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 shrink-0" />
                Config. Especies
              </Button>
            </DialogTrigger>
            <ConfigDialog
              title="Configurar Especies"
              items={speciesList.length ? speciesList : DEFAULT_SPECIES}
              onSave={async (items) => {
                setSpeciesList(items);
                await saveConfigurations('species', items);
              }}
              onClose={() => setShowSpeciesConfig(false)}
            />
          </Dialog>

          <Dialog open={showBreedConfig} onOpenChange={setShowBreedConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={actionButtonClass}>
                <Dog className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 shrink-0" />
                Config. Razas
              </Button>
            </DialogTrigger>
            <BreedConfigDialog
              speciesList={speciesList}
              breedsBySpecies={breedsBySpecies}
              onSave={async (species, items) => {
                const type =
                  species === 'Perro' ? 'dog_breed' : species === 'Gato' ? 'cat_breed' : `breed_${species}`;
                await saveConfigurations(type, items, { silent: true });
                setBreedsBySpecies((prev) => ({ ...prev, [species]: items }));
                if (species === 'Perro') setDogBreeds(items);
                if (species === 'Gato') setCatBreeds(items);
              }}
              onAllSaved={() => loadConfigurations()}
              onClose={() => setShowBreedConfig(false)}
            />
          </Dialog>

          <Dialog open={showTemperamentConfig} onOpenChange={setShowTemperamentConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={actionButtonClass}>
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 shrink-0" />
                Config. Carácter
              </Button>
            </DialogTrigger>
            <ConfigDialog
              title="Configurar Carácter"
              items={temperaments.length ? temperaments : [...PET_TEMPERAMENTS]}
              onSave={async (items) => {
                setTemperaments(items);
                await saveConfigurations('temperament', items);
              }}
              onClose={() => setShowTemperamentConfig(false)}
            />
          </Dialog>

          <Dialog open={showBehaviorConfig} onOpenChange={setShowBehaviorConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={actionButtonClass}>
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 shrink-0" />
                Config. Comportamiento
              </Button>
            </DialogTrigger>
            <ConfigDialog
              title="Configurar Comportamiento"
              items={behaviors.length ? behaviors : [...PET_BEHAVIORS]}
              onSave={async (items) => {
                setBehaviors(items);
                await saveConfigurations('behavior', items);
              }}
              onClose={() => setShowBehaviorConfig(false)}
            />
          </Dialog>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Etiquetas del sistema</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Clasificaciones reutilizables para tutores, mascotas, citas, servicios y seguimiento interno.
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Dialog open={showClientTagsConfig} onOpenChange={setShowClientTagsConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={actionButtonClass}>
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 shrink-0" />
                Etiquetas Tutores
              </Button>
            </DialogTrigger>
            <ConfigDialog
              title="Etiquetas de tutores"
              description="Etiquetas para clientes y tutores (VIP, moroso, referido, etc.)"
              items={clientTags.length ? clientTags : [...DEFAULT_CLIENT_TAGS]}
              onSave={async (items) => {
                setClientTags(items);
                await saveConfigurations('client_tag', items);
              }}
              onClose={() => setShowClientTagsConfig(false)}
            />
          </Dialog>

          <Dialog open={showPetTagsConfig} onOpenChange={setShowPetTagsConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={actionButtonClass}>
                <PawPrint className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 shrink-0" />
                Etiquetas Mascotas
              </Button>
            </DialogTrigger>
            <ConfigDialog
              title="Etiquetas de mascotas"
              description="Alertas clínicas o de manejo (alergias, sedación, senior, etc.)"
              items={petTags.length ? petTags : [...DEFAULT_PET_TAGS]}
              onSave={async (items) => {
                setPetTags(items);
                await saveConfigurations('pet_tag', items);
              }}
              onClose={() => setShowPetTagsConfig(false)}
            />
          </Dialog>

          <Dialog open={showAppointmentTagsConfig} onOpenChange={setShowAppointmentTagsConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={actionButtonClass}>
                <CalendarClock className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 shrink-0" />
                Etiquetas Citas
              </Button>
            </DialogTrigger>
            <ConfigDialog
              title="Etiquetas de citas"
              description="Prioridad y contexto de la cita (urgente, primera visita, seguimiento)"
              items={appointmentTags.length ? appointmentTags : [...DEFAULT_APPOINTMENT_TAGS]}
              onSave={async (items) => {
                setAppointmentTags(items);
                await saveConfigurations('appointment_tag', items);
              }}
              onClose={() => setShowAppointmentTagsConfig(false)}
            />
          </Dialog>

          <Dialog open={showServiceTagsConfig} onOpenChange={setShowServiceTagsConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={actionButtonClass}>
                <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 shrink-0" />
                Etiquetas Servicios
              </Button>
            </DialogTrigger>
            <ConfigDialog
              title="Etiquetas de servicios"
              description="Clasificación comercial (premium, paquete, promoción, suscripción)"
              items={serviceTags.length ? serviceTags : [...DEFAULT_SERVICE_TAGS]}
              onSave={async (items) => {
                setServiceTags(items);
                await saveConfigurations('service_tag', items);
              }}
              onClose={() => setShowServiceTagsConfig(false)}
            />
          </Dialog>

          <Dialog open={showStaffTagsConfig} onOpenChange={setShowStaffTagsConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className={actionButtonClass}>
                <ClipboardList className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 shrink-0" />
                Etiquetas Internas
              </Button>
            </DialogTrigger>
            <ConfigDialog
              title="Etiquetas internas del equipo"
              description="Seguimiento operativo (revisión pendiente, escalar, documentación incompleta)"
              items={staffTags.length ? staffTags : [...DEFAULT_STAFF_TAGS]}
              onSave={async (items) => {
                setStaffTags(items);
                await saveConfigurations('staff_tag', items);
              }}
              onClose={() => setShowStaffTagsConfig(false)}
            />
          </Dialog>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <Search className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold">Mantenimiento y alertas</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Herramientas de calidad de datos y recordatorios próximos de mascotas.
        </p>
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <Button variant="outline" size="sm" className={actionButtonClass} onClick={handleAuditDuplicates}>
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1.5 shrink-0" />
            Auditoría duplicados
          </Button>
          <Badge variant="outline" className="h-9 sm:h-10 inline-flex items-center px-3">
            Recordatorios 30d: {remindersCount}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => loadRemindersAndDuplicates()} title="Actualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {duplicateSummary && (
          <>
            <Separator className="my-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Tutores duplicados</p>
                <p className="text-lg font-semibold">{duplicateSummary.owners}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Mascotas duplicadas</p>
                <p className="text-lg font-semibold">{duplicateSummary.pets}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Especies duplicadas</p>
                <p className="text-lg font-semibold">{duplicateSummary.species}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground">Razas duplicadas</p>
                <p className="text-lg font-semibold">{duplicateSummary.breeds}</p>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
