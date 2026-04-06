"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";

// TODO: Replace with real server action from @/app/actions/requests
async function submitRequest(formData: FormData) {
  console.log("Submitting request:", formData);
  // Make API call
}

export default function NewRequestPage() {
  const [formData, setFormData] = useState({
    description: "",
    priority: "medium",
    pageId: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("description", formData.description);
      data.append("priority", formData.priority);
      data.append("pageId", formData.pageId);
      files.forEach((file) => data.append("files", file));

      await submitRequest(data);
      // TODO: Show success message and redirect
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/pages" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to pages
        </Link>
        <h1 className="text-3xl font-bold text-white">Submit a Request</h1>
        <p className="text-slate-400 mt-2">
          Tell us what changes or improvements you'd like to see
        </p>
      </div>

      {/* Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Page Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Page (Optional)
            </label>
            <select
              value={formData.pageId}
              onChange={(e) =>
                setFormData({ ...formData, pageId: e.target.value })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">General request</option>
              <option value="1">Homepage</option>
              <option value="2">About Us</option>
              <option value="3">Services</option>
              <option value="4">Contact</option>
              <option value="5">Blog</option>
              <option value="6">Pricing</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Priority Level
            </label>
            <div className="flex gap-3">
              {(
                [
                  { value: "low", label: "Low", color: "text-green-400" },
                  { value: "medium", label: "Medium", color: "text-yellow-400" },
                  { value: "high", label: "High", color: "text-red-400" },
                ] as const
              ).map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={formData.priority === option.value}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-4 h-4"
                  />
                  <span className={`text-sm font-medium ${option.color}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description *
            </label>
            <Textarea
              id="description"
              placeholder="Describe what you'd like us to do. Be as detailed as possible..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              className="h-32"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="space-y-2"
              >
                <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm text-white font-medium">
                  Click to upload files
                </p>
                <p className="text-xs text-slate-400">
                  or drag and drop (PNG, JPG, PDF up to 10MB)
                </p>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-700 rounded px-3 py-2"
                  >
                    <span className="text-sm text-white truncate">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles(files.filter((_, i) => i !== index))
                      }
                      className="text-slate-400 hover:text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={!formData.description.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
            <Link href="/pages" className="flex-1">
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
