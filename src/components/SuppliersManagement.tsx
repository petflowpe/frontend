import { useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Edit2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Supplier, useSuppliers } from '../hooks/useSuppliers';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Textarea } from './ui/textarea';

type DocType = 'RUC' | 'DNI' | 'CE';

const EMPTY_FORM: Omit<Supplier, 'id'> = {
  name: '',
  business_name: '',
  document_type: 'RUC',
  document_number: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
  active: true,
};

function validateDocument(type: string | undefined, digits: string): string | null {
  if (!digits) return null;
  const len = digits.length;
  if (type === 'RUC' && len !== 11) return 'RUC debe tener 11 dígitos';
  if (type === 'DNI' && len !== 8) return 'DNI debe tener 8 dígitos';
  if (type === 'CE' && len !== 9) return 'CE debe tener 9 dígitos';
  return null;
}

export function SuppliersManagement() {
  const { user } = useAuth();
  const companyId = user?.companyId;
  if (!companyId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No hay empresa asociada a su usuario. Contacte al administrador.</p>
      </div>
    );
  }
  const {
    suppliers,
    loading,
    reload,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    toggleActive,
  } = useSuppliers(companyId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Omit<Supplier, 'id'>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const stats = useMemo(() => {
    const active = suppliers.filter((s) => s.active).length;
    return { total: suppliers.length, active, inactive: suppliers.length - active };
  }, [suppliers]);

  const filtered = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (statusFilter === 'active' && !s.active) return false;
      if (statusFilter === 'inactive' && s.active) return false;
      if (!needle) return true;
      return [
        s.name,
        s.business_name,
        s.document_number,
        s.email,
        s.phone,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [suppliers, searchTerm, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      business_name: supplier.business_name || '',
      document_type: (supplier.document_type as DocType) || 'RUC',
      document_number: supplier.document_number || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      notes: supplier.notes || '',
      active: supplier.active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const digits = (form.document_number || '').replace(/\D/g, '');
    const docError = validateDocument(form.document_type, digits);
    if (docError) return;

    setSaving(true);
    try {
      const payload = { ...form, document_number: digits || undefined };
      if (editing) {
        await updateSupplier(editing.id, payload);
      } else {
        await addSupplier(payload);
      }
      setDialogOpen(false);
    } catch {
      // toast en hook
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`¿Eliminar proveedor "${supplier.name}"?`)) return;
    try {
      await deleteSupplier(supplier.id);
    } catch {
      // toast en hook
    }
  };

  const docDigits = (form.document_number || '').replace(/\D/g, '');
  const docValidation = validateDocument(form.document_type, docDigits);

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-300">
      <div
        className="h-1.5 w-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 shadow-[0_0_16px_rgba(99,102,241,0.35)]"
        aria-hidden
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
            <Building2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            Proveedores
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Catálogo de proveedores para compras e inventario (adaptado desde GooFlow).
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-muted-foreground text-sm">
              {stats.total} registrados • {stats.active} activos • {stats.inactive} inactivos
              {loading && ' · sincronizando...'}
            </p>
            <Button size="icon" variant="ghost" onClick={reload} disabled={loading} aria-label="Actualizar">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <XCircle className="h-4 w-4" /> Inactivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                className="pl-8"
                placeholder="Buscar por nombre, documento, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Solo activos</SelectItem>
                <SelectItem value="inactive">Solo inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                      {loading ? 'Cargando proveedores...' : 'No hay proveedores que coincidan con los filtros.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="font-medium">{supplier.name}</div>
                        {supplier.business_name && supplier.business_name !== supplier.name && (
                          <div className="text-muted-foreground text-xs">{supplier.business_name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {supplier.document_type && supplier.document_number ? (
                          <span className="text-sm">
                            {supplier.document_type}: {supplier.document_number}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {supplier.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {supplier.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={supplier.active ? 'default' : 'secondary'}>
                          {supplier.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(supplier)} aria-label="Editar">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleActive(supplier.id)}
                            aria-label={supplier.active ? 'Desactivar' : 'Activar'}
                          >
                            {supplier.active ? (
                              <XCircle className="h-4 w-4 text-amber-600" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(supplier)}
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
            <DialogDescription>
              Datos comerciales del proveedor para compras y productos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Nombre / Razón social *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej. Distribuidora Pet SAC"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Nombre comercial (opcional)</Label>
              <Input
                value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo documento</Label>
              <Select
                value={form.document_type || 'RUC'}
                onValueChange={(v) => setForm({ ...form, document_type: v as DocType })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUC">RUC</SelectItem>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Número documento</Label>
              <Input
                value={form.document_number}
                onChange={(e) => setForm({ ...form, document_number: e.target.value.replace(/\D/g, '') })}
                placeholder={form.document_type === 'RUC' ? '11 dígitos' : form.document_type === 'DNI' ? '8 dígitos' : '9 dígitos'}
              />
              {docValidation && <p className="text-xs text-red-600">{docValidation}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Dirección</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Notas</Label>
              <Textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !!docValidation}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {editing ? 'Guardar cambios' : 'Registrar proveedor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
