import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearSession, getToken, setToken } from '../lib/auth';
import { getProfile, login as apiLogin } from '../lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken();
    if (token) {
      try {
        const profile = await getProfile();
        setIsAuthenticated(true);
        setUser({
          id: profile.user.userId,
          email: profile.user.email,
          name: profile.user.email,
          role: 'user',
        });
      } catch {
        clearSession();
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiLogin(email, password);
      setToken(response.access_token);
      setIsAuthenticated(true);
      setUser(response.user);
      return true;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
