'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/auth';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const success = await loginAdmin(email, password);

    if (success) {
      router.replace('/admin/dashboard');
    } else {
      setError('Email o contraseña incorrectos');
      setPassword('');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-3 sm:px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-sm w-full">
        <div className="flex justify-center mb-2">
          <img src="/logo.png" alt="INSUPEC" width={616} height={214} className="h-14 w-auto" />
        </div>
        <p className="text-center text-gray-500 text-sm font-semibold tracking-wide mb-6 sm:mb-8">PANEL DE ADMINISTRACIÓN</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6 text-xs sm:text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu email"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 sm:py-3 rounded-lg font-bold text-white text-sm sm:text-base transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'
            }`}
          >
            {loading ? 'Verificando...' : 'INGRESAR'}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <Link href="/productos" className="text-gray-600 hover:text-black text-xs sm:text-sm">
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
