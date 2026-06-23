'use client';

export const dynamic = 'force-dynamic';

import { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle } from 'lucide-react';

interface ProductoCSV {
  nombre: string;
  precio: string;
  stock: string;
  vencimiento: string;
}

function ImportarProductosContent() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<ProductoCSV[]>([]);
  const router = useRouter();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
        setError('El archivo debe ser CSV o Excel (.csv, .xlsx, .xls)');
        return;
      }

      setError(null);
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.trim().split('\n');

      if (lines.length < 2) {
        setError('El archivo debe tener encabezados y al menos 1 fila de datos');
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const nameIndex = headers.findIndex((h) => h.includes('nombre'));
      const priceIndex = headers.findIndex((h) => h.includes('precio'));
      const stockIndex = headers.findIndex((h) => h.includes('stock'));
      const expireIndex = headers.findIndex((h) => h.includes('vencimiento'));

      if (nameIndex === -1 || priceIndex === -1 || stockIndex === -1 || expireIndex === -1) {
        setError('El CSV debe tener columnas: nombre, precio, stock, vencimiento');
        return;
      }

      const productos: ProductoCSV[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts[nameIndex]) {
          productos.push({
            nombre: parts[nameIndex],
            precio: parts[priceIndex] || '0',
            stock: parts[stockIndex] || '0',
            vencimiento: parts[expireIndex] || new Date().toISOString().split('T')[0],
          });
        }
      }

      setPreview(productos.slice(0, 5));
    } catch (err) {
      setError('Error al leer el archivo. Asegúrate que sea un CSV válido.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Debes seleccionar un archivo');
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const nameIndex = headers.findIndex((h) => h.includes('nombre'));
      const priceIndex = headers.findIndex((h) => h.includes('precio'));
      const stockIndex = headers.findIndex((h) => h.includes('stock'));
      const expireIndex = headers.findIndex((h) => h.includes('vencimiento'));

      const productos = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts[nameIndex]) {
          productos.push({
            nombre: parts[nameIndex],
            precio: parseFloat(parts[priceIndex] || '0'),
            stock: parseInt(parts[stockIndex] || '0'),
            vencimiento: parts[expireIndex] || new Date().toISOString().split('T')[0],
            foto_url: 'https://via.placeholder.com/400?text=' + encodeURIComponent(parts[nameIndex]),
          });
        }
      }

      if (productos.length === 0) {
        setError('No se encontraron productos válidos en el archivo');
        return;
      }

      const { error: insertError } = await supabase.from('productos').insert(productos);

      if (insertError) {
        throw insertError;
      }

      setSuccess(`✅ Se importaron ${productos.length} productos exitosamente`);
      setFile(null);
      setPreview([]);

      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error importing productos:', err);
      setError('Error al importar los productos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNav />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">Importar Productos</h1>
          <p className="text-gray-600 text-sm sm:text-base">Carga un archivo CSV o Excel con tus productos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded mb-6 flex gap-3 text-sm">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-4 rounded mb-6 flex gap-3 text-sm">
              <CheckCircle size={20} />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-4">Formato esperado del CSV:</label>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
                <code className="text-xs sm:text-sm text-gray-800">
                  nombre,precio,stock,vencimiento
                  <br />
                  Leche 1L,2.50,100,2025-12-31
                  <br />
                  Queso,5.00,50,2025-11-30
                </code>
              </div>
              <p className="text-xs text-gray-600 mb-4">Las columnas deben ser: nombre, precio, stock, vencimiento (YYYY-MM-DD)</p>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Seleccionar archivo *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-black transition-colors">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                  required
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-800 font-semibold text-sm sm:text-base">
                    {file ? file.name : 'Haz clic o arrastra un archivo'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">CSV o Excel (.csv, .xlsx, .xls)</p>
                </label>
              </div>
            </div>

            {preview.length > 0 && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Vista previa (primeros 5 productos):</label>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Nombre</th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Precio</th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Stock</th>
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Vencimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">{p.nombre}</td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">${p.precio}</td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">{p.stock}</td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">{p.vencimiento}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="flex-1 py-3 rounded-lg font-bold text-center border-2 border-gray-300 text-gray-800 hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className={`flex-1 py-3 rounded-lg font-bold text-sm sm:text-base text-white transition-colors ${
                  loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                }`}
              >
                {loading ? '⏳ Importando...' : '📤 IMPORTAR PRODUCTOS'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Notas importantes:</h3>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
              <li>✓ Las imágenes se asignarán automáticamente como placeholders</li>
              <li>✓ Puedes editar cada producto después de importar</li>
              <li>✓ La fecha de vencimiento debe estar en formato YYYY-MM-DD</li>
              <li>✓ El precio y stock deben ser números válidos</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ImportarProductosPage() {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-white">
        <ImportarProductosContent />
      </div>
    </ProtectedAdminRoute>
  );
}
