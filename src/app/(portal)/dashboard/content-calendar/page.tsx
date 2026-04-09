import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationsTable, organizationMembersTable, usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Lock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ContentCalendarView } from './content-calendar-view';

export const metadata: Metadata = {
  title: 'Content Calendar | CWS Portal',
};

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
      .from(organizationsTable)
      .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
      .limit(1);
    if (rows[0]) return rows[0];
  }

  const userRows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.clerkUserId, clerkUserId))
    .limit(1);
  if (!userRows[0]) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, userRows[0].id))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select({ id: organizationsTable.id, planTier: organizationsTable.planTier })
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

export default async function ContentCalendarPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

  let planTier = 'starter';
  if (clerkUserId) {
    const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);
    planTier = org?.planTier ?? 'starter';
  }

  const hasAccess = planTier === 'growth' || planTier === 'domination';

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 scroll-m-0 border-0 pb-0 tracking-normal">
            Content Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Plan and schedule social media posts. Click any day to add a post.
          </p>
        </div>

        {/* Upgrade gate */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Blurred placeholder */}
          <div className="blur-sm pointer-events-none select-none" aria-hidden>
            <div className="p-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">April 2026</h2>
                </div>
                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} className="bg-slate-50 dark:bg-slate-800 text-center text-xs font-semibold text-slate-500 py-2">
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="min-h-[70px] bg-white dark:bg-slate-900 p-1.5">
                      {i > 0 && i < 30 && (
                        <span className="text-xs text-slate-400">{i}</span>
                      )}
                      {[3, 7, 12, 18, 24].includes(i) && (
                        <div className="mt-1 text-xs px-1 py-0.5 rounded bg-pink-100 text-pink-700 border border-pink-200">
                          Instagram
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-[2px]">
            <div className="text-center space-y-4 px-6 max-w-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto shadow-lg">
                <Lock className="w-7 h-7 text-slate-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Growth Plan & Above
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Plan and schedule social media content for Facebook, Instagram, LinkedIn, and
                  Twitter — with AI-generated captions tailored to each platform.
                </p>
              </div>
              <Button asChild className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl">
                <Link href="/settings/billing">Upgrade to Growth</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ContentCalendarView />;
}
