'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

// El carrito ahora es un panel lateral global. Esta ruta redirige al
// catálogo y abre el drawer para mantener compatibilidad con enlaces viejos.
export default function CarritoPage() {
  const router = useRouter();
  const { openCart } = useCart();

  useEffect(() => {
    router.replace('/productos');
    openCart();
  }, [router, openCart]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-gray-500">Abriendo tu carrito...</p>
    </div>
  );
}
