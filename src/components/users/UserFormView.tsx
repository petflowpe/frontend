import { useState, type Dispatch, SetStateAction } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ChevronRight,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Plus,
  Save,
  Shield,
  UserRound,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { NativeSelect } from './NativeSelect';
import type { User, UserFormState, CompanyBranchOption, DocumentType } from './types';
import { DOCUMENT_TYPES } from './types';
import type { Role } from '../../hooks/useRoles';
import { permissionsToDisplayList } from './permissionLabels';

export interface UserFormViewProps {
  mode: 'create' | 'edit';
  /** En alta: `modal` = diálogo superpuesto; `page` = vista completa (legacy). */
  layout?: 'page' | 'modal';
  editingUser: User | null;
  formData: UserFormState;
  setFormData: Dispatch<SetStateAction<UserFormState>>;
  apiRoles: Role[];
  rolesLoading: boolean;
  userFormRoleValue: string | undefined;
  loading: boolean;
  getRoleBadgeColor: (roleNameOrKey?: string) => string;
  onBack: () => void;
  onSave: () => void;
  /** Sedes de la empresa (para acceeso granular). */
  companyBranches?: CompanyBranchOption[];
}

const inputPremium =
  'h-11 rounded-xl border-border/60 bg-background/80 text-base shadow-sm md:text-sm focus-visible:ring-cyan-500/30';

