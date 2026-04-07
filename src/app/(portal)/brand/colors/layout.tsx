import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brand Colors | CWS Portal',
  description: 'View and manage your brand color palette.',
}

export default function ColorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
