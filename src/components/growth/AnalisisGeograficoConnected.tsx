import { useMemo } from 'react';
import { MapPin, Users, DollarSign } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useGrowthAnalytics } from '../../hooks/useGrowthAnalytics';

/** Vista geográfica simplificada con datos reales (sin mapa mock). */
export default function AnalisisGeograficoConnected() {
  const { geoClients, loading } = useGrowthAnalytics();

  const byDistrict = useMemo(() => {
    const map = new Map<
      string,
      { distrito: string; clientes: number; citas: number; oro: number; bronce: number; plata: number }
    >();
    for (const c of geoClients) {
      const d = c.distrito || 'Sin distrito';
      const row = map.get(d) || {
        distrito: d,
        clientes: 0,
        citas: 0,
        oro: 0,
        bronce: 0,
        plata: 0,
      };
      row.clientes += 1;
      row.citas += c.citas || 0;
      if (c.categoria === 'oro') row.oro += 1;
      else if (c.categoria === 'bronce') row.bronce += 1;
      else row.plata += 1;
      map.set(d, row);
    }
    return Array.from(map.values()).sort((a, b) => b.clientes - a.clientes);
  }, [geoClients]);

  if (loading) {
    return <div className="p-6 text-muted-foreground">Cargando análisis geográfico...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-7 w-7 text-blue-600" />
          Análisis Geográfico
        </h1>
        <p className="text-sm text-muted-foreground">
          Distribución de clientes y citas por distrito (datos del sistema)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <Users className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold">{geoClients.length}</p>
          <p className="text-xs text-muted-foreground">Clientes con dirección</p>
        </Card>
        <Card className="p-4">
          <MapPin className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold">{byDistrict.length}</p>
          <p className="text-xs text-muted-foreground">Distritos activos</p>
        </Card>
        <Card className="p-4">
          <DollarSign className="h-5 w-5 text-muted-foreground mb-2" />
          <p className="text-2xl font-bold">
            {geoClients.reduce((s, c) => s + (c.citas || 0), 0)}
          </p>
          <p className="text-xs text-muted-foreground">Citas registradas</p>
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold mb-4">Por distrito</h2>
        <div className="space-y-3">
          {byDistrict.map((row) => (
            <div
              key={row.distrito}
              className="flex flex-wrap items-center justify-between gap-2 border-b pb-2"
            >
              <span className="font-medium">{row.distrito}</span>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{row.clientes} clientes</Badge>
                <Badge variant="outline">{row.citas} citas</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">Oro {row.oro}</Badge>
                <Badge className="bg-orange-100 text-orange-800">Bronce {row.bronce}</Badge>
                <Badge className="bg-slate-100 text-slate-800">Plata {row.plata}</Badge>
              </div>
            </div>
          ))}
          {byDistrict.length === 0 && (
            <p className="text-muted-foreground text-sm">Sin datos de distrito en clientes</p>
          )}
        </div>
      </Card>

      <Card className="p-4 max-h-[360px] overflow-y-auto">
        <h2 className="font-semibold mb-3">Detalle clientes</h2>
        <div className="space-y-2 text-sm">
          {geoClients.slice(0, 50).map((c) => (
            <div key={c.id} className="flex justify-between gap-2">
              <span>{c.nombre}</span>
              <span className="text-muted-foreground">
                {c.distrito} · {c.categoria}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
