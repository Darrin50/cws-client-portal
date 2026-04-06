import { ClientLayout } from "@/components/layouts/client-layout";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
