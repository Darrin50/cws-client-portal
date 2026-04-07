"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Pencil, X } from "lucide-react";
import { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ColorDef {
  name: string;
  hex: string;
}

interface EditablePalette {
  primary: ColorDef[];
  secondary: ColorDef[];
  typography: {
    heading: string;
    body: string;
    muted: string;
  };
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_PALETTE: EditablePalette = {
  primary: [
    { name: "Brand Teal", hex: "#14B8A6" },
    { name: "Navy", hex: "#0F172A" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Slate", hex: "#64748B" },
  ],
  secondary: [
    { name: "Amber", hex: "#F59E0B" },
    { name: "Green", hex: "#10B981" },
    { name: "Red", hex: "#EF4444" },
    { name: "Purple", hex: "#8B5CF6" },
  ],
  typography: {
    heading: "#0F172A",
    body: "#334155",
    muted: "#64748B",
  },
};

const LS_KEY = "cws_brand_palette";

function loadPalette(): EditablePalette {
  if (typeof window === "undefined") return DEFAULT_PALETTE;
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) return JSON.parse(stored) as EditablePalette;
  } catch {
    // ignore
  }
  return DEFAULT_PALETTE;
}

// ── Swatch Card ───────────────────────────────────────────────────────────────

function SwatchCard({ name, hex }: { name: string; hex: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Decide whether the swatch needs a border (for near-white colors)
  const needsBorder = hex.toUpperCase() === "#FFFFFF" || hex.toUpperCase() === "#FAFAF9";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Color swatch */}
      <div
        className={`h-32 w-full ${needsBorder ? "border-b border-slate-200" : ""}`}
        style={{ backgroundColor: hex }}
      />
      {/* Info */}
      <div className="p-4 space-y-2">
        <p className="font-semibold text-slate-700 text-sm">{name}</p>
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-3 py-1.5">
          <span className="font-mono text-xs text-slate-500">{hex}</span>
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-slate-700 transition-colors ml-2"
            aria-label={`Copy ${hex}`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Typography Preview ────────────────────────────────────────────────────────

function TypographyRow({
  label,
  colorHex,
  sampleText,
}: {
  label: string;
  colorHex: string;
  sampleText: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(colorHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
      <div
        className="w-6 h-6 rounded flex-shrink-0 border border-slate-200"
        style={{ backgroundColor: colorHex }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm font-semibold" style={{ color: colorHex }}>
          {sampleText}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-slate-500">{colorHex}</span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-700 transition-colors"
          aria-label={`Copy ${colorHex}`}
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function EditModal({
  palette,
  onSave,
  onClose,
}: {
  palette: EditablePalette;
  onSave: (p: EditablePalette) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<EditablePalette>(
    JSON.parse(JSON.stringify(palette))
  );

  const updatePrimary = (i: number, field: keyof ColorDef, val: string) => {
    setDraft((prev) => {
      const primary = [...prev.primary];
      primary[i] = { ...primary[i], [field]: val };
      return { ...prev, primary };
    });
  };

  const updateSecondary = (i: number, field: keyof ColorDef, val: string) => {
    setDraft((prev) => {
      const secondary = [...prev.secondary];
      secondary[i] = { ...secondary[i], [field]: val };
      return { ...prev, secondary };
    });
  };

  const updateTypo = (key: keyof EditablePalette["typography"], val: string) => {
    setDraft((prev) => ({ ...prev, typography: { ...prev.typography, [key]: val } }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Edit Brand Colors</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Primary */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Primary Colors</h3>
            <div className="space-y-3">
              {draft.primary.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => updatePrimary(i, "hex", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updatePrimary(i, "name", e.target.value)}
                    placeholder="Color name"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    value={c.hex}
                    onChange={(e) => updatePrimary(i, "hex", e.target.value)}
                    placeholder="#000000"
                    className="w-28 font-mono border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Secondary */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Secondary Colors</h3>
            <div className="space-y-3">
              {draft.secondary.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => updateSecondary(i, "hex", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateSecondary(i, "name", e.target.value)}
                    placeholder="Color name"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    value={c.hex}
                    onChange={(e) => updateSecondary(i, "hex", e.target.value)}
                    placeholder="#000000"
                    className="w-28 font-mono border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Typography Colors</h3>
            <div className="space-y-3">
              {(
                [
                  { key: "heading" as const, label: "Heading" },
                  { key: "body" as const, label: "Body" },
                  { key: "muted" as const, label: "Muted" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={draft.typography[key]}
                    onChange={(e) => updateTypo(key, e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-slate-200"
                  />
                  <span className="flex-1 text-sm text-slate-700">{label} Text</span>
                  <input
                    type="text"
                    value={draft.typography[key]}
                    onChange={(e) => updateTypo(key, e.target.value)}
                    placeholder="#000000"
                    className="w-28 font-mono border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200">
          <Button onClick={() => onSave(draft)} className="flex-1">
            Save Colors
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ColorsPage() {
  const [palette, setPalette] = useState<EditablePalette>(DEFAULT_PALETTE);
  const [showEdit, setShowEdit] = useState(false);
  const [apiColors, setApiColors] = useState<{ name: string; hex: string }[]>([]);

  useEffect(() => {
    setPalette(loadPalette());
    // Try to load API colors too
    fetch("/api/brand-assets?assetType=color")
      .then((r) => r.json())
      .then((data) => {
        const assets = data.data?.assets ?? [];
        if (assets.length > 0) {
          setApiColors(
            assets.map((a: { name: string; metadata?: { hex?: string } }) => ({
              name: a.name,
              hex: a.metadata?.hex ?? "#000000",
            }))
          );
        }
      })
      .catch(() => {/* use defaults */});
  }, []);

  const handleSave = (p: EditablePalette) => {
    setPalette(p);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(p));
    } catch {
      // ignore
    }
    setShowEdit(false);
  };

  const exportCSS = () => {
    const lines: string[] = [];
    palette.primary.forEach((c) =>
      lines.push(`  --color-${c.name.toLowerCase().replace(/\s+/g, "-")}: ${c.hex};`)
    );
    palette.secondary.forEach((c) =>
      lines.push(`  --color-${c.name.toLowerCase().replace(/\s+/g, "-")}: ${c.hex};`)
    );
    lines.push(`  --color-heading: ${palette.typography.heading};`);
    lines.push(`  --color-body: ${palette.typography.body};`);
    lines.push(`  --color-muted: ${palette.typography.muted};`);
    const css = `:root {\n${lines.join("\n")}\n}`;
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brand-colors.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayPrimary = apiColors.length > 0 ? apiColors.slice(0, 4) : palette.primary;
  const displaySecondary = apiColors.length > 4 ? apiColors.slice(4) : palette.secondary;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Brand Colors</h1>
          <p className="text-slate-600 mt-2">Your complete color palette with hex values</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <Pencil className="w-4 h-4" />
          Edit Brand Colors
        </Button>
      </div>

      {/* Primary Colors */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Primary Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayPrimary.map((c) => (
            <SwatchCard key={c.name} name={c.name} hex={c.hex} />
          ))}
        </div>
      </section>

      {/* Secondary Colors */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Secondary Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displaySecondary.map((c) => (
            <SwatchCard key={c.name} name={c.name} hex={c.hex} />
          ))}
        </div>
      </section>

      {/* Typography Colors */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Typography Colors</h2>
        <Card className="p-6">
          <TypographyRow
            label="Heading Text"
            colorHex={palette.typography.heading}
            sampleText="Heading Text — The quick brown fox"
          />
          <TypographyRow
            label="Body Text"
            colorHex={palette.typography.body}
            sampleText="Body Text — The quick brown fox jumps"
          />
          <TypographyRow
            label="Muted Text"
            colorHex={palette.typography.muted}
            sampleText="Muted Text — Supporting information"
          />
        </Card>
      </section>

      {/* Usage Guidelines */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Color Usage Guidelines</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Primary Colors</h3>
            <p>Use for buttons, links, key UI elements, and brand-forward sections.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Secondary Colors</h3>
            <p>Use for status indicators, alerts, and supporting accents.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-1">Typography Colors</h3>
            <p>Stick to these for all readable text to maintain accessibility.</p>
          </div>
        </div>
      </Card>

      {/* Export */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={exportCSS}>Export as CSS Variables</Button>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <EditModal
          palette={palette}
          onSave={handleSave}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
