import type { Shelter, Resource, CrisisAlert, Volunteer } from '../types';

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
};
