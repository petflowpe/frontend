import { Products } from './Products';

/**
 * Alias de compatibilidad: Inventario redirige al módulo unificado
 * «Productos e inventario» en la pestaña Stock.
 */
export function Inventory() {
  return <Products initialTab="stock" />;
}
