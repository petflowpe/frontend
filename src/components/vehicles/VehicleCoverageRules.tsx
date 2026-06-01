import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import {
  COVERAGE_DAY_LABELS,
  COVERAGE_DAYS,
  CoverageRulePayload,
  useVehicleCoverage,
  VehicleCoverageRule,
} from '../../hooks/useVehicleCoverage';

type Props = {
  vehicleId?: number | string | null;
};

const emptyForm = (): CoverageRulePayload => ({
  zone_id: 0,
  districts: [],
  days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  start_time: '08:00',
  end_time: '18:00',
  priority: 0,
  max_daily_appointments: null,
  active: true,
  notes: '',
});

function formatDays(days: string[]): string {
  return days.map((d) => COVERAGE_DAY_LABELS[d] || d).join(', ');
}

export function VehicleCoverageRules({ vehicleId }: Props) {
  const { rules, zones, loadingRules, createRule, updateRule, deleteRule } = useVehicleCoverage(vehicleId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<VehicleCoverageRule | null>(null);
  const [form, setForm] = useState<CoverageRulePayload>(emptyForm());
  const [saving, setSaving] = useState(false);

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === form.zone_id),
    [zones, form.zone_id]
  );

  useEffect(() => {
    if (!dialogOpen) return;
    if (editingRule) {
      setForm({
        zone_id: editingRule.zone_id,
        districts: [...(editingRule.districts || [])],
        days: [...(editingRule.days || [])],
        start_time: String(editingRule.start_time).slice(0, 5),
        end_time: String(editingRule.end_time).slice(0, 5),
        priority: editingRule.priority ?? 0,
        max_daily_appointments: editingRule.max_daily_appointments ?? null,
        active: editingRule.active ?? true,
        notes: editingRule.notes ?? '',
      });
      return;
    }
    const firstZone = zones[0];
    setForm({
      ...emptyForm(),
      zone_id: firstZone?.id ?? 0,
      districts: firstZone?.districts ? [...firstZone.districts] : [],
    });
  }, [dialogOpen, editingRule, zones]);

  const openCreate = () => {
    setEditingRule(null);
    setDialogOpen(true);
  };

  const openEdit = (rule: VehicleCoverageRule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const toggleDistrict = (district: string) => {
    setForm((prev) => {
      const exists = prev.districts.includes(district);
      return {
        ...prev,
        districts: exists
          ? prev.districts.filter((d) => d !== district)
          : [...prev.districts, district],
      };
    });
  };

  const toggleDay = (day: string) => {
    setForm((prev) => {
      const exists = prev.days.includes(day);
      return {
        ...prev,
        days: exists ? prev.days.filter((d) => d !== day) : [...prev.days, day],
      };
    });
  };

  const handleZoneChange = (zoneId: number) => {
    const zone = zones.find((z) => z.id === zoneId);
    setForm((prev) => ({
      ...prev,
      zone_id: zoneId,
      districts: zone?.districts ? [...zone.districts] : [],
    }));
  };

  const handleSave = async () => {
    if (!vehicleId) {
      toast.error('Guarda el vehículo antes de configurar reglas de cobertura.');
      return;
    }
    if (!form.zone_id) {
      toast.error('Selecciona una zona.');
      return;
    }
    if (form.districts.length === 0) {
      toast.error('Selecciona al menos un distrito.');
      return;
    }
    if (form.days.length === 0) {
      toast.error('Selecciona al menos un día.');
      return;
    }

    setSaving(true);
    try {
      if (editingRule) {
        await updateRule(editingRule.id, form);
        toast.success('Regla actualizada');
      } else {
        await createRule(form);
        toast.success('Regla creada');
      }
      setDialogOpen(false);
      setEditingRule(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message
        || e?.response?.data?.errors?.start_time?.[0]
        || e?.message
        || 'Error al guardar la regla';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rule: VehicleCoverageRule) => {
    if (!window.confirm('¿Eliminar esta regla de cobertura?')) return;
    try {
      await deleteRule(rule.id);
      toast.success('Regla eliminada');
    } catch (e: any) {
      toast.error(e?.message || 'Error al eliminar la regla');
    }
  };

  if (!vehicleId) {
    return (
      <div className="space-y-2 pt-4 border-t">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Reglas de cobertura
        </Label>
        <p className="text-xs text-muted-foreground">
          Guarda el vehículo primero para definir distritos, días y horarios de operación.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Reglas de cobertura
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Define en qué distritos, días y horarios opera este vehículo. La agenda validará contra estas reglas.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Agregar
        </Button>
      </div>

      {loadingRules ? (
        <p className="text-sm text-muted-foreground">Cargando reglas...</p>
      ) : rules.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Sin reglas activas. Se usará el horario general como respaldo hasta que agregues reglas.
        </p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-lg border p-3 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{rule.zone?.name || `Zona #${rule.zone_id}`}</span>
                  {!rule.active && <Badge variant="secondary">Inactiva</Badge>}
                  {rule.priority > 0 && <Badge variant="outline">Prioridad {rule.priority}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {(rule.districts || []).join(', ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDays(rule.days || [])} · {String(rule.start_time).slice(0, 5)}–{String(rule.end_time).slice(0, 5)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(rule)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(rule)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Editar regla' : 'Nueva regla de cobertura'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Zona</Label>
              <select
                value={form.zone_id || ''}
                onChange={(e) => handleZoneChange(Number(e.target.value))}
                className="border-input bg-input-background flex h-9 w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">Seleccionar zona</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Distritos</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(selectedZone?.districts || []).map((district) => {
                  const selected = form.districts.includes(district);
                  return (
                    <Button
                      key={district}
                      type="button"
                      size="sm"
                      variant={selected ? 'default' : 'outline'}
                      onClick={() => toggleDistrict(district)}
                    >
                      {district}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Días</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COVERAGE_DAYS.map((day) => {
                  const selected = form.days.includes(day);
                  return (
                    <Button
                      key={day}
                      type="button"
                      size="sm"
                      variant={selected ? 'default' : 'outline'}
                      onClick={() => toggleDay(day)}
                    >
                      {COVERAGE_DAY_LABELS[day]}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Hora inicio</Label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label>Hora fin</Label>
                <Input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Prioridad</Label>
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={form.priority ?? 0}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Máx. citas/día</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Opcional"
                  value={form.max_daily_appointments ?? ''}
                  onChange={(e) => setForm({
                    ...form,
                    max_daily_appointments: e.target.value ? Number(e.target.value) : null,
                  })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.active ?? true}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label>Regla activa</Label>
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea
                value={form.notes ?? ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Opcional"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar regla'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
