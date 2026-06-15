import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Building2,
  CheckCircle2,
  Clock,
  Edit2,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  User,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Supplier, SupplierType, useSuppliers } from '../hooks/useSuppliers';
import { SupplierFormDialog } from './suppliers/SupplierFormDialog';
import {
  EMPTY_SUPPLIER_FORM,
  formatSupplierMoney,
  paymentLabel,
  supplierInitials,
} from './suppliers/supplierUtils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { toast } from 'sonner';

export function SuppliersManagement() {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (!needle) return true;
      return [
        s.name,
        s.document_number,
        s.contact_name,
        s.phone,
        s.email,
        s.billing_email,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [suppliers, searchTerm]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setFormOpen(true);
  };

  const handleSave = async (data: Omit<Supplier, 'id'>) => {
    if (editing) {
      await updateSupplier(editing.id, data);
    } else {
      await addSupplier(data);
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

  const handleImportExcel = async (file: File) => {
    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      if (!rows.length) {
        toast.info('El archivo no contiene filas');
        return;
      }

      let created = 0;
      let skipped = 0;
      for (const row of rows) {
        const name = String(
          row['Razon_Social'] ?? row['Razón Social'] ?? row['razon_social'] ?? row['name'] ?? '',
        ).trim();
        if (!name) {
          skipped++;
          continue;
        }
        const docType = String(row['Tipo_Documento'] ?? row['tipo_documento'] ?? 'RUC').trim().toUpperCase();
        const docNumber = String(row['Numero_Documento'] ?? row['numero_documento'] ?? row['RUC'] ?? '').replace(/\D/g, '');
        try {
          await addSupplier({
            ...EMPTY_SUPPLIER_FORM,
            name,
            document_type: docType === 'DNI' || docType === 'CE' ? docType : 'RUC',
            document_number: docNumber,
            supplier_type: (String(row['Tipo_Proveedor'] ?? row['tipo_proveedor'] ?? 'Mercadería') as SupplierType) || 'Mercadería',
            contact_name: String(row['Contacto'] ?? row['contacto'] ?? '').trim() || undefined,
            phone: String(row['Telefono'] ?? row['Teléfono'] ?? row['telefono'] ?? '').trim() || undefined,
            billing_email: String(row['Email'] ?? row['email'] ?? row['Email_Facturacion'] ?? '').trim() || undefined,
            bank_name: String(row['Banco'] ?? row['banco'] ?? '').trim() || undefined,
            bank_account: String(row['Cuenta_Bancaria'] ?? row['cuenta_bancaria'] ?? '').trim() || undefined,
            credit_days: Number(row['Credito_Dias'] ?? row['credito_dias'] ?? 0) || 0,
          });
          created++;
        } catch {
          skipped++;
        }
      }
      await reload();
      toast.success(`Importación completada: ${created} creados${skipped ? `, ${skipped} omitidos` : ''}`);
    } catch {
      toast.error('No se pudo leer el archivo Excel');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-300">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <Building2 className="h-8 w-8 text-cyan-500" />
              Directorio de Proveedores
            </h1>
            <Badge variant="outline" className="border-cyan-500/40 text-cyan-600 dark:text-cyan-400">
              build {__APP_BUILD_ID__}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Gestiona tus contactos comerciales, condiciones de crédito y cuentas bancarias.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportExcel(file);
            }}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing || loading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {importing ? 'Importando...' : 'Importar Excel'}
          </Button>
          <Button onClick={openCreate} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
          <Button size="icon" variant="ghost" onClick={reload} disabled={loading} aria-label="Actualizar">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre, RUC o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Condiciones</TableHead>
                  <TableHead>Compras Históricas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground py-12 text-center">
                      {loading ? 'Cargando proveedores...' : 'No hay proveedores registrados.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((supplier) => {
                    const payment = paymentLabel(supplier.credit_days);
                    const contactLine = supplier.contact_name || supplier.phone || supplier.billing_email || supplier.email;
                    return (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border">
                              <AvatarFallback className="bg-cyan-950 text-cyan-200 text-xs font-semibold">
                                {supplierInitials(supplier.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              {supplier.document_number && (
                                <div className="text-muted-foreground text-xs">
                                  RUC: {supplier.document_number}
                                </div>
                              )}
                              {supplier.supplier_type && (
                                <div className="text-muted-foreground text-xs">{supplier.supplier_type}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {contactLine ? (
                            <div className="space-y-1 text-sm">
                              {supplier.contact_name && (
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                  {supplier.contact_name}
                                </div>
                              )}
                              {supplier.phone && (
                                <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                                  <Phone className="h-3.5 w-3.5" />
                                  {supplier.phone}
                                </div>
                              )}
                              {(supplier.billing_email || supplier.email) && (
                                <div className="flex items-center gap-1.5">
                                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                  {supplier.billing_email || supplier.email}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-cyan-600 dark:text-cyan-400">Sin datos de contacto</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={payment.variant}
                            className={
                              payment.label === 'Contado'
                                ? 'bg-emerald-600/15 text-emerald-600 hover:bg-emerald-600/20 dark:text-emerald-400'
                                : ''
                            }
                          >
                            {payment.label === 'Contado' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {payment.label !== 'Contado' && <Clock className="mr-1 h-3 w-3" />}
                            {payment.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {formatSupplierMoney(supplier.total_purchases ?? 0)}
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <SupplierFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSave={handleSave}
      />
    </div>
  );
}
