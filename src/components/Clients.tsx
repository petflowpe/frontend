import { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, PawPrint, Calendar, Eye, Heart, Edit2, Trash2, UserPlus, FileText, DollarSign, Truck, Settings, ChevronRight, ChevronLeft, Dog, Cat, Bug, Syringe, Shield, Bell, ArrowLeft, StickyNote } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PetProfile } from './PetProfile';
import { PET_DOG_BREEDS, PET_CAT_BREEDS, PET_TEMPERAMENTS, PET_BEHAVIORS } from '../config/defaults';
import { AddressGeocoder } from './admin/AddressGeocoder';
import { autoAssignClientToRoutes, determineClientZone } from '../lib/routeAutoAssignment';
import { toast } from 'sonner';
import { useClients } from '../hooks/useClients';
import { EmptyState } from './EmptyState';
// import { usePatients } from '../hooks/usePatients'; // Removed

const LIMA_DISTRICTS = [
  { name: 'Ancón', code: '15123' },
  { name: 'Ate', code: '15022' },
  { name: 'Barranco', code: '15063' },
  { name: 'Breña', code: '15083' },
  { name: 'Carabayllo', code: '15121' },
  { name: 'Cercado de Lima', code: '15001' },
  { name: 'Chaclacayo', code: '15472' },
  { name: 'Chorrillos', code: '15064' },
  { name: 'Cieneguilla', code: '15593' },
  { name: 'Comas', code: '15325' },
  { name: 'El Agustino', code: '15007' },
  { name: 'Independencia', code: '15333' },
  { name: 'Jesús María', code: '15072' },
  { name: 'La Molina', code: '15024' },
  { name: 'La Victoria', code: '15033' },
  { name: 'Lince', code: '15046' },
  { name: 'Los Olivos', code: '15302' },
  { name: 'Lurigancho-Chosica', code: '15457' },
  { name: 'Lurín', code: '15823' },
  { name: 'Magdalena del Mar', code: '15086' },
  { name: 'Miraflores', code: '15074' },
  { name: 'Pachacámac', code: '15823' },
  { name: 'Pucusana', code: '15573' },
  { name: 'Pueblo Libre', code: '15084' },
  { name: 'Puente Piedra', code: '15118' },
  { name: 'Punta Hermosa', code: '15550' },
  { name: 'Punta Negra', code: '15555' },
  { name: 'Rímac', code: '15094' },
  { name: 'San Bartolo', code: '15546' },
  { name: 'San Borja', code: '15037' },
  { name: 'San Isidro', code: '15036' },
  { name: 'San Juan de Lurigancho', code: '15401' },
  { name: 'San Juan de Miraflores', code: '15058' },
  { name: 'San Luis', code: '15021' },
  { name: 'San Martín de Porres', code: '15102' },
  { name: 'San Miguel', code: '15087' },
  { name: 'Santa Anita', code: '15009' },
  { name: 'Santa María del Mar', code: '15587' },
  { name: 'Santa Rosa', code: '15123' },
  { name: 'Santiago de Surco', code: '15038' },
  { name: 'Surquillo', code: '15048' },
  { name: 'Villa El Salvador', code: '15842' },
  { name: 'Villa María del Triunfo', code: '15816' }
];

