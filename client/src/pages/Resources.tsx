import React, { useState, useEffect } from 'react';
import { ResourceCard } from '../components/Resources/ResourceCard';
import { api } from '../api/client';
import type { Resource, ResourceCategory } from '../types';
import { Search, Filter } from 'lucide-react';

const CATEGORIES: { value: ResourceCategory | 'all'; label: string }[] = [
  { value: 'all',              label: 'All Resources' },
  { value: 'food',             label: '🍽 Food' },
  { value: 'healthcare',       label: '🏥 Healthcare' },
  { value: 'mental-health',    label: '🧠 Mental Health' },
  { value: 'legal-aid',        label: '⚖️ Legal Aid' },
  { value: 'clothing',         label: '👗 Clothing' },
  { value: 'education',        label: '📚 Education' },
  { value: 'employment',       label: '💼 Employment' },
  { value: 'childcare',        label: '👶 Childcare' },
  { value: 'domestic-violence',label: '🛡 DV Services' },
];

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [category,  setCategory]  = useState<ResourceCategory | 'all'>('all');
  const [search,    setSearch]    = useState('');
  const [freeOnly,  setFreeOnly]  = useState(false);

  useEffect(() => {
    api.getResources()
      .then(setResources)
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = resources.filter(r => {
    const q = search.toLowerCase();
    const matchesCat    = category === 'all' || r.category === category;
    const matchesFree   = !freeOnly || r.isFree;
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesFree && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resource Directory</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Free and low-cost services prioritising women, LGBTQ+, and minority communities.
        </p>
      </div>

      {/* Search + free toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            className="input pl-9"
            placeholder="Search resources, cities, or services…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search resources"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 bg-white border border-gray-200 px-4 rounded-xl">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary-700 rounded"
            checked={freeOnly}
            onChange={e => setFreeOnly(e.target.checked)}
          />
          <Filter className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
          Free only
        </label>
      </div>

      {/* Category tabs */}
      <div
        className="flex gap-2 flex-wrap mb-6"
        role="tablist"
        aria-label="Resource categories"
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            role="tab"
            aria-selected={category === cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              category === cat.value
                ? 'bg-primary-700 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-400 mb-4" role="status" aria-live="polite">
        {loading ? 'Loading…' : `${filtered.length} resources found`}
      </p>

      {/* Grid */}
      {error && (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No resources found</p>
          <p className="text-sm">Try adjusting your search or category filters.</p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(resource => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
