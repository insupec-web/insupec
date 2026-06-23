'use client';

export const dynamic = 'force-dynamic';

import { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import AdminNav from '@/components/AdminNav';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function NuevoProductoContent() {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    vencimiento: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    const fileName = `${Date.now()}-${file.name}`;
    const { error, data } = await supabase.storage.from('productos').upload(fileName, file);

    if (error) {
      throw error;
    }

    const { data: publicUrl } = supabase.storage.from('productos').getPublicUrl(fileName);

    return publicUrl.publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre || !formData.precio || !formData.stock || !formData.vencimiento) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (!file) {
      setError('Debes seleccionar una imagen');
      return;
    }

    setLoading(true);

    try {
      const foto_url = await uploadImage(file);

      const { error: insertError } = await supabase.from('productos').insert([
        {
          nombre: formData.nombre,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock),
          vencimiento: formData.vencimiento,
          foto_url,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Error creating producto:', err);
      setError('Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNav />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-20 sm:pt-28 pb-8 sm:pb-12">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">Crear Nuevo Producto</h1>
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
                placeholder="Ej: Leche entera 1L"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
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
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
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
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Fecha de Vencimiento *</label>
              <input
                type="date"
                name="vencimiento"
                value={formData.vencimiento}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Foto del Producto *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                  required
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
                disabled={loading}
                className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                }`}
              >
                {loading ? 'Guardando...' : 'GUARDAR PRODUCTO'}
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

export default function NuevoProductoPage() {
  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-white">
        <NuevoProductoContent />
      </div>
    </ProtectedAdminRoute>
  );
}
