import { useCallback, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Checa e decodifica o token
  const checkToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        // Token expirado
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
      } else {
        setUser(decoded);
        setIsAuthenticated(true);
        setLoading(false);
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  // Inicializa e escuta mudanças no token
  useEffect(() => {
    checkToken();
    // Sincroniza logout entre abas
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') checkToken();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [checkToken]);

  // Login: salva token e atualiza estado
  const login = (token: string) => {
    localStorage.setItem('token', token);
    checkToken();
  };

  // Logout: remove token e atualiza estado
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, isAuthenticated, login, logout, loading };
} 