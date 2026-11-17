'use client';

import React from 'react';
import Link from 'next/link';
import { Send, Mail } from 'lucide-react';
import { useMyExchangeRequests } from '../../../../hooks/useExchange';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import BookCover from '../../../../components/books/BookCover';
import Spinner from '../../../../components/ui/Spinner';

export default function SentRequests() {
  const { data: exchangeData, isLoading } = useMyExchangeRequests();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <Spinner size="md" />
        <p className="text-xs text-muted">Retrieving exchange requests...</p>
      </div>
    );
  }

  if (!exchangeData?.sent || exchangeData.sent.length === 0) {
    return (
      <div className="bg-card border border-card-border rounded-sm p-10 text-center">
        <Send className="w-10 h-10 text-muted mx-auto mb-2 opacity-40" />
        <h3 className="font-serif text-base font-bold text-foreground">
          No sent requests
        </h3>
        <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
          Browse the catalog and request exchanges with other readers to see your outbound
          requests here.
        </p>
        <Link href="/books" className="inline-block mt-4">
          <Button variant="outline" size="sm">
            Browse Books
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {exchangeData.sent.map(req => (
        <div
          key={req.id}
          className="bg-card border border-card-border rounded-sm p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start justify-between"
        >
          <div className="flex gap-4 items-start">
            <div className="w-14 h-20 rounded-sm overflow-hidden shrink-0 border border-card-border">
              <BookCover
                src={req.toBook.photoUrl}
                title={req.toBook.title}
                author={req.toBook.author}
                size="sm"
                aspectRatio="h-full w-full"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Link
                href={`/books/${req.toBook.id}`}
                className="text-base font-bold text-foreground font-serif hover:text-primary transition-colors"
              >
                {req.toBook.title}
              </Link>
              <span className="text-xs text-muted">by {req.toBook.author}</span>

              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-muted">Owner:</span>
                <span className="font-semibold text-foreground">
                  {req.toBook.owner?.name}
                </span>
                <a
                  href={`mailto:${req.toBook.owner?.email}`}
                  className="text-primary hover:underline flex items-center gap-0.5"
                >
                  <Mail className="w-3 h-3" />
                  {req.toBook.owner?.email}
                </a>
              </div>

              <span className="text-[11px] text-muted mt-1">
                Requested on {new Date(req.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <Badge
              variant={
                req.status === 'ACCEPTED'
                  ? 'olive'
                  : req.status === 'REJECTED'
                    ? 'rust'
                    : 'secondary'
              }
              size="md"
            >
              {req.status}
            </Badge>
            {req.status === 'ACCEPTED' && (
              <span className="text-xs text-olive font-medium">
                Owner accepted! Check your inbox to coordinate.
              </span>
            )}
            {req.status === 'PENDING' && (
              <span className="text-xs text-muted">Waiting for owner response...</span>
            )}
            {req.status === 'REJECTED' && (
              <span className="text-xs text-muted">Owner declined this request.</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
