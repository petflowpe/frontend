import { useState } from 'react';
import { Settings, Building2, Users, MapPin, Truck, Target, Route, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import ConfiguracionGeneral from './config/ConfiguracionGeneral';
import ConfiguracionSegmentacion from './config/ConfiguracionSegmentacion';
import ConfiguracionZonas from './config/ConfiguracionZonas';
import ConfiguracionVehiculos from './config/ConfiguracionVehiculos';
import ConfiguracionPriorizacion from './config/ConfiguracionPriorizacion';
import ConfiguracionOptimizacion from './config/ConfiguracionOptimizacion';
import { useTenantContext } from '../../hooks/useTenantContext';

/**
 * Panel Principal de Configuración Multi-Tenant
 * Permite a cada cliente del SaaS personalizar completamente su sistema
 */
export default function ConfiguracionPanel() {
  const { tenant, configuracion, hasFeature, isPlanAtLeast } = useTenantContext();
  const [activeTab, setActiveTab] = useState('general');

  if (!tenant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="size-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'general',
      label: 'General',
      icon: Building2,
      component: ConfiguracionGeneral,
      enabled: true
    },
    {
      id: 'segmentacion',
      label: 'Segmentación',
      icon: Users,
      component: ConfiguracionSegmentacion,
      enabled: hasFeature('segmentacion')
    },
    {
      id: 'zonas',
      label: 'Zonas',
      icon: MapPin,
      component: ConfiguracionZonas,
      enabled: hasFeature('zonas')
    },
    {
      id: 'vehiculos',
      label: 'Vehículos',
      icon: Truck,
      component: ConfiguracionVehiculos,
      enabled: hasFeature('vehiculos')
    },
    {
      id: 'priorizacion',
      label: 'Priorización',
      icon: Target,
      component: ConfiguracionPriorizacion,
      enabled: isPlanAtLeast('professional')
    },
    {
      id: 'optimizacion',
      label: 'Rutas',
      icon: Route,
      component: ConfiguracionOptimizacion,
      enabled: hasFeature('optimizacion_rutas')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3">
            <Settings className="size-8" />
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 mt-2">
            Personaliza {tenant.nombre_negocio} según tus necesidades operativas
          </p>
        </div>

        {/* Plan Badge */}
        <div className="text-right">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${
            tenant.plan === 'enterprise' 
              ? 'bg-purple-50 border-purple-200 text-purple-800'
              : tenant.plan === 'professional'
              ? 'bg-blue-50 border-blue-200 text-blue-800'
              : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}>
            <BarChart3 className="size-4" />
            <span className="uppercase tracking-wide">
              Plan {tenant.plan}
            </span>
          </div>
          {tenant.estado === 'trial' && (
            <p className="text-sm text-amber-600 mt-1">
              Periodo de prueba
            </p>
          )}
        </div>
      </div>

      {/* Tabs de Configuración */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 gap-2 bg-transparent h-auto p-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isEnabled = tab.enabled;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={!isEnabled}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg border-2
                  data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50
                  ${!isEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                `}
              >
                <Icon className="size-5" />
                <span className="text-sm">{tab.label}</span>
                {!isEnabled && (
                  <span className="text-xs text-red-600">
                    🔒 Requiere upgrade
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Contenido de cada tab */}
        {tabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              {tab.enabled ? (
                <Component />
              ) : (
                <Card className="p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3>Función no disponible en tu plan</h3>
                    <p className="text-gray-600 mt-2">
                      Actualiza a un plan superior para acceder a {tab.label}
                    </p>
                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Ver planes disponibles
                    </button>
                  </div>
                </Card>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
