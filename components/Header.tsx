'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

export default function Header() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        {/* Carrito a la izquierda en mobile */}
        <Link
          href="/carrito"
          className="flex sm:hidden items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors relative"
        >
          <ShoppingCart size={20} className="text-black" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>

        {/* Logo centrado */}
        <Link href="/productos" className="flex-1 flex justify-center">
          <Image
            src="/logo.svg"
            alt="INSUPEC"
            width={280}
            height={120}
            priority
            className="h-20 sm:h-28 w-auto"
          />
        </Link>

        {/* Carrito a la derecha en desktop */}
        <Link
          href="/carrito"
          className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors relative"
        >
          <ShoppingCart size={24} className="text-black" />
          {itemCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
