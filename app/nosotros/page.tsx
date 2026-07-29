'use client';

import Link from 'next/link';
import { CheckCircle, Award, Users, Target, Shield, Heart } from 'lucide-react';

export default function NosotrosPage() {
  const values = [
    {
      icon: Shield,
      title: 'Seguridad y Confianza',
      description: 'Somos una farmacia registrada y verificada. Todos nuestros productos son 100% auténticos.',
    },
    {
      icon: Heart,
      title: 'Calidad de Vida',
      description: 'Nuestro objetivo es mejorar la salud y el bienestar de nuestros clientes.',
    },
    {
      icon: Users,
      title: 'Atención Personalizada',
      description: 'Te acompañamos en cada compra con un servicio al cliente profesional y cercano.',
    },
    {
      icon: Target,
      title: 'Innovación Constante',
      description: 'Mejoramos continuamente nuestras plataforma y servicios para tu comodidad.',
    },
  ];

  const achievements = [
    { number: '5000+', label: 'Clientes Satisfechos' },
    { number: '500+', label: 'Productos Disponibles' },
    { number: '24-72h', label: 'Tiempo de Envío' },
    { number: '100%', label: 'Medicamentos Auténticos' },
  ];

  return (
    <div className="min-h-screen bg-white pt-32">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-50 via-white to-brand-50 py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
            Sobre <span className="text-brand-600">INSUPEC</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Tu farmacia de confianza en línea, comprometida con tu salud y bienestar.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-brand-100 p-8 sm:p-12 mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">¿Quiénes Somos?</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              INSUPEC es una farmacia registrada y verificada dedicada a ofrecer medicamentos y productos de salud 100% auténticos, con entrega rápida y segura a todo el país.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Nos especializamos en brindar una experiencia de compra simple, segura y cómoda desde la comodidad de tu hogar. Cada producto en nuestro catálogo es verificado por laboratorios confiables y cumple con los más altos estándares de calidad.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Nuestro equipo está disponible 24/7 en WhatsApp para responder tus preguntas, orientarte en tu compra y confirmar tu pedido en tiempo real.
            </p>
          </div>

          {/* Achievements */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {achievements.map((achievement, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-6 text-center border border-brand-100"
              >
                <p className="text-3xl sm:text-4xl font-bold text-brand-600 mb-2">{achievement.number}</p>
                <p className="text-gray-700 font-semibold">{achievement.label}</p>
              </div>
            ))}
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl border-2 border-brand-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="text-brand-600" size={28} />
                Nuestra Misión
              </h3>
              <p className="text-gray-700">
                Proporcionar acceso fácil, seguro y confiable a medicamentos y productos de salud auténticos, mejorando la calidad de vida de nuestros clientes a través de un servicio excepcional.
              </p>
            </div>
            <div className="bg-white rounded-xl border-2 border-brand-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="text-brand-600" size={28} />
                Nuestra Visión
              </h3>
              <p className="text-gray-700">
                Ser la farmacia online más confiable y accesible del país, reconocida por nuestra calidad, transparencia y compromiso con el bienestar de nuestros clientes.
              </p>
            </div>
          </div>

          {/* Values */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">Nuestros Valores</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div key={idx} className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-8 border border-brand-100">
                    <div className="flex items-start gap-4">
                      <Icon className="text-brand-600 flex-shrink-0 mt-1" size={28} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                        <p className="text-gray-700">{value.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-16 sm:py-24 px-4 border-t-2 border-brand-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">¿Por Qué Elegir INSUPEC?</h2>
          <div className="space-y-4">
            {[
              '✓ Farmacia verificada y registrada por AFIP',
              '✓ Todos nuestros productos 100% auténticos',
              '✓ Laboratorios reconocidos y confiables',
              '✓ Control de calidad garantizado en cada producto',
              '✓ Entrega rápida 24-72 horas a todo el país',
              '✓ Múltiples opciones de pago',
              '✓ Confirmación de pedidos por WhatsApp en tiempo real',
              '✓ Atención al cliente 24/7',
              '✓ Políticas claras y transparentes',
              '✓ Garantía en todos los productos',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                <span className="text-xl font-bold text-brand-600">{item.split(' ')[0]}</span>
                <span className="text-gray-700 text-lg">{item.substring(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">¿Listo para confiar en INSUPEC?</h2>
          <p className="text-brand-100 text-lg mb-8">Descubre nuestro catálogo de más de 500 productos auténticos</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="inline-block bg-white text-brand-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-50 transition-all shadow-lg"
            >
              🛍️ Ver Catálogo
            </Link>
            <a
              href="https://wa.me/5493492615886"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              💬 Contactanos
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
