import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { GlobalSearch } from './components/GlobalSearch';
import { Login, useSession } from './components/auth/Login';
import { apiClient } from './utils/api/client';
import { ApiAuthError } from './utils/api/config';
import { initSmartPetErrorMonitoring } from './services/sentry';
import ErrorBoundary from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PageSkeleton } from './components/PageSkeleton';
import { isModuleAllowed } from './utils/permissions';
import { getStoredTheme, applyTheme, setTheme, subscribeToSystemPreference } from './utils/theme';
import { ShortcutsModal } from './components/ShortcutsModal';

// 🚀 LAZY LOADING: Optimización de carga inicial
// Los componentes pesados se cargan solo cuando son necesarios

const Dashboard = lazy(() => import('./components/DashboardImproved').then(m => ({ default: m.Dashboard })));
const Appointments = lazy(() => import('./components/Appointments').then(m => ({ default: m.Appointments })));
const Calendar = lazy(() => import('./components/Calendar').then(m => ({ default: m.Calendar })));
const Clients = lazy(() => import('./components/Clients').then(m => ({ default: m.Clients })));
const Services = lazy(() => import('./components/Services').then(m => ({ default: m.Services })));
const Products = lazy(() => import('./components/Products').then(m => ({ default: m.Products })));
const Inventory = lazy(() => import('./components/Inventory').then(m => ({ default: m.Inventory })));
const Purchases = lazy(() => import('./components/Purchases').then(m => ({ default: m.Purchases })));
const MedicalCare = lazy(() => import('./components/MedicalCare').then(m => ({ default: m.MedicalCare })));
const VehicleManagement = lazy(() => import('./components/VehicleManagement').then(m => ({ default: m.VehicleManagement })));
const PetsManagement = lazy(() => import('./components/PetsManagement').then(m => ({ default: m.PetsManagement })));
const Routes = lazy(() => import('./components/Routes').then(m => ({ default: m.Routes })));
const Invoicing = lazy(() => import('./components/Invoicing').then(m => ({ default: m.Invoicing })));
const Payments = lazy(() => import('./components/Payments').then(m => ({ default: m.Payments })));
const Staff = lazy(() => import('./components/Staff').then(m => ({ default: m.Staff })));
const Reports = lazy(() => import('./components/Reports').then(m => ({ default: m.Reports })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const CashRegister = lazy(() => import('./components/CashRegister').then(m => ({ default: m.CashRegister })));
const ProductKardex = lazy(() => import('./components/ProductKardex').then(m => ({ default: m.ProductKardex })));
const AccountingConfig = lazy(() => import('./components/AccountingConfig').then(m => ({ default: m.AccountingConfig })));
const FinancialManagement = lazy(() => import('./components/FinancialManagement').then(m => ({ default: m.FinancialManagement })));
const ExportsReports = lazy(() => import('./components/ExportsReports').then(m => ({ default: m.ExportsReports })));
const NotificationsImproved = lazy(() => import('./components/NotificationsImproved').then(m => ({ default: m.NotificationsImproved })));
const UserManagement = lazy(() => import('./components/UserManagement').then(m => ({ default: m.UserManagement })));
const CompanyManagement = lazy(() => import('./components/CompanyManagement').then(m => ({ default: m.CompanyManagement })));
const UserProfilePage = lazy(() => import('./components/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const UserSettingsPage = lazy(() => import('./components/UserSettingsPage').then(m => ({ default: m.UserSettingsPage })));
const LoyaltyProgram = lazy(() => import('./components/LoyaltyProgram').then(m => ({ default: m.LoyaltyProgram })));
const ReviewsSystem = lazy(() => import('./components/ReviewsSystem').then(m => ({ default: m.ReviewsSystem })));
const AppointmentConfirmation = lazy(() => import('./components/AppointmentConfirmation').then(m => ({ default: m.AppointmentConfirmation })));
const PredictiveAnalytics = lazy(() => import('./components/PredictiveAnalytics').then(m => ({ default: m.PredictiveAnalytics })));

// 🇵🇪 SUNAT
const SUNATConfig = lazy(() => import('./components/SUNATConfig').then(m => ({ default: m.SUNATConfig })));
const SunatFacturacionCompleta = lazy(() => import('./components/sunat/SunatFacturacionCompleta').then(m => ({ default: m.SunatFacturacionCompleta })));
const ElectronicBooks = lazy(() => import('./components/ElectronicBooks').then(m => ({ default: m.ElectronicBooks })));
const SUNATReports = lazy(() => import('./components/SUNATReports').then(m => ({ default: m.SUNATReports })));

// 🆕 NUEVOS COMPONENTES
const LiveChat = lazy(() => import('./components/booking/LiveChat').then(m => ({ default: m.LiveChat })));
const BookingTracking = lazy(() => import('./components/booking/BookingTracking').then(m => ({ default: m.BookingTracking })));
const DataExport = lazy(() => import('./components/DataExport').then(m => ({ default: m.DataExport })));
const PasswordRecovery = lazy(() => import('./components/auth/PasswordRecovery').then(m => ({ default: m.PasswordRecovery })));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Prueba = lazy(() => import('./components/Prueba').then(m => ({ default: m.Prueba })));

// Default Exports
const VetClinicPublic = lazy(() => import('./pages/VetClinicPublic'));
const AnalisisGeografico = lazy(() => import('./components/analytics/AnalisisGeografico'));
const SegmentacionAutomatica = lazy(() => import('./components/segmentacion/SegmentacionAutomatica'));
const AnalisisPatrones = lazy(() => import('./components/analytics/AnalisisPatrones'));

// 🆕 OPERATIONS CENTER (BETA)
const OperationsCenter = lazy(() => import('./components/admin/OperationsCenter').then(m => ({ default: m.OperationsCenter })));

// Driver Session (Critical for drivers but huge)
const DriverSession = lazy(() => import('./components/driver/DriverSession').then(m => ({ default: m.DriverSession })));


function AppContent() {
  // Inicializar estado desde la URL si existe
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  });
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [publicMode, setPublicMode] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Estado de carga inicial
  const { getSession, clearSession } = useSession();

  // Restablecer contraseña: token y email desde URL (enlace enviado por correo)
  const [resetPasswordParams, setResetPasswordParams] = useState<{ token: string; email: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    if (token && email) return { token, email };
    return null;
  });
  
  // Ref para el elemento main (donde está el scroll real)
  const mainContentRef = useRef<HTMLElement>(null);
  const scrollPositionsRef = useRef<Map<string, number>>(new Map());
  
  // Prevenir scroll automático del navegador
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);
  
  // Preservar scroll cuando cambia el tab
  useEffect(() => {
    if (!mainContentRef.current) return;
    
    const mainElement = mainContentRef.current;
    const previousTab = scrollPositionsRef.current.get('previousTab');
    
    // Guardar la posición del scroll del tab anterior
    if (previousTab && previousTab !== activeTab) {
      scrollPositionsRef.current.set(previousTab, mainElement.scrollTop);
    }
    
    // Restaurar la posición del scroll del nuevo tab (si existe)
    const savedPosition = scrollPositionsRef.current.get(activeTab);
    if (savedPosition !== undefined) {
      // Usar requestAnimationFrame para restaurar después de que React renderice
      requestAnimationFrame(() => {
        if (mainContentRef.current) {
          mainContentRef.current.scrollTop = savedPosition;
        }
      });
    } else {
      // Si no hay posición guardada, dejar que el navegador maneje el scroll naturalmente
      // (esto permite que se reinicie a ~52px como en Vercel)
    }
    
    // Guardar el tab actual como anterior para la próxima vez
    scrollPositionsRef.current.set('previousTab', activeTab);
  }, [activeTab]);

  // 🔄 Sincronizar URL con activeTab y manejar historial
  useEffect(() => {
    // Usar requestAnimationFrame para evitar recargas
    requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const currentTab = params.get('tab');

      if (currentTab !== activeTab) {
        params.set('tab', activeTab);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        // Usar replaceState de forma asíncrona para evitar recargas
        window.history.replaceState({ tab: activeTab }, '', newUrl);
      }
    });
  }, [activeTab]);

  // 👂 Escuchar cambios en el historial (Botón Atrás/Adelante)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Verificar sesión al cargar. Solo se limpia el token en 401; fallback a smartpet_user si /auth/me falla por red.
  const AUTH_CHECK_TIMEOUT_MS = 12_000;

  useEffect(() => {
    let cancelled = false;

    const initSession = async () => {
      try {
        setIsCheckingAuth(true);

        const token = localStorage.getItem('auth_token');
        if (token) {
          apiClient.setToken(token);

          try {
            const response = await Promise.race([
              apiClient.get<{ user?: any; data?: any }>('/auth/me'),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('auth_check_timeout')), AUTH_CHECK_TIMEOUT_MS)
              ),
            ]);
            if (cancelled) return;

            const userData = response.user || response.data || response;
            const backendRole = userData.role?.name || userData.role || (typeof userData.role === 'string' ? userData.role : 'veterinario');
            const finalRole = userData.email?.includes('admin') ? 'admin' : backendRole;

            const user = {
              id: userData.id?.toString() || '',
              email: userData.email || '',
              name: userData.name || userData.email?.split('@')[0] || 'Usuario',
              role: finalRole,
              permissions: Array.isArray(userData.permissions) ? userData.permissions : ['all'],
              companyId: userData.company_id,
            };
            setIsAuthenticated(true);
            setCurrentUser(user);
            try {
              localStorage.setItem('smartpet_user', JSON.stringify(user));
            } catch (_) {}
            setIsCheckingAuth(false);
            return;
          } catch (e) {
            if (cancelled) return;
            // Solo limpiar token si el backend responde 401 (no autorizado). Timeout/red no borran la sesión.
            const isUnauthorized = e instanceof ApiAuthError || (e as { status?: number })?.status === 401;
            if (isUnauthorized) {
              localStorage.removeItem('auth_token');
              apiClient.setToken(null);
            }
          }
        }

        if (cancelled) return;
        // Fallback: restaurar sesión desde localStorage (p. ej. tras timeout o sin red)
        const session = getSession();
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('smartpet_user') : null;
        const userFromStorage = storedUser ? (() => { try { return JSON.parse(storedUser); } catch { return null; } })() : (session?.user ?? null);
        if (userFromStorage && (token || userFromStorage.id)) {
          setIsAuthenticated(true);
          setCurrentUser(userFromStorage);
          if (token) apiClient.setToken(token);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (_e) {
        if (!cancelled) {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) setIsCheckingAuth(false);
      }
    };

    initSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Aplicar tema guardado (light | dark | system) desde localStorage y reaccionar a preferencia del sistema
  useEffect(() => {
    let stored = getStoredTheme();
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('theme')) {
      setTheme('system');
      stored = 'system';
    } else {
      applyTheme(stored);
    }
    return subscribeToSystemPreference(() => {});
  }, []);

  // Atajos de teclado: Ctrl+K búsqueda, ? ayuda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navegación eventos
  useEffect(() => {
    const handleNavigateToInvoicing = () => setActiveTab('invoicing');
    window.addEventListener('navigate-to-invoicing', handleNavigateToInvoicing);
    return () => window.removeEventListener('navigate-to-invoicing', handleNavigateToInvoicing);
  }, []);

  const handleLoginSuccess = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    } finally {
      // Pequeño delay para mostrar el loader
      await new Promise(resolve => setTimeout(resolve, 500));
      
      localStorage.removeItem('auth_token');
      apiClient.setToken(null);
      clearSession();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActiveTab('dashboard');
      setIsLoggingOut(false);
    }
  };

  const userPermissions = currentUser?.permissions || [];

  // MODO TRACKING PÚBLICO (Accesible sin login)
  if (activeTab === 'public-tracking') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Suspense fallback={<LoadingSpinner />}>
          <BookingTracking />
        </Suspense>
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur"
          onClick={() => setActiveTab('routes')} // Si está logueado volverá a routes, si no al login
        >
          {isAuthenticated ? 'Volver al Sistema' : 'Iniciar Sesión'}
        </Button>
      </div>
    );
  }

  // Mostrar loading mientras se verifica la autenticación
  if (isCheckingAuth) {
    return <LoadingSpinner />;
  }

  // Limpiar URL después de restablecer contraseña o volver
  const clearResetPasswordUrl = () => {
    setResetPasswordParams(null);
    const params = new URLSearchParams(window.location.search);
    params.delete('token');
    params.delete('email');
    const newPath = window.location.pathname.replace(/\/reset-password\/?$/i, '') || '/';
    const query = params.toString();
    window.history.replaceState({}, '', query ? `${newPath}?${query}` : newPath);
  };

  // MODO PÚBLICO / LOGIN
  if (!isAuthenticated) {
    if (resetPasswordParams) {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <ResetPassword
            email={resetPasswordParams.email}
            token={resetPasswordParams.token}
            onSuccess={clearResetPasswordUrl}
            onBack={clearResetPasswordUrl}
          />
        </Suspense>
      );
    }
    if (activeTab === 'password-recovery') {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <PasswordRecovery onBack={() => setActiveTab('dashboard')} />
        </Suspense>
      );
    }
    if (publicMode) {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <VetClinicPublic />
          <div className="fixed bottom-4 right-4 z-50">
            <Button 
              variant="outline" 
              className="bg-white/80 backdrop-blur shadow-lg border-primary/20 text-xs"
              onClick={() => setPublicMode(false)}
            >
              Soy Personal Médico (Login)
            </Button>
          </div>
        </Suspense>
      );
    }
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onForgotPassword={() => setActiveTab('password-recovery')} 
        onVisitPublic={() => setPublicMode(true)}
      />
    );
  }

  // MODO CHOFER
  if (currentUser?.role === 'conductor') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Suspense fallback={<LoadingSpinner />}>
          <DriverSession />
        </Suspense>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  // MODO TRACKING PÚBLICO (Removido de aquí, movido arriba para acceso público)
  
  const handleSearchNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    const role = currentUser?.role || 'staff';
    const permissions = currentUser?.permissions || [];
    
    // Si el usuario tiene permissions: ['all'], tiene acceso completo
    const hasFullAccess = permissions.includes('all') || role === 'admin' || role === 'superadmin' || role === 'manager';
    
    // Verificar permisos centralizados (solo si no tiene acceso completo)
    if (!hasFullAccess && !isModuleAllowed(role, activeTab)) {
      // Redirigir al dashboard si no tiene permisos
      // Nota: idealmente usaríamos useEffect para cambiar activeTab, 
      // pero aquí renderizamos el Dashboard como fallback inmediato
      return <Dashboard onNavigate={setActiveTab} />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'calendar': return <Calendar />;
      case 'appointments': return <Appointments />;
      case 'clients': return <Clients />;
      case 'pets': return <PetsManagement onNavigate={setActiveTab} />;
      case 'services': return <Services />;
      case 'products': return <Products />;
      case 'inventory': return <Inventory />;
      case 'purchases': return <Purchases />;
      case 'medical': return <MedicalCare />;
      case 'vehicles': return <VehicleManagement />;
      case 'routes': return <Routes onNavigate={setActiveTab} />;
      case 'invoicing': return <Invoicing currentUser={currentUser} />;
      case 'payments': return <Payments />;
      case 'staff': return <Staff />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      case 'cash-register': return <CashRegister />;
      case 'kardex': return <ProductKardex />;
      case 'accounting': return <AccountingConfig />;
      case 'financial': return <FinancialManagement />;
      case 'exports': return <ExportsReports />;
      case 'notifications': return <NotificationsImproved onNavigate={setActiveTab} />;
      case 'profile': return <UserProfilePage />;
      case 'user-settings': return <UserSettingsPage />;
      case 'users': return <UserManagement currentUserId={currentUser.id} currentUserRole={currentUser.role} />;
      case 'companies': return <CompanyManagement />;
      case 'loyalty': return <LoyaltyProgram />;
      case 'reviews': return <ReviewsSystem />;
      case 'confirmation': return <AppointmentConfirmation />;
      case 'analytics': return <PredictiveAnalytics />;
      
      // SUNAT (sistema completo: facturas, boletas, NC, ND, resúmenes, comunicaciones de baja, guías)
      case 'sunat-config': return <SUNATConfig />;
      case 'electronic-invoicing': return <SunatFacturacionCompleta />;
      case 'electronic-books': return <ElectronicBooks />;
      case 'sunat-reports': return <SUNATReports />;
      
      // Portal Público Unificado
      case 'vet-clinic-portal': return <VetClinicPublic />;
      
      // Análisis
      case 'analisis-geografico': return <AnalisisGeografico />;
      case 'segmentacion': return <SegmentacionAutomatica />;
      case 'patrones': return <AnalisisPatrones />;
      
      // 🆕 CENTRO DE CONTROL (BETA)
      case 'operations-center': return <OperationsCenter />;
      
      // Simulador App Chofer
      case 'driver-session': return <DriverSession />;

      // Otros
      case 'data-export': return <DataExport />;
      case 'password-recovery': return <PasswordRecovery onBack={() => setActiveTab('settings')} />;
      case 'prueba': return <Prueba onNavigate={setActiveTab} />;
      
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  // Mostrar loader durante logout
  if (isLoggingOut) {
    return <LoadingSpinner isLogout={true} message="Cerrando sesión..." />;
  }

  return (
    <div className="flex h-screen min-h-full bg-background text-foreground transition-colors duration-200">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none">
        Saltar al contenido
      </a>
      <div id="announcements" aria-live="polite" aria-atomic="true" className="sr-only" />

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        userPermissions={userPermissions}
        currentUser={currentUser}
        mobileOpen={sidebarMobileOpen}
        onMobileOpenChange={setSidebarMobileOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSearchOpen={() => setSearchOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
          onMenuClick={() => setSidebarMobileOpen(prev => !prev)}
        />
        
        <main id="main" ref={mainContentRef} className="flex-1 overflow-y-auto min-h-0 bg-background transition-colors duration-200" tabIndex={-1}>
          <Suspense fallback={<PageSkeleton />}>
            {renderContent()}
          </Suspense>
        </main>
      </div>

      <Suspense fallback={null}>
        <LiveChat />
      </Suspense>

      <GlobalSearch 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleSearchNavigate}
        companyId={currentUser?.companyId}
      />

      <ShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    initSmartPetErrorMonitoring();
  }, []);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Error capturado por ErrorBoundary:', error, errorInfo);
      }}
    >
      <AuthProvider>
        <AppProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}