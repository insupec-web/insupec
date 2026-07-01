'use client';

export const dynamic = 'force-dynamic';

import { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/formatPrice';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatMesAnio } from '@/lib/format';

interface ProductoCSV {
  nombre: string;
  precio: string;
  stock: string;
  vencimiento: string;
  laboratorio?: string;
}

interface ProductoImport {
  nombre: string;
  precio: number;
  stock: number;
  vencimiento: string;
  laboratorio: string;
  foto_url: string;
}

// Normaliza las claves de una fila: sin espacios y en minúscula.
function normalizeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    out[key.trim().toLowerCase()] = row[key];
  }
  return out;
}

// Devuelve el primer valor no vacío entre varias claves posibles.
function pick(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return '';
}

// Convierte distintos formatos de fecha a YYYY-MM-DD.
function parseVencimiento(value: unknown): string {
  const fallback = new Date().toISOString().split('T')[0];
  if (value === undefined || value === null || value === '') return fallback;

  // Número de serie de Excel (días desde 1900).
  if (typeof value === 'number') {
    const d = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  const str = String(value).trim();
  let m = str.match(/^(\d{1,2})\/(\d{4})$/); // MM/YYYY
  if (m) return `${m[2]}-${m[1].padStart(2, '0')}-01`;
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // DD/MM/YYYY
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str; // YYYY-MM-DD
  m = str.match(/^(\d{4})-(\d{1,2})$/); // YYYY-MM
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-01`;

  const d = new Date(str);
  return isNaN(d.getTime()) ? fallback : d.toISOString().split('T')[0];
}

// Convierte a número tolerando strings con símbolos o separadores.
function parseNumero(value: unknown): number {
  if (typeof value === 'number') return value;
  const cleaned = String(value || '').replace(/[^0-9.,-]/g, '').replace(',', '.');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

// Lee un archivo CSV/Excel y devuelve los productos listos para guardar.
async function extractProductos(file: File): Promise<ProductoImport[]> {
  const isExcel = /\.(xlsx|xls)$/i.test(file.name);
  let rawRows: Record<string, unknown>[] = [];

  if (isExcel) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as Record<string, unknown>[];
  } else {
    const text = await file.text();
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim());
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      const obj: Record<string, unknown> = {};
      headers.forEach((h, idx) => (obj[h] = (parts[idx] ?? '').trim()));
      rawRows.push(obj);
    }
  }

  const productos: ProductoImport[] = [];
  for (const raw of rawRows) {
    const row = normalizeRow(raw);
    const nombre = String(pick(row, 'nombre', 'producto', 'descripcion')).trim();
    if (!nombre) continue;

    // Preferir "precio final" sobre "precio" si existe.
    const precioRaw = pick(row, 'precio final', 'precio', 'precio venta');
    productos.push({
      nombre,
      precio: Math.round(parseNumero(precioRaw) * 100) / 100,
      stock: Math.round(parseNumero(pick(row, 'stock', 'cantidad'))),
      vencimiento: parseVencimiento(pick(row, 'vencimiento', 'fecha', 'vto')),
      laboratorio: String(pick(row, 'laboratorio', 'lab', 'marca')).trim(),
      foto_url: '',
    });
  }
  return productos;
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
      const productos = await extractProductos(file);

      if (productos.length === 0) {
        setError('No se encontraron productos válidos en el archivo');
        return;
      }

      setPreview(
        productos.slice(0, 5).map((p) => ({
          nombre: p.nombre,
          precio: formatPrice(p.precio),
          stock: String(p.stock),
          vencimiento: formatMesAnio(p.vencimiento),
          laboratorio: p.laboratorio,
        }))
      );
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Error al leer el archivo. Asegúrate que sea un CSV o Excel válido.');
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
      const productos = await extractProductos(file);

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
      const msg =
        (err as { message?: string; details?: string })?.message ||
        (err as { details?: string })?.details ||
        'Error desconocido';
      setError(`Error al importar: ${msg}`);
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
              <label className="block text-gray-700 font-semibold mb-4">Formato esperado del CSV o Excel:</label>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
                <code className="text-xs sm:text-sm text-gray-800">
                  nombre,precio,stock,vencimiento,laboratorio
                  <br />
                  Leche 1L,2.50,100,12/2026,Bayer
                  <br />
                  Queso,5.00,50,11/2026,Zoetis
                </code>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Columnas: nombre, precio (o &quot;Precio Final&quot;), stock, vencimiento (MM/AAAA) y laboratorio.
                Se aceptan archivos Excel directamente.
              </p>
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
                        <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">Laboratorio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((p, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">{p.nombre}</td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">${p.precio}</td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">{p.stock}</td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">{p.vencimiento}</td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2">{p.laboratorio || '-'}</td>
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
