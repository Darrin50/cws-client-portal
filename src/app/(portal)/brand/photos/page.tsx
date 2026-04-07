'use client';

import { useState, useEffect, useCallback } from 'react';
import { AssetCategory } from '@/components/brand/AssetCategory';
import { SocialResizer } from '@/components/brand/SocialResizer';
import { CaptionGenerator } from '@/components/brand/ai-captions/CaptionGenerator';
import type { AssetItem } from '@/components/brand/AssetCard';

// ─── Types ────────────────────────────────────────────────────────────────────

type PhotoCategory = 'blog' | 'webpage' | 'social_photo' | 'social_video';

interface RawAsset {
  id: string;
  name: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  metadata: { category?: PhotoCategory; [key: string]: unknown } | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rawToItem(a: RawAsset): AssetItem {
  return {
    id: a.id,
    name: a.name,
    fileUrl: a.fileUrl,
    fileName: a.fileName,
    fileSize: a.fileSize,
    mimeType: a.mimeType,
    metadata: a.metadata,
    createdAt: a.createdAt,
  };
}

/** Attempt a real upload to Vercel Blob via our API route.
 *  Falls back to a local object URL if the token isn't configured. */
async function uploadToBlob(
  file: File,
  folder: string,
): Promise<{ url: string; fromLocal: boolean }> {
  const body = new FormData();
  body.append('file', file);
  body.append('folder', folder);

  try {
    const res = await fetch('/api/upload', { method: 'POST', body });
    if (res.ok) {
      const json = await res.json();
      const url = json?.data?.url as string | undefined;
      if (url) return { url, fromLocal: false };
    }
  } catch {
    // network or server error — fall through to local
  }

  // Graceful fallback: local object URL (valid only for the current session)
  return { url: URL.createObjectURL(file), fromLocal: true };
}

/** Save an asset record to the DB. */
async function saveAssetRecord(params: {
  name: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: PhotoCategory;
}): Promise<RawAsset | null> {
  const res = await fetch('/api/brand-assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assetType: 'photo',
      name: params.name,
      fileUrl: params.fileUrl,
      fileName: params.fileName,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
      metadata: { category: params.category },
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return (json?.data as RawAsset) ?? null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PhotosPage() {
  const [assets, setAssets] = useState<RawAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<PhotoCategory, boolean>>({
    blog: false,
    webpage: false,
    social_photo: false,
    social_video: false,
  });

  // Social resizer modal state
  const [resizerAsset, setResizerAsset] = useState<AssetItem | null>(null);

  // AI caption generator modal state
  const [captionAsset, setCaptionAsset] = useState<AssetItem | null>(null);

  // ── Fetch all photos once on mount ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/brand-assets?assetType=photo');
        if (res.ok) {
          const json = await res.json();
          const list = (json?.data?.assets ?? []) as RawAsset[];
          setAssets(list);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Category slices ──────────────────────────────────────────────────────────
  const byCategory = (cat: PhotoCategory): AssetItem[] =>
    assets
      .filter((a) => (a.metadata?.category ?? 'blog') === cat)
      .map(rawToItem);

  // ── Upload handler (shared across all categories) ────────────────────────────
  const handleUpload = useCallback(
    async (files: File[], category: PhotoCategory) => {
      setUploading((prev) => ({ ...prev, [category]: true }));

      const folder = `brand/${category}`;
      const results: RawAsset[] = [];

      for (const file of files) {
        const { url } = await uploadToBlob(file, folder);
        const saved = await saveAssetRecord({
          name: file.name.replace(/\.[^/.]+$/, ''),
          fileUrl: url,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          category,
        });
        if (saved) results.push(saved);
      }

      setAssets((prev) => [...prev, ...results]);
      setUploading((prev) => ({ ...prev, [category]: false }));
    },
    [],
  );

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch(`/api/brand-assets/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAssets((prev) => prev.filter((a) => a.id !== id));
    }
  }, []);

  // ── Rename (optimistic + API) ─────────────────────────────────────────────────
  const handleRename = useCallback(async (id: string, name: string) => {
    // Optimistic update
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, name } : a)),
    );
    // Persist
    await fetch('/api/brand-assets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
    });
  }, []);

  // ── Helpers for each category upload ────────────────────────────────────────
  const makeCategoryUploader = (cat: PhotoCategory) => (files: File[]) =>
    handleUpload(files, cat);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Photos &amp; Media</h1>
        <p className="text-sm text-slate-500 mt-1">
          Your asset library — organised by purpose, ready to use anywhere.
        </p>
      </div>

      {/* ── Blog Photos ──────────────────────────────────────────────────────── */}
      <AssetCategory
        id="blog"
        icon="📝"
        title="Blog Photos"
        description="Images used in blog post content and headers"
        tip="Best for featured images and in-post visuals."
        recommendedSize="1200×628 px (16:9)"
        acceptedTypes="image/*"
        assets={byCategory('blog')}
        loading={loading}
        uploading={uploading.blog}
        onUpload={makeCategoryUploader('blog')}
        onDelete={handleDelete}
        onRename={handleRename}
        onGenerateCaptions={setCaptionAsset}
        showCaptionButton
        emptyIcon="📝"
        emptyMessage="No blog photos yet — drag one in or click Upload."
      />

      {/* ── Webpage Photos ───────────────────────────────────────────────────── */}
      <AssetCategory
        id="webpage"
        icon="🖥️"
        title="Webpage Photos"
        description="Hero images, section backgrounds, team photos, product shots"
        tip="Used on your website pages — optimise for fast loading."
        recommendedSize="1920×1080 px or custom"
        acceptedTypes="image/*"
        assets={byCategory('webpage')}
        loading={loading}
        uploading={uploading.webpage}
        onUpload={makeCategoryUploader('webpage')}
        onDelete={handleDelete}
        onRename={handleRename}
        onGenerateCaptions={setCaptionAsset}
        showCaptionButton
        emptyIcon="🖥️"
        emptyMessage="No webpage photos yet — drag one in or click Upload."
      />

      {/* ── Social Media Posts ───────────────────────────────────────────────── */}
      <AssetCategory
        id="social_photo"
        icon="📱"
        title="Social Media Posts"
        description="Static images for social media — auto-resize for every platform"
        tip="Upload once, get all platform sizes automatically. Click 📐 on any image to resize."
        acceptedTypes="image/*"
        assets={byCategory('social_photo')}
        loading={loading}
        uploading={uploading.social_photo}
        onUpload={makeCategoryUploader('social_photo')}
        onDelete={handleDelete}
        onRename={handleRename}
        onResize={(asset) => setResizerAsset(asset)}
        showResizeButton
        onGenerateCaptions={setCaptionAsset}
        showCaptionButton
        emptyIcon="📱"
        emptyMessage="No social photos yet — upload one and click 📐 to generate all platform sizes."
      />

      {/* ── Social Media Videos ──────────────────────────────────────────────── */}
      <AssetCategory
        id="social_video"
        icon="🎬"
        title="Social Media Videos"
        description="MP4 / MOV files for social content"
        tip="Square (1:1) works on all platforms. Vertical (9:16) for Stories & TikTok."
        acceptedTypes="video/mp4,video/quicktime,video/webm,video/*"
        assets={byCategory('social_video')}
        loading={loading}
        uploading={uploading.social_video}
        onUpload={makeCategoryUploader('social_video')}
        onDelete={handleDelete}
        onRename={handleRename}
        emptyIcon="🎬"
        emptyMessage="No social videos yet — drag an MP4 or MOV in or click Upload."
      />

      {/* Social Resizer modal */}
      {resizerAsset?.fileUrl && (
        <SocialResizer
          imageUrl={resizerAsset.fileUrl}
          imageName={resizerAsset.name}
          onClose={() => setResizerAsset(null)}
        />
      )}

      {/* AI Caption Generator modal */}
      {captionAsset && (
        <CaptionGenerator
          asset={captionAsset}
          onClose={() => setCaptionAsset(null)}
        />
      )}
    </div>
  );
}
