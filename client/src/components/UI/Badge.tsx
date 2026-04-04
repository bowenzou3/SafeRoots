import React from 'react';
import type { ShelterTag } from '../../types';

const TAG_CONFIG: Record<ShelterTag, { label: string; className: string }> = {
  'women-only':        { label: 'Women Only',        className: 'bg-pink-100 text-pink-700' },
  'lgbtq-friendly':   { label: 'LGBTQ+ Friendly',   className: 'bg-violet-100 text-violet-700' },
  'bipoc-focused':    { label: 'BIPOC Focused',      className: 'bg-amber-100 text-amber-700' },
  'accessible':       { label: 'Accessible',         className: 'bg-blue-100 text-blue-700' },
  'childcare':        { label: 'Childcare',          className: 'bg-green-100 text-green-700' },
  'pets-allowed':     { label: 'Pets Allowed',       className: 'bg-lime-100 text-lime-700' },
  'sober-only':       { label: 'Sober Only',         className: 'bg-cyan-100 text-cyan-700' },
  'domestic-violence':{ label: 'DV Services',        className: 'bg-red-100 text-red-700' },
};

interface Props {
  tag: ShelterTag;
  small?: boolean;
}

export function ShelterTagBadge({ tag, small = false }: Props) {
  const { label, className } = TAG_CONFIG[tag];
  return (
    <span className={`tag ${className} ${small ? 'text-[10px] px-1.5' : ''}`}>
      {label}
    </span>
  );
}

interface ResourceTagProps {
  label: string;
}

export function ResourceTagBadge({ label }: ResourceTagProps) {
  return (
    <span className="tag bg-gray-100 text-gray-600">{label}</span>
  );
}
