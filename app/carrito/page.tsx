'use client';

import CartSidebar from '@/components/CartSidebar';
import Link from 'next/link';

export default function CarritoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mi Carrito</h1>

      <div className="mb-8">
        <CartSidebar />
      </div>

      <div className="flex gap-4">
        <Link
          href="/productos"
          className="flex-1 py-3 rounded-lg font-bold text-center border-2 border-black text-black hover:bg-gray-100 transition-colors"
        >
          CONTINUAR COMPRANDO
        </Link>
      </div>
    </div>
  );
}
