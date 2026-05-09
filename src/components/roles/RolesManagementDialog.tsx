import { useEffect, useMemo, useState } from 'react';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Save,
  X,
  Users as UsersIcon,
  CheckSquare,
  Square,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Switch } from '../ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import type { Role, RolePayload } from '../../hooks/useRoles';
import { usePermissions, type PermissionItem } from '../../hooks/usePermissions';

interface RolesManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  loading?: boolean;
  onCreate: (payload: RolePayload) => Promise<Role | null>;
  onUpdate: (id: number, payload: Partial<RolePayload>) => Promise<Role | null>;
  onToggle: (id: number) => Promise<Role | null>;
  onDelete: (id: number) => Promise<boolean>;
}

type View = 'list' | 'editor';

interface EditorState {
  id?: number;
  name: string;
  display_name: string;
  description: string;
  active: boolean;
  permissions: Set<string>;
  is_system: boolean;
  protected: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  system: 'Sistema',
  companies: 'Empresas',
  users: 'Usuarios',
  invoices: 'Facturas',
  boletas: 'Boletas',
  credit_notes: 'Notas de crédito',
  debit_notes: 'Notas de débito',
  dispatch_guides: 'Guías de remisión',
  daily_summaries: 'Resúmenes diarios',
  voided_documents: 'Comunicaciones de baja',
  reports: 'Reportes',
  config: 'Configuración',
  pets: 'Mascotas',
  medical_records: 'Historial médico',
  general: 'General',
};

function emptyEditor(): EditorState {
  return {
    name: '',
    display_name: '',
    description: '',
    active: true,
    permissions: new Set<string>(),
    is_system: false,
    protected: false,
  };
}

function toEditor(role: Role): EditorState {
  return {
    id: role.id,
    name: role.name,
    display_name: role.display_name,
    description: role.description ?? '',
    active: role.active ?? true,
    permissions: new Set(role.permissions ?? []),
    is_system: !!role.is_system,
    protected: !!role.protected,
  };
}

