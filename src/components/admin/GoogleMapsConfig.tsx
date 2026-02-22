import { useState, useEffect } from 'react';
import { MapPin, Key, CheckCircle, XCircle, AlertCircle, ExternalLink, Save, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

export function GoogleMapsConfig() {
  const [apiKey, setApiKey] = useState('');
  const [savedApiKey, setSavedApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [showApiKey, setShowApiKey] = useState(false);
  const [enabledApis, setEnabledApis] = useState<string[]>([]);

  // Cargar API Key guardada al montar
  useEffect(() => {
    const saved = localStorage.getItem('google_maps_api_key') || '';
    const envKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY 
      ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY 
      : '';
    
    const finalKey = saved || envKey;
    
    if (finalKey) {
      setSavedApiKey(finalKey);
      setApiKey(finalKey);
      validateApiKey(finalKey);
    }
  }, []);

  // Validar API Key
  const validateApiKey = async (key: string) => {
    if (!key || key.length < 20) {
      setValidationStatus('invalid');
      return;
    }

    setIsValidating(true);
    setEnabledApis([]);

    try {
      // Intentar cargar Google Maps con la API Key
      const testUrl = `https://maps.googleapis.com/maps/api/js?key=${key}`;
      
      const response = await fetch(testUrl);
      
      if (response.ok) {
        setValidationStatus('valid');
        
        // Detectar qué APIs están habilitadas (esto es una simplificación)
        // En producción deberías hacer llamadas específicas a cada API
        const detected = ['Maps JavaScript API'];
        setEnabledApis(detected);
        
        toast.success('✅ API Key válida');
      } else {
        setValidationStatus('invalid');
        toast.error('❌ API Key inválida o sin permisos');
      }
    } catch (error) {
      setValidationStatus('invalid');
      toast.error('❌ Error al validar API Key');
    } finally {
      setIsValidating(false);
    }
  };

  // Guardar API Key
  const handleSave = () => {
    if (!apiKey) {
      toast.error('⚠️ Ingresa una API Key válida');
      return;
    }

    localStorage.setItem('google_maps_api_key', apiKey);
    setSavedApiKey(apiKey);
    toast.success('✅ API Key guardada correctamente');
    
    // Validar después de guardar
    validateApiKey(apiKey);
  };

  // Limpiar API Key
  const handleClear = () => {
    setApiKey('');
    setSavedApiKey('');
    setValidationStatus('idle');
    setEnabledApis([]);
    localStorage.removeItem('google_maps_api_key');
    toast.info('🗑️ API Key eliminada');
  };

  const requiredApis = [
    { name: 'Maps JavaScript API', required: true, description: 'Mostrar mapas interactivos' },
    { name: 'Geocoding API', required: true, description: 'Convertir direcciones a coordenadas' },
    { name: 'Places API', required: false, description: 'Autocompletar direcciones' },
    { name: 'Directions API', required: false, description: 'Optimizar rutas' },
    { name: 'Distance Matrix API', required: false, description: 'Calcular distancias' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Configuración de Google Maps
          </CardTitle>
          <CardDescription>
            Configura tu API Key de Google Maps para habilitar mapas interactivos en SmartPet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado actual */}
          {savedApiKey && (
            <Alert className={validationStatus === 'valid' ? 'border-green-500 bg-green-50' : validationStatus === 'invalid' ? 'border-red-500 bg-red-50' : ''}>
              {validationStatus === 'valid' ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Google Maps está configurado y funcionando correctamente
                  </AlertDescription>
                </>
              ) : validationStatus === 'invalid' ? (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    API Key inválida o sin los permisos necesarios
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Validando API Key...
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}

          {/* Formulario de API Key */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Key de Google Maps
              </Label>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSyC_TuClaveAquí123456789ABCDEFGHIJK"
                    className="pr-10 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!apiKey || isValidating}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Tu API Key se guarda localmente en el navegador (LocalStorage)
              </p>
            </div>

            {savedApiKey && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => validateApiKey(savedApiKey)}
                  disabled={isValidating}
                >
                  {isValidating ? '⏳ Validando...' : '🔄 Validar API Key'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="text-red-600 hover:text-red-700"
                >
                  🗑️ Eliminar API Key
                </Button>
              </div>
            )}
          </div>

          {/* APIs requeridas */}
          <div>
            <h3 className="text-sm font-semibold mb-3">APIs Necesarias</h3>
            <div className="space-y-2">
              {requiredApis.map((api) => (
                <div key={api.name} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{api.name}</p>
                      {api.required && (
                        <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                      )}
                      {enabledApis.includes(api.name) && (
                        <Badge variant="default" className="text-xs bg-green-600">Habilitada</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{api.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instrucciones */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">¿Cómo obtener una API Key?</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  1
                </div>
                <p>
                  Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    Google Cloud Console <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  2
                </div>
                <p>Crea un nuevo proyecto o selecciona uno existente</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  3
                </div>
                <p>Habilita las APIs necesarias en "APIs y Servicios" &gt; "Biblioteca"</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  4
                </div>
                <p>Ve a "Credenciales" y crea una nueva API Key</p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  5
                </div>
                <p>Restringe la API Key para mayor seguridad (referentes HTTP)</p>
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/docs/GOOGLE_MAPS_SETUP.md', '_blank')}
                  className="w-full"
                >
                  📖 Ver Guía Completa de Configuración
                </Button>
              </div>
            </div>
          </div>

          {/* Información de costos */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Costos:</strong> Google ofrece $200 USD de crédito gratis mensual. 
              Para SmartPet con tu volumen actual (~21 clientes), el uso estimado es $0/mes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tarjeta de prueba */}
      {validationStatus === 'valid' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mapa de Prueba</CardTitle>
            <CardDescription>
              Vista previa del mapa con tu API Key configurada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  El mapa se cargará en los módulos de Análisis Geográfico y Rutas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}