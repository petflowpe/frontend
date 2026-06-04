import { useEffect, useState } from 'react';
import {
  Building2,
  FileKey,
  Save,
  Shield,
  CheckCircle,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
  Server,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { useCompanies } from '../hooks/useCompanies';
import { useSunatConfig } from '../hooks/useSunatConfig';
import { getStoredCompanyId } from '../utils/appointmentMappers';
import type { CompanyConfig } from '../services/sunatService';

const emptyConfig = (): CompanyConfig => ({
  ruc: '',
  razonSocial: '',
  nombreComercial: '',
  direccionFiscal: '',
  distrito: '',
  provincia: '',
  departamento: '',
  ubigeo: '',
  oseProvider: 'sunat',
  series: {
    factura: 'F001',
    boleta: 'B001',
    notaCredito: 'FC01',
    notaDebito: 'FD01',
    guiaRemision: 'T001',
  },
});

export function SUNATConfig() {
  const { companies, loading: loadingCompanies } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | ''>('');
  const { state, setState, loading, saving, load, save, setEnvironment, uploadCertificate } =
    useSunatConfig(selectedCompanyId);

  const [showPassword, setShowPassword] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);

  useEffect(() => {
    const stored = getStoredCompanyId();
    if (stored) setSelectedCompanyId(stored);
    else if (companies.length === 1) setSelectedCompanyId(companies[0].id);
  }, [companies]);

  useEffect(() => {
    if (selectedCompanyId) load();
  }, [selectedCompanyId, load]);

  const config = state?.config ?? emptyConfig();
  const patchConfig = (patch: Partial<CompanyConfig>) => {
    if (!state) return;
    setState({ ...state, config: { ...state.config, ...patch } });
  };

  const handleSave = async () => {
    if (!selectedCompanyId) {
      toast.error('Seleccione una empresa');
      return;
    }
    if (!config.ruc || config.ruc.length !== 11) {
      toast.error('El RUC debe tener 11 dígitos');
      return;
    }
    if (!config.razonSocial || !config.direccionFiscal) {
      toast.error('Razón social y dirección son obligatorios');
      return;
    }
    try {
      if (certFile) {
        await uploadCertificate(certFile, config.certificadoPassword);
        setCertFile(null);
      }
      await save();
      toast.success('Configuración SUNAT guardada en el servidor');
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  const handleEnvironmentToggle = async (produccion: boolean) => {
    if (!selectedCompanyId) return;
    try {
      await setEnvironment(produccion);
      toast.success(produccion ? 'Ambiente: Producción' : 'Ambiente: Beta (pruebas)');
    } catch (e: any) {
      toast.error(e.message || 'No se pudo cambiar el ambiente');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Configuración SUNAT</h2>
          <p className="text-sm text-muted-foreground">
            Datos fiscales, certificado y ambiente beta/producción (sin emitir comprobantes aún)
          </p>
        </div>
        {state?.hasCertificate && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Certificado cargado
          </Badge>
        )}
      </div>

      <Card className="p-4 bg-slate-50 border-slate-200">
        <Label className="flex items-center gap-1 mb-2">
          <Building2 className="w-4 h-4" /> Empresa
        </Label>
        <Select
          value={selectedCompanyId === '' ? '' : String(selectedCompanyId)}
          onValueChange={(v) => setSelectedCompanyId(v === '' ? '' : parseInt(v, 10))}
          disabled={loadingCompanies}
        >
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Seleccione empresa" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.razon_social} {c.ruc ? `(${c.ruc})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {loading && <p className="text-slate-500">Cargando configuración…</p>}

      {!loading && selectedCompanyId && state && (
        <>
          <Card className="p-4 border-amber-200 bg-amber-50/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Ambiente SUNAT
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {state.modoProduccion
                    ? 'Producción — comprobantes reales ante SUNAT'
                    : 'Beta — pruebas (recomendado hasta go-live)'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">Beta</span>
                <Switch
                  checked={state.modoProduccion}
                  onCheckedChange={handleEnvironmentToggle}
                />
                <span className="text-sm font-medium">Producción</span>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="empresa" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="empresa">Empresa</TabsTrigger>
              <TabsTrigger value="sol">SOL</TabsTrigger>
              <TabsTrigger value="certificado">Certificado</TabsTrigger>
              <TabsTrigger value="ose">OSE</TabsTrigger>
              <TabsTrigger value="series">Series</TabsTrigger>
            </TabsList>

            <TabsContent value="empresa">
              <Card className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>RUC *</Label>
                    <Input
                      maxLength={11}
                      value={config.ruc}
                      onChange={(e) => patchConfig({ ruc: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Régimen tributario</Label>
                    <Select
                      value={config.regimenTributario || 'RG'}
                      onValueChange={(v) =>
                        patchConfig({ regimenTributario: v as CompanyConfig['regimenTributario'] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RG">Régimen General</SelectItem>
                        <SelectItem value="RER">RER</SelectItem>
                        <SelectItem value="MYPE">MYPE</SelectItem>
                        <SelectItem value="RUS">RUS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Razón social *</Label>
                    <Input
                      value={config.razonSocial}
                      onChange={(e) => patchConfig({ razonSocial: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Nombre comercial</Label>
                    <Input
                      value={config.nombreComercial}
                      onChange={(e) => patchConfig({ nombreComercial: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Dirección fiscal *</Label>
                    <Input
                      value={config.direccionFiscal}
                      onChange={(e) => patchConfig({ direccionFiscal: e.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Distrito"
                    value={config.distrito}
                    onChange={(e) => patchConfig({ distrito: e.target.value })}
                  />
                  <Input
                    placeholder="Provincia"
                    value={config.provincia}
                    onChange={(e) => patchConfig({ provincia: e.target.value })}
                  />
                  <Input
                    placeholder="Departamento"
                    value={config.departamento}
                    onChange={(e) => patchConfig({ departamento: e.target.value })}
                  />
                  <Input
                    placeholder="Ubigeo"
                    maxLength={6}
                    value={config.ubigeo}
                    onChange={(e) => patchConfig({ ubigeo: e.target.value })}
                  />
                </div>
                <div className="pt-4 border-t space-y-3">
                  <Label className="font-semibold">Opciones de documentos (preparación)</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Generar XML automático</span>
                    <Switch
                      checked={config.generarXmlAutomatico !== false}
                      onCheckedChange={(v) => patchConfig({ generarXmlAutomatico: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Generar PDF automático</span>
                    <Switch
                      checked={config.generarPdfAutomatico !== false}
                      onCheckedChange={(v) => patchConfig({ generarPdfAutomatico: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enviar a SUNAT automáticamente</span>
                    <Switch
                      checked={!!config.enviarSunatAutomatico}
                      onCheckedChange={(v) => patchConfig({ enviarSunatAutomatico: v })}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="sol">
              <Card className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  Usuario y clave SOL de la empresa emisora. La clave solo se actualiza si escribe un valor nuevo.
                  {state.hasClaveSol && (
                    <span className="block mt-1 font-medium">✓ Clave SOL ya configurada en el servidor</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Usuario SOL</Label>
                  <Input
                    value={config.usuarioSol || ''}
                    onChange={(e) => patchConfig({ usuarioSol: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Clave SOL {state.hasClaveSol ? '(dejar vacío para no cambiar)' : '*'}</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={config.claveSol || ''}
                      onChange={(e) => patchConfig({ claveSol: e.target.value })}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="certificado">
              <Card className="p-6 space-y-4">
                <div className="flex items-start gap-2 text-sm text-blue-800 bg-blue-50 p-4 rounded-lg">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>Suba el certificado digital (.pfx, .p12 o .pem). Se almacena en el servidor de forma segura.</p>
                </div>
                <div className="space-y-2">
                  <Label>Archivo de certificado</Label>
                  <Input
                    type="file"
                    accept=".pfx,.p12,.pem"
                    onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña del certificado</Label>
                  <Input
                    type="password"
                    value={config.certificadoPassword || ''}
                    onChange={(e) => patchConfig({ certificadoPassword: e.target.value })}
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="ose">
              <Card className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Proveedor OSE / envío</Label>
                  <Select
                    value={config.oseProvider}
                    onValueChange={(v) =>
                      patchConfig({ oseProvider: v as CompanyConfig['oseProvider'] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunat">SUNAT directo</SelectItem>
                      <SelectItem value="nubefact">Nubefact</SelectItem>
                      <SelectItem value="facturador">Facturador.pe</SelectItem>
                      <SelectItem value="otro">Otro OSE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {config.oseProvider !== 'sunat' && (
                  <>
                    <Input
                      placeholder="URL del servicio"
                      value={config.oseConfig?.url || ''}
                      onChange={(e) =>
                        patchConfig({
                          oseConfig: { ...config.oseConfig, url: e.target.value },
                        })
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Usuario API"
                        value={config.oseConfig?.usuario || ''}
                        onChange={(e) =>
                          patchConfig({
                            oseConfig: { ...config.oseConfig, usuario: e.target.value },
                          })
                        }
                      />
                      <Input
                        type="password"
                        placeholder="Contraseña API"
                        value={config.oseConfig?.password || ''}
                        onChange={(e) =>
                          patchConfig({
                            oseConfig: { ...config.oseConfig, password: e.target.value },
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="series">
              <Card className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {(
                    [
                      ['factura', 'Facturas'],
                      ['boleta', 'Boletas'],
                      ['notaCredito', 'Notas de crédito'],
                      ['notaDebito', 'Notas de débito'],
                      ['guiaRemision', 'Guías de remisión'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="space-y-2">
                      <Label>{label}</Label>
                      <Input
                        maxLength={4}
                        value={config.series[key]}
                        onChange={(e) =>
                          patchConfig({
                            series: {
                              ...config.series,
                              [key]: e.target.value.toUpperCase(),
                            },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={handleSave} size="lg" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando…' : 'Guardar en servidor'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
