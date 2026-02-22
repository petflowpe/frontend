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
  Briefcase,
  Calendar,
  Upload,
  Users,
  TrendingUp,
  Award,
  Coffee,
  GraduationCap,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

interface TrabajaPageProps {
  onNavigate: (page: 'home' | 'adopcion' | 'paseos' | 'cursos' | 'hoteleria' | 'trabaja') => void;
}

export default function TrabajaPage({ onNavigate }: TrabajaPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    posicion: '',
    mensaje: ''
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de envío
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        posicion: '',
        mensaje: ''
      });
      setCvFile(null);
    }, 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Crecimiento Profesional",
      description: "Oportunidades de desarrollo y capacitación constante"
    },
    {
      icon: Users,
      title: "Ambiente Colaborativo",
      description: "Trabaja con un equipo apasionado y profesional"
    },
    {
      icon: Award,
      title: "Reconocimiento",
      description: "Valoramos y premiamos el buen desempeño"
    },
    {
      icon: Coffee,
      title: "Work-Life Balance",
      description: "Horarios flexibles y beneficios adicionales"
    },
    {
      icon: GraduationCap,
      title: "Formación Continua",
      description: "Acceso a cursos y certificaciones gratuitas"
    },
    {
      icon: HeartHandshake,
      title: "Impacto Real",
      description: "Contribuye al bienestar de miles de mascotas"
    }
  ];

  const values = [
    {
      title: "Pasión por los Animales",
      description: "Amamos lo que hacemos y nos dedicamos al cuidado animal con vocación",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Excelencia Profesional",
      description: "Buscamos la mejora continua y los más altos estándares de calidad",
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Trabajo en Equipo",
      description: "Creemos en la colaboración y el apoyo mutuo para lograr objetivos",
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Innovación",
      description: "Adoptamos nuevas tecnologías y métodos para mejorar nuestros servicios",
      color: "bg-orange-100 text-orange-700"
    }
  ];

  const positions = [
    "Médico Veterinario",
    "Asistente Veterinario",
    "Peluquero Canino",
    "Recepcionista",
    "Cuidador de Mascotas",
    "Administrador",
    "Marketing Digital",
    "Atención al Cliente",
    "Otro"
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
              <button onClick={() => onNavigate('hoteleria')} className="text-sm font-medium hover:text-primary transition-colors">Hotelería</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Tienda</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Afiliaciones</button>
              <button onClick={() => onNavigate('adopcion')} className="text-sm font-medium hover:text-primary transition-colors">Adopción</button>
              <button onClick={() => onNavigate('paseos')} className="text-sm font-medium hover:text-primary transition-colors">Paseos</button>
              <button onClick={() => onNavigate('cursos')} className="text-sm font-medium hover:text-primary transition-colors">Cursos</button>
              <button className="text-sm font-medium text-primary">Trabaja con Nosotros</button>
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
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&h=1080&fit=crop" 
            alt="Equipo veterinario"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/95 to-purple-600/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Briefcase className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Trabaja con Nosotros
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light">
              Únete a un equipo apasionado por el bienestar animal y crece profesionalmente
            </p>
          </motion.div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Por Qué Trabajar en VetCare+?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ofrecemos un ambiente de trabajo excepcional con beneficios únicos
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

      {/* Valores */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Valores</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Estos son los principios que guían nuestro trabajo diario
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 mb-4 rounded-lg flex items-center justify-center ${value.color}`}>
                      <Heart className="w-6 h-6" fill="currentColor" />
                    </div>
                    <h3 className="font-bold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Envía tu Postulación</h2>
              <p className="text-xl text-muted-foreground">
                Completa el formulario y adjunta tu CV. Nos pondremos en contacto contigo pronto
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">¡Postulación Enviada!</h3>
                <p className="text-muted-foreground mb-6">
                  Gracias por tu interés. Revisaremos tu CV y nos comunicaremos contigo pronto.
                </p>
              </motion.div>
            ) : (
              <Card className="border-2 border-border/50">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nombre Completo */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nombre Completo <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Ej: Juan Pérez García"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="tu.email@ejemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        placeholder="+51 999 999 999"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>

                    {/* Posición de Interés */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Posición de Interés <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.posicion}
                        onChange={(e) => setFormData({ ...formData, posicion: e.target.value })}
                        required
                        className="w-full h-12 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="">Selecciona una posición</option>
                        {positions.map((position) => (
                          <option key={position} value={position}>
                            {position}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mensaje Opcional */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Mensaje (Opcional)
                      </label>
                      <textarea
                        placeholder="Cuéntanos por qué te gustaría trabajar con nosotros..."
                        value={formData.mensaje}
                        onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
                      />
                    </div>

                    {/* Adjuntar CV */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Adjuntar CV <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          required
                          className="hidden"
                          id="cv-upload"
                        />
                        <label htmlFor="cv-upload" className="cursor-pointer">
                          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                          {cvFile ? (
                            <div>
                              <p className="font-medium text-primary">{cvFile.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Click para cambiar archivo
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">Click para adjuntar tu CV</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                PDF, DOC o DOCX (máx. 5MB)
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-14 text-lg"
                    >
                      <Briefcase className="w-5 h-5 mr-2" />
                      Enviar Postulación
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Al enviar este formulario, aceptas nuestros términos de privacidad y el tratamiento de tus datos personales.
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestro Equipo Opina</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conoce las experiencias de quienes ya trabajan con nosotros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Dra. Andrea Morales",
                role: "Médico Veterinario",
                comment: "Trabajar en VetCare+ ha sido la mejor decisión de mi carrera. El equipo es excepcional y aprendo algo nuevo cada día.",
                image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop"
              },
              {
                name: "Carlos Ramos",
                role: "Peluquero Canino",
                comment: "El ambiente de trabajo es increíble. Me siento valorado y tengo todas las herramientas para hacer mi trabajo de la mejor manera.",
                image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop"
              },
              {
                name: "Sofía Martínez",
                role: "Recepcionista",
                comment: "VetCare+ no es solo un trabajo, es una familia. Los beneficios son excelentes y el trato es muy humano.",
                image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop"
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
                    <p className="text-sm text-primary mb-3">{testimonial.role}</p>
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
      <section className="py-24 bg-gradient-to-r from-indigo-700 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Users className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Tienes Dudas?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-light">
              Contáctanos y con gusto resolveremos todas tus preguntas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-12 h-14 bg-white text-indigo-700 hover:bg-white/90 shadow-lg">
                <Phone className="w-5 h-5 mr-2" />
                Llamar Ahora
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