import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';

export interface Pet {
  id: string;
  name: string;
  lastName?: string;
  species: string;
  breed: string;
  gender: 'Macho' | 'Hembra';
  birthDate: string; // YYYY-MM-DD
  registrationDate?: string;
  nextVaccinationDate?: string;
  nextDewormingDate?: string;
  weight: number;
  color?: string;
  medicalNotes?: string;
  photoUrl?: string;
  sterilized?: boolean;
  lastVaccinationDate?: string;
  lastDewormingDate?: string;
  lastFleaTreatmentDate?: string;
  nextFleaTreatmentDate?: string;
  notes?: string;
  // Campos derivados para UI
  age?: number;
  size?: 'Pequeño' | 'Mediano' | 'Grande' | 'Gigante';
}

export interface Client {
  id: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  phone1?: string;
  phone2?: string;
  address: string;
  district: string;
  notes: string;
  criticalNote?: string;
  criticalPetNote?: string;
  isActive: boolean;
  createdAt: string;
  pets: Pet[];
  lastVisit?: string;
  birthDate?: string;
  gender?: string;
  zone?: string;
  loyaltyPoints?: number;
  loyaltyLevel?: string;
  petsCount?: number;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ data: Client[]; meta?: any } | Client[]>('/clients');
      
      // Laravel devuelve { success: true, data: [...] } o directamente el array
      const clientsArray = Array.isArray(response) ? response : (response.data || []);
      
      // Mapear cada cliente del backend al formato del frontend
      const mappedClients = clientsArray.map((client: any) => fromBackendFormat(client));
      
      // OPTIMIZACIÓN: No cargar mascotas automáticamente para todos los clientes
      // Las mascotas se cargarán bajo demanda cuando se necesiten
      // Esto evita múltiples llamadas al backend al cargar la página
      const clientsWithEmptyPets = mappedClients.map(client => ({
        ...client,
        pets: [] // Las mascotas se cargarán cuando se necesiten
      }));
      
      setClients(clientsWithEmptyPets);
    } catch (e) {
      console.error("Error loading clients", e);
      toast.error("Error cargando clientes del servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar clientes al montar el componente que usa el hook
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Convertir formato frontend a formato backend Laravel
  const toBackendFormat = (client: Partial<Client>) => {
    return {
      razon_social: client.fullName || '',
      nombre_comercial: client.fullName || '', // Usar el mismo nombre si no hay comercial
      tipo_documento: client.documentType === 'DNI' ? '1' : client.documentType === 'CE' ? '4' : client.documentType === 'RUC' ? '6' : '1',
      numero_documento: client.documentNumber || '',
      email: client.email || null,
      telefono: client.phone || null,
      telefono2: (client as any).phone2 || null,
      direccion: client.address || null,
      distrito: client.district || null,
      provincia: (client as any).province || 'Lima',
      departamento: (client as any).department || 'Lima',
      critical_note: (client as any).criticalNote || null,
      critical_pet_note: (client as any).criticalPetNote || null,
      activo: client.isActive !== false,
    };
  };

  // Convertir formato backend Laravel a formato frontend
  const fromBackendFormat = (backendClient: any): Client => {
    return {
      id: backendClient.id.toString(),
      fullName: backendClient.razon_social || backendClient.nombre_comercial || '',
      documentType: backendClient.tipo_documento === '1' ? 'DNI' : backendClient.tipo_documento === '4' ? 'CE' : backendClient.tipo_documento === '6' ? 'RUC' : backendClient.tipo_documento === '7' ? 'PAS' : 'DNI',
      documentNumber: backendClient.numero_documento || '',
      email: backendClient.email || '',
      phone: backendClient.telefono || backendClient.telefono1 || '',
      phone1: backendClient.telefono || backendClient.telefono1 || '',
      phone2: backendClient.telefono2 || undefined,
      address: backendClient.direccion || '',
      district: backendClient.distrito || '',
      notes: backendClient.notas || '',
      criticalNote: backendClient.critical_note || '',
      criticalPetNote: backendClient.critical_pet_note || '',
      isActive: backendClient.activo !== false,
      createdAt: backendClient.created_at || new Date().toISOString(),
      pets: backendClient.pets ? (Array.isArray(backendClient.pets) ? backendClient.pets.map((p: any) => fromBackendPet(p)) : []) : [],
      petsCount: backendClient.pets_count ?? backendClient.petsCount ?? undefined,
      lastVisit: backendClient.fecha_ultima_visita || undefined,
      birthDate: backendClient.fecha_nacimiento || undefined,
      gender: backendClient.genero || undefined,
      zone: backendClient.zona_preferida || undefined,
      loyaltyPoints: backendClient.puntos_fidelizacion ?? undefined,
      loyaltyLevel: backendClient.nivel_fidelizacion || undefined,
    };
  };

  const fromBackendPet = (p: any): Pet => ({
    id: String(p.id),
    name: p.name || '',
    lastName: p.last_name || '',
    species: p.species || 'Perro',
    breed: p.breed || '',
    gender: (p.gender === 'Hembra' ? 'Hembra' : 'Macho') as 'Macho' | 'Hembra',
    birthDate: p.birth_date || p.fecha_registro || '',
    weight: Number(p.weight) || 0,
    color: p.color,
    medicalNotes: p.notes,
    notes: p.notes,
    photoUrl: p.photo,
    age: p.age,
    size: p.size as Pet['size'],
    registrationDate: p.fecha_registro || p.created_at || '',
    nextVaccinationDate: p.next_vaccination_date || '',
    nextDewormingDate: p.next_deworming_date || '',
    lastVaccinationDate: p.last_vaccination_date || '',
    lastDewormingDate: p.last_deworming_date || '',
    lastFleaTreatmentDate: p.last_flea_treatment_date || '',
    nextFleaTreatmentDate: p.next_flea_treatment_date || '',
    sterilized: !!p.sterilized,
  });

  const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'pets'>) => {
    try {
      const backendData = toBackendFormat(clientData);
      const response = await apiClient.post<{ data: any }>('/clients', backendData);
      
      const newClient = fromBackendFormat(response.data || response);
      setClients(prev => [newClient, ...prev]);
      toast.success('Cliente creado exitosamente');
      return newClient;
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al guardar cliente');
      throw e;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const backendData = toBackendFormat(updates);
      const response = await apiClient.put<{ data: any }>(`/clients/${id}`, backendData);
      
      const updatedClient = fromBackendFormat(response.data || response);
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      toast.success('Cliente actualizado');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al actualizar cliente');
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await apiClient.delete(`/clients/${id}`);
      setClients(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente eliminado');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al eliminar cliente');
    }
  };

  // Gestión de Mascotas usando el endpoint de pets del backend
  const addPetToClient = async (clientId: string, petData: Omit<Pet, 'id'>) => {
    try {
      const backendPetData: any = {
        client_id: parseInt(clientId),
        name: petData.name,
        last_name: (petData as any).lastName || null,
        species: petData.species,
        breed: petData.breed || null,
        gender: petData.gender || null,
        birth_date: petData.birthDate || null,
        weight: petData.weight || null,
        color: petData.color || null,
        age: petData.age || null,
        size: petData.size || null,
        temperament: (petData as any).temperament || null,
        behavior: Array.isArray((petData as any).behavior) && (petData as any).behavior?.length > 0 ? (petData as any).behavior : null,
        sterilized: (petData as any).sterilized || false,
        sterilization_date: (petData as any).sterilizationDate || null,
        last_vaccination_date: (petData as any).lastVaccinationDate || null,
        next_vaccination_date: (petData as any).nextVaccinationDate || null,
        last_deworming_date: (petData as any).lastDewormingDate || null,
        next_deworming_date: (petData as any).nextDewormingDate || null,
        last_flea_treatment_date: (petData as any).lastFleaTreatmentDate || null,
        next_flea_treatment_date: (petData as any).nextFleaTreatmentDate || null,
        insurance_company: (petData as any).insuranceCompany || null,
        insurance_policy_number: (petData as any).insurancePolicyNumber || null,
        emergency_contact_name: (petData as any).emergencyContactName || null,
        emergency_contact_phone: (petData as any).emergencyContactPhone || null,
        allergies: Array.isArray((petData as any).allergies) && (petData as any).allergies?.length > 0 ? (petData as any).allergies : null,
        medications: Array.isArray((petData as any).medications) && (petData as any).medications?.length > 0 ? (petData as any).medications : null,
        notes: (petData as any).medicalNotes || null,
      };

      const response = await apiClient.post<{ success?: boolean; data?: any }>('/pets', backendPetData);
      const created = response?.data ?? response;
      const newPet = {
        id: String(created?.id ?? ''),
        name: created?.name ?? petData.name,
        lastName: created?.last_name ?? (petData as any).lastName ?? '',
        species: created?.species ?? petData.species,
        breed: created?.breed ?? petData.breed ?? '',
        gender: (created?.gender === 'Hembra' ? 'Hembra' : 'Macho') as 'Macho' | 'Hembra',
        birthDate: created?.birth_date ?? petData.birthDate ?? '',
        weight: Number(created?.weight) ?? petData.weight ?? 0,
        color: created?.color ?? (petData as any).color,
        medicalNotes: created?.notes ?? (petData as any).medicalNotes,
        photoUrl: created?.photo ?? (petData as any).photoUrl,
        age: created?.age ?? (petData as any).age,
        size: (created?.size ?? (petData as any).size) as Pet['size'],
        registrationDate: created?.fecha_registro ?? created?.created_at ?? new Date().toISOString(),
        nextVaccinationDate: created?.next_vaccination_date ?? (petData as any).nextVaccinationDate ?? '',
        nextDewormingDate: created?.next_deworming_date ?? (petData as any).nextDewormingDate ?? '',
        lastVaccinationDate: created?.last_vaccination_date ?? (petData as any).lastVaccinationDate ?? '',
        lastDewormingDate: created?.last_deworming_date ?? (petData as any).lastDewormingDate ?? '',
        lastFleaTreatmentDate: created?.last_flea_treatment_date ?? (petData as any).lastFleaTreatmentDate ?? '',
        nextFleaTreatmentDate: created?.next_flea_treatment_date ?? (petData as any).nextFleaTreatmentDate ?? '',
        sterilized: created?.sterilized ?? !!(petData as any).sterilized,
        notes: created?.notes ?? (petData as any).notes ?? '',
      };

      // Actualizar estado local
      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { ...c, pets: [...(c.pets || []), newPet] }
          : c
      ));

      toast.success('Mascota agregada correctamente');
      return newPet;
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al agregar mascota');
      throw e;
    }
  };

  const updatePet = async (clientId: string, petId: string, updates: Partial<Pet>) => {
    try {
      const backendPetData: any = {};
      const has = (key: string) => Object.prototype.hasOwnProperty.call(updates, key);
      if (updates.name) backendPetData.name = updates.name;
      if (has('lastName')) backendPetData.last_name = (updates as any).lastName || null;
      if (updates.species) backendPetData.species = updates.species;
      if (updates.breed) backendPetData.breed = updates.breed;
      if (updates.gender) backendPetData.gender = updates.gender;
      if (has('birthDate')) backendPetData.birth_date = updates.birthDate || null;
      if (updates.weight !== undefined) backendPetData.weight = updates.weight;
      if (updates.color) backendPetData.color = updates.color;
      if (updates.age !== undefined) backendPetData.age = updates.age;
      if (updates.size) backendPetData.size = updates.size;
      if (updates.temperament) backendPetData.temperament = updates.temperament;
      if (updates.behavior !== undefined) backendPetData.behavior = Array.isArray(updates.behavior) && updates.behavior.length > 0 ? updates.behavior : null;
      if (updates.sterilized !== undefined) backendPetData.sterilized = updates.sterilized;
      if (updates.sterilizationDate) backendPetData.sterilization_date = updates.sterilizationDate;
      if (has('lastVaccinationDate')) backendPetData.last_vaccination_date = (updates as any).lastVaccinationDate || null;
      if (has('nextVaccinationDate')) backendPetData.next_vaccination_date = updates.nextVaccinationDate || null;
      if (has('lastDewormingDate')) backendPetData.last_deworming_date = (updates as any).lastDewormingDate || null;
      if (has('nextDewormingDate')) backendPetData.next_deworming_date = updates.nextDewormingDate || null;
      if (has('lastFleaTreatmentDate')) backendPetData.last_flea_treatment_date = (updates as any).lastFleaTreatmentDate || null;
      if (has('nextFleaTreatmentDate')) backendPetData.next_flea_treatment_date = (updates as any).nextFleaTreatmentDate || null;
      if (updates.insuranceCompany) backendPetData.insurance_company = updates.insuranceCompany;
      if (updates.insurancePolicyNumber) backendPetData.insurance_policy_number = updates.insurancePolicyNumber;
      if (updates.emergencyContactName) backendPetData.emergency_contact_name = updates.emergencyContactName;
      if (updates.emergencyContactPhone) backendPetData.emergency_contact_phone = updates.emergencyContactPhone;
      if (updates.allergies !== undefined) backendPetData.allergies = Array.isArray(updates.allergies) && updates.allergies.length > 0 ? updates.allergies : null;
      if (updates.medications !== undefined) backendPetData.medications = Array.isArray(updates.medications) && updates.medications.length > 0 ? updates.medications : null;
      if (has('notes')) backendPetData.notes = (updates as any).notes || null;

      await apiClient.put(`/pets/${petId}`, backendPetData);

      // Actualizar estado local
      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { 
              ...c, 
              pets: c.pets.map(p => p.id === petId ? { ...p, ...updates } : p)
            }
          : c
      ));

      toast.success('Mascota actualizada');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al actualizar mascota');
    }
  };

  const deletePet = async (clientId: string, petId: string) => {
    try {
      await apiClient.delete(`/pets/${petId}`);

      // Actualizar estado local
      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { ...c, pets: c.pets.filter(p => p.id !== petId) }
          : c
      ));

      toast.success('Mascota eliminada');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Error al eliminar mascota');
    }
  };

  // Función para cargar mascotas de un cliente específico bajo demanda
  const loadClientPets = async (clientId: string) => {
    try {
      const client = clients.find(c => c.id === clientId);
      // Si el cliente ya tiene mascotas cargadas, no volver a cargar
      if (client && client.pets && client.pets.length > 0) {
        return client.pets;
      }

      const petsResponse = await apiClient.get<any[]>(`/clients/${clientId}/pets`);
      const pets = Array.isArray(petsResponse) ? petsResponse : (petsResponse.data || []);
      const mappedPets = pets.map((pet: any) => ({
        id: pet.id.toString(),
        name: pet.name,
        lastName: pet.last_name || '',
        species: pet.species,
        breed: pet.breed || '',
        gender: pet.gender || 'Macho',
        birthDate: pet.birth_date || '',
        registrationDate: pet.fecha_registro || pet.created_at || '',
        weight: parseFloat(pet.weight) || 0,
        color: pet.color || '',
        age: pet.age || 0,
        sterilized: !!pet.sterilized,
        lastVaccinationDate: pet.last_vaccination_date || '',
        lastDewormingDate: pet.last_deworming_date || '',
        nextVaccinationDate: pet.next_vaccination_date || '',
        nextDewormingDate: pet.next_deworming_date || '',
        notes: pet.notes || '',
      }));

      // Actualizar el cliente con sus mascotas
      setClients(prev => prev.map(c => 
        c.id === clientId 
          ? { ...c, pets: mappedPets }
          : c
      ));

      return mappedPets;
    } catch (e: any) {
      console.error('Error loading client pets:', e);
      return [];
    }
  };

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    addPetToClient,
    updatePet,
    deletePet,
    loadClientPets, // Nueva función para cargar mascotas bajo demanda
    refreshClients: loadClients
  };
};
