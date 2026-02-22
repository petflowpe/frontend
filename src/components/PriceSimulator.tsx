import { useState, useEffect } from 'react';
import { 
  Calculator, 
  Dog, 
  Scale, 
  Ruler, 
  Tag, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { calculateServicePrice, ServiceProduct, PetData } from '../utils/priceCalculator';
import { Separator } from './ui/separator';

// Datos de Prueba (Simulando tu base de datos)
const DEMO_SERVICES: ServiceProduct[] = [
  { 
    id: 1, 
    name: 'Baño Completo', 
    price: 30,
    pricingBySize: true,
    pricing: {
      toy: { price: 30, cost: 10, duration: 25 },
      small: { price: 35, cost: 12, duration: 30 },
      medium: { price: 45, cost: 15, duration: 45 },
      large: { price: 65, cost: 22, duration: 75 },
      xlarge: { price: 95, cost: 35, duration: 120 }
    },
    breedExceptions: [
      { breed: 'Poodle', type: 'multiplier', value: 1.3, note: 'Pelo rizado' },
      { breed: 'Husky', type: 'extra', value: 20, note: 'Doble capa de pelo' },
      { breed: 'Golden Retriever', type: 'multiplier', value: 1.2, note: 'Secado extensivo' }
    ]
  },
  { 
    id: 2, 
    name: 'Corte de Pelo', 
    price: 40,
    pricingBySize: true,
    pricing: {
      toy: { price: 35, cost: 12, duration: 40 },
      small: { price: 45, cost: 15, duration: 50 },
      medium: { price: 55, cost: 18, duration: 70 },
      large: { price: 80, cost: 28, duration: 100 },
      xlarge: { price: 120, cost: 40, duration: 150 }
    },
    breedExceptions: [
      { breed: 'Schnauzer', type: 'fixed', value: 65, note: 'Corte técnico de raza' },
      { breed: 'Poodle', type: 'multiplier', value: 1.2, note: 'Estilo pompones' }
    ]
  }
];

const DEMO_BREEDS = ['Mestizo', 'Poodle', 'Golden Retriever', 'Husky', 'Schnauzer', 'Chihuahua', 'Bulldog'];

export function PriceSimulator() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('1');
  const [petName, setPetName] = useState('Firulais');
  const [petWeight, setPetWeight] = useState<string>('12');
  const [petBreed, setPetBreed] = useState('Mestizo');
  const [calculation, setCalculation] = useState<any>(null);

  // Calcular automáticamente cuando cambian los inputs
  useEffect(() => {
    const service = DEMO_SERVICES.find(s => s.id.toString() === selectedServiceId);
    if (!service) return;

    const pet: PetData = {
      id: 'temp',
      name: petName,
      breed: petBreed,
      weight: parseFloat(petWeight) || 0
    };

    const result = calculateServicePrice(service, pet);
    setCalculation(result);
  }, [selectedServiceId, petWeight, petBreed, petName]);

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
          <Calculator className="h-8 w-8 text-blue-600" />
          Simulador de Precios Inteligente
        </h1>
        <p className="text-muted-foreground mt-2">
          Este motor valida automáticamente el "Triángulo Operativo": Datos Mascota → Reglas Servicio → Precio Final.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Panel de Inputs */}
        <Card className="p-6 space-y-6 border-l-4 border-l-blue-500">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Dog className="h-5 w-5" />
            Datos del Paciente
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label>Nombre Mascota</Label>
              <Input value={petName} onChange={(e) => setPetName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Raza</Label>
                <Select value={petBreed} onValueChange={setPetBreed}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_BREEDS.map(breed => (
                      <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Peso (Kg)</Label>
                <div className="relative">
                  <Scale className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    className="pl-9" 
                    value={petWeight} 
                    onChange={(e) => setPetWeight(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label>Servicio a Realizar</Label>
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger className="h-12 text-lg font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_SERVICES.map(service => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Panel de Resultados */}
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 border-2 border-blue-100 dark:border-blue-900">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
            <Tag className="h-5 w-5 text-blue-600" />
            Cálculo Automático
          </h3>

          {calculation && (
            <div className="space-y-6">
              {/* Precio Grande */}
              <div className="text-center bg-white dark:bg-black/20 p-6 rounded-xl shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">Total Estimado</p>
                <div className="text-5xl font-bold text-blue-700 dark:text-blue-300">
                  S/ {calculation.finalPrice.toFixed(2)}
                </div>
                <div className="flex justify-center gap-2 mt-2">
                   <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {calculation.duration} minutos
                   </Badge>
                   <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      {calculation.appliedRule}
                   </Badge>
                </div>
              </div>

              {/* Desglose */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Desglose del cálculo</Label>
                {calculation.breakdown.map((line: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm p-2 rounded bg-white/50 dark:bg-white/5">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>

              {/* Advertencias */}
              {calculation.finalPrice !== calculation.basePrice && (
                 <div className="flex gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 text-sm rounded-lg border border-yellow-200 dark:border-yellow-900">
                   <AlertCircle className="h-5 w-5 shrink-0" />
                   <p>
                     El precio ha variado respecto a la base debido a las características específicas de la mascota (Peso/Raza).
                   </p>
                 </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
