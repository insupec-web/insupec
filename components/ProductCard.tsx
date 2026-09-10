'use client';

import { Producto } from '@/lib/supabase';
import { formatMesAnio } from '@/lib/format';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { formatPrice, toTitleCase } from '@/lib/formatPrice';
import { Package, Plus, Minus, ShoppingCart, CheckCircle } from 'lucide-react';

export default function ProductCard({ producto }: { producto: Producto }) {
  const [qtyText, setQtyText] = useState('1');
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem, items } = useCart();

  const stock = producto.stock ?? 0;
  const isLowStock = stock < 5 && stock > 0;
  const isOutOfStock = stock === 0;

  const enCarrito = items.find((i) => i.id === producto.id)?.cantidad ?? 0;
  const quantity = Math.min(Math.max(parseInt(qtyText, 10) || 1, 1), Math.max(stock, 1));

  const setQuantity = (n: number) => setQtyText(String(Math.min(Math.max(n, 1), Math.max(stock, 1))));

  const handleAddToCart = () => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: quantity,
      foto_url: producto.foto_url,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
    setQtyText('1');
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden h-full flex flex-col hover:border-brand-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Foto del producto */}
      <Link href={`/productos/${producto.id}`} className="relative block h-44 sm:h-52 bg-gradient-to-br from-brand-50 to-gray-50 overflow-hidden">
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
        {enCarrito > 0 && (
          <span className="absolute top-3 left-3 bg-brand-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
            {enCarrito} en carrito
          </span>
        )}
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isLowStock && !isOutOfStock && (
            <span className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">⚡ ÚLTIMAS</span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-800 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">❌ AGOTADO</span>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        {/* Nombre del producto */}
        <Link href={`/productos/${producto.id}`}>
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-3 hover:text-brand-700 transition-colors line-clamp-2 min-h-[2.75rem]">
            {toTitleCase(producto.nombre)}
          </h3>
        </Link>

        {/* Precio destacado */}
        <div className="mb-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-brand-600">${formatPrice(producto.precio)}</span>
        </div>

        {/* Metadatos compactos */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-4 flex-1">
          <span className="inline-flex items-center gap-1">
            <Package size={14} className={isOutOfStock ? 'text-red-500' : 'text-gray-400'} />
            <span className={isOutOfStock ? 'text-red-600 font-semibold' : ''}>
              {isOutOfStock ? 'Sin stock' : `${stock} u.`}
            </span>
          </span>
          <span className="text-gray-600 font-medium">{producto.laboratorio}</span>
          {producto.vencimiento && (
            <span className="text-gray-600 font-medium">Vto: {formatMesAnio(producto.vencimiento)}</span>
          )}
        </div>

        {/* Controles de cantidad y compra */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-stretch border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity(quantity - 1)}
              disabled={isOutOfStock || quantity <= 1}
              className="px-2 py-1.5 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus size={14} />
            </button>
            <input
              type="text"
              inputMode="numeric"
              value={qtyText}
              onChange={(e) => setQtyText(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onBlur={() => setQtyText(String(quantity))}
              onFocus={(e) => e.currentTarget.select()}
              disabled={isOutOfStock}
              className="flex-1 w-full min-w-0 text-center text-sm font-bold bg-transparent focus:outline-none focus:bg-white disabled:cursor-not-allowed"
              aria-label="Cantidad"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              disabled={isOutOfStock || quantity >= stock}
              className="px-2 py-1.5 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : addedToCart
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-brand-600 text-white hover:bg-brand-700 hover:-translate-y-0.5'
            }`}
          >
            {addedToCart ? (
              <>
                <CheckCircle size={16} />
                <span>Agregado</span>
              </>
            ) : isOutOfStock ? (
              'AGOTADO'
            ) : (
              <>
                <ShoppingCart size={16} />
                <span>Comprar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
