import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Inter } from 'next/font/google';
import './globals.css';

export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Caliber Web Studio Portal',
    template: '%s | Caliber Web Studio Portal',
  },
  description:
    'Client portal for Caliber Web Studio. Manage projects, payments, and communications.',
  keywords: [
    'web studio',
    'caliber',
    'client portal',
    'project management',
  ],
  authors: [
    {
      name: 'Caliber Web Studio',
      url: 'https://caliberwebstudio.com',
    },
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://portal.caliberwebstudio.com',
    title: 'Caliber Web Studio Portal',
    description:
      'Client portal for Caliber Web Studio. Manage projects, payments, and communications.',
    siteName: 'Caliber Web Studio Portal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Caliber Web Studio Portal',
    description:
      'Client portal for Caliber Web Studio. Manage projects, payments, and communications.',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
