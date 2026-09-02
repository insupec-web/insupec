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
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<string | null>(null);
  const [expandLaboratorios, setExpandLaboratorios] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [expandCategorias, setExpandCategorias] = useState(false);

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
    const labs = new Set(productos.map((p) => p.laboratorio).filter(Boolean));
    return Array.from(labs).sort();
  }, [productos]);

  const categorias = useMemo(() => {
    const cats = new Set(productos.map((p) => p.categoria).filter(Boolean));
    return Array.from(cats).sort();
  }, [productos]);

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

    return [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [productos, query, selectedLaboratorio, selectedCategoria]);

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

            {categorias.length > 0 && (
              <div>
                <button
                  onClick={() => setExpandCategorias(!expandCategorias)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <span>Categoría:</span>
                  <span className="text-xs text-gray-500">{expandCategorias ? '▼' : '▶'} ({categorias.length})</span>
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
                    {categorias.map((cat) => (
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
              {productosFiltrados.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>
    </div>
  );
}
