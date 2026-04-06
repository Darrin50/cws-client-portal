"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2, Tag } from "lucide-react";
import { useState, useRef } from "react";

// TODO: Replace with real data fetch
const mockPhotos = [
  {
    id: "1",
    name: "Team photo",
    tags: ["team", "people"],
    image: "/api/placeholder/300/200",
  },
  {
    id: "2",
    name: "Office space",
    tags: ["office", "environment"],
    image: "/api/placeholder/300/200",
  },
  {
    id: "3",
    name: "Product showcase",
    tags: ["product"],
    image: "/api/placeholder/300/200",
  },
  {
    id: "4",
    name: "Client testimonial",
    tags: ["testimonial", "people"],
    image: "/api/placeholder/300/200",
  },
];

type TagFilter = string | null;

function PhotoCard({
  photo,
}: {
  photo: (typeof mockPhotos)[0];
}) {
  return (
    <Card className="overflow-hidden group">
      <div className="relative h-40 bg-slate-700 overflow-hidden">
        <img
          src={photo.image}
          alt={photo.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="text-red-400">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white mb-2">{photo.name}</h3>
        <div className="flex flex-wrap gap-1">
          {photo.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState(mockPhotos);
  const [selectedTag, setSelectedTag] = useState<TagFilter>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allTags = Array.from(
    new Set(photos.flatMap((photo) => photo.tags))
  ).sort();

  const filteredPhotos = selectedTag
    ? photos.filter((photo) => photo.tags.includes(selectedTag))
    : photos;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // TODO: Upload files via server action
      console.log("Uploading files:", files);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Brand Photos</h1>
          <p className="text-slate-400 mt-2">
            Manage your brand image library
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Photos
        </Button>
      </div>

      {/* Upload Zone */}
      <Card className="p-8 border-2 border-dashed border-slate-600 hover:border-blue-500 transition-colors">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="text-center cursor-pointer space-y-2"
        >
          <Upload className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm text-white font-medium">
            Drag and drop photos here
          </p>
          <p className="text-xs text-slate-400">or click to browse</p>
        </div>
      </Card>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedTag === null ? "default" : "outline"}
            onClick={() => setSelectedTag(null)}
            size="sm"
          >
            All ({photos.length})
          </Button>
          {allTags.map((tag) => {
            const count = photos.filter((photo) =>
              photo.tags.includes(tag)
            ).length;
            return (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                onClick={() => setSelectedTag(tag)}
                size="sm"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag} ({count})
              </Button>
            );
          })}
        </div>
      )}

      {/* Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-slate-400">No photos found for this tag</p>
        </Card>
      )}
    </div>
  );
}
