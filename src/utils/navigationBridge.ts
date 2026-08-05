/**
 * Utility to handle data passing between tabs/modules when they are lazy loaded.
 * Uses sessionStorage to persist data across tab switches/reloads.
 */

export interface NavigationAction {
  targetTab: string;
  action: string;
  payload: any;
  timestamp: number;
}

const STORAGE_KEY = 'smartpet_nav_action';

export const setPendingAction = (targetTab: string, action: string, payload: any = {}) => {
  const data: NavigationAction = {
    targetTab,
    action,
    payload,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getPendingAction = (currentTab: string): NavigationAction | null => {
  const dataStr = sessionStorage.getItem(STORAGE_KEY);
  if (!dataStr) return null;

  try {
    const data: NavigationAction = JSON.parse(dataStr);

    if (data.targetTab !== currentTab) return null;

    if (Date.now() - data.timestamp > 60000) {
      clearPendingAction();
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

export const clearPendingAction = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};

/** Navega a otra pestaña (App.tsx escucha el evento) y deja una acción pendiente. */
export const navigateToTabWithAction = (
  targetTab: string,
  action: string,
  payload: any = {}
) => {
  setPendingAction(targetTab, action, payload);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: { tab: targetTab } }));
  }
};

/** Atajo: abrir Caja enfocando cobro de una cita. */
export const goToCashCollect = (appointmentId: string | number, openPay = true) => {
  navigateToTabWithAction('cash-register', 'collect_appointment', {
    appointmentId: String(appointmentId),
    openPay,
  });
};
