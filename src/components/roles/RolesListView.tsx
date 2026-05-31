import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Edit,
  Lock,
  Plus,
  Shield,
  Trash2,
  Unlock,
  Users as UsersIcon,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import type { Role } from '../../hooks/useRoles';

interface RolesListViewProps {
  roles: Role[];
  loading?: boolean;
  totalPermissions: number;
  onBackToUsers: () => void;
  onNewRole: () => void;
  onEditRole: (role: Role) => void;
  onToggleRole: (role: Role) => void;
  onRequestDelete: (role: Role) => void;
}

export function RolesListView({
  roles,
  loading,
  totalPermissions,
  onBackToUsers,
  onNewRole,
  onEditRole,
  onToggleRole,
  onRequestDelete,
}: RolesListViewProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
      <div
        className="h-1.5 w-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500 shadow-[0_0_16px_rgba(139,92,246,0.35)]"
        aria-hidden
      />

      <div className="border-border/60 bg-card/30 rounded-xl border p-4 shadow-sm sm:p-6">
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground mb-4 -ml-2 gap-2"
          onClick={onBackToUsers}
        >
          <ArrowLeft className="size-4 shrink-0" />
          Volver a Gestión de Usuarios
        </Button>

        <nav className="text-muted-foreground mb-4 flex flex-wrap items-center gap-1.5 text-sm" aria-label="Migas de pan">
          <button type="button" className="hover:text-foreground transition-colors" onClick={onBackToUsers}>
            Gestión de Usuarios
          </button>
          <span className="opacity-50">/</span>
          <span className="text-foreground font-medium">Roles y permisos</span>
        </nav>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="text-foreground flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
              <Shield className="text-violet-500 size-8 shrink-0 dark:text-violet-400" aria-hidden />
              Configuración de roles
            </h1>
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed sm:text-base">
              Define roles, alcance por módulo y permisos granulares. Los cambios aplican a todos los usuarios con ese rol.
            </p>
            <p className="text-muted-foreground text-sm">
              {roles.length} roles registrados · {totalPermissions} permisos disponibles
            </p>
          </div>
          <Button type="button" size="lg" className="shrink-0 gap-2" onClick={onNewRole}>
            <Plus className="size-4" />
            Nuevo rol
          </Button>
        </div>
      </div>

      {loading ? <p className="text-muted-foreground text-sm">Cargando roles…</p> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.id} className="border-border/80 p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-semibold">{role.display_name}</h3>
                  {role.is_system ? (
                    <Badge variant="secondary" className="text-xs">
                      Sistema
                    </Badge>
                  ) : null}
                  {role.active === false ? (
                    <Badge variant="outline" className="text-xs">
                      Inactivo
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-0.5 font-mono text-xs">{role.name}</p>
                {role.description ? (
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">{role.description}</p>
                ) : null}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <UsersIcon className="mr-1 size-3" />
                  {role.users_count ?? 0}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {(role.permissions ?? []).length} permisos
                </Badge>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="min-w-[88px] flex-1" onClick={() => onEditRole(role)}>
                <Edit className="mr-2 size-4" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={role.protected || role.is_system}
                onClick={() => onToggleRole(role)}
                title={
                  role.protected || role.is_system
                    ? 'No se puede desactivar un rol de sistema'
                    : role.active
                      ? 'Desactivar'
                      : 'Activar'
                }
              >
                {role.active ? <Lock className="size-4" /> : <Unlock className="size-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={role.protected || role.is_system}
                onClick={() => onRequestDelete(role)}
                className="text-destructive"
                title={
                  role.protected || role.is_system ? 'No se puede eliminar un rol de sistema' : 'Eliminar'
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {!loading && roles.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <Shield className="text-muted-foreground mx-auto mb-3 size-12 opacity-40" />
          <p className="font-medium">No hay roles cargados</p>
          <p className="text-muted-foreground mt-1 text-sm">Crea un rol o revisa la conexión con el servidor.</p>
        </Card>
      ) : null}
    </div>
  );
}
