'use client';

import { Pack, Producto } from '@/lib/supabase';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Package, Plus } from 'lucide-react';

export default function PackCard({ pack, productos }: { pack: Pack; productos: Producto[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { addItem } = useCart();

  const handleAddPackToCart = () => {
    productos.forEach((producto) => {
      addItem({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        foto_url: producto.foto_url,
      });
    });
    setIsExpanded(false);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden h-full flex flex-col hover:border-brand-500 hover:shadow-lg transition-all duration-200">
      {/* Foto del pack */}
      <div className="relative block h-40 sm:h-48 bg-white overflow-hidden cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        {pack.foto_url ? (
          <img
            src={pack.foto_url}
            alt={pack.nombre}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Package size={40} className="text-gray-300" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Nombre del pack */}
        <h3
          className="font-semibold text-base sm:text-lg text-gray-900 mb-2 hover:text-brand-700 transition-colors line-clamp-2 min-h-[2.75rem] cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {pack.nombre}
        </h3>

        {/* Descripción */}
        {pack.descripcion && <p className="text-xs text-gray-600 mb-3 line-clamp-2">{pack.descripcion}</p>}

        {/* Precio destacado */}
        <div className="mb-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-brand-600">${pack.precio.toFixed(2)}</span>
        </div>

        {/* Botón para expandir/contraer */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-3 w-full py-2 text-sm font-semibold text-brand-600 border border-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
        >
          {isExpanded ? 'Ocultar productos' : 'Ver productos'}
        </button>

        {/* Lista de productos (expandible) */}
        {isExpanded && (
          <div className="mb-4 bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-700 mb-2">Productos incluidos:</p>
            <div className="space-y-1">
              {productos.map((producto) => (
                <div key={producto.id} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-brand-600 mt-0.5">•</span>
                  <span className="flex-1">{producto.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón agregar al carrito */}
        <button
          onClick={handleAddPackToCart}
          className="w-full py-2.5 rounded-lg font-semibold text-sm bg-brand-600 text-white hover:bg-brand-700 transition-colors mt-auto"
        >
          <Plus size={16} className="inline mr-1" />
          Agregar Pack
        </button>
      </div>
    </div>
  );
}
