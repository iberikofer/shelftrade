'use client';

import React, { useState } from 'react';
import { Inbox, Mail, BookOpen, Check, X } from 'lucide-react';
import {
  useMyExchangeRequests,
  useUpdateRequestStatus,
} from '../../../../hooks/useExchange';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';
import BookCover from '../../../../components/books/BookCover';
import Spinner from '../../../../components/ui/Spinner';

export default function ReceivedRequests() {
  const { data: exchangeData, isLoading } = useMyExchangeRequests();
  const updateStatusMutation = useUpdateRequestStatus();
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const handleUpdateStatus = (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    setPendingActionId(id);
    updateStatusMutation.mutate(
      { id, status },
      { onSettled: () => setPendingActionId(null) },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <Spinner size="md" />
        <p className="text-xs text-muted">Retrieving exchange requests...</p>
      </div>
    );
  }

  if (!exchangeData?.received || exchangeData.received.length === 0) {
    return (
      <div className="bg-card border border-card-border rounded-sm p-10 text-center">
        <Inbox className="w-10 h-10 text-muted mx-auto mb-2 opacity-40" />
        <h3 className="font-serif text-base font-bold text-foreground">
          No incoming exchange requests
        </h3>
        <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
          When other readers find books on your shelf they want to swap, their trade
          proposals will arrive here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {exchangeData.received.map(req => (
        <div
          key={req.id}
          className="bg-card border border-card-border rounded-sm p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start justify-between"
        >
          {/* Book & Requester details */}
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-muted tracking-wider">
                  Your Book:
                </span>
                <span className="text-sm font-bold text-foreground font-serif">
                  {req.toBook.title}
                </span>
                <span className="text-xs text-muted">by {req.toBook.author}</span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted">Requested by:</span>
                <span className="text-xs font-semibold text-foreground">
                  {req.fromUser?.name}
                </span>
                <a
                  href={`mailto:${req.fromUser?.email}`}
                  className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <Mail className="w-3 h-3" />
                  {req.fromUser?.email}
                </a>
              </div>

              {/* Requester's trade books */}
              <div className="mt-2 text-xs">
                <span className="text-muted font-medium">Books they offer to trade:</span>
                {req.fromUser?.books && req.fromUser.books.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {req.fromUser.books.map(b => (
                      <span
                        key={b.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-card-border/30 text-foreground text-[11px] border border-card-border"
                      >
                        <BookOpen className="w-3 h-3 text-primary opacity-70" />
                        <strong>{b.title}</strong> by {b.author}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted italic mt-0.5">
                    No books listed on their shelf currently.
                  </p>
                )}
              </div>

              <span className="text-[11px] text-muted mt-2">
                Received on {new Date(req.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col sm:items-end gap-3 shrink-0 self-stretch sm:self-auto justify-between">
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

            {req.status === 'PENDING' && (
              <div className="flex items-center gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                  isLoading={updateStatusMutation.isPending && pendingActionId === req.id}
                  className="text-rust hover:bg-rust/10"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Decline
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                  isLoading={updateStatusMutation.isPending && pendingActionId === req.id}
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Accept Exchange
                </Button>
              </div>
            )}

            {req.status === 'ACCEPTED' && (
              <p className="text-[11px] text-olive font-medium mt-1">
                ✓ Accepted! Coordinate exchange with reader via email.
              </p>
            )}

            {req.status === 'REJECTED' && (
              <p className="text-[11px] text-muted mt-1">
                You declined this trade request.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
