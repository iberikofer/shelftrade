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
} from 'lucide-react';
import AdminRoute from '../../components/auth/AdminRoute';
import {
  useAdminStats,
  useAdminUsers,
  useAdminCreateUser,
  useAdminDeleteUser,
  useAdminDeleteBook,
  AdminUser,
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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'ADMIN']),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [selectedView, setSelectedView] = useState<'users' | 'books'>('users');
  const [selectedUserFilter, setSelectedUserFilter] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [bookSearch, setBookSearch] = useState('');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [bookToDelete, setBookToDelete] = useState<BookItem | null>(null);

  const { data: statsData, isLoading: isStatsLoading } = useAdminStats();
  const { data: usersData, isLoading: isUsersLoading } = useAdminUsers();

  const { data: booksData, isLoading: isBooksLoading } = useBooks({
    userId: selectedUserFilter?.id,
    search: bookSearch,
    limit: 100,
  });

  const createUserMutation = useAdminCreateUser();
  const deleteUserMutation = useAdminDeleteUser();
  const deleteBookMutation = useAdminDeleteBook();

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

        {/* Stats Metrics Cards with Interactive Switching */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => {
              setSelectedView('users');
              setSelectedUserFilter(null);
            }}
            className={`bg-card border rounded-sm p-5 flex items-center gap-4 shadow-xs text-left cursor-pointer transition-all ${
              selectedView === 'users' && !selectedUserFilter
                ? 'border-primary ring-2 ring-primary/30 bg-primary/[0.02]'
                : 'border-card-border hover:border-card-border-hover'
            }`}
          >
            <div className="w-12 h-12 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                Total Users
              </p>
              <p className="font-serif text-2xl font-bold text-foreground mt-0.5">
                {isStatsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  (statsData?.stats.totalUsers ?? 0)
                )}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedView('books');
              setSelectedUserFilter(null);
            }}
            className={`bg-card border rounded-sm p-5 flex items-center gap-4 shadow-xs text-left cursor-pointer transition-all ${
              selectedView === 'books'
                ? 'border-secondary ring-2 ring-secondary/30 bg-secondary/[0.02]'
                : 'border-card-border hover:border-card-border-hover'
            }`}
          >
            <div className="w-12 h-12 rounded-sm bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                Listed Books
              </p>
              <p className="font-serif text-2xl font-bold text-foreground mt-0.5">
                {isStatsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  (statsData?.stats.totalBooks ?? 0)
                )}
              </p>
            </div>
          </button>

          <div className="bg-card border border-card-border rounded-sm p-5 flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-sm bg-olive/10 text-olive flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                Exchange Requests
              </p>
              <p className="font-serif text-2xl font-bold text-foreground mt-0.5">
                {isStatsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  (statsData?.stats.totalRequests ?? 0)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-card-border gap-6">
          <button
            type="button"
            onClick={() => {
              setSelectedView('users');
              setSelectedUserFilter(null);
            }}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              selectedView === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registered Users</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-black/[0.05] text-muted">
              {usersData?.total || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedView('books');
              setSelectedUserFilter(null);
            }}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              selectedView === 'books'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {selectedUserFilter
                ? `${selectedUserFilter.name}'s Books`
                : 'All Listed Books'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-xs bg-black/[0.05] text-muted">
              {selectedUserFilter
                ? booksData?.data?.length || 0
                : statsData?.stats.totalBooks || 0}
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
      </div>
    </AdminRoute>
  );
}
