import React, { useEffect, useState } from 'react';
import { AlertCard } from '../components/Crisis/AlertCard';
import { api } from '../api/client';
import type { CrisisAlert } from '../types';
import { Phone, RefreshCw, AlertTriangle } from 'lucide-react';

const HOTLINES = [
  { name: 'National DV Hotline',          number: '1-800-799-7233', href: 'tel:18007997233', color: 'bg-red-50 border-red-200 text-red-800' },
  { name: 'Suicide & Crisis Lifeline',    number: '988',             href: 'tel:988',          color: 'bg-orange-50 border-orange-200 text-orange-800' },
  { name: 'Trans Lifeline',               number: '1-866-488-7386', href: 'tel:18664887386', color: 'bg-violet-50 border-violet-200 text-violet-800' },
  { name: 'RAINN Sexual Assault',         number: '1-800-656-4673', href: 'tel:18006564673', color: 'bg-pink-50 border-pink-200 text-pink-800' },
  { name: 'Crisis Text Line',             number: 'Text HOME to 741741', href: 'sms:741741&body=HOME', color: 'bg-teal-50 border-teal-200 text-teal-800' },
  { name: 'Youth Homeless (THP)',          number: '1-888-811-0123', href: 'tel:18888110123', color: 'bg-blue-50 border-blue-200 text-blue-800' },
];

export default function CrisisAlerts() {
  const [alerts,       setAlerts]       = useState<CrisisAlert[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [lastRefresh,  setLastRefresh]  = useState<Date>(new Date());

  const load = () => {
    setLoading(true);
    api.getAlerts()
      .then(data => { setAlerts(data); setLastRefresh(new Date()); })
      .catch(err  => setError((err as Error).message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // Refresh every 5 minutes
    const timer = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAlerts  = alerts.filter(a => new Date(a.expiresAt) >= new Date());
  const expiredAlerts = alerts.filter(a => new Date(a.expiresAt) <  new Date());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-gray-900">Crisis Alerts</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Real-time safety alerts, mobile aid announcements, and emergency notifications.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
          aria-label="Refresh alerts"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Emergency hotlines */}
      <section aria-labelledby="hotlines-heading" className="mb-8">
        <h2 id="hotlines-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          24/7 Emergency Hotlines
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {HOTLINES.map(h => (
            <a
              key={h.name}
              href={h.href}
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-opacity hover:opacity-80 ${h.color}`}
              aria-label={`${h.name}: ${h.number}`}
            >
              <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <div>
                <div className="font-semibold text-sm">{h.name}</div>
                <div className="text-xs opacity-80">{h.number}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Active alerts */}
      <section aria-labelledby="active-alerts-heading" className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 id="active-alerts-heading" className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Active Alerts
            {activeAlerts.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-700 text-xs rounded-full px-2 py-0.5">
                {activeAlerts.length}
              </span>
            )}
          </h2>
          <span className="text-xs text-gray-300">
            Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {error && (
          <div className="text-center py-8 text-red-500 text-sm">{error}</div>
        )}

        {!loading && activeAlerts.length === 0 && !error && (
          <div className="text-center py-10 bg-green-50 border border-green-100 rounded-2xl">
            <p className="text-green-700 font-medium">✓ No active alerts in your area</p>
            <p className="text-green-600 text-sm mt-1">Stay safe — check back regularly.</p>
          </div>
        )}

        <div className="space-y-3" role="list" aria-label="Active crisis alerts">
          {activeAlerts.map(alert => (
            <div key={alert.id} role="listitem">
              <AlertCard alert={alert} />
            </div>
          ))}
        </div>
      </section>

      {/* Expired alerts */}
      {expiredAlerts.length > 0 && (
        <section aria-labelledby="expired-heading">
          <h2 id="expired-heading" className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Recent (Expired)
          </h2>
          <div className="space-y-3">
            {expiredAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
