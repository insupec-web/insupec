'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import AdminNav from '@/components/AdminNav';
import Image from 'next/image';
import Link from 'next/link';
import { Edit2, Trash2, Plus } from 'lucide-react';

export default function AdminDashboardPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-white">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Dashboard de Productos</h1>
          <Link
            href="/admin/dashboard/nuevo"
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            Crear Producto
          </Link>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No hay productos disponibles</p>
            <Link href="/admin/dashboard/nuevo" className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
              Crear el primer producto
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-800">Foto</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-800">Nombre</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-800">Precio</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-800">Stock</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-800">Vencimiento</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-800">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {producto.foto_url ? (
                          <div className="relative w-12 h-12">
                            <Image
                              src={producto.foto_url}
                              alt={producto.nombre}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">Sin foto</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-800">{producto.nombre}</td>
                      <td className="px-6 py-4 text-gray-800 font-semibold">${producto.precio.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            producto.stock === 0
                              ? 'bg-red-100 text-red-800'
                              : producto.stock < 5
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {producto.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800">{new Date(producto.vencimiento).toLocaleDateString('es-AR')}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <Link
                            href={`/admin/dashboard/${producto.id}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit2 size={20} />
                          </Link>
                          <button
                            onClick={() => handleDelete(producto.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
