import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-card border-t border-card-border mt-auto py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span className="font-serif font-bold text-foreground">ShelfTrade</span>
          <span>— Peer-to-Peer Book Exchange Service</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/books" className="hover:text-foreground transition-colors">
            Catalog
          </Link>
          <span>•</span>
          <span>Crafted with Next.js & Express</span>
        </div>
      </div>
    </footer>
  );
}
