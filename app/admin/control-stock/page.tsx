'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import { dateAMesAnio, mesAnioADate } from '@/lib/format';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { ChevronLeft, ChevronRight, Minus, Plus, CheckCircle2 } from 'lucide-react';

function estadoVencimiento(vencimiento: string): { label: string; classes: string } {
  if (!vencimiento) {
    return { label: 'Sin vencimiento cargado', classes: 'bg-gray-100 text-gray-600 border-gray-300' };
  }

  const hoy = new Date();
  const fecha = new Date(vencimiento);
  const diasRestantes = Math.floor((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) {
    return { label: '❌ Vencido', classes: 'bg-red-100 text-red-800 border-red-300' };
  }
  if (diasRestantes <= 60) {
    return { label: '⚠️ Vence pronto', classes: 'bg-orange-100 text-orange-800 border-orange-300' };
  }
  return { label: '✅ Vencimiento OK', classes: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
}

interface TarjetaProductoProps {
  producto: Producto;
  indice: number;
  total: number;
  onGuardar: (stock: number, vencimiento: string | null) => Promise<boolean>;
  onSiguiente: () => void;
  onAnterior: () => void;
  puedeVolver: boolean;
}

// Key'd por producto.id desde el padre: cada producto nuevo remonta este componente
// y reinicia sus inputs locales, sin necesidad de un efecto de sincronización.
function TarjetaProducto({ producto, indice, total, onGuardar, onSiguiente, onAnterior, puedeVolver }: TarjetaProductoProps) {
  const [stockInput, setStockInput] = useState(String(producto.stock ?? 0));
  const [vencimientoInput, setVencimientoInput] = useState(dateAMesAnio(producto.vencimiento));
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const guardarYAvanzar = async (avanzar: () => void) => {
    setGuardando(true);
    const nuevoStock = Math.max(0, parseInt(stockInput, 10) || 0);
    const nuevoVencimiento = vencimientoInput ? mesAnioADate(vencimientoInput) : null;
    const ok = await onGuardar(nuevoStock, nuevoVencimiento);
    setGuardando(false);
    if (ok) {
      setGuardado(true);
      avanzar();
    }
  };

  const vencimientoActual = vencimientoInput ? mesAnioADate(vencimientoInput) : '';
  const estado = estadoVencimiento(vencimientoActual);

  return (
    <div className="bg-white rounded-lg shadow-lg p-5 sm:p-6">
      {/* Progreso */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
          <span>Producto {indice + 1} de {total}</span>
          {guardando && <span className="text-brand-600">Guardando...</span>}
          {!guardando && guardado && <span className="text-emerald-600">✓ Guardado</span>}
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 transition-all"
            style={{ width: `${((indice + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Producto */}
      <div className="flex gap-3 items-center mb-5">
        {producto.foto_url ? (
          <img src={producto.foto_url} alt={producto.nombre} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
        )}
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900 leading-tight">{producto.nombre}</h2>
          <p className="text-sm text-gray-500">{producto.laboratorio}</p>
        </div>
      </div>

      {/* Stock */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock real</label>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setStockInput(String(Math.max(0, (parseInt(stockInput, 10) || 0) - 1)))}
            className="p-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
          >
            <Minus size={20} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={stockInput}
            onChange={(e) => setStockInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') guardarYAvanzar(onSiguiente);
            }}
            autoFocus
            className="w-28 text-center text-3xl font-bold border border-gray-300 rounded-lg py-2"
          />
          <button
            onClick={() => setStockInput(String((parseInt(stockInput, 10) || 0) + 1))}
            className="p-3 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Vencimiento */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vencimiento (mes/año)</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="month"
            value={vencimientoInput}
            onChange={(e) => setVencimientoInput(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {vencimientoInput && (
            <button
              onClick={() => setVencimientoInput('')}
              className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Quitar
            </button>
          )}
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${estado.classes}`}>
          {estado.label}
        </span>
      </div>

      {/* Navegación */}
      <div className="flex gap-3">
        <button
          onClick={() => guardarYAvanzar(onAnterior)}
          disabled={!puedeVolver || guardando}
          className="flex items-center justify-center gap-1 flex-1 py-3 rounded-lg font-bold bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft size={20} />
          Anterior
        </button>
        <button
          onClick={() => guardarYAvanzar(onSiguiente)}
          disabled={guardando}
          className="flex items-center justify-center gap-1 flex-1 py-3 rounded-lg font-bold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          Siguiente
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

function ControlStockContent() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [laboratorio, setLaboratorio] = useState<string | null>(null);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase.from('productos').select('*').order('nombre', { ascending: true });
      if (!error) setProductos(data || []);
      setLoading(false);
    };
    fetchProductos();
  }, []);

  const laboratorios = useMemo(
    () => Array.from(new Set(productos.map((p) => p.laboratorio).filter(Boolean))).sort(),
    [productos]
  );

  const lista = useMemo(
    () => (laboratorio ? productos.filter((p) => p.laboratorio === laboratorio) : productos),
    [productos, laboratorio]
  );

  const productoActual = lista[indice];

  const cambiarLaboratorio = (lab: string | null) => {
    setLaboratorio(lab);
    setIndice(0);
  };

  const guardarProducto = async (stock: number, vencimiento: string | null): Promise<boolean> => {
    if (!productoActual) return true;

    const sinCambios = stock === (productoActual.stock ?? 0) && vencimiento === (productoActual.vencimiento || null);
    if (sinCambios) return true;

    const { error } = await supabase
      .from('productos')
      .update({ stock, vencimiento })
      .eq('id', productoActual.id);

    if (error) {
      console.error('Error al guardar:', error);
      alert('No se pudo guardar. Probá de nuevo.');
      return false;
    }

    setProductos((prev) =>
      prev.map((p) => (p.id === productoActual.id ? { ...p, stock, vencimiento: vencimiento || undefined } : p))
    );
    return true;
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="max-w-2xl mx-auto px-4 pt-24 text-center text-gray-600">Cargando productos...</div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="max-w-2xl mx-auto px-4 pt-16 sm:pt-20 pb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Control de Stock y Vencimientos</h1>
        <p className="text-sm text-gray-600 mb-4">Recorré los productos uno por uno, cargá el stock real y revisá el vencimiento.</p>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Laboratorio</label>
          <select
            value={laboratorio ?? ''}
            onChange={(e) => cambiarLaboratorio(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Todos los laboratorios ({productos.length})</option>
            {laboratorios.map((lab) => (
              <option key={lab} value={lab}>
                {lab} ({productos.filter((p) => p.laboratorio === lab).length})
              </option>
            ))}
          </select>
        </div>

        {lista.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">No hay productos para revisar.</div>
        ) : indice >= lista.length ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircle2 size={48} className="text-emerald-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">¡Listo!</h2>
            <p className="text-gray-600 mb-4">
              Revisaste los {lista.length} productos {laboratorio ? `de ${laboratorio}` : 'del catálogo'}.
            </p>
            <button
              onClick={() => setIndice(0)}
              className="bg-black text-white px-5 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-colors"
            >
              Empezar de nuevo
            </button>
          </div>
        ) : (
          <TarjetaProducto
            key={productoActual.id}
            producto={productoActual}
            indice={indice}
            total={lista.length}
            onGuardar={guardarProducto}
            onSiguiente={() => setIndice((i) => i + 1)}
            onAnterior={() => setIndice((i) => Math.max(0, i - 1))}
            puedeVolver={indice > 0}
          />
        )}
      </div>
    </>
  );
}

export default function ControlStockPage() {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <ControlStockContent />
      </div>
    </ProtectedAdminRoute>
  );
}
