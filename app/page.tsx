'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Truck, Phone, Check, Star, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { supabase, Producto } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Producto[]>([]);

  const testimonials = [
    {
      name: 'María González',
      location: 'Rosario, Santa Fe',
      rating: 5,
      text: 'Excelente farmacia online. Los medicamentos llegaron en 48hs y todo completamente seguro. Ya compré 3 veces y siempre perfectamente.',
      avatar: '👩',
    },
    {
      name: 'Carlos Rodríguez',
      location: 'La Plata, Buenos Aires',
      rating: 5,
      text: 'Me sorprendió la rapidez. Pedí el viernes y ya tenía los medicamentos el lunes. El atender por WhatsApp es muy cómodo.',
      avatar: '👨',
    },
    {
      name: 'Beatriz López',
      location: 'Córdoba, Córdoba',
      rating: 5,
      text: 'Farmacia de confianza. Todos los productos son auténticos y tienen sus vencimientos claramente indicados. Excelente servicio.',
      avatar: '👩‍🦱',
    },
    {
      name: 'Roberto Martínez',
      location: 'Mendoza, Mendoza',
      rating: 5,
      text: 'No tengo palabras. Servicio impecable, precios justos y muy profesionales. Los recomiendo a toda mi familia.',
      avatar: '👨‍💼',
    },
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const { data } = await supabase
          .from('productos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);

        if (data) {
          setFeaturedProducts(data);
        }
      } catch (err) {
        console.error('Error loading featured products:', err);
      }
    }

    fetchFeaturedProducts();

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://insupec.com/#organization',
      name: 'INSUPEC',
      description: 'Farmacia online de confianza con medicamentos auténticos entregados rápido a todo el país',
      url: 'https://insupec.com',
      image: 'https://insupec.com/logo.png',
      telephone: '+5493492615886',
      email: 'info@insupec.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Bv. Lehmann 601',
        addressLocality: 'Rafaela',
        addressRegion: 'Santa Fe',
        postalCode: '2300',
        addressCountry: 'AR',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        availableLanguage: ['es'],
        contactType: 'Customer Support',
        telephone: '+5493492615886',
        email: 'info@insupec.com',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1000+',
        bestRating: '5',
        worstRating: '1',
      },
      areaServed: 'AR',
      priceRange: '$',
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-brand-50 via-white to-brand-50 pt-12 sm:pt-20 pb-16 sm:pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Contenido */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                Tu Farmacia
                <span className="text-brand-600"> de Confianza</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                Medicamentos y productos de salud auténticos, entregados rápido a tu puerta. Compra seguro desde casa.
              </p>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-brand-600">500+</p>
                  <p className="text-sm text-gray-600">Productos</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-brand-600">24-72h</p>
                  <p className="text-sm text-gray-600">Entrega</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-brand-600">100%</p>
                  <p className="text-sm text-gray-600">Auténticos</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/productos"
                  className="bg-brand-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl text-center"
                >
                  🛍️ Comprar Ahora
                </Link>
                <Link
                  href="/productos"
                  className="border-2 border-brand-600 text-brand-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-50 transition-all text-center"
                >
                  📚 Ver Catálogo
                </Link>
              </div>
            </div>

            {/* Imagen/Ilustración */}
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-brand-100 to-brand-50 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Shield size={80} className="text-brand-600 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">Farmacia Verificada</p>
                  <p className="text-sm text-gray-500">100% Segura y Confiable</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST SIGNALS SECTION */}
      <section className="bg-gray-50 py-16 sm:py-24 px-4 border-t-2 border-b-2 border-brand-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">¿Por qué confiar en INSUPEC?</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Trust Item 1 */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-brand-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Conexión Segura</h3>
              <p className="text-sm text-gray-600">🔐 HTTPS SSL encriptado. Tus datos protegidos.</p>
            </div>

            {/* Trust Item 2 */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck size={32} className="text-brand-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Envíos Rápidos</h3>
              <p className="text-sm text-gray-600">📦 24-72 horas a todo el país.</p>
            </div>

            {/* Trust Item 3 */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-brand-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">100% Auténticos</h3>
              <p className="text-sm text-gray-600">✓ Productos verificados y garantizados.</p>
            </div>

            {/* Trust Item 4 */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={32} className="text-brand-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Soporte 24/7</h3>
              <p className="text-sm text-gray-600">📞 Disponible en WhatsApp todo el día.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">Lo que nos hace especiales</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Farmacia Verificada</h3>
              <p className="text-gray-600 mb-4">Somos una farmacia registrada y verificada por AFIP. Todos nuestros productos son auténticos y cumplen con los estándares de calidad más altos.</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-brand-600" />
                  Laboratorios verificados
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-brand-600" />
                  Control de calidad garantizado
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-brand-600" />
                  Trazabilidad completa
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Compra Fácil y Segura</h3>
              <p className="text-gray-600 mb-4">Nuestro proceso de compra es simple, rápido y completamente seguro. Confirmamos tu pedido por WhatsApp en tiempo real.</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-brand-600" />
                  Múltiples opciones de pago
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-brand-600" />
                  Confirmación por WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <Check size={20} className="text-brand-600" />
                  Códigos de descuento disponibles
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-white py-16 sm:py-24 px-4 border-t-2 border-brand-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">Lo que dicen nuestros clientes</h2>

          <div className="relative">
            {/* Testimonial Card */}
            <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-8 sm:p-10 shadow-lg border border-brand-100 min-h-64 flex flex-col justify-between">
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} size={20} className="text-amber-500 fill-amber-500" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 text-center text-lg font-medium mb-8 flex-1 flex items-center justify-center">
                "{testimonials[currentTestimonial].text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <div className="text-4xl">{testimonials[currentTestimonial].avatar}</div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</p>
                  <p className="text-sm text-gray-600">{testimonials[currentTestimonial].location}</p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="p-3 bg-white border-2 border-brand-600 text-brand-600 rounded-full hover:bg-brand-50 transition-colors shadow-md"
                aria-label="Testimonio anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2 items-center">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      idx === currentTestimonial ? 'bg-brand-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Ir al testimonio ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="p-3 bg-white border-2 border-brand-600 text-brand-600 rounded-full hover:bg-brand-50 transition-colors shadow-md"
                aria-label="Próximo testimonio"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      {featuredProducts.length > 0 && (
        <section className="py-16 sm:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap size={28} className="text-amber-500" />
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Productos Destacados</h2>
                <Zap size={28} className="text-amber-500" />
              </div>
              <p className="text-gray-600">Descubre nuestros medicamentos más populares y nuevas llegadas</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/productos"
                className="inline-block bg-brand-600 text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl"
              >
                Ver Catálogo Completo →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">¿Necesitas medicamentos?</h2>
          <p className="text-brand-100 text-lg mb-8">Explora nuestro catálogo de más de 500 productos auténticos</p>
          <Link
            href="/productos"
            className="inline-block bg-white text-brand-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-50 transition-all shadow-lg"
          >
            🛍️ Compra Ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
