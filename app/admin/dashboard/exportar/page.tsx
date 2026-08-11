'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import Link from 'next/link';
import { Download, ArrowLeft } from 'lucide-react';

function ExportarProductosContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/export/productos');

      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Productos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting:', err);
      setError('Error al descargar el archivo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNav />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-6 sm:mb-8 text-sm">
          <ArrowLeft size={18} />
          Volver al Dashboard
        </Link>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Exportar Productos</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">Descarga un Excel con todos tus productos, precios y stock</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">{error}</div>}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-8">
            <h2 className="font-semibold text-blue-900 mb-3">¿Qué incluye el Excel?</h2>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>
                  <strong>Laboratorio, Nombre, Precio, Stock y Vencimiento</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>
                  <strong>Ordenado por laboratorio</strong> (A → Z)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>
                  <strong>Filtros automáticos</strong> en todas las columnas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>
                  <strong>Precios formateados</strong> como moneda
                </span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-3 sm:py-4 rounded-lg font-bold text-white text-base sm:text-lg transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <Download size={22} />
            {loading ? 'Descargando...' : 'DESCARGAR EXCEL'}
          </button>

          <p className="text-center text-xs sm:text-sm text-gray-600 mt-4">
            El archivo se descargará con la fecha del día en el nombre
          </p>
        </div>
      </div>
    </>
  );
}

export default function ExportarProductosPage() {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-white">
        <ExportarProductosContent />
      </div>
    </ProtectedAdminRoute>
  );
}
