'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/auth';

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificar autenticación contra localStorage (fuente de verdad).
    // No dependemos del estado del context para evitar problemas de timing
    // tras el redirect desde el login en la misma pestaña.
    if (isAdminLoggedIn()) {
      setAuthorized(true);
      setIsChecking(false);
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  if (isChecking || !authorized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
