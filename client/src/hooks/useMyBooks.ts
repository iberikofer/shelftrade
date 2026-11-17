'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '../lib/axios';
import { BookItem } from '../components/books/BookCard';
import toast from 'react-hot-toast';

export function useMyBooks() {
  return useQuery<{ data: BookItem[]; total: number }>({
    queryKey: ['my-books'],
    queryFn: async () => {
      const res = await api.get('/me/books');
      return res.data;
    },
  });
}

export function useAddBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      formDataOrJson: FormData | { title: string; author: string; photoUrl?: string },
    ) => {
      const isFormData = formDataOrJson instanceof FormData;
      const res = await api.post('/me/books', formDataOrJson, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Book successfully added to your shelf!');
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : 'Failed to add book. Please try again.';
      toast.error(message || 'Failed to add book. Please try again.');
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/me/books/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Book removed from your shelf.');
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : 'Failed to remove book.';
      toast.error(message || 'Failed to remove book.');
    },
  });
}
