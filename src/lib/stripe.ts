import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export const STRIPE_PRODUCTS = {
  starter: process.env.STRIPE_PRICE_STARTER || "",
  growth: process.env.STRIPE_PRICE_GROWTH || "",
  domination: process.env.STRIPE_PRICE_DOMINATION || "",
} as const;

export type PlanTier = keyof typeof STRIPE_PRODUCTS;

export function getPlanTierFromPriceId(priceId: string): PlanTier {
  for (const [tier, id] of Object.entries(STRIPE_PRODUCTS)) {
    if (id && id === priceId) return tier as PlanTier;
  }
  return "starter";
}

export async function createBillingSession(
  customerId: string,
  returnUrl: string
) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  } catch (error) {
    console.error("Error creating billing session:", error);
    throw error;
  }
}

export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price.product"],
    });

    const item = subscription.items.data[0];
    const price = item?.price;
    const product = price?.product as Stripe.Product | undefined;

    return {
      id: subscription.id,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      planName: product?.name || "Unknown Plan",
      priceId: price?.id,
      amount: price?.unit_amount ? price.unit_amount / 100 : 0,
      currency: price?.currency || "usd",
      interval: (price?.recurring?.interval as string) || "month",
    };
  } catch (error) {
    console.error("Error getting subscription details:", error);
    return null;
  }
}

export async function getInvoiceHistory(
  customerId: string,
  limit: number = 5
) {
  try {
    const invoices = await stripe.invoices.list({ customer: customerId, limit });
    return invoices.data.map((inv) => ({
      id: inv.id,
      number: inv.number || inv.id,
      date: new Date(inv.created * 1000),
      amount: (inv.amount_paid ?? 0) / 100,
      currency: inv.currency,
      status: inv.status as string,
      pdfUrl: inv.invoice_pdf,
      hostedUrl: inv.hosted_invoice_url,
    }));
  } catch (error) {
    console.error("Error getting invoice history:", error);
    return [];
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    return null;
  }
}

export async function getInvoices(customerId: string, limit: number = 10) {
  try {
    const invoices = await stripe.invoices.list({ customer: customerId, limit });
    return invoices.data;
  } catch (error) {
    console.error("Error retrieving invoices:", error);
    return [];
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

export async function updateSubscription(
  subscriptionId: string,
  data: {
    items?: Array<{
      id: string;
      quantity?: number;
    }>;
    proration_behavior?: string;
  }
) {
  try {
    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      data as any
    );
    return subscription;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}
