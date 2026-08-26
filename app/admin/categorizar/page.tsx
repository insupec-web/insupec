'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { CATEGORIAS } from '@/lib/categorias';

function CategorizarContent() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function fetchProductos() {
      try {
        const { data, error: err } = await supabase
          .from('productos')
          .select('*')
          .order('nombre');

        if (err) throw err;
        setProductos(data || []);
      } catch (err) {
        console.error('Error fetching productos:', err);
        setError('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, []);

  const productosParaCategorizar = productos.filter((p) => !p.categoria || p.categoria === '');

  const guardarCategoria = async (categoria: string) => {
    if (currentIndex >= productosParaCategorizar.length) return;

    const producto = productosParaCategorizar[currentIndex];
    setGuardando(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('productos')
        .update({ categoria })
        .eq('id', producto.id);

      if (err) throw err;

      // Actualizar lista local
      setProductos((prev) =>
        prev.map((p) =>
          p.id === producto.id ? { ...p, categoria } : p
        )
      );

      // Pasar al siguiente
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error('Error guardando:', err);
      setError('Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </>
    );
  }

  if (productosParaCategorizar.length === 0) {
    return (
      <>
        <AdminNav />
        <div className="max-w-4xl mx-auto px-4 pt-20 sm:pt-28 pb-8">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-6">
            <ArrowLeft size={18} />
            Volver
          </Link>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-green-900 mb-2">¡Todo categorizado!</h2>
            <p className="text-green-800 text-lg">Todos los {productos.length} productos tienen categoría</p>
          </div>
        </div>
      </>
    );
  }

  const productoActual = productosParaCategorizar[currentIndex];
  const progreso = ((currentIndex + 1) / productosParaCategorizar.length) * 100;

  return (
    <>
      <AdminNav />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-8">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-8">
          <ArrowLeft size={18} />
          Volver
        </Link>

        {/* Progress */}
        <div className="mb-8">
          <div className="bg-gray-200 h-3 rounded-full overflow-hidden mb-3">
            <div
              className="bg-brand-600 h-full transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 font-semibold">
            {currentIndex + 1} de {productosParaCategorizar.length}
          </p>
        </div>

        {/* Producto actual */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{productoActual.nombre}</h2>
          <p className="text-gray-600 text-lg">
            <strong>Lab:</strong> {productoActual.laboratorio || 'N/A'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Categorías - Grid de botones grandes */}
        <div className="grid grid-cols-1 gap-3">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => guardarCategoria(cat)}
              disabled={guardando}
              className="w-full py-4 px-6 bg-brand-600 text-white font-bold text-lg rounded-xl hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {guardando ? '⏳ Guardando...' : cat}
            </button>
          ))}
        </div>

        {/* Info */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Toca la categoría y pasa al siguiente producto automáticamente
        </p>
      </div>
    </>
  );
}

export default function CategorizarPage() {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <CategorizarContent />
      </div>
    </ProtectedAdminRoute>
  );
}
