'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductos() {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setProductos(data || []);
      } catch (err) {
        console.error('Error fetching productos:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <p className="text-gray-600 mt-2">Asegúrate de que Supabase esté configurado correctamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Catálogo de Productos</h1>
      <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Bienvenido a INSUPEC. Selecciona los productos que necesitas.</p>

      {productos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-base sm:text-lg">No hay productos disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
