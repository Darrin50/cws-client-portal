import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social Media Hub | CWS Portal',
  description: 'Review, approve, and track your AI-generated social media content.',
}

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
