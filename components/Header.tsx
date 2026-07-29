'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const { items, openCart } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="INSUPEC"
              width={338}
              height={109}
              priority
              className="h-10 sm:h-14 w-auto"
            />
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden sm:flex items-center gap-6 flex-1 mx-4">
            <Link href="/productos" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">
              Productos
            </Link>
            <Link href="/nosotros" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">
              Nosotros
            </Link>
            <Link href="/faq" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition">
              Preguntas Frecuentes
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
