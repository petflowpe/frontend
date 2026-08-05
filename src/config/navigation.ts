import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  BellRing,
  CalendarRange,
  CalendarDays,
  CheckCircle2,
  UsersRound,
  PawPrint,
  Heart,
  Star,
  Zap,
  MapPin,
  Navigation,
  Car,
  Map,
  Truck,
  Scissors,
  Boxes,
  Package,
  Layers,
  Building2,
  ShoppingBag,
  Receipt,
  CreditCard,
  Calculator,
  Wallet,
  FileSpreadsheet,
  FileCheck,
  BookOpen,
  FileText,
  BarChart3,
  Sparkles,
  TrendingUp,
  Sliders,
  Target,
  Download,
  Globe,
  UsersIcon,
  Settings2,
  Beaker,
} from 'lucide-react';

export interface NavItem {
  /** ID de módulo (tab en App.tsx). Omitir si es solo grupo expandible. */
  id?: string;
  label: string;
  icon: LucideIcon;
  color?: string;
  badge?: string;
  /** Submenú colapsable */
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  label: string;
  highlight?: boolean;
  /** Sección expandida por defecto al cargar */
  defaultOpen?: boolean;
  items: NavItem[];
}

/**
 * Navegación principal reorganizada por flujo operativo.
 * Orden: Inicio → Citas → Logística → Catálogo → Finanzas → Análisis → Portal → Sistema
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'home',
    label: 'Inicio',
    defaultOpen: true,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
      { id: 'notifications', label: 'Notificaciones', icon: BellRing, color: 'text-amber-500' },
    ],
  },
  {
    id: 'clients',
    label: 'Citas y Clientes',
    defaultOpen: true,
    items: [
      { id: 'calendar', label: 'Agenda Visual', icon: CalendarRange, color: 'text-orange-500' },
      { id: 'appointments', label: 'Lista de Citas', icon: CalendarDays, color: 'text-green-500' },
      { id: 'confirmation', label: 'Confirmaciones', icon: CheckCircle2, color: 'text-teal-500' },
      { id: 'clients', label: 'Clientes', icon: UsersRound, color: 'text-purple-500' },
      { id: 'pets', label: 'Mascotas', icon: PawPrint, color: 'text-indigo-500' },
      { id: 'loyalty', label: 'Fidelización', icon: Heart, color: 'text-pink-500' },
      { id: 'reviews', label: 'Reviews', icon: Star, color: 'text-yellow-500' },
    ],
  },
  {
    id: 'logistics',
    label: 'Logística y Flota',
    defaultOpen: true,
    items: [
      { id: 'operations-center', label: 'Centro de Control', icon: Zap, color: 'text-blue-600', badge: 'BETA' },
      { id: 'routes', label: 'Planificador de Rutas', icon: MapPin, color: 'text-red-500' },
      { id: 'driver-session', label: 'App Chofer', icon: Car, color: 'text-slate-300' },
      { id: 'public-tracking', label: 'Tracking Cliente', icon: Navigation, color: 'text-cyan-400' },
      { id: 'vehicles', label: 'Vehículos y Flota', icon: Truck, color: 'text-lime-500' },
      { id: 'zone-config', label: 'Configuración de Zonas', icon: Map, color: 'text-emerald-500' },
    ],
  },
  {
    id: 'catalog',
    label: 'Catálogo e Inventario',
    items: [
      { id: 'services', label: 'Servicios', icon: Scissors, color: 'text-pink-500' },
      { id: 'products', label: 'Productos', icon: Boxes, color: 'text-amber-500' },
      { id: 'inventory', label: 'Inventario', icon: Package, color: 'text-emerald-600' },
      { id: 'kardex', label: 'Kardex', icon: Layers, color: 'text-purple-500' },
      { id: 'suppliers', label: 'Directorio Proveedores', icon: Building2, color: 'text-indigo-500' },
      { id: 'purchases', label: 'Compras', icon: ShoppingBag, color: 'text-violet-500' },
    ],
  },
  {
    id: 'finance',
    label: 'Finanzas y Caja',
    items: [
      { id: 'invoicing', label: 'Facturación', icon: Receipt, color: 'text-yellow-500' },
      { id: 'payments', label: 'Pagos', icon: CreditCard, color: 'text-emerald-500' },
      { id: 'cash-register', label: 'Cierre de Caja', icon: Calculator, color: 'text-green-500' },
      { id: 'financial', label: 'Gestión Financiera', icon: Wallet, color: 'text-emerald-600' },
      { id: 'accounting', label: 'Contabilidad', icon: FileSpreadsheet, color: 'text-emerald-500' },
      {
        label: 'SUNAT Perú',
        icon: Building2,
        color: 'text-red-500',
        badge: 'PE',
        children: [
          { id: 'sunat-config', label: 'Configuración', icon: Building2, color: 'text-red-600' },
          { id: 'electronic-invoicing', label: 'Facturación Electrónica', icon: FileCheck, color: 'text-green-600' },
          { id: 'electronic-books', label: 'Libros Electrónicos', icon: BookOpen, color: 'text-blue-600' },
          { id: 'sunat-reports', label: 'Reportes SUNAT', icon: FileText, color: 'text-purple-600' },
        ],
      },
    ],
  },
  {
    id: 'insights',
    label: 'Análisis e Informes',
    items: [
      { id: 'reports', label: 'Reportes', icon: BarChart3, color: 'text-orange-500' },
      { id: 'analytics', label: 'Analytics IA', icon: Sparkles, color: 'text-purple-500' },
      { id: 'exports', label: 'Informes Exportables', icon: FileText, color: 'text-blue-500' },
      { id: 'analisis-geografico', label: 'Análisis Geográfico', icon: TrendingUp, color: 'text-blue-600' },
      { id: 'segmentacion', label: 'Segmentación', icon: Sliders, color: 'text-purple-600' },
      { id: 'patrones', label: 'Patrones de Demanda', icon: Target, color: 'text-orange-600' },
      { id: 'data-export', label: 'Exportar / Backup', icon: Download, color: 'text-green-600' },
    ],
  },
  {
    id: 'portal',
    label: 'Portal Público',
    highlight: true,
    items: [
      { id: 'vet-clinic-portal', label: 'Reservas en Línea', icon: Globe, color: 'text-green-600' },
    ],
  },
  {
    id: 'system',
    label: 'Sistema',
    items: [
      { id: 'companies', label: 'Empresas', icon: Building2, color: 'text-blue-600' },
      { id: 'users', label: 'Usuarios y Roles', icon: UsersIcon, color: 'text-purple-500' },
      { id: 'staff', label: 'Personal', icon: UsersIcon, color: 'text-indigo-500' },
      { id: 'settings', label: 'Configuración', icon: Settings2, color: 'text-gray-500' },
      { id: 'user-settings', label: 'Mis Preferencias', icon: Sliders, color: 'text-slate-500' },
      { id: 'prueba', label: 'Módulo Prueba', icon: Beaker, color: 'text-purple-600', badge: 'DEV' },
    ],
  },
];

/** Todos los IDs de módulo navegables (para permisos y búsqueda) */
export function getAllNavModuleIds(): string[] {
  const ids: string[] = [];
  const walk = (items: NavItem[]) => {
    for (const item of items) {
      if (item.id) ids.push(item.id);
      if (item.children) walk(item.children);
    }
  };
  for (const section of NAV_SECTIONS) walk(section.items);
  return ids;
}

/** Etiqueta legible para el header según tab activo */
export function getNavLabel(moduleId: string): string | undefined {
  let found: string | undefined;
  const walk = (items: NavItem[]) => {
    for (const item of items) {
      if (item.id === moduleId) found = item.label;
      if (item.children) walk(item.children);
    }
  };
  for (const section of NAV_SECTIONS) walk(section.items);
  return found;
}
