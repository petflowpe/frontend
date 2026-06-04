import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { apiClient } from '../../utils/api/client';
import { toast } from 'sonner';
import type { PreventiveCategory } from './preventiveHealthUtils';
import { Bug, Shield, Syringe } from 'lucide-react';

const CATEGORY_META: Record<
  PreventiveCategory,
  { title: string; medicalType: string; defaultName: string; icon: typeof Syringe }
> = {
  vaccine: {
    title: 'Registrar vacuna',
    medicalType: 'Vacunación',
    defaultName: 'Vacuna múltiple',
    icon: Syringe,
  },
  deworming: {
    title: 'Registrar desparasitación',
    medicalType: 'Desparasitación',
    defaultName: 'Desparasitación interna',
    icon: Shield,
  },
  flea: {
    title: 'Registrar antipulgas',
    medicalType: 'Tratamiento',
    defaultName: 'Antipulgas / antiparasitario externo',
    icon: Bug,
  },
};

export interface PreventiveHealthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: PreventiveCategory;
  petId: string | number;
  clientId: string | number;
  companyId?: string | number | null;
  petName?: string;
  onSaved?: () => void;
}

export function PreventiveHealthDialog({
  open,
  onOpenChange,
  category,
  petId,
  clientId,
  companyId,
  petName,
  onSaved,
}: PreventiveHealthDialogProps) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    name: meta.defaultName,
    veterinarian: '',
    lot: '',
    manufacturer: '',
    nextDue: '',
    product: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        date: new Date().toISOString().slice(0, 10),
        name: meta.defaultName,
        veterinarian: '',
        lot: '',
        manufacturer: '',
        nextDue: '',
        product: '',
        notes: '',
      });
    }
  }, [open, category, meta.defaultName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('El nombre del tratamiento es obligatorio');
      return;
    }
    if (!form.date) {
      toast.error('La fecha de aplicación es obligatoria');
      return;
    }

    setSaving(true);
    try {
      const description = [
        `Tratamiento: ${form.name.trim()}`,
        form.product.trim() ? `Producto: ${form.product.trim()}` : '',
        form.veterinarian.trim() ? `Veterinario: ${form.veterinarian.trim()}` : '',
        form.lot.trim() ? `Lote: ${form.lot.trim()}` : '',
        form.manufacturer.trim() ? `Laboratorio: ${form.manufacturer.trim()}` : '',
        form.notes.trim() ? `Notas: ${form.notes.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      await apiClient.post('/medical-records', {
        pet_id: Number(petId),
        client_id: Number(clientId),
        company_id: companyId ? Number(companyId) : null,
        date: form.date,
        type: meta.medicalType,
        title: category === 'flea' ? `Antipulgas - ${form.name.trim()}` : `${meta.medicalType} - ${form.name.trim()}`,
        description,
        diagnosis: 'Aplicación preventiva en campo',
        treatment: form.product.trim() || form.name.trim(),
        notes: form.nextDue.trim() ? `Próxima dosis: ${form.nextDue}` : form.notes.trim() || null,
      });

      if (category === 'vaccine') {
        try {
          await apiClient.post(`/pets/${petId}/vaccine-records`, {
            name: form.name.trim(),
            date: form.date,
            next_due_date: form.nextDue || null,
            veterinarian: form.veterinarian.trim() || null,
            lot: form.lot.trim() || null,
            manufacturer: form.manufacturer.trim() || null,
            notes: form.notes.trim() || null,
            client_id: Number(clientId),
            company_id: companyId ? Number(companyId) : null,
          });
        } catch {
          // endpoint opcional en entornos sin ruta
        }
        await apiClient.put(`/pets/${petId}`, {
          last_vaccination_date: form.date,
          next_vaccination_date: form.nextDue || null,
        });
      }

      if (category === 'deworming') {
        await apiClient.put(`/pets/${petId}`, {
          last_deworming_date: form.date,
          next_deworming_date: form.nextDue || null,
        });
      }

      if (category === 'flea') {
        const nextFlea =
          form.nextDue ||
          (() => {
            const d = new Date(`${form.date}T12:00:00`);
            d.setMonth(d.getMonth() + 1);
            return d.toISOString().slice(0, 10);
          })();
        await apiClient.put(`/pets/${petId}`, {
          last_flea_treatment_date: form.date,
          next_flea_treatment_date: nextFlea,
        });
      }

      toast.success(`${meta.title.replace('Registrar ', '')} guardado`);
      onSaved?.();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo guardar el registro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {meta.title}
          </DialogTitle>
          <DialogDescription>
            Salud preventiva{petName ? ` — ${petName}` : ''}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Fecha de aplicación *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Próxima dosis</Label>
              <Input
                type="date"
                value={form.nextDue}
                onChange={(e) => setForm({ ...form, nextDue: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Nombre / protocolo *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={meta.defaultName}
              required
            />
          </div>

          {(category === 'flea' || category === 'deworming') && (
            <div>
              <Label>Producto utilizado</Label>
              <Input
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                placeholder="Ej. Spot-on, tabletas masticables..."
              />
            </div>
          )}

          <div>
            <Label>Veterinario</Label>
            <Input
              value={form.veterinarian}
              onChange={(e) => setForm({ ...form, veterinarian: e.target.value })}
              placeholder="Nombre del profesional"
            />
          </div>

          {category === 'vaccine' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Lote</Label>
                <Input value={form.lot} onChange={(e) => setForm({ ...form, lot: e.target.value })} />
              </div>
              <div>
                <Label>Laboratorio</Label>
                <Input
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <Label>Observaciones</Label>
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Reacciones, indicaciones al tutor..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
