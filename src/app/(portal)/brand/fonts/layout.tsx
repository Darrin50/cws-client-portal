import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brand Fonts | CWS Portal',
  description: 'View your brand typography and font specifications.',
}

export default function FontsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
