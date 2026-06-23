'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/lib/supabase';
import { generateWhatsAppMessage, getWhatsAppLink } from '@/lib/whatsapp';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  nombre: string;
  apellido: string;
  razonSocial: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  factura: boolean;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    razonSocial: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    factura: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-6">No hay productos en tu carrito.</p>
          <Link href="/productos" className="bg-[#4ca82b] text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700">
            Ir al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement & HTMLTextAreaElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields: (keyof FormData)[] = ['nombre', 'apellido', 'razonSocial', 'email', 'telefono', 'direccion', 'ciudad', 'codigoPostal'];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`El campo ${field} es requerido`);
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El email no es válido');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const productosData = items.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
      }));

      const { error: insertError } = await supabase.from('pedidos').insert([
        {
          nombre: formData.nombre,
          apellido: formData.apellido,
          razon_social: formData.razonSocial,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          codigo_postal: formData.codigoPostal,
          factura: formData.factura,
          productos: productosData,
          total,
          timestamp: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      const whatsappMessage = generateWhatsAppMessage(
        {
          nombre: formData.nombre,
          apellido: formData.apellido,
          razonSocial: formData.razonSocial,
          email: formData.email,
          telefono: formData.telefono,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          codigoPostal: formData.codigoPostal,
          factura: formData.factura,
        },
        items,
        total
      );

      const whatsappLink = getWhatsAppLink(whatsappMessage);

      setShowSuccess(true);
      clearCart();

      setTimeout(() => {
        window.open(whatsappLink, '_blank');
        setTimeout(() => {
          router.push('/productos');
        }, 1000);
      }, 2000);
    } catch (err) {
      console.error('Error submitting order:', err);
      setError('Error al enviar el pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center max-w-sm">
            <h2 className="text-2xl font-bold text-[#4ca82b] mb-4">¡Éxito!</h2>
            <p className="text-gray-700 mb-6">Tu pedido fue enviado a Insupec. Se abrirá WhatsApp automáticamente.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Información de Envío</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre *"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4ca82b]"
                  required
                />
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido *"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4ca82b]"
                  required
                />
              </div>

              <input
                type="text"
                name="razonSocial"
                placeholder="Razón Social *"
                value={formData.razonSocial}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4ca82b]"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4ca82b]"
                  required
                />
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono *"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4ca82b]"
                  required
                />
              </div>

              <textarea
                name="direccion"
                placeholder="Dirección *"
                value={formData.direccion}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4ca82b]"
                rows={3}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="ciudad"
                  placeholder="Ciudad *"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4ca82b]"
                  required
                />
                <input
                  type="text"
                  name="codigoPostal"
                  placeholder="Código Postal *"
                  value={formData.codigoPostal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4ca82b]"
                  required
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="factura"
                  checked={formData.factura}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                />
                <span className="text-gray-700">¿Necesitas factura?</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-lg text-white transition-colors ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4ca82b] hover:bg-green-700'
                }`}
              >
                {loading ? 'Procesando...' : 'ENVIAR PEDIDO POR WHATSAPP'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Resumen del Pedido</h2>

            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between pb-4 border-b border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-800">{item.nombre}</p>
                    <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                  </div>
                  <p className="font-semibold text-gray-800">${(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 pt-4 space-y-3">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-bold text-[#4ca82b]">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
