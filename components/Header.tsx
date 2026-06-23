'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ShoppingCart } from 'lucide-react';

export default function Header() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/productos" className="flex-1">
          <div className="text-2xl font-bold text-[#4ca82b]">INSUPEC</div>
        </Link>

        <Link
          href="/carrito"
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors relative"
        >
          <ShoppingCart size={24} className="text-[#4ca82b]" />
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
