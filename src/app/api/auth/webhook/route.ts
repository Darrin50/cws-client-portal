import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { db } from '@/db';
import { usersTable, organizationsTable, organizationMembersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

const secret = process.env.CLERK_WEBHOOK_SECRET;

// Clerk sends these shapes for each event type
interface ClerkUserData {
  id: string;
  email_addresses: Array<{ email_address: string; id: string }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

interface ClerkOrgData {
  id: string;
  name: string;
  slug: string;
}

interface ClerkMembershipData {
  organization: { id: string };
  public_user_data: { user_id: string };
  role: string;
}

export async function POST(request: NextRequest) {
  if (!secret) {
    console.error('[webhook] CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Verify Svix signature
  const svixId = request.headers.get('svix-id') ?? '';
  const svixTimestamp = request.headers.get('svix-timestamp') ?? '';
  const svixSignature = request.headers.get('svix-signature') ?? '';

  const body = await request.text();

  // Only verify if Svix headers are present (Clerk sends them in production)
  if (svixId && svixTimestamp && svixSignature) {
    try {
      const wh = new Webhook(secret);
      wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      console.error('[webhook] Svix signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let evt: { type: string; data: unknown };
  try {
    evt = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    switch (evt.type) {
      case 'user.created': {
        const data = evt.data as ClerkUserData;
        const email = data.email_addresses?.[0]?.email_address;
        if (!email) break;

        await db.insert(usersTable).values({
          clerkUserId: data.id,
          email,
          firstName: data.first_name ?? null,
          lastName: data.last_name ?? null,
          avatarUrl: data.image_url ?? null,
          role: 'client',
          isActive: true,
        }).onConflictDoNothing();

        console.log('[webhook] user.created →', data.id, email);
        break;
      }

      case 'user.updated': {
        const data = evt.data as ClerkUserData;
        const email = data.email_addresses?.[0]?.email_address;
        if (!email) break;

        await db.update(usersTable)
          .set({
            email,
            firstName: data.first_name ?? null,
            lastName: data.last_name ?? null,
            avatarUrl: data.image_url ?? null,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.clerkUserId, data.id));

        console.log('[webhook] user.updated →', data.id);
        break;
      }

      case 'organization.created': {
        const data = evt.data as ClerkOrgData;
        const slug = (data.slug || data.id).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 255);

        await db.insert(organizationsTable).values({
          clerkOrgId: data.id,
          name: data.name || 'New Organization',
          slug,
          planTier: 'starter',
          healthScore: 100,
          isActive: true,
        }).onConflictDoNothing();

        console.log('[webhook] organization.created →', data.id, data.name);
        break;
      }

      case 'organizationMembership.created': {
        const data = evt.data as ClerkMembershipData;
        const clerkOrgId = data.organization?.id;
        const clerkUserId = data.public_user_data?.user_id;
        if (!clerkOrgId || !clerkUserId) break;

        const [org] = await db
          .select({ id: organizationsTable.id })
          .from(organizationsTable)
          .where(eq(organizationsTable.clerkOrgId, clerkOrgId))
          .limit(1);

        const [user] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.clerkUserId, clerkUserId))
          .limit(1);

        if (org && user) {
          await db.insert(organizationMembersTable).values({
            organizationId: org.id,
            userId: user.id,
            role: data.role === 'org:admin' ? 'owner' : 'member',
          }).onConflictDoNothing();

          console.log('[webhook] organizationMembership.created → org:', org.id, 'user:', user.id);
        } else {
          console.warn('[webhook] organizationMembership.created — org or user not found. orgClerkId:', clerkOrgId, 'userClerkId:', clerkUserId);
        }
        break;
      }

      case 'organizationMembership.deleted': {
        const data = evt.data as ClerkMembershipData;
        const clerkOrgId = data.organization?.id;
        const clerkUserId = data.public_user_data?.user_id;
        if (!clerkOrgId || !clerkUserId) break;

        // Look up the DB IDs
        const [org] = await db.select({ id: organizationsTable.id }).from(organizationsTable).where(eq(organizationsTable.clerkOrgId, clerkOrgId)).limit(1);
        const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.clerkUserId, clerkUserId)).limit(1);

        if (org && user) {
          await db.delete(organizationMembersTable)
            .where(
              eq(organizationMembersTable.organizationId, org.id)
            );
          console.log('[webhook] organizationMembership.deleted → org:', org.id, 'user:', user.id);
        }
        break;
      }

      default:
        // Unhandled event types are fine — just ignore them
        break;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[webhook] handler error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
