import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | AI Websites Starting at $197/mo — No Setup Fees',
  description:
    'Simple, transparent pricing for AI-powered websites. Starter $197/mo, Growth $397/mo, Domination $697/mo. $0 down, cancel anytime.',
  openGraph: {
    title: 'Pricing | AI Websites Starting at $197/mo',
    description:
      'No setup fees, no contracts. Choose the plan that fits your business and get a free demo today.',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
