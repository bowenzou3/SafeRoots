import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Shelter } from '../../types';
import { ShelterTagBadge } from '../UI/Badge';
import { StarRating } from '../UI/StarRating';
import { Phone, Globe, Clock, ShieldCheck } from 'lucide-react';

// Fix Leaflet's default icon paths when using Vite/webpack bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/** Custom coloured marker icon */
function makeIcon(color: string) {
  return L.divIcon({
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,.25);
      transform:rotate(-45deg);
    "></div>`,
    className: '',
    iconSize:   [28, 28],
    iconAnchor: [14, 28],
    popupAnchor:[0, -30],
  });
}

const ICONS: Record<string, ReturnType<typeof makeIcon>> = {
  'women-only':      makeIcon('#ec4899'),
  'lgbtq-friendly':  makeIcon('#7c3aed'),
  'bipoc-focused':   makeIcon('#f59e0b'),
  default:           makeIcon('#6d28d9'),
};

function iconForShelter(shelter: Shelter) {
  for (const tag of shelter.tags) {
    if (tag in ICONS) return ICONS[tag];
  }
  return ICONS.default;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 13, { duration: 1.2 }); }, [lat, lng, map]);
  return null;
}

function relativeMinutes(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  return `${mins}m ago`;
}

interface Props {
  shelters: Shelter[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLat?: number | null;
  userLng?: number | null;
}

export function ShelterMap({ shelters, selectedId, onSelect, userLat, userLng }: Props) {
  const center: [number, number] = userLat && userLng
    ? [userLat, userLng]
    : [39.5, -98.35]; // geographic center of USA

  const selectedShelter = shelters.find(s => s.id === selectedId);

  return (
    <MapContainer
      center={center}
      zoom={userLat ? 11 : 4}
      className="w-full h-full rounded-2xl"
      aria-label="Shelter map"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {selectedShelter && (
        <FlyTo lat={selectedShelter.lat} lng={selectedShelter.lng} />
      )}

      {userLat && userLng && (
        <Marker
          position={[userLat, userLng]}
          icon={L.divIcon({
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 0 3px rgba(37,99,235,0.3)"></div>`,
            className: '',
            iconSize:   [16, 16],
            iconAnchor: [8, 8],
          })}
        >
          <Popup>
            <p className="font-semibold text-sm">Your location</p>
          </Popup>
        </Marker>
      )}

      {shelters.map(shelter => (
        <Marker
          key={shelter.id}
          position={[shelter.lat, shelter.lng]}
          icon={iconForShelter(shelter)}
          eventHandlers={{ click: () => onSelect(shelter.id) }}
        >
          <Popup maxWidth={300}>
            <div className="p-1 min-w-[220px]">
              <h3 className="font-bold text-gray-900 text-sm mb-1">{shelter.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{shelter.address}, {shelter.city}, {shelter.state}</p>

              <div className="flex flex-wrap gap-1 mb-2">
                {shelter.tags.slice(0, 3).map(tag => (
                  <ShelterTagBadge key={tag} tag={tag} small />
                ))}
              </div>

              <StarRating rating={shelter.rating} reviewCount={shelter.reviewCount} />

              <div className="mt-2 space-y-1 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <a href={`tel:${shelter.phone}`} className="text-primary-700 hover:underline">{shelter.phone}</a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>{shelter.hours}</span>
                </div>
                {shelter.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 flex-shrink-0" />
                    <a href={shelter.website} target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline truncate">
                      Website
                    </a>
                  </div>
                )}
              </div>

              {/* Occupancy bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Availability</span>
                  <span>{shelter.bedsAvailable} beds free</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all"
                    style={{ width: `${(shelter.currentOccupancy / shelter.capacity) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Updated {relativeMinutes(shelter.availabilityUpdatedAt)}
                </p>
              </div>

              <div className="mt-3 border-t border-gray-100 pt-2">
                <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Safety & Inclusivity
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <span className="tag bg-pink-100 text-pink-700 justify-center">Women {shelter.safetyScores.women.toFixed(1)}</span>
                  <span className="tag bg-violet-100 text-violet-700 justify-center">LGBTQ+ {shelter.safetyScores.lgbtq.toFixed(1)}</span>
                  <span className="tag bg-amber-100 text-amber-700 justify-center">Anti-racism {shelter.safetyScores.antiRacism.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
