import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  PawPrint, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Info,
  Syringe,
  Bug,
  Shield,
  Upload,
  Camera
} from 'lucide-react';

interface PetRegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingPet?: any;
}

const PET_SPECIES = ['Perro', 'Gato', 'Otro'];
const DOG_BREEDS = [
  'Golden Retriever', 'Labrador', 'Poodle', 'Bulldog Francés', 'Beagle',
  'Husky Siberiano', 'Pastor Alemán', 'Chihuahua', 'Yorkshire Terrier',
  'Schnauzer', 'Boxer', 'Dálmata', 'Rottweiler', 'Shih Tzu', 'Mestizo', 'Otro'
];
const CAT_BREEDS = [
  'Persa', 'Siamés', 'Angora', 'Maine Coon', 'Bengalí', 
  'Ragdoll', 'British Shorthair', 'Mestizo', 'Otro'
];
const PET_SIZES = ['Pequeño', 'Mediano', 'Grande'];
const PET_SEXES = ['Macho', 'Hembra'];
const PET_STATUSES = ['Intacto', 'Esterilizado', 'Castrado', 'Esterilizada', 'Castrada'];
const COAT_LENGTHS = ['Corto', 'Mediano', 'Largo'];
const TEMPERAMENTS = ['Nervioso', 'Tranquilo', 'Dócil', 'Juguetón', 'Agresivo', 'Tímido'];
const ACTIVITY_LEVELS = ['Baja', 'Moderada', 'Alta'];
const BEHAVIORS = ['Inquieto', 'Amigable', 'Territorial', 'Independiente', 'Enérgico', 'Tranquila', 'Colaboradora'];

// Tipos de antipulgas
const FLEA_TREATMENT_TYPES = ['Pipeta', 'Pastilla', 'Collar', 'Spray'];

// Tipos de desparasitación
const DEWORMING_TYPES = ['Interna', 'Externa'];

// Marcas de antipulgas comunes
const FLEA_TREATMENT_BRANDS = [
  'Bravecto', 'Simparica', 'NexGard', 'Frontline', 'Revolution',
  'Advantage', 'Seresto', 'Capstar', 'Comfortis', 'Otra'
];

// Tipos de vacunas
const VACCINE_TYPES = [
  'Sextuple (DHPPL)', 'Octuple (DHPPL + Corona)', 'Triple Felina',
  'Antirrábica', 'Bordetella (Tos de las Perreras)', 'Leptospirosis',
  'Giardia', 'Leucemia Felina', 'Otra'
];

