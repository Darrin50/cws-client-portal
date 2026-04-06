import { Card } from "@/components/ui/card";
import Link from "next/link";
import { CreditCard, Users, Bell, Building2, ArrowRight } from "lucide-react";

const settingsSections = [
  {
    id: "billing",
    title: "Billing & Subscriptions",
    description: "Manage your plan, payment methods, and invoices",
    icon: CreditCard,
    href: "/settings/billing",
  },
  {
    id: "business",
    title: "Business Information",
    description: "Update your company details and contact info",
    icon: Building2,
    href: "/settings/business",
  },
  {
    id: "team",
    title: "Team Members",
    description: "Manage your team and invite new members",
    icon: Users,
    href: "/settings/team",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Control how and when you receive updates",
    icon: Bell,
    href: "/settings/notifications",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} href={section.href}>
              <Card className="p-6 hover:border-blue-500 transition-colors cursor-pointer h-full group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-blue-900/20 rounded-lg group-hover:bg-blue-900/30 transition-colors">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors mt-1 flex-shrink-0" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
