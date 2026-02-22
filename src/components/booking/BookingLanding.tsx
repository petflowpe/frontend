import { useState } from 'react';
import { Calendar, MapPin, Star, Clock, Shield, Heart, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface BookingLandingProps {
  onStartBooking: () => void;
}

export function BookingLanding({ onStartBooking }: BookingLandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl">SmartPet</h1>
              <p className="text-xs text-slate-500">Peluquería Móvil</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Ver mi Reserva
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
            🎉 Reserva Online 24/7
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Spa Móvil para tu Mascota
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Vamos a tu casa. Sin estrés. Sin traslados. 
            <span className="font-semibold text-slate-800"> Profesionales certificados</span> en la puerta de tu hogar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={onStartBooking}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Reservar Ahora
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6"
            >
              <Clock className="w-5 h-5 mr-2" />
              Ver Disponibilidad
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>Confirmación Instantánea</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>Pago Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>Cancelación Flexible</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white py-8 border-y">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-slate-600">Clientes Felices</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4.9★</div>
              <div className="text-sm text-slate-600">Rating Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">10,000+</div>
              <div className="text-sm text-slate-600">Servicios Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-slate-600">Reserva Online</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Servicios profesionales de spa para tu mascota, en la comodidad de tu hogar
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <ServiceCard
            icon="🛁"
            title="Baño Completo"
            description="Shampoo premium, secado, limpieza de oídos y corte de uñas"
            price="Desde S/30"
            popular={false}
          />
          <ServiceCard
            icon="✂️"
            title="Baño + Corte"
            description="Incluye baño completo más corte de pelo según raza"
            price="Desde S/55"
            popular={true}
          />
          <ServiceCard
            icon="💊"
            title="Baño Medicado"
            description="Tratamiento especializado con shampoo medicado"
            price="Desde S/40"
            popular={false}
          />
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={onStartBooking}
          >
            Ver Todos los Servicios
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Cómo Funciona?
            </h2>
            <p className="text-lg text-slate-600">
              Simple, rápido y sin complicaciones
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <StepCard
              number={1}
              icon={<Calendar className="w-8 h-8" />}
              title="Elige Servicio"
              description="Selecciona el servicio perfecto para tu mascota"
            />
            <StepCard
              number={2}
              icon={<Clock className="w-8 h-8" />}
              title="Selecciona Horario"
              description="Ve disponibilidad en tiempo real y elige tu hora"
            />
            <StepCard
              number={3}
              icon={<MapPin className="w-8 h-8" />}
              title="Confirma Dirección"
              description="Ingresa tus datos y dirección de servicio"
            />
            <StepCard
              number={4}
              icon={<Sparkles className="w-8 h-8" />}
              title="¡Listo!"
              description="Recibes confirmación y vamos a tu casa"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Por Qué Elegirnos?
          </h2>
          <p className="text-lg text-slate-600">
            La mejor experiencia para ti y tu mascota
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Shield className="w-12 h-12 text-blue-600" />}
            title="Profesionales Certificados"
            description="Más de 5 años de experiencia. Capacitación continua en las últimas técnicas."
          />
          <FeatureCard
            icon={<Heart className="w-12 h-12 text-red-500" />}
            title="Amor por los Animales"
            description="Tratamos a tu mascota como si fuera nuestra. Paciencia y cariño garantizados."
          />
          <FeatureCard
            icon={<Star className="w-12 h-12 text-yellow-500" />}
            title="Productos Premium"
            description="Shampoos y productos de la más alta calidad, hipoalergénicos y seguros."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Lo Que Dicen Nuestros Clientes
            </h2>
            <div className="flex items-center justify-center gap-2 text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <span className="text-slate-600 ml-2">4.9 de 5 (500+ reseñas)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <TestimonialCard
              name="María González"
              pet="Luna (Golden Retriever)"
              rating={5}
              text="¡Increíble servicio! Luna quedó hermosa y el groomer fue super paciente. La comodidad de hacerlo en casa no tiene precio."
              image="👩"
            />
            <TestimonialCard
              name="Carlos Ramírez"
              pet="Max (Schnauzer)"
              rating={5}
              text="Puntualidad perfecta, trabajo profesional y precios justos. Max siempre vuelve feliz. 100% recomendado."
              image="👨"
            />
            <TestimonialCard
              name="Ana Torres"
              pet="Coco (Poodle)"
              rating={5}
              text="La mejor decisión fue cambiarme a SmartPet. El sistema de reserva online es súper fácil y siempre hay disponibilidad."
              image="👩‍🦰"
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Dale a Tu Mascota el Cuidado Que Merece
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Miles de clientes satisfechos. Reserva en 2 minutos. 
            Cancelación flexible. ¿Qué esperas?
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6"
            onClick={onStartBooking}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Agendar Mi Cita Ahora
          </Button>
          <p className="text-sm mt-4 opacity-75">
            ⚡ Confirmación instantánea • 🔒 Pago 100% seguro
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">SmartPet</h3>
              <p className="text-sm text-slate-400">
                Peluquería móvil profesional para tu mascota. Amor, calidad y comodidad.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Servicios</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Baño Completo</li>
                <li>Corte de Pelo</li>
                <li>Baño Medicado</li>
                <li>Spa Completo</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Sobre Nosotros</li>
                <li>Zonas de Servicio</li>
                <li>Preguntas Frecuentes</li>
                <li>Contacto</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>📞 +51 987 654 321</li>
                <li>✉️ hola@smartpet.pe</li>
                <li>📍 Lima, Perú</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            © 2024 SmartPet. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ icon, title, description, price, popular }: any) {
  return (
    <Card className={`p-6 hover:shadow-xl transition-all cursor-pointer group ${popular ? 'border-2 border-blue-500 relative' : ''}`}>
      {popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
          Más Popular
        </Badge>
      )}
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-slate-600 text-sm mb-4">{description}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-blue-600">{price}</span>
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Card>
  );
}

function StepCard({ number, icon, title, description }: any) {
  return (
    <div className="text-center">
      <div className="relative inline-flex mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 shadow-md border-2 border-blue-600">
          {number}
        </div>
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <Card className="p-6 text-center hover:shadow-lg transition-shadow">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </Card>
  );
}

function TestimonialCard({ name, pet, rating, text, image }: any) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-4xl">{image}</div>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-slate-600">{pet}</div>
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
        ))}
      </div>
      <p className="text-sm text-slate-600 italic">"{text}"</p>
    </Card>
  );
}
