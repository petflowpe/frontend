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
  Video,
  MessageCircle,
  Sliders, // 🆕 MULTI-TENANT
  BarChart3, // Reportes
  Target, // 🆕 Análisis de Patrones
  Download, // 🚀 Quick Win: Exportación
  AlertCircle, // 🚀 Quick Win: Error Monitoring
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
import { useIsMobile } from './ui/use-mobile';
import { X } from 'lucide-react';
import { canAccessModule } from '../utils/permissions';

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
    { id: 'prueba', label: 'Módulo Prueba', icon: Beaker, color: 'text-purple-600', badge: '🧪 TEST', section: 'admin' },
    
    { id: 'user-settings', label: 'Preferencias', icon: Sliders, color: 'text-slate-500', section: 'admin' },
    { id: 'notifications', label: 'Notificaciones', icon: BellRing, color: 'text-amber-500', section: 'admin' },
    { id: 'settings', label: 'Configuración', icon: Settings2, color: 'text-gray-500', section: 'admin' },
    { id: 'companies', label: 'Empresas', icon: Building2, color: 'text-blue-600', section: 'admin' },
    { id: 'users', label: 'Usuarios', icon: UsersIcon, color: 'text-purple-500', section: 'admin' },
  ];

  // Filtrado real por permisos: usa el mapa MODULE_ACCESS + role_key + permissions[]
  // devueltos por el backend en /auth/login y /auth/me.
  // Si no hay usuario (dev), muestra todo.
  const filteredItems = useMemo(() => {
    if (!currentUser) return menuItems;
    return menuItems.filter(item => canAccessModule(currentUser, item.id));
  }, [currentUser, userPermissions]);

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
          <div className="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center ring-2 ring-cyan-400/25">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          {showExpanded && (
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                PetFlow
              </h1>
              <p className="text-[10px] font-semibold text-cyan-400/90 uppercase tracking-wider mt-0.5">Pro Dashboard</p>
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
                  <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 px-3 ${
                    section.highlight 
                      ? 'text-cyan-400/80'
                      : 'text-slate-500'
                  }`}>
                    {section.label}
                  </h3>
                )}
                
                <div className="space-y-1">
                  {sectionItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentActiveTab === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(e) => onItemClick(item.id, e)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 group relative overflow-visible ${
                          showExpanded ? 'rounded-xl' : 'rounded-xl justify-center px-2'
                        } ${
                          isActive
                            ? 'border border-cyan-400/55 bg-slate-800/75 text-white shadow-[0_0_18px_-4px_rgba(34,211,238,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-cyan-400/20'
                            : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/[0.06]'
                        } ${!showExpanded ? 'justify-center' : ''}`}
                        title={!showExpanded ? item.label : undefined}
                      >
                        <Icon
                          className={`h-[1.15rem] w-[1.15rem] shrink-0 transition-opacity ${item.color} ${isActive ? 'opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]' : 'opacity-85 group-hover:opacity-100'}`}
                          strokeWidth={1.5}
                        />
                        
                        {showExpanded && (
                          <span className={`font-medium text-sm truncate flex-1 min-w-0 ${isActive ? 'text-white' : ''}`}>
                            {item.label}
                          </span>
                        )}
                        
                        {showExpanded && (
                          <div className="flex items-center gap-2 shrink-0 ml-auto">
                            {item.badge && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                                item.badge.toUpperCase().includes('COMPLETO')
                                  ? 'bg-cyan-950/50 text-cyan-200 border-cyan-500/35'
                                  : item.badge.includes('NUEVO')
                                    ? 'bg-violet-950/50 text-violet-200 border-violet-500/35'
                                    : 'bg-slate-800/80 text-slate-200 border-slate-600/60'
                              }`}>
                                {item.badge.replace('🆕 ', '').replace('🇵🇪 ', '').replace('✨ ', '')}
                              </span>
                            )}
                            {isActive && (
                              <span
                                className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_2px_rgba(34,211,238,0.85)] ring-2 ring-cyan-400/35"
                                aria-hidden
                              />
                            )}
                          </div>
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
            <div className="rounded-xl p-3 border border-cyan-500/25 bg-slate-900/60 shadow-[0_0_20px_-8px_rgba(34,211,238,0.35)] relative overflow-hidden group cursor-default">
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-inner ring-1 ring-white/10">
                  <Star className="h-4 w-4 text-white fill-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">PetFlow Pro</p>
                  <p className="text-[10px] text-slate-400">v2.1 Stable</p>
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
            className={`fixed inset-y-0 left-0 w-[280px] sm:w-[320px] bg-[#0f172a] border-r border-slate-800/90 z-[100] transform transition-transform duration-300 ease-in-out shadow-xl shadow-black/40 ${
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
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
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
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} hidden md:flex bg-[#0f172a] border-r border-slate-800/90 transition-all duration-300 relative h-screen flex-col shadow-lg shadow-black/30 z-50 overflow-visible`}>
        {/* Toggle: botón discreto dentro del sidebar, esquina superior derecha */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          aria-label={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          className="absolute right-2 top-6 z-10 flex h-10 w-10 min-touch items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a] transition-colors"
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
