import { useState, useEffect } from 'react';
import { Save, Upload, RefreshCw, MapPin, Clock, DollarSign, Mail, Phone, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useTenantContext } from '../../../hooks/useTenantContext';
import { toast } from 'sonner';

export default function ConfiguracionGeneral() {
  const { tenant, configuracion, reloadConfig } = useTenantContext();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    // Datos del negocio
    nombre_negocio: tenant?.nombre_negocio || '',
    email_contacto: tenant?.email_contacto || '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: tenant?.pais || 'PE',
    
    // Configuración regional
    zona_horaria: tenant?.zona_horaria || 'America/Lima',
    moneda: tenant?.moneda || 'PEN',
    idioma: tenant?.idioma || 'es',
    
    // Branding
    logo_url: tenant?.logo_url || '',
    color_primario: tenant?.color_primario || '#FF6B35',
    color_secundario: tenant?.color_secundario || '#004E89',
    
    // Tipo de negocio
    tipo_negocio: configuracion.global?.tipo_negocio || 'ambos',
    tiene_servicio_movil: configuracion.global?.tiene_servicio_movil ?? true,
    tiene_local_fisico: configuracion.global?.tiene_local_fisico ?? true,
    
    // Notificaciones
    notificaciones_email: configuracion.global?.notificaciones_email ?? true,
    notificaciones_sms: configuracion.global?.notificaciones_sms ?? false,
    notificaciones_whatsapp: configuracion.global?.notificaciones_whatsapp ?? false,
    
    // Pagos
    metodos_pago: configuracion.global?.metodos_pago_aceptados || ['efectivo', 'tarjeta'],
    requiere_pago_adelantado: configuracion.global?.requiere_pago_adelantado ?? false,
    
    // Cancelaciones
    permite_cancelacion: configuracion.global?.permite_cancelacion ?? true,
    horas_minimas_cancelacion: configuracion.global?.horas_minimas_cancelacion || 24
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Guardar en backend Laravel
      // await apiClient.put(`/companies/${tenant.id}`, tenantData)
      // await apiClient.put(`/companies/${tenant.id}/config`, configData)
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      toast.success('✅ Configuración guardada exitosamente');
      setHasChanges(false);
      await reloadConfig();
    } catch (error) {
      toast.error('❌ Error al guardar la configuración');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Subir a Supabase Storage
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logo_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de acciones */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800">
            <RefreshCw className="size-5" />
            <span>Tienes cambios sin guardar</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFormData(formData); // Reset
                setHasChanges(false);
              }}
            >
              Descartar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Negocio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              Información del Negocio
            </CardTitle>
            <CardDescription>
              Datos básicos de tu clínica veterinaria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre_negocio">Nombre del Negocio *</Label>
              <Input
                id="nombre_negocio"
                value={formData.nombre_negocio}
                onChange={(e) => handleChange('nombre_negocio', e.target.value)}
                placeholder="SmartPet Lima"
              />
            </div>

            <div>
              <Label htmlFor="email_contacto">Email de Contacto *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-gray-400" />
                <Input
                  id="email_contacto"
                  type="email"
                  value={formData.email_contacto}
                  onChange={(e) => handleChange('email_contacto', e.target.value)}
                  className="pl-10"
                  placeholder="contacto@smartpet.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 size-4 text-gray-400" />
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  className="pl-10"
                  placeholder="+51 999 888 777"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 size-4 text-gray-400" />
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                  className="pl-10"
                  placeholder="Av. Ejemplo 123, Miraflores"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={formData.ciudad}
                  onChange={(e) => handleChange('ciudad', e.target.value)}
                  placeholder="Lima"
                />
              </div>

              <div>
                <Label htmlFor="pais">País</Label>
                <Select value={formData.pais} onValueChange={(value) => handleChange('pais', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PE">Perú</SelectItem>
                    <SelectItem value="CO">Colombia</SelectItem>
                    <SelectItem value="MX">México</SelectItem>
                    <SelectItem value="CL">Chile</SelectItem>
                    <SelectItem value="AR">Argentina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>
              Logo y colores de tu marca
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Logo del Negocio</Label>
              <div className="mt-2 flex items-center gap-4">
                {formData.logo_url ? (
                  <div className="size-24 rounded-lg border-2 border-gray-200 overflow-hidden">
                    <img
                      src={formData.logo_url}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    <Upload className="size-8" />
                  </div>
                )}

                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="size-4 mr-2" />
                    {formData.logo_url ? 'Cambiar Logo' : 'Subir Logo'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG hasta 2MB
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color_primario">Color Primario</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    id="color_primario"
                    value={formData.color_primario}
                    onChange={(e) => handleChange('color_primario', e.target.value)}
                    className="size-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={formData.color_primario}
                    onChange={(e) => handleChange('color_primario', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="color_secundario">Color Secundario</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    id="color_secundario"
                    value={formData.color_secundario}
                    onChange={(e) => handleChange('color_secundario', e.target.value)}
                    className="size-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    value={formData.color_secundario}
                    onChange={(e) => handleChange('color_secundario', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border" style={{
              background: `linear-gradient(135deg, ${formData.color_primario} 0%, ${formData.color_secundario} 100%)`
            }}>
              <p className="text-white text-center">Vista previa de colores</p>
            </div>
          </CardContent>
        </Card>

        {/* Configuración Regional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              Configuración Regional
            </CardTitle>
            <CardDescription>
              Zona horaria, moneda e idioma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="zona_horaria">Zona Horaria</Label>
              <Select value={formData.zona_horaria} onValueChange={(value) => handleChange('zona_horaria', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Lima">Lima (GMT-5)</SelectItem>
                  <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                  <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                  <SelectItem value="America/Santiago">Santiago (GMT-4/-3)</SelectItem>
                  <SelectItem value="America/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="moneda">Moneda</Label>
                <Select value={formData.moneda} onValueChange={(value) => handleChange('moneda', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PEN">PEN (S/)</SelectItem>
                    <SelectItem value="COP">COP ($)</SelectItem>
                    <SelectItem value="MXN">MXN ($)</SelectItem>
                    <SelectItem value="CLP">CLP ($)</SelectItem>
                    <SelectItem value="ARS">ARS ($)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="idioma">Idioma</Label>
                <Select value={formData.idioma} onValueChange={(value) => handleChange('idioma', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-800">
                💡 <strong>Hora actual:</strong> {new Date().toLocaleString('es-PE', {
                  timeZone: formData.zona_horaria,
                  dateStyle: 'full',
                  timeStyle: 'short'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tipo de Negocio */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de Negocio</CardTitle>
            <CardDescription>
              Servicios que ofreces
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Industria</Label>
              <Select value={formData.tipo_negocio} onValueChange={(value) => handleChange('tipo_negocio', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veterinaria">Solo Veterinaria</SelectItem>
                  <SelectItem value="peluqueria">Solo Peluquería</SelectItem>
                  <SelectItem value="ambos">Veterinaria + Peluquería</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label htmlFor="servicio_movil" className="cursor-pointer">
                    Servicio Móvil (a domicilio)
                  </Label>
                  <p className="text-sm text-gray-500">
                    Atención en la casa del cliente
                  </p>
                </div>
                <Switch
                  id="servicio_movil"
                  checked={formData.tiene_servicio_movil}
                  onCheckedChange={(checked) => handleChange('tiene_servicio_movil', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label htmlFor="local_fisico" className="cursor-pointer">
                    Local Físico / Consultorio
                  </Label>
                  <p className="text-sm text-gray-500">
                    Los clientes vienen a tu local
                  </p>
                </div>
                <Switch
                  id="local_fisico"
                  checked={formData.tiene_local_fisico}
                  onCheckedChange={(checked) => handleChange('tiene_local_fisico', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Canales de comunicación con clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label htmlFor="notif_email" className="cursor-pointer">
                  Email
                </Label>
                <p className="text-sm text-gray-500">
                  Confirmaciones y recordatorios por correo
                </p>
              </div>
              <Switch
                id="notif_email"
                checked={formData.notificaciones_email}
                onCheckedChange={(checked) => handleChange('notificaciones_email', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label htmlFor="notif_sms" className="cursor-pointer">
                  SMS
                </Label>
                <p className="text-sm text-gray-500">
                  Mensajes de texto (requiere integración)
                </p>
              </div>
              <Switch
                id="notif_sms"
                checked={formData.notificaciones_sms}
                onCheckedChange={(checked) => handleChange('notificaciones_sms', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label htmlFor="notif_whatsapp" className="cursor-pointer">
                  WhatsApp
                </Label>
                <p className="text-sm text-gray-500">
                  Mensajes vía WhatsApp Business
                </p>
              </div>
              <Switch
                id="notif_whatsapp"
                checked={formData.notificaciones_whatsapp}
                onCheckedChange={(checked) => handleChange('notificaciones_whatsapp', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pagos y Cancelaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-5" />
              Pagos y Cancelaciones
            </CardTitle>
            <CardDescription>
              Políticas de tu negocio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Métodos de Pago Aceptados</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['efectivo', 'tarjeta', 'yape', 'plin', 'transferencia'].map((metodo) => (
                  <div
                    key={metodo}
                    className={`p-2 rounded border text-center cursor-pointer transition ${
                      formData.metodos_pago.includes(metodo)
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      const newMetodos = formData.metodos_pago.includes(metodo)
                        ? formData.metodos_pago.filter(m => m !== metodo)
                        : [...formData.metodos_pago, metodo];
                      handleChange('metodos_pago', newMetodos);
                    }}
                  >
                    {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label htmlFor="pago_adelantado" className="cursor-pointer">
                  Requiere Pago Adelantado
                </Label>
                <p className="text-sm text-gray-500">
                  El cliente debe pagar al reservar
                </p>
              </div>
              <Switch
                id="pago_adelantado"
                checked={formData.requiere_pago_adelantado}
                onCheckedChange={(checked) => handleChange('requiere_pago_adelantado', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <Label htmlFor="permite_cancelacion" className="cursor-pointer">
                  Permite Cancelación
                </Label>
                <p className="text-sm text-gray-500">
                  Los clientes pueden cancelar citas
                </p>
              </div>
              <Switch
                id="permite_cancelacion"
                checked={formData.permite_cancelacion}
                onCheckedChange={(checked) => handleChange('permite_cancelacion', checked)}
              />
            </div>

            {formData.permite_cancelacion && (
              <div>
                <Label htmlFor="horas_cancelacion">
                  Horas mínimas para cancelar
                </Label>
                <Input
                  id="horas_cancelacion"
                  type="number"
                  value={formData.horas_minimas_cancelacion}
                  onChange={(e) => handleChange('horas_minimas_cancelacion', parseInt(e.target.value))}
                  min={1}
                  max={72}
                />
                <p className="text-sm text-gray-500 mt-1">
                  El cliente debe cancelar con al menos {formData.horas_minimas_cancelacion} horas de anticipación
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Botón flotante de guardar */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            size="lg"
          >
            {isSaving ? (
              <>
                <RefreshCw className="size-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Guardar todos los cambios
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
