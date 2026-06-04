import { useMemo } from 'react';
import { Brain, Calendar, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useGrowthAnalytics } from '../../hooks/useGrowthAnalytics';
import { useClients } from '../../hooks/useClients';

export function GrowthAnalyticsPanel() {
  const { overview, trends, loading, refresh } = useGrowthAnalytics();
  const { clients } = useClients();

  const churnRisk = useMemo(() => {
    const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
    return clients
      .filter((c) => {
        if (!c.lastVisit) return true;
        return new Date(c.lastVisit).getTime() < cutoff;
      })
      .map((c) => ({
        id: c.id,
        name: c.fullName,
        level: c.loyaltyLevel || 'Plata',
        lastVisit: c.lastVisit || '—',
        risk: !c.lastVisit ? 'high' : 'medium',
      }))
      .slice(0, 20);
  }, [clients]);

  const next7 = useMemo(() => {
    if (trends.length < 7) return trends;
    const last = trends.slice(-7);
    const avgAppt =
      last.reduce((s, d) => s + d.appointments, 0) / Math.max(1, last.length);
    const forecast = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      forecast.push({
        date: d.toISOString().slice(0, 10),
        appointments: Math.round(avgAppt),
        revenue: Math.round(avgAppt * 80),
      });
    }
    return forecast;
  }, [trends]);

  const predictedWeek = next7.reduce((s, d) => s + d.appointments, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Analytics de crecimiento
          </h1>
          <p className="text-muted-foreground text-sm">
            Tendencias de citas e ingresos desde datos reales (proyección simple 7 días)
          </p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={loading}>
          <TrendingUp className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Citas (30 días)</p>
          <p className="text-2xl font-bold">{overview?.appointments_last_30_days ?? '—'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ingresos completados (30d)</p>
          <p className="text-2xl font-bold">
            S/ {(overview?.revenue_completed_last_30_days ?? 0).toFixed(0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Proyección 7 días</p>
          <p className="text-2xl font-bold">{predictedWeek} citas</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Clientes en riesgo</p>
          <p className="text-2xl font-bold text-amber-600">{churnRisk.length}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Histórico y tendencia (60 días)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          {trends.length === 0 ? (
            <p className="text-muted-foreground text-sm">Sin citas en el período</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="appointments"
                  stroke="#8b5cf6"
                  name="Citas"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  name="Ingresos S/"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Riesgo de abandono
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[280px] overflow-y-auto">
            {churnRisk.map((c) => (
              <div key={c.id} className="flex justify-between text-sm border-b py-2">
                <span>{c.name}</span>
                <Badge variant={c.risk === 'high' ? 'destructive' : 'outline'}>
                  {c.lastVisit}
                </Badge>
              </div>
            ))}
            {churnRisk.length === 0 && (
              <p className="text-muted-foreground text-sm">Sin clientes en riesgo detectado</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Proyección próximos 7 días
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={next7}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#6366f1" name="Citas estimadas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
