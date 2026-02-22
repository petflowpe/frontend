import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from "lucide-react";

interface FooterProps {
  onNavigate?: (page: string) => void;
}

const Footer = ({ onNavigate }: FooterProps) => {
  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">🐾</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">SmartPet</h3>
                <p className="text-xs opacity-75">Tu aliado en el cuidado animal</p>
              </div>
            </div>
            <p className="text-sm opacity-75 leading-relaxed">
              Servicios veterinarios integrales a domicilio. 
              Cuidamos a tu mascota con amor y dedicación profesional.
            </p>
            <div className="flex space-x-3">
              <Button size="icon" variant="ghost" className="text-background hover:bg-background/20">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-background hover:bg-background/20">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-background hover:bg-background/20">
                <Twitter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Servicios</h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li>
                <button 
                  onClick={() => handleNavigation('movilvet')} 
                  className="hover:opacity-100 transition-opacity text-left"
                >
                  MovilVet
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('peluqueria')} 
                  className="hover:opacity-100 transition-opacity text-left"
                >
                  Peluquería Móvil
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('hoteleria')} 
                  className="hover:opacity-100 transition-opacity text-left"
                >
                  Hotelería
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('paseos')} 
                  className="hover:opacity-100 transition-opacity text-left"
                >
                  Paseos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('adopcion')} 
                  className="hover:opacity-100 transition-opacity text-left"
                >
                  Adopción
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('cursos')} 
                  className="hover:opacity-100 transition-opacity text-left"
                >
                  Cursos
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contacto</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 opacity-75" />
                <span>+51 (1) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 opacity-75" />
                <span>hola@smartpet.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 opacity-75" />
                <span>Lima, Perú</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 opacity-75" />
                <span>Lun - Dom: 8:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li><a href="#terminos" className="hover:opacity-100 transition-opacity">Términos y Condiciones</a></li>
              <li><a href="#privacidad" className="hover:opacity-100 transition-opacity">Política de Privacidad</a></li>
              <li><a href="#cancelaciones" className="hover:opacity-100 transition-opacity">Política de Cancelaciones</a></li>
              <li><a href="#seguros" className="hover:opacity-100 transition-opacity">Seguros y Garantías</a></li>
              <li><a href="#preguntas" className="hover:opacity-100 transition-opacity">Preguntas Frecuentes</a></li>
              <li>
                <button 
                  onClick={() => handleNavigation('trabaja')} 
                  className="hover:opacity-100 transition-opacity text-left"
                >
                  Trabaja con Nosotros
                </button>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-background/20 mb-8" />

        {/* Bottom Section */}
        <div className="space-y-6">
          {/* Terms Preview Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-background/5 border-background/20 text-background">
              <div className="p-4">
                <h5 className="font-semibold mb-2">Términos de Servicio</h5>
                <p className="text-xs opacity-75 mb-3">
                  Nuestros servicios están sujetos a términos y condiciones que garantizan 
                  la calidad y seguridad para tu mascota.
                </p>
                <Button variant="ghost" size="sm" className="text-background border-background/30 hover:bg-background/20">
                  Ver Términos Completos
                </Button>
              </div>
            </Card>

            <Card className="bg-background/5 border-background/20 text-background">
              <div className="p-4">
                <h5 className="font-semibold mb-2">Política de Cancelación</h5>
                <p className="text-xs opacity-75 mb-3">
                  Cancelaciones gratuitas hasta 24 horas antes. Política flexible 
                  para casos especiales, consultando disponibilidad.
                </p>
                <Button variant="ghost" size="sm" className="text-background border-background/30 hover:bg-background/20">
                  Ver Política
                </Button>
              </div>
            </Card>

            <Card className="bg-background/5 border-background/20 text-background">
              <div className="p-4">
                <h5 className="font-semibold mb-2">Garantía de Calidad</h5>
                <p className="text-xs opacity-75 mb-3">
                  Satisfacción garantizada. Le ofrecemos el mejor servicio veterinario 
                  para su mascota con profesionales certificados.
                </p>
                <Button variant="ghost" size="sm" className="text-background border-background/30 hover:bg-background/20">
                  Más Información
                </Button>
              </div>
            </Card>
          </div>

          {/* Copyright */}
          <div className="text-center text-sm opacity-75">
            <p>© 2024 SmartPet. Todos los derechos reservados.</p>
            <p className="mt-1">Diseñado con ❤️ para el cuidado de mascotas</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;