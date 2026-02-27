import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCalendarConfig, type CalendarConfig } from '../../hooks/useCalendarConfig';

const INTERVAL_OPTIONS = [5, 10, 15, 30, 60] as const;
const FIRST_DAY_OPTIONS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

interface CalendarSettingsProps {
  companyId: number | string | null | undefined;
}

export function CalendarSettings({ companyId }: CalendarSettingsProps) {
  const { config, loading, updateConfig } = useCalendarConfig(companyId);
  const [form, setForm] = useState<CalendarConfig | null>(null);

  useEffect(() => {
    if (config) setForm({ ...config });
  }, [config]);

  const handleChange = <K extends keyof CalendarConfig>(key: K, value: CalendarConfig[K]) => {
    setForm(prev => prev ? { ...prev, [key]: value } : null);
  };

  const handleSave = async () => {
    if (!form) return;
    await updateConfig(form);
  };

  if (loading || !form) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Cargando configuración del calendario...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Opciones de calendario y reserva</h3>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Guardar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0">
        <div className="space-y-4">
          <Label className="flex items-center justify-between gap-4">
            <span>Fines de semana en calendario</span>
            <Switch
              checked={form.show_weekends}
              onCheckedChange={v => handleChange('show_weekends', v)}
            />
          </Label>
          <Label className="block">
            Tamaño de intervalos en el calendario (minutos)
            <Select
              value={String(form.interval_minutes)}
              onValueChange={v => handleChange('interval_minutes', Number(v) as CalendarConfig['interval_minutes'])}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVAL_OPTIONS.map(n => (
                  <SelectItem key={n} value={String(n)}>{n} minutos</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
          <Label className="block">
            Primer día de la semana
            <Select
              value={String(form.first_day_of_week)}
              onValueChange={v => handleChange('first_day_of_week', Number(v))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIRST_DAY_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
          <Label className="flex items-center gap-2">
            Primera hora del día
            <Input
              type="number"
              min={0}
              max={23}
              value={form.first_hour}
              onChange={e => handleChange('first_hour', parseInt(e.target.value, 10) || 0)}
              className="w-16"
            />
          </Label>
          <Label className="flex items-center gap-2">
            Última hora del día
            <Input
              type="number"
              min={0}
              max={23}
              value={form.last_hour}
              onChange={e => handleChange('last_hour', parseInt(e.target.value, 10) || 20)}
              className="w-16"
            />
          </Label>
        </div>

        <div className="space-y-4">
          <Label className="flex items-center justify-between gap-4">
            <span>Mostrar opción de vista del día</span>
            <Switch
              checked={form.show_day_view_option}
              onCheckedChange={v => handleChange('show_day_view_option', v)}
            />
          </Label>
          <Label className="flex items-center gap-2">
            Primera hora en vista de día
            <Input
              type="number"
              min={0}
              max={23}
              value={form.day_view_first_hour}
              onChange={e => handleChange('day_view_first_hour', parseInt(e.target.value, 10) || 8)}
              className="w-16"
            />
          </Label>
          <Label className="flex items-center gap-2">
            Última hora en vista de día
            <Input
              type="number"
              min={0}
              max={23}
              value={form.day_view_last_hour}
              onChange={e => handleChange('day_view_last_hour', parseInt(e.target.value, 10) || 18)}
              className="w-16"
            />
          </Label>
          <Label className="flex items-center justify-between gap-4">
            <span>Vista predeterminada: día actual</span>
            <Switch
              checked={form.default_view_current_day}
              onCheckedChange={v => handleChange('default_view_current_day', v)}
            />
          </Label>
          <Label className="flex items-center justify-between gap-4">
            <span>Permitir reserva fuera del horario de apertura</span>
            <Switch
              checked={form.allow_booking_outside_hours}
              onCheckedChange={v => handleChange('allow_booking_outside_hours', v)}
            />
          </Label>
          <Label className="flex items-center gap-2">
            Horas trabajadas en un día
            <Input
              type="number"
              min={1}
              max={24}
              value={form.worked_hours_per_day}
              onChange={e => handleChange('worked_hours_per_day', parseInt(e.target.value, 10) || 8)}
              className="w-16"
            />
          </Label>
        </div>

        <div className="md:col-span-2 space-y-4 border-t pt-4">
          <Label className="flex items-center justify-between gap-4">
            <span>Plan diario habilitado</span>
            <Switch
              checked={form.daily_plan_enabled}
              onCheckedChange={v => handleChange('daily_plan_enabled', v)}
            />
          </Label>
          <Label className="flex items-center justify-between gap-4">
            <span>Habilitar reservas internas</span>
            <Switch
              checked={form.internal_reservations_enabled}
              onCheckedChange={v => handleChange('internal_reservations_enabled', v)}
            />
          </Label>
          <Label className="flex items-center justify-between gap-4">
            <span>Etiquetas de cliente habilitadas</span>
            <Switch
              checked={form.client_labels_enabled}
              onCheckedChange={v => handleChange('client_labels_enabled', v)}
            />
          </Label>
          <Label className="flex items-center justify-between gap-4">
            <span>Crear tarea cuando cita con cliente con facturas impagadas</span>
            <Switch
              checked={form.create_task_unpaid_invoices}
              onCheckedChange={v => handleChange('create_task_unpaid_invoices', v)}
            />
          </Label>
          <Label className="flex items-center justify-between gap-4">
            <span>Mostrar horarios y tipos de turno en el calendario</span>
            <Switch
              checked={form.show_schedules_shift_types}
              onCheckedChange={v => handleChange('show_schedules_shift_types', v)}
            />
          </Label>
          <Label className="flex items-center justify-between gap-4">
            <span>Colores según estado de la cita y motivo de visita</span>
            <Switch
              checked={form.change_colors_by_status_reason}
              onCheckedChange={v => handleChange('change_colors_by_status_reason', v)}
            />
          </Label>
          <Label className="flex items-center justify-between gap-4">
            <span>Mostrar solo festivos nacionales</span>
            <Switch
              checked={form.show_only_national_holidays}
              onCheckedChange={v => handleChange('show_only_national_holidays', v)}
            />
          </Label>
          <Label className="flex items-center justify-between gap-4">
            <span>Advertencia si no se selecciona motivo de visita</span>
            <Switch
              checked={form.warn_if_no_visit_reason}
              onCheckedChange={v => handleChange('warn_if_no_visit_reason', v)}
            />
          </Label>
        </div>
      </div>
    </Card>
  );
}
