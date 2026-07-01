'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import { formatPrice } from '@/lib/formatPrice';
import { compressImage } from '@/lib/compressImage';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import Link from 'next/link';
import { Edit2, Trash2, Plus, Search, X } from 'lucide-react';
import TrafficStats from '@/components/TrafficStats';

function AdminDashboardContent() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<string | null>(null);
  const [sortName, setSortName] = useState<'asc' | 'desc' | null>(null);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [editFormData, setEditFormData] = useState({ nombre: '', precio: '', stock: '', foto_url: '' });
  const [editingImage, setEditingImage] = useState<File | null>(null);

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

  const openEditModal = (producto: Producto) => {
    setEditingProducto(producto);
    setEditFormData({
      nombre: producto.nombre,
      precio: producto.precio.toString(),
      stock: (producto.cantidad ?? producto.stock ?? 0).toString(),
      foto_url: producto.foto_url || '',
    });
    setEditingImage(null);
  };

  const closeEditModal = () => {
    setEditingProducto(null);
    setEditFormData({ nombre: '', precio: '', stock: '', foto_url: '' });
    setEditingImage(null);
  };

  const handleSaveEdit = async () => {
    if (!editingProducto) return;

    try {
      let fotoUrl = editFormData.foto_url;

      if (editingImage) {
        const compressed = await compressImage(editingImage);
        const fileName = `${editingProducto.id}-${Date.now()}`;
        const { error: uploadError, data } = await supabase.storage
          .from('productos')
          .upload(fileName, compressed, { upsert: true, cacheControl: '31536000', contentType: compressed.type });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from('productos').getPublicUrl(fileName);
        fotoUrl = publicData.publicUrl;
      }

      const { error } = await supabase
        .from('productos')
        .update({
          nombre: editFormData.nombre,
          precio: parseFloat(editFormData.precio),
          stock: parseInt(editFormData.stock),
          foto_url: fotoUrl,
        })
        .eq('id', editingProducto.id);

      if (error) throw error;

      setProductos((prev) =>
        prev.map((p) =>
          p.id === editingProducto.id
            ? {
                ...p,
                nombre: editFormData.nombre,
                precio: parseFloat(editFormData.precio),
                stock: parseInt(editFormData.stock),
                foto_url: fotoUrl,
              }
            : p
        )
      );

      closeEditModal();
    } catch (err) {
      console.error('Error updating producto:', err);
      alert('Error al actualizar el producto');
    }
  };

  const laboratorios = Array.from(new Set(productos.map((p) => p.laboratorio).filter(Boolean))).sort();

  let productosFiltrados = productos.filter((p) => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.laboratorio.toLowerCase().includes(busqueda.toLowerCase());
    const matchLaboratorio = !selectedLaboratorio || p.laboratorio === selectedLaboratorio;
    return matchBusqueda && matchLaboratorio;
  });

  if (sortName) {
    productosFiltrados = [...productosFiltrados].sort((a, b) => {
      const nameA = a.nombre.toLowerCase();
      const nameB = b.nombre.toLowerCase();
      return sortName === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }

  return (
    <>
      <AdminNav />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
        <TrafficStats />

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

        <div className="mb-6 sm:mb-8 space-y-4">
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

          {laboratorios.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-700">Laboratorio:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedLaboratorio(null)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    !selectedLaboratorio
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Todos
                </button>
                {laboratorios.map((lab) => (
                  <button
                    key={lab}
                    onClick={() => setSelectedLaboratorio(selectedLaboratorio === lab ? null : lab)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      selectedLaboratorio === lab
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {lab}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-700">Ordenar:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSortName(sortName === 'asc' ? null : 'asc')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  sortName === 'asc'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                A → Z
              </button>
              <button
                onClick={() => setSortName(sortName === 'desc' ? null : 'desc')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  sortName === 'desc'
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Z → A
              </button>
            </div>
          </div>

          {(selectedLaboratorio || sortName) && (
            <button
              onClick={() => {
                setSelectedLaboratorio(null);
                setSortName(null);
              }}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
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
                        <img
                          src={producto.foto_url}
                          alt={producto.nombre}
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">Sin foto</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-800 text-sm truncate">{producto.nombre}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-800 font-semibold text-sm">${formatPrice(producto.precio)}</td>
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
                        <button
                          onClick={() => openEditModal(producto)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 size={18} className="sm:w-5 sm:h-5" />
                        </button>
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

        {/* Modal de Edición */}
        {editingProducto && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">Editar Producto</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {editFormData.foto_url && (
                  <div className="mb-4 bg-gray-50 rounded-lg">
                    <img src={editFormData.foto_url} alt={editFormData.nombre} className="w-full h-40 object-contain rounded-lg" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setEditingImage(e.target.files[0]);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setEditFormData({ ...editFormData, foto_url: event.target?.result as string });
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={editFormData.nombre}
                    onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.precio}
                    onChange={(e) => setEditFormData({ ...editFormData, precio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={editFormData.stock}
                    onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors text-sm"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={closeEditModal}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
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
