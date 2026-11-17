'use client';

import React, { useState } from 'react';
import { useBooks } from '../../hooks/useBooks';
import BookGrid from '../../components/books/BookGrid';
import BookSearchBar from '../../components/books/BookSearchBar';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function BooksPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('asc');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useBooks({
    search,
    sort,
    page,
    limit: 8,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to page 1 on search
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-card-border">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold">
            Community Exchange
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-1 tracking-tight">
            Discover Books
          </h1>
          <p className="text-sm text-muted mt-1.5 max-w-lg leading-relaxed">
            Browse books shared by fellow readers. Request an exchange with one click and
            trade directly.
          </p>
        </div>

        <Link href="/me/books">
          <Button variant="primary" size="md" leftIcon={<BookOpen className="w-4 h-4" />}>
            Share a Book
          </Button>
        </Link>
      </div>

      {/* Search & Sort Controls */}
      <BookSearchBar
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        onSortChange={handleSortChange}
        totalBooks={data?.pagination.total}
      />

      {/* Book Grid */}
      <BookGrid
        books={data?.data}
        isLoading={isLoading}
        emptyMessage={
          search
            ? `No titles or authors match "${search}". Try another keyword.`
            : 'No books have been shared yet. Be the first to add one!'
        }
        emptyAction={
          search ? (
            <Button variant="outline" size="sm" onClick={() => handleSearchChange('')}>
              Clear Search
            </Button>
          ) : (
            <Link href="/me/books">
              <Button variant="primary" size="sm">
                Add Your First Book
              </Button>
            </Link>
          )
        }
      />

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <Pagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={p => setPage(p)}
          hasPrevPage={data.pagination.hasPrevPage}
          hasNextPage={data.pagination.hasNextPage}
        />
      )}
    </div>
  );
}

