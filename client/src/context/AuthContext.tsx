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
import { STORAGE_KEYS } from '../lib/constants';

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
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    queryClient.clear();
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    setUser(newUser);
    queryClient.clear();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user));
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
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch {
            localStorage.removeItem(STORAGE_KEYS.USER);
          }
        }
      } finally {
        // Immediately end loading so UI renders cached user credentials with 0ms delay
        setIsLoading(false);
      }

      // Background re-validation against the server
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data.user));
          }
        } catch {
          logout();
        }
      }
    };

    initializeAuth();

    // Listen for unauthorized events emitted by axios interceptor
    window.addEventListener('auth:unauthorized', logout);
    return () => {
      window.removeEventListener('auth:unauthorized', logout);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
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
