import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import {
  organizationsTable,
  notificationsTable,
  usersTable,
  organizationMembersTable,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';

const secret = process.env.STRIPE_WEBHOOK_SECRET;

type PlanTier = 'starter' | 'growth' | 'domination';

/** Map a Stripe subscription to a planTier based on metadata or price nickname. */
function resolvePlanTier(subscription: Stripe.Subscription): PlanTier {
  const meta = (subscription.metadata?.planTier ?? '') as string;
  if (meta === 'starter' || meta === 'growth' || meta === 'domination') {
    return meta;
  }
  // Fallback: derive from price nickname
  const nickname = (
    (subscription.items.data[0]?.price?.nickname ?? '') as string
  ).toLowerCase();
  if (nickname.includes('growth')) return 'growth';
  if (nickname.includes('domination')) return 'domination';
  return 'starter';
}

/** Find the DB organization row for a Stripe customer. */
async function getOrgByCustomer(customerId: string) {
  const rows = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.stripeCustomerId, customerId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Insert a notification for every member of an organization.
 * Used when there is no single target user (e.g. payment events).
 */
async function notifyOrgMembers(
  organizationId: string,
  payload: {
    type: typeof notificationsTable.$inferInsert['type'];
    title: string;
    body: string;
    link?: string;
  },
) {
  const members = await db
    .select({ userId: organizationMembersTable.userId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.organizationId, organizationId));

  if (members.length === 0) return;

  await db.insert(notificationsTable).values(
    members.map((m) => ({
      userId: m.userId,
      organizationId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      link: payload.link,
    })),
  );
}

export async function POST(request: NextRequest) {
  if (!secret) {
    return NextResponse.json(
      { error: 'Stripe webhook secret not configured' },
      { status: 500 },
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 401 });
  }

  let event: Stripe.Event;
  const body = await request.text();

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    switch (event.type) {
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id;
        if (!customerId) break;

        const org = await getOrgByCustomer(customerId);
        if (!org) break;

        await db
          .update(organizationsTable)
          .set({ isActive: true, updatedAt: new Date() })
          .where(eq(organizationsTable.id, org.id));

        await notifyOrgMembers(org.id, {
          type: 'payment_success',
          title: 'Payment received',
          body: `Invoice #${invoice.number ?? invoice.id} for $${((invoice.amount_paid ?? 0) / 100).toFixed(2)} has been paid.`,
          link: '/settings/billing',
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id;
        if (!customerId) break;

        const org = await getOrgByCustomer(customerId);
        if (!org) break;

        await db
          .update(organizationsTable)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(organizationsTable.id, org.id));

        await notifyOrgMembers(org.id, {
          type: 'payment_failed',
          title: 'Payment failed',
          body: `Your payment of $${((invoice.amount_due ?? 0) / 100).toFixed(2)} failed. Please update your payment method.`,
          link: '/settings/billing',
        });
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id;
        if (!customerId) break;

        const planTier = resolvePlanTier(subscription);

        await db
          .update(organizationsTable)
          .set({
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            planTier,
            isActive: subscription.status === 'active',
            updatedAt: new Date(),
          })
          .where(eq(organizationsTable.stripeCustomerId, customerId));
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id;
        if (!customerId) break;

        const planTier = resolvePlanTier(subscription);

        await db
          .update(organizationsTable)
          .set({
            stripeSubscriptionId: subscription.id,
            planTier,
            isActive: subscription.status === 'active',
            updatedAt: new Date(),
          })
          .where(eq(organizationsTable.stripeCustomerId, customerId));
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id;
        if (!customerId) break;

        const org = await getOrgByCustomer(customerId);
        if (!org) break;

        await db
          .update(organizationsTable)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(organizationsTable.id, org.id));

        await notifyOrgMembers(org.id, {
          type: 'payment_failed',
          title: 'Subscription canceled',
          body: 'Your subscription has been canceled. Please contact support if this was unexpected.',
          link: '/settings/billing',
        });
        break;
      }

      default:
        // Unhandled event type — ignore silently
        break;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
