import React from 'react';
import type { CrisisAlert } from '../../types';
import { AlertTriangle, CloudLightning, Info, ShieldAlert, Clock } from 'lucide-react';

const SEVERITY_CONFIG = {
  low:      { className: 'bg-blue-50 border-blue-200 text-blue-800',    icon: Info,           iconColor: 'text-blue-500'  },
  medium:   { className: 'bg-amber-50 border-amber-200 text-amber-800', icon: AlertTriangle,  iconColor: 'text-amber-500' },
  high:     { className: 'bg-orange-50 border-orange-200 text-orange-800', icon: AlertTriangle, iconColor: 'text-orange-500' },
  critical: { className: 'bg-red-50 border-red-300 text-red-800',       icon: ShieldAlert,    iconColor: 'text-red-600'   },
};

const TYPE_ICONS = {
  weather:   CloudLightning,
  emergency: ShieldAlert,
  resource:  Info,
  safety:    AlertTriangle,
};

interface Props {
  alert: CrisisAlert;
}

export function AlertCard({ alert }: Props) {
  const { className, icon: SeverityIcon, iconColor } = SEVERITY_CONFIG[alert.severity];
  const TypeIcon = TYPE_ICONS[alert.type];

  const isExpired = new Date(alert.expiresAt) < new Date();

  return (
    <article
      className={`border rounded-xl p-4 ${className} ${isExpired ? 'opacity-50' : ''}`}
      aria-label={`${alert.severity} alert: ${alert.title}`}
    >
      <div className="flex items-start gap-3">
        <SeverityIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-sm">{alert.title}</h3>
            <span className="flex items-center gap-1 text-xs opacity-70">
              <TypeIcon className="w-3 h-3" aria-hidden="true" />
              {alert.type}
            </span>
            {isExpired && <span className="text-xs opacity-60">(expired)</span>}
          </div>
          <p className="text-sm opacity-80 leading-relaxed">{alert.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs opacity-60">
            {alert.city && <span>📍 {alert.city}</span>}
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              Expires {new Date(alert.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <span className={`flex-shrink-0 text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${{
          low:      'bg-blue-100',
          medium:   'bg-amber-100',
          high:     'bg-orange-100',
          critical: 'bg-red-100 text-red-700',
        }[alert.severity]}`}>
          {alert.severity}
        </span>
      </div>
    </article>
  );
}
