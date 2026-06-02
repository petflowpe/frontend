import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { apiClient } from '../../utils/api/client';
import { toast } from 'sonner';

const ATTENTION_TYPES = [
  'Consulta',
  'Vacunación',
  'Desparasitación',
  'Tratamiento',
  'Chequeo',
  'Emergencia',
  'Cirugía',
  'Laboratorio',
] as const;

export interface NewMedicalAttentionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petId: string | number;
  clientId: string | number;
  companyId?: string | number | null;
  petName?: string;
  defaultWeight?: string | number;
  onSaved?: () => void;
}

export function NewMedicalAttentionDialog({
  open,
  onOpenChange,
  petId,
  clientId,
  companyId,
  petName,
  defaultWeight,
  onSaved,
}: NewMedicalAttentionDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: today,
    type: 'Consulta' as (typeof ATTENTION_TYPES)[number],
    chiefComplaint: '',
    anamnesis: '',
    physicalExam: '',
    diagnosis: '',
    treatment: '',
    weight: defaultWeight != null && defaultWeight !== '' ? String(defaultWeight).replace(/[^\d.]/g, '') : '',
    temperature: '',
    pulse: '',
    notes: '',
    nextControl: '',
  });

  const resetAndClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.chiefComplaint.trim()) {
      toast.error('El motivo de consulta es obligatorio');
      return;
    }
    if (!form.anamnesis.trim()) {
      toast.error('La anamnesis es obligatoria');
      return;
    }

    const description = [
      `Motivo: ${form.chiefComplaint.trim()}`,
      `Anamnesis: ${form.anamnesis.trim()}`,
      form.physicalExam.trim() ? `Examen físico: ${form.physicalExam.trim()}` : '',
    ].filter(Boolean).join('\n\n');

    const vitalSigns: Record<string, string> = {};
    if (form.pulse.trim()) vitalSigns.pulse = form.pulse.trim();

    setSaving(true);
    try {
      await apiClient.post('/medical-records', {
        pet_id: Number(petId),
        client_id: Number(clientId),
        company_id: companyId ? Number(companyId) : null,
        date: form.date,
        type: form.type,
        title: `${form.type} - ${petName || 'Mascota'}`,
        description,
        diagnosis: form.diagnosis.trim() || null,
        treatment: form.treatment.trim() || null,
        weight: form.weight ? Number(form.weight) : null,
        temperature: form.temperature ? Number(form.temperature) : null,
        vital_signs: Object.keys(vitalSigns).length ? vitalSigns : null,
        notes: [form.notes.trim(), form.nextControl.trim() ? `Próximo control: ${form.nextControl}` : '']
          .filter(Boolean)
          .join('\n') || null,
      });
      toast.success('Atención clínica registrada');
      onSaved?.();
      resetAndClose();
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo guardar la atención');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva atención clínica</DialogTitle>
          <DialogDescription>
            Anamnesis e historia clínica{petName ? ` — ${petName}` : ''} (atención móvil en vehículo)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Fecha *</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <Label>Tipo de atención *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as typeof form.type })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ATTENTION_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Motivo de consulta *</Label>
            <Input
              value={form.chiefComplaint}
              onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })}
              placeholder="Ej. vómitos, decaimiento, control..."
              required
            />
          </div>

          <div>
            <Label>Anamnesis *</Label>
            <Textarea
              rows={4}
              value={form.anamnesis}
              onChange={(e) => setForm({ ...form, anamnesis: e.target.value })}
              placeholder="Inicio, evolución, apetito, vómitos, heces, medicación actual..."
              required
            />
          </div>

          <div>
            <Label>Examen físico</Label>
            <Textarea
              rows={3}
              value={form.physicalExam}
              onChange={(e) => setForm({ ...form, physicalExam: e.target.value })}
              placeholder="Hallazgos por sistemas..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Diagnóstico</Label>
              <Textarea rows={2} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
            </div>
            <div>
              <Label>Tratamiento / plan</Label>
              <Textarea rows={2} value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Temperatura (°C)</Label>
              <Input
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
              />
            </div>
            <div>
              <Label>Pulso</Label>
              <Input value={form.pulse} onChange={(e) => setForm({ ...form, pulse: e.target.value })} placeholder="lpm" />
            </div>
            <div>
              <Label>Próximo control</Label>
              <Input type="date" value={form.nextControl} onChange={(e) => setForm({ ...form, nextControl: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Observaciones</Label>
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar atención'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
