'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import { formatPrice } from '@/lib/formatPrice';
import { uploadImagenProducto } from '@/lib/uploadImage';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import ProductEditModal from '@/components/ProductEditModal';
import Link from 'next/link';
import { Edit2, Trash2, Plus, Minus, Search, Sparkles, Eye, EyeOff, MoreVertical, ImageUp } from 'lucide-react';
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
  const [precioMasivo, setPrecioMasivo] = useState('');
  const [subiendoFotoMasiva, setSubiendoFotoMasiva] = useState(false);

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

  const handleStockChange = async (producto: Producto, nuevoStock: number) => {
    const stockActual = producto.stock ?? 0;
    const stockValido = Math.max(0, nuevoStock);
    if (stockValido === stockActual) return;

    setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, stock: stockValido } : p)));

    const { error } = await supabase.from('productos').update({ stock: stockValido }).eq('id', producto.id);

    if (error) {
      console.error('Error al actualizar el stock:', error);
      setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, stock: stockActual } : p)));
      alert('No se pudo actualizar el stock');
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

  // Aplica un precio nuevo a todos los seleccionados en una sola consulta.
  const handlePrecioMasivo = async () => {
    const ids = Array.from(seleccionados);
    const nuevoPrecio = parseFloat(precioMasivo);
    if (ids.length === 0 || isNaN(nuevoPrecio) || nuevoPrecio < 0) return;

    setAplicandoMasivo(true);
    const previos = productos;
    setProductos((prev) => prev.map((p) => (seleccionados.has(p.id) ? { ...p, precio: nuevoPrecio } : p)));

    const { error } = await supabase.from('productos').update({ precio: nuevoPrecio }).in('id', ids);

    if (error) {
      console.error('Error al cambiar el precio en lote:', error);
      setProductos(previos);
      alert('No se pudo cambiar el precio de los productos seleccionados');
    } else {
      setPrecioMasivo('');
      setSeleccionados(new Set());
    }

    setAplicandoMasivo(false);
  };

  // Sube una sola foto y se la aplica a todos los seleccionados.
  const handleFotoMasiva = async (file: File) => {
    const ids = Array.from(seleccionados);
    if (ids.length === 0) return;

    setSubiendoFotoMasiva(true);
    try {
      const foto_url = await uploadImagenProducto(file);
      const previos = productos;
      setProductos((prev) => prev.map((p) => (seleccionados.has(p.id) ? { ...p, foto_url } : p)));

      const { error } = await supabase.from('productos').update({ foto_url }).in('id', ids);

      if (error) {
        console.error('Error al aplicar la foto en lote:', error);
        setProductos(previos);
        alert('No se pudo aplicar la foto a los productos seleccionados');
      }
    } catch (err) {
      console.error('Error al subir la foto:', err);
      alert('No se pudo subir la foto');
    }
    setSubiendoFotoMasiva(false);
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

  const productosPublicados = productosFiltrados.filter((p) => p.activo !== false);
  const productosOcultos = productosFiltrados.filter((p) => p.activo === false);

  const ProductCard = ({ producto }: { producto: Producto }) => {
    const stock = producto.stock ?? 0;
    const stockStatus = stock === 0 ? 'Agotado' : stock < 5 ? 'Bajo' : 'OK';
    const [showMenu, setShowMenu] = useState(false);
    const [stockInput, setStockInput] = useState(String(stock));

    useEffect(() => {
      setStockInput(String(stock));
    }, [stock]);

    const commitStockInput = () => {
      const parsed = parseInt(stockInput, 10);
      if (isNaN(parsed)) {
        setStockInput(String(stock));
        return;
      }
      handleStockChange(producto, parsed);
    };

    const getBgColor = () => {
      if (stock === 0) return 'bg-red-50 border-red-300';
      if (stock < 5) return 'bg-orange-50 border-orange-300';
      return 'bg-emerald-50 border-emerald-300';
    };

    const getStatusBadgeColor = () => {
      if (stock === 0) return 'bg-red-100 text-red-800';
      if (stock < 5) return 'bg-orange-100 text-orange-800';
      return 'bg-emerald-100 text-emerald-800';
    };

    return (
      <div
        className={`border rounded-lg p-2 transition-all hover:shadow-md hover:scale-105 ${getBgColor()} ${
          producto.activo === false ? 'opacity-70 ring-1 ring-gray-400' : ''
        }`}
      >
        {/* Header con checkbox y menú */}
        <div className="flex gap-1 mb-2 items-start justify-between">
          <input
            type="checkbox"
            className="w-3 h-3 accent-brand-600 cursor-pointer rounded mt-0.5 flex-shrink-0"
            checked={seleccionados.has(producto.id)}
            onChange={() => toggleSeleccion(producto.id)}
            aria-label={`Seleccionar ${producto.nombre}`}
          />
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setEditingProducto(producto);
                setIsModalOpen(true);
              }}
              className="p-0.5 hover:bg-white rounded transition-colors"
              title="Editar producto"
            >
              <Edit2 size={14} className="text-blue-600" />
            </button>
            <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-0.5 hover:bg-white rounded transition-colors"
              title="Más opciones"
            >
              <MoreVertical size={14} className="text-gray-600" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-0.5 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-40">
                <button
                  onClick={() => {
                    handleToggleActivo(producto);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-green-50 flex items-center gap-1 border-b border-gray-100 text-xs font-medium text-gray-700"
                >
                  {producto.activo !== false ? (
                    <>
                      <EyeOff size={12} className="text-gray-600" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye size={12} className="text-green-600" />
                      Ver
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleDelete(producto.id);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-red-50 flex items-center gap-1 text-xs font-medium text-red-700"
                >
                  <Trash2 size={12} />
                  Borrar
                </button>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Imagen mini */}
        <div className="mb-1.5">
          {producto.foto_url ? (
            <img
              src={producto.foto_url}
              alt={producto.nombre}
              className="w-full h-16 object-cover rounded"
            />
          ) : (
            <div className="w-full h-16 bg-gray-300 rounded flex items-center justify-center">
              <span className="text-xs text-gray-600">Sin foto</span>
            </div>
          )}
        </div>

        {/* Nombre mini */}
        <h3 className="font-bold text-gray-900 text-xs leading-tight mb-0.5 line-clamp-1">
          {producto.nombre}
        </h3>

        {/* Categoría */}
        <p className="text-[10px] text-gray-500 mb-0.5 line-clamp-1">
          {producto.categoria || 'Sin categoría'}
        </p>

        {/* Status badge */}
        <div className="mb-1.5">
          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${getStatusBadgeColor()}`}>
            {stockStatus === 'Agotado' && '❌ Agot.'}
            {stockStatus === 'Bajo' && '⚠️ Bajo'}
            {stockStatus === 'OK' && '✅ OK'}
          </span>
        </div>

        {/* Precio prominente */}
        <div className="mb-1.5 bg-white bg-opacity-90 rounded p-1 text-center border border-gray-200">
          <div className="text-xs text-gray-600">Precio</div>
          <div className="text-sm font-bold text-gray-900 leading-tight">
            ${formatPrice(producto.precio)}
          </div>
        </div>

        {/* Stock editable */}
        <div className="flex items-center justify-center gap-1 mb-1.5">
          <button
            onClick={() => handleStockChange(producto, stock - 1)}
            className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 flex-shrink-0"
            title="Restar 1 al stock"
          >
            <Minus size={10} />
          </button>
          <input
            type="number"
            value={stockInput}
            onChange={(e) => setStockInput(e.target.value)}
            onBlur={commitStockInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            className={`w-12 text-center text-xs font-bold border border-gray-300 rounded py-0.5 ${
              stock === 0 ? 'text-red-700' : stock < 5 ? 'text-orange-700' : 'text-emerald-700'
            }`}
            aria-label={`Stock de ${producto.nombre}`}
          />
          <button
            onClick={() => handleStockChange(producto, stock + 1)}
            className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 flex-shrink-0"
            title="Sumar 1 al stock"
          >
            <Plus size={10} />
          </button>
        </div>

        {/* Botón visibilidad */}
        <button
          onClick={() => handleToggleActivo(producto)}
          className={`w-full py-1.5 rounded text-xs font-bold transition-all ${
            producto.activo !== false
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-500 hover:bg-gray-600 text-white'
          }`}
          title={
            producto.activo !== false
              ? 'Visible en la web. Clic para ocultar.'
              : 'Oculto. Clic para mostrar en la web.'
          }
        >
          {producto.activo !== false ? '✅' : '🔒'}
        </button>
      </div>
    );
  };

  return (
    <>
      <AdminNav />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-8">
        <InventoryStats productos={productos} />

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
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

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-3 sm:mb-4 text-xs sm:text-sm">{error}</div>}

        <div className="mb-4 sm:mb-6 space-y-3">
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

          <div className="flex gap-2 flex-wrap items-center">
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
            {productosFiltrados.length > 0 && (
              <button
                onClick={() =>
                  setSeleccionados(
                    productosFiltrados.every((p) => seleccionados.has(p.id))
                      ? new Set()
                      : new Set(productosFiltrados.map((p) => p.id))
                  )
                }
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
              >
                {productosFiltrados.every((p) => seleccionados.has(p.id))
                  ? `Deseleccionar todos (${productosFiltrados.length})`
                  : `Seleccionar todos los filtrados (${productosFiltrados.length})`}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-sm sm:text-base">Cargando productos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 text-center">
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
              <div className="sticky top-16 z-10 mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 shadow-md">
                <span className="text-sm font-semibold text-gray-800">
                  {seleccionados.size} {seleccionados.size === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-600">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={precioMasivo}
                      onChange={(e) => setPrecioMasivo(e.target.value)}
                      placeholder="Precio nuevo"
                      className="w-28 px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      disabled={aplicandoMasivo || subiendoFotoMasiva}
                    />
                    <button
                      onClick={handlePrecioMasivo}
                      disabled={aplicandoMasivo || subiendoFotoMasiva || !precioMasivo || isNaN(parseFloat(precioMasivo)) || parseFloat(precioMasivo) < 0}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      Aplicar precio
                    </button>
                  </div>
                  <label
                    className={`inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 cursor-pointer ${
                      subiendoFotoMasiva ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    <ImageUp size={16} />
                    {subiendoFotoMasiva ? 'Subiendo...' : 'Aplicar foto a todos'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={subiendoFotoMasiva}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFotoMasiva(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    onClick={() => handleVisibilidadMasiva(false)}
                    disabled={aplicandoMasivo || subiendoFotoMasiva}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-800 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50"
                  >
                    <EyeOff size={16} />
                    Ocultar de la web
                  </button>
                  <button
                    onClick={() => handleVisibilidadMasiva(true)}
                    disabled={aplicandoMasivo || subiendoFotoMasiva}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
                  >
                    <Eye size={16} />
                    Mostrar en la web
                  </button>
                  <button
                    onClick={() => setSeleccionados(new Set())}
                    disabled={aplicandoMasivo || subiendoFotoMasiva}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900 disabled:opacity-50"
                  >
                    Limpiar selección
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Productos Publicados */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      ✅ Publicados en la web
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{productosPublicados.length} productos visibles</p>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-green-100 text-green-800 font-bold text-lg whitespace-nowrap">
                    {productosPublicados.length}
                  </div>
                </div>

                {productosPublicados.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 text-center">
                    <p className="text-gray-600 text-sm">No hay productos publicados con los filtros actuales</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
                    {productosPublicados.map((producto) => (
                      <ProductCard key={producto.id} producto={producto} />
                    ))}
                  </div>
                )}
              </div>

              {/* Productos Ocultos */}
              <div className="mt-6 pt-6 border-t-2 border-gray-300">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      🔒 Ocultos de la web
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{productosOcultos.length} productos ocultos</p>
                  </div>
                  {productosOcultos.length > 0 && (
                    <button
                      onClick={() =>
                        setSeleccionados(
                          productosOcultos.every((p) => seleccionados.has(p.id))
                            ? new Set([...seleccionados].filter((id) => !productosOcultos.find((p) => p.id === id)))
                            : new Set([...seleccionados, ...productosOcultos.map((p) => p.id)])
                        )
                      }
                      className="px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors whitespace-nowrap"
                    >
                      {productosOcultos.every((p) => seleccionados.has(p.id))
                        ? 'Deseleccionar ocultos'
                        : 'Seleccionar todos los ocultos'}
                    </button>
                  )}
                  <div className="px-4 py-2 rounded-lg bg-red-100 text-red-800 font-bold text-lg whitespace-nowrap">
                    {productosOcultos.length}
                  </div>
                </div>

                {productosOcultos.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 text-center">
                    <p className="text-gray-600 text-sm">Todos los productos están publicados en la web</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
                    {productosOcultos.map((producto) => (
                      <ProductCard key={producto.id} producto={producto} />
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
