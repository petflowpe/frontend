import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { PermissionItem } from '../../hooks/usePermissions';
import { usePermissions } from '../../hooks/usePermissions';
import type { Role, RolePayload } from '../../hooks/useRoles';
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
import { CATEGORY_LABELS, emptyEditor, serializeEditorState, toEditor, type EditorState } from './roleEditorUtils';
import { RolesListView } from './RolesListView';
import { RoleFormView } from './RoleFormView';

export type RoleManagementSubView = 'list' | 'create' | 'edit';

interface RolesModuleProps {
  onBackToUsers: () => void;
  roles: Role[];
  loading?: boolean;
  fetchRoles: (queryParams?: Record<string, string>) => Promise<void>;
  onCreate: (payload: RolePayload) => Promise<Role | null>;
  onUpdate: (id: number, payload: Partial<RolePayload>) => Promise<Role | null>;
  onToggle: (id: number) => Promise<Role | null>;
  onDelete: (id: number) => Promise<boolean>;
}

export function RolesModule({
  onBackToUsers,
  roles,
  loading,
  fetchRoles,
  onCreate,
  onUpdate,
  onToggle,
  onDelete,
}: RolesModuleProps) {
  const [subView, setSubView] = useState<RoleManagementSubView>('list');
  const [editor, setEditor] = useState<EditorState>(emptyEditor());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const editorBaselineRef = useRef<string>('');

  const { byCategory, loading: permsLoading, fetchPermissions } = usePermissions();

  const isEditorDirty = () =>
    (subView === 'create' || subView === 'edit') &&
    editorBaselineRef.current !== '' &&
    serializeEditorState(editor) !== editorBaselineRef.current;

  const resetEditorSession = () => {
    setSubView('list');
    setEditor(emptyEditor());
    editorBaselineRef.current = '';
  };

  const backToRoleList = () => {
    if ((subView === 'create' || subView === 'edit') && isEditorDirty()) {
      const ok = window.confirm('Hay cambios sin guardar. ¿Volver al listado y descartarlos?');
      if (!ok) return;
    }
    resetEditorSession();
  };

  useEffect(() => {
    fetchPermissions(true);
  }, [fetchPermissions]);

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
    const next = emptyEditor();
    setEditor(next);
    editorBaselineRef.current = serializeEditorState(next);
    setSubView('create');
  };

  const handleOpenEdit = (role: Role) => {
    const next = toEditor(role);
    setEditor(next);
    editorBaselineRef.current = serializeEditorState(next);
    setSubView('edit');
  };

  const togglePermission = (name: string) => {
    setEditor((prev) => {
      const next = new Set(prev.permissions);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return { ...prev, permissions: next };
    });
  };

  const toggleCategory = (catItems: PermissionItem[], on: boolean) => {
    setEditor((prev) => {
      const next = new Set(prev.permissions);
      for (const p of catItems) {
        if (on) next.add(p.name);
        else next.delete(p.name);
      }
      return { ...prev, permissions: next };
    });
  };

  const selectAll = (on: boolean) => {
    setEditor((prev) => {
      if (!on) return { ...prev, permissions: new Set<string>() };
      const next = new Set<string>();
      for (const c of categories) for (const p of c.items) next.add(p.name);
      return { ...prev, permissions: next };
    });
  };

  const handleSave = async () => {
    if (!editor.display_name.trim()) {
      toast.error('Indica un nombre visible para el rol');
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
    const result = editor.id ? await onUpdate(editor.id, payload) : await onCreate(payload);
    setSaving(false);
    if (result) {
      editorBaselineRef.current = '';
      resetEditorSession();
      await fetchRoles({ include_inactive: '1' });
    }
  };

  const handleToggleRole = async (role: Role) => {
    if (role.protected || role.is_system) return;
    await onToggle(role.id);
    await fetchRoles({ include_inactive: '1' });
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    const ok = await onDelete(deleting.id);
    if (ok) {
      setDeleting(null);
      await fetchRoles({ include_inactive: '1' });
    }
  };

  const handleBackToUsers = () => {
    if ((subView === 'create' || subView === 'edit') && isEditorDirty()) {
      const ok = window.confirm('Hay cambios sin guardar. ¿Salir a Gestión de Usuarios y descartarlos?');
      if (!ok) return;
    }
    resetEditorSession();
    onBackToUsers();
  };

  return (
    <>
      {subView === 'list' ? (
        <RolesListView
          roles={roles}
          loading={loading}
          totalPermissions={totalPermissions}
          onBackToUsers={handleBackToUsers}
          onNewRole={handleOpenNew}
          onEditRole={handleOpenEdit}
          onToggleRole={handleToggleRole}
          onRequestDelete={(role) => setDeleting(role)}
        />
      ) : null}

      {subView === 'create' ? (
        <RoleFormView
          mode="create"
          editor={editor}
          setEditor={setEditor}
          categories={categories}
          totalPermissions={totalPermissions}
          permsLoading={permsLoading}
          saving={saving}
          onBackToUsers={handleBackToUsers}
          onBackToRoleList={backToRoleList}
          onSave={handleSave}
          togglePermission={togglePermission}
          toggleCategory={toggleCategory}
          selectAll={selectAll}
        />
      ) : null}

      {subView === 'edit' ? (
        <RoleFormView
          mode="edit"
          editor={editor}
          setEditor={setEditor}
          categories={categories}
          totalPermissions={totalPermissions}
          permsLoading={permsLoading}
          saving={saving}
          onBackToUsers={handleBackToUsers}
          onBackToRoleList={backToRoleList}
          onSave={handleSave}
          togglePermission={togglePermission}
          toggleCategory={toggleCategory}
          selectAll={selectAll}
        />
      ) : null}

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar rol</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas eliminar el rol <strong>{deleting?.display_name}</strong>? Esta acción no se puede deshacer.
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
