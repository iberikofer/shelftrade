'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export interface ExchangeBook {
  id: string;
  title: string;
  author: string;
  photoUrl?: string | null;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ExchangeRequester {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  books?: Array<{
    id: string;
    title: string;
    author: string;
    photoUrl?: string | null;
  }>;
}

export interface ExchangeRequestItem {
  id: string;
  fromUserId: string;
  toBookId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  toBook: ExchangeBook;
  fromUser?: ExchangeRequester;
}

export interface MyExchangeRequestsData {
  sent: ExchangeRequestItem[];
  received: ExchangeRequestItem[];
}

export function useRequestExchange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const res = await api.post(`/exchange/request/${bookId}`);
      return res.data;
    },
    onSuccess: data => {
      toast.success('Exchange request sent! The owner was notified via email.');
      queryClient.invalidateQueries({ queryKey: ['exchange-requests'] });
      queryClient.invalidateQueries({ queryKey: ['book'] });
      if (data.previewUrl) {
        console.log('[ShelfTrade Mailer] Test Email Preview URL:', data.previewUrl);
      }
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : 'Failed to send exchange request.';
      toast.error(message || 'Failed to send exchange request.');
    },
  });
}

export function useMyExchangeRequests() {
  return useQuery<MyExchangeRequestsData>({
    queryKey: ['exchange-requests'],
    queryFn: async () => {
      const res = await api.get('/exchange/requests');
      return res.data;
    },
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: 'ACCEPTED' | 'REJECTED';
    }) => {
      const res = await api.patch(`/exchange/requests/${id}`, { status });
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`Request marked as ${variables.status.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ['exchange-requests'] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : 'Failed to update request status.';
      toast.error(message || 'Failed to update request status.');
    },
  });
}
