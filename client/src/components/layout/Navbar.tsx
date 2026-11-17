'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LogOut, Shield, ChevronDown, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { resolveAvatarUrl } from '../../lib/resolveAvatarUrl';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const resolvedAvatarUrl = resolveAvatarUrl(user?.avatarUrl);

  const navLinks = [
    { href: '/books', label: 'Discover Books' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin Panel' }] : []),
  ];

  // Close menu on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Close menu on route change (React-recommended state adjustment during render)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-card/90 backdrop-blur-md border-b border-card-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link
          href="/books"
          className="flex items-center gap-2.5 font-serif text-xl font-bold text-primary tracking-tight hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-sm bg-primary text-white flex items-center justify-center shadow-xs">
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
                  px-3 py-1.5 rounded-sm text-sm font-medium transition-colors focus-ring
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
        <div className="flex items-center gap-2.5 min-h-[36px]">
          {isLoading ? (
            /* Neutral skeleton matching user dimensions to prevent FOAC */
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col items-end gap-1">
                <div className="w-20 h-3 bg-muted/20 rounded-xs animate-pulse" />
                <div className="w-14 h-2 bg-muted/15 rounded-xs animate-pulse" />
              </div>
              <div className="w-8 h-8 rounded-full bg-muted/20 animate-pulse" />
            </div>
          ) : isAuthenticated && user ? (
            <div className="relative h-16 flex items-center" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="flex items-center gap-2.5 group hover:opacity-95 transition-all focus-ring rounded-sm p-1.5 -m-1.5 border border-transparent hover:border-card-border hover:bg-black/[0.03] cursor-pointer"
                title="Account menu"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <div className="hidden sm:flex flex-col items-end text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground leading-none group-hover:text-primary transition-colors">
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
                {resolvedAvatarUrl ? (
                  <img
                    src={resolvedAvatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-card-border ring-1 ring-transparent group-hover:ring-primary/40 transition-all"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center border border-primary/20 group-hover:bg-primary/25 transition-colors">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
                    isMenuOpen ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              {/* User Dropdown Menu - Merged seamlessly with header bottom border */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full -mt-px w-60 bg-card border border-card-border border-t-0 rounded-b-sm rounded-t-none shadow-xl py-1.5 z-50 animate-fadeIn">
                  {/* Top badge panel: ONLY for Admin, completely omitted for regular users */}
                  {isAdmin && (
                    <div className="px-3 py-2 border-b border-card-border flex justify-center bg-primary/[0.03]">
                      <Badge variant="primary" size="sm">
                        ADMINISTRATOR
                      </Badge>
                    </div>
                  )}

                  {/* Navigation Links: Reader Profile first, then My Books & Exchanges */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className={`
                        w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors
                        ${
                          pathname === '/profile'
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-foreground hover:bg-black/[0.04]'
                        }
                      `}
                    >
                      <UserIcon className="w-4 h-4 text-muted" />
                      <span>Reader Profile</span>
                    </Link>

                    <Link
                      href="/me/books"
                      onClick={() => setIsMenuOpen(false)}
                      className={`
                        w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors
                        ${
                          pathname === '/me/books'
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-foreground hover:bg-black/[0.04]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span>My Books &amp; Exchanges</span>
                      </div>
                      {user.bookCount !== undefined && user.bookCount > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs bg-black/[0.06] text-muted">
                          {user.bookCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Logout Action */}
                  <div className="pt-1 border-t border-card-border mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rust hover:bg-rust/10 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
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
