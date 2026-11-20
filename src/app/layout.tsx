import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { Metadata, Viewport } from 'next';
import { Barlow, Public_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { Providers } from './providers';

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-public-sans',
  display: 'swap',
});

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-barlow',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Doctor Tracker', template: '%s · Doctor Tracker' },
  description: 'Manage doctors and their patients, with analytics at a glance.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#141a21' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${barlow.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Applies the saved light/dark class before paint — no theme flash. */}
        <InitColorSchemeScript attribute="class" defaultMode="light" />
        <AppRouterCacheProvider options={{ key: 'css' }}>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
