'use client';

import { Producto } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Package, Calendar, Plus, Minus } from 'lucide-react';

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
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col hover:border-brand-500 hover:shadow-lg transition-all duration-200">
      {/* Foto del producto */}
      <Link href={`/productos/${producto.id}`} className="relative block h-40 sm:h-48 bg-white overflow-hidden">
        {producto.foto_url ? (
          <Image
            src={producto.foto_url}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package size={40} className="text-gray-300" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock && (
            <span className="bg-gray-800 text-white px-2 py-1 rounded-md text-[10px] font-bold tracking-wide">SIN STOCK</span>
          )}
          {isLowStock && (
            <span className="bg-amber-500 text-white px-2 py-1 rounded-md text-[10px] font-bold tracking-wide">ÚLTIMAS UNIDADES</span>
          )}
          {isAboutToExpire && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-md text-[10px] font-bold tracking-wide">VENCE PRONTO</span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {/* Nombre del producto */}
        <Link href={`/productos/${producto.id}`}>
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 hover:text-brand-700 transition-colors line-clamp-2 min-h-[2.75rem]">
            {producto.nombre}
          </h3>
        </Link>

        {/* Precio destacado */}
        <div className="mb-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-brand-600">${producto.precio.toFixed(2)}</span>
        </div>

        {/* Metadatos compactos */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-4 flex-1">
          <span className="inline-flex items-center gap-1">
            <Package size={14} className={isOutOfStock ? 'text-red-500' : 'text-gray-400'} />
            <span className={isOutOfStock ? 'text-red-600 font-semibold' : ''}>
              {isOutOfStock ? 'Sin stock' : `${producto.stock} u.`}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={14} className={isAboutToExpire ? 'text-red-500' : 'text-gray-400'} />
            <span className={isAboutToExpire ? 'text-red-600 font-semibold' : ''}>
              {vencimiento.toLocaleDateString('es-AR')}
            </span>
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600 font-medium">{producto.laboratorio}</span>
        </div>

        {/* Controles de cantidad y compra */}
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={isOutOfStock || quantity <= 1}
              className="px-2 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-semibold select-none">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(producto.stock, q + 1))}
              disabled={isOutOfStock || quantity >= producto.stock}
              className="px-2 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-brand-600 text-white hover:bg-brand-700'
            }`}
          >
            {isOutOfStock ? 'SIN STOCK' : 'AGREGAR'}
          </button>
        </div>
      </div>
    </div>
  );
}
