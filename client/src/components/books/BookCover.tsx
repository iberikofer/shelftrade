'use client';

import React, { useState } from 'react';
import { Book as BookIcon } from 'lucide-react';

export interface BookCoverProps {
  src?: string | null;
  title: string;
  author?: string;
  size?: 'sm' | 'md' | 'lg';
  aspectRatio?: string;
  className?: string;
  hoverZoom?: boolean;
  priority?: boolean;
}

export default function BookCover({
  src,
  title,
  author,
  size = 'md',
  aspectRatio = 'aspect-[3/4]',
  className = '',
  hoverZoom = false,
  priority = false,
}: BookCoverProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
  const resolvedSrc = src ? (src.startsWith('http') ? src : `${serverUrl}${src}`) : null;

  const showImage = Boolean(resolvedSrc && !hasError);

  return (
    <div
      className={`relative w-full overflow-hidden bg-muted/15 ${aspectRatio} ${className}`}
    >
      {/* 1. Pure Shimmer Skeleton (NO text, NO icon — clean placeholder block) */}
      {showImage && (
        <div
          className={`
            absolute inset-0 bg-muted/20 animate-shimmer transition-opacity duration-500 ease-out z-10 pointer-events-none
            ${isLoaded ? 'opacity-0' : 'opacity-100'}
          `}
          aria-hidden="true"
        />
      )}

      {/* 2. Actual Image with smooth cinematic switch animation */}
      {showImage ? (
        <img
          src={resolvedSrc!}
          alt={title}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          loading={priority ? 'eager' : 'lazy'}
          className={`
            w-full h-full object-cover transition-all duration-500 ease-out
            ${
              isLoaded
                ? 'opacity-100 scale-100 blur-0'
                : 'opacity-0 scale-[1.03] blur-[2px]'
            }
            ${hoverZoom ? 'group-hover:scale-105' : ''}
          `}
        />
      ) : (
        /* 3. Fallback Bookplate (only displayed when no image exists or on error) */
        <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-card-border/30 text-muted select-none">
          <BookIcon
            className={`
              opacity-40 text-primary mb-1.5
              ${size === 'sm' ? 'w-5 h-5 mb-0' : size === 'lg' ? 'w-16 h-16 mb-3' : 'w-10 h-10'}
            `}
          />
          {size !== 'sm' && (
            <>
              <span className="font-serif font-bold text-xs sm:text-sm text-foreground line-clamp-2 px-1">
                {title}
              </span>
              {author && (
                <span className="text-[11px] text-muted mt-0.5 line-clamp-1">
                  {author}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
