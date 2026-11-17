'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield,
  Users,
  BookOpen,
  ArrowLeftRight,
  UserPlus,
  Trash2,
  Mail,
  X,
} from 'lucide-react';
import AdminRoute from '../../components/auth/AdminRoute';
import {
  useAdminStats,
  useAdminUsers,
  useAdminCreateUser,
  useAdminDeleteUser,
  AdminUser,
} from '../../hooks/useAdmin';
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
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const { data: statsData, isLoading: isStatsLoading } = useAdminStats();
  const { data: usersData, isLoading: isUsersLoading } = useAdminUsers();

  const createUserMutation = useAdminCreateUser();
  const deleteUserMutation = useAdminDeleteUser();

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

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        setUserToDelete(null);
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

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-card-border rounded-sm p-5 flex items-center gap-4 shadow-xs">
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
          </div>

          <div className="bg-card border border-card-border rounded-sm p-5 flex items-center gap-4 shadow-xs">
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
          </div>

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

        {/* Users Management Table */}
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

                        <td className="px-5 py-3.5 font-mono font-bold text-foreground">
                          {user.bookCount} {user.bookCount === 1 ? 'book' : 'books'}
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
            onConfirm={handleConfirmDelete}
            title="Delete User Account?"
            description={`Are you sure you want to delete ${userToDelete.name} (${userToDelete.email})? This will permanently delete their account and remove all of their ${userToDelete.bookCount} listed books.`}
            confirmText="Delete User"
            variant="danger"
            isLoading={deleteUserMutation.isPending}
          />
        )}
      </div>
    </AdminRoute>
  );
}
