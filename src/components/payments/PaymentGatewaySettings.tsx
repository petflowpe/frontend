import { Loader2, Save, TestTube } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { usePaymentGateways } from '../../hooks/usePaymentGateways';

export function PaymentGatewaySettings() {
  const { config, form, setForm, loading, saving, testing, save, testGateway } =
    usePaymentGateways();

  if (loading) {
    return (
      <div className="flex justify-center py-12 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Cargando pasarelas…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Mercado Pago</span>
            <Badge variant={config.mercado_pago.enabled ? 'default' : 'secondary'}>
              {config.mercado_pago.enabled ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <Switch
            checked={form.mercado_pago.enabled}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, mercado_pago: { ...f.mercado_pago, enabled: v } }))
            }
          />
        </div>
        <div className="space-y-3">
          <div>
            <Label>Ambiente</Label>
            <Select
              value={form.mercado_pago.environment}
              onValueChange={(v: 'sandbox' | 'production') =>
                setForm((f) => ({
                  ...f,
                  mercado_pago: { ...f.mercado_pago, environment: v },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (pruebas)</SelectItem>
                <SelectItem value="production">Producción</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Public Key</Label>
            <Input
              value={form.mercado_pago.public_key}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  mercado_pago: { ...f.mercado_pago, public_key: e.target.value },
                }))
              }
              placeholder="APP_USR-…"
            />
          </div>
          <div>
            <Label>Access Token {config.mercado_pago.has_access_token && '(guardado)'}</Label>
            <Input
              type="password"
              value={form.mercado_pago.access_token}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  mercado_pago: { ...f.mercado_pago, access_token: e.target.value },
                }))
              }
              placeholder={config.mercado_pago.has_access_token ? '••••••••' : 'Token de acceso'}
            />
          </div>
          <div>
            <Label>Webhook secret (opcional)</Label>
            <Input
              type="password"
              value={form.mercado_pago.webhook_secret}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  mercado_pago: { ...f.mercado_pago, webhook_secret: e.target.value },
                }))
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Webhook: <code className="bg-muted px-1 rounded">POST /api/public/webhooks/mercadopago?company_id=ID</code>
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={testing === 'mercado_pago'}
            onClick={() => testGateway('mercado_pago')}
          >
            {testing === 'mercado_pago' ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4 mr-1" />
            )}
            Probar conexión
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Niubiz</span>
            <Badge variant={config.niubiz.enabled ? 'default' : 'secondary'}>
              {config.niubiz.enabled ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          <Switch
            checked={form.niubiz.enabled}
            onCheckedChange={(v) =>
              setForm((f) => ({ ...f, niubiz: { ...f.niubiz, enabled: v } }))
            }
          />
        </div>
        <div className="space-y-3">
          <div>
            <Label>Ambiente</Label>
            <Select
              value={form.niubiz.environment}
              onValueChange={(v: 'sandbox' | 'production') =>
                setForm((f) => ({
                  ...f,
                  niubiz: { ...f.niubiz, environment: v },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox</SelectItem>
                <SelectItem value="production">Producción</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Merchant ID</Label>
            <Input
              value={form.niubiz.merchant_id}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  niubiz: { ...f.niubiz, merchant_id: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <Label>Usuario API</Label>
            <Input
              value={form.niubiz.user}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  niubiz: { ...f.niubiz, user: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <Label>Contraseña {config.niubiz.has_password && '(guardada)'}</Label>
            <Input
              type="password"
              value={form.niubiz.password}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  niubiz: { ...f.niubiz, password: e.target.value },
                }))
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Webhook: <code className="bg-muted px-1 rounded">POST /api/public/webhooks/niubiz</code>
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={testing === 'niubiz'}
            onClick={() => testGateway('niubiz')}
          >
            {testing === 'niubiz' ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <TestTube className="w-4 h-4 mr-1" />
            )}
            Probar conexión
          </Button>
        </div>
      </Card>

      <div className="lg:col-span-2 flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar pasarelas
        </Button>
      </div>
    </div>
  );
}
