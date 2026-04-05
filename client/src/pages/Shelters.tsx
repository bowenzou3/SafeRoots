import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShelterMap } from '../components/Map/ShelterMap';
import { ShelterTagBadge } from '../components/UI/Badge';
import { StarRating } from '../components/UI/StarRating';
import { useGeolocation } from '../hooks/useGeolocation';
import { api } from '../api/client';
import type { Shelter, ShelterTag, ShelterFilters, TransitEta } from '../types';
import {
  Search,
  Filter,
  Phone,
  Clock,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  Shield,
  Route,
  Moon,
  Sparkles,
} from 'lucide-react';

const ALL_TAGS: ShelterTag[] = [
  'women-only', 'lgbtq-friendly', 'bipoc-focused', 'accessible',
  'childcare', 'pets-allowed', 'sober-only', 'domestic-violence',
];

const DEFAULT_FILTERS: ShelterFilters = {
  tags: [], minRating: 0, hasAvailability: false, city: '',
};

function relativeMinutes(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  return `${mins}m ago`;
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function etaStrings(distanceMiles: number, safeRoute: boolean) {
  const walkSpeedMph = safeRoute ? 2.4 : 2.9;
  const walkMinutes = Math.max(1, Math.round((distanceMiles / walkSpeedMph) * 60));
  const busMinutes = Math.max(2, Math.round(walkMinutes * 1.7));
  return { walkMinutes, busMinutes };
}

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
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [recommended, setRecommended] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ShelterFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [safeRoute, setSafeRoute] = useState(false);
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [checkinDone, setCheckinDone] = useState<string | null>(null);
  const [transitEta, setTransitEta] = useState<TransitEta | null>(null);
  const [transitLoading, setTransitLoading] = useState(false);
  const { lat, lng } = useGeolocation();

  useEffect(() => {
    api.getShelters()
      .then(setShelters)
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (lat === null || lng === null) return;
    api.getRecommendedShelters({ lat, lng, tags: filters.tags })
      .then(setRecommended)
      .catch(() => setRecommended([]));
  }, [lat, lng, filters.tags]);

  const toggleTag = useCallback((tag: ShelterTag) => {
    setFilters(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }));
  }, []);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const filtered = useMemo(() => shelters.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q);
    const matchesTags =
      filters.tags.length === 0 || filters.tags.every(t => s.tags.includes(t));
    const matchesRating = s.rating >= filters.minRating;
    const matchesAvail = !filters.hasAvailability || s.bedsAvailable > 0;
    const matchesCity = !filters.city || s.city.toLowerCase().includes(filters.city.toLowerCase());
    return matchesSearch && matchesTags && matchesRating && matchesAvail && matchesCity;
  }), [filters, search, shelters]);

  const prioritized = useMemo(() => [...filtered].sort((a, b) => {
    if (a.bedsAvailable !== b.bedsAvailable) return b.bedsAvailable - a.bedsAvailable;
    return b.rating - a.rating;
  }), [filtered]);

  const activeFilterCount =
    filters.tags.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.hasAvailability ? 1 : 0) +
    (filters.city ? 1 : 0);

  const selectedShelter = prioritized.find(s => s.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedShelter || lat === null || lng === null) {
      setTransitEta(null);
      return;
    }
    setTransitLoading(true);
    api.getTransitEta({
      fromLat: lat,
      fromLng: lng,
      toLat: selectedShelter.lat,
      toLng: selectedShelter.lng,
      safeRoute,
    })
      .then(setTransitEta)
      .catch(() => setTransitEta(null))
      .finally(() => setTransitLoading(false));
  }, [selectedShelter, lat, lng, safeRoute]);

  const submitQuickFeedback = async (feltSafe: boolean) => {
    if (!selectedShelter) return;
    setFeedbackBusy(true);
    try {
      await api.submitShelterFeedback(selectedShelter.id, {
        feltSafe,
        womenSafetyScore: feltSafe ? 5 : 2,
        lgbtqSafetyScore: feltSafe ? 5 : 2,
        antiRacismScore: feltSafe ? 5 : 2,
        comment: feltSafe ? 'Anonymous quick feedback: felt safe.' : 'Anonymous quick feedback: felt unsafe.',
      });
      await api.trackEvent('shelter_feedback', { shelterId: selectedShelter.id, feltSafe });
    } finally {
      setFeedbackBusy(false);
    }
  };

  const submitCheckin = async (helped: boolean) => {
    if (!selectedShelter) return;
    await api.submitShelterCheckin(selectedShelter.id, helped);
    await api.trackEvent('shelter_checkin', { shelterId: selectedShelter.id, helped });
    setCheckinDone(helped ? 'Marked as helped. Thank you.' : 'Marked as unresolved. We will improve recommendations.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Find a Safe Shelter</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {prioritized.length} shelters found · Auto-prioritized by beds available now.
        </p>
      </div>

      {recommended.length > 0 && (
        <div className="card p-4 mb-4 border-primary-100 bg-primary-50/40">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary-700" />
            <h2 className="font-semibold text-primary-900 text-sm">Best option right now</h2>
          </div>
          <button
            onClick={() => setSelectedId(recommended[0].id)}
            className="text-left w-full rounded-lg bg-white border border-primary-100 p-3 hover:border-primary-300"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-gray-900">{recommended[0].name}</p>
              <span className="tag bg-green-100 text-green-700">{recommended[0].bedsAvailable} beds open</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {(recommended[0].recommendationReasons ?? []).join(' · ')}
            </p>
          </button>
        </div>
      )}

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
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 bg-white border border-gray-200 px-4 rounded-xl">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary-700 rounded"
            checked={safeRoute}
            onChange={e => setSafeRoute(e.target.checked)}
          />
          <Moon className="w-3.5 h-3.5 text-gray-400" />
          Late-night safe route
        </label>
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
            <div>
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1.5">City</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. New York"
                value={filters.city}
                onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1.5">Min Rating</label>
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

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-3 max-h-[680px] overflow-y-auto pr-1">
          {loading && <div className="text-center py-12 text-gray-400">Loading shelters…</div>}
          {error && <div className="text-center py-12 text-red-500 text-sm">{error}</div>}
          {!loading && !error && prioritized.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No shelters match your search or filters.</div>
          )}

          {prioritized.map(shelter => {
            const distance = lat && lng ? haversineMiles(lat, lng, shelter.lat, shelter.lng) : null;
            const eta = distance !== null ? etaStrings(distance, safeRoute) : null;

            return (
              <button
                key={shelter.id}
                onClick={() => setSelectedId(shelter.id === selectedId ? null : shelter.id)}
                className={`w-full text-left card p-4 transition-all ${selectedId === shelter.id ? 'ring-2 ring-primary-500' : ''}`}
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

                <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-gray-500">
                  <span className="tag bg-teal-100 text-teal-700">Updated {relativeMinutes(shelter.availabilityUpdatedAt)}</span>
                  <span className="tag bg-pink-100 text-pink-700">Women {shelter.safetyScores.women.toFixed(1)}</span>
                  <span className="tag bg-violet-100 text-violet-700">LGBTQ+ {shelter.safetyScores.lgbtq.toFixed(1)}</span>
                  <span className="tag bg-amber-100 text-amber-700">Anti-racism {shelter.safetyScores.antiRacism.toFixed(1)}</span>
                </div>

                {eta && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
                    <Route className="w-3 h-3" /> Reach in {eta.walkMinutes} min walk / {eta.busMinutes} min bus
                    {safeRoute && <span className="tag bg-indigo-100 text-indigo-700">Safe route</span>}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {shelter.hours}
                  </span>
                  <a
                    href={`tel:${shelter.phone}`}
                    onClick={async e => {
                      e.stopPropagation();
                      await api.trackEvent('shelter_call_click', { shelterId: shelter.id });
                    }}
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
            );
          })}
        </div>

        <div className="lg:col-span-3 h-[680px] space-y-3">
          <div className="h-[530px]">
            <ShelterMap
              shelters={prioritized}
              selectedId={selectedId}
              onSelect={setSelectedId}
              userLat={lat}
              userLng={lng}
            />
          </div>

          {selectedShelter && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary-700" /> Anonymous safety feedback
              </h3>
              <p className="text-xs text-gray-500 mb-3">After a visit, did this place feel safe and inclusive?</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  disabled={feedbackBusy}
                  className="btn-secondary text-sm"
                  onClick={() => submitQuickFeedback(true)}
                >
                  Felt safe
                </button>
                <button
                  disabled={feedbackBusy}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-sm font-semibold"
                  onClick={() => submitQuickFeedback(false)}
                >
                  Felt unsafe
                </button>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 mb-2">
                  {transitLoading && 'Loading provider ETA...'}
                  {!transitLoading && transitEta && (
                    <>Route ETA: {transitEta.walkMinutes} min walk / {transitEta.transitMinutes} min transit ({transitEta.provider})</>
                  )}
                  {!transitLoading && !transitEta && 'Route ETA unavailable. Showing estimated times above.'}
                </p>
                <p className="text-xs text-gray-500 mb-2">Did you get help from this referral?</p>
                <div className="flex gap-2">
                  <button className="btn-primary text-sm" onClick={() => submitCheckin(true)}>Yes, got help</button>
                  <button className="btn-secondary text-sm" onClick={() => submitCheckin(false)}>No, still need help</button>
                </div>
                {checkinDone && <p className="text-xs text-green-700 mt-2">{checkinDone}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
