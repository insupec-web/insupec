'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'pedidos' | 'pago' | 'envio' | 'productos' | 'cuenta' | 'seguridad';
}

const faqItems: FAQItem[] = [
  {
    category: 'pedidos',
    question: '¿Cómo realizo un pedido?',
    answer:
      'Ingresa a nuestra plataforma, selecciona los productos que deseas, agrega cantidad, y procede al checkout. Podrás elegir entre múltiples opciones de pago. Una vez confirmado, nos contactaremos por WhatsApp para confirmar tu pedido.',
  },
  {
    category: 'pedidos',
    question: '¿Puedo modificar mi pedido después de realizarlo?',
    answer:
      'Sí, puedes contactarnos a través de WhatsApp antes de que tu pedido sea procesado. Nuestro equipo estará disponible 24/7 para ayudarte a modificar o cancelar tu pedido.',
  },
  {
    category: 'pedidos',
    question: '¿Qué pasa si el producto que quiero no tiene stock?',
    answer:
      'Nuestro catálogo se actualiza en tiempo real. Si un producto está sin stock, el estado aparecerá claramente marcado. Puedes contactarnos para consultar sobre la disponibilidad próxima del producto.',
  },
  {
    category: 'pago',
    question: '¿Cuáles son las opciones de pago?',
    answer:
      'Aceptamos múltiples opciones de pago: transferencia bancaria, depósito en cuenta, billetera virtual (MercadoPago, Ualá), tarjetas de crédito y débito. Todas las transacciones son seguras y encriptadas.',
  },
  {
    category: 'pago',
    question: '¿Puedo pagar en cuotas?',
    answer:
      'Sí, dependiendo de tu medio de pago. Con tarjetas de crédito puedes utilizar promociones de 3, 6 o 12 cuotas sin interés según disponibilidad. Para más detalles, contacta a nuestro equipo de atención al cliente.',
  },
  {
    category: 'pago',
    question: '¿Cómo puedo usar un código de descuento?',
    answer:
      'Durante el proceso de checkout, encontrarás un campo donde puedes ingresar tu código de descuento. El descuento se aplicará automáticamente al total de tu compra. Verifica que el código sea válido antes de confirmar el pedido.',
  },
  {
    category: 'envio',
    question: '¿Cuál es el tiempo de envío?',
    answer:
      'Realizamos entregas en 24-72 horas a todo el país, dependiendo de tu ubicación. Los pedidos realizados viernes después de las 18hs se procesan el lunes siguiente. Te notificaremos por WhatsApp el estado de tu envío.',
  },
  {
    category: 'envio',
    question: '¿Cuál es el costo del envío?',
    answer:
      'El costo del envío depende de tu localidad y el volumen de la compra. Durante el checkout podrás ver el costo exacto del envío a tu dirección antes de confirmar el pedido.',
  },
  {
    category: 'envio',
    question: '¿Envían a todo el país?',
    answer:
      'Sí, realizamos entregas a todo el territorio argentino. Tanto para ciudades como para localidades más alejadas. Calculamos el envío de acuerdo a tu ubicación exacta.',
  },
  {
    category: 'productos',
    question: '¿Cómo puedo estar seguro de que los productos son auténticos?',
    answer:
      'INSUPEC es una farmacia registrada y verificada. Todos nuestros productos provienen de laboratorios oficiales y cuentan con trazabilidad completa. Cada medicamento incluye su vencimiento verificado.',
  },
  {
    category: 'productos',
    question: '¿Puedo devolver un producto?',
    answer:
      'Sí, contamos con política de devolución. Si el producto llega en mal estado o no es lo que solicitaste, contacta a nuestro equipo dentro de 48 horas de recibido. Nos encargaremos de resolver el problema.',
  },
  {
    category: 'productos',
    question: '¿Puedo ver el vencimiento del producto antes de comprar?',
    answer:
      'Claro, en la ficha de cada producto puedes ver claramente la fecha de vencimiento. Todos nuestros medicamentos tienen vencimiento vigente mínimo de 6 meses al momento de la venta.',
  },
  {
    category: 'cuenta',
    question: '¿Es necesario crear una cuenta para comprar?',
    answer:
      'No es obligatorio, pero recomendamos crear una cuenta para acceder a tu historial de compras, guardar tus direcciones frecuentes y recibir ofertas exclusivas. Crear una cuenta es rápido y seguro.',
  },
  {
    category: 'cuenta',
    question: '¿Puedo recuperar mi contraseña?',
    answer:
      'Sí, en la pantalla de login encontrarás la opción "¿Olvidaste tu contraseña?". Sigue las instrucciones para recibir un enlace de recuperación en tu correo electrónico.',
  },
  {
    category: 'seguridad',
    question: '¿Mis datos están seguros?',
    answer:
      'Sí, utilizamos encriptación SSL de máximo nivel. Todos tus datos personales y financieros están protegidos. Contamos con certificaciones de seguridad y cumplimos con todas las regulaciones de protección de datos.',
  },
  {
    category: 'seguridad',
    question: '¿Qué es HTTPS SSL?',
    answer:
      'HTTPS SSL es un protocolo de seguridad que encripta la información que intercambias con nuestro servidor. Esto significa que tus datos de compra, personal e información bancaria viajan de forma segura e ilegible para terceros.',
  },
];

const categories = [
  { id: 'pedidos', label: 'Pedidos' },
  { id: 'pago', label: 'Pago' },
  { id: 'envio', label: 'Envío' },
  { id: 'productos', label: 'Productos' },
  { id: 'cuenta', label: 'Cuenta' },
  { id: 'seguridad', label: 'Seguridad' },
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('pedidos');

  const filteredFAQs = faqItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white pt-32">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-50 via-white to-brand-50 py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
            Preguntas <span className="text-brand-600">Frecuentes</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Encuentra respuestas a las preguntas más comunes sobre nuestro servicio
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setExpandedId(null);
                }}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden hover:border-brand-300 transition-colors">
                <button
                  onClick={() => setExpandedId(expandedId === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <span className="group-hover:text-brand-600 transition-colors">{item.question}</span>
                  <ChevronDown
                    size={20}
                    className={`text-brand-600 flex-shrink-0 transition-transform ${expandedId === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedId === idx && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No hay preguntas en esta categoría</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-gray-50 py-16 sm:py-20 px-4 border-t-2 border-brand-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">¿No encontraste lo que buscas?</h2>
          <p className="text-gray-600 text-lg mb-8">
            Nuestro equipo de atención al cliente está disponible 24/7 en WhatsApp para ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5493492615886"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-brand-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg"
            >
              💬 Contactanos por WhatsApp
            </a>
            <Link
              href="/nosotros"
              className="inline-block border-2 border-brand-600 text-brand-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-50 transition-all"
            >
              📋 Conoce más sobre nosotros
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-700 py-16 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">¿Listo para comprar?</h2>
          <p className="text-brand-100 text-lg mb-8">Explora nuestro catálogo de más de 500 productos auténticos</p>
          <Link
            href="/productos"
            className="inline-block bg-white text-brand-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-brand-50 transition-all shadow-lg"
          >
            🛍️ Ver Catálogo
          </Link>
        </div>
      </section>
    </div>
  );
}
