'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, use, ChangeEvent, FormEvent } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import { compressImage } from '@/lib/compressImage';
import { mesAnioADate, dateAMesAnio } from '@/lib/format';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function EditProductoContent({ id }: { id: string }) {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    vencimiento: '',
    laboratorio: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducto() {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setFormData({
            nombre: data.nombre,
            precio: data.precio.toString(),
            stock: data.stock.toString(),
            vencimiento: dateAMesAnio(data.vencimiento),
            laboratorio: data.laboratorio || '',
          });
          setPreview(data.foto_url);
        }
      } catch (err) {
        console.error('Error fetching producto:', err);
        setError('Producto no encontrado');
      } finally {
        setLoading(false);
      }
    }

    fetchProducto();
  }, [id]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    const compressed = await compressImage(file);
    const fileName = `${Date.now()}-${compressed.name}`;
    const { error, data } = await supabase.storage
      .from('productos')
      .upload(fileName, compressed, { cacheControl: '31536000', contentType: compressed.type });

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

    if (!formData.nombre || !formData.precio || !formData.stock || !formData.laboratorio) {
      setError('Completa todos los campos requeridos');
      return;
    }

    setSaving(true);

    try {
      let foto_url = preview;

      if (file) {
        foto_url = await uploadImage(file);
      }

      const { error: updateError } = await supabase
        .from('productos')
        .update({
          nombre: formData.nombre,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock),
          vencimiento: formData.vencimiento ? mesAnioADate(formData.vencimiento) : null,
          laboratorio: formData.laboratorio,
          foto_url,
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Error updating producto:', err);
      const msg =
        (err as { message?: string; details?: string })?.message ||
        (err as { details?: string })?.details ||
        'Error desconocido';
      setError(`Error al actualizar el producto: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminNav />
        <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <Link href="/admin/dashboard" className="text-black hover:text-gray-700">
            Volver al dashboard
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Editar Producto</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nombre del Producto *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-gray-700 font-semibold mb-2">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Vencimiento (Mes/Año)</label>
                <input
                  type="month"
                  name="vencimiento"
                  value={formData.vencimiento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-600"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Laboratorio *</label>
                <input
                  type="text"
                  name="laboratorio"
                  value={formData.laboratorio}
                  onChange={handleInputChange}
                  placeholder="Ej: Bayer, Zoetis, Eli Lilly"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Foto del Producto</label>
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
                href="/admin/dashboard"
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

export default function EditProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-white">
        <EditProductoContent id={id} />
      </div>
    </ProtectedAdminRoute>
  );
}
