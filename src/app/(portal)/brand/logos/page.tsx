"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2 } from "lucide-react";
import { useState, useRef } from "react";

// TODO: Replace with real data fetch
const mockLogos = [
  {
    id: "primary",
    name: "Primary Logo",
    description: "Main logo for primary usage",
    current: "/api/placeholder/200/100",
  },
  {
    id: "secondary",
    name: "Secondary Logo",
    description: "Alternative logo for compact spaces",
    current: null,
  },
  {
    id: "icon",
    name: "Icon / Mark",
    description: "Standalone icon without wordmark",
    current: "/api/placeholder/100/100",
  },
  {
    id: "favicon",
    name: "Favicon",
    description: "Browser tab icon (32x32px)",
    current: "/api/placeholder/32/32",
  },
];

function LogoSlot({
  logo,
  onUpload,
}: {
  logo: (typeof mockLogos)[0];
  onUpload: (id: string, file: File) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(logo.id, e.target.files[0]);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-white mb-1">{logo.name}</h3>
      <p className="text-sm text-slate-400 mb-4">{logo.description}</p>

      {logo.current ? (
        <div className="mb-4 bg-slate-700 rounded-lg p-4 flex items-center justify-center min-h-32">
          <img
            src={logo.current}
            alt={logo.name}
            className="max-h-32 max-w-full"
          />
        </div>
      ) : (
        <div className="mb-4 bg-slate-700 rounded-lg p-4 flex items-center justify-center min-h-32">
          <p className="text-slate-500 text-sm">No file uploaded</p>
        </div>
      )}

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.svg"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
        {logo.current && (
          <>
            <Button variant="outline" className="w-full" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              className="w-full text-red-400 hover:text-red-300"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

export default function LogosPage() {
  const [logos, setLogos] = useState(mockLogos);

  const handleUpload = (id: string, file: File) => {
    console.log(`Uploading ${file.name} for logo ${id}`);
    // TODO: Implement real upload via server action
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Logo Files</h1>
        <p className="text-slate-400 mt-2">
          Manage your brand logos and visual identity marks
        </p>
      </div>

      {/* Logo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {logos.map((logo) => (
          <LogoSlot key={logo.id} logo={logo} onUpload={handleUpload} />
        ))}
      </div>

      {/* Upload Guidelines */}
      <Card className="p-6 bg-blue-900/10 border-blue-700">
        <h3 className="font-semibold text-white mb-3">Upload Guidelines</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>
            <strong>Format:</strong> PNG, SVG, or PDF (SVG preferred for
            scalability)
          </li>
          <li>
            <strong>Primary Logo:</strong> Minimum 200x100px, transparent
            background
          </li>
          <li>
            <strong>Icon:</strong> Square format (100x100px minimum)
          </li>
          <li>
            <strong>Favicon:</strong> 32x32px or 64x64px PNG
          </li>
          <li>
            <strong>File Size:</strong> Keep under 500KB per file
          </li>
        </ul>
      </Card>
    </div>
  );
}
