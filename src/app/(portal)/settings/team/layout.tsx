import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Team | CWS Portal',
  description: 'Manage your team members and invite collaborators.',
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
