import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import Footer from '../components/Footer';
import { Input } from '../components/ui/input';
import { 
  Heart, 
  Phone,
  MapPin,
  Clock,
  Menu,
  X,
  GraduationCap,
  Calendar,
  ArrowLeft,
  Check,
  Star,
  Users,
  BookOpen,
  Award,
  Video,
  FileText,
  Download
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  category: 'Básico' | 'Intermedio' | 'Avanzado' | 'Especialización' | 'Otro';
  duration: string;
  format: 'Presencial' | 'Online' | 'Híbrido';
  price: string;
  image: string;
  description: string;
  modules: number;
  students: number;
  rating: number;
  instructor: string;
  benefits: string[];
}

interface CursosPageProps {
  onNavigate: (page: 'home' | 'adopcion' | 'paseos' | 'cursos') => void;
}

export default function CursosPage({ onNavigate }: CursosPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Básico' | 'Intermedio' | 'Avanzado' | 'Especialización'>('all');

  const courses: Course[] = [
    {
      id: 1,
      title: "Primeros Auxilios para Mascotas",
      category: "Básico",
      duration: "8 horas",
      format: "Presencial",
      price: "S/. 250",
      image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&h=400&fit=crop",
      description: "Aprende a actuar en emergencias y salvar la vida de tu mascota",
      modules: 4,
      students: 450,
      rating: 4.9,
      instructor: "Dr. Carlos Mendoza",
      benefits: ["Certificado oficial", "Material incluido", "Práctica con simuladores"]
    },
    {
      id: 2,
      title: "Nutrición Canina Profesional",
      category: "Intermedio",
      duration: "12 horas",
      format: "Híbrido",
      price: "S/. 380",
      image: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&h=400&fit=crop",
      description: "Especialízate en la alimentación balanceada y planes nutricionales",
      modules: 6,
      students: 320,
      rating: 4.8,
      instructor: "Dra. Ana Silva",
      benefits: ["Certificado profesional", "Casos prácticos", "Asesoría online"]
    },
    {
      id: 3,
      title: "Grooming Profesional Avanzado",
      category: "Avanzado",
      duration: "40 horas",
      format: "Presencial",
      price: "S/. 1,200",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop",
      description: "Domina técnicas avanzadas de peluquería canina y felina",
      modules: 10,
      students: 180,
      rating: 5.0,
      instructor: "Mg. Patricia Rojas",
      benefits: ["Certificado internacional", "Kit de herramientas", "Prácticas reales"]
    },
    {
      id: 4,
      title: "Comportamiento y Adiestramiento",
      category: "Intermedio",
      duration: "16 horas",
      format: "Online",
      price: "S/. 450",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop",
      description: "Entiende el comportamiento animal y técnicas de adiestramiento positivo",
      modules: 8,
      students: 520,
      rating: 4.9,
      instructor: "Esp. Roberto Campos",
      benefits: ["Certificado", "Videos de referencia", "Comunidad privada"]
    },
    {
      id: 5,
      title: "Asistente Veterinario Certificado",
      category: "Especialización",
      duration: "80 horas",
      format: "Híbrido",
      price: "S/. 2,500",
      image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&h=400&fit=crop",
      description: "Programa completo para convertirte en asistente veterinario profesional",
      modules: 16,
      students: 95,
      rating: 5.0,
      instructor: "Dr. Luis Vargas",
      benefits: ["Título certificado", "Pasantías incluidas", "Bolsa de trabajo"]
    },
    {
      id: 6,
      title: "Cuidados de Mascotas Exóticas",
      category: "Especialización",
      duration: "20 horas",
      format: "Online",
      price: "S/. 680",
      image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&h=400&fit=crop",
      description: "Especialízate en el cuidado de aves, reptiles y pequeños mamíferos",
      modules: 8,
      students: 145,
      rating: 4.7,
      instructor: "Dra. Carmen López",
      benefits: ["Certificado", "Material digital", "Webinars mensuales"]
    }
  ];

  const filteredCourses = courses.filter(course => 
    selectedCategory === 'all' || course.category === selectedCategory
  );

  const benefits = [
    {
      icon: Award,
      title: "Certificación Oficial",
      description: "Recibe certificados avalados por instituciones reconocidas"
    },
    {
      icon: Users,
      title: "Instructores Expertos",
      description: "Aprende de veterinarios y profesionales con años de experiencia"
    },
    {
      icon: Video,
      title: "Material Multimedia",
      description: "Accede a videos, manuales y recursos descargables"
    },
    {
      icon: BookOpen,
      title: "Práctica Real",
      description: "Clases prácticas con casos reales y simulaciones"
    }
  ];

  const stats = [
    { number: "2,500+", label: "Estudiantes" },
    { number: "25+", label: "Cursos" },
    { number: "15+", label: "Instructores" },
    { number: "4.9", label: "Rating Promedio" }
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
              <button onClick={() => onNavigate('paseos')} className="text-sm font-medium hover:text-primary transition-colors">Paseos</button>
              <button className="text-sm font-medium text-primary">Cursos</button>
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
            src="https://images.unsplash.com/photo-1762783667040-0d38c74c75c3?w=1920&h=1080&fit=crop" 
            alt="Capacitación veterinaria"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700/95 to-indigo-600/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GraduationCap className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Cursos y Capacitaciones
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light">
              Aprende de los expertos y conviértete en un profesional del cuidado animal
            </p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por Qué Estudiar con Nosotros?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Educación de calidad con enfoque práctico y profesional
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

      {/* Filtros */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
            >
              Todos los Cursos
            </Button>
            <Button 
              variant={selectedCategory === 'Básico' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('Básico')}
            >
              Básico
            </Button>
            <Button 
              variant={selectedCategory === 'Intermedio' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('Intermedio')}
            >
              Intermedio
            </Button>
            <Button 
              variant={selectedCategory === 'Avanzado' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('Avanzado')}
            >
              Avanzado
            </Button>
            <Button 
              variant={selectedCategory === 'Especialización' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('Especialización')}
            >
              Especialización
            </Button>
          </div>
        </div>
      </section>

      {/* Catálogo de Cursos */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden h-full border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-xs font-semibold">
                      {course.format}
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-white rounded-full px-3 py-1 text-xs font-semibold">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    
                    <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.students}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold">{course.rating}</span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{course.description}</p>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Instructor: {course.instructor}</p>
                      <p className="text-xs text-muted-foreground">{course.modules} módulos</p>
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <ul className="space-y-1">
                        {course.benefits.slice(0, 2).map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Check className="w-3 h-3 text-green-600" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">{course.price}</div>
                      <Button size="sm">
                        Inscribirse
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Historias de Éxito</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Lo que dicen nuestros estudiantes graduados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "María Fernández",
                course: "Asistente Veterinario",
                comment: "Gracias al curso conseguí trabajo en una clínica veterinaria. El contenido es excelente y muy práctico.",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
              },
              {
                name: "Pedro Sánchez",
                course: "Grooming Profesional",
                comment: "Aprendí técnicas increíbles que aplico en mi propio negocio de peluquería canina.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
              },
              {
                name: "Laura Gutiérrez",
                course: "Nutrición Canina",
                comment: "Los instructores son expertos de verdad. Ahora asesoro a dueños de mascotas profesionalmente.",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
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
                    <p className="text-sm text-primary mb-3">{testimonial.course}</p>
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

      {/* Proceso de Inscripción */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Proceso de Inscripción</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: 1, title: "Elige tu Curso", desc: "Explora nuestro catálogo" },
              { step: 2, title: "Inscríbete", desc: "Completa el formulario" },
              { step: 3, title: "Realiza el Pago", desc: "Opciones flexibles" },
              { step: 4, title: "Comienza", desc: "Accede al contenido" }
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

      {/* CTA Section */}
      <section className="py-24 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GraduationCap className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para Comenzar?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-light">
              Invierte en tu educación y conviértete en un experto del cuidado animal
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-12 h-14 bg-white text-blue-700 hover:bg-white/90 shadow-lg">
                Ver Catálogo Completo
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-12 h-14 border-2 border-white text-white hover:bg-white hover:text-blue-700">
                <Phone className="w-5 h-5 mr-2" />
                Consultar Asesor
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