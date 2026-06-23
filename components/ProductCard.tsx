'use client';

import { Producto } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { DollarSign, Package, Calendar, Building2 } from 'lucide-react';

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col border-l-4 border-l-green-600 hover:shadow-lg transition-shadow">
      {/* Foto del producto */}
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
            <span className="text-gray-500 text-sm">Sin imagen</span>
          </div>
        )}
        {isAboutToExpire && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            VENCE PRONTO
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Nombre del producto */}
        <Link href={`/productos/${producto.id}`}>
          <h3 className="font-bold text-lg sm:text-xl text-black mb-4 hover:text-gray-700 transition-colors line-clamp-2">
            {producto.nombre}
          </h3>
        </Link>

        {/* Información con iconos */}
        <div className="space-y-3 mb-4 flex-1">
          {/* Precio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-gray-400" />
              <span className="text-gray-500 font-semibold text-xs sm:text-sm">PRECIO</span>
            </div>
            <span className="text-green-600 font-bold text-sm sm:text-base">${producto.precio.toFixed(2)}</span>
          </div>

          {/* Stock */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={16} className="text-gray-400" />
              <span className="text-gray-500 font-semibold text-xs sm:text-sm">STOCK</span>
            </div>
            <span className={`font-bold text-sm sm:text-base ${isOutOfStock ? 'text-red-600' : 'text-red-600'}`}>
              {isOutOfStock ? 'Sin stock' : `${producto.stock} unidades`}
            </span>
          </div>

          {/* Vencimiento */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-gray-500 font-semibold text-xs sm:text-sm">VENCE</span>
            </div>
            <span className="text-orange-600 font-semibold text-sm sm:text-base">
              {vencimiento.toLocaleDateString('es-AR')}
            </span>
          </div>

          {/* Laboratorio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-gray-400" />
              <span className="text-gray-500 font-semibold text-xs sm:text-sm">LAB</span>
            </div>
            <span className="text-green-600 font-semibold text-sm sm:text-base">Producto</span>
          </div>
        </div>

        {/* Controles de cantidad y compra */}
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
