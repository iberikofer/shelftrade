'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../lib/axios';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { useRandomQuote } from '../../../lib/quotes';
import toast from 'react-hot-toast';
import axios from 'axios';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(128, 'Password cannot exceed 128 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password').max(128),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const quote = useRandomQuote(6);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Missing reset token. Please request a new recovery link.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });

      setIsSuccess(true);
      toast.success('Password successfully reset!');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error
        : 'Failed to reset password. The link may have expired.';
      toast.error(message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-12 rounded-sm border border-card-border overflow-hidden shadow-sm bg-card">
        {/* Left Column: Dark Editorial Book Spine */}
        <div className="md:col-span-5 bg-[#201511] p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#8B2020]/30 text-[#FAF7EE]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#E06000] uppercase mb-8">
              <span>EX LIBRIS // SHELFTRADE</span>
            </div>

            <div className="w-10 h-10 rounded-sm bg-[#8B2020]/30 border border-[#8B2020]/50 flex items-center justify-center text-[#FAF7EE] mb-6">
              <BookOpen className="w-5 h-5 text-[#E06000]" />
            </div>

            <blockquote className="font-serif text-xl sm:text-2xl font-normal leading-snug tracking-tight text-[#FAF7EE] italic">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <p className="text-xs font-mono text-[#8A7F6A] mt-2 tracking-wider uppercase">
              — {quote.author}
            </p>
          </div>

          <div className="pt-8 border-t border-[#8B2020]/30 text-[11px] font-mono text-[#8A7F6A]">
            ShelfTrade Community Archive • Security Vault
          </div>
        </div>

        {/* Right Column: Reset Form */}
        <div className="md:col-span-7 bg-card p-8 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-semibold">
              Security // Choose New Password
            </span>
            <h1 className="font-serif text-3xl font-bold text-foreground mt-1 tracking-tight">
              Create New Password
            </h1>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Enter a fresh, secure password for your reader account below.
            </p>
          </div>

          {!token ? (
            <div className="flex flex-col gap-4 p-6 bg-rust/10 border border-rust/30 rounded-sm">
              <div className="flex items-center gap-2.5 text-rust">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h3 className="font-serif font-bold text-base text-foreground">
                  Invalid Recovery Link
                </h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                No password reset token was detected in the URL. Please request a new
                password reset email.
              </p>
              <div className="pt-2">
                <Link href="/forgot-password">
                  <Button variant="primary" size="sm">
                    Request New Recovery Link
                  </Button>
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="flex flex-col gap-4 p-6 bg-[#FAF7EE] border border-[#3D5C2A]/30 rounded-sm">
              <div className="flex items-center gap-2.5 text-[#3D5C2A]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h3 className="font-serif font-bold text-base text-foreground">
                  Password Updated Successfully
                </h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Your password has been reset. Redirecting you to the sign-in page...
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Go to Sign In Now
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Key className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
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
                leftIcon={<Key className="w-4 h-4" />}
              >
                Set New Password
              </Button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-card-border flex items-center justify-between text-xs">
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Return to Sign In &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Spinner size="md" />
          <p className="text-xs text-muted">Loading recovery form...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
