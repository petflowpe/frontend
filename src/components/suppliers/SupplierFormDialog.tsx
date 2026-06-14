import { useEffect, useState } from 'react';
import { Clock, CreditCard, Save } from 'lucide-react';
import { getSupplierExpenseAccounts } from '../../config/accounting-peru';
import { Supplier, SupplierType } from '../../hooks/useSuppliers';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import {
  DOC_LABELS,
  DocType,
  EMPTY_SUPPLIER_FORM,
  SUPPLIER_TYPES,
  validateDocument,
} from './supplierUtils';

const expenseAccounts = getSupplierExpenseAccounts();

export interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Supplier | null;
  onSave: (data: Omit<Supplier, 'id'>) => Promise<void>;
}

export function SupplierFormDialog({ open, onOpenChange, editing, onSave }: SupplierFormDialogProps) {
  const [form, setForm] = useState<Omit<Supplier, 'id'>>(EMPTY_SUPPLIER_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            name: editing.name,
            document_type: (editing.document_type as DocType) || 'RUC',
            document_number: editing.document_number || '',
            supplier_type: (editing.supplier_type as SupplierType) || 'Mercadería',
            accounting_account_code: editing.accounting_account_code || '',
            credit_days: editing.credit_days ?? 0,
            bank_name: editing.bank_name || '',
            bank_account: editing.bank_account || editing.bankAccount || '',
            billing_email: editing.billing_email || editing.email || '',
            phone: editing.phone || '',
            contact_name: editing.contact_name || '',
            active: editing.active,
          }
        : EMPTY_SUPPLIER_FORM,
    );
  }, [open, editing]);

  const docDigits = (form.document_number || '').replace(/\D/g, '');
  const docValidation = form.document_number ? validateDocument(form.document_type, docDigits) : null;

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('La razón social es obligatoria');
      return;
    }
    if (!form.supplier_type) {
      toast.error('Seleccione el tipo de proveedor');
      return;
    }
    const docError = validateDocument(form.document_type, docDigits);
    if (docError) {
      toast.error(docError);
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        document_number: docDigits,
        accounting_account_code: form.accounting_account_code || undefined,
      });
      onOpenChange(false);
    } catch {
      // toast en hook
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar proveedor' : 'Registrar Nuevo Proveedor'}</DialogTitle>
          <DialogDescription>
            Completa la información fiscal y comercial del proveedor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 py-2 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Datos generales
            </h3>

            <div className="space-y-2">
              <Label>Tipo de documento *</Label>
              <Select
                value={form.document_type || 'RUC'}
                onValueChange={(v) => setForm({ ...form, document_type: v as DocType })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(DOC_LABELS) as DocType[]).map((t) => (
                    <SelectItem key={t} value={t}>{DOC_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número de documento *</Label>
              <Input
                value={form.document_number}
                onChange={(e) => setForm({ ...form, document_number: e.target.value.replace(/\D/g, '') })}
                placeholder={form.document_type === 'RUC' ? '20123456789' : '00000000'}
              />
              {docValidation && <p className="text-xs text-red-600">{docValidation}</p>}
            </div>

            <div className="space-y-2">
              <Label>Razón Social *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Distribuidora Vet SAC"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Proveedor *</Label>
              <Select
                value={form.supplier_type || 'Mercadería'}
                onValueChange={(v) => setForm({ ...form, supplier_type: v as SupplierType })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPLIER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cuenta contable (gasto)</Label>
              <Select
                value={form.accounting_account_code || '__none__'}
                onValueChange={(v) =>
                  setForm({ ...form, accounting_account_code: v === '__none__' ? '' : v })
                }
              >
                <SelectTrigger><SelectValue placeholder="--- Sin asignar ---" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">--- Sin asignar ---</SelectItem>
                  {expenseAccounts.map((acc) => (
                    <SelectItem key={acc.code} value={acc.code}>
                      {acc.code} — {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                Solo cuentas 62 / 63 / 64 / 65 del plan contable.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Datos comerciales
            </h3>

            <div className="space-y-2">
              <Label>Crédito (Días)</Label>
              <div className="relative">
                <Clock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  type="number"
                  min={0}
                  max={365}
                  className="pl-9"
                  value={form.credit_days ?? 0}
                  onChange={(e) => setForm({ ...form, credit_days: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Banco</Label>
              <Input
                value={form.bank_name || ''}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                placeholder="Ej: BCP"
              />
            </div>

            <div className="space-y-2">
              <Label>Cuenta Bancaria / CCI</Label>
              <div className="relative">
                <CreditCard className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                <Input
                  className="pl-9"
                  value={form.bank_account || ''}
                  onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
                  placeholder="000-000-000..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Facturación</Label>
              <Input
                type="email"
                value={form.billing_email || ''}
                onChange={(e) => setForm({ ...form, billing_email: e.target.value })}
                placeholder="facturacion@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Teléfono Contacto</Label>
              <Input
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="999 888 777"
              />
            </div>

            <div className="space-y-2">
              <Label>Contacto</Label>
              <Input
                value={form.contact_name || ''}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder="Nombre del vendedor"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !!docValidation}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Guardar proveedor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
