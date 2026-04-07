import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Download, ExternalLink } from "lucide-react";
import { db } from "@/db";
import { organizationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createBillingSession, getSubscriptionDetails, getInvoiceHistory } from "@/lib/stripe";
import { formatCurrency } from "@/lib/utils";

async function openBillingPortal() {
  "use server";
  const { orgId } = await auth();
  if (!orgId) redirect("/");

  const org = await db.query.organizationsTable.findFirst({
    where: eq(organizationsTable.clerkOrgId, orgId),
  });

  if (!org?.stripeCustomerId) {
    redirect("/settings/billing");
  }

  const returnUrl =
    process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`
      : "/settings/billing";

  const session = await createBillingSession(org.stripeCustomerId, returnUrl);
  redirect(session.url);
}

export default async function BillingPage() {
  const { orgId } = await auth();

  let subscription = null;
  let invoices: Awaited<ReturnType<typeof getInvoiceHistory>> = [];
  let org = null;

  if (orgId) {
    org = await db.query.organizationsTable.findFirst({
      where: eq(organizationsTable.clerkOrgId, orgId),
    });

    if (org?.stripeSubscriptionId) {
      subscription = await getSubscriptionDetails(org.stripeSubscriptionId);
    }

    if (org?.stripeCustomerId) {
      invoices = await getInvoiceHistory(org.stripeCustomerId, 5);
    }
  }

  const planDisplayName =
    org?.planTier === "domination"
      ? "Domination Plan"
      : org?.planTier === "growth"
      ? "Growth Plan"
      : "Starter Plan";

  const planFeatures: Record<string, string[]> = {
    starter: ["Up to 5 page revisions/month", "Basic analytics", "Email support"],
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
      "White-glove onboarding",
      "Custom development",
      "SLA guarantee",
      "24/7 priority support",
    ],
  };

  const features = planFeatures[org?.planTier ?? "starter"] ?? planFeatures.starter ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Billing & Subscriptions</h1>
        <p className="text-slate-400 mt-2">
          Manage your plan and billing information
        </p>
      </div>

      {/* Current Plan */}
      <Card className="p-8 border-blue-700 bg-blue-900/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-slate-400 mb-2">Current Plan</p>
            <h2 className="text-3xl font-bold text-white mb-2">
              {subscription?.planName ?? planDisplayName}
            </h2>
            {subscription ? (
              <>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-bold text-white">
                    {formatCurrency(subscription.amount)}
                  </span>
                  <span className="text-slate-400">per {subscription.interval}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      subscription.status === "active"
                        ? "bg-green-900/20 text-green-300 border border-green-700"
                        : "bg-yellow-900/20 text-yellow-300 border border-yellow-700"
                    }`}
                  >
                    {subscription.status}
                  </span>
                  {subscription.cancelAtPeriodEnd && (
                    <span className="text-xs text-yellow-400">Cancels at period end</span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  Next billing date:{" "}
                  {subscription.currentPeriodEnd.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-400 mb-6">
                {org?.stripeCustomerId
                  ? "No active subscription found"
                  : "No billing information on file"}
              </p>
            )}
            <form action={openBillingPortal}>
              <Button type="submit">
                Manage Billing
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-4">Plan Features</p>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-white text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Payment Method - managed via Stripe portal */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Payment Method</h2>
        <div className="bg-slate-700 rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Card on file</p>
            <p className="text-sm text-slate-300 mt-1">
              Manage your payment method through the billing portal
            </p>
          </div>
          <form action={openBillingPortal}>
            <Button type="submit" variant="outline">
              Update Card
            </Button>
          </form>
        </div>
      </Card>

      {/* Invoice History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Invoice History</h2>
        {invoices.length === 0 ? (
          <p className="text-slate-400 text-sm">No invoices found.</p>
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
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-700 hover:bg-slate-700/30"
                  >
                    <td className="py-3 px-4 text-white font-mono text-xs">
                      {invoice.number}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {invoice.date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-green-900/20 text-green-300 border border-green-700"
                            : invoice.status === "open"
                            ? "bg-yellow-900/20 text-yellow-300 border border-yellow-700"
                            : "bg-slate-700 text-slate-300 border border-slate-600"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {invoice.pdfUrl ? (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          <span>PDF</span>
                        </a>
                      ) : invoice.hostedUrl ? (
                        <a
                          href={invoice.hostedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View</span>
                        </a>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Billing FAQs */}
      <Card className="p-6 bg-slate-700/30">
        <h3 className="text-lg font-semibold text-white mb-4">Billing Questions?</h3>
        <p className="text-slate-300 text-sm">
          For questions about your billing or invoice, please contact our support
          team at billing@caliberwebstudio.com or use the message feature in your
          portal.
        </p>
      </Card>
    </div>
  );
}
