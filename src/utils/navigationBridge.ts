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

export const setPendingAction = (targetTab: string, action: string, payload: any) => {
  const data: NavigationAction = {
    targetTab,
    action,
    payload,
    timestamp: Date.now()
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getPendingAction = (currentTab: string): NavigationAction | null => {
  const dataStr = sessionStorage.getItem(STORAGE_KEY);
  if (!dataStr) return null;

  try {
    const data: NavigationAction = JSON.parse(dataStr);
    
    // Check if the action is for the current tab
    if (data.targetTab !== currentTab) return null;
    
    // Optional: Expire actions older than 1 minute
    if (Date.now() - data.timestamp > 60000) {
      clearPendingAction();
      return null;
    }

    return data;
  } catch (e) {
    return null;
  }
};

export const clearPendingAction = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};
