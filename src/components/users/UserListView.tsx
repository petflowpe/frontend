import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Shield,
  Lock,
  Unlock,
  Phone,
  Settings as SettingsIcon,
  RefreshCw,
  Users,
  Building2,
  LogOut,
  KeyRound,
  MoreVertical,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { TooltipBase as Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { NativeSelect } from './NativeSelect';
import type { User } from './types';
import type { Role } from '../../hooks/useRoles';

interface UserListViewProps {
  stats: { total: number; active: number; inactive: number; byRole: Record<string, number> };
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterRole: string;
  setFilterRole: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: string) => void;
  apiRoles: Role[];
  filteredUsers: User[];
  loading?: boolean;
  getRoleBadgeColor: (roleNameOrKey?: string) => string;
  getStatusBadge: (status: string) => ReactNode;
  formatDateTime: (value?: string) => string;
  onRefresh: () => void;
  refreshing: boolean;
  onConfigureRoles: () => void;
  onNewUser: () => void;
  onEditUser: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  onResetPassword: (user: User) => void;
  onRevokeTokens?: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  isSuperAdminRole: (u: User) => boolean;
  currentUserId?: string;
  canCreateUsers?: boolean;
  canUpdateUsers?: boolean;
  canDeleteUsers?: boolean;
  canManageRoles?: boolean;
}

/** Paleta determinística para los avatares basada en el id del usuario. */
const AVATAR_GRADIENTS: string[] = [
  'from-violet-500 to-fuchsia-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-blue-500',
  'from-lime-500 to-emerald-500',
  'from-purple-500 to-violet-500',
];

