"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface ColorAsset {
  id: string;
  name: string;
  metadata: { hex?: string; rgb?: string } | null;
}

function ColorSwatch({ color }: { color: ColorAsset }) {
  const [copied, setCopied] = useState("");
  const hex = color.metadata?.hex ?? "#000000";
  const rgb = color.metadata?.rgb ?? "";

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-32 w-full" style={{ backgroundColor: hex }} />
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">{color.name}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 rounded px-3 py-2">
            <span className="font-mono text-slate-700 dark:text-slate-300">{hex}</span>
            <button
              onClick={() => handleCopy(hex, "hex")}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {copied === "hex" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {rgb && (
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 rounded px-3 py-2">
              <span className="font-mono text-slate-700 dark:text-slate-300">{rgb}</span>
              <button
                onClick={() => handleCopy(rgb, "rgb")}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {copied === "rgb" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function ColorsPage() {
  const [colors, setColors] = useState<ColorAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/brand-assets?assetType=color")
      .then((r) => r.json())
      .then((data) => setColors(data.data?.assets ?? []))
      .finally(() => setLoading(false));
  }, []);

  const exportJSON = () => {
    const obj = Object.fromEntries(
      colors.map((c) => [c.name, { hex: c.metadata?.hex, rgb: c.metadata?.rgb }]),
    );
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brand-colors.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSS = () => {
    const vars = colors
      .map((c) => `  --color-${c.name.toLowerCase().replace(/\s+/g, "-")}: ${c.metadata?.hex ?? ""};`)
      .join("\n");
    const css = `:root {\n${vars}\n}`;
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brand-colors.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Brand Colors</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Complete color palette with hex and RGB values</p>
      </div>

      {loading ? (
        <p className="text-slate-600 dark:text-slate-400">Loading…</p>
      ) : colors.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">No brand colors have been added yet. Contact your CWS team to add your palette.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {colors.map((color) => (
            <ColorSwatch key={color.id} color={color} />
          ))}
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Color Usage Guidelines</h2>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Primary Color</h3>
            <p>Use the primary brand color for buttons, links, and key interface elements.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Status Colors</h3>
            <p>Use success/warning/danger colors only for status indicators and alerts.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Neutral Colors</h3>
            <p>Neutral tones work best for text, dividers, and background fills.</p>
          </div>
        </div>
      </Card>

      {colors.length > 0 && (
        <div className="flex gap-3">
          <Button className="flex-1" onClick={exportJSON}>Export as JSON</Button>
          <Button variant="outline" className="flex-1" onClick={exportCSS}>Export as CSS</Button>
        </div>
      )}
    </div>
  );
}
