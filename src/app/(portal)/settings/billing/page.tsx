import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Download } from "lucide-react";

// TODO: Replace with real data fetch
const currentPlan = {
  name: "Growth Plan",
  price: "$197",
  interval: "month",
  features: [
    "Unlimited page revisions",
    "Advanced analytics",
    "Social media management",
    "Priority support",
    "Custom integrations",
    "Team collaboration",
  ],
};

const paymentMethod = {
  brand: "Visa",
  last4: "4242",
  expiry: "12/26",
};

// TODO: Replace with real data fetch
const invoices = [
  {
    id: "INV-2026-04",
    date: "April 1, 2026",
    amount: "$197.00",
    status: "paid",
  },
  {
    id: "INV-2026-03",
    date: "March 1, 2026",
    amount: "$197.00",
    status: "paid",
  },
  {
    id: "INV-2026-02",
    date: "February 1, 2026",
    amount: "$197.00",
    status: "paid",
  },
  {
    id: "INV-2026-01",
    date: "January 1, 2026",
    amount: "$197.00",
    status: "paid",
  },
];

export default function BillingPage() {
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
              {currentPlan.name}
            </h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-white">
                {currentPlan.price}
              </span>
              <span className="text-slate-400">per {currentPlan.interval}</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Next billing date: May 6, 2026
            </p>
            <Button>Manage Billing</Button>
          </div>

          <div>
            <p className="text-sm text-slate-400 mb-4">Plan Features</p>
            <ul className="space-y-3">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
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
        <h2 className="text-lg font-semibold text-white mb-4">
          Payment Method
        </h2>
        <div className="bg-slate-700 rounded-lg p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Card on file</p>
            <p className="text-lg font-semibold text-white mt-1">
              {paymentMethod.brand} ending in {paymentMethod.last4}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Expires {paymentMethod.expiry}
            </p>
          </div>
          <Button variant="outline">Update Card</Button>
        </div>
      </Card>

      {/* Invoice History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Invoice History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Invoice
                </th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-slate-700 hover:bg-slate-700/30"
                >
                  <td className="py-3 px-4 text-white">{invoice.id}</td>
                  <td className="py-3 px-4 text-slate-300">{invoice.date}</td>
                  <td className="py-3 px-4 text-white font-semibold">
                    {invoice.amount}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-300 border border-green-700">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Billing FAQs */}
      <Card className="p-6 bg-slate-700/30">
        <h3 className="text-lg font-semibold text-white mb-4">
          Billing Questions?
        </h3>
        <p className="text-slate-300 text-sm">
          For questions about your billing or invoice, please contact our support
          team at billing@caliberwebstudio.com or use the message feature in your
          portal.
        </p>
      </Card>
    </div>
  );
}
