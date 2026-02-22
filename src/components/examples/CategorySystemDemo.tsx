import React, { useState } from 'react';
import { CategoryBadge, CategoryIcon, PriceWithDiscount } from '../client/CategoryBadge';
import { ClientProfileWithCategory, ClientCategoryPreview } from '../client/ClientProfileWithCategory';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { User, ClientCategory } from '../../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

/**
 * Componente de demostración del sistema de categorías
 * Muestra todos los casos de uso y variantes visuales
 */
export function CategorySystemDemo() {
  // Usuario de ejemplo
  const [demoUser, setDemoUser] = useState<User>({
    id: '1',
    documentType: 'DNI',
    documentNumber: '12345678',
    firstName: 'Ana',
    lastName: 'García',
    email: 'ana.garcia@example.com',
    phone: '999888777',
    address: 'Av. Salaverry 1234',
    district: 'Jesús María',
    postalCode: '15072',
    password: '',
    createdAt: '2024-01-15T10:00:00Z',
    categoria: 'Plata',
    cantidad_mascotas: 1
  });

  // Simular registro de mascota
  const handleAddPet = () => {
    const nuevaCantidad = (demoUser.cantidad_mascotas || 0) + 1;
    let nuevaCategoria: ClientCategory = 'Plata';

    if (nuevaCantidad >= 4) {
      nuevaCategoria = 'Oro';
    } else if (nuevaCantidad >= 2) {
      nuevaCategoria = 'Bronce';
    }

    setDemoUser({
      ...demoUser,
      cantidad_mascotas: nuevaCantidad,
      categoria: nuevaCategoria
    });
  };

  // Simular eliminación de mascota
  const handleRemovePet = () => {
    if ((demoUser.cantidad_mascotas || 0) > 0) {
      const nuevaCantidad = (demoUser.cantidad_mascotas || 0) - 1;
      let nuevaCategoria: ClientCategory | undefined = 'Plata';

      if (nuevaCantidad >= 4) {
        nuevaCategoria = 'Oro';
      } else if (nuevaCantidad >= 2) {
        nuevaCategoria = 'Bronce';
      } else if (nuevaCantidad === 1) {
        nuevaCategoria = 'Plata';
      } else {
        nuevaCategoria = undefined;
      }

      setDemoUser({
        ...demoUser,
        cantidad_mascotas: nuevaCantidad,
        categoria: nuevaCategoria
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          🏆 Sistema de Segmentación Automática
        </h1>
        <p className="text-gray-600">
          Demostración interactiva del sistema de categorías por mascotas
        </p>
      </div>

      {/* Controles de simulación */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">🎮 Simulador Interactivo</h3>
            <p className="text-sm text-gray-600">
              Agrega o quita mascotas para ver cómo cambia la categoría automáticamente
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleRemovePet}
              variant="outline"
              disabled={(demoUser.cantidad_mascotas || 0) === 0}
            >
              ➖ Quitar Mascota
            </Button>
            <Button onClick={handleAddPet}>
              ➕ Agregar Mascota
            </Button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm">
            <strong>Estado actual:</strong> {demoUser.cantidad_mascotas} mascota{demoUser.cantidad_mascotas !== 1 ? 's' : ''} registrada{demoUser.cantidad_mascotas !== 1 ? 's' : ''}
          </p>
        </div>
      </Card>

      {/* Tabs con diferentes vistas */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Perfil Completo</TabsTrigger>
          <TabsTrigger value="variants">Variantes</TabsTrigger>
          <TabsTrigger value="pricing">Precios</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="table">En Tablas</TabsTrigger>
        </TabsList>

        {/* Perfil completo */}
        <TabsContent value="profile" className="space-y-4">
          <ClientProfileWithCategory 
            user={demoUser}
            onEditProfile={() => alert('Editar perfil')}
            onRegisterPet={handleAddPet}
          />
        </TabsContent>

        {/* Variantes de visualización */}
        <TabsContent value="variants" className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4">Variante: FULL (Completa)</h3>
            <CategoryBadge 
              categoria={demoUser.categoria}
              cantidadMascotas={demoUser.cantidad_mascotas || 0}
              variant="full"
              showMotivation={true}
            />
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Variante: COMPACT (Compacta)</h3>
            <CategoryBadge 
              categoria={demoUser.categoria}
              cantidadMascotas={demoUser.cantidad_mascotas || 0}
              variant="compact"
            />
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Variante: INLINE (En línea)</h3>
            <div className="flex items-center gap-4">
              <span>Cliente:</span>
              <CategoryBadge 
                categoria={demoUser.categoria}
                cantidadMascotas={demoUser.cantidad_mascotas || 0}
                variant="inline"
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Solo Icono con Tooltip</h3>
            <div className="flex items-center gap-2">
              <span>Pasa el mouse sobre el icono:</span>
              <CategoryIcon 
                categoria={demoUser.categoria}
                cantidadMascotas={demoUser.cantidad_mascotas || 0}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Preview para Sidebar</h3>
            <div className="max-w-xs">
              <ClientCategoryPreview user={demoUser} />
            </div>
          </div>
        </TabsContent>

        {/* Precios con descuento */}
        <TabsContent value="pricing" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Aplicación de Descuentos</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Servicio: Peluquería Completa</h4>
                <PriceWithDiscount 
                  precio={100}
                  categoria={demoUser.categoria}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Servicio: Consulta Veterinaria</h4>
                <PriceWithDiscount 
                  precio={80}
                  categoria={demoUser.categoria}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Servicio: Vacunación</h4>
                <PriceWithDiscount 
                  precio={50}
                  categoria={demoUser.categoria}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-green-50 border-green-200">
            <h4 className="font-bold mb-2">💰 Ahorro Anual Estimado</h4>
            <div className="space-y-2">
              {demoUser.categoria === 'Oro' && (
                <p className="text-sm">
                  Con 15% de descuento en servicios mensuales promedio de S/320:
                  <br />
                  <strong className="text-green-700">Ahorras S/576 al año</strong>
                </p>
              )}
              {demoUser.categoria === 'Bronce' && (
                <p className="text-sm">
                  Con 10% de descuento en servicios mensuales promedio de S/200:
                  <br />
                  <strong className="text-green-700">Ahorras S/240 al año</strong>
                </p>
              )}
              {demoUser.categoria === 'Plata' && (
                <p className="text-sm">
                  ¡Registra otra mascota y comienza a ahorrar!
                  <br />
                  <strong className="text-orange-600">Podrías ahorrar S/240 al año con Bronce</strong>
                </p>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Comparación de categorías */}
        <TabsContent value="comparison">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-6 text-center">
              Comparación de Categorías
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Oro */}
              <Card className="p-4 bg-yellow-50 border-2 border-yellow-400">
                <div className="text-center mb-4">
                  <span className="text-5xl">🥇</span>
                  <h4 className="text-xl font-bold text-yellow-800 mt-2">ORO</h4>
                  <p className="text-sm text-yellow-700">4+ mascotas</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-yellow-100 p-3 rounded text-center">
                    <p className="text-3xl font-bold text-yellow-900">15%</p>
                    <p className="text-xs text-yellow-800">descuento</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>✓ Prioridad máxima</li>
                    <li>✓ Vehículo preferido</li>
                    <li>✓ Cancelación flexible</li>
                    <li>✓ Servicio express</li>
                  </ul>
                </div>
              </Card>

              {/* Bronce */}
              <Card className="p-4 bg-orange-50 border-2 border-orange-400">
                <div className="text-center mb-4">
                  <span className="text-5xl">🥉</span>
                  <h4 className="text-xl font-bold text-orange-800 mt-2">BRONCE</h4>
                  <p className="text-sm text-orange-700">2-3 mascotas</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-orange-100 p-3 rounded text-center">
                    <p className="text-3xl font-bold text-orange-900">10%</p>
                    <p className="text-xs text-orange-800">descuento</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>✓ Prioridad en agenda</li>
                    <li>✓ Recordatorios</li>
                    <li>✓ Descuentos especiales</li>
                  </ul>
                </div>
              </Card>

              {/* Plata */}
              <Card className="p-4 bg-gray-50 border-2 border-gray-400">
                <div className="text-center mb-4">
                  <span className="text-5xl">🥈</span>
                  <h4 className="text-xl font-bold text-gray-700 mt-2">PLATA</h4>
                  <p className="text-sm text-gray-600">1 mascota</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-gray-100 p-3 rounded text-center">
                    <p className="text-3xl font-bold text-gray-700">0%</p>
                    <p className="text-xs text-gray-600">descuento</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>✓ Servicio de calidad</li>
                    <li>✓ Acumula puntos</li>
                  </ul>
                </div>
              </Card>
            </div>
          </Card>
        </TabsContent>

        {/* En tablas */}
        <TabsContent value="table">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Lista de Clientes</h3>
            
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Categoría</th>
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Mascotas</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Descuento</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <CategoryBadge 
                      categoria="Oro"
                      cantidadMascotas={5}
                      variant="inline"
                    />
                  </td>
                  <td className="p-3">Luis Barco</td>
                  <td className="p-3">5</td>
                  <td className="p-3">luis.barco@example.com</td>
                  <td className="p-3 font-bold text-yellow-700">15%</td>
                </tr>
                
                <tr className="border-b">
                  <td className="p-3">
                    <CategoryBadge 
                      categoria="Bronce"
                      cantidadMascotas={3}
                      variant="inline"
                    />
                  </td>
                  <td className="p-3">María López</td>
                  <td className="p-3">3</td>
                  <td className="p-3">maria.lopez@example.com</td>
                  <td className="p-3 font-bold text-orange-700">10%</td>
                </tr>
                
                <tr className="border-b">
                  <td className="p-3">
                    <CategoryBadge 
                      categoria={demoUser.categoria}
                      cantidadMascotas={demoUser.cantidad_mascotas || 0}
                      variant="inline"
                    />
                  </td>
                  <td className="p-3">{demoUser.firstName} {demoUser.lastName}</td>
                  <td className="p-3">{demoUser.cantidad_mascotas}</td>
                  <td className="p-3">{demoUser.email}</td>
                  <td className="p-3 font-bold">
                    {demoUser.categoria === 'Oro' && '15%'}
                    {demoUser.categoria === 'Bronce' && '10%'}
                    {demoUser.categoria === 'Plata' && '0%'}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Información técnica */}
      <Card className="p-6 bg-purple-50 border-purple-200">
        <h3 className="font-bold mb-2">🔧 Información Técnica</h3>
        <div className="text-sm space-y-2">
          <p>
            <strong>Cálculo automático:</strong> La categoría se actualiza automáticamente mediante el backend Laravel
          </p>
          <p>
            <strong>Sin intervención manual:</strong> No requieres actualizar manualmente la categoría
          </p>
          <p>
            <strong>Mascotas activas:</strong> Solo cuentan mascotas con <code>fallecido = false</code>
          </p>
          <p>
            <strong>Reglas:</strong>
          </p>
          <ul className="ml-6 list-disc">
            <li>4+ mascotas → Oro (15% descuento)</li>
            <li>2-3 mascotas → Bronce (10% descuento)</li>
            <li>1 mascota → Plata (0% descuento)</li>
            <li>0 mascotas → Sin categoría</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
