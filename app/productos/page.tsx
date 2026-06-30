'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { supabase, Producto, Pack, PackItem } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import PackCard from '@/components/PackCard';
import { Search } from 'lucide-react';

export default function ProductosPage() {
  const [tab, setTab] = useState<'productos' | 'ofertas' | 'packs'>('productos');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [packItems, setPackItems] = useState<Map<string, Producto[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortPrice, setSortPrice] = useState<'asc' | 'desc' | null>(null);
  const [sortName, setSortName] = useState<'asc' | 'desc' | null>(null);
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<string | null>(null);
  const [expandLaboratorios, setExpandLaboratorios] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productosData, packsData] = await Promise.all([
          supabase.from('productos').select('*').order('created_at', { ascending: false }),
          supabase.from('packs').select('*').order('created_at', { ascending: false }),
        ]);

        if (productosData.error) throw productosData.error;
        if (packsData.error) throw packsData.error;

        setProductos(productosData.data || []);
        setPacks(packsData.data || []);

        // Cargar items de cada pack
        if (packsData.data && packsData.data.length > 0) {
          const packItemsMap = new Map<string, Producto[]>();
          for (const pack of packsData.data) {
            const { data: items } = await supabase
              .from('pack_items')
              .select('producto_id')
              .eq('pack_id', pack.id);

            if (items) {
              const productosDelPack = items
                .map((item) => productosData.data?.find((p) => p.id === item.producto_id))
                .filter(Boolean) as Producto[];
              packItemsMap.set(pack.id, productosDelPack);
            }
          }
          setPackItems(packItemsMap);
        }
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

  const productosEnOferta = useMemo(() => {
    const fechaLimite = new Date('2026-08-01');
    return productos.filter((p) => {
      if (!p.vencimiento) return false; // Ignorar productos sin vencimiento
      const vencimiento = new Date(p.vencimiento);
      return vencimiento < fechaLimite;
    }).sort((a, b) => new Date(a.vencimiento).getTime() - new Date(b.vencimiento).getTime());
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    let filtered = productos;

    // Filtrar por búsqueda
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((p) => p.nombre.toLowerCase().includes(q));
    }

    // Filtrar por laboratorio
    if (selectedLaboratorio) {
      filtered = filtered.filter((p) => p.laboratorio === selectedLaboratorio);
    }

    // Ordenar
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
    }

    return filtered;
  }, [productos, query, sortPrice, sortName, selectedLaboratorio]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-600">Cargando...</p>
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
      {/* Tabs de navegación */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setTab('productos')}
          className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
            tab === 'productos'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Productos
        </button>
        <button
          onClick={() => setTab('ofertas')}
          className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
            tab === 'ofertas'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Ofertas
        </button>
        <button
          onClick={() => setTab('packs')}
          className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
            tab === 'packs'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Packs
        </button>
      </div>

      {tab === 'productos' && (
        <div>
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Productos</h1>
            <p className="text-sm sm:text-base text-gray-500">
              {productos.length} {productos.length === 1 ? 'producto disponible' : 'productos disponibles'}
            </p>
          </div>

      {/* Buscador y Filtros */}
      <div className="mb-6 sm:mb-8 space-y-4">
        <div className="relative max-w-xl">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        {/* Filtro por Laboratorio */}
        {laboratorios.length > 0 && (
          <div>
            <button
              onClick={() => setExpandLaboratorios(!expandLaboratorios)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>Laboratorio:</span>
              <span className="text-xs text-gray-500">
                {expandLaboratorios ? '▼' : '▶'} ({laboratorios.length})
              </span>
            </button>

            {expandLaboratorios && (
              <div className="flex gap-2 flex-wrap items-center mt-3">
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
            )}
          </div>
        )}

        {/* Filtro de Precios */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm font-semibold text-gray-700">Precio:</span>
          <button
            onClick={() => {
              setSortPrice(sortPrice === 'asc' ? null : 'asc');
              setSortName(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              sortPrice === 'asc'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            ↑ Menor a Mayor
          </button>
          <button
            onClick={() => {
              setSortPrice(sortPrice === 'desc' ? null : 'desc');
              setSortName(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              sortPrice === 'desc'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            ↓ Mayor a Menor
          </button>
        </div>

        {/* Filtro de Nombre */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-sm font-semibold text-gray-700">Nombre:</span>
          <button
            onClick={() => {
              setSortName(sortName === 'asc' ? null : 'asc');
              setSortPrice(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              sortName === 'asc'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            A → Z
          </button>
          <button
            onClick={() => {
              setSortName(sortName === 'desc' ? null : 'desc');
              setSortPrice(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              sortName === 'desc'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Z → A
          </button>
        </div>

        {/* Botón Limpiar */}
        {(sortPrice || sortName || selectedLaboratorio) && (
          <div>
            <button
              onClick={() => {
                setSortPrice(null);
                setSortName(null);
                setSelectedLaboratorio(null);
              }}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

          {productos.length === 0 ? (
            <div className=”text-center py-16”>
              <p className=”text-gray-600 text-base sm:text-lg”>No hay productos disponibles en este momento.</p>
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className=”text-center py-16”>
              <p className=”text-gray-600 text-base”>No se encontraron productos para “{query}”.</p>
              <button onClick={() => setQuery('')} className=”mt-3 text-brand-600 font-semibold hover:underline”>
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className=”grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5”>
              {productosFiltrados.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'ofertas' && (
        <div>
          <div className=”mb-6 sm:mb-8”>
            <h1 className=”text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1”>Ofertas</h1>
            <p className=”text-sm sm:text-base text-gray-500”>Productos con vencimiento próximo</p>
          </div>

          {productosEnOferta.length === 0 ? (
            <div className=”text-center py-16”>
              <p className=”text-gray-600 text-base sm:text-lg”>No hay ofertas disponibles en este momento.</p>
            </div>
          ) : (
            <div className=”grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5”>
              {productosEnOferta.map((producto) => (
                <div key={producto.id} className=”relative”>
                  <ProductCard producto={producto} />
                  <div className=”absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold”>
                    Vence: {new Date(producto.vencimiento).toLocaleDateString('es-AR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'packs' && (
        <div>
          <div className=”mb-6 sm:mb-8”>
            <h1 className=”text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1”>Packs</h1>
            <p className=”text-sm sm:text-base text-gray-500”>Combos de productos con descuento especial</p>
          </div>

          {packs.length === 0 ? (
            <div className=”text-center py-16”>
              <p className=”text-gray-600 text-base sm:text-lg”>No hay packs disponibles en este momento.</p>
            </div>
          ) : (
            <div className=”grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5”>
              {packs.map((pack) => (
                <PackCard key={pack.id} pack={pack} productos={packItems.get(pack.id) || []} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const productosEnOferta = useMemo(() => {
  const fechaLimite = new Date('2026-08-01');
  return productos.filter((p) => {
    if (!p.vencimiento) return false;
    const vencimiento = new Date(p.vencimiento);
    return vencimiento < fechaLimite;
  }).sort((a, b) => new Date(a.vencimiento).getTime() - new Date(b.vencimiento).getTime());
}, [productos]);

const laboratorios = useMemo(() => {
  const labs = new Set(productos.map((p) => p.laboratorio).filter(Boolean));
  return Array.from(labs).sort();
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
  }

  return filtered;
}, [productos, query, sortPrice, sortName, selectedLaboratorio]);
