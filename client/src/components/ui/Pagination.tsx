'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasPrevPage = currentPage > 1,
  hasNextPage = currentPage < totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 py-6"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrevPage}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        className="px-2.5"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="flex items-center gap-1">
        {pages.map(p => {
          const isActive = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={isActive ? 'page' : undefined}
              className={`
                w-8 h-8 rounded-md text-xs font-medium font-mono transition-colors focus-ring cursor-pointer
                ${
                  isActive
                    ? 'bg-primary text-white border border-primary font-bold shadow-xs'
                    : 'bg-card text-foreground border border-card-border hover:bg-background/80 hover:border-card-border-hover'
                }
              `}
            >
              {p}
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        className="px-2.5"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  );
}
