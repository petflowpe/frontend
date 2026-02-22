import { useMemo } from 'react';
import { Book, TrendingUp, TrendingDown, DollarSign, Calendar, FileText, Car, Store, Package, Loader2, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { useAccountingEntries } from '../hooks/useAccountingEntries';

export function Accounting() {
  const { entries: accountingEntries, loading, fetchEntries } = useAccountingEntries({ per_page: 100, autoFetch: true });

  // Estado de resultados calculado desde asientos (ingresos vs costos por punto de venta o global)
  const incomeStatementByVehicle = useMemo(() => {
    const byKey: Record<string, { puntoVenta: { tipo: string; nombre: string; placa: string | null }; ventas: number; costoVentas: number }> = {};
    for (const entry of accountingEntries) {
      const key = entry.puntoVenta.nombre || 'Sistema';
      if (!byKey[key]) {
        byKey[key] = { puntoVenta: { ...entry.puntoVenta }, ventas: 0, costoVentas: 0 };
      }
      if (entry.tipo === 'ingreso') byKey[key].ventas += entry.totales.debe;
      if (entry.tipo === 'costo' || entry.tipo === 'gasto') byKey[key].costoVentas += entry.totales.debe;
    }
    return Object.values(byKey).map((item) => ({
      ...item,
      utilidadBruta: item.ventas - item.costoVentas,
      margen: item.ventas > 0 ? ((item.ventas - item.costoVentas) / item.ventas) * 100 : 0,
    }));
  }, [accountingEntries]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ingreso': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'costo': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'gasto': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'ingreso': return 'Ingreso';
      case 'costo': return 'Costo';
      case 'gasto': return 'Gasto';
      default: return type;
    }
  };

  const getPointOfSaleIcon = (type: string) => {
    switch (type) {
      case 'vehiculo': return Car;
      case 'tienda': return Store;
      case 'almacen': return Package;
      default: return Store;
    }
  };

  const totalVentas = incomeStatementByVehicle.reduce((sum, item) => sum + item.ventas, 0);
  const totalCostos = incomeStatementByVehicle.reduce((sum, item) => sum + item.costoVentas, 0);
  const totalUtilidad = totalVentas - totalCostos;
  const margenGeneral = totalVentas > 0 ? (totalUtilidad / totalVentas * 100) : 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            📚 Contabilidad
          </h1>
          <p className="text-muted-foreground text-lg">
            Asientos contables automáticos y estados financieros por vehículo
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchEntries()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">{loading ? 'Cargando...' : 'Actualizar'}</span>
        </Button>
      </div>

      {loading && accountingEntries.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Cargando asientos contables...</span>
        </div>
      )}

      {!loading && accountingEntries.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No hay asientos contables</p>
          <p className="text-sm mt-1">Los asientos se generan desde facturas o se cargan desde el backend.</p>
          <Button variant="outline" className="mt-4" onClick={() => fetchEntries()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Recargar
          </Button>
        </Card>
      )}

      {(loading && accountingEntries.length > 0) || accountingEntries.length > 0 ? (
        <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">Ventas Totales</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {totalVentas.toFixed(2)} S/
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-2 border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">Costos Totales</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {totalCostos.toFixed(2)} S/
              </p>
            </div>
            <TrendingDown className="h-12 w-12 text-orange-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Utilidad</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {totalUtilidad.toFixed(2)} S/
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Margen</p>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {margenGeneral.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-500" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="entries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entries">📖 Libro Diario</TabsTrigger>
          <TabsTrigger value="income-statement">💰 Estado de Resultados por Vehículo</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          {accountingEntries.map((entry) => {
            const Icon = getPointOfSaleIcon(entry.puntoVenta.tipo);
            return (
              <Card key={entry.id} className="p-6 border-2">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Book className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{entry.id}</h3>
                        <Badge className={getTypeColor(entry.tipo)}>
                          {getTypeText(entry.tipo)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{entry.descripcion}</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{entry.fecha} {entry.hora}</span>
                        <span className="text-muted-foreground">•</span>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{entry.puntoVenta.nombre}</span>
                        {entry.puntoVenta.placa && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{entry.puntoVenta.placa}</span>
                          </>
                        )}
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Ref: {entry.referenciaId}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3">Cuenta</th>
                        <th className="text-right p-3">Debe</th>
                        <th className="text-right p-3">Haber</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.cuentas.map((cuenta, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{cuenta.cuenta}</td>
                          <td className="text-right p-3 font-mono">
                            {cuenta.debe > 0 ? cuenta.debe.toFixed(2) : '-'}
                          </td>
                          <td className="text-right p-3 font-mono">
                            {cuenta.haber > 0 ? cuenta.haber.toFixed(2) : '-'}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted/30 font-bold">
                        <td className="p-3">TOTALES</td>
                        <td className="text-right p-3 font-mono">{entry.totales.debe.toFixed(2)}</td>
                        <td className="text-right p-3 font-mono">{entry.totales.haber.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="income-statement" className="space-y-6">
          <div className="space-y-4">
            {incomeStatementByVehicle.map((statement, index) => {
              const Icon = getPointOfSaleIcon(statement.puntoVenta.tipo);
              return (
                <Card key={index} className="p-6 border-2">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{statement.puntoVenta.nombre}</h3>
                      {statement.puntoVenta.placa && (
                        <p className="text-sm text-muted-foreground">Placa: {statement.puntoVenta.placa}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <span className="font-semibold text-green-700 dark:text-green-300">Ventas</span>
                      <span className="font-bold text-lg text-green-700 dark:text-green-300">
                        {statement.ventas.toFixed(2)} S/
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                      <span className="font-semibold text-orange-700 dark:text-orange-300">(-) Costo de Ventas</span>
                      <span className="font-bold text-lg text-orange-700 dark:text-orange-300">
                        {statement.costoVentas.toFixed(2)} S/
                      </span>
                    </div>

                    <div className="h-px bg-border my-2"></div>

                    <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                      <span className="font-bold text-blue-700 dark:text-blue-300">Utilidad Bruta</span>
                      <div className="text-right">
                        <span className="font-bold text-2xl text-blue-700 dark:text-blue-300">
                          {statement.utilidadBruta.toFixed(2)} S/
                        </span>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Margen: {statement.margen.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Resumen General */}
          <Card className="p-6 border-2 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-300 dark:border-purple-700">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-purple-600" />
              Resumen General
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                <span className="font-semibold">Total Ventas</span>
                <span className="font-bold text-lg text-green-600">
                  {totalVentas.toFixed(2)} S/
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                <span className="font-semibold">(-) Total Costos</span>
                <span className="font-bold text-lg text-orange-600">
                  {totalCostos.toFixed(2)} S/
                </span>
              </div>

              <div className="h-px bg-border my-2"></div>

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                <span className="font-bold text-lg">Utilidad Total</span>
                <div className="text-right">
                  <span className="font-bold text-3xl text-purple-700 dark:text-purple-300">
                    {totalUtilidad.toFixed(2)} S/
                  </span>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Margen General: {margenGeneral.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
        </>
      ) : null}
    </div>
  );
}
