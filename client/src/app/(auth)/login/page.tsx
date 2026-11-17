'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, LogIn, Key, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/axios';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useRandomQuote } from '../../../lib/quotes';
import toast from 'react-hot-toast';
import axios from 'axios';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
  password: z.string().min(1, 'Password is required').max(128),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const quote = useRandomQuote(1);

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
    <div className="flex items-center justify-center min-h-[75vh] py-8 animate-fadeIn">
      <div className="w-full max-w-4xl bg-card border border-card-border rounded-sm shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Column: Editorial Bookplate & Reader Ledger */}
        <div className="md:col-span-5 bg-[#201511] text-[#F5F0D0] p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#8B2020]/30 relative">
          <div>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E06000] font-semibold">
              Ex Libris // ShelfTrade
            </span>
          </div>

          <div className="my-auto py-6 sm:py-8">
            <div className="w-10 h-10 rounded-sm bg-[#8B2020]/25 text-[#E06000] flex items-center justify-center mb-5 border border-[#8B2020]/40">
              <BookOpen className="w-5 h-5" />
            </div>

            <blockquote className="font-serif text-xl sm:text-2xl font-normal leading-snug tracking-tight text-[#FAF7EE] italic">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <p className="text-xs font-mono text-[#8A7F6A] mt-2 tracking-wider uppercase">
              — {quote.author}
            </p>
          </div>

          {/* Quick Demo Access directly under the quote's bottom hr */}
          <div className="pt-4 border-t border-[#8B2020]/30">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-semibold mb-2">
              Reader Demo Pass (1-Click Fill)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillDemo('alice@shelftrade.local')}
                className="p-2.5 rounded-sm bg-[#FFFDF7] hover:bg-[#FDF6E2] border-2 border-[#D4AF37]/80 hover:border-[#D4AF37] text-left transition-all shadow-sm cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-[#1F1916] text-xs group-hover:text-primary transition-colors">
                    Alice
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-[#D4AF37]/20 text-[#854D0E]">
                    READER
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#574C43] truncate mt-1">
                  alice@shelftrade.local
                </div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@shelftrade.local')}
                className="p-2.5 rounded-sm bg-[#FFFDF7] hover:bg-[#FDF6E2] border-2 border-[#D4AF37]/80 hover:border-[#D4AF37] text-left transition-all shadow-sm cursor-pointer group hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-[#1F1916] text-xs group-hover:text-primary transition-colors">
                    Admin
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-primary/15 text-primary">
                    ADMIN
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#574C43] truncate mt-1">
                  admin@shelftrade.local
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Form */}
        <div className="md:col-span-7 bg-card p-8 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-semibold">
              Chapter I // Reader Sign-in
            </span>
            <h1 className="font-serif text-3xl font-bold text-foreground mt-1 tracking-tight">
              Sign In to Your Shelf
            </h1>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Enter your credentials to manage your listed inventory, review incoming swap
              proposals, and discover new books.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="reader@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-xs font-medium text-foreground tracking-wide"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Key className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

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

          {/* Switch Link */}
          <div className="mt-8 pt-5 border-t border-card-border flex items-center justify-between text-xs text-muted">
            <span>New to the community?</span>
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Join ShelfTrade</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
