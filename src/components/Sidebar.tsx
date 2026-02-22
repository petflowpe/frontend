import { useState, useEffect, useMemo, memo, useRef } from 'react';
import { 
  CalendarDays, 
  UsersRound, 
  Scissors, 
  MapPin, 
  Receipt, 
  Settings2, 
  LayoutDashboard,
  Wallet,
  Truck,
  TrendingUp,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Heart,
  CreditCard,
  UsersIcon,
  Boxes,
  Package,
  HeartPulse,
  ShoppingBag,
  Calculator,
  Layers,
  FileSpreadsheet,
  Star,
  CheckCircle2,
  Sparkles,
  // 🆕 NUEVOS ICONOS
  Globe,
  UserRound,
  Video,
  MessageCircle,
  Sliders, // 🆕 MULTI-TENANT
  BarChart3, // Reportes
  Target, // 🆕 Análisis de Patrones
  Download, // 🚀 Quick Win: Exportación
  AlertCircle, // 🚀 Quick Win: Error Monitoring
  KeyRound, // 🚀 Quick Win: Password Recovery
  // 🇵🇪 ICONOS SUNAT
  Building2, // Config SUNAT
  FileCheck, // Facturación Electrónica
  BookOpen, // Libros Electrónicos
  FileText, // Reportes SUNAT
  CalendarRange, // 🆕 Calendar
  Zap, // 🆕 Centro de Control (más energético)
  Beaker, // 🆕 Prueba
  PawPrint // 🆕 Mascotas
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useIsMobile } from './ui/use-mobile';
import { X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userPermissions?: string[];
  currentUser?: any;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, userPermissions, currentUser, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  // DEBUG: Log para verificar el rol del usuario
  useEffect(() => {
    console.log('🔍 Sidebar - currentUser:', currentUser);
    console.log('🔍 Sidebar - currentUser.role:', currentUser?.role);
  }, [currentUser]);
  
  
  // Ref para guardar la posición del scroll del sidebar
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const sidebarScrollPosition = useRef<number>(0);
  
  // Auto-cerrar drawer móvil al seleccionar un item
  const handleItemClick = (tab: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }
    
    // Guardar la posición actual del scroll antes de cambiar el tab
    if (sidebarScrollRef.current) {
      const currentScroll = sidebarScrollRef.current.scrollTop;
      sidebarScrollPosition.current = currentScroll;
      sessionStorage.setItem('sidebarScrollPosition', currentScroll.toString());
    }
    
    // Cambiar tab inmediatamente
    setActiveTab(tab);
    if (isMobile && onMobileOpenChange) {
      onMobileOpenChange(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500', section: 'main' },
    { id: 'calendar', label: 'Agenda Visual', icon: CalendarRange, color: 'text-orange-500', section: 'main' },
    { id: 'appointments', label: 'Lista de Citas', icon: CalendarDays, color: 'text-green-500', section: 'main' },
    { id: 'confirmation', label: 'Confirmaciones', icon: CheckCircle2, color: 'text-teal-500', section: 'main' },
    { id: 'clients', label: 'Clientes', icon: UsersRound, color: 'text-purple-500', section: 'main' },
    { id: 'pets', label: 'Mascotas', icon: PawPrint, color: 'text-indigo-500', section: 'main' },
    { id: 'loyalty', label: 'Fidelización', icon: Heart, color: 'text-pink-500', section: 'main' },
    { id: 'reviews', label: 'Reviews', icon: Star, color: 'text-yellow-500', section: 'main' },
    
    // 🆕 SECCIÓN PORTAL DE RESERVAS
    { id: 'vet-clinic-portal', label: 'Portal Público', icon: Globe, color: 'text-green-600', badge: '🆕 COMPLETO', section: 'portal' },
    
    { id: 'services', label: 'Servicios', icon: Scissors, color: 'text-pink-500', section: 'operations' },
    { id: 'products', label: 'Productos', icon: Boxes, color: 'text-amber-500', section: 'operations' },
    { id: 'inventory', label: 'Inventario', icon: Package, color: 'text-emerald-600', section: 'operations' },
    { id: 'purchases', label: 'Compras', icon: ShoppingBag, color: 'text-violet-500', section: 'operations' },
    
    // 🆕 CENTRO DE CONTROL
    { id: 'operations-center', label: 'Centro de Control', icon: Zap, color: 'text-blue-600', badge: 'BETA', section: 'operations' },
    
    { id: 'medical', label: 'Cuidado Médico', icon: HeartPulse, color: 'text-teal-500', section: 'operations' },
    { id: 'vehicles', label: 'Vehículos', icon: Truck, color: 'text-lime-500', section: 'operations' },
    { id: 'routes', label: 'Planificador Rutas', icon: MapPin, color: 'text-red-500', section: 'operations' },
    { id: 'invoicing', label: 'Facturación', icon: Receipt, color: 'text-yellow-500', section: 'financial' },
    { id: 'payments', label: 'Pagos', icon: CreditCard, color: 'text-emerald-500', section: 'financial' },
    { id: 'staff', label: 'Personal', icon: UsersIcon, color: 'text-indigo-500', section: 'admin' },
    { id: 'cash-register', label: 'Cierre de Caja', icon: Calculator, color: 'text-green-500', section: 'financial' },
    { id: 'kardex', label: 'Kardex', icon: Layers, color: 'text-purple-500', section: 'operations' },
    { id: 'accounting', label: 'Contabilidad', icon: FileSpreadsheet, color: 'text-emerald-500', section: 'financial' },
    { id: 'exports', label: 'Informes', icon: FileText, color: 'text-blue-500', section: 'reports' },
    { id: 'reports', label: 'Reportes', icon: BarChart3, color: 'text-orange-500', section: 'reports' },
    { id: 'analytics', label: 'Analytics IA', icon: Sparkles, color: 'text-purple-500', section: 'reports' },
    
    // 🇵🇪 SECCIÓN SUNAT
    { id: 'sunat-config', label: 'Config SUNAT', icon: Building2, color: 'text-red-600', badge: '🇵🇪 NUEVO', section: 'sunat' },
    { id: 'electronic-invoicing', label: 'Facturación SUNAT', icon: FileCheck, color: 'text-green-600', badge: '🇵🇪 Completo', section: 'sunat' },
    { id: 'electronic-books', label: 'Libros Electrónicos', icon: BookOpen, color: 'text-blue-600', badge: '🇵🇪 NUEVO', section: 'sunat' },
    { id: 'sunat-reports', label: 'Reportes SUNAT', icon: FileText, color: 'text-purple-600', badge: '🇵🇪 NUEVO', section: 'sunat' },
    
    // 🆕 ANÁLISIS GEOGRÁFICO Y SEGMENTACIÓN
    { id: 'analisis-geografico', label: 'Análisis Geográfico', icon: TrendingUp, color: 'text-blue-600', badge: '✨ NUEVO', section: 'analytics' },
    { id: 'segmentacion', label: 'Segmentación Clientes', icon: Sliders, color: 'text-purple-600', badge: '✨ NUEVO', section: 'analytics' },
    { id: 'patrones', label: 'Análisis de Patrones', icon: Target, color: 'text-orange-600', badge: '✨ NUEVO', section: 'analytics' },
    
    // 🚀 QUICK WINS
    { id: 'data-export', label: 'Exportar Datos', icon: Download, color: 'text-green-600', badge: '💾 Backup', section: 'admin' },
    { id: 'password-recovery', label: 'Recuperar Password', icon: KeyRound, color: 'text-orange-600', badge: '🔑 Test', section: 'admin' },
    { id: 'prueba', label: 'Módulo Prueba', icon: Beaker, color: 'text-purple-600', badge: '🧪 TEST', section: 'admin' },
    
    { id: 'profile', label: 'Mi Perfil', icon: UserRound, color: 'text-blue-500', section: 'admin' },
    { id: 'user-settings', label: 'Preferencias', icon: Sliders, color: 'text-slate-500', section: 'admin' },
    { id: 'notifications', label: 'Notificaciones', icon: BellRing, color: 'text-amber-500', section: 'admin' },
    { id: 'settings', label: 'Configuración', icon: Settings2, color: 'text-gray-500', section: 'admin' },
    { id: 'companies', label: 'Empresas', icon: Building2, color: 'text-blue-600', section: 'admin' },
    { id: 'users', label: 'Usuarios', icon: UsersIcon, color: 'text-purple-500', section: 'admin' },
  ];

  // Filtrar items según rol
  const filterMenuItems = (items: typeof menuItems) => {
    // DEBUG: Log del filtro
    console.log('🔍 filterMenuItems - currentUser:', currentUser);
    console.log('🔍 filterMenuItems - currentUser?.role:', currentUser?.role);
    console.log('🔍 filterMenuItems - total items:', items.length);
    
    // Si no hay usuario, mostrar todas las opciones (para desarrollo)
    if (!currentUser) {
      console.log('✅ No hay usuario - mostrando todas las opciones');
      return items;
    }
    
    // Normalizar el rol (puede venir como string o como objeto)
    let userRole = typeof currentUser.role === 'string' 
      ? currentUser.role 
      : currentUser.role?.name || currentUser.role || 'staff';
    
    // TEMPORAL: Si el email contiene 'admin', forzar rol admin
    const userEmail = currentUser.email || currentUser.user?.email || '';
    if (userEmail && userEmail.includes('admin')) {
      userRole = 'admin';
      console.log('🔧 Rol forzado a admin por email:', userEmail);
    }
    
    // TEMPORAL: Si el nombre contiene 'admin' o 'Admin', forzar rol admin
    const userName = currentUser.name || currentUser.user?.name || '';
    if (userName && (userName.toLowerCase().includes('admin') || userName.toLowerCase().includes('administrador'))) {
      userRole = 'admin';
      console.log('🔧 Rol forzado a admin por nombre:', userName);
    }
    
    // TEMPORAL: Si tiene permissions: ['all'], tratar como admin
    const userPermissions = currentUser.permissions || [];
    if (userPermissions.includes('all') || userPermissions.length === 0) {
      // Si tiene permisos 'all' o no tiene restricciones, mostrar todas las opciones
      console.log('🔧 Usuario con permisos completos - mostrando todas las opciones');
      return items;
    }
    
    console.log('🔍 Rol normalizado:', userRole);
    console.log('🔍 Email del usuario:', userEmail);
    console.log('🔍 Nombre del usuario:', userName);
    console.log('🔍 Permisos del usuario:', userPermissions);
    
    // Si es admin/superadmin/manager, mostrar TODAS las opciones
    if (userRole === 'admin' || userRole === 'superadmin' || userRole === 'manager') {
      console.log('✅ Usuario admin - mostrando todas las opciones');
      return items;
    }

    if (userRole === 'veterinario') {
      const allowedIds = [
        'dashboard', 'calendar', 'appointments', 'confirmation', 'clients', 'pets',
        'medical', 'services', 'loyalty', 'reviews', 'vet-clinic-portal',
        'settings' // Perfil básico
      ];
      return items.filter(item => allowedIds.includes(item.id));
    }

    if (userRole === 'staff' || userRole === 'conductor' || userRole === 'groomer') {
      const allowedIds = [
        'dashboard', 'calendar', 'appointments', 'routes', 'vehicles', 
        'services', 'products', 'operations-center' // Ver productos para usarlos, pero no kardex
      ];
      return items.filter(item => allowedIds.includes(item.id));
    }

    // Default: acceso mínimo - solo dashboard
    return items.filter(item => ['dashboard'].includes(item.id));
  };

  // Memoizar los items filtrados para evitar recálculos innecesarios
  const filteredItems = useMemo(() => {
    return filterMenuItems(menuItems);
  }, [userPermissions, currentUser]);

  // Agrupar items por sección (memoizado)
  const sections = useMemo(() => [
    { id: 'main', label: 'Principal' },
    { id: 'portal', label: '🌐 Portal Cliente', highlight: true },
    { id: 'analytics', label: '📊 Análisis y Segmentación', highlight: true }, // 🆕 NUEVA SECCIÓN
    { id: 'operations', label: 'Operaciones' },
    { id: 'financial', label: 'Finanzas' },
    { id: 'sunat', label: '🇵🇪 SUNAT Perú', highlight: true }, // 🇵🇪 NUEVA SECCIÓN
    { id: 'reports', label: 'Reportes' },
    { id: 'admin', label: 'Administración' },
  ], []);

  // Contenido del sidebar (reutilizable para desktop y mobile)
  // Memoizado para evitar re-renders cuando solo cambia activeTab
  const SidebarContent = memo(({ 
    forceExpanded = false, 
    currentActiveTab,
    onItemClick,
    items,
    sectionsList,
    collapsed
  }: { 
    forceExpanded?: boolean; 
    currentActiveTab: string;
    onItemClick: (tab: string, e?: React.MouseEvent) => void;
    items: typeof menuItems;
    sectionsList: typeof sections;
    collapsed: boolean;
  }) => {
    const showExpanded = forceExpanded || !collapsed;
    const sidebarScrollRef = useRef<HTMLDivElement>(null);
    
    // Preservar posición del scroll del sidebar
    useEffect(() => {
      const sidebarElement = sidebarScrollRef.current;
      if (!sidebarElement) return;
      
      // Obtener la posición guardada desde sessionStorage
      const savedScroll = sessionStorage.getItem('sidebarScrollPosition');
      if (savedScroll) {
        const scrollValue = parseInt(savedScroll, 10);
        if (scrollValue >= 0) {
          // Restaurar después de que el DOM esté listo (usar múltiples intentos)
          const restoreScroll = () => {
            if (sidebarElement) {
              sidebarElement.scrollTop = scrollValue;
            }
          };
          
          // Intentar restaurar inmediatamente
          requestAnimationFrame(restoreScroll);
          
          // También intentar después de un pequeño delay por si acaso
          setTimeout(restoreScroll, 10);
        }
      }
    }, [currentActiveTab]);
    
    // Guardar posición del scroll cuando el usuario hace scroll
    useEffect(() => {
      const sidebarElement = sidebarScrollRef.current;
      if (!sidebarElement) return;
      
      const handleScroll = () => {
        sessionStorage.setItem('sidebarScrollPosition', sidebarElement.scrollTop.toString());
      };
      
      sidebarElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => sidebarElement.removeEventListener('scroll', handleScroll);
    }, []);
    
    return (
      <div 
        ref={sidebarScrollRef}
        className="p-4 h-full w-full flex flex-col overflow-y-auto sidebar-scroll-on-hover relative"
      >
        {/* Logo y branding */}
        <div className="mb-8 mt-2 flex items-center space-x-3 px-2">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25 dark:shadow-blue-500/20 flex items-center justify-center ring-2 ring-white/20 dark:ring-slate-800/50">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          {showExpanded && (
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                PetFlow
              </h1>
              <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-0.5">Pro Dashboard</p>
            </div>
          )}
        </div>

        {/* Navegación por secciones */}
        <nav className="space-y-6 flex-1">
          {sectionsList.map((section) => {
            const sectionItems = items.filter(item => item.section === section.id);
            if (sectionItems.length === 0) return null;

            return (
              <div key={section.id}>
                {showExpanded && (
                  <h3 className={`text-[11px] font-bold uppercase tracking-widest mb-2 px-3 ${
                    section.highlight 
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {section.label}
                  </h3>
                )}
                
                <div className="space-y-0.5">
                  {sectionItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentActiveTab === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(e) => onItemClick(item.id, e)}
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group relative overflow-hidden ${
                          isActive
                            ? 'bg-blue-50 dark:bg-slate-800 dark:text-slate-100 shadow-sm border border-blue-200/80 dark:border-slate-600/80'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                        } ${!showExpanded ? 'justify-center' : ''}`}
                        title={!showExpanded ? item.label : undefined}
                      >
                        {isActive && (
                            <div className="absolute left-0 top-1 bottom-1 w-1 bg-blue-500 dark:bg-blue-600 rounded-r-full" />
                        )}
                        
                        <Icon className={`h-[1.15rem] w-[1.15rem] shrink-0 transition-colors ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white'}`} strokeWidth={1.5} />
                        
                        {showExpanded && (
                          <span className={`font-medium text-sm truncate ${isActive ? 'text-slate-900 dark:text-slate-100' : ''}`}>
                            {item.label}
                          </span>
                        )}
                        
                        {item.badge && showExpanded && (
                          <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                            item.badge.toUpperCase().includes('COMPLETO')
                              ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600'
                              : item.badge.includes('NUEVO')
                                ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600'
                                : 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                          }`}>
                             {item.badge.replace('🆕 ', '').replace('🇵🇪 ', '').replace('✨ ', '')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        {showExpanded && (
          <div className="mt-auto pt-6">
            <div className="bg-slate-100 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none relative overflow-hidden group cursor-default">
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center shadow-inner">
                  <Star className="h-4 w-4 text-white fill-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">PetFlow Pro</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">v2.1 Stable</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }, (prevProps, nextProps) => {
    // Solo re-renderizar si cambia forceExpanded, currentActiveTab, items, sectionsList o collapsed
    return prevProps.forceExpanded === nextProps.forceExpanded && 
           prevProps.currentActiveTab === nextProps.currentActiveTab &&
           prevProps.items === nextProps.items &&
           prevProps.sectionsList === nextProps.sectionsList &&
           prevProps.collapsed === nextProps.collapsed;
  });

  return (
    <>
      {/* Versión móvil: Drawer simple sin Radix UI */}
      {isMobile && (
        <>
          {/* Overlay - Siempre en DOM pero visible solo cuando mobileOpen es true */}
          <div 
            className={`fixed inset-0 bg-black/50 z-[95] transition-opacity ${
              mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => onMobileOpenChange?.(false)}
            onTouchStart={() => onMobileOpenChange?.(false)}
            aria-label="Cerrar menú"
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 95
            }}
          />
          
          {/* Sidebar móvil */}
          <aside
            className={`fixed inset-y-0 left-0 w-[280px] sm:w-[320px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[100] transform transition-transform duration-300 ease-in-out shadow-xl dark:shadow-slate-950/50 ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ 
              visibility: mobileOpen ? 'visible' : 'hidden',
              pointerEvents: mobileOpen ? 'auto' : 'none'
            }}
            aria-hidden={!mobileOpen}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => onMobileOpenChange?.(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            <SidebarContent 
              forceExpanded={true} 
              currentActiveTab={activeTab}
              onItemClick={handleItemClick}
              items={filteredItems}
              sectionsList={sections}
              collapsed={isCollapsed}
            />
          </aside>
        </>
      )}

      {/* Versión desktop: Sidebar fijo */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} hidden md:flex bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 relative h-screen flex-col shadow-lg dark:shadow-slate-950/50 z-50 overflow-visible`}>
        {/* Toggle: botón discreto dentro del sidebar, esquina superior derecha */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          className="absolute right-2 top-6 z-10 flex h-10 w-10 min-touch items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          ) : (
            <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          )}
        </button>

        <SidebarContent 
          forceExpanded={false} 
          currentActiveTab={activeTab}
          onItemClick={handleItemClick}
          items={filteredItems}
          sectionsList={sections}
          collapsed={isCollapsed}
        />
      </aside>
    </>
  );
}
