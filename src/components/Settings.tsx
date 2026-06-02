import { useState } from 'react';
import { Settings as SettingsIcon, Save, User, Building, Bell, Shield, Palette, Globe, Database, Car, DollarSign, MapPin, FileText, Plus, Trash2, MessageSquare, Calendar, Cog } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ChatAutomationConfig } from './ChatAutomationConfig';
import { GoogleMapsConfig } from './admin/GoogleMapsConfig';
import { CalendarSettings } from './settings/CalendarSettings';
import { OperationsSettings } from './settings/OperationsSettings';
import { toast } from 'sonner';

interface SettingsProps {
  currentUser?: { companyId?: number; id?: string; role?: string } | null;
}

export function Settings({ currentUser }: SettingsProps) {
  const [businessSettings, setBusinessSettings] = useState({
    name: 'SmartPet Mobile Services',
    address: 'Av. Larco 1234, Miraflores, Lima',
    phone: '+51 987 654 321',
    email: 'info@smartpet.pe',
    website: 'www.smartpet.pe',
    taxId: '20123456789',
    logo: '',
    description: 'Servicios profesionales de grooming para mascotas a domicilio con tecnología avanzada',
    ubigeo: '150101',
    district: 'Miraflores',
    province: 'Lima',
    department: 'Lima',
    taxRegime: 'RG'
  });

  const [operationalSettings, setOperationalSettings] = useState({
    workingHours: {
      start: '08:00',
      end: '18:00'
    },
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false
    },
    serviceRadius: 25,
    emergencyServices: true,
    holidayWork: false,
    autoConfirmation: true,
    reminderTime: 24
  });

  const [pricingSettings, setPricingSettings] = useState({
    taxRate: 18,
    currency: 'PEN',
    travelFee: 10,
    emergencyFee: 30,
    holidayMultiplier: 1.5,
    discounts: {
      newClient: 10,
      loyalClient: 15,
      multiPet: 20
    },
    paymentTerms: 30,
    igvRate: 18
  });

  const [systemSettings, setSystemSettings] = useState({
    language: 'es',
    timezone: 'America/Lima',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    automaticBackup: true,
    dataRetention: 36,
    maintenanceMode: false,
    debugMode: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 60,
    passwordPolicy: true,
    loginNotifications: true,
    apiAccess: false,
    dataEncryption: true,
    auditLog: true
  });

  const [integrationSettings, setIntegrationSettings] = useState({
    googleMaps: {
      enabled: true,
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
    },
    stripe: {
      enabled: true,
      publicKey: 'pk_test_...',
      secretKey: 'sk_test_...'
    },
    mailgun: {
      enabled: false,
      domain: '',
      apiKey: ''
    },
    twilio: {
      enabled: false,
      accountSid: '',
      authToken: '',
      phoneNumber: ''
    }
  });

  const [templates, setTemplates] = useState([
    { 
      id: 'generic', 
      name: 'Conformidad Estándar (Grooming)', 
      content: "Yo, [CLIENTE], certifico mi conformidad con el servicio de estética realizado a mi mascota [MASCOTA]. He verificado que el corte y baño se han realizado según lo acordado y recibo a mi mascota en buenas condiciones." 
    },
    { 
      id: 'vet_procedure', 
      name: 'Procedimiento Veterinario', 
      content: "Yo, [CLIENTE], autorizo los procedimientos veterinarios realizados a [MASCOTA]. Se me han explicado los tratamientos administrados y las indicaciones post-atención." 
    },
    { 
      id: 'anesthesia', 
      name: 'Consentimiento Anestesia', 
      content: "Yo, [CLIENTE], doy mi consentimiento informado para la sedación/anestesia de [MASCOTA], comprendiendo los riesgos inherentes al procedimiento explicados por el médico veterinario." 
    }
  ]);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const handleSave = (section: string) => {
    // Simular guardado
    console.log(`Guardando configuración de ${section}...`);
    toast.success(`Configuración de ${section} guardada correctamente`);
  };

  const saveTemplate = (id: string, newContent: string) => {
    setTemplates(templates.map(t => t.id === id ? { ...t, content: newContent } : t));
    setEditingTemplate(null);
    toast.success('Plantilla actualizada');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-primary">Configuración del Sistema</h1>
          <p className="text-muted-foreground">Administra la configuración general de tu negocio</p>
        </div>
        <Button onClick={() => handleSave('all')}>
          <Save className="h-4 w-4 mr-2" />
          Guardar Todo
        </Button>
      </div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto p-1 gap-1">
          <TabsTrigger value="business" className="flex-1">Negocio</TabsTrigger>
          <TabsTrigger value="operations" className="flex-1 flex items-center justify-center gap-2">
            <Cog className="w-4 h-4" />
            Operaciones
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex-1">Precios</TabsTrigger>
          <TabsTrigger value="system" className="flex-1">Sistema</TabsTrigger>
          <TabsTrigger value="security" className="flex-1">Seguridad</TabsTrigger>
          <TabsTrigger value="templates" className="flex-1">Plantillas</TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="googlemaps" className="flex-1">Google Maps</TabsTrigger>
          <TabsTrigger value="integrations" className="flex-1">Integraciones</TabsTrigger>
          <TabsTrigger value="automation" className="flex-1 flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Respuestas Auto.
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <CalendarSettings companyId={currentUser?.companyId ?? 1} />
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <OperationsSettings companyId={currentUser?.companyId ?? null} />
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
           <ChatAutomationConfig />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center space-x-2">
                 <FileText className="h-5 w-5" />
                 <h3 className="text-lg">Gestión de Plantillas y Consentimientos</h3>
               </div>
               <Button size="sm">
                 <Plus className="h-4 w-4 mr-2" />
                 Nueva Plantilla
               </Button>
            </div>

            <div className="space-y-6">
              {templates.map(template => (
                <div key={template.id} className="border rounded-xl p-4 bg-slate-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-800">{template.name}</h4>
                    <div className="flex gap-2">
                       {editingTemplate === template.id ? (
                         <div className="flex gap-2">
                           <Button size="sm" variant="outline" onClick={() => setEditingTemplate(null)}>Cancelar</Button>
                           <Button size="sm" onClick={() => saveTemplate(template.id, template.content)}>Guardar</Button>
                         </div>
                       ) : (
                         <Button size="sm" variant="ghost" onClick={() => setEditingTemplate(template.id)}>Editar</Button>
                       )}
                    </div>
                  </div>
                  
                  {editingTemplate === template.id ? (
                    <Textarea 
                      value={template.content} 
                      onChange={(e) => {
                        const newTemplates = templates.map(t => 
                          t.id === template.id ? { ...t, content: e.target.value } : t
                        );
                        setTemplates(newTemplates);
                      }}
                      className="min-h-[100px] bg-white"
                    />
                  ) : (
                    <p className="text-sm text-slate-600 bg-white p-3 rounded border italic">
                      "{template.content}"
                    </p>
                  )}
                  <div className="mt-2 text-xs text-slate-400">
                    Variables disponibles: <span className="font-mono bg-slate-200 px-1 rounded">[CLIENTE]</span>, <span className="font-mono bg-slate-200 px-1 rounded">[MASCOTA]</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="h-5 w-5" />
              <h3 className="text-lg">Información del Negocio</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Nombre del negocio</Label>
                <Input
                  id="business-name"
                  value={businessSettings.name}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tax-id">RUC *</Label>
                <Input
                  id="tax-id"
                  value={businessSettings.taxId}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, taxId: e.target.value })}
                  placeholder="20123456789"
                  maxLength={11}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={businessSettings.phone}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessSettings.email}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, email: e.target.value })}
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={businessSettings.address}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Sitio web</Label>
                <Input
                  id="website"
                  value={businessSettings.website}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, website: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Logo (URL)</Label>
                <Input
                  id="logo"
                  value={businessSettings.logo}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, logo: e.target.value })}
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descripción del negocio</Label>
                <Textarea
                  id="description"
                  value={businessSettings.description}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, description: e.target.value })}
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-5 w-5" />
              <h3 className="text-lg">Configuración Operacional</h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Horarios de Trabajo</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Hora de inicio</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={operationalSettings.workingHours.start}
                      onChange={(e) => setOperationalSettings({
                        ...operationalSettings,
                        workingHours: { ...operationalSettings.workingHours, start: e.target.value }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">Hora de fin</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={operationalSettings.workingHours.end}
                      onChange={(e) => setOperationalSettings({
                        ...operationalSettings,
                        workingHours: { ...operationalSettings.workingHours, end: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Días laborables</Label>
                  {Object.entries(operationalSettings.workingDays).map(([day, enabled]) => {
                    const dayNames: { [key: string]: string } = {
                      monday: 'Lunes',
                      tuesday: 'Martes',
                      wednesday: 'Miércoles',
                      thursday: 'Jueves',
                      friday: 'Viernes',
                      saturday: 'Sábado',
                      sunday: 'Domingo'
                    };

                    return (
                      <div key={day} className="flex items-center justify-between">
                        <Label htmlFor={day}>{dayNames[day]}</Label>
                        <Switch
                          id={day}
                          checked={enabled}
                          onCheckedChange={(checked) => setOperationalSettings({
                            ...operationalSettings,
                            workingDays: { ...operationalSettings.workingDays, [day]: checked }
                          })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-radius">Radio de servicio (km)</Label>
                  <Input
                    id="service-radius"
                    type="number"
                    value={operationalSettings.serviceRadius}
                    onChange={(e) => setOperationalSettings({
                      ...operationalSettings,
                      serviceRadius: Number(e.target.value)
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Recordatorio de cita (horas antes)</Label>
                  <Input
                    id="reminder-time"
                    type="number"
                    value={operationalSettings.reminderTime}
                    onChange={(e) => setOperationalSettings({
                      ...operationalSettings,
                      reminderTime: Number(e.target.value)
                    })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emergency-services">Servicios de emergencia</Label>
                    <p className="text-sm text-muted-foreground">Permitir citas urgentes fuera del horario</p>
                  </div>
                  <Switch
                    id="emergency-services"
                    checked={operationalSettings.emergencyServices}
                    onCheckedChange={(checked) => setOperationalSettings({
                      ...operationalSettings,
                      emergencyServices: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="holiday-work">Trabajo en días festivos</Label>
                    <p className="text-sm text-muted-foreground">Permitir servicios en días festivos</p>
                  </div>
                  <Switch
                    id="holiday-work"
                    checked={operationalSettings.holidayWork}
                    onCheckedChange={(checked) => setOperationalSettings({
                      ...operationalSettings,
                      holidayWork: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-confirmation">Confirmación automática</Label>
                    <p className="text-sm text-muted-foreground">Confirmar citas automáticamente al ser creadas</p>
                  </div>
                  <Switch
                    id="auto-confirmation"
                    checked={operationalSettings.autoConfirmation}
                    onCheckedChange={(checked) => setOperationalSettings({
                      ...operationalSettings,
                      autoConfirmation: checked
                    })}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={() => handleSave('business')}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="h-5 w-5" />
              <h3 className="text-lg">Configuración de Precios</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tasa de impuesto (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={pricingSettings.taxRate}
                    onChange={(e) => setPricingSettings({ 
                      ...pricingSettings, 
                      taxRate: Number(e.target.value) 
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <select
                    id="currency"
                    className="w-full p-2 border rounded-md"
                    value={pricingSettings.currency}
                    onChange={(e) => setPricingSettings({ 
                      ...pricingSettings, 
                      currency: e.target.value 
                    })}
                  >
                    <option value="PEN">Sol Peruano (S/)</option>
                    <option value="USD">Dólar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">Libra (£)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment-terms">Términos de pago (días)</Label>
                  <Input
                    id="payment-terms"
                    type="number"
                    value={pricingSettings.paymentTerms}
                    onChange={(e) => setPricingSettings({ 
                      ...pricingSettings, 
                      paymentTerms: Number(e.target.value) 
                    })}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">Tarifas Adicionales</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="travel-fee">Tarifa de desplazamiento (€)</Label>
                    <Input
                      id="travel-fee"
                      type="number"
                      value={pricingSettings.travelFee}
                      onChange={(e) => setPricingSettings({ 
                        ...pricingSettings, 
                        travelFee: Number(e.target.value) 
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergency-fee">Tarifa de emergencia (€)</Label>
                    <Input
                      id="emergency-fee"
                      type="number"
                      value={pricingSettings.emergencyFee}
                      onChange={(e) => setPricingSettings({ 
                        ...pricingSettings, 
                        emergencyFee: Number(e.target.value) 
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="holiday-multiplier">Multiplicador festivos</Label>
                    <Input
                      id="holiday-multiplier"
                      type="number"
                      step="0.1"
                      value={pricingSettings.holidayMultiplier}
                      onChange={(e) => setPricingSettings({ 
                        ...pricingSettings, 
                        holidayMultiplier: Number(e.target.value) 
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">Descuentos (%)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-client-discount">Cliente nuevo</Label>
                    <Input
                      id="new-client-discount"
                      type="number"
                      value={pricingSettings.discounts.newClient}
                      onChange={(e) => setPricingSettings({ 
                        ...pricingSettings, 
                        discounts: { 
                          ...pricingSettings.discounts, 
                          newClient: Number(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="loyal-client-discount">Cliente leal</Label>
                    <Input
                      id="loyal-client-discount"
                      type="number"
                      value={pricingSettings.discounts.loyalClient}
                      onChange={(e) => setPricingSettings({ 
                        ...pricingSettings, 
                        discounts: { 
                          ...pricingSettings.discounts, 
                          loyalClient: Number(e.target.value) 
                        }
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="multi-pet-discount">Múltiples mascotas</Label>
                    <Input
                      id="multi-pet-discount"
                      type="number"
                      value={pricingSettings.discounts.multiPet}
                      onChange={(e) => setPricingSettings({ 
                        ...pricingSettings, 
                        discounts: { 
                          ...pricingSettings.discounts, 
                          multiPet: Number(e.target.value) 
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={() => handleSave('pricing')}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5" />
              <h3 className="text-lg">Configuración del Sistema</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <select
                    id="language"
                    className="w-full p-2 border rounded-md"
                    value={systemSettings.language}
                    onChange={(e) => setSystemSettings({ 
                      ...systemSettings, 
                      language: e.target.value 
                    })}
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona horaria</Label>
                  <select
                    id="timezone"
                    className="w-full p-2 border rounded-md"
                    value={systemSettings.timezone}
                    onChange={(e) => setSystemSettings({ 
                      ...systemSettings, 
                      timezone: e.target.value 
                    })}
                  >
                    <option value="Europe/Madrid">Madrid (GMT+1)</option>
                    <option value="Europe/London">Londres (GMT+0)</option>
                    <option value="America/New_York">Nueva York (GMT-5)</option>
                    <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                    <option value="America/Lima">Lima (GMT-5)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-format">Formato de fecha</Label>
                  <select
                    id="date-format"
                    className="w-full p-2 border rounded-md"
                    value={systemSettings.dateFormat}
                    onChange={(e) => setSystemSettings({ 
                      ...systemSettings, 
                      dateFormat: e.target.value 
                    })}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time-format">Formato de hora</Label>
                  <select
                    id="time-format"
                    className="w-full p-2 border rounded-md"
                    value={systemSettings.timeFormat}
                    onChange={(e) => setSystemSettings({ 
                      ...systemSettings, 
                      timeFormat: e.target.value 
                    })}
                  >
                    <option value="24h">24 horas</option>
                    <option value="12h">12 horas (AM/PM)</option>
                  </select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="automatic-backup">Respaldo automático</Label>
                    <p className="text-sm text-muted-foreground">Crear respaldos automáticos de los datos</p>
                  </div>
                  <Switch
                    id="automatic-backup"
                    checked={systemSettings.automaticBackup}
                    onCheckedChange={(checked) => setSystemSettings({ 
                      ...systemSettings, 
                      automaticBackup: checked 
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Retención de datos (meses)</Label>
                  <Input
                    id="data-retention"
                    type="number"
                    value={systemSettings.dataRetention}
                    onChange={(e) => setSystemSettings({ 
                      ...systemSettings, 
                      dataRetention: Number(e.target.value) 
                    })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Tiempo que se conservan los datos antes de ser archivados
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode">Modo mantenimiento</Label>
                    <p className="text-sm text-muted-foreground">Activar para mantenimiento del sistema</p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings({ 
                      ...systemSettings, 
                      maintenanceMode: checked 
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debug-mode">Modo depuración</Label>
                    <p className="text-sm text-muted-foreground">Solo para desarrolladores</p>
                  </div>
                  <Switch
                    id="debug-mode"
                    checked={systemSettings.debugMode}
                    onCheckedChange={(checked) => setSystemSettings({ 
                      ...systemSettings, 
                      debugMode: checked 
                    })}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={() => handleSave('system')}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5" />
              <h3 className="text-lg">Configuración de Seguridad</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor-auth">Autenticación de dos factores</Label>
                  <p className="text-sm text-muted-foreground">Requiere código adicional para acceder</p>
                </div>
                <Switch
                  id="two-factor-auth"
                  checked={securitySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setSecuritySettings({ 
                    ...securitySettings, 
                    twoFactorAuth: checked 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Tiempo de sesión (minutos)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ 
                    ...securitySettings, 
                    sessionTimeout: Number(e.target.value) 
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="password-policy">Política de contraseñas</Label>
                  <p className="text-sm text-muted-foreground">Requerir contraseñas seguras</p>
                </div>
                <Switch
                  id="password-policy"
                  checked={securitySettings.passwordPolicy}
                  onCheckedChange={(checked) => setSecuritySettings({ 
                    ...securitySettings, 
                    passwordPolicy: checked 
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="login-notifications">Notificaciones de acceso</Label>
                  <p className="text-sm text-muted-foreground">Notificar cuando alguien accede al sistema</p>
                </div>
                <Switch
                  id="login-notifications"
                  checked={securitySettings.loginNotifications}
                  onCheckedChange={(checked) => setSecuritySettings({ 
                    ...securitySettings, 
                    loginNotifications: checked 
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="api-access">Acceso a API</Label>
                  <p className="text-sm text-muted-foreground">Permitir acceso mediante API externa</p>
                </div>
                <Switch
                  id="api-access"
                  checked={securitySettings.apiAccess}
                  onCheckedChange={(checked) => setSecuritySettings({ 
                    ...securitySettings, 
                    apiAccess: checked 
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-encryption">Cifrado de datos</Label>
                  <p className="text-sm text-muted-foreground">Cifrar datos sensibles en la base de datos</p>
                </div>
                <Switch
                  id="data-encryption"
                  checked={securitySettings.dataEncryption}
                  onCheckedChange={(checked) => setSecuritySettings({ 
                    ...securitySettings, 
                    dataEncryption: checked 
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="audit-log">Registro de auditoría</Label>
                  <p className="text-sm text-muted-foreground">Registrar todas las acciones del sistema</p>
                </div>
                <Switch
                  id="audit-log"
                  checked={securitySettings.auditLog}
                  onCheckedChange={(checked) => setSecuritySettings({ 
                    ...securitySettings, 
                    auditLog: checked 
                  })}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={() => handleSave('security')}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="googlemaps" className="space-y-6">
          <GoogleMapsConfig />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5" />
              <h3 className="text-lg">Integraciones Externas</h3>
            </div>
            
            <div className="space-y-6">
              {/* Stripe */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Stripe</h4>
                  <Switch
                    checked={integrationSettings.stripe.enabled}
                    onCheckedChange={(checked) => setIntegrationSettings({
                      ...integrationSettings,
                      stripe: { ...integrationSettings.stripe, enabled: checked }
                    })}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Procesamiento de pagos con tarjeta de crédito
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe-public-key">Clave Pública</Label>
                    <Input
                      id="stripe-public-key"
                      value={integrationSettings.stripe.publicKey}
                      onChange={(e) => setIntegrationSettings({
                        ...integrationSettings,
                        stripe: { ...integrationSettings.stripe, publicKey: e.target.value }
                      })}
                      disabled={!integrationSettings.stripe.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-secret-key">Clave Secreta</Label>
                    <Input
                      id="stripe-secret-key"
                      type="password"
                      value={integrationSettings.stripe.secretKey}
                      onChange={(e) => setIntegrationSettings({
                        ...integrationSettings,
                        stripe: { ...integrationSettings.stripe, secretKey: e.target.value }
                      })}
                      disabled={!integrationSettings.stripe.enabled}
                    />
                  </div>
                </div>
              </div>
              
              {/* Mailgun */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Mailgun</h4>
                  <Switch
                    checked={integrationSettings.mailgun.enabled}
                    onCheckedChange={(checked) => setIntegrationSettings({
                      ...integrationSettings,
                      mailgun: { ...integrationSettings.mailgun, enabled: checked }
                    })}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Envío de emails transaccionales
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mailgun-domain">Dominio</Label>
                    <Input
                      id="mailgun-domain"
                      value={integrationSettings.mailgun.domain}
                      onChange={(e) => setIntegrationSettings({
                        ...integrationSettings,
                        mailgun: { ...integrationSettings.mailgun, domain: e.target.value }
                      })}
                      disabled={!integrationSettings.mailgun.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mailgun-api-key">API Key</Label>
                    <Input
                      id="mailgun-api-key"
                      type="password"
                      value={integrationSettings.mailgun.apiKey}
                      onChange={(e) => setIntegrationSettings({
                        ...integrationSettings,
                        mailgun: { ...integrationSettings.mailgun, apiKey: e.target.value }
                      })}
                      disabled={!integrationSettings.mailgun.enabled}
                    />
                  </div>
                </div>
              </div>
              
              {/* Twilio */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Twilio</h4>
                  <Switch
                    checked={integrationSettings.twilio.enabled}
                    onCheckedChange={(checked) => setIntegrationSettings({
                      ...integrationSettings,
                      twilio: { ...integrationSettings.twilio, enabled: checked }
                    })}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Envío de SMS y notificaciones
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twilio-account-sid">Account SID</Label>
                    <Input
                      id="twilio-account-sid"
                      value={integrationSettings.twilio.accountSid}
                      onChange={(e) => setIntegrationSettings({
                        ...integrationSettings,
                        twilio: { ...integrationSettings.twilio, accountSid: e.target.value }
                      })}
                      disabled={!integrationSettings.twilio.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilio-auth-token">Auth Token</Label>
                    <Input
                      id="twilio-auth-token"
                      type="password"
                      value={integrationSettings.twilio.authToken}
                      onChange={(e) => setIntegrationSettings({
                        ...integrationSettings,
                        twilio: { ...integrationSettings.twilio, authToken: e.target.value }
                      })}
                      disabled={!integrationSettings.twilio.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilio-phone-number">Número de teléfono</Label>
                    <Input
                      id="twilio-phone-number"
                      value={integrationSettings.twilio.phoneNumber}
                      onChange={(e) => setIntegrationSettings({
                        ...integrationSettings,
                        twilio: { ...integrationSettings.twilio, phoneNumber: e.target.value }
                      })}
                      disabled={!integrationSettings.twilio.enabled}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={() => handleSave('integrations')}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}