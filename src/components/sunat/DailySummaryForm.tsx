import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import { apiClient } from '../../utils/api/client';

export function DailySummaryForm({ open, onOpenChange, onSuccess, companyId = 1, branchId = 1 }: { open: boolean; onOpenChange: (v: boolean) => void; onSuccess?: () => void; companyId?: number; branchId?: number }) {
  const [fechaResumen, setFechaResumen] = useState(new Date().toISOString().split('T')[0]);
  const [pendingBoletas, setPendingBoletas] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPending = async () => {
    setLoadingPending(true);
    try {
      const res = await apiClient.get<any>('/boletas/pending-for-summary', {
        company_id: companyId,
        branch_id: branchId,
        fecha_emision: fechaResumen,
      });
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setPendingBoletas(data);
      if (data.length === 0) toast.info('No hay boletas pendientes de resumen para esa fecha');
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar pendientes');
      setPendingBoletas([]);
    } finally {
      setLoadingPending(false);
    }
  };

  const createSummary = async () => {
    setSubmitting(true);
    try {
      await apiClient.post('/boletas/create-daily-summary', {
        company_id: companyId,
        branch_id: branchId,
        fecha_resumen: fechaResumen,
      });
      toast.success('Resumen diario creado');
      onOpenChange(false);
      onSuccess?.();
    } catch (e: any) {
      toast.error(e.message || 'Error al crear resumen diario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generar Resumen Diario</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Fecha del resumen</Label>
            <Input
              type="date"
              value={fechaResumen}
              onChange={e => setFechaResumen(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={loadPending} disabled={loadingPending} className="w-full">
            {loadingPending ? 'Cargando...' : 'Ver boletas pendientes'}
          </Button>
          {pendingBoletas.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {pendingBoletas.length} boleta(s) pendiente(s) de incluir en resumen.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={createSummary} disabled={submitting}>
            {submitting ? 'Creando...' : 'Generar resumen diario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
