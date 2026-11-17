'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Mail, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../../../lib/axios';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useRandomQuote } from '../../../lib/quotes';
import toast from 'react-hot-toast';
import axios from 'axios';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(255),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const quote = useRandomQuote(5);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent!');
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error
        : 'Failed to request password reset.';
      toast.error(message || 'Failed to request password reset.');
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
            ShelfTrade Community Archive • Reader Recovery
          </div>
        </div>

        {/* Right Column: Password Recovery Form */}
        <div className="md:col-span-7 bg-card p-8 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted font-semibold">
              Recovery // Password Reset
            </span>
            <h1 className="font-serif text-3xl font-bold text-foreground mt-1 tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Enter your registered email address and we will dispatch a secure link to
              re-establish access to your shelf.
            </p>
          </div>

          {isSubmitted ? (
            <div className="flex flex-col gap-4 p-6 bg-[#FAF7EE] border border-[#3D5C2A]/30 rounded-sm">
              <div className="flex items-center gap-2.5 text-[#3D5C2A]">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h3 className="font-serif font-bold text-base text-foreground">
                  Recovery Email Dispatched
                </h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                If an account with <strong>{submittedEmail}</strong> is registered with
                ShelfTrade, a password reset link has been sent. The link expires in 1
                hour.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="reader@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                helperText="We will never share your email address with third parties."
                {...register('email')}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full mt-2"
                leftIcon={<Send className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-card-border flex items-center justify-between text-xs">
            <Link
              href="/login"
              className="text-muted hover:text-foreground font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
            <Link href="/register" className="text-primary hover:underline font-semibold">
              Join ShelfTrade &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
