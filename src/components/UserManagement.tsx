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
import type { UserManagementView, User, UserFormState, CompanyBranchOption } from './users/types';
import { Dialog, DialogContent } from './ui/dialog';
import { ROLE_BADGE_COLORS } from './users/constants';
import { RolesModule } from './roles/RolesModule';
import { BranchesConfigModal } from './users/BranchesConfigModal';
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
  const [branchesModalOpen, setBranchesModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
  const canManageBranches = hasPermission(currentUser, ['users.manage', 'company.manage']);

  const [formData, setFormData] = useState<UserFormState>({
    name: '',
    email: '',
    phone: '',
    initials: '',
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
    all_branches_access?: boolean | null;
    branch_ids?: number[] | null;
  }): User => ({
    id: String(row.id),
    name: row.name ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    initials: row.initials ?? undefined,
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
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

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
      await apiClient.put(API.users.update(userId), { active: newActive });
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: newActive ? 'active' : 'inactive' } : u)));
      toast.success(newActive ? 'Usuario activado' : 'Usuario desactivado');
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

  const handleResetPassword = async (user: User) => {
    try {
      await apiClient.postPublic('/auth/forgot-password', { email: user.email });
      toast.success('Si el correo es válido, recibirá instrucciones para restablecer la contraseña.');
    } catch {
      toast.error('No se pudo iniciar la recuperación de contraseña.');
    }
  };

  const applyNewUserFormDefaults = () => {
    const defaultRole = assignableRoles.find((r) => r.name === 'company_user') ?? assignableRoles[0];
    setFormData({
      name: '',
      email: '',
      phone: '',
      initials: '',
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

  const handleConfigureBranches = () => {
    if (companyId == null || companyId === undefined) {
      toast.error('Necesita una empresa asociada para gestionar sedes o unidades.');
      return;
    }
    setBranchesModalOpen(true);
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
    setCreateModalOpen(false);
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      initials: user.initials ?? '',
      allBranchesAccess: user.allBranchesAccess !== false,
      branchIds: user.allBranchesAccess === false ? (user.branchIds ?? []) : [],
      role_id: user.role_id ?? 0,
      status: user.status,
      password: '',
      confirmPassword: '',
    });
    setCurrentView('edit');
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

    setLoading(true);
    try {
      if (editingUser) {
        await apiClient.put(API.users.update(editingUser.id), {
          name: formData.name,
          email: formData.email,
          ...(formData.password ? { password: formData.password } : {}),
          role_id: formData.role_id,
          active: formData.status === 'active',
          phone: formData.phone.trim() || null,
          initials: formData.initials.trim() || null,
          ...branchPayload,
        });
        toast.success('Usuario actualizado correctamente');
      } else {
        await apiClient.post(API.users.create, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role_id: formData.role_id,
          active: formData.status === 'active',
          phone: formData.phone.trim() || undefined,
          initials: formData.initials.trim() || undefined,
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
          onConfigureBranches={handleConfigureBranches}
          onNewUser={handleOpenNewUser}
          onEditUser={handleEditUser}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
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
          canManageBranches={canManageBranches}
        />
      ) : null}

      <BranchesConfigModal open={branchesModalOpen} onOpenChange={setBranchesModalOpen} companyId={companyId ?? null} />

      {mainSection === 'users' ? (
        <Dialog
          open={createModalOpen}
          onOpenChange={(open) => {
            if (!open) closeCreateModal();
          }}
        >
          <DialogContent className="flex max-h-[92vh] max-w-[min(920px,96vw)] flex-col gap-0 overflow-hidden border-border/80 bg-card/98 p-0 shadow-2xl backdrop-blur-sm sm:rounded-xl">
            <UserCreateView {...formViewProps} layout="modal" onBack={closeCreateModal} />
          </DialogContent>
        </Dialog>
      ) : null}

      {mainSection === 'users' && currentView === 'edit' && editingUser ? (
        <UserEditView {...formViewProps} editingUser={editingUser} />
      ) : null}

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              El usuario quedará inactivo y no podrá acceder al sistema. Puede reactivarlo más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
