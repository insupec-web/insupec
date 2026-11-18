'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import { CATEGORIAS } from '@/lib/categorias';
import { formatPrice, toTitleCase } from '@/lib/formatPrice';
import { renderProductoCard, CARD_W, CARD_H } from '@/lib/screenshotProducto';
import { crearZip, ZipEntry } from '@/lib/zip';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { Download, Search, ImageIcon } from 'lucide-react';

const SIN_CATEGORIA = 'Sin categoría';

function categoriaDe(p: Producto): string {
  return p.categoria?.trim() || SIN_CATEGORIA;
}

function ordenarPorCategoriaYNombre(a: Producto, b: Producto): number {
  const ca = categoriaDe(a);
  const cb = categoriaDe(b);
  if (ca !== cb) {
    const ia = CATEGORIAS.indexOf(ca);
    const ib = CATEGORIAS.indexOf(cb);
    const ra = ia === -1 ? (ca === SIN_CATEGORIA ? 9999 : 1000) : ia;
    const rb = ib === -1 ? (cb === SIN_CATEGORIA ? 9999 : 1000) : ib;
    if (ra !== rb) return ra - rb;
    return ca.localeCompare(cb);
  }
  return a.nombre.localeCompare(b.nombre);
}

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'producto';
}

function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function CheckboxCategoria({
  checked,
  parcial,
  onChange,
}: {
  checked: boolean;
  parcial: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = parcial;
  }, [parcial]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-5 w-5 accent-brand-600 cursor-pointer"
    />
  );
}

