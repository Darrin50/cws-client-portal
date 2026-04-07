import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications | CWS Portal',
  description: 'Manage your notification preferences for the CWS client portal.',
}

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
