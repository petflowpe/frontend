import { useEffect, useState } from 'react';
import { Clock, CreditCard, Save, Stethoscope } from 'lucide-react';
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
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import {
  DOC_LABELS,
  DocType,
  EMPTY_SUPPLIER_FORM,
  MEDICAL_SPECIALTIES,
  SUPPLIER_TYPES,
  isExternalDoctorType,
  supplierToForm,
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
    setForm(editing ? supplierToForm(editing) : { ...EMPTY_SUPPLIER_FORM });
  }, [open, editing]);

  const docDigits = (form.document_number || '').replace(/\D/g, '');
  const docValidation = form.document_number ? validateDocument(form.document_type, docDigits) : null;
  const isDoctor = isExternalDoctorType(form.supplier_type);

  const handleTypeChange = (v: SupplierType) => {
    const next: Omit<Supplier, 'id'> = { ...form, supplier_type: v };
    // Médicos externos suelen usar DNI; no forzamos si ya hay documento cargado.
    if (v === 'Médico Externo' && !editing && !form.document_number) {
      next.document_type = 'DNI';
    }
    setForm(next);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error(isDoctor ? 'El nombre del profesional es obligatorio' : 'La razón social es obligatoria');
      return;
    }
    if (!form.supplier_type) {
      toast.error('Seleccione el tipo de proveedor');
      return;
    }
    if (isDoctor && !String(form.specialty || '').trim()) {
      toast.error('Indique la especialidad del médico externo');
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
        specialty: isDoctor ? String(form.specialty || '').trim() : form.specialty || undefined,
        professional_license: isDoctor
          ? String(form.professional_license || '').trim() || undefined
          : form.professional_license || undefined,
        clinic_name: isDoctor ? String(form.clinic_name || '').trim() || undefined : form.clinic_name || undefined,
        fee_rate: isDoctor && form.fee_rate != null ? Number(form.fee_rate) : form.fee_rate,
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
          <DialogTitle>
            {editing
              ? isDoctor
                ? 'Editar médico externo'
                : 'Editar proveedor'
              : isDoctor
                ? 'Registrar médico externo'
                : 'Registrar Nuevo Proveedor'}
          </DialogTitle>
          <DialogDescription>
            {isDoctor
              ? 'Datos del profesional referido: especialidad, colegiatura, clínica y honorario referencial.'
              : 'Completa la información fiscal y comercial del proveedor.'}
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
              <Label>{isDoctor ? 'Nombre del profesional *' : 'Razón Social *'}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={isDoctor ? 'Ej: Dra. Ana Pérez' : 'Ej: Distribuidora Vet SAC'}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Proveedor *</Label>
              <Select
                value={form.supplier_type || 'Mercadería'}
                onValueChange={(v) => handleTypeChange(v as SupplierType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUPPLIER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isDoctor && (
              <div className="space-y-4 rounded-lg border border-cyan-200 bg-cyan-50/60 p-3 dark:border-cyan-900 dark:bg-cyan-950/30">
                <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-800 uppercase dark:text-cyan-200">
                  <Stethoscope className="h-4 w-4" />
                  Datos del médico externo
                </h3>

                <div className="space-y-2">
                  <Label>Especialidad *</Label>
                  <Select
                    value={
                      form.specialty && (MEDICAL_SPECIALTIES as readonly string[]).includes(form.specialty)
                        ? form.specialty
                        : form.specialty
                          ? 'Otro'
                          : '__none__'
                    }
                    onValueChange={(v) => {
                      if (v === '__none__') setForm({ ...form, specialty: '' });
                      else if (v === 'Otro') setForm({ ...form, specialty: form.specialty && !(MEDICAL_SPECIALTIES as readonly string[]).includes(form.specialty) ? form.specialty : 'Otro' });
                      else setForm({ ...form, specialty: v });
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Seleccione</SelectItem>
                      {MEDICAL_SPECIALTIES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(form.specialty === 'Otro' ||
                    (form.specialty && !(MEDICAL_SPECIALTIES as readonly string[]).includes(form.specialty))) && (
                    <Input
                      className="mt-2"
                      placeholder="Especifique especialidad"
                      value={form.specialty === 'Otro' ? '' : form.specialty || ''}
                      onChange={(e) => setForm({ ...form, specialty: e.target.value || 'Otro' })}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>CMP / Colegiatura</Label>
                  <Input
                    value={form.professional_license || ''}
                    onChange={(e) => setForm({ ...form, professional_license: e.target.value })}
                    placeholder="Ej: CMP 12345 / CMVP 6789"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Clínica / centro</Label>
                  <Input
                    value={form.clinic_name || ''}
                    onChange={(e) => setForm({ ...form, clinic_name: e.target.value })}
                    placeholder="Ej: Clínica Vet Sur"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Honorario referencial (S/)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.fee_rate ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        fee_rate: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

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
              <Label>Email Facturación / contacto</Label>
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
              <Label>{isDoctor ? 'Asistente / contacto' : 'Contacto'}</Label>
              <Input
                value={form.contact_name || ''}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                placeholder={isDoctor ? 'Nombre de asistente' : 'Nombre del vendedor'}
              />
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input
                value={form.address || ''}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Dirección / consultorio"
              />
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Observaciones internas"
                rows={3}
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
