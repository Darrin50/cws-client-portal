import { Card } from "@/components/ui/card";

export default function FontsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Typography</h1>
        <p className="text-slate-400 mt-2">
          Font families and typographic guidelines
        </p>
      </div>

      {/* Heading Font */}
      <Card className="p-8">
        <h2 className="text-lg font-semibold text-white mb-4">Heading Font</h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-400 mb-2">Font Family</p>
            <p className="text-2xl font-bold text-white" style={{ fontFamily: "Inter" }}>
              Inter
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Sans-serif, modern and clean
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-400">Sample Sizes</p>
            <div className="space-y-2">
              <div style={{ fontFamily: "Inter" }} className="font-bold text-4xl text-white">
                H1: Display Heading
              </div>
              <p className="text-xs text-slate-500">
                32px Bold, used for page titles
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <div style={{ fontFamily: "Inter" }} className="font-bold text-3xl text-white">
                H2: Section Heading
              </div>
              <p className="text-xs text-slate-500">
                24px Bold, used for sections
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <div style={{ fontFamily: "Inter" }} className="font-bold text-2xl text-white">
                H3: Subsection Heading
              </div>
              <p className="text-xs text-slate-500">
                20px Bold, used for subsections
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Body Font */}
      <Card className="p-8">
        <h2 className="text-lg font-semibold text-white mb-4">Body Font</h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-400 mb-2">Font Family</p>
            <p className="text-xl font-semibold text-white" style={{ fontFamily: "Inter" }}>
              Inter
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Sans-serif, excellent for readability
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-400">Sample Sizes</p>
            <div className="space-y-2">
              <p style={{ fontFamily: "Inter" }} className="text-base text-white">
                16px Regular: Body text for paragraphs and longer form content.
                This is the standard size for most readable content on web pages.
              </p>
              <p className="text-xs text-slate-500">Regular weight</p>
            </div>
            <div className="mt-4 space-y-2">
              <p style={{ fontFamily: "Inter" }} className="text-sm text-white">
                14px Regular: Smaller body text for secondary content and
                descriptions.
              </p>
              <p className="text-xs text-slate-500">Regular weight</p>
            </div>
            <div className="mt-4 space-y-2">
              <p style={{ fontFamily: "Inter" }} className="text-xs text-white">
                12px Regular: Labels, captions, and meta information.
              </p>
              <p className="text-xs text-slate-500">Regular weight</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Font Weights */}
      <Card className="p-8">
        <h2 className="text-lg font-semibold text-white mb-4">Font Weights</h2>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Light</span>
            <span style={{ fontFamily: "Inter", fontWeight: 300 }} className="text-white">
              300 - Use sparingly for very large text
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Regular</span>
            <span style={{ fontFamily: "Inter", fontWeight: 400 }} className="text-white">
              400 - Standard weight for body text
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Medium</span>
            <span style={{ fontFamily: "Inter", fontWeight: 500 }} className="text-white">
              500 - Emphasis within body text
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Semi Bold</span>
            <span style={{ fontFamily: "Inter", fontWeight: 600 }} className="text-white">
              600 - Subheadings and labels
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Bold</span>
            <span style={{ fontFamily: "Inter", fontWeight: 700 }} className="text-white">
              700 - Headings and emphasis
            </span>
          </div>
        </div>
      </Card>

      {/* Spacing Guidelines */}
      <Card className="p-8 bg-blue-900/10 border-blue-700">
        <h2 className="text-lg font-semibold text-white mb-4">
          Line Height & Spacing
        </h2>
        <ul className="space-y-3 text-sm text-slate-300">
          <li>
            <strong>Line Height for Headings:</strong> 1.2 (compact, powerful)
          </li>
          <li>
            <strong>Line Height for Body Text:</strong> 1.6 (spacious, readable)
          </li>
          <li>
            <strong>Letter Spacing:</strong> Default, no additional tracking
            needed
          </li>
          <li>
            <strong>Paragraph Spacing:</strong> 24px between paragraphs
          </li>
        </ul>
      </Card>
    </div>
  );
}