export function RolesManagementDialog({
  open,
  onOpenChange,
  roles,
  loading,
  onCreate,
  onUpdate,
  onToggle,
  onDelete,
}: RolesManagementDialogProps) {
  const [view, setView] = useState<View>('list');
  const [editor, setEditor] = useState<EditorState>(emptyEditor());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const { byCategory, loading: permsLoading, fetchPermissions } = usePermissions();

  useEffect(() => {
    if (open) {
      fetchPermissions(true);
    }
  }, [open, fetchPermissions]);

  useEffect(() => {
    if (!open) {
      setView('list');
      setEditor(emptyEditor());
    }
  }, [open]);

  const categories = useMemo(
    () =>
      Object.entries(byCategory).map(([cat, items]) => ({
        id: cat,
        label: CATEGORY_LABELS[cat] ?? cat,
        items: (items as PermissionItem[]) ?? [],
      })),
    [byCategory],
  );

  const totalPermissions = useMemo(
    () => categories.reduce((acc, c) => acc + c.items.length, 0),
    [categories],
  );

  const handleOpenNew = () => {
    setEditor(emptyEditor());
    setView('editor');
  };

  const handleOpenEdit = (role: Role) => {
    setEditor(toEditor(role));
    setView('editor');
  };

  const togglePermission = (name: string) => {
    setEditor(prev => {
      const next = new Set(prev.permissions);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return { ...prev, permissions: next };
    });
  };

  const toggleCategory = (catItems: PermissionItem[], on: boolean) => {
    setEditor(prev => {
      const next = new Set(prev.permissions);
      for (const p of catItems) {
        if (on) next.add(p.name);
        else next.delete(p.name);
      }
      return { ...prev, permissions: next };
    });
  };

  const selectAll = (on: boolean) => {
    setEditor(prev => {
      if (!on) return { ...prev, permissions: new Set<string>() };
      const next = new Set<string>();
      for (const c of categories) for (const p of c.items) next.add(p.name);
      return { ...prev, permissions: next };
    });
  };

  const handleSave = async () => {
    if (!editor.display_name.trim()) {
      return;
    }
    setSaving(true);
    const payload: RolePayload = {
      display_name: editor.display_name.trim(),
      description: editor.description.trim() || null,
      active: editor.active,
      permissions: Array.from(editor.permissions),
    };
    if (!editor.protected && editor.name.trim() && !editor.id) {
      payload.name = editor.name.trim();
    }
    const result = editor.id
      ? await onUpdate(editor.id, payload)
      : await onCreate(payload);
    setSaving(false);
    if (result) {
      setView('list');
      setEditor(emptyEditor());
    }
  };

  const handleToggle = async (role: Role) => {
    if (role.protected || role.is_system) return;
    await onToggle(role.id);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    const ok = await onDelete(deleting.id);
    if (ok) setDeleting(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configuración de Roles
            </DialogTitle>
            <DialogDescription>
              {view === 'list'
                ? 'Crea y administra los roles del sistema y los módulos a los que tienen acceso.'
                : editor.id
                  ? `Editando: ${editor.display_name || editor.name}`
                  : 'Crear nuevo rol personalizado'}
            </DialogDescription>
          </DialogHeader>

          {view === 'list' && (
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {roles.length} roles registrados · {totalPermissions} permisos disponibles
                </div>
                <Button onClick={handleOpenNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Rol
                </Button>
              </div>

              {loading && <p className="text-sm text-muted-foreground">Cargando roles...</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map(role => (
                  <Card key={role.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">{role.display_name}</h3>
                          {role.is_system && (
                            <Badge variant="secondary" className="text-xs">
                              Sistema
                            </Badge>
                          )}
                          {role.active === false && (
                            <Badge variant="outline" className="text-xs">
                              Inactivo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {role.name}
                        </p>
                        {role.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {role.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          <UsersIcon className="h-3 w-3 mr-1" />
                          {role.users_count ?? 0}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {(role.permissions ?? []).length} permisos
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenEdit(role)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={role.protected || role.is_system}
                        onClick={() => handleToggle(role)}
                        title={
                          role.protected || role.is_system
                            ? 'No se puede desactivar un rol de sistema'
                            : role.active
                              ? 'Desactivar'
                              : 'Activar'
                        }
                      >
                        {role.active ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Unlock className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={role.protected || role.is_system}
                        onClick={() => setDeleting(role)}
                        className="text-destructive"
                        title={
                          role.protected || role.is_system
                            ? 'No se puede eliminar un rol de sistema'
                            : 'Eliminar'
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {view === 'editor' && (
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              {editor.protected && (
                <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800 dark:text-amber-300">
                    Rol protegido del sistema
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 dark:text-amber-400 text-sm">
                    Solo puedes modificar la descripción y los permisos. El nombre y el
                    estado no se pueden cambiar.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre visible *</Label>
                  <Input
                    value={editor.display_name}
                    onChange={e =>
                      setEditor(prev => ({ ...prev, display_name: e.target.value }))
                    }
                    placeholder="Ej: Gerente de Tienda"
                  />
                </div>
                <div>
                  <Label>Identificador (opcional)</Label>
                  <Input
                    value={editor.name}
                    disabled={editor.protected || !!editor.id}
                    onChange={e =>
                      setEditor(prev => ({
                        ...prev,
                        name: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
                      }))
                    }
                    placeholder="se genera automáticamente si se deja vacío"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Solo minúsculas, números, guión y guión bajo.
                  </p>
                </div>
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  rows={2}
                  value={editor.description}
                  onChange={e =>
                    setEditor(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe brevemente las responsabilidades del rol"
                />
              </div>

              <div className="flex items-center justify-between border rounded-md px-4 py-3">
                <div>
                  <div className="font-medium">Rol activo</div>
                  <p className="text-xs text-muted-foreground">
                    Los usuarios no podrán usar un rol inactivo
                  </p>
                </div>
                <Switch
                  checked={editor.active}
                  disabled={editor.protected}
                  onCheckedChange={val =>
                    setEditor(prev => ({ ...prev, active: val }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Permisos por módulo
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {editor.permissions.size} de {totalPermissions} permisos seleccionados
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => selectAll(true)}>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Todos
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => selectAll(false)}>
                    <Square className="h-4 w-4 mr-1" />
                    Ninguno
                  </Button>
                </div>
              </div>

              {permsLoading && (
                <p className="text-sm text-muted-foreground">Cargando permisos...</p>
              )}

              {!permsLoading && categories.length === 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Sin permisos cargados</AlertTitle>
                  <AlertDescription>
                    El backend no devolvió permisos. Verifica que se haya ejecutado el
                    seeder de permisos.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {categories.map(cat => {
                  const selectedInCat = cat.items.filter(p =>
                    editor.permissions.has(p.name),
                  ).length;
                  const allSelected = selectedInCat === cat.items.length;
                  return (
                    <Card key={cat.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="font-semibold">{cat.label}</h5>
                          <p className="text-xs text-muted-foreground">
                            {selectedInCat} / {cat.items.length} seleccionados
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(cat.items, !allSelected)}
                        >
                          {allSelected ? (
                            <>
                              <Square className="h-4 w-4 mr-1" />
                              Quitar todos
                            </>
                          ) : (
                            <>
                              <CheckSquare className="h-4 w-4 mr-1" />
                              Seleccionar todos
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {cat.items.map(p => (
                          <label
                            key={p.name}
                            className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                          >
                            <Checkbox
                              checked={editor.permissions.has(p.name)}
                              onCheckedChange={() => togglePermission(p.name)}
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-medium leading-tight">
                                {p.display_name}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {p.name}
                              </div>
                              {p.description && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {p.description}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter className="p-6 pt-4 border-t">
            {view === 'editor' ? (
              <>
                <Button variant="outline" onClick={() => setView('list')} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <Button onClick={handleSave} disabled={saving || !editor.display_name.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  {editor.id ? 'Guardar cambios' : 'Crear rol'}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar rol</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminar el rol{' '}
              <strong>{deleting?.display_name}</strong>? Esta acción no se puede deshacer.
              Si hay usuarios asignados a este rol la operación será bloqueada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default RolesManagementDialog;
