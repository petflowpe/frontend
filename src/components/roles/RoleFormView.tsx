import type { Dispatch, SetStateAction } from 'react';
import {
  ArrowLeft,
  CheckSquare,
  Info,
  Save,
  Shield,
  Square,
  FileText,
  KeyRound,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Switch } from '../ui/switch';
import type { PermissionItem } from '../../hooks/usePermissions';
import type { EditorState } from './roleEditorUtils';

export interface RoleCategoryRow {
  id: string;
  label: string;
  items: PermissionItem[];
}

interface RoleFormViewProps {
  mode: 'create' | 'edit';
  editor: EditorState;
  setEditor: Dispatch<SetStateAction<EditorState>>;
  categories: RoleCategoryRow[];
  totalPermissions: number;
  permsLoading: boolean;
  saving: boolean;
  onBackToUsers: () => void;
  onBackToRoleList: () => void;
  onSave: () => void;
  togglePermission: (name: string) => void;
  toggleCategory: (items: PermissionItem[], on: boolean) => void;
  selectAll: (on: boolean) => void;
}

export function RoleFormView({
  mode,
  editor,
  setEditor,
  categories,
  totalPermissions,
  permsLoading,
  saving,
  onBackToUsers,
  onBackToRoleList,
  onSave,
  togglePermission,
  toggleCategory,
  selectAll,
}: RoleFormViewProps) {
  const isEdit = mode === 'edit';
  const title = isEdit ? 'Editar rol' : 'Crear rol';
  const crumbAction = isEdit ? 'Editar rol' : 'Crear rol';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex min-h-0 w-full max-w-full flex-col">
      <div className="border-border/60 bg-card/20 mb-6 rounded-xl border p-4 shadow-sm sm:p-6">
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground mb-4 -ml-2 gap-2"
          onClick={onBackToRoleList}
        >
          <ArrowLeft className="size-4 shrink-0" />
          Volver a Roles
        </Button>

        <nav className="text-muted-foreground mb-4 flex flex-wrap items-center gap-1.5 text-sm" aria-label="Migas de pan">
          <button type="button" className="hover:text-foreground transition-colors" onClick={onBackToUsers}>
            Gestión de Usuarios
          </button>
          <span className="opacity-50">/</span>
          <button type="button" className="hover:text-foreground transition-colors" onClick={onBackToRoleList}>
            Roles
          </button>
          <span className="opacity-50">/</span>
          <span className="text-foreground font-medium">{crumbAction}</span>
        </nav>

        <div className="min-w-0 space-y-2">
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed sm:text-base">
            {isEdit
              ? 'Ajusta nombre, descripción, estado y permisos del rol seleccionado.'
              : 'Define un rol personalizado y asigna los permisos por módulo.'}
          </p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 pb-40 xl:grid-cols-2">
        {/* Datos del rol */}
        <Card className="border-border/80 shadow-sm xl:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                <FileText className="size-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Datos del rol</CardTitle>
                <CardDescription>Nombre visible, identificador interno y estado.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {editor.protected ? (
              <Alert className="border-amber-500/50 bg-amber-50/90 dark:bg-amber-950/30">
                <Shield className="size-4 text-amber-600" />
                <AlertTitle className="text-amber-900 dark:text-amber-200">Rol protegido del sistema</AlertTitle>
                <AlertDescription className="text-amber-800/95 dark:text-amber-300/90 text-sm">
                  Solo puedes modificar la descripción y los permisos. El identificador y el estado activo no son editables.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-7">
                <Label htmlFor="role-display" className="text-base">
                  Nombre visible *
                </Label>
                <Input
                  id="role-display"
                  className="mt-1.5 h-11 text-base md:text-sm"
                  value={editor.display_name}
                  onChange={(e) => setEditor((prev) => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Ej: Gerente de tienda"
                />
              </div>
              <div className="flex flex-col justify-center rounded-xl border border-border/80 bg-muted/25 px-4 py-4 lg:col-span-5">
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">Rol activo</p>
                    <p className="text-muted-foreground text-xs">Si está inactivo, nadie podrá asignarse este rol.</p>
                  </div>
                  <Switch
                    checked={editor.active}
                    disabled={editor.protected}
                    onCheckedChange={(val) => setEditor((prev) => ({ ...prev, active: val }))}
                  />
                </div>
              </div>
              <div className="lg:col-span-5">
                <Label htmlFor="role-slug" className="text-base">
                  Identificador (opcional)
                </Label>
                <Input
                  id="role-slug"
                  className="mt-1.5 h-11 font-mono text-base md:text-sm"
                  value={editor.name}
                  disabled={editor.protected || !!editor.id}
                  onChange={(e) =>
                    setEditor((prev) => ({
                      ...prev,
                      name: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
                    }))
                  }
                  placeholder="se genera automáticamente si se deja vacío"
                />
                <p className="text-muted-foreground mt-1.5 text-xs">Solo minúsculas, números, guión y guión bajo.</p>
              </div>
              <div className="lg:col-span-7">
                <Label htmlFor="role-desc" className="text-base">
                  Descripción
                </Label>
                <Textarea
                  id="role-desc"
                  rows={3}
                  className="mt-1.5 min-h-[5rem] resize-y text-base md:text-sm"
                  value={editor.description}
                  onChange={(e) => setEditor((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe las responsabilidades de este rol"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permisos */}
        <Card className="border-border/80 shadow-sm xl:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-2">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <KeyRound className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Permisos por módulo</CardTitle>
                  <CardDescription>
                    {editor.permissions.size} de {totalPermissions} permisos seleccionados
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => selectAll(true)}>
                  <CheckSquare className="mr-1 size-4" />
                  Todos
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => selectAll(false)}>
                  <Square className="mr-1 size-4" />
                  Ninguno
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {permsLoading ? <p className="text-muted-foreground text-sm">Cargando permisos…</p> : null}

            {!permsLoading && categories.length === 0 ? (
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Sin permisos cargados</AlertTitle>
                <AlertDescription>
                  El backend no devolvió permisos. Verifica que se haya ejecutado el seeder de permisos.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-4">
              {categories.map((cat) => {
                const selectedInCat = cat.items.filter((p) => editor.permissions.has(p.name)).length;
                const allSelected = cat.items.length > 0 && selectedInCat === cat.items.length;
                return (
                  <Card key={cat.id} className="border-border/60 bg-muted/5 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h5 className="font-semibold">{cat.label}</h5>
                        <p className="text-muted-foreground text-xs">
                          {selectedInCat} / {cat.items.length} seleccionados
                        </p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => toggleCategory(cat.items, !allSelected)}>
                        {allSelected ? (
                          <>
                            <Square className="mr-1 size-4" />
                            Quitar todos
                          </>
                        ) : (
                          <>
                            <CheckSquare className="mr-1 size-4" />
                            Seleccionar todos
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {cat.items.map((p) => (
                        <label
                          key={p.name}
                          className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-border/80"
                        >
                          <Checkbox
                            checked={editor.permissions.has(p.name)}
                            onCheckedChange={() => togglePermission(p.name)}
                            className="mt-0.5"
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium leading-snug">{p.display_name}</div>
                            <div className="text-muted-foreground font-mono text-xs">{p.name}</div>
                            {p.description ? (
                              <div className="text-muted-foreground mt-1 text-xs">{p.description}</div>
                            ) : null}
                          </div>
                        </label>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 z-20 -mx-4 mt-auto border-t px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-11 w-full sm:w-auto"
            onClick={onBackToRoleList}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="lg"
            className="min-h-11 w-full min-w-[180px] sm:w-auto"
            onClick={onSave}
            disabled={saving || !editor.display_name.trim()}
          >
            <Save className="mr-2 size-4" />
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear rol'}
          </Button>
        </div>
      </div>
    </div>
  );
}
