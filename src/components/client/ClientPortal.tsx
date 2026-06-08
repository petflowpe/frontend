import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { PetRegistrationForm } from './PetRegistrationForm';
import { BookingFlow } from '../booking/BookingFlow';
import { DashboardContent } from './DashboardContent';
import { useClientSync } from '../../hooks/useClientSync'; // 🆕 Hook de sincronización
import { 
  Heart, 
  Calendar, 
  Bell, 
  LogOut,
  Menu,
  X,
  User,
  Settings
} from 'lucide-react';
import { Appointment } from '../../types';

interface ClientPortalProps {
  onNavigatePublic: (page: string) => void;
  onBookService?: (serviceType: string) => void;
}

export function ClientPortal({ onNavigatePublic, onBookService }: ClientPortalProps) {
  const { user, pets, appointments, notifications, logout, deletePet } = useAuth();
  
  // 🔄 Activar sincronización automática al cargar
  useClientSync();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingServiceType, setBookingServiceType] = useState<'movilvet' | 'peluqueria' | undefined>();

  if (!user) {
    return null;
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'Confirmada' && new Date(apt.date) >= new Date()
  );

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Confirmada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completada': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelada': return 'bg-red-100 text-red-800 border-red-200';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleLogout = () => {
    logout();
    onNavigatePublic('home');
  };

  const portalBlocked =
    user.portalApprovalStatus === 'pending' ||
    user.portalApprovalStatus === 'rejected' ||
    user.portalBookingEnabled === false;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {portalBlocked && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-center text-sm text-amber-900">
          {user.portalApprovalStatus === 'pending' ? (
            <>Tu cuenta está <strong>pendiente de validación</strong>. Podrás reservar cuando el equipo active tu perfil.</>
          ) : user.portalApprovalStatus === 'rejected' ? (
            <>Reservas por portal no disponibles. Contacta a la clínica para más información.</>
          ) : (
            <>El auto-agendado no está activo en tu perfil. Solicita activación al equipo de la clínica.</>
          )}
        </div>
      )}
      {/* Modern Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-20">
            {/* Logo Area */}
            <div className="flex items-center gap-8">
              <button 
                onClick={() => onNavigatePublic('home')} 
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                  <Heart className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xl tracking-tight text-slate-900 leading-none">SmartPet</span>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Portal Cliente</span>
                </div>
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 mr-4 border-r border-slate-200 pr-6">
                <span className="text-sm text-slate-600">Hola,</span>
                <span className="font-semibold text-slate-900">{user.firstName}</span>
              </div>

              <Button 
                onClick={() => setShowBookingModal(true)}
                className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-full px-6"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Nueva Cita
              </Button>

              <button className="relative p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-600 hover:text-primary">
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full px-4"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden py-4 border-t border-slate-100"
            >
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-lg">
                  {(user.firstName?.[0] || user.email?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              <nav className="grid gap-2">
                <Button 
                  onClick={() => { setShowBookingModal(true); setMobileMenuOpen(false); }}
                  className="w-full justify-start h-12 text-base"
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Agendar Cita
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start h-12 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Cerrar Sesión
                </Button>
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <DashboardContent
          user={user}
          pets={pets}
          appointments={appointments}
          upcomingAppointments={upcomingAppointments}
          setShowAddPetModal={setShowAddPetModal}
          setShowBookingModal={setShowBookingModal}
          deletePet={deletePet}
          getStatusColor={getStatusColor}
        />
      </main>

      {/* Pet Registration Modal */}
      <PetRegistrationForm
        isOpen={showAddPetModal}
        onClose={() => setShowAddPetModal(false)}
        onSuccess={() => setShowAddPetModal(false)}
      />

      {/* Booking Modal */}
      <BookingFlow
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setBookingServiceType(undefined);
        }}
        serviceType={bookingServiceType}
        onSuccess={() => {
          setShowBookingModal(false);
          setBookingServiceType(undefined);
        }}
      />
    </div>
  );
}