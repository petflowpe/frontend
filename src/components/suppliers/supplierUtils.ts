import { Supplier, SupplierType } from '../../hooks/useSuppliers';

export type DocType = 'RUC' | 'DNI' | 'CE';

export const SUPPLIER_TYPES: SupplierType[] = [
  'Mercadería',
  'Servicios',
  'Honorarios',
  'Mixto',
  'Médico Externo',
];

/** Especialidades comunes para médicos externos (vet / referidos). */
export const MEDICAL_SPECIALTIES = [
  'Medicina general',
  'Cirugía',
  'Dermatología',
  'Oftalmología',
  'Cardiología',
  'Traumatología',
  'Odontología',
  'Imagenología',
  'Laboratorio clínico',
  'Medicina interna',
  'Oncología',
  'Anestesiología',
  'Otro',
] as const;

export const DOC_LABELS: Record<DocType, string> = {
  RUC: 'RUC (11 dígitos)',
  DNI: 'DNI (8 dígitos)',
  CE: 'CE (9 dígitos)',
};

export const EMPTY_SUPPLIER_FORM: Omit<Supplier, 'id'> = {
  name: '',
  document_type: 'RUC',
  document_number: '',
  supplier_type: 'Mercadería',
  specialty: '',
  professional_license: '',
  clinic_name: '',
  fee_rate: undefined,
  accounting_account_code: '',
  credit_days: 0,
  bank_name: '',
  bank_account: '',
  billing_email: '',
  phone: '',
  contact_name: '',
  address: '',
  notes: '',
  active: true,
};

export function isExternalDoctorType(type?: string | null): boolean {
  return type === 'Médico Externo' || type === 'Honorarios';
}

export function validateDocument(type: string | undefined, digits: string): string | null {
  if (!digits) return 'El número de documento es obligatorio';
  const len = digits.length;
  if (type === 'RUC' && len !== 11) return 'RUC debe tener 11 dígitos';
  if (type === 'DNI' && len !== 8) return 'DNI debe tener 8 dígitos';
  if (type === 'CE' && len !== 9) return 'CE debe tener 9 dígitos';
  return null;
}

export function supplierInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'PR';
}

export function formatSupplierMoney(value: number): string {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value || 0);
}

export function paymentLabel(creditDays?: number): { label: string; variant: 'default' | 'secondary' } {
  if (!creditDays || creditDays <= 0) {
    return { label: 'Contado', variant: 'default' };
  }
  return { label: `Crédito ${creditDays} días`, variant: 'secondary' };
}

export function supplierToForm(supplier: Supplier): Omit<Supplier, 'id'> {
  return {
    name: supplier.name,
    document_type: (supplier.document_type as DocType) || 'RUC',
    document_number: supplier.document_number || '',
    supplier_type: (supplier.supplier_type as SupplierType) || 'Mercadería',
    specialty: supplier.specialty || '',
    professional_license: supplier.professional_license || '',
    clinic_name: supplier.clinic_name || '',
    fee_rate: supplier.fee_rate,
    accounting_account_code: supplier.accounting_account_code || '',
    credit_days: supplier.credit_days ?? 0,
    bank_name: supplier.bank_name || '',
    bank_account: supplier.bank_account || supplier.bankAccount || '',
    billing_email: supplier.billing_email || supplier.email || '',
    phone: supplier.phone || '',
    contact_name: supplier.contact_name || '',
    address: supplier.address || '',
    notes: supplier.notes || '',
    active: supplier.active,
  };
}
