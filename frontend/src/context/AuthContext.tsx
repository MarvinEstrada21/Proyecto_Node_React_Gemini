import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, passwordUser: string) => Promise<AuthResponse>;
  register: (formData: FormData) => Promise<AuthResponse>;
  updateProfile: (formData: FormData) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('recetario_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar usuario inicial al montar la aplicación si hay token
  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('recetario_token');
      if (savedToken) {
        try {
          const res = await authApi.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (username: string, passwordUser: string): Promise<AuthResponse> => {
    const res = await authApi.login(username, passwordUser);
    if (res.success && res.token && res.user) {
      localStorage.setItem('recetario_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (formData: FormData): Promise<AuthResponse> => {
    const res = await authApi.register(formData);
    if (res.success && res.token && res.user) {
      localStorage.setItem('recetario_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const updateProfile = async (formData: FormData): Promise<User> => {
    const res = await authApi.updateProfile(formData);
    if (res.success && res.data) {
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Error al actualizar perfil');
  };

  const logout = () => {
    localStorage.removeItem('recetario_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch {
      // Ignorar fallo de refresco
    }
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = user?.roleUser === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        updateProfile,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
