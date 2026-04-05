import React, { useState, useEffect, useMemo } from 'react';
import { ResourceCard } from '../components/Resources/ResourceCard';
import { api } from '../api/client';
import type { Resource, ResourceCategory, OutreachPopup, LegalHelpFlow } from '../types';
import { Search, Filter, WifiOff, Phone, Copy } from 'lucide-react';

const CATEGORIES: { value: ResourceCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Resources' },
  { value: 'food', label: 'Food' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'mental-health', label: 'Mental Health' },
  { value: 'legal-aid', label: 'Legal Aid' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'education', label: 'Education' },
  { value: 'employment', label: 'Employment' },
  { value: 'childcare', label: 'Childcare' },
  { value: 'domestic-violence', label: 'DV Services' },
];

type EssentialsFilter = {
  food: boolean;
  shower: boolean;
  restroom: boolean;
  charging: boolean;
  laundry: boolean;
};

const EMPTY_ESSENTIALS: EssentialsFilter = {
  food: false,
  shower: false,
  restroom: false,
  charging: false,
  laundry: false,
};

const CACHE_KEY = 'saferoots_offline_resources_v2';
const OUTREACH_AUTH_KEY = 'saferoots_outreach_auth_token';

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [popups, setPopups] = useState<OutreachPopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<ResourceCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [openNow, setOpenNow] = useState(true);
  const [essentials, setEssentials] = useState<EssentialsFilter>(EMPTY_ESSENTIALS);
  const [legalFlow, setLegalFlow] = useState<LegalHelpFlow | null>(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [checkinMessage, setCheckinMessage] = useState('');
  const [outreachMode, setOutreachMode] = useState(false);
  const [outreachToken, setOutreachToken] = useState<string>(() => localStorage.getItem(OUTREACH_AUTH_KEY) ?? '');
  const [outreachEmail, setOutreachEmail] = useState('outreach@saferoots.org');
  const [outreachPassword, setOutreachPassword] = useState('');
  const [outreachUserName, setOutreachUserName] = useState('');
  const [outreachMessage, setOutreachMessage] = useState('');

  useEffect(() => {
    if (!outreachToken) {
      setOutreachUserName('');
      return;
    }
    api.me(outreachToken)
      .then(data => setOutreachUserName(data.user.name))
      .catch(() => {
        setOutreachToken('');
        localStorage.removeItem(OUTREACH_AUTH_KEY);
      });
  }, [outreachToken]);

  useEffect(() => {
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  useEffect(() => {
    if (offline) {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { resources: Resource[]; popups: OutreachPopup[] };
        setResources(parsed.resources);
        setPopups(parsed.popups);
      }
      setLoading(false);
      return;
    }

    Promise.all([api.getLiveResources(), api.getLegalFlow('lost-id')])
      .then(([live, flow]) => {
        setResources(live.resources);
        setPopups(live.popups);
        setLegalFlow(flow);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ resources: live.resources, popups: live.popups }));
      })
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [offline]);

  const filtered = useMemo(() => resources.filter(r => {
    const q = search.toLowerCase();
    const matchesCat = category === 'all' || r.category === category;
    const matchesFree = !freeOnly || r.isFree;
    const matchesOpen = !openNow || r.liveStatus === 'open' || r.liveStatus === 'limited';
    const matchesEssentials =
      (!essentials.food || r.essentials.food) &&
      (!essentials.shower || r.essentials.shower) &&
      (!essentials.restroom || r.essentials.restroom) &&
      (!essentials.charging || r.essentials.charging) &&
      (!essentials.laundry || r.essentials.laundry);
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesFree && matchesOpen && matchesEssentials && matchesSearch;
  }), [category, essentials, freeOnly, openNow, resources, search]);

  const essentialsToggle = (key: keyof EssentialsFilter) => {
    setEssentials(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const submitResourceCheckin = async (resourceId: string, helped: boolean) => {
    await api.submitResourceCheckin(resourceId, helped);
    await api.trackEvent('resource_checkin', { resourceId, helped });
    setCheckinMessage(helped ? 'Great - marked as successful.' : 'Marked as unresolved.');
  };

  const submitLiveStatus = async (resource: Resource, status: 'open' | 'limited' | 'full' | 'closed') => {
    if (!outreachToken.trim()) {
      setOutreachMessage('Outreach login required.');
      return;
    }
    await api.updateResourceLiveStatus(resource.id, outreachToken, {
      status,
      essentials: resource.essentials,
      closesAt: resource.closesAt ?? undefined,
      verifier: 'outreach-ui',
      note: 'Quick status update from outreach mode',
    });
    await api.trackEvent('outreach_status_update', { resourceId: resource.id, status });
    setOutreachMessage(`Updated ${resource.name} to ${status}. Refreshing…`);
    const live = await api.getLiveResources();
    setResources(live.resources);
    setPopups(live.popups);
  };

  const createPopup = async () => {
    if (!outreachToken.trim()) {
      setOutreachMessage('Outreach login required.');
      return;
    }
    await api.createOutreachPopup(outreachToken, {
      title: 'Emergency Warming Center Pop-up',
      type: 'warming-center',
      city: 'New York',
      address: '420 W 42nd St',
      lat: 40.757,
      lng: -73.992,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      services: ['Warming space', 'Hot drinks', 'Charging'],
      verifier: 'outreach-ui',
    });
    await api.trackEvent('outreach_popup_create', { source: 'outreach-ui' });
    setOutreachMessage('Temporary popup added. Refreshing…');
    const live = await api.getLiveResources();
    setResources(live.resources);
    setPopups(live.popups);
  };

  const loginOutreach = async () => {
    setOutreachMessage('Signing in...');
    try {
      const data = await api.loginOutreach(outreachEmail, outreachPassword);
      setOutreachToken(data.token);
      setOutreachUserName(data.user.name);
      localStorage.setItem(OUTREACH_AUTH_KEY, data.token);
      setOutreachMessage(`Signed in as ${data.user.name} (${data.user.role}).`);
      setOutreachPassword('');
    } catch (err) {
      setOutreachMessage((err as Error).message || 'Login failed');
    }
  };

  const logoutOutreach = () => {
    setOutreachToken('');
    setOutreachUserName('');
    localStorage.removeItem(OUTREACH_AUTH_KEY);
    setOutreachMessage('Signed out.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resource Directory</h1>
        <p className="text-gray-500 mt-1 text-sm">Open-now essentials and legal pathways for immediate survival needs.</p>
      </div>

      {offline && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <WifiOff className="w-4 h-4 text-amber-700 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Offline Survival Card</p>
              <p className="text-xs mt-0.5">Using cached nearest resources and hotlines.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href="tel:988" className="tag bg-red-100 text-red-700"><Phone className="w-3 h-3" />Call 988</a>
                <a href="tel:18007997233" className="tag bg-red-100 text-red-700"><Phone className="w-3 h-3" />DV 1-800-799-7233</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
          <input type="checkbox" className="w-4 h-4 text-primary-700 rounded" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)} />
          <Filter className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
          Free only
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 bg-white border border-gray-200 px-4 rounded-xl">
          <input type="checkbox" className="w-4 h-4 text-primary-700 rounded" checked={openNow} onChange={e => setOpenNow(e.target.checked)} />
          Open now
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          type="button"
          onClick={() => setOutreachMode(v => !v)}
          className={`tag border ${outreachMode ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}
        >
          Street Outreach Mode
        </button>
        {(['food', 'shower', 'restroom', 'charging', 'laundry'] as const).map(key => (
          <button
            key={key}
            type="button"
            onClick={() => essentialsToggle(key)}
            className={`tag border ${essentials[key] ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-gray-600 border-gray-200'}`}
          >
            {key}
          </button>
        ))}
      </div>

      {outreachMode && (
        <div className="card p-4 mb-6 border-gray-200">
          <h2 className="font-semibold text-sm text-gray-900 mb-2">Verified volunteer tools</h2>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="email"
              className="input"
              placeholder="Outreach email"
              value={outreachEmail}
              onChange={e => setOutreachEmail(e.target.value)}
            />
            <input
              type="password"
              className="input"
              placeholder="Password"
              value={outreachPassword}
              onChange={e => setOutreachPassword(e.target.value)}
            />
            <button className="btn-secondary text-sm" onClick={loginOutreach}>Sign in</button>
            {outreachToken && <button className="btn-secondary text-sm" onClick={logoutOutreach}>Sign out</button>}
            <button className="btn-secondary text-sm" onClick={createPopup}>Add temporary pop-up</button>
          </div>
          {outreachUserName && <p className="text-xs text-green-700 mb-2">Authenticated as {outreachUserName}</p>}
          <p className="text-xs text-gray-500">Use quick status buttons below each resource card to mark open/full/closed in real time.</p>
          {outreachMessage && <p className="text-xs text-primary-700 mt-2">{outreachMessage}</p>}
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-6" role="tablist" aria-label="Resource categories">
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

      {popups.length > 0 && (
        <div className="card p-4 mb-6 border-teal-100 bg-teal-50/40">
          <h2 className="font-semibold text-sm text-teal-900 mb-2">Street Outreach Pop-ups</h2>
          <div className="space-y-2">
            {popups.slice(0, 3).map(p => (
              <div key={p.id} className="bg-white rounded-lg border border-teal-100 p-3 text-sm">
                <p className="font-semibold text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-500">{p.address} · {p.city}</p>
                <p className="text-xs text-teal-700 mt-1">{p.services.join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {legalFlow && (
        <div className="card p-4 mb-6 border-blue-100 bg-blue-50/40">
          <h2 className="font-semibold text-sm text-blue-900 mb-2">Document & Legal Help: {legalFlow.title}</h2>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            {legalFlow.steps.map(step => <li key={step}>{step}</li>)}
          </ol>
          <div className="flex flex-wrap gap-1 mt-3">
            {legalFlow.resources.map(r => (
              <span key={r.name} className="tag bg-blue-100 text-blue-700">{r.name}</span>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-400 mb-4" role="status" aria-live="polite">
        {loading ? 'Loading…' : `${filtered.length} resources found`}
      </p>

      {error && <div className="text-center py-12 text-red-500 text-sm">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-1">No resources found</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(resource => (
          <div key={resource.id}>
            <ResourceCard resource={resource} />
            <div className="mt-2 flex items-center gap-2 text-xs">
              <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => submitResourceCheckin(resource.id, true)}>Did get help</button>
              <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => submitResourceCheckin(resource.id, false)}>No help yet</button>
              {outreachMode && (
                <>
                  <button className="tag bg-green-100 text-green-700" onClick={() => submitLiveStatus(resource, 'open')}>Open</button>
                  <button className="tag bg-amber-100 text-amber-700" onClick={() => submitLiveStatus(resource, 'limited')}>Limited</button>
                  <button className="tag bg-red-100 text-red-700" onClick={() => submitLiveStatus(resource, 'full')}>Full</button>
                </>
              )}
              <button
                className="tag bg-gray-100 text-gray-600"
                onClick={async () => {
                  await navigator.clipboard.writeText(resource.address);
                  await api.trackEvent('resource_address_copy', { resourceId: resource.id });
                }}
              >
                <Copy className="w-3 h-3" /> Copy address
              </button>
            </div>
          </div>
        ))}
      </div>

      {checkinMessage && <p className="text-xs text-green-700 mt-4">{checkinMessage}</p>}
    </div>
  );
}
