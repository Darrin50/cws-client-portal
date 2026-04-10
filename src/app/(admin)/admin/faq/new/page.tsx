'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';

const categories = [
  { value: 'Getting Started', label: 'Getting Started' },
  { value: 'Billing', label: 'Billing' },
  { value: 'Projects', label: 'Projects' },
  { value: 'Services', label: 'Services' },
  { value: 'Plans', label: 'Plans' },
  { value: 'Support', label: 'Support' },
];

export default function NewFaqPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Getting Started',
    published: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    // Clear error on change
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // TODO: Call server action createFaqArticle(formData)
      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
      setTimeout(() => {
        router.push('/admin/faq');
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = formData.content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/faq"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to FAQ
        </Link>
        <span className="text-slate-700">/</span>
        <h1 className="text-2xl font-bold text-white">New Article</h1>
      </div>

      {saved && (
        <div className="mb-6 flex items-center gap-2 bg-green-500/10 border border-green-700 rounded-lg px-4 py-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-300 text-sm font-medium">
            Article created! Redirecting...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Title */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. How do I request a new page?"
              className={`bg-slate-700 border-slate-600 text-white text-lg ${
                errors.title ? 'border-red-500 focus:border-red-500' : ''
              }`}
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-2">{errors.title}</p>
            )}
          </Card>

          {/* Category + Publish row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Determines where the article appears in the FAQ
              </p>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Visibility
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    published: !prev.published,
                  }))
                }
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border transition-colors ${
                  formData.published
                    ? 'bg-green-500/10 border-green-700 text-green-300'
                    : 'bg-slate-700/50 border-slate-600 text-slate-400'
                }`}
              >
                {formData.published ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
                <div className="text-left">
                  <p className="font-medium text-sm">
                    {formData.published ? 'Published' : 'Draft'}
                  </p>
                  <p className="text-xs opacity-70">
                    {formData.published
                      ? 'Visible to all clients'
                      : 'Hidden from clients'}
                  </p>
                </div>
                <Badge
                  className={`ml-auto ${
                    formData.published
                      ? 'bg-green-600/80 text-green-100'
                      : 'bg-slate-600 text-slate-300'
                  }`}
                >
                  {formData.published ? 'Live' : 'Draft'}
                </Badge>
              </button>
            </Card>
          </div>

          {/* Content */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-300">
                Content <span className="text-red-400">*</span>
              </label>
              <span className="text-xs text-slate-500">{wordCount} words</span>
            </div>
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write the article content here. You can use plain text or Markdown formatting."
              className={`bg-slate-700 border-slate-600 text-white min-h-72 font-mono text-sm leading-relaxed ${
                errors.content ? 'border-red-500' : ''
              }`}
            />
            {errors.content && (
              <p className="text-red-400 text-xs mt-2">{errors.content}</p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Markdown supported: **bold**, *italic*, `code`, ## headings
            </p>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || saved}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting
                ? 'Creating...'
                : saved
                ? 'Created!'
                : formData.published
                ? 'Publish Article'
                : 'Save as Draft'}
            </Button>
            <Link href="/admin/faq">
              <Button
                type="button"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:text-white"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
