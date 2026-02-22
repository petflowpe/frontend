/**
 * Tema de la aplicación: light | dark | system
 * Persistido en localStorage bajo la clave 'theme'.
 * 'system' sigue la preferencia del SO (prefers-color-scheme).
 */

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function getSystemDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyToDocument(isDark: boolean): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

/**
 * Obtiene el tema guardado desde localStorage.
 * Si no hay valor guardado, devuelve 'system'.
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

/**
 * Guarda el tema en localStorage y aplica al documento.
 * Para 'system', aplica según prefers-color-scheme y se actualiza si el usuario cambia la preferencia del SO.
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

/**
 * Aplica el tema al documento sin cambiar localStorage.
 * - light: quita .dark
 * - dark: añade .dark
 * - system: usa prefers-color-scheme
 */
export function applyTheme(theme: Theme): void {
  if (theme === 'light') {
    applyToDocument(false);
    return;
  }
  if (theme === 'dark') {
    applyToDocument(true);
    return;
  }
  applyToDocument(getSystemDark());
}

/**
 * Devuelve si actualmente la UI debe mostrarse en modo oscuro
 * (respetando 'system' si está guardado).
 */
export function isDarkMode(): boolean {
  const theme = getStoredTheme();
  if (theme === 'light') return false;
  if (theme === 'dark') return true;
  return getSystemDark();
}

/**
 * Suscribirse a cambios de preferencia del sistema (solo relevante cuando theme === 'system').
 * Devuelve función para cancelar la suscripción.
 */
export function subscribeToSystemPreference(callback: (isDark: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    if (getStoredTheme() === 'system') {
      const isDark = mq.matches;
      applyToDocument(isDark);
      callback(isDark);
    }
  };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
