import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ImpactMetrics, OutreachPopup, Resource } from '../types';
import { BarChart3, Activity, HeartHandshake, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [popups, setPopups] = useState<OutreachPopup[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getImpactMetrics(), api.getLiveResources()])
      .then(([m, live]) => {
        setMetrics(m);
        setResources(live.resources);
        setPopups(live.popups);
      })
      .catch(err => setError((err as Error).message));
  }, []);

  const openCount = resources.filter(r => r.liveStatus === 'open' || r.liveStatus === 'limited').length;
  const fullCount = resources.filter(r => r.liveStatus === 'full').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary-700" /> Partner Impact Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Live reporting for referrals, outreach operations, and service capacity.</p>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Successful referrals</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{metrics?.successfulReferrals ?? 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Success rate</p>
          <p className="text-2xl font-bold text-primary-700 mt-1">{metrics?.successRate ?? 0}%</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Resources open now</p>
          <p className="text-2xl font-bold text-teal-700 mt-1">{openCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Resources full</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{fullCount}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Activity className="w-4 h-4" /> Event Activity</h2>
          <div className="space-y-2">
            {(metrics?.events ?? []).slice(0, 8).map(event => (
              <div key={event.eventType} className="flex justify-between text-sm border-b border-gray-50 pb-1">
                <span className="text-gray-600">{event.eventType}</span>
                <span className="font-semibold text-gray-900">{event.count}</span>
              </div>
            ))}
            {(metrics?.events ?? []).length === 0 && <p className="text-sm text-gray-400">No event data yet.</p>}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><HeartHandshake className="w-4 h-4" /> Follow-through by Channel</h2>
          <div className="space-y-2">
            {(metrics?.byChannel ?? []).map(row => (
              <div key={row.channel} className="flex justify-between text-sm border-b border-gray-50 pb-1">
                <span className="text-gray-600 capitalize">{row.channel}</span>
                <span className="font-semibold text-gray-900">{row.count}</span>
              </div>
            ))}
            {(metrics?.byChannel ?? []).length === 0 && <p className="text-sm text-gray-400">No check-in channel data yet.</p>}
          </div>
        </section>
      </div>

      <section className="card p-5 mt-6">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4" /> Active Outreach Pop-ups</h2>
        <div className="space-y-2">
          {popups.map(p => (
            <div key={p.id} className="border border-gray-100 rounded-lg p-3">
              <p className="font-semibold text-sm text-gray-900">{p.title}</p>
              <p className="text-xs text-gray-500">{p.city} · {p.address}</p>
              <p className="text-xs text-teal-700 mt-1">{p.services.join(' · ')}</p>
            </div>
          ))}
          {popups.length === 0 && <p className="text-sm text-gray-400">No active outreach pop-ups.</p>}
        </div>
      </section>
    </div>
  );
}
