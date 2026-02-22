import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { apiClient } from '../../utils/api/client';
import { useClients } from '../../hooks/useClients';
import { useDispatchGuides } from '../../hooks/useDispatchGuides';
import { useProducts } from '../../hooks/useProducts';

export function DispatchGuideForm({ open, onOpenChange, onSuccess, companyId = 1, branchId = 1 }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess?: () => void; companyId?: number; branchId?: number }) {
  const { clients } = useClients();
  const { products } = useProducts();
  const { transferReasons, transportModes } = useDispatchGuides();
  const [serie, setSerie] = useState('T001');
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().split('T')[0]);
  const [fechaTraslado, setFechaTraslado] = useState(new Date().toISOString().split('T')[0]);
  const [codTraslado, setCodTraslado] = useState('01');
  const [modTraslado, setModTraslado] = useState('02');
  const [pesoTotal, setPesoTotal] = useState(1);
  const [numBultos, setNumBultos] = useState(1);
  const [destinatarioId, setDestinatarioId] = useState('');
  const [partidaUbigeo, setPartidaUbigeo] = useState('150101');
  const [partidaDireccion, setPartidaDireccion] = useState('');
  const [llegadaUbigeo, setLlegadaUbigeo] = useState('150101');
  const [llegadaDireccion, setLlegadaDireccion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const client = clients.find(c => c.id === destinatarioId);

  useEffect(() => {
    if (client?.address) {
      setLlegadaDireccion(client.address);
    }
  }, [client?.id, client?.address]);

  const submit = async () => {
    if (!destinatarioId) {
      toast.error('Seleccione destinatario (cliente)');
      return;
    }
    if (!partidaDireccion.trim() || !llegadaDireccion.trim()) {
      toast.error('Complete direcciones de partida y llegada');
      return;
    }
    if (!descripcion.trim()) {
      toast.error('Indique descripción del ítem');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/dispatch-guides', {
        company_id: companyId,
        branch_id: branchId,
        destinatario_id: parseInt(destinatarioId, 10),
        serie,
        fecha_emision: fechaEmision,
        cod_traslado: codTraslado,
        des_traslado: transferReasons.find(r => r.code === codTraslado)?.name ?? '',
        mod_traslado: modTraslado,
        fecha_traslado: fechaTraslado,
        peso_total: Number(pesoTotal),
        und_peso_total: 'KGM',
        num_bultos: Number(numBultos),
        partida: { ubigeo: partidaUbigeo, direccion: partidaDireccion },
        llegada: { ubigeo: llegadaUbigeo, direccion: llegadaDireccion },
        detalles: [{
          cantidad: Number(cantidad),
          unidad: 'NIU',
          descripcion,
          codigo: codigo || 'GR-001',
        }],
      });
      toast.success('Guía de remisión creada');
      onOpenChange(false);
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || 'Error al crear guía de remisión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Guía de Remisión</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Serie</Label>
              <Input value={serie} onChange={e => setSerie(e.target.value)} placeholder="T001" />
            </div>
            <div>
              <Label>Fecha emisión</Label>
              <Input type="date" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Destinatario (cliente)</Label>
            <Select value={destinatarioId} onValueChange={setDestinatarioId}>
              <SelectTrigger><SelectValue placeholder="Seleccione cliente" /></SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.fullName} ({c.documentNumber})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Motivo traslado</Label>
              <Select value={codTraslado} onValueChange={setCodTraslado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(transferReasons.length ? transferReasons : [{ code: '01', name: 'Venta' }, { code: '04', name: 'Traslado entre establecimientos' }]).map(r => (
                    <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Modalidad</Label>
              <Select value={modTraslado} onValueChange={setModTraslado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">Transporte público</SelectItem>
                  <SelectItem value="02">Transporte privado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha traslado</Label>
              <Input type="date" value={fechaTraslado} onChange={e => setFechaTraslado(e.target.value)} />
            </div>
            <div>
              <Label>Peso total (kg)</Label>
              <Input type="number" min={0.001} step={0.01} value={pesoTotal} onChange={e => setPesoTotal(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label>Número de bultos</Label>
            <Input type="number" min={1} value={numBultos} onChange={e => setNumBultos(Number(e.target.value))} />
          </div>
          <div className="border-t pt-4 space-y-2">
            <Label>Partida</Label>
            <Input value={partidaUbigeo} onChange={e => setPartidaUbigeo(e.target.value)} placeholder="Ubigeo (6 dígitos)" maxLength={6} />
            <Input value={partidaDireccion} onChange={e => setPartidaDireccion(e.target.value)} placeholder="Dirección partida" />
          </div>
          <div className="space-y-2">
            <Label>Llegada</Label>
            <Input value={llegadaUbigeo} onChange={e => setLlegadaUbigeo(e.target.value)} placeholder="Ubigeo (6 dígitos)" maxLength={6} />
            <Input value={llegadaDireccion} onChange={e => setLlegadaDireccion(e.target.value)} placeholder="Dirección llegada" />
          </div>
          <div className="border-t pt-4 space-y-2">
            <Label>Detalle (1 ítem)</Label>
            <div>
              <Label className="text-xs text-muted-foreground">Producto / Servicio (BD)</Label>
              <Select value={selectedProductId} onValueChange={v => { setSelectedProductId(v); const p = products.find(x => x.id.toString() === v); if (p) { setCodigo(p.code || ''); setDescripcion(p.name || ''); } }}>
                <SelectTrigger><SelectValue placeholder="Seleccione producto o servicio" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Código" />
            <Input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" />
            <Input type="number" min={0.001} step={0.01} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} placeholder="Cantidad" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={submitting}>{submitting ? 'Guardando...' : 'Crear guía'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
