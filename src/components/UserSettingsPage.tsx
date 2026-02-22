import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor, Globe, Bell, Mail, FileText, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useSettings } from '../hooks/useSettings';
import { LoadingSpinner } from './LoadingSpinner';

export function UserSettingsPage() {
  const { settings, loading, fetchSettings, updateSettings } = useSettings();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState('es');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifInvoices, setNotifInvoices] = useState(true);
  const [notifAppointments, setNotifAppointments] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme ?? 'system');
      setLanguage(settings.language ?? 'es');
      setNotifEmail(settings.notifications?.email ?? true);
      setNotifPush(settings.notifications?.push ?? true);
      setNotifInvoices(settings.notifications?.invoices ?? true);
      setNotifAppointments(settings.notifications?.appointments ?? true);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        theme,
        language,
        notifications: {
          email: notifEmail,
          push: notifPush,
          invoices: notifInvoices,
          appointments: notifAppointments,
        },
      });
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else if (theme === 'light') document.documentElement.classList.remove('dark');
      else document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Configuración de usuario</h1>
      <p className="text-muted-foreground">Preferencias de apariencia y notificaciones.</p>

      <Card className="p-6 space-y-4">
        <h2 className="font-medium flex items-center gap-2">
          <Monitor className="h-4 w-4" /> Tema
        </h2>
        <Select value={theme} onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">
              <span className="flex items-center gap-2"><Sun className="h-4 w-4" /> Claro</span>
            </SelectItem>
            <SelectItem value="dark">
              <span className="flex items-center gap-2"><Moon className="h-4 w-4" /> Oscuro</span>
            </SelectItem>
            <SelectItem value="system">
              <span className="flex items-center gap-2"><Monitor className="h-4 w-4" /> Seguir sistema</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" /> Idioma
        </h2>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notificaciones
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Correo electrónico
            </Label>
            <Switch id="notif-email" checked={notifEmail} onCheckedChange={setNotifEmail} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-push" className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notificaciones push
            </Label>
            <Switch id="notif-push" checked={notifPush} onCheckedChange={setNotifPush} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Facturación y documentos
            </Label>
            <Switch id="notif-invoices" checked={notifInvoices} onCheckedChange={setNotifInvoices} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Citas y recordatorios
            </Label>
            <Switch id="notif-appointments" checked={notifAppointments} onCheckedChange={setNotifAppointments} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </Button>
      </div>
    </div>
  );
}
