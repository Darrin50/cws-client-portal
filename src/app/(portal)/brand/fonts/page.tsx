"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface FontAsset {
  id: string;
  name: string;
  metadata: {
    family?: string;
    category?: string;
    weights?: number[];
    usageType?: "heading" | "body" | "both";
  } | null;
}

function FontCard({ font }: { font: FontAsset }) {
  const family = font.metadata?.family ?? font.name;
  const weights = font.metadata?.weights ?? [400, 700];
  const category = font.metadata?.category ?? "sans-serif";
  const usageType = font.metadata?.usageType ?? "both";

  return (
    <Card className="p-8">
      <h2 className="text-lg font-semibold text-white mb-4 capitalize">
        {usageType === "heading" ? "Heading Font" : usageType === "body" ? "Body Font" : `Font — ${font.name}`}
      </h2>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-slate-400 mb-2">Font Family</p>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: family }}>{family}</p>
          <p className="text-xs text-slate-500 mt-1">{category}</p>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-slate-400">Font Weights</p>
          {weights.map((w) => (
            <div key={w} className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">{w}</span>
              <span style={{ fontFamily: family, fontWeight: w }} className="text-white text-sm">
                The quick brown fox — {w}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function FontsPage() {
  const [fonts, setFonts] = useState<FontAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/brand-assets?assetType=font")
      .then((r) => r.json())
      .then((data) => setFonts(data.data?.assets ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Typography</h1>
        <p className="text-slate-400 mt-2">Font families and typographic guidelines</p>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : fonts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-400">No fonts have been configured yet. Contact your CWS team to set up your typography.</p>
        </Card>
      ) : (
        fonts.map((font) => <FontCard key={font.id} font={font} />)
      )}

      <Card className="p-8 bg-blue-900/10 border-blue-700">
        <h2 className="text-lg font-semibold text-white mb-4">Line Height &amp; Spacing</h2>
        <ul className="space-y-3 text-sm text-slate-300">
          <li><strong>Line Height for Headings:</strong> 1.2 (compact, powerful)</li>
          <li><strong>Line Height for Body Text:</strong> 1.6 (spacious, readable)</li>
          <li><strong>Letter Spacing:</strong> Default — no additional tracking needed</li>
          <li><strong>Paragraph Spacing:</strong> 24px between paragraphs</li>
        </ul>
      </Card>
    </div>
  );
}
