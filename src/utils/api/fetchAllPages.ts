import { apiClient } from './client';

const PAGE_SIZE = 200;
const MAX_PAGES = 100;

function pageItems(response: unknown): any[] {
  if (Array.isArray(response)) return response;
  const data = (response as { data?: unknown })?.data;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: any[] }).data;
  }
  return [];
}

function lastPage(response: unknown): number {
  if (!response || typeof response !== 'object' || Array.isArray(response)) return 1;
  const r = response as Record<string, any>;
  const value = r.last_page ?? r.meta?.last_page ?? r.pagination?.last_page ?? r.data?.last_page;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * Recorre todas las páginas de un listado paginado de Laravel (tope por página: 200 en el backend).
 */
export async function fetchAllPages<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T[]> {
  const first = await apiClient.get<unknown>(endpoint, { ...params, per_page: PAGE_SIZE, page: 1 });
  const items: T[] = pageItems(first);
  const total = Math.min(lastPage(first), MAX_PAGES);

  if (total > 1) {
    const rest = await Promise.all(
      Array.from({ length: total - 1 }, (_, i) =>
        apiClient.get<unknown>(endpoint, { ...params, per_page: PAGE_SIZE, page: i + 2 })
      )
    );
    rest.forEach((res) => items.push(...pageItems(res)));
  }

  return items;
}
