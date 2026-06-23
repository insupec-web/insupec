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
        <a href="/productos" className="text-[#4ca82b] hover:underline font-semibold">
          Continuar comprando
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Resumen del Carrito</h2>

      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
            {item.foto_url && (
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image
                  src={item.foto_url}
                  alt={item.nombre}
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
              <p className="text-gray-600">${item.precio.toFixed(2)}</p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                  className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right flex flex-col items-end justify-between">
              <span className="font-semibold text-gray-800">${(item.precio * item.cantidad).toFixed(2)}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-300 pt-4 space-y-3">
        <div className="flex justify-between text-lg">
          <span className="font-semibold">Subtotal:</span>
          <span className="font-bold text-[#4ca82b]">${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Cantidad de items:</span>
          <span>{items.reduce((sum, item) => sum + item.cantidad, 0)}</span>
        </div>
      </div>

      <a
        href="/checkout"
        className="w-full mt-6 bg-[#4ca82b] text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors block text-center"
      >
        IR A CHECKOUT
      </a>
    </div>
  );
}