export function Clients() {
  // Simulación de usuario actual - en producción esto vendría del contexto de autenticación
  const [currentUser, setCurrentUser] = useState({
    name: 'Admin User',
    role: 'Administrador' // Roles: Super Administrador, Administrador, Peluquero Canino, Recepcionista, Veterinario, etc.
  });

  // Función para cambiar rol (solo para demostración - remover en producción)
  const toggleUserRole = () => {
    const roles = ['Super Administrador', 'Administrador', 'Peluquero Canino', 'Recepcionista', 'Veterinario'];
    const currentIndex = roles.indexOf(currentUser.role);
    const nextIndex = (currentIndex + 1) % roles.length;
    setCurrentUser({ ...currentUser, role: roles[nextIndex] });
  };

  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewPet, setShowNewPet] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [editingPet, setEditingPet] = useState<any>(null);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [clientFichaTab, setClientFichaTab] = useState('detalles');

  // Estados para configuraciones - REMOVIDOS (ahora están en PetsManagement)

  // 🆕 Zonas y Vehículos para auto-asignación
  const zones = [
    {
      id: 'zona-1',
      name: 'Lima Centro',
      color: '#3b82f6',
      districts: ['Cercado de Lima', 'Breña', 'La Victoria', 'Rímac', 'San Luis'],
      coverage: 'Alta',
      demand: 85,
      coordinates: {
        center: { lat: -12.0464, lng: -77.0428 },
        radius: 5
      }
    },
    {
      id: 'zona-2',
      name: 'Lima Moderna',
      color: '#10b981',
      districts: ['Miraflores', 'San Isidro', 'Barranco', 'Surco', 'San Borja', 'La Molina'],
      coverage: 'Premium',
      demand: 95,
      coordinates: {
        center: { lat: -12.0797, lng: -77.0365 },
        radius: 6
      }
    },
    {
      id: 'zona-3',
      name: 'Lima Norte',
      color: '#f59e0b',
      districts: ['Los Olivos', 'San Martín de Porres', 'Independencia', 'Comas', 'Puente Piedra'],
      coverage: 'Media',
      demand: 70,
      coordinates: {
        center: { lat: -11.9935, lng: -77.0609 },
        radius: 7
      }
    },
    {
      id: 'zona-4',
      name: 'Lima Sur',
      color: '#8b5cf6',
      districts: ['Villa El Salvador', 'Villa María del Triunfo', 'Chorrillos', 'San Juan de Miraflores'],
      coverage: 'Media',
      demand: 65,
      coordinates: {
        center: { lat: -12.1893, lng: -76.9736 },
        radius: 8
      }
    },
    {
      id: 'zona-5',
      name: 'Lima Este',
      color: '#ec4899',
      districts: ['Ate', 'Santa Anita', 'El Agustino', 'San Juan de Lurigancho', 'Lurigancho-Chosica'],
      coverage: 'Básica',
      demand: 60,
      coordinates: {
        center: { lat: -12.0512, lng: -76.9375 },
        radius: 9
      }
    }
  ];

  const vehicles = [
    {
      id: 'vehiculo-1',
      name: 'Móvil 1',
      code: 'VEH-001',
      assignedZones: ['zona-1', 'zona-2'],
      primaryZone: 'zona-2',
      maxDistance: 30,
      workDays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
      startTime: '08:00',
      endTime: '18:00'
    },
    {
      id: 'vehiculo-2',
      name: 'Móvil 2',
      code: 'VEH-002',
      assignedZones: ['zona-3'],
      primaryZone: 'zona-3',
      maxDistance: 25,
      workDays: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      startTime: '09:00',
      endTime: '17:00'
    },
    {
      id: 'vehiculo-3',
      name: 'Móvil 3',
      code: 'VEH-003',
      assignedZones: ['zona-4', 'zona-5'],
      primaryZone: 'zona-4',
      maxDistance: 35,
      workDays: ['Mar', 'Jue', 'Vie', 'Sáb'],
      startTime: '08:30',
      endTime: '17:30'
    }
  ];

  const { 
    clients, 
    loading, 
    createClient, 
    updateClient, 
    deleteClient, 
    addPetToClient, 
    updatePet, 
    deletePet, 
    loadClientPets,
    fetchClients 
  } = useClients();

  // const { createPatient, updatePatient, deletePatient } = usePatients(); // Removed

  /*
  const [clients, setClients] = useState([
    // ... MOCKS ELIMINADOS ...
  ]);
  */

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-300 dark:border-green-700';
      case 'Inactivo': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200 border-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'Regular': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-300 dark:border-blue-700';
      case 'Bueno': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 border-green-300 dark:border-green-700';
      case 'VIP': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 border-purple-300 dark:border-purple-700';
      case 'Malo': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200 border-red-300 dark:border-red-700';
      case 'Moroso': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 border-orange-300 dark:border-orange-700';
      case 'Problematico': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'No atender': return 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-100 border-red-400 dark:border-red-600';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200 border-gray-300';
    }
  };

  // Calcular estado de la MASCOTA basado en su historial
  const getPetStatus = (pet: any, clientAppointments: any[]) => {
    const today = new Date();
    const petRegistrationDate = new Date(pet.registrationDate);
    const daysSinceRegistration = Math.floor((today.getTime() - petRegistrationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Filtrar citas solo de esta mascota
    const petAppointments = clientAppointments?.filter(app => app.petName === pet.name) || [];
    
    // Si no tiene citas, es NUEVO si está dentro de los 7 días
    if (petAppointments.length === 0) {
      return daysSinceRegistration <= 7 
        ? { status: '🆕 Nuevo', color: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30' } 
        : null; // No mostrar nada si no tiene citas y pasó más de 7 días
    }

    // Ordenar citas de esta mascota por fecha (más reciente primero)
    const sortedAppointments = [...petAppointments].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const lastAppointment = new Date(sortedAppointments[0].date);
    const daysSinceLastService = Math.floor((today.getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24));
    
    // Verificar si fue RECUPERADO: tuvo más de 75 días sin servicio y volvió hace ≤ 30 días
    if (sortedAppointments.length >= 2) {
      const secondLastAppointment = new Date(sortedAppointments[1].date);
      const daysBetweenLastTwo = Math.floor((lastAppointment.getTime() - secondLastAppointment.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysBetweenLastTwo > 75 && daysSinceLastService <= 30) {
        return { status: '💚 Recuperado', color: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' };
      }
    }

    // Mascota NUEVA: registrada hace menos de 7 días
    if (daysSinceRegistration <= 7) {
      return { status: '🆕 Nuevo', color: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30' };
    }

    // Mascota PERDIDA: última cita hace más de 75 días
    if (daysSinceLastService > 75) {
      return { status: '⚠️ Perdido', color: 'bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30' };
    }

    // Mascota RECURRENTE: última cita hace ≤ 75 días
    return { status: '✅ Recurrente', color: 'bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30' };
  };

  const handleSaveClient = async (clientData: any) => {
    try {
      // Convertir datos del ClientDialog al formato que espera el hook
      const formattedData = {
        documentType: clientData.documentType || 'DNI',
        documentNumber: clientData.documentNumber || '',
        fullName: clientData.fullName || `${clientData.name || ''} ${clientData.lastName1 || ''} ${clientData.lastName2 || ''}`.trim(),
        phone: clientData.phone1 || '',
        phone2: clientData.phone2 || '',
        email: clientData.email || '',
        address: clientData.street ? `${clientData.street} ${clientData.streetNumber || ''}`.trim() : '',
        district: clientData.district || '',
        province: clientData.province || 'Lima',
        department: 'Lima',
        isActive: clientData.status !== 'Inactivo',
      };

      if (editingClient) {
        await updateClient(editingClient.id, formattedData);
        setEditingClient(null);
      } else {
        await createClient(formattedData);
      }
      setShowNewClient(false);
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleDeleteClient = async (id: any) => { // id puede ser string ahora
    if (window.confirm('¿Estás seguro de desactivar este cliente? Esta acción no se puede deshacer.')) {
      try {
        await deleteClient(id);
        if (selectedClient?.id === id) {
          setSelectedClient(null);
        }
        toast.success('Cliente desactivado exitosamente');
      } catch (error: any) {
        console.error("Error deleting client:", error);
        const errorMessage = error.response?.data?.message || error.message || 'Error al desactivar cliente';
        toast.error(errorMessage);
      }
    }
  };

  const handleSavePet = async (petData: any) => {
    if (selectedClient) {
      try {
        // Construir notas médicas combinando campos extra que no tienen columna propia aún
        let medicalNotes = petData.notes || '';
        const extraInfo = [];
        if (petData.activePlan) extraInfo.push(`Plan: ${petData.activePlan}`);
        if (petData.chip) extraInfo.push(`Chip: ${petData.chip}`);
        if (petData.temperament) extraInfo.push(`Carácter: ${petData.temperament}`);
        if (petData.lastVaccinationDate) extraInfo.push(`Últ. Vacuna: ${petData.lastVaccinationDate}`);
        
        if (extraInfo.length > 0) {
          medicalNotes += `\n[Info Extra: ${extraInfo.join(', ')}]`;
        }

        const newPetData = {
          name: petData.name,
          species: petData.species,
          breed: petData.breed,
          birthDate: petData.birthDate || '',
          gender: petData.sex,
          weight: petData.weight || 0,
          medicalNotes: medicalNotes,
          photoUrl: petData.image
        };

        if (editingPet) {
          await updatePet(selectedClient.id, editingPet.id, newPetData);
        } else {
          await addPetToClient(selectedClient.id, newPetData);
        }
        
        // Cerrar modal
        setEditingPet(null);
        setShowNewPet(false);
      } catch (error) {
        console.error("Error saving pet:", error);
      }
    }
  };

  const handleDeletePet = async (petId: any) => {
    if (selectedClient && window.confirm('¿Eliminar mascota?')) {
      await deletePet(selectedClient.id, petId);
    }
  };

  // Al seleccionar un cliente, cargar sus mascotas desde la API para mostrarlas y asignar nuevas
  useEffect(() => {
    if (selectedClient?.id) {
      loadClientPets(selectedClient.id);
    }
  }, [selectedClient?.id]);

  // Efecto para mantener sincronizado selectedClient cuando clients cambian (p. ej. tras cargar mascotas)
  useEffect(() => {
    if (selectedClient) {
      const updatedClient = clients.find(c => c.id === selectedClient.id);
      if (updatedClient) {
        setSelectedClient(updatedClient);
      }
    }
  }, [clients]);

  const filteredClients = (clients || []).filter(client => {
    const pets = client.pets || [];
    return (
      (client.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.documentNumber || '').includes(searchTerm) ||
      pets.some((pet: any) => (pet.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  if (selectedPetId) {
    return (
      <div className="absolute inset-0 z-50 bg-background">
        <PetProfile 
          petId={selectedPetId} 
          onClose={() => setSelectedPetId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {!selectedClient ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl text-primary">Gestión de Clientes</h1>
                <Badge 
                  variant="outline" 
                  className={`cursor-pointer hover:opacity-80 transition-opacity ${
                    currentUser.role === 'Super Administrador'
                      ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400'
                      : currentUser.role === 'Administrador' 
                      ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400' 
                      : 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400'
                  }`}
                  onClick={toggleUserRole}
                  title="Click para cambiar rol (demo)"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {currentUser.role}
                </Badge>
              </div>
              <p className="text-muted-foreground">Administra la información de tus clientes y sus mascotas</p>
            </div>
            <div className="flex gap-2">
              {(currentUser.role === 'Super Administrador' || currentUser.role === 'Administrador') && (
                <Dialog open={showNewClient} onOpenChange={setShowNewClient}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingClient(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Cliente
                    </Button>
                  </DialogTrigger>
                  <ClientDialog
                    client={editingClient}
                    vehicles={vehicles}
                    currentUserRole={currentUser.role}
                    onSave={handleSaveClient}
                    onClose={() => {
                      setShowNewClient(false);
                      setEditingClient(null);
                    }}
                  />
                </Dialog>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, email, documento o mascota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Clients List */}
          <div className="space-y-4">
            {filteredClients.map((client) => {
              const pets = client.pets || [];
              const safeRegistrationDate = (() => {
                try {
                  const d = client.registrationDate ? new Date(client.registrationDate) : null;
                  return d && !isNaN(d.getTime()) ? d.toLocaleDateString('es-PE') : '—';
                } catch {
                  return '—';
                }
              })();

              return (
                <Card 
                  key={client.id} 
                  className={`p-6 cursor-pointer transition-all hover:shadow-xl bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 border-l-4 ${
                    selectedClient?.id === client.id ? 'border-l-primary shadow-xl ring-2 ring-primary/20' : 'border-l-blue-200 dark:border-l-blue-800'
                  }`}
                  onClick={() => {
                    setSelectedClient(client);
                    setClientFichaTab('detalles');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="h-16 w-16 bg-gradient-to-br from-primary via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg ring-4 ring-primary/10">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-lg">{client.fullName}</h3>
                          <Badge className={`${getClientTypeColor(client.clientType)} border`}>
                            {client.clientType}
                          </Badge>
                          <Badge className={`${getStatusColor(client.status)} border`}>
                            {client.status}
                          </Badge>
                          {client.level && (
                            <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-900 dark:from-yellow-950/50 dark:to-amber-950/50 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700">
                              ⭐ {client.level}
                            </Badge>
                          )}
                          {client.isFixedSchedule && (
                            <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-900 dark:from-blue-950/50 dark:to-indigo-950/50 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                              🔁 Cliente Fijo {client.appointmentFrequency && `· ${client.appointmentFrequency.charAt(0).toUpperCase() + client.appointmentFrequency.slice(1)}`}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          <span>Registro cliente: {safeRegistrationDate}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span>{client.documentType}: {client.documentNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-green-500" />
                            <span>{client.phone1}</span>
                          </div>
                          <div className="flex items-center space-x-2 col-span-2">
                            <Mail className="h-4 w-4 text-purple-500" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span>{client.district}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <PawPrint className="h-4 w-4 text-pink-500" />
                            <span>{pets.length} mascota(s)</span>
                          </div>
                        </div>
                        {pets.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {pets.map((pet: any) => {
                              const petStatus = getPetStatus(pet, client.appointments);
                              const petAppointments = client.appointments?.filter((app: any) => app.petName === pet.name) || [];
                              const lastVisit = petAppointments.length > 0 
                                ? new Date([...petAppointments].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date)
                                : null;
                              
                              return (
                                <div key={pet.id} className="flex items-center gap-2 flex-wrap">
                                  <Badge 
                                    variant="outline" 
                                    className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200 dark:border-pink-800 cursor-pointer hover:ring-2 hover:ring-pink-500/50 transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPetId(pet.id);
                                    }}
                                  >
                                    <Heart className="h-3 w-3 mr-1 text-pink-500" />
                                    {pet.name}
                                  </Badge>
                                  {petStatus && (
                                    <Badge className={`${petStatus.color} text-xs px-2 py-0.5`}>
                                      {petStatus.status}
                                    </Badge>
                                  )}
                                  {lastVisit && (
                                    <span className="text-xs text-muted-foreground">
                                      Últ. visita: {lastVisit.toLocaleDateString('es-PE')}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4 flex flex-col gap-2">
                      <Button 
                        size="sm"
                        className="w-full bg-fuchsia-100 hover:bg-fuchsia-200 text-fuchsia-700 dark:bg-fuchsia-950/30 dark:hover:bg-fuchsia-900/50 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800 h-8 text-xs font-bold uppercase tracking-wide px-4 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(client);
                          setClientFichaTab('pacientes');
                          setEditingPet(null);
                          setShowNewPet(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Nueva Mascota
                      </Button>

                      <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
                        <p className="font-bold text-2xl text-green-700 dark:text-green-300">{client.totalSpent} S/</p>
                        <p className="text-xs text-green-600 dark:text-green-400">{client.totalAppointments} citas</p>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(client);
                          setClientFichaTab('citas');
                          setShowNewAppointment(true);
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Nueva Cita
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredClients.length === 0 && (
            <EmptyState
              icon="users"
              title={searchTerm ? 'No se encontraron clientes' : 'Aún no hay clientes'}
              description={searchTerm ? 'Intenta ajustar los términos de búsqueda' : 'Registra tu primer cliente para comenzar'}
              actionLabel={!searchTerm ? 'Añadir cliente' : undefined}
              onAction={!searchTerm ? () => setShowNewClient(true) : undefined}
            />
          )}
        </>
      ) : (
        /* Ficha del cliente: vista tabulada */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => {
                  setSelectedClient(null);
                  setClientFichaTab('detalles');
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a lista
              </Button>
              <h2 className="text-xl font-semibold">Ficha del cliente</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Columna principal: ficha + pestañas */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cabecera ficha */}
              <Card className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary via-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {(selectedClient.fullName || '?').charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-lg font-semibold">{selectedClient.fullName}</h3>
                      <Badge className={`${getClientTypeColor(selectedClient.clientType)} border`}>
                        {selectedClient.clientType}
                      </Badge>
                      <Badge className={`${getStatusColor(selectedClient.status)} border`}>
                        {selectedClient.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{selectedClient.documentType} {selectedClient.documentNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{selectedClient.phone1 || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{selectedClient.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{selectedClient.district || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingClient(selectedClient);
                      setShowNewClient(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar cliente
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingPet(null);
                      setShowNewPet(true);
                      setClientFichaTab('pacientes');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nueva mascota
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowNewAppointment(true);
                      setClientFichaTab('citas');
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Nueva cita
                  </Button>
                </div>
              </Card>

              {/* Tabs principales */}
              <Tabs value={clientFichaTab} onValueChange={setClientFichaTab}>
                <TabsList className="w-full flex flex-wrap justify-start">
                  <TabsTrigger value="detalles">Detalles del cliente</TabsTrigger>
                  <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
                  <TabsTrigger value="citas">Citas</TabsTrigger>
                  <TabsTrigger value="facturacion">Facturación</TabsTrigger>
                  <TabsTrigger value="recordatorios">Recordatorios</TabsTrigger>
                  <TabsTrigger value="comunicacion">Comunicación</TabsTrigger>
                  <TabsTrigger value="notas">Notas</TabsTrigger>
                </TabsList>

                <TabsContent value="detalles" className="mt-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">Detalles del cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Tipo documento:</span> {selectedClient.documentType}</div>
                      <div><span className="text-muted-foreground">N° documento:</span> {selectedClient.documentNumber}</div>
                      <div><span className="text-muted-foreground">Teléfono:</span> {selectedClient.phone1 || '—'}</div>
                      <div><span className="text-muted-foreground">Teléfono 2:</span> {selectedClient.phone2 || '—'}</div>
                      <div className="md:col-span-2"><span className="text-muted-foreground">Email:</span> {selectedClient.email || '—'}</div>
                      <div className="md:col-span-2"><span className="text-muted-foreground">Dirección:</span> {selectedClient.street || selectedClient.address || '—'}</div>
                      <div><span className="text-muted-foreground">Distrito:</span> {selectedClient.district || '—'}</div>
                      <div><span className="text-muted-foreground">Provincia:</span> {selectedClient.province || 'Lima'}</div>
                      <div><span className="text-muted-foreground">Tipo cliente:</span> {selectedClient.clientType}</div>
                      <div><span className="text-muted-foreground">Nivel:</span> {selectedClient.level || '—'}</div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="pacientes" className="mt-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Pacientes (mascotas)</h3>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingPet(null);
                          setShowNewPet(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Añadir
                      </Button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Nombre</th>
                            <th className="text-left p-2">Especie</th>
                            <th className="text-left p-2">Raza</th>
                            <th className="text-left p-2">F. Nacimiento</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedClient.pets || []).map((pet: any) => (
                            <tr key={pet.id} className="border-b hover:bg-muted/30">
                              <td className="p-2">
                                <button
                                  type="button"
                                  className="font-medium hover:underline"
                                  onClick={() => setSelectedPetId(pet.id)}
                                >
                                  {pet.name}
                                </button>
                              </td>
                              <td className="p-2">{pet.species || '—'}</td>
                              <td className="p-2">{pet.breed || '—'}</td>
                              <td className="p-2">
                                {pet.birthDate ? new Date(pet.birthDate).toLocaleDateString('es-PE') : '—'}
                              </td>
                              <td className="p-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => {
                                    setEditingPet(pet);
                                    setShowNewPet(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(selectedClient.pets || []).length === 0 && (
                        <p className="text-muted-foreground text-center py-6">
                          Sin mascotas registradas. Añade una con el botón superior.
                        </p>
                      )}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="citas" className="mt-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Citas</h3>
                    <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                      <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>Las citas de este cliente se muestran en el módulo Citas.</p>
                      <Button
                        size="sm"
                        className="mt-3"
                        onClick={() => setShowNewAppointment(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Nueva cita
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="facturacion" className="mt-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Facturación</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground block">Total citas</span>
                        <span className="text-xl font-semibold">
                          {selectedClient.totalAppointments ?? 0}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground block">Total gastado</span>
                        <span className="text-xl font-semibold">
                          {selectedClient.totalSpent ?? 0} S/
                        </span>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="recordatorios" className="mt-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Recordatorios</h3>
                    <p className="text-muted-foreground text-sm">
                      Sin recordatorios configurados.
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="comunicacion" className="mt-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Comunicación</h3>
                    <p className="text-muted-foreground text-sm">
                      Historial de comunicaciones (emails, SMS).
                    </p>
                  </Card>
                </TabsContent>

                <TabsContent value="notas" className="mt-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Notas</h3>
                    <p className="text-muted-foreground text-sm">
                      Notas internas del cliente.
                    </p>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar derecha */}
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <StickyNote className="h-4 w-4" /> Nota crítica del cliente
                </h4>
                <p className="text-muted-foreground text-xs">Agregar nota</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <StickyNote className="h-4 w-4" /> Nota crítica del paciente
                </h4>
                <p className="text-muted-foreground text-xs">Agregar nota</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4" /> Recordatorios destacados
                </h4>
                <p className="text-muted-foreground text-xs">Sin recordatorios</p>
              </Card>
              <Card className="p-4">
                <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4" /> Gastos
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Último mes: 0,00</p>
                  <p>Últimos 3 meses: 0,00</p>
                  <p>Últimos 6 meses: 0,00</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Pet Dialog */}
      {showNewPet && selectedClient && (
        <PetDialog
          pet={editingPet}
          ownerLastName1={selectedClient.lastName1}
          ownerLastName2={selectedClient.lastName2}
          dogBreeds={PET_DOG_BREEDS}
          catBreeds={PET_CAT_BREEDS}
          temperaments={PET_TEMPERAMENTS}
          behaviors={PET_BEHAVIORS}
          onSave={handleSavePet}
          onClose={() => {
            setShowNewPet(false);
            setEditingPet(null);
          }}
        />
      )}

      {/* New Appointment Dialog */}
      <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Cita - {selectedClient?.fullName}</DialogTitle>
            <DialogDescription>
              Programa una nueva cita para este cliente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">
                Esta funcionalidad te redireccionará al módulo de Citas
              </p>
              <p className="text-sm text-muted-foreground">
                Cliente: <strong>{selectedClient?.fullName}</strong>
              </p>
              {selectedClient?.pets && selectedClient.pets.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Mascotas disponibles: {selectedClient.pets.map((p: any) => p.name).join(', ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewAppointment(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              setShowNewAppointment(false);
              // Aquí se integraría con el módulo de Citas
              alert('Esta funcionalidad se integrará con el módulo de Citas próximamente');
            }}>
              Ir a Citas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Diálogo de Cliente con 3 pasos
function ClientDialog({ client, vehicles, currentUserRole, onSave, onClose }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Verificar si el usuario puede editar campos protegidos
  const canEditProtectedFields = !client || currentUserRole === 'Super Administrador' || currentUserRole === 'Administrador';
  const [formData, setFormData] = useState({
    documentType: client?.documentType || 'DNI',
    documentNumber: client?.documentNumber || '',
    name: client?.name || '',
    lastName1: client?.lastName1 || '',
    lastName2: client?.lastName2 || '',
    companyResponsible: client?.companyResponsible || '', // Para RUC
    gender: client?.gender || 'Masculino',
    birthDate: client?.birthDate || '',
    phone1: client?.phone1 || '',
    phone2: client?.phone2 || '',
    email: client?.email || '',
    clientType: client?.clientType || 'Normal',
    level: client?.level || '',
    street: client?.street || '',
    streetNumber: client?.streetNumber || '',
    province: client?.province || 'Lima',
    district: client?.district || '',
    postalCode: client?.postalCode || '',
    coordinates: client?.coordinates || '',
    country: client?.country || 'Perú',
    zone: client?.zone || '',
    assignedVehicle: client?.assignedVehicle || '',
    status: client?.status || 'Activo',
    billingType: client?.billingType || 'Contado',
    paymentCondition: client?.paymentCondition || 'Único pago',
    activeAgreements: client?.activeAgreements || '',
    secondOwner: client?.secondOwner || null,
    registrationDate: client?.registrationDate || new Date().toISOString().split('T')[0],
    totalAppointments: client?.totalAppointments || 0,
    totalSpent: client?.totalSpent || 0,
    // 🆕 PASO 4: PROGRAMACIÓN Y RUTAS
    isFixedSchedule: client?.isFixedSchedule || false,
    appointmentFrequency: client?.appointmentFrequency || 'bajo_demanda',
    preferredDays: client?.preferredDays || [],
    preferredTimeSlot: client?.preferredTimeSlot || 'tarde',
    preferredTime: client?.preferredTime || '',
    autoAssignRoute: client?.autoAssignRoute || false,
    scheduleNotes: client?.scheduleNotes || ''
  });

  const [showSecondOwner, setShowSecondOwner] = useState(!!client?.secondOwner);
  const [secondOwnerData, setSecondOwnerData] = useState(client?.secondOwner || {
    documentType: 'DNI',
    documentNumber: '',
    name: '',
    lastName1: '',
    lastName2: '',
    gender: 'Masculino',
    phone1: '',
    email: ''
  });

  // Actualizar el formulario cuando cambia el cliente (para edición o nuevo)
  useEffect(() => {
    if (client) {
      // Modo edición: cargar datos del cliente
      setFormData({
        documentType: client.documentType || 'DNI',
        documentNumber: client.documentNumber || '',
        name: client.name || '',
        lastName1: client.lastName1 || '',
        lastName2: client.lastName2 || '',
        companyResponsible: client.companyResponsible || '',
        gender: client.gender || 'Masculino',
        birthDate: client.birthDate || '',
        phone1: client.phone1 || '',
        phone2: client.phone2 || '',
        email: client.email || '',
        clientType: client.clientType || 'Normal',
        level: client.level || '',
        street: client.street || '',
        streetNumber: client.streetNumber || '',
        province: client.province || 'Lima',
        district: client.district || '',
        postalCode: client.postalCode || '',
        coordinates: client.coordinates || '',
        country: client.country || 'Perú',
        zone: client.zone || '',
        assignedVehicle: client.assignedVehicle || '',
        status: client.status || 'Activo',
        billingType: client.billingType || 'Contado',
        paymentCondition: client.paymentCondition || 'Único pago',
        activeAgreements: client.activeAgreements || '',
        secondOwner: client.secondOwner || null,
        registrationDate: client.registrationDate || new Date().toISOString().split('T')[0],
        totalAppointments: client.totalAppointments || 0,
        totalSpent: client.totalSpent || 0,
        // 🆕 PASO 4: PROGRAMACIÓN Y RUTAS
        isFixedSchedule: client.isFixedSchedule || false,
        appointmentFrequency: client.appointmentFrequency || 'bajo_demanda',
        preferredDays: client.preferredDays || [],
        preferredTimeSlot: client.preferredTimeSlot || 'tarde',
        preferredTime: client.preferredTime || '',
        autoAssignRoute: client.autoAssignRoute || false,
        scheduleNotes: client.scheduleNotes || ''
      });

      if (client.secondOwner) {
        setShowSecondOwner(true);
        setSecondOwnerData(client.secondOwner);
      } else {
        setShowSecondOwner(false);
        setSecondOwnerData({
          documentType: 'DNI',
          documentNumber: '',
          name: '',
          lastName1: '',
          lastName2: '',
          gender: 'Masculino',
          phone1: '',
          email: ''
        });
      }
    } else {
      // Modo nuevo: resetear formulario
      setFormData({
        documentType: 'DNI',
        documentNumber: '',
        name: '',
        lastName1: '',
        lastName2: '',
        companyResponsible: '',
        gender: 'Masculino',
        birthDate: '',
        phone1: '',
        phone2: '',
        email: '',
        clientType: 'Normal',
        level: '',
        street: '',
        streetNumber: '',
        province: 'Lima',
        district: '',
        postalCode: '',
        coordinates: '',
        country: 'Perú',
        zone: '',
        assignedVehicle: '',
        status: 'Activo',
        billingType: 'Contado',
        paymentCondition: 'Único pago',
        activeAgreements: '',
        secondOwner: null,
        registrationDate: new Date().toISOString().split('T')[0],
        totalAppointments: 0,
        totalSpent: 0,
        // 🆕 PASO 4: PROGRAMACIÓN Y RUTAS
        isFixedSchedule: false,
        appointmentFrequency: 'bajo_demanda',
        preferredDays: [],
        preferredTimeSlot: 'tarde',
        preferredTime: '',
        autoAssignRoute: false,
        scheduleNotes: ''
      });
      setShowSecondOwner(false);
      setSecondOwnerData({
        documentType: 'DNI',
        documentNumber: '',
        name: '',
        lastName1: '',
        lastName2: '',
        gender: 'Masculino',
        phone1: '',
        email: ''
      });
      setCurrentStep(1); // Volver al paso 1 al crear nuevo cliente
    }
  }, [client]);

  const validateStep = () => {
    if (currentStep === 1) {
      return formData.documentNumber && formData.name && formData.lastName1 && formData.phone1 && formData.email;
    }
    if (currentStep === 2) {
      return formData.street && formData.streetNumber && formData.province && formData.district;
    }
    if (currentStep === 3) {
      return true; // Facturación es opcional
    }
    if (currentStep === 4) {
      // Validar Paso 4: Si es cliente fijo, debe tener frecuencia y días
      if (formData.isFixedSchedule) {
        return formData.appointmentFrequency !== 'bajo_demanda' && formData.preferredDays.length > 0;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    const fullName = `${formData.name} ${formData.lastName1} ${formData.lastName2}`.trim();
    const secondOwnerFullName = showSecondOwner 
      ? `${secondOwnerData.name} ${secondOwnerData.lastName1} ${secondOwnerData.lastName2}`.trim()
      : null;
    
    const clientData = {
      ...formData,
      fullName,
      secondOwner: showSecondOwner ? { ...secondOwnerData, fullName: secondOwnerFullName } : null
    };

    // 🆕 AUTO-ASIGNACIÓN DE RUTAS
    if (clientData.isFixedSchedule && clientData.autoAssignRoute) {
      // Detectar zona automáticamente si no está asignada
      if (!clientData.zone) {
        const detectedZone = determineClientZone(
          { district: clientData.district, coordinates: clientData.coordinates },
          zones
        );
        if (detectedZone) {
          clientData.zone = detectedZone.name;
          toast.info(`📍 Zona detectada: ${detectedZone.name}`, {
            description: `Basado en distrito: ${clientData.district}`
          });
        }
      }

      // Ejecutar auto-asignación
      const result = autoAssignClientToRoutes(
        clientData as any,
        zones,
        vehicles
      );

      if (result.success && result.data) {
        toast.success('✅ Cliente asignado automáticamente', {
          description: `${result.data.assignedVehicle.name} · ${result.data.assignedZone.name} · ${result.data.generatedAppointments.length} citas creadas`,
          duration: 5000
        });

        // Actualizar datos del cliente con asignaciones
        clientData.zone = result.data.assignedZone.name;
        clientData.assignedVehicle = parseInt(result.data.assignedVehicle.id.split('-')[1]);

        // Guardar información de citas generadas (esto se usará en la sincronización)
        (clientData as any).recurringAppointments = result.data.generatedAppointments;

        console.log('🔁 Citas recurrentes generadas:', result.data.generatedAppointments);
      } else {
        toast.warning('⚠️ Auto-asignación no disponible', {
          description: result.message
        });
      }
    }
    
    onSave(clientData);
  };

  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{client ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</DialogTitle>
        <DialogDescription>
          Paso {currentStep} de 4: {
            currentStep === 1 ? 'Datos Generales' : 
            currentStep === 2 ? 'Dirección' : 
            currentStep === 3 ? 'Facturación' :
            'Programación y Rutas'
          }
        </DialogDescription>
      </DialogHeader>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
              step === currentStep ? 'bg-primary text-white' :
              step < currentStep ? 'bg-green-500 text-white' :
              'bg-gray-200 text-gray-500 dark:bg-gray-700'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-1 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* PASO 1: Datos Generales */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tipo de Documento *</Label>
                <select
                  className={`w-full p-2 border rounded-md ${!canEditProtectedFields ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  disabled={!canEditProtectedFields}
                  required
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="RUC">RUC</option>
                  <option value="PASS">PASS</option>
                </select>
                {!canEditProtectedFields && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Solo Super Administrador y Administrador pueden editar este campo
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <Label>Número de Documento *</Label>
                <Input
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  disabled={!canEditProtectedFields}
                  className={!canEditProtectedFields ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
                  required
                />
                {!canEditProtectedFields && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Solo Super Administrador y Administrador pueden editar este campo
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>{formData.documentType === 'RUC' ? 'Razón Social *' : 'Nombre *'}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Apellido 1 {formData.documentType === 'RUC' ? '' : '*'}</Label>
                <Input
                  value={formData.lastName1}
                  onChange={(e) => setFormData({ ...formData, lastName1: e.target.value })}
                  required={formData.documentType !== 'RUC'}
                  disabled={formData.documentType === 'RUC'}
                />
              </div>
              <div>
                <Label>Apellido 2</Label>
                <Input
                  value={formData.lastName2}
                  onChange={(e) => setFormData({ ...formData, lastName2: e.target.value })}
                  disabled={formData.documentType === 'RUC'}
                />
              </div>
            </div>

            {formData.documentType === 'RUC' && (
              <div>
                <Label>Nombre del Responsable *</Label>
                <Input
                  value={formData.companyResponsible}
                  onChange={(e) => setFormData({ ...formData, companyResponsible: e.target.value })}
                  placeholder="Nombre completo del responsable"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Sexo *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div className="col-span-2">
                <Label>Fecha de Nacimiento</Label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Teléfono 1 *</Label>
                <Input
                  value={formData.phone1}
                  onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Teléfono 2</Label>
                <Input
                  value={formData.phone2}
                  onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Cliente</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.clientType}
                  onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                >
                  <option value="Normal">Normal</option>
                  <option value="Regular">Regular</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Malo">Malo</option>
                  <option value="Moroso">Moroso</option>
                  <option value="Problematico">Problemático</option>
                  <option value="No atender">No atender</option>
                </select>
              </div>
              <div>
                <Label>Nivel</Label>
                <Input
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  placeholder="Ej: Oro, Plata, Bronce"
                />
              </div>
            </div>

            {/* Segundo Amo */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Segundo Amo (Opcional)</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecondOwner(!showSecondOwner)}
                >
                  {showSecondOwner ? 'Ocultar' : 'Agregar'}
                </Button>
              </div>

              {showSecondOwner && (
                <div className="space-y-4 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Tipo de Documento</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={secondOwnerData.documentType}
                        onChange={(e) => setSecondOwnerData({ ...secondOwnerData, documentType: e.target.value })}
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">CE</option>
                        <option value="RUC">RUC</option>
                        <option value="PASS">PASS</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Label>Número de Documento</Label>
                      <Input
                        value={secondOwnerData.documentNumber}
                        onChange={(e) => setSecondOwnerData({ ...secondOwnerData, documentNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input
                        value={secondOwnerData.name}
                        onChange={(e) => setSecondOwnerData({ ...secondOwnerData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Apellido 1</Label>
                      <Input
                        value={secondOwnerData.lastName1}
                        onChange={(e) => setSecondOwnerData({ ...secondOwnerData, lastName1: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Apellido 2</Label>
                      <Input
                        value={secondOwnerData.lastName2}
                        onChange={(e) => setSecondOwnerData({ ...secondOwnerData, lastName2: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Sexo</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={secondOwnerData.gender}
                        onChange={(e) => setSecondOwnerData({ ...secondOwnerData, gender: e.target.value })}
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input
                        value={secondOwnerData.phone1}
                        onChange={(e) => setSecondOwnerData({ ...secondOwnerData, phone1: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={secondOwnerData.email}
                        onChange={(e) => setSecondOwnerData({ ...secondOwnerData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PASO 2: Dirección */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label>Calle *</Label>
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Número *</Label>
                <Input
                  value={formData.streetNumber}
                  onChange={(e) => setFormData({ ...formData, streetNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Provincia *</Label>
                <Input
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Distrito *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.district}
                  onChange={(e) => {
                    const selectedDistrict = e.target.value;
                    const postalCode = LIMA_DISTRICTS.find(d => d.name === selectedDistrict)?.code || '';
                    setFormData({ ...formData, district: selectedDistrict, postalCode: postalCode });
                  }}
                  required
                >
                  <option value="">Seleccionar distrito...</option>
                  {LIMA_DISTRICTS.map(d => (
                    <option key={`${d.name}-${d.code}`} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código Postal</Label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
              <div>
                <Label>País</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>

            {/* Geocodificación Automática */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Ubicación (Detección Automática)
              </h4>
              <AddressGeocoder
                direccion={`${formData.street} ${formData.streetNumber}`.trim()}
                distrito={formData.district}
                provincia={formData.province}
                onCoordinatesUpdate={(lat, lng) => {
                  setFormData({ ...formData, coordinates: `${lat},${lng}` });
                }}
                showMap={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Zona Establecida</Label>
                <Input
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="Ej: Zona Norte"
                  disabled={!canEditProtectedFields}
                  className={!canEditProtectedFields ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
                />
                {!canEditProtectedFields && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Solo Super Administrador y Administrador pueden editar este campo
                  </p>
                )}
              </div>
              <div>
                <Label>Vehículo Asignado</Label>
                <select
                  className={`w-full p-2 border rounded-md ${!canEditProtectedFields ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                  value={formData.assignedVehicle || ''}
                  onChange={(e) => setFormData({ ...formData, assignedVehicle: e.target.value ? Number(e.target.value) : '' })}
                  disabled={!canEditProtectedFields}
                >
                  <option value="">Sin asignar</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id.split('-')[1]}>{v.name}</option>
                  ))}
                </select>
                {!canEditProtectedFields && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Solo Super Administrador y Administrador pueden editar este campo
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Estado *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        )}

        {/* PASO 3: Facturación */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Facturación *</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.billingType}
                  onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                >
                  <option value="Contado">Contado</option>
                  <option value="Crédito">Crédito</option>
                </select>
              </div>
              <div>
                <Label>Condición de Pago</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.paymentCondition}
                  onChange={(e) => setFormData({ ...formData, paymentCondition: e.target.value })}
                >
                  <option value="Único pago">Único pago</option>
                  <option value="2 vencimientos">2 vencimientos</option>
                  <option value="3 vencimientos">3 vencimientos</option>
                  <option value="4 vencimientos">4 vencimientos</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Convenios Activos</Label>
              <Textarea
                value={formData.activeAgreements}
                onChange={(e) => setFormData({ ...formData, activeAgreements: e.target.value })}
                placeholder="Describe los convenios o planes activos del cliente..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* 🆕 PASO 4: PROGRAMACIÓN Y RUTAS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Cliente Fijo */}
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <input
                  type="checkbox"
                  id="isFixedSchedule"
                  checked={formData.isFixedSchedule}
                  onChange={(e) => setFormData({ ...formData, isFixedSchedule: e.target.checked })}
                  className="mt-1 w-4 h-4"
                />
                <div className="flex-1">
                  <Label htmlFor="isFixedSchedule" className="cursor-pointer font-semibold">
                    🔁 Este cliente tiene horario fijo
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Activar si el cliente tiene citas recurrentes con frecuencia definida
                  </p>
                </div>
              </div>

              {formData.isFixedSchedule && (
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <input
                    type="checkbox"
                    id="autoAssignRoute"
                    checked={formData.autoAssignRoute}
                    onChange={(e) => setFormData({ ...formData, autoAssignRoute: e.target.checked })}
                    className="mt-1 w-4 h-4"
                  />
                  <div className="flex-1">
                    <Label htmlFor="autoAssignRoute" className="cursor-pointer font-semibold">
                      ⚡ Asignar automáticamente a rutas
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      El sistema creará citas recurrentes y las asignará al vehículo de la zona
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Frecuencia */}
            <div>
              <Label>Frecuencia de Atención *</Label>
              <select
                className="w-full p-2 border rounded-md mt-1"
                value={formData.appointmentFrequency}
                onChange={(e) => setFormData({ ...formData, appointmentFrequency: e.target.value })}
                disabled={!formData.isFixedSchedule}
              >
                <option value="bajo_demanda">Bajo demanda (sin frecuencia fija)</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
              {!formData.isFixedSchedule && (
                <p className="text-xs text-muted-foreground mt-1">
                  Activa "Cliente con horario fijo" para configurar frecuencia
                </p>
              )}
            </div>

            {/* Días Preferidos */}
            {formData.isFixedSchedule && formData.appointmentFrequency !== 'bajo_demanda' && (
              <div>
                <Label>Días Preferidos * {formData.preferredDays.length > 0 && `(${formData.preferredDays.length} seleccionado${formData.preferredDays.length > 1 ? 's' : ''})`}</Label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => {
                    const fullDay = { Lun: 'lunes', Mar: 'martes', Mié: 'miércoles', Jue: 'jueves', Vie: 'viernes', Sáb: 'sábado', Dom: 'domingo' }[day];
                    const isSelected = formData.preferredDays.includes(fullDay || '');
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormData({ ...formData, preferredDays: formData.preferredDays.filter(d => d !== fullDay) });
                          } else {
                            setFormData({ ...formData, preferredDays: [...formData.preferredDays, fullDay || ''] });
                          }
                        }}
                        className={`p-3 rounded-md border-2 transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-input hover:border-primary/50'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                {formData.preferredDays.length === 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Debe seleccionar al menos un día
                  </p>
                )}
              </div>
            )}

            {/* Horario Preferido */}
            {formData.isFixedSchedule && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Horario Preferido</Label>
                  <select
                    className="w-full p-2 border rounded-md mt-1"
                    value={formData.preferredTimeSlot}
                    onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                  >
                    <option value="mañana">Mañana (8:00 - 12:00)</option>
                    <option value="tarde">Tarde (12:00 - 18:00)</option>
                    <option value="noche">Noche (18:00 - 22:00)</option>
                  </select>
                </div>
                <div>
                  <Label>Hora Específica (Opcional)</Label>
                  <Input
                    type="time"
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Notas de Programación */}
            <div>
              <Label>Notas de Programación</Label>
              <Textarea
                value={formData.scheduleNotes}
                onChange={(e) => setFormData({ ...formData, scheduleNotes: e.target.value })}
                placeholder="Ej: Prefiere peluquera María, evitar lunes en la mañana, etc."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Resumen */}
            {formData.isFixedSchedule && formData.appointmentFrequency !== 'bajo_demanda' && formData.preferredDays.length > 0 && (
              <div className="p-4 bg-muted rounded-lg border">
                <h4 className="font-semibold mb-2">📋 Resumen de Programación</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Frecuencia: <strong className="capitalize">{formData.appointmentFrequency}</strong></li>
                  <li>• Días: <strong className="capitalize">{formData.preferredDays.join(', ')}</strong></li>
                  <li>• Horario: <strong className="capitalize">{formData.preferredTimeSlot}</strong> {formData.preferredTime && `a las ${formData.preferredTime}`}</li>
                  <li>• Auto-asignar: <strong>{formData.autoAssignRoute ? 'Sí' : 'No'}</strong></li>
                  {formData.zone && <li>• Zona: <strong>{formData.zone}</strong></li>}
                  {formData.assignedVehicle && <li>• Vehículo: <strong>Vehículo #{formData.assignedVehicle}</strong></li>}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between gap-2 mt-6 pt-4 border-t">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {currentStep < 4 ? (
              <Button type="button" onClick={handleNext} disabled={!validateStep()}>
                Siguiente
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit">
                {client ? 'Guardar Cambios' : 'Registrar Cliente'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </DialogContent>
  );
}

// Diálogo de Mascota con edad y etapa
function PetDialog({ pet, ownerLastName1, ownerLastName2, dogBreeds, catBreeds, temperaments, behaviors, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    name: pet?.name || '',
    ownerLastName1: pet?.ownerLastName1 || ownerLastName1,
    ownerLastName2: pet?.ownerLastName2 || ownerLastName2,
    registrationCode: pet?.registrationCode || '',
    registrationDate: pet?.registrationDate || new Date().toISOString(),
    birthDate: pet?.birthDate || '',
    age: pet?.age || 0,
    stage: pet?.stage || 'Cachorro',
    species: pet?.species || 'Perro',
    breed: pet?.breed || '',
    size: pet?.size || 'Mediano',
    sex: pet?.sex || 'Macho',
    status: pet?.status || 'Intacto',
    coatLength: pet?.coatLength || 'Corto',
    weight: pet?.weight || 0,
    temperament: pet?.temperament || 'Tranquilo',
    activity: pet?.activity || 'Moderada',
    behavior: pet?.behavior || 'Amigable',
    chip: pet?.chip || '',
    deceased: pet?.deceased || false,
    dischargeDate: pet?.dischargeDate || '',
    activePlan: pet?.activePlan || '',
    notes: pet?.notes || '',
    lastVisit: pet?.lastVisit || '',
    // Campos médicos obligatorios
    lastDewormingDate: pet?.lastDewormingDate || '',
    lastFleaTreatmentDate: pet?.lastFleaTreatmentDate || '',
    lastVaccinationDate: pet?.lastVaccinationDate || ''
  });

  // Calcular edad y etapa desde fecha de nacimiento
  const calculateAgeAndStage = (birthDate: string) => {
    if (!birthDate) return { age: 0, stage: 'Cachorro' };
    
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInYears = (today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const age = Math.floor(ageInYears);
    
    let stage = 'Cachorro';
    if (ageInYears < 0.5) stage = 'Cachorro';
    else if (ageInYears <= 7) stage = 'Adulto';
    else if (ageInYears <= 9) stage = 'Senior';
    else stage = 'Geriátrico';
    
    return { age, stage };
  };

  const handleBirthDateChange = (birthDate: string) => {
    const { age, stage } = calculateAgeAndStage(birthDate);
    setFormData({ ...formData, birthDate, age, stage });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${formData.name} ${formData.ownerLastName1} ${formData.ownerLastName2}`.trim();
    onSave({ ...formData, fullName });
  };

  // Las razas ahora se manejan desde el backend o se pueden escribir libremente
  // Usar valores por defecto si no hay configuraciones disponibles
  const defaultDogBreeds = ['Labrador', 'Golden Retriever', 'Bulldog', 'Pastor Alemán', 'Beagle', 'Poodle', 'Chihuahua', 'Rottweiler', 'Yorkshire Terrier', 'Boxer'];
  const defaultCatBreeds = ['Persa', 'Siamés', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Bengalí', 'Abisinio', 'Sphynx', 'Scottish Fold', 'American Shorthair'];
  const availableBreeds = formData.species === 'Perro' ? (dogBreeds || defaultDogBreeds) : (catBreeds || defaultCatBreeds);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pet ? 'Editar Mascota' : 'Nueva Mascota'}</DialogTitle>
          <DialogDescription>
            {pet ? 'Actualiza la información de la mascota' : 'Completa el formulario para registrar una nueva mascota'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Apellido 1 (Tutor) *</Label>
              <Input
                value={formData.ownerLastName1}
                onChange={(e) => setFormData({ ...formData, ownerLastName1: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Apellido 2 (Tutor)</Label>
              <Input
                value={formData.ownerLastName2}
                onChange={(e) => setFormData({ ...formData, ownerLastName2: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Código de Registro</Label>
              <Input
                value={formData.registrationCode}
                onChange={(e) => setFormData({ ...formData, registrationCode: e.target.value })}
                placeholder="Ej: MGP-2024-001"
              />
            </div>
            <div>
              <Label>Fecha de Nacimiento *</Label>
              <Input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleBirthDateChange(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Edad y Etapa calculados automáticamente */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div>
              <Label>Edad (calculada)</Label>
              <Input value={`${formData.age} años`} disabled className="bg-white dark:bg-gray-800" />
            </div>
            <div>
              <Label>Etapa (calculada)</Label>
              <Input value={formData.stage} disabled className="bg-white dark:bg-gray-800" />
              <p className="text-xs text-muted-foreground mt-1">
                Cachorro: 0-6 meses | Adulto: hasta 7 años | Senior: hasta 9 años | Geriátrico: +9 años
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label>Especie *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value, breed: '' })}
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
              </select>
            </div>
            <div>
              <Label>Raza *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                required
              >
                <option value="">Seleccionar...</option>
                {availableBreeds.map((breed: string) => (
                  <option key={breed} value={breed}>{breed}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Tamaño</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              >
                <option value="Pequeño">Pequeño</option>
                <option value="Mediano">Mediano</option>
                <option value="Grande">Grande</option>
              </select>
            </div>
            <div>
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                step="0.1"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Sexo *</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
              >
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
            <div>
              <Label>Estado</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Intacto">Intacto</option>
                <option value="Castrado">Castrado (Macho)</option>
                <option value="Esterilizada">Esterilizada (Hembra)</option>
              </select>
            </div>
            <div>
              <Label>Largo del Pelo</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.coatLength}
                onChange={(e) => setFormData({ ...formData, coatLength: e.target.value })}
              >
                <option value="Corto">Corto</option>
                <option value="Largo">Largo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Carácter</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.temperament}
                onChange={(e) => setFormData({ ...formData, temperament: e.target.value })}
              >
                {temperaments.map((temp: string) => (
                  <option key={temp} value={temp}>{temp}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Actividad</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              >
                <option value="Baja">Baja</option>
                <option value="Moderada">Moderada</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div>
              <Label>Comportamiento</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.behavior}
                onChange={(e) => setFormData({ ...formData, behavior: e.target.value })}
              >
                {(behaviors && behaviors.length > 0 ? behaviors : ['Amigable', 'Tímido', 'Juguetón', 'Protector', 'Independiente']).map((beh: string) => (
                  <option key={beh} value={beh}>{beh}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Chip</Label>
              <Input
                value={formData.chip}
                onChange={(e) => setFormData({ ...formData, chip: e.target.value })}
                placeholder="Ej: ES-123456789"
              />
            </div>
            <div>
              <Label>Plan Activo</Label>
              <Input
                value={formData.activePlan}
                onChange={(e) => setFormData({ ...formData, activePlan: e.target.value })}
                placeholder="Ej: Plan Baño Mensual"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="deceased"
                checked={formData.deceased}
                onChange={(e) => setFormData({ ...formData, deceased: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="deceased">Fallecido</Label>
            </div>
            {formData.deceased && (
              <div>
                <Label>Fecha de Baja</Label>
                <Input
                  type="date"
                  value={formData.dischargeDate || ''}
                  onChange={(e) => setFormData({ ...formData, dischargeDate: e.target.value })}
                />
              </div>
            )}
          </div>

          <div>
            <Label>Notas Especiales</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Alergias, comportamiento, cuidados especiales..."
              rows={3}
            />
          </div>

          {/* SECCIÓN MÉDICA OBLIGATORIA */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-pink-600" />
              <h3 className="font-semibold text-lg">Historial Médico Básico</h3>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Obligatorio</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Esta información es crítica para el sistema de notificaciones y seguimiento de salud preventiva.
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-orange-600" />
                  Última Desparasitación *
                </Label>
                <Input
                  type="date"
                  value={formData.lastDewormingDate}
                  onChange={(e) => setFormData({ ...formData, lastDewormingDate: e.target.value })}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Periodicidad: Cachorros cada 15-30 días, Adultos cada 3 meses
                </p>
              </div>
              
              <div>
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Último Antipulgas *
                </Label>
                <Input
                  type="date"
                  value={formData.lastFleaTreatmentDate}
                  onChange={(e) => setFormData({ ...formData, lastFleaTreatmentDate: e.target.value })}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Periodicidad: Mensual (cada 30 días)
                </p>
              </div>
              
              <div>
                <Label className="flex items-center gap-2">
                  <Syringe className="h-4 w-4 text-green-600" />
                  Última Vacunación *
                </Label>
                <Input
                  type="date"
                  value={formData.lastVaccinationDate}
                  onChange={(e) => setFormData({ ...formData, lastVaccinationDate: e.target.value })}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Periodicidad: Cachorros múltiples dosis, Adultos anual
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg mt-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="font-semibold">Sistema de Alertas Automáticas:</span>
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                El sistema calculará automáticamente las próximas fechas de tratamiento y enviará notificaciones 7 días antes del vencimiento.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {pet ? 'Guardar Cambios' : 'Registrar Mascota'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Diálogo de configuración genérico
function ConfigDialog({ title, items, onSave, onClose }: any) {
  const [localItems, setLocalItems] = useState([...items]);
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAdd = () => {
    if (newItem.trim() && !localItems.includes(newItem.trim())) {
      setLocalItems([...localItems, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(localItems[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const updated = [...localItems];
      updated[editingIndex] = editingValue.trim();
      setLocalItems(updated);
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleDelete = (index: number) => {
    setLocalItems(localItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(localItems);
    onClose();
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Agrega, edita o elimina opciones</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Nueva opción..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
          <Button type="button" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {localItems.map((item, index) => (
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
                  <span className="flex-1">{item}</span>
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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar Configuración
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// Diálogo de configuración de razas (mantenido para compatibilidad)
// NOTA: La configuración principal de razas está en PetsManagement.tsx
function BreedConfigDialog({ dogBreeds, catBreeds, onSaveDog, onSaveCat, onClose }: any) {
  const [activeTab, setActiveTab] = useState('dog');
  const [localDogBreeds, setLocalDogBreeds] = useState([...dogBreeds]);
  const [localCatBreeds, setLocalCatBreeds] = useState([...catBreeds]);
  const [newBreed, setNewBreed] = useState('');

  const currentBreeds = activeTab === 'dog' ? localDogBreeds : localCatBreeds;
  const setCurrentBreeds = activeTab === 'dog' ? setLocalDogBreeds : setLocalCatBreeds;

  const handleAdd = () => {
    if (newBreed.trim() && !currentBreeds.includes(newBreed.trim())) {
      setCurrentBreeds([...currentBreeds, newBreed.trim()]);
      setNewBreed('');
    }
  };

  const handleDelete = (index: number) => {
    setCurrentBreeds(currentBreeds.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSaveDog(localDogBreeds);
    onSaveCat(localCatBreeds);
    onClose();
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Configurar Razas</DialogTitle>
        <DialogDescription>Gestiona las razas de perros y gatos</DialogDescription>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dog">
            <Dog className="h-4 w-4 mr-2" />
            Perros
          </TabsTrigger>
          <TabsTrigger value="cat">
            <Cat className="h-4 w-4 mr-2" />
            Gatos
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              value={newBreed}
              onChange={(e) => setNewBreed(e.target.value)}
              placeholder={`Nueva raza de ${activeTab === 'dog' ? 'perro' : 'gato'}...`}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
            />
            <Button type="button" onClick={handleAdd}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {currentBreeds.map((breed, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{breed}</span>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(index)} className="h-6 w-6 p-0 text-red-600">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Guardar Configuración
        </Button>
      </div>
    </DialogContent>
  );
}
