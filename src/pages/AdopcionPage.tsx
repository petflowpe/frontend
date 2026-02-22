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
  Calendar,
  Search,
  Filter,
  ArrowLeft,
  Check,
  Star
} from 'lucide-react';

interface Pet {
  id: number;
  name: string;
  breed: string;
  age: string;
  gender: 'Macho' | 'Hembra';
  size: 'Pequeño' | 'Mediano' | 'Grande';
  image: string;
  description: string;
  vaccinated: boolean;
  sterilized: boolean;
  personality: string[];
}

interface AdopcionPageProps {
  onNavigate: (page: 'home' | 'adopcion' | 'paseos' | 'cursos' | 'hoteleria' | 'trabaja' | 'movilvet') => void;
}

export default function AdopcionPage({ onNavigate }: AdopcionPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Pequeño' | 'Mediano' | 'Grande'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const pets: Pet[] = [
    {
      id: 1,
      name: "Luna",
      breed: "Golden Retriever",
      age: "2 años",
      gender: "Hembra",
      size: "Grande",
      image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=600&h=600&fit=crop",
      description: "Luna es una perra dulce y cariñosa que ama jugar y dar paseos.",
      vaccinated: true,
      sterilized: true,
      personality: ["Amigable", "Activa", "Sociable"]
    },
    {
      id: 2,
      name: "Max",
      breed: "Labrador Mix",
      age: "3 años",
      gender: "Macho",
      size: "Grande",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop",
      description: "Max es muy juguetón y le encanta estar con niños.",
      vaccinated: true,
      sterilized: true,
      personality: ["Juguetón", "Leal", "Inteligente"]
    },
    {
      id: 3,
      name: "Mía",
      breed: "Poodle",
      age: "1 año",
      gender: "Hembra",
      size: "Pequeño",
      image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&h=600&fit=crop",
      description: "Mía es pequeña pero llena de energía y amor.",
      vaccinated: true,
      sterilized: false,
      personality: ["Energética", "Cariñosa", "Curiosa"]
    },
    {
      id: 4,
      name: "Rocky",
      breed: "Beagle",
      age: "4 años",
      gender: "Macho",
      size: "Mediano",
      image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&h=600&fit=crop",
      description: "Rocky es tranquilo y perfecto para apartamentos.",
      vaccinated: true,
      sterilized: true,
      personality: ["Tranquilo", "Obediente", "Guardián"]
    },
    {
      id: 5,
      name: "Bella",
      breed: "Husky Siberiano",
      age: "2 años",
      gender: "Hembra",
      size: "Grande",
      image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=600&h=600&fit=crop",
      description: "Bella tiene hermosos ojos azules y es muy activa.",
      vaccinated: true,
      sterilized: true,
      personality: ["Activa", "Aventurera", "Independiente"]
    },
    {
      id: 6,
      name: "Toby",
      breed: "Chihuahua",
      age: "3 años",
      gender: "Macho",
      size: "Pequeño",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop",
      description: "Toby es pequeño pero valiente, perfecto para compañía.",
      vaccinated: true,
      sterilized: true,
      personality: ["Valiente", "Protector", "Leal"]
    },
    {
      id: 7,
      name: "Lola",
      breed: "Border Collie",
      age: "1 año",
      gender: "Hembra",
      size: "Mediano",
      image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=600&fit=crop",
      description: "Lola es muy inteligente y aprende rápido.",
      vaccinated: true,
      sterilized: false,
      personality: ["Inteligente", "Obediente", "Activa"]
    },
    {
      id: 8,
      name: "Bruno",
      breed: "Bulldog Francés",
      age: "2 años",
      gender: "Macho",
      size: "Mediano",
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&h=600&fit=crop",
      description: "Bruno es adorable y le encanta dormir y recibir mimos.",
      vaccinated: true,
      sterilized: true,
      personality: ["Calmado", "Afectuoso", "Divertido"]
    }
  ];

  const filteredPets = pets.filter(pet => {
    const matchesFilter = selectedFilter === 'all' || pet.size === selectedFilter;
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const adoptionProcess = [
    {
      step: 1,
      title: "Explora",
      description: "Conoce a nuestras mascotas disponibles"
    },
    {
      step: 2,
      title: "Solicitud",
      description: "Completa el formulario de adopción"
    },
    {
      step: 3,
      title: "Entrevista",
      description: "Conversamos sobre tus expectativas"
    },
    {
      step: 4,
      title: "Conoce",
      description: "Visita y conoce a tu nueva mascota"
    },
    {
      step: 5,
      title: "Adopta",
      description: "Firma el contrato y llévalo a casa"
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
                <div className="font-bold text-lg">SmartPet</div>
              </div>
            </button>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Inicio</button>
              <button onClick={() => onNavigate('movilvet')} className="text-sm font-medium hover:text-primary transition-colors">MovilVet</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Peluquería</button>
              <button onClick={() => onNavigate('hoteleria')} className="text-sm font-medium hover:text-primary transition-colors">Hotelería</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Tienda</button>
              <button onClick={() => onNavigate('home')} className="text-sm font-medium hover:text-primary transition-colors">Afiliaciones</button>
              <button className="text-sm font-medium text-primary">Adopción</button>
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
            src="https://images.unsplash.com/photo-1721227319522-553452acea54?w=1920&h=1080&fit=crop" 
            alt="Perros en adopción"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600/95 to-rose-500/80" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Heart className="w-20 h-20 mx-auto mb-6" fill="currentColor" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Adopta un Amigo Fiel
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light">
              Dale una segunda oportunidad a una mascota que necesita amor y un hogar
            </p>
          </motion.div>
        </div>
      </section>

      {/* Proceso de Adopción */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Proceso de Adopción</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              5 pasos simples para darle un hogar a tu nueva mascota
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {adoptionProcess.map((item, index) => (
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
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filtros y Búsqueda */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o raza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('all')}
              >
                Todos
              </Button>
              <Button 
                variant={selectedFilter === 'Pequeño' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('Pequeño')}
              >
                Pequeños
              </Button>
              <Button 
                variant={selectedFilter === 'Mediano' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('Mediano')}
              >
                Medianos
              </Button>
              <Button 
                variant={selectedFilter === 'Grande' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('Grande')}
              >
                Grandes
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Mascotas */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {filteredPets.map((pet, index) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden h-full border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={pet.image} 
                      alt={pet.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg">
                      <Heart className="w-5 h-5 text-rose-500" />
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-bold mb-1">{pet.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{pet.breed}</p>
                    
                    <div className="flex gap-2 mb-3 text-xs">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">{pet.age}</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">{pet.gender}</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">{pet.size}</span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{pet.description}</p>

                    <div className="flex gap-2 mb-4">
                      {pet.vaccinated && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Check className="w-3 h-3" />
                          Vacunado
                        </div>
                      )}
                      {pet.sterilized && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Check className="w-3 h-3" />
                          Esterilizado
                        </div>
                      )}
                    </div>

                    <Button className="w-full" variant="default">
                      Conocer a {pet.name}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No se encontraron mascotas con esos criterios</p>
            </div>
          )}
        </div>
      </section>

      {/* Requisitos */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Requisitos para Adoptar</h2>
              <p className="text-xl text-muted-foreground">
                Asegúrate de cumplir con estos requisitos antes de adoptar
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Documentación
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• DNI o documento de identidad vigente</li>
                    <li>• Comprobante de domicilio</li>
                    <li>• Foto del espacio donde vivirá la mascota</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Condiciones
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Ser mayor de 21 años</li>
                    <li>• Contar con espacio adecuado</li>
                    <li>• Compromiso de cuidado responsable</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Responsabilidades
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Alimentación diaria balanceada</li>
                    <li>• Visitas veterinarias regulares</li>
                    <li>• Tiempo de calidad y ejercicio</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Costos
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Tarifa de adopción: S/. 150</li>
                    <li>• Incluye vacunas y esterilización</li>
                    <li>• Kit de bienvenida gratuito</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-rose-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Heart className="w-16 h-16 mx-auto mb-6" fill="currentColor" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para Adoptar?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-light">
              Agenda una visita y conoce a tu futuro mejor amigo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-12 h-14 bg-white text-rose-600 hover:bg-white/90 shadow-lg">
                Solicitar Adopción
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-12 h-14 border-2 border-white text-white hover:bg-white hover:text-rose-600">
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