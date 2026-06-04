import { useMemo } from 'react';
import SegmentacionAutomatica from '../segmentacion/SegmentacionAutomatica';
import { useGrowthAnalytics } from '../../hooks/useGrowthAnalytics';

export default function SegmentacionPage() {
  const { segmentClients, loading } = useGrowthAnalytics();

  const clientes = useMemo(
    () =>
      segmentClients.map((c: any) => ({
        id: c.id,
        nombre: c.nombre,
        mascotas: c.mascotas,
        mascotasActivas: c.mascotasActivas,
        categoria: c.categoria,
        ultimaCita: c.ultimaCita,
        email: c.email,
        telefono: c.telefono,
        gastoMensual: 0,
      })),
    [segmentClients]
  );

  if (loading && clientes.length === 0) {
    return (
      <div className="p-6 text-muted-foreground">Cargando segmentación desde clientes reales...</div>
    );
  }

  return <SegmentacionAutomatica clientes={clientes} />;
}
