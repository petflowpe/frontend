import type { ReactNode } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Shield,
  CheckCircle,
  Lock,
  Unlock,
  Mail,
  Phone,
  Calendar,
  Settings as SettingsIcon,
  RefreshCw,
  Users,
  Building2,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
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
  getRoleBadgeColor: (roleNameOrKey?: string) => string;
  getStatusBadge: (status: string) => ReactNode;
  formatDateTime: (value?: string) => string;
  onRefresh: () => void;
  refreshing: boolean;
  onConfigureRoles: () => void;
  onConfigureBranches: () => void;
  onNewUser: () => void;
  onEditUser: (user: User) => void;
  onToggleStatus: (userId: string) => void;
  onResetPassword: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  isSuperAdminRole: (u: User) => boolean;
  currentUserId?: string;
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
  getRoleBadgeColor,
  getStatusBadge,
  formatDateTime,
  onRefresh,
  refreshing,
  onConfigureRoles,
  onConfigureBranches,
  onNewUser,
  onEditUser,
  onToggleStatus,
  onResetPassword,
  onDeleteUser,
  isSuperAdminRole,
  currentUserId,
}: UserListViewProps) {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <div
        className="h-1.5 w-full rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-amber-500 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
        aria-hidden
      />

      <div className="flex max-w-full flex-col-reverse gap-4 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="min-w-0 max-w-full">
          <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
            <span className="inline-flex flex-wrap items-center gap-3">
              <Users className="h-8 w-8 shrink-0 text-purple-600 dark:text-purple-400" aria-hidden />
              <span className="break-words">Gestión de Usuarios</span>
            </span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-full text-sm leading-relaxed break-words sm:text-base">
            Administra los usuarios del sistema, roles y accesos por módulo.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-muted-foreground min-w-0 text-sm break-words sm:text-base">
              {stats.total} usuarios registrados • {stats.active} activos • {stats.inactive} inactivos
            </p>
            <Button size="icon" variant="ghost" onClick={onRefresh} disabled={refreshing} aria-label="Actualizar listado">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="flex shrink-0 flex-row flex-wrap justify-end gap-2 md:justify-self-end">
          <Button variant="outline" className="w-auto shrink-0" onClick={onConfigureBranches}>
            <Building2 className="mr-2 h-4 w-4 text-cyan-500" />
            Unidades / Sedes
          </Button>
          <Button variant="outline" className="w-auto shrink-0" onClick={onConfigureRoles}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Configurar Roles
          </Button>

          <Button className="w-auto shrink-0" onClick={onNewUser}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/30">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Sistema de permisos por rol</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Cada usuario tiene acceso solo a los módulos asignados a su rol. Los Super Administradores tienen acceso completo.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {apiRoles.map((role) => (
          <Card key={role.id} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <Shield className="h-5 w-5 text-slate-600" />
              <Badge className={getRoleBadgeColor(role.name)}>{stats.byRole[role.name] ?? 0}</Badge>
            </div>
            <h3 className="text-sm font-semibold">{role.display_name}</h3>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{role.description ?? ''}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Label>Buscar usuario</Label>
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Buscar por nombre, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="filter-role">Rol</Label>
            <NativeSelect id="filter-role" value={filterRole} onValueChange={setFilterRole}>
              <option value="all">Todos los roles</option>
              {apiRoles.map((role) => (
                <option key={role.id} value={String(role.id)}>
                  {role.display_name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label htmlFor="filter-status">Estado</Label>
            <NativeSelect id="filter-status" value={filterStatus} onValueChange={setFilterStatus}>
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="suspended">Suspendidos</option>
            </NativeSelect>
          </div>
        </div>
      </Card>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-5 transition-shadow hover:shadow-lg">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-lg font-bold text-white">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground text-sm">{user.id}</p>
                  <Badge className={getRoleBadgeColor(user.roleKey) + ' mt-1'}>{user.role}</Badge>
                </div>
              </div>
              {getStatusBadge(user.status)}
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              {user.phone ? (
                <div className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="break-all">{user.phone}</span>
                </div>
              ) : null}
              <div className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Ingreso: {new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
              {user.lastLogin ? (
                <div className="text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span className="break-words">Último acceso: {formatDateTime(user.lastLogin)}</span>
                </div>
              ) : null}
            </div>

            <Separator className="my-3" />

            <p className="text-muted-foreground mb-3 text-xs font-semibold">Permisos del rol gestionados en el backend.</p>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="min-w-[100px] flex-1" onClick={() => onEditUser(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleStatus(user.id)}
                title={user.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                aria-label={user.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
              >
                {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResetPassword(user)}
                title="Enviar enlace de recuperación de contraseña al correo"
                aria-label="Recuperar contraseña por correo"
              >
                <Mail className="h-4 w-4" />
              </Button>
              {!isSuperAdminRole(user) && user.id !== currentUserId ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteUser(user.id)}
                  className="text-destructive"
                  title="Desactivar usuario en el sistema"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
          <p className="text-lg font-semibold">No se encontraron usuarios</p>
          <p className="text-muted-foreground text-sm">Intenta con otros términos de búsqueda o ajusta los filtros</p>
        </Card>
      ) : null}
    </div>
  );
}
