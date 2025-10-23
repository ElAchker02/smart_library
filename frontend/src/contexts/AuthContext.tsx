import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { mockUser, mockAdmin, mockSuperAdmin } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<string>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock authentication
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let authenticatedUser: User;
    if (email === 'superadmin@biblio.com') {
      authenticatedUser = mockSuperAdmin;
    } else if (email === 'admin@biblio.com') {
      authenticatedUser = mockAdmin;
    } else {
      authenticatedUser = mockUser;
    }
    
    setUser(authenticatedUser);
    localStorage.setItem('user', JSON.stringify(authenticatedUser));
    setIsLoading(false);
    
    // Return user role for redirection
    return authenticatedUser.role;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
