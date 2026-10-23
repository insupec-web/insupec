'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { Search, ShoppingCart, CheckCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/formatPrice';

const ORDEN_CATEGORIAS: Record<string, number> = {
  'Grandes Animales': 1,
  'Pequeños Animales': 2,
  'Animales de Compañía': 3,
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<string | null>(null);
  const [expandLaboratorios, setExpandLaboratorios] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Se filtra en el servidor para no mandar al navegador los productos
        // ocultos. Si la columna activo no existe (PostgREST devuelve 42703),
        // se reintenta sin el filtro para que el catálogo no quede caído.
        let { data: productosData, error: productosError } = await supabase
          .from('productos')
          .select('*')
          .or('activo.is.null,activo.eq.true')
          .order('created_at', { ascending: false });

        if (productosError?.code === '42703') {
          console.warn('Falta la columna activo en productos; ejecuta SUPABASE_ADD_ACTIVO.sql');
          ({ data: productosData, error: productosError } = await supabase
            .from('productos')
            .select('*')
            .order('created_at', { ascending: false }));
        }

        if (productosError) throw productosError;

        setProductos((productosData || []).filter((p) => p.activo !== false));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const laboratorios = useMemo(() => {
    const labs = new Set(productos.map((p) => p.laboratorio).filter((l): l is string => Boolean(l)));
    return Array.from(labs).sort();
  }, [productos]);

  const categorias = useMemo(() => {
    const cats = new Set(productos.map((p) => p.categoria).filter((c): c is string => Boolean(c)));
    return Array.from(cats).sort((a, b) => {
      const orderA = ORDEN_CATEGORIAS[a] ?? 999;
      const orderB = ORDEN_CATEGORIAS[b] ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b);
    });
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    let filtered = productos;

    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (p) => p.nombre.toLowerCase().includes(q) || (p.laboratorio ?? '').toLowerCase().includes(q)
      );
    }

    if (selectedLaboratorio) {
      filtered = filtered.filter((p) => p.laboratorio === selectedLaboratorio);
    }

    if (selectedCategoria) {
      filtered = filtered.filter((p) => p.categoria === selectedCategoria);
    }

    return [...filtered].filter(p => !p.vencimiento || new Date(p.vencimiento) >= new Date()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [productos, query, selectedLaboratorio, selectedCategoria]);

  const productosVencidos = useMemo(() => {
    return productos.filter(p => p.vencimiento && new Date(p.vencimiento) < new Date()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [productos]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded-lg w-1/4 animate-pulse mb-2" />
          <div className="h-5 bg-gray-200 rounded-lg w-1/3 animate-pulse" />
        </div>

        <div className="mb-8 space-y-4">
          <div className="h-10 bg-gray-200 rounded-xl w-full max-w-md animate-pulse" />
          <div className="h-8 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div>
          {/* Tabs de Categorías */}
          <div className="mb-6 sm:mb-8 border-b border-gray-300">
            <div className="flex overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4 gap-1">
              <button
                onClick={() => setSelectedCategoria(null)}
                className={`whitespace-nowrap px-4 py-3 font-semibold text-sm transition-all border-b-2 ${
                  !selectedCategoria
                    ? 'text-brand-600 border-brand-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                Todas
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoria(cat)}
                  className={`whitespace-nowrap px-4 py-3 font-semibold text-sm transition-all border-b-2 ${
                    selectedCategoria === cat
                      ? 'text-brand-600 border-brand-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-6 sm:mb-8">
            <div className="relative max-w-xl group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-brand-600 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o laboratorio..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm focus:shadow-md bg-gray-50 focus:bg-white"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filtro Laboratorio */}
          {laboratorios.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <button
                onClick={() => setExpandLaboratorios(!expandLaboratorios)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span>Filtrar por Laboratorio:</span>
                <span className="text-xs text-gray-500">{expandLaboratorios ? '▼' : '▶'}</span>
              </button>

              {expandLaboratorios && (
                <div className="flex gap-2 flex-wrap items-center mt-3">
                  <button
                    onClick={() => setSelectedLaboratorio(null)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      !selectedLaboratorio
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Todos
                  </button>
                  {laboratorios.map((lab) => (
                    <button
                      key={lab}
                      onClick={() => setSelectedLaboratorio(selectedLaboratorio === lab ? null : lab)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        selectedLaboratorio === lab
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {lab}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {productos.length === 0 ? (
            <div className="text-center py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sin productos disponibles</h3>
              <p className="text-gray-600 text-base mb-6">Estamos cargando nuestro catálogo. Vuelve pronto!</p>
            </div>
          ) : Array.isArray(productosFiltrados) && productosFiltrados.length === 0 ? (
            <div className="text-center py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No encontramos coincidencias</h3>
              <p className="text-gray-600 text-base mb-6">No hay productos en esta categoría{query && ` que coincidan con "${query}"`}</p>
              <button onClick={() => { setQuery(''); setSelectedCategoria(null); }} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-all transform hover:scale-105">
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
              {Array.isArray(productosFiltrados) && productosFiltrados.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}

          {/* Sección Liquidación - Productos Vencidos */}
          {productosVencidos.length > 0 && (
            <div className="mt-16 pt-12 border-t-2 border-red-200">
              <div className="mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="text-4xl">🔥</span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600">Liquidación - Súper Descuento</h2>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-2">Productos vencidos a precios increíbles. ¡Aprovecha antes de que se agoten!</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                {productosVencidos.map((producto) => (
                  <ExpiredProductCard key={producto.id} producto={producto} />
                ))}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

function ExpiredProductCard({ producto }: { producto: Producto }) {
  const precioOriginal = producto.precio;
  const precioConDescuento = Math.round(precioOriginal * 0.4);
  const descuentoPorcentaje = Math.round(((precioOriginal - precioConDescuento) / precioOriginal) * 100);
  const { addItem } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: precioConDescuento,
      cantidad: 1,
      foto_url: producto.foto_url,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="group bg-red-50 border-2 border-red-300 rounded-2xl overflow-hidden h-full flex flex-col hover:border-red-500 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative">
      {/* Badge de descuento */}
      <div className="absolute top-2 right-2 z-10 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
        -{descuentoPorcentaje}%
      </div>

      {/* Foto del producto */}
      <div className="relative block h-36 sm:h-44 bg-gradient-to-br from-red-100 to-gray-50 overflow-hidden">
        {producto.foto_url ? (
          <img
            src={producto.foto_url}
            alt={producto.nombre}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300 opacity-75"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
        )}
        <div className="absolute inset-0 bg-red-200 opacity-20"></div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        {/* Nombre */}
        <h3 className="font-semibold text-xs sm:text-sm text-gray-900 mb-2 hover:text-red-700 transition-colors line-clamp-2 min-h-[2rem]">
          {producto.nombre}
        </h3>

        {/* Precios */}
        <div className="mb-3 space-y-1">
          <div className="text-xs sm:text-sm text-gray-500 line-through">
            Antes: ${formatPrice(precioOriginal)}
          </div>
          <div className="text-lg sm:text-2xl font-extrabold text-red-600">
            ${formatPrice(precioConDescuento)}
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 rounded-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 shadow-md ${
            addedToCart
              ? 'bg-green-500 text-white'
              : 'bg-red-600 text-white hover:bg-red-700 hover:-translate-y-0.5'
          }`}
        >
          {addedToCart ? '✓ Agregado' : '🛒 Comprar'}
        </button>
      </div>
    </div>
  );
}
