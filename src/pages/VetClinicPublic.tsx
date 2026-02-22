import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/auth/AuthModal';
import { ClientPortal } from '../components/client/ClientPortal';
import { AppointmentBooking } from '../components/public/AppointmentBooking';
import { 
  Stethoscope, 
  Scissors, 
  Hotel, 
  ShoppingBag, 
  Heart, 
  PawPrint,
  Clock,
  Shield,
  Users,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Calendar,
  Phone,
  MapPin,
  Menu,
  X,
  LogIn,
  User as UserIcon,
  Star
} from 'lucide-react';
import AdopcionPage from './AdopcionPage';
import PaseosPage from './PaseosPage';
import CursosPage from './CursosPage';
import HoteleriaPage from './HoteleriaPage';
import TrabajaPage from './TrabajaPage';
import MovilVetPage from './MovilVetPage';
import PeluqueriaPage from './PeluqueriaPage';

export default function VetClinicPublic() {
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showClientPortal, setShowClientPortal] = useState(false);
  const [showGuestBooking, setShowGuestBooking] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [currentPage, setCurrentPage] = useState<'home' | 'adopcion' | 'paseos' | 'cursos' | 'hoteleria' | 'trabaja' | 'movilvet' | 'peluqueria'>('home');

  // Si el usuario está autenticado y quiere ver su portal
  if (isAuthenticated && showClientPortal) {
    return <ClientPortal onNavigatePublic={setCurrentPage} />;
  }

  // Si estamos en una página específica, renderizarla
  if (currentPage === 'adopcion') {
    return <AdopcionPage onNavigate={setCurrentPage} />;
  }
  
  if (currentPage === 'paseos') {
    return <PaseosPage onNavigate={setCurrentPage} />;
  }
  
  if (currentPage === 'cursos') {
    return <CursosPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'hoteleria') {
    return <HoteleriaPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'trabaja') {
    return <TrabajaPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'movilvet') {
    return <MovilVetPage onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'peluqueria') {
    return <PeluqueriaPage onNavigate={setCurrentPage} />;
  }

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowClientPortal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowClientPortal(true);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const services = [
    {
      title: "Clínica Veterinaria",
      description: "Atención médica especializada 24/7 con las mejores tecnologías y profesionales.",
      icon: Stethoscope,
      image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&h=600&fit=crop",
      sectionId: "clinica",
      gradient: "from-blue-600 via-blue-500 to-blue-400"
    },
    {
      title: "Peluquería",
      description: "Servicios de grooming profesional para que tu mascota luzca hermosa y saludable.",
      icon: Scissors,
      image: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&h=600&fit=crop",
      sectionId: "peluqueria",
      gradient: "from-pink-600 via-pink-500 to-pink-400",
      navigateTo: "peluqueria" as const
    },
    {
      title: "Hotelería",
      description: "Hospedaje cómodo y seguro para tu mascota cuando necesites viajar.",
      icon: Hotel,
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop",
      sectionId: "hoteleria",
      gradient: "from-purple-600 via-purple-500 to-purple-400",
      navigateTo: "hoteleria" as const
    },
    {
      title: "Tienda",
      description: "Productos de calidad: alimentos, antipulgas y todo lo que tu mascota necesita.",
      icon: ShoppingBag,
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop",
      sectionId: "tienda",
      gradient: "from-emerald-600 via-teal-500 to-cyan-400"
    },
    {
      title: "Adopción",
      description: "Encuentra a tu nuevo mejor amigo. Mascotas esperando un hogar lleno de amor.",
      icon: Heart,
      image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop",
      sectionId: "adopcion",
      gradient: "from-rose-600 via-red-500 to-orange-400"
    },
    {
      title: "Paseos",
      description: "Servicio de paseo profesional para mantener a tu mascota activa y feliz.",
      icon: PawPrint,
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop",
      sectionId: "paseos",
      gradient: "from-amber-600 via-yellow-500 to-lime-400"
    },
  ];

  const features = [
    {
      icon: Clock,
      title: "Atención 24/7",
      description: "Disponibles todos los días del año para emergencias y consultas"
    },
    {
      icon: Shield,
      title: "Profesionales Certificados",
      description: "Equipo médico altamente calificado y con años de experiencia"
    },
    {
      icon: Users,
      title: "Atención Personalizada",
      description: "Cada mascota recibe cuidados únicos según sus necesidades"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" fill="currentColor" />
              </div>
              <div>
                <div className="font-bold text-lg">SmartPet</div>
              </div>
            </button>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => scrollToSection('home')} className="text-sm font-medium hover:text-primary transition-colors">Inicio</button>
              <button onClick={() => setCurrentPage('movilvet')} className="text-sm font-medium hover:text-primary transition-colors">MovilVet</button>
              <button onClick={() => setCurrentPage('peluqueria')} className="text-sm font-medium hover:text-primary transition-colors">Peluquería</button>
              <button onClick={() => setCurrentPage('hoteleria')} className="text-sm font-medium hover:text-primary transition-colors">Hotelería</button>
              <button onClick={() => scrollToSection('tienda')} className="text-sm font-medium hover:text-primary transition-colors">Tienda</button>
              <button onClick={() => scrollToSection('afiliaciones')} className="text-sm font-medium hover:text-primary transition-colors">Afiliaciones</button>
              <button onClick={() => setCurrentPage('adopcion')} className="text-sm font-medium hover:text-primary transition-colors">Adopción</button>
              <button onClick={() => setCurrentPage('paseos')} className="text-sm font-medium hover:text-primary transition-colors">Paseos</button>
              <button onClick={() => setCurrentPage('cursos')} className="text-sm font-medium hover:text-primary transition-colors">Cursos</button>
              <button onClick={() => setCurrentPage('trabaja')} className="text-sm font-medium hover:text-primary transition-colors">Trabaja con Nosotros</button>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <a href="tel:+5111234567" className="hidden xl:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                +51 (1) 123-4567
              </a>
              {!isAuthenticated && (
                <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(true)} className="hidden sm:flex">
                  Ingresar
                </Button>
              )}
              <Button 
                size="sm" 
                onClick={handleBookAppointment}
                className="bg-primary hover:bg-primary/90"
              >
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

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="flex flex-col gap-3">
                <a href="#servicios" className="text-sm font-medium hover:text-primary transition-colors">Servicios</a>
                <a href="#nosotros" className="text-sm font-medium hover:text-primary transition-colors">Nosotros</a>
                <a href="#contacto" className="text-sm font-medium hover:text-primary transition-colors">Contacto</a>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Hero Section */}
      <section id="home" className="relative h-[600px] flex items-center justify-center overflow-hidden mt-16">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1920&h=1080&fit=crop" 
            alt="Veterinaria profesional atendiendo a un perro"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Cuidado Veterinario 24/7
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light">
              Atención médica profesional para tus mascotas en cualquier momento del día
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleBookAppointment}
                className="text-lg px-10 h-14 bg-white text-primary hover:bg-white/90 shadow-lg"
              >
                Reservar Cita
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-10 h-14 border-2 border-white text-white hover:bg-white hover:text-primary"
                onClick={() => scrollToSection('servicios')}
              >
                Ver Servicios
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-lg flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "10,000+", label: "Mascotas Atendidas" },
              { number: "15+", label: "Años de Experiencia" },
              { number: "50+", label: "Especialistas" },
              { number: "24/7", label: "Atención Médica" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-sm md:text-base opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="servicios" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Nuestros Servicios</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ofrecemos una amplia gama de servicios para el bienestar integral de tu mascota
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => service.navigateTo ? setCurrentPage(service.navigateTo) : scrollToSection(service.sectionId)}
              >
                <Card className="overflow-hidden h-full border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                        <service.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-semibold mb-3 group-hover:text-primary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                    <span className="inline-flex items-center text-primary font-medium">
                      Conoce más
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tienda Preview Section */}
      <section id="tienda" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tienda Veterinaria</h2>
              <p className="text-xl text-muted-foreground">
                Los mejores productos para la salud y felicidad de tu mascota
              </p>
            </div>
            <Button variant="outline" className="mt-4 md:mt-0">
              Ver Todo el Catálogo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: "Alimento Premium Perro", price: "S/. 240.00", image: "https://images.unsplash.com/photo-1589924691195-41432c84c161?w=400&h=400&fit=crop", tag: "Nutrición" },
              { name: "Pipeta Antipulgas", price: "S/. 45.00", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop", tag: "Salud" },
              { name: "Cama Ortopédica", price: "S/. 180.00", image: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=400&h=400&fit=crop", tag: "Confort" },
              { name: "Juguete Interactivo", price: "S/. 35.00", image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=400&fit=crop", tag: "Juguetes" }
            ].map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-white/90 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        {product.tag}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{product.name}</h3>
                    <p className="text-primary font-bold">{product.price}</p>
                    <Button size="sm" className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Añadir al Carrito
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section id="afiliaciones" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Más Servicios</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="cursor-pointer"
              onClick={() => scrollToSection('afiliaciones')}
            >
              <Card className="border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Afiliaciones</h3>
                  <p className="text-muted-foreground">Planes de salud para tu mascota</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="cursor-pointer"
              onClick={() => setCurrentPage('cursos')}
            >
              <Card className="border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Cursos</h3>
                  <p className="text-muted-foreground">Capacitación en cuidado animal</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="cursor-pointer"
              onClick={() => scrollToSection('trabajo')}
            >
              <Card className="border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Trabaja con Nosotros</h3>
                  <p className="text-muted-foreground">Únete a nuestro equipo</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Lo Que Dicen Nuestros Clientes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Historias reales de mascotas felices y dueños satisfechos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sofía M.",
                pet: "Bobby (Pug)",
                comment: "Salvaron la vida de Bobby cuando tuvo una emergencia en la madrugada. La atención 24/7 es real y el equipo es increíble.",
                image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
                rating: 5
              },
              {
                name: "Jorge R.",
                pet: "Kira (Pastor)",
                comment: "La peluquería es excelente, Kira siempre sale feliz y hermosa. Muy pacientes con perros grandes.",
                image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=150&h=150&fit=crop",
                rating: 5
              },
              {
                name: "Ana P.",
                pet: "Michi (Gato)",
                comment: "El servicio de hotelería me dio mucha tranquilidad durante mi viaje. Me enviaban fotos todos los días.",
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
                <Card className="h-full">
                  <CardContent className="p-8 text-center flex flex-col h-full">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-6 border-4 border-background shadow-md"
                    />
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic mb-6 flex-grow">
                      "{testimonial.comment}"
                    </p>
                    <div>
                      <h3 className="font-bold text-lg">{testimonial.name}</h3>
                      <p className="text-primary text-sm font-medium">{testimonial.pet}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para cuidar de tu mascota?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-light">
              Agenda tu cita hoy y dale a tu mascota el cuidado que merece
            </p>
            <Button 
              size="lg" 
              onClick={handleBookAppointment}
              className="text-lg px-12 h-14 bg-white text-primary hover:bg-white/90 shadow-lg"
            >
              Reservar Ahora
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          onGuestBook={() => setShowGuestBooking(true)}
          defaultMode={authMode}
        />
      )}

      {/* Reserva como invitado (sin login) */}
      <AppointmentBooking
        isOpen={showGuestBooking}
        onClose={() => setShowGuestBooking(false)}
        currentUser={{ id: 'guest', name: 'Invitado', email: '' }}
      />
    </div>
  );
}