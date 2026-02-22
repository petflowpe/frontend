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
  Hotel,
  Calendar,
  Check,
  Star,
  Camera,
  Wifi,
  Thermometer,
  Utensils,
  ShowerHead,
  Dumbbell,
  Shield,
  Video,
  Sparkles,
  Users,
  Award,
  ArrowRight
} from 'lucide-react';

interface HoteleriaPageProps {
  onNavigate: (page: 'home' | 'adopcion' | 'paseos' | 'cursos' | 'hoteleria' | 'trabaja') => void;
}

export default function HoteleriaPage({ onNavigate }: HoteleriaPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'estandar' | 'premium' | 'vip'>('premium');

  const plans = [
    {
      id: 'estandar',
      name: "Estándar",
      price: "S/. 45",
      period: "por noche",
      description: "Cuidado esencial para tu mascota",
      features: [
        "Habitación compartida climatizada",
        "2 comidas al día (balanceado premium)",
        "1 paseo diario de 20 minutos",
        "Supervisión 24/7",
        "Área de juegos común",
        "Actualización diaria vía WhatsApp"
      ],
      popular: false
    },
    {
      id: 'premium',
      name: "Premium",
      price: "S/. 85",
      period: "por noche",
      description: "Confort y atención personalizada",
      features: [
        "Habitación privada climatizada",
        "3 comidas al día personalizadas",
        "2 paseos diarios de 30 minutos",
        "Supervisión veterinaria 24/7",
        "Sesión de juegos y socialización",
        "Baño semanal incluido",
        "Fotos y videos diarios",
        "Área VIP con juguetes premium"
      ],
      popular: true
    },
    {
      id: 'vip',
      name: "VIP Suite",
      price: "S/. 150",
      period: "por noche",
      description: "Experiencia de lujo para mascotas exigentes",
      features: [
        "Suite de lujo con jardín privado",
        "Alimentación gourmet personalizada",
        "3 paseos premium + actividades",
        "Médico veterinario asignado",
        "Sesiones de spa y masajes",
        "Entrenamiento y estimulación mental",
        "Cámara en vivo 24/7",
        "Servicio de grooming completo",
        "Juguetes y accesorios de lujo",
        "Reporte médico detallado"
      ],
      popular: false
    }
  ];

  const facilities = [
    {
      icon: Thermometer,
      title: "Clima Controlado",
      description: "Habitaciones con temperatura perfecta todo el año"
    },
    {
      icon: Camera,
      title: "Monitoreo 24/7",
      description: "Cámaras de seguridad en todas las áreas"
    },
    {
      icon: Utensils,
      title: "Alimentación Premium",
      description: "Comida de alta calidad adaptada a cada mascota"
    },
    {
      icon: ShowerHead,
      title: "Spa & Grooming",
      description: "Servicios de baño y estética disponibles"
    },
    {
      icon: Dumbbell,
      title: "Área de Ejercicios",
      description: "Espacios amplios para actividad física"
    },
    {
      icon: Shield,
      title: "Atención Veterinaria",
      description: "Personal médico disponible las 24 horas"
    },
    {
      icon: Video,
      title: "Videollamadas",
      description: "Conecta con tu mascota cuando quieras"
    },
    {
      icon: Wifi,
      title: "App Exclusiva",
      description: "Recibe actualizaciones en tiempo real"
    }
  ];

  const gallery = [
    {
      title: "Suites de Lujo",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop"
    },
    {
      title: "Área de Juegos",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop"
    },
    {
      title: "Jardines Privados",
      image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&h=400&fit=crop"
    },
    {
      title: "Zona de Descanso",
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=400&fit=crop"
    },
    {
      title: "Comedor Premium",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop"
    },
    {
      title: "Spa Canino",
      image: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&h=400&fit=crop"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Noches Hospedadas" },
    { number: "4.9", label: "Rating Promedio" },
    { number: "98%", label: "Clientes Satisfechos" },
    { number: "24/7", label: "Atención Continua" }
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
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Clínica</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Peluquería</button>
              <button className="text-sm font-medium text-primary">Hotelería</button>
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
                Reservar
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
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden mt-16">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&h=1080&fit=crop" 
            alt="Hotelería para mascotas"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-700/95 to-teal-600/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Hotel className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Hotel para Mascotas
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light">
              Un hogar lejos de casa con atención profesional, amor y diversión
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 h-14 bg-white text-green-700 hover:bg-white/90">
                <Calendar className="w-5 h-5 mr-2" />
                Reservar Ahora
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2 border-white text-white hover:bg-white hover:text-green-700">
                Ver Tour Virtual
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instalaciones */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestras Instalaciones</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Equipamiento de primera clase para el máximo confort
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {facilities.map((facility, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                      <facility.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-bold mb-2">{facility.title}</h3>
                    <p className="text-sm text-muted-foreground">{facility.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes de Hospedaje</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elige el plan perfecto para las necesidades de tu mascota
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative h-full border-2 ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border/50'} hover:shadow-2xl transition-all duration-300`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Más Popular
                      </span>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full h-12" 
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      Reservar {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-4">
              *Descuentos especiales por estancias largas (7+ noches)
            </p>
            <Button variant="link" className="text-primary">
              Ver condiciones y promociones
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Galería de Instalaciones</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conoce los espacios donde tu mascota se quedará
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {gallery.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative h-64 overflow-hidden rounded-lg cursor-pointer"
              >
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="font-bold text-lg">{item.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Proceso de Reserva */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo Funciona?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Proceso simple y rápido para reservar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: 1, title: "Reserva Online", desc: "Elige fechas y plan", icon: Calendar },
              { step: 2, title: "Visita Previa", desc: "Conoce las instalaciones", icon: Camera },
              { step: 3, title: "Check-in", desc: "Entrega a tu mascota", icon: Heart },
              { step: 4, title: "Disfruta", desc: "Recibe actualizaciones", icon: Sparkles }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                      {item.step}
                    </div>
                    <item.icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Opiniones de Nuestros Clientes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Lo que dicen los dueños de mascotas sobre nuestra hotelería
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Roberto Mendoza",
                pet: "Max (Golden Retriever)",
                comment: "Dejé a Max por una semana y volvió feliz. Las fotos diarias me dieron tranquilidad. ¡Excelente servicio!",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
                rating: 5
              },
              {
                name: "Patricia Silva",
                pet: "Luna (Gato Persa)",
                comment: "Las instalaciones son impecables y el personal es muy profesional. Luna estuvo muy bien cuidada.",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
                rating: 5
              },
              {
                name: "Carlos Ramírez",
                pet: "Rocky (Bulldog)",
                comment: "El plan VIP vale cada centavo. Rocky recibió atención de primera clase. Totalmente recomendado.",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
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
      <section className="py-24 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Hotel className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para Reservar?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-light">
              Dale a tu mascota las vacaciones que se merece mientras tú disfrutas las tuyas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-12 h-14 bg-white text-green-700 hover:bg-white/90 shadow-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Reservar Ahora
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-12 h-14 border-2 border-white text-white hover:bg-white hover:text-green-700">
                <Phone className="w-5 h-5 mr-2" />
                Consultar Disponibilidad
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}