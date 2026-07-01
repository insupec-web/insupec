'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Producto } from '@/lib/supabase';
import { formatPrice } from '@/lib/formatPrice';
import { Search, Package, X } from 'lucide-react';

function resaltar(texto: string, query: string) {
  const q = query.trim();
  if (!q) return texto;
  const idx = texto.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return texto;
  return (
    <>
      {texto.slice(0, idx)}
      <span className="font-bold text-brand-700">{texto.slice(idx, idx + q.length)}</span>
      {texto.slice(idx + q.length)}
    </>
  );
}

export default function SearchAutocomplete({
  productos,
  query,
  onQueryChange,
}: {
  productos: Producto[];
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const sugerencias = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return productos
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.laboratorio && p.laboratorio.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [productos, query]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setHighlighted(-1);
  }, [query]);

  const irAlProducto = (id: string) => {
    setOpen(false);
    router.push(`/productos/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (sugerencias.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => (h + 1) % sugerencias.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => (h <= 0 ? sugerencias.length - 1 : h - 1));
    } else if (e.key === 'Enter' && highlighted >= 0 && open) {
      e.preventDefault();
      irAlProducto(sugerencias[highlighted].id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative max-w-xl">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar por nombre o laboratorio..."
        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        role="combobox"
        aria-expanded={open && sugerencias.length > 0}
        aria-autocomplete="list"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            onQueryChange('');
            setOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X size={16} />
        </button>
      )}

      {open && sugerencias.length > 0 && (
        <div className="absolute z-40 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <ul>
            {sugerencias.map((producto, idx) => (
              <li key={producto.id}>
                <button
                  type="button"
                  onClick={() => irAlProducto(producto.id)}
                  onMouseEnter={() => setHighlighted(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    highlighted === idx ? 'bg-brand-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {producto.foto_url ? (
                      <img src={producto.foto_url} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Package size={18} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{resaltar(producto.nombre, query)}</p>
                    <p className="text-xs text-gray-500 truncate">{resaltar(producto.laboratorio || '', query)}</p>
                  </div>
                  <span className="text-sm font-bold text-brand-600 whitespace-nowrap">
                    ${formatPrice(producto.precio)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 px-3 py-2 bg-gray-50">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Ver todos los resultados abajo ↓
            </button>
          </div>
        </div>
      )}

      {open && query.trim().length >= 2 && sugerencias.length === 0 && (
        <div className="absolute z-40 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3">
          <p className="text-sm text-gray-500">No encontramos productos para “{query.trim()}”</p>
        </div>
      )}
    </div>
  );
}
