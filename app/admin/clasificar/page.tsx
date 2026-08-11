'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { Sparkles, Check, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProductoConClasificacion extends Producto {
  categoriaIA?: string;
  explicacion?: string;
  confirmada?: boolean;
}

function ClasificarProductosContent() {
  const [productos, setProductos] = useState<ProductoConClasificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [clasificando, setClasificando] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const CATEGORIAS = [
    'Animales de Compañía',
    'Grandes Animales',
    'Solar',
    'Instrumental',
    'Limpieza',
  ];

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

  const productosParaClasificar = productos.filter((p) => !p.categoria || p.categoria === '');

  const clasificarActual = async () => {
    if (currentIndex >= productosParaClasificar.length) return;

    const producto = productosParaClasificar[currentIndex];
    setClasificando(true);
    setError(null);

    try {
      const response = await fetch('/api/clasificar/producto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: producto.nombre,
          laboratorio: producto.laboratorio,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la clasificación');
      }

      const data = await response.json();

      setProductos((prev) =>
        prev.map((p) =>
          p.id === producto.id
            ? {
                ...p,
                categoriaIA: data.categoria,
                explicacion: data.explicacion,
                confirmada: false,
              }
            : p
        )
      );
    } catch (err) {
      console.error('Error clasificando:', err);
      setError('Error al clasificar. Intenta de nuevo.');
    } finally {
      setClasificando(false);
    }
  };

  const confirmarCategoria = async (categoria: string) => {
    const producto = productosParaClasificar[currentIndex];
    setGuardando(true);

    try {
      const { error: err } = await supabase
        .from('productos')
        .update({ categoria })
        .eq('id', producto.id);

      if (err) throw err;

      setProductos((prev) =>
        prev.map((p) =>
          p.id === producto.id
            ? { ...p, categoria, confirmada: true }
            : p
        )
      );

      // Pasar al siguiente
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setClasificando(false);
      }, 500);
    } catch (err) {
      console.error('Error guardando:', err);
      setError('Error al guardar la categoría');
    } finally {
      setGuardando(false);
    }
  };

  const saltarProducto = () => {
    setCurrentIndex((prev) => prev + 1);
    setClasificando(false);
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </>
    );
  }

  if (productosParaClasificar.length === 0) {
    return (
      <>
        <AdminNav />
        <div className="max-w-4xl mx-auto px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-6">
            <ArrowLeft size={18} />
            Volver al Dashboard
          </Link>

          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">¡Todo clasificado!</h2>
            <p className="text-green-800 mb-6">Todos los productos tienen categoría asignada.</p>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>{productos.length}</strong> productos en total</p>
              <p><strong>{productos.filter((p) => p.categoria).length}</strong> con categoría</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const productoActual = productosParaClasificar[currentIndex];
  const progreso = ((currentIndex + 1) / productosParaClasificar.length) * 100;

  return (
    <>
      <AdminNav />

      <div className="max-w-3xl mx-auto px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-6">
          <ArrowLeft size={18} />
          Volver al Dashboard
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={28} className="text-brand-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Clasificar Productos</h1>
              <p className="text-gray-600 text-sm">Usando IA para asignar categorías automáticamente</p>
            </div>
          </div>

          <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {currentIndex + 1} de {productosParaClasificar.length}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {productoActual && (
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{productoActual.nombre}</h2>
              <p className="text-gray-600">
                <strong>Laboratorio:</strong> {productoActual.laboratorio || 'N/A'}
              </p>
            </div>

            {!productoActual.categoriaIA ? (
              <div className="space-y-4">
                <button
                  onClick={clasificarActual}
                  disabled={clasificando}
                  className={`w-full py-4 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${
                    clasificando
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Sparkles size={20} />
                  {clasificando ? 'Analizando...' : 'Clasificar con IA'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>Sugerencia de IA:</strong>
                  </p>
                  <p className="text-lg font-bold text-blue-600 mb-2">
                    {productoActual.categoriaIA}
                  </p>
                  <p className="text-sm text-blue-700 italic">
                    {productoActual.explicacion}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">¿Es correcta esta clasificación?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => confirmarCategoria(productoActual.categoriaIA!)}
                      disabled={guardando}
                      className={`flex-1 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${
                        guardando
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      <Check size={20} />
                      {guardando ? 'Guardando...' : 'Sí, es correcta'}
                    </button>
                    <button
                      onClick={saltarProducto}
                      disabled={guardando}
                      className="flex-1 py-3 rounded-lg font-bold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={20} />
                      No, cambiar
                    </button>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">O seleccionar manualmente:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Animales de Compañía', 'Grandes Animales', 'Solar', 'Instrumental', 'Limpieza'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => confirmarCategoria(cat)}
                          disabled={guardando}
                          className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                            cat === productoActual.categoriaIA
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function CheckCircle({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function ClasificarProductosPage() {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-white">
        <ClasificarProductosContent />
      </div>
    </ProtectedAdminRoute>
  );
}