export function UserFormView({
  mode,
  layout = 'page',
  editingUser,
  formData,
  setFormData,
  apiRoles,
  rolesLoading,
  userFormRoleValue,
  loading,
  getRoleBadgeColor,
  onBack,
  onSave,
  companyBranches = [],
}: UserFormViewProps) {
  const isEdit = mode === 'edit';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const title = isEdit ? 'Editar usuario' : 'Registrar Nuevo Usuario';
  const description = isEdit
    ? 'Actualiza los datos del colaborador y los permisos asociados a su rol.'
    : 'El Super Administrador asigna el correo y la contraseña de acceso. El usuario podrá ingresar con estas credenciales.';
  const crumbCurrent = isEdit ? 'Editar usuario' : 'Nuevo usuario';

  const selectedRole = apiRoles.find((r) => r.id === formData.role_id);
  const modulesLine = permissionsToDisplayList(selectedRole?.permissions);
  const activeBranchOptions = companyBranches.filter((b) => b.activo);

  const supabaseNote =
    typeof import.meta.env.VITE_SUPABASE_URL === 'string' && import.meta.env.VITE_SUPABASE_URL
      ? import.meta.env.VITE_SUPABASE_URL
      : null;

  // Layout modal: se usa tanto en alta (Nuevo Usuario) como en edición.
  if (layout === 'modal') {
    const headerBlock = (
      <div className="flex min-w-0 gap-3">
        <div className="bg-primary/15 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
          <KeyRound className="size-6" />
        </div>
        <div className="min-w-0 space-y-2 pr-2">
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed text-violet-200/80 dark:text-violet-300/75">
            {description}
          </p>
        </div>
      </div>
    );

    const gridBlock = (
      <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
          {/* Información general — rejilla amplia */}
          <Card className="border-border/70 bg-card/40 shadow-md backdrop-blur-sm xl:col-span-7 2xl:col-span-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Datos generales</CardTitle>
              <CardDescription>Identificación, contacto, rol y sedes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-8">
                  <Label htmlFor="uc-name" className="text-sm font-medium">
                    Nombre completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="uc-name"
                    className={`mt-1.5 ${inputPremium}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    autoComplete="name"
                  />
                </div>
                <div className="sm:col-span-4">
                  <Label htmlFor="uc-initials" className="text-sm font-medium">
                    Iniciales
                  </Label>
                  <Input
                    id="uc-initials"
                    className={`mt-1.5 ${inputPremium}`}
                    value={formData.initials}
                    onChange={(e) => setFormData({ ...formData, initials: e.target.value.slice(0, 12) })}
                    placeholder="JP"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="uc-email" className="text-sm font-medium">
                  Correo electrónico <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                  <Input
                    id="uc-email"
                    type="email"
                    className={`${inputPremium} pl-10`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juan@empresa.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-4">
                  <Label htmlFor="uc-doc-type" className="flex items-center gap-1.5 text-sm font-medium">
                    <CreditCard className="text-muted-foreground size-4" />
                    Tipo de documento
                  </Label>
                  <div className="mt-1.5">
                    <NativeSelect
                      id="uc-doc-type"
                      value={formData.documentType || ''}
                      onValueChange={(v) => setFormData({ ...formData, documentType: (v || '') as DocumentType | '' })}
                      className={`${inputPremium} h-11`}
                    >
                      <option value="">— Sin documento —</option>
                      {DOCUMENT_TYPES.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                </div>
                <div className="sm:col-span-8">
                  <Label htmlFor="uc-doc-num" className="text-sm font-medium">
                    Número de documento
                  </Label>
                  <Input
                    id="uc-doc-num"
                    className={`mt-1.5 ${inputPremium}`}
                    value={formData.documentNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        documentNumber: e.target.value.replace(/\s+/g, '').slice(0, 20),
                      })
                    }
                    placeholder="Ej. 71234567"
                    inputMode="text"
                    autoComplete="off"
                  />
                </div>
                <p className="text-muted-foreground sm:col-span-12 -mt-1 text-[11px] leading-relaxed">
                  Permite que el usuario inicie sesión también con su <strong>documento + contraseña</strong>.
                </p>
              </div>

              <div>
                <Label htmlFor="uc-role" className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="text-muted-foreground size-4" />
                  Rol asignado <span className="text-destructive">*</span>
                </Label>
                <div className="mt-1.5">
                  <NativeSelect
                    id="uc-role"
                    value={userFormRoleValue ?? ''}
                    onValueChange={(v) => setFormData({ ...formData, role_id: Number(v) })}
                    disabled={rolesLoading || !apiRoles.length}
                    className={`${inputPremium} h-11`}
                  >
                    {apiRoles.length === 0 ? (
                      <option value="">{rolesLoading ? 'Cargando roles…' : 'Sin roles disponibles'}</option>
                    ) : (
                      apiRoles.map((role) => (
                        <option key={role.id} value={String(role.id)}>
                          {role.display_name}
                        </option>
                      ))
                    )}
                  </NativeSelect>
                </div>
                {modulesLine ? (
                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed text-violet-200/75 dark:text-violet-300/70">
                    <span className="font-medium text-foreground/90">Módulos con acceso:</span> {modulesLine}
                  </p>
                ) : selectedRole ? (
                  <p className="text-muted-foreground mt-2 text-xs">
                    {selectedRole.description ?? 'Sin listado de permisos en este rol.'}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="text-muted-foreground size-5 shrink-0" />
                  <span className="text-sm font-medium">Acceso a sedes</span>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <Label htmlFor="uc-all-branches" className="text-muted-foreground cursor-pointer text-sm">
                    Todas las sedes
                  </Label>
                  <Switch
                    id="uc-all-branches"
                    checked={formData.allBranchesAccess}
                    onCheckedChange={(v) => {
                      if (v) {
                        setFormData({ ...formData, allBranchesAccess: true, branchIds: [] });
                      } else {
                        const ids = activeBranchOptions.map((b) => b.id);
                        setFormData({ ...formData, allBranchesAccess: false, branchIds: ids });
                      }
                    }}
                  />
                </div>
              </div>
              {!formData.allBranchesAccess ? (
                <div className="rounded-xl border border-border/50 bg-muted/10 px-4 py-3">
                  <p className="text-muted-foreground mb-3 text-xs leading-relaxed">
                    Elija las sedes a las que este usuario puede acceder (solo sedes habilitadas en configuración).
                  </p>
                  {activeBranchOptions.length === 0 ? (
                    <p className="text-amber-600 dark:text-amber-400 text-sm">
                      No hay sedes habilitadas. Créelas en «Unidades / Sedes» en el listado de usuarios.
                    </p>
                  ) : (
                    <ul className="max-h-44 space-y-2.5 overflow-y-auto pr-1">
                      {activeBranchOptions.map((b) => (
                        <li key={b.id}>
                          <label className="flex cursor-pointer items-center gap-3 text-sm">
                            <input
                              type="checkbox"
                              className="border-input accent-cyan-600 size-4 rounded"
                              checked={formData.branchIds.includes(b.id)}
                              onChange={(e) => {
                                const on = e.target.checked;
                                setFormData({
                                  ...formData,
                                  branchIds: on
                                    ? [...formData.branchIds, b.id]
                                    : formData.branchIds.filter((id) => id !== b.id),
                                });
                              }}
                            />
                            <span>{b.nombre}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Credenciales — columna lateral */}
          <Card className="border-border/70 bg-card/40 h-fit shadow-md backdrop-blur-sm xl:col-span-5 2xl:col-span-4">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="text-primary size-5" />
                <CardTitle className="text-lg">Credenciales de acceso</CardTitle>
              </div>
              <CardDescription>Contraseña de ingreso al sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="uc-password" className="text-sm font-medium">
                  Contraseña <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="uc-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`${inputPremium} pr-11`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="uc-confirm" className="text-sm font-medium">
                  Confirmar contraseña <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="uc-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    className={`${inputPremium} pr-11`}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repita la contraseña"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2"
                    onClick={() => setShowConfirm((s) => !s)}
                    aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    );

    const noteBlock =
      supabaseNote ? (
        <p className="text-muted-foreground mt-4 max-w-4xl text-xs leading-relaxed">
          Proyecto en uso:{' '}
          <span className="font-mono text-[11px] break-all">{supabaseNote}</span> — Debe coincidir con Project URL en
          Supabase → Settings → API
        </p>
      ) : null;

    const footerBlock = (
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="min-h-11 w-full rounded-xl sm:w-auto"
          onClick={onBack}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="button" size="lg" className="min-h-11 w-full rounded-xl sm:min-w-[200px] sm:w-auto" onClick={onSave} disabled={loading}>
          {isEdit ? (
            <Save className="mr-2 size-4" />
          ) : (
            <Plus className="mr-2 size-4" />
          )}
          {isEdit ? (loading ? 'Guardando…' : 'Guardar cambios') : loading ? 'Creando…' : 'Crear Usuario'}
        </Button>
      </div>
    );

    return (
      <div className="animate-in fade-in zoom-in-95 duration-200 flex max-h-[min(88vh,860px)] min-h-0 w-full min-w-0 flex-col px-5 pt-2 pb-1 sm:px-6">
        <div className="border-border/60 shrink-0 border-b pb-4">{headerBlock}</div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4">
          {gridBlock}
          {noteBlock}
        </div>
        <div className="border-border/60 bg-background/98 supports-[backdrop-filter]:bg-background/90 shrink-0 border-t pt-4 backdrop-blur-md">
          {footerBlock}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex min-h-0 w-full max-w-full flex-col">
      <div className="border-border/60 bg-card/20 mb-6 rounded-xl border p-4 shadow-sm sm:p-6">
        <Button type="button" variant="ghost" className="mb-4 -ml-2 gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ArrowLeft className="size-4 shrink-0" />
          Volver a Usuarios
        </Button>

        <nav className="text-muted-foreground mb-4 flex flex-wrap items-center gap-1.5 text-sm" aria-label="Migas de pan">
          <button type="button" className="hover:text-foreground transition-colors" onClick={onBack}>
            Gestión de Usuarios
          </button>
          <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden />
          <span className="text-foreground font-medium">{crumbCurrent}</span>
        </nav>

        <div className="min-w-0 space-y-2">
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed sm:text-base">{description}</p>
          {editingUser ? (
            <p className="text-muted-foreground font-mono text-xs">
              ID {editingUser.id} · {editingUser.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 pb-36 md:grid-cols-2 xl:grid-cols-2 xl:gap-8">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                <UserRound className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Información personal</CardTitle>
                <CardDescription>Datos de contacto y identificación del usuario.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <Label htmlFor="um-name" className="text-base">
                Nombre completo *
              </Label>
              <Input
                id="um-name"
                className="mt-1.5 h-11 text-base md:text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre y apellidos"
                autoComplete="name"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="um-initials" className="text-base">
                Iniciales
              </Label>
              <Input
                id="um-initials"
                className="mt-1.5 h-11 text-base md:text-sm"
                value={formData.initials}
                onChange={(e) => setFormData({ ...formData, initials: e.target.value.slice(0, 12) })}
                placeholder="JP"
                autoComplete="off"
              />
            </div>
            <div className="sm:col-span-4">
              <Label htmlFor="um-email" className="text-base">
                Correo electrónico *
              </Label>
              <div className="relative mt-1.5">
                <Mail className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="um-email"
                  type="email"
                  className="h-11 pl-10 text-base md:text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="correo@empresa.com"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="um-phone" className="text-base">
                Teléfono
              </Label>
              <Input
                id="um-phone"
                className="mt-1.5 h-11 text-base md:text-sm"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+51 …"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="um-doc-type" className="flex items-center gap-1.5 text-base">
                <CreditCard className="text-muted-foreground size-4" />
                Tipo de documento
              </Label>
              <div className="mt-1.5">
                <NativeSelect
                  id="um-doc-type"
                  value={formData.documentType || ''}
                  onValueChange={(v) => setFormData({ ...formData, documentType: (v || '') as DocumentType | '' })}
                >
                  <option value="">— Sin documento —</option>
                  {DOCUMENT_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>
            <div className="sm:col-span-4">
              <Label htmlFor="um-doc-num" className="text-base">
                Número de documento
              </Label>
              <Input
                id="um-doc-num"
                className="mt-1.5 h-11 text-base md:text-sm"
                value={formData.documentNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    documentNumber: e.target.value.replace(/\s+/g, '').slice(0, 20),
                  })
                }
                placeholder="Ej. 71234567"
                inputMode="text"
                autoComplete="off"
              />
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                El usuario podrá iniciar sesión con su <strong>documento + contraseña</strong> además de su correo.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Briefcase className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Información laboral</CardTitle>
                <CardDescription>Rol en el sistema y estado operativo.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="um-role" className="text-base">
                Rol *
              </Label>
              <div className="mt-1.5">
                <NativeSelect
                  id="um-role"
                  value={userFormRoleValue ?? ''}
                  onValueChange={(v) => setFormData({ ...formData, role_id: Number(v) })}
                  disabled={rolesLoading || !apiRoles.length}
                >
                  {apiRoles.length === 0 ? (
                    <option value="">{rolesLoading ? 'Cargando roles…' : 'Sin roles disponibles'}</option>
                  ) : (
                    apiRoles.map((role) => (
                      <option key={role.id} value={String(role.id)}>
                        {role.display_name}
                      </option>
                    ))
                  )}
                </NativeSelect>
              </div>
              {selectedRole ? (
                <p className="text-muted-foreground mt-2 text-xs">
                  Identificador: <span className="font-mono">{selectedRole.name}</span>
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="um-status" className="text-base">
                Estado
              </Label>
              <div className="mt-1.5">
                <NativeSelect
                  id="um-status"
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as UserFormState['status'] })}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </NativeSelect>
              </div>
            </div>
            <div className="border-border/50 flex flex-col gap-3 rounded-lg border px-3 py-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="text-muted-foreground size-4 shrink-0" />
                <span className="text-sm font-medium">Todas las sedes</span>
              </div>
              <Switch
                checked={formData.allBranchesAccess}
                onCheckedChange={(v) => {
                  if (v) {
                    setFormData({ ...formData, allBranchesAccess: true, branchIds: [] });
                  } else {
                    const ids = activeBranchOptions.map((b) => b.id);
                    setFormData({ ...formData, allBranchesAccess: false, branchIds: ids });
                  }
                }}
              />
            </div>
            {!formData.allBranchesAccess ? (
              <div className="border-border/50 rounded-lg border px-3 py-3 sm:col-span-2">
                <p className="text-muted-foreground mb-2 text-xs">Sedes permitidas para este usuario:</p>
                {activeBranchOptions.length === 0 ? (
                  <p className="text-amber-600 dark:text-amber-400 text-sm">
                    No hay sedes habilitadas. Configúrelas en «Unidades / Sedes».
                  </p>
                ) : (
                  <ul className="max-h-40 space-y-2 overflow-y-auto">
                    {activeBranchOptions.map((b) => (
                      <li key={b.id}>
                        <label className="flex cursor-pointer items-center gap-3 text-sm">
                          <input
                            type="checkbox"
                            className="border-input accent-cyan-600 size-4 rounded"
                            checked={formData.branchIds.includes(b.id)}
                            onChange={(e) => {
                              const on = e.target.checked;
                              setFormData({
                                ...formData,
                                branchIds: on
                                  ? [...formData.branchIds, b.id]
                                  : formData.branchIds.filter((id) => id !== b.id),
                              });
                            }}
                          />
                          <span>{b.nombre}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Lock className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Seguridad</CardTitle>
                <CardDescription>Opcional: define una nueva contraseña.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="um-password" className="text-base">
                Nueva contraseña
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="um-password"
                  type={showPassword ? 'text' : 'password'}
                  className="h-11 pr-10 text-base md:text-sm"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="um-confirm" className="text-base">
                Confirmar nueva contraseña
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="um-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className="h-11 pr-10 text-base md:text-sm"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {apiRoles.length > 0 && selectedRole ? (
        <Alert className="border-blue-500/40 bg-blue-50/80 dark:bg-blue-950/25 mb-6">
          <Shield className="size-4 text-blue-600" />
          <AlertTitle className="text-blue-900 dark:text-blue-200">Resumen del rol</AlertTitle>
          <AlertDescription className="text-blue-800/90 dark:text-blue-300/90">
            <div className="mt-2 flex flex-wrap items-start gap-3">
              <Badge className={getRoleBadgeColor(selectedRole.name)}>{selectedRole.display_name}</Badge>
              <span className="text-sm">{selectedRole.description ?? 'Sin descripción.'}</span>
            </div>
            <p className="mt-2 text-sm">Los permisos efectivos se gestionan en el backend según este rol.</p>
          </AlertDescription>
        </Alert>
      ) : null}

      <Separator className="mb-4 opacity-40" />

      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 z-20 -mx-4 mt-auto border-t px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto min-h-11" onClick={onBack} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" size="lg" className="w-full min-h-11 sm:w-auto sm:min-w-[200px]" onClick={onSave} disabled={loading}>
            <Save className="mr-2 size-4" />
            {loading ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}
