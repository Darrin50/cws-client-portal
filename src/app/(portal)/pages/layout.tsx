import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Website | CWS Portal',
  description: 'View and manage the pages on your Caliber Web Studio website.',
}

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
