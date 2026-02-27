import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { setI18nLanguage } from '../i18n';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';
import { toast } from 'sonner';

const LOCALES = [
  { code: 'es', labelKey: 'language.es' },
  { code: 'en', labelKey: 'language.en' },
  { code: 'pt_BR', labelKey: 'language.pt_BR' },
] as const;

interface LanguageSelectorProps {
  /** Si está autenticado, guarda el locale en el perfil del usuario */
  authenticated?: boolean;
}

export function LanguageSelector({ authenticated }: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();

  const currentLng = (i18n.language ?? 'es').replace('-', '_');

  const handleSelect = async (code: string) => {
    setI18nLanguage(code);
    if (authenticated) {
      try {
        await apiClient.put(API.profile.update, { locale: code });
        toast.success(t('common.success'));
      } catch {
        toast.error(t('common.error'));
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          aria-label={t('language.label')}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-2" align="end">
        <p className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {t('language.label')}
        </p>
        <div className="grid gap-0.5">
          {LOCALES.map(({ code, labelKey }) => (
            <button
              key={code}
              type="button"
              onClick={() => handleSelect(code)}
              className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                currentLng === code
                  ? 'bg-primary/10 text-primary font-medium dark:bg-primary/20'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
