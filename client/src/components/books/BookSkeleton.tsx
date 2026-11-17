import React from 'react';

export default function BookSkeleton() {
  return (
    <div className="bg-card border border-card-border rounded-lg overflow-hidden flex flex-col animate-pulse shadow-xs">
      {/* Cover Skeleton with fixed 3:4 aspect ratio */}
      <div className="w-full aspect-[3/4] bg-muted/20" />

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div className="h-4 bg-muted/25 rounded-sm w-3/4" />
        <div className="h-3 bg-muted/15 rounded-sm w-1/2" />

        <div className="mt-auto pt-3 border-t border-card-border flex items-center justify-between">
          <div className="h-3 bg-muted/20 rounded-sm w-24" />
          <div className="h-3 bg-muted/20 rounded-sm w-12" />
        </div>
      </div>
    </div>
  );
}
