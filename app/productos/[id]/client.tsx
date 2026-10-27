'use client';

import { useState } from 'react';
import { Producto } from '@/lib/supabase';
import { formatMesAnio } from '@/lib/format';
import { useCart } from '@/hooks/useCart';
import { formatPrice, toTitleCase } from '@/lib/formatPrice';
import { Package, Plus, Minus } from 'lucide-react';

export default function ProductoDetailClient({ producto }: { producto: Producto }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCart();

  const cantidadDisponible = producto.stock ?? 0;
  const isOutOfStock = cantidadDisponible === 0;

  const handleAddToCart = () => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: quantity,
      foto_url: producto.foto_url,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
      <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200">
        {producto.foto_url ? (
          <img src={producto.foto_url} alt={producto.nombre} className="w-full h-full object-contain p-6" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={64} className="text-gray-300" />
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{toTitleCase(producto.nombre)}</h1>

        <div className="mb-6">
          <span className="text-4xl font-extrabold text-brand-600">${formatPrice(producto.precio)}</span>
        </div>

        <div className="space-y-3 mb-8 border-t border-b border-gray-100 py-5">
          <div className="flex items-center gap-3 text-sm">
            <Package size={18} className={isOutOfStock ? 'text-red-500' : 'text-gray-400'} />
            <span className="text-gray-500">Stock:</span>
            <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : cantidadDisponible < 5 ? 'text-amber-600' : 'text-brand-600'}`}>
              {isOutOfStock ? 'Sin stock' : `${cantidadDisponible} unidades disponibles`}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Laboratorio:</span>
            <span className="font-semibold text-gray-800 ml-2">{producto.laboratorio}</span>
          </div>
          {producto.vencimiento && (
            <div className="text-sm">
              <span className="text-gray-500">Vencimiento:</span>
              <span className="font-semibold text-gray-800 ml-2">{formatMesAnio(producto.vencimiento)}</span>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700 text-sm">Cantidad</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={isOutOfStock || quantity <= 1}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Disminuir cantidad"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(cantidadDisponible, q + 1))}
                disabled={isOutOfStock || quantity >= cantidadDisponible}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Aumentar cantidad"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-3.5 rounded-xl font-bold text-lg transition-colors ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
          >
            {isOutOfStock ? 'SIN STOCK' : 'AGREGAR AL CARRITO'}
          </button>

          <button
            onClick={openCart}
            className="w-full py-3 rounded-xl font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Ver carrito
          </button>
        </div>
      </div>
    </div>
  );
}
