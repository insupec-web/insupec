'use client';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Download, Settings } from 'lucide-react';

interface ProductoConPrecio extends Producto {
  precioPublicar: number;
  comisionML: number;
}

// Costos reales de Mercado Libre (según simulador oficial)
const COSTOS_ML_DEFAULT = {
  cargo_por_vender: 0.1024,  // 10.24%
  costo_cuotas: 0.128,       // 12.8% (si ofreces cuotas)
  iva: 0.21,                 // 21% en Argentina
};

export default function MercadoLibrePreciosPage() {
  const [productos, setProductos] = useState<ProductoConPrecio[]>([]);
  const [loading, setLoading] = useState(true);
  const [costos, setCostos] = useState(COSTOS_ML_DEFAULT);
  const [mostrarConfig, setMostrarConfig] = useState(false);

  useEffect(() => {
    async function fetchProductos() {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .or('activo.is.null,activo.eq.true')
          .order('nombre', { ascending: true });

        if (error) throw error;

        const activos = (data || []).filter(p => !p.vencimiento || new Date(p.vencimiento) >= new Date());

        // Cálculo: si quieres recibir X, necesitas publicar a: X / (1 - descuentos_totales)
        const descuentos_totales = costos.cargo_por_vender + costos.costo_cuotas + costos.iva;
        const margen_efectivo = 1 - descuentos_totales;

        const conPrecios = activos.map(p => {
          const precioPublicar = Math.round((p.precio / margen_efectivo) * 100) / 100;
          const comisionML = precioPublicar - p.precio;

          return {
            ...p,
            precioPublicar,
            comisionML
          };
        });

        setProductos(conPrecios);
      } catch (err) {
        console.error('Error fetching productos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, [costos]);

  const descuentos_totales = costos.cargo_por_vender + costos.costo_cuotas + costos.iva;
  const margen_efectivo = (1 - descuentos_totales) * 100;

  const handleDownloadCSV = () => {
    const headers = ['SKU', 'Producto', 'Precio Original', 'Cargo Vender %', 'Costo Cuotas %', 'IVA %', 'PRECIO A PUBLICAR', 'Stock'];
    const rows = productos.map(p => [
      p.id,
      `"${p.nombre.replace(/"/g, '""')}"`,
      p.precio,
      `${(costos.cargo_por_vender * 100).toFixed(2)}%`,
      `${(costos.costo_cuotas * 100).toFixed(2)}%`,
      `${(costos.iva * 100).toFixed(2)}%`,
      p.precioPublicar.toFixed(2),
      p.stock || 0
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `insupec-mercadolibre-precios-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalInvertido = productos.reduce((sum, p) => sum + (p.precio * (p.stock || 0)), 0);
  const totalComisiones = productos.reduce((sum, p) => sum + (p.comisionML * (p.stock || 0)), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <Link href="/" className="text-brand-600 hover:underline flex items-center gap-2 mb-6 text-sm font-medium">
        <ArrowLeft size={18} />
        Volver
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Calculadora Mercado Libre</h1>
          <p className="text-gray-600">Ajusta precios para que después de comisiones recibas lo que querés</p>
        </div>
        <button
          onClick={() => setMostrarConfig(!mostrarConfig)}
          className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <Settings size={18} />
          Costos
        </button>
      </div>

      {/* Configuración de costos */}
      {mostrarConfig && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ajustar Costos de Mercado Libre</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo por vender (%)</label>
              <input
                type="number"
                value={(costos.cargo_por_vender * 100).toFixed(2)}
                onChange={(e) => setCostos({...costos, cargo_por_vender: parseFloat(e.target.value) / 100})}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-gray-500 mt-1">Varía según categoría (10-28%)</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Costo cuotas (%)</label>
              <input
                type="number"
                value={(costos.costo_cuotas * 100).toFixed(2)}
                onChange={(e) => setCostos({...costos, costo_cuotas: parseFloat(e.target.value) / 100})}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-gray-500 mt-1">Si ofreces cuotas sin interés</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">IVA (%)</label>
              <input
                type="number"
                value={(costos.iva * 100).toFixed(2)}
                onChange={(e) => setCostos({...costos, iva: parseFloat(e.target.value) / 100})}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-gray-500 mt-1">Impuestos (21% en Argentina)</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            <strong>Margen neto después de costos: {margen_efectivo.toFixed(2)}%</strong>
          </p>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Cargando productos...</p>
      ) : (
        <div className="space-y-8">
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-600 text-sm font-semibold">PRODUCTOS</p>
              <p className="text-2xl font-bold text-blue-900">{productos.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 text-sm font-semibold">STOCK TOTAL</p>
              <p className="text-2xl font-bold text-green-900">{productos.reduce((sum, p) => sum + (p.stock || 0), 0)} u.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-600 text-sm font-semibold">INVERSIÓN</p>
              <p className="text-2xl font-bold text-amber-900">${totalInvertido.toLocaleString('es-AR')}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm font-semibold">SOBREPRECIO TOTAL</p>
              <p className="text-2xl font-bold text-red-900">${totalComisiones.toLocaleString('es-AR')}</p>
            </div>
          </div>

          {/* Botón descargar */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
          >
            <Download size={20} />
            Descargar CSV para Mercado Libre
          </button>

          {/* Tabla de productos */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-4 py-3 text-left font-bold">Producto</th>
                  <th className="px-4 py-3 text-right font-bold">Querés recibir</th>
                  <th className="px-4 py-3 text-right font-bold">Sobreprecio</th>
                  <th className="px-4 py-3 text-right font-bold bg-green-100">👉 PUBLICÁ A</th>
                  <th className="px-4 py-3 text-center font-bold">Stock</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p, idx) => (
                  <tr key={p.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900 line-clamp-2">{p.nombre.substring(0, 50)}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">${p.precio.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 text-right text-red-600">+${p.comisionML.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700 bg-green-50 text-lg">
                      ${p.precioPublicar.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{p.stock || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
