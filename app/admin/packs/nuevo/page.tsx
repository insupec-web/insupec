'use client';

export const dynamic = 'force-dynamic';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function NuevoPackContent() {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
  });

  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingProductos, setFetchingProductos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProductos() {
      try {
        const { data, error } = await supabase.from('productos').select('*').order('nombre');

        if (error) throw error;

        setProductos(data || []);
      } catch (err) {
        console.error('Error fetching productos:', err);
        setError('Error al cargar los productos');
      } finally {
        setFetchingProductos(false);
      }
    }

    fetchProductos();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductToggle = (productoId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productoId) ? prev.filter((id) => id !== productoId) : [...prev, productoId]
    );
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }

      if (!selectedFile.type.startsWith('image/')) {
        setError('El archivo debe ser una imagen válida.');
        return;
      }

      setError(null);
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error, data } = await supabase.storage.from('productos').upload(fileName, file);

    if (error) {
      throw error;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/productos/${fileName}`;

    return publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre || !formData.precio || selectedProducts.length === 0) {
      setError('Completa el nombre, precio y selecciona al menos un producto');
      return;
    }

    setLoading(true);

    try {
      let foto_url = '';
      if (file) {
        foto_url = await uploadImage(file);
      }

      const { data: packData, error: insertError } = await supabase
        .from('packs')
        .insert([
          {
            nombre: formData.nombre,
            descripcion: formData.descripcion || null,
            precio: parseFloat(formData.precio),
            foto_url: foto_url || null,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Agregar items al pack
      const packItems = selectedProducts.map((productoId) => ({
        pack_id: packData.id,
        producto_id: productoId,
        cantidad: 1,
      }));

      const { error: itemsError } = await supabase.from('pack_items').insert(packItems);

      if (itemsError) {
        throw itemsError;
      }

      router.push('/admin/packs');
    } catch (err) {
      console.error('Error creating pack:', err);
      const msg =
        (err as { message?: string; details?: string })?.message ||
        (err as { details?: string })?.details ||
        'Error desconocido';
      setError(`Error al crear el pack: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNav />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Crear Nuevo Pack</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nombre del Pack *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Pack Reproductivo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del pack..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-600"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Precio *</label>
              <input
                type="number"
                step="0.01"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-600"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Foto del Pack</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  {preview ? (
                    <div>
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded mb-4" />
                      <p className="text-sm text-gray-600">Haz clic para cambiar la imagen</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">Arrastra la imagen aquí o haz clic para seleccionar</p>
                      <p className="text-sm text-gray-500">PNG, JPG, GIF (máx. 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-3">Productos en el Pack *</label>
              {fetchingProductos ? (
                <p className="text-gray-600">Cargando productos...</p>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                  {productos.map((producto) => (
                    <label key={producto.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(producto.id)}
                        onChange={() => handleProductToggle(producto.id)}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{producto.nombre}</p>
                        <p className="text-xs text-gray-600">${producto.precio.toFixed(2)}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {selectedProducts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedProducts.map((productId) => {
                    const producto = productos.find((p) => p.id === productId);
                    return (
                      <div key={productId} className="flex items-center gap-2 bg-brand-100 text-brand-700 px-3 py-1 rounded-lg text-sm font-semibold">
                        {producto?.nombre}
                        <button
                          type="button"
                          onClick={() => handleProductToggle(productId)}
                          className="text-brand-600 hover:text-brand-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || fetchingProductos}
                className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${
                  loading || fetchingProductos ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                {loading ? 'Guardando...' : 'GUARDAR PACK'}
              </button>

              <Link
                href="/admin/packs"
                className="flex-1 py-3 rounded-lg font-bold text-center border-2 border-gray-300 text-gray-800 hover:bg-gray-50 transition-colors"
              >
                CANCELAR
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function NuevoPackPage() {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-white">
        <NuevoPackContent />
      </div>
    </ProtectedAdminRoute>
  );
}
