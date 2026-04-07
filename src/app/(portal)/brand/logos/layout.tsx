import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logo Files | CWS Portal',
  description: 'Manage your brand logos and visual identity marks.',
}

export default function LogosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
