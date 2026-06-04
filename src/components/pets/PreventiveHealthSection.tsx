import { useMemo, useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Bug,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  Syringe,
  Share2,
  Download,
  Bell,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import { toast } from 'sonner';
import type { PreventiveCategory, PreventiveEvent, PreventiveReminder, PreventiveStage } from './preventiveHealthUtils';
import {
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
  buildPreventiveLifeStages,
  collectPreventiveReminders,
  formatLifeLineForExport,
  isCatSpecies,
} from './preventiveHealthUtils';

interface PreventiveHealthSectionProps {
  petName: string;
  species?: string;
  birthDate?: string;
  events: PreventiveEvent[];
  onRegister: (category: PreventiveCategory) => void;
}

function CategoryIcon({ type }: { type: PreventiveCategory }) {
  if (type === 'vaccine') return <Syringe className="h-4 w-4 text-violet-400" />;
  if (type === 'deworming') return <Shield className="h-4 w-4 text-cyan-400" />;
  return <Bug className="h-4 w-4 text-amber-400" />;
}

function StatusBadge({ status }: { status: PreventiveEvent['status'] }) {
  const Icon =
    status === 'applied' ? CheckCircle2 : status === 'overdue' ? AlertTriangle : Clock;
  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${STATUS_BADGE_CLASS[status]}`}>
      <Icon className="h-3 w-3" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function PreventiveHealthSection({
  petName,
  species,
  birthDate,
  events,
  onRegister,
}: PreventiveHealthSectionProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const lifeStages = useMemo<PreventiveStage[]>(
    () => buildPreventiveLifeStages({ birthDate, species, events }),
    [birthDate, species, events]
  );

  const reminders = useMemo(
    () => collectPreventiveReminders(lifeStages, { withinDays: 30 }),
    [lifeStages]
  );

  const protocolLabel = isCatSpecies(species)
    ? 'Protocolo felino (FVRCP / rabia / desparasitación / antipulgas)'
    : 'Protocolo canino (AAHA / WSAVA)';

  const handleExport = () => {
    const text = formatLifeLineForExport(petName, birthDate, lifeStages);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linea-vida-${petName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Línea de vida exportada');
  };

  const handleShare = async () => {
    const text = formatLifeLineForExport(petName, birthDate, lifeStages);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Salud preventiva — ${petName}`,
          text,
        });
        return;
      } catch {
        /* usuario canceló */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Línea de vida copiada al portapapeles');
    } catch {
      toast.error('No se pudo compartir. Usa Exportar.');
    }
  };

  const handlePrint = () => {
    const text = formatLifeLineForExport(petName, birthDate, lifeStages);
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) {
      toast.error('Permite ventanas emergentes para imprimir');
      return;
    }
    w.document.write(`<pre style="font-family:system-ui;padding:24px;white-space:pre-wrap">${text.replace(/</g, '&lt;')}</pre>`);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="space-y-6" ref={printRef}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Syringe className="h-5 w-5 text-violet-400" />
            Línea de vida de {petName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {protocolLabel}
            {birthDate ? ` · Nacimiento ${formatDate(birthDate)}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
          <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={handlePrint}>
            Imprimir
          </Button>
        </div>
      </div>

      {reminders.length > 0 && (
        <Card className="p-4 border-amber-500/40 bg-amber-950/20">
          <p className="text-sm font-semibold text-amber-200 mb-2 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Recordatorios activos ({reminders.length})
          </p>
          <ul className="space-y-1 text-sm text-amber-100/90">
            {reminders.slice(0, 5).map((r: PreventiveReminder) => (
              <li key={r.id}>
                {r.status === 'overdue' ? '⚠ Atrasado' : '◷ Próximo'}: {r.title} — {formatDate(r.expectedDate)}
                {r.daysUntil < 0 ? ` (${Math.abs(r.daysUntil)} día(s) de retraso)` : r.daysUntil === 0 ? ' (hoy)' : ` (en ${r.daysUntil} día(s))`}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" className="gap-2 bg-violet-600 hover:bg-violet-700" onClick={() => onRegister('vaccine')}>
          <Syringe className="h-4 w-4" />
          Vacuna
        </Button>
        <Button type="button" size="sm" variant="secondary" className="gap-2" onClick={() => onRegister('deworming')}>
          <Shield className="h-4 w-4" />
          Desparasitación
        </Button>
        <Button type="button" size="sm" variant="outline" className="gap-2 border-amber-500/50 text-amber-700 dark:text-amber-300" onClick={() => onRegister('flea')}>
          <Bug className="h-4 w-4" />
          Antipulgas
        </Button>
      </div>

      <Card className="p-4 bg-slate-900 border-slate-800 text-slate-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm">
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Aplicado
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
              Próximo
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Atrasado (requiere acción)
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Syringe className="h-3.5 w-3.5 text-violet-400" /> Vacunas
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-cyan-400" /> Desparasitación
            </span>
            <span className="flex items-center gap-1.5">
              <Bug className="h-3.5 w-3.5 text-amber-400" /> Antipulgas
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-cyan-500" />
          Historial aplicado (línea de vida)
        </h4>

        {!birthDate && (
          <p className="text-sm text-muted-foreground">
            Para mostrar la línea de vida (por etapas), registra la fecha de nacimiento de la mascota.
          </p>
        )}

        {!!birthDate && (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-10">
            {lifeStages.length === 0 && (
              <p className="text-sm text-muted-foreground pl-8">
                Sin hitos en el protocolo. Usa los botones de arriba para registrar tratamientos.
              </p>
            )}

            {lifeStages.map((s) => (
              <div key={s.id} className="relative pl-10">
                <div className="absolute -left-[10px] top-1">
                  <div className={`h-4 w-4 rounded-full border-2 ${STATUS_DOT_CLASS[s.status]}`} />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {s.ageLabel}
                    </span>
                    <h5 className="font-semibold text-slate-900 dark:text-slate-100">{s.title}</h5>
                    <StatusBadge status={s.status} />
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {s.items.map((it) => (
                      <div
                        key={it.id}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <CategoryIcon type={it.type} />
                            <p className="font-medium text-slate-900 dark:text-slate-100">{it.title}</p>
                            <StatusBadge status={it.status} />
                          </div>
                          {it.expectedDate && (
                            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              {formatDate(it.expectedDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
