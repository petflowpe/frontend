import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  DEFAULT_APPOINTMENT_TAGS,
  DEFAULT_CLIENT_TAGS,
  DEFAULT_PET_TAGS,
  DEFAULT_SERVICE_TAGS,
  DEFAULT_STAFF_TAGS,
  PET_BEHAVIORS,
  PET_TEMPERAMENTS,
} from '../config/defaults';
import { apiClient } from '../utils/api/client';

const DEFAULT_SPECIES = ['Perro', 'Gato', 'Otro'];

export interface PetConfigurationsState {
  speciesList: string[];
  dogBreeds: string[];
  catBreeds: string[];
  breedsBySpecies: Record<string, string[]>;
  temperaments: string[];
  behaviors: string[];
  clientTags: string[];
  petTags: string[];
  appointmentTags: string[];
  serviceTags: string[];
  staffTags: string[];
}

export function usePetConfigurations(companyId?: number | null) {
  const [loading, setLoading] = useState(true);
  const [speciesList, setSpeciesList] = useState<string[]>([]);
  const [dogBreeds, setDogBreeds] = useState<string[]>([]);
  const [catBreeds, setCatBreeds] = useState<string[]>([]);
  const [breedsBySpecies, setBreedsBySpecies] = useState<Record<string, string[]>>({});
  const [temperaments, setTemperaments] = useState<string[]>([...PET_TEMPERAMENTS]);
  const [behaviors, setBehaviors] = useState<string[]>([...PET_BEHAVIORS]);
  const [clientTags, setClientTags] = useState<string[]>([...DEFAULT_CLIENT_TAGS]);
  const [petTags, setPetTags] = useState<string[]>([...DEFAULT_PET_TAGS]);
  const [appointmentTags, setAppointmentTags] = useState<string[]>([...DEFAULT_APPOINTMENT_TAGS]);
  const [serviceTags, setServiceTags] = useState<string[]>([...DEFAULT_SERVICE_TAGS]);
  const [staffTags, setStaffTags] = useState<string[]>([...DEFAULT_STAFF_TAGS]);

  const loadConfigurations = useCallback(async () => {
    setLoading(true);
    try {
      const params = companyId ? { company_id: String(companyId) } : undefined;
      const response = await apiClient.get<
        | {
            species?: string[];
            dog_breeds?: string[];
            cat_breeds?: string[];
            breeds_by_species?: Record<string, string[]>;
            temperaments?: string[];
            behaviors?: string[];
            client_tags?: string[];
            pet_tags?: string[];
            appointment_tags?: string[];
            service_tags?: string[];
            staff_tags?: string[];
          }
        | { data: Record<string, unknown> }
      >('/pet-configurations/all', params);

      const configs =
        response && typeof response === 'object' && 'data' in response && response.data
          ? (response.data as Record<string, unknown>)
          : (response as Record<string, unknown>);

      const species =
        Array.isArray(configs.species) && configs.species.length > 0
          ? (configs.species as string[])
          : DEFAULT_SPECIES;
      setSpeciesList(species);

      const dogB = Array.isArray(configs.dog_breeds) ? (configs.dog_breeds as string[]) : [];
      const catB = Array.isArray(configs.cat_breeds) ? (configs.cat_breeds as string[]) : [];
      setDogBreeds(dogB);
      setCatBreeds(catB);

      const bySpecies =
        configs.breeds_by_species && typeof configs.breeds_by_species === 'object'
          ? (configs.breeds_by_species as Record<string, string[]>)
          : {};
      const merged: Record<string, string[]> = {};
      species.forEach((s: string) => {
        merged[s] = Array.isArray(bySpecies[s])
          ? bySpecies[s]
          : s === 'Perro'
            ? dogB
            : s === 'Gato'
              ? catB
              : [];
      });
      setBreedsBySpecies(merged);

      setTemperaments(
        Array.isArray(configs.temperaments) && configs.temperaments.length
          ? (configs.temperaments as string[])
          : [...PET_TEMPERAMENTS],
      );
      setBehaviors(
        Array.isArray(configs.behaviors) && configs.behaviors.length
          ? (configs.behaviors as string[])
          : [...PET_BEHAVIORS],
      );
      setClientTags(
        Array.isArray(configs.client_tags) && configs.client_tags.length
          ? (configs.client_tags as string[])
          : [...DEFAULT_CLIENT_TAGS],
      );
      setPetTags(
        Array.isArray(configs.pet_tags) && configs.pet_tags.length
          ? (configs.pet_tags as string[])
          : [...DEFAULT_PET_TAGS],
      );
      setAppointmentTags(
        Array.isArray(configs.appointment_tags) && configs.appointment_tags.length
          ? (configs.appointment_tags as string[])
          : [...DEFAULT_APPOINTMENT_TAGS],
      );
      setServiceTags(
        Array.isArray(configs.service_tags) && configs.service_tags.length
          ? (configs.service_tags as string[])
          : [...DEFAULT_SERVICE_TAGS],
      );
      setStaffTags(
        Array.isArray(configs.staff_tags) && configs.staff_tags.length
          ? (configs.staff_tags as string[])
          : [...DEFAULT_STAFF_TAGS],
      );
    } catch (error) {
      console.error('Error loading configurations:', error);
      setSpeciesList(DEFAULT_SPECIES);
      toast.error('No se pudieron cargar las configuraciones operativas');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadConfigurations();
  }, [loadConfigurations]);

  const saveConfigurations = useCallback(
    async (type: string, items: string[], options?: { silent?: boolean }) => {
      try {
        await apiClient.post('/pet-configurations', {
          type,
          items,
          company_id: companyId ?? null,
        });
        if (!options?.silent) {
          toast.success('Configuraciones guardadas exitosamente');
          await loadConfigurations();
        }
      } catch (error: unknown) {
        console.error('Error saving configurations:', error);
        const err = error as { message?: string; errors?: unknown };
        const msg = err?.message || (err?.errors ? JSON.stringify(err.errors) : 'Error desconocido');
        toast.error('Error al guardar: ' + msg);
        throw error;
      }
    },
    [companyId, loadConfigurations],
  );

  return {
    loading,
    speciesList,
    dogBreeds,
    catBreeds,
    breedsBySpecies,
    temperaments,
    behaviors,
    clientTags,
    petTags,
    appointmentTags,
    serviceTags,
    staffTags,
    setSpeciesList,
    setDogBreeds,
    setCatBreeds,
    setBreedsBySpecies,
    setTemperaments,
    setBehaviors,
    setClientTags,
    setPetTags,
    setAppointmentTags,
    setServiceTags,
    setStaffTags,
    loadConfigurations,
    saveConfigurations,
  };
}
