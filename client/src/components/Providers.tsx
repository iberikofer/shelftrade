'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#1A1A1A',
              border: '1px solid rgba(26, 26, 26, 0.12)',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(26, 26, 26, 0.08)',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#3D5C2A', // Olive
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#8B2020', // Crimson
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

