'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, LogIn, Key, Mail } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/axios';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import axios from 'axios';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push('/books');
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error
        : 'Invalid email or password';
      toast.error(message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password123!', { shouldValidate: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-6 animate-fadeIn">
      <div className="w-full max-w-md bg-card border border-card-border rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-lg bg-primary/10 text-primary items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Sign in to ShelfTrade
          </h1>
          <p className="text-xs text-muted mt-1.5">
            Access your personal shelf and exchange requests
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="reader@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Key className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full mt-2"
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Demo Accounts Quick-Fill Box */}
        <div className="mt-6 pt-5 border-t border-card-border">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold mb-2 text-center">
            Quick Demo Accounts (1-Click Fill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('alice@shelftrade.local')}
              className="p-2 rounded border border-card-border hover:bg-background/80 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-foreground">Alice (Reader)</div>
              <div className="text-[10px] text-muted">alice@shelftrade.local</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@shelftrade.local')}
              className="p-2 rounded border border-card-border hover:bg-background/80 text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-foreground">Admin Moderator</div>
              <div className="text-[10px] text-muted">admin@shelftrade.local</div>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted mt-6">
          Do not have an account yet?{' '}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

