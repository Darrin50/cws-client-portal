import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Settings | CWS Portal',
  description: 'Update your business information and profile details.',
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
