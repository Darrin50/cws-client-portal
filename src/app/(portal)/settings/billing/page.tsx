import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { organizationsTable, usersTable, organizationMembersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Download } from "lucide-react";
import Stripe from "stripe";

const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    "Up to 5 page revisions per month",
    "Basic analytics",
    "Email support",
    "Monthly reporting",
  ],
  growth: [
    "Unlimited page revisions",
    "Advanced analytics",
    "Social media management",
    "Priority support",
    "Custom integrations",
    "Team collaboration",
  ],
  domination: [
    "Everything in Growth",
    "Dedicated account manager",
    "Weekly strategy calls",
    "Custom development",
    "White-glove onboarding",
    "Same-day support",
    "Multi-location management",
  ],
};

const PLAN_PRICES: Record<string, number> = {
  starter: 197,
  growth: 397,
  domination: 697,
};

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter Plan",
  growth: "Growth Plan",
  domination: "Domination Plan",
};

async function resolveOrg(clerkUserId: string, clerkOrgId: string | null) {
  if (clerkOrgId) {
    const rows = await db
      .select()
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
  const dbUserId = userRows[0]?.id;
  if (!dbUserId) return null;

  const memberRows = await db
    .select({ organizationId: organizationMembersTable.organizationId })
    .from(organizationMembersTable)
    .where(eq(organizationMembersTable.userId, dbUserId))
    .limit(1);
  if (!memberRows[0]) return null;

  const orgRows = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, memberRows[0].organizationId))
    .limit(1);
  return orgRows[0] ?? null;
}

export default async function BillingPage() {
  const { userId: clerkUserId, orgId: clerkOrgId } = await auth();
  if (!clerkUserId) redirect("/login");

  const org = await resolveOrg(clerkUserId, clerkOrgId ?? null);

  // Fetch live Stripe data if customer exists
  let subscription: Stripe.Subscription | null = null;
  let invoices: Stripe.Invoice[] = [];
  let paymentMethod: Stripe.PaymentMethod | null = null;

  if (org?.stripeCustomerId) {
    // Active subscription
    if (org.stripeSubscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(org.stripeSubscriptionId, {
          expand: ["default_payment_method"],
        });
      } catch {
        // Subscription may have been deleted
      }
    }

    // Invoice list
    try {
      const inv = await stripe.invoices.list({ customer: org.stripeCustomerId, limit: 12 });
      invoices = inv.data;
    } catch {
      // No invoices or API error — continue gracefully
    }

    // Payment method from subscription
    if (subscription?.default_payment_method && typeof subscription.default_payment_method !== "string") {
      paymentMethod = subscription.default_payment_method as Stripe.PaymentMethod;
    } else if (org.stripeCustomerId) {
      try {
        const pms = await stripe.paymentMethods.list({ customer: org.stripeCustomerId, type: "card", limit: 1 });
        paymentMethod = pms.data[0] ?? null;
      } catch {
        // No payment methods
      }
    }
  }

  const planTier = org?.planTier ?? "starter";
  const planName = PLAN_NAMES[planTier] ?? "Starter Plan";
  const planPrice = PLAN_PRICES[planTier] ?? 197;
  const features = PLAN_FEATURES[planTier] ?? PLAN_FEATURES.starter;

  const nextBillingDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const card = paymentMethod?.card;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Billing &amp; Subscriptions</h1>
        <p className="text-slate-400 mt-2">Manage your plan and billing information</p>
      </div>

      {/* Current Plan */}
      <Card className="p-8 border-blue-700 bg-blue-900/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-slate-400 mb-2">Current Plan</p>
            <h2 className="text-3xl font-bold text-white mb-2">{planName}</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">${planPrice}</span>
              <span className="text-slate-400">per month</span>
            </div>
            {nextBillingDate && (
              <p className="text-sm text-slate-400 mb-6">Next billing date: {nextBillingDate}</p>
            )}
            {!org?.isActive && (
              <p className="text-sm text-red-400 mb-4">⚠ Subscription inactive — please update your payment method</p>
            )}
            <Button>Manage Billing</Button>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-4">Plan Features</p>
            <ul className="space-y-3">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-white text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Payment Method</h2>
        <div className="bg-slate-700 rounded-lg p-6 flex items-center justify-between">
          {card ? (
            <div>
              <p className="text-sm text-slate-400">Card on file</p>
              <p className="text-lg font-semibold text-white mt-1 capitalize">
                {card.brand} ending in {card.last4}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Expires {String(card.exp_month).padStart(2, "0")}/{card.exp_year}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-400">No payment method on file</p>
            </div>
          )}
          <Button variant="outline">Update Card</Button>
        </div>
      </Card>

      {/* Invoice History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Invoice History</h2>
        {invoices.length === 0 ? (
          <p className="text-slate-400 text-sm">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Invoice</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="py-3 px-4 text-white">{invoice.number ?? invoice.id}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {invoice.created
                        ? new Date(invoice.created * 1000).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      ${((invoice.amount_paid ?? invoice.total ?? 0) / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-green-900/20 text-green-300 border border-green-700"
                            : invoice.status === "open"
                              ? "bg-amber-900/20 text-amber-300 border border-amber-700"
                              : "bg-red-900/20 text-red-300 border border-red-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {invoice.invoice_pdf && (
                        <a
                          href={invoice.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6 bg-slate-700/30">
        <h3 className="text-lg font-semibold text-white mb-4">Billing Questions?</h3>
        <p className="text-slate-300 text-sm">
          For questions about your billing or invoice, please contact our support team at{" "}
          billing@caliberwebstudio.com or use the message feature in your portal.
        </p>
      </Card>
    </div>
  );
}
