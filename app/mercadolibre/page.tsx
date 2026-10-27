'use client';

import { useEffect, useState } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Download, Copy, Check } from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://insupec.com.ar';

export default function MercadoLibrePage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
        setProductos(activos);
      } catch (err) {
        console.error('Error fetching productos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, []);

  const links = productos.map(p => `${baseUrl}/productos/${p.id}`).join('\n');

  const handleCopyLinks = () => {
    navigator.clipboard.writeText(links);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const link = document.createElement('a');
    link.href = '/api/productos-mercadolibre';
    link.download = 'insupec-productos-mercadolibre.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Link href="/" className="text-brand-600 hover:underline flex items-center gap-2 mb-6 text-sm font-medium">
        <ArrowLeft size={18} />
        Volver al inicio
      </Link>

      <h1 className="text-4xl font-bold text-gray-900 mb-4">Exportar a Mercado Libre</h1>
      <p className="text-gray-600 mb-8">Descarga o copia los links de todos tus productos para importarlos a Mercado Libre</p>

      {loading ? (
        <p className="text-gray-600">Cargando productos...</p>
      ) : (
        <div className="space-y-6">
          {/* Botones de acción */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
            >
              <Download size={20} />
              Descargar CSV
            </button>

            <button
              onClick={handleCopyLinks}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              {copied ? 'Copiado!' : 'Copiar todos los links'}
            </button>
          </div>

          {/* Resumen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-semibold">
              📦 {productos.length} productos listos para importar
            </p>
            <p className="text-blue-700 text-sm mt-2">
              Usa el CSV para importar directamente, o copia los links para pegarlos manualmente en Mercado Libre
            </p>
          </div>

          {/* Vista previa de links */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Preview de links:</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              <code className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                {links}
              </code>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cómo importar en Mercado Libre:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Ve a tu panel de Mercado Libre</li>
              <li>Busca la opción "Importá productos desde links"</li>
              <li>
                <strong>Opción A:</strong> Descarga el CSV y cárgalo
              </li>
              <li>
                <strong>Opción B:</strong> Copia todos los links y pégalos uno por uno
              </li>
              <li>Mercado Libre extraerá automáticamente: nombre, precio, imagen, stock</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
