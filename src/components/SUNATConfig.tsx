import { useState, useEffect } from 'react';
import { Building2, FileKey, Save, Shield, CheckCircle, AlertCircle, Upload, Eye, EyeOff } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { sunatService, CompanyConfig } from '../services/sunatService';
import { useCompanies } from '../hooks/useCompanies';

export function SUNATConfig() {
  const { companies, loading: loadingCompanies } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
  const [config, setConfig] = useState<CompanyConfig>({
    ruc: '',
    razonSocial: '',
    nombreComercial: '',
    direccionFiscal: '',
    distrito: '',
    provincia: '',
    departamento: '',
    ubigeo: '',
    oseProvider: 'nubefact',
    regimenTributario: 'RG',
    series: {
      factura: 'F001',
      boleta: 'B001',
      notaCredito: 'FC01',
      notaDebito: 'FD01',
      guiaRemision: 'T001'
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = sunatService.getCompanyConfig();
    if (saved) {
      setConfig(saved);
      setIsSaved(true);
    }
  }, []);

  useEffect(() => {
    if (selectedCompanyId === '') return;
    sunatService.fetchCompanyConfig(selectedCompanyId).then((loaded) => {
      if (loaded) {
        setConfig(loaded);
        setIsSaved(true);
      }
    }).catch(() => toast.error('Error al cargar configuración de la empresa'));
  }, [selectedCompanyId]);

  const handleSave = () => {
    // Validaciones
    if (!config.ruc || config.ruc.length !== 11) {
      toast.error('El RUC debe tener 11 dígitos');
      return;
    }

    if (!config.razonSocial) {
      toast.error('La Razón Social es obligatoria');
      return;
    }

    if (!config.direccionFiscal) {
      toast.error('La Dirección Fiscal es obligatoria');
      return;
    }

    // Guardar configuración
    sunatService.setCompanyConfig(config);
    setIsSaved(true);
    
    toast.success('✅ Configuración guardada', {
      description: 'Los datos de la empresa han sido guardados correctamente'
    });
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificateFile(file);
      
      // Leer archivo como base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setConfig({
          ...config,
          certificadoDigital: {
            archivo: base64.split(',')[1], // Remover prefijo data:
            password: config.certificadoDigital?.password || '',
            vigenciaDesde: '',
            vigenciaHasta: ''
          }
        });
        toast.success('Certificado cargado correctamente');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuración SUNAT</h2>
          <p className="text-sm text-muted-foreground">
            Configure los datos de su empresa para facturación electrónica
          </p>
        </div>
        {isSaved && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Configurado
          </Badge>
        )}
      </div>

      <Card className="p-4 bg-slate-50 border-slate-200">
        <Label className="flex items-center gap-1 mb-2"><Building2 className="w-4 h-4" /> Empresa (cargar desde BD)</Label>
        <Select
          value={selectedCompanyId === '' ? '' : String(selectedCompanyId)}
          onValueChange={(v) => setSelectedCompanyId(v === '' ? '' : parseInt(v, 10))}
          disabled={loadingCompanies || companies.length === 0}
        >
          <SelectTrigger className="max-w-xs"><SelectValue placeholder={companies.length === 0 ? 'No hay empresas' : 'Seleccione empresa para cargar config'} /></SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.razon_social} {c.ruc ? `(${c.ruc})` : ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="empresa">
            <Building2 className="w-4 h-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="certificado">
            <FileKey className="w-4 h-4 mr-2" />
            Certificado
          </TabsTrigger>
          <TabsTrigger value="ose">
            <Shield className="w-4 h-4 mr-2" />
            OSE
          </TabsTrigger>
          <TabsTrigger value="series">
            <FileKey className="w-4 h-4 mr-2" />
            Series
          </TabsTrigger>
        </TabsList>

        {/* Tab: Datos de Empresa */}
        <TabsContent value="empresa" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Datos de la Empresa</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC *</Label>
                <Input
                  id="ruc"
                  placeholder="20123456789"
                  maxLength={11}
                  value={config.ruc}
                  onChange={(e) => setConfig({ ...config, ruc: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regimen">Régimen Tributario *</Label>
                <Select
                  value={config.regimenTributario}
                  onValueChange={(value: any) => setConfig({ ...config, regimenTributario: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RG">Régimen General</SelectItem>
                    <SelectItem value="RER">Régimen Especial de Renta</SelectItem>
                    <SelectItem value="MYPE">Régimen MYPE Tributario</SelectItem>
                    <SelectItem value="RUS">Régimen Único Simplificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="razon-social">Razón Social *</Label>
                <Input
                  id="razon-social"
                  placeholder="EMPRESA EJEMPLO S.A.C."
                  value={config.razonSocial}
                  onChange={(e) => setConfig({ ...config, razonSocial: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="nombre-comercial">Nombre Comercial</Label>
                <Input
                  id="nombre-comercial"
                  placeholder="SmartPet"
                  value={config.nombreComercial}
                  onChange={(e) => setConfig({ ...config, nombreComercial: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="direccion">Dirección Fiscal *</Label>
                <Input
                  id="direccion"
                  placeholder="Av. Principal 123"
                  value={config.direccionFiscal}
                  onChange={(e) => setConfig({ ...config, direccionFiscal: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="distrito">Distrito *</Label>
                <Input
                  id="distrito"
                  placeholder="Lima"
                  value={config.distrito}
                  onChange={(e) => setConfig({ ...config, distrito: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provincia">Provincia *</Label>
                <Input
                  id="provincia"
                  placeholder="Lima"
                  value={config.provincia}
                  onChange={(e) => setConfig({ ...config, provincia: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento *</Label>
                <Input
                  id="departamento"
                  placeholder="Lima"
                  value={config.departamento}
                  onChange={(e) => setConfig({ ...config, departamento: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ubigeo">Ubigeo *</Label>
                <Input
                  id="ubigeo"
                  placeholder="150101"
                  maxLength={6}
                  value={config.ubigeo}
                  onChange={(e) => setConfig({ ...config, ubigeo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  placeholder="+51 999 999 999"
                  value={config.telefono || ''}
                  onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={config.email || ''}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Certificado Digital */}
        <TabsContent value="certificado" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Certificado Digital</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Información Importante</p>
                    <p>
                      El certificado digital es necesario para firmar electrónicamente los comprobantes.
                      Debe ser emitido por una entidad certificadora autorizada por INDECOPI.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificado">Archivo de Certificado (.pfx / .p12)</Label>
                <div className="flex gap-2">
                  <Input
                    id="certificado"
                    type="file"
                    accept=".pfx,.p12"
                    onChange={handleCertificateUpload}
                    className="flex-1"
                  />
                  {certificateFile && (
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Cargado
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cert-password">Contraseña del Certificado</Label>
                <div className="relative">
                  <Input
                    id="cert-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={config.certificadoDigital?.password || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      certificadoDigital: {
                        ...config.certificadoDigital,
                        archivo: config.certificadoDigital?.archivo || '',
                        password: e.target.value,
                        vigenciaDesde: config.certificadoDigital?.vigenciaDesde || '',
                        vigenciaHasta: config.certificadoDigital?.vigenciaHasta || ''
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vigencia-desde">Vigencia Desde</Label>
                  <Input
                    id="vigencia-desde"
                    type="date"
                    value={config.certificadoDigital?.vigenciaDesde || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      certificadoDigital: {
                        ...config.certificadoDigital!,
                        vigenciaDesde: e.target.value
                      }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vigencia-hasta">Vigencia Hasta</Label>
                  <Input
                    id="vigencia-hasta"
                    type="date"
                    value={config.certificadoDigital?.vigenciaHasta || ''}
                    onChange={(e) => setConfig({
                      ...config,
                      certificadoDigital: {
                        ...config.certificadoDigital!,
                        vigenciaHasta: e.target.value
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: OSE */}
        <TabsContent value="ose" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Proveedor OSE</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ose-provider">Proveedor *</Label>
                <Select
                  value={config.oseProvider}
                  onValueChange={(value: any) => setConfig({ ...config, oseProvider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunat">SUNAT (Directamente)</SelectItem>
                    <SelectItem value="nubefact">Nubefact</SelectItem>
                    <SelectItem value="facturador">Facturador.pe</SelectItem>
                    <SelectItem value="otro">Otro OSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.oseProvider !== 'sunat' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ose-url">URL del Servicio</Label>
                    <Input
                      id="ose-url"
                      placeholder="https://api.ejemplo.com"
                      value={config.oseConfig?.url || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        oseConfig: {
                          ...config.oseConfig,
                          url: e.target.value,
                          usuario: config.oseConfig?.usuario || '',
                          password: config.oseConfig?.password || ''
                        }
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ose-usuario">Usuario</Label>
                      <Input
                        id="ose-usuario"
                        placeholder="usuario_api"
                        value={config.oseConfig?.usuario || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          oseConfig: {
                            ...config.oseConfig!,
                            usuario: e.target.value
                          }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ose-password">Contraseña</Label>
                      <Input
                        id="ose-password"
                        type="password"
                        placeholder="********"
                        value={config.oseConfig?.password || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          oseConfig: {
                            ...config.oseConfig!,
                            password: e.target.value
                          }
                        })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ose-token">Token de API (opcional)</Label>
                    <Input
                      id="ose-token"
                      placeholder="token_secreto"
                      value={config.oseConfig?.token || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        oseConfig: {
                          ...config.oseConfig!,
                          token: e.target.value
                        }
                      })}
                    />
                  </div>
                </>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Recomendación:</strong> Para producción, se recomienda usar un OSE certificado
                  como Nubefact, Facturador.pe u otro proveedor autorizado por SUNAT.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab: Series */}
        <TabsContent value="series" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Series de Comprobantes</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Las series deben estar autorizadas por SUNAT y configuradas en su sistema.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serie-factura">Serie Facturas</Label>
                  <Input
                    id="serie-factura"
                    placeholder="F001"
                    maxLength={4}
                    value={config.series.factura}
                    onChange={(e) => setConfig({
                      ...config,
                      series: { ...config.series, factura: e.target.value.toUpperCase() }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serie-boleta">Serie Boletas</Label>
                  <Input
                    id="serie-boleta"
                    placeholder="B001"
                    maxLength={4}
                    value={config.series.boleta}
                    onChange={(e) => setConfig({
                      ...config,
                      series: { ...config.series, boleta: e.target.value.toUpperCase() }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serie-nc">Serie Notas de Crédito</Label>
                  <Input
                    id="serie-nc"
                    placeholder="FC01 / BC01"
                    maxLength={4}
                    value={config.series.notaCredito}
                    onChange={(e) => setConfig({
                      ...config,
                      series: { ...config.series, notaCredito: e.target.value.toUpperCase() }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serie-nd">Serie Notas de Débito</Label>
                  <Input
                    id="serie-nd"
                    placeholder="FD01 / BD01"
                    maxLength={4}
                    value={config.series.notaDebito}
                    onChange={(e) => setConfig({
                      ...config,
                      series: { ...config.series, notaDebito: e.target.value.toUpperCase() }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serie-guia">Serie Guías de Remisión</Label>
                  <Input
                    id="serie-guia"
                    placeholder="T001"
                    maxLength={4}
                    value={config.series.guiaRemision}
                    onChange={(e) => setConfig({
                      ...config,
                      series: { ...config.series, guiaRemision: e.target.value.toUpperCase() }
                    })}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="w-4 h-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}
