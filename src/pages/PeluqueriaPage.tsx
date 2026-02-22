import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Footer from '../components/Footer';
import { 
  Heart, 
  Phone,
  MapPin,
  Clock,
  Menu,
  X,
  Calendar,
  Star,
  Scissors,
  Sparkles,
  ShowerHead,
  Wind,
  Crown,
  Gift,
  Trophy,
  Percent,
  Check,
  Truck,
  Shield,
  Users,
  ArrowRight
} from 'lucide-react';

interface PeluqueriaPageProps {
  onNavigate: (page: 'home' | 'adopcion' | 'paseos' | 'cursos' | 'hoteleria' | 'trabaja' | 'movilvet' | 'peluqueria') => void;
}

export default function PeluqueriaPage({ onNavigate }: PeluqueriaPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const services = [
    {
      icon: Scissors,
      title: "Corte Completo",
      description: "Estilizado profesional según raza y preferencias",
      price: "S/. 80",
      duration: "60 min",
      includes: ["Baño premium", "Corte de pelo", "Peinado", "Secado"]
    },
    {
      icon: ShowerHead,
      title: "Baño Premium",
      description: "Limpieza profunda con productos hipoalergénicos",
      price: "S/. 50",
      duration: "45 min",
      includes: ["Champú especial", "Acondicionador", "Secado", "Cepillado"]
    },
    {
      icon: Sparkles,
      title: "Spa Completo",
      description: "Experiencia de lujo con tratamientos especiales",
      price: "S/. 150",
      duration: "90 min",
      includes: ["Baño aromático", "Masaje relajante", "Hidratación", "Corte", "Perfume"]
    },
    {
      icon: Wind,
      title: "Deslanado",
      description: "Eliminación de pelo muerto para razas de doble capa",
      price: "S/. 60",
      duration: "50 min",
      includes: ["Cepillado profundo", "Baño", "Secado", "Acondicionador"]
    }
  ];

  const loyaltyTiers = [
    {
      name: "Bronce",
      icon: Star,
      visits: "1-5 visitas",
      discount: "5%",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      benefits: [
        "5% descuento en servicios",
        "Recordatorios de citas",
        "Acceso a ofertas especiales"
      ]
    },
    {
      name: "Plata",
      icon: Gift,
      visits: "6-15 visitas",
      discount: "10%",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      benefits: [
        "10% descuento en servicios",
        "Servicio de uñas gratis",
        "Prioridad en agendamiento",
        "Regalo de cumpleaños mascota"
      ]
    },
    {
      name: "Oro",
      icon: Crown,
      visits: "16+ visitas",
      discount: "15%",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      popular: true,
      benefits: [
        "15% descuento en servicios",
        "Limpieza dental gratis",
        "Transporte prioritario",
        "Consulta veterinaria básica",
        "Sesión de fotos profesional"
      ]
    }
  ];

  const currentOffers = [
    {
      title: "Primera Visita",
      discount: "20% OFF",
      description: "Descuento especial para nuevos clientes",
      validUntil: "31 Diciembre 2024",
      type: "new-client"
    },
    {
      title: "Referido Amigo",
      discount: "25% OFF",
      description: "Refiere un amigo y ambos obtienen descuento",
      validUntil: "Todo el año",
      type: "referral"
    },
    {
      title: "Paquete Familiar",
      discount: "30% OFF",
      description: "3 o más mascotas de la misma familia",
      validUntil: "Promoción permanente",
      type: "family"
    }
  ];

  const packages = [
    {
      name: "Básico",
      price: "S/. 200",
      period: "mensual",
      sessions: "4 sesiones",
      popular: false,
      features: [
        "1 baño por semana",
        "Corte de uñas incluido",
        "Limpieza de oídos",
        "Cepillado dental básico"
      ]
    },
    {
      name: "Premium",
      price: "S/. 350",
      period: "mensual",
      sessions: "4 sesiones",
      popular: true,
      features: [
        "1 baño y corte por semana",
        "Tratamiento antipulgas",
        "Limpieza dental profunda",
        "Masaje relajante",
        "Perfume premium"
      ]
    },
    {
      name: "VIP",
      price: "S/. 550",
      period: "mensual",
      sessions: "8 sesiones",
      popular: false,
      features: [
        "2 servicios completos/semana",
        "Spa treatment mensual",
        "Terapia de hidratación",
        "Sesión de fotos profesional",
        "Kit de productos para casa",
        "Descuento 20% en servicios extra"
      ]
    }
  ];

  const benefits = [
    {
      icon: Truck,
      title: "Servicio a Domicilio",
      description: "Van equipado llega a tu puerta"
    },
    {
      icon: Clock,
      title: "Horarios Flexibles",
      description: "7 días a la semana, incluso feriados"
    },
    {
      icon: Shield,
      title: "Productos Premium",
      description: "Shampoos y tratamientos de alta gama"
    },
    {
      icon: Users,
      title: "Profesionales Certificados",
      description: "Más de 10 años de experiencia"
    }
  ];

  const stats = [
    { number: "500+", label: "Mascotas Felices" },
    { number: "4.9★", label: "Calificación" },
    { number: "24/7", label: "Disponibilidad" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" fill="currentColor" />
              </div>
              <div>
                <div className="font-bold text-lg">SmartPet</div>
              </div>
            </button>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Inicio</button>
              <button onClick={() => onNavigate('movilvet')} className="text-sm font-medium hover:text-primary transition-colors">MovilVet</button>
              <button className="text-sm font-medium text-primary">Peluquería</button>
              <button onClick={() => onNavigate('hoteleria')} className="text-sm font-medium hover:text-primary transition-colors">Hotelería</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Tienda</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Afiliaciones</button>
              <button onClick={() => onNavigate('adopcion')} className="text-sm font-medium hover:text-primary transition-colors">Adopción</button>
              <button onClick={() => onNavigate('paseos')} className="text-sm font-medium hover:text-primary transition-colors">Paseos</button>
              <button onClick={() => onNavigate('cursos')} className="text-sm font-medium hover:text-primary transition-colors">Cursos</button>
              <button onClick={() => onNavigate('trabaja')} className="text-sm font-medium hover:text-primary transition-colors">Trabaja con Nosotros</button>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <a href="tel:+5111234567" className="hidden xl:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                +51 (1) 123-4567
              </a>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Cita
              </Button>
              
              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-background to-primary/5 mt-16">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-4">
                <Badge className="bg-accent text-accent-foreground">
                  🚐 Servicio a Domicilio
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
                  Cuidado Profesional
                  <span className="text-primary"> Premium</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Para tu Mascota
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Servicios móviles de grooming premium con tecnología avanzada. 
                  Profesionales certificados y vehículos especializados para el máximo confort.
                </p>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Servicio a domicilio</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Horarios flexibles</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Profesionales certificados</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-transform text-lg px-8"
                >
                  Agendar Cita Ahora
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Llamar Ahora
                </Button>
              </div>

              {/* Social Proof */}
              <Card className="p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  {stats.map((stat, index) => (
                    <div key={index}>
                      <p className="text-2xl font-bold text-primary">{stat.number}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Image */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800&h=600&fit=crop" 
                  alt="Servicio de peluquería móvil para mascotas"
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
                  <p className="font-semibold">¡Próxima cita disponible!</p>
                  <p className="text-sm opacity-90">Hoy a las 3:00 PM</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary">
              ✂️ Nuestros Servicios
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Servicios de
              <span className="text-primary"> Peluquería Premium</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Atención especializada con productos de la más alta calidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-primary">{service.price}</span>
                      <span className="text-sm text-muted-foreground">{service.duration}</span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <p className="text-sm font-semibold">Incluye:</p>
                      {service.includes.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-600" />
                          {item}
                        </div>
                      ))}
                    </div>

                    <Button className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Paquetes */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-purple-100 text-purple-700">
              💎 Planes Mensuales
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Paquetes de
              <span className="text-primary"> Suscripción</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ahorra más con nuestros planes mensuales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative h-full ${pkg.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''}`}>
                  {pkg.popular && (
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                      Más Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-primary">{pkg.price}</span>
                      <span className="text-muted-foreground">/{pkg.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{pkg.sessions}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={pkg.popular ? 'default' : 'outline'}>
                      Seleccionar Plan
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Programa de Lealtad */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-purple-600/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-100 text-yellow-700">
              🎁 Programa de Lealtad
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Recompensas para
              <span className="text-primary"> Clientes Fieles</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mientras más visitas, más beneficios. Nuestro programa de lealtad te 
              premia por confiar en nosotros para el cuidado de tu mascota.
            </p>
          </div>

          {/* Loyalty Tiers */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
            {loyaltyTiers.map((tier, index) => {
              const IconComponent = tier.icon;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                >
                  <Card 
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                      tier.popular ? 'ring-2 ring-yellow-500 shadow-lg' : ''
                    }`}
                  >
                    {tier.popular && (
                      <Badge className="absolute top-4 right-4 bg-yellow-500 text-white z-10">
                        Más Popular
                      </Badge>
                    )}

                    <CardHeader className={`text-center ${tier.bgColor} pb-4`}>
                      <div className={`w-16 h-16 ${tier.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 shadow-md border-2 ${tier.borderColor}`}>
                        <IconComponent className={`w-8 h-8 ${tier.color}`} />
                      </div>
                      <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{tier.visits}</p>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-primary">{tier.discount}</span>
                        <span className="text-muted-foreground"> descuento</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-6">
                      <ul className="space-y-3">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start text-sm">
                            <Trophy className="w-4 h-4 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Current Offers */}
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-center">Ofertas Especiales</h3>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {currentOffers.map((offer, index) => (
                <motion.div
                  key={offer.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-primary/5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">{offer.title}</CardTitle>
                        <Badge className="bg-yellow-500 text-white font-bold text-lg px-3 py-1">
                          {offer.discount}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4">
                      <p className="text-muted-foreground">{offer.description}</p>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        Válido hasta: {offer.validUntil}
                      </div>
                      
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition-transform">
                        Usar Oferta
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <Card className="inline-block p-8 shadow-lg bg-gradient-to-r from-primary/5 to-purple-600/5">
              <div className="space-y-4">
                <Percent className="w-12 h-12 text-yellow-500 mx-auto" />
                <h4 className="text-2xl font-bold">
                  ¡Únete al Programa de Lealtad!
                </h4>
                <p className="text-muted-foreground max-w-md">
                  Registra tu primera cita y comienza a acumular beneficios inmediatamente.
                </p>
                <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition-transform">
                  Registrarme Ahora
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Lo Que Dicen Nuestros Clientes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              500+ mascotas felices y tutores satisfechos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Laura Martínez",
                pet: "Princesa (Poodle)",
                comment: "El servicio a domicilio es increíble. Princesa queda hermosa y ya no se estresa con el transporte.",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
                rating: 5
              },
              {
                name: "Roberto Sánchez",
                pet: "Thor (Husky)",
                comment: "El deslanado que le hacen a Thor es espectacular. Los profesionales son muy atentos y cuidadosos.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
                rating: 5
              },
              {
                name: "Carmen López",
                pet: "Mimi (Persa)",
                comment: "El spa completo es una maravilla. Mimi sale como una reina y huele delicioso por días.",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
                    />
                    <h3 className="font-bold mb-1">{testimonial.name}</h3>
                    <p className="text-sm text-primary mb-3">{testimonial.pet}</p>
                    
                    <div className="flex justify-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground italic">
                      "{testimonial.comment}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Scissors className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para Agendar?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-light">
              Dale a tu mascota el cuidado premium que se merece
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-12 h-14 bg-white text-primary hover:bg-white/90 shadow-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Cita Ahora
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-12 h-14 border-2 border-white text-white hover:bg-white hover:text-primary">
                <Phone className="w-5 h-5 mr-2" />
                Llamar: +51 123-4567
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}