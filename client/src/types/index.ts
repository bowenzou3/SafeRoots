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
