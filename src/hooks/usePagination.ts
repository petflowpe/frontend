/**
 * Hook unificado de paginación para mascotas, clientes, servicios, productos, etc.
 * Espera respuestas con formato: { data: T[], meta: { total, per_page, current_page, last_page } }
 */

import { useState, useCallback } from 'react';

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface UsePaginationOptions {
  perPage?: number;
}

export function usePagination<T = unknown>(initialPerPage = 15) {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    per_page: initialPerPage,
    current_page: 1,
    last_page: 1,
  });
  const [loading, setLoading] = useState(false);

  const setResult = useCallback((response: PaginatedResponse<T> | { data: T[]; meta?: PaginationMeta }) => {
    const items = Array.isArray(response.data) ? response.data : [];
    setData(items);
    if (response.meta) {
      setMeta(response.meta);
    }
  }, []);

  const page = meta.current_page;
  const lastPage = meta.last_page;
  const total = meta.total;
  const perPage = meta.per_page;
  const hasNext = page < lastPage;
  const hasPrev = page > 1;

  const goToPage = useCallback((newPage: number) => {
    setMeta((m) => ({ ...m, current_page: Math.max(1, Math.min(newPage, lastPage)) }));
  }, [lastPage]);

  const nextPage = useCallback(() => {
    if (hasNext) goToPage(page + 1);
  }, [hasNext, page, goToPage]);

  const prevPage = useCallback(() => {
    if (hasPrev) goToPage(page - 1);
  }, [hasPrev, page, goToPage]);

  const buildParams = useCallback((pageNum?: number, search?: string, extra?: Record<string, unknown>) => {
    const p = pageNum ?? page;
    const params: Record<string, string | number> = {
      page: String(p),
      per_page: String(perPage),
      ...extra as Record<string, string | number>,
    };
    if (search !== undefined && search !== '') params.search = search;
    return params;
  }, [page, perPage]);

  return {
    data,
    meta,
    setResult,
    setData,
    loading,
    setLoading,
    page,
    lastPage,
    total,
    perPage,
    hasNext,
    hasPrev,
    goToPage,
    nextPage,
    prevPage,
    setMeta,
    buildParams,
  };
}
