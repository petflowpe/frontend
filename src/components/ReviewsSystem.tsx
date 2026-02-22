import { useState } from 'react';
import { Star, MessageSquare, TrendingUp, Award, Send, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface Review {
  id: string;
  clientName: string;
  petName: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
  groomer: string;
  response?: string;
  photos?: string[];
  verified: boolean;
}

export function ReviewsSystem() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'REV-001',
      clientName: 'María García',
      petName: 'Max',
      rating: 5,
      comment: '¡Excelente servicio! Max quedó hermoso y el groomer fue muy amable. Definitivamente volveré.',
      date: '2024-12-18',
      service: 'Baño y Corte Completo',
      groomer: 'Carlos Ruiz',
      verified: true,
      photos: []
    },
    {
      id: 'REV-002',
      clientName: 'Juan Pérez',
      petName: 'Luna',
      rating: 4,
      comment: 'Buen servicio en general. Luna quedó limpia y oliendo bien. El único detalle es que llegaron 15 minutos tarde.',
      date: '2024-12-17',
      service: 'Baño Medicado',
      groomer: 'Ana Torres',
      verified: true,
      response: 'Gracias por tu feedback Juan. Lamentamos el retraso, trabajaremos en mejorar nuestra puntualidad.'
    },
    {
      id: 'REV-003',
      clientName: 'Sandra López',
      petName: 'Rocky',
      rating: 5,
      comment: 'Súper profesionales. Rocky tiene un pelaje difícil y lo dejaron impecable. ¡Recomendado 100%!',
      date: '2024-12-16',
      service: 'Corte de Pelo',
      groomer: 'Carlos Ruiz',
      verified: true
    },
    {
      id: 'REV-004',
      clientName: 'Roberto Díaz',
      petName: 'Bella',
      rating: 3,
      comment: 'El servicio estuvo bien pero esperaba un poco más de atención al detalle.',
      date: '2024-12-15',
      service: 'Baño y Secado',
      groomer: 'Luis Mendoza',
      verified: true
    }
  ]);

  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [filterRating, setFilterRating] = useState<string>('all');

  // Calcular métricas
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;
  const nps = calculateNPS(reviews);
  const responseRate = (reviews.filter(r => r.response).length / totalReviews) * 100;

  // Distribución de ratings
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / totalReviews) * 100
  }));

  function calculateNPS(reviews: Review[]): number {
    const promoters = reviews.filter(r => r.rating >= 4).length;
    const detractors = reviews.filter(r => r.rating <= 2).length;
    return ((promoters - detractors) / totalReviews) * 100;
  }

  const handleResponseSubmit = (reviewId: string) => {
    const response = responseText[reviewId];
    if (!response?.trim()) {
      toast.error('Por favor escribe una respuesta');
      return;
    }

    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, response } : r
    ));
    setResponseText({ ...responseText, [reviewId]: '' });
    toast.success('Respuesta publicada exitosamente');
  };

  const filteredReviews = filterRating === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === parseInt(filterRating));

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-slate-300 dark:text-slate-600'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Reviews y Testimonios
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gestiona la retroalimentación de tus clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Rating Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {averageRating.toFixed(1)}
              </p>
              <StarRating rating={Math.round(averageRating)} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Basado en {totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Net Promoter Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {nps.toFixed(0)}
              </p>
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mb-1" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {nps >= 50 ? 'Excelente' : nps >= 0 ? 'Bueno' : 'Necesita mejora'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Tasa de Respuesta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {responseRate.toFixed(0)}%
              </p>
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1" />
            </div>
            <Progress value={responseRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Reviews Verificadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {reviews.filter(r => r.verified).length}
              </p>
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              De {totalReviews} totales
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reviews">Todas las Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonios Destacados</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Filter className="w-4 h-4 text-slate-400" />
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las calificaciones</SelectItem>
                    <SelectItem value="5">5 estrellas</SelectItem>
                    <SelectItem value="4">4 estrellas</SelectItem>
                    <SelectItem value="3">3 estrellas</SelectItem>
                    <SelectItem value="2">2 estrellas</SelectItem>
                    <SelectItem value="1">1 estrella</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de reviews */}
          <div className="space-y-4">
            {filteredReviews.map(review => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {review.clientName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {review.clientName}
                            </p>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                Verificada
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">
                            {review.petName} • {review.service}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StarRating rating={review.rating} />
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(review.date).toLocaleDateString('es-PE')}
                        </p>
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300">
                      {review.comment}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Groomer: {review.groomer}</span>
                    </div>

                    {review.response ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Respuesta de SmartPet
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {review.response}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Escribe una respuesta a esta review..."
                          value={responseText[review.id] || ''}
                          onChange={(e) => setResponseText({
                            ...responseText,
                            [review.id]: e.target.value
                          })}
                          className="min-h-20"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleResponseSubmit(review.id)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Publicar Respuesta
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Calificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-24">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <Progress value={percentage} className="flex-1" />
                    <span className="text-sm text-slate-600 dark:text-slate-400 w-16 text-right">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Mejores Groomers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Carlos Ruiz', 'Ana Torres', 'Luis Mendoza'].map((groomer, index) => (
                    <div key={groomer} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                        <span className="text-sm">{groomer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={5 - index} />
                        <span className="text-sm text-slate-500">
                          {(5 - index * 0.3).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servicios Mejor Valorados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Baño y Corte Completo', 'Corte de Pelo', 'Baño Medicado'].map((service, index) => (
                    <div key={service} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                        <span className="text-sm">{service}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating rating={5 - index} />
                        <span className="text-sm text-slate-500">
                          {(4.8 - index * 0.2).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testimonios para Compartir</CardTitle>
              <p className="text-sm text-slate-500">
                Estos testimonios destacados pueden compartirse en redes sociales y tu sitio web
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.filter(r => r.rating === 5).slice(0, 3).map(review => (
                  <Card key={review.id} className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <StarRating rating={review.rating} />
                        <p className="text-lg italic text-slate-900 dark:text-white">
                          "{review.comment}"
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {review.clientName}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Cliente desde {new Date(review.date).toLocaleDateString('es-PE')}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Compartir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
