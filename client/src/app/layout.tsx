import type { Metadata } from 'next';
import { Inter, Crimson_Pro } from 'next/font/google';
import './globals.css';
import Providers from '../components/Providers';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const crimson = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ShelfTrade',
  description:
    'Exchange personal books directly with fellow readers. Search, trade, and discover.',
  icons: {
    icon: [
      { url: '/favicon.svg?v=4', type: 'image/svg+xml' },
      { url: '/icon?v=4', type: 'image/png' },
    ],
    shortcut: '/favicon.svg?v=4',
    apple: '/icon?v=4',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${crimson.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen flex flex-col bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
