export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { supabase, Producto } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatPrice, toTitleCase } from '@/lib/formatPrice';
import ProductoDetailClient from './client';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://insupec.com.ar';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const { data: producto } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (!producto) {
      return { title: 'Producto no encontrado' };
    }

    const productUrl = `${baseUrl}/productos/${producto.id}`;
    const imageUrl = producto.foto_url || `${baseUrl}/logo.png`;

    return {
      title: `${toTitleCase(producto.nombre)} - INSUPEC`,
      description: `${toTitleCase(producto.nombre)} - $${formatPrice(producto.precio)}. Laboratorio: ${producto.laboratorio}. Stock: ${producto.stock || 0} unidades disponibles.`,
      openGraph: {
        title: toTitleCase(producto.nombre),
        description: `Precio: $${formatPrice(producto.precio)}`,
        url: productUrl,
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: producto.nombre,
          }
        ],
      },
    };
  } catch (error) {
    return { title: 'Producto no encontrado' };
  }
}

export default async function ProductoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { data: producto, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !producto) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-red-600 font-semibold mb-4">Producto no encontrado</p>
          <Link href="/productos" className="text-black hover:text-gray-700 flex items-center gap-2">
            <ArrowLeft size={20} />
            Volver al catálogo
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <Link href="/productos" className="text-brand-600 hover:underline flex items-center gap-2 mb-6 sm:mb-8 text-sm font-medium">
          <ArrowLeft size={18} />
          Volver al catálogo
        </Link>

        <ProductoDetailClient producto={producto} />
      </div>
    );
  } catch (err) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-red-600 font-semibold mb-4">Error al cargar el producto</p>
        <Link href="/productos" className="text-black hover:text-gray-700 flex items-center gap-2">
          <ArrowLeft size={20} />
          Volver al catálogo
        </Link>
      </div>
    );
  }
}
