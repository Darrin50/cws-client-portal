'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ThumbsUp,
  ThumbsDown,
  Eye,
  Plus,
  Search,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface FaqArticle {
  id: string;
  title: string;
  category: string;
  published: boolean;
  views: number;
  helpful: number;
  unhelpful: number;
}

const initialArticles: FaqArticle[] = [
  {
    id: 'faq_1',
    title: 'How do I update my website?',
    category: 'Getting Started',
    published: true,
    views: 245,
    helpful: 89,
    unhelpful: 11,
  },
  {
    id: 'faq_2',
    title: 'What payment methods do you accept?',
    category: 'Billing',
    published: true,
    views: 156,
    helpful: 92,
    unhelpful: 8,
  },
  {
    id: 'faq_3',
    title: 'How long does a typical project take?',
    category: 'Projects',
    published: true,
    views: 312,
    helpful: 85,
    unhelpful: 15,
  },
  {
    id: 'faq_4',
    title: 'Can you help with SEO?',
    category: 'Services',
    published: true,
    views: 189,
    helpful: 78,
    unhelpful: 22,
  },
  {
    id: 'faq_5',
    title: 'What is included in the professional plan?',
    category: 'Plans',
    published: false,
    views: 45,
    helpful: 100,
    unhelpful: 0,
  },
  {
    id: 'faq_6',
    title: 'How do I request a new page?',
    category: 'Getting Started',
    published: true,
    views: 198,
    helpful: 94,
    unhelpful: 6,
  },
  {
    id: 'faq_7',
    title: 'Can I upgrade my plan at any time?',
    category: 'Billing',
    published: true,
    views: 103,
    helpful: 88,
    unhelpful: 12,
  },
];

const categories = [
  'Getting Started',
  'Billing',
  'Projects',
  'Services',
  'Plans',
  'Support',
];

export default function FAQPage() {
  const [articles, setArticles] = useState<FaqArticle[]>(initialArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      if (
        searchTerm &&
        !article.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (categoryFilter !== 'all' && article.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [articles, searchTerm, categoryFilter]);

  const handleTogglePublish = async (id: string) => {
    setTogglingId(id);
    // TODO: Call server action to update published state
    await new Promise((r) => setTimeout(r, 400));
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, published: !a.published } : a))
    );
    setTogglingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    setDeletingId(id);
    // TODO: Call server action to delete article
    await new Promise((r) => setTimeout(r, 500));
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setDeletingId(null);
  };

  const publishedCount = articles.filter((a) => a.published).length;
  const draftCount = articles.filter((a) => !a.published).length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">FAQ Articles</h1>
          <p className="text-slate-400 mt-1">
            {publishedCount} published &middot; {draftCount} draft
          </p>
        </div>
        <Link href="/admin/faq/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white pl-9"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Articles Table */}
      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400">No articles match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Views
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((article) => {
                  const total = article.helpful + article.unhelpful;
                  const helpfulPct =
                    total > 0 ? Math.round((article.helpful / total) * 100) : 0;
                  return (
                    <tr
                      key={article.id}
                      className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">
                          {article.title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-slate-700 text-slate-200 font-normal">
                          {article.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(article.id)}
                          disabled={togglingId === article.id}
                          className="flex items-center gap-2 group"
                          title={
                            article.published
                              ? 'Click to unpublish'
                              : 'Click to publish'
                          }
                        >
                          {article.published ? (
                            <ToggleRight className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                          )}
                          <Badge
                            className={
                              article.published
                                ? 'bg-green-600/80 text-green-100'
                                : 'bg-slate-600 text-slate-300'
                            }
                          >
                            {togglingId === article.id
                              ? '...'
                              : article.published
                              ? 'Published'
                              : 'Draft'}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {article.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-700 rounded-full h-1.5">
                              <div
                                className="bg-green-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${helpfulPct}%` }}
                              />
                            </div>
                            <span className="text-slate-300 text-xs w-8">
                              {helpfulPct}%
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3 text-green-500" />
                              {article.helpful}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsDown className="w-3 h-3 text-red-400" />
                              {article.unhelpful}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link href={`/admin/faq/${article.id}/edit`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 hover:text-white h-8 px-3"
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-800 text-red-400 hover:bg-red-900/20 hover:text-red-300 h-8 px-3"
                            onClick={() => handleDelete(article.id)}
                            disabled={deletingId === article.id}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            {deletingId === article.id ? '...' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
