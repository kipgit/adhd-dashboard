import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastContainer } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ADHD Dashboard - Your Brain\'s Best Friend',
  description: 'Energy-based task management built specifically for ADHD brains. Reduce overwhelm, celebrate wins, and get stuff done.',
  manifest: '/manifest.json',
  themeColor: '#007AFF',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ADHD Dashboard',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="tap-highlight-none">
      <body className={inter.className}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
