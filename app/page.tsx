'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Shield, Truck, Phone, Check } from 'lucide-react';

export default function HomePage() {
  useEffect(() => {
    // Analytics para la página de inicio
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
