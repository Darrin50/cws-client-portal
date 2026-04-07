"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2, Tag } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface PhotoAsset {
  id: string;
  name: string;
  fileUrl: string | null;
  fileName: string | null;
  metadata: { tags?: string[] } | null;
}

function PhotoCard({
  photo,
  onDelete,
}: {
  photo: PhotoAsset;
  onDelete: (id: string) => void;
}) {
  const tags = photo.metadata?.tags ?? [];

  return (
    <Card className="overflow-hidden group">
      <div className="relative h-40 bg-slate-700 overflow-hidden">
        {photo.fileUrl ? (
          <img
            src={photo.fileUrl}
            alt={photo.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">No preview</div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          {photo.fileUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={photo.fileUrl} download={photo.fileName ?? photo.name}>
                <Download className="w-4 h-4" />
              </a>
            </Button>
          )}
          <Button size="sm" variant="outline" className="text-red-400" onClick={() => onDelete(photo.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white mb-2">{photo.name}</h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  async function fetchPhotos() {
    try {
      const res = await fetch("/api/brand-assets?assetType=photo");
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.data?.assets ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  const allTags = Array.from(
    new Set(photos.flatMap((p) => p.metadata?.tags ?? [])),
  ).sort();

  const filteredPhotos = selectedTag
    ? photos.filter((p) => p.metadata?.tags?.includes(selectedTag))
    : photos;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      await fetch("/api/brand-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType: "photo",
          name: file.name,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      });
    }
    await fetchPhotos();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/brand-assets/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Brand Photos</h1>
          <p className="text-slate-400 mt-2">Manage your brand image library</p>
        </div>
        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Photos
        </Button>
      </div>

      <Card className="p-8 border-2 border-dashed border-slate-600 hover:border-blue-500 transition-colors">
        <div onClick={() => fileInputRef.current?.click()} className="text-center cursor-pointer space-y-2">
          <Upload className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-white font-medium">Drag and drop photos here</p>
          <p className="text-xs text-slate-400">or click to browse</p>
        </div>
      </Card>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button variant={selectedTag === null ? "default" : "outline"} onClick={() => setSelectedTag(null)} size="sm">
            All ({photos.length})
          </Button>
          {allTags.map((tag) => {
            const c = photos.filter((p) => p.metadata?.tags?.includes(tag)).length;
            return (
              <Button key={tag} variant={selectedTag === tag ? "default" : "outline"} onClick={() => setSelectedTag(tag)} size="sm">
                <Tag className="w-3 h-3 mr-1" />
                {tag} ({c})
              </Button>
            );
          })}
        </div>
      )}

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : filteredPhotos.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-slate-400">{selectedTag ? "No photos found for this tag" : "No photos uploaded yet"}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
