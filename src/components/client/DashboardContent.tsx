import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { EditProfileModal } from './EditProfileModal';
import { 
  PawPrint, 
  Calendar, 
  Plus,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  User as UserIcon,
  Gift,
  Tag,
  Users,
  Copy,
  Sparkles,
  Home,
  Image,
  FileText
} from 'lucide-react';
import { Pet, Appointment, User as UserType } from '../../types';
import { ClientInvoices } from './ClientInvoices';
import { PetDetailView } from './PetDetailView';

interface DashboardContentProps {
  user: UserType;
  pets: Pet[];
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  setShowAddPetModal: (show: boolean) => void;
  setShowBookingModal: (show: boolean) => void;
  deletePet: (id: string) => void;
  getStatusColor: (status: Appointment['status']) => string;
}

type DashboardTab = 'resumen' | 'mascotas' | 'citas' | 'facturacion' | 'cupones';

export function DashboardContent({
  user,
  pets,
  appointments,
  upcomingAppointments,
  setShowAddPetModal,
  setShowBookingModal,
  deletePet,
  getStatusColor
}: DashboardContentProps) {
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('resumen');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Información del Cliente - Diseño Moderno */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-primary/20">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Foto de Perfil */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl ring-4 ring-background">
                  {user.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt={`${user.firstName} ${user.lastName}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Información */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary/10 rounded text-primary font-medium">
                      {user.documentType}: {user.documentNumber}
                    </span>
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowEditProfile(true)}
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-background/80 backdrop-blur rounded-lg border border-border/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-sm">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background/80 backdrop-blur rounded-lg border border-border/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="font-medium text-sm">{user.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-background/80 backdrop-blur rounded-lg border border-border/50 md:col-span-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dirección</p>
                    <p className="font-medium text-sm">{user.address}, {user.district}</p>
                    {user.postalCode && (
                      <p className="text-xs text-muted-foreground">CP: {user.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edición */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        user={user}
      />

      {/* Tabs Navigation - Estilo Oscuro Moderno */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl shadow-2xl p-1.5 border border-slate-700">
        <nav className="flex gap-2 overflow-x-auto">
          {[
            { id: 'resumen' as DashboardTab, label: 'Resumen', icon: Home },
            { id: 'mascotas' as DashboardTab, label: 'Mis Mascotas', icon: PawPrint },
            { id: 'citas' as DashboardTab, label: 'Citas', icon: Calendar },
            { id: 'facturacion' as DashboardTab, label: 'Mis Comprobantes', icon: FileText },
            { id: 'cupones' as DashboardTab, label: 'Ofertas', icon: Gift }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = dashboardTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDashboardTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3.5 rounded-lg transition-all duration-200 whitespace-nowrap
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/50' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Resumen Tab */}
        {dashboardTab === 'resumen' && (
          <div className="space-y-6">
            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm mb-1">Total Mascotas</p>
                      <p className="text-3xl font-bold">{pets.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <PawPrint className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm mb-1">Próximas Citas</p>
                      <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm mb-1">Total Citas</p>
                      <p className="text-3xl font-bold">{appointments.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm mb-1">Ofertas Activas</p>
                      <p className="text-3xl font-bold">2</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Gift className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contenido Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mascotas Registradas */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <PawPrint className="w-5 h-5 text-purple-600" />
                      </div>
                      Mis Mascotas
                    </span>
                    <Button size="sm" onClick={() => setShowAddPetModal(true)} className="bg-purple-600 hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pets.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PawPrint className="w-10 h-10 text-purple-300" />
                      </div>
                      <h4 className="font-semibold mb-2">No tienes mascotas registradas</h4>
                      <p className="text-sm text-muted-foreground mb-4">Comienza registrando a tu primera mascota</p>
                      <Button size="sm" onClick={() => setShowAddPetModal(true)} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Primera Mascota
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pets.map((pet) => (
                        <div key={pet.id} className="group flex items-center gap-4 p-4 border border-border rounded-xl hover:shadow-md hover:border-purple-300 transition-all">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            {pet.photo ? (
                              <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <PawPrint className="w-7 h-7 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-base">{pet.name}</h4>
                            <p className="text-sm text-muted-foreground">{pet.breed} • {pet.species}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {pet.age} años
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {pet.weight} kg
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Próximas Citas */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      Próximas Citas
                    </span>
                    <Button size="sm" onClick={() => setShowBookingModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-1" />
                      Agendar
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-10 h-10 text-blue-300" />
                      </div>
                      <h4 className="font-semibold mb-2">No tienes citas próximas</h4>
                      <p className="text-sm text-muted-foreground mb-4">Agenda tu primera cita ahora</p>
                      <Button size="sm" onClick={() => setShowBookingModal(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar Primera Cita
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingAppointments.slice(0, 5).map((apt) => (
                        <div key={apt.id} className="group flex items-start gap-4 p-4 border border-border rounded-xl hover:shadow-md hover:border-blue-300 transition-all">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-bold text-base truncate">{apt.serviceName}</h4>
                              <Badge className={getStatusColor(apt.status)} variant="outline">
                                {apt.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{apt.petName}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(apt.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                              </span>
                              <span>{apt.time}</span>
                              <span className="font-semibold text-primary">S/. {apt.price}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Banner Promocional */}
            <Card className="border-0 shadow-xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-10 h-10" />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-2">¡Obtén 20% de descuento en tu primera cita!</h3>
                      <p className="text-white/90 mb-4">
                        Usa el código <span className="font-mono bg-white/20 px-2 py-1 rounded">BIENVENIDA20</span> al agendar
                      </p>
                      <Button 
                        onClick={() => setShowBookingModal(true)} 
                        className="bg-white text-primary hover:bg-white/90"
                      >
                        Agendar Ahora
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mascotas Tab */}
        {dashboardTab === 'mascotas' && (
          selectedPetId ? (
             <PetDetailView 
                pet={pets.find(p => p.id === selectedPetId)!}
                owner={user}
                appointments={appointments}
                onBack={() => setSelectedPetId(null)}
                onEdit={(pet) => {
                  // Por ahora simulamos edición abriendo el modal de agregar
                  // En una implementación completa, pasaríamos la mascota a editar
                  setShowAddPetModal(true); 
                }}
             />
          ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {pets.length} {pets.length === 1 ? 'mascota registrada' : 'mascotas registradas'}
              </p>
              <Button onClick={() => setShowAddPetModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Mascota
              </Button>
            </div>

            {pets.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <PawPrint className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No tienes mascotas registradas</h3>
                  <p className="text-muted-foreground mb-6">
                    Agrega tu primera mascota para empezar a agendar servicios
                  </p>
                  <Button onClick={() => setShowAddPetModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar Primera Mascota
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <Card 
                    key={pet.id} 
                    className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all group"
                    onClick={() => setSelectedPetId(pet.id)}
                  >
                    <div className="h-40 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center relative">
                      {pet.photo ? (
                        <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <PawPrint className="w-16 h-16 text-primary/40" />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="bg-white/90 text-purple-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                          Ver Expediente
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{pet.name}</h3>
                          <p className="text-sm text-muted-foreground">{pet.breed}</p>
                        </div>
                        <Badge variant="outline">{pet.species}</Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Edad:</span>
                          <span className="font-medium">{pet.age} años</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Peso:</span>
                          <span className="font-medium">{pet.weight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sexo:</span>
                          <span className="font-medium">{pet.gender}</span>
                        </div>
                        {pet.vaccines.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vacunas:</span>
                            <span className="font-medium">{pet.vaccines.length}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Logic edit
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`¿Estás seguro de eliminar a ${pet.name}?`)) {
                              deletePet(pet.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          )
        )}

        {/* Citas Tab */}
        {dashboardTab === 'citas' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {appointments.length} {appointments.length === 1 ? 'cita registrada' : 'citas registradas'}
              </p>
              <Button onClick={() => setShowBookingModal(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Cita
              </Button>
            </div>

            {appointments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No tienes citas agendadas</h3>
                  <p className="text-muted-foreground mb-6">
                    Agenda tu primer servicio para comenzar
                  </p>
                  <Button onClick={() => setShowBookingModal(true)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Primera Cita
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <Card key={apt.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{apt.serviceName}</h3>
                              <Badge className={getStatusColor(apt.status)} variant="outline">
                                {apt.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {apt.petName} • {apt.serviceCategory}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {new Date(apt.date).toLocaleDateString('es-ES')} a las {apt.time}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {apt.district}
                              </div>
                              {apt.veterinarian && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <UserIcon className="w-4 h-4" />
                                  {apt.veterinarian}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-2xl font-bold">S/. {apt.price}</div>
                          <Badge variant={apt.paymentStatus === 'Pagado' ? 'default' : 'outline'}>
                            {apt.paymentStatus}
                          </Badge>
                          {apt.status === 'Confirmada' && (
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Cancelar Cita
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Facturación Tab */}
        {dashboardTab === 'facturacion' && (
          <ClientInvoices />
        )}

        {/* Cupones Tab */}
        {dashboardTab === 'cupones' && (
          <div className="space-y-6">
            {/* Cupones Disponibles */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Cupones Disponibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">20% OFF Primera Cita</h4>
                        <p className="text-sm text-muted-foreground">Válido para nuevos clientes en MovilVet</p>
                      </div>
                      <Gift className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="bg-background px-3 py-1.5 rounded border border-border font-mono text-sm">
                        BIENVENIDA20
                      </div>
                      <Button size="sm" variant="ghost">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Válido hasta: 31/12/2025</p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">S/. 30 OFF en Peluquería</h4>
                        <p className="text-sm text-muted-foreground">Descuento directo en servicios de grooming</p>
                      </div>
                      <Sparkles className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="bg-background px-3 py-1.5 rounded border border-border font-mono text-sm">
                        GROOMING30
                      </div>
                      <Button size="sm" variant="ghost">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Válido hasta: 15/01/2026</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Programa de Referidos */}
            <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Programa de Referidos</h3>
                    <p className="text-muted-foreground mb-4">
                      Refiere a tus amigos y ambos recibirán <span className="font-semibold text-foreground">S/. 50 de descuento</span> en su próxima cita.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-background px-4 py-2 rounded-lg border border-border font-mono">
                        REF-{user.documentNumber.slice(-6)}
                      </div>
                      <Button>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar Código
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">0</p>
                      <p className="text-xs text-muted-foreground">Referidos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">S/. 0</p>
                      <p className="text-xs text-muted-foreground">Ganados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">S/. 0</p>
                      <p className="text-xs text-muted-foreground">Disponibles</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}