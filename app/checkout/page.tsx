'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/lib/supabase';
import { generateWhatsAppMessage, getWhatsAppLink } from '@/lib/whatsapp';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

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
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">No hay productos en tu carrito.</p>
          <Link href="/productos" className="bg-brand-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold hover:bg-brand-700 inline-block text-sm sm:text-base">
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
        const fieldNames: Record<string, string> = {
          nombre: 'Nombre',
          apellido: 'Apellido',
          razonSocial: 'Razón Social',
          email: 'Email',
          telefono: 'Teléfono',
          direccion: 'Dirección',
          ciudad: 'Ciudad',
          codigoPostal: 'Código Postal',
        };
        setError(`${fieldNames[field]} es requerido`);
        return false;
      }
    }

    if (formData.nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return false;
    }

    if (formData.apellido.trim().length < 2) {
      setError('El apellido debe tener al menos 2 caracteres');
      return false;
    }

    if (formData.razonSocial.trim().length < 2) {
      setError('La razón social debe tener al menos 2 caracteres');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El email no es válido. Ej: usuario@ejemplo.com');
      return false;
    }

    if (formData.telefono.trim().length < 7) {
      setError('El teléfono no es válido');
      return false;
    }

    if (formData.direccion.trim().length < 5) {
      setError('La dirección debe tener al menos 5 caracteres');
      return false;
    }

    if (formData.ciudad.trim().length < 2) {
      setError('La ciudad debe tener al menos 2 caracteres');
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
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 text-center max-w-sm w-full">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-brand-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">¡Pedido enviado!</h2>
            <p className="text-sm sm:text-base text-gray-600">Tu pedido fue enviado a INSUPEC. Se abrirá WhatsApp automáticamente.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Información de Envío</h1>
            <p className="text-gray-600 text-sm mb-6 sm:mb-8">Completa tus datos para procesar el pedido</p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-4 rounded mb-6 flex gap-3 text-sm">
                <span className="flex-shrink-0">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Datos Personales</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Nombre *"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="apellido"
                      placeholder="Apellido *"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Datos de la Empresa</label>
                <input
                  type="text"
                  name="razonSocial"
                  placeholder="Razón Social / Empresa *"
                  value={formData.razonSocial}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Contacto</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                    required
                  />
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono *"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Dirección de Entrega</label>
                <textarea
                  name="direccion"
                  placeholder="Calle, número, piso, apto, etc. *"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">Localidad</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="text"
                    name="ciudad"
                    placeholder="Ciudad *"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                    required
                  />
                  <input
                    type="text"
                    name="codigoPostal"
                    placeholder="Código Postal *"
                    value={formData.codigoPostal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="factura"
                    checked={formData.factura}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-gray-700 text-sm font-medium">¿Necesitas factura?</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Link
                  href="/productos"
                  className="flex-1 py-3 rounded-lg font-bold text-center text-sm sm:text-base border border-gray-300 text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  VOLVER
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-lg font-bold text-sm sm:text-base text-white transition-colors ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
                  }`}
                >
                  {loading ? 'Procesando...' : 'ENVIAR POR WHATSAPP'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-24">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Resumen del Pedido</h2>

            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-48 sm:max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between pb-3 sm:pb-4 border-b border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm line-clamp-2">{item.nombre}</p>
                    <p className="text-xs text-gray-600">Cantidad: {item.cantidad}</p>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">${(item.precio * item.cantidad).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 pt-3 sm:pt-4 space-y-2 sm:space-y-3">
              <div className="flex justify-between text-base sm:text-lg">
                <span className="font-semibold text-sm sm:text-base">Subtotal:</span>
                <span className="font-extrabold text-brand-600 text-lg">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
