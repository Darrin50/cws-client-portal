import Link from "next/link";
import { FileText, Palette, Type, Image, Zap, ArrowRight } from "lucide-react";

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
  },
  {
    id: "colors",
    title: "Colors",
    description: "Brand palette and color codes",
    count: "8 colors",
    icon: Palette,
    href: "/brand/colors",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    id: "fonts",
    title: "Typography",
    description: "Font families and usage guidelines",
    count: "2 fonts",
    icon: Type,
    href: "/brand/fonts",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    id: "photos",
    title: "Photos",
    description: "Brand imagery and photo library",
    count: "24 images",
    icon: Image,
    href: "/brand/photos",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
  {
    id: "guidelines",
    title: "Brand Guidelines",
    description: "Complete brand style guide and rules",
    count: "1 document",
    icon: Zap,
    href: "/brand/guidelines",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
];

export default function BrandPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 scroll-m-0 border-0 pb-0 tracking-normal">
          Brand Assets
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your brand identity, logos, colors, and guidelines
        </p>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors scroll-m-0 border-0 pb-0 tracking-normal text-base">
                        {section.title}
                      </h3>
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {section.count}
                      </span>
                    </div>
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

      {/* Guidelines Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900 scroll-m-0 border-0 pb-0 tracking-normal text-base">
              Brand Guidelines Document
            </h3>
            <p className="text-sm text-slate-600 mt-1 max-w-md">
              Keep your brand consistent across all platforms. Download the
              complete brand guidelines for detailed usage rules, spacing
              requirements, and color specifications.
            </p>
          </div>
          <a
            href="#"
            className="flex-shrink-0 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 no-underline whitespace-nowrap"
          >
            Download PDF →
          </a>
        </div>
      </div>
    </div>
  );
}
