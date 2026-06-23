'use client';

import { useState, useEffect, ReactNode } from 'react';
import { isAdminLoggedIn, loginAdmin, logoutAdmin } from '@/lib/auth';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(isAdminLoggedIn());
  }, []);

  const login = (username: string, password: string): boolean => {
    const success = loginAdmin(username, password);
    if (success) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}
