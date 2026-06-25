'use client';

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { loginAdmin, logoutAdmin } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Verificar autenticación inicial y escuchar cambios
  useEffect(() => {
    setMounted(true);

    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session?.user?.id);
    };

    checkAuth();

    // Escuchar cambios de sesión
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const success = await loginAdmin(email, password);
    if (success) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}
