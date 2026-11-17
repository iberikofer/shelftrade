import React from 'react';
import BookCard, { BookItem } from './BookCard';
import BookSkeleton from './BookSkeleton';
import { BookX } from 'lucide-react';

interface BookGridProps {
  books?: BookItem[];
  isLoading?: boolean;
  onDeleteBook?: (id: string) => void;
  isDeleting?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export default function BookGrid({
  books = [],
  isLoading = false,
  onDeleteBook,
  isDeleting = false,
  emptyMessage = 'No books found matching your criteria.',
  emptyAction,
}: BookGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <BookSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="w-full bg-card border border-card-border rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <BookX className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-foreground">No Books Found</h3>
        <p className="text-sm text-muted mt-1 max-w-sm">{emptyMessage}</p>
        {emptyAction && <div className="mt-5">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map(book => (
        <BookCard
          key={book.id}
          book={book}
          onDelete={onDeleteBook}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}

