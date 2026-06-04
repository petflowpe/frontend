import { useCallback, useEffect, useState } from 'react';
import { Target, Truck, MapPin, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiClient } from '../../utils/api/client';
import { getStoredCompanyId } from '../../utils/appointmentMappers';

interface VehiclePattern {
  vehicle_id: number;
  vehicle_name: string;
  plate?: string;
  total_appointments: number;
  completed_appointments: number;
  completion_rate: number;
  revenue: number;
  top_districts: { district: string; appointments: number; revenue: number }[];
}

interface MobilePatternsData {
  period_days: number;
  vehicles: VehiclePattern[];
  summary: {
    total_appointments: number;
    active_vehicles: number;
    unique_districts: number;
  };
}

export function PatronesPanel() {
  const [data, setData] = useState<MobilePatternsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: MobilePatternsData }>(
        '/reports/growth/mobile-patterns',
        { company_id: getStoredCompanyId(), days: String(days) }
      );
      setData((res as { data?: MobilePatternsData }).data ?? (res as MobilePatternsData));
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const chartData =
    data?.vehicles.map((v) => ({
      name: v.vehicle_name,
      citas: v.total_appointments,
      completadas: v.completed_appointments,
      ingresos: v.revenue,
    })) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-7 h-7 text-orange-600" />
            Análisis de patrones por móvil
          </h1>
          <p className="text-slate-600 mt-1">
            Citas, distritos y rendimiento por unidad móvil (últimos {days} días)
          </p>
        </div>
        <div className="flex gap-2">
          {[30, 60, 90].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
          <Button variant="outline" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-500">Citas en período</div>
              <div className="text-2xl font-bold">{data.summary.total_appointments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-500">Móviles con actividad</div>
              <div className="text-2xl font-bold">{data.summary.active_vehicles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-slate-500">Distritos atendidos</div>
              <div className="text-2xl font-bold">{data.summary.unique_districts}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Citas por móvil</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {loading ? (
            <p className="text-slate-500">Cargando…</p>
          ) : chartData.length === 0 ? (
            <p className="text-slate-500">Sin citas con vehículo asignado en este período.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="citas" fill="#f97316" name="Total" />
                <Bar dataKey="completadas" fill="#22c55e" name="Completadas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(data?.vehicles ?? []).map((v) => (
          <Card key={v.vehicle_id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                {v.vehicle_name}
                {v.plate && (
                  <Badge variant="outline" className="font-normal">
                    {v.plate}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tasa de completado</span>
                <span className="font-semibold">{v.completion_rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ingresos completados</span>
                <span className="font-semibold">S/ {v.revenue.toFixed(2)}</span>
              </div>
              <div>
                <div className="text-slate-500 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Distritos principales
                </div>
                <ul className="space-y-1">
                  {v.top_districts.slice(0, 5).map((d) => (
                    <li key={d.district} className="flex justify-between">
                      <span>{d.district}</span>
                      <span>
                        {d.appointments} citas · S/ {Number(d.revenue).toFixed(0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
