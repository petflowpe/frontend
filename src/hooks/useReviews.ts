import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '../utils/api/client';

export interface ClientReview {
  id: number;
  client_name: string;
  pet_name?: string;
  rating: number;
  comment?: string;
  service_name?: string;
  staff_name?: string;
  staff_response?: string;
  verified: boolean;
  created_at: string;
}

export function useReviews() {
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ data: ClientReview[] }>('/reviews', { limit: 200 });
      const list = Array.isArray(res) ? res : (res as { data?: ClientReview[] }).data ?? [];
      setReviews(list);
    } catch {
      toast.error('No se pudieron cargar las reseñas');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const respondToReview = async (id: number, staffResponse: string) => {
    await apiClient.post(`/reviews/${id}/respond`, { staff_response: staffResponse });
    await loadReviews();
  };

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return { reviews, loading, loadReviews, respondToReview };
}
