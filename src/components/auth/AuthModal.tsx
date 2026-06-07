import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../context/AuthContext';
import { DocumentType } from '../../types';
import { AddressGeocoder } from '../admin/AddressGeocoder';
import { AuthModalStep2 } from './AuthModalStep2';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  LogIn,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Info,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onGuestBook?: () => void;
  defaultMode?: 'login' | 'register';
}

// Distritos de Lima
const DISTRICTS = [
  'Miraflores', 'San Isidro', 'Barranco', 'Surco', 'La Molina',
  'San Borja', 'Jesús María', 'Lince', 'Pueblo Libre', 'Magdalena',
  'San Miguel', 'Chorrillos', 'Surquillo', 'Ate', 'Breña',
  'Callao', 'Comas', 'Independencia', 'Lima', 'Los Olivos',
  'Rímac', 'San Juan de Lurigancho', 'San Martín de Porres', 'Villa El Salvador'
];

export function AuthModal({ isOpen, onClose, onSuccess, onGuestBook, defaultMode = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Login form
  const [loginMethod, setLoginMethod] = useState<'document' | 'email'>('document');
  const [loginDocType, setLoginDocType] = useState<DocumentType>('DNI');
  const [loginDocNumber, setLoginDocNumber] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form - Paso actual
  const [registerStep, setRegisterStep] = useState(1);

  // PASO 1: Datos Generales
  const [regDocType, setRegDocType] = useState<DocumentType>('DNI');
  const [regDocNumber, setRegDocNumber] = useState('');
  const [regName, setRegName] = useState('');
  const [regLastName1, setRegLastName1] = useState('');
  const [regLastName2, setRegLastName2] = useState('');
  const [regGender, setRegGender] = useState('Masculino');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regPhone1, setRegPhone1] = useState('');
  const [regPhone2, setRegPhone2] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // PASO 2: Dirección
  const [regStreet, setRegStreet] = useState('');
  const [regStreetNumber, setRegStreetNumber] = useState('');
  const [regProvince, setRegProvince] = useState('Lima');
  const [regDistrict, setRegDistrict] = useState('');
  const [regPostalCode, setRegPostalCode] = useState('');
  const [regCoordinates, setRegCoordinates] = useState('');
  const [regCountry, setRegCountry] = useState('Perú');

  const documentTypes: DocumentType[] = ['DNI', 'CE', 'Pasaporte', 'RUC'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let loggedInUser = null as Awaited<ReturnType<typeof login>>;

      if (loginMethod === 'document') {
        if (!loginDocNumber || !loginPassword) {
          setError('Por favor ingresa documento y contraseña');
          setLoading(false);
          return;
        }
        loggedInUser = await login(loginDocType, loginDocNumber, loginPassword);
      } else {
        if (!loginEmail || !loginPassword) {
          setError('Por favor ingresa correo y contraseña');
          setLoading(false);
          return;
        }
        loggedInUser = await login('', '', loginPassword, loginEmail);
      }

      if (loggedInUser) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1500);
      } else {
        setError('Credenciales incorrectas. Verifica tus datos o regístrate.');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    if (!regDocNumber || !regName || !regLastName1 || !regPhone1 || !regEmail || !regPassword || !regConfirmPassword) {
      setError('Por favor completa todos los campos obligatorios del Paso 1');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setError('Por favor ingresa un correo electrónico válido');
      return false;
    }

    // Validar documento según tipo
    if (regDocType === 'DNI' && regDocNumber.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      return false;
    }

    // Validar contraseña
    if (regPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    // Validar que las contraseñas coincidan
    if (regPassword !== regConfirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!regStreet || !regStreetNumber || !regProvince || !regDistrict) {
      setError('Por favor completa todos los campos obligatorios del Paso 2');
      return false;
    }

    // TEMPORAL: Validación deshabilitada para modo pruebas
    // Validar que se hayan detectado las coordenadas
    // if (!regCoordinates) {
    //   setError('Por favor presiona el botón "Autocompletar" para detectar tu ubicación');
    //   return false;
    // }

    // Validar formato de coordenadas si existen
    const coordsRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (regCoordinates && !coordsRegex.test(regCoordinates)) {
      setError('Error en el formato de coordenadas. Intenta detectar la ubicación nuevamente.');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    setError('');
    
    if (registerStep === 1 && validateStep1()) {
      setRegisterStep(2);
    }
  };

  const handlePreviousStep = () => {
    setError('');
    setRegisterStep(registerStep - 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateStep2()) {
      setLoading(false);
      return;
    }

    try {
      const success = await register({
        documentType: regDocType,
        documentNumber: regDocNumber,
        firstName: regName,
        lastName: `${regLastName1} ${regLastName2}`.trim(),
        email: regEmail,
        phone: regPhone1,
        address: `${regStreet} ${regStreetNumber}`,
        district: regDistrict
      });

      if (success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1500);
      } else {
        setError('Ya existe una cuenta con este documento. Intenta iniciar sesión.');
      }
    } catch (err) {
      setError('Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setSuccess(false);
    setRegisterStep(1);
    setLoginDocNumber('');
    setLoginEmail('');
    setRegDocNumber('');
    setRegName('');
    setRegLastName1('');
    setRegLastName2('');
    setRegGender('Masculino');
    setRegBirthDate('');
    setRegPhone1('');
    setRegPhone2('');
    setRegEmail('');
    setRegStreet('');
    setRegStreetNumber('');
    setRegProvince('Lima');
    setRegDistrict('');
    setRegPostalCode('');
    setRegCoordinates('');
    setRegCountry('Perú');
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    resetForm();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onKeyDown={handleKeyDown}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-2">
          <CardHeader className="relative pb-4">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
            <CardTitle id="auth-modal-title" className="text-2xl">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {mode === 'login' 
                ? 'Accede a tu portal de cliente SmartPet' 
                : mode === 'register' && registerStep === 1
                  ? 'Paso 1 de 2: Datos Generales'
                  : 'Paso 2 de 2: Dirección y Ubicación'}
            </p>
            
            {/* Progress Indicator para registro */}
            {mode === 'register' && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                  registerStep === 1 ? 'bg-primary text-white' : 'bg-green-500 text-white'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${registerStep === 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                  registerStep === 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    {mode === 'login' ? '¡Bienvenido!' : '¡Cuenta Creada!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {mode === 'login' 
                      ? 'Redirigiendo a tu portal...' 
                      : 'Tu cuenta ha sido creada exitosamente'}
                  </p>
                </motion.div>
              ) : mode === 'login' ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleLogin}
                  className="space-y-6"
                >
                  {/* Método de Login */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('document')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        loginMethod === 'document'
                          ? 'bg-background shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Por Documento
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        loginMethod === 'email'
                          ? 'bg-background shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Por Correo
                    </button>
                  </div>

                  {loginMethod === 'document' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-3">
                        <div className="col-span-2">
                          <Label>Tipo de Documento</Label>
                          <select
                            value={loginDocType}
                            onChange={(e) => setLoginDocType(e.target.value as DocumentType)}
                            className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                          >
                            {documentTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <Label>Número de Documento</Label>
                          <Input
                            type="text"
                            value={loginDocNumber}
                            onChange={(e) => setLoginDocNumber(e.target.value)}
                            placeholder="Ej: 12345678"
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label>Correo Electrónico</Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="tu@email.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}

                  {/* Contraseña */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Contraseña
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    <LogIn className="w-4 h-4 mr-2" />
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>

                  <div className="text-center space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">¿No tienes cuenta? </span>
                      <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className="text-primary hover:underline font-medium"
                      >
                        Regístrate aquí
                      </button>
                    </div>
                    {onGuestBook && (
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            onClose();
                            onGuestBook();
                          }}
                        >
                          Continuar como invitado (reservar sin cuenta)
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.form>
              ) : registerStep === 1 ? (
                <motion.form
                  key="register-step-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}
                  className="space-y-6"
                >
                  {/* Documento */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4" />
                      Documento de Identidad *
                    </Label>
                    <div className="grid grid-cols-5 gap-3">
                      <div className="col-span-2">
                        <select
                          value={regDocType}
                          onChange={(e) => setRegDocType(e.target.value as DocumentType)}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          required
                        >
                          {documentTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="text"
                          value={regDocNumber}
                          onChange={(e) => setRegDocNumber(e.target.value)}
                          placeholder={regDocType === 'DNI' ? '12345678' : 'Número'}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nombres y Apellidos */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="mb-2 block">Nombre *</Label>
                      <Input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Juan"
                        required
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Apellido Paterno *</Label>
                      <Input
                        type="text"
                        value={regLastName1}
                        onChange={(e) => setRegLastName1(e.target.value)}
                        placeholder="Pérez"
                        required
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Apellido Materno</Label>
                      <Input
                        type="text"
                        value={regLastName2}
                        onChange={(e) => setRegLastName2(e.target.value)}
                        placeholder="López"
                      />
                    </div>
                  </div>

                  {/* Sexo y Fecha de Nacimiento */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="mb-2 block">Sexo *</Label>
                      <select
                        value={regGender}
                        onChange={(e) => setRegGender(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        required
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <Label className="mb-2 block">Fecha de Nacimiento</Label>
                      <Input
                        type="date"
                        value={regBirthDate}
                        onChange={(e) => setRegBirthDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Teléfonos */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4" />
                        Teléfono 1 *
                      </Label>
                      <Input
                        type="tel"
                        value={regPhone1}
                        onChange={(e) => setRegPhone1(e.target.value)}
                        placeholder="+51 987654321"
                        required
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Teléfono 2</Label>
                      <Input
                        type="tel"
                        value={regPhone2}
                        onChange={(e) => setRegPhone2(e.target.value)}
                        placeholder="+51 123456789"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4" />
                      Correo Electrónico *
                    </Label>
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  {/* Contraseñas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4" />
                        Contraseña *
                      </Label>
                      <div className="relative">
                        <Input
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Crea una contraseña"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Confirmar Contraseña *</Label>
                      <div className="relative">
                        <Input
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="Repite tu contraseña"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => switchMode('login')}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.form>
              ) : (
                <AuthModalStep2
                  regStreet={regStreet}
                  setRegStreet={setRegStreet}
                  regStreetNumber={regStreetNumber}
                  setRegStreetNumber={setRegStreetNumber}
                  regProvince={regProvince}
                  setRegProvince={setRegProvince}
                  regDistrict={regDistrict}
                  setRegDistrict={setRegDistrict}
                  regPostalCode={regPostalCode}
                  setRegPostalCode={setRegPostalCode}
                  regCoordinates={regCoordinates}
                  setRegCoordinates={setRegCoordinates}
                  regCountry={regCountry}
                  error={error}
                  loading={loading}
                  onPrevious={handlePreviousStep}
                  onSubmit={handleRegister}
                  districts={DISTRICTS}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}