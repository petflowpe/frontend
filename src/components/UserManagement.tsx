import { useState, useEffect } from 'react';
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
  Save,
  X,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';
import { useRoles, type Role } from '../hooks/useRoles';
import { RolesManagementDialog } from './roles/RolesManagementDialog';

const ROLE_BADGE_COLORS: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  company_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  company_user: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  api_client: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
  read_only: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  roleKey?: string;
  role_id?: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  customPermissions?: string[];
}

// API_BASE eliminado - ahora se usa apiClient

export function UserManagement({ currentUserId, currentUserRole }: { currentUserId?: string, currentUserRole?: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estado del formulario de nuevo usuario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: 0 as number,
    status: 'active' as 'active' | 'inactive' | 'suspended',
    password: '',
    confirmPassword: ''
  });

  // Usuarios reales
  const [users, setUsers] = useState<User[]>([]);

  // Mapear usuario del backend al formato local
  const mapBackendToUser = (row: { id: number; name?: string; email?: string; role?: string; role_display?: string; role_id?: number; active?: boolean; last_login_at?: string; created_at?: string }): User => ({
    id: String(row.id),
    name: row.name ?? '',
    email: row.email ?? '',
    phone: '',
    role: row.role_display ?? row.role ?? 'Usuario',
    roleKey: row.role,
    role_id: row.role_id,
    status: row.active !== false ? 'active' : 'inactive',
    createdAt: row.created_at ?? new Date().toISOString(),
    lastLogin: row.last_login_at,
  });

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

  // Fetch Users (API devuelve { success, data[], meta })
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/users', { per_page: '100' });
      const raw = Array.isArray(res) ? res : (res as { data?: unknown[] })?.data;
      const data = Array.isArray(raw) ? raw : [];
      setUsers(data.map((r: unknown) => mapBackendToUser(r as Parameters<typeof mapBackendToUser>[0])));
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar los usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole || String(user.role_id) === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (roleNameOrKey?: string) => {
    return (roleNameOrKey && ROLE_BADGE_COLORS[roleNameOrKey]) ? ROLE_BADGE_COLORS[roleNameOrKey] : 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Activo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">Inactivo</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Suspendido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newActive = user.status !== 'active';
    try {
      await apiClient.put(`/users/${userId}`, { active: newActive });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newActive ? 'active' : 'inactive' } : u));
      toast.success(newActive ? 'Usuario activado' : 'Usuario desactivado');
    } catch (e) {
      toast.error('Error al cambiar estado');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try {
      await apiClient.delete(`/users/${userId}?soft=1`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('Usuario desactivado correctamente');
    } catch (e) {
      toast.error('Error al eliminar usuario');
    }
  };

  const handleResetPassword = async (user: User) => {
    // En producción esto llamaría al backend Laravel
    // await apiClient.post('/auth/request-password-reset', { email });
    toast.info(`Funcionalidad de reset password pendiente de implementación en backend`);
  };

  const handleOpenNewUser = () => {
    setEditingUser(null);
    // Rol por defecto: el primero "company_user" si existe, si no el primer rol disponible.
    const defaultRole = (apiRoles as Role[]).find(r => r.name === 'company_user')
      ?? (apiRoles as Role[])[0];
    setFormData({
      name: '',
      email: '',
      phone: '',
      role_id: defaultRole?.id ?? 0,
      status: 'active',
      password: '',
      confirmPassword: ''
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role_id: user.role_id ?? 0,
      status: user.status,
      password: '',
      confirmPassword: ''
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    // Validaciones
    if (!formData.name || !formData.email) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!editingUser && (!formData.password || !formData.confirmPassword)) {
      toast.error('Por favor ingresa una contraseña');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      if (editingUser) {
        await apiClient.put(API.users.update(editingUser.id), {
          name: formData.name,
          email: formData.email,
          ...(formData.password ? { password: formData.password } : {}),
          role_id: formData.role_id,
          active: formData.status === 'active',
        });
        toast.success('Usuario actualizado correctamente');
      } else {
        await apiClient.post(API.users.create, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role_id: formData.role_id,
          active: formData.status === 'active',
        });
        toast.success('Usuario creado correctamente');
      }
      await fetchUsers();
      setShowUserModal(false);
      setEditingUser(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al guardar';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    byRole: (apiRoles as Role[]).reduce((acc, r) => {
      acc[r.name] = users.filter(u => u.role_id === r.id || u.role === r.display_name).length;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            👤 Gestión de Usuarios
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground text-lg">
              {stats.total} usuarios registrados • {stats.active} activos • {stats.inactive} inactivos
            </p>
            <Button size="icon" variant="ghost" onClick={handleRefresh} disabled={refreshing}>
               <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowRolesModal(true)}>
            <SettingsIcon className="h-4 w-4 mr-2" />
            Configurar Roles
          </Button>

          <RolesManagementDialog
            open={showRolesModal}
            onOpenChange={setShowRolesModal}
            roles={apiRoles as Role[]}
            loading={rolesLoading}
            onCreate={createRole}
            onUpdate={updateRole}
            onToggle={toggleRole}
            onDelete={deleteRole}
          />

          <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNewUser}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Modifica la información del usuario' : 'Completa los datos del nuevo usuario del sistema'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: Juan Pérez García"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="usuario@smartpet.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+51 987 654 321"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rol *</Label>
                    <Select value={String(formData.role_id)} onValueChange={(value) => setFormData({ ...formData, role_id: Number(value) })} disabled={rolesLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder={rolesLoading ? 'Cargando roles...' : 'Seleccionar rol'} />
                      </SelectTrigger>
                      <SelectContent>
                        {(apiRoles as Role[]).map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            <div className="flex items-center gap-2">
                              <Badge className={getRoleBadgeColor(role.name)}>
                                {role.display_name}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'suspended' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="suspended">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">
                      {editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">
                      {editingUser ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *'}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {apiRoles.length > 0 && (
                  <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 dark:text-blue-300">Rol seleccionado</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-400">
                      <div className="mt-2">
                        {(() => {
                          const sel = apiRoles.find((r: Role) => r.id === formData.role_id);
                          if (!sel) return null;
                          return (
                            <>
                              <p className="font-semibold mb-2">{sel.display_name}: {sel.description ?? ''}</p>
                              {sel.permissions && sel.permissions.length > 0 && (
                                <p className="text-sm">Permisos del rol gestionados en el backend.</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUserModal(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveUser}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerta de seguridad */}
      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/30">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-300">Sistema de Permisos por Rol</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-400">
          Cada usuario tiene acceso solo a los módulos asignados a su rol. Los Super Administradores tienen acceso completo.
        </AlertDescription>
      </Alert>

      {/* Estadísticas de roles */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(apiRoles as Role[]).map((role) => (
          <Card key={role.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-slate-600" />
              <Badge className={getRoleBadgeColor(role.name)}>
                {stats.byRole[role.name] ?? 0}
              </Badge>
            </div>
            <h3 className="font-semibold text-sm">{role.display_name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{role.description ?? ''}</p>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label>Buscar usuario</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label>Rol</Label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {(apiRoles as Role[]).map((role) => (
                  <SelectItem key={role.id} value={role.display_name}>{role.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Estado</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
                <SelectItem value="suspended">Suspendidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Lista de usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.id}</p>
                  <Badge className={getRoleBadgeColor(user.roleKey) + ' mt-1'}>
                    {user.role}
                  </Badge>
                </div>
              </div>
              {getStatusBadge(user.status)}
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Ingreso: {new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  <span>Último acceso: {user.lastLogin}</span>
                </div>
              )}
            </div>

            <Separator className="my-3" />

            {/* Rol: permisos gestionados en backend */}
            <div className="mb-3">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">Permisos del rol gestionados en el backend.</p>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEditUser(user)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(user.id)}
              >
                {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResetPassword(user)}
              >
                <Shield className="h-4 w-4" />
              </Button>
              {user.role !== 'superadmin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <p className="text-lg font-semibold">No se encontraron usuarios</p>
          <p className="text-sm text-muted-foreground">
            Intenta con otros términos de búsqueda o ajusta los filtros
          </p>
        </Card>
      )}
    </div>
  );
}