function gradientForId(id: string): string {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum = (sum + id.charCodeAt(i)) % 1000;
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .map((n) => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function UserListView({
  stats,
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  apiRoles,
  filteredUsers,
  loading = false,
  getRoleBadgeColor,
  getStatusBadge,
  formatDateTime,
  onRefresh,
  refreshing,
  onConfigureRoles,
  onNewUser,
  onEditUser,
  onToggleStatus,
  onResetPassword,
  onRevokeTokens,
  onDeleteUser,
  isSuperAdminRole,
  currentUserId,
  canCreateUsers = true,
  canUpdateUsers = true,
  canDeleteUsers = true,
  canManageRoles = true,
}: UserListViewProps) {
  const hasFilters = searchTerm.trim().length > 0 || filterRole !== 'all' || filterStatus !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterStatus('all');
  };

  // ===== Paginación =====
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Si cambia el filtro/búsqueda o el tamaño de página, vuelvo a la primera página.
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterRole, filterStatus, pageSize]);

  // Si la página actual queda fuera de rango tras un refresh, la ajusto.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pagedUsers = useMemo(
    () => filteredUsers.slice(startIndex, endIndex),
    [filteredUsers, startIndex, endIndex],
  );

  return (
    <TooltipProvider delayDuration={250}>
      <div className="animate-in fade-in duration-300 space-y-6">
        {/* ============ HERO ============ */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-sm dark:from-card dark:via-card dark:to-card sm:p-8">
          <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />

          <div className="relative flex flex-col gap-4">
            <div className="min-w-0 max-w-2xl">
              <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                <Users className="h-7 w-7 text-violet-500 sm:h-8 sm:w-8" />
                <span>Gestión de Usuarios</span>
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-medium tabular-nums">
                    {stats.total} usuario{stats.total === 1 ? '' : 's'} registrado{stats.total === 1 ? '' : 's'}
                  </span>
                </span>
                <span aria-hidden className="text-muted-foreground/50">·</span>
                <span className="tabular-nums text-emerald-600 dark:text-emerald-400">{stats.active} activos</span>
                <span aria-hidden className="text-muted-foreground/50">·</span>
                <span className="tabular-nums text-amber-600 dark:text-amber-400">{stats.inactive} inactivos</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={onRefresh}
                      disabled={refreshing}
                      className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="Actualizar listado"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Actualizar</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {(canManageRoles || canCreateUsers) ? (
              <div className="flex flex-wrap items-center gap-2">
                {canManageRoles ? (
                  <Button
                    size="sm"
                    onClick={onConfigureRoles}
                    className="h-9 gap-2 border border-violet-300/70 bg-violet-100 text-violet-700 shadow-sm hover:bg-violet-200 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-100 dark:hover:bg-violet-500/25"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    <span>Configurar Roles</span>
                  </Button>
                ) : null}
                {canCreateUsers ? (
                  <Button size="sm" onClick={onNewUser} className="h-9 gap-2 shadow-sm">
                    <Plus className="h-4 w-4" />
                    <span>Nuevo Usuario</span>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* ============ Aviso de control ============ */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
          <div className="flex items-start gap-2.5">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <p className="leading-relaxed">
              <span className="font-semibold">Acceso controlado por Super Administrador.</span>{' '}
              Solo el Super Administrador puede crear cuentas. Cada usuario recibe su correo y contraseña de acceso. Los módulos visibles se sincronizan con el rol asignado.
            </p>
          </div>
        </div>

        {/* ============ Toolbar ============ */}
        <Card className="border-border/60 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, documento o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-9"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 pl-2 pr-1">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <NativeSelect
                  value={filterRole}
                  onValueChange={setFilterRole}
                  className="h-9 w-auto min-w-[140px] border-0 bg-transparent text-sm shadow-none focus:ring-0"
                >
                  <option value="all">Todos los roles</option>
                  {apiRoles.map((role) => (
                    <option key={role.id} value={String(role.id)}>
                      {role.display_name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 pl-2 pr-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <NativeSelect
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                  className="h-9 w-auto min-w-[120px] border-0 bg-transparent text-sm shadow-none focus:ring-0"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </NativeSelect>
              </div>
              {hasFilters ? (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1 text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                  Limpiar
                </Button>
              ) : null}
              <Separator orientation="vertical" className="hidden h-7 sm:block" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onRefresh}
                    disabled={refreshing}
                    aria-label="Actualizar listado"
                    className="h-9 w-9"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Actualizar</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">
              {loading
                ? 'Cargando...'
                : totalItems === 0
                  ? `0 de ${stats.total} usuarios`
                  : `${startIndex + 1}–${endIndex} de ${totalItems} ${hasFilters ? `(de ${stats.total})` : ''}`}
            </span>
            <div className="flex items-center gap-1.5">
              <span>Por página</span>
              <NativeSelect
                value={String(pageSize)}
                onValueChange={(v) => setPageSize(Number(v))}
                className="h-8 w-auto min-w-[64px] rounded-md border border-border/60 bg-muted/30 text-xs"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </NativeSelect>
            </div>
          </div>
        </Card>

        {/* ============ Listado ============ */}
        {loading ? (
          <ListSkeleton />
        ) : filteredUsers.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClearFilters={clearFilters} canCreateUsers={canCreateUsers} onNewUser={onNewUser} />
        ) : (
          <>
            {/* ===== Desktop: tabla densa ===== */}
            <Card className="hidden overflow-hidden border-border/60 p-0 md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Usuario</th>
                      <th className="px-4 py-3 text-left font-medium">Rol</th>
                      <th className="px-4 py-3 text-left font-medium">Sede(s)</th>
                      <th className="px-4 py-3 text-left font-medium">Estado</th>
                      <th className="px-4 py-3 text-left font-medium">Último acceso</th>
                      <th className="px-4 py-3 text-right font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {pagedUsers.map((user) => {
                      const isSelf = user.id === currentUserId;
                      return (
                        <tr key={user.id} className="group transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientForId(user.id)} text-sm font-bold text-white shadow-sm ring-2 ring-background`}
                              >
                                {initialsOf(user.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="truncate font-medium text-foreground">{user.name}</span>
                                  {isSelf ? (
                                    <Badge
                                      variant="outline"
                                      className="h-5 border-blue-400/60 px-1.5 py-0 text-[10px] font-semibold tracking-wide text-blue-600 dark:text-blue-300"
                                    >
                                      TÚ
                                    </Badge>
                                  ) : null}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                                {user.documentNumber ? (
                                  <div className="truncate text-[11px] font-mono text-muted-foreground/80">
                                    {user.documentType ?? 'DOC'} · {user.documentNumber}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={getRoleBadgeColor(user.roleKey)}>{user.role}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <BranchesBadge user={user} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusPill status={user.status} getStatusBadge={getStatusBadge} />
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                            {user.lastLogin ? formatDateTime(user.lastLogin) : <span className="italic">Nunca</span>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1 opacity-80 transition-opacity group-hover:opacity-100">
                              <UserActionsMenu
                                user={user}
                                isSelf={isSelf}
                                isSuperAdminRole={isSuperAdminRole}
                                canUpdateUsers={canUpdateUsers}
                                canDeleteUsers={canDeleteUsers}
                                onEditUser={onEditUser}
                                onToggleStatus={onToggleStatus}
                                onResetPassword={onResetPassword}
                                onRevokeTokens={onRevokeTokens}
                                onDeleteUser={onDeleteUser}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* ===== Mobile: cards ===== */}
            <div className="grid gap-3 md:hidden">
              {pagedUsers.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <Card key={user.id} className="border-border/60 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientForId(user.id)} text-sm font-bold text-white shadow-sm`}
                        >
                          {initialsOf(user.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-semibold text-foreground">{user.name}</h3>
                            {isSelf ? (
                              <Badge
                                variant="outline"
                                className="h-5 border-blue-400/60 px-1.5 py-0 text-[10px] font-semibold text-blue-600 dark:text-blue-300"
                              >
                                TÚ
                              </Badge>
                            ) : null}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          {user.documentNumber ? (
                            <p className="truncate text-[11px] font-mono text-muted-foreground/80">
                              {user.documentType ?? 'DOC'} · {user.documentNumber}
                            </p>
                          ) : null}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <Badge className={getRoleBadgeColor(user.roleKey)}>{user.role}</Badge>
                            <StatusPill status={user.status} getStatusBadge={getStatusBadge} />
                            <BranchesBadge user={user} />
                          </div>
                        </div>
                      </div>
                      <UserActionsMenu
                        user={user}
                        isSelf={isSelf}
                        isSuperAdminRole={isSuperAdminRole}
                        canUpdateUsers={canUpdateUsers}
                        canDeleteUsers={canDeleteUsers}
                        onEditUser={onEditUser}
                        onToggleStatus={onToggleStatus}
                        onResetPassword={onResetPassword}
                        onRevokeTokens={onRevokeTokens}
                        onDeleteUser={onDeleteUser}
                      />
                    </div>

                    {(user.phone || user.lastLogin) && (
                      <>
                        <Separator className="my-3" />
                        <div className="grid grid-cols-1 gap-1.5 text-xs text-muted-foreground">
                          {user.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              <span className="truncate">{user.phone}</span>
                            </div>
                          ) : null}
                          {user.lastLogin ? (
                            <div className="flex items-center gap-2">
                              <span className="truncate">Último acceso: {formatDateTime(user.lastLogin)}</span>
                            </div>
                          ) : null}
                        </div>
                      </>
                    )}

                    {canUpdateUsers ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full gap-2"
                        onClick={() => onEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                    ) : null}
                  </Card>
                );
              })}
            </div>

            {/* ===== Controles de paginación ===== */}
            {totalItems > 0 ? (
              <PaginationBar
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

/* =========================================================
 * Subcomponentes
 * ========================================================= */

function BranchesBadge({ user }: { user: User }) {
  const all = (user as User & { allBranchesAccess?: boolean; branchIds?: Array<number | string> }).allBranchesAccess;
  const branchIds = (user as User & { branchIds?: Array<number | string> }).branchIds ?? [];

  if (all) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Todas
      </span>
    );
  }
  const count = branchIds.length;
  if (count === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
        Sin sedes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-300">
      <Building2 className="h-3 w-3" />
      {count} sede{count === 1 ? '' : 's'}
    </span>
  );
}

function StatusPill({
  status,
  getStatusBadge,
}: {
  status: string;
  getStatusBadge: (status: string) => ReactNode;
}) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
        Activo
      </span>
    );
  }
  if (status === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Inactivo
      </span>
    );
  }
  return <>{getStatusBadge(status)}</>;
}

interface UserActionsMenuProps {
  user: User;
  isSelf: boolean;
  isSuperAdminRole: (u: User) => boolean;
  canUpdateUsers?: boolean;
  canDeleteUsers?: boolean;
  onEditUser: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  onResetPassword: (user: User) => void;
  onRevokeTokens?: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

function UserActionsMenu({
  user,
  isSelf,
  isSuperAdminRole,
  canUpdateUsers,
  canDeleteUsers,
  onEditUser,
  onToggleStatus,
  onResetPassword,
  onRevokeTokens,
  onDeleteUser,
}: UserActionsMenuProps) {
  const canEdit = canUpdateUsers;
  const canToggle = canUpdateUsers && !isSelf;
  const canReset = canUpdateUsers;
  const canRevoke = canUpdateUsers && onRevokeTokens && !isSelf;
  const canDelete = canDeleteUsers && !isSuperAdminRole(user) && !isSelf;

  if (!canEdit && !canToggle && !canReset && !canRevoke && !canDelete) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Más acciones" title="Más acciones">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {canEdit ? (
          <DropdownMenuItem onClick={() => onEditUser(user)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar datos
          </DropdownMenuItem>
        ) : null}
        {canReset ? (
          <DropdownMenuItem onClick={() => onResetPassword(user)}>
            <KeyRound className="mr-2 h-4 w-4" />
            Restablecer contraseña
          </DropdownMenuItem>
        ) : null}
        {canToggle ? (
          <DropdownMenuItem onClick={() => onToggleStatus(user.id)}>
            {user.status === 'active' ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Desactivar usuario
              </>
            ) : (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Activar usuario
              </>
            )}
          </DropdownMenuItem>
        ) : null}
        {canRevoke ? (
          <DropdownMenuItem
            onClick={() => onRevokeTokens?.(user)}
            className="text-orange-600 focus:text-orange-600 dark:text-orange-400 dark:focus:text-orange-400"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesiones
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDeleteUser(user.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar usuario
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyState({
  hasFilters,
  onClearFilters,
  canCreateUsers,
  onNewUser,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
  canCreateUsers?: boolean;
  onNewUser: () => void;
}) {
  return (
    <Card className="border-dashed border-border/60 p-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {hasFilters ? <Search className="h-8 w-8 text-muted-foreground" /> : <Users className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        {hasFilters ? 'Sin resultados' : 'No hay usuarios registrados'}
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? 'Probá con otros términos de búsqueda o limpia los filtros para ver todos los usuarios.'
          : 'Empieza creando el primer usuario del sistema. Podrás asignarle un rol y sedes.'}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {hasFilters ? (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        ) : null}
        {canCreateUsers ? (
          <Button size="sm" onClick={onNewUser} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <Card className="border-border/60 p-4">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="hidden h-6 w-24 rounded-full sm:block" />
            <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}

interface PaginationBarProps {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (next: number) => void;
}

/** Genera la lista de páginas a mostrar con `…` cuando hay muchas (estilo Google). */
function buildPageRange(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | 'ellipsis'> = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push('ellipsis');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

function PaginationBar({
  page,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
}: PaginationBarProps) {
  const pageRange = useMemo(() => buildPageRange(page, totalPages), [page, totalPages]);
  const goTo = (n: number) => onPageChange(Math.min(totalPages, Math.max(1, n)));

  return (
    <Card className="border-border/60 p-3 sm:px-4">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-xs tabular-nums text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">{totalItems === 0 ? 0 : startIndex + 1}</span>–
          <span className="font-medium text-foreground">{endIndex}</span> de{' '}
          <span className="font-medium text-foreground">{totalItems}</span>
        </p>

        <nav className="flex items-center gap-1" aria-label="Paginación de usuarios">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => goTo(1)}
            aria-label="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 px-1">
            {pageRange.map((p, idx) =>
              p === 'ellipsis' ? (
                <span key={`e-${idx}`} className="px-1 text-xs text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  size="icon"
                  variant={p === page ? 'default' : 'ghost'}
                  className={`h-8 min-w-8 px-2 text-xs ${
                    p === page
                      ? 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white hover:from-cyan-500 hover:to-purple-600'
                      : ''
                  }`}
                  onClick={() => goTo(p)}
                  aria-current={p === page ? 'page' : undefined}
                  aria-label={`Ir a la página ${p}`}
                >
                  {p}
                </Button>
              ),
            )}
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => goTo(page + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            disabled={page >= totalPages}
            onClick={() => goTo(totalPages)}
            aria-label="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </Card>
  );
}
