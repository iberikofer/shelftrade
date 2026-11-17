'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import api from '../lib/axios';
import { queryClient } from '../lib/queryClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string | null;
  bookCount?: number;
  requestsCount?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('shelftrade_token');
    localStorage.removeItem('shelftrade_user');
    setToken(null);
    setUser(null);
    queryClient.clear();
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('shelftrade_token', newToken);
    localStorage.setItem('shelftrade_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    queryClient.clear();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('shelftrade_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('shelftrade_user', JSON.stringify(res.data.user));
      }
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('shelftrade_token');
        const storedUser = localStorage.getItem('shelftrade_user');

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser(parsedUser);
          } catch {
            localStorage.removeItem('shelftrade_user');
          }
        }
      } finally {
        // Immediately end loading so UI renders cached user credentials with 0ms delay
        setIsLoading(false);
      }

      // Background re-validation against the server
      const token = localStorage.getItem('shelftrade_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('shelftrade_user', JSON.stringify(res.data.user));
          }
        } catch {
          logout();
        }
      }
    };

    initializeAuth();

    // Listen for unauthorized events emitted by axios interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'ADMIN',
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
