"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

// TODO: Replace with real data fetch
const mockColors = [
  { name: "Primary Blue", hex: "#2563EB", rgb: "rgb(37, 99, 235)" },
  { name: "Secondary Purple", hex: "#7C3AED", rgb: "rgb(124, 58, 237)" },
  { name: "Success Green", hex: "#10B981", rgb: "rgb(16, 185, 129)" },
  { name: "Warning Orange", hex: "#F59E0B", rgb: "rgb(245, 158, 11)" },
  { name: "Danger Red", hex: "#EF4444", rgb: "rgb(239, 68, 68)" },
  { name: "Neutral Gray", hex: "#6B7280", rgb: "rgb(107, 114, 128)" },
  { name: "Dark Slate", hex: "#1E293B", rgb: "rgb(30, 41, 59)" },
  { name: "Light Gray", hex: "#F3F4F6", rgb: "rgb(243, 244, 246)" },
];

function ColorSwatch({
  color,
}: {
  color: (typeof mockColors)[0];
}) {
  const [copied, setCopied] = useState("");

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <Card className="overflow-hidden">
      <div
        className="h-32 w-full"
        style={{ backgroundColor: color.hex }}
      />
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-white">{color.name}</h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between bg-slate-700 rounded px-3 py-2">
            <span className="font-mono text-slate-300">{color.hex}</span>
            <button
              onClick={() => handleCopy(color.hex, "hex")}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {copied === "hex" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-700 rounded px-3 py-2">
            <span className="font-mono text-slate-300">{color.rgb}</span>
            <button
              onClick={() => handleCopy(color.rgb, "rgb")}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {copied === "rgb" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function ColorsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Brand Colors</h1>
        <p className="text-slate-400 mt-2">
          Complete color palette with hex and RGB values
        </p>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockColors.map((color) => (
          <ColorSwatch key={color.hex} color={color} />
        ))}
      </div>

      {/* Usage Guidelines */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Color Usage Guidelines
        </h2>
        <div className="space-y-4 text-sm text-slate-300">
          <div>
            <h3 className="font-semibold text-white mb-2">Primary Color</h3>
            <p>
              Use the Primary Blue (#2563EB) as the main brand color for buttons,
              links, and key interface elements.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Secondary Colors</h3>
            <p>
              Secondary Purple can be used for accents and supporting elements to
              add visual interest and hierarchy.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Status Colors</h3>
            <p>
              Use Success Green, Warning Orange, and Danger Red only for status
              indicators and alerts. Never use them as primary UI colors.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Neutral Colors</h3>
            <p>
              Neutral Gray is for text and dividers. Use Dark Slate for text on
              light backgrounds and Light Gray for text on dark backgrounds.
            </p>
          </div>
        </div>
      </Card>

      {/* Export */}
      <div className="flex gap-3">
        <Button className="flex-1">Export as JSON</Button>
        <Button variant="outline" className="flex-1">
          Export as CSS
        </Button>
      </div>
    </div>
  );
}
