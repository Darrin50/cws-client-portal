import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, getPlanTierFromPriceId } from '@/lib/stripe';
import { db } from '@/db';
import {
  organizationsTable,
  notificationsTable,
  auditLogTable,
  usersTable,
  organizationMembersTable,
} from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

async function getOrgByCustomerId(customerId: string) {
  return db.query.organizationsTable.findFirst({
    where: eq(organizationsTable.stripeCustomerId, customerId),
  });
}

async function getOrgMemberUserIds(orgId: string): Promise<string[]> {
  const members = await db
    .select({ userId: organizationMembersTable.userId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.organizationId, orgId));
  return members.map((m) => m.userId);
}

async function getAdminUserIds(): Promise<string[]> {
  const admins = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, 'admin'));
  return admins.map((a) => a.id);
}

async function createNotificationsForUsers(
  userIds: string[],
  orgId: string,
  type: 'payment_success' | 'payment_failed' | 'health_alert' | 'new_client',
  title: string,
  body: string
) {
  if (userIds.length === 0) return;
  await db.insert(notificationsTable).values(
    userIds.map((userId) => ({
      userId,
      organizationId: orgId,
      type,
      title,
      body,
    }))
  );
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Stripe webhook secret not configured' },
      { status: 500 }
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotency: skip if already processed
  const existing = await db
    .select({ id: auditLogTable.id })
    .from(auditLogTable)
    .where(
      and(
        eq(auditLogTable.action, 'stripe_event_processed'),
        sql`${auditLogTable.details}->>'eventId' = ${event.id}`
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ success: true, message: 'Event already processed' });
  }

  try {
    switch (event.type) {
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const org = await getOrgByCustomerId(customerId);

        if (org) {
          await db
            .update(organizationsTable)
            .set({ isActive: true, updatedAt: new Date() })
            .where(eq(organizationsTable.id, org.id));

          const [memberUserIds, adminUserIds] = await Promise.all([
            getOrgMemberUserIds(org.id),
            getAdminUserIds(),
          ]);

          const allUserIds = [...new Set([...memberUserIds, ...adminUserIds])];
          await createNotificationsForUsers(
            allUserIds,
            org.id,
            'payment_success',
            'Payment Successful',
            `Payment of $${((invoice.amount_paid ?? 0) / 100).toFixed(2)} received for ${org.name}.`
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const org = await getOrgByCustomerId(customerId);

        if (org) {
          const [memberUserIds, adminUserIds] = await Promise.all([
            getOrgMemberUserIds(org.id),
            getAdminUserIds(),
          ]);

          const allUserIds = [...new Set([...memberUserIds, ...adminUserIds])];
          await createNotificationsForUsers(
            allUserIds,
            org.id,
            'payment_failed',
            'Payment Failed',
            `Payment of $${((invoice.amount_due ?? 0) / 100).toFixed(2)} failed for ${org.name}. Please update your payment method.`
          );
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price?.id;
        const planTier = priceId ? getPlanTierFromPriceId(priceId) : 'starter';

        await db
          .update(organizationsTable)
          .set({
            stripeSubscriptionId: subscription.id,
            planTier,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(organizationsTable.stripeCustomerId, customerId));

        const org = await getOrgByCustomerId(customerId);
        if (org) {
          await db.insert(auditLogTable).values({
            organizationId: org.id,
            action: 'subscription_created',
            entityType: 'subscription',
            details: {
              subscriptionId: subscription.id,
              planTier,
              priceId,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price?.id;
        const planTier = priceId ? getPlanTierFromPriceId(priceId) : 'starter';

        await db
          .update(organizationsTable)
          .set({
            stripeSubscriptionId: subscription.id,
            planTier,
            updatedAt: new Date(),
          })
          .where(eq(organizationsTable.stripeCustomerId, customerId));

        const org = await getOrgByCustomerId(customerId);
        if (org) {
          await db.insert(auditLogTable).values({
            organizationId: org.id,
            action: 'subscription_updated',
            entityType: 'subscription',
            details: {
              subscriptionId: subscription.id,
              planTier,
              priceId,
              status: subscription.status,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const org = await getOrgByCustomerId(customerId);
        if (org) {
          await db
            .update(organizationsTable)
            .set({
              isActive: false,
              stripeSubscriptionId: null,
              planTier: 'starter',
              updatedAt: new Date(),
            })
            .where(eq(organizationsTable.id, org.id));

          const adminUserIds = await getAdminUserIds();
          await createNotificationsForUsers(
            adminUserIds,
            org.id,
            'new_client',
            'Subscription Cancelled',
            `${org.name} has cancelled their subscription.`
          );

          await db.insert(auditLogTable).values({
            organizationId: org.id,
            action: 'subscription_deleted',
            entityType: 'subscription',
            details: {
              subscriptionId: subscription.id,
            },
          });
        }
        break;
      }

      default:
        console.log('Unhandled Stripe event:', event.type);
    }

    // Record processed event for idempotency
    await db.insert(auditLogTable).values({
      action: 'stripe_event_processed',
      entityType: 'stripe_event',
      details: { eventId: event.id, eventType: event.type },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
