'use client';

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { isAdminLoggedIn, loginAdmin, logoutAdmin } from '@/lib/auth';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Verificar autenticación inicial y escuchar cambios
  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      setIsAuthenticated(isAdminLoggedIn());
    };

    checkAuth();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const success = loginAdmin(username, password);
    if (success) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    logoutAdmin();
    setIsAuthenticated(false);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}
