import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/types';
import { loginRequest } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role: string | null | undefined): UserRole => {
  if (!role) return 'user';
  const cleaned = role.toLowerCase().replace(/[\s_-]+/g, '');
  if (cleaned === 'superadmin') return 'superadmin';
  if (cleaned === 'admin') return 'admin';
  return 'user';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        setUser({ ...parsed, role: normalizeRole(parsed.role) });
      } catch {
        localStorage.removeItem('user');
      }
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token: apiToken, user: apiUser } = await loginRequest(email, password);

      const authenticatedUser: User = {
        id: apiUser.id,
        email: apiUser.email,
        name: apiUser.name,
        role: normalizeRole(apiUser.role),
      };

      setUser(authenticatedUser);
      setToken(apiToken);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));
      localStorage.setItem('token', apiToken);

      return authenticatedUser.role;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
