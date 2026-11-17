'use client';

import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import Input from '../ui/Input';

interface BookSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  totalBooks?: number;
}

export default function BookSearchBar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  totalBooks,
}: BookSearchBarProps) {
  return (
    <div className="w-full bg-card border border-card-border rounded-sm p-4 mb-8 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Input
          placeholder="Search by book title or author..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          rightIcon={
            search ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-muted hover:text-foreground cursor-pointer focus-ring rounded"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null
          }
          className="bg-background/60"
        />
      </div>

      {/* Sort & Count Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        {totalBooks !== undefined && (
          <span className="text-xs text-muted font-medium hidden md:inline">
            <span className="font-mono font-bold text-foreground">{totalBooks}</span>{' '}
            {totalBooks === 1 ? 'book' : 'books'}
          </span>
        )}

        <div className="flex items-center gap-2">
          <label
            htmlFor="sort-select"
            className="text-xs text-muted font-medium flex items-center gap-1 shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort:</span>
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={e => onSortChange(e.target.value)}
            className="bg-card text-foreground text-xs font-medium border border-card-border hover:border-card-border-hover rounded-sm px-2.5 py-2 focus-ring cursor-pointer transition-colors"
          >
            <option value="asc">Title (A → Z)</option>
            <option value="desc">Title (Z → A)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
