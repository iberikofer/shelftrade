'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatarUrl?: string | null;
  bookCount: number;
  requestsCount: number;
  createdAt: string;
}

export function useAdminStats() {
  const { user, isAdmin } = useAuth();

  return useQuery<{
    stats: { totalUsers: number; totalBooks: number; totalRequests: number };
  }>({
    queryKey: ['admin-stats', user?.id],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data;
    },
    enabled: !!isAdmin,
  });
}

export function useAdminUsers() {
  const { user, isAdmin } = useAuth();

  return useQuery<{ data: AdminUser[]; total: number }>({
    queryKey: ['admin-users', user?.id],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data;
    },
    enabled: !!isAdmin,
  });
}

export function useAdminCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      role: 'USER' | 'ADMIN';
    }) => {
      const res = await api.post('/admin/users', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('New user successfully registered by admin');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : 'Failed to create user.';
      toast.error(message || 'Failed to create user.');
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.delete(`/admin/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('User and their listed books were deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : 'Failed to delete user.';
      toast.error(message || 'Failed to delete user.');
    },
  });
}

export function useAdminDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const res = await api.delete(`/admin/books/${bookId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Book removed by admin moderation.');
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : 'Failed to delete book.';
      toast.error(message || 'Failed to delete book.');
    },
  });
}
