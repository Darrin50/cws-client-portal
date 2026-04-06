import { Card } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Palette, Type, Image, Zap } from "lucide-react";

const sections = [
  {
    id: "logos",
    title: "Logos",
    description: "Primary, secondary, icon, and favicon",
    icon: FileText,
    href: "/brand/logos",
  },
  {
    id: "colors",
    title: "Colors",
    description: "Brand palette and color codes",
    icon: Palette,
    href: "/brand/colors",
  },
  {
    id: "fonts",
    title: "Typography",
    description: "Font families and usage guidelines",
    icon: Type,
    href: "/brand/fonts",
  },
  {
    id: "photos",
    title: "Photos",
    description: "Brand imagery and photo library",
    icon: Image,
    href: "/brand/photos",
  },
  {
    id: "guidelines",
    title: "Brand Guidelines",
    description: "Complete brand style guide and rules",
    icon: Zap,
    href: "/brand/guidelines",
  },
];

export default function BrandPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Brand Assets</h1>
        <p className="text-slate-400 mt-2">
          Manage your brand identity, logos, colors, and guidelines
        </p>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} href={section.href}>
              <Card className="p-6 hover:border-blue-500 transition-colors cursor-pointer h-full group">
                <div className="flex items-start gap-4">
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
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Info */}
      <Card className="p-6 bg-blue-900/10 border-blue-700">
        <h3 className="font-semibold text-white mb-2">Brand Guidelines</h3>
        <p className="text-sm text-slate-300">
          Keep your brand consistent across all platforms. Download our complete
          brand guidelines document for detailed usage rules, spacing requirements,
          and color specifications.
        </p>
        <a href="#" className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-3 inline-block">
          Download PDF Guide →
        </a>
      </Card>
    </div>
  );
}
