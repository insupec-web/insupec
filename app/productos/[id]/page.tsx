'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, use } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, Plus, Minus } from 'lucide-react';
import { formatMesAnio } from '@/lib/format';

export default function ProductoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    async function fetchProducto() {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setProducto(data);
      } catch (err) {
        console.error('Error fetching producto:', err);
        setError('Producto no encontrado');
      } finally {
        setLoading(false);
      }
    }

    fetchProducto();
  }, [id]);

  const handleAddToCart = () => {
    if (producto) {
      addItem({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: quantity,
        foto_url: producto.foto_url,
      });
      // addItem ya abre el drawer del carrito automáticamente.
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-gray-600">Cargando producto...</p>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-red-600 font-semibold mb-4">{error || 'Producto no encontrado'}</p>
        <Link href="/productos" className="text-black hover:text-gray-700 flex items-center gap-2">
          <ArrowLeft size={20} />
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const vencimiento = new Date(producto.vencimiento);
  const hoy = new Date();
  const diasParaVencer = Math.floor((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  const isOutOfStock = producto.stock === 0;

  const isAboutToExpire = diasParaVencer <= 7 && diasParaVencer >= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <Link href="/productos" className="text-brand-600 hover:underline flex items-center gap-2 mb-6 sm:mb-8 text-sm font-medium">
        <ArrowLeft size={18} />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200">
          {producto.foto_url ? (
            <Image src={producto.foto_url} alt={producto.nombre} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={64} className="text-gray-300" />
            </div>
          )}
          {isAboutToExpire && (
            <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold">
              VENCE PRONTO
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{producto.nombre}</h1>

          <div className="mb-6">
            <span className="text-4xl font-extrabold text-brand-600">${producto.precio.toFixed(2)}</span>
          </div>

          <div className="space-y-3 mb-8 border-t border-b border-gray-100 py-5">
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={18} className={isAboutToExpire ? 'text-red-500' : 'text-gray-400'} />
              <span className="text-gray-500">Vencimiento:</span>
              <span className={`font-semibold ${isAboutToExpire ? 'text-red-600' : 'text-gray-800'}`}>
                {formatMesAnio(producto.vencimiento)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Package size={18} className={isOutOfStock ? 'text-red-500' : 'text-gray-400'} />
              <span className="text-gray-500">Stock:</span>
              <span className={`font-semibold ${isOutOfStock ? 'text-red-600' : producto.stock < 5 ? 'text-amber-600' : 'text-brand-600'}`}>
                {isOutOfStock ? 'Sin stock' : `${producto.stock} unidades disponibles`}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Laboratorio:</span>
              <span className="font-semibold text-gray-800 ml-2">{producto.laboratorio}</span>
            </div>
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
                  onClick={() => setQuantity((q) => Math.min(producto.stock, q + 1))}
                  disabled={isOutOfStock || quantity >= producto.stock}
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
    </div>
  );
}
