import React from 'react';
import { Star } from 'lucide-react';

interface Props {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, reviewCount, size = 'sm' }: Props) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map(star => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200 fill-gray-200'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-sm text-gray-600 font-medium">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-400">({reviewCount})</span>
      )}
    </div>
  );
}
