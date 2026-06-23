'use client';

import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
        <a href="/productos" className="text-black hover:underline font-semibold">
          Continuar comprando
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Resumen del Carrito</h2>

      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-72 sm:max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200">
            {item.foto_url && (
              <div className="relative w-16 sm:w-20 h-16 sm:h-20 flex-shrink-0">
                <Image
                  src={item.foto_url}
                  alt={item.nombre}
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">{item.nombre}</h3>
              <p className="text-gray-600 text-sm">${item.precio.toFixed(2)}</p>

              <div className="flex items-center gap-1 sm:gap-2 mt-2">
                <button
                  onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                >
                  −
                </button>
                <span className="w-6 sm:w-8 text-center font-semibold text-sm">{item.cantidad}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right flex flex-col items-end justify-between">
              <span className="font-semibold text-gray-800 text-sm sm:text-base">${(item.precio * item.cantidad).toFixed(2)}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-300 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
        <div className="flex justify-between text-base sm:text-lg">
          <span className="font-semibold">Subtotal:</span>
          <span className="font-bold text-black">${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-gray-600">
          <span>Cantidad de items:</span>
          <span>{items.reduce((sum, item) => sum + item.cantidad, 0)}</span>
        </div>
      </div>

      <a
        href="/checkout"
        className="w-full mt-4 sm:mt-6 bg-black text-white py-2 sm:py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors block text-center text-sm sm:text-base"
      >
        IR A CHECKOUT
      </a>
    </div>
  );
}
