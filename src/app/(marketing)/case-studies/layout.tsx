import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Studies | Real Results for Detroit Small Businesses',
  description:
    'See how Detroit small businesses grew with Caliber Web Studio. Real traffic increases, lead growth, and Google ranking improvements.',
  openGraph: {
    title: 'Case Studies | Real Results for Detroit Small Businesses',
    description:
      'Real results: traffic up 34%, leads doubled, top-3 Google rankings. See what AI-powered websites can do for your business.',
  },
}

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
