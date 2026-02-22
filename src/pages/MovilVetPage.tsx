import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Footer from '../components/Footer';
import { 
  Heart, 
  Phone,
  MapPin,
  Clock,
  Menu,
  X,
  Truck,
  Calendar,
  Check,
  Star,
  Syringe,
  Stethoscope,
  FlaskConical,
  ClipboardCheck,
  Home,
  Shield,
  Timer,
  Sparkles,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  Package
} from 'lucide-react';

interface MovilVetPageProps {
  onNavigate: (page: 'home' | 'adopcion' | 'paseos' | 'cursos' | 'hoteleria' | 'trabaja' | 'movilvet') => void;
}

export default function MovilVetPage({ onNavigate }: MovilVetPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const services = [
    {
      icon: Syringe,
      title: "Vacunación a Domicilio",
      description: "Aplicación de todas las vacunas necesarias en la comodidad de tu hogar",
      duration: "30 min",
      price: "S/. 80",
      includes: [
        "Evaluación previa del estado de salud",
        "Aplicación de vacuna",
        "Cartilla de vacunación actualizada",
        "Recomendaciones post-vacunación",
        "Seguimiento vía WhatsApp 24h"
      ]
    },
    {
      icon: Stethoscope,
      title: "Consulta Veterinaria",
      description: "Revisión completa y diagnóstico profesional sin salir de casa",
      duration: "45 min",
      price: "S/. 120",
      includes: [
        "Examen físico completo",
        "Evaluación de signos vitales",
        "Diagnóstico preliminar",
        "Plan de tratamiento",
        "Receta médica",
        "Seguimiento por 7 días"
      ]
    },
    {
      icon: FlaskConical,
      title: "Exámenes de Laboratorio",
      description: "Toma de muestras y análisis básicos en tu domicilio",
      duration: "20 min",
      price: "S/. 150",
      includes: [
        "Toma de muestra a domicilio",
        "Análisis en laboratorio certificado",
        "Resultados en 24-48 horas",
        "Interpretación de resultados",
        "Consulta de seguimiento incluida"
      ]
    },
    {
      icon: ClipboardCheck,
      title: "Chequeo Preventivo",
      description: "Control de salud integral para prevenir enfermedades",
      duration: "60 min",
      price: "S/. 180",
      includes: [
        "Examen físico completo",
        "Evaluación dental",
        "Revisión de piel y pelaje",
        "Control de peso y nutrición",
        "Plan de salud preventiva",
        "Informe detallado"
      ]
    },
    {
      icon: Package,
      title: "Desparasitación",
      description: "Eliminación de parásitos internos y externos",
      duration: "30 min",
      price: "S/. 70",
      includes: [
        "Evaluación parasitaria",
        "Desparasitante interno",
        "Desparasitante externo",
        "Calendario de desparasitación",
        "Recomendaciones de higiene"
      ]
    },
    {
      icon: Sparkles,
      title: "Atención Geriátrica",
      description: "Cuidados especiales para mascotas mayores",
      duration: "60 min",
      price: "S/. 200",
      includes: [
        "Evaluación geriátrica completa",
        "Chequeo de movilidad y dolor",
        "Análisis de calidad de vida",
        "Plan de cuidados personalizado",
        "Suplementación recomendada",
        "Seguimiento mensual"
      ]
    }
  ];

  const benefits = [
    {
      icon: Home,
      title: "En Tu Domicilio",
      description: "Evita el estrés del transporte y las salas de espera"
    },
    {
      icon: Timer,
      title: "Ahorra Tiempo",
      description: "Agenda tu cita y nosotros vamos hasta ti"
    },
    {
      icon: Shield,
      title: "Atención Personalizada",
      description: "Tiempo exclusivo para tu mascota sin distracciones"
    },
    {
      icon: Truck,
      title: "Equipamiento Completo",
      description: "Llevamos todo lo necesario para la atención"
    },
    {
      icon: Clock,
      title: "Horarios Flexibles",
      description: "Disponibilidad de lunes a domingo"
    },
    {
      icon: Award,
      title: "Profesionales Certificados",
      description: "Veterinarios con años de experiencia"
    }
  ];

  const coverage = [
    "Miraflores", "San Isidro", "Barranco", "Surco", "La Molina",
    "San Borja", "Jesús María", "Lince", "Pueblo Libre", "Magdalena",
    "San Miguel", "Chorrillos", "Surquillo"
  ];

  const faqs = [
    {
      question: "¿Qué áreas cubren?",
      answer: "Atendemos en todos los distritos de Lima Moderna y algunos distritos adicionales. Consulta disponibilidad para tu zona."
    },
    {
      question: "¿Qué necesito preparar?",
      answer: "Solo necesitas tener un espacio tranquilo y limpio. Nosotros llevamos todo el equipamiento médico necesario."
    },
    {
      question: "¿Cuánto tiempo tarda en llegar el veterinario?",
      answer: "Una vez confirmada tu cita, el veterinario llegará en la hora programada. En casos de emergencia, podemos atender en menos de 2 horas."
    },
    {
      question: "¿Qué pasa si mi mascota está muy nerviosa?",
      answer: "Nuestros veterinarios están capacitados en manejo de estrés. La atención a domicilio suele ser menos estresante para las mascotas."
    },
    {
      question: "¿Puedo agendar para el mismo día?",
      answer: "Sí, sujeto a disponibilidad. Recomendamos agendar con 24 horas de anticipación para garantizar tu horario preferido."
    }
  ];

  const stats = [
    { number: "5,000+", label: "Visitas Realizadas" },
    { number: "4.9/5", label: "Calificación" },
    { number: "98%", label: "Satisfacción" },
    { number: "24/7", label: "Soporte" }
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
              <button className="text-sm font-medium text-primary">MovilVet</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Peluquería</button>
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
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setShowBookingForm(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Visita
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
            src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1920&h=1080&fit=crop" 
            alt="Veterinario móvil"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700/95 to-cyan-600/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Truck className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              MovilVet - Veterinaria a Domicilio
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light">
              Atención veterinaria profesional en la comodidad de tu hogar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 h-14 bg-white text-blue-700 hover:bg-white/90" onClick={() => setShowBookingForm(true)}>
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Visita Ahora
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 border-2 border-white text-white hover:bg-white hover:text-blue-700">
                <Phone className="w-5 h-5 mr-2" />
                Llamar: +51 123-4567
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

      {/* Beneficios */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por Qué Elegir MovilVet?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              La mejor atención veterinaria sin salir de casa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Servicios a Domicilio</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Atención veterinaria completa sin salir de tu hogar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-border/50 hover:border-primary/50 transition-all hover:shadow-xl h-full flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <service.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{service.price}</div>
                        <div className="text-xs text-muted-foreground">{service.duration}</div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                    
                    <div className="mb-6 flex-1">
                      <p className="text-sm font-semibold mb-2">Incluye:</p>
                      <ul className="space-y-2">
                        {service.includes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setSelectedService(service.title);
                        setShowBookingForm(true);
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar {service.title}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cobertura */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Zonas de Cobertura</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Atendemos en toda Lima Moderna y alrededores
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {coverage.map((district, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{district}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    ¿Tu distrito no está en la lista? Contáctanos para consultar disponibilidad
                  </p>
                  <Button variant="outline">
                    <Phone className="w-4 h-4 mr-2" />
                    Consultar Cobertura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo Funciona?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, rápido y conveniente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: 1, title: "Agenda", desc: "Elige servicio, fecha y hora", icon: Calendar },
              { step: 2, title: "Confirmamos", desc: "Recibes confirmación al instante", icon: CheckCircle2 },
              { step: 3, title: "Visitamos", desc: "El veterinario llega a tu casa", icon: Truck },
              { step: 4, title: "Atención", desc: "Servicio profesional completo", icon: Stethoscope }
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Lo Que Dicen Nuestros Clientes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Miles de mascotas atendidas con éxito
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "María González",
                pet: "Luna (Gato)",
                comment: "Excelente servicio! El veterinario fue muy profesional y Luna estuvo tranquila en casa. Sin duda volveré a llamarlos.",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
                rating: 5
              },
              {
                name: "Carlos Pérez",
                pet: "Max (Golden)",
                comment: "La vacunación a domicilio fue súper conveniente. Ahorramos tiempo y Max no se estresó como en la clínica.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
                rating: 5
              },
              {
                name: "Ana Torres",
                pet: "Coco (Schnauzer)",
                comment: "Los exámenes de laboratorio fueron rápidos y profesionales. Muy recomendado para mascotas nerviosas.",
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

      {/* FAQs */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Resolvemos tus dudas sobre MovilVet
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-2 flex items-start gap-2">
                      <span className="text-primary">Q:</span>
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground pl-6">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Truck className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para Agendar?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-light">
              Dale a tu mascota la atención que merece en la comodidad de tu hogar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-12 h-14 bg-white text-blue-700 hover:bg-white/90 shadow-lg" onClick={() => setShowBookingForm(true)}>
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Visita Ahora
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-12 h-14 border-2 border-white text-white hover:bg-white hover:text-blue-700">
                <Phone className="w-5 h-5 mr-2" />
                Llamar: +51 123-4567
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal de Agendamiento Simple */}
      {showBookingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowBookingForm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Agendar Visita</h3>
              <button onClick={() => setShowBookingForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedService && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Servicio seleccionado:</p>
                <p className="font-semibold text-primary">{selectedService}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <p className="text-center text-muted-foreground">
                Para agendar tu visita a domicilio, por favor llámanos o escríbenos por WhatsApp
              </p>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full h-12">
                  <Phone className="w-5 h-5 mr-2" />
                  Llamar: +51 (1) 123-4567
                </Button>
                <Button size="lg" variant="outline" className="w-full h-12">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </Button>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Horarios de atención: Lunes a Domingo, 8:00 AM - 8:00 PM
            </p>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
}