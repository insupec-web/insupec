'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, Lock, Truck, Phone } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const { items, openCart } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
      {/* Trust Bar Superior */}
      <div className="bg-brand-50 border-b border-brand-100 py-2 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-gray-700">
          <div className="flex items-center gap-1">
            <Lock size={14} className="text-brand-600" />
            <span className="hidden sm:inline">🔒 HTTPS Seguro</span>
            <span className="sm:hidden">Seguro</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck size={14} className="text-brand-600" />
            <span className="hidden sm:inline">📦 Envíos a todo el país</span>
            <span className="sm:hidden">Envíos</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone size={14} className="text-brand-600" />
            <span className="hidden sm:inline">📞 WhatsApp 24/7</span>
            <span className="sm:hidden">24/7</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200 py-3 sm:py-4 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/productos" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="INSUPEC"
              width={338}
              height={109}
              priority
              className="h-8 sm:h-12 w-auto"
            />
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-6 flex-1 mx-6">
            <Link href="/productos" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">
              Productos
            </Link>
            <Link href="/productos" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">
              Ofertas
            </Link>
            <Link href="/productos" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">
              Packs
            </Link>
          </nav>

          {/* Carrito */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={22} className="text-gray-800" />
            <span className="hidden sm:inline text-sm font-semibold text-gray-800">
              {itemCount > 0 ? `Carrito (${itemCount})` : 'Carrito'}
            </span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
