'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';

export default function AdminNav() {
  const { logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="INSUPEC" width={616} height={214} className="h-8 sm:h-9 w-auto" />
          <span className="text-xs font-semibold text-gray-400 hidden sm:inline">ADMIN</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/admin/dashboard" className="text-black hover:text-gray-600 transition-colors text-sm">
            Dashboard
          </Link>
          <Link href="/admin/dashboard/nuevo" className="text-black hover:text-gray-600 transition-colors text-sm">
            Crear Producto
          </Link>
          <Link href="/admin/importar" className="text-black hover:text-gray-600 transition-colors text-sm">
            Importar
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold text-sm"
          >
            Salir
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden p-2 text-black hover:bg-gray-100 rounded transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
            <Link
              href="/admin/dashboard"
              className="text-black hover:text-gray-600 transition-colors text-sm py-2"
              onClick={handleNavClick}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/dashboard/nuevo"
              className="text-black hover:text-gray-600 transition-colors text-sm py-2"
              onClick={handleNavClick}
            >
              Crear Producto
            </Link>
            <Link
              href="/admin/importar"
              className="text-black hover:text-gray-600 transition-colors text-sm py-2"
              onClick={handleNavClick}
            >
              Importar Productos
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold text-sm"
            >
              Salir
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
