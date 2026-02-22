import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { apiClient } from '../../utils/api/client';
import { useClients } from '../../hooks/useClients';
import { useProducts } from '../../hooks/useProducts';

export function CreditNoteForm({ open, onOpenChange, onSuccess, companyId = 1, branchId = 1 }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess?: () => void; companyId?: number; branchId?: number }) {
  const { clients } = useClients();
  const { products } = useProducts();
  const [motivos, setMotivos] = useState<{ code: string; name: string }[]>([]);
  const [serie, setSerie] = useState('B001');
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);
  const [tipoDocAfectado, setTipoDocAfectado] = useState('03');
  const [numDocAfectado, setNumDocAfectado] = useState('');
  const [codMotivo, setCodMotivo] = useState('01');
  const [desMotivo, setDesMotivo] = useState('');
  const [clientId, setClientId] = useState('');
  const [codigo, setCodigo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [valorUnitario, setValorUnitario] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    apiClient.get<any>('/credit-notes/catalogs/motivos').then((res: any) => {
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setMotivos(data);
      if (data.length) setCodMotivo(data[0].code);
    }).catch(() => {});
  }, [open]);

  const client = clients.find(c => c.id === clientId);

  const submit = async () => {
    if (!client) {
      toast.error('Seleccione un cliente');
      return;
    }
    if (!numDocAfectado.trim() || !descripcion.trim() || valorUnitario <= 0) {
      toast.error('Complete documento afectado, descripción y valor unitario');
      return;
    }
    setSubmitting(true);
    try {
      const clientPayload = {
        tipo_documento: client.documentType === 'DNI' ? '1' : client.documentType === 'RUC' ? '6' : client.documentType === 'CE' ? '4' : '1',
        numero_documento: client.documentNumber,
        razon_social: client.fullName,
        direccion: client.address || '',
      };
      await apiClient.post('/credit-notes', {
        company_id: companyId,
        branch_id: branchId,
        serie,
        fecha_emision: fechaEmision,
        moneda: 'PEN',
        tipo_doc_afectado: tipoDocAfectado,
        num_doc_afectado: numDocAfectado.trim(),
        cod_motivo: codMotivo,
        des_motivo: desMotivo || (motivos.find(m => m.code === codMotivo)?.name ?? 'Anulación'),
        client: clientPayload,
        detalles: [{
          codigo: codigo || 'NC-001',
          descripcion,
          unidad: 'NIU',
          cantidad: Number(cantidad),
          mto_valor_unitario: Number(valorUnitario),
          tip_afe_igv: '10',
        }],
      });
      toast.success('Nota de crédito creada');
      onOpenChange(false);
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || 'Error al crear nota de crédito');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Nota de Crédito</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Serie</Label>
              <Input value={serie} onChange={e => setSerie(e.target.value)} placeholder="B001" />
            </div>
            <div>
              <Label>Fecha emisión</Label>
              <Input type="date" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo doc. afectado</Label>
              <Select value={tipoDocAfectado} onValueChange={setTipoDocAfectado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">Factura</SelectItem>
                  <SelectItem value="03">Boleta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Número doc. afectado</Label>
              <Input value={numDocAfectado} onChange={e => setNumDocAfectado(e.target.value)} placeholder="F001-00001234" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Motivo</Label>
              <Select value={codMotivo} onValueChange={setCodMotivo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {motivos.map(m => (
                    <SelectItem key={m.code} value={m.code}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descripción motivo</Label>
              <Input value={desMotivo} onChange={e => setDesMotivo(e.target.value)} placeholder="Opcional" />
            </div>
          </div>
          <div>
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue placeholder="Seleccione cliente" /></SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.fullName} ({c.documentNumber})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border-t pt-4 space-y-2">
            <Label>Detalle (1 ítem)</Label>
            <div>
              <Label className="text-xs text-muted-foreground">Producto / Servicio (BD)</Label>
              <Select value={selectedProductId} onValueChange={v => { setSelectedProductId(v); const p = products.find(x => x.id.toString() === v); if (p) { setCodigo(p.code || ''); setDescripcion(p.name || ''); setValorUnitario(p.price ?? 0); } }}>
                <SelectTrigger><SelectValue placeholder="Seleccione producto o servicio" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.code}) - S/ {(p.price ?? 0).toFixed(2)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Código" />
              <Input type="number" min={0} step={0.01} value={valorUnitario} onChange={e => setValorUnitario(Number(e.target.value))} placeholder="Valor unit." />
            </div>
            <Input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" />
            <Input type="number" min={0.001} step={0.01} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} placeholder="Cantidad" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? 'Guardando...' : 'Crear nota de crédito'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
