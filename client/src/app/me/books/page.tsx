'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  Plus,
  BookOpen,
  Upload,
  Link as LinkIcon,
  ArrowLeftRight,
  Inbox,
  Send,
  Mail,
  Check,
  X,
  Book as BookIcon,
} from 'lucide-react';
import { useMyBooks, useAddBook, useDeleteBook } from '../../../hooks/useMyBooks';
import {
  useMyExchangeRequests,
  useUpdateRequestStatus,
} from '../../../hooks/useExchange';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import BookCard from '../../../components/books/BookCard';
import BookCover from '../../../components/books/BookCover';
import BookSkeleton from '../../../components/books/BookSkeleton';
import Spinner from '../../../components/ui/Spinner';

const addBookSchema = z.object({
  title: z.string().min(1, 'Book title is required').max(200),
  author: z.string().min(1, 'Author name is required').max(150),
  photoUrl: z.string().optional(),
});

type AddBookFormData = z.infer<typeof addBookSchema>;

export default function MyBooksPage() {
  const [activeTab, setActiveTab] = useState<'books' | 'requests'>('books');
  const [requestsSubTab, setRequestsSubTab] = useState<'received' | 'sent'>('received');
  const [photoMode, setPhotoMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);

  const { data: myBooksData, isLoading: isBooksLoading } = useMyBooks();
  const addBookMutation = useAddBook();
  const deleteBookMutation = useDeleteBook();

  const { data: exchangeData, isLoading: isExchangeLoading } = useMyExchangeRequests();
  const updateStatusMutation = useUpdateRequestStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddBookFormData>({
    resolver: zodResolver(addBookSchema),
  });

  const onSubmit = (formData: AddBookFormData) => {
    if (photoMode === 'file' && selectedFile) {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('author', formData.author);
      uploadData.append('photo', selectedFile);

      addBookMutation.mutate(uploadData, {
        onSuccess: () => {
          reset();
          setSelectedFile(null);
          setFileKey(k => k + 1);
        },
      });
    } else {
      addBookMutation.mutate(
        {
          title: formData.title,
          author: formData.author,
          photoUrl: formData.photoUrl || undefined,
        },
        {
          onSuccess: () => {
            reset();
          },
        },
      );
    }
  };

  const handleDeleteBook = (id: string) => {
    deleteBookMutation.mutate(id);
  };

  const handleUpdateStatus = (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    updateStatusMutation.mutate({ id, status });
  };

  const pendingReceivedCount =
    exchangeData?.received?.filter(r => r.status === 'PENDING').length || 0;
  const totalRequestsCount =
    (exchangeData?.received?.length || 0) + (exchangeData?.sent?.length || 0);

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Page Title & Navigation Tabs */}
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold">
            Member Dashboard
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-1 tracking-tight">
            My Books & Exchanges
          </h1>
          <p className="text-sm text-muted mt-1.5 max-w-xl">
            Manage your personal library and review book swap requests with other
            community readers.
          </p>

          {/* Primary Tabs */}
          <div className="flex border-b border-card-border gap-8 mt-6">
            <button
              type="button"
              onClick={() => setActiveTab('books')}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'books'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>My Books</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-black/[0.05] text-muted">
                {myBooksData?.total || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer relative ${
                activeTab === 'requests'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Exchange Requests</span>
              {pendingReceivedCount > 0 ? (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-xs bg-secondary text-white">
                  {pendingReceivedCount} new
                </span>
              ) : (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-black/[0.05] text-muted">
                  {totalRequestsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: MY BOOKS INVENTORY */}
        {activeTab === 'books' && (
          <div className="flex flex-col gap-8">
            {/* Add Book Section */}
            <div className="bg-card border border-card-border rounded-sm p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-card-border">
                <Plus className="w-5 h-5 text-primary" />
                <h2 className="font-serif text-lg font-bold text-foreground">
                  Add a Book to Your Shelf
                </h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Book Title"
                    placeholder="e.g. The Lord of the Rings"
                    error={errors.title?.message}
                    {...register('title')}
                  />

                  <Input
                    label="Author"
                    placeholder="e.g. J.R.R. Tolkien"
                    error={errors.author?.message}
                    {...register('author')}
                  />
                </div>

                {/* Photo mode toggle */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-foreground tracking-wide">
                    Cover Photo (Optional)
                  </label>

                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => setPhotoMode('url')}
                      className={`px-3 py-1 text-xs rounded-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        photoMode === 'url'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-card border border-card-border text-muted hover:text-foreground'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoMode('file')}
                      className={`px-3 py-1 text-xs rounded-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        photoMode === 'file'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-card border border-card-border text-muted hover:text-foreground'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload File
                    </button>
                  </div>

                  {photoMode === 'url' ? (
                    <Input
                      placeholder="https://example.com/cover.jpg"
                      error={errors.photoUrl?.message}
                      {...register('photoUrl')}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        key={fileKey}
                        type="file"
                        accept="image/*"
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                        className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                      />
                      {selectedFile && (
                        <span className="text-xs text-muted truncate max-w-xs">
                          {selectedFile.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={addBookMutation.isPending}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Book
                  </Button>
                </div>
              </form>
            </div>

            {/* My Books List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Your Listed Books ({myBooksData?.total || 0})
                </h2>
              </div>

              {isBooksLoading ? (
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
                    Use the form above to add your first book and become available for
                    trades.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: EXCHANGE REQUESTS */}
        {activeTab === 'requests' && (
          <div className="flex flex-col gap-6">
            {/* Sub-nav toggles */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRequestsSubTab('received')}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                  requestsSubTab === 'received'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-card border border-card-border text-muted hover:text-foreground'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Incoming Requests</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-white/20">
                  {exchangeData?.received?.length || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRequestsSubTab('sent')}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
                  requestsSubTab === 'sent'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-card border border-card-border text-muted hover:text-foreground'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Outgoing Sent</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-xs bg-white/20">
                  {exchangeData?.sent?.length || 0}
                </span>
              </button>
            </div>

            {isExchangeLoading ? (
              <div className="flex flex-col items-center justify-center p-12 gap-3">
                <Spinner size="md" />
                <p className="text-xs text-muted">Retrieving exchange requests...</p>
              </div>
            ) : requestsSubTab === 'received' ? (
              /* INCOMING REQUESTS */
              exchangeData?.received && exchangeData.received.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {exchangeData.received.map(req => {
                    return (
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
                              <span className="text-xs text-muted">
                                by {req.toBook.author}
                              </span>
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
                              <span className="text-muted font-medium">
                                Books they offer to trade:
                              </span>
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
                                isLoading={updateStatusMutation.isPending}
                                className="text-rust hover:bg-rust/10"
                              >
                                <X className="w-3.5 h-3.5 mr-1" />
                                Decline
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleUpdateStatus(req.id, 'ACCEPTED')}
                                isLoading={updateStatusMutation.isPending}
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
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card border border-card-border rounded-sm p-10 text-center">
                  <Inbox className="w-10 h-10 text-muted mx-auto mb-2 opacity-40" />
                  <h3 className="font-serif text-base font-bold text-foreground">
                    No incoming exchange requests
                  </h3>
                  <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                    When other readers find books on your shelf they want to swap, their
                    trade proposals will arrive here.
                  </p>
                </div>
              )
            ) : /* OUTGOING SENT REQUESTS */
            exchangeData?.sent && exchangeData.sent.length > 0 ? (
              <div className="flex flex-col gap-4">
                {exchangeData.sent.map(req => {
                  return (
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
                          <span className="text-xs text-muted">
                            by {req.toBook.author}
                          </span>

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
                          <span className="text-xs text-muted">
                            Waiting for owner response...
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="text-xs text-muted">
                            Owner declined this request.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card border border-card-border rounded-sm p-10 text-center">
                <Send className="w-10 h-10 text-muted mx-auto mb-2 opacity-40" />
                <h3 className="font-serif text-base font-bold text-foreground">
                  No sent requests
                </h3>
                <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                  Browse the catalog and request exchanges with other readers to see your
                  outbound requests here.
                </p>
                <Link href="/books" className="inline-block mt-4">
                  <Button variant="outline" size="sm">
                    Browse Books
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
