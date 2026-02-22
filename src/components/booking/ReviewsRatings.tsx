import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ThumbsUp, Filter, TrendingUp, Award, MessageSquare, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';

interface Review {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  service: string;
  comment: string;
  helpful: number;
  verified: boolean;
  images?: string[];
}

export function ReviewsRatings() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const stats = {
    average: 4.9,
    total: 1248,
    distribution: {
      5: 85,
      4: 10,
      3: 3,
      2: 1,
      1: 1,
    },
  };

  const reviews: Review[] = [
    {
      id: '1',
      author: 'María González',
      rating: 5,
      date: '2024-12-20',
      service: 'Baño + Corte',
      comment: '¡Excelente servicio! Mi Golden quedó hermoso. El groomer fue muy paciente y profesional. Definitivamente volveré.',
      helpful: 24,
      verified: true,
      images: ['🐕'],
    },
    {
      id: '2',
      author: 'Carlos Ramírez',
      rating: 5,
      date: '2024-12-18',
      service: 'Spa Completo',
      comment: 'Puntualidad perfecta, trabajo profesional y precios justos. Max siempre vuelve feliz del spa. 100% recomendado.',
      helpful: 18,
      verified: true,
    },
    {
      id: '3',
      author: 'Ana Torres',
      rating: 4,
      date: '2024-12-15',
      service: 'Baño Medicado',
      comment: 'Muy buen servicio, Coco quedó limpio y oliendo rico. Solo mejoraría el tiempo de llegada.',
      helpful: 12,
      verified: true,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Reseñas de Clientes</h1>
          <p className="text-slate-600">
            Lee lo que nuestros clientes dicen sobre nosotros
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Overall Rating */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="mb-4"
                >
                  <div className="text-6xl font-bold text-yellow-500 mb-2">
                    {stats.average}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.div
                        key={star}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: star * 0.1 }}
                      >
                        <Star className="w-8 h-8 text-yellow-500 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-slate-600">
                    Basado en {stats.total.toLocaleString()} reseñas
                  </p>
                </motion.div>

                <Button
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  onClick={() => setShowReviewForm(true)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Escribir Reseña
                </Button>
              </Card>
            </motion.div>

            {/* Rating Distribution */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h3 className="font-bold mb-4">Distribución de Ratings</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars, index) => (
                    <motion.div
                      key={stars}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm font-semibold">{stars}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      </div>
                      <div className="flex-1">
                        <Progress
                          value={stats.distribution[stars as keyof typeof stats.distribution]}
                          className="h-2"
                        />
                      </div>
                      <span className="text-sm text-slate-600 w-12 text-right">
                        {stats.distribution[stars as keyof typeof stats.distribution]}%
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <h3 className="font-bold mb-4">¿Por Qué Confiar?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Reseñas verificadas de clientes reales</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>1,248+ servicios completados</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>98% de satisfacción garantizada</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span>Respuesta en menos de 2 horas</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-400" />
                  <Button
                    size="sm"
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                  >
                    Todas
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === '5' ? 'default' : 'outline'}
                    onClick={() => setFilter('5')}
                  >
                    <Star className="w-4 h-4 mr-1 fill-current" />5 Estrellas
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'verified' ? 'default' : 'outline'}
                    onClick={() => setFilter('verified')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verificadas
                  </Button>
                  <Button
                    size="sm"
                    variant={filter === 'photos' ? 'default' : 'outline'}
                    onClick={() => setFilter('photos')}
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Con Fotos
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Review Form Modal */}
            <AnimatePresence>
              {showReviewForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="p-6 border-2 border-yellow-200 bg-yellow-50">
                    <h3 className="font-bold text-xl mb-4">Escribe tu Reseña</h3>
                    
                    <div className="space-y-4">
                      {/* Star Rating */}
                      <div>
                        <label className="text-sm font-semibold mb-2 block">
                          Tu Calificación *
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <motion.button
                              key={star}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setRating(star)}
                            >
                              <Star
                                className={`w-10 h-10 transition-colors ${
                                  star <= (hoverRating || rating)
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-slate-300'
                                }`}
                              />
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="text-sm font-semibold mb-2 block">
                          Tu Experiencia *
                        </label>
                        <Textarea
                          placeholder="Cuéntanos sobre tu experiencia con SmartPet..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500"
                          disabled={!rating || !reviewText.trim()}
                        >
                          Publicar Reseña
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reviews */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={review.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                          {review.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{review.author}</h4>
                          {review.verified && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span>•</span>
                          <span>{review.service}</span>
                          <span>•</span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-700 mb-4">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {review.images.map((img, i) => (
                          <motion.div
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-4xl cursor-pointer"
                          >
                            {img}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Útil ({review.helpful})
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Responder
                      </motion.button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Load More */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button variant="outline" className="w-full" size="lg">
                Cargar Más Reseñas
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
