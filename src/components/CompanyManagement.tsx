import { useState, useEffect } from 'react';
import { Building2, Plus, Clock, Save, Edit, Loader2, MapPin } from 'lucide-react';
import { BranchesConfigModal } from './users/BranchesConfigModal';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { useCompanies, type Company, type WorkingHours } from '../hooks/useCompanies';
import { toast } from 'sonner';

const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export function CompanyManagement() {
  const {
    companies,
    loading,
    refresh,
    createCompany,
    updateCompany,
    getWorkingHours,
    saveWorkingHours,
    DEFAULT_WORKING_HOURS,
  } = useCompanies();

  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showHours, setShowHours] = useState<Company | null>(null);
  const [hoursLoading, setHoursLoading] = useState(false);
  const [branchesTarget, setBranchesTarget] = useState<Company | null>(null);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({ ...DEFAULT_WORKING_HOURS });
  const [formData, setFormData] = useState<Partial<Company>>({
    razon_social: '',
    nombre_comercial: '',
    ruc: '',
    direccion: '',
    ubigeo: '150101',
    distrito: '',
    provincia: '',
    departamento: '',
    telefono: '',
    email: '',
    web: '',
    usuario_sol: '',
    clave_sol: '',
    activo: true,
  });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditingCompany(null);
    setFormData({
      razon_social: '',
      nombre_comercial: '',
      ruc: '',
      direccion: '',
      ubigeo: '150101',
      distrito: '',
      provincia: '',
      departamento: '',
      telefono: '',
      email: '',
      web: '',
      usuario_sol: '',
      clave_sol: '',
      activo: true,
    });
    setShowForm(true);
  };

  const openEdit = (c: Company) => {
    setEditingCompany(c);
    setFormData({
      razon_social: c.razon_social,
      nombre_comercial: c.nombre_comercial ?? '',
      ruc: c.ruc,
      direccion: c.direccion ?? '',
      ubigeo: (c as any).ubigeo ?? '150101',
      distrito: c.distrito ?? '',
      provincia: c.provincia ?? '',
      departamento: c.departamento ?? '',
      telefono: c.telefono ?? '',
      email: c.email ?? '',
      web: (c as any).web ?? '',
      usuario_sol: '',
      clave_sol: '',
      activo: c.activo ?? true,
    });
    setShowForm(true);
  };

  const handleSaveCompany = async () => {
    if (!formData.ruc || !formData.razon_social || !formData.direccion || !formData.email) {
      toast.error('Completa RUC, razón social, dirección y email');
      return;
    }
    if (!formData.ubigeo || formData.ubigeo.length !== 6) {
      toast.error('Ubigeo debe tener 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        distrito: formData.distrito || formData.distrito,
        provincia: formData.provincia || 'Lima',
        departamento: formData.departamento || 'Lima',
        usuario_sol: formData.usuario_sol || (formData.ruc + 'MODDATOS'),
        clave_sol: formData.clave_sol || 'moddatos',
      };
      if (editingCompany) {
        await updateCompany(editingCompany.id, payload as Partial<Company>);
      } else {
        await createCompany(payload as Partial<Company>);
      }
      setShowForm(false);
      refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const openWorkingHours = async (c: Company) => {
    setShowHours(c);
    setHoursLoading(true);
    try {
      const wh = await getWorkingHours(c.id);
      setWorkingHours(wh);
    } catch {
      setWorkingHours({ ...DEFAULT_WORKING_HOURS });
    } finally {
      setHoursLoading(false);
    }
  };

  const handleSaveWorkingHours = async () => {
    if (!showHours) return;
    setSaving(true);
    try {
      await saveWorkingHours(showHours.id, workingHours);
      setShowHours(null);
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar horarios');
    } finally {
      setSaving(false);
    }
  };

  const setDayHours = (day: string, field: 'open' | 'start' | 'end', value: boolean | string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...(prev[day] || { open: true, start: '08:00', end: '18:00' }),
        [field]: value,
      },
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8 text-blue-600" />
          Empresas
        </h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva empresa
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{c.razon_social}</p>
                  <p className="text-sm text-muted-foreground">{c.ruc}</p>
                  {c.distrito && (
                    <p className="text-xs text-muted-foreground mt-1">{c.distrito}, {c.provincia}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(c)} title="Editar empresa">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBranchesTarget(c)}
                    title="Configurar sedes / sucursales"
                  >
                    <MapPin className="h-4 w-4 text-cyan-500" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openWorkingHours(c)}
                    title="Horarios laborales"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog Crear/Editar Empresa */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Editar empresa' : 'Nueva empresa'}</DialogTitle>
            <DialogDescription>
              {editingCompany ? 'Actualiza los datos de la empresa.' : 'Registra una nueva empresa.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>RUC *</Label>
                <Input
                  value={formData.ruc ?? ''}
                  onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                  placeholder="11 dígitos"
                  maxLength={11}
                />
              </div>
              <div>
                <Label>Razón social *</Label>
                <Input
                  value={formData.razon_social ?? ''}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                  placeholder="Nombre legal"
                />
              </div>
            </div>
            <div>
              <Label>Nombre comercial</Label>
              <Input
                value={formData.nombre_comercial ?? ''}
                onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
                placeholder="Marca o nombre comercial"
              />
            </div>
            <div>
              <Label>Dirección *</Label>
              <Input
                value={formData.direccion ?? ''}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Calle, número"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Ubigeo (6 dígitos) *</Label>
                <Input
                  value={formData.ubigeo ?? ''}
                  onChange={(e) => setFormData({ ...formData, ubigeo: e.target.value })}
                  placeholder="150101"
                  maxLength={6}
                />
              </div>
              <div>
                <Label>Distrito *</Label>
                <Input
                  value={formData.distrito ?? ''}
                  onChange={(e) => setFormData({ ...formData, distrito: e.target.value })}
                  placeholder="Miraflores"
                />
              </div>
              <div>
                <Label>Provincia</Label>
                <Input
                  value={formData.provincia ?? ''}
                  onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                  placeholder="Lima"
                />
              </div>
            </div>
            <div>
              <Label>Departamento</Label>
              <Input
                value={formData.departamento ?? ''}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                placeholder="Lima"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email ?? ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contacto@empresa.pe"
                />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input
                  value={formData.telefono ?? ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+51 999 999 999"
                />
              </div>
            </div>
            {!editingCompany && (
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <Label>Usuario SOL (requerido backend)</Label>
                  <Input
                    value={formData.usuario_sol ?? ''}
                    onChange={(e) => setFormData({ ...formData, usuario_sol: e.target.value })}
                    placeholder="RUC+MODDATOS por defecto"
                  />
                </div>
                <div>
                  <Label>Clave SOL</Label>
                  <Input
                    type="password"
                    value={formData.clave_sol ?? ''}
                    onChange={(e) => setFormData({ ...formData, clave_sol: e.target.value })}
                    placeholder="moddatos por defecto"
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.activo ?? true}
                onCheckedChange={(v) => setFormData({ ...formData, activo: v })}
              />
              <Label>Activa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveCompany} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Horarios laborales */}
      <Dialog open={!!showHours} onOpenChange={() => setShowHours(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Horarios laborales</DialogTitle>
            <DialogDescription>
              {showHours && (
                <>Días y horarios en los que la empresa trabaja. Las citas solo se permiten en estos rangos.</>
              )}
            </DialogDescription>
          </DialogHeader>
          {showHours && (
            <>
              <p className="text-sm font-medium text-muted-foreground">{showHours.razon_social}</p>
              {hoursLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3 py-2">
                  {Object.entries(DAY_LABELS).map(([day, label]) => (
                    <div key={day} className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 w-28">
                        <Switch
                          checked={workingHours[day]?.open ?? false}
                          onCheckedChange={(v) => setDayHours(day, 'open', v)}
                        />
                        <span className="text-sm">{label}</span>
                      </div>
                      {workingHours[day]?.open && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={workingHours[day]?.start ?? '08:00'}
                            onChange={(e) => setDayHours(day, 'start', e.target.value)}
                            className="w-28"
                          />
                          <span className="text-muted-foreground">a</span>
                          <Input
                            type="time"
                            value={workingHours[day]?.end ?? '18:00'}
                            onChange={(e) => setDayHours(day, 'end', e.target.value)}
                            className="w-28"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowHours(null)}>
                  Cerrar
                </Button>
                <Button onClick={handleSaveWorkingHours} disabled={saving || hoursLoading}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar horarios
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Configurar sedes (sucursales) de la empresa seleccionada */}
      <BranchesConfigModal
        open={!!branchesTarget}
        onOpenChange={(open) => { if (!open) setBranchesTarget(null); }}
        companyId={branchesTarget?.id ?? null}
      />
    </div>
  );
}
