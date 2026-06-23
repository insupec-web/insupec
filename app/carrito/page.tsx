'use client';

import CartSidebar from '@/components/CartSidebar';
import Link from 'next/link';

export default function CarritoPage() {
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Mi Carrito</h1>

      <div className="mb-6 sm:mb-8">
        <CartSidebar />
      </div>

      <div className="flex gap-3 sm:gap-4">
        <Link
          href="/productos"
          className="flex-1 py-2 sm:py-3 rounded-lg font-bold text-center text-sm sm:text-base border-2 border-black text-black hover:bg-gray-100 transition-colors"
        >
          CONTINUAR COMPRANDO
        </Link>
      </div>
    </div>
  );
}
