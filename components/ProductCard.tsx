'use client';

import { Producto } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';

export default function ProductCard({ producto }: { producto: Producto }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const vencimiento = new Date(producto.vencimiento);
  const hoy = new Date();
  const diasParaVencer = Math.floor((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  const isLowStock = producto.stock < 5 && producto.stock > 0;
  const isOutOfStock = producto.stock === 0;
  const isAboutToExpire = diasParaVencer <= 7 && diasParaVencer >= 0;

  const handleAddToCart = () => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: quantity,
      foto_url: producto.foto_url,
    });
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative h-40 sm:h-48 bg-gray-200 overflow-hidden">
        {producto.foto_url ? (
          <Image
            src={producto.foto_url}
            alt={producto.nombre}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500">Sin imagen</span>
          </div>
        )}
        {isAboutToExpire && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            VENCE PRONTO
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <Link href={`/productos/${producto.id}`}>
          <h3 className="font-semibold text-base sm:text-lg text-black mb-2 hover:text-gray-700 transition-colors line-clamp-2">
            {producto.nombre}
          </h3>
        </Link>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-1 sm:gap-0">
          <span className="text-lg sm:text-xl font-bold text-black">${producto.precio.toFixed(2)}</span>
          <span className={`text-xs sm:text-sm font-semibold ${isAboutToExpire ? 'text-red-600' : 'text-gray-600'}`}>
            Vence: {vencimiento.toLocaleDateString('es-AR')}
          </span>
        </div>

        <div className="mb-3 sm:mb-4">
          {isOutOfStock ? (
            <span className="text-red-600 font-bold text-xs sm:text-sm">SIN STOCK</span>
          ) : isLowStock ? (
            <span className="text-orange-600 font-bold text-xs sm:text-sm">STOCK BAJO: {producto.stock} unidades</span>
          ) : (
            <span className="text-gray-600 text-xs sm:text-sm">Stock: {producto.stock} unidades</span>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <input
            type="number"
            min="1"
            max={producto.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.min(producto.stock, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-14 sm:w-16 px-2 py-2 border border-gray-300 rounded text-center text-sm"
            disabled={isOutOfStock}
          />
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {isOutOfStock ? 'SIN STOCK' : 'AGREGAR'}
          </button>
        </div>
      </div>
    </div>
  );
}
