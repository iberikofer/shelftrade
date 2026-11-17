'use client';

import React, { useState } from 'react';
import { BookOpen, ArrowLeftRight, Inbox, Send } from 'lucide-react';
import { useMyBooks } from '../../../hooks/useMyBooks';
import { useMyExchangeRequests } from '../../../hooks/useExchange';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import AddBookForm from './_components/AddBookForm';
import MyBooksList from './_components/MyBooksList';
import ReceivedRequests from './_components/ReceivedRequests';
import SentRequests from './_components/SentRequests';

export default function MyBooksPage() {
  const [activeTab, setActiveTab] = useState<'books' | 'requests'>('books');
  const [requestsSubTab, setRequestsSubTab] = useState<'received' | 'sent'>('received');

  const { data: myBooksData } = useMyBooks();
  const { data: exchangeData } = useMyExchangeRequests();

  const pendingReceivedCount =
    exchangeData?.received?.filter(r => r.status === 'PENDING').length ?? 0;
  const totalRequestsCount =
    (exchangeData?.received?.length ?? 0) + (exchangeData?.sent?.length ?? 0);

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Page Title & Navigation Tabs */}
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted font-semibold">
            Member Dashboard
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-1 tracking-tight">
            My Books &amp; Exchanges
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
                {myBooksData?.total ?? 0}
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
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-secondary text-white">
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

        {/* TAB 1: MY BOOKS */}
        {activeTab === 'books' && (
          <div className="flex flex-col gap-8">
            <AddBookForm />
            <MyBooksList />
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
                <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-white/20">
                  {exchangeData?.received?.length ?? 0}
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
                <span className="text-[10px] px-1.5 py-0.5 rounded-xs bg-white/20">
                  {exchangeData?.sent?.length ?? 0}
                </span>
              </button>
            </div>

            {requestsSubTab === 'received' ? <ReceivedRequests /> : <SentRequests />}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
