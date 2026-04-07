'use client';

import { useState, useCallback } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Platform {
  id: string;
  label: string;
  shortLabel: string;
  width: number;
  height: number;
}

const PLATFORMS: Platform[] = [
  { id: 'ig_post',   label: 'Instagram Post',  shortLabel: 'IG Post',   width: 1080, height: 1080 },
  { id: 'ig_story',  label: 'Instagram Story', shortLabel: 'IG Story',  width: 1080, height: 1920 },
  { id: 'facebook',  label: 'Facebook Post',   shortLabel: 'FB',        width: 1200, height:  630 },
  { id: 'twitter',   label: 'Twitter / X',     shortLabel: 'Twitter',   width: 1200, height:  675 },
  { id: 'linkedin',  label: 'LinkedIn',        shortLabel: 'LinkedIn',  width: 1200, height:  627 },
  { id: 'tiktok',    label: 'TikTok Cover',    shortLabel: 'TikTok',    width: 1080, height: 1920 },
];

interface ResizedImage {
  platform: Platform;
  dataUrl: string;
}

interface SocialResizerProps {
  imageUrl: string;
  imageName: string;
  onClose: () => void;
}

/** Center-crop source image onto a canvas of the given dimensions. */
function resizeToCanvas(img: HTMLImageElement, width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const srcAspect = img.width / img.height;
  const dstAspect = width / height;

  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (srcAspect > dstAspect) {
    // Image wider than target — crop left/right
    sw = img.height * dstAspect;
    sx = (img.width - sw) / 2;
  } else {
    // Image taller than target — crop top/bottom
    sh = img.width / dstAspect;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.92);
}

export function SocialResizer({ imageUrl, imageName, onClose }: SocialResizerProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(PLATFORMS.map((p) => p.id))
  );
  const [results, setResults] = useState<ResizedImage[]>([]);
  const [generating, setGenerating] = useState(false);

  const togglePlatform = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const generateSizes = useCallback(async () => {
    setGenerating(true);
    setResults([]);

    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });

    const generated: ResizedImage[] = [];
    for (const platform of PLATFORMS) {
      if (!selected.has(platform.id)) continue;
      const dataUrl = resizeToCanvas(img, platform.width, platform.height);
      if (dataUrl) generated.push({ platform, dataUrl });
    }

    setResults(generated);
    setGenerating(false);
  }, [imageUrl, selected]);

  const downloadOne = (dataUrl: string, platformLabel: string) => {
    const baseName = imageName.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${baseName}-${platformLabel.toLowerCase().replace(/[\s/]+/g, '-')}.jpg`;
    a.click();
  };

  const downloadAll = () => {
    results.forEach(({ platform, dataUrl }) => downloadOne(dataUrl, platform.label));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-base font-semibold text-slate-900">📐 Social Media Resizer</h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{imageName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Source + platform selection */}
          <div className="flex gap-5">
            <div className="w-28 h-28 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={imageName} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 mb-3">Select platforms to generate:</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all',
                      selected.has(p.id)
                        ? 'border-[#0d9488] bg-blue-50 text-[#0d9488]'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    )}
                  >
                    {p.shortLabel}
                    <span className="ml-1.5 opacity-50 font-normal">
                      {p.width}×{p.height}
                    </span>
                  </button>
                ))}
              </div>

              <Button
                onClick={generateSizes}
                disabled={generating || selected.size === 0}
                className="mt-4 bg-[#1d4ed8] hover:bg-[#1d4ed8] text-white"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating…
                  </>
                ) : (
                  `Generate ${selected.size} Size${selected.size !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </div>

          {/* Results grid */}
          {results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Generated Sizes</h3>
                <Button variant="outline" size="sm" onClick={downloadAll}>
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {results.map(({ platform, dataUrl }) => {
                  const aspectRatio = Math.min(
                    (platform.height / platform.width) * 100,
                    80 // cap portrait previews at 80% height
                  );
                  return (
                    <div
                      key={platform.id}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <div
                        className="relative bg-slate-50 overflow-hidden"
                        style={{ paddingBottom: `${aspectRatio}%` }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={dataUrl}
                          alt={platform.label}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-semibold text-slate-700">{platform.label}</p>
                        <p className="text-xs text-slate-400 mb-2">
                          {platform.width}×{platform.height}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs h-7"
                          onClick={() => downloadOne(dataUrl, platform.label)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
