import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Calendar, User, Package, FileText, DollarSign, MapPin, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

interface SearchResult {
  id: string;
  type: 'appointment' | 'client' | 'product' | 'invoice' | 'service' | 'route';
  title: string;
  subtitle: string;
  metadata?: string;
  date?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, itemId?: string) => void;
  companyId?: number;
}

export function GlobalSearch({ isOpen, onClose, onNavigate, companyId }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const params: Record<string, string> = { q: q.trim() };
      if (companyId != null) params.company_id = String(companyId);
      const res = await apiClient.get<{ success?: boolean; data?: { clients?: unknown[]; products?: unknown[]; appointments?: unknown[] } }>(API.search, params);
      const data = (res as { data?: { clients?: unknown[]; products?: unknown[]; appointments?: unknown[] } })?.data ?? res as { clients?: unknown[]; products?: unknown[]; appointments?: unknown[] };
      const list: SearchResult[] = [];

      (data.clients ?? []).forEach((c: { id?: number; razon_social?: string; nombre_comercial?: string; email?: string; direccion?: string }) => {
        list.push({
          id: String(c.id ?? ''),
          type: 'client',
          title: c.razon_social || c.nombre_comercial || '',
          subtitle: c.email || '',
          metadata: c.direccion,
        });
      });
      (data.products ?? []).forEach((p: { id?: number; name?: string; code?: string; stock?: number }) => {
        list.push({
          id: String(p.id ?? ''),
          type: 'product',
          title: p.name || '',
          subtitle: p.code || '',
          metadata: p.stock != null ? `Stock: ${p.stock}` : undefined,
        });
      });
      (data.appointments ?? []).forEach((a: { id?: number; client?: { razon_social?: string }; pet?: { name?: string }; scheduled_at?: string; status?: string; total?: number }) => {
        list.push({
          id: String(a.id ?? ''),
          type: 'appointment',
          title: a.pet?.name ? `${a.pet.name}` : 'Cita',
          subtitle: a.client?.razon_social || '',
          metadata: a.status,
          date: a.scheduled_at,
        });
      });

      setResults(list);
      setSelectedIndex(0);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelectResult(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelectResult = (result: SearchResult) => {
    // Guardar en historial
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Navegar al módulo correspondiente
    const moduleMap: Record<SearchResult['type'], string> = {
      appointment: 'appointments',
      client: 'clients',
      product: 'products',
      invoice: 'invoicing',
      service: 'services',
      route: 'routes'
    };

    onNavigate(moduleMap[result.type], result.id);
    onClose();
    setQuery('');
  };

  const getIcon = (type: SearchResult['type']) => {
    const iconMap = {
      appointment: Calendar,
      client: User,
      product: Package,
      invoice: FileText,
      service: DollarSign,
      route: MapPin
    };
    const Icon = iconMap[type];
    return <Icon className="w-4 h-4" />;
  };

  const getTypeColor = (type: SearchResult['type']) => {
    const colorMap = {
      appointment: 'bg-blue-500',
      client: 'bg-green-500',
      product: 'bg-purple-500',
      invoice: 'bg-orange-500',
      service: 'bg-pink-500',
      route: 'bg-cyan-500'
    };
    return colorMap[type];
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    const labelMap = {
      appointment: 'Cita',
      client: 'Cliente',
      product: 'Producto',
      invoice: 'Factura',
      service: 'Servicio',
      route: 'Ruta'
    };
    return labelMap[type];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogTitle className="sr-only">Búsqueda Global</DialogTitle>
        <DialogDescription className="sr-only">
          Búsqueda global del sistema SmartPet
        </DialogDescription>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <Search className="w-5 h-5 shrink-0 text-slate-400 dark:text-slate-500" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Buscar citas, clientes, productos, facturas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-0 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {!query && searchHistory.length > 0 && (
            <div className="p-4 bg-white dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Búsquedas recientes</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400 dark:text-slate-500" />
              <p>No se encontraron resultados para "{query}"</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2 bg-white dark:bg-slate-900">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                    index === selectedIndex ? 'bg-slate-50 dark:bg-slate-800' : ''
                  }`}
                >
                  <div className={`p-2 rounded-lg ${getTypeColor(result.type)} bg-opacity-10`}>
                    <div className={`${getTypeColor(result.type)} bg-opacity-100`}>
                      {getIcon(result.type)}
                    </div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {result.title}
                      </p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {getTypeLabel(result.type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{result.subtitle}</p>
                  </div>
                  {result.metadata && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{result.metadata}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-700 dark:text-slate-300">
                  ↑↓
                </kbd>
                Navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-700 dark:text-slate-300">
                  Enter
                </kbd>
                Seleccionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-700 dark:text-slate-300">
                  Esc
                </kbd>
                Cerrar
              </span>
            </div>
            <span>{results.length} resultados</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}