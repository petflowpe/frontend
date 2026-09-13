/**
 * Equivalente mínimo de `app-dialog` de Grooflow.
 *
 * Grooflow monta un diálogo React global; aquí se resuelve con los diálogos
 * nativos del navegador para no introducir un provider extra. La firma es
 * asíncrona para poder sustituir la implementación más adelante sin tocar
 * a los consumidores.
 */

export function appConfirm(message: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  return Promise.resolve(window.confirm(message));
}

export function appAlert(message: string): Promise<void> {
  if (typeof window !== 'undefined') window.alert(message);
  return Promise.resolve();
}

export function appPrompt(message: string, defaultValue = ''): Promise<string | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  return Promise.resolve(window.prompt(message, defaultValue));
}
