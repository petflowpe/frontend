import React from 'react';
import { User } from '../../types';
import { CategoryBadge } from './CategoryBadge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useClientCategory } from '../../hooks/useClientCategory';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  PawPrint 
} from 'lucide-react';

interface ClientProfileWithCategoryProps {
  user: User;
  onEditProfile?: () => void;
  onRegisterPet?: () => void;
}

/**
 * Componente de perfil de cliente que integra la visualización de categoría
 * La categoría se actualiza automáticamente según las mascotas registradas
 */
export function ClientProfileWithCategory({ 
  user, 
  onEditProfile,
  onRegisterPet 
}: ClientProfileWithCategoryProps) {
  const categoryInfo = useClientCategory(user.categoria, user.cantidad_mascotas || 0);

  return (
    <div className="space-y-6">
      {/* Header con información básica */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          {/* Foto de perfil e información */}
          <div className="flex items-center gap-4">
            {user.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={`${user.firstName} ${user.lastName}`}
                className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-gray-500" />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600">
                {user.documentType}: {user.documentNumber}
              </p>
              
              {/* Contador de mascotas */}
              <div className="flex items-center gap-2 mt-2">
                <PawPrint className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {user.cantidad_mascotas || 0} mascota{user.cantidad_mascotas !== 1 ? 's' : ''} registrada{user.cantidad_mascotas !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Botón de editar */}
          {onEditProfile && (
            <Button variant="outline" onClick={onEditProfile}>
              Editar Perfil
            </Button>
          )}
        </div>

        {/* Información de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{user.email}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{user.phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm">{user.address}, {user.district}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              Cliente desde {new Date(user.createdAt).toLocaleDateString('es-PE')}
            </span>
          </div>
        </div>
      </Card>

      {/* Categoría del cliente */}
      <CategoryBadge
        categoria={user.categoria}
        cantidadMascotas={user.cantidad_mascotas || 0}
        variant="full"
        showMotivation={true}
      />

      {/* Botón para registrar más mascotas */}
      {user.categoria !== 'Oro' && onRegisterPet && (
        <Card className={`${categoryInfo.classes.bg} border-2 ${categoryInfo.classes.border} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">
                ¿Tienes más mascotas?
              </h3>
              <p className="text-sm text-gray-600">
                Regístralas y mejora tu categoría para obtener más beneficios
              </p>
            </div>
            <Button 
              className={categoryInfo.classes.button}
              onClick={onRegisterPet}
            >
              <PawPrint className="w-4 h-4 mr-2" />
              Registrar Mascota
            </Button>
          </div>
        </Card>
      )}

      {/* Card informativa si alcanzó el máximo nivel */}
      {user.categoria === 'Oro' && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 p-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏆</span>
            <div>
              <h3 className="font-bold text-lg text-yellow-900">
                ¡Eres un cliente VIP!
              </h3>
              <p className="text-sm text-yellow-800">
                Has alcanzado el nivel máximo. Disfruta de todos los beneficios exclusivos.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Información adicional sobre el sistema de categorías */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span>ℹ️</span>
          ¿Cómo funciona el sistema de categorías?
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            Tu categoría se calcula <strong>automáticamente</strong> según la cantidad de mascotas que tengas registradas:
          </p>
          <ul className="space-y-1 ml-4">
            <li className="flex items-center gap-2">
              <span className="text-lg">🥇</span>
              <span><strong>Oro:</strong> 4 o más mascotas → 15% de descuento</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">🥉</span>
              <span><strong>Bronce:</strong> 2-3 mascotas → 10% de descuento</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">🥈</span>
              <span><strong>Plata:</strong> 1 mascota → Beneficios estándar</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-gray-600 italic">
            * Tu categoría se actualiza automáticamente al registrar o dar de baja mascotas
          </p>
        </div>
      </Card>
    </div>
  );
}

/**
 * Versión simplificada para mostrar en listas o sidebars
 */
export function ClientCategoryPreview({ user }: { user: User }) {
  const categoryInfo = useClientCategory(user.categoria, user.cantidad_mascotas || 0);

  return (
    <div className={`${categoryInfo.classes.bg} border ${categoryInfo.classes.border} rounded-lg p-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{categoryInfo.icono}</span>
          <div>
            <p className={`text-xs ${categoryInfo.classes.text} opacity-70`}>
              Tu categoría
            </p>
            <p className={`font-bold ${categoryInfo.classes.text}`}>
              {categoryInfo.nombre}
            </p>
          </div>
        </div>
        
        {categoryInfo.descuento > 0 && (
          <div className={`${categoryInfo.classes.badge} px-2 py-1 rounded`}>
            <p className="text-xs font-bold">-{categoryInfo.descuento}%</p>
          </div>
        )}
      </div>

      {/* Barra de progreso si no es Oro */}
      {user.categoria !== 'Oro' && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`${categoryInfo.classes.button} h-1.5 rounded-full transition-all`}
              style={{ 
                width: `${((user.cantidad_mascotas || 0) / ((user.cantidad_mascotas || 0) + categoryInfo.mascotasParaSiguienteCategoria())) * 100}%` 
              }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {categoryInfo.mascotasParaSiguienteCategoria()} mascota{categoryInfo.mascotasParaSiguienteCategoria() !== 1 ? 's' : ''} más para {categoryInfo.calculateNextCategory()}
          </p>
        </div>
      )}
    </div>
  );
}
