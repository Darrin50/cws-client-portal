import type { Metadata } from 'next';
import Link from "next/link";
import { CreditCard, Users, Bell, Building2, Paintbrush, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: 'Settings | CWS Portal',
  description: 'Manage your account settings, billing, team members, and notifications.',
};

const settingsSections = [
  {
    id: "billing",
    title: "Billing & Plan",
    description: "Manage your subscription and payments",
    icon: CreditCard,
    href: "/settings/billing",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "business",
    title: "Business Info",
    description: "Update your business details",
    icon: Building2,
    href: "/settings/business",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "team",
    title: "Team Members",
    description: "Invite your team to view the portal",
    icon: Users,
    href: "/settings/team",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Choose how you want to be notified",
    icon: Bell,
    href: "/settings/notifications",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    id: "white-label",
    title: "White Label",
    description: "Custom branding — logo, colors, domain",
    icon: Paintbrush,
    href: "/settings/white-label",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
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
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
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
            DS
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Darrin Singer</p>
            <p className="text-sm text-slate-500">singerdarrin50.ds@gmail.com</p>
          </div>
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            Growth Plan
          </span>
        </div>
      </div>
    </div>
  );
}
