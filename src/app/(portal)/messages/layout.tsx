import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Messages | CWS Portal',
  description: 'Communicate with your Caliber Web Studio project team.',
}

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
