import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Dog, Calendar, MapPin, CreditCard, Star, Gift, Settings, LogOut, ChevronRight, Edit, Plus, Heart, Award, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';

interface ClientProfileProps {
  clientData?: any;
}

export function ClientProfile({ clientData }: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const client = clientData || {
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+51 987 654 321',
    address: 'Av. Larco 1301, Miraflores',
    avatar: null,
    memberSince: '2024-01-15',
    totalBookings: 24,
    totalSpent: 1850,
    loyaltyPoints: 450,
    tier: 'Gold',
  };

  const pets = [
    {
      id: 1,
      name: 'Firulais',
      breed: 'Golden Retriever',
      age: 3,
      size: 'large',
      photo: '🐕',
      lastService: '2024-12-15',
      nextVaccine: '2025-02-20',
    },
    {
      id: 2,
      name: 'Luna',
      breed: 'Poodle',
      age: 2,
      size: 'medium',
      photo: '🐩',
      lastService: '2024-12-10',
      nextVaccine: '2025-03-15',
    },
  ];

  const bookingHistory = [
    {
      id: 1,
      date: '2024-12-15',
      service: 'Baño + Corte',
      pet: 'Firulais',
      amount: 75,
      status: 'completed',
      rating: 5,
    },
    {
      id: 2,
      date: '2024-12-10',
      service: 'Baño Completo',
      pet: 'Luna',
      amount: 45,
      status: 'completed',
      rating: 5,
    },
    {
      id: 3,
      date: '2024-12-01',
      service: 'Spa Completo',
      pet: 'Firulais',
      amount: 140,
      status: 'completed',
      rating: 4,
    },
  ];

  const tierProgress = {
    Silver: { min: 0, max: 500, color: 'bg-slate-400' },
    Gold: { min: 500, max: 1500, color: 'bg-yellow-500' },
    Platinum: { min: 1500, max: 3000, color: 'bg-purple-500' },
    Diamond: { min: 3000, max: Infinity, color: 'bg-blue-500' },
  };

  const currentTier = tierProgress[client.tier as keyof typeof tierProgress];
  const nextTier = client.tier === 'Diamond' ? null : 
    client.tier === 'Platinum' ? 'Diamond' :
    client.tier === 'Gold' ? 'Platinum' : 'Gold';
  
  const progressToNextTier = nextTier ? 
    ((client.loyaltyPoints - currentTier.min) / (currentTier.max - currentTier.min)) * 100 : 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar className="w-24 h-24 border-4 border-blue-100">
                  <AvatarImage src={client.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl">
                    {client.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{client.name}</h1>
                  <Badge className={`${currentTier.color} text-white`}>
                    <Award className="w-3 h-3 mr-1" />
                    {client.tier}
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600 mb-4">
                  <div>📧 {client.email}</div>
                  <div>📱 {client.phone}</div>
                  <div>📍 {client.address}</div>
                </div>

                {/* Loyalty Progress */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">
                      {client.loyaltyPoints} puntos • {nextTier ? `Próximo nivel: ${nextTier}` : 'Nivel Máximo!'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {nextTier ? `${tierProgress[nextTier as keyof typeof tierProgress].min - client.loyaltyPoints} puntos más` : '🎉'}
                    </span>
                  </div>
                  <Progress value={progressToNextTier} className={`h-2 ${currentTier.color}`} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-4 gap-4 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{client.totalBookings}</div>
                  <div className="text-sm text-slate-600">Citas Totales</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">S/{client.totalSpent}</div>
                  <div className="text-sm text-slate-600">Gastado Total</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{client.loyaltyPoints}</div>
                  <div className="text-sm text-slate-600">Puntos</div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">4.9</div>
                  <div className="text-sm text-slate-600">Rating Promedio</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tabs Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="pets">Mascotas</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
            <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* My Pets */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Mis Mascotas</h3>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {pets.map((pet, index) => (
                      <motion.div
                        key={pet.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{pet.photo}</div>
                            <div className="flex-1">
                              <div className="font-semibold">{pet.name}</div>
                              <div className="text-sm text-slate-600">
                                {pet.breed} • {pet.age} años
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="p-6">
                  <h3 className="font-bold text-lg mb-4">Actividad Reciente</h3>
                  
                  <div className="space-y-4">
                    {bookingHistory.slice(0, 3).map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 pb-4 border-b last:border-0"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{booking.service}</div>
                          <div className="text-sm text-slate-600">{booking.pet}</div>
                          <div className="text-xs text-slate-500">{booking.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">S/{booking.amount}</div>
                          <div className="flex items-center gap-1 text-xs">
                            {[...Array(booking.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <Button variant="ghost" size="sm" className="w-full mt-4">
                    Ver Todo el Historial
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xl mb-2">¿Listo para tu próxima cita?</h3>
                    <p className="opacity-90">Reserva ahora y gana puntos extra</p>
                  </div>
                  <Button size="lg" variant="secondary">
                    <Calendar className="w-5 h-5 mr-2" />
                    Reservar Ahora
                  </Button>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Pets Tab */}
          <TabsContent value="pets" className="space-y-4">
            {pets.map((pet, index) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="text-6xl">{pet.photo}</div>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{pet.name}</h3>
                        <p className="text-slate-600">{pet.breed}</p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500">Edad</div>
                          <div className="font-semibold">{pet.age} años</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Tamaño</div>
                          <div className="font-semibold capitalize">{pet.size}</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Último Servicio</div>
                          <div className="font-semibold">{pet.lastService}</div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-yellow-800">
                          <AlertCircle className="w-4 h-4" />
                          <span>Próxima vacuna: {pet.nextVaccine}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Reservar Servicio
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            <Button variant="outline" className="w-full" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Agregar Nueva Mascota
            </Button>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="p-6">
              <div className="space-y-4">
                {bookingHistory.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      booking.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Calendar className={`w-6 h-6 ${
                        booking.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold">{booking.service}</div>
                      <div className="text-sm text-slate-600">{booking.pet} • {booking.date}</div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < booking.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg">S/{booking.amount}</div>
                      <Badge className="bg-green-100 text-green-800">
                        Completado
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Mis Cupones</h3>
                <div className="space-y-3">
                  <CouponCard discount="20%" code="FIRST20" expiry="31 Dic 2024" />
                  <CouponCard discount="S/15" code="LOVE15" expiry="15 Ene 2025" />
                  <CouponCard discount="30%" code="GOLD30" expiry="28 Feb 2025" />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Programa de Referidos</h3>
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-4">
                  <div className="text-4xl font-bold text-purple-600 mb-2">S/50</div>
                  <p className="text-sm text-slate-700">
                    ¡Gana S/50 por cada amigo que refiras!
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <span>Tu código de referido:</span>
                    <code className="font-mono font-bold text-blue-600">JUAN2024</code>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <span>Amigos referidos:</span>
                    <span className="font-bold">8 personas</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                    <span>Ganado total:</span>
                    <span className="font-bold text-green-600">S/400</span>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  Compartir Mi Código
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CouponCard({ discount, code, expiry }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-600">{discount} OFF</div>
            <div className="text-sm text-slate-600">Código: {code}</div>
          </div>
          <div className="text-right">
            <Badge variant="outline">Válido hasta</Badge>
            <div className="text-xs text-slate-500 mt-1">{expiry}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}