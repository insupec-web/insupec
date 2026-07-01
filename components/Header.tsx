'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';

export default function Header() {
  const { items, openCart } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-4 flex items-center justify-between">
        {/* Carrito a la izquierda en mobile */}
        <button
          onClick={openCart}
          className="flex sm:hidden items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors relative flex-shrink-0"
          aria-label="Abrir carrito"
        >
          <ShoppingCart size={20} className="text-gray-800" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 bg-brand-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>

        {/* Logo perfectamente centrado (posición absoluta) */}
        <Link
          href="/productos"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center"
        >
          <img
            src="/logo.png"
            alt="INSUPEC - Insumos Pecuarios"
            width={338}
            height={109}
            className="h-10 sm:h-16 w-auto"
          />
        </Link>

        {/* Spacer izquierda en desktop para balancear el flex */}
        <div className="hidden sm:block flex-shrink-0 w-[120px]" aria-hidden="true" />

        {/* Carrito a la derecha en desktop */}
        <button
          onClick={openCart}
          className="hidden sm:flex items-center justify-end gap-2 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors relative flex-shrink-0 w-[120px]"
          aria-label="Abrir carrito"
        >
          <ShoppingCart size={24} className="text-gray-800" />
          <span className="text-sm font-semibold text-gray-800">Carrito</span>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>

        {/* Spacer derecha en mobile para balancear el carrito izquierdo */}
        <div className="block sm:hidden flex-shrink-0 w-9" aria-hidden="true" />
      </div>
    </header>
  );
}
