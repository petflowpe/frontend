import { useMemo, useState } from 'react';
import { Award, Gift, Star, Users, AlertTriangle, Search, Plus, Minus } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useClients, Client } from '../../hooks/useClients';
import { useGrowthAnalytics } from '../../hooks/useGrowthAnalytics';
import { apiClient } from '../../utils/api/client';
import { toast } from 'sonner';

function mapLevel(level?: string): string {
  const l = (level || 'Plata').toLowerCase();
  if (l === 'oro' || l === 'vip') return 'Oro';
  if (l === 'bronce') return 'Bronce';
  return 'Plata';
}

function levelBadgeClass(level: string) {
  switch (level) {
    case 'Oro':
      return 'bg-yellow-100 text-yellow-800';
    case 'Bronce':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}

export function LoyaltyDashboard() {
  const { clients, loading: loadingClients, refreshClients } = useClients();
  const { overview, loading: loadingOverview } = useGrowthAnalytics();
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [pointsDelta, setPointsDelta] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return clients
      .filter((c) => {
        const q = search.toLowerCase();
        if (!q) return true;
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(search)
        );
      })
      .filter((c) => levelFilter === 'all' || mapLevel(c.loyaltyLevel) === levelFilter)
      .sort((a, b) => (b.loyaltyPoints ?? 0) - (a.loyaltyPoints ?? 0));
  }, [clients, search, levelFilter]);

  const atRisk = useMemo(() => {
    const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
    return clients.filter((c) => {
      if (!c.lastVisit) return true;
      return new Date(c.lastVisit).getTime() < cutoff;
    });
  }, [clients]);

  const adjustPoints = async (client: Client, delta: number) => {
    if (!delta) return;
    try {
      await apiClient.post(`/clients/${client.id}/loyalty-adjust`, {
        delta,
        reason: 'Ajuste manual desde fidelización',
      });
      toast.success(`${delta > 0 ? '+' : ''}${delta} puntos para ${client.fullName}`);
      await refreshClients();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'No se pudieron ajustar los puntos');
    }
  };

  const loading = loadingClients || loadingOverview;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-7 w-7 text-amber-500" />
          Programa de Fidelización
        </h1>
        <p className="text-muted-foreground text-sm">
          Puntos y niveles desde clientes reales (Oro / Bronce / Plata según mascotas activas)
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Clientes activos</p>
          <p className="text-2xl font-bold">{overview?.total_active_clients ?? clients.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> En riesgo (+60 días)
          </p>
          <p className="text-2xl font-bold text-amber-600">
            {overview?.clients_at_risk ?? atRisk.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Citas últimos 30 días</p>
          <p className="text-2xl font-bold">{overview?.appointments_last_30_days ?? '—'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ingresos completados (30d)</p>
          <p className="text-2xl font-bold">
            S/ {(overview?.revenue_completed_last_30_days ?? 0).toFixed(0)}
          </p>
        </Card>
      </div>

      {overview?.loyalty_by_level && overview.loyalty_by_level.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {overview.loyalty_by_level.map((row) => (
            <Badge key={row.level} variant="outline" className={levelBadgeClass(mapLevel(row.level))}>
              {mapLevel(row.level)}: {row.count} ({row.points} pts)
            </Badge>
          ))}
        </div>
      )}

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="risk">Reactivación</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Buscar cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {['all', 'Oro', 'Bronce', 'Plata'].map((lvl) => (
              <Button
                key={lvl}
                size="sm"
                variant={levelFilter === lvl ? 'default' : 'outline'}
                onClick={() => setLevelFilter(lvl)}
              >
                {lvl === 'all' ? 'Todos' : lvl}
              </Button>
            ))}
          </div>

          {loading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((client) => (
                <Card key={client.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{client.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.phone} · {client.district || 'Sin distrito'}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge className={levelBadgeClass(mapLevel(client.loyaltyLevel))}>
                        {mapLevel(client.loyaltyLevel)}
                      </Badge>
                      <Badge variant="outline">
                        <Star className="h-3 w-3 mr-1" />
                        {client.loyaltyPoints ?? 0} pts
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-20 h-8"
                      placeholder="±pts"
                      value={pointsDelta[client.id] ?? ''}
                      onChange={(e) =>
                        setPointsDelta((p) => ({ ...p, [client.id]: e.target.value }))
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        adjustPoints(client, parseInt(pointsDelta[client.id] || '0', 10) || 0)
                      }
                    >
                      <Gift className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => adjustPoints(client, 50)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => adjustPoints(client, -50)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {filtered.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Sin clientes para mostrar</p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="risk">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Clientes sin visita reciente — candidatos a campaña de reactivación
            </p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {atRisk.slice(0, 30).map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center border-b py-2 text-sm"
                >
                  <span>{c.fullName}</span>
                  <span className="text-muted-foreground">
                    {c.lastVisit ? `Última: ${c.lastVisit}` : 'Sin visitas'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
