import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOffline } from '../../hooks/useOffline';

export function OfflineBanner() {
  const isOffline = useOffline();
  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="bg-amber-500 text-white text-sm font-medium py-2 px-4 text-center flex items-center justify-center gap-2"
    >
      <WifiOff className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      You're offline. Showing cached data – key contacts and resources are still available.
    </div>
  );
}
