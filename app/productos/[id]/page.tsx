'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProductoDetailPage({ params }: { params: { id: string } }) {
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    async function fetchProducto() {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('id', params.id)
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
  }, [params.id]);

  const handleAddToCart = () => {
    if (producto) {
      addItem({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: quantity,
        foto_url: producto.foto_url,
      });
      router.push('/carrito');
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/productos" className="text-[#4ca82b] hover:underline flex items-center gap-2 mb-8">
        <ArrowLeft size={20} />
        Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
          {producto.foto_url ? (
            <Image src={producto.foto_url} alt={producto.nombre} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{producto.nombre}</h1>

            <div className="mb-6">
              <span className="text-4xl font-bold text-black">${producto.precio.toFixed(2)}</span>
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Vencimiento:</span> {vencimiento.toLocaleDateString('es-AR')}
              </p>
              {diasParaVencer <= 7 && diasParaVencer >= 0 && (
                <p className="text-red-600 font-semibold">⚠️ Este producto vence pronto</p>
              )}
              <p className={`font-semibold ${isOutOfStock ? 'text-red-600' : producto.stock < 5 ? 'text-orange-600' : 'text-green-600'}`}>
                {isOutOfStock ? 'SIN STOCK' : `Stock disponible: ${producto.stock} unidades`}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-700">Cantidad:</label>
              <input
                type="number"
                min="1"
                max={producto.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.min(producto.stock, Math.max(1, parseInt(e.target.value) || 1)))
                }
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center"
                disabled={isOutOfStock}
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isOutOfStock ? 'SIN STOCK' : 'AGREGAR AL CARRITO'}
            </button>

            <Link
              href="/carrito"
              className="w-full py-3 rounded-lg font-bold text-lg text-center border-2 border-black text-black hover:bg-gray-100 transition-colors"
            >
              IR AL CARRITO
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
