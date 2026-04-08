import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from 'next-themes';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

export const dynamic = 'force-dynamic';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0e1a' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://portal.caliberwebstudio.com'),
  title: {
    default: 'Caliber Web Studio Portal',
    template: '%s | Caliber Web Studio Portal',
  },
  description:
    'Client portal for Caliber Web Studio. Manage projects, payments, and communications.',
  keywords: ['web studio', 'caliber', 'client portal', 'project management'],
  authors: [
    {
      name: 'Caliber Web Studio',
      url: 'https://caliberwebstudio.com',
    },
  ],
  openGraph: {
    type: 'website',
    siteName: 'Caliber Web Studio',
    locale: 'en_US',
    url: 'https://portal.caliberwebstudio.com',
    title: 'Caliber Web Studio Portal',
    description:
      'Client portal for Caliber Web Studio. Manage projects, payments, and communications.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@caliberwebstudio',
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
}): React.ReactElement {
  return (
    <ClerkProvider
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
      afterSelectOrganizationUrl="/dashboard"
      afterCreateOrganizationUrl="/dashboard"
    >
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} ${plusJakarta.variable}`}
      >
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
