import { useState, useEffect, useMemo, useCallback } from 'react';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { ApiValidationError } from '../utils/api/config';
import { API } from '../utils/api/endpoints';
import { useRoles } from '../hooks/useRoles';
import { UserListView } from './users/UserListView';
import { UserCreateView } from './users/UserCreateView';
import { UserEditView } from './users/UserEditView';
import type { UserManagementView, User, UserFormState, CompanyBranchOption, DocumentType } from './users/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ROLE_BADGE_COLORS } from './users/constants';
import { RolesModule } from './roles/RolesModule';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { hasPermission, isSuperAdmin, type CurrentUserLike } from '../utils/permissions';
import { validateStaffPassword } from '../utils/passwordPolicy';

const PRIVILEGED_ROLE_NAMES = new Set(['super_admin', 'api_client']);

function formatApiError(error: unknown): string {
  if (error instanceof ApiValidationError) {
    return Object.values(error.errors ?? {}).flat().join(' ') || error.message;
  }
  return error instanceof Error ? error.message : 'Error inesperado';
}

export function UserManagement({
  currentUserId,
  companyId,
  currentUser,
}: {
  currentUserId?: string;
  companyId?: number | null;
  currentUser?: CurrentUserLike | null;
}) {
  const [mainSection, setMainSection] = useState<'users' | 'roles'>('users');
  const [currentView, setCurrentView] = useState<UserManagementView>('list');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [resetPasswordTarget, setResetPasswordTarget] = useState<User | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [revokeTokensTarget, setRevokeTokensTarget] = useState<User | null>(null);
  const [revokeTokensLoading, setRevokeTokensLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const canCreateUsers = hasPermission(currentUser, ['users.create', 'users.manage']);
  const canUpdateUsers = hasPermission(currentUser, ['users.update', 'users.manage']);
  const canDeleteUsers = hasPermission(currentUser, ['users.delete', 'users.manage']);
  const canManageRoles = hasPermission(currentUser, ['users.roles', 'users.manage']);

  const [formData, setFormData] = useState<UserFormState>({
    name: '',
    email: '',
    phone: '',
    initials: '',
    documentType: 'DNI',
    documentNumber: '',
    allBranchesAccess: true,
    branchIds: [],
    role_id: 0,
    status: 'active',
    password: '',
    confirmPassword: '',
  });

  const [users, setUsers] = useState<User[]>([]);
  const [companyBranches, setCompanyBranches] = useState<CompanyBranchOption[]>([]);

  const refreshCompanyBranches = useCallback(async () => {
    if (companyId == null || companyId === undefined) {
      setCompanyBranches([]);
      return;
    }
    try {
      const res = await apiClient.get<
        { id: number; nombre: string; activo?: boolean }[] | { data: { id: number; nombre: string; activo?: boolean }[] }
      >(API.branches.list, { company_id: String(companyId) });
      const raw = Array.isArray(res) ? res : ((res as { data: { id: number; nombre: string; activo?: boolean }[] }).data ?? []);
      setCompanyBranches(
        raw.map((b) => ({
          id: b.id,
          nombre: b.nombre ?? '',
          activo: b.activo !== false,
        })),
      );
    } catch {
      setCompanyBranches([]);
      toast.error('No se pudieron cargar las sedes de la empresa');
    }
  }, [companyId]);

  useEffect(() => {
    refreshCompanyBranches();
  }, [refreshCompanyBranches]);

  const mapBackendToUser = (row: {
    id: number;
    name?: string;
    email?: string;
    role?: string;
    role_display?: string;
    role_id?: number;
    active?: boolean;
    last_login_at?: string;
    created_at?: string;
    phone?: string | null;
    initials?: string | null;
    document_type?: string | null;
    document_number?: string | null;
    all_branches_access?: boolean | null;
    branch_ids?: number[] | null;
  }): User => ({
    id: String(row.id),
    name: row.name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    initials: row.initials ?? undefined,
    documentType: (row.document_type as DocumentType | null) ?? null,
    documentNumber: row.document_number ?? null,
    allBranchesAccess: row.all_branches_access,
    branchIds: Array.isArray(row.branch_ids) ? row.branch_ids.map((id) => Number(id)) : undefined,
    role: row.role_display ?? row.role ?? 'Usuario',
    roleKey: row.role,
    role_id: row.role_id,
    status: row.active !== false ? 'active' : 'inactive',
    createdAt: row.created_at ?? new Date().toISOString(),
    lastLogin: row.last_login_at,
  });

  const formatDateTime = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
  };

  const {
    roles: apiRoles,
    loading: rolesLoading,
    fetchRoles,
    createRole,
    updateRole,
    toggleRole,
    deleteRole,
  } = useRoles();

  useEffect(() => {
    fetchRoles({ include_inactive: '1' });
  }, [fetchRoles]);

  const assignableRoles = useMemo(() => {
    const activeRoles = apiRoles.filter((role) => role.active !== false);
    if (isSuperAdmin(currentUser)) return activeRoles;
    return activeRoles.filter((role) => !PRIVILEGED_ROLE_NAMES.has(role.name));
  }, [apiRoles, currentUser]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { per_page: '100' };
      if (companyId != null && companyId > 0) {
        params.company_id = String(companyId);
      }
      const res = await apiClient.get(API.users.list, params);
      const raw = Array.isArray(res) ? res : (res as { data?: unknown[] })?.data;
      const data = Array.isArray(raw) ? raw : [];
      setUsers(data.map((r: unknown) => mapBackendToUser(r as Parameters<typeof mapBackendToUser>[0])));
    } catch (error) {
      if (import.meta.env.DEV) console.error(error);
      toast.error('No se pudieron cargar los usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const filteredUsers = users.filter((user) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      q.length === 0 ||
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.id.toLowerCase().includes(q) ||
      (user.documentNumber ?? '').toLowerCase().includes(q);

    const matchesRole = filterRole === 'all' || String(user.role_id) === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (roleNameOrKey?: string) => {
    return roleNameOrKey && ROLE_BADGE_COLORS[roleNameOrKey]
      ? ROLE_BADGE_COLORS[roleNameOrKey]
      : 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Activo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">Inactivo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleToggleStatus = async (userId: string) => {
    if (!canUpdateUsers) {
      toast.error('No tiene permiso para cambiar el estado de usuarios');
      return;
    }
    if (userId === currentUserId) {
      toast.error('No puede desactivar su propia cuenta');
      return;
    }
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const newActive = user.status !== 'active';
    try {
      const res = await apiClient.put<{ success?: boolean; message?: string; sessions_revoked?: number }>(
        API.users.update(userId),
        { active: newActive },
      );
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: newActive ? 'active' : 'inactive' } : u)));
      const base = newActive ? 'Usuario activado' : 'Usuario desactivado';
      const revoked = res?.sessions_revoked ?? 0;
      toast.success(revoked > 0 ? `${base} · ${revoked} sesión(es) cerrada(s)` : base);
    } catch (error) {
      toast.error(formatApiError(error));
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteTargetId) return;
    try {
      await apiClient.delete(`${API.users.delete(deleteTargetId)}?soft=1`);
      setUsers(users.filter((u) => u.id !== deleteTargetId));
      toast.success('Usuario desactivado correctamente');
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setDeleteTargetId(null);
    }
  };

  // Resetear contraseña (modo admin). Se abre un diálogo y el admin elige modo email o manual.
  const handleResetPassword = (user: User) => {
    if (!canUpdateUsers) {
      toast.error('No tiene permiso para resetear contraseñas');
      return;
    }
    setResetPasswordTarget(user);
  };

  const performResetPassword = async (mode: 'email' | 'manual', manualPassword?: string) => {
    if (!resetPasswordTarget) return;
    setResetPasswordLoading(true);
    try {
      const body = mode === 'manual' ? { password: manualPassword } : {};
      const res = await apiClient.post<{
        success: boolean;
        message: string;
        mode: string;
        mail_sent?: boolean;
        reset_url?: string;
      }>(API.users.resetPassword(resetPasswordTarget.id), body);
      toast.success(res.message ?? 'Contraseña restablecida');
      if (res.reset_url) {
        // En desarrollo el backend devuelve el link; lo copiamos al portapapeles.
        try {
          await navigator.clipboard.writeText(res.reset_url);
          toast.info('Enlace de recuperación copiado al portapapeles');
        } catch {
          /* no-op */
        }
      }
      setResetPasswordTarget(null);
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // Cerrar todas las sesiones (revocar tokens) de un usuario.
  const handleRevokeTokens = (user: User) => {
    if (!canUpdateUsers) {
      toast.error('No tiene permiso para cerrar sesiones de otros usuarios');
      return;
    }
    if (user.id === currentUserId) {
      toast.error('Para cerrar tu propia sesión usa el menú de usuario');
      return;
    }
    setRevokeTokensTarget(user);
  };

  const performRevokeTokens = async () => {
    if (!revokeTokensTarget) return;
    setRevokeTokensLoading(true);
    try {
      const res = await apiClient.post<{ success: boolean; message: string; revoked: number }>(
        API.users.revokeTokens(revokeTokensTarget.id),
        {},
      );
      toast.success(res.message ?? 'Sesiones cerradas');
      setRevokeTokensTarget(null);
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setRevokeTokensLoading(false);
    }
  };

  const applyNewUserFormDefaults = () => {
    const defaultRole = assignableRoles.find((r) => r.name === 'company_user') ?? assignableRoles[0];
    setFormData({
      name: '',
      email: '',
      phone: '',
      initials: '',
      documentType: 'DNI',
      documentNumber: '',
      allBranchesAccess: true,
      branchIds: [],
      role_id: defaultRole?.id ?? 0,
      status: 'active',
      password: '',
      confirmPassword: '',
    });
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    applyNewUserFormDefaults();
  };

  const goToList = () => {
    setCurrentView('list');
    setEditingUser(null);
    setCreateModalOpen(false);
    applyNewUserFormDefaults();
  };

  const handleOpenNewUser = () => {
    if (!canCreateUsers) {
      toast.error('No tiene permiso para crear usuarios');
      return;
    }
    setEditingUser(null);
    applyNewUserFormDefaults();
    setCreateModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    if (!canUpdateUsers) {
      toast.error('No tiene permiso para editar usuarios');
      return;
    }
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      initials: user.initials ?? '',
      documentType: (user.documentType as DocumentType) || 'DNI',
      documentNumber: user.documentNumber ?? '',
      allBranchesAccess: user.allBranchesAccess !== false,
      branchIds: user.allBranchesAccess === false ? (user.branchIds ?? []) : [],
      role_id: user.role_id ?? 0,
      status: user.status,
      password: '',
      confirmPassword: '',
    });
    // Edición en modal (no más vista de página).
    setCurrentView('list');
    setCreateModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!editingUser && !canCreateUsers) {
      toast.error('No tiene permiso para crear usuarios');
      return;
    }
    if (editingUser && !canUpdateUsers) {
      toast.error('No tiene permiso para editar usuarios');
      return;
    }

    if (!editingUser && (!formData.password || !formData.confirmPassword)) {
      toast.error('Por favor ingresa una contraseña');
      return;
    }

    if (formData.password) {
      const passwordError = validateStaffPassword(formData.password);
      if (passwordError) {
        toast.error(passwordError);
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    const haySedesActivas = companyBranches.some((b) => b.activo);
    if (!formData.allBranchesAccess && haySedesActivas && formData.branchIds.length === 0) {
      toast.error('Seleccione al menos una sede habilitada o active «Todas las sedes».');
      return;
    }

    const branchPayload = formData.allBranchesAccess
      ? { all_branches_access: true }
      : { all_branches_access: false, branch_ids: formData.branchIds };

    const docNumber = formData.documentNumber.trim();
    const docType = formData.documentType || null;
    const documentPayload = {
      document_type: docNumber ? docType : null,
      document_number: docNumber || null,
    };

    setLoading(true);
    try {
      if (editingUser) {
        const res = await apiClient.put<{ success?: boolean; message?: string; sessions_revoked?: number }>(
          API.users.update(editingUser.id),
          {
            name: formData.name,
            email: formData.email,
            ...(formData.password ? { password: formData.password } : {}),
            role_id: formData.role_id,
            active: formData.status === 'active',
            phone: formData.phone.trim() || null,
            initials: formData.initials.trim() || null,
            ...documentPayload,
            ...branchPayload,
          },
        );
        const revoked = res?.sessions_revoked ?? 0;
        toast.success(
          revoked > 0
            ? `Usuario actualizado · ${revoked} sesión(es) cerrada(s) por cambio crítico`
            : 'Usuario actualizado correctamente',
        );
      } else {
        await apiClient.post(API.users.create, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role_id: formData.role_id,
          active: formData.status === 'active',
          phone: formData.phone.trim() || undefined,
          initials: formData.initials.trim() || undefined,
          ...(docNumber ? { document_type: docType, document_number: docNumber } : {}),
          ...(companyId ? { company_id: companyId } : {}),
          ...branchPayload,
        });
        toast.success('Usuario creado correctamente');
      }
      await fetchUsers();
      goToList();
    } catch (error) {
      toast.error(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === 'active').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
    byRole: apiRoles.reduce(
      (acc, r) => {
        acc[r.name] = users.filter((u) => u.role_id === r.id).length;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  const isSuperAdminRole = (u: User) => (u.roleKey ?? '').toLowerCase() === 'super_admin';

  const userFormRoleValue = useMemo(() => {
    if (!assignableRoles.length) return undefined;
    if (assignableRoles.some((r) => r.id === formData.role_id)) return String(formData.role_id);
    return String(assignableRoles[0].id);
  }, [assignableRoles, formData.role_id]);

  useEffect(() => {
    if (currentView !== 'edit' && !createModalOpen) return;
    if (!assignableRoles.length) return;
    if (!assignableRoles.some((r) => r.id === formData.role_id)) {
      setFormData((prev) => ({ ...prev, role_id: assignableRoles[0].id }));
    }
  }, [currentView, createModalOpen, assignableRoles, formData.role_id]);

  const formViewProps = {
    formData,
    setFormData,
    apiRoles: assignableRoles,
    rolesLoading,
    userFormRoleValue,
    loading,
    getRoleBadgeColor,
    onBack: goToList,
    onSave: handleSaveUser,
    companyBranches,
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1600px] p-4 sm:p-6">
      {mainSection === 'roles' ? (
        <RolesModule
          onBackToUsers={() => setMainSection('users')}
          roles={apiRoles}
          loading={rolesLoading}
          fetchRoles={fetchRoles}
          onCreate={createRole}
          onUpdate={updateRole}
          onToggle={toggleRole}
          onDelete={deleteRole}
        />
      ) : null}

      {mainSection === 'users' && currentView === 'list' ? (
        <UserListView
          stats={stats}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          apiRoles={apiRoles}
          filteredUsers={filteredUsers}
          loading={loading}
          getRoleBadgeColor={getRoleBadgeColor}
          getStatusBadge={getStatusBadge}
          formatDateTime={formatDateTime}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onConfigureRoles={() => {
            if (!canManageRoles) {
              toast.error('No tiene permiso para gestionar roles');
              return;
            }
            setMainSection('roles');
          }}
          onNewUser={handleOpenNewUser}
          onEditUser={handleEditUser}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
          onRevokeTokens={handleRevokeTokens}
          onDeleteUser={(userId) => {
            if (!canDeleteUsers) {
              toast.error('No tiene permiso para eliminar usuarios');
              return;
            }
            setDeleteTargetId(userId);
          }}
          isSuperAdminRole={isSuperAdminRole}
          currentUserId={currentUserId}
          canCreateUsers={canCreateUsers}
          canUpdateUsers={canUpdateUsers}
          canDeleteUsers={canDeleteUsers}
          canManageRoles={canManageRoles}
        />
      ) : null}

      {mainSection === 'users' ? (
        <Dialog
          open={createModalOpen}
          onOpenChange={(open) => {
            if (!open) closeCreateModal();
          }}
        >
          <DialogContent className="flex max-h-[92vh] max-w-[min(920px,96vw)] flex-col gap-0 overflow-hidden border-border/80 bg-card/98 p-0 shadow-2xl backdrop-blur-sm sm:rounded-xl">
            {editingUser ? (
              <UserEditView
                {...formViewProps}
                layout="modal"
                editingUser={editingUser}
                onBack={closeCreateModal}
              />
            ) : (
              <UserCreateView {...formViewProps} layout="modal" onBack={closeCreateModal} />
            )}
          </DialogContent>
        </Dialog>
      ) : null}

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              El usuario quedará inactivo, todas sus sesiones se cerrarán y no podrá acceder al sistema. Puede reactivarlo más
              tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ResetPasswordDialog
        target={resetPasswordTarget}
        loading={resetPasswordLoading}
        onCancel={() => setResetPasswordTarget(null)}
        onConfirm={performResetPassword}
      />

      <AlertDialog open={!!revokeTokensTarget} onOpenChange={(open) => !open && setRevokeTokensTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar todas las sesiones?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cerrará todas las sesiones activas de{' '}
              <span className="font-semibold">{revokeTokensTarget?.name}</span> y deberá iniciar sesión nuevamente. Útil tras
              cambios de rol, contraseña o si se sospecha de un acceso indebido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeTokensLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={performRevokeTokens}
              disabled={revokeTokensLoading}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {revokeTokensLoading ? 'Cerrando...' : 'Cerrar sesiones'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Diálogo para resetear contraseña iniciado por el admin.
 * Permite elegir entre enviar enlace por email o definir contraseña manualmente.
 */
function ResetPasswordDialog({
  target,
  loading,
  onCancel,
  onConfirm,
}: {
  target: User | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (mode: 'email' | 'manual', password?: string) => void;
}) {
  const [mode, setMode] = useState<'email' | 'manual'>('email');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // Reset interno al cerrar.
  useEffect(() => {
    if (!target) {
      setMode('email');
      setPassword('');
      setConfirm('');
    }
  }, [target]);

  const submit = () => {
    if (mode === 'email') {
      onConfirm('email');
      return;
    }
    const err = validateStaffPassword(password);
    if (err) {
      toast.error(err);
      return;
    }
    if (password !== confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    onConfirm('manual', password);
  };

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Resetear contraseña</DialogTitle>
          <DialogDescription>
            Usuario: <span className="font-semibold">{target?.name}</span> ({target?.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="flex items-start gap-3 cursor-pointer rounded-lg border p-3 hover:bg-accent">
              <input
                type="radio"
                className="mt-1"
                checked={mode === 'email'}
                onChange={() => setMode('email')}
              />
              <div>
                <div className="font-medium">Enviar enlace por correo</div>
                <p className="text-xs text-muted-foreground">
                  Se enviará al correo del usuario un enlace para que defina su nueva contraseña.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer rounded-lg border p-3 hover:bg-accent">
              <input
                type="radio"
                className="mt-1"
                checked={mode === 'manual'}
                onChange={() => setMode('manual')}
              />
              <div className="flex-1">
                <div className="font-medium">Definir contraseña manualmente</div>
                <p className="text-xs text-muted-foreground">
                  Establezca una contraseña temporal y comuníquela al usuario. Sus sesiones se cerrarán automáticamente.
                </p>
              </div>
            </label>
          </div>

          {mode === 'manual' ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 8, mayús/minús + número"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label htmlFor="new-password-confirm">Confirmar contraseña</Label>
                <Input
                  id="new-password-confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? 'Procesando...' : mode === 'email' ? 'Enviar enlace' : 'Establecer contraseña'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
