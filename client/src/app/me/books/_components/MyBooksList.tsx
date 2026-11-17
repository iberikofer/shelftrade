'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { useMyBooks, useDeleteBook } from '../../../../hooks/useMyBooks';
import BookCard from '../../../../components/books/BookCard';
import BookSkeleton from '../../../../components/books/BookSkeleton';

export default function MyBooksList() {
  const { data: myBooksData, isLoading } = useMyBooks();
  const deleteBookMutation = useDeleteBook();

  const handleDeleteBook = (id: string) => {
    deleteBookMutation.mutate(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-bold text-foreground">
          Your Listed Books ({myBooksData?.total || 0})
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <BookSkeleton key={index} />
          ))}
        </div>
      ) : myBooksData?.data && myBooksData.data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {myBooksData.data.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onDelete={handleDeleteBook}
              isDeleting={deleteBookMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-card-border rounded-sm p-10 text-center">
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
  );
}
