'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Search } from 'lucide-react';

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sortPrice, setSortPrice] = useState<'asc' | 'desc' | null>(null);
  const [sortName, setSortName] = useState<'asc' | 'desc' | null>(null);
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<string | null>(null);
  const [expandLaboratorios, setExpandLaboratorios] = useState(false);

  useEffect(() => {
    async function fetchProductos() {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .order('created_at', { ascending: false });

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
    }

    fetchProductos();
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
          <p className="text-gray-600">Cargando productos...</p>
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
      {/* Sección de Ofertas */}
      {productosEnOferta.length > 0 && (
        <div className="mb-10 sm:mb-12">
          <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-lg border-2 border-brand-300 p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-brand-600 text-white rounded-full px-4 py-2 font-bold text-sm">OFERTA</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {productosEnOferta.map((producto) => (
              <div key={producto.id} className="relative">
                <ProductCard producto={producto} />
                <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                  Vence: {new Date(producto.vencimiento).toLocaleDateString('es-AR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">Catálogo de Productos</h1>
        <p className="text-sm sm:text-base text-gray-500">
          {productos.length} {productos.length === 1 ? 'producto disponible' : 'productos disponibles'} · Insumos pecuarios y veterinarios
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
        <div className="text-center py-16">
          <p className="text-gray-600 text-base sm:text-lg">No hay productos disponibles en este momento.</p>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-base">No se encontraron productos para “{query}”.</p>
          <button onClick={() => setQuery('')} className="mt-3 text-brand-600 font-semibold hover:underline">
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {productosFiltrados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
