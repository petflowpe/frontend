import { useState, useEffect } from 'react';
import { Book, Download, Filter, Calendar, FileText, DollarSign, TrendingUp, TrendingDown, Eye, Printer, RefreshCw } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { sunatService } from '../services/sunatService';

export function ElectronicBooks() {
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [selectedBook, setSelectedBook] = useState<'ventas' | 'compras' | 'diario' | 'mayor'>('ventas');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allRecords = await sunatService.getAllRecords();
      setRecords(allRecords);
    } catch (error) {
      toast.error('Error al cargar datos de libros');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRegistros = () => {
    const [year, month] = selectedPeriod.split('-');
    return records.filter(record => {
      const recordDate = new Date(record.fecha_emision);
      return recordDate.getFullYear().toString() === year &&
        (recordDate.getMonth() + 1).toString().padStart(2, '0') === month;
    });
  };

  const registros = getFilteredRegistros();

  const renderRegistroVentas = () => {
    const ventas = registros.filter(r => r.tipo_documento === '01' || r.tipo_documento === '03');
    let totalBase = 0;
    let totalIgv = 0;
    let totalTotal = 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Registro de Ventas e Ingresos</h3>
            <p className="text-sm text-muted-foreground">Período: {selectedPeriod}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Download className="w-4 h-4 mr-2" />Excel</Button>
            <Button variant="outline"><FileText className="w-4 h-4 mr-2" />PLE</Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">Fecha</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Número</TableHead>
                <TableHead className="text-xs">Razón Social</TableHead>
                <TableHead className="text-xs text-right">Base Imp.</TableHead>
                <TableHead className="text-xs text-right">IGV</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {loading ? 'Cargando...' : 'No hay registros'}
                  </TableCell>
                </TableRow>
              ) : (
                ventas.map((venta, index) => {
                  totalBase += parseFloat(venta.mto_oper_gravadas) || 0;
                  totalIgv += parseFloat(venta.mto_igv) || 0;
                  totalTotal += parseFloat(venta.mto_imp_venta) || 0;
                  return (
                    <TableRow key={index}>
                      <TableCell className="text-xs">{venta.fecha_emision}</TableCell>
                      <TableCell className="text-xs">{venta.tipo_documento === '01' ? 'FACT' : 'BOL'}</TableCell>
                      <TableCell className="text-xs font-mono">{venta.numero_completo}</TableCell>
                      <TableCell className="text-xs">{venta.client?.razon_social || 'N/A'}</TableCell>
                      <TableCell className="text-xs text-right">S/ {parseFloat(venta.mto_oper_gravadas).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right">S/ {parseFloat(venta.mto_igv).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right font-semibold">S/ {parseFloat(venta.mto_imp_venta).toFixed(2)}</TableCell>
                      <TableCell className="text-xs">{venta.estado_sunat}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {ventas.length > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-xs">Total Base</p><p className="text-lg font-bold">S/ {totalBase.toFixed(2)}</p></div>
              <div><p className="text-xs">Total IGV</p><p className="text-lg font-bold">S/ {totalIgv.toFixed(2)}</p></div>
              <div><p className="text-xs">Total General</p><p className="text-lg font-bold text-blue-600">S/ {totalTotal.toFixed(2)}</p></div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Libros Electrónicos</h2>
          <p className="text-sm text-muted-foreground">Registros contables según normativa SUNAT</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <div className="space-y-1">
            <Label className="text-xs">Período</Label>
            <Input type="month" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="w-[180px]" />
          </div>
        </div>
      </div>

      <Tabs value={selectedBook} onValueChange={(v: any) => setSelectedBook(v)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ventas"><TrendingUp className="w-4 h-4 mr-2" />Ventas</TabsTrigger>
          <TabsTrigger value="compras"><TrendingDown className="w-4 h-4 mr-2" />Compras</TabsTrigger>
          <TabsTrigger value="diario"><FileText className="w-4 h-4 mr-2" />Diario</TabsTrigger>
          <TabsTrigger value="mayor"><Book className="w-4 h-4 mr-2" />Mayor</TabsTrigger>
        </TabsList>
        <TabsContent value="ventas" className="mt-6">{renderRegistroVentas()}</TabsContent>
        <TabsContent value="compras" className="mt-6"><Card className="p-8 text-center text-muted-foreground">Módulo de Compras en desarrollo</Card></TabsContent>
        <TabsContent value="diario" className="mt-6"><Card className="p-8 text-center text-muted-foreground">Libro Diario en desarrollo</Card></TabsContent>
        <TabsContent value="mayor" className="mt-6"><Card className="p-8 text-center text-muted-foreground">Libro Mayor en desarrollo</Card></TabsContent>
      </Tabs>
    </div>
  );
}
