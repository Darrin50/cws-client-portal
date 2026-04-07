import type { Metadata } from 'next';
import Link from "next/link";
import { FileText, Palette, Image, Calendar, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: 'My Brand | CWS Portal',
  description: 'Manage your brand assets — logos, colors, fonts, and photos — in your Caliber Web Studio client portal.',
};

const sections = [
  {
    id: "logos",
    title: "Logos",
    description: "Primary, secondary, icon, and favicon",
    count: "3 files",
    icon: FileText,
    href: "/brand/logos",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    swatches: null,
  },
  {
    id: "colors",
    title: "Colors",
    description: "Your brand palette and color codes",
    count: "8 colors",
    icon: Palette,
    href: "/brand/colors",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    swatches: ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444"],
  },
  {
    id: "files",
    title: "Photos & Files",
    description: "Brand imagery, photos, and guidelines",
    count: "25 items",
    icon: Image,
    href: "/brand/photos",
    iconBg: "bg-blue-100",
    iconColor: "text-[#2563eb]",
    swatches: null,
  },
  {
    id: "calendar",
    title: "Content Calendar",
    description: "Schedule and plan social media posts",
    count: "Monthly view",
    icon: Calendar,
    href: "/brand/calendar",
    iconBg: "bg-teal-100",
    iconColor: "text-[#0d9488]",
    swatches: null,
  },
];

export default function BrandPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 scroll-m-0 border-0 pb-0 tracking-normal">
          Your Brand
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Your logos, colors, and brand files &mdash; all in one place
        </p>
      </div>

      {/* Sections Grid */}
      {sections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.id} href={section.href} className="no-underline">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 p-6 cursor-pointer group h-full">
                  <div
                    className={`w-12 h-12 rounded-full ${section.iconBg} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-6 h-6 ${section.iconColor}`} />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors scroll-m-0 border-0 pb-0 tracking-normal text-lg">
                      {section.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-sm text-slate-600">{section.description}</p>
                  <span className="inline-block text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full mt-3">
                    {section.count}
                  </span>
                  {section.swatches && (
                    <div className="flex gap-1.5 mt-3">
                      {section.swatches.map((color) => (
                        <div
                          key={color}
                          className="w-5 h-5 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <Palette className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            Your brand files will live here.
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Your CWS team will add your logos and colors.
          </p>
        </div>
      )}
    </div>
  );
}
