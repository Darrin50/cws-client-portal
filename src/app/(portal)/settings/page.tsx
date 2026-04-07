import Link from "next/link";
import { CreditCard, Users, Bell, Building2, ArrowRight } from "lucide-react";

const settingsSections = [
  {
    id: "billing",
    title: "Billing & Subscriptions",
    description: "Manage your plan, payment methods, and invoices",
    icon: CreditCard,
    href: "/settings/billing",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "business",
    title: "Business Information",
    description: "Update your company details and contact info",
    icon: Building2,
    href: "/settings/business",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "team",
    title: "Team Members",
    description: "Manage your team and invite new members",
    icon: Users,
    href: "/settings/team",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Control how and when you receive updates",
    icon: Bell,
    href: "/settings/notifications",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 scroll-m-0 border-0 pb-0 tracking-normal">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} href={section.href} className="no-underline">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 p-5 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-full ${section.iconBg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${section.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors scroll-m-0 border-0 pb-0 tracking-normal text-base">
                      {section.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {section.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
            DM
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Darrin Mitchell</p>
            <p className="text-sm text-slate-500">darrin@business.com</p>
          </div>
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            Growth Plan
          </span>
        </div>
      </div>
    </div>
  );
}
