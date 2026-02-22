import { useState, useEffect } from 'react';
import { FileText, Send, Eye, Download, Printer, AlertCircle, CheckCircle, XCircle, Plus, Trash2, RefreshCw, FileX } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { sunatService } from '../services/sunatService';
import { useClients } from '../hooks/useClients';
import { useProducts } from '../hooks/useProducts';
import { apiClient } from '../utils/api/client';
import { API_URL } from '../utils/api/config';

interface InvoiceItem {
  codigo: string;
  descripcion: string;
  unidadMedida: string;
  cantidad: number;
  valorUnitario: number;
  precioUnitario: number;
  tipoIGV: '10' | '20';
  igv: number;
  totalItem: number;
}

export function ElectronicInvoicing({ companyId, branchId, companyConfig: companyConfigProp, onAnular }: { companyId?: number; branchId?: number; companyConfig?: { ruc: string; razonSocial: string; oseProvider?: string } | null; onAnular?: (record: any) => void } = {}) {
  const { clients } = useClients();
  const { products } = useProducts();
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [tipoComprobante, setTipoComprobante] = useState<'01' | '03'>('01'); // 01=Factura, 03=Boleta
  const [cliente, setCliente] = useState({
    tipoDocumento: '6' as '1' | '6', // 1=DNI, 6=RUC
    numeroDocumento: '',
    razonSocial: '',
    direccion: '',
    email: ''
  });
  const [selectedClientId, setSelectedClientId] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState({
    codigo: '',
    descripcion: '',
    cantidad: 1,
    valorUnitario: 0,
    tipoIGV: '10' as '10' | '20'
  });
  const [selectedProductId, setSelectedProductId] = useState('');

  const [sending, setSending] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Sincronizar empresa/sucursal con sunatService
  useEffect(() => {
    if (companyId != null && branchId != null) {
      sunatService.setCompanyBranch(companyId, branchId);
    }
  }, [companyId, branchId]);

  // Obtener configuración: prioridad props (desde API) > localStorage
  const company = companyConfigProp != null
    ? { razonSocial: companyConfigProp.razonSocial, ruc: companyConfigProp.ruc, oseProvider: companyConfigProp.oseProvider ?? 'otro' as const }
    : sunatService.getCompanyConfig();

  // Rellenar datos del cliente al seleccionar uno de la BD
  useEffect(() => {
    if (!selectedClientId) return;
    const c = clients.find(x => x.id === selectedClientId);
    if (c) {
      const tipoDoc = c.documentType === 'RUC' ? '6' : c.documentType === 'DNI' ? '1' : c.documentType === 'CE' ? '4' : '6';
      setCliente({
        tipoDocumento: tipoDoc as '1' | '6',
        numeroDocumento: c.documentNumber || '',
        razonSocial: c.fullName || '',
        direccion: c.address || '',
        email: c.email || ''
      });
    }
  }, [selectedClientId, clients]);

  // Rellenar item al seleccionar producto/servicio de la BD
  useEffect(() => {
    if (!selectedProductId) return;
    const p = products.find(x => x.id.toString() === selectedProductId);
    if (p) {
      const valorUnit = p.price ?? 0;
      setNewItem(prev => ({
        ...prev,
        codigo: p.code || '',
        descripcion: p.name || '',
        valorUnitario: valorUnit,
        cantidad: prev.cantidad || 1
      }));
    }
  }, [selectedProductId, products]);

  useEffect(() => {
    fetchRecords();
  }, [companyId, branchId]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const invoices = await sunatService.getInvoiceRecords('01');
      const boletas = await sunatService.getInvoiceRecords('03');
      const all = [...invoices, ...boletas].sort((a, b) =>
        new Date(b.created_at || b.fecha_emision).getTime() -
        new Date(a.created_at || a.fecha_emision).getTime()
      );
      setRecords(all);
    } catch (error) {
      toast.error('Error al cargar comprobantes');
    } finally {
      setLoading(false);
    }
  };

  // Agregar item
  const addItem = () => {
    if (!newItem.codigo || !newItem.descripcion || newItem.valorUnitario <= 0) {
      toast.error('Complete los datos del item');
      return;
    }

    const igv = newItem.tipoIGV === '10' ? newItem.valorUnitario * 0.18 : 0;
    const precioUnitario = newItem.valorUnitario + igv;
    const totalItem = precioUnitario * newItem.cantidad;

    const item: InvoiceItem = {
      codigo: newItem.codigo,
      descripcion: newItem.descripcion,
      unidadMedida: 'NIU', // Unidad (servicio)
      cantidad: newItem.cantidad,
      valorUnitario: newItem.valorUnitario,
      precioUnitario: precioUnitario,
      tipoIGV: newItem.tipoIGV,
      igv: igv * newItem.cantidad,
      totalItem: totalItem
    };

    setItems([...items, item]);
    setNewItem({
      codigo: '',
      descripcion: '',
      cantidad: 1,
      valorUnitario: 0,
      tipoIGV: '10'
    });
  };

  // Remover item
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calcular totales
  const calculateTotals = () => {
    const totalOperacionesGravadas = items
      .filter(i => i.tipoIGV === '10')
      .reduce((sum, i) => sum + (i.valorUnitario * i.cantidad), 0);

    const totalOperacionesExoneradas = items
      .filter(i => i.tipoIGV === '20')
      .reduce((sum, i) => sum + (i.valorUnitario * i.cantidad), 0);

    const totalIGV = items.reduce((sum, i) => sum + i.igv, 0);
    const totalVenta = items.reduce((sum, i) => sum + i.totalItem, 0);

    return {
      totalOperacionesGravadas,
      totalOperacionesExoneradas,
      totalIGV,
      totalVenta
    };
  };

  // Emitir comprobante
  const emitirComprobante = async () => {
    if (!cliente.numeroDocumento || !cliente.razonSocial) {
      toast.error('Complete los datos del cliente');
      return;
    }

    if (items.length === 0) {
      toast.error('Agregue al menos un item');
      return;
    }

    setSending(true);

    const backendData = {
      serie: tipoComprobante === '01' ? 'F001' : 'B001',
      fecha_emision: new Date().toISOString().split('T')[0],
      moneda: 'PEN',
      forma_pago_tipo: 'Contado',
      client: {
        tipo_documento: cliente.tipoDocumento,
        numero_documento: cliente.numeroDocumento,
        razon_social: cliente.razonSocial,
        direccion: cliente.direccion,
        email: cliente.email
      },
      detalles: items.map(item => ({
        codigo: item.codigo,
        descripcion: item.descripcion,
        unidad: 'NIU',
        cantidad: item.cantidad,
        mto_valor_unitario: item.valorUnitario,
        tip_afe_igv: item.tipoIGV
      }))
    };

    try {
      const creationResult = await sunatService.createInvoice(backendData, tipoComprobante);
      const sunatResult = await sunatService.sendToSunat(creationResult.id, tipoComprobante);

      setSending(false);

      if (sunatResult.success) {
        toast.success('✓ Comprobante emitido correctamente');
        setCliente({ tipoDocumento: '6', numeroDocumento: '', razonSocial: '', direccion: '', email: '' });
        setItems([]);
        setShowNewInvoice(false);
        fetchRecords();
      } else {
        toast.warning('Comprobante creado pero error en SUNAT', { description: sunatResult.error });
        setShowNewInvoice(false);
        fetchRecords();
      }
    } catch (error: any) {
      setSending(false);
      toast.error('Error', { description: error.response?.data?.message || error.message });
    }
  };

  const totals = calculateTotals();

  const basePath = (record: any) => record.tipo_documento === '01' ? 'invoices' : 'boletas';
  const handleDownloadPdf = async (record: any) => {
    try {
      const path = `/${basePath(record)}/${record.id}/download-pdf`;
      const name = `comprobante-${(record.numero_completo || record.id).toString().replace(/\s/g, '-')}.pdf`;
      await apiClient.downloadFile(path, name);
      toast.success('Descargando PDF...');
    } catch (e: any) {
      toast.error(e.message || 'Error al descargar PDF');
    }
  };
  const handleDownloadXml = async (record: any) => {
    try {
      const path = `/${basePath(record)}/${record.id}/download-xml`;
      const name = `comprobante-${(record.numero_completo || record.id).toString().replace(/\s/g, '-')}.xml`;
      await apiClient.downloadFile(path, name);
      toast.success('Descargando XML...');
    } catch (e: any) {
      toast.error(e.message || 'Error al descargar XML');
    }
  };
  const handleViewPdf = async (record: any) => {
    try {
      const path = `/${basePath(record)}/${record.id}/download-pdf`;
      const token = apiClient.getToken();
      const res = await fetch(`${API_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Error al cargar PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.success('Abriendo PDF');
    } catch (e: any) {
      toast.error(e.message || 'Error al abrir PDF');
    }
  };
  const handlePrint = async (record: any) => {
    try {
      const path = `/${basePath(record)}/${record.id}/download-pdf`;
      const token = apiClient.getToken();
      const res = await fetch(`${API_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Error al cargar PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const w = window.open(url, '_blank');
      if (w) w.onload = () => { w.print(); };
      toast.success('Abriendo para imprimir. Use Ctrl+P si no se abre el cuadro de impresión.');
    } catch (e: any) {
      toast.error(e.message || 'Error al imprimir');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Facturación Electrónica</h2>
          <p className="text-sm text-muted-foreground">Emisión de comprobantes electrónicos SUNAT</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRecords} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={() => setShowNewInvoice(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Comprobante
          </Button>
        </div>
      </div>

      {!company && (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Configuración Requerida</h3>
              <p className="text-muted-foreground mb-4">Para emitir comprobantes electrónicos, debe configurar los datos de su empresa.</p>
              <Button variant="outline">Ir a Configuración SUNAT</Button>
            </div>
          </div>
        </Card>
      )}

      {company && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">{company.razonSocial}</p>
              <p className="text-sm text-green-700">RUC: {company.ruc} | OSE: {company.oseProvider}</p>
            </div>
          </div>
        </Card>
      )}

      <Dialog open={showNewInvoice} onOpenChange={setShowNewInvoice}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Emitir Comprobante Electrónico</DialogTitle>
            <DialogDescription>Complete los datos para generar y enviar a SUNAT</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Tipo de Comprobante</Label>
              <Select value={tipoComprobante} onValueChange={(v: any) => setTipoComprobante(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">01 - Factura</SelectItem>
                  <SelectItem value="03">03 - Boleta de Venta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold mb-3">Datos del Cliente</h3>
              <div className="space-y-2 mb-3">
                <Label>Cliente (desde BD)</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger><SelectValue placeholder="Seleccione un cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.fullName} ({c.documentNumber})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select value={cliente.tipoDocumento} onValueChange={(v: any) => setCliente({ ...cliente, tipoDocumento: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">DNI</SelectItem>
                      <SelectItem value="6">RUC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Número de Documento</Label>
                  <Input
                    placeholder={cliente.tipoDocumento === '6' ? '20123456789' : '12345678'}
                    maxLength={cliente.tipoDocumento === '6' ? 11 : 8}
                    value={cliente.numeroDocumento}
                    onChange={(e) => setCliente({ ...cliente, numeroDocumento: e.target.value })}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Razón Social / Nombre</Label>
                  <Input placeholder="Nombre del cliente" value={cliente.razonSocial} onChange={(e) => setCliente({ ...cliente, razonSocial: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Dirección</Label>
                  <Input placeholder="Dirección del cliente" value={cliente.direccion} onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="email@cliente.com" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} />
                </div>
              </div>
            </Card>

            <div>
              <h3 className="font-semibold mb-3">Items del Comprobante</h3>
              <Card className="p-4 bg-gray-50 mb-4">
                <div className="space-y-2 mb-3">
                  <Label className="text-xs">Producto / Servicio (desde BD)</Label>
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccione producto o servicio" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.code}) - S/ {p.price?.toFixed(2) ?? '0.00'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Código</Label>
                    <Input placeholder="P001" value={newItem.codigo} onChange={(e) => setNewItem({ ...newItem, codigo: e.target.value })} />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Descripción</Label>
                    <Input placeholder="Descripción" value={newItem.descripcion} onChange={(e) => setNewItem({ ...newItem, descripcion: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cant.</Label>
                    <Input type="number" min="1" value={newItem.cantidad} onChange={(e) => setNewItem({ ...newItem, cantidad: parseInt(e.target.value) || 1 })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Valor Unit.</Label>
                    <Input type="number" step="0.01" placeholder="0.00" value={newItem.valorUnitario || ''} onChange={(e) => setNewItem({ ...newItem, valorUnitario: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">IGV</Label>
                    <Select value={newItem.tipoIGV} onValueChange={(v: any) => setNewItem({ ...newItem, tipoIGV: v })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">Gravado</SelectItem>
                        <SelectItem value="20">Exonerado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addItem} className="mt-3" size="sm"><Plus className="w-4 h-4 mr-1" /> Agregar</Button>
              </Card>

              {items.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs">Código</TableHead>
                        <TableHead className="text-xs">Descripción</TableHead>
                        <TableHead className="text-xs text-center">Cant.</TableHead>
                        <TableHead className="text-xs text-right">V. Unit.</TableHead>
                        <TableHead className="text-xs text-right">IGV</TableHead>
                        <TableHead className="text-xs text-right">Total</TableHead>
                        <TableHead className="text-xs w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs font-mono">{item.codigo}</TableCell>
                          <TableCell className="text-xs">{item.descripcion}</TableCell>
                          <TableCell className="text-xs text-center">{item.cantidad}</TableCell>
                          <TableCell className="text-xs text-right">S/ {item.valorUnitario.toFixed(2)}</TableCell>
                          <TableCell className="text-xs text-right">S/ {item.igv.toFixed(2)}</TableCell>
                          <TableCell className="text-xs text-right font-semibold">S/ {item.totalItem.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => removeItem(index)} className="h-7 w-7 p-0">
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Op. Gravadas:</span>
                    <span className="font-semibold">S/ {totals.totalOperacionesGravadas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IGV (18%):</span>
                    <span className="font-semibold">S/ {totals.totalIGV.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold">TOTAL:</span>
                    <span className="font-bold text-xl text-purple-600">S/ {totals.totalVenta.toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewInvoice(false)}>Cancelar</Button>
              <Button onClick={emitirComprobante} disabled={sending || items.length === 0}>
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Enviando...' : 'Emitir y Enviar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comprobantes Emitidos</h3>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Serie-Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {loading ? 'Cargando...' : 'No hay comprobantes'}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((invoice, index) => (
                  <TableRow key={index}>
                    <TableCell>{invoice.fecha_emision}</TableCell>
                    <TableCell>
                      {invoice.tipo_documento === '01' ? 'Factura' : 'Boleta'}
                    </TableCell>
                    <TableCell className="font-mono">{invoice.numero_completo}</TableCell>
                    <TableCell>{invoice.client?.razon_social || 'N/A'}</TableCell>
                    <TableCell className="text-right font-semibold">S/ {parseFloat(invoice.mto_imp_venta).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={invoice.estado_sunat === 'ACEPTADO' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}>
                        {invoice.estado_sunat === 'ACEPTADO' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                        {invoice.estado_sunat}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewPdf(invoice)} title="Ver PDF"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(invoice)} title="Descargar PDF"><Download className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadXml(invoice)} title="Descargar XML"><FileText className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePrint(invoice)} title="Imprimir"><Printer className="w-4 h-4" /></Button>
                        {onAnular && (
                          <Button variant="ghost" size="sm" onClick={() => onAnular(invoice)} title="Anular (comunicación de baja)" className="text-amber-600"><FileX className="w-4 h-4" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
