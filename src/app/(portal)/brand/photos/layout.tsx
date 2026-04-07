import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brand Photos | CWS Portal',
  description: 'Manage your brand image library.',
}

export default function PhotosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
