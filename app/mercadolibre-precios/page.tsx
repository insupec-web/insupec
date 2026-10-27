'use client';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';

interface ProductoConPrecio extends Producto {
  precioPublicar: number;
  comisionML: number;
}

const COMISIONES_POR_CATEGORIA: Record<string, number> = {
  'Grandes Animales': 0.10,
  'Animales de Compañía': 0.12,
  'Cerco Eléctrico': 0.10,
  'Hormiguicida': 0.12,
  'Instrumental': 0.10,
  'Limpieza': 0.12,
  'Solar': 0.08,
};

export default function MercadoLibrePreciosPage() {
  const [productos, setProductos] = useState<ProductoConPrecio[]>([]);
  const [loading, setLoading] = useState(true);
  const [comisionGlobal, setComisionGlobal] = useState(0.12);

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

        const conPrecios = activos.map(p => {
          const comision = COMISIONES_POR_CATEGORIA[p.categoria || ''] || comisionGlobal;
          const precioPublicar = Math.round((p.precio / (1 - comision)) * 100) / 100;
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
  }, []);

  const handleDownloadCSV = () => {
    const headers = ['SKU', 'Producto', 'Categoría', 'Precio Original', 'Comisión ML %', 'Comisión $', 'PRECIO A PUBLICAR', 'Stock', 'IVA'];
    const rows = productos.map(p => {
      const comision = COMISIONES_POR_CATEGORIA[p.categoria || ''] || comisionGlobal;
      return [
        p.id,
        `"${p.nombre.replace(/"/g, '""')}"`,
        `"${(p.categoria || '').replace(/"/g, '""')}"`,
        p.precio,
        `${(comision * 100).toFixed(1)}%`,
        p.comisionML.toFixed(2),
        p.precioPublicar.toFixed(2),
        p.stock || 0,
        '21%'
      ];
    });

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

      <h1 className="text-4xl font-bold text-gray-900 mb-4">Calculadora de Precios Mercado Libre</h1>
      <p className="text-gray-600 mb-8">Calcula automáticamente los precios para publicar considerando comisiones</p>

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
              <p className="text-red-600 text-sm font-semibold">COMISIONES</p>
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
                  <th className="px-4 py-3 text-center font-bold">Categoría</th>
                  <th className="px-4 py-3 text-right font-bold">Precio Original</th>
                  <th className="px-4 py-3 text-right font-bold">Comisión</th>
                  <th className="px-4 py-3 text-right font-bold bg-green-100">👉 PUBLICAR A</th>
                  <th className="px-4 py-3 text-center font-bold">Stock</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p, idx) => (
                  <tr key={p.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">{p.nombre.substring(0, 40)}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{p.categoria || '-'}</td>
                    <td className="px-4 py-3 text-right">${p.precio.toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 text-right text-red-600">-${p.comisionML.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700 bg-green-50">
                      ${p.precioPublicar.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{p.stock || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Instrucciones */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Cómo usar:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Descarga el CSV con los precios calculados</li>
              <li>Ve a Mercado Libre → "Publicá varios productos a la vez"</li>
              <li>En la columna "Precio" de tu planilla, pegá los valores de "PUBLICAR A"</li>
              <li>¡Publicá! Después de comisiones, te quedará el precio original</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
