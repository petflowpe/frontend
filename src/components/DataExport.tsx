/**
 * Sistema de Exportación de Datos
 * Permite exportar toda la información del sistema para backups
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, Database, FileJson, FileSpreadsheet, File, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { fetchExportDataset, defaultDateRange, type ExportDataset } from '../services/exportService';

// Importación condicional de XLSX (solo se usa si está instalado)
let XLSX: any = null;
try {
  XLSX = require('xlsx');
} catch (e) {
  console.warn('XLSX no instalado. Ejecuta: npm install xlsx');
}

// Helper para formatear fechas sin date-fns si no está instalado
const format = (date: Date, formatStr: string): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  
  if (formatStr === 'yyyy-MM-dd-HHmmss') {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }
  if (formatStr === 'yyyy-MM-dd') {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  return date.toISOString().split('T')[0];
};

// Icono Loader2 simple
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

type ExportFormat = 'json' | 'csv' | 'excel' | 'pdf';
type DataTable = 
  | 'clients'
  | 'appointments'
  | 'invoices'
  | 'products'
  | 'services'
  | 'pets'
  | 'staff'
  | 'vehicles'
  | 'routes';

interface ExportConfig {
  tables: DataTable[];
  format: ExportFormat;
  includeHistory: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

/**
 * Componente principal de exportación
 */
