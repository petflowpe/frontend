import React from 'react';
import { ClientCategory } from '../../types';
import { useClientCategory } from '../../hooks/useClientCategory';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface CategoryBadgeProps {
  categoria: ClientCategory | null | undefined;
  cantidadMascotas: number;
  variant?: 'compact' | 'full' | 'inline';
  showMotivation?: boolean;
}

/**
 * Componente para mostrar la categoría del cliente con sus beneficios
 * La categoría se calcula automáticamente en el backend según cantidad de mascotas
 */
export function CategoryBadge({ 
  categoria, 
  cantidadMascotas, 
  variant = 'full',
  showMotivation = true 
}: CategoryBadgeProps) {
  const categoryInfo = useClientCategory(categoria, cantidadMascotas);

  // Variante inline (para usar en listas o tablas)
  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge className={categoryInfo.classes.badge + ' border-2'}>
              <span className="text-lg mr-1">{categoryInfo.icono}</span>
              {categoryInfo.nombre}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">{cantidadMascotas} mascota{cantidadMascotas !== 1 ? 's' : ''}</p>
              <p className="text-sm">{categoryInfo.descuento}% de descuento</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Variante compacta (badge grande con tooltip)
  if (variant === 'compact') {
    return (
      <div className={`${categoryInfo.classes.bg} border-2 ${categoryInfo.classes.border} px-4 py-3 rounded-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl">{categoryInfo.icono}</span>
            <p className={`font-bold ${categoryInfo.classes.text} text-lg`}>
              {categoryInfo.nombre}
            </p>
            <p className={`text-sm ${categoryInfo.classes.text}`}>
              {cantidadMascotas} mascota{cantidadMascotas !== 1 ? 's' : ''}
            </p>
          </div>
          
          {categoryInfo.descuento > 0 && (
            <div className="text-right">
              <p className={`text-3xl font-bold ${categoryInfo.classes.text}`}>
                {categoryInfo.descuento}%
              </p>
              <p className={`text-xs ${categoryInfo.classes.text}`}>
                descuento
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variante completa (card con todos los detalles)
  return (
    <Card className={`${categoryInfo.classes.bg} border-2 ${categoryInfo.classes.border} p-6`}>
      {/* Header con icono y nombre */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{categoryInfo.icono}</span>
          <div>
            <h3 className={`text-xl font-bold ${categoryInfo.classes.text}`}>
              {categoryInfo.nombre}
            </h3>
            <p className={`text-sm ${categoryInfo.classes.text} opacity-80`}>
              {cantidadMascotas} mascota{cantidadMascotas !== 1 ? 's' : ''} registrada{cantidadMascotas !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Porcentaje de descuento */}
        {categoryInfo.descuento > 0 && (
          <div className={`${categoryInfo.classes.badge} border-2 px-4 py-2 rounded-lg text-center`}>
            <p className="text-2xl font-bold">{categoryInfo.descuento}%</p>
            <p className="text-xs">descuento</p>
          </div>
        )}
      </div>

      {/* Lista de beneficios */}
      <div className={`${categoryInfo.classes.bg} bg-opacity-50 rounded-lg p-4 mb-4`}>
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4" />
          <p className="font-semibold text-sm">Tus Beneficios:</p>
        </div>
        <ul className="space-y-2">
          {categoryInfo.beneficios.map((beneficio, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>{beneficio}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mensaje de motivación para subir de categoría */}
      {showMotivation && categoryInfo.motivacion && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
          <p className="text-sm text-yellow-800">
            {categoryInfo.motivacion}
          </p>
        </div>
      )}

      {/* Progreso hacia siguiente categoría */}
      {categoria !== 'Oro' && showMotivation && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progreso hacia {categoryInfo.calculateNextCategory()}</span>
            <span className="font-semibold">
              {cantidadMascotas} / {cantidadMascotas + categoryInfo.mascotasParaSiguienteCategoria()}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${categoryInfo.classes.button} h-2 rounded-full transition-all duration-300`}
              style={{ 
                width: `${(cantidadMascotas / (cantidadMascotas + categoryInfo.mascotasParaSiguienteCategoria())) * 100}%` 
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Te {categoryInfo.mascotasParaSiguienteCategoria() === 1 ? 'falta' : 'faltan'}{' '}
            {categoryInfo.mascotasParaSiguienteCategoria()}{' '}
            mascota{categoryInfo.mascotasParaSiguienteCategoria() !== 1 ? 's' : ''} para alcanzar el siguiente nivel
          </p>
        </div>
      )}

      {/* Máximo nivel alcanzado */}
      {categoria === 'Oro' && showMotivation && (
        <div className="mt-4 pt-4 border-t border-yellow-200">
          <p className="text-sm text-center text-yellow-800 font-semibold">
            🎉 ¡Has alcanzado el nivel máximo! Disfruta de todos los beneficios VIP.
          </p>
        </div>
      )}
    </Card>
  );
}

/**
 * Componente simple para mostrar solo el icono con tooltip
 */
export function CategoryIcon({ 
  categoria, 
  cantidadMascotas 
}: { 
  categoria: ClientCategory | null | undefined; 
  cantidadMascotas: number;
}) {
  const categoryInfo = useClientCategory(categoria, cantidadMascotas);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-2xl cursor-help">{categoryInfo.icono}</span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{categoryInfo.nombre}</p>
            <p className="text-sm">{cantidadMascotas} mascota{cantidadMascotas !== 1 ? 's' : ''}</p>
            {categoryInfo.descuento > 0 && (
              <p className="text-sm font-bold text-green-600">
                {categoryInfo.descuento}% descuento
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Componente para mostrar precio con descuento aplicado
 */
export function PriceWithDiscount({ 
  precio, 
  categoria 
}: { 
  precio: number; 
  categoria: ClientCategory | null | undefined;
}) {
  const categoryInfo = useClientCategory(categoria, 0);
  const precioConDescuento = categoryInfo.applyDiscount(precio);

  if (categoryInfo.descuento === 0) {
    return (
      <span className="text-2xl font-bold">
        S/ {precio.toFixed(2)}
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-gray-400 line-through text-sm">
          S/ {precio.toFixed(2)}
        </span>
        <Badge className={categoryInfo.classes.badge}>
          -{categoryInfo.descuento}%
        </Badge>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${categoryInfo.classes.text}`}>
          S/ {precioConDescuento.toFixed(2)}
        </span>
        <span className="text-sm text-gray-500">
          (Ahorras S/ {(precio - precioConDescuento).toFixed(2)})
        </span>
      </div>
    </div>
  );
}
