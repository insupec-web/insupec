'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { Search } from 'lucide-react';

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortPrice, setSortPrice] = useState<'asc' | 'desc' | null>(null);
  const [sortName, setSortName] = useState<'asc' | 'desc' | null>(null);
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<string | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [expandLaboratorios, setExpandLaboratorios] = useState(false);
  const [expandCategorias, setExpandCategorias] = useState(false);

  const CATEGORIAS = [
    'Animales de Compañía',
    'Grandes Animales',
    'Solar',
    'Instrumental',
    'Limpieza',
    'Cerco Eléctrico',
    'Hormiguicida',
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: productosData, error: productosError } = await supabase
          .from('productos')
          .select('*')
          .or('activo.is.null,activo.eq.true')
          .order('created_at', { ascending: false });

        if (productosError) throw productosError;

        setProductos((productosData || []).filter(p => p.activo !== false));
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
    const labs = new Set(productos.map((p) => p.laboratorio).filter(Boolean));
    return Array.from(labs).sort();
  }, [productos]);

  const getCategoryIndex = (categoria?: string): number => {
    if (!categoria) return CATEGORIAS.length;
    const index = CATEGORIAS.indexOf(categoria);
    return index === -1 ? CATEGORIAS.length : index;
  };

  const productosFiltrados = useMemo(() => {
    let filtered = productos;

    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((p) => p.nombre.toLowerCase().includes(q));
    }

    if (selectedLaboratorio) {
      filtered = filtered.filter((p) => p.laboratorio === selectedLaboratorio);
    }

    if (selectedCategoria) {
      filtered = filtered.filter((p) => p.categoria === selectedCategoria);
    }

    if (sortPrice) {
      filtered = [...filtered].sort((a, b) => {
        const priceA = a.precio || 0;
        const priceB = b.precio || 0;
        return sortPrice === 'asc' ? priceA - priceB : priceB - priceA;
      });
    } else if (sortName) {
      filtered = [...filtered].sort((a, b) => {
        const nameA = a.nombre.toLowerCase();
        const nameB = b.nombre.toLowerCase();
        return sortName === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else {
      filtered = [...filtered].sort((a, b) => {
        const indexA = getCategoryIndex(a.categoria);
        const indexB = getCategoryIndex(b.categoria);
        if (indexA !== indexB) {
          return indexA - indexB;
        }
        return a.nombre.localeCompare(b.nombre);
      });
    }

    return filtered;
  }, [productos, query, sortPrice, sortName, selectedLaboratorio, selectedCategoria]);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="mb-6 sm:mb-8 pb-4 border-b-2 border-brand-100">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Productos</h1>
            <p className="text-sm sm:text-base text-gray-500">
              {productos.length} {productos.length === 1 ? 'producto disponible' : 'productos disponibles'}
            </p>
          </div>

          <div className="mb-6 sm:mb-8 space-y-4">
            <div className="relative max-w-xl group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-brand-600 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar producto por nombre..."
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

            <div>
              <button
                onClick={() => setExpandCategorias(!expandCategorias)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span>Categoría:</span>
                <span className="text-xs text-gray-500">{expandCategorias ? '▼' : '▶'} ({CATEGORIAS.length})</span>
              </button>

              {expandCategorias && (
                <div className="flex gap-2 flex-wrap items-center mt-3">
                  <button
                    onClick={() => setSelectedCategoria(null)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all transform ${
                      !selectedCategoria
                        ? 'bg-brand-600 text-white shadow-md scale-105'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Todas
                  </button>
                  {CATEGORIAS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoria(selectedCategoria === cat ? null : cat)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all transform ${
                        selectedCategoria === cat
                          ? 'bg-brand-600 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {laboratorios.length > 0 && (
              <div>
                <button
                  onClick={() => setExpandLaboratorios(!expandLaboratorios)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <span>Laboratorio:</span>
                  <span className="text-xs text-gray-500">{expandLaboratorios ? '▼' : '▶'} ({laboratorios.length})</span>
                </button>

                {expandLaboratorios && (
                  <div className="flex gap-2 flex-wrap items-center mt-3">
                    <button
                      onClick={() => setSelectedLaboratorio(null)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all transform ${
                        !selectedLaboratorio
                          ? 'bg-brand-600 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Todos
                    </button>
                    {laboratorios.map((lab) => (
                      <button
                        key={lab}
                        onClick={() => setSelectedLaboratorio(selectedLaboratorio === lab ? null : lab)}
                        className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all transform ${
                          selectedLaboratorio === lab
                            ? 'bg-brand-600 text-white shadow-md scale-105'
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

            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm font-semibold text-gray-700">Precio:</span>
              <button
                onClick={() => {
                  setSortPrice(sortPrice === 'asc' ? null : 'asc');
                  setSortName(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform ${
                  sortPrice === 'asc'
                    ? 'bg-brand-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-102'
                }`}
              >
                ↑ Menor
              </button>
              <button
                onClick={() => {
                  setSortPrice(sortPrice === 'desc' ? null : 'desc');
                  setSortName(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform ${
                  sortPrice === 'desc'
                    ? 'bg-brand-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-102'
                }`}
              >
                ↓ Mayor
              </button>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm font-semibold text-gray-700">Nombre:</span>
              <button
                onClick={() => {
                  setSortName(sortName === 'asc' ? null : 'asc');
                  setSortPrice(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform ${
                  sortName === 'asc'
                    ? 'bg-brand-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-102'
                }`}
              >
                A → Z
              </button>
              <button
                onClick={() => {
                  setSortName(sortName === 'desc' ? null : 'desc');
                  setSortPrice(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all transform ${
                  sortName === 'desc'
                    ? 'bg-brand-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-102'
                }`}
              >
                Z → A
              </button>
            </div>

            {(sortPrice || sortName || selectedLaboratorio || selectedCategoria) && (
              <button
                onClick={() => {
                  setSortPrice(null);
                  setSortName(null);
                  setSelectedLaboratorio(null);
                  setSelectedCategoria(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-all transform hover:scale-102 border border-red-200"
              >
                ✕ Limpiar filtros
              </button>
            )}
          </div>

          {productos.length === 0 ? (
            <div className="text-center py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sin productos disponibles</h3>
              <p className="text-gray-600 text-base mb-6">Estamos cargando nuestro catálogo. Vuelve pronto!</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="text-center py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No encontramos coincidencias</h3>
              <p className="text-gray-600 text-base mb-6">No hay productos que coincidan con "{query}"</p>
              <button onClick={() => setQuery('')} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-all transform hover:scale-105">
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {productosFiltrados.length > 0 && !selectedCategoria && !sortPrice && !sortName ? (
                CATEGORIAS.map((categoria) => {
                  const productosCategoria = productosFiltrados.filter((p) => p.categoria === categoria);
                  if (productosCategoria.length === 0) return null;
                  return (
                    <div key={categoria}>
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-brand-200">
                        {categoria}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                        {productosCategoria.map((producto) => (
                          <ProductCard key={producto.id} producto={producto} />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                  {productosFiltrados.map((producto) => (
                    <ProductCard key={producto.id} producto={producto} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
