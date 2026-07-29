'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { supabase, Producto } from '@/lib/supabase';
import { mesAnioADate, dateAMesAnio } from '@/lib/format';
import { X } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface ProductEditModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductEditModal({ producto, isOpen, onClose, onSave }: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    vencimiento: '',
    laboratorio: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (producto && isOpen) {
      setFormData({
        nombre: producto.nombre || '',
        precio: producto.precio?.toString() || '',
        stock: ((producto.cantidad ?? producto.stock) ?? 0).toString(),
        vencimiento: producto.vencimiento ? dateAMesAnio(producto.vencimiento) : '',
        laboratorio: producto.laboratorio || '',
      });
      setPreview(producto.foto_url || '');
      setError(null);
      setFile(null);
    }
  }, [producto?.id, isOpen]);

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/productos/${fileName}`;

    return publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!producto || !formData.nombre || !formData.precio || !formData.stock || !formData.laboratorio) {
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
          cantidad: parseInt(formData.stock),
          vencimiento: formData.vencimiento ? mesAnioADate(formData.vencimiento) : null,
          laboratorio: formData.laboratorio,
          foto_url,
        })
        .eq('id', producto.id);

      if (updateError) {
        throw updateError;
      }

      setSaving(false);
      onSave();
      onClose();
    } catch (err: any) {
      console.error('Error updating producto:', err);
      const msg = err?.message || err?.details || JSON.stringify(err) || 'Error desconocido';
      setError(`Error al actualizar: ${msg}`);
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Editar Producto</h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Preview Imagen */}
            {preview && (
              <div className="flex justify-center">
                <img src={preview} alt={formData.nombre} className="h-40 w-40 object-cover rounded-lg" />
              </div>
            )}

            {/* Foto */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Foto del Producto</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">PNG, JPG o GIF. Máximo 5MB.</p>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nombre del Producto *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Paracetamol 500mg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Precio *</label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            {/* Laboratorio */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Laboratorio *</label>
              <input
                type="text"
                name="laboratorio"
                value={formData.laboratorio}
                onChange={handleInputChange}
                placeholder="Ej: Bayer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            {/* Vencimiento */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Vencimiento</label>
              <input
                type="text"
                name="vencimiento"
                value={formData.vencimiento}
                onChange={handleInputChange}
                placeholder="MM/YYYY"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
