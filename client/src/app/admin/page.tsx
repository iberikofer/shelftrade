'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  Shield,
  Users,
  BookOpen,
  ArrowLeftRight,
  UserPlus,
  Trash2,
  Mail,
  X,
  ArrowLeft,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
} from 'lucide-react';
import AdminRoute from '../../components/auth/AdminRoute';
import {
  useAdminStats,
  useAdminUsers,
  useAdminCreateUser,
  useAdminDeleteUser,
  useAdminDeleteBook,
  useAdminExchangeRequests,
  useAdminDeleteExchangeRequest,
  AdminUser,
  AdminExchangeRequest,
} from '../../hooks/useAdmin';
import { useBooks } from '../../hooks/useBooks';
import { BookItem } from '../../components/books/BookCard';
import BookCover from '../../components/books/BookCover';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import ConfirmModal from '../../components/ui/ConfirmModal';

const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address').max(255),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters'),
  role: z.enum(['USER', 'ADMIN']),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [selectedView, setSelectedView] = useState<'users' | 'books' | 'requests'>(
    'users',
  );
  const [selectedUserFilter, setSelectedUserFilter] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [bookSearch, setBookSearch] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<
    'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'
  >('ALL');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [bookToDelete, setBookToDelete] = useState<BookItem | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<AdminExchangeRequest | null>(
    null,
  );

  const { data: statsData, isLoading: isStatsLoading } = useAdminStats();
  const { data: usersData, isLoading: isUsersLoading } = useAdminUsers();

  const { data: booksData, isLoading: isBooksLoading } = useBooks({
    userId: selectedUserFilter?.id,
    search: bookSearch,
    limit: 100,
  });

  const { data: exchangeData, isLoading: isExchangeLoading } = useAdminExchangeRequests();

  const createUserMutation = useAdminCreateUser();
  const deleteUserMutation = useAdminDeleteUser();
  const deleteBookMutation = useAdminDeleteBook();
  const deleteExchangeMutation = useAdminDeleteExchangeRequest();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'USER',
    },
  });

  const onSubmitCreate = (data: CreateUserFormData) => {
    createUserMutation.mutate(data, {
      onSuccess: () => {
        reset();
        setShowAddUserModal(false);
      },
    });
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        setUserToDelete(null);
      },
    });
  };

  const handleConfirmDeleteBook = () => {
    if (!bookToDelete) return;
    deleteBookMutation.mutate(bookToDelete.id, {
      onSuccess: () => {
        setBookToDelete(null);
      },
    });
  };

  const handleConfirmDeleteRequest = () => {
    if (!requestToDelete) return;
    deleteExchangeMutation.mutate(requestToDelete.id, {
      onSuccess: () => {
        setRequestToDelete(null);
      },
    });
  };

  // Filter exchange requests based on search term and status
  const filteredExchangeRequests =
    exchangeData?.data?.filter(req => {
      const matchesStatus =
        requestStatusFilter === 'ALL' || req.status === requestStatusFilter;

      if (!matchesStatus) return false;

      if (!requestSearch.trim()) return true;

      const q = requestSearch.toLowerCase().trim();
      const bookTitle = req.toBook?.title?.toLowerCase() || '';
      const bookAuthor = req.toBook?.author?.toLowerCase() || '';
      const requesterName = req.fromUser?.name?.toLowerCase() || '';
      const requesterEmail = req.fromUser?.email?.toLowerCase() || '';
      const ownerName = req.toBook?.owner?.name?.toLowerCase() || '';
      const ownerEmail = req.toBook?.owner?.email?.toLowerCase() || '';

      return (
        bookTitle.includes(q) ||
        bookAuthor.includes(q) ||
        requesterName.includes(q) ||
        requesterEmail.includes(q) ||
        ownerName.includes(q) ||
        ownerEmail.includes(q)
      );
    }) || [];

  return (
    <AdminRoute>
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-card-border">
          <div>
            <div className="flex items-center gap-1.5 text-primary mb-1">
              <Shield className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-wider font-bold">
                Platform Administration
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Moderator Dashboard
            </h1>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowAddUserModal(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Create New User
          </Button>
        </div>

        {/* Unified 3-Tab Bar (Registered Users, Listed Books, Exchange Requests) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Tab 1: Registered Users */}
          <button
            type="button"
            onClick={() => {
              setSelectedView('users');
              setSelectedUserFilter(null);
            }}
            className={`p-4 sm:p-5 rounded-sm flex items-center justify-between transition-all cursor-pointer text-left shadow-xs ${
              selectedView === 'users' && !selectedUserFilter
                ? 'bg-primary/[0.04] border-2 border-primary text-primary shadow-xs ring-1 ring-primary/20'
                : 'bg-card border border-card-border text-muted hover:text-foreground hover:border-card-border-hover hover:bg-black/[0.01]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xs flex items-center justify-center shrink-0 ${
                  selectedView === 'users' && !selectedUserFilter
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase font-mono tracking-wider font-semibold">
                  Registered Users
                </span>
                <span className="text-xl font-serif font-bold text-foreground mt-0.5">
                  {isUsersLoading || isStatsLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    (usersData?.total ?? statsData?.stats.totalUsers ?? 0)
                  )}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-xs shrink-0 ${
                selectedView === 'users' && !selectedUserFilter
                  ? 'bg-primary text-white'
                  : 'bg-black/[0.06] text-muted'
              }`}
            >
              {usersData?.total ?? statsData?.stats.totalUsers ?? 0}
            </span>
          </button>

          {/* Tab 2: Listed Books */}
          <button
            type="button"
            onClick={() => {
              setSelectedView('books');
              setSelectedUserFilter(null);
            }}
            className={`p-4 sm:p-5 rounded-sm flex items-center justify-between transition-all cursor-pointer text-left shadow-xs ${
              selectedView === 'books'
                ? 'bg-secondary/[0.04] border-2 border-secondary text-secondary shadow-xs ring-1 ring-secondary/20'
                : 'bg-card border border-card-border text-muted hover:text-foreground hover:border-card-border-hover hover:bg-black/[0.01]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xs flex items-center justify-center shrink-0 ${
                  selectedView === 'books'
                    ? 'bg-secondary text-white shadow-xs'
                    : 'bg-secondary/10 text-secondary'
                }`}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase font-mono tracking-wider font-semibold">
                  {selectedUserFilter
                    ? `${selectedUserFilter.name}'s Books`
                    : 'All Listed Books'}
                </span>
                <span className="text-xl font-serif font-bold text-foreground mt-0.5">
                  {isBooksLoading || isStatsLoading ? (
                    <Spinner size="sm" />
                  ) : selectedUserFilter ? (
                    booksData?.data?.length || 0
                  ) : (
                    (statsData?.stats.totalBooks ?? booksData?.pagination?.total ?? 0)
                  )}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-xs shrink-0 ${
                selectedView === 'books'
                  ? 'bg-secondary text-white'
                  : 'bg-black/[0.06] text-muted'
              }`}
            >
              {selectedUserFilter
                ? booksData?.data?.length || 0
                : (statsData?.stats.totalBooks ?? booksData?.pagination?.total ?? 0)}
            </span>
          </button>

          {/* Tab 3: Exchange Requests */}
          <button
            type="button"
            onClick={() => {
              setSelectedView('requests');
              setSelectedUserFilter(null);
            }}
            className={`p-4 sm:p-5 rounded-sm flex items-center justify-between transition-all cursor-pointer text-left shadow-xs ${
              selectedView === 'requests'
                ? 'bg-olive/[0.04] border-2 border-olive text-olive shadow-xs ring-1 ring-olive/20'
                : 'bg-card border border-card-border text-muted hover:text-foreground hover:border-card-border-hover hover:bg-black/[0.01]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xs flex items-center justify-center shrink-0 ${
                  selectedView === 'requests'
                    ? 'bg-olive text-white shadow-xs'
                    : 'bg-olive/10 text-olive'
                }`}
              >
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase font-mono tracking-wider font-semibold">
                  Exchange Requests
                </span>
                <span className="text-xl font-serif font-bold text-foreground mt-0.5">
                  {isExchangeLoading || isStatsLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    (exchangeData?.total ?? statsData?.stats.totalRequests ?? 0)
                  )}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-xs shrink-0 ${
                selectedView === 'requests'
                  ? 'bg-olive text-white'
                  : 'bg-black/[0.06] text-muted'
              }`}
            >
              {exchangeData?.total ?? statsData?.stats.totalRequests ?? 0}
            </span>
          </button>
        </div>

        {/* VIEW 1: REGISTERED USERS MANAGEMENT TABLE */}
        {selectedView === 'users' && (
          <div className="bg-card border border-card-border rounded-sm overflow-hidden shadow-xs">
            <div className="p-5 border-b border-card-border flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-foreground">
                Registered Users ({usersData?.total || 0})
              </h2>
            </div>

            {isUsersLoading ? (
              <div className="p-12 flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background/80 text-muted font-mono uppercase tracking-wider border-b border-card-border">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Books Listed</th>
                      <th className="px-5 py-3">Registered Date</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {usersData?.data?.map(user => {
                      const isSelf = user.id === currentUser?.id;
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-background/40 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full object-cover border border-card-border shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                                  {user.name}
                                  {isSelf && (
                                    <span className="text-[10px] bg-black/5 text-muted px-1.5 py-0.5 rounded font-mono">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-muted text-xs flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-muted" />
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <Badge
                              variant={user.role === 'ADMIN' ? 'primary' : 'muted'}
                              size="sm"
                            >
                              {user.role}
                            </Badge>
                          </td>

                          <td className="px-5 py-3.5 font-mono">
                            {user.bookCount > 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedView('books');
                                  setSelectedUserFilter({
                                    id: user.id,
                                    name: user.name,
                                  });
                                }}
                                className="font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer group"
                                title={`View ${user.name}'s books`}
                              >
                                <span>
                                  {user.bookCount}{' '}
                                  {user.bookCount === 1 ? 'book' : 'books'}
                                </span>
                                <span className="text-[11px] opacity-70 group-hover:translate-x-0.5 transition-transform">
                                  &rarr;
                                </span>
                              </button>
                            ) : (
                              <span className="text-muted">0 books</span>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-muted">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            {!isSelf && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUserToDelete(user)}
                                className="text-muted hover:text-rust p-1.5"
                                title="Delete user"
                                aria-label="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: LISTED BOOKS TABLE LIST (TABLE FORMAT) */}
        {selectedView === 'books' && (
          <div className="bg-card border border-card-border rounded-sm overflow-hidden shadow-xs">
            {/* Table Header with Search & Filter status */}
            <div className="p-5 border-b border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold text-foreground">
                    {selectedUserFilter
                      ? `${selectedUserFilter.name}'s Books`
                      : 'All Listed Books'}{' '}
                    ({booksData?.pagination.total || 0})
                  </h2>

                  {selectedUserFilter && (
                    <Badge variant="olive" size="sm">
                      Filtered by User
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted mt-0.5">
                  Table list moderation view. Click any book to preview its details page
                  or remove it from the catalog.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={e => setBookSearch(e.target.value)}
                    placeholder="Filter title or author..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-sm border border-card-border bg-background text-foreground focus-ring w-48 sm:w-56"
                  />
                  {bookSearch && (
                    <button
                      type="button"
                      onClick={() => setBookSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {selectedUserFilter ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedUserFilter(null)}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    View All Books
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedView('users')}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Back to Users
                  </Button>
                )}
              </div>
            </div>

            {isBooksLoading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <Spinner size="lg" />
                <p className="text-xs text-muted">Retrieving catalog books...</p>
              </div>
            ) : booksData?.data && booksData.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background/80 text-muted font-mono uppercase tracking-wider border-b border-card-border">
                    <tr>
                      <th className="px-5 py-3">Book</th>
                      <th className="px-5 py-3">Author</th>
                      <th className="px-5 py-3">Owner</th>
                      <th className="px-5 py-3">Listed Date</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {booksData.data.map(book => {
                      return (
                        <tr
                          key={book.id}
                          className="hover:bg-background/40 transition-colors"
                        >
                          {/* Book Photo Thumbnail + Title */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/books/${book.id}`}
                                className="w-10 h-14 rounded-xs overflow-hidden shrink-0 border border-card-border bg-muted/15 shadow-2xs hover:opacity-85 transition-opacity"
                                title="Open book details"
                              >
                                <BookCover
                                  src={book.photoUrl}
                                  title={book.title}
                                  author={book.author}
                                  size="sm"
                                  aspectRatio="h-full w-full"
                                />
                              </Link>
                              <div>
                                <Link
                                  href={`/books/${book.id}`}
                                  className="font-serif font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                                >
                                  <span>{book.title}</span>
                                  <ExternalLink className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <span className="text-[11px] font-mono text-muted">
                                  ID: {book.id.slice(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Author */}
                          <td className="px-5 py-3.5 font-medium text-foreground">
                            {book.author}
                          </td>

                          {/* Owner details */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">
                                {book.owner?.name}
                              </span>
                              <a
                                href={`mailto:${book.owner?.email}`}
                                className="text-primary hover:underline flex items-center gap-1 text-[11px] mt-0.5"
                              >
                                <Mail className="w-3 h-3 text-muted" />
                                {book.owner?.email}
                              </a>
                            </div>
                          </td>

                          {/* Listed Date */}
                          <td className="px-5 py-3.5 text-muted font-mono">
                            {book.createdAt
                              ? new Date(book.createdAt).toLocaleDateString()
                              : 'Recently'}
                          </td>

                          {/* Actions: Delete Book */}
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setBookToDelete(book)}
                              className="text-muted hover:text-rust p-1.5"
                              title="Delete book from platform"
                              aria-label="Delete book"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center bg-card">
                <BookOpen className="w-10 h-10 text-muted mx-auto mb-2 opacity-40" />
                <h3 className="font-serif text-base font-bold text-foreground">
                  No books found
                </h3>
                <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                  {bookSearch
                    ? `No books matching "${bookSearch}".`
                    : selectedUserFilter
                      ? `${selectedUserFilter.name} has not listed any books on their shelf yet.`
                      : 'No books have been listed on the platform yet.'}
                </p>
                {selectedUserFilter && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUserFilter(null)}
                    >
                      View All Books
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: EXCHANGE REQUESTS MODERATION TABLE */}
        {selectedView === 'requests' && (
          <div className="bg-card border border-card-border rounded-sm overflow-hidden shadow-xs">
            {/* Header & Filters */}
            <div className="p-5 border-b border-card-border flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-lg font-bold text-foreground">
                    Exchange Requests ({filteredExchangeRequests.length} of{' '}
                    {exchangeData?.total || 0})
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Overview of all book swap proposals between readers across the
                    community.
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={requestSearch}
                    onChange={e => setRequestSearch(e.target.value)}
                    placeholder="Search book, author, user..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-sm border border-card-border bg-background text-foreground focus-ring w-56 sm:w-64"
                  />
                  {requestSearch && (
                    <button
                      type="button"
                      onClick={() => setRequestSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 pt-1 border-t border-card-border/60">
                <span className="text-[11px] font-mono text-muted flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3" />
                  Status:
                </span>
                {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map(status => {
                  const isActive = requestStatusFilter === status;
                  const count =
                    status === 'ALL'
                      ? exchangeData?.total || 0
                      : exchangeData?.data?.filter(r => r.status === status).length || 0;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setRequestStatusFilter(status)}
                      className={`px-2.5 py-1 rounded-xs text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-background/60 hover:bg-background text-muted hover:text-foreground border border-card-border'
                      }`}
                    >
                      <span>
                        {status === 'ALL'
                          ? 'All'
                          : status.charAt(0) + status.slice(1).toLowerCase()}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1 py-0.2 rounded-xs ${
                          isActive ? 'bg-white/20' : 'bg-black/[0.05]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isExchangeLoading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <Spinner size="lg" />
                <p className="text-xs text-muted">Retrieving exchange proposals...</p>
              </div>
            ) : filteredExchangeRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-background/80 text-muted font-mono uppercase tracking-wider border-b border-card-border">
                    <tr>
                      <th className="px-5 py-3">Book</th>
                      <th className="px-5 py-3">Author</th>
                      <th className="px-5 py-3">Requester</th>
                      <th className="px-5 py-3">Owner</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {filteredExchangeRequests.map(req => {
                      return (
                        <tr
                          key={req.id}
                          className="hover:bg-background/40 transition-colors"
                        >
                          {/* Book Photo Thumbnail + Title */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/books/${req.toBook.id}`}
                                className="w-10 h-14 rounded-xs overflow-hidden shrink-0 border border-card-border bg-muted/15 shadow-2xs hover:opacity-85 transition-opacity"
                                title="Open book details"
                              >
                                <BookCover
                                  src={req.toBook.photoUrl}
                                  title={req.toBook.title}
                                  author={req.toBook.author}
                                  size="sm"
                                  aspectRatio="h-full w-full"
                                />
                              </Link>
                              <div>
                                <Link
                                  href={`/books/${req.toBook.id}`}
                                  className="font-serif font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                                >
                                  <span>{req.toBook.title}</span>
                                  <ExternalLink className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <span className="text-[11px] font-mono text-muted">
                                  Request #{req.id.slice(0, 8)}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Author */}
                          <td className="px-5 py-3.5 font-medium text-foreground">
                            {req.toBook.author}
                          </td>

                          {/* Requester details */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {req.fromUser.avatarUrl ? (
                                <img
                                  src={req.fromUser.avatarUrl}
                                  alt={req.fromUser.name}
                                  className="w-7 h-7 rounded-full object-cover border border-card-border shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-secondary/15 text-secondary text-xs font-bold flex items-center justify-center shrink-0">
                                  {req.fromUser.name.charAt(0)}
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">
                                  {req.fromUser.name}
                                </span>
                                <a
                                  href={`mailto:${req.fromUser.email}`}
                                  className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                                >
                                  <Mail className="w-3 h-3 text-muted" />
                                  {req.fromUser.email}
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* Book Owner details */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">
                                {req.toBook.owner?.name}
                              </span>
                              <a
                                href={`mailto:${req.toBook.owner?.email}`}
                                className="text-muted hover:text-foreground flex items-center gap-1 text-[11px]"
                              >
                                <Mail className="w-3 h-3 text-muted" />
                                {req.toBook.owner?.email}
                              </a>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="px-5 py-3.5">
                            <Badge
                              variant={
                                req.status === 'ACCEPTED'
                                  ? 'olive'
                                  : req.status === 'REJECTED'
                                    ? 'rust'
                                    : 'secondary'
                              }
                              size="sm"
                              className="flex items-center gap-1 w-fit"
                            >
                              {req.status === 'ACCEPTED' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : req.status === 'REJECTED' ? (
                                <XCircle className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              <span>{req.status}</span>
                            </Badge>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-3.5 text-muted font-mono">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>

                          {/* Action: Delete request */}
                          <td className="px-5 py-3.5 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRequestToDelete(req)}
                              className="text-muted hover:text-rust p-1.5"
                              title="Delete request"
                              aria-label="Delete request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center bg-card">
                <ArrowLeftRight className="w-10 h-10 text-muted mx-auto mb-2 opacity-40" />
                <h3 className="font-serif text-base font-bold text-foreground">
                  No exchange requests found
                </h3>
                <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                  {requestSearch
                    ? `No requests matching "${requestSearch}".`
                    : requestStatusFilter !== 'ALL'
                      ? `No exchange proposals with status "${requestStatusFilter}".`
                      : 'No book exchange requests have been proposed on the platform yet.'}
                </p>
                {(requestSearch || requestStatusFilter !== 'ALL') && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRequestSearch('');
                        setRequestStatusFilter('ALL');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal: Create User */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fadeIn">
            <div className="relative w-full max-w-md bg-card border border-card-border rounded-sm shadow-xl p-6">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="absolute top-4 right-4 text-muted hover:text-foreground focus-ring rounded-sm p-1 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-card-border">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Create New User
                </h3>
              </div>

              <form
                onSubmit={handleSubmit(onSubmitCreate)}
                className="flex flex-col gap-4"
              >
                <Input
                  label="Full Name"
                  placeholder="e.g. Leo Tolstoy"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. tolstoy@shelftrade.local"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="role-select"
                    className="text-xs font-medium text-foreground tracking-wide"
                  >
                    Account Role
                  </label>
                  <select
                    id="role-select"
                    className="w-full bg-card text-foreground text-sm rounded-md border border-card-border py-2 px-3 focus-ring cursor-pointer"
                    {...register('role')}
                  >
                    <option value="USER">User (Standard Reader)</option>
                    <option value="ADMIN">Admin (Moderator)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-card-border">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    isLoading={createUserMutation.isPending}
                  >
                    Create User
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete User */}
        {userToDelete && (
          <ConfirmModal
            isOpen={!!userToDelete}
            onClose={() => setUserToDelete(null)}
            onConfirm={handleConfirmDeleteUser}
            title="Delete User Account?"
            description={`Are you sure you want to delete ${userToDelete.name} (${userToDelete.email})? This will permanently delete their account and remove all of their ${userToDelete.bookCount} listed books.`}
            confirmText="Delete User"
            variant="danger"
            isLoading={deleteUserMutation.isPending}
          />
        )}

        {/* Modal: Confirm Delete Book */}
        {bookToDelete && (
          <ConfirmModal
            isOpen={!!bookToDelete}
            onClose={() => setBookToDelete(null)}
            onConfirm={handleConfirmDeleteBook}
            title="Delete Book from Catalog?"
            description={`Are you sure you want to delete "${bookToDelete.title}" by ${bookToDelete.author}? This will permanently remove the book from the platform catalog and cancel any related exchange requests.`}
            confirmText="Delete Book"
            variant="danger"
            isLoading={deleteBookMutation.isPending}
          />
        )}

        {/* Modal: Confirm Delete Exchange Request */}
        {requestToDelete && (
          <ConfirmModal
            isOpen={!!requestToDelete}
            onClose={() => setRequestToDelete(null)}
            onConfirm={handleConfirmDeleteRequest}
            title="Delete Exchange Request?"
            description={`Are you sure you want to delete the exchange request for "${requestToDelete.toBook.title}" proposed by ${requestToDelete.fromUser.name}? This action cannot be undone.`}
            confirmText="Delete Request"
            variant="danger"
            isLoading={deleteExchangeMutation.isPending}
          />
        )}
      </div>
    </AdminRoute>
  );
}
