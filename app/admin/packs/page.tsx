'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase, Pack } from '@/lib/supabase';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import Link from 'next/link';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';

function AdminPacksContent() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const { data, error } = await supabase.from('packs').select('*').order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPacks(data || []);
    } catch (err) {
      console.error('Error fetching packs:', err);
      setError('Error al cargar los packs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este pack?')) {
      return;
    }

    try {
      const { error } = await supabase.from('packs').delete().eq('id', id);

      if (error) {
        throw error;
      }

      setPacks((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting pack:', err);
      alert('Error al eliminar el pack');
    }
  };

  const packsFiltrados = packs.filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <>
      <AdminNav />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Dashboard de Packs</h1>
          <Link
            href="/admin/packs/nuevo"
            className="flex items-center justify-center sm:justify-start gap-2 bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            Crear Pack
          </Link>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6 text-xs sm:text-sm">{error}</div>}

        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-sm sm:text-base">Cargando packs...</p>
          </div>
        ) : packsFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              {busqueda ? 'No se encontraron packs que coincidan con tu búsqueda' : 'No hay packs disponibles'}
            </p>
            {!busqueda && (
              <Link href="/admin/packs/nuevo" className="bg-black text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-800 inline-block text-sm">
                Crear el primer pack
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full min-w-max text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-800">Nombre</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-800">Precio</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-800 hidden sm:table-cell">Descripción</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {packsFiltrados.map((pack) => (
                  <tr key={pack.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-800 text-sm font-semibold truncate">{pack.nombre}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-800 font-semibold text-sm">${pack.precio.toFixed(2)}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 hidden sm:table-cell text-sm line-clamp-2">{pack.descripcion || '-'}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex gap-2 sm:gap-3">
                        <Link
                          href={`/admin/packs/${pack.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 size={18} className="sm:w-5 sm:h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(pack.id)}
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

export default function AdminPacksPage() {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-white">
        <AdminPacksContent />
      </div>
    </ProtectedAdminRoute>
  );
}
