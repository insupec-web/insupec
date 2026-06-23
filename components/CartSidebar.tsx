'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingCart, X, Plus, Minus } from 'lucide-react';

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, clearCart, total, isOpen, closeCart } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  // Bloquear scroll del body y cerrar con Escape
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [isOpen, closeCart]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-brand-600" />
            <h2 className="text-lg font-bold text-gray-900">Tu Carrito</h2>
            {itemCount > 0 && (
              <span className="bg-brand-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={22} />
          </button>
        </div>

        {/* Contenido */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <ShoppingCart size={56} className="text-gray-200 mb-4" />
            <p className="text-gray-700 font-semibold text-lg mb-1">Tu carrito está vacío</p>
            <p className="text-gray-400 text-sm mb-6">Agregá productos para comenzar tu pedido</p>
            <button
              onClick={closeCart}
              className="bg-brand-600 text-white px-6 py-2.5 rounded-lg hover:bg-brand-700 transition-colors font-semibold text-sm"
            >
              Ver catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.foto_url ? (
                      <Image src={item.foto_url} alt={item.nombre} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart size={20} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{item.nombre}</h3>
                    <p className="text-brand-600 font-bold text-sm mt-0.5">${item.precio.toFixed(2)}</p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="px-2 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="px-2 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-gray-900 text-sm">${(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Vaciar carrito
              </button>
            </div>

            {/* Footer fijo */}
            <div className="border-t border-gray-200 px-4 sm:px-6 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Subtotal</span>
                <span className="font-extrabold text-brand-600 text-2xl">${total.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors block text-center"
              >
                Finalizar pedido
              </Link>
              <button
                onClick={closeCart}
                className="w-full text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
              >
                Seguir comprando
              </button>
            </div>
          </>
        )}

        {/* Confirmación de vaciado */}
        {showClearConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 px-4">
            <div className="bg-white rounded-xl p-6 text-center max-w-xs w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">¿Vaciar carrito?</h3>
              <p className="text-gray-500 mb-5 text-sm">Se eliminarán todos los productos.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
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
                  Vaciar
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
