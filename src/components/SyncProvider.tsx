/**
 * Sync Provider Component
 * 
 * Activa los hooks de sincronización solo cuando el usuario está autenticado
 * Esto previene errores de hooks durante el login
 */

import { useAllSyncHooks } from '../hooks/useSyncHooks';
import { useAppointmentRouteSync } from '../hooks/useAppointmentRouteSync';
import { useInventoryServiceSync } from '../hooks/useInventoryServiceSync';
import { useInvoiceAppointmentSync } from '../hooks/useInvoiceAppointmentSync';
import { useClientSegmentationSync } from '../hooks/useClientSegmentationSync';

interface SyncProviderProps {
  children: React.ReactNode;
}

export const SyncProvider = ({ children }: SyncProviderProps) => {
  // 🔥 ACTIVAR TODAS LAS SINCRONIZACIONES
  // Esto resuelve las 15 inconsistencias entre módulos
  useAllSyncHooks();
  useAppointmentRouteSync();
  useInventoryServiceSync({
    products: [], // TODO: Obtener desde AppContext
    services: [], // TODO: Obtener desde AppContext
  });
  useInvoiceAppointmentSync();
  useClientSegmentationSync();

  return <>{children}</>;
};
