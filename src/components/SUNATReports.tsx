import { useState, useEffect } from 'react';
import { FileText, Download, Calculator, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { sunatService } from '../services/sunatService';
import { usePurchases } from '../hooks/usePurchases';

export function SUNATReports() {
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().substring(0, 7));
  const [igvData, setIgvData] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const { purchases } = usePurchases();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allRecords = await sunatService.getAllRecords();
      setRecords(allRecords);
    } catch (error) {
      console.error('Error fetching records for reports:', error);
    }
  };

  // Calcular IGV del período (ventas desde comprobantes SUNAT + compras desde órdenes de compra)
  const calculateIGV = () => {
    setCalculating(true);

    setTimeout(() => {
      const [year, month] = selectedPeriod.split('-');

      // Filtrar registros del período (ventas)
      const periodRecords = records.filter(record => {
        const recordDate = new Date(record.fecha_emision);
        return recordDate.getFullYear().toString() === year &&
          (recordDate.getMonth() + 1).toString().padStart(2, '0') === month;
      });

      // Calcular ventas
      const ventas = periodRecords.filter(r =>
        r.tipo_documento === '01' || r.tipo_documento === '03'
      );

      const totalVentasGravadas = ventas.reduce((sum, v) => sum + (parseFloat(v.mto_oper_gravadas) || 0), 0);
      const totalIGVVentas = ventas.reduce((sum, v) => sum + (parseFloat(v.mto_igv) || 0), 0);
      const totalVentas = ventas.reduce((sum, v) => sum + (parseFloat(v.mto_imp_venta) || 0), 0);

      // Compras reales: órdenes de compra del período (completadas/entregadas con total)
      const comprasPeriodo = purchases.filter(p => {
        const d = p.order_date || p.date || '';
        if (!d) return false;
        const [y, m] = d.substring(0, 7).split('-');
        return y === year && m === month && (p.status === 'delivered' || p.status === 'in_transit');
      });
      const totalCompras = comprasPeriodo.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
      const totalComprasGravadas = totalCompras / 1.18;
      const totalIGVCompras = totalCompras - totalComprasGravadas;

      const igvPorPagar = totalIGVVentas - totalIGVCompras;

      setIgvData({
        periodo: selectedPeriod,
        ventas: {
          baseImponible: totalVentasGravadas,
          igv: totalIGVVentas,
          total: totalVentas,
          cantidad: ventas.length
        },
        compras: {
          baseImponible: totalComprasGravadas,
          igv: totalIGVCompras,
          cantidad: comprasPeriodo.length
        },
        resumen: {
          igvVentas: totalIGVVentas,
          igvCompras: totalIGVCompras,
          saldoFavor: igvPorPagar < 0 ? Math.abs(igvPorPagar) : 0,
          igvPorPagar: igvPorPagar > 0 ? igvPorPagar : 0
        }
      });

      setCalculating(false);
      toast.success('✓ Cálculo completado');
    }, 1000);
  };

  const generatePDT621 = () => {
    if (!igvData) {
      toast.error('Primero debe calcular el IGV del período');
      return;
    }
    toast.success('Generando PDT 621...');
  };

  const renderDeclaracionMensual = () => {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">PDT 621 - IGV Renta Mensual</h3>
              <p className="text-sm text-muted-foreground">Declaración mensual de IGV e Impuesto a la Renta</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Período</Label>
              <Input
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-[180px]"
              />
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Button onClick={calculateIGV} disabled={calculating}>
              <Calculator className="w-4 h-4 mr-2" />
              {calculating ? 'Calculando...' : 'Calcular IGV'}
            </Button>
            <Button variant="outline" onClick={generatePDT621} disabled={!igvData}>
              <Download className="w-4 h-4 mr-2" />
              Generar PDT 621
            </Button>
          </div>

          {igvData && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Ventas del Período</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-green-700">Base Imponible</p>
                    <p className="text-xl font-bold text-green-900">S/ {igvData.ventas.baseImponible.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">IGV Ventas</p>
                    <p className="text-xl font-bold text-green-900">S/ {igvData.ventas.igv.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700">Total Ventas</p>
                    <p className="text-xl font-bold text-green-900">S/ {igvData.ventas.total.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-xs text-green-700 mt-2">{igvData.ventas.cantidad} comprobantes emitidos</p>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Compras del Período</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-700">Base Imponible</p>
                    <p className="text-xl font-bold text-blue-900">S/ {igvData.compras.baseImponible.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">IGV Compras</p>
                    <p className="text-xl font-bold text-blue-900">S/ {igvData.compras.igv.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="border-2 rounded-lg p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <h4 className="font-bold text-lg text-purple-900 mb-4">Resumen de Declaración</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700">IGV Ventas:</span>
                      <span className="font-semibold text-purple-900">S/ {igvData.resumen.igvVentas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700">IGV Compras:</span>
                      <span className="font-semibold text-purple-900">-S/ {igvData.resumen.igvCompras.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-semibold text-purple-900">Saldo:</span>
                      <span className="font-bold text-lg text-purple-900">S/ {(igvData.resumen.igvVentas - igvData.resumen.igvCompras).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {igvData.resumen.igvPorPagar > 0 ? (
                      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold text-red-900">IGV por Pagar</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">S/ {igvData.resumen.igvPorPagar.toFixed(2)}</p>
                      </div>
                    ) : (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-900">Saldo a Favor</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">S/ {igvData.resumen.saldoFavor.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!igvData && (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Seleccione un período y haga clic en "Calcular IGV"</p>
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderImpuestoRenta = () => {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Impuesto a la Renta Mensual</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Régimen General</h4>
              <p className="text-sm text-muted-foreground">Tasa: 29.5% | Pago a cuenta: 1.5%</p>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Régimen MYPE</h4>
              <p className="text-sm text-muted-foreground">Hasta 15 UIT: 10% | +15 UIT: 29.5%</p>
            </Card>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reportes SUNAT</h2>
        <p className="text-sm text-muted-foreground">Declaraciones mensuales y cálculo de impuestos</p>
      </div>

      <Tabs defaultValue="declaracion">
        <TabsList>
          <TabsTrigger value="declaracion"><FileText className="w-4 h-4 mr-2" />Declaración Mensual</TabsTrigger>
          <TabsTrigger value="renta"><DollarSign className="w-4 h-4 mr-2" />Impuesto a la Renta</TabsTrigger>
        </TabsList>
        <TabsContent value="declaracion" className="mt-6">{renderDeclaracionMensual()}</TabsContent>
        <TabsContent value="renta" className="mt-6">{renderImpuestoRenta()}</TabsContent>
      </Tabs>
    </div>
  );
}
