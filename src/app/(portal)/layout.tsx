import { ClientLayout } from "@/components/layouts/client-layout";
import { ImpersonationBannerClient } from "@/components/impersonation-banner-client";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyImpersonationCookie } from "@/lib/impersonation";
import { db } from "@/db";
import { organizationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function getImpersonationBanner(): Promise<React.ReactNode> {
  try {
    const cookieStore = await cookies();
    const cookieValue = cookieStore.get('cws_admin_impersonate')?.value;
    if (!cookieValue) return null;

    const payload = verifyImpersonationCookie(cookieValue);
    if (!payload) return null;

    const [org] = await db
      .select({ name: organizationsTable.name })
      .from(organizationsTable)
      .where(eq(organizationsTable.id, payload.targetOrgId))
      .limit(1);

    return <ImpersonationBannerClient orgName={org?.name ?? 'Unknown'} />;
  } catch {
    return null;
  }
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const topBanner = await getImpersonationBanner();
  return <ClientLayout topBanner={topBanner}>{children}</ClientLayout>;
}
