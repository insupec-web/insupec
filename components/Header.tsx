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
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/productos" className="flex-1">
          <Image
            src="/logo.jpg"
            alt="INSUPEC"
            width={120}
            height={50}
            priority
            className="h-12 w-auto"
          />
        </Link>

        <Link
          href="/carrito"
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors relative"
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
