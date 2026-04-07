import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ | Common Questions About CWS AI Websites',
  description:
    'Answers to common questions about Caliber Web Studio AI websites — pricing, contracts, setup, support, and cancellation.',
  openGraph: {
    title: 'FAQ | Common Questions About CWS AI Websites',
    description:
      'How does it work? Can I cancel? What\'s included? All your questions about Caliber Web Studio answered.',
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
