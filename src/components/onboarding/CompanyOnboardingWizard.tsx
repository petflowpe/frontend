import { useMemo, useState } from 'react';
import { Building2, MapPin, UserRound, CheckCircle2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { apiClient } from '../../utils/api/client';
import { API } from '../../utils/api/endpoints';

type Step = 1 | 2 | 3 | 4;

export type OnboardingResult = {
  company: { id: number; ruc: string; razon_social: string };
  branch: { id: number; nombre: string; codigo?: string };
  admin: { id: number; email: string; name: string };
  next_steps?: string[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: (result: OnboardingResult) => void;
}

const emptyCompany = {
  ruc: '',
  razon_social: '',
  nombre_comercial: '',
  direccion: '',
  ubigeo: '150101',
  distrito: 'Lima',
  provincia: 'Lima',
  departamento: 'Lima',
  telefono: '',
  email: '',
  web: '',
};

export function CompanyOnboardingWizard({ open, onOpenChange, onCompleted }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState({ ...emptyCompany });
  const [branch, setBranch] = useState({
    codigo: '001',
    nombre: 'Sucursal Principal',
    direccion: '',
  });
  const [admin, setAdmin] = useState({
    name: '',
    email: '',
    password: '',
    password_confirm: '',
  });

  const stepTitle = useMemo(() => {
    switch (step) {
      case 1:
        return 'Datos de la empresa';
      case 2:
        return 'Sucursal principal';
      case 3:
        return 'Administrador';
      default:
        return 'Confirmación';
    }
  }, [step]);

  const reset = () => {
    setStep(1);
    setCompany({ ...emptyCompany });
    setBranch({ codigo: '001', nombre: 'Sucursal Principal', direccion: '' });
    setAdmin({ name: '', email: '', password: '', password_confirm: '' });
    setSaving(false);
  };

  const close = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!/^\d{11}$/.test(company.ruc)) {
        toast.error('RUC debe tener 11 dígitos');
        return false;
      }
      if (!company.razon_social.trim() || !company.direccion.trim() || !company.email.trim()) {
        toast.error('Completa RUC, razón social, dirección y email');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!branch.nombre.trim() || !branch.codigo.trim()) {
        toast.error('Completa nombre y código de sucursal');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!admin.name.trim() || !admin.email.trim() || !admin.password) {
        toast.error('Completa nombre, email y contraseña del administrador');
        return false;
      }
      if (admin.password !== admin.password_confirm) {
        toast.error('Las contraseñas no coinciden');
        return false;
      }
      if (!/[A-Z]/.test(admin.password) || !/[a-z]/.test(admin.password) || !/\d/.test(admin.password) || admin.password.length < 8) {
        toast.error('La clave debe tener mínimo 8 caracteres, mayúscula, minúscula y número');
        return false;
      }
      return true;
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step === 1 && !branch.direccion) {
      setBranch((b) => ({ ...b, direccion: company.direccion }));
    }
    if (step === 1 && !admin.email && company.email) {
      // no auto-fill admin email from company; leave empty
    }
    setStep((s) => Math.min(4, (s + 1) as Step));
  };

  const back = () => setStep((s) => Math.max(1, (s - 1) as Step));

  const submit = async () => {
    if (!validateStep()) return;
    setSaving(true);
    try {
      const res = await apiClient.post<{ success?: boolean; data?: OnboardingResult; message?: string }>(
        API.companies.onboarding,
        {
          company: {
            ...company,
            nombre_comercial: company.nombre_comercial || company.razon_social,
            web: company.web || undefined,
            telefono: company.telefono || undefined,
          },
          branch: {
            codigo: branch.codigo,
            nombre: branch.nombre,
            direccion: branch.direccion || company.direccion,
          },
          admin: {
            name: admin.name,
            email: admin.email,
            password: admin.password,
          },
        }
      );
      const data = (res as any)?.data ?? res;
      toast.success('Empresa creada con sucursal y administrador');
      onCompleted(data as OnboardingResult);
      close(false);
    } catch (e: any) {
      toast.error(e?.message || 'No se pudo completar el onboarding');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            Alta de empresa (SaaS)
          </DialogTitle>
          <DialogDescription>
            Paso {step} de 4 — {stepTitle}. Se crea empresa + sede + admin en una sola operación.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bg-blue-600' : 'bg-muted'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>RUC *</Label>
              <Input value={company.ruc} maxLength={11} onChange={(e) => setCompany({ ...company, ruc: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Razón social *</Label>
              <Input value={company.razon_social} onChange={(e) => setCompany({ ...company, razon_social: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Nombre comercial</Label>
              <Input value={company.nombre_comercial} onChange={(e) => setCompany({ ...company, nombre_comercial: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Dirección *</Label>
              <Input value={company.direccion} onChange={(e) => setCompany({ ...company, direccion: e.target.value })} />
            </div>
            <div>
              <Label>Distrito</Label>
              <Input value={company.distrito} onChange={(e) => setCompany({ ...company, distrito: e.target.value })} />
            </div>
            <div>
              <Label>Ubigeo</Label>
              <Input value={company.ubigeo} maxLength={6} onChange={(e) => setCompany({ ...company, ubigeo: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div>
              <Label>Email empresa *</Label>
              <Input type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input value={company.telefono} onChange={(e) => setCompany({ ...company, telefono: e.target.value })} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Series por defecto: F001 / B001 (editables después)
            </div>
            <div>
              <Label>Código sede *</Label>
              <Input value={branch.codigo} onChange={(e) => setBranch({ ...branch, codigo: e.target.value })} />
            </div>
            <div>
              <Label>Nombre sede *</Label>
              <Input value={branch.nombre} onChange={(e) => setBranch({ ...branch, nombre: e.target.value })} />
            </div>
            <div>
              <Label>Dirección sede</Label>
              <Input
                value={branch.direccion}
                placeholder={company.direccion || 'Usa la dirección de la empresa'}
                onChange={(e) => setBranch({ ...branch, direccion: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserRound className="h-4 w-4" />
              Este usuario será company_admin de la nueva empresa
            </div>
            <div>
              <Label>Nombre *</Label>
              <Input value={admin.name} onChange={(e) => setAdmin({ ...admin, name: e.target.value })} />
            </div>
            <div>
              <Label>Email acceso *</Label>
              <Input type="email" value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} />
            </div>
            <div>
              <Label>Contraseña *</Label>
              <Input type="password" value={admin.password} onChange={(e) => setAdmin({ ...admin, password: e.target.value })} />
            </div>
            <div>
              <Label>Confirmar contraseña *</Label>
              <Input type="password" value={admin.password_confirm} onChange={(e) => setAdmin({ ...admin, password_confirm: e.target.value })} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3 rounded-lg border p-4 text-sm">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Resumen
            </div>
            <p><span className="text-muted-foreground">Empresa:</span> {company.razon_social} ({company.ruc})</p>
            <p><span className="text-muted-foreground">Sede:</span> {branch.nombre} · {branch.codigo}</p>
            <p><span className="text-muted-foreground">Admin:</span> {admin.name} &lt;{admin.email}&gt;</p>
            <p className="text-xs text-muted-foreground">
              SUNAT queda en modo DEMO/beta. Podrás configurar certificado y SOL después.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" disabled={saving || step === 1} onClick={back}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Atrás
          </Button>
          {step < 4 ? (
            <Button onClick={next}>
              Siguiente
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear empresa
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
