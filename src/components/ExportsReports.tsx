import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Download, 
  FileText, 
  Calendar,
  Users,
  DollarSign,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Filter,
  Settings,
  Search,
  Clock,
  TrendingUp,
  Shield,
  Database,
  FileCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Receipt,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Zap
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2 } from 'lucide-react';
import {
  fetchExportReport,
  defaultDateRange,
  REPORTS_WITH_API,
} from '../services/exportService';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  category: 'operational' | 'financial' | 'audit' | 'client' | 'inventory' | 'staff';
  icon: any;
  fields: string[];
  filters: string[];
  frequency: string;
  format: 'xlsx' | 'csv' | 'pdf';
  color: string;
}

export function ExportsReports() {
  const initialRange = useMemo(() => defaultDateRange(), []);
  const [dateRange, setDateRange] = useState({
    start: initialRange.date_from,
    end: initialRange.date_to,
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportingId, setExportingId] = useState<string | null>(null);

  const loadReportData = async (reportId: string) => {
    const data = await fetchExportReport(reportId, {
      date_from: dateRange.start,
      date_to: dateRange.end,
    });
    if (data.length === 0) {
      if (!REPORTS_WITH_API.has(reportId)) {
        toast.warning('Informe en preparación', {
          description: 'Este tipo de informe aún no tiene consulta en el servidor.',
        });
      } else {
        toast.info('Sin registros', {
          description: 'No hay datos en el rango de fechas seleccionado.',
        });
      }
    }
    return data;
  };

  const exportToExcel = async (reportId: string, reportName: string) => {
    setExportingId(reportId);
    try {
      const data = await loadReportData(reportId);
      if (data.length === 0) return;

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

      const fileName = `${reportName.replace(/[^a-z0-9]/gi, '_')}_${dateRange.end}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success('Reporte generado', {
        description: `${data.length} filas — ${fileName}`,
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setExportingId(null);
    }
  };

  const exportToCSV = async (reportId: string, reportName: string) => {
    setExportingId(reportId);
    try {
      const data = await loadReportData(reportId);
      if (data.length === 0) return;

      const worksheet = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const fileName = `${reportName.replace(/[^a-z0-9]/gi, '_')}_${dateRange.end}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Reporte CSV generado', { description: fileName });
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Error al generar el CSV');
    } finally {
      setExportingId(null);
    }
  };

  // CATÁLOGO COMPLETO DE INFORMES
  const reports: ReportConfig[] = [
    // ========== OPERACIONALES ==========
    {
      id: 'appointments-full',
      name: 'Listado Completo de Citas',
      description: 'Todas las citas con detalles completos (cliente, mascota, servicio, estado, precio)',
      category: 'operational',
      icon: Calendar,
      fields: ['Fecha', 'Hora', 'Cliente', 'Mascota', 'Raza', 'Servicios', 'Groomer', 'Vehículo', 'Estado', 'Precio', 'Notas'],
      filters: ['Rango de fechas', 'Estado', 'Vehículo', 'Groomer', 'Zona'],
      frequency: 'Diario/Semanal/Mensual',
      format: 'xlsx',
      color: 'blue'
    },
    {
      id: 'appointments-pending',
      name: 'Citas Pendientes',
      description: 'Citas programadas próximas 7/15/30 días',
      category: 'operational',
      icon: Clock,
      fields: ['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Dirección', 'Servicios', 'Vehículo Asignado'],
      filters: ['Período', 'Vehículo', 'Zona'],
      frequency: 'Diario',
      format: 'xlsx',
      color: 'blue'
    },
    {
      id: 'appointments-cancelled',
      name: 'Historial de Cancelaciones',
      description: 'Análisis de citas canceladas con motivos y patrones',
      category: 'operational',
      icon: AlertTriangle,
      fields: ['Fecha Original', 'Cliente', 'Servicio', 'Motivo Cancelación', 'Cancelado Por', 'Tiempo Anticipación'],
      filters: ['Rango de fechas', 'Motivo', 'Cliente'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'orange'
    },
    {
      id: 'routes-daily',
      name: 'Rutas Diarias por Vehículo',
      description: 'Planificación y ejecución de rutas con KM y tiempos',
      category: 'operational',
      icon: MapPin,
      fields: ['Vehículo', 'Conductor', 'Ruta', 'Citas', 'KM Recorridos', 'Tiempo Total', 'Combustible Usado'],
      filters: ['Fecha', 'Vehículo', 'Zona'],
      frequency: 'Diario',
      format: 'xlsx',
      color: 'green'
    },
    {
      id: 'services-performance',
      name: 'Rendimiento por Tipo de Servicio',
      description: 'Servicios más solicitados, rentabilidad y tendencias',
      category: 'operational',
      icon: TrendingUp,
      fields: ['Servicio', 'Cantidad', 'Ingresos Totales', 'Precio Promedio', 'Costo Promedio', 'Margen', 'Tendencia'],
      filters: ['Rango de fechas', 'Categoría'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'purple'
    },

    // ========== CLIENTES ==========
    {
      id: 'clients-master',
      name: 'Base de Datos Maestra de Clientes',
      description: 'Listado completo con todos los datos de contacto y mascotas',
      category: 'client',
      icon: Users,
      fields: ['ID', 'Nombre Completo', 'DNI/NIF', 'Email', 'Teléfono 1', 'Teléfono 2', 'Dirección', 'Distrito', 'Zona', 'Mascotas', 'Fecha Registro', 'Última Cita', 'Total Gastado', 'Nivel'],
      filters: ['Estado', 'Nivel', 'Zona', 'Fecha registro'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'indigo'
    },
    {
      id: 'clients-active',
      name: 'Clientes Activos',
      description: 'Clientes con citas en últimos 3/6/12 meses',
      category: 'client',
      icon: CheckCircle,
      fields: ['Cliente', 'Última Cita', 'Total Citas', 'Frecuencia Promedio', 'Valor Lifetime', 'Próxima Cita'],
      filters: ['Período actividad', 'Frecuencia'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'green'
    },
    {
      id: 'clients-inactive',
      name: 'Clientes Inactivos / Churn',
      description: 'Clientes sin actividad reciente para reactivación',
      category: 'client',
      icon: UserX,
      fields: ['Cliente', 'Última Cita', 'Días Inactivo', 'Total Citas Históricas', 'Total Gastado', 'Email', 'Teléfono'],
      filters: ['Días inactividad', 'Valor histórico'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'red'
    },
    {
      id: 'clients-birthdays',
      name: 'Cumpleaños de Clientes y Mascotas',
      description: 'Calendario de cumpleaños para campañas',
      category: 'client',
      icon: Activity,
      fields: ['Nombre', 'Tipo (Cliente/Mascota)', 'Fecha Cumpleaños', 'Email', 'Teléfono', 'Preferencias'],
      filters: ['Mes', 'Tipo'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'pink'
    },
    {
      id: 'pets-master',
      name: 'Registro Completo de Mascotas',
      description: 'Todas las mascotas con historial médico y servicios',
      category: 'client',
      icon: Shield,
      fields: ['ID Mascota', 'Nombre', 'Propietario', 'Especie', 'Raza', 'Edad', 'Peso', 'Sexo', 'Chip', 'Vacunas', 'Última Desparasitación', 'Comportamiento', 'Alergias'],
      filters: ['Especie', 'Tamaño', 'Estado vacunas'],
      frequency: 'Trimestral',
      format: 'xlsx',
      color: 'teal'
    },

    // ========== FINANCIEROS ==========
    {
      id: 'financial-income-statement',
      name: 'Estado de Resultados Consolidado',
      description: 'P&L completo con ingresos, costos y gastos',
      category: 'financial',
      icon: DollarSign,
      fields: ['Cuenta', 'Descripción', 'Debe', 'Haber', 'Saldo', 'Tipo'],
      filters: ['Rango de fechas', 'Tipo de cuenta'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'green'
    },
    {
      id: 'financial-income-by-vehicle',
      name: 'Estado de Resultados por Vehículo',
      description: 'P&L individual de cada unidad móvil',
      category: 'financial',
      icon: Truck,
      fields: ['Vehículo', 'Ingresos', 'Costos Directos', 'Gastos Operativos', 'Utilidad Bruta', 'Utilidad Neta', 'Margen %', 'EBITDA'],
      filters: ['Rango de fechas', 'Vehículo'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'emerald'
    },
    {
      id: 'financial-cash-flow',
      name: 'Flujo de Caja',
      description: 'Movimientos de efectivo detallados',
      category: 'financial',
      icon: Activity,
      fields: ['Fecha', 'Concepto', 'Tipo', 'Ingreso', 'Egreso', 'Saldo', 'Forma Pago', 'Vehículo', 'Categoría'],
      filters: ['Rango de fechas', 'Tipo movimiento', 'Categoría'],
      frequency: 'Diario/Semanal',
      format: 'xlsx',
      color: 'blue'
    },
    {
      id: 'financial-invoices',
      name: 'Registro de Facturas Emitidas',
      description: 'Todas las facturas con estado de cobro',
      category: 'financial',
      icon: Receipt,
      fields: ['Nº Factura', 'Fecha', 'Cliente', 'Conceptos', 'Subtotal', 'IVA', 'Total', 'Estado Pago', 'Fecha Cobro', 'Forma Pago'],
      filters: ['Rango de fechas', 'Estado pago', 'Cliente'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'yellow'
    },
    {
      id: 'financial-pending-payments',
      name: 'Cuentas por Cobrar',
      description: 'Facturas pendientes de pago y antigüedad',
      category: 'financial',
      icon: AlertTriangle,
      fields: ['Nº Factura', 'Cliente', 'Email', 'Teléfono', 'Monto', 'Fecha Emisión', 'Días Vencidos', 'Acciones'],
      filters: ['Antigüedad', 'Monto'],
      frequency: 'Semanal',
      format: 'xlsx',
      color: 'red'
    },
    {
      id: 'financial-expenses',
      name: 'Gastos Operativos Detallados',
      description: 'Todos los gastos clasificados por categoría',
      category: 'financial',
      icon: TrendingUp,
      fields: ['Fecha', 'Categoría', 'Subcategoría', 'Descripción', 'Proveedor', 'Monto', 'Vehículo', 'Forma Pago', 'Comprobante'],
      filters: ['Rango de fechas', 'Categoría', 'Vehículo'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'orange'
    },

    // ========== INVENTARIO ==========
    {
      id: 'inventory-stock',
      name: 'Inventario Actual',
      description: 'Stock actual de todos los productos',
      category: 'inventory',
      icon: Package,
      fields: ['SKU', 'Producto', 'Categoría', 'Stock Actual', 'Stock Mínimo', 'Valor Unitario', 'Valor Total', 'Ubicación', 'Estado'],
      filters: ['Categoría', 'Stock bajo', 'Ubicación'],
      frequency: 'Semanal',
      format: 'xlsx',
      color: 'purple'
    },
    {
      id: 'inventory-movements',
      name: 'Kardex - Movimientos de Inventario',
      description: 'Todos los movimientos (entradas, salidas, ajustes)',
      category: 'inventory',
      icon: Activity,
      fields: ['Fecha', 'Producto', 'Tipo Movimiento', 'Cantidad', 'Precio', 'Total', 'Responsable', 'Documento', 'Saldo'],
      filters: ['Rango de fechas', 'Tipo movimiento', 'Producto'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'indigo'
    },
    {
      id: 'inventory-low-stock',
      name: 'Productos con Stock Bajo',
      description: 'Alerta de productos bajo mínimo para reposición',
      category: 'inventory',
      icon: AlertTriangle,
      fields: ['Producto', 'Stock Actual', 'Stock Mínimo', 'Déficit', 'Último Pedido', 'Proveedor', 'Acción Sugerida'],
      filters: ['Criticidad'],
      frequency: 'Diario',
      format: 'xlsx',
      color: 'red'
    },
    {
      id: 'inventory-purchases',
      name: 'Historial de Compras',
      description: 'Todas las compras a proveedores',
      category: 'inventory',
      icon: DollarSign,
      fields: ['Fecha', 'Proveedor', 'Producto', 'Cantidad', 'Precio Unitario', 'Total', 'Forma Pago', 'Estado Entrega'],
      filters: ['Rango de fechas', 'Proveedor', 'Estado'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'green'
    },

    // ========== PERSONAL ==========
    {
      id: 'staff-roster',
      name: 'Nómina de Personal',
      description: 'Listado completo de empleados con datos',
      category: 'staff',
      icon: Users,
      fields: ['ID', 'Nombre', 'Puesto', 'DNI', 'Email', 'Teléfono', 'Fecha Ingreso', 'Vehículo Asignado', 'Salario', 'Estado'],
      filters: ['Puesto', 'Estado', 'Vehículo'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'blue'
    },
    {
      id: 'staff-performance',
      name: 'Rendimiento por Empleado',
      description: 'KPIs individuales (servicios, calificación, puntualidad)',
      category: 'staff',
      icon: BarChart3,
      fields: ['Empleado', 'Servicios Realizados', 'Calificación Promedio', 'Puntualidad %', 'Ingresos Generados', 'Eficiencia'],
      filters: ['Rango de fechas', 'Puesto'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'purple'
    },
    {
      id: 'staff-attendance',
      name: 'Registro de Asistencia',
      description: 'Control de horarios, faltas y permisos',
      category: 'staff',
      icon: Clock,
      fields: ['Fecha', 'Empleado', 'Entrada', 'Salida', 'Horas Trabajadas', 'Estado', 'Notas'],
      filters: ['Rango de fechas', 'Empleado', 'Estado'],
      frequency: 'Quincenal',
      format: 'xlsx',
      color: 'teal'
    },

    // ========== AUDITORÍA E INTEGRIDAD ==========
    {
      id: 'audit-duplicates-clients',
      name: '🔍 Clientes Duplicados',
      description: 'Detecta clientes con DNI, email o teléfono repetidos',
      category: 'audit',
      icon: AlertTriangle,
      fields: ['Cliente 1', 'Cliente 2', 'Campo Duplicado', 'Valor', 'Fecha Registro 1', 'Fecha Registro 2', 'Total Citas 1', 'Total Citas 2', 'Acción Sugerida'],
      filters: ['Tipo duplicado', 'Gravedad'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'red'
    },
    {
      id: 'audit-duplicates-pets',
      name: '🔍 Mascotas Duplicadas',
      description: 'Mascotas con chip repetido o nombres sospechosos',
      category: 'audit',
      icon: Shield,
      fields: ['Mascota 1', 'Propietario 1', 'Mascota 2', 'Propietario 2', 'Campo Duplicado', 'Valor', 'Acción'],
      filters: ['Tipo duplicado'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'orange'
    },
    {
      id: 'audit-invalid-emails',
      name: '🔍 Emails Inválidos o Sospechosos',
      description: 'Detecta emails con formato incorrecto o dominios inválidos',
      category: 'audit',
      icon: Mail,
      fields: ['Cliente', 'Email', 'Problema Detectado', 'Teléfono Alternativo', 'Última Cita', 'Acción'],
      filters: ['Tipo problema'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'yellow'
    },
    {
      id: 'audit-invalid-phones',
      name: '🔍 Teléfonos Inválidos',
      description: 'Números con formato incorrecto o incompletos',
      category: 'audit',
      icon: Phone,
      fields: ['Cliente', 'Teléfono Registrado', 'Problema', 'Email Alternativo', 'Última Cita', 'Acción'],
      filters: ['Tipo problema'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'yellow'
    },
    {
      id: 'audit-incomplete-records',
      name: '🔍 Registros Incompletos',
      description: 'Clientes o mascotas con datos faltantes críticos',
      category: 'audit',
      icon: FileCheck,
      fields: ['Tipo Registro', 'ID', 'Nombre', 'Campos Faltantes', 'Criticidad', 'Última Actualización', 'Acción'],
      filters: ['Tipo', 'Criticidad'],
      frequency: 'Semanal',
      format: 'xlsx',
      color: 'orange'
    },
    {
      id: 'audit-pricing-anomalies',
      name: '🔍 Anomalías de Precios',
      description: 'Servicios facturados fuera del rango normal',
      category: 'audit',
      icon: DollarSign,
      fields: ['Fecha', 'Cliente', 'Servicio', 'Precio Cobrado', 'Precio Estándar', 'Diferencia %', 'Usuario', 'Justificación'],
      filters: ['% diferencia', 'Rango de fechas'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'red'
    },
    {
      id: 'audit-cancelled-appointments',
      name: '🔍 Patrones de Cancelación',
      description: 'Detecta cancelaciones sospechosas o recurrentes',
      category: 'audit',
      icon: AlertTriangle,
      fields: ['Cliente', 'Total Cancelaciones', '% Cancelación', 'Última Cancelación', 'Motivo Frecuente', 'Patrón', 'Acción'],
      filters: ['% cancelación', 'Patrón'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'orange'
    },
    {
      id: 'audit-inventory-discrepancies',
      name: '🔍 Discrepancias de Inventario',
      description: 'Diferencias entre stock teórico y físico',
      category: 'audit',
      icon: Package,
      fields: ['Producto', 'Stock Sistema', 'Stock Físico', 'Diferencia', 'Valor Diferencia', 'Última Auditoría', 'Responsable'],
      filters: ['Criticidad', 'Valor'],
      frequency: 'Mensual',
      format: 'xlsx',
      color: 'red'
    },
    {
      id: 'audit-system-logs',
      name: '🔍 Logs de Auditoría del Sistema',
      description: 'Registro de acciones críticas y cambios',
      category: 'audit',
      icon: Database,
      fields: ['Fecha/Hora', 'Usuario', 'Acción', 'Módulo', 'Registro Afectado', 'Valores Anteriores', 'Valores Nuevos', 'IP'],
      filters: ['Rango de fechas', 'Usuario', 'Acción'],
      frequency: 'Diario',
      format: 'xlsx',
      color: 'gray'
    }
  ];

  // Filtrar informes
  const filteredReports = reports.filter(report => {
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Contar por categoría
  const categoryCounts = {
    all: reports.length,
    operational: reports.filter(r => r.category === 'operational').length,
    financial: reports.filter(r => r.category === 'financial').length,
    client: reports.filter(r => r.category === 'client').length,
    inventory: reports.filter(r => r.category === 'inventory').length,
    staff: reports.filter(r => r.category === 'staff').length,
    audit: reports.filter(r => r.category === 'audit').length
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'operational': return 'blue';
      case 'financial': return 'green';
      case 'client': return 'purple';
      case 'inventory': return 'orange';
      case 'staff': return 'teal';
      case 'audit': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'operational': return Activity;
      case 'financial': return DollarSign;
      case 'client': return Users;
      case 'inventory': return Package;
      case 'staff': return Users;
      case 'audit': return AlertTriangle;
      default: return FileText;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
          📊 Informes y Exportaciones
        </h1>
        <p className="text-muted-foreground text-lg mt-1">
          {reports.length} informes disponibles para exportación en Excel
        </p>
      </div>

      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Exportación con datos reales</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Los informes marcados con «Datos reales» consultan el servidor según el rango de fechas.
          El resto del catálogo se irá conectando en próximas versiones.
        </AlertDescription>
      </Alert>

      {/* Alerta de Auditoría */}
      <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-300">Informes de Auditoría Disponibles</AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-400">
          Se han agregado {categoryCounts.audit} informes de auditoría para detectar duplicados, errores de datos y anomalías.
          Recomendamos ejecutarlos mensualmente para mantener la integridad del sistema.
        </AlertDescription>
      </Alert>

      {/* Filtros y búsqueda */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label>Buscar informe</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label>Fecha inicio</Label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div>
            <Label>Fecha fin</Label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Tabs por categoría */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">
            Todos ({categoryCounts.all})
          </TabsTrigger>
          <TabsTrigger value="operational">
            Operacional ({categoryCounts.operational})
          </TabsTrigger>
          <TabsTrigger value="financial">
            Financiero ({categoryCounts.financial})
          </TabsTrigger>
          <TabsTrigger value="client">
            Clientes ({categoryCounts.client})
          </TabsTrigger>
          <TabsTrigger value="inventory">
            Inventario ({categoryCounts.inventory})
          </TabsTrigger>
          <TabsTrigger value="staff">
            Personal ({categoryCounts.staff})
          </TabsTrigger>
          <TabsTrigger value="audit">
            🔍 Auditoría ({categoryCounts.audit})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => {
              const Icon = report.icon;
              return (
                <Card key={report.id} className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg bg-${report.color}-100 dark:bg-${report.color}-900/30 flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 text-${report.color}-600`} />
                    </div>
                    <Badge variant="outline" className={`text-${report.color}-600`}>
                      {report.format.toUpperCase()}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{report.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {report.description}
                  </p>

                  <Separator className="my-3" />

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Database className="h-3 w-3" />
                      <span>{report.fields.length} campos</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Filter className="h-3 w-3" />
                      <span>{report.filters.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Frecuencia: {report.frequency}</span>
                    </div>
                  </div>

                  {REPORTS_WITH_API.has(report.id) && (
                    <Badge className="mb-2 bg-green-100 text-green-800 border-green-200">
                      Datos reales
                    </Badge>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      size="sm"
                      disabled={exportingId === report.id}
                      onClick={() => exportToExcel(report.id, report.name)}
                    >
                      {exportingId === report.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={exportingId === report.id}
                      onClick={() => exportToCSV(report.id, report.name)}
                    >
                      CSV
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredReports.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold">No se encontraron informes</p>
              <p className="text-sm text-muted-foreground">
                Intenta con otros términos de búsqueda o cambia de categoría
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Resumen rápido */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">📌 Informes Recomendados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold">Auditoría Mensual</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Ejecuta estos informes mensualmente
            </p>
            <ul className="text-xs space-y-1">
              <li>• Clientes duplicados</li>
              <li>• Emails inválidos</li>
              <li>• Anomalías de precios</li>
              <li>• Discrepancias de inventario</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold">Cierre Mensual</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Para contabilidad y finanzas
            </p>
            <ul className="text-xs space-y-1">
              <li>• Estado de resultados</li>
              <li>• Flujo de caja</li>
              <li>• Facturas emitidas</li>
              <li>• Cuentas por cobrar</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold">Marketing</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Para campañas y retención
            </p>
            <ul className="text-xs space-y-1">
              <li>• Clientes inactivos</li>
              <li>• Cumpleaños del mes</li>
              <li>• Clientes activos</li>
              <li>• Patrones de cancelación</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}