'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, UserPlus, User, Mail, Key, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/axios';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import toast from 'react-hot-toast';
import axios from 'axios';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      login(res.data.token, res.data.user);
      toast.success('Account created successfully! Welcome to ShelfTrade.');
      router.push('/books');
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error
        : 'Registration failed';
      toast.error(message || 'Unable to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] py-8 animate-fadeIn">
      <div className="w-full max-w-4xl bg-card border border-card-border rounded-sm shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Column: Editorial Bookplate & Reader Ledger */}
        <div className="md:col-span-5 bg-[#201511] text-[#F5F0D0] p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#8B2020]/30 relative">
          <div>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#E06000] font-semibold">
              Ex Libris // Membership
            </span>
          </div>

          <div className="my-auto py-6 sm:py-8">
            <div className="w-10 h-10 rounded-sm bg-[#8B2020]/25 text-[#E06000] flex items-center justify-center mb-5 border border-[#8B2020]/40">
              <BookOpen className="w-5 h-5" />
            </div>

            <blockquote className="font-serif text-xl sm:text-2xl font-normal leading-snug tracking-tight text-[#FAF7EE] italic">
              &ldquo;A reader lives a thousand lives before he dies.&rdquo;
            </blockquote>
            <p className="text-xs font-mono text-[#8A7F6A] mt-2 tracking-wider uppercase">
              — George R.R. Martin
            </p>

            <div className="mt-8 pt-6 border-t border-[#8B2020]/30 space-y-2.5 text-xs text-[#EAE4CE]/85">
              <div className="flex items-center gap-2">
                <span className="text-[#E06000] font-bold">✦</span>
                <span>List unlimited books from your personal library</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#E06000] font-bold">✦</span>
                <span>Propose trades with readers across the catalog</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#E06000] font-bold">✦</span>
                <span>100% community-driven book exchange</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#8B2020]/30 text-[11px] text-[#8A7F6A] font-mono">
            ShelfTrade Community Archive • Open Membership
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="md:col-span-7 bg-card p-8 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-semibold">
              Registration // Reader Pass
            </span>
            <h1 className="font-serif text-3xl font-bold text-foreground mt-1 tracking-tight">
              Join the Community
            </h1>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Create your reader account to list books, arrange trades, and connect with
              fellow readers.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              placeholder="Jane Austen"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="jane@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              leftIcon={<Key className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              leftIcon={<Key className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          {/* Switch Link */}
          <div className="mt-8 pt-5 border-t border-card-border flex items-center justify-between text-xs text-muted">
            <span>Already registered?</span>
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <span>Sign in to your shelf</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
