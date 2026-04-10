'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const categories = [
  'Getting Started',
  'Billing',
  'Projects',
  'Services',
  'Plans',
  'Support',
];

// TODO: Replace with real data from database based on [articleId]
const mockArticleData = {
  id: 'faq_1',
  title: 'How do I update my website?',
  content: 'You can update your website through the admin panel. Navigate to the pages section and edit the content directly.',
  category: 'Getting Started',
  published: true,
};

export default function EditFaqPage({
  params,
}: {
  params: { articleId: string };
}) {
  const [formData, setFormData] = useState(mockArticleData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log('Submit form:', formData);
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/faq" className="text-blue-400 hover:underline">
          ← Back to FAQ
        </Link>
        <h1 className="text-3xl font-bold text-white">Edit Article</h1>
      </div>

      <Card className="bg-slate-800 border-slate-700 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter article title"
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Content
            </label>
            <Textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter article content"
              className="bg-slate-700 border-slate-600 text-white min-h-64"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="rounded"
            />
            <label htmlFor="published" className="text-sm text-slate-300">
              Published
            </label>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-700">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              onClick={() => {
                if (confirm('Delete this article?')) {
                  // TODO: Delete article
                  console.log('Delete article:', params.articleId);
                }
              }}
            >
              Delete Article
            </button>
            <Link
              href="/admin/faq"
              className="px-6 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