export const DataExport = () => {
  const [config, setConfig] = useState<ExportConfig>({
    tables: [],
    format: 'json',
    includeHistory: true
  });

  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dateRange, setDateRange] = useState(() => {
    const r = defaultDateRange();
    return { from: r.date_from, to: r.date_to };
  });

  // Definir tablas disponibles
  const availableTables: Array<{
    id: DataTable;
    label: string;
    description: string;
    icon: any;
    estimatedRows: number;
  }> = [
    { id: 'clients', label: 'Clientes', description: 'Información de clientes', icon: '👤', estimatedRows: 0 },
    { id: 'pets', label: 'Mascotas', description: 'Datos de mascotas', icon: '🐕', estimatedRows: 0 },
    { id: 'appointments', label: 'Citas', description: 'Historial de citas', icon: '📅', estimatedRows: 0 },
    { id: 'invoices', label: 'Facturas', description: 'Facturas emitidas', icon: '💰', estimatedRows: 0 },
    { id: 'products', label: 'Productos', description: 'Catálogo de productos', icon: '📦', estimatedRows: 0 },
    { id: 'services', label: 'Servicios', description: 'Catálogo de servicios', icon: '✂️', estimatedRows: 0 },
    { id: 'staff', label: 'Personal', description: 'Usuarios de la empresa', icon: '👔', estimatedRows: 0 },
    { id: 'vehicles', label: 'Vehículos', description: 'Flota de vehículos', icon: '🚗', estimatedRows: 0 },
    { id: 'routes', label: 'Rutas', description: 'Planificación de rutas', icon: '🗺️', estimatedRows: 0 },
  ];

  /**
   * Seleccionar/deseleccionar todas las tablas
   */
  const toggleAllTables = () => {
    if (config.tables.length === availableTables.length) {
      setConfig({ ...config, tables: [] });
    } else {
      setConfig({ ...config, tables: availableTables.map(t => t.id) });
    }
  };

  /**
   * Toggle tabla individual
   */
  const toggleTable = (tableId: DataTable) => {
    const newTables = config.tables.includes(tableId)
      ? config.tables.filter(t => t !== tableId)
      : [...config.tables, tableId];
    
    setConfig({ ...config, tables: newTables });
  };

  /**
   * Ejecutar exportación
   */
  const handleExport = async () => {
    if (config.tables.length === 0) {
      toast.error('Selecciona al menos una tabla para exportar');
      return;
    }

    setExporting(true);
    setProgress(0);

    try {
      const exportData: any = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        system: 'SmartPet',
        tables: {}
      };

      // Exportar cada tabla seleccionada
      for (let i = 0; i < config.tables.length; i++) {
        const tableId = config.tables[i];
        setProgress(((i + 1) / config.tables.length) * 100);

        exportData.tables[tableId] = await fetchTableData(tableId, dateRange);
      }

      // Generar archivo según formato
      if (config.format === 'json') {
        downloadJSON(exportData);
      } else if (config.format === 'csv') {
        downloadAllCSV(exportData.tables);
      } else if (config.format === 'excel') {
        await downloadExcel(exportData.tables);
      } else if (config.format === 'pdf') {
        await downloadPDF(exportData);
      }

      toast.success('Exportación completada', {
        description: `${config.tables.length} tabla(s) exportadas exitosamente`
      });
    } catch (error: any) {
      toast.error('Error al exportar', {
        description: error.message
      });
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  /**
   * Exportación rápida (todas las tablas en JSON)
   */
  const handleQuickExport = async () => {
    setConfig({
      ...config,
      tables: availableTables.map(t => t.id),
      format: 'json'
    });

    // Trigger export después de 100ms
    setTimeout(() => {
      handleExport();
    }, 100);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Database className="h-6 w-6" />
                Exportación de Datos
              </CardTitle>
              <CardDescription className="mt-2">
                Exporta tu información para backups o migración
              </CardDescription>
            </div>

            <Button
              variant="outline"
              onClick={handleQuickExport}
              disabled={exporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportación Rápida
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Los datos se obtienen del servidor (máx. 5 000 filas por tabla). Guarde el archivo en un lugar seguro.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Desde</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div>
              <Label>Hasta</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            El rango aplica a citas, facturas y rutas. Clientes, mascotas y catálogos exportan el estado actual.
          </p>

          {/* Selección de tablas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Seleccionar Datos</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAllTables}
              >
                {config.tables.length === availableTables.length
                  ? 'Deseleccionar todo'
                  : 'Seleccionar todo'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableTables.map(table => (
                <div
                  key={table.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    config.tables.includes(table.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => toggleTable(table.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={config.tables.includes(table.id)}
                      onCheckedChange={() => toggleTable(table.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{table.icon}</span>
                        <span className="font-semibold">{table.label}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {table.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        API en vivo
                      </p>
                    </div>
                    {config.tables.includes(table.id) && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formato de exportación */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Formato de Exportación</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <FormatOption
                format="json"
                icon={<FileJson />}
                label="JSON"
                description="Formato universal"
                selected={config.format === 'json'}
                onClick={() => setConfig({ ...config, format: 'json' })}
              />
              <FormatOption
                format="csv"
                icon={<FileSpreadsheet />}
                label="CSV"
                description="Para Excel"
                selected={config.format === 'csv'}
                onClick={() => setConfig({ ...config, format: 'csv' })}
              />
              <FormatOption
                format="excel"
                icon={<FileSpreadsheet />}
                label="Excel"
                description="Archivo .xlsx"
                selected={config.format === 'excel'}
                onClick={() => setConfig({ ...config, format: 'excel' })}
              />
              <FormatOption
                format="pdf"
                icon={<File />}
                label="PDF"
                description="Reporte visual"
                selected={config.format === 'pdf'}
                onClick={() => setConfig({ ...config, format: 'pdf' })}
                disabled
              />
            </div>
          </div>

          {/* Opciones adicionales */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Opciones Adicionales</Label>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="includeHistory"
                checked={config.includeHistory}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, includeHistory: checked as boolean })
                }
              />
              <Label htmlFor="includeHistory" className="cursor-pointer">
                Incluir historial completo (puede generar archivos grandes)
              </Label>
            </div>
          </div>

          {/* Resumen */}
          {config.tables.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold mb-2">Resumen de Exportación</h4>
              <ul className="space-y-1 text-sm">
                <li>📊 {config.tables.length} tabla(s) seleccionadas</li>
                <li>📁 Formato: {config.format.toUpperCase()}</li>
                <li>
                  📦 Registros aprox:{' '}
                  {availableTables
                    .filter(t => config.tables.includes(t.id))
                    .reduce((sum, t) => sum + t.estimatedRows, 0)
                    .toLocaleString()}
                </li>
                <li>
                  💾 Tamaño estimado:{' '}
                  {Math.round(
                    (availableTables
                      .filter(t => config.tables.includes(t.id))
                      .reduce((sum, t) => sum + t.estimatedRows, 0) *
                      0.5) /
                      1024
                  )}{' '}
                  MB
                </li>
              </ul>
            </div>
          )}

          {/* Botón de exportación */}
          <Button
            onClick={handleExport}
            disabled={exporting || config.tables.length === 0}
            className="w-full"
            size="lg"
          >
            {exporting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Exportando... {Math.round(progress)}%
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Exportar Datos
              </>
            )}
          </Button>

          {/* Barra de progreso */}
          {exporting && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Componente de opción de formato
 */
const FormatOption = ({
  format,
  icon,
  label,
  description,
  selected,
  onClick,
  disabled = false
}: {
  format: ExportFormat;
  icon: React.ReactNode;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <div
    className={`p-4 border rounded-lg cursor-pointer transition-all ${
      disabled
        ? 'opacity-50 cursor-not-allowed'
        : selected
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
    }`}
    onClick={() => !disabled && onClick()}
  >
    <div className="flex flex-col items-center text-center gap-2">
      <div className={`${selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600'}`}>
        {icon}
      </div>
      <div>
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      {disabled && (
        <span className="text-xs text-gray-400">Próximamente</span>
      )}
    </div>
  </div>
);

/**
 * Funciones de exportación
 */

const fetchTableData = async (
  tableId: DataTable,
  range: { from: string; to: string }
): Promise<Record<string, unknown>[]> => {
  const needsRange = ['appointments', 'invoices', 'routes'].includes(tableId);
  return fetchExportDataset(tableId as ExportDataset, {
    date_from: needsRange ? range.from : undefined,
    date_to: needsRange ? range.to : undefined,
  });
};

// Exportar como JSON
const downloadJSON = (data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smartpet-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Exportar como CSV (múltiples archivos)
const downloadAllCSV = (tables: Record<string, any[]>) => {
  for (const [tableName, data] of Object.entries(tables)) {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartpet-${tableName}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// Convertir array a CSV
const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(header => JSON.stringify(row[header] ?? '')).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
};

// Exportar como Excel (requiere librería)
const downloadExcel = async (tables: Record<string, any[]>) => {
  if (!XLSX) {
    toast.info('Generando archivo Excel...', {
      description: 'Esta funcionalidad requiere instalar: npm install xlsx'
    });
    return;
  }
  
  const wb = XLSX.utils.book_new();
  for (const [name, data] of Object.entries(tables)) {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  XLSX.writeFile(wb, `smartpet-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

// Exportar como PDF
const downloadPDF = async (data: any) => {
  toast.info('Generando PDF...', {
    description: 'Esta funcionalidad está en desarrollo'
  });
};

export default DataExport;