'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBook } from '../../../hooks/useBooks';
import { useRequestExchange, useMyExchangeRequests } from '../../../hooks/useExchange';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import BookCover from '../../../components/books/BookCover';
import {
  ArrowLeft,
  Send,
  User as UserIcon,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeftRight,
} from 'lucide-react';

interface BookDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function BookDetailsPage({ params }: BookDetailsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading, error } = useBook(resolvedParams.id);
  const { data: myExchangeData } = useMyExchangeRequests();
  const requestExchangeMutation = useRequestExchange();

  const book = data?.data;
  const isOwner = user?.id === book?.ownerId;

  // Check if current user already sent an exchange request for this book
  const existingRequest = myExchangeData?.sent?.find(r => r.toBookId === book?.id);

  const handleRequestExchange = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!book) return;
    requestExchangeMutation.mutate(book.id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-muted">Retrieving book details...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-lg mx-auto bg-card border border-card-border rounded-sm p-10 text-center">
        <h2 className="font-serif text-xl font-bold text-foreground">Book Not Found</h2>
        <p className="text-sm text-muted mt-2">
          This book may have been removed by its owner or the link is invalid.
        </p>
        <Link href="/books" className="inline-block mt-6">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-fadeIn">
      {/* Top back navigation */}
      <div>
        <Link
          href="/books"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all books</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Book Cover (5 cols) with Skeleton Loader */}
        <div className="md:col-span-5 bg-card border border-card-border rounded-sm overflow-hidden shadow-sm">
          <BookCover
            src={book.photoUrl}
            title={book.title}
            author={book.author}
            size="lg"
            priority
          />
        </div>

        {/* Book Information & Action (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" size="sm">
                Available for Trade
              </Badge>
              {isOwner && (
                <Badge variant="olive" size="sm">
                  Your Listed Book
                </Badge>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              {book.title}
            </h1>
            <p className="text-lg text-muted font-medium mt-1">by {book.author}</p>
          </div>

          <div className="p-4 bg-card border border-card-border rounded-sm flex flex-col gap-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
              Book Owner
            </span>

            <div className="flex items-center gap-3">
              {book.owner?.avatarUrl ? (
                <img
                  src={book.owner.avatarUrl}
                  alt={book.owner.name}
                  className="w-10 h-10 rounded-full object-cover border border-card-border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-primary/20">
                  {book.owner?.name?.charAt(0) || <UserIcon className="w-5 h-5" />}
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">
                  {book.owner?.name}
                </span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <Mail className="w-3 h-3 text-muted" />
                  {book.owner?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Exchange Action Card */}
          <div className="p-5 bg-background/60 border border-card-border rounded-sm flex flex-col gap-3">
            <h3 className="font-serif font-bold text-base text-foreground">
              Interested in this book?
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Clicking <strong>&ldquo;Request Exchange&rdquo;</strong> will send an email
              notification to the owner with your contact details and the books currently
              available on your shelf.
            </p>

            <div className="mt-2">
              {isOwner ? (
                <div className="flex items-center gap-2 p-3 bg-olive/10 border border-olive/20 rounded-sm text-olive text-xs font-medium">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>
                    You own this book. You cannot send exchange requests to yourself.
                  </span>
                </div>
              ) : existingRequest ? (
                <div className="flex flex-col gap-2.5 p-4 bg-card border border-card-border rounded-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      {existingRequest.status === 'ACCEPTED' ? (
                        <CheckCircle className="w-4 h-4 text-olive" />
                      ) : existingRequest.status === 'REJECTED' ? (
                        <XCircle className="w-4 h-4 text-rust" />
                      ) : (
                        <Clock className="w-4 h-4 text-secondary" />
                      )}
                      <span>Request Status</span>
                    </div>
                    <Badge
                      variant={
                        existingRequest.status === 'ACCEPTED'
                          ? 'olive'
                          : existingRequest.status === 'REJECTED'
                            ? 'rust'
                            : 'secondary'
                      }
                      size="sm"
                    >
                      {existingRequest.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {existingRequest.status === 'PENDING' &&
                      `You requested to exchange for this book on ${new Date(existingRequest.createdAt).toLocaleDateString()}. An email notification was sent to ${book.owner?.name}.`}
                    {existingRequest.status === 'ACCEPTED' &&
                      `Great news! ${book.owner?.name} accepted your trade request. Coordinate exchange details directly via email.`}
                    {existingRequest.status === 'REJECTED' &&
                      `The owner has declined this exchange request.`}
                  </p>
                  <div className="pt-1">
                    <Link href="/me/books">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<ArrowLeftRight className="w-3.5 h-3.5" />}
                      >
                        Manage in Exchange Requests
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleRequestExchange}
                  isLoading={requestExchangeMutation.isPending}
                  leftIcon={<Send className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  {isAuthenticated ? 'Request Exchange' : 'Sign in to Request Exchange'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
