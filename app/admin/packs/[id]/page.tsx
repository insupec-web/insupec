'use client';

export const dynamic = 'force-dynamic';

import { useState, ChangeEvent, FormEvent, useEffect, use } from 'react';
import { supabase, Producto, Pack } from '@/lib/supabase';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function EditPackContent({ id }: { id: string }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
  });

  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [packData, productosData, packItemsData] = await Promise.all([
          supabase.from('packs').select('*').eq('id', id).single(),
          supabase.from('productos').select('*').order('nombre'),
          supabase.from('pack_items').select('producto_id').eq('pack_id', id),
        ]);

        if (packData.error) throw packData.error;
        if (productosData.error) throw productosData.error;

        const pack = packData.data as Pack;
        setFormData({
          nombre: pack.nombre,
          descripcion: pack.descripcion || '',
          precio: pack.precio.toString(),
        });

        if (pack.foto_url) {
          setPreview(pack.foto_url);
        }

        setProductos(productosData.data || []);

        if (packItemsData.data) {
          setSelectedProducts(packItemsData.data.map((item) => item.producto_id));
        }
      } catch (err) {
        console.error('Error fetching pack:', err);
        setError('Pack no encontrado');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductToggle = (productoId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productoId) ? prev.filter((p) => p !== productoId) : [...prev, productoId]
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

    setSaving(true);

    try {
      let foto_url = preview;

      if (file) {
        foto_url = await uploadImage(file);
      }

      const { error: updateError } = await supabase
        .from('packs')
        .update({
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          precio: parseFloat(formData.precio),
          foto_url: foto_url || null,
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Eliminar items antiguos
      await supabase.from('pack_items').delete().eq('pack_id', id);

      // Agregar nuevos items
      const packItems = selectedProducts.map((productoId) => ({
        pack_id: id,
        producto_id: productoId,
        cantidad: 1,
      }));

      const { error: itemsError } = await supabase.from('pack_items').insert(packItems);

      if (itemsError) {
        throw itemsError;
      }

      router.push('/admin/packs');
    } catch (err) {
      console.error('Error updating pack:', err);
      const msg =
        (err as { message?: string; details?: string })?.message ||
        (err as { details?: string })?.details ||
        'Error desconocido';
      setError(`Error al actualizar el pack: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </>
    );
  }

  if (error && error === 'Pack no encontrado') {
    return (
      <>
        <AdminNav />
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <Link href="/admin/packs" className="text-black hover:text-gray-700">
            Volver al dashboard
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Editar Pack</h1>
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
                disabled={saving}
                className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${
                  saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
                }`}
              >
                {saving ? 'Guardando...' : 'GUARDAR CAMBIOS'}
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

export default function EditPackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-white">
        <EditPackContent id={id} />
      </div>
    </ProtectedAdminRoute>
  );
}
