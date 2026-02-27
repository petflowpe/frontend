import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

const resources = {
  es: { translation: es },
  en: { translation: en },
  pt_BR: { translation: ptBR },
};

// Códigos que el backend devuelve (users.locale)
const supportedLngs = ['es', 'en', 'pt_BR'] as const;
export type SupportedLocale = (typeof supportedLngs)[number];

const fallbackLng = 'es';

i18n.use(initReactI18next).init({
  resources,
  lng: fallbackLng,
  fallbackLng,
  supportedLngs: supportedLngs as unknown as string[],
  interpolation: { escapeValue: false },
});

export function setI18nLanguage(locale: string): void {
  const normalized = supportedLngs.includes(locale as SupportedLocale) ? locale : fallbackLng;
  i18n.changeLanguage(normalized);
}

export default i18n;
