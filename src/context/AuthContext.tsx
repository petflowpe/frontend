import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiClient } from '../utils/api/client';
import { ApiAuthError } from '../utils/api/config';
import { getPortalCompanyId } from '../utils/api/publicBooking';
import { User, Pet, Appointment, Notification, Membership } from '../types';
import type { DocumentType } from '../types';

interface AuthContextType {
  user: User | null;
  pets: Pet[];
  appointments: Appointment[];
  notifications: Notification[];
  membership: Membership | null;
  isAuthenticated: boolean;
  login: (documentType: string, documentNumber: string, password: string, email?: string) => Promise<User | null>;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  addPet: (pet: Omit<Pet, 'id' | 'userId' | 'createdAt'>) => void | Promise<void>;
  updatePet: (petId: string, petData: Partial<Pet>) => void | Promise<void>;
  deletePet: (petId: string) => void | Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => string | Promise<string>;
  cancelAppointment: (appointmentId: string) => void | Promise<void>;
  markNotificationAsRead: (notificationId: string) => void | Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mapear mascota del backend al formato del frontend
function mapBackendPetToFrontend(backendPet: any, userId: string): Pet {
  return {
    id: backendPet.id.toString(),
    userId,
    name: backendPet.name || '',
    species: (backendPet.species || 'Perro') as Pet['species'],
    breed: backendPet.breed || '',
    age: typeof backendPet.age === 'number' ? backendPet.age : 0,
    weight: parseFloat(backendPet.weight) || 0,
    gender: (backendPet.gender === 'Hembra' ? 'Hembra' : 'Macho') as Pet['gender'],
    color: backendPet.color || '',
    vaccines: [],
    medicalHistory: [],
    allergies: Array.isArray(backendPet.allergies) ? backendPet.allergies : [],
    medications: Array.isArray(backendPet.medications) ? backendPet.medications : [],
    createdAt: backendPet.created_at || new Date().toISOString(),
  };
}

// Mapear cita del backend al formato del frontend
function mapBackendAppointmentToFrontend(backendApt: any, userId: string): Appointment {
  const statusMap: Record<string, Appointment['status']> = {
    'Pendiente': 'Pendiente', 'Confirmada': 'Confirmada', 'En Proceso': 'En Proceso',
    'Completada': 'Completada', 'Cancelada': 'Cancelada',
  };
  return {
    id: backendApt.id.toString(),
    userId,
    petId: backendApt.pet_id?.toString() || '',
    petName: backendApt.pet?.name || '',
    serviceType: (backendApt.service_type || 'movilvet-consulta') as Appointment['serviceType'],
    serviceName: backendApt.service_name || backendApt.service_type || '',
    serviceCategory: (backendApt.service_category === 'Peluquería' ? 'Peluquería' : 'MovilVet') as Appointment['serviceCategory'],
    date: backendApt.date || '',
    time: backendApt.time || '00:00',
    duration: backendApt.duration || 45,
    price: parseFloat(backendApt.total || backendApt.price) || 0,
    status: statusMap[backendApt.status] || 'Pendiente',
    address: backendApt.address || '',
    district: backendApt.district || '',
    paymentStatus: (backendApt.payment_status === 'Pagado' ? 'Pagado' : 'Pendiente') as Appointment['paymentStatus'],
    paymentMethod: (backendApt.payment_method as Appointment['paymentMethod']) || undefined,
    veterinarian: backendApt.user?.name,
    createdAt: backendApt.created_at || new Date().toISOString(),
    updatedAt: backendApt.updated_at || new Date().toISOString(),
  };
}

// Mapear notificación del backend al formato del frontend
function mapBackendNotificationToFrontend(backendNotif: any, userId: string): Notification {
  const typeMap: Record<string, Notification['type']> = {
    'info': 'info', 'success': 'success', 'warning': 'warning', 'error': 'error',
  };
  return {
    id: backendNotif.id.toString(),
    userId: backendNotif.user_id?.toString() || userId,
    title: backendNotif.title || '',
    message: backendNotif.message || '',
    type: typeMap[backendNotif.type] || 'info',
    read: !!backendNotif.read,
    createdAt: backendNotif.created_at || new Date().toISOString(),
  };
}

function mapDocumentTypeToBackend(documentType?: string): string {
  if (documentType === 'DNI') return '1';
  if (documentType === 'CE') return '4';
  if (documentType === 'RUC') return '6';
  return '1';
}

function getEffectiveClientId(user: User | null | undefined): string | null {
  if (!user) return null;
  return user.clientId || user.id || null;
}

async function fetchClientByDocument(
  documentType: string | undefined,
  documentNumber: string | undefined,
  companyIdHint?: number | null
): Promise<any | null> {
  const numero = (documentNumber ?? '').trim();
  if (!numero) return null;
  try {
    const company_id = await getPortalCompanyId(companyIdHint);
    const res = await apiClient.post<{ data?: any } | any>('/clients/search-by-document', {
      company_id,
      tipo_documento: mapDocumentTypeToBackend(documentType),
      numero_documento: numero,
    });
    return res && typeof res === 'object' && 'data' in res ? (res as { data: any }).data : res;
  } catch {
    return null;
  }
}

function mergeClientIntoUser(base: User, client: any): User {
  const fullName = client.razon_social || client.fullName || client.full_name || '';
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  return {
    ...base,
    clientId: String(client.id),
    firstName: base.firstName || parts[0] || base.firstName,
    lastName: base.lastName || parts.slice(1).join(' ') || base.lastName,
    phone: base.phone || client.telefono || client.phone || '',
    address: base.address || client.direccion || client.address || '',
    district: base.district || client.distrito || client.district || '',
    email: base.email || client.email || '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);

  const loadUserData = useCallback(async (targetUser: User) => {
    const clientId = getEffectiveClientId(targetUser);
    if (!clientId) return;

    try {
      const notifRes = await apiClient.get<{ data?: any[] }>('/notifications').catch(() => ({ data: [] }));
      const notifList = Array.isArray(notifRes) ? notifRes : (notifRes?.data || []);
      setNotifications(notifList.map((n: any) => mapBackendNotificationToFrontend(n, clientId)));

      const petsRes = await apiClient.get<any[] | { data?: any[] }>(`/clients/${clientId}/pets`).catch((): any[] => []);
      const petsList = Array.isArray(petsRes) ? petsRes : ((petsRes as { data?: any[] })?.data ?? []);
      setPets(petsList.map((p: any) => mapBackendPetToFrontend(p, clientId)));

      const aptRes = await apiClient.get<any[] | { data?: any[] }>(`/clients/${clientId}/appointments`).catch((): any[] => []);
      const aptList = Array.isArray(aptRes) ? aptRes : ((aptRes as { data?: any[] })?.data ?? []);
      setAppointments(aptList.map((a: any) => mapBackendAppointmentToFrontend(a, clientId)));

      setMembership(null);
    } catch (e) {
      console.warn('loadUserData:', e);
      setPets([]);
      setAppointments([]);
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) apiClient.setToken(token);
    const storedUser = localStorage.getItem('smartpet_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        loadUserData(userData);
      } catch {
        localStorage.removeItem('smartpet_user');
      }
    }
  }, [loadUserData]);

  useEffect(() => {
    apiClient.setOnUnauthorized(() => {
      localStorage.removeItem('auth_token');
      apiClient.setToken(null);
      setUser(null);
      setPets([]);
      setAppointments([]);
      setNotifications([]);
      setMembership(null);
    });
    return () => apiClient.setOnUnauthorized(null);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('smartpet_user', JSON.stringify(user));
    else localStorage.removeItem('smartpet_user');
  }, [user]);

  const login = async (documentType: string, documentNumber: string, password: string, email?: string): Promise<User | null> => {
    try {
      // Login con backend Laravel: acepta email o documento (ruta pública sin /v1).
      // Si el llamador pasa email lo enviamos como `email`; en caso contrario,
      // usamos `document_type + document_number` que el backend reconoce.
      const trimmedEmail = (email ?? '').trim();
      const trimmedDoc = (documentNumber ?? '').trim();
      const payload: Record<string, string> = { password };
      if (trimmedEmail) {
        payload.email = trimmedEmail;
      } else if (trimmedDoc) {
        payload.document_number = trimmedDoc;
        if (documentType) payload.document_type = documentType;
      } else {
        throw new Error('Debe proporcionar correo electrónico o número de documento');
      }

      const response = await apiClient.postPublic<{
        access_token: string;
        token_type: string;
        user: {
          id: number;
          name: string;
          email: string;
          role?: { name: string; display_name: string } | string | null;
          role_key?: string | null;
          role_display?: string | null;
          company_id?: number;
          branch_id?: number;
          permissions?: string[];
        };
      }>('/auth/login', payload);

      // Guardar token
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        apiClient.setToken(response.access_token);

        // Convertir usuario del backend al formato del frontend.
        // IMPORTANTE: guardamos el "slug" del rol (super_admin, company_admin, …)
        // para que el filtrado por permisos funcione correctamente en Sidebar/App.
        const backendUser = response.user;
        const roleSlug = backendUser.role_key
          ?? (typeof backendUser.role === 'string' ? backendUser.role : backendUser.role?.name)
          ?? '';
        const roleDisplay = backendUser.role_display
          ?? (typeof backendUser.role === 'string' ? backendUser.role : backendUser.role?.display_name)
          ?? 'Sin rol';
        const permissions = Array.isArray(backendUser.permissions) ? backendUser.permissions : [];

        const backendDocType = (backendUser as { document_type?: string }).document_type;
        const backendDocNumber = (backendUser as { document_number?: string }).document_number;
        const resolvedDocType = (documentType || backendDocType || 'DNI') as DocumentType;
        const resolvedDocNumber = trimmedDoc || backendDocNumber || '';

        let frontendUser: User = {
          id: backendUser.id.toString(),
          documentType: resolvedDocType,
          documentNumber: resolvedDocNumber,
          firstName: backendUser.name.split(' ')[0] || backendUser.name,
          lastName: backendUser.name.split(' ').slice(1).join(' ') || '',
          email: backendUser.email,
          phone: '',
          address: '',
          district: '',
          password: '',
          role: roleSlug,
          // Campos auxiliares usados por Sidebar/App:
          ...( { role_key: roleSlug, role_display: roleDisplay, permissions } as any ),
          companyId: (backendUser as any).company_id ?? undefined,
          branchId: (backendUser as any).branch_id ?? undefined,
          createdAt: new Date().toISOString(),
        };

        const linkedClient = await fetchClientByDocument(
          resolvedDocType,
          resolvedDocNumber,
          (backendUser as any).company_id
        );
        if (linkedClient?.id) {
          frontendUser = mergeClientIntoUser(frontendUser, linkedClient);
        }

        setUser(frontendUser);
        await loadUserData(frontendUser);
        return frontendUser;
      }

      return null;
    } catch (error: unknown) {
      console.error('Error en login:', error);
      // Mostrar mensaje del backend (credenciales, usuario inactivo, bloqueado)
      if (error instanceof ApiAuthError) {
        throw new Error(error.message);
      }
      // Error de red: backend no responde
      const msg = error instanceof Error ? error.message : '';
      if (typeof msg === 'string' && (msg.includes('fetch') || msg.includes('Failed') || msg.includes('Network') || msg.includes('Load'))) {
        throw new Error('No se pudo conectar al servidor. Comprueba que el backend esté en ejecución (http://localhost:8000).');
      }
      if (error instanceof Error) throw error;
      throw new Error('Error al iniciar sesión');
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      // 1. Verificar si ya existe cliente por documento
      const tipoDocumento = userData.documentType === 'DNI' ? '1' : 
                           userData.documentType === 'CE' ? '4' : '6';
      
      try {
        const company_id = await getPortalCompanyId();
        const searchRes = await apiClient.post<{ data?: any } | any>('/clients/search-by-document', {
          company_id,
          tipo_documento: tipoDocumento,
          numero_documento: userData.documentNumber,
        });
        const client = searchRes && typeof searchRes === 'object' && 'data' in searchRes ? (searchRes as { data: any }).data : searchRes;

        // CASO A: CLIENTE EXISTENTE (VINCULACIÓN)
        if (client) {
          
          // Actualizar cliente con email si falta
          await apiClient.put(`/clients/${client.id}`, {
            email: userData.email,
          });

          // Crear usuario en el sistema (si no existe)
          // Nota: Esto requiere que el backend tenga un endpoint para crear usuarios
          // Por ahora, solo creamos la sesión local
          const newUser: User = mergeClientIntoUser({
            id: client.id.toString(),
            clientId: client.id.toString(),
            documentType: userData.documentType!,
            documentNumber: userData.documentNumber!,
            firstName: client.razon_social?.split(' ')[0] || userData.firstName!,
            lastName: client.razon_social?.split(' ').slice(1).join(' ') || userData.lastName!,
            email: userData.email!,
            phone: client.telefono || userData.phone!,
            address: client.direccion || userData.address!,
            district: client.distrito || userData.district!,
            password: '',
            createdAt: client.created_at || new Date().toISOString(),
          }, client);

          const loggedIn = await login(
            userData.documentType!,
            userData.documentNumber!,
            userData.password,
            userData.email
          );
          if (loggedIn) {
            return true;
          }

          setUser(newUser);
          await loadUserData(newUser);
          
          const welcomeNotification: Notification = {
            id: `notif_${Date.now()}`,
            userId: newUser.id,
            title: '¡Cuenta Activada!',
            message: 'Hemos vinculado tu cuenta con tu historial existente en la clínica.',
            type: 'success',
            read: false,
            createdAt: new Date().toISOString()
          };
          setNotifications([welcomeNotification]);

          return true;
        }
      } catch (searchError) {
        // Cliente no existe, continuar con registro
      }

      // CASO B: NUEVO CLIENTE (REGISTRO COMPLETO)
      // Crear cliente en el backend
      const company_id = await getPortalCompanyId();
      const newClientData = await apiClient.post<{ data?: any } | any>('/clients', {
        company_id,
        tipo_documento: tipoDocumento,
        numero_documento: userData.documentNumber,
        razon_social: `${userData.firstName} ${userData.lastName}`,
        nombre_comercial: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        telefono: userData.phone,
        direccion: userData.address,
        distrito: userData.district,
        activo: true,
      });

      const client = newClientData.data || newClientData;

      // Crear usuario en el sistema (requiere endpoint en backend)
      // Por ahora solo creamos la sesión local
      const newUser: User = mergeClientIntoUser({
        id: client.id.toString(),
        clientId: client.id.toString(),
        documentType: userData.documentType!,
        documentNumber: userData.documentNumber!,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        email: userData.email!,
        phone: userData.phone!,
        address: userData.address!,
        district: userData.district!,
        password: '',
        createdAt: client.created_at || new Date().toISOString(),
      }, client);

      const loggedIn = await login(
        userData.documentType!,
        userData.documentNumber!,
        userData.password,
        userData.email
      );
      if (loggedIn) {
        return true;
      }

      setUser(newUser);
      setPets([]);
      setAppointments([]);
      
      const welcomeNotification: Notification = {
        id: `notif_${Date.now()}`,
        userId: newUser.id,
        title: '¡Bienvenido a SmartPet!',
        message: 'Tu cuenta ha sido creada exitosamente. Ahora puedes registrar a tus mascotas.',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications([welcomeNotification]);

      return true;

    } catch (error: any) {
      console.error('Error general en registro:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Cerrar sesión en el backend
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar token y estado local
      localStorage.removeItem('auth_token');
      localStorage.removeItem('smartpet_user');
      apiClient.setToken(null);
      setUser(null);
      setPets([]);
      setAppointments([]);
      setNotifications([]);
      setMembership(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser(prev => prev ? { ...prev, ...userData } : null);
    }
  };

  const addPet = async (petData: Omit<Pet, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const clientId = getEffectiveClientId(user);
    if (!clientId) return;
    try {
      const res = await apiClient.post<{ data?: any }>('/pets', {
        client_id: parseInt(clientId, 10),
        name: petData.name,
        species: petData.species,
        breed: petData.breed || null,
        gender: petData.gender || null,
        weight: petData.weight || null,
        color: petData.color || null,
        birth_date: (petData as any).birthDate || null,
      });
      const backendPet = res?.data ?? res;
      const newPet = mapBackendPetToFrontend(backendPet, clientId);
      setPets(prev => [...prev, newPet]);
    } catch (e) {
      console.error('addPet:', e);
    }
  };

  const updatePet = async (petId: string, petData: Partial<Pet>) => {
    try {
      await apiClient.put(`/pets/${petId}`, {
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        gender: petData.gender,
        weight: petData.weight,
        color: petData.color,
      });
      setPets(prev => prev.map(p => p.id === petId ? { ...p, ...petData } : p));
    } catch (e) {
      console.error('updatePet:', e);
    }
  };

  const deletePet = async (petId: string) => {
    try {
      await apiClient.delete(`/pets/${petId}`);
      setPets(prev => prev.filter(p => p.id !== petId));
    } catch (e) {
      console.error('deletePet:', e);
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user) throw new Error('Debes iniciar sesión para agendar');
    const clientId = getEffectiveClientId(user);
    if (!clientId) throw new Error('No se encontró tu ficha de cliente');

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      throw new Error('Tu sesión no está activa. Inicia sesión con tu documento y contraseña para reservar.');
    }

    try {
      const vehicleId = (appointmentData as { vehicleId?: string | number }).vehicleId;
      const res = await apiClient.post<{ data?: any }>('/appointments', {
        client_id: parseInt(clientId, 10),
        pet_id: parseInt(appointmentData.petId),
        service_type: appointmentData.serviceType,
        service_name: appointmentData.serviceName,
        service_category: appointmentData.serviceCategory,
        date: appointmentData.date,
        time: appointmentData.time,
        duration: appointmentData.duration,
        address: appointmentData.address,
        district: appointmentData.district,
        price: appointmentData.price,
        total: appointmentData.price,
        notes: '[Portal cliente autenticado]',
        ...(vehicleId != null && String(vehicleId) !== ''
          ? { vehicle_id: parseInt(String(vehicleId), 10) }
          : {}),
      });
      const backendApt = res?.data ?? res;
      const newApt = mapBackendAppointmentToFrontend(backendApt, clientId);
      setAppointments(prev => [...prev, newApt]);
      return newApt.id;
    } catch (e) {
      console.error('addAppointment:', e);
      const msg = e instanceof Error ? e.message : 'No se pudo registrar la cita';
      throw new Error(msg);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      await apiClient.post(`/appointments/${appointmentId}/change-status`, { status: 'Cancelada' });
      setAppointments(prev => prev.map(apt =>
        apt.id === appointmentId ? { ...apt, status: 'Cancelada' as const, updatedAt: new Date().toISOString() } : apt
      ));
    } catch (e) {
      console.error('cancelAppointment:', e);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiClient.post(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    } catch (e) {
      console.error('markNotificationAsRead:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        pets,
        appointments,
        notifications,
        membership,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        addPet,
        updatePet,
        deletePet,
        addAppointment,
        cancelAppointment,
        markNotificationAsRead
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}