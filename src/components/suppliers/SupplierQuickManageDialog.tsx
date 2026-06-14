import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Edit2,
  Mail,
  Phone,
  Plus,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import { Supplier } from '../../hooks/useSuppliers';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { SupplierFormDialog } from './SupplierFormDialog';
import {
  formatSupplierMoney,
  paymentLabel,
  supplierInitials,
} from './supplierUtils';

export interface SupplierQuickManageDialogProps {
  suppliers: Supplier[];
  loading?: boolean;
  onAdd: (data: Omit<Supplier, 'id'>) => Promise<Supplier>;
  onUpdate: (id: number, data: Partial<Supplier>) => Promise<Supplier>;
  onDelete: (id: number) => Promise<void>;
  onToggleActive: (id: number) => Promise<void>;
  onClose: () => void;
}

export function SupplierQuickManageDialog({
  suppliers,
  loading,
  onAdd,
  onUpdate,
  onDelete,
  onToggleActive,
  onClose,
}: SupplierQuickManageDialogProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const sorted = useMemo(
    () => [...suppliers].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [suppliers],
  );

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
      await onUpdate(editing.id, data);
    } else {
      await onAdd(data);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`¿Eliminar proveedor "${supplier.name}"?`)) return;
    await onDelete(supplier.id);
  };

  return (
    <>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Directorio de Proveedores</DialogTitle>
          <DialogDescription>
            Gestiona contactos comerciales, condiciones de crédito y cuentas bancarias.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 flex justify-end">
          <Button onClick={openCreate} className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
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
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                    {loading ? 'Cargando proveedores...' : 'No hay proveedores registrados.'}
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((supplier) => {
                  const payment = paymentLabel(supplier.credit_days);
                  const hasContact =
                    supplier.contact_name || supplier.phone || supplier.billing_email || supplier.email;
                  return (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="bg-cyan-950 text-cyan-200 text-xs font-semibold">
                              {supplierInitials(supplier.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{supplier.name}</div>
                            {supplier.document_number && (
                              <div className="text-muted-foreground text-xs">RUC: {supplier.document_number}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {hasContact ? (
                          <div className="space-y-1 text-sm">
                            {supplier.contact_name && (
                              <div className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                {supplier.contact_name}
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
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
                          <span className="text-muted-foreground text-sm">Sin datos de contacto</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.variant}
                          className={
                            payment.label === 'Contado'
                              ? 'bg-emerald-600/15 text-emerald-600 dark:text-emerald-400'
                              : ''
                          }
                        >
                          {payment.label === 'Contado' ? (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {payment.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="tabular-nums font-medium">
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
                            onClick={() => onToggleActive(supplier.id)}
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

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>

      <SupplierFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        onSave={handleSave}
      />
    </>
  );
}
