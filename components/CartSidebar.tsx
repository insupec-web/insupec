'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import { Trash2, ShoppingCart } from 'lucide-react';

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
        <div className="mb-4 flex justify-center">
          <ShoppingCart size={48} className="text-gray-300" />
        </div>
        <p className="text-gray-500 mb-2 text-base sm:text-lg font-semibold">Tu carrito está vacío</p>
        <p className="text-gray-400 text-sm mb-6">Agrega productos para comenzar a comprar</p>
        <a href="/productos" className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold text-sm sm:text-base">
          Ir al Catálogo
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 w-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Resumen del Carrito</h2>
        <span className="bg-black text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
          {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
        </span>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-72 sm:max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200 hover:bg-gray-50 p-2 rounded transition-colors">
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
              <p className="text-green-600 font-bold text-sm">${item.precio.toFixed(2)}</p>

              <div className="flex items-center gap-2 mt-2 bg-gray-100 w-fit rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                  className="px-2 py-1 hover:bg-white rounded transition-colors text-sm font-bold"
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span className="w-6 text-center font-bold text-sm">{item.cantidad}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                  className="px-2 py-1 hover:bg-white rounded transition-colors text-sm font-bold"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right flex flex-col items-end justify-between">
              <span className="font-bold text-gray-800 text-sm sm:text-base">${(item.precio * item.cantidad).toFixed(2)}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors"
                aria-label="Eliminar producto"
              >
                <Trash2 size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-300 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
        <div className="flex justify-between text-base sm:text-lg">
          <span className="font-semibold text-gray-700">Subtotal:</span>
          <span className="font-bold text-green-600 text-lg sm:text-xl">${total.toFixed(2)}</span>
        </div>

        <div className="space-y-2">
          <a
            href="/checkout"
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors block text-center text-sm sm:text-base"
          >
            IR A CHECKOUT
          </a>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
          >
            Limpiar Carrito
          </button>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 text-center max-w-sm w-full">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">¿Limpiar carrito?</h3>
            <p className="text-gray-600 mb-6 text-sm">Se eliminarán todos los productos del carrito.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
