'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with real data from database
const mockFaqArticles = [
  {
    id: 'faq_1',
    title: 'How do I update my website?',
    category: 'Getting Started',
    published: true,
    views: 245,
    helpful: 89,
  },
  {
    id: 'faq_2',
    title: 'What payment methods do you accept?',
    category: 'Billing',
    published: true,
    views: 156,
    helpful: 92,
  },
  {
    id: 'faq_3',
    title: 'How long does a typical project take?',
    category: 'Projects',
    published: true,
    views: 312,
    helpful: 85,
  },
  {
    id: 'faq_4',
    title: 'Can you help with SEO?',
    category: 'Services',
    published: true,
    views: 189,
    helpful: 78,
  },
  {
    id: 'faq_5',
    title: 'What is included in the professional plan?',
    category: 'Plans',
    published: false,
    views: 45,
    helpful: 100,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = useMemo(() => {
    return mockFaqArticles.filter((article) => {
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
  }, [searchTerm, categoryFilter]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">FAQ Articles</h1>
        <Link
          href="/admin/faq/new"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          + New Article
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search
            </label>
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-md"
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Helpful %
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{article.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-slate-700 text-slate-200">
                      {article.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        article.published
                          ? 'bg-green-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }
                    >
                      {article.published ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{article.views}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-12 bg-slate-700 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${article.helpful}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-300 text-sm">
                        {article.helpful}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/faq/${article.id}/edit`}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </Link>
                      <button className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
