import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Info,
  Camera,
  AlertCircle,
  CheckCircle,
  Edit
} from 'lucide-react';
import { User as UserType, DocumentType } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

// Distritos de Lima
const DISTRICTS = [
  'Miraflores', 'San Isidro', 'Barranco', 'Surco', 'La Molina',
  'San Borja', 'Jesús María', 'Lince', 'Pueblo Libre', 'Magdalena',
  'San Miguel', 'Chorrillos', 'Surquillo', 'Ate', 'Breña',
  'Callao', 'Comas', 'Independencia', 'Lima', 'Los Olivos',
  'Rímac', 'San Juan de Lurigancho', 'San Martín de Porres', 'Villa El Salvador'
];

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Separar nombre completo
  const nameParts = user.lastName.split(' ');
  const lastName1 = nameParts[0] || '';
  const lastName2 = nameParts.slice(1).join(' ') || '';

  // PASO 1: Datos Generales
  const [docType, setDocType] = useState<DocumentType>(user.documentType);
  const [docNumber, setDocNumber] = useState(user.documentNumber);
  const [firstName, setFirstName] = useState(user.firstName);
  const [regLastName1, setRegLastName1] = useState(lastName1);
  const [regLastName2, setRegLastName2] = useState(lastName2);
  const [gender, setGender] = useState('Masculino'); // Default, no tenemos este dato
  const [birthDate, setBirthDate] = useState(''); // Default, no tenemos este dato
  const [phone1, setPhone1] = useState(user.phone);
  const [phone2, setPhone2] = useState(''); // Default, no tenemos este dato
  const [email, setEmail] = useState(user.email);

  // PASO 2: Dirección
  const addressParts = user.address.split(' ');
  const defaultStreetNumber = addressParts.pop() || '';
  const defaultStreet = addressParts.join(' ') || user.address;
  
  const [street, setStreet] = useState(defaultStreet);
  const [streetNumber, setStreetNumber] = useState(defaultStreetNumber);
  const [province, setProvince] = useState('Lima');
  const [district, setDistrict] = useState(user.district);
  const [postalCode, setPostalCode] = useState(user.postalCode || '');
  const [coordinates, setCoordinates] = useState(
    user.latitude && user.longitude ? `${user.latitude},${user.longitude}` : ''
  );
  const [country, setCountry] = useState('Perú');

  // Foto de perfil
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || '');
  const [photoPreview, setPhotoPreview] = useState(user.profilePhoto || '');

  const documentTypes: DocumentType[] = ['DNI', 'CE', 'Pasaporte', 'RUC'];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setProfilePhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    if (!docNumber || !firstName || !regLastName1 || !phone1 || !email) {
      setError('Por favor completa todos los campos obligatorios del Paso 1');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return false;
    }

    // Validar documento según tipo
    if (docType === 'DNI' && docNumber.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!street || !streetNumber || !province || !district || !postalCode || !coordinates) {
      setError('Por favor completa todos los campos obligatorios del Paso 2');
      return false;
    }

    // Validar formato de coordenadas
    const coordsRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (!coordsRegex.test(coordinates)) {
      setError('Las coordenadas deben tener el formato: -12.1191,-77.0281');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setError('');
    setCurrentStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep2()) {
      return;
    }

    // Parse coordinates
    const [lat, lng] = coordinates.split(',').map(c => parseFloat(c.trim()));

    // Update user
    updateUser({
      ...user,
      documentType: docType,
      documentNumber: docNumber,
      firstName,
      lastName: `${regLastName1} ${regLastName2}`.trim(),
      email,
      phone: phone1,
      address: `${street} ${streetNumber}`,
      district,
      postalCode,
      latitude: lat,
      longitude: lng,
      profilePhoto
    });

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="relative mb-6">
              <button
                onClick={onClose}
                className="absolute right-0 top-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold mb-1">Editar Perfil</h2>
              <p className="text-sm text-muted-foreground">
                {currentStep === 1 
                  ? 'Paso 1 de 2: Datos Generales'
                  : 'Paso 2 de 2: Dirección y Ubicación'}
              </p>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep === 1 ? 'bg-primary text-white' : 'bg-green-500 text-white'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${currentStep === 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep === 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">¡Perfil Actualizado!</h3>
                  <p className="text-muted-foreground">
                    Tus datos han sido guardados exitosamente
                  </p>
                </motion.div>
              ) : currentStep === 1 ? (
                <motion.form
                  key="step-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}
                  className="space-y-6"
                >
                  {/* Foto de Perfil */}
                  <div className="flex flex-col items-center gap-4 pb-6 border-b border-border">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold text-primary">
                            {firstName[0]}{regLastName1[0]}
                          </span>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                        <Camera className="w-4 h-4 text-primary-foreground" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Haz clic para cambiar tu foto</p>
                  </div>

                  {/* Documento */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4" />
                      Documento de Identidad *
                    </Label>
                    <div className="grid grid-cols-5 gap-3">
                      <div className="col-span-2">
                        <select
                          value={docType}
                          onChange={(e) => setDocType(e.target.value as DocumentType)}
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
                          value={docNumber}
                          onChange={(e) => setDocNumber(e.target.value)}
                          placeholder={docType === 'DNI' ? '12345678' : 'Número'}
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
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
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
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
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
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
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
                        value={phone1}
                        onChange={(e) => setPhone1(e.target.value)}
                        placeholder="+51 987654321"
                        required
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Teléfono 2</Label>
                      <Input
                        type="tel"
                        value={phone2}
                        onChange={(e) => setPhone2(e.target.value)}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
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
                      onClick={onClose}
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
                <motion.form
                  key="step-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Coordenadas - PRIMERO PARA AUTOCOMPLETAR */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      Coordenadas (Latitud, Longitud) *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={coordinates}
                        onChange={(e) => setCoordinates(e.target.value)}
                        placeholder="-12.1191,-77.0281"
                        required
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          setError('');
                          if (!coordinates) {
                            setError('Por favor ingresa las coordenadas primero');
                            return;
                          }

                          const coordsRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
                          if (!coordsRegex.test(coordinates)) {
                            setError('Las coordenadas deben tener el formato: -12.1191,-77.0281');
                            return;
                          }

                          try {
                            const [lat, lng] = coordinates.split(',').map(c => c.trim());
                            
                            // Usar Google Maps Geocoding API
                            const response = await fetch(
                              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY&language=es`
                            );
                            
                            const data = await response.json();
                            
                            if (data.status === 'OK' && data.results[0]) {
                              const result = data.results[0];
                              const components = result.address_components;
                              
                              // Extraer calle y número
                              const streetNumber = components.find((c: any) => c.types.includes('street_number'))?.long_name || '';
                              const route = components.find((c: any) => c.types.includes('route'))?.long_name || '';
                              
                              // Extraer distrito
                              const locality = components.find((c: any) => 
                                c.types.includes('locality') || c.types.includes('sublocality')
                              )?.long_name || '';
                              
                              // Extraer código postal
                              const postalCodeData = components.find((c: any) => c.types.includes('postal_code'))?.long_name || '';
                              
                              // Extraer provincia
                              const provinceData = components.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name || 'Lima';
                              
                              // Autocompletar campos
                              if (route) setStreet(route);
                              if (streetNumber) setStreetNumber(streetNumber);
                              if (locality) setDistrict(locality);
                              if (postalCodeData) setPostalCode(postalCodeData);
                              if (provinceData) setProvince(provinceData);
                              
                              setError('');
                            } else {
                              setError('No se pudo obtener la dirección automáticamente. Nota: Se requiere una API Key de Google Maps. Por favor completa los campos manualmente.');
                            }
                          } catch (err) {
                            setError('No se pudo obtener la dirección automáticamente. Por favor completa los campos manualmente.');
                          }
                        }}
                        className="whitespace-nowrap"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Autocompletar
                      </Button>
                    </div>
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium mb-1">¿Cómo obtener mis coordenadas?</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Abre Google Maps en tu navegador</li>
                          <li>Busca tu dirección o haz clic derecho en tu ubicación</li>
                          <li>Copia las coordenadas que aparecen (formato: -12.1191,-77.0281)</li>
                          <li>Pégalas aquí y haz clic en "Autocompletar"</li>
                        </ol>
                        <p className="mt-2">
                          <a 
                            href="https://www.google.com/maps" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            Abrir Google Maps →
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label className="mb-2 block">Calle *</Label>
                      <Input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Av. Larco"
                        required
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Número *</Label>
                      <Input
                        type="text"
                        value={streetNumber}
                        onChange={(e) => setStreetNumber(e.target.value)}
                        placeholder="1234"
                        required
                      />
                    </div>
                  </div>

                  {/* Provincia y Distrito */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Provincia *</Label>
                      <Input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">Distrito *</Label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        required
                      >
                        <option value="">Selecciona tu distrito</option>
                        {DISTRICTS.map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Código Postal y País */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Código Postal *</Label>
                      <Input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="15074"
                        required
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block">País</Label>
                      <Input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        disabled
                        className="bg-muted"
                      />
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
                      onClick={handlePreviousStep}
                      className="flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Anterior
                    </Button>
                    <Button type="submit" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}