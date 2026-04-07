"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type LogoSlotKey = "primary_logo" | "secondary_logo" | "icon" | "favicon";

interface BrandAsset {
  id: string;
  assetType: LogoSlotKey;
  name: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
}

const LOGO_SLOTS: Array<{
  key: LogoSlotKey;
  name: string;
  description: string;
}> = [
  { key: "primary_logo", name: "Primary Logo", description: "Main logo for primary usage" },
  { key: "secondary_logo", name: "Secondary Logo", description: "Alternative logo for compact spaces" },
  { key: "icon", name: "Icon / Mark", description: "Standalone icon without wordmark" },
  { key: "favicon", name: "Favicon", description: "Browser tab icon (32x32px)" },
];

function LogoSlot({
  slot,
  asset,
  onUpload,
  onDelete,
}: {
  slot: (typeof LOGO_SLOTS)[0];
  asset: BrandAsset | undefined;
  onUpload: (assetType: LogoSlotKey, file: File) => void;
  onDelete: (id: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(slot.key, e.target.files[0]);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{slot.name}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{slot.description}</p>

      {asset?.fileUrl ? (
        <div className="mb-4 bg-slate-700 rounded-lg p-4 flex items-center justify-center min-h-32">
          <div className="relative w-full h-32">
            <Image
              src={asset.fileUrl}
              alt={slot.name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
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
        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
        {asset?.fileUrl && (
          <>
            <a
              href={asset.fileUrl}
              download={asset.fileName ?? slot.name}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-9 px-3 w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </a>
            <Button
              variant="outline"
              className="w-full text-red-400 hover:text-red-300"
              size="sm"
              onClick={() => onDelete(asset.id)}
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
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    try {
      const res = await fetch("/api/brand-assets?assetType=primary_logo");
      const allLogos: BrandAsset[] = [];

      // Fetch each logo type separately
      const types: LogoSlotKey[] = ["primary_logo", "secondary_logo", "icon", "favicon"];
      await Promise.all(
        types.map(async (type) => {
          const r = await fetch(`/api/brand-assets?assetType=${type}`);
          if (r.ok) {
            const data = await r.json();
            allLogos.push(...(data.data?.assets ?? []));
          }
        }),
      );
      setAssets(allLogos);
    } finally {
      setLoading(false);
    }
  }

  const handleUpload = async (assetType: LogoSlotKey, file: File) => {
    // Upload via UploadThing or direct presigned URL is handled elsewhere;
    // here we create the asset record with a data URL as a placeholder until
    // the upload pipeline is wired. For now we POST the asset metadata.
    const formData = new FormData();
    formData.append("file", file);

    // Persist record via brand-assets API
    const res = await fetch("/api/brand-assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assetType,
        name: file.name,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        // fileUrl will be set after upload pipeline runs
      }),
    });

    if (res.ok) {
      await fetchAssets();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/brand-assets/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAssets((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Logo Files</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Manage your brand logos and visual identity marks</p>
      </div>

      {loading ? (
        <p className="text-slate-600 dark:text-slate-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {LOGO_SLOTS.map((slot) => (
            <LogoSlot
              key={slot.key}
              slot={slot}
              asset={assets.find((a) => a.assetType === slot.key)}
              onUpload={handleUpload}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Upload Guidelines</h3>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li><strong>Format:</strong> PNG, SVG, or PDF (SVG preferred for scalability)</li>
          <li><strong>Primary Logo:</strong> Minimum 200x100px, transparent background</li>
          <li><strong>Icon:</strong> Square format (100x100px minimum)</li>
          <li><strong>Favicon:</strong> 32x32px or 64x64px PNG</li>
          <li><strong>File Size:</strong> Keep under 500KB per file</li>
        </ul>
      </Card>
    </div>
  );
}
