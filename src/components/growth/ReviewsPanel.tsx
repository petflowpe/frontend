import { useState } from 'react';
import { Star, MessageSquare, Send, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { useReviews } from '../../hooks/useReviews';

export function ReviewsPanel() {
  const { reviews, loading, respondToReview } = useReviews();
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [filterRating, setFilterRating] = useState('all');

  const filtered = reviews.filter(
    (r) => filterRating === 'all' || String(r.rating) === filterRating
  );

  const totalReviews = reviews.length || 1;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;
  const promoters = reviews.filter((r) => r.rating >= 4).length;
  const detractors = reviews.filter((r) => r.rating <= 2).length;
  const nps = reviews.length
    ? ((promoters - detractors) / reviews.length) * 100
    : 0;
  const responseRate =
    reviews.length > 0
      ? (reviews.filter((r) => r.staff_response).length / reviews.length) * 100
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / totalReviews) * 100,
  }));

  const handleResponseSubmit = async (reviewId: number) => {
    const response = responseText[String(reviewId)]?.trim();
    if (!response) {
      toast.error('Escribe una respuesta');
      return;
    }
    try {
      await respondToReview(reviewId, response);
      toast.success('Respuesta publicada');
      setResponseText((prev) => ({ ...prev, [String(reviewId)]: '' }));
    } catch {
      toast.error('No se pudo guardar la respuesta');
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-blue-600" />
          Reseñas y Satisfacción
        </h1>
        <p className="text-muted-foreground text-sm">Opiniones de clientes desde la base de datos</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex mt-1">{renderStars(Math.round(averageRating))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total reseñas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">NPS estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nps.toFixed(0)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa de respuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate.toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          <TabsTrigger value="stats">Distribución</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          {ratingDistribution.map((item) => (
            <div key={item.rating} className="flex items-center gap-3">
              <span className="w-8 text-sm font-medium">{item.rating}★</span>
              <Progress value={item.percentage} className="flex-1" />
              <span className="text-sm text-muted-foreground w-12">{item.count}</span>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {[5, 4, 3, 2, 1].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} estrellas
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Cargando reseñas...</p>
          ) : filtered.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              Aún no hay reseñas registradas. Puedes cargarlas vía API POST /reviews.
            </Card>
          ) : (
            filtered.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{review.client_name}</p>
                    {review.pet_name && (
                      <p className="text-sm text-muted-foreground">Mascota: {review.pet_name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {review.service_name || 'Servicio'} ·{' '}
                      {new Date(review.created_at).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  <div className="flex">{renderStars(review.rating)}</div>
                </div>
                {review.comment && <p className="text-sm mb-3">{review.comment}</p>}
                {review.staff_response ? (
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-medium text-xs mb-1">Respuesta del equipo</p>
                    {review.staff_response}
                  </div>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <Textarea
                      placeholder="Responder al cliente..."
                      value={responseText[String(review.id)] || ''}
                      onChange={(e) =>
                        setResponseText((prev) => ({
                          ...prev,
                          [String(review.id)]: e.target.value,
                        }))
                      }
                      rows={2}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={() => handleResponseSubmit(review.id)}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {review.verified && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Verificada
                  </Badge>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
