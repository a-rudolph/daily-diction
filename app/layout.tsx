import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { InstallPrompt } from '@/components/InstallPrompt';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Daily Diction',
  description: 'Personal speaking practice — read aloud, build your habit.',
  applicationName: 'Daily Diction',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Daily Diction',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-50">
        {children}
        <InstallPrompt />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
