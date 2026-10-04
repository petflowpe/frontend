import { useState } from 'react';
import { AlertTriangle, CalendarClock, Loader2, PackageX, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { formatCurrency, formatDate } from '../../utils/helpers';
import {
  useExpiringBatches,
  useProductBatches,
  writeOffBatch,
  type ExpiryStatus,
  type ProductBatch,
} from '../../hooks/useBatches';

const STATUS_STYLES: Record<ExpiryStatus, { label: string; className: string }> = {
  expired: { label: 'Vencido', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  expiring: { label: 'Por vencer', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  ok: { label: 'Vigente', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  none: { label: 'Sin fecha', className: 'bg-muted text-muted-foreground' },
};

function ExpiryBadge({ batch }: { batch: ProductBatch }) {
  const style = STATUS_STYLES[batch.expiry_status] ?? STATUS_STYLES.none;
  const days = batch.days_to_expiry;
  const suffix =
    days == null ? '' : days < 0 ? ` (hace ${Math.abs(days)} d)` : days === 0 ? ' (hoy)' : ` (${days} d)`;
  return <Badge className={style.className}>{style.label + suffix}</Badge>;
}

function WriteOffDialog({
  batch,
  onClose,
  onDone,
}: {
  batch: ProductBatch;
  onClose: () => void;
  onDone: () => void;
}) {
  const [quantity, setQuantity] = useState(String(batch.quantity_available));
  const [kind, setKind] = useState<'expiry' | 'shrinkage'>(
    batch.expiry_status === 'expired' ? 'expiry' : 'shrinkage'
  );
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0 || qty > batch.quantity_available) {
      toast.error(`La cantidad debe estar entre 0 y ${batch.quantity_available}`);
      return;
    }
    if (!reason.trim()) {
      toast.error('Indica el motivo de la baja');
      return;
    }
    setBusy(true);
    try {
      await writeOffBatch(batch.id, { quantity: qty, reason: reason.trim(), kind });
      toast.success('Baja registrada en el kardex');
      onDone();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo dar de baja el lote');
    } finally {
      setBusy(false);
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <PackageX className="h-5 w-5 text-red-600" />
          Dar de baja lote {batch.batch_number}
        </DialogTitle>
        <DialogDescription>
          {batch.product?.name ? `${batch.product.name} · ` : ''}
          Disponible: {batch.quantity_available}
          {batch.area?.name ? ` en ${batch.area.name}` : ''}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Cantidad</Label>
            <Input
              type="number"
              min={0}
              max={batch.quantity_available}
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as 'expiry' | 'shrinkage')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expiry">Vencimiento</SelectItem>
                <SelectItem value="shrinkage">Merma (daño, pérdida)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Motivo</Label>
          <Textarea
            rows={2}
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej.: producto vencido retirado de anaquel"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={submit} disabled={busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Dar de baja
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function BatchRows({
  batches,
  showProduct,
  onWriteOff,
}: {
  batches: ProductBatch[];
  showProduct?: boolean;
  onWriteOff: (batch: ProductBatch) => void;
}) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            {showProduct && <th className="p-2 text-left font-medium">Producto</th>}
            <th className="p-2 text-left font-medium">Lote</th>
            <th className="p-2 text-left font-medium">Almacén</th>
            <th className="p-2 text-left font-medium">Vence</th>
            <th className="p-2 text-left font-medium">Estado</th>
            <th className="p-2 text-right font-medium">Disponible</th>
            <th className="p-2 text-right font-medium">Valor</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {batches.map((b) => {
            const unitCost = b.unit_cost ?? Number(b.product?.cost_price ?? 0);
            return (
              <tr key={b.id} className="border-t">
                {showProduct && (
                  <td className="p-2">
                    <p className="font-medium">{b.product?.name ?? `#${b.product_id}`}</p>
                    {b.product?.code && <p className="text-xs text-muted-foreground">{b.product.code}</p>}
                  </td>
                )}
                <td className="p-2 font-mono text-xs">{b.batch_number}</td>
                <td className="p-2">{b.area?.name ?? '-'}</td>
                <td className="p-2">{b.expiry_date ? formatDate(b.expiry_date) : '-'}</td>
                <td className="p-2">
                  <ExpiryBadge batch={b} />
                </td>
                <td className="p-2 text-right font-medium">{b.quantity_available}</td>
                <td className="p-2 text-right">{formatCurrency(b.quantity_available * unitCost)}</td>
                <td className="p-2 text-right">
                  <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onWriteOff(b)}>
                    Dar de baja
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Lotes con saldo de un producto, ordenados por vencimiento (orden FEFO). */
export function ProductBatchesTable({
  productId,
  onChanged,
}: {
  productId: string | number;
  onChanged?: () => void;
}) {
  const { batches, loading, refresh } = useProductBatches(productId);
  const [target, setTarget] = useState<ProductBatch | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Lotes disponibles (salen primero los que vencen antes)
        </h4>
        <Button size="sm" variant="ghost" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      {batches.length === 0 ? (
        <p className="text-sm text-muted-foreground">{loading ? 'Cargando lotes…' : 'Sin lotes con saldo.'}</p>
      ) : (
        <BatchRows batches={batches} onWriteOff={setTarget} />
      )}
      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        {target && (
          <WriteOffDialog
            batch={target}
            onClose={() => setTarget(null)}
            onDone={() => {
              refresh();
              onChanged?.();
            }}
          />
        )}
      </Dialog>
    </div>
  );
}

/** Panel global de lotes vencidos o próximos a vencer. */
export function ExpiringBatchesPanel({
  companyId,
  onChanged,
}: {
  companyId: number;
  onChanged?: () => void;
}) {
  const [days, setDays] = useState(30);
  const { batches, meta, loading, refresh } = useExpiringBatches(companyId, days);
  const [expanded, setExpanded] = useState(false);
  const [target, setTarget] = useState<ProductBatch | null>(null);

  if (!loading && batches.length === 0) return null;

  return (
    <Card className="p-4 border-amber-200 bg-amber-50/60 dark:bg-amber-950/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium">Lotes vencidos o por vencer</p>
            {meta && (
              <p className="text-xs text-muted-foreground">
                {meta.expired_count} vencido(s) · {formatCurrency(meta.expired_value)} — {meta.expiring_count} por
                vencer en {meta.days} días · {formatCurrency(meta.expiring_value)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 días</SelectItem>
              <SelectItem value="30">30 días</SelectItem>
              <SelectItem value="60">60 días</SelectItem>
              <SelectItem value="90">90 días</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Ocultar' : `Ver ${batches.length} lote(s)`}
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3">
          <BatchRows batches={batches} showProduct onWriteOff={setTarget} />
        </div>
      )}
      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        {target && (
          <WriteOffDialog
            batch={target}
            onClose={() => setTarget(null)}
            onDone={() => {
              refresh();
              onChanged?.();
            }}
          />
        )}
      </Dialog>
    </Card>
  );
}
