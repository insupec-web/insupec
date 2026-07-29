'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart, Lock, Truck, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const { items, openCart } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-50 shadow-sm">
      {/* Trust Bar */}
      <div className="bg-gradient-to-r from-brand-50 to-white border-b border-brand-200 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center sm:justify-between gap-3 sm:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Lock size={16} className="text-brand-600 flex-shrink-0" />
              <span className="hidden sm:inline">🔒 HTTPS Seguro</span>
              <span className="sm:hidden">Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Truck size={16} className="text-brand-600 flex-shrink-0" />
              <span className="hidden sm:inline">📦 Envío 24-72h</span>
              <span className="sm:hidden">Envío Rápido</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle size={16} className="text-brand-600 flex-shrink-0" />
              <span className="hidden sm:inline">✓ 100% Auténticos</span>
              <span className="sm:hidden">Auténticos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200 px-3 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="INSUPEC"
              width={338}
              height={109}
              priority
              className="h-9 sm:h-12 w-auto"
            />
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Carrito */}
          <button
            onClick={openCart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-all relative group"
            aria-label="Abrir carrito"
          >
            <ShoppingCart size={22} className="text-gray-800 group-hover:text-brand-600 transition" />
            <span className="hidden sm:inline text-sm font-semibold text-gray-800 group-hover:text-brand-600 transition">
              {itemCount > 0 ? `Carrito (${itemCount})` : 'Carrito'}
            </span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
