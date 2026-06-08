const STORAGE_KEY = 'petflow_calendar_filters_v1';

export interface StoredCalendarFilters {
  searchQuery?: string;
  statusFilter?: string;
  filterTipoCita?: string;
  filterDistrict?: string;
  selectedVehicleIds?: string[];
  showCancelled?: boolean;
  bookingSourceFilter?: string;
  sidebarOpen?: boolean;
}

export function loadCalendarFilters(): StoredCalendarFilters {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StoredCalendarFilters;
  } catch {
    return {};
  }
}

export function saveCalendarFilters(filters: StoredCalendarFilters): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    /* ignore */
  }
}
