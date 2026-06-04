import { useCallback, useEffect, useState } from 'react';
import { FileKey, RefreshCw, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { apiClient } from '../../utils/api/client';
import { API } from '../../utils/api/endpoints';
import { toast } from 'sonner';

interface CorrelativeRow {
  id: number;
  tipo_documento: string;
  tipo_documento_nombre: string;
  serie: string;
  correlativo_actual: number;
  proximo_numero: string;
}

interface CorrelativesPanelProps {
  branchId: number;
}

export function CorrelativesPanel({ branchId }: CorrelativesPanelProps) {
  const [rows, setRows] = useState<CorrelativeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: { correlatives: CorrelativeRow[] } }>(
        API.branches.correlatives(branchId)
      );
      const data = (res as { data?: { correlatives?: CorrelativeRow[] } }).data ?? res;
      setRows((data as { correlatives?: CorrelativeRow[] }).correlatives ?? []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    load();
  }, [load]);

  const syncFromSunat = async () => {
    setSyncing(true);
    try {
      const res = await apiClient.post<{ message?: string }>(
        API.correlatives.syncSunat(branchId),
        {}
      );
      toast.success((res as { message?: string }).message ?? 'Series sincronizadas');
      await load();
    } catch (e: any) {
      toast.error(e.message || 'Error al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileKey className="w-5 h-5 text-purple-600" />
          Correlativos por sucursal
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button size="sm" onClick={syncFromSunat} disabled={syncing}>
            <Link2 className="w-4 h-4 mr-1" />
            Sincronizar desde Config SUNAT
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-slate-500">Cargando correlativos…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay correlativos. Configure series en Config SUNAT y pulse sincronizar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="py-2">Documento</th>
                  <th className="py-2">Serie</th>
                  <th className="py-2">Último N°</th>
                  <th className="py-2">Próximo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2">
                      <Badge variant="outline">{r.tipo_documento}</Badge>{' '}
                      {r.tipo_documento_nombre}
                    </td>
                    <td className="py-2 font-mono">{r.serie}</td>
                    <td className="py-2">{r.correlativo_actual}</td>
                    <td className="py-2 font-medium text-green-700">{r.proximo_numero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
