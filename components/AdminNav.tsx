'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AdminNav() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/admin/dashboard" className="text-2xl font-bold text-black">
          INSUPEC ADMIN
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="text-black hover:text-gray-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/dashboard/nuevo" className="text-black hover:text-gray-600 transition-colors">
            Crear Producto
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
