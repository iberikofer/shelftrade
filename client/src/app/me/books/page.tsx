'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, BookOpen, Upload, Link as LinkIcon } from 'lucide-react';
import { useMyBooks, useAddBook, useDeleteBook } from '../../../hooks/useMyBooks';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import BookCard from '../../../components/books/BookCard';
import BookSkeleton from '../../../components/books/BookSkeleton';

const addBookSchema = z.object({
  title: z.string().min(1, 'Book title is required').max(200),
  author: z.string().min(1, 'Author name is required').max(150),
  photoUrl: z.string().optional(),
});

type AddBookFormData = z.infer<typeof addBookSchema>;

export default function MyBooksPage() {
  const [photoMode, setPhotoMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);

  const { data, isLoading } = useMyBooks();
  const addBookMutation = useAddBook();
  const deleteBookMutation = useDeleteBook();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddBookFormData>({
    resolver: zodResolver(addBookSchema),
  });

  const onSubmit = (formData: AddBookFormData) => {
    if (photoMode === 'file' && selectedFile) {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('author', formData.author);
      uploadData.append('photo', selectedFile);

      addBookMutation.mutate(uploadData, {
        onSuccess: () => {
          reset();
          setSelectedFile(null);
          setFileKey(k => k + 1);
        },
      });
    } else {
      addBookMutation.mutate(
        {
          title: formData.title,
          author: formData.author,
          photoUrl: formData.photoUrl || undefined,
        },
        {
          onSuccess: () => {
            reset();
          },
        },
      );
    }
  };

  const handleDeleteBook = (id: string) => {
    deleteBookMutation.mutate(id);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-10 animate-fadeIn">
        {/* Page Title */}
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold">
            Personal Inventory
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-1 tracking-tight">
            My Books
          </h1>
          <p className="text-sm text-muted mt-1.5 max-w-lg">
            Manage your personal library. Books listed here are visible to other readers
            for trade requests.
          </p>
        </div>

        {/* Add Book Section */}
        <div className="bg-card border border-card-border rounded-lg p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-card-border">
            <Plus className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-lg font-bold text-foreground">
              Add a Book to Your Shelf
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Book Title"
                placeholder="e.g. The Lord of the Rings"
                error={errors.title?.message}
                {...register('title')}
              />

              <Input
                label="Author"
                placeholder="e.g. J.R.R. Tolkien"
                error={errors.author?.message}
                {...register('author')}
              />
            </div>

            {/* Photo mode toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-foreground tracking-wide">
                Cover Photo (Optional)
              </label>

              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
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
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
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
                  placeholder="https://example.com/cover.jpg"
                  error={errors.photoUrl?.message}
                  {...register('photoUrl')}
                />
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    key={fileKey}
                    type="file"
                    accept="image/*"
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                  {selectedFile && (
                    <span className="text-xs text-muted truncate max-w-xs">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={addBookMutation.isPending}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Book
              </Button>
            </div>
          </form>
        </div>

        {/* My Books List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Your Listed Books ({data?.total || 0})
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <BookSkeleton key={index} />
              ))}
            </div>
          ) : data?.data && data.data.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.data.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onDelete={handleDeleteBook}
                  isDeleting={deleteBookMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-card-border rounded-lg p-10 text-center">
              <BookOpen className="w-10 h-10 text-muted mx-auto mb-2 opacity-40" />
              <h3 className="font-serif text-base font-bold text-foreground">
                Your shelf is currently empty
              </h3>
              <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                Use the form above to add your first book and become available for trades.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
