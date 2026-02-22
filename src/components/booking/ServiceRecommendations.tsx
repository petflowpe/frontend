import { motion } from 'motion/react';
import { AlertCircle, Check, X, Info, Sparkles } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Service, Pet } from '../../contexts/AppContext';
import {
  validateServiceForPet,
  calculateServicePrice,
  getSizeLabel,
  getSizeColor,
  formatPriceDetails,
  getSuggestedAlternatives,
  getServiceRestrictions,
} from '../../utils/serviceValidation';

interface ServiceRecommendationsProps {
  service: Service;
  pet: Pet;
  allServices: Service[];
  onSelectService?: (service: Service) => void;
}

export function ServiceRecommendations({
  service,
  pet,
  allServices,
  onSelectService,
}: ServiceRecommendationsProps) {
  const validation = validateServiceForPet(service, pet);
  const priceCalc = calculateServicePrice(service, pet);
  const alternatives = getSuggestedAlternatives(service, pet, allServices);
  const restrictions = getServiceRestrictions(service);

  // Si es válido, mostrar confirmación
  if (validation.valid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-3"
      >
        {/* Badge de validación */}
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">
                ✓ Servicio Compatible
              </h4>
              <p className="text-sm text-green-700">
                Este servicio es perfecto para {pet.name} ({getSizeLabel(pet.size as any)})
              </p>
            </div>
          </div>
        </Card>

        {/* Detalles de precio */}
        {priceCalc.adjustments.length > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                  Detalles del Precio:
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Precio base:</span>
                    <span className="font-semibold">S/{priceCalc.basePrice}</span>
                  </div>
                  {priceCalc.adjustments.map((adj, i) => (
                    <div key={i} className="flex justify-between text-blue-600">
                      <span>{adj.description}:</span>
                      <span className={adj.amount >= 0 ? 'text-orange-600' : 'text-green-600'}>
                        {adj.amount >= 0 ? '+' : ''}S/{adj.amount}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-bold text-blue-900">Total:</span>
                    <span className="font-bold text-blue-900 text-lg">
                      S/{priceCalc.finalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </motion.div>
    );
  }

  // Si no es válido, mostrar error y alternativas
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-3"
    >
      {/* Error de validación */}
      <Card className="p-4 bg-red-50 border-red-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <X className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 mb-1">
              Servicio No Disponible
            </h4>
            <p className="text-sm text-red-700">
              {validation.reason}
            </p>
          </div>
        </div>
      </Card>

      {/* Restricciones del servicio */}
      {restrictions.length > 0 && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-2 text-sm">
                Restricciones del Servicio:
              </h4>
              <ul className="space-y-1 text-sm text-orange-700">
                {restrictions.map((restriction, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-orange-600 rounded-full" />
                    {restriction}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Alternativas sugeridas */}
      {alternatives.length > 0 && (
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-start gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-1">
                Servicios Recomendados:
              </h4>
              <p className="text-sm text-purple-700 mb-3">
                Estos servicios son perfectos para {pet.name}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {alternatives.map((alt) => {
              const altPrice = calculateServicePrice(alt, pet);
              return (
                <motion.div
                  key={alt.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="p-3 bg-white hover:shadow-md transition-shadow cursor-pointer">
                    <div
                      className="flex items-center justify-between"
                      onClick={() => onSelectService?.(alt)}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">{alt.name}</div>
                        <div className="text-xs text-slate-600">
                          {alt.duration} min • {alt.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">
                          S/{altPrice.finalPrice}
                        </div>
                        <Button size="sm" className="mt-1">
                          Seleccionar
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Info de mascota */}
      <Card className="p-4 bg-slate-50 border-slate-200">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🐕</div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{pet.name}</h4>
            <div className="flex flex-wrap gap-2">
              <Badge className={getSizeColor(pet.size as any)}>
                {getSizeLabel(pet.size as any)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {pet.breed}
              </Badge>
              {pet.weight && (
                <Badge variant="outline" className="text-xs">
                  {pet.weight} kg
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
