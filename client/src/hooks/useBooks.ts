'use client';

import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { BookItem } from '../components/books/BookCard';

export interface BooksResponse {
  data: BookItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
}

interface UseBooksParams {
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  userId?: string;
}

export function useBooks({
  search = '',
  sort = 'asc',
  page = 1,
  limit = 8,
  userId,
}: UseBooksParams = {}) {
  return useQuery<BooksResponse>({
    queryKey: ['books', { search, sort, page, limit, userId }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (sort) params.set('sort', sort);
      if (page) params.set('page', page.toString());
      if (limit) params.set('limit', limit.toString());
      if (userId) params.set('userId', userId);

      const res = await api.get(`/books?${params.toString()}`);
      return res.data;
    },
  });
}

export function useBook(id?: string) {
  return useQuery<{ data: BookItem }>({
    queryKey: ['book', id],
    queryFn: async () => {
      const res = await api.get(`/books/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