function AdminScreenshotsContent() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [generando, setGenerando] = useState<{ actual: number; total: number } | null>(null);
  const [preview, setPreview] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const { data, error } = await supabase.from('productos').select('*').order('nombre', { ascending: true });
        if (error) throw error;
        setProductos(data || []);
      } catch (err) {
        console.error('Error fetching productos:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const termino = busqueda.trim().toLowerCase();

  // Productos visibles tras la búsqueda, agrupados por categoría.
  const grupos = useMemo(() => {
    const filtrados = productos
      .filter((p) => {
        if (!termino) return true;
        return (
          p.nombre.toLowerCase().includes(termino) ||
          (p.laboratorio || '').toLowerCase().includes(termino) ||
          categoriaDe(p).toLowerCase().includes(termino)
        );
      })
      .sort(ordenarPorCategoriaYNombre);

    const mapa = new Map<string, Producto[]>();
    for (const p of filtrados) {
      const cat = categoriaDe(p);
      if (!mapa.has(cat)) mapa.set(cat, []);
      mapa.get(cat)!.push(p);
    }
    return Array.from(mapa.entries()).map(([categoria, items]) => ({ categoria, items }));
  }, [productos, termino]);

  const seleccionadosOrdenados = useMemo(
    () => productos.filter((p) => seleccionados.has(p.id)).sort(ordenarPorCategoriaYNombre),
    [productos, seleccionados],
  );

  const primero = seleccionadosOrdenados[0] ?? null;
  const previewUrl = preview && primero && preview.id === primero.id ? preview.url : null;

  // Vista previa del primer producto seleccionado.
  useEffect(() => {
    if (!primero) return;
    let cancelado = false;
    let url: string | null = null;
    renderProductoCard(primero)
      .then((blob) => {
        if (cancelado) return;
        url = URL.createObjectURL(blob);
        setPreview({ id: primero.id, url });
      })
      .catch((err) => console.error('Error generando vista previa:', err));
    return () => {
      cancelado = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [primero]);

  const toggleProducto = (id: string) => {
    setSeleccionados((prev) => {
      const sig = new Set(prev);
      if (sig.has(id)) sig.delete(id);
      else sig.add(id);
      return sig;
    });
  };

  // Marca/desmarca todos los productos visibles de una categoría.
  const toggleCategoria = (items: Producto[]) => {
    setSeleccionados((prev) => {
      const sig = new Set(prev);
      const todos = items.every((p) => sig.has(p.id));
      items.forEach((p) => (todos ? sig.delete(p.id) : sig.add(p.id)));
      return sig;
    });
  };

  const seleccionarVisibles = () => {
    setSeleccionados((prev) => {
      const sig = new Set(prev);
      grupos.forEach((g) => g.items.forEach((p) => sig.add(p.id)));
      return sig;
    });
  };

  const handleGenerar = async () => {
    const lista = seleccionadosOrdenados;
    if (lista.length === 0 || generando) return;

    setError(null);
    setGenerando({ actual: 0, total: lista.length });

    try {
      const entries: ZipEntry[] = [];
      for (let i = 0; i < lista.length; i++) {
        const blob = await renderProductoCard(lista[i]);
        entries.push({
          name: `${String(i + 1).padStart(3, '0')}-${slugify(lista[i].nombre)}.png`,
          data: new Uint8Array(await blob.arrayBuffer()),
        });
        setGenerando({ actual: i + 1, total: lista.length });
      }

      const fecha = new Date().toISOString().split('T')[0];

      if (entries.length === 1) {
        const { name, data } = entries[0];
        descargarBlob(new Blob([data], { type: 'image/png' }), name);
      } else {
        descargarBlob(crearZip(entries), `Screenshots_${fecha}.zip`);
      }
    } catch (err) {
      console.error('Error generando screenshots:', err);
      setError('No se pudieron generar las imágenes. Revisá la consola y volvé a intentar.');
    } finally {
      setGenerando(null);
    }
  };

  const totalSeleccionados = seleccionados.size;

  return (
    <>
      <AdminNav />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-32">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Screenshots de productos</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Elegí categorías o productos y descargá una imagen vertical ({CARD_W}×{CARD_H}) con foto, precio, stock y
            vencimiento.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">{error}</div>
        )}

        {loading ? (
          <p className="text-gray-600">Cargando productos...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            {/* Selección */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 min-w-0">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, laboratorio o categoría"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-600"
                  />
                </div>
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={seleccionarVisibles}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium"
                  >
                    Marcar visibles
                  </button>
                  <button
                    onClick={() => setSeleccionados(new Set())}
                    disabled={totalSeleccionados === 0}
                    className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium disabled:opacity-40"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {grupos.length === 0 ? (
                <p className="text-gray-500 text-sm py-8 text-center">No hay productos que coincidan.</p>
              ) : (
                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                  {grupos.map(({ categoria, items }) => {
                    const marcados = items.filter((p) => seleccionados.has(p.id)).length;
                    const todos = marcados === items.length;
                    const parcial = marcados > 0 && !todos;
                    return (
                      <div key={categoria}>
                        <label className="flex items-center gap-3 py-2 px-2 bg-brand-50 rounded-lg cursor-pointer sticky top-0 z-10">
                          <CheckboxCategoria checked={todos} parcial={parcial} onChange={() => toggleCategoria(items)} />
                          <span className="font-semibold text-gray-800 flex-1">{categoria}</span>
                          <span className="text-xs text-gray-500">
                            {marcados}/{items.length}
                          </span>
                        </label>

                        <ul className="mt-1">
                          {items.map((p) => {
                            const checked = seleccionados.has(p.id);
                            const stock = p.stock ?? 0;
                            return (
                              <li key={p.id}>
                                <label className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleProducto(p.id)}
                                    className="h-5 w-5 accent-brand-600 cursor-pointer shrink-0"
                                  />
                                  <div className="w-10 h-10 shrink-0 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                                    {p.foto_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={p.foto_url} alt="" className="w-full h-full object-contain" loading="lazy" />
                                    ) : (
                                      <ImageIcon size={16} className="text-gray-300" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{toTitleCase(p.nombre)}</p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {p.laboratorio || 'Sin laboratorio'}
                                      {p.activo === false && <span className="ml-2 text-amber-600 font-semibold">Oculto</span>}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-brand-700">${formatPrice(p.precio)}</p>
                                    <p className={`text-xs ${stock === 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                      {stock === 0 ? 'Sin stock' : `${stock} u.`}
                                    </p>
                                  </div>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vista previa + acción */}
            <aside className="lg:sticky lg:top-28 self-start space-y-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Vista previa</p>
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Vista previa" className="w-full h-auto rounded border border-gray-200" />
                ) : (
                  <div
                    className="w-full rounded border border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-400 text-center p-4"
                    style={{ aspectRatio: `${CARD_W} / ${CARD_H}` }}
                  >
                    Seleccioná un producto para ver la imagen
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <p className="text-sm text-gray-700 mb-3">
                  <strong>{totalSeleccionados}</strong> {totalSeleccionados === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                </p>
                <button
                  onClick={handleGenerar}
                  disabled={totalSeleccionados === 0 || generando !== null}
                  className="w-full py-3 rounded-lg bg-brand-600 text-white font-bold hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  {generando
                    ? `Generando ${generando.actual}/${generando.total}...`
                    : totalSeleccionados > 1
                      ? 'Descargar ZIP (PNG)'
                      : 'Descargar PNG'}
                </button>
                {totalSeleccionados > 1 && !generando && (
                  <p className="text-xs text-gray-500 mt-2">Se descarga un .zip con un PNG por producto.</p>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

export default function AdminScreenshotsPage() {
  return (
    <ProtectedAdminRoute>
      <AdminScreenshotsContent />
    </ProtectedAdminRoute>
  );
}
