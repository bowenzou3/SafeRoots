import type {
  Shelter,
  Resource,
  CrisisAlert,
  Volunteer,
  OutreachPopup,
  LegalHelpFlow,
  ImpactMetrics,
  TransitEta,
  OutreachAuthUser,
} from '../types';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getShelters: (params?: Record<string, string>): Promise<Shelter[]> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Shelter[]>(`/shelters${qs}`);
  },

  getResources: (params?: Record<string, string>): Promise<Resource[]> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Resource[]>(`/resources${qs}`);
  },

  getLiveResources: (): Promise<{ resources: Resource[]; popups: OutreachPopup[] }> =>
    request<{ resources: Resource[]; popups: OutreachPopup[] }>('/resources/live'),

  getRecommendedShelters: (params: { lat: number; lng: number; tags?: string[] }): Promise<Shelter[]> => {
    const query = new URLSearchParams({
      lat: String(params.lat),
      lng: String(params.lng),
      ...(params.tags && params.tags.length ? { tags: params.tags.join(',') } : {}),
    });
    return request<Shelter[]>(`/shelters/recommendations?${query.toString()}`);
  },

  getAlerts: (): Promise<CrisisAlert[]> => request<CrisisAlert[]>('/alerts'),

  registerVolunteer: (data: Volunteer): Promise<{ id: string }> =>
    request<{ id: string }>('/volunteers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  rateShelter: (id: string, rating: number): Promise<void> =>
    request<void>(`/shelters/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    }),

  submitShelterFeedback: (
    id: string,
    data: {
      feltSafe: boolean;
      womenSafetyScore: number;
      lgbtqSafetyScore: number;
      antiRacismScore: number;
      comment?: string;
    }
  ): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>(`/shelters/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitShelterCheckin: (id: string, helped: boolean, notes?: string): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>(`/shelters/${id}/checkin`, {
      method: 'POST',
      body: JSON.stringify({ helped, notes }),
    }),

  submitResourceCheckin: (id: string, helped: boolean, notes?: string): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>(`/resources/${id}/checkin`, {
      method: 'POST',
      body: JSON.stringify({ helped, notes }),
    }),

  getLegalFlow: (issue: string, city = 'National'): Promise<LegalHelpFlow> =>
    request<LegalHelpFlow>(`/legal/flow?issue=${encodeURIComponent(issue)}&city=${encodeURIComponent(city)}`),

  updateResourceLiveStatus: (
    id: string,
    token: string,
    data: {
      status: 'open' | 'limited' | 'full' | 'closed';
      essentials: { food: boolean; shower: boolean; restroom: boolean; charging: boolean; laundry: boolean };
      closesAt?: string;
      note?: string;
      verifier?: string;
    }
  ): Promise<{ ok: boolean; updatedAt: string }> =>
    request<{ ok: boolean; updatedAt: string }>(`/resources/${id}/live-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  createOutreachPopup: (
    token: string,
    data: {
      title: string;
      type: string;
      city: string;
      address: string;
      lat: number;
      lng: number;
      startsAt: string;
      endsAt: string;
      services: string[];
      verifier?: string;
    }
  ): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>('/resources/popups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  loginOutreach: (email: string, password: string): Promise<{ token: string; user: OutreachAuthUser }> =>
    request<{ token: string; user: OutreachAuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registerOutreach: (
    email: string,
    password: string,
    name: string,
    invite: string,
    role: 'outreach' | 'admin' = 'outreach'
  ): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>('/auth/register-outreach', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, invite, role }),
    }),

  me: (token: string): Promise<{ user: OutreachAuthUser }> =>
    request<{ user: OutreachAuthUser }>('/auth/me', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }),

  getTransitEta: (params: {
    fromLat: number;
    fromLng: number;
    toLat: number;
    toLng: number;
    safeRoute?: boolean;
  }): Promise<TransitEta> => {
    const qs = new URLSearchParams({
      fromLat: String(params.fromLat),
      fromLng: String(params.fromLng),
      toLat: String(params.toLat),
      toLng: String(params.toLng),
      safeRoute: String(Boolean(params.safeRoute)),
    });
    return request<TransitEta>(`/transit/eta?${qs.toString()}`);
  },

  trackEvent: (eventType: string, metadata?: Record<string, unknown>): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>('/metrics/events', {
      method: 'POST',
      body: JSON.stringify({ eventType, metadata: metadata ?? {} }),
    }),

  getImpactMetrics: (): Promise<ImpactMetrics> => request<ImpactMetrics>('/metrics/impact'),
};
