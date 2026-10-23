'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductSkeleton from '@/components/ProductSkeleton';
import { Search, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const CATEGORIAS_MAP: Record<string, string> = {
  'grandes-animales': 'Grandes Animales',
  'animales-de-compania': 'Animales de Compañía',
  'cerco-electrico': 'Cerco Eléctrico',
  'hormiguicida': 'Hormiguicida',
  'instrumental': 'Instrumental',
  'limpieza': 'Limpieza',
  'solar': 'Solar',
};

const CATEGORIAS_DESCRIPCION: Record<string, string> = {
  'grandes-animales': 'Productos especializados para ganado y animales grandes',
  'animales-de-compania': 'Todo para mascotas y animales de compañía',
  'cerco-electrico': 'Sistemas de cerco eléctrico de alta calidad',
  'hormiguicida': 'Soluciones para control de plagas',
  'instrumental': 'Herramientas e instrumental profesional',
  'limpieza': 'Productos de limpieza y desinfección',
  'solar': 'Energía solar y paneles solares',
};

export default function CategoriaPage() {
  const params = useParams();
  const slug = params.slug as string;
  const categoria = CATEGORIAS_MAP[slug];
  const descripcion = CATEGORIAS_DESCRIPCION[slug];

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<string | null>(null);
  const [expandLaboratorios, setExpandLaboratorios] = useState(false);

  useEffect(() => {
    if (!categoria) {
      setError('Categoría no encontrada');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        let { data: productosData, error: productosError } = await supabase
          .from('productos')
          .select('*')
          .eq('categoria', categoria)
          .or('activo.is.null,activo.eq.true')
          .order('created_at', { ascending: false });

        if (productosError?.code === '42703') {
          ({ data: productosData, error: productosError } = await supabase
            .from('productos')
            .select('*')
            .eq('categoria', categoria)
            .order('created_at', { ascending: false }));
        }

        if (productosError) throw productosError;

        setProductos((productosData || []).filter((p) => p.activo !== false));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [categoria]);

  const laboratorios = useMemo(() => {
    const labs = new Set(productos.map((p) => p.laboratorio).filter((l): l is string => Boolean(l)));
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

    return [...filtered].filter(p => !p.vencimiento || new Date(p.vencimiento) >= new Date()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [productos, query, selectedLaboratorio]);

  if (!categoria) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Categoría no encontrada</h1>
          <p className="text-gray-600 mb-6">La categoría que buscas no existe.</p>
          <Link href="/productos" className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors">
            <ArrowLeft size={18} />
            Volver a Productos
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded-lg w-1/3 animate-pulse mb-2" />
          <div className="h-5 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      {/* Header con botón de volver */}
      <div className="mb-8 pb-6 border-b-2 border-brand-100">
        <Link href="/productos" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold mb-4 transition-colors">
          <ArrowLeft size={18} />
          Volver
        </Link>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">{categoria}</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {descripcion}
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          {productos.length} {productos.length === 1 ? 'producto disponible' : 'productos disponibles'}
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6 sm:mb-8">
        <div className="relative max-w-xl group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-brand-600 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
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

      {/* Productos */}
      {productos.length === 0 ? (
        <div className="text-center py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Sin productos en esta categoría</h3>
          <p className="text-gray-600 text-base mb-6">Estamos trabajando para traer más productos pronto.</p>
          <Link href="/productos" className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-700 transition-colors">
            <ArrowLeft size={18} />
            Ver todas las categorías
          </Link>
        </div>
      ) : Array.isArray(productosFiltrados) && productosFiltrados.length === 0 ? (
        <div className="text-center py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No encontramos coincidencias</h3>
          <p className="text-gray-600 text-base mb-6">Intenta con otro término de búsqueda.</p>
          <button
            onClick={() => {
              setQuery('');
              setSelectedLaboratorio(null);
            }}
            className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-all"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {Array.isArray(productosFiltrados) && productosFiltrados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
