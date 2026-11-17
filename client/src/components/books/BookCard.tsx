'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Book as BookIcon, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../ui/ConfirmModal';

export interface BookItem {
  id: string;
  title: string;
  author: string;
  photoUrl?: string | null;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
  createdAt?: string;
}

interface BookCardProps {
  book: BookItem;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export default function BookCard({ book, onDelete, isDeleting = false }: BookCardProps) {
  const { user, isAdmin } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner = user?.id === book.ownerId;
  const canDelete = (isOwner || isAdmin) && !!onDelete;

  // Resolve image source (handles uploaded local files and external urls)
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
  const coverSrc = book.photoUrl
    ? book.photoUrl.startsWith('http')
      ? book.photoUrl
      : `${serverUrl}${book.photoUrl}`
    : null;

  return (
    <>
      <div className="group bg-card border border-card-border rounded-lg overflow-hidden flex flex-col card-tactile shadow-xs">
        {/* Cover Photo */}
        <Link
          href={`/books/${book.id}`}
          className="relative w-full aspect-[3/4] bg-background block overflow-hidden"
        >
          {coverSrc && !imageError ? (
            <img
              src={coverSrc}
              alt={book.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-card-border/40 text-muted">
              <BookIcon className="w-10 h-10 mb-2 opacity-50 text-primary" />
              <span className="font-serif font-bold text-xs text-foreground line-clamp-2 px-2">
                {book.title}
              </span>
              <span className="text-[11px] text-muted mt-1">{book.author}</span>
            </div>
          )}

          {isOwner && (
            <div className="absolute top-2.5 right-2.5 bg-olive/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              YOUR SHELF
            </div>
          )}
        </Link>

        {/* Book Info */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            <Link href={`/books/${book.id}`}>
              <h3 className="font-serif font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {book.title}
              </h3>
            </Link>
            <p className="text-xs text-muted font-medium mt-0.5 line-clamp-1">
              {book.author}
            </p>
          </div>

          <div className="pt-3 border-t border-card-border flex items-center justify-between text-xs">
            {/* Owner info */}
            {book.owner && (
              <div className="flex items-center gap-1.5 min-w-0">
                {book.owner.avatarUrl ? (
                  <img
                    src={book.owner.avatarUrl}
                    alt={book.owner.name}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                    {book.owner.name.charAt(0)}
                  </div>
                )}
                <span className="text-muted truncate text-[11px] font-medium">
                  {book.owner.name}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-muted hover:text-rust p-1 rounded transition-colors focus-ring cursor-pointer"
                  title="Remove book"
                  aria-label="Remove book"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <Link
                href={`/books/${book.id}`}
                className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors ml-1"
              >
                <span>Details</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {canDelete && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            setShowDeleteModal(false);
            onDelete(book.id);
          }}
          title="Remove Book from Shelf?"
          description={`Are you sure you want to remove "${book.title}"? This action cannot be undone.`}
          confirmText="Delete Book"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
