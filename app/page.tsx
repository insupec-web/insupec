'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CATEGORIAS = [
  {
    slug: 'grandes-animales',
    nombre: 'Grandes Animales',
    descripcion: 'Productos especializados para ganado y animales grandes',
    emoji: '🐄',
    color: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    hover: 'hover:border-amber-500 hover:shadow-orange-200',
  },
  {
    slug: 'animales-de-compania',
    nombre: 'Animales de Compañía',
    descripcion: 'Todo para mascotas y animales de compañía',
    emoji: '🐶',
    color: 'from-pink-50 to-rose-50',
    border: 'border-pink-200',
    hover: 'hover:border-pink-500 hover:shadow-pink-200',
  },
  {
    slug: 'cerco-electrico',
    nombre: 'Cerco Eléctrico',
    descripcion: 'Sistemas de cerco eléctrico de alta calidad',
    emoji: '⚡',
    color: 'from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    hover: 'hover:border-yellow-500 hover:shadow-yellow-200',
  },
  {
    slug: 'hormiguicida',
    nombre: 'Hormiguicida',
    descripcion: 'Soluciones para control de plagas',
    emoji: '🐜',
    color: 'from-red-50 to-orange-50',
    border: 'border-red-200',
    hover: 'hover:border-red-500 hover:shadow-red-200',
  },
  {
    slug: 'instrumental',
    nombre: 'Instrumental',
    descripcion: 'Herramientas e instrumental profesional',
    emoji: '🔧',
    color: 'from-slate-50 to-gray-50',
    border: 'border-slate-200',
    hover: 'hover:border-slate-500 hover:shadow-slate-200',
  },
  {
    slug: 'limpieza',
    nombre: 'Limpieza',
    descripcion: 'Productos de limpieza y desinfección',
    emoji: '🧹',
    color: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    hover: 'hover:border-blue-500 hover:shadow-blue-200',
  },
  {
    slug: 'solar',
    nombre: 'Solar',
    descripcion: 'Energía solar y paneles solares',
    emoji: '☀️',
    color: 'from-yellow-50 to-orange-50',
    border: 'border-yellow-200',
    hover: 'hover:border-yellow-500 hover:shadow-yellow-200',
  },
];

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <div className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Nuestras Categorías</h1>
        <p className="text-lg text-gray-600">Explora nuestros productos por categoría</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {CATEGORIAS.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categoria/${cat.slug}`}
            className={`group bg-gradient-to-br ${cat.color} border-2 ${cat.border} rounded-2xl overflow-hidden transition-all duration-300 ${cat.hover} hover:shadow-xl hover:-translate-y-1 cursor-pointer`}
          >
            <div className="p-6 sm:p-8 h-full flex flex-col justify-between">
              <div className="mb-4">
                <div className="text-5xl sm:text-6xl mb-3">{cat.emoji}</div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-brand-700 transition-colors">
                  {cat.nombre}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {cat.descripcion}
                </p>
              </div>

              <div className="flex items-center gap-2 text-brand-600 font-semibold group-hover:gap-3 transition-all">
                <span>Ver productos</span>
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 pt-12 border-t border-gray-200 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">¿No encontraste lo que buscas?</h2>
        <p className="text-gray-600 mb-6">Puedes explorar todos nuestros productos o usar la búsqueda</p>
        <Link href="/productos" className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors">
          Ver todos los productos
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
