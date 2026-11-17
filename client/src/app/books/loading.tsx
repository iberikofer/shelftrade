import React from 'react';
import BookSkeleton from '../../components/books/BookSkeleton';

export default function BooksLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-card-border">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-32 bg-muted/20 rounded-xs animate-pulse" />
          <div className="h-9 w-56 bg-muted/20 rounded-xs animate-pulse" />
          <div className="h-3 w-80 bg-muted/15 rounded-xs animate-pulse" />
        </div>
        <div className="h-9 w-32 bg-muted/20 rounded-xs animate-pulse" />
      </div>

      {/* Search bar skeleton */}
      <div className="h-10 w-full bg-muted/15 rounded-xs animate-pulse" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <BookSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
