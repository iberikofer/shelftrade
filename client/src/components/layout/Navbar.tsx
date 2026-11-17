'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const navLinks = [
    { href: '/books', label: 'Discover Books' },
    ...(isAuthenticated ? [{ href: '/me/books', label: 'My Books' }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin Panel' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-card/90 backdrop-blur-md border-b border-card-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          href="/books"
          className="flex items-center gap-2.5 font-serif text-xl font-bold text-primary tracking-tight hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-md bg-primary text-white flex items-center justify-center shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="text-foreground">
            Shelf<span className="text-primary">Trade</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navLinks.map(link => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/books' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-ring
                  ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted hover:text-foreground hover:bg-black/[0.04]'
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User / Auth Controls */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end text-right">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground leading-none">
                    {user.name}
                  </span>
                  {isAdmin && (
                    <Badge
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-0.5"
                    >
                      <Shield className="w-2.5 h-2.5" />
                      ADMIN
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-muted leading-tight mt-0.5">
                  {user.email}
                </span>
              </div>

              {/* Avatar circle */}
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-card-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center border border-primary/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted hover:text-rust p-1.5"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Join ShelfTrade
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
