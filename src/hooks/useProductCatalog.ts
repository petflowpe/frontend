import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';
import { API } from '../utils/api/endpoints';

export interface CatalogItem {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
}

function extractList<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  const data = (response as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

export function useProductCatalog(companyId?: number | null) {
  const [categories, setCategories] = useState<CatalogItem[]>([]);
  const [brands, setBrands] = useState<CatalogItem[]>([]);
  const [areas, setAreas] = useState<CatalogItem[]>([]);
  const [units, setUnits] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCatalog = useCallback(async () => {
    if (companyId == null || companyId <= 0) {
      setCategories([]);
      setBrands([]);
      setAreas([]);
      setUnits([]);
      return;
    }

    setLoading(true);
    try {
      const params = { company_id: companyId, only_active: 1 };
      const [catRes, brandRes, areaRes, unitRes] = await Promise.all([
        apiClient.get(API.categories.list, params),
        apiClient.get(API.brands.list, params),
        apiClient.get(API.areas.list, params),
        apiClient.get(API.units.list, params),
      ]);
      setCategories(extractList<CatalogItem>(catRes));
      setBrands(extractList<CatalogItem>(brandRes));
      setAreas(extractList<CatalogItem>(areaRes));
      setUnits(extractList<CatalogItem>(unitRes));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error cargando catálogo';
      toast.error(msg);
      setCategories([]);
      setBrands([]);
      setAreas([]);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  return {
    categories,
    brands,
    areas,
    units,
    loading,
    reloadCatalog: loadCatalog,
  };
}
