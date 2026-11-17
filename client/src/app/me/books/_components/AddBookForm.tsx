'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Upload, Link as LinkIcon } from 'lucide-react';
import { useAddBook } from '../../../../hooks/useMyBooks';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import { safeUrlSchema } from '../../../../lib/schemas';

const addBookSchema = z.object({
  title: z.string().trim().min(1, 'Book title is required').max(200),
  author: z.string().trim().min(1, 'Author name is required').max(150),
  photoUrl: safeUrlSchema,
});

type AddBookFormData = z.infer<typeof addBookSchema>;

export default function AddBookForm() {
  const addBookMutation = useAddBook();
  const [photoMode, setPhotoMode] = React.useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileKey, setFileKey] = React.useState(0);

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
          onSuccess: () => reset(),
        },
      );
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-sm p-6 shadow-xs">
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
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
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
  );
}
