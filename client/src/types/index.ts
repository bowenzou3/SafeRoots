// ─── Shelter ──────────────────────────────────────────────────────────────────

export type ShelterTag =
  | 'women-only'
  | 'lgbtq-friendly'
  | 'bipoc-focused'
  | 'accessible'
  | 'childcare'
  | 'pets-allowed'
  | 'sober-only'
  | 'domestic-violence';

export interface Shelter {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  phone: string;
  website?: string;
  tags: ShelterTag[];
  capacity: number;
  currentOccupancy: number;
  rating: number;
  reviewCount: number;
  services: string[];
  hours: string;
  description: string;
  bedsAvailable: number;
  availabilityUpdatedAt: string;
  safetyScores: {
    women: number;
    lgbtq: number;
    antiRacism: number;
  };
  recommendationScore?: number;
  recommendationReasons?: string[];
}

export interface ShelterFilters {
  tags: ShelterTag[];
  minRating: number;
  hasAvailability: boolean;
  city: string;
}

// ─── Resource ─────────────────────────────────────────────────────────────────

export type ResourceCategory =
  | 'food'
  | 'healthcare'
  | 'mental-health'
  | 'legal-aid'
  | 'clothing'
  | 'education'
  | 'employment'
  | 'childcare'
  | 'domestic-violence';

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  description: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  website?: string;
  hours: string;
  tags: string[];
  lat: number;
  lng: number;
  isFree: boolean;
  liveStatus: 'open' | 'limited' | 'full' | 'closed';
  statusUpdatedAt: string;
  closesAt: string | null;
  essentials: {
    food: boolean;
    shower: boolean;
    restroom: boolean;
    charging: boolean;
    laundry: boolean;
  };
  closingSoon: boolean;
}

export interface OutreachPopup {
  id: string;
  title: string;
  type: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  startsAt: string;
  endsAt: string;
  services: string[];
  verifiedBy: string;
}

export interface LegalHelpFlow {
  issue: string;
  city: string;
  title: string;
  steps: string[];
  resources: Array<{ name: string; type: string }>;
}

export interface ImpactMetrics {
  successfulReferrals: number;
  totalCheckins: number;
  successRate: number;
  byChannel: Array<{ channel: string; count: number }>;
  events: Array<{ eventType: string; count: number }>;
}

export interface TransitEta {
  provider: string;
  walkMinutes: number;
  transitMinutes: number;
  distanceKm: number;
}

export interface OutreachAuthUser {
  id: string;
  email: string;
  role: 'outreach' | 'admin';
  name: string;
}

// ─── Crisis Alerts ────────────────────────────────────────────────────────────

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'weather' | 'emergency' | 'resource' | 'safety';

export interface CrisisAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  city?: string;
  expiresAt: string;
  severity: AlertSeverity;
  createdAt: string;
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type ChatRoom =
  | 'general'
  | 'housing'
  | 'lgbtq'
  | 'mental-health'
  | 'legal'
  | 'domestic-violence'
  | 'women';

export interface ChatMessage {
  id: string;
  room: ChatRoom;
  message: string;
  timestamp: string;
  username: string;
}

// ─── Volunteer ────────────────────────────────────────────────────────────────

export interface Volunteer {
  id?: string;
  name: string;
  skills: string[];
  availability: string;
  city: string;
  email: string;
  phone?: string;
  organization?: string;
}
