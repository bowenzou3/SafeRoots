import React from 'react';
import type { Resource, ResourceCategory } from '../../types';
import { Phone, Globe, Clock, MapPin, Tag } from 'lucide-react';

const CATEGORY_CONFIG: Record<ResourceCategory, { label: string; className: string }> = {
  'food':              { label: 'Food',              className: 'bg-orange-100 text-orange-700' },
  'healthcare':        { label: 'Healthcare',        className: 'bg-red-100 text-red-700' },
  'mental-health':     { label: 'Mental Health',     className: 'bg-violet-100 text-violet-700' },
  'legal-aid':         { label: 'Legal Aid',         className: 'bg-blue-100 text-blue-700' },
  'clothing':          { label: 'Clothing',          className: 'bg-pink-100 text-pink-700' },
  'education':         { label: 'Education',         className: 'bg-green-100 text-green-700' },
  'employment':        { label: 'Employment',        className: 'bg-teal-100 text-teal-700' },
  'childcare':         { label: 'Childcare',         className: 'bg-lime-100 text-lime-700' },
  'domestic-violence': { label: 'DV Services',       className: 'bg-rose-100 text-rose-700' },
};

interface Props {
  resource: Resource;
}

export function ResourceCard({ resource }: Props) {
  const cat = CATEGORY_CONFIG[resource.category];

  return (
    <article className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 leading-snug">{resource.name}</h3>
        <span className={`tag flex-shrink-0 ${cat.className}`}>{cat.label}</span>
      </div>

      <p className="text-sm text-gray-500 line-clamp-2">{resource.description}</p>

      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" aria-hidden="true" />
          <span>{resource.city}, {resource.state}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" aria-hidden="true" />
          <span>{resource.hours}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" aria-hidden="true" />
          <a href={`tel:${resource.phone}`} className="text-primary-700 hover:underline font-medium">
            {resource.phone}
          </a>
        </div>
        {resource.website && (
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <a
              href={resource.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-700 hover:underline truncate"
            >
              {resource.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>

      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-50">
          <Tag className="w-3 h-3 text-gray-300 mt-0.5 flex-shrink-0" aria-hidden="true" />
          {resource.tags.map(tag => (
            <span key={tag} className="tag bg-gray-100 text-gray-500">{tag}</span>
          ))}
        </div>
      )}

      {resource.isFree && (
        <div className="mt-auto pt-2">
          <span className="tag bg-green-100 text-green-700">✓ Free of charge</span>
        </div>
      )}
    </article>
  );
}
