'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../ui/ConfirmModal';
import BookCover from './BookCover';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner = user?.id === book.ownerId;
  const canDelete = (isOwner || isAdmin) && !!onDelete;

  return (
    <>
      <div className="group bg-card border border-card-border rounded-sm overflow-hidden flex flex-col card-tactile shadow-xs">
        {/* Cover Photo with Skeleton Loader */}
        <Link
          href={`/books/${book.id}`}
          className="relative w-full block overflow-hidden"
        >
          <BookCover
            src={book.photoUrl}
            title={book.title}
            author={book.author}
            size="md"
            hoverZoom
          />

          {isOwner && (
            <div className="absolute top-2.5 right-2.5 bg-olive/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs shadow-xs z-20">
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
                className="group/details inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors ml-1 cursor-pointer"
              >
                <span>Details</span>
                <ArrowRight className="w-3 h-3 transition-transform duration-150 group-hover/details:translate-x-1" />
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
