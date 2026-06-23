'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import Image from 'next/image';
import Link from 'next/link';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';

function AdminDashboardContent() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const { data, error } = await supabase.from('productos').select('*').order('created_at', { ascending: false });

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
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      const { error } = await supabase.from('productos').delete().eq('id', id);

      if (error) {
        throw error;
      }

      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting producto:', err);
      alert('Error al eliminar el producto');
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.laboratorio.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <AdminNav />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Dashboard de Productos</h1>
          <Link
            href="/admin/dashboard/nuevo"
            className="flex items-center justify-center sm:justify-start gap-2 bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            Crear Producto
          </Link>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6 text-xs sm:text-sm">{error}</div>}

        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o laboratorio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-sm sm:text-base">Cargando productos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              {busqueda ? 'No se encontraron productos que coincidan con tu búsqueda' : 'No hay productos disponibles'}
            </p>
            {!busqueda && (
              <Link href="/admin/dashboard/nuevo" className="bg-black text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-800 inline-block text-sm">
                Crear el primer producto
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full min-w-max text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-800">Foto</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-800">Nombre</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-800">Precio</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-800">Stock</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-800 hidden sm:table-cell">Vencimiento</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto) => (
                  <tr key={producto.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      {producto.foto_url ? (
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                          <Image
                            src={producto.foto_url}
                            alt={producto.nombre}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">Sin foto</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-800 text-sm truncate">{producto.nombre}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-800 font-semibold text-sm">${producto.precio.toFixed(2)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      {(() => {
                        const stock = producto.cantidad ?? producto.stock ?? 0;
                        return (
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold inline-block ${
                              stock === 0
                                ? 'bg-red-100 text-red-800'
                                : stock < 5
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {stock}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-800 hidden sm:table-cell text-sm">{new Date(producto.vencimiento).toLocaleDateString('es-AR')}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex gap-2 sm:gap-3">
                        <Link
                          href={`/admin/dashboard/${producto.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 size={18} className="sm:w-5 sm:h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(producto.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={18} className="sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-white">
        <AdminDashboardContent />
      </div>
    </ProtectedAdminRoute>
  );
}
