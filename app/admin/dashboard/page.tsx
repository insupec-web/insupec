'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import { formatPrice } from '@/lib/formatPrice';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import ProductEditModal from '@/components/ProductEditModal';
import Link from 'next/link';
import { Edit2, Trash2, Plus, Search, Sparkles, Eye, EyeOff, ChevronDown } from 'lucide-react';
import TrafficStats from '@/components/TrafficStats';
import InventoryStats from '@/components/InventoryStats';

function AdminDashboardContent() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<string | null>(null);
  const [sortName, setSortName] = useState<'asc' | 'desc' | null>(null);
  const [showOnlyZeroStock, setShowOnlyZeroStock] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [aplicandoMasivo, setAplicandoMasivo] = useState(false);
  const [expandedPublishedCategories, setExpandedPublishedCategories] = useState<Set<string>>(new Set());
  const [expandedHiddenCategories, setExpandedHiddenCategories] = useState<Set<string>>(new Set());

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

  const handleToggleActivo = async (producto: Producto) => {
    const visible = producto.activo !== false;

    // Optimista: la fila cambia al instante y se revierte si la DB rechaza.
    setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, activo: !visible } : p)));

    const { error } = await supabase
      .from('productos')
      .update({ activo: !visible })
      .eq('id', producto.id);

    if (error) {
      console.error('Error al cambiar la visibilidad:', error);
      setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, activo: visible } : p)));
      alert('No se pudo cambiar la visibilidad del producto');
    }
  };

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) {
        siguiente.delete(id);
      } else {
        siguiente.add(id);
      }
      return siguiente;
    });
  };

  // Cambia la visibilidad de todos los seleccionados en una sola consulta.
  const handleVisibilidadMasiva = async (visible: boolean) => {
    const ids = Array.from(seleccionados);
    if (ids.length === 0) return;

    setAplicandoMasivo(true);
    const previos = productos;
    setProductos((prev) => prev.map((p) => (seleccionados.has(p.id) ? { ...p, activo: visible } : p)));

    const { error } = await supabase.from('productos').update({ activo: visible }).in('id', ids);

    if (error) {
      console.error('Error al cambiar la visibilidad en lote:', error);
      setProductos(previos);
      alert('No se pudo cambiar la visibilidad de los productos seleccionados');
    } else {
      setSeleccionados(new Set());
    }

    setAplicandoMasivo(false);
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
      setSeleccionados((prev) => {
        const siguiente = new Set(prev);
        siguiente.delete(id);
        return siguiente;
      });
    } catch (err) {
      console.error('Error deleting producto:', err);
      alert('Error al eliminar el producto');
    }
  };

  const laboratorios = Array.from(new Set(productos.map((p) => p.laboratorio).filter(Boolean))).sort();

  let productosFiltrados = productos.filter((p) => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.laboratorio.toLowerCase().includes(busqueda.toLowerCase());
    const matchLaboratorio = !selectedLaboratorio || p.laboratorio === selectedLaboratorio;
    const stock = p.stock ?? 0;
    const matchStock = !showOnlyZeroStock || stock === 0;
    return matchBusqueda && matchLaboratorio && matchStock;
  });

  if (sortName) {
    productosFiltrados = [...productosFiltrados].sort((a, b) => {
      const nameA = a.nombre.toLowerCase();
      const nameB = b.nombre.toLowerCase();
      return sortName === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
  }

  // Group productos by visibility and category
  const productosPublicados = productosFiltrados.filter((p) => p.activo !== false);
  const productosOcultos = productosFiltrados.filter((p) => p.activo === false);

  const groupByCategory = (prods: Producto[]) => {
    const grouped: Record<string, Producto[]> = {};
    prods.forEach((p) => {
      const cat = p.categoria || 'Sin categoría';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });
    return grouped;
  };

  const publishedByCategory = groupByCategory(productosPublicados);
  const hiddenByCategory = groupByCategory(productosOcultos);

  const toggleCategoryExpanded = (category: string, isPublished: boolean) => {
    if (isPublished) {
      setExpandedPublishedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(category)) {
          next.delete(category);
        } else {
          next.add(category);
        }
        return next;
      });
    } else {
      setExpandedHiddenCategories((prev) => {
        const next = new Set(prev);
        if (next.has(category)) {
          next.delete(category);
        } else {
          next.add(category);
        }
        return next;
      });
    }
  };

  const ProductCard = ({ producto }: { producto: Producto }) => {
    const stock = producto.stock ?? 0;
    const stockStatus = stock === 0 ? 'Agotado' : stock < 5 ? 'Bajo' : 'OK';
    const stockColor = stock === 0 ? 'bg-red-50 border-red-200' : stock < 5 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200';

    return (
      <div
        className={`border-2 rounded-xl p-4 transition-all hover:shadow-lg hover:scale-105 ${stockColor} ${
          producto.activo === false ? 'opacity-60' : ''
        }`}
      >
        <div className="flex gap-3 mb-3">
          <input
            type="checkbox"
            className="w-5 h-5 accent-brand-600 cursor-pointer rounded mt-1"
            checked={seleccionados.has(producto.id)}
            onChange={() => toggleSeleccion(producto.id)}
            aria-label={`Seleccionar ${producto.nombre}`}
          />
          <div className="flex-1 min-w-0">
            {/* Foto y info principal */}
            <div className="flex gap-3 mb-3">
              {producto.foto_url ? (
                <img
                  src={producto.foto_url}
                  alt={producto.nombre}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-600 text-center">Sin foto</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2">
                  {producto.nombre}
                </h3>
                <p className="text-xs text-gray-600 mt-1">{producto.laboratorio || 'Sin laboratorio'}</p>
              </div>
            </div>

            {/* Stats en grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-gray-900">${formatPrice(producto.precio)}</div>
                <div className="text-xs text-gray-600">Precio</div>
              </div>
              <div
                className={`rounded-lg p-2 text-center ${
                  stock === 0
                    ? 'bg-red-100'
                    : stock < 5
                      ? 'bg-orange-100'
                      : 'bg-green-100'
                }`}
              >
                <div className="text-lg font-bold text-gray-900">{stock}</div>
                <div className="text-xs text-gray-600">Stock</div>
              </div>
              <div className="bg-white bg-opacity-70 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-gray-900">{stockStatus}</div>
                <div className="text-xs text-gray-600">Estado</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleActivo(producto)}
                className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1 ${
                  producto.activo !== false
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                }`}
                title={
                  producto.activo !== false
                    ? 'Visible en la web. Clic para ocultar.'
                    : 'Oculto. Clic para mostrar en la web.'
                }
              >
                {producto.activo !== false ? (
                  <>
                    <Eye size={14} />
                    <span className="hidden sm:inline">Ver</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={14} />
                    <span className="hidden sm:inline">Oculto</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setEditingProducto(producto);
                  setIsModalOpen(true);
                }}
                className="py-2 px-3 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                title="Editar producto"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(producto.id)}
                className="py-2 px-3 rounded-lg font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition-colors"
                title="Eliminar producto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getCategoryStats = (prods: Producto[]) => {
    const totalStock = prods.reduce((sum, p) => sum + (p.stock ?? 0), 0);
    const zeroStock = prods.filter((p) => (p.stock ?? 0) === 0).length;
    const lowStock = prods.filter((p) => {
      const stock = p.stock ?? 0;
      return stock > 0 && stock < 5;
    }).length;
    return { totalStock, zeroStock, lowStock };
  };

  const CategorySection = ({
    title,
    productos: prods,
    isPublished,
  }: {
    title: string;
    productos: Producto[];
    isPublished: boolean;
  }) => {
    const isExpanded = isPublished
      ? expandedPublishedCategories.has(title)
      : expandedHiddenCategories.has(title);
    const stats = getCategoryStats(prods);

    return (
      <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white">
        <button
          onClick={() => toggleCategoryExpanded(title, isPublished)}
          className="w-full flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 hover:from-indigo-100 hover:via-blue-100 hover:to-cyan-100 transition-all border-b-2 border-indigo-200"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <ChevronDown
              size={20}
              className={`text-indigo-600 transition-transform flex-shrink-0 font-bold ${isExpanded ? 'rotate-180' : ''}`}
            />
            <div className="min-w-0">
              <h3 className="font-bold text-indigo-900 text-base sm:text-lg">{title}</h3>
            </div>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-200 text-indigo-800 flex-shrink-0">
              {prods.length}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-shrink-0 ml-2">
            <div className="text-center px-2 py-1.5 bg-white rounded-lg border border-gray-200">
              <div className="font-bold text-gray-900">{stats.totalStock}</div>
              <div className="text-gray-500 text-xs">u.</div>
            </div>
            {stats.zeroStock > 0 && (
              <div className="text-center px-2 py-1.5 bg-red-100 rounded-lg border border-red-300">
                <div className="font-bold text-red-900">{stats.zeroStock}</div>
                <div className="text-red-700 text-xs">❌</div>
              </div>
            )}
            {stats.lowStock > 0 && (
              <div className="text-center px-2 py-1.5 bg-orange-100 rounded-lg border border-orange-300">
                <div className="font-bold text-orange-900">{stats.lowStock}</div>
                <div className="text-orange-700 text-xs">⚠️</div>
              </div>
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="p-4 sm:p-6 bg-gray-50">
            <div className="flex gap-2 mb-4">
              <input
                type="checkbox"
                className="w-5 h-5 accent-brand-600 cursor-pointer rounded"
                checked={prods.length > 0 && prods.every((p) => seleccionados.has(p.id))}
                onChange={(e) =>
                  setSeleccionados(
                    e.target.checked
                      ? new Set([...seleccionados, ...prods.map((p) => p.id)])
                      : new Set([...seleccionados].filter((id) => !prods.find((p) => p.id === id)))
                  )
                }
                title="Seleccionar todos los productos de esta categoría"
                aria-label={`Seleccionar todos en ${title}`}
              />
              <label className="text-sm font-semibold text-gray-700 cursor-pointer">
                Seleccionar todos en esta categoría
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {prods.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <AdminNav />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
        <InventoryStats productos={productos} />
        <TrafficStats />

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Dashboard de Productos</h1>
          <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto">
            <Link
              href="/admin/categorizar"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              <Sparkles size={18} className="sm:w-5 sm:h-5" />
              Categorizar Productos
            </Link>
            <Link
              href="/admin/dashboard/nuevo"
              className="flex items-center justify-center sm:justify-start gap-2 bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              Crear Producto
            </Link>
          </div>
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

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-700">Stock:</span>
            </div>
            <button
              onClick={() => setShowOnlyZeroStock(!showOnlyZeroStock)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                showOnlyZeroStock
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Solo Stock = 0
            </button>
          </div>

          {(selectedLaboratorio || sortName || showOnlyZeroStock) && (
            <button
              onClick={() => {
                setSelectedLaboratorio(null);
                setSortName(null);
                setShowOnlyZeroStock(false);
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
          <>
            {seleccionados.size > 0 && (
              <div className="sticky top-16 z-10 mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 shadow-md">
                <span className="text-sm font-semibold text-gray-800">
                  {seleccionados.size} {seleccionados.size === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleVisibilidadMasiva(false)}
                    disabled={aplicandoMasivo}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                  >
                    <EyeOff size={16} />
                    Ocultar de la web
                  </button>
                  <button
                    onClick={() => handleVisibilidadMasiva(true)}
                    disabled={aplicandoMasivo}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                  >
                    <Eye size={16} />
                    Mostrar en la web
                  </button>
                  <button
                    onClick={() => setSeleccionados(new Set())}
                    disabled={aplicandoMasivo}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900 disabled:opacity-50"
                  >
                    Limpiar selección
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* Productos Publicados */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      ✅ Publicados en la web
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{productosPublicados.length} productos visibles</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {productosPublicados.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedPublishedCategories(
                            new Set(Object.keys(publishedByCategory))
                          )}
                          className="px-3 py-2 text-xs sm:text-sm font-semibold bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          Expandir todas
                        </button>
                        <button
                          onClick={() => setExpandedPublishedCategories(new Set())}
                          className="px-3 py-2 text-xs sm:text-sm font-semibold bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Contraer todas
                        </button>
                      </div>
                    )}
                    <div className="px-4 py-2 rounded-lg bg-green-100 text-green-800 font-bold text-lg whitespace-nowrap">
                      {productosPublicados.length}
                    </div>
                  </div>
                </div>

                {productosPublicados.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                    <p className="text-gray-600 text-sm">No hay productos publicados con los filtros actuales</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(publishedByCategory)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([category, prods]) => (
                        <CategorySection
                          key={`pub-${category}`}
                          title={category}
                          productos={prods}
                          isPublished={true}
                        />
                      ))}
                  </div>
                )}
              </div>

              {/* Productos Ocultos */}
              <div className="mt-10 pt-10 border-t-2 border-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      🔒 Ocultos de la web
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{productosOcultos.length} productos ocultos</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {productosOcultos.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedHiddenCategories(
                            new Set(Object.keys(hiddenByCategory))
                          )}
                          className="px-3 py-2 text-xs sm:text-sm font-semibold bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          Expandir todas
                        </button>
                        <button
                          onClick={() => setExpandedHiddenCategories(new Set())}
                          className="px-3 py-2 text-xs sm:text-sm font-semibold bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Contraer todas
                        </button>
                      </div>
                    )}
                    <div className="px-4 py-2 rounded-lg bg-red-100 text-red-800 font-bold text-lg whitespace-nowrap">
                      {productosOcultos.length}
                    </div>
                  </div>
                </div>

                {productosOcultos.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                    <p className="text-gray-600 text-sm">Todos los productos están publicados en la web</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(hiddenByCategory)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([category, prods]) => (
                        <CategorySection
                          key={`hidden-${category}`}
                          title={category}
                          productos={prods}
                          isPublished={false}
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <ProductEditModal
          producto={editingProducto}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProducto(null);
          }}
          onSave={() => {
            fetchProductos();
          }}
        />
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
