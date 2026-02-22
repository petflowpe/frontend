import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Footer from '../components/Footer';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { 
  Heart, 
  Phone,
  MapPin,
  Clock,
  Menu,
  X,
  PawPrint,
  Calendar,
  ArrowLeft,
  Check,
  Star,
  Users,
  Shield,
  Timer,
  MapPinned
} from 'lucide-react';

interface PaseosPageProps {
  onNavigate: (page: 'home' | 'adopcion' | 'paseos' | 'cursos') => void;
}

export default function PaseosPage({ onNavigate }: PaseosPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const plans = [
    {
      name: "Paseo Individual",
      duration: "30 minutos",
      price: "S/. 25",
      features: [
        "1 mascota",
        "Paseador certificado",
        "Reporte con fotos",
        "Seguro incluido"
      ]
    },
    {
      name: "Paseo Extendido",
      duration: "60 minutos",
      price: "S/. 40",
      popular: true,
      features: [
        "1 mascota",
        "Paseador certificado",
        "Reporte con fotos y video",
        "Seguro incluido",
        "Juego en el parque"
      ]
    },
    {
      name: "Paseo Grupal",
      duration: "45 minutos",
      price: "S/. 30",
      features: [
        "Hasta 3 mascotas",
        "Paseador certificado",
        "Socialización",
        "Reporte con fotos",
        "Seguro incluido"
      ]
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Paseadores Certificados",
      description: "Personal capacitado en primeros auxilios y manejo animal"
    },
    {
      icon: MapPinned,
      title: "Seguimiento GPS",
      description: "Rastrea el recorrido de tu mascota en tiempo real"
    },
    {
      icon: Clock,
      title: "Horarios Flexibles",
      description: "Disponible de 6:00 AM a 8:00 PM todos los días"
    },
    {
      icon: Star,
      title: "Reporte Detallado",
      description: "Fotos y resumen de cada paseo directamente en tu correo"
    }
  ];

  const testimonials = [
    {
      name: "María González",
      pet: "Max (Golden Retriever)",
      rating: 5,
      comment: "Excelente servicio. Max siempre regresa feliz y cansado. Los paseadores son muy profesionales.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    },
    {
      name: "Carlos Ramírez",
      pet: "Luna (Labrador)",
      rating: 5,
      comment: "Me encanta el reporte con fotos que envían después de cada paseo. Luna adora a su paseador.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    {
      name: "Ana Torres",
      pet: "Rocky (Beagle)",
      rating: 5,
      comment: "Muy confiable y puntuales. Rocky ha mejorado mucho su comportamiento gracias a los paseos regulares.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    }
  ];

  const faqs = [
    {
      question: "¿Cuántas veces por semana debo sacar a pasear a mi perro?",
      answer: "Lo ideal es al menos 1-2 paseos diarios de 30 minutos. Los perros de razas más activas pueden necesitar más ejercicio."
    },
    {
      question: "¿Qué pasa si mi perro no se lleva bien con otros perros?",
      answer: "Ofrecemos paseos individuales para perros que prefieren caminar solos. Nuestros paseadores están capacitados para manejar diferentes temperamentos."
    },
    {
      question: "¿Puedo cambiar el horario de los paseos?",
      answer: "Sí, puedes modificar los horarios con 2 horas de anticipación a través de nuestra app o llamando directamente."
    },
    {
      question: "¿Qué medidas de seguridad tienen?",
      answer: "Todos nuestros paseadores están certificados, usan correas de seguridad, y tienen seguro. Además, los perros llevan GPS durante el paseo."
    }
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
                <div className="font-bold text-lg">VetCare<span className="text-primary">+</span></div>
                <div className="text-xs text-muted-foreground">Clínica 24/7</div>
              </div>
            </button>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Inicio</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Clínica</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Peluquería</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Hotelería</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Tienda</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Afiliaciones</button>
              <button onClick={() => onNavigate('adopcion')} className="text-sm font-medium hover:text-primary transition-colors">Adopción</button>
              <button className="text-sm font-medium text-primary">Paseos</button>
              <button onClick={() => onNavigate('cursos')} className="text-sm font-medium hover:text-primary transition-colors">Cursos</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Trabaja con Nosotros</button>
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
            src="https://images.unsplash.com/photo-1616420486543-9d94ce1af95b?w=1920&h=1080&fit=crop" 
            alt="Perro paseando en el parque"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/95 to-lime-500/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PawPrint className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Servicio de Paseos Profesional
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light">
              Mantén a tu mascota activa, feliz y saludable con nuestros paseadores certificados
            </p>
          </motion.div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por Qué Elegirnos?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              La mejor opción para el ejercicio y bienestar de tu mascota
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
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
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Planes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a las necesidades de tu mascota
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden h-full border-2 transition-all hover:shadow-xl ${
                  plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border/50'
                }`}>
                  {plan.popular && (
                    <div className="bg-primary text-white text-center py-2 text-sm font-semibold">
                      Más Popular
                    </div>
                  )}
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-sm text-muted-foreground mb-4">{plan.duration}</div>
                    <div className="text-4xl font-bold text-primary mb-6">{plan.price}</div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      Reservar Ahora
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              ¿Necesitas múltiples paseos por semana?
            </p>
            <Button variant="outline" size="lg">
              Ver Planes Mensuales (20% descuento)
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Lo Que Dicen Nuestros Clientes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Miles de mascotas felices y dueños satisfechos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border border-border/50 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.pet}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 mb-3">
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

      {/* Cómo Funciona */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo Funciona?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, title: "Reserva", desc: "Elige fecha, hora y plan de paseo" },
              { step: 2, title: "Confirmación", desc: "Asignamos un paseador certificado" },
              { step: 3, title: "Recogida", desc: "El paseador llega a tu domicilio" },
              { step: 4, title: "Reporte", desc: "Recibe fotos y resumen del paseo" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preguntas Frecuentes */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-bold mb-2">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-amber-600 to-lime-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <PawPrint className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para el Primer Paseo?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-light">
              Dale a tu mascota el ejercicio y diversión que se merece
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-12 h-14 bg-white text-amber-600 hover:bg-white/90 shadow-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Reservar Paseo
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-12 h-14 border-2 border-white text-white hover:bg-white hover:text-amber-600">
                <Phone className="w-5 h-5 mr-2" />
                Contactar
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