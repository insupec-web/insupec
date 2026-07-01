'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldCheck, MessageCircle, MapPin } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // No mostrar en el panel de administración
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493492615886';

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      {/* Badges de confianza */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <Lock size={28} className="text-brand-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white text-sm">Sitio 100% Seguro</p>
              <p className="text-xs text-gray-400">Conexión cifrada SSL: tus datos viajan protegidos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} className="text-brand-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white text-sm">Compra Protegida</p>
              <p className="text-xs text-gray-400">Pagás recién cuando confirmamos tu pedido</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MessageCircle size={28} className="text-brand-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white text-sm">Atención Personalizada</p>
              <p className="text-xs text-gray-400">Confirmación y seguimiento de tu pedido por WhatsApp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info y enlaces */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <p className="text-lg font-extrabold text-white tracking-wide">INSUPEC</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Insumos Pecuarios</p>
          <p className="text-sm text-gray-400 mt-3">
            Insumos pecuarios y veterinarios de calidad, con atención directa y envíos a todo el país.
          </p>
        </div>

        <div>
          <p className="font-semibold text-white text-sm mb-3">Contacto</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
              <span>Bv Lehmann 601, Rafaela, Santa Fe</span>
            </li>
            <li className="flex items-start gap-2">
              <MessageCircle size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
              <a
                href={`https://wa.me/${phoneNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Escribinos por WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-white text-sm mb-3">Enlaces</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/productos" className="hover:text-white transition-colors">
                Catálogo de productos
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-white transition-colors">
                Finalizar pedido
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-white transition-colors">
                Política de privacidad
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4">
        <p className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} INSUPEC — Insumos Pecuarios. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
