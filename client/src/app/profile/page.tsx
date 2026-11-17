'use client';

import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  User as UserIcon,
  Mail,
  BookOpen,
  ArrowLeftRight,
  Shield,
  Upload,
  Link as LinkIcon,
  Save,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import axios from 'axios';
import { safeUrlSchema } from '../../lib/schemas';
import { resolveAvatarUrl } from '../../lib/resolveAvatarUrl';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  avatarUrl: safeUrlSchema,
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isAdmin, refreshUser } = useAuth();
  const [photoMode, setPhotoMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const resolvedAvatarUrl = resolveAvatarUrl(user?.avatarUrl);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || '',
      avatarUrl: user?.avatarUrl?.startsWith('http') ? user.avatarUrl : '',
    },
  });

  const watchedAvatarUrl = useWatch({ control, name: 'avatarUrl' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }
  };

  const onSubmit = async (formData: ProfileFormData) => {
    setIsSaving(true);
    try {
      if (photoMode === 'file' && selectedFile) {
        const uploadData = new FormData();
        uploadData.append('name', formData.name);
        uploadData.append('avatar', selectedFile);

        await api.patch('/me/profile', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.patch('/me/profile', {
          name: formData.name,
          avatarUrl: formData.avatarUrl || '',
        });
      }

      await refreshUser();
      toast.success('Your profile details were updated successfully!');
      setSelectedFile(null);
      setFilePreview(null);
      setFileKey(k => k + 1);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error
        : 'Failed to update profile.';
      toast.error(message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeAvatarPreview =
    photoMode === 'file'
      ? filePreview || resolvedAvatarUrl
      : watchedAvatarUrl?.startsWith('http')
        ? watchedAvatarUrl
        : resolvedAvatarUrl;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Member';

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fadeIn">
        {/* Editorial Page Header */}
        <div className="pb-4 border-b border-card-border">
          <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold">
            Reader Profile // Community Ledger
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-1 tracking-tight">
            Reader Profile &amp; Settings
          </h1>
          <p className="text-sm text-muted mt-1.5 max-w-xl">
            Manage your personal reader credentials, platform identity, and public shelf
            appearance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Reader Summary Card & Stats */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="bg-card border border-card-border rounded-sm p-6 shadow-xs flex flex-col items-center text-center">
              {/* Large Avatar */}
              <div className="relative mb-4">
                {activeAvatarPreview ? (
                  <img
                    src={activeAvatarPreview}
                    alt={user?.name || 'Reader'}
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary/30 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 text-primary text-3xl font-bold font-serif flex items-center justify-center border-2 border-primary/20">
                    {user?.name?.charAt(0).toUpperCase() || (
                      <UserIcon className="w-10 h-10" />
                    )}
                  </div>
                )}
                {isAdmin && (
                  <div
                    className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full shadow-xs border-2 border-card"
                    title="System Administrator"
                  >
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <h2 className="font-serif text-xl font-bold text-foreground">
                {user?.name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Badge variant={isAdmin ? 'primary' : 'olive'} size="sm">
                  {isAdmin ? 'ADMINISTRATOR' : 'READER MEMBER'}
                </Badge>
                <span className="text-[11px] font-mono text-muted flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Since {memberSince}
                </span>
              </div>
            </div>

            {/* Shelf Stats Quick Overview */}
            <div className="bg-card border border-card-border rounded-sm p-5 shadow-xs flex flex-col gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                Library Activity
              </span>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  href="/me/books"
                  className="p-3 bg-background/50 hover:bg-background border border-card-border rounded-sm flex flex-col transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-muted group-hover:text-primary transition-colors">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-mono font-bold text-lg text-foreground group-hover:text-primary">
                      {user?.bookCount || 0}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted font-medium mt-1">
                    Books on Shelf &rarr;
                  </span>
                </Link>

                <Link
                  href="/me/books"
                  className="p-3 bg-background/50 hover:bg-background border border-card-border rounded-sm flex flex-col transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-muted group-hover:text-primary transition-colors">
                    <ArrowLeftRight className="w-4 h-4" />
                    <span className="font-mono font-bold text-lg text-foreground group-hover:text-primary">
                      {user?.requestsCount || 0}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted font-medium mt-1">
                    Exchanges Sent &rarr;
                  </span>
                </Link>
              </div>

              <div className="p-3 bg-[#FAF7EE] border border-[#8B2020]/20 rounded-xs text-[11px] text-[#2F1D17] leading-relaxed flex items-start gap-2 mt-1">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Adding books to your shelf allows fellow readers across the community to
                  initiate trade proposals with you.
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Edit Profile Form */}
          <div className="md:col-span-7 bg-card border border-card-border rounded-sm p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-card-border">
              <UserIcon className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-lg font-bold text-foreground">
                Edit Personal Credentials
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <Input
                label="Full Reader Name"
                placeholder="e.g. Alice Hemingway"
                error={errors.name?.message}
                {...register('name')}
              />

              <div className="flex flex-col gap-1.5">
                <Input
                  label="Registered Email Address"
                  value={user?.email || ''}
                  disabled
                  helperText="Email serves as your unique login identifier and trade coordination address."
                />
              </div>

              {/* Avatar section */}
              <div className="flex flex-col gap-2 pt-2 border-t border-card-border">
                <label className="text-xs font-medium text-foreground tracking-wide">
                  Avatar Photo
                </label>

                {/* Photo mode toggle */}
                <div className="flex items-center gap-2 mb-1">
                  <button
                    type="button"
                    onClick={() => setPhotoMode('url')}
                    className={`px-3 py-1 text-xs rounded-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      photoMode === 'url'
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-card border border-card-border text-muted hover:text-foreground'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoMode('file')}
                    className={`px-3 py-1 text-xs rounded-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      photoMode === 'file'
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-card border border-card-border text-muted hover:text-foreground'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                </div>

                {photoMode === 'url' ? (
                  <Input
                    placeholder="https://images.unsplash.com/photo-..."
                    error={errors.avatarUrl?.message}
                    helperText="Paste any direct public image link for your reader avatar."
                    {...register('avatarUrl')}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    <input
                      key={fileKey}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                    {selectedFile && (
                      <span className="text-xs text-muted truncate">
                        Selected: <strong>{selectedFile.name}</strong> (
                        {Math.round(selectedFile.size / 1024)} KB)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  disabled={isSaving || (!isDirty && !selectedFile)}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
