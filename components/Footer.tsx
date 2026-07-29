'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-white mb-3">INSUPEC</h3>
            <p className="text-sm text-gray-400 mb-4">Tu farmacia de confianza en línea. Medicamentos y productos de salud auténticos.</p>
            <div className="flex gap-3">
              <a href="https://wa.me/5493492615886" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-500 transition">
                <Phone size={20} />
              </a>
              <a href="https://wa.me/5493492615886" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-600 transition">
                <Heart size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">TIENDA</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/productos" className="hover:text-brand-600 transition">Productos</Link></li>
              <li><Link href="/productos" className="hover:text-brand-600 transition">Ofertas</Link></li>
              <li><Link href="/productos" className="hover:text-brand-600 transition">Packs</Link></li>
              <li><Link href="/admin/descuentos" className="hover:text-brand-600 transition">Códigos de Descuento</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">ATENCIÓN AL CLIENTE</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://wa.me/5493492615886" className="hover:text-brand-600 transition flex items-center gap-2"><Phone size={16} /> WhatsApp 24/7</a></li>
              <li><a href="mailto:info@insupec.com" className="hover:text-brand-600 transition flex items-center gap-2"><Mail size={16} /> info@insupec.com</a></li>
              <li><Link href="/privacidad" className="hover:text-brand-600 transition">Preguntas Frecuentes</Link></li>
              <li><Link href="/privacidad" className="hover:text-brand-600 transition">Garantía</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">LEGAL</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacidad" className="hover:text-brand-600 transition">Política de Privacidad</Link></li>
              <li><Link href="/privacidad" className="hover:text-brand-600 transition">Términos y Condiciones</Link></li>
              <li><Link href="/privacidad" className="hover:text-brand-600 transition">Política de Cookies</Link></li>
              <li className="flex items-center gap-2"><MapPin size={16} /> Bv. Lehmann 601, Rafaela</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8 mt-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-sm text-gray-400">
          <div>© {currentYear} INSUPEC - Todos los derechos reservados</div>
          <div className="flex gap-4 flex-wrap">
            <span className="flex items-center gap-1">🔒 HTTPS SSL Seguro</span>
            <span className="flex items-center gap-1">✓ Farmacia Registrada</span>
            <span className="flex items-center gap-1">✓ 100% Auténticos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