export function PetRegistrationForm({ isOpen, onClose, onSuccess, editingPet }: PetRegistrationFormProps) {
  const { user, addPet, updatePet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Campos del formulario
  const [name, setName] = useState('');
  const [lastName1, setLastName1] = useState('');
  const [lastName2, setLastName2] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState(0);
  const [stage, setStage] = useState('');
  const [species, setSpecies] = useState<'Perro' | 'Gato' | 'Otro'>('Perro');
  const [breed, setBreed] = useState('');
  const [size, setSize] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<'Macho' | 'Hembra'>('Macho');
  const [status, setStatus] = useState('Intacto');
  const [coatLength, setCoatLength] = useState('');
  const [temperament, setTemperament] = useState('');
  const [activity, setActivity] = useState('');
  const [behavior, setBehavior] = useState('');
  const [chip, setChip] = useState('');
  const [notes, setNotes] = useState('');

  // Foto de la mascota
  const [petPhoto, setPetPhoto] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // Historial médico básico
  const [lastDeworming, setLastDeworming] = useState('');
  const [dewormingType, setDewormingType] = useState('');
  const [lastFleaTreatment, setLastFleaTreatment] = useState('');
  const [fleaTreatmentType, setFleaTreatmentType] = useState('');
  const [fleaTreatmentBrand, setFleaTreatmentBrand] = useState('');
  const [lastVaccination, setLastVaccination] = useState('');
  const [vaccinationType, setVaccinationType] = useState('');
  const [autoAlerts, setAutoAlerts] = useState(true);

  useEffect(() => {
    if (editingPet) {
      setName(editingPet.name || '');
      setBirthDate(editingPet.birthDate || '');
      setSpecies(editingPet.species || 'Perro');
      setBreed(editingPet.breed || '');
      setSize(editingPet.size || '');
      setWeight(editingPet.weight?.toString() || '');
      setSex(editingPet.gender || 'Macho');
      setStatus(editingPet.status || 'Intacto');
      setCoatLength(editingPet.coatLength || '');
      setTemperament(editingPet.temperament || '');
      setActivity(editingPet.activity || '');
      setBehavior(editingPet.behavior || '');
      setChip(editingPet.microchip || '');
      setNotes(editingPet.notes || '');
    } else if (user) {
      // Autogenerar apellidos del tutor
      const names = user.lastName.split(' ');
      setLastName1(names[0] || '');
      setLastName2(names[1] || '');
    }
  }, [editingPet, user]);

  // Calcular edad y etapa automáticamente
  useEffect(() => {
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      const monthsDiff = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
      const yearsDiff = Math.floor(monthsDiff / 12);
      
      setAge(yearsDiff);

      // Determinar etapa
      if (monthsDiff < 6) {
        setStage('Cachorro');
      } else if (yearsDiff <= 7) {
        setStage('Adulto');
      } else if (yearsDiff <= 15) {
        setStage('Senior');
      } else {
        setStage('Geriátrico');
      }
    }
  }, [birthDate]);

  // Generar código de registro automáticamente
  useEffect(() => {
    if (name && lastName1 && !editingPet) {
      const initials = `${name.charAt(0)}${lastName1.charAt(0)}${lastName2.charAt(0) || ''}`.toUpperCase();
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setRegistrationCode(`${initials}-${year}-${random}`);
    }
  }, [name, lastName1, lastName2, editingPet]);

  const validateForm = () => {
    if (!name || !lastName1 || !birthDate || !species || !breed || !sex) {
      setError('Por favor completa todos los campos obligatorios marcados con *');
      return false;
    }
    return true;
  };

  // Manejar la carga de la foto
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }

      // Convertir a base64 para preview y almacenamiento
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPetPhoto(base64String);
        setPhotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const petData = {
        name,
        species,
        breed,
        age,
        weight: parseFloat(weight) || 0,
        gender: sex,
        color: '',
        vaccines: lastVaccination ? [{
          id: `v_${Date.now()}`,
          name: 'Vacuna registrada',
          date: lastVaccination,
          veterinarian: 'Registrado por usuario'
        }] : [],
        medicalHistory: [],
        allergies: [],
        medications: [],
        microchip: chip
      };

      if (editingPet) {
        updatePet(editingPet.id, petData);
      } else {
        addPet(petData);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSuccess?.();
        resetForm();
      }, 1500);
    } catch (err) {
      setError('Error al registrar la mascota. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setLastName1('');
    setLastName2('');
    setRegistrationCode('');
    setBirthDate('');
    setAge(0);
    setStage('');
    setSpecies('Perro');
    setBreed('');
    setSize('');
    setWeight('');
    setSex('Macho');
    setStatus('Intacto');
    setCoatLength('');
    setTemperament('');
    setActivity('');
    setBehavior('');
    setChip('');
    setNotes('');
    setPetPhoto('');
    setPhotoPreview('');
    setLastDeworming('');
    setDewormingType('');
    setLastFleaTreatment('');
    setFleaTreatmentType('');
    setFleaTreatmentBrand('');
    setLastVaccination('');
    setVaccinationType('');
    setError('');
    setSuccess(false);
  };

  if (!isOpen) return null;

  const breeds = species === 'Perro' ? DOG_BREEDS : species === 'Gato' ? CAT_BREEDS : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="border-2">
          <CardHeader className="relative pb-4">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <CardTitle className="text-2xl flex items-center gap-2">
              <PawPrint className="w-6 h-6 text-primary" />
              {editingPet ? 'Editar Mascota' : 'Registrar Nueva Mascota'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Completa la información de tu mascota
            </p>
          </CardHeader>

          <CardContent>
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  {editingPet ? '¡Mascota Actualizada!' : '¡Mascota Registrada!'}
                </h3>
                <p className="text-muted-foreground">
                  La información ha sido guardada exitosamente
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Foto de la Mascota */}
                <div className="pb-6 border-b">
                  <h3 className="font-semibold text-lg mb-4">Foto de la Mascota</h3>
                  
                  <div className="flex gap-6">
                    {/* Vista previa */}
                    <div className="flex-shrink-0">
                      {photoPreview ? (
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-muted">
                          <img
                            src={photoPreview}
                            alt="Vista previa"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPetPhoto('');
                              setPhotoPreview('');
                            }}
                            className="absolute top-0 right-0 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/30 flex flex-col items-center justify-center">
                          <PawPrint className="w-10 h-10 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    {/* Cargar foto */}
                    <div className="flex-1 flex flex-col justify-center gap-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Subir Foto de Perfil</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          JPG, PNG o GIF. Máximo 5 MB.
                        </p>
                      </div>
                      <label
                        htmlFor="pet-photo-upload"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors w-fit"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {photoPreview ? 'Cambiar Foto' : 'Seleccionar Foto'}
                        </span>
                      </label>
                      <input
                        id="pet-photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Información Básica */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Información Básica</h3>
                  <div className="space-y-4">
                    {/* Nombre y Apellidos del Tutor */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Nombre *</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Max"
                          required
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Apellido 1 (Tutor) *</Label>
                        <Input
                          value={lastName1}
                          onChange={(e) => setLastName1(e.target.value)}
                          placeholder="González"
                          required
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Apellido 2 (Tutor)</Label>
                        <Input
                          value={lastName2}
                          onChange={(e) => setLastName2(e.target.value)}
                          placeholder="Pérez"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    {/* Código de Registro y Fecha de Nacimiento */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Código de Registro</Label>
                        <Input
                          value={registrationCode}
                          disabled
                          className="mt-1.5 bg-muted"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Fecha de Nacimiento *</Label>
                        <Input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          required
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    {/* Edad y Etapa (calculadas automáticamente) */}
                    {birthDate && (
                      <div className="grid grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-muted/30">
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1">Edad (calculada)</label>
                          <p className="font-medium">{age} años</p>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground block mb-1">Etapa (calculada)</label>
                          <p className="font-medium">{stage || '-'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Características Físicas */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Características Físicas</h3>
                  <div className="space-y-4">
                    {/* Especie, Raza, Tamaño */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Especie *</Label>
                        <select
                          value={species}
                          onChange={(e) => setSpecies(e.target.value as any)}
                          className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                          required
                        >
                          {PET_SPECIES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Raza *</Label>
                        <select
                          value={breed}
                          onChange={(e) => setBreed(e.target.value)}
                          className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                          required
                        >
                          <option value="">Seleccionar</option>
                          {breeds.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Tamaño</Label>
                        <select
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="">Seleccionar</option>
                          {PET_SIZES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Peso, Sexo, Estado */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Peso (kg)</Label>
                        <Input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="30"
                          min="0"
                          step="0.1"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Sexo *</Label>
                        <select
                          value={sex}
                          onChange={(e) => setSex(e.target.value as any)}
                          className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                          required
                        >
                          {PET_SEXES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Estado *</Label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                          required
                        >
                          {PET_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Largo del Pelo, Carácter, Actividad */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Largo del Pelo</Label>
                        <select
                          value={coatLength}
                          onChange={(e) => setCoatLength(e.target.value)}
                          className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="">Seleccionar</option>
                          {COAT_LENGTHS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Carácter</Label>
                        <select
                          value={temperament}
                          onChange={(e) => setTemperament(e.target.value)}
                          className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="">Seleccionar</option>
                          {TEMPERAMENTS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Actividad</Label>
                        <select
                          value={activity}
                          onChange={(e) => setActivity(e.target.value)}
                          className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="">Seleccionar</option>
                          {ACTIVITY_LEVELS.map(a => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Comportamiento y Chip */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Comportamiento</Label>
                        <select
                          value={behavior}
                          onChange={(e) => setBehavior(e.target.value)}
                          className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="">Seleccionar</option>
                          {BEHAVIORS.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Chip</Label>
                        <Input
                          value={chip}
                          onChange={(e) => setChip(e.target.value)}
                          placeholder="ES-12345789"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    {/* Notas Especiales */}
                    <div>
                      <Label className="text-sm text-muted-foreground">Notas Especiales</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Muy nervioso, necesita productos suaves"
                        className="mt-1.5 min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Historial Médico Básico */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-2">Historial Médico Básico</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Esta información es crítica para el sistema de notificaciones y seguimiento de la salud preventiva.
                  </p>

                  <div className="space-y-4">
                    {/* Desparasitación */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Bug className="w-4 h-4 text-orange-600" />
                        <span className="font-medium">Desparasitación</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div>
                          <Label className="text-sm text-muted-foreground">Última Desparasitación *</Label>
                          <Input
                            type="date"
                            value={lastDeworming}
                            onChange={(e) => setLastDeworming(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            className="mt-1.5"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Periodicidad: Cachorros cada 15 días, Adultos cada 3 meses
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Tipo *</Label>
                          <select
                            value={dewormingType}
                            onChange={(e) => setDewormingType(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                            required
                          >
                            <option value="">Seleccionar</option>
                            {DEWORMING_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Antipulgas */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Bug className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Antipulgas</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 ml-6">
                        <div>
                          <Label className="text-sm text-muted-foreground">Última Aplicación *</Label>
                          <Input
                            type="date"
                            value={lastFleaTreatment}
                            onChange={(e) => setLastFleaTreatment(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            className="mt-1.5"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Periodicidad: Mensual
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Tipo *</Label>
                          <select
                            value={fleaTreatmentType}
                            onChange={(e) => setFleaTreatmentType(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                            required
                          >
                            <option value="">Seleccionar</option>
                            {FLEA_TREATMENT_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Marca *</Label>
                          <select
                            value={fleaTreatmentBrand}
                            onChange={(e) => setFleaTreatmentBrand(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                            required
                          >
                            <option value="">Seleccionar</option>
                            {FLEA_TREATMENT_BRANDS.map(brand => (
                              <option key={brand} value={brand}>{brand}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Vacunación */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="font-medium">Vacunación</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 ml-6">
                        <div>
                          <Label className="text-sm text-muted-foreground">Última Vacunación *</Label>
                          <Input
                            type="date"
                            value={lastVaccination}
                            onChange={(e) => setLastVaccination(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            className="mt-1.5"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Periodicidad: Anual
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Tipo de Vacuna *</Label>
                          <select
                            value={vaccinationType}
                            onChange={(e) => setVaccinationType(e.target.value)}
                            className="w-full mt-1.5 px-3 py-2 border border-input rounded-md bg-background"
                            required
                          >
                            <option value="">Seleccionar</option>
                            {VACCINE_TYPES.map(vaccine => (
                              <option key={vaccine} value={vaccine}>{vaccine}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Sistema de Alertas Automáticas */}
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoAlerts}
                          onChange={(e) => setAutoAlerts(e.target.checked)}
                          className="mt-1"
                        />
                        <div>
                          <div className="flex items-center gap-2 font-medium mb-1">
                            <Calendar className="w-4 h-4" />
                            Sistema de Alertas Automáticas
                          </div>
                          <p className="text-sm text-muted-foreground">
                            El sistema calculará y enviará notificaciones 7 días antes del vencimiento
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : editingPet ? 'Guardar Cambios' : 'Registrar Mascota'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
