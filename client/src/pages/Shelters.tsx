import React, { useState, useEffect, useCallback } from 'react';
import { ShelterMap } from '../components/Map/ShelterMap';
import { ShelterTagBadge } from '../components/UI/Badge';
import { StarRating } from '../components/UI/StarRating';
import { useGeolocation } from '../hooks/useGeolocation';
import { api } from '../api/client';
import type { Shelter, ShelterTag, ShelterFilters } from '../types';
import {
  Search, Filter, Phone, Clock, MapPin, Users, ChevronDown, ChevronUp, X,
} from 'lucide-react';

const ALL_TAGS: ShelterTag[] = [
  'women-only', 'lgbtq-friendly', 'bipoc-focused', 'accessible',
  'childcare', 'pets-allowed', 'sober-only', 'domestic-violence',
];

const DEFAULT_FILTERS: ShelterFilters = {
  tags: [], minRating: 0, hasAvailability: false, city: '',
};

function OccupancyBar({ capacity, current }: { capacity: number; current: number }) {
  const pct = Math.round((current / capacity) * 100);
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-teal-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>Occupancy</span>
        <span className={pct >= 90 ? 'text-red-500 font-medium' : ''}>
          {capacity - current} beds free
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Shelters() {
  const [shelters,    setShelters]    = useState<Shelter[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [search,      setSearch]      = useState('');
  const [filters,     setFilters]     = useState<ShelterFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const { lat, lng } = useGeolocation();

  useEffect(() => {
    api.getShelters()
      .then(setShelters)
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const toggleTag = useCallback((tag: ShelterTag) => {
    setFilters(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  }, []);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const filtered = shelters.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q);
    const matchesTags =
      filters.tags.length === 0 || filters.tags.every(t => s.tags.includes(t));
    const matchesRating = s.rating >= filters.minRating;
    const matchesAvail  = !filters.hasAvailability || s.currentOccupancy < s.capacity;
    const matchesCity   = !filters.city || s.city.toLowerCase().includes(filters.city.toLowerCase());
    return matchesSearch && matchesTags && matchesRating && matchesAvail && matchesCity;
  });

  const activeFilterCount =
    filters.tags.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.hasAvailability ? 1 : 0) +
    (filters.city ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Find a Safe Shelter</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {filtered.length} shelters found · Use filters to narrow by your specific needs.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            className="input pl-9"
            placeholder="Search by name, city, or service…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search shelters"
          />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            activeFilterCount > 0
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
          aria-expanded={showFilters}
        >
          <Filter className="w-4 h-4" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">Filter shelters</h2>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          {/* Tags */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Shelter Type</p>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`tag cursor-pointer transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-primary-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  aria-pressed={filters.tags.includes(tag)}
                >
                  <ShelterTagBadge tag={tag} small />
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1.5">
                City
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. New York"
                value={filters.city}
                onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
              />
            </div>
            {/* Min rating */}
            <div>
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1.5">
                Min Rating
              </label>
              <select
                className="input"
                value={filters.minRating}
                onChange={e => setFilters(f => ({ ...f, minRating: Number(e.target.value) }))}
              >
                <option value={0}>Any</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={4.5}>4.5+</option>
              </select>
            </div>
            {/* Availability */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-700 rounded"
                  checked={filters.hasAvailability}
                  onChange={e => setFilters(f => ({ ...f, hasAvailability: e.target.checked }))}
                />
                Available beds only
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main grid: list + map */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Shelter list */}
        <div className="lg:col-span-2 space-y-3 max-h-[680px] overflow-y-auto pr-1">
          {loading && (
            <div className="text-center py-12 text-gray-400">Loading shelters…</div>
          )}
          {error && (
            <div className="text-center py-12 text-red-500 text-sm">{error}</div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              No shelters match your search or filters.
            </div>
          )}
          {filtered.map(shelter => (
            <button
              key={shelter.id}
              onClick={() => setSelectedId(shelter.id === selectedId ? null : shelter.id)}
              className={`w-full text-left card p-4 transition-all ${
                selectedId === shelter.id ? 'ring-2 ring-primary-500' : ''
              }`}
              aria-pressed={selectedId === shelter.id}
              aria-label={`Select ${shelter.name}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug">{shelter.name}</h3>
                <StarRating rating={shelter.rating} />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                <MapPin className="w-3 h-3" aria-hidden="true" />
                {shelter.city}, {shelter.state}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {shelter.tags.slice(0, 3).map(tag => (
                  <ShelterTagBadge key={tag} tag={tag} small />
                ))}
              </div>

              <OccupancyBar capacity={shelter.capacity} current={shelter.currentOccupancy} />

              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {shelter.hours}
                </span>
                <a
                  href={`tel:${shelter.phone}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 text-primary-700 hover:underline font-medium"
                >
                  <Phone className="w-3 h-3" aria-hidden="true" />
                  {shelter.phone}
                </a>
              </div>

              {shelter.services.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-50 text-xs text-gray-400">
                  <Users className="w-3 h-3 inline mr-1" aria-hidden="true" />
                  {shelter.services.slice(0, 4).join(' · ')}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Map */}
        <div className="lg:col-span-3 h-[680px]">
          <ShelterMap
            shelters={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            userLat={lat}
            userLng={lng}
          />
        </div>
      </div>
    </div>
  );
}
