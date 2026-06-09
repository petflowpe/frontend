import { useCallback, useEffect, useMemo, useState } from 'react';
import { Globe, Save, Loader2, CreditCard, Users, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useCompanies } from '../../hooks/useCompanies';
import { getStoredCompanyId } from '../../utils/appointmentMappers';
import {
  calculatePortalAdvance,
  type PortalSettings as PortalSettingsType,
} from '../../utils/api/publicBooking';

const DEFAULT_PORTAL_SETTINGS: PortalSettingsType = {
  guest_booking_enabled: false,
  registered_only: true,
  require_advance: true,
  advance_type: 'percent',
  advance_value: 30,
  payment_mode: 'simulated',
  auto_confirm_on_advance: true,
  new_clients_require_approval: true,
};

const PREVIEW_PRICE = 100;

interface PortalSettingsProps {
  companyId?: number | null;
}

export function PortalSettings({ companyId }: PortalSettingsProps) {
  const { getCompanyConfig, updateCompanyConfig } = useCompanies();
  const resolvedCompanyId = companyId ?? getStoredCompanyId() ?? 1;

  const [form, setForm] = useState<PortalSettingsType>(DEFAULT_PORTAL_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!resolvedCompanyId) return;
    setLoading(true);
    try {
      const config = await getCompanyConfig(resolvedCompanyId, 'portal_settings');
      setForm({
        ...DEFAULT_PORTAL_SETTINGS,
        ...(config && typeof config === 'object' ? config : {}),
      });
    } catch {
      setForm(DEFAULT_PORTAL_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [getCompanyConfig, resolvedCompanyId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = <K extends keyof PortalSettingsType>(key: K, value: PortalSettingsType[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const advancePreview = useMemo(() => calculatePortalAdvance(PREVIEW_PRICE, form), [form]);

  const handleSave = async () => {
    if (!resolvedCompanyId) return;
    setSaving(true);
    try {
      await updateCompanyConfig(resolvedCompanyId, 'portal_settings', form as Record<string, unknown>);
      await loadSettings();
    } catch {
      /* toast en hook */
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando configuración del portal...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-background">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold">Portal de Reservas</h3>
              <Badge variant="outline" className="border-indigo-300 text-indigo-700">
                Empresa #{resolvedCompanyId}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Controla quién puede reservar desde el portal web, el adelanto al agendar y la confirmación automática de citas.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar portal
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <h4 className="font-semibold">Acceso al portal</h4>
          </div>

          <Label className="flex items-center justify-between gap-4">
            <span className="space-y-0.5">
              <span className="block font-medium">Solo clientes registrados</span>
              <span className="text-xs text-muted-foreground font-normal">
                Requiere cuenta en el portal; desactiva reservas como invitado.
              </span>
            </span>
            <Switch
              checked={form.registered_only}
              onCheckedChange={(v) => {
                handleChange('registered_only', v);
                if (v) handleChange('guest_booking_enabled', false);
              }}
            />
          </Label>

          <Label className="flex items-center justify-between gap-4">
            <span className="space-y-0.5">
              <span className="block font-medium">Permitir reserva como invitado</span>
              <span className="text-xs text-muted-foreground font-normal">
                Muestra el flujo sin login en la página pública de la clínica.
              </span>
            </span>
            <Switch
              checked={form.guest_booking_enabled}
              disabled={form.registered_only}
              onCheckedChange={(v) => handleChange('guest_booking_enabled', v)}
            />
          </Label>

          <Separator />

          <Label className="flex items-center justify-between gap-4">
            <span className="space-y-0.5">
              <span className="block font-medium">Nuevos clientes requieren aprobación</span>
              <span className="text-xs text-muted-foreground font-normal">
                Al registrarse en el portal quedan en estado pendiente hasta validación del staff.
              </span>
            </span>
            <Switch
              checked={form.new_clients_require_approval}
              onCheckedChange={(v) => handleChange('new_clients_require_approval', v)}
            />
          </Label>
        </Card>

        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <h4 className="font-semibold">Adelanto y pago</h4>
          </div>

          <Label className="flex items-center justify-between gap-4">
            <span className="space-y-0.5">
              <span className="block font-medium">Requerir adelanto al reservar</span>
              <span className="text-xs text-muted-foreground font-normal">
                El cliente verá el paso de pago antes de confirmar la cita.
              </span>
            </span>
            <Switch
              checked={form.require_advance}
              onCheckedChange={(v) => handleChange('require_advance', v)}
            />
          </Label>

          {form.require_advance && (
            <>
              <Label className="block">
                Tipo de adelanto
                <Select
                  value={form.advance_type}
                  onValueChange={(v) => handleChange('advance_type', v as PortalSettingsType['advance_type'])}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Porcentaje del servicio</SelectItem>
                    <SelectItem value="fixed">Monto fijo (S/)</SelectItem>
                  </SelectContent>
                </Select>
              </Label>

              <Label className="block">
                {form.advance_type === 'percent' ? 'Porcentaje de adelanto (%)' : 'Monto fijo de adelanto (S/)'}
                <Input
                  type="number"
                  min={0}
                  max={form.advance_type === 'percent' ? 100 : undefined}
                  step={form.advance_type === 'percent' ? 1 : 0.5}
                  className="mt-1"
                  value={form.advance_value}
                  onChange={(e) => handleChange('advance_value', Math.max(0, Number(e.target.value) || 0))}
                />
              </Label>
            </>
          )}

          <Label className="block">
            Modo de pago
            <Select
              value={form.payment_mode}
              onValueChange={(v) => handleChange('payment_mode', v as PortalSettingsType['payment_mode'])}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simulated">Simulado (MVP)</SelectItem>
                <SelectItem value="gateway" disabled>
                  Pasarela real (próximamente)
                </SelectItem>
              </SelectContent>
            </Select>
          </Label>

          <Label className="flex items-center justify-between gap-4">
            <span className="space-y-0.5">
              <span className="block font-medium">Confirmar cita al pagar adelanto</span>
              <span className="text-xs text-muted-foreground font-normal">
                La cita pasa a Confirmada automáticamente cuando se registra el adelanto.
              </span>
            </span>
            <Switch
              checked={form.auto_confirm_on_advance}
              onCheckedChange={(v) => handleChange('auto_confirm_on_advance', v)}
            />
          </Label>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          <h4 className="font-semibold">Vista previa y resumen</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg border p-4 bg-muted/30">
            <p className="text-muted-foreground mb-1">Servicio ejemplo</p>
            <p className="text-2xl font-bold">S/ {PREVIEW_PRICE.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800">
            <p className="text-muted-foreground mb-1">Adelanto calculado</p>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {form.require_advance ? `S/ ${advancePreview.toFixed(2)}` : 'Sin adelanto'}
            </p>
            {form.require_advance && (
              <p className="text-xs text-muted-foreground mt-1">
                {form.advance_type === 'percent'
                  ? `${form.advance_value}% del total`
                  : `Monto fijo S/ ${form.advance_value}`}
              </p>
            )}
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground mb-2">Comportamiento actual</p>
            <ul className="space-y-1 text-xs">
              <li>
                {form.registered_only && !form.guest_booking_enabled
                  ? '✅ Solo clientes con cuenta'
                  : form.guest_booking_enabled
                    ? '✅ Invitados habilitados'
                    : '⚠️ Revisar configuración de acceso'}
              </li>
              <li>
                {form.require_advance
                  ? `✅ Adelanto ${form.advance_type === 'percent' ? `${form.advance_value}%` : `S/ ${form.advance_value}`}`
                  : '— Sin adelanto'}
              </li>
              <li>
                {form.auto_confirm_on_advance && form.require_advance
                  ? '✅ Auto-confirmar al pagar'
                  : '— Staff valida en Confirmaciones'}
              </li>
              <li>
                {form.new_clients_require_approval
                  ? '✅ Registro portal → pendiente'
                  : '— Clientes nuevos sin validación'}
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
