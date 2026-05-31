import { useState, useEffect } from 'react';
import { BellRing, Moon, Sun, Search, Settings2, UserRound, ChevronDown, ExternalLink, LogOut, Sparkles, Menu, Monitor } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { NotificationCenter } from './NotificationCenter';
import { UserProfileModal } from './UserProfileModal';
import { toast } from 'sonner';
import { getStoredTheme, setTheme, type Theme } from '../utils/theme';

interface HeaderProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onSearchOpen?: () => void;
  currentUser?: any; // 🆕 Para mostrar info del usuario
  onSearchClick?: () => void; // 🆕 Alternativa para búsqueda
  onLogout?: () => void; // 🚀 NUEVO: Callback para cerrar sesión
  onMenuClick?: () => void; // 🚀 NUEVO: Callback para abrir menú móvil
  onProfileUpdated?: (profile: { name?: string; email?: string; avatar_url?: string }) => void;
}

export function Header({ activeTab, setActiveTab, onSearchOpen, currentUser, onSearchClick, onLogout, onMenuClick, onProfileUpdated }: HeaderProps) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [notifications, setNotifications] = useState(5);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Sincronizar estado con localStorage (p. ej. otra pestaña o init)
  useEffect(() => {
    setThemeState(getStoredTheme());
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  // Handler para ver detalles de notificación
  const handleViewNotificationDetails = (notification: any) => {
    // 🛡️ Validación defensiva inicial
    if (!notification || typeof notification !== 'object') {
      console.error('❌ handleViewNotificationDetails recibió una notificación inválida:', notification);
      return;
    }

    console.log('✅ handleViewNotificationDetails ejecutado con:', notification);
    console.log('🔍 notification.type:', notification.type);
    console.log('🔍 typeof notification.type:', typeof notification.type);
    console.log('🔍 notification.relatedModule:', notification.relatedModule);
    console.log('🔧 setActiveTab function:', setActiveTab);
    console.log('⏰ TIMESTAMP:', new Date().toISOString());
    
    // 1. Normalización del tipo para evitar errores de casing o espacios
    const type = notification.type ? String(notification.type).toLowerCase().trim() : 'unknown';
    
    // 2. Prioridad a relatedModule si existe (Solución Robusta)
    // Esto asegura que si la notificación tiene un módulo destino explícito, se use ese.
    if (notification.relatedModule && setActiveTab) {
      console.log(`🚀 Navegando por relatedModule a: ${notification.relatedModule}`);
      setActiveTab(notification.relatedModule);
      
      // Mostrar toast informativo (pero no detener la ejecución para permitir lógica específica del switch si fuera necesaria para otros efectos)
      // Sin embargo, para evitar doble navegación o efectos secundarios, podemos retornar aquí si solo queremos navegar.
      // Pero el switch abajo tiene mensajes personalizados de toast. Vamos a dejar que el switch maneje el toast,
      // pero evitamos que el switch intente navegar de nuevo si ya navegamos.
      
      // Mejor estrategia: Usar el switch para determinar el mensaje del toast, 
      // pero usar relatedModule como la "fuente de la verdad" para la navegación.
    }

    // Navegar al módulo correspondiente según el tipo de notificación
    switch (type) {
      case 'appointment':
        console.log('📅 Detectado tipo appointment');
        if (setActiveTab && !notification.relatedModule) {
          console.log('⏰ Ejecutando setActiveTab("appointments")');
          setActiveTab('appointments');
        }
        toast.info('Mostrando detalles de la cita', {
          description: notification.title
        });
        break;
      case 'payment':
      case 'financial':
        console.log('💰 Detectado tipo payment/financial');
        if (setActiveTab && !notification.relatedModule) {
          setActiveTab('payments');
        }
        toast.info('Mostrando detalles del pago', {
          description: notification.title
        });
        break;
      case 'inventory':
        console.log('📦 Detectado tipo inventory');
        if (setActiveTab && !notification.relatedModule) {
          setActiveTab('kardex');
        }
        toast.info('Mostrando detalles del inventario', {
          description: notification.title
        });
        break;
      case 'vehicle':
        console.log('🚗 Detectado tipo vehicle');
        if (setActiveTab && !notification.relatedModule) {
          setActiveTab('vehicles');
        }
        toast.info('Mostrando detalles del vehículo', {
          description: notification.title
        });
        break;
      case 'client':
        console.log('👥 Detectado tipo client');
        if (setActiveTab && !notification.relatedModule) {
          setActiveTab('clients');
        }
        toast.info('Mostrando detalles del cliente', {
          description: notification.title
        });
        break;
      case 'medical':
        console.log('💊 Detectado tipo medical');
        if (setActiveTab && !notification.relatedModule) {
          setActiveTab('medical');
        }
        toast.info('Mostrando detalles médicos', {
          description: notification.title
        });
        break;
      case 'staff':
        console.log('👔 Detectado tipo staff');
        if (setActiveTab && !notification.relatedModule) {
          setActiveTab('staff');
        }
        toast.info('Mostrando detalles del personal', {
          description: notification.title
        });
        break;
      default:
        console.log(`📋 Tipo no reconocido (${type}). Fallback a default.`);
        
        // 🐛 CORRECCIÓN CRÍTICA:
        // El caso default forzaba la navegación a 'notifications'.
        // Si handleViewNotificationDetails se invoca dos veces (una correcta y una fallida/vacía),
        // esto revertía la navegación.
        // Solo navegamos a notifications si NO hay relatedModule y NO sabemos qué hacer.
        // Si ya navegamos por relatedModule, NO hacemos nada aquí.
        
        if (setActiveTab && !notification.relatedModule) {
           // Si el tipo es 'system' o 'audit', quizás queramos ir a notificaciones o settings
           if (type === 'system' || type === 'audit') {
             setActiveTab('notifications'); // O settings?
           } else {
             // Para tipos desconocidos, es mejor NO navegar para evitar bucles o redirecciones indeseadas.
             // Solo mostramos el toast.
             console.log('⚠️ No se realizará navegación automática para tipo desconocido para evitar loops.');
           }
        }
        
        toast.info('Ver detalles', {
          description: notification.title
        });
    }
    
    console.log('🏁 handleViewNotificationDetails TERMINADO en:', new Date().toISOString());
  };

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard';
      case 'appointments': return 'Gestión de Citas';
      case 'clients': return 'Gestión de Clientes';
      case 'services': return 'Catálogo de Servicios';
      case 'products': return 'Productos';
      case 'inventory': return 'Inventario';
      case 'purchases': return 'Compras';
      case 'medical': return 'Cuidado Médico';
      case 'vehicles': return 'Gestión de Vehículos';
      case 'routes': return 'Rutas y Navegación';
      case 'invoicing': return 'Sistema de Facturación';
      case 'payments': return 'Gestión de Pagos';
      case 'staff': return 'Gestión de Personal';
      case 'cash-register': return 'Cierre de Caja';
      case 'kardex': return 'Kardex de Productos';
      case 'accounting': return 'Gestión Financiera';
      case 'exports-reports': return 'Informes y Exportaciones';
      case 'reports': return 'Reportes y Analytics';
      case 'notifications': return 'Centro de Notificaciones';
      case 'settings': return 'Configuración del Sistema';
      case 'companies': return 'Gestión de Empresas';
      case 'users': return 'Gestión de Usuarios';
      case 'reviews': return 'Reviews y Testimonios';
      case 'appointment-confirmation': return 'Confirmación de Citas';
      case 'predictive-analytics': return 'Analytics Predictivo';
      default: return 'SmartPet - Sistema de Gestión';
    }
  };

  const getPageDescription = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Vista general de tu negocio de grooming móvil';
      case 'appointments': return 'Programa y gestiona las citas de tus clientes';
      case 'clients': return 'Administra tu base de datos de clientes y mascotas';
      case 'services': return 'Define precios y especialidades de tus servicios';
      case 'products': return 'Catálogo de productos y servicios';
      case 'inventory': return 'Stock, ajustes y movimientos de inventario';
      case 'purchases': return 'Gestión de compras y proveedores';
      case 'medical': return 'Control de vacunas, desparasitación y tratamientos preventivos';
      case 'vehicles': return 'Administra tu flota móvil, mantenimiento y gastos operativos';
      case 'routes': return 'Optimiza las rutas de tus vehículos móviles';
      case 'invoicing': return 'Crea y gestiona facturas para tus servicios';
      case 'payments': return 'Procesa pagos y administra cobros';
      case 'staff': return 'Gestiona tu equipo de groomers profesionales';
      case 'cash-register': return 'Control de ingresos y gastos por vehículo';
      case 'kardex': return 'Control de inventario y movimientos de productos';
      case 'accounting': return 'Estados financieros, KPIs y análisis predictivo';
      case 'exports-reports': return 'Exporta tus informes y datos';
      case 'reports': return 'Analiza el rendimiento de tu negocio';
      case 'notifications': return 'Gestiona alertas y notificaciones del sistema';
      case 'settings': return 'Configura los parámetros de tu aplicación';
      case 'companies': return 'Administra empresas y horarios laborales';
      case 'users': return 'Administra los usuarios del sistema';
      case 'reviews': return 'Gestiona la retroalimentación de tus clientes';
      case 'appointment-confirmation': return 'Sistema de confirmación y recordatorios automáticos';
      case 'predictive-analytics': return 'Predicciones inteligentes con Machine Learning';
      default: return 'Sistema de gestión para peluquerías móviles';
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm dark:shadow-slate-950/50 transition-colors duration-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Botón menú móvil */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Título de la página - responsive móvil / mediana / PC */}
        <div className="flex-1 min-w-0 mr-2 max-w-[calc(100vw-12rem)] md:max-w-[280px] lg:max-w-md">
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
            {getPageTitle(activeTab)}
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-[180px] sm:max-w-[220px] md:max-w-none">
            {getPageDescription(activeTab)}
          </p>
        </div>

        {/* Barra de búsqueda central */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4 lg:mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <Input
              placeholder="Buscar clientes, citas, servicios... (Ctrl+K)"
              className="pl-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary transition-all cursor-pointer text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              onClick={onSearchOpen}
              readOnly
            />
          </div>
        </div>

        {/* Controles del header */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Botón de búsqueda móvil */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden" 
            onClick={onSearchOpen}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notificaciones */}
          <NotificationCenter onViewAll={() => setActiveTab?.('notifications')} onViewDetails={handleViewNotificationDetails} />

          {/* Selector de idioma */}
          <LanguageSelector authenticated={!!currentUser} />

          {/* Selector de tema: Light / Dark / System */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                aria-label="Cambiar tema"
              >
                {theme === 'light' && <Sun className="h-4 w-4 text-amber-500" />}
                {theme === 'dark' && <Moon className="h-4 w-4 text-indigo-400" />}
                {theme === 'system' && <Monitor className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <p className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tema</p>
              <div className="grid gap-0.5">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    theme === 'light'
                      ? 'bg-amber-50 text-amber-800 dark:bg-slate-800 dark:text-amber-200 dark:ring-1 dark:ring-slate-600'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Claro
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-indigo-50 text-indigo-800 dark:bg-slate-800 dark:text-indigo-200 dark:ring-1 dark:ring-slate-600'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Oscuro
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('system')}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    theme === 'system'
                      ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:ring-1 dark:ring-slate-600'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  Sistema
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Menú de usuario */}
          <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="Perfil" className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
                  )}
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="end">
              <div className="p-4 border-b">
                <p className="font-medium truncate">{currentUser?.name || 'Usuario'}</p>
                <p className="text-sm text-muted-foreground truncate">{currentUser?.email || 'email@smartpet.com'}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {currentUser?.role_display || currentUser?.role || 'Sin rol'}
                </p>
              </div>
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setProfileModalOpen(true);
                  }}
                >
                  <UserRound className="h-4 w-4 mr-2" />
                  Mi Perfil
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setActiveTab?.('settings')}>
                  <Settings2 className="h-4 w-4 mr-2" />
                  Configuración
                </Button>
                <div className="border-t my-2"></div>
                <Button variant="ghost" size="sm" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <UserProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        onProfileUpdated={onProfileUpdated}
      />
    </header>
  );
}