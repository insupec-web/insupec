'use client';

import { Producto } from '@/lib/supabase';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { formatMesAnio } from '@/lib/format';
import { formatPrice } from '@/lib/formatPrice';
import { Package, Calendar, Plus, Minus, ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ producto }: { producto: Producto }) {
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const { addItem } = useCart();

  const vencimiento = producto.vencimiento ? new Date(producto.vencimiento) : null;
  const hoy = new Date();
  const diasParaVencer = vencimiento ? Math.floor((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)) : null;

  const stock = producto.cantidad ?? producto.stock ?? 0;
  const isLowStock = stock < 5 && stock > 0;
  const isOutOfStock = stock === 0;
  const isAboutToExpire = diasParaVencer !== null && diasParaVencer <= 7 && diasParaVencer >= 0;

  const handleAddToCart = () => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: quantity,
      foto_url: producto.foto_url,
      moneda: producto.moneda || 'ARS',
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
    setQuantity(1);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col hover:border-brand-500 hover:shadow-xl transition-all duration-300">
      {/* Foto del producto */}
      <Link href={`/productos/${producto.id}`} className="relative block h-44 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {producto.foto_url ? (
          <img
            src={producto.foto_url}
            alt={producto.nombre}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-gray-300" />
          </div>
        )}

        {/* Badges mejorados */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isAboutToExpire && (
            <span className="bg-red-500 text-white px-2.5 py-1 rounded-full text-[11px] font-bold">🔴 VENCE PRONTO</span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-amber-500 text-white px-2.5 py-1 rounded-full text-[11px] font-bold">⚡ ÚLTIMAS UNIDADES</span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-700 text-white px-2.5 py-1 rounded-full text-[11px] font-bold">❌ AGOTADO</span>
          )}
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <span className="text-xs font-semibold text-gray-800">4.8</span>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {/* Nombre del producto */}
        <Link href={`/productos/${producto.id}`} className="mb-2">
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 hover:text-brand-600 transition-colors line-clamp-2">
            {producto.nombre}
          </h3>
        </Link>

        {/* Laboratorio */}
        <p className="text-xs text-gray-500 mb-3 font-medium">{producto.laboratorio}</p>

        {/* Precio destacado */}
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-brand-600">${formatPrice(producto.precio)}</span>
          <span className="text-xs text-gray-500">ARS</span>
        </div>

        {/* Metadatos */}
        <div className="flex flex-col gap-2 text-xs text-gray-600 mb-4 flex-1">
          <div className="flex items-center gap-1">
            <Package size={13} className={isOutOfStock ? 'text-red-500' : 'text-brand-600'} />
            <span className={isOutOfStock ? 'text-red-600 font-semibold' : ''}>
              {isOutOfStock ? 'Sin stock' : `${stock} disponibles`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={13} className={isAboutToExpire ? 'text-red-500' : 'text-brand-600'} />
            <span className={isAboutToExpire ? 'text-red-600 font-semibold' : ''}>
              {vencimiento ? formatMesAnio(producto.vencimiento) : 'Sin vencimiento'}
            </span>
          </div>
        </div>

        {/* Controles de cantidad y compra */}
        <div className="flex gap-2 mt-auto">
          <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={isOutOfStock || quantity <= 1}
              className="p-1.5 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus size={14} />
            </button>
            <span className="w-7 text-center text-sm font-bold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              disabled={isOutOfStock || quantity >= stock}
              className="p-1.5 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1 ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : addedFeedback
                  ? 'bg-green-500 text-white'
                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg'
            }`}
          >
            <ShoppingCart size={16} />
            {addedFeedback ? '✓ Agregado' : 'Comprar'}
          </button>
        </div>
      </div>
    </div>
  );
}
